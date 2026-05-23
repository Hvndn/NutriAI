package com.nutriai.api.service;

import com.nutriai.api.dto.DailyTrackerResponse;
import com.nutriai.api.dto.FoodDetailDto;
import com.nutriai.api.dto.ScanDto;
import com.nutriai.api.dto.ScanUpdateRequest;
import com.nutriai.api.exception.ResourceNotFoundException;
import com.nutriai.api.model.FoodDetail;
import com.nutriai.api.model.Scan;
import com.nutriai.api.model.User;
import com.nutriai.api.repository.FoodDetailRepository;
import com.nutriai.api.repository.ScanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScanService {

    private final ScanRepository scanRepository;
    private final FoodDetailRepository foodDetailRepository;
    private final AiService aiService;

    @Transactional
    public ScanDto analyzeAndSaveFood(byte[] imageBytes, String filename, String mimeType, User user) {
        // Phân tích hình ảnh bằng AI Service
        Map<String, Object> aiResult = aiService.analyzeFoodImage(imageBytes, filename, mimeType);

        // Lưu ảnh vật lý và sinh URL động
        String imageUrl = "";
        try {
            // Đảm bảo thư mục uploads tồn tại
            java.io.File uploadDir = new java.io.File("uploads");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            // Lấy extension của file hoặc mặc định là jpg
            String extension = "jpg";
            if (org.springframework.util.StringUtils.hasText(filename) && filename.contains(".")) {
                extension = filename.substring(filename.lastIndexOf(".") + 1);
            }
            
            String uniqueFilename = java.util.UUID.randomUUID().toString() + "." + extension;
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads", uniqueFilename);
            java.nio.file.Files.write(filePath, imageBytes);
            
            // URL trả về để Next.js load trực tiếp từ Backend
            // Ở môi trường docker, backend được map port 8000
            imageUrl = "http://localhost:8000/uploads/" + uniqueFilename;
            log.info("Đã lưu ảnh món ăn thành công: {}", imageUrl);
        } catch (Exception e) {
            log.error("Không thể lưu ảnh vật lý, fallback về ảnh demo: {}", e.getMessage());
            // Fallback về ảnh demo như cũ
            String filenameLower = filename != null ? filename.toLowerCase() : "";
            imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"; // Salad mặc định
            if (filenameLower.contains("pho") || filenameLower.contains("noodle")) {
                imageUrl = "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80"; // Phở
            } else if (filenameLower.contains("burger")) {
                imageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"; // Burger
            } else if (filenameLower.contains("salad")) {
                imageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80"; // Salad
            }
        }

        // Tạo thực thể Scan
        Scan scan = Scan.builder()
                .user(user)
                .imageUrl(imageUrl)
                .foodName((String) aiResult.getOrDefault("food_name", "Món ăn chưa xác định"))
                .calories(getDoubleValue(aiResult.get("calories")))
                .carbs(getDoubleValue(aiResult.get("carbs")))
                .protein(getDoubleValue(aiResult.get("protein")))
                .fat(getDoubleValue(aiResult.get("fat")))
                .weightGrams(getDoubleValue(aiResult.get("weight_grams")))
                .healthScore((Integer) aiResult.getOrDefault("health_score", 5))
                .healthAdvice((String) aiResult.getOrDefault("health_advice", ""))
                .build();

        Scan savedScan = scanRepository.save(scan);

        // Lưu các thành phần chi tiết (ingredients) vào CSDL
        List<Map<String, Object>> ingredientsList = (List<Map<String, Object>>) aiResult.get("ingredients");
        if (ingredientsList != null) {
            for (Map<String, Object> ing : ingredientsList) {
                FoodDetail detail = FoodDetail.builder()
                        .scan(savedScan)
                        .ingredientName((String) ing.get("ingredient_name"))
                        .amount((String) ing.get("amount"))
                        .isHealthy((Boolean) ing.getOrDefault("is_healthy", true))
                        .build();
                foodDetailRepository.save(detail);
                savedScan.getIngredients().add(detail);
            }
        }

        return convertToDto(savedScan);
    }

    @Transactional(readOnly = true)
    public List<ScanDto> getScansHistory(Long userId, String search) {
        List<Scan> scans;
        if (StringUtils.hasText(search)) {
            scans = scanRepository.findByUserIdAndFoodNameContainingIgnoreCaseOrderByCreatedAtDesc(userId, search);
        } else {
            scans = scanRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return scans.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DailyTrackerResponse getDailyTracker(Long userId, User user) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        List<Scan> todayScans = scanRepository.findByUserIdAndCreatedAtBetween(userId, startOfDay, endOfDay);

        double caloriesConsumed = todayScans.stream().mapToDouble(Scan::getCalories).sum();
        double proteinGrams = todayScans.stream().mapToDouble(Scan::getProtein).sum();
        double carbsGrams = todayScans.stream().mapToDouble(Scan::getCarbs).sum();
        double fatGrams = todayScans.stream().mapToDouble(Scan::getFat).sum();

        double caloriesGoal = user.getDailyCalorieGoal().doubleValue();
        double remainingCalories = Math.max(0.0, caloriesGoal - caloriesConsumed);

        return DailyTrackerResponse.builder()
                .date(today.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                .caloriesConsumed(caloriesConsumed)
                .caloriesGoal(caloriesGoal)
                .remainingCalories(remainingCalories)
                .proteinGrams(proteinGrams)
                .carbsGrams(carbsGrams)
                .fatGrams(fatGrams)
                .scansCount(todayScans.size())
                .build();
    }

    @Transactional(readOnly = true)
    public ScanDto getScanDetail(Long id, Long userId) {
        Scan scan = scanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt quét thực phẩm này"));
        return convertToDto(scan);
    }

    @Transactional
    public void deleteScan(Long id, Long userId) {
        Scan scan = scanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt quét thực phẩm cần xóa"));
        scanRepository.delete(scan);
    }

    @Transactional
    public ScanDto updateScan(Long id, Long userId, ScanUpdateRequest request) {
        Scan scan = scanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt quét thực phẩm cần chỉnh sửa"));

        scan.setFoodName(request.getFoodName());
        scan.setCalories(request.getCalories());
        scan.setCarbs(request.getCarbs());
        scan.setProtein(request.getProtein());
        scan.setFat(request.getFat());
        scan.setWeightGrams(request.getWeightGrams());
        scan.setHealthScore(request.getHealthScore());
        scan.setHealthAdvice(request.getHealthAdvice());

        Scan updatedScan = scanRepository.save(scan);
        return convertToDto(updatedScan);
    }

    @Transactional
    public FoodDetailDto addIngredient(Long scanId, Long userId, FoodDetailDto request) {
        Scan scan = scanRepository.findByIdAndUserId(scanId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lượt quét thực phẩm"));

        FoodDetail detail = FoodDetail.builder()
                .scan(scan)
                .ingredientName(request.getIngredientName())
                .amount(request.getAmount())
                .isHealthy(request.getIsHealthy() != null ? request.getIsHealthy() : true)
                .build();

        FoodDetail savedDetail = foodDetailRepository.save(detail);
        
        return FoodDetailDto.builder()
                .id(savedDetail.getId())
                .ingredientName(savedDetail.getIngredientName())
                .amount(savedDetail.getAmount())
                .isHealthy(savedDetail.getIsHealthy())
                .build();
    }

    public ScanDto convertToDto(Scan scan) {
        List<FoodDetailDto> ingDtos = scan.getIngredients().stream()
                .map(ing -> FoodDetailDto.builder()
                        .id(ing.getId())
                        .ingredientName(ing.getIngredientName())
                        .amount(ing.getAmount())
                        .isHealthy(ing.getIsHealthy())
                        .build())
                .collect(Collectors.toList());

        return ScanDto.builder()
                .id(scan.getId())
                .userId(scan.getUser().getId())
                .imageUrl(scan.getImageUrl())
                .foodName(scan.getFoodName())
                .calories(scan.getCalories())
                .carbs(scan.getCarbs())
                .protein(scan.getProtein())
                .fat(scan.getFat())
                .weightGrams(scan.getWeightGrams())
                .healthScore(scan.getHealthScore())
                .healthAdvice(scan.getHealthAdvice())
                .createdAt(scan.getCreatedAt())
                .ingredients(ingDtos)
                .build();
    }

    private Double getDoubleValue(Object val) {
        if (val == null) return 0.0;
        if (val instanceof Number) {
            return ((Number) val).doubleValue();
        }
        try {
            return Double.parseDouble(val.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }
}
