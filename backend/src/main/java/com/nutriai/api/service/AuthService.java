package com.nutriai.api.service;

import com.nutriai.api.config.JwtTokenProvider;
import com.nutriai.api.dto.AuthRequest;
import com.nutriai.api.dto.AuthResponse;
import com.nutriai.api.dto.RegisterRequest;
import com.nutriai.api.dto.UserDto;
import com.nutriai.api.exception.BadRequestException;
import com.nutriai.api.exception.ResourceNotFoundException;
import com.nutriai.api.model.User;
import com.nutriai.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Email hoặc mật khẩu không chính xác"));

        if (!user.getIsActive()) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa bởi quản trị viên");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getHashedPassword())) {
            throw new BadCredentialsException("Email hoặc mật khẩu không chính xác");
        }

        String token = tokenProvider.generateToken(user.getEmail());
        UserDto userDto = convertToDto(user);

        return new AuthResponse(token, userDto);
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng trên hệ thống");
        }

        User user = User.builder()
                .email(request.getEmail())
                .hashedPassword(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .dailyCalorieGoal(request.getDailyCalorieGoal())
                .isActive(true)
                .isAdmin(false)
                .build();

        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    @Transactional(readOnly = true)
    public UserDto getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng"));
        return convertToDto(user);
    }

    @Transactional
    public UserDto updateMe(String email, Integer dailyCalorieGoal) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin người dùng"));
        
        user.setDailyCalorieGoal(dailyCalorieGoal);
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    public UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .dailyCalorieGoal(user.getDailyCalorieGoal())
                .isAdmin(user.getIsAdmin())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
