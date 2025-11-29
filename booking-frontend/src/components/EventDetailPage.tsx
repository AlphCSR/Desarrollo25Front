
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { getEventById, getEventSeats, lockSeat, unlockSeat, getEventSections, getUserByEmail, deleteEvent, createBooking } from "../services/api";
import { SeatGrid } from "../components/SeatGrid";

export const EventDetailPage = () => {
    const { id } = useParams();
    const auth = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState<any>(null);
    const [seats, setSeats] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<any[]>([]); // Array de asientos seleccionados
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const token = auth.user?.access_token || "";
    const userId = auth.user?.profile.sub || "";
    const userEmail = auth.user?.profile.email || "";

    useEffect(() => {
        if (id && token) {
            loadData();
        }
        if (userEmail && token) {
            loadUser();
        }
    }, [id, token, userEmail]);

    const loadUser = async () => {
        try {
            const user = await getUserByEmail(userEmail, token);
            setCurrentUser(user);
        } catch (error) {
            console.error("Error loading user", error);
        }
    };

    const loadData = async () => {
        try {
            const [eventData, seatsData, sectionsData] = await Promise.all([
                getEventById(id!, token),
                getEventSeats(id!, token),
                getEventSections(id!, token)
            ]);
            setEvent(eventData);
            setSeats(seatsData);
            setSections(sectionsData);
        } catch (error) {
            console.error("Error cargando datos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async () => {
        if (!window.confirm("¿Estás seguro de que quieres cancelar este evento?")) return;
        try {
            await deleteEvent(id!, token);
            navigate("/");
        } catch (error) {
            console.error("Error deleting event", error);
            alert("Error al cancelar el evento.");
        }
    };

    const handleSeatClick = async (seat: any) => {
        if (!userId) return;

        // Verificar si ya está seleccionado en mi carrito local
        const isSelected = selectedSeats.some(s => s.id === seat.id);

        // Verificar si está bloqueado por mí en el backend (estado 'Locked' y userId coincide)
        const isLockedByMe = seat.status === 'Locked' && seat.userId === userId;

        if (isSelected) {
            // Caso 1: Deseleccionar del carrito local
            if (isLockedByMe) {
                try {
                    await unlockSeat(seat.id, userId, token);
                    const updatedSeats = await getEventSeats(id!, token);
                    setSeats(updatedSeats);
                } catch (error) {
                    console.error("Error unlocking seat", error);
                }
            }
            setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
        } else if (isLockedByMe) {
            // Caso 2: Está bloqueado por mí pero no estaba en mi selección local
            try {
                await unlockSeat(seat.id, userId, token);
                const updatedSeats = await getEventSeats(id!, token);
                setSeats(updatedSeats);
            } catch (error) {
                console.error("Error unlocking seat", error);
                alert("Error al desbloquear el asiento.");
            }
        } else {
            // Caso 3: Seleccionar (Bloquear)
            let price = seat.price;
            if (price === undefined || price === null) {
                const section = sections.find(s => s.id === seat.sectionId);
                price = section ? section.price : 0;
            }
            const seatWithPrice = { ...seat, price };

            // Optimistic UI update
            setSelectedSeats(prev => [...prev, seatWithPrice]);

            try {
                await lockSeat(seat.id, userId, token);
                const updatedSeats = await getEventSeats(id!, token);
                setSeats(updatedSeats);
            } catch (error) {
                alert("Error: El asiento ya fue tomado por otro usuario.");
                setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
                loadData();
            }
        }
    };

    // Calcular total
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

    const handleReserve = async () => {
        if (selectedSeats.length === 0) return;

        try {
            const bookingData = {
                userId: userId,
                eventId: id,
                seatIds: selectedSeats.map(s => s.id),
                totalAmount: totalPrice
            };

            await createBooking(bookingData, token);
            alert("Reserva creada con éxito. Ve a tu perfil para pagar.");
            navigate("/profile");
        } catch (error) {
            console.error("Error creating booking", error);
            alert("Error al crear la reserva.");
        }
    };

    if (loading) return <div className="text-center p-10">Cargando detalles...</div>;
    if (!event) return <div className="text-center p-10">Evento no encontrado</div>;

    const isOrganizerOrAdmin = currentUser?.role === 1 || currentUser?.role === 2;

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
            {/* Info Lateral */}
            <div className="lg:w-1/3">
                <img src={event.imageUrl || "https://via.placeholder.com/600x400"} className="rounded-lg shadow-md mb-6 w-full" />
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <p className="font-bold">📍 {event.venueName}</p>
                    <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                    {event.category && (
                        <p className="mt-2"><span className="bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">{event.category}</span></p>
                    )}
                </div>

                {isOrganizerOrAdmin && (
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => navigate(`/edit-event/${id}`)}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                        >
                            Editar
                        </button>
                        <button
                            onClick={handleDeleteEvent}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                        >
                            Cancelar
                        </button>
                    </div>
                )}

                {selectedSeats.length > 0 && (
                    <div className="mt-6 p-4 bg-white shadow-lg rounded-lg border-2 border-blue-500">
                        <h3 className="font-bold text-lg mb-2">Tu Selección ({selectedSeats.length})</h3>
                        <ul className="mb-4 space-y-2 max-h-40 overflow-y-auto">
                            {selectedSeats.map(seat => (
                                <li key={seat.id} className="flex justify-between text-sm border-b pb-1">
                                    <span>Fila {seat.row}, Asiento {seat.number}</span>
                                    <span className="font-bold">${seat.price}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-between items-center border-t pt-2 mb-4">
                            <span className="text-lg font-bold">Total:</span>
                            <span className="text-2xl font-bold text-green-600">${totalPrice}</span>
                        </div>

                        <button
                            onClick={handleReserve}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            Reservar
                        </button>
                    </div>
                )}
            </div>

            {/* Mapa de Asientos */}
            <div className="lg:w-2/3">
                <h2 className="text-xl font-bold mb-4">Selecciona tu ubicación</h2>
                <SeatGrid
                    seats={seats}
                    onSeatClick={handleSeatClick}
                    selectedSeatIds={selectedSeats.map(s => s.id)}
                    currentUserId={userId}
                />
            </div>
        </div>
    );
};