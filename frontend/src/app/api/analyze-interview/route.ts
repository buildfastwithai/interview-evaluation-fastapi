export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Get the backend URL from environment variables
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Forward the request to FastAPI backend
    const response = await fetch(`${backendUrl}/analyze-interview`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return Response.json({ detail: "Internal server error" }, { status: 500 });
  }
}
