
import { useAuth } from "react-oidc-context";
import { Link, Navigate } from "react-router-dom";

export const LoginPage = () => {
    const auth = useAuth();

    if (auth.isAuthenticated) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
                <div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Bienvenido a TicketApp
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Inicia sesión para gestionar tus reservas y perfil
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => void auth.signinRedirect()}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all"
                    >
                        Iniciar Sesión con Keycloak
                    </button>

                    <div className="text-sm">
                        <span className="text-gray-500">¿No tienes cuenta? </span>
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Regístrate aquí
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
