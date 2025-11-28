import { useAuth } from "react-oidc-context";
import { Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
    const auth = useAuth();

    switch (auth.activeNavigator) {
        case "signinSilent":
            return <div>Iniciando sesión silenciosamente...</div>;
        case "signoutRedirect":
            return <div>Cerrando sesión...</div>;
    }

    if (auth.isLoading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    if (auth.error) {
        return <div>Error de autenticación: {auth.error.message}</div>;
    }

    if (auth.isAuthenticated) {
        return <Outlet />; // Renderiza la ruta hija (ej. Dashboard)
    }

    // Si no está logueado, redirigir a Login automático o mostrar botón
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">Acceso Restringido</h1>
            <p>Debes iniciar sesión para ver esta página.</p>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => void auth.signinRedirect()}
            >
                Iniciar Sesión con Keycloak
            </button>
        </div>
    );
};