import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { getEvents } from "../services/api";
import { type Event } from "../types/Event";
import { EventCard } from "../components/EventCard";

export const HomePage = () => {
    const auth = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Solo intentamos cargar si el usuario está autenticado
        if (auth.isAuthenticated && auth.user?.access_token) {
            fetchEvents();
        }
    }, [auth.isAuthenticated, auth.user?.access_token]);

    const fetchEvents = async () => {
        try {
            const data = await getEvents(auth.user?.access_token || "");
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
                <button
                    onClick={() => void auth.signinRedirect()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 shadow-lg transition-all"
                >
                    Iniciar Sesión
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Próximos Eventos</h1>
                <button onClick={() => void auth.removeUser()} className="text-red-600 text-sm hover:underline">
                    Cerrar Sesión
                </button>
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