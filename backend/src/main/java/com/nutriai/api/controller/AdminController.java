package com.nutriai.api.controller;

import com.nutriai.api.dto.AdminStatsResponse;
import com.nutriai.api.dto.UserDto;
import com.nutriai.api.exception.BadRequestException;
import com.nutriai.api.exception.ResourceNotFoundException;
import com.nutriai.api.model.User;
import com.nutriai.api.repository.UserRepository;
import com.nutriai.api.service.AuthService;
import com.nutriai.api.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Portal", description = "Các API phân tích hệ thống và quản lý tài khoản người dùng của Quản trị viên.")
public class AdminController {

    private final StatsService statsService;
    private final AuthService authService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    @Operation(summary = "Lấy dữ liệu Analytics thống kê tổng quan của toàn bộ hệ thống")
    public ResponseEntity<AdminStatsResponse> getStats() {
        AdminStatsResponse stats = statsService.getAdminStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    @Operation(summary = "Lấy danh sách tất cả các người dùng đăng ký hệ thống")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(authService::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{user_id}/status")
    @Operation(summary = "Mở khóa hoặc Khóa (Block) tài khoản của một người dùng")
    public ResponseEntity<UserDto> toggleUserActiveStatus(
            @PathVariable("user_id") Long userId,
            @RequestParam("is_active") boolean isActive,
            @AuthenticationPrincipal User currentAdmin
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng này"));

        if (user.getId().equals(currentAdmin.getId())) {
            throw new BadRequestException("Bạn không thể tự khóa tài khoản Admin đang sử dụng của chính mình");
        }

        user.setIsActive(isActive);
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(authService.convertToDto(updatedUser));
    }
}
