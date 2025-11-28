import axios from 'axios';

const API_URL = "/api"; // Gateway (Proxy)

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