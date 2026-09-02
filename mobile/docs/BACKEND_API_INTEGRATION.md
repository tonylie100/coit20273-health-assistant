# Backend API Integration – Prathyusha

## Chatbot API Dependency

The mobile chatbot UI has been implemented to communicate with the backend through:

POST /api/chatbot/message

The frontend service is implemented in:

mobile/src/services/apiService.ts

The current frontend flow is:

ChatbotScreen
→ sendChatbotMessage()
→ POST /api/chatbot/message
→ Backend chatbot service
→ Claude / LLMsRelay
→ Backend response
→ Chatbot UI

### Expected Request

{
  "message": "<user health question>"
}

### Expected Response

{
  "success": true,
  "reply": "<AI response>"
}

### Frontend Responsibilities

- Collect the user's chatbot message.
- Validate that the message is not empty.
- Send the message to the backend API.
- Display the returned AI response.
- Display a fallback message when the API request fails.
- Provide a retry option after an API failure.
- Prevent duplicate requests while the request is processing.

### Backend Dependency

Verification of the current backend branch
(feature/sakshi-user-data) found the following routes:

- /api/auth
- /api/profile
- /api/goals
- /api/health-data
- /api/dashboard

The current backend branch does not yet expose:

POST /api/chatbot/message

No chatbot, Claude, or LLMsRelay implementation was found under the backend directory during branch verification.

Therefore, backend implementation of the chatbot endpoint remains a team integration dependency.

### Integration Status

Frontend chatbot implementation: Completed

Frontend API service: Completed

Backend chatbot endpoint: Pending backend integration

End-to-end mobile → backend → AI testing: Pending backend endpoint availability