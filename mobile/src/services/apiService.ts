import { getFirebaseIdToken } from './authService';

const CONFIGURED_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

/**
 * Configure EXPO_PUBLIC_API_BASE_URL as your backend origin, for example:
 *   http://192.168.1.20:3000
 *
 * A trailing /api/v1 is also accepted for compatibility with older .env files.
 */
const API_BASE_URL = CONFIGURED_API_BASE_URL
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/i, '');

console.log('ACTIVE API BASE URL:', API_BASE_URL);

function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
}

async function readError(response: Response): Promise<string> {
  const text = await response.text();

  if (!text) {
    return response.statusText || 'Unknown server error';
  }

  try {
    const parsed = JSON.parse(text);
    return parsed.error || parsed.message || text;
  } catch {
    return text;
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getFirebaseIdToken();

  if (!token) {
    throw new Error('You are not signed in. Please sign in and try again.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getRecommendations(userId: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(
    apiUrl(`/api/v1/recommendations/${encodeURIComponent(userId)}`),
    { headers },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch recommendations: ${response.status} ${await readError(response)}`,
    );
  }

  return response.json();
}

export async function generateRecommendations(userId: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(
    apiUrl(`/generate/${encodeURIComponent(userId)}`),
    {
      method: 'POST',
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to generate recommendations: ${response.status} ${await readError(response)}`,
    );
  }

  return response.json();
}

export type ChatbotResponse = {
  success: boolean;
  reply: string;
  model?: string;
  mode?: 'ai' | 'demo';
  error?: string;
};

export async function sendChatbotMessage(
  message: string,
): Promise<ChatbotResponse> {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error('Please enter a message.');
  }

  const headers = await getAuthHeaders();
  const response = await fetch(apiUrl('/api/chatbot/message'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: trimmedMessage }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to send chatbot message: ${response.status} ${await readError(response)}`,
    );
  }

  const data = (await response.json()) as ChatbotResponse;

  if (!data?.success || typeof data.reply !== 'string' || !data.reply.trim()) {
    throw new Error(data?.error || 'The chatbot returned an empty response.');
  }

  return data;
}

export type HealthDataPayload = {
  user_id: number;
  step_count: number;
  sleep_hours: number | null;
  heart_rate_avg: number | null;
  water_intake: number;
  calories_burned: number;
};

export async function submitHealthData(healthData: Record<string, unknown>) {
  const headers = await getAuthHeaders();

  const userId = healthData.userId ?? healthData.user_id;
  const recordDate =
    healthData.recordDate ??
    healthData.record_date ??
    new Date().toISOString().slice(0, 10);

  if (userId === undefined || userId === null || String(userId).trim() === '') {
    throw new Error('A user ID is required to submit health data.');
  }

  const payload = {
    ...healthData,
    userId,
    recordDate,
  };

  const response = await fetch(apiUrl('/api/health-data'), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to submit health metrics: ${response.status} ${await readError(response)}`,
    );
  }

  return response.json();
}
