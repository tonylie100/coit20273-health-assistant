const verifyToken = require('../middleware/verifyToken');
const express = require('express');
const pool = require('../db');

const router = express.Router();

const API_URL = 'https://api.llmsrelay.com/v1/messages';

const SYSTEM_PROMPT = `
You are an AI Personal Health Assistant.

Your role is to provide general health and wellness information
in a clear, supportive, and responsible way.

You may use the user's provided health data to give
general wellness observations and suggestions.

Safety rules:
- Do not diagnose medical conditions.
- Do not claim to replace a doctor or qualified healthcare professional.
- Do not prescribe, stop, or change medications.
- Do not provide dangerous or harmful instructions.
- For serious or urgent symptoms, encourage the user to seek appropriate professional medical care.
- For mental-health concerns, respond empathetically and encourage appropriate professional support when needed.
- Clearly communicate uncertainty when information is not definitive.
- Treat the health data as informational context, not as a medical diagnosis.
`;

router.post('/message', verifyToken, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    // Validate message
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Check API key
    const apiKey = process.env.LLMSRELAY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'LLMsRelay API key is not configured'
      });
    }

    // ---------------------------------------------------------
    // 1. Find the authenticated database user
    // ---------------------------------------------------------
    const userResult = await pool.query(
      `SELECT
         user_id,
         full_name,
         email
       FROM users
       WHERE firebase_uid = $1`,
      [req.user.uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User account not found'
      });
    }

    const user = userResult.rows[0];

    // ---------------------------------------------------------
    // 2. Get the latest health record for this user
    // ---------------------------------------------------------
    const healthResult = await pool.query(
      `SELECT
         health_data_id,
         record_date,
         steps,
         heart_rate,
         sleep_hours,
         calories_burned,
         water_intake
       FROM health_data
       WHERE user_id = $1
       ORDER BY record_date DESC, health_data_id DESC
       LIMIT 1`,
      [user.user_id]
    );

    const latestHealthData =
      healthResult.rows.length > 0
        ? healthResult.rows[0]
        : null;

    // ---------------------------------------------------------
    // 3. Build health context for the AI
    // ---------------------------------------------------------
    let healthContext = `
User name: ${user.full_name}
User ID: ${user.user_id}
`;

    if (latestHealthData) {
      healthContext += `
Latest available health record:
Record date: ${latestHealthData.record_date}
Steps: ${latestHealthData.steps ?? 'Not available'}
Heart rate: ${latestHealthData.heart_rate ?? 'Not available'}
Sleep hours: ${latestHealthData.sleep_hours ?? 'Not available'}
Calories burned: ${latestHealthData.calories_burned ?? 'Not available'}
Water intake: ${latestHealthData.water_intake ?? 'Not available'}
`;
    } else {
      healthContext += `
No health records are currently available for this user.
`;
    }

    // ---------------------------------------------------------
    // 4. Prepare conversation messages
    // ---------------------------------------------------------
    const messages = [];

    // Add previous conversation if supplied by frontend
    if (Array.isArray(conversationHistory)) {
      for (const item of conversationHistory) {
        if (
          item &&
          (item.role === 'user' || item.role === 'assistant') &&
          typeof item.content === 'string' &&
          item.content.trim()
        ) {
          messages.push({
            role: item.role,
            content: item.content
          });
        }
      }
    }

    // Add current message together with health context
    messages.push({
      role: 'user',
      content: `
Here is the authenticated user's latest available health context:

${healthContext}

User's question:
${message}
`
    });

    // ---------------------------------------------------------
    // 5. Send message + health context to LLM
    // ---------------------------------------------------------
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
        messages
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

    // ---------------------------------------------------------
    // 6. Return chatbot response
    // ---------------------------------------------------------
    return res.json({
      success: true,
      reply: text,
      model: 'claude-sonnet-4.6',
      healthContext: {
        user_id: user.user_id,
        user_name: user.full_name,
        latest_record_date: latestHealthData
          ? latestHealthData.record_date
          : null
      }
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