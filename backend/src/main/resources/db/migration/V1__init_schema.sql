-- 1. Tạo bảng users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    daily_calorie_goal INTEGER DEFAULT 2000,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 2. Tạo bảng scans
CREATE TABLE scans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    image_url VARCHAR(1000),
    food_name VARCHAR(255) NOT NULL,
    calories DOUBLE PRECISION DEFAULT 0.0,
    carbs DOUBLE PRECISION DEFAULT 0.0,
    protein DOUBLE PRECISION DEFAULT 0.0,
    fat DOUBLE PRECISION DEFAULT 0.0,
    weight_grams DOUBLE PRECISION DEFAULT 100.0,
    health_score INTEGER DEFAULT 5,
    health_advice TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_food_name ON scans(food_name);

-- 3. Tạo bảng food_details (thành phần chi tiết của món ăn)
CREATE TABLE food_details (
    id BIGSERIAL PRIMARY KEY,
    scan_id BIGINT NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    amount VARCHAR(100),
    is_healthy BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_food_details_scan FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
);

CREATE INDEX idx_food_details_scan_id ON food_details(scan_id);

-- 4. Chèn dữ liệu mẫu (Mật khẩu được mã hóa BCrypt bởi Spring BCryptPasswordEncoder)
-- admin@nutriai.com -> admin123 (BCrypt 10 rounds)
-- user@nutriai.com  -> test123  (BCrypt 10 rounds)

INSERT INTO users (email, hashed_password, full_name, is_admin, daily_calorie_goal) VALUES 
('admin@nutriai.com', '$2a$10$DBiM9YJ.XUT8xDT6T9IU5eqs4Rp0d3fiTtmIKep2sIVjNrSroMr1S', 'System Administrator', TRUE, 2200),
('user@nutriai.com', '$2a$10$y4kdatm2/mtuvKRRxfpB.OaPUX75PdvCMqwWe4Qbbtn6X7OmB6Kyi', 'Premium Health User', FALSE, 2000);
