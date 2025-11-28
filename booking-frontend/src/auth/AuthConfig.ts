import { type UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts';

export const keycloakConfig: UserManagerSettings = {
    authority: "http://localhost:8080/realms/Users-Ms", // URL de tu Realm
    client_id: "booking-frontend", // El cliente que creaste en Keycloak
    redirect_uri: "http://localhost:5173/", // Donde vuelve después de loguearse
    post_logout_redirect_uri: "http://localhost:5173/",
    response_type: "code", // Flujo estándar PKCE
    scope: "openid profile email",
    monitorSession: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    automaticSilentRenew: true,
};