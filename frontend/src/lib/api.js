const API_URL = 'http://localhost:3000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    login: async (email, password) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error((await res.json()).error);
        return res.json();
    },
    signup: async (name, email, password) => {
        const res = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name, email, password })
        });
        if (!res.ok) throw new Error((await res.json()).error);
        return res.json();
    },
    getThemes: async () => {
        const res = await fetch(`${API_URL}/themes`);
        return res.json();
    },
    getEvents: async () => {
        const res = await fetch(`${API_URL}/events`);
        return res.json();
    },
    getStalls: async () => {
        const res = await fetch(`${API_URL}/stalls`);
        return res.json();
    },
    getMyStalls: async () => {
        const res = await fetch(`${API_URL}/stalls/my`, { headers: getHeaders() });
        return res.json();
    },
    getAllStalls: async () => {
        const res = await fetch(`${API_URL}/stalls/all`, { headers: getHeaders() });
        return res.json();
    },
    createStall: async (data) => {
        const res = await fetch(`${API_URL}/stalls`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error((await res.json()).error);
        return res.json();
    },
    editEvent: async (id, data) => {
        const res = await fetch(`${API_URL}/events/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error((await res.json()).error);
        return res.json();
    },
    joinEvent: async (id) => {
        const res = await fetch(`${API_URL}/events/${id}/join`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error((await res.json()).error);
        return res.json();
    },
    approveStall: async (id) => {
        const res = await fetch(`${API_URL}/stalls/${id}/approve`, {
            method: 'POST',
            headers: getHeaders()
        });
        return res.json();
    },
    rejectStall: async (id) => {
        const res = await fetch(`${API_URL}/stalls/${id}/reject`, {
            method: 'POST',
            headers: getHeaders()
        });
        return res.json();
    }
};
