CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(255) PRIMARY KEY,
    location TEXT,
    description TEXT,
    category VARCHAR(100),
    direction VARCHAR(50),
    route_name VARCHAR(100),
    road_status VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
