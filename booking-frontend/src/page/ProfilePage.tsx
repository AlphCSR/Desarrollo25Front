
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { getUserByEmail, updateUser, deleteUser, getUserHistory, getUserBookings, payBooking } from '../services/api';
import { type User } from '../types/User';

const CATEGORIES = ["Música", "Deportes", "Teatro", "Cine", "Conferencias"];

export const ProfilePage = () => {
    const auth = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', preferences: [] as string[] });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (auth.isAuthenticated && auth.user?.profile.email) {
            fetchUser();
        }
    }, [auth.isAuthenticated, auth.user]);

    const fetchUser = async () => {
        try {
            const token = auth.user?.access_token!;
            const userData = await getUserByEmail(auth.user?.profile.email!, token);
            setUser(userData);
            setFormData({
                fullName: userData.fullName,
                preferences: userData.preferences || []
            });

            // Fetch History
            try {
                const historyData = await getUserHistory(userData.id, token);
                setHistory(historyData);
            } catch (hErr) {
                console.error("Error loading history", hErr);
            }

        } catch (err) {
            console.error(err);
            setError('Error al cargar perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setError('');
        setSuccess('');

        try {
            await updateUser(user.id, {
                fullName: formData.fullName,
                preferences: formData.preferences
            }, auth.user?.access_token!);

            setSuccess('Perfil actualizado correctamente.');
            setEditing(false);
            fetchUser(); // Refresh data
        } catch (err: any) {
            console.error(err);
            setError('Error al actualizar perfil.');
        }
    };

    const handleDeactivate = async () => {
        if (!user || !window.confirm('¿Estás seguro de que quieres desactivar tu cuenta? Esta acción no se puede deshacer.')) return;

        try {
            await deleteUser(user.id, auth.user?.access_token!);
            await auth.signoutRedirect(); // Logout
        } catch (err) {
            console.error(err);
            setError('Error al desactivar cuenta.');
        }
    };

    const togglePreference = (category: string) => {
        setFormData(prev => {
            const prefs = prev.preferences.includes(category)
                ? prev.preferences.filter(p => p !== category)
                : [...prev.preferences, category];
            return { ...prev, preferences: prefs };
        });
    };

    if (loading) return <div className="text-center py-10">Cargando perfil...</div>;
    if (!user) return <div className="text-center py-10">No se pudo cargar el usuario.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="bg-blue-600 px-6 py-4">
                            <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
                        </div>

                        <div className="p-6">
                            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

                            <div className="mb-6">
                                <label className="block text-gray-500 text-sm font-bold mb-2">Correo Electrónico</label>
                                <p className="text-gray-900 text-lg">{user.email}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-500 text-sm font-bold mb-2">Rol</label>
                                <p className="text-gray-900 text-lg">
                                    {user.role === 0 ? 'Usuario' : user.role === 1 ? 'Organizador' : 'Admin'}
                                </p>
                            </div>

                            {editing ? (
                                <form onSubmit={handleUpdate} className="mb-6">
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Preferencias</label>
                                        <div className="flex flex-wrap gap-2">
                                            {CATEGORIES.map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => togglePreference(cat)}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.preferences.includes(cat)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        >
                                            Guardar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditing(false)}
                                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="mb-6">
                                        <label className="block text-gray-500 text-sm font-bold mb-2">Nombre Completo</label>
                                        <div className="flex justify-between items-center">
                                            <p className="text-gray-900 text-lg">{user.fullName}</p>
                                            <button
                                                onClick={() => setEditing(true)}
                                                className="text-blue-600 hover:text-blue-800 font-semibold"
                                            >
                                                Editar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-gray-500 text-sm font-bold mb-2">Mis Preferencias</label>
                                        <div className="flex flex-wrap gap-2">
                                            {user.preferences && user.preferences.length > 0 ? (
                                                user.preferences.map(pref => (
                                                    <span key={pref} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                        {pref}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 italic">No has seleccionado preferencias.</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-lg font-bold text-red-600 mb-2">Zona de Peligro</h3>
                                <button
                                    onClick={handleDeactivate}
                                    className="bg-red-100 text-red-600 hover:bg-red-200 font-bold py-2 px-4 rounded w-full transition-colors"
                                >
                                    Desactivar Cuenta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bookings & History */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Bookings Section */}
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="bg-indigo-600 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">Mis Reservas</h2>
                        </div>
                        <div className="p-4">
                            <BookingsList userId={user.id} />
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="bg-gray-800 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">Historial de Actividad</h2>
                        </div>
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            {history.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No hay actividad reciente.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {history.map((item, index) => (
                                        <li key={index} className="border-b pb-3 last:border-0">
                                            <p className="font-semibold text-gray-800">{item.action}</p>
                                            <p className="text-sm text-gray-600">{item.details}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Subcomponent for Bookings List
const BookingsList = ({ userId }: { userId: string }) => {
    const auth = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadBookings = () => {
        if (auth.user?.access_token) {
            setLoading(true);
            getUserBookings(userId, auth.user.access_token)
                .then(setBookings)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    };

    useEffect(() => {
        loadBookings();
    }, [userId, auth.user]);

    const handlePay = async (bookingId: string, amount: number) => {
        if (!confirm("¿Confirmar pago de la reserva?")) return;
        try {
            await payBooking(bookingId, amount, auth.user?.access_token!);
            alert("Pago exitoso!");
            loadBookings();
        } catch (error) {
            console.error("Error paying booking", error);
            alert("Error al procesar el pago.");
        }
    };

    if (loading) return <p className="text-center py-4">Cargando reservas...</p>;
    if (bookings.length === 0) return <p className="text-center py-4 text-gray-500">No tienes reservas activas.</p>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            ID Reserva
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Fecha
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Total
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Estado
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((booking) => (
                        <tr key={booking.id}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap" title={booking.id}>
                                    ...{booking.id.slice(-8)}
                                </p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">
                                    {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">
                                    ${booking.totalAmount}
                                </p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <span className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full
                                    ${booking.status === 'Confirmed' ? 'bg-green-200 text-green-900' :
                                        booking.status === 'Cancelled' ? 'bg-red-200 text-red-900' :
                                            'bg-yellow-200 text-yellow-900'}`}>
                                    <span aria-hidden className="absolute inset-0 opacity-50 rounded-full"></span>
                                    <span className="relative">{booking.status}</span>
                                </span>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                {booking.status === 'PendingPayment' && (
                                    <button
                                        onClick={() => handlePay(booking.id, booking.totalAmount)}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                                    >
                                        Pagar
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
