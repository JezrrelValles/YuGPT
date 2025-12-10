export const API_BASE_URL = import.meta.env.VITE_API_URL

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

export const assignBank = async (bank) => {
    return apiFetch("/api/bank", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: bank
    });
};


export const createNewThread = async (content) => {
    return apiFetch("/api/new", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: content
    });
};


export const fetchThread = async (threadId) => {
    return apiFetch(`/api/threads/${threadId}`);
};


export const fetchRun = async (threadId, runId) => {
    return apiFetch(`/api/threads/${threadId}/runs/${runId}`);
};


export const postMessage = async (threadId, message) => {
    return apiFetch(`/api/threads/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message })
    });
};


export const postToolResponse = async (threadId, runId, toolResponses) => {
    return apiFetch(`/api/threads/${threadId}/runs/${runId}/tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toolResponses)
    });
};
