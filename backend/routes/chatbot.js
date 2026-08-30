const express = require('express');

const router = express.Router();

const API_URL = 'https://api.llmsrelay.com/v1/messages';

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

router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const apiKey = process.env.LLMSRELAY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
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
        model: 'claude-sonnet-4.6',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        `Claude API request failed: ${response.status} ${errorText}`
      );

      return res.status(response.status).json({
        success: false,
        error: 'Claude API request failed'
      });
    }

    const data = await response.json();

    const text = data.content
      ?.filter((item) => item.type === 'text')
      ?.map((item) => item.text)
      ?.join('');

    if (!text) {
      return res.status(500).json({
        success: false,
        error: 'Claude returned an empty response'
      });
    }

    return res.json({
      success: true,
      reply: text,
      model: 'claude-sonnet-4.6'
    });

  } catch (error) {
    console.error('Chatbot backend error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to generate chatbot response'
    });
  }
});

module.exports = router;