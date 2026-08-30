# System Architecture Documentation

## 1. Architecture Overview

The AI-Powered Personal Health Assistant follows a layered architecture that separates the mobile user interface, backend application services, and data and AI services.

The main technology stack consists of React Native with Expo for the mobile application, Node.js with Express for backend API services, PostgreSQL for persistent data storage, Firebase Authentication for user authentication, and AI services for personalised health recommendations and chatbot functionality.

## 2. Presentation Layer

The presentation layer is implemented using React Native and Expo.

This layer provides the mobile interfaces through which users can manage their profile and health goals, view health information and dashboard data, and interact with other health assistant features.

The mobile application communicates with backend services through REST API requests.

## 3. Application / API Layer

The application layer is implemented using Node.js and Express.

Express acts as the API gateway between the mobile application and backend services. The backend contains routes supporting authentication, user profiles, health goals, health data, dashboard functionality, health metrics, and chatbot-related functionality.

Sakshi's Health Metrics subsystem is exposed through the following REST endpoints:

- POST `/api/v1/metrics` – creates daily health metric records.
- PUT `/api/v1/metrics/:id` – updates an existing health metric record.

Input validation is performed before valid health metric data is stored in PostgreSQL.

## 4. Data Layer

PostgreSQL is used as the relational database for the application.

The database stores structured information including users, health goals, health data, and dashboard-related information.

The `health_data` table supports wearable-style health metrics including steps, heart rate, sleep hours, calories burned, and water intake.

Foreign-key relationships associate health records and goals with individual users.

## 5. Authentication and AI Services

Firebase Authentication supports user authentication and identity management.

AI/LLM services form part of the wider team architecture for personalised recommendation and chatbot functionality. These services are separate from the Health Metrics ingestion subsystem and are integrated through backend services.

## 6. Sakshi's Subsystem within the Architecture

Sakshi's main technical contribution is positioned between the mobile application and PostgreSQL data layer.

The health-data flow is:

Mobile Application  
→ Express REST API  
→ Health Metrics Validation  
→ POST `/api/v1/metrics` or PUT `/api/v1/metrics/:id`  
→ PostgreSQL `health_data` table

This architecture separates the user interface from direct database access and ensures that health information is validated through the backend API before being stored.