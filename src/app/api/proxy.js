export default async function handler(req, res) {
    const backendUrl = `http://15.207.232.194:9999/upload`; // Direct backend URL

    try {
        const response = await fetch(backendUrl, {
            method: req.method,
            headers: {
                // Do not set 'Content-Type' for FormData, let the browser handle it
            },
            body: req.body, // Forwarding FormData directly
        });

        const data = await response.text(); // Get response as text or JSON
        res.status(response.status).send(data);
    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).json({ error: "Failed to connect to backend" });
    }
}