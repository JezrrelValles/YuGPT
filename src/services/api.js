export const assignBank = async (bank) => {
    try {
        let response = await fetch("https://yugpt-server.onrender.com/api/bank", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: bank
        })

        if (!response.ok) {
            throw new Error('Failed to assign bank');
        }

        return response.json()
    } catch (err) {
        console.log(err.message)
    }
}

export const createNewThread = async (content) => {
    try {
        let response = await fetch("https://yugpt-server.onrender.com/api/new", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: content
        })
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json()
    } catch (err) {
        console.log(err.message)
    }
}


export const fetchThread = async (threadId) => {
    try {
        let response = await fetch(`https://yugpt-server.onrender.com/api/threads/${threadId}`)
        return response.json()
    } catch (err) {
        console.log(err.message)
    }
}

export const fetchRun = async (threadId, runId) => {
    try {
        let response = await fetch(`https://yugpt-server.onrender.com/api/threads/${threadId}/runs/${runId}`)
        return response.json()
    } catch (err) {
        console.log(err.message)
    }
}

export const postMessage = async (threadId, message) => {
    try {
        let response = await fetch(`https://yugpt-server.onrender.com/api/threads/${threadId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({content: message})
        })
        return response.json()
    } catch (err) {
        console.log(err.message)
    }
}

export const postToolResponse = async (threadId, runId, toolResponses) => {
    try {
        let response = await fetch(`https://yugpt-server.onrender.com/api/threads/${threadId}/runs/${runId}/tool`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(toolResponses)
        })
        return response.json()
    } catch (err) {
        console.log(err.message)
    }
}