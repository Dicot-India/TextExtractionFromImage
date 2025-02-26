export async function POST(request, response) {
    const backendUrl = `http://15.207.232.194:9999${request.nextUrl.pathname.replace('/api/upload', '/upload')}`;

    try {

        const body = await request.formData();
        const response = await fetch(backendUrl, {
            method: "POST",
            body: body,
        });
        const data = await response.json();
        return Response.json(data, { status: response.status });    
    } catch (error) {
        console.log(error)
        return Response.json({ error: "Failed to connect to backend" }, { status: 500 });
    }
}
