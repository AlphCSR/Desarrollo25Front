import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { getEventById, getEventSeats, lockSeat, getEventSections } from "../services/api";
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

    const token = auth.user?.access_token || "";
    const userId = auth.user?.profile.sub || "";

    useEffect(() => {
        if (id && token) {
            loadData();
        }
    }, [id, token]);

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

    const handleSeatClick = async (seat: any) => {
        if (!userId) return;

        // Verificar si ya está seleccionado
        const isSelected = selectedSeats.some(s => s.id === seat.id);

        if (isSelected) {
            // Deseleccionar (remover del array)
            setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
        } else {
            // Seleccionar
            // Calcular precio: Usar precio del asiento si existe, sino buscar en sección
            let price = seat.price;
            if (price === undefined || price === null) {
                const section = sections.find(s => s.id === seat.sectionId);
                price = section ? section.price : 0;
            }
            const seatWithPrice = { ...seat, price };

            // Optimistic UI update
            setSelectedSeats(prev => [...prev, seatWithPrice]);

            try {
                // Llamar a SeatingMS para bloquear
                await lockSeat(seat.id, userId, token);
                // Recargar asientos para ver el estado real 'Locked'
                const updatedSeats = await getEventSeats(id!, token);
                setSeats(updatedSeats);
            } catch (error) {
                alert("Error: El asiento ya fue tomado por otro usuario.");
                // Revertir selección si falla
                setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
                loadData();
            }
        }
    };

    // Calcular total
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

    const handleProceedToPay = () => {
        if (selectedSeats.length === 0) return;
        // Navegar al checkout con datos (Fase 4)
        navigate("/checkout", { state: { event, seats: selectedSeats, total: totalPrice } });
    };

    if (loading) return <div className="text-center p-10">Cargando detalles...</div>;
    if (!event) return <div className="text-center p-10">Evento no encontrado</div>;

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
            {/* Info Lateral */}
            <div className="lg:w-1/3">
                <img src={event.imageUrl || "https://via.placeholder.com/600x400"} className="rounded-lg shadow-md mb-6 w-full" />
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="font-bold">📍 {event.venueName}</p>
                    <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                </div>

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
                            onClick={handleProceedToPay}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                        >
                            Pagar Ahora
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
                />
            </div>
        </div>
    );
};