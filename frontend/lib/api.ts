const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getAPI(path: string) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}