# Health Metrics Ingestion API

## Overview

The Health Metrics Ingestion API is responsible for creating and updating daily user health metrics for the AI-Powered Personal Health Assistant. The API is implemented using Node.js and Express and stores health metric records in PostgreSQL.

The official base endpoint is:

`/api/v1/metrics`

The API uses snake_case field names to maintain a consistent interface between the backend, database, recommendation service, and other system components.

---

## 1. Create Daily Health Metrics

### Endpoint

`POST /api/v1/metrics`

### Description

Creates a new daily health metrics record for a user.

### Request Body

```json
{
  "user_id": 2,
  "step_count": 8500,
  "sleep_hours": 7.5,
  "heart_rate_avg": 72,
  "water_intake": 2.5,
  "calories_burned": 2200
}
```

### Successful Response

**HTTP Status:** `201 Created`

Example response:

```json
{
  "message": "Daily health metrics ingested successfully",
  "metrics": {
    "health_data_id": 8,
    "user_id": 2,
    "record_date": "2026-08-24",
    "step_count": 8500,
    "sleep_hours": "7.50",
    "heart_rate_avg": 72,
    "water_intake": "2.50",
    "calories_burned": "2200.00"
  }
}
```

### Input Validation

The endpoint validates incoming health metric values before inserting the record into PostgreSQL.

Validation rules include:

- `user_id` is required.
- `step_count` must be a non-negative number.
- `sleep_hours` must be between 0 and 24.
- `heart_rate_avg` must be a positive number.
- `water_intake` must be a non-negative number.
- `calories_burned` must be a non-negative number.

Invalid input returns:

**HTTP Status:** `400 Bad Request`

Example:

```json
{
  "message": "sleep_hours must be between 0 and 24"
}
```

---

## 2. Update Daily Health Metrics

### Endpoint

`PUT /api/v1/metrics/:id`

### Description

Updates an existing health metrics record using its health data ID. Only the supplied metric fields are updated.

Example endpoint:

`PUT /api/v1/metrics/8`

### Request Body

```json
{
  "step_count": 10000,
  "sleep_hours": 8,
  "heart_rate_avg": 70,
  "water_intake": 3,
  "calories_burned": 2300
}
```

### Successful Response

**HTTP Status:** `200 OK`

Example response:

```json
{
  "message": "Health metrics updated successfully",
  "metrics": {
    "health_data_id": 8,
    "user_id": 2,
    "step_count": 10000,
    "sleep_hours": "8.00",
    "heart_rate_avg": 70,
    "water_intake": "3.00",
    "calories_burned": "2300.00"
  }
}
```

### Update Validation

The update endpoint validates supplied health metric values using the same rules as the ingestion endpoint.

Invalid values return:

**HTTP Status:** `400 Bad Request`

If the requested record does not exist, the endpoint returns:

**HTTP Status:** `404 Not Found`

---

## Database Mapping

The API uses the existing PostgreSQL `health_data` table.

| API Field | PostgreSQL Column |
|---|---|
| `user_id` | `user_id` |
| `step_count` | `steps` |
| `sleep_hours` | `sleep_hours` |
| `heart_rate_avg` | `heart_rate` |
| `water_intake` | `water_intake` |
| `calories_burned` | `calories_burned` |

The mapping preserves the existing database structure while providing the standardized API field names required for system integration.

---

## Technologies

- Node.js
- Express.js
- PostgreSQL
- `pg` PostgreSQL client
- Postman for API testing