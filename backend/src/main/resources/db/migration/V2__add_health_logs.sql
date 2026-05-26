-- 1. Tạo bảng health_logs
CREATE TABLE health_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    weight DOUBLE PRECISION,
    water_ml INTEGER DEFAULT 0,
    steps INTEGER DEFAULT 0,
    sleep_hours DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_health_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_log_date UNIQUE (user_id, log_date)
);

-- 2. Tạo chỉ mục tối ưu hóa tìm kiếm nhanh theo user và ngày ghi nhận
CREATE INDEX idx_health_logs_user_date ON health_logs(user_id, log_date);
