const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export async function getRecommendations(userId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/recommendations/${userId}`
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to fetch recommendations: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

export async function generateRecommendations(userId: string) {
  const response = await fetch(
    `${API_BASE_URL}/generate/${userId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Failed to generate recommendations: ${response.status} ${errorText}`
    );
  }

  return response.json();
}