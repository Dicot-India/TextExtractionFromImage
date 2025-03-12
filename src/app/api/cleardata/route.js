export async function POST(request, response) {
    const backendUrl = `http://15.207.232.194:9999${request.nextUrl.pathname.replace('/api/cleardata', '/clear_data')}`;
    // const backendUrl = "http://10.17.12.14:5000/clear_data"

    try {

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        const data = await response.json();
        console.log(data);
        return Response.json(data, { status: response.status });
    } catch (error) {
        console.log(error)
        return Response.json({ error: "Failed to connect to backend" }, { status: 500 });
    }
}