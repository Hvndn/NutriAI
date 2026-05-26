package com.nutriai.api.controller;

import com.nutriai.api.dto.HealthLogRequest;
import com.nutriai.api.model.HealthLog;
import com.nutriai.api.model.User;
import com.nutriai.api.service.HealthLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health-logs")
@RequiredArgsConstructor
@Tag(name = "Health Logs & Vitals Manager", description = "Các API theo dõi chỉ số sức khỏe sinh lý (Cân nặng, Nước uống, Bước chân, Giấc ngủ) và tương quan AI.")
public class HealthLogController {

    private final HealthLogService healthLogService;

    @GetMapping("/today")
    @Operation(summary = "Lấy chỉ số sức khỏe của ngày hôm nay")
    public ResponseEntity<HealthLog> getTodayLog(@AuthenticationPrincipal User currentUser) {
        HealthLog log = healthLogService.getTodayLog(currentUser.getId(), currentUser);
        return ResponseEntity.ok(log);
    }

    @PostMapping("/")
    @Operation(summary = "Lưu hoặc cập nhật chỉ số sức khỏe ngày hôm nay")
    public ResponseEntity<HealthLog> saveOrUpdateDailyLog(
            @Valid @RequestBody HealthLogRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        HealthLog updated = healthLogService.saveOrUpdateDailyLog(currentUser.getId(), request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/history")
    @Operation(summary = "Lấy lịch sử chỉ số sức khỏe trong 7 ngày gần đây nhất")
    public ResponseEntity<List<HealthLog>> getHistory7Days(@AuthenticationPrincipal User currentUser) {
        List<HealthLog> history = healthLogService.getHistory7Days(currentUser.getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/ai-correlation")
    @Operation(summary = "Gọi AI phân tích tương quan 7 ngày ăn uống và 7 ngày sinh lý cơ thể")
    public ResponseEntity<Map<String, Object>> getAICorrelation(@AuthenticationPrincipal User currentUser) {
        Map<String, Object> insight = healthLogService.generateAICorrelationInsight(currentUser.getId(), currentUser);
        return ResponseEntity.ok(insight);
    }
}
