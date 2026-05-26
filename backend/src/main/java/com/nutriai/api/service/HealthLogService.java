package com.nutriai.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutriai.api.dto.HealthLogRequest;
import com.nutriai.api.model.HealthLog;
import com.nutriai.api.model.Scan;
import com.nutriai.api.model.User;
import com.nutriai.api.repository.HealthLogRepository;
import com.nutriai.api.repository.ScanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthLogService {

    private final HealthLogRepository healthLogRepository;
    private final ScanRepository scanRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public HealthLog getTodayLog(Long userId, User user) {
        LocalDate today = LocalDate.now();
        return healthLogRepository.findByUserIdAndLogDate(userId, today)
                .orElseGet(() -> HealthLog.builder()
                        .user(user)
                        .logDate(today)
                        .waterMl(0)
                        .steps(0)
                        .sleepHours(0.0)
                        .build());
    }

    @Transactional
    public HealthLog saveOrUpdateDailyLog(Long userId, HealthLogRequest request, User user) {
        LocalDate today = LocalDate.now();
        Optional<HealthLog> existing = healthLogRepository.findByUserIdAndLogDate(userId, today);
        
        HealthLog logEntry;
        if (existing.isPresent()) {
            logEntry = existing.get();
            if (request.getWeight() != null) {
                logEntry.setWeight(request.getWeight());
            }
            if (request.getWaterMl() != null) {
                logEntry.setWaterMl(request.getWaterMl());
            }
            if (request.getSteps() != null) {
                logEntry.setSteps(request.getSteps());
            }
            if (request.getSleepHours() != null) {
                logEntry.setSleepHours(request.getSleepHours());
            }
        } else {
            logEntry = HealthLog.builder()
                    .user(user)
                    .logDate(today)
                    .weight(request.getWeight())
                    .waterMl(request.getWaterMl() != null ? request.getWaterMl() : 0)
                    .steps(request.getSteps() != null ? request.getSteps() : 0)
                    .sleepHours(request.getSleepHours() != null ? request.getSleepHours() : 0.0)
                    .build();
        }

        return healthLogRepository.save(logEntry);
    }

    @Transactional(readOnly = true)
    public List<HealthLog> getHistory7Days(Long userId) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);
        return healthLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(userId, start, end);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> generateAICorrelationInsight(Long userId, User user) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);
        
        // 1. Lấy lịch sử ăn uống 7 ngày qua
        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(LocalTime.MAX);
        List<Scan> scans = scanRepository.findByUserIdAndCreatedAtBetween(userId, startDateTime, endDateTime);
        
        // 2. Lấy lịch sử sinh lý 7 ngày qua
        List<HealthLog> logs = healthLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(userId, start, end);
        
        String foodHistoryJson = "[]";
        String healthHistoryJson = "[]";
        try {
            // Giản lược dữ liệu ăn uống để giảm tải token cho AI
            List<Map<String, Object>> mappedScans = scans.stream().map(s -> Map.<String, Object>of(
                "date", s.getCreatedAt().toLocalDate().toString(),
                "food_name", s.getFoodName(),
                "calories", s.getCalories(),
                "protein", s.getProtein(),
                "carbs", s.getCarbs(),
                "fat", s.getFat()
            )).toList();
            foodHistoryJson = objectMapper.writeValueAsString(mappedScans);

            // Giản lược dữ liệu sinh lý
            List<Map<String, Object>> mappedLogs = logs.stream().map(l -> Map.<String, Object>of(
                "date", l.getLogDate().toString(),
                "weight", l.getWeight() != null ? l.getWeight() : 0.0,
                "water_ml", l.getWaterMl(),
                "steps", l.getSteps(),
                "sleep_hours", l.getSleepHours()
            )).toList();
            healthHistoryJson = objectMapper.writeValueAsString(mappedLogs);
        } catch (Exception e) {
            log.error("Lỗi parse JSON lịch sử dinh dưỡng & sinh lý: ", e);
        }

        return aiService.generateCorrelationInsight(foodHistoryJson, healthHistoryJson);
    }
}
