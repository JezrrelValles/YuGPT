// =========================================
// 🔧 Configuración Global del API
// =========================================

// Cambia esta URL y tu app usará el nuevo dominio automáticamente
export const API_BASE_URL = "http://10.0.1.243:8000/api";


// =========================================
// 🔧 Función Genérica para Requests
// =========================================
async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }

        return response.json();
    } catch (err) {
        console.error("Fetch error:", err.message);
        throw err;
    }
}


// =========================================
// 📌 Funciones del API
// =========================================

export const assignBank = async (bank) => {
    return apiFetch("/bank", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: bank
    });
};


export const createNewThread = async (content) => {
    return apiFetch("/new", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: content
    });
};


export const fetchThread = async (threadId) => {
    return apiFetch(`/threads/${threadId}`);
};


export const fetchRun = async (threadId, runId) => {
    return apiFetch(`/threads/${threadId}/runs/${runId}`);
};


export const postMessage = async (threadId, message) => {
    return apiFetch(`/threads/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message })
    });
};


export const postToolResponse = async (threadId, runId, toolResponses) => {
    return apiFetch(`/threads/${threadId}/runs/${runId}/tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toolResponses)
    });
};
