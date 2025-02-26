export async function GET(req) {
    const backendUrl = `http://15.207.232.194:9999${req.nextUrl.pathname.replace('/api/proxy', '')}`;

    try {
        const response = await fetch(backendUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        return Response.json(data, { status: response.status });
    } catch (error) {
        return Response.json({ error: "Failed to connect to backend" }, { status: 500 });
    }
}

export async function POST(req) {
    const backendUrl = `http://15.207.232.194:9999${req.nextUrl.pathname.replace('/api/proxy', '')}`;

    try {
        const body = await req.json();
        const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return Response.json(data, { status: response.status });
    } catch (error) {
        return Response.json({ error: "Failed to connect to backend" }, { status: 500 });
    }
}
