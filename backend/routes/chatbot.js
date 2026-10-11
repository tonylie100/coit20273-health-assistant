
const express = require('express');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

const API_URL = 'https://api.llmsrelay.com/v1/messages';
const MODEL = 'claude-sonnet-4.6';

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
- Never invent the user's health readings or medical history.
`;

router.post('/message', verifyToken, async (req, res) => {
  try {
    const message =
      typeof req.body?.message === 'string'
        ? req.body.message.trim()
        : '';

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const apiKey = process.env.LLMSRELAY_API_KEY?.trim();

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'LLMsRelay API key is not configured'
      });
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Do not log the API key.
      console.error(
        `LLMsRelay API error: HTTP ${response.status}`,
        errorText.slice(0, 500)
      );

      return res.status(502).json({
        success: false,
        error: 'The AI service could not generate a response.',
        upstreamStatus: response.status
      });
    }

    const data = await response.json();

    const reply = Array.isArray(data.content)
      ? data.content
          .filter(item => item.type === 'text')
          .map(item => item.text)
          .join('\n')
          .trim()
      : '';

    if (!reply) {
      return res.status(502).json({
        success: false,
        error: 'The AI service returned an empty response.'
      });
    }

    return res.status(200).json({
      success: true,
      reply,
      model: MODEL,
      source: 'live_ai'
    });
  } catch (error) {
    console.error('Chatbot backend error:', error.message);

    const timedOut =
      error.name === 'TimeoutError' ||
      error.name === 'AbortError';

    return res.status(timedOut ? 504 : 500).json({
      success: false,
      error: timedOut
        ? 'The AI service timed out. Please try again.'
        : 'Unable to generate a response at this time.'
    });
  }
});

module.exports = router;
