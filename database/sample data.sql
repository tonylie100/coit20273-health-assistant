

INSERT INTO users (
    full_name,
    email,
    firebase_uid,
    age,
    gender,
    height,
    weight
)
VALUES (
    'Nani',
    'Nani@example.com',
    'sample_firebase_uid_001',
    25,
    'Male',
    175.5,
    72.0
);

SELECT *
FROM users;




INSERT INTO goals (
    user_id,
    goal_type,
    target_value,
    start_date,
    end_date
)
VALUES (
    1,
    'Daily Steps',
    10000,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
);

SELECT *
FROM goals;




INSERT INTO health_data (
    user_id,
    record_date,
    steps,
    heart_rate,
    sleep_hours,
    calories_burned,
    water_intake
)
VALUES
(
    1,
    '2026-08-18',
    7200,
    76,
    6.8,
    480,
    1.8
),
(
    1,
    '2026-08-19',
    8500,
    74,
    7.2,
    520,
    2.1
),
(
    1,
    '2026-08-20',
    9100,
    72,
    7.5,
    560,
    2.4
),
(
    1,
    '2026-08-21',
    6800,
    78,
    6.5,
    450,
    1.7
),
(
    1,
    '2026-08-22',
    10000,
    70,
    8.0,
    610,
    2.8
),
(
    1,
    '2026-08-23',
    9400,
    73,
    7.6,
    575,
    2.5
),
(
    1,
    '2026-08-24',
    8800,
    71,
    7.8,
    540,
    2.3
);




SELECT *
FROM health_data
WHERE user_id = 1
ORDER BY record_date;




INSERT INTO dashboard (
    user_id,
    total_steps,
    total_calories,
    average_heart_rate,
    average_sleep_hours
)
VALUES (
    1,
    61800,
    3735,
    73.43,
    7.34
);


SELECT *
FROM dashboard;