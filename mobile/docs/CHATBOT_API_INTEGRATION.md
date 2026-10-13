\# Chatbot Frontend API Integration



\## Overview



The mobile chatbot UI has been integrated with the project backend API.



Previously, the mobile application directly accessed the Claude service. The updated implementation sends the user's message to the backend chatbot API through the `apiService`.



\## Request Flow



User enters health question

&#x20;       ↓

ChatbotScreen

&#x20;       ↓

sendMessage()

&#x20;       ↓

sendChatbotMessage()

&#x20;       ↓

POST /api/chatbot/message

&#x20;       ↓

Backend AI service

&#x20;       ↓

Backend returns reply

&#x20;       ↓

ChatbotScreen displays assistant response



\## Frontend Implementation



The chatbot screen is implemented in:



`src/app/chatbot.tsx`



The API communication is handled through:



`src/services/apiService.ts`



The chatbot calls:



`sendChatbotMessage(trimmedMessage)`



The returned backend response is read from:



`data.reply`



and displayed as a bot message in the conversation.



\## UI Behaviour



The chatbot provides:



\- User and assistant message bubbles

\- Text input for health questions

\- Send button

\- Loading/typing state

\- Empty-message validation

\- API error handling

\- Clear conversation functionality

\- General wellness safety disclaimer



\## Error Handling



If the backend request fails, the application displays an informative fallback message instead of crashing.



\## Loading State



While waiting for the backend response:



\- `isTyping` is set to `true`

\- The typing indicator is displayed

\- The input and send button are disabled



After the request completes, `isTyping` is reset to `false`.



\## Safety Disclaimer



The existing disclaimer remains visible:



"General wellness information only. This assistant does not provide medical diagnosis or emergency care."



\## Verification



TypeScript validation:



`npx tsc --noEmit`



Git whitespace validation:



`git diff --check`



Both checks were completed successfully during the chatbot API integration work.

