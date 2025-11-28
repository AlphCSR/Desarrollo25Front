
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { getEvents, getUserByEmail } from "../services/api";
import { type Event } from "../types/Event";
import { EventCard } from "../components/EventCard";

export const HomePage = () => {
    const auth = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const navigate = useNavigate();

    const token = auth.user?.access_token || "";
    const userEmail = auth.user?.profile.email || "";

    useEffect(() => {
        // Solo intentamos cargar si el usuario está autenticado
        if (auth.isAuthenticated && token) {
            fetchEvents();
        }
        if (userEmail && token) {
            loadUser();
        }
    }, [auth.isAuthenticated, token, userEmail]);

    const loadUser = async () => {
        try {
            const user = await getUserByEmail(userEmail, token);
            setCurrentUser(user);
        } catch (error) {
            console.error("Error loading user", error);
        }
    };

    const fetchEvents = async () => {
        try {
            const data = await getEvents(token);
            setEvents(data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar eventos. ¿Está el backend encendido?");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = (eventId: string) => {
        navigate(`/event/${eventId}`);
    };

    if (auth.isLoading) {
        return <div className="text-center py-10">Cargando autenticación...</div>;
    }

    if (!auth.isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Bienvenido a TicketApp 🎟️</h1>
                <p className="text-gray-600 mb-8">Por favor, inicia sesión para ver los eventos disponibles.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 shadow-lg transition-all"
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-700 shadow-lg transition-all"
                    >
                        Registrarse
                    </button>
                </div>
            </div>
        );
    }

    const isOrganizerOrAdmin = currentUser?.role === 1 || currentUser?.role === 2;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Próximos Eventos</h1>
                <div className="flex gap-4 items-center">
                    {isOrganizerOrAdmin && (
                        <button
                            onClick={() => navigate('/create-event')}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                        >
                            + Crear Evento
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/profile')}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Mi Perfil
                    </button>
                    <button onClick={() => void auth.signoutRedirect()} className="text-red-600 text-sm hover:underline">
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {loading && <div className="text-center py-10">Cargando eventos...</div>}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {!loading && !error && events.length === 0 && (
                <div className="text-center text-gray-500 py-10">No hay eventos disponibles aún.</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <EventCard key={event.id} event={event} onBook={handleBook} />
                ))}
            </div>
        </div>
    );
};