
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { type Event, type EventSection } from "../types/Event";
import { getEventSections } from "../services/api";

interface Props {
    event: Event;
    onBook: (eventId: string) => void;
}

export const EventCard = ({ event, onBook }: Props) => {
    const auth = useAuth();
    const [minPrice, setMinPrice] = useState<number>(0);

    // Formatear fecha
    const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    useEffect(() => {
        const fetchPrice = async () => {
            // Si ya vienen las secciones, usamos el precio menor
            if (event.sections && event.sections.length > 0) {
                const prices = event.sections.map(s => s.price);
                setMinPrice(Math.min(...prices));
                return;
            }

            // Si no, intentamos buscarlas (si tenemos token)
            if (auth.user?.access_token) {
                try {
                    const sections: EventSection[] = await getEventSections(event.id, auth.user.access_token);
                    if (sections && sections.length > 0) {
                        const prices = sections.map((s: any) => s.price);
                        setMinPrice(Math.min(...prices));
                    }
                } catch (error) {
                    console.error("Error fetching sections for price", error);
                }
            }
        };

        fetchPrice();
    }, [event, auth.user?.access_token]);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Imagen Placeholder o Real */}
            <div className="h-48 bg-gray-200 relative">
                {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <span className="text-4xl">📅</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                    {event.category && (
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                            {event.category}
                        </span>
                    )}
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {event.venueName}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-4 uppercase font-semibold">{eventDate}</p>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.description}</p>

                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                        Desde <span className="font-bold text-gray-900">${minPrice}</span>
                    </span>
                    <button
                        onClick={() => onBook(event.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Reservar Entrada
                    </button>
                </div>
            </div>
        </div>
    );
};