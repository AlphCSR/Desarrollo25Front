export interface User {
    id: string;
    fullName: string;
    email: string;
    role: number; // 0: User, 1: Organizer, 2: Admin
    state: boolean;
    preferences: string[];
    keycloakId: string;
}
