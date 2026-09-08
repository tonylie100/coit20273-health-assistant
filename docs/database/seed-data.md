# Health Metrics Seed Data

## Overview

A seed data script was created for the AI-Powered Personal Health Assistant to provide realistic test data for backend development, database verification, API testing and system integration.

The seed script is stored in:

`database/sample data.sql`

The script contains sample user, health goal, health metrics and dashboard data.

## Seven-Day Health Metrics Dataset

Seven days of health metric records were created for testing the `health_data` table.

The test dataset contains the following health measurements:

- Daily step count
- Heart rate
- Sleep hours
- Calories burned
- Water intake

The seven-day dataset covers records from 18 August 2026 to 24 August 2026.

## Purpose of the Seed Data

The seed dataset supports:

- PostgreSQL database testing
- Health metrics API development
- Postman API testing
- Dashboard development
- Recommendation and AI integration testing
- End-to-end system integration
- Verification of health metric trends across multiple days

## Database Fields

The seed data populates the following `health_data` columns:

| Field | Description |
|---|---|
| `user_id` | Identifies the user associated with the health record |
| `record_date` | Date of the daily health record |
| `steps` | Daily step count |
| `heart_rate` | Heart-rate value |
| `sleep_hours` | Number of hours slept |
| `calories_burned` | Daily calories burned |
| `water_intake` | Daily water consumption |

## Verification

The seed data was executed and verified using pgAdmin.

The following SQL query was used to retrieve the user's health records:

```sql
SELECT *
FROM health_data
WHERE user_id = 1
ORDER BY record_date;
```

The query confirmed that the seven-day health metric dataset was successfully stored in PostgreSQL with values for steps, heart rate, sleep hours, calories burned and water intake.

## Report 2 Evidence

A pgAdmin screenshot showing the stored health records is retained as testing evidence for the Database and Core Infrastructure section of Progress Report 2.