
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

    const token = auth.user?.access_token || "";

    useEffect(() => {
        // Solo intentamos cargar si el usuario está autenticado
        // Si no está autenticado, mostramos la vista pública (que por ahora es vacía o un mensaje)
        // O podríamos mostrar eventos públicos si el backend lo permite sin token.
        // Asumimos que getEvents requiere token por ahora.
        if (auth.isAuthenticated && token) {
            fetchEvents();
        } else {
            setLoading(false);
        }
    }, [auth.isAuthenticated, token]);

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
        if (!auth.isAuthenticated) {
            navigate("/login");
            return;
        }
        navigate(`/event/${eventId}`);
    };

    if (auth.isLoading) {
        return <div className="text-center py-10">Cargando...</div>;
    }

    // Vista para usuarios no autenticados (Landing Page simplificada)
    if (!auth.isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">Bienvenido a TicketApp 🎟️</h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                    Descubre los mejores eventos, conciertos y espectáculos en tu ciudad.
                    Regístrate para reservar tus entradas.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-lg transition-all"
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 shadow-lg transition-all"
                    >
                        Registrarse
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Próximos Eventos</h1>

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