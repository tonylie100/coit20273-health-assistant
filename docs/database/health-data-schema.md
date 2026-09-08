# PostgreSQL Health Data Schema

## Overview

The AI-Powered Personal Health Assistant uses PostgreSQL as its primary relational database.

The current database contains the following core tables:

- `users`
- `goals`
- `health_data`
- `dashboard`

These tables support user management, goal tracking, daily health metric ingestion and dashboard aggregation.

---

## 1. Users Table

The `users` table stores user profile information and provides the primary user identifier used by related tables.

### Key Fields

- `user_id` - Primary key.
- `full_name` - User name.
- `email` - Unique user email address.
- `firebase_uid` - Firebase authentication identifier.
- `age`
- `gender`
- `height`
- `weight`
- `created_at`

The `user_id` field is referenced by the goals, health data and dashboard tables.

---

## 2. Goals Table

The `goals` table stores health goals created for each user.

### Key Fields

- `goal_id` - Primary key.
- `user_id` - Foreign key referencing `users(user_id)`.
- `goal_type`
- `target_value`
- `start_date`
- `end_date`
- `status`

The foreign-key relationship uses `ON DELETE CASCADE`, so related goal records are removed if the corresponding user is deleted.

---

## 3. Health Data Table

The `health_data` table stores daily health and wearable-related metrics.

### Key Fields

- `health_data_id` - Primary key.
- `user_id` - Foreign key referencing `users(user_id)`.
- `record_date` - Date of the health record.
- `steps` - Daily step count.
- `heart_rate` - Recorded/average heart rate value.
- `sleep_hours` - Daily sleep duration.
- `calories_burned` - Recorded calories burned.
- `water_intake` - Daily water intake.

The `water_intake` field was added during Report 2 development to support the standardized health metrics API.

The `user_id` foreign key uses `ON DELETE CASCADE`.

---

## 4. Dashboard Table

The `dashboard` table stores summarized health information for each user.

### Key Fields

- `dashboard_id` - Primary key.
- `user_id` - Foreign key referencing `users(user_id)`.
- `total_steps`
- `total_calories`
- `average_heart_rate`
- `average_sleep_hours`
- `last_updated`

The dashboard table supports aggregated presentation of health information in the application interface.

---

## Main Relationships

The database uses `users` as the central parent entity.

- One user can have multiple goals.
- One user can have multiple health data records.
- A dashboard record is associated with a user.

The main relationships are:

`users → goals`

`users → health_data`

`users → dashboard`

---

## Health Metrics API Mapping

The Report 2 API uses standardized snake_case field names while preserving the existing PostgreSQL table structure.

| API Field | PostgreSQL Column |
|---|---|
| `user_id` | `user_id` |
| `step_count` | `steps` |
| `sleep_hours` | `sleep_hours` |
| `heart_rate_avg` | `heart_rate` |
| `water_intake` | `water_intake` |
| `calories_burned` | `calories_burned` |

This mapping allows the API to follow the agreed team interface while retaining compatibility with the existing database schema.