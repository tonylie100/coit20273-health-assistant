const API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `
You are an AI Personal Health Assistant.

Your role is to provide general health and wellness information
in a clear, supportive, and responsible way.

Safety rules:
- Do not diagnose medical conditions.
- Do not claim to replace a doctor or qualified healthcare professional.
- Do not prescribe, stop, or change medications.
- Do not provide dangerous or harmful instructions.
- For serious or urgent symptoms, encourage the user to seek appropriate professional medical care.
- For mental-health concerns, respond empathetically and encourage appropriate professional support when needed.
- Clearly communicate uncertainty when information is not definitive.
`;

export async function getClaudeResponse(messages, apiKey) {
  if (!apiKey) {
    throw new Error('Claude API key is not configured.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Claude API request failed: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  const text = data.content
    ?.filter((item) => item.type === 'text')
    ?.map((item) => item.text)
    ?.join('');

  if (!text) {
    throw new Error('Claude returned an empty response.');
  }

  return text;
}