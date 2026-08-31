\# Chatbot Testing Evidence



\## Overview



The mobile chatbot was tested after connecting the chatbot UI to the backend chatbot API.



The testing focused on normal interaction, health and wellness questions, safety-sensitive input, conversation flow, UI controls, loading behaviour, and backend error handling.



\## Test Cases



| ID | Test Scenario | Expected Result | Status |

|---|---|---|---|

| CHAT-01 | Normal wellness question | Backend response is displayed in the chatbot conversation | Pass |

| CHAT-02 | Nutrition / healthy lifestyle question | Relevant AI response is displayed | Pass |

| CHAT-03 | Safety-sensitive question | Safety-aware response is displayed without crashing the application | Pass |

| CHAT-04 | Multiple messages / conversation flow | User and assistant messages are displayed sequentially | Pass |

| CHAT-05 | Clear button | Existing conversation is cleared and the initial assistant message is restored | Pass |

| CHAT-06 | Typing / loading state | Typing indicator is displayed while waiting for the backend response | Pass |

| CHAT-07 | Backend unavailable / API error | Fallback error message is displayed and the application remains usable | Pass |



\## Client-Side Validation



The chatbot prevents empty messages from being submitted.



The send operation is disabled while a request is being processed to prevent repeated submissions.



\## API Integration Validation



The chatbot sends the user's message to:



`POST /api/chatbot/message`



The response returned by the backend is displayed as an assistant message in the mobile chatbot interface.



\## Error Handling



If the API request fails, the application displays a fallback message instead of crashing.



\## Evidence



The following screenshots were captured during testing:



\- Normal wellness question

\- Nutrition / lifestyle question

\- Safety-sensitive question

\- Multiple-message conversation

\- Clear button

\- Typing/loading state

\- Backend/API error behaviour



These screenshots provide visual evidence for the chatbot implementation and testing results.



\## Technical Validation



The following checks were completed during development:



`npx tsc --noEmit`



Result: Passed.



`git diff --check`



Result: Passed.



\## Conclusion

The chatbot UI and backend API integration were tested across normal interaction, safety-sensitive input, conversation flow, UI controls, loading behaviour, and API failure handling
