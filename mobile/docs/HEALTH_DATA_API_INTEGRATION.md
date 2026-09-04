# Health Data Frontend API Integration

## 1. Overview

The Health Data feature provides a mobile interface for entering and submitting user health metrics to the backend health-assistant system.

As part of my frontend contribution, I implemented the Health Data screen and prepared the frontend API integration required to submit health information to the backend `/api/v1/metrics` endpoint.

The implementation focuses on:

- Mobile Health Data user interface
- Manual health metric entry
- Client-side input validation
- Health metric payload construction
- API service integration
- Success and error handling
- Clear Form functionality
- Frontend testing and validation
- Preparation for frontend-to-backend integration testing

The backend database implementation, PostgreSQL storage, authentication middleware, and backend API implementation are outside my individual task scope.

---

## 2. Health Data Screen

The Health Data screen allows the user to enter the following information:

| Field | Purpose |
|---|---|
| User ID | Identifies the user whose health metrics are being submitted |
| Step Count | Records the user's daily steps |
| Sleep Hours | Records the user's sleep duration |
| Average Heart Rate | Records the user's average heart rate |
| Water Intake | Records daily water consumption |
| Calories Burned | Records estimated calories burned |

The screen provides a simple mobile form so that health information can be entered manually and submitted to the backend service.

---

## 3. API Endpoint

The frontend is prepared to communicate with the backend health metrics endpoint:

```text
POST /api/v1/metrics