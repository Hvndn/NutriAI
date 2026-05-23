package com.nutriai.api.controller;

import com.nutriai.api.dto.AuthRequest;
import com.nutriai.api.dto.AuthResponse;
import com.nutriai.api.dto.RegisterRequest;
import com.nutriai.api.dto.UserDto;
import com.nutriai.api.model.User;
import com.nutriai.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth Portal", description = "Các API xác thực, đăng nhập và đăng ký.")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký người dùng mới")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest request) {
        UserDto registeredUser = authService.register(request);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập nhận JWT Token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin cá nhân của người dùng hiện tại")
    public ResponseEntity<UserDto> getMe(@AuthenticationPrincipal User currentUser) {
        UserDto me = authService.getMe(currentUser.getEmail());
        return ResponseEntity.ok(me);
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật hạn mức Calories hàng ngày")
    public ResponseEntity<UserDto> updateMe(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, Integer> body
    ) {
        Integer dailyCalorieGoal = body.get("daily_calorie_goal");
        if (dailyCalorieGoal == null || dailyCalorieGoal <= 0) {
            dailyCalorieGoal = 2000;
        }
        UserDto updatedMe = authService.updateMe(currentUser.getEmail(), dailyCalorieGoal);
        return ResponseEntity.ok(updatedMe);
    }
}
