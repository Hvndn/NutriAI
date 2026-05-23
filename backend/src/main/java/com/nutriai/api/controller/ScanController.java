package com.nutriai.api.controller;

import com.nutriai.api.dto.DailyTrackerResponse;
import com.nutriai.api.dto.FoodDetailDto;
import com.nutriai.api.dto.ScanDto;
import com.nutriai.api.dto.ScanUpdateRequest;
import com.nutriai.api.model.User;
import com.nutriai.api.service.AiService;
import com.nutriai.api.service.ScanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scans")
@RequiredArgsConstructor
@Tag(name = "AI Nutrition Scanner", description = "Các API quét thực phẩm bằng AI và OCR bao bì.")
public class ScanController {

    private final ScanService scanService;
    private final AiService aiService;

    @PostMapping(value = "/analyze", consumes = "multipart/form-data")
    @Operation(summary = "Quét phân tích món ảnh và lưu trữ lịch sử")
    public ResponseEntity<ScanDto> analyzeFood(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser
    ) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        ScanDto result = scanService.analyzeAndSaveFood(
                file.getBytes(),
                file.getOriginalFilename(),
                file.getContentType(),
                currentUser
        );
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PostMapping(value = "/ocr", consumes = "multipart/form-data")
    @Operation(summary = "Quét OCR nhãn sản phẩm và phân tích dinh dưỡng bao bì")
    public ResponseEntity<Map<String, Object>> analyzeOcr(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Map<String, Object> result = aiService.analyzeProductPackaging(
                file.getBytes(),
                file.getOriginalFilename(),
                file.getContentType()
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/daily-tracker")
    @Operation(summary = "Lấy tổng năng lượng calories tích lũy trong ngày hôm nay")
    public ResponseEntity<DailyTrackerResponse> getDailyTracker(@AuthenticationPrincipal User currentUser) {
        DailyTrackerResponse tracker = scanService.getDailyTracker(currentUser.getId(), currentUser);
        return ResponseEntity.ok(tracker);
    }

    @GetMapping("/")
    @Operation(summary = "Lấy lịch sử tất cả các lượt quét món ăn của người dùng hiện tại")
    public ResponseEntity<List<ScanDto>> getHistory(
            @RequestParam(value = "search", required = false) String search,
            @AuthenticationPrincipal User currentUser
    ) {
        List<ScanDto> history = scanService.getScansHistory(currentUser.getId(), search);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết một lượt quét")
    public ResponseEntity<ScanDto> getScanDetail(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        ScanDto detail = scanService.getScanDetail(id, currentUser.getId());
        return ResponseEntity.ok(detail);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Chỉnh sửa thủ công chỉ số dinh dưỡng món ăn đã quét")
    public ResponseEntity<ScanDto> updateScan(
            @PathVariable("id") Long id,
            @Valid @RequestBody ScanUpdateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        ScanDto updated = scanService.updateScan(id, currentUser.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa lượt quét khỏi lịch sử")
    public ResponseEntity<Map<String, String>> deleteScan(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        scanService.deleteScan(id, currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Đã xóa lịch sử quét thực phẩm thành công."));
    }

    @PostMapping("/{id}/ingredients")
    @Operation(summary = "Thêm thủ công một nguyên liệu mới vào đĩa thức ăn đã quét")
    public ResponseEntity<FoodDetailDto> addIngredient(
            @PathVariable("id") Long id,
            @Valid @RequestBody FoodDetailDto request,
            @AuthenticationPrincipal User currentUser
    ) {
        FoodDetailDto savedIng = scanService.addIngredient(id, currentUser.getId(), request);
        return new ResponseEntity<>(savedIng, HttpStatus.CREATED);
    }
}
