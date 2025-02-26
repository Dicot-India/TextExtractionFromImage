export default async function handler(req, res) {
    const backendUrl = `http://15.207.232.194:9999${req.url.replace('/api/proxy', '')}`;

    try {
        const response = await fetch(backendUrl, {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
            },
            body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to connect to backend" });
    }
}