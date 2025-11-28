
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { getUserByEmail, updateUser, deleteUser } from '../services/api';
import { type User } from '../types/User';

export const ProfilePage = () => {
    const auth = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ fullName: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (auth.isAuthenticated && auth.user?.profile.email) {
            fetchUser();
        }
    }, [auth.isAuthenticated, auth.user]);

    const fetchUser = async () => {
        try {
            const data = await getUserByEmail(auth.user?.profile.email!, auth.user?.access_token!);
            setUser(data);
            setFormData({ fullName: data.fullName });
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
            await updateUser(user.id, { fullName: formData.fullName }, auth.user?.access_token!);
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

    if (loading) return <div className="text-center py-10">Cargando perfil...</div>;
    if (!user) return <div className="text-center py-10">No se pudo cargar el usuario.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
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
                    )}

                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-bold text-red-600 mb-2">Zona de Peligro</h3>
                        <p className="text-gray-600 mb-4 text-sm">
                            Desactivar tu cuenta hará que no puedas acceder a tus eventos ni realizar nuevas reservas.
                        </p>
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
    );
};
