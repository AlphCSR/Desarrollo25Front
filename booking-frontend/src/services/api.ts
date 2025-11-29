
import axios from 'axios';

const API_URL = "/api"; // Gateway (Proxy)

// Events
export const getEvents = async (token: string) => {
    const response = await axios.get(`${API_URL}/Events`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getEventSections = async (eventId: string, token: string) => {
    const response = await axios.get(`${API_URL}/events/${eventId}/sections`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getEventById = async (id: string, token: string) => {
    const response = await axios.get(`${API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createEvent = async (eventData: any, token: string) => {
    const response = await axios.post(`${API_URL}/Events`, eventData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateEvent = async (id: string, eventData: any, token: string) => {
    const response = await axios.put(`${API_URL}/Events/${id}`, eventData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteEvent = async (id: string, token: string) => {
    const response = await axios.delete(`${API_URL}/Events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Seating
export const getEventSeats = async (eventId: string, token: string) => {
    const response = await axios.get(`${API_URL}/seating/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const lockSeat = async (seatId: string, userId: string, token: string) => {
    const response = await axios.post(`${API_URL}/seating/lock`,
        { seatId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const unlockSeat = async (seatId: string, userId: string, token: string) => {
    const response = await axios.post(`${API_URL}/seating/unlock`,
        { seatId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Bookings
export const getUserBookings = async (userId: string, token: string) => {
    const response = await axios.get(`${API_URL}/Booking/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createBooking = async (bookingData: any, token: string) => {
    const response = await axios.post(`${API_URL}/Booking`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const payBooking = async (bookingId: string, amount: number, token: string) => {
    const response = await axios.post(`${API_URL}/payments/api/Payment/pay`, { bookingId, amount }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Users
export const createUser = async (user: any) => {
    const response = await axios.post(`${API_URL}/Users`, user);
    return response.data;
};

export const getUserById = async (id: string, token: string) => {
    const response = await axios.get(`${API_URL}/Users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getUserByEmail = async (email: string, token: string) => {
    const response = await axios.get(`${API_URL}/Users/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateUser = async (id: string, user: any, token: string) => {
    const response = await axios.put(`${API_URL}/Users/id/${id}`, user, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteUser = async (id: string, token: string) => {
    await axios.delete(`${API_URL}/Users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const getUserHistory = async (id: string, token: string) => {
    const response = await axios.get(`${API_URL}/Users/${id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
