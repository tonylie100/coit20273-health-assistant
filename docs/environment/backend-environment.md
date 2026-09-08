# Backend Environment and Server Configuration

## Overview

The backend of the AI-Powered Personal Health Assistant is implemented using Node.js and Express.js. The server acts as the API gateway between the mobile application, PostgreSQL database, authentication services, health metrics APIs, dashboard services and chatbot/AI integration.

The backend runs locally on port `3000`.

---

## Environment Variable Configuration

The project uses the `dotenv` package to load environment variables from a local `.env` file.

The server starts with:

```js
require('dotenv').config();
```

Environment variables are used to store sensitive configuration such as database credentials and the external LLM API key.

The `.env` file is excluded from GitHub through `.gitignore` so that credentials and API keys are not committed to the public repository.

---

## Express Server

The Express application is initialized using:

```js
const express = require('express');
const app = express();
```

The server listens on:

```text
http://localhost:3000
```

JSON request bodies are enabled using:

```js
app.use(express.json());
```

---

## CORS Configuration

Cross-Origin Resource Sharing is enabled using the `cors` package:

```js
const cors = require('cors');
app.use(cors());
```

This allows the React Native/Expo client and other approved development clients to communicate with the Express backend during development and integration testing.

---

## Registered API Routes

The server currently registers the following routes:

| Route | Purpose |
|---|---|
| `/api/auth` | Authentication |
| `/api/profile` | User profile management |
| `/api/goals` | Health goal management |
| `/api/health-data` | Existing wearable/health data API |
| `/api/dashboard` | Dashboard data |
| `/api/chatbot` | Chatbot / AI backend integration |
| `/api/v1/metrics` | Official Report 2 health metrics ingestion and update API |

The official Report 2 health metrics API is exposed through:

`/api/v1/metrics`

---

## Database Connection Test

The server includes a database test endpoint:

`GET /database-test`

This endpoint executes:

```sql
SELECT NOW();
```

against PostgreSQL.

A successful response confirms that the Express backend can connect to the `health_assistant` PostgreSQL database.

Example response:

```json
{
  "message": "PostgreSQL connection successful",
  "databaseTime": "..."
}
```

---

## Security and Configuration Practices

The backend uses environment variables for sensitive configuration instead of hard-coding credentials in source files.

The following items are excluded from Git:

- `.env`
- `node_modules/`
- `firebase-service-account.json`

This reduces the risk of exposing database passwords, API keys and authentication configuration in the public GitHub repository.