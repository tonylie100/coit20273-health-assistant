CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    firebase_uid VARCHAR(128) UNIQUE,,
    age INT,
    gender VARCHAR(20),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE goals (
    goal_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    goal_type VARCHAR(50),
    target_value DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'Active',

    CONSTRAINT fk_goal_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);







CREATE TABLE health_data (
    health_data_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    record_date DATE DEFAULT CURRENT_DATE,
    steps INT,
    heart_rate INT,
    sleep_hours DECIMAL(4,2),
    calories_burned DECIMAL(6,2),

    CONSTRAINT fk_health_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);







CREATE TABLE dashboard (
    dashboard_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    total_steps INT DEFAULT 0,
    total_calories DECIMAL(8,2) DEFAULT 0,
    average_heart_rate DECIMAL(5,2),
    average_sleep_hours DECIMAL(4,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dashboard_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);