
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { createEvent } from '../services/api';

interface SectionInput {
    name: string;
    price: number;
    capacity: number;
    isNumbered: boolean;
}

export const CreateEventPage = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venueName: '',
        category: '',
        imageUrl: '',
    });

    const [sections, setSections] = useState<SectionInput[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addSection = () => {
        setSections([...sections, { name: '', price: 0, capacity: 0, isNumbered: false }]);
    };

    const removeSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    const handleSectionChange = (index: number, field: keyof SectionInput, value: any) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setSections(newSections);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const eventData = {
                ...formData,
                date: new Date(formData.date).toISOString(),
                sections: sections
            };

            await createEvent(eventData, auth.user?.access_token || '');
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data || 'Error al crear el evento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Crear Nuevo Evento</h1>

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
                            placeholder="Ej: Concierto, Teatro"
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

                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Secciones / Localidades</h3>
                        <button
                            type="button"
                            onClick={addSection}
                            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                        >
                            + Agregar Sección
                        </button>
                    </div>

                    {sections.map((section, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-md mb-4 relative">
                            <button
                                type="button"
                                onClick={() => removeSection(index)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm border p-1"
                                        value={section.name}
                                        onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Precio</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm border p-1"
                                        value={section.price}
                                        onChange={(e) => handleSectionChange(index, 'price', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Capacidad</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm border p-1"
                                        value={section.capacity}
                                        onChange={(e) => handleSectionChange(index, 'capacity', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="flex items-center mt-6">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={section.isNumbered}
                                        onChange={(e) => handleSectionChange(index, 'isNumbered', e.target.checked)}
                                    />
                                    <label className="ml-2 block text-sm text-gray-900">Numerado</label>
                                </div>
                            </div>
                        </div>
                    ))}
                    {sections.length === 0 && (
                        <p className="text-sm text-gray-500 italic text-center py-4">Agrega al menos una sección para publicar el evento.</p>
                    )}
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-4 hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {loading ? 'Creando...' : 'Crear Evento'}
                    </button>
                </div>
            </form>
        </div>
    );
};
