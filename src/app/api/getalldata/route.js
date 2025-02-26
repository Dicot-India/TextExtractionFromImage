export async function GET(request, response) {
    const backendUrl = `http://15.207.232.194:9999${request.nextUrl.pathname.replace('/api/getalldata', '/get_all_data')}`;

    try {
        const response = await fetch(backendUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        return Response.json(data, { status: response.status });
    } catch (error) {
        console.log(error)
        return Response.json({ error: "Failed to connect to backend" }, { status: 500 });
    }
}
