
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
    const [userPreferences, setUserPreferences] = useState<string[]>([]);
    const navigate = useNavigate();

    const token = auth.user?.access_token || "";

    useEffect(() => {
        if (auth.isAuthenticated && token) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [auth.isAuthenticated, token]);

    const fetchData = async () => {
        try {
            // Fetch Events
            const eventsData = await getEvents(token);
            setEvents(eventsData);

            // Fetch User Preferences
            if (auth.user?.profile.email) {
                const userData = await getUserByEmail(auth.user.profile.email, token);
                setUserPreferences(userData.preferences || []);
            }

        } catch (err) {
            console.error(err);
            setError("Error al cargar datos.");
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

    // Filter Recommended Events
    const recommendedEvents = userPreferences.length > 0
        ? events.filter(e => userPreferences.includes(e.category))
        : [];

    const otherEvents = userPreferences.length > 0
        ? events.filter(e => !userPreferences.includes(e.category))
        : events;

    return (
        <div className="container mx-auto px-4 py-8">

            {loading && <div className="text-center py-10">Cargando eventos...</div>}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Recommended Section */}
                    {recommendedEvents.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
                                <span className="mr-2">✨</span> Recomendados para ti
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommendedEvents.map(event => (
                                    <EventCard key={event.id} event={event} onBook={handleBook} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Events Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {recommendedEvents.length > 0 ? "Más Eventos" : "Próximos Eventos"}
                        </h2>

                        {otherEvents.length === 0 && (
                            <p className="text-gray-500">No hay eventos disponibles.</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherEvents.map(event => (
                                <EventCard key={event.id} event={event} onBook={handleBook} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};