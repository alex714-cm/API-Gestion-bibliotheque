// services/apiService.js
const BASE_URL = '';

export const apiService = {
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, config);

            // 1. Handling les erreurs (400, 500, etc.)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Erreur inconnue" }));
                const error = new Error('API Error');
                error.response = { data: errorData }; 
                throw error;
            }

            // 2. FIX: Handling for l-Response (JSON vs TEXT)
            const contentType = response.headers.get("content-type");
            
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                return { data }; // objet Json
            } else {
                const text = await response.text();
                return { data: text }; //String
            }

        } catch (err) {
            // verif probleme CORS/serveur
            if (!err.response) {
                err.message = "Serveur inaccessible ou problème de connexion.";
            }
            throw err;
        }
    },

    get(url) { return this.request(url, { method: 'GET' }); },
    post(url, body) { return this.request(url, { method: 'POST', body: JSON.stringify(body) }); },
    put(url, body) { return this.request(url, { method: 'PUT', body: JSON.stringify(body) }); },
    delete(url) { return this.request(url, { method: 'DELETE' }); }
};