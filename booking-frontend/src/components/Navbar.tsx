
import { Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useState, useEffect } from "react";
import { getUserByEmail } from "../services/api";

export const Navbar = () => {
    const auth = useAuth();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const token = auth.user?.access_token || "";
    const userEmail = auth.user?.profile.email || "";

    useEffect(() => {
        if (userEmail && token) {
            loadUser();
        }
    }, [userEmail, token]);

    const loadUser = async () => {
        try {
            const user = await getUserByEmail(userEmail, token);
            setCurrentUser(user);
        } catch (error) {
            console.error("Error loading user", error);
        }
    };

    const isOrganizerOrAdmin = currentUser?.role === 1 || currentUser?.role === 2;

    const handleLogout = async () => {
        await auth.signoutRedirect();
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <span className="text-2xl font-bold text-blue-600">TicketApp 🎟️</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                            Eventos
                        </Link>

                        {auth.isAuthenticated ? (
                            <>
                                {isOrganizerOrAdmin && (
                                    <Link
                                        to="/create-event"
                                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                                    >
                                        + Crear Evento
                                    </Link>
                                )}

                                <div className="relative ml-3">
                                    <div className="flex items-center space-x-3 border-l pl-4 ml-4">
                                        <Link to="/profile" className="flex items-center text-gray-700 hover:text-blue-600">
                                            <span className="mr-2 font-medium">{currentUser?.fullName || userEmail}</span>
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {currentUser?.fullName?.charAt(0) || userEmail.charAt(0)}
                                            </div>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="text-gray-500 hover:text-red-600 text-sm font-medium"
                                        >
                                            Salir
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                                    Iniciar Sesión
                                </Link>
                                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            to="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Eventos
                        </Link>

                        {auth.isAuthenticated ? (
                            <>
                                {isOrganizerOrAdmin && (
                                    <Link
                                        to="/create-event"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-green-600 hover:bg-green-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Crear Evento
                                    </Link>
                                )}
                                <Link
                                    to="/profile"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Mi Perfil
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    Cerrar Sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
