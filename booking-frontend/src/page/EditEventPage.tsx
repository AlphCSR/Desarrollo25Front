
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { getEventById, updateEvent } from '../services/api';

export const EditEventPage = () => {
    const { id } = useParams<{ id: string }>();
    const auth = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venueName: '',
        category: '',
        imageUrl: '',
    });

    useEffect(() => {
        if (id && auth.user?.access_token) {
            fetchEvent();
        }
    }, [id, auth.user?.access_token]);

    const fetchEvent = async () => {
        try {
            const data = await getEventById(id!, auth.user?.access_token!);
            setFormData({
                title: data.title,
                description: data.description,
                date: new Date(data.date).toISOString().slice(0, 16), // Format for datetime-local
                venueName: data.venueName,
                category: data.category,
                imageUrl: data.imageUrl || '',
            });
        } catch (err) {
            console.error(err);
            setError('Error al cargar el evento.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const eventData = {
                ...formData,
                date: new Date(formData.date).toISOString(),
            };

            await updateEvent(id!, eventData, auth.user?.access_token || '');
            navigate(`/event/${id}`);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data || 'Error al actualizar el evento.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Cargando evento...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Editar Evento</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.title}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                        <input
                            type="text"
                            name="category"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.category}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                        name="description"
                        required
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            name="date"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.date}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Lugar (Venue)</label>
                        <input
                            type="text"
                            name="venueName"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.venueName}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">URL de Imagen</label>
                    <input
                        type="url"
                        name="imageUrl"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="button"
                        onClick={() => navigate(`/event/${id}`)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-4 hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};
