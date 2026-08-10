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
    'password123',
    25,
    'Male',
    175.5,
    72.0
);




SELECT * FROM users;

SELECT user_id, full_name, email, firebase_uid
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


SELECT * FROM goals;




INSERT INTO health_data (
    user_id,
    steps,
    heart_rate,
    sleep_hours,
    calories_burned
)
VALUES (
    1,
    8500,
    78,
    7.5,
    520
);


SELECT * FROM health_data;



INSERT INTO dashboard (
    user_id,
    total_steps,
    total_calories,
    average_heart_rate,
    average_sleep_hours
)
VALUES (
    1,
    8500,
    520,
    78,
    7.5
);

SELECT * from dashboard;