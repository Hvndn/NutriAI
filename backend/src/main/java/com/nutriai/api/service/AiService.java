package com.nutriai.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Phân tích ảnh món ăn bằng Gemini Vision API
     */
    public Map<String, Object> analyzeFoodImage(byte[] imageBytes, String filename, String mimeType) {
        if (!StringUtils.hasText(geminiApiKey)) {
            log.warn("GEMINI_API_KEY is not configured! Falling back to Smart Mock Data.");
            return getMockNutrition(filename);
        }

        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        String cleanMimeType = validateMimeType(mimeType);

        String prompt = """
            You are an expert AI Nutritionist. Analyze this food image and estimate its nutritional values.
            IMPORTANT: Your response MUST be a VALID raw JSON object ONLY, with no markdown formatting blocks,
            no ```json wrapper, no explanation, no text outside the JSON structure.
            The JSON must have the following structure EXACTLY:
            {
              "food_name": "Name of the food in Vietnamese",
              "calories": 350.0,
              "carbs": 45.0,
              "protein": 22.0,
              "fat": 10.0,
              "weight_grams": 400.0,
              "health_score": 7,
              "health_advice": "Vietnamese healthy rating advice starting with a heart (❤️) or warning (⚠️) sign and detailed reasons",
              "ingredients": [
                {"ingredient_name": "Tên nguyên liệu", "amount": "Khối lượng hoặc lượng dùng", "is_healthy": true},
                ...
              ]
            }
            """;

        return callGemini(base64Image, cleanMimeType, prompt, () -> getMockNutrition(filename));
    }

    /**
     * Quét OCR và đánh giá bao bì sản phẩm bằng Gemini Vision API
     */
    public Map<String, Object> analyzeProductPackaging(byte[] imageBytes, String filename, String mimeType) {
        if (!StringUtils.hasText(geminiApiKey)) {
            log.warn("GEMINI_API_KEY is not configured! Falling back to Smart Packaging OCR Mock Data.");
            return getMockOcr(filename);
        }

        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        String cleanMimeType = validateMimeType(mimeType);

        String prompt = """
            You are an expert OCR and Food Packaging Specialist. Analyze the provided image of a food product packaging (ingredients list, nutrition facts table, or labels).
            Extract all textual information and structure it into a clean JSON object ONLY, with no markdown wrappers.
            The JSON must have the following structure EXACTLY:
            {
              "product_name": "Name of the product if detected (in Vietnamese or English)",
              "extracted_text": "Full raw extracted text from the packaging",
              "ingredients": ["Ingredient 1", "Ingredient 2", ...],
              "nutrition_facts": {
                "serving_size": "Serving size if found",
                "calories_per_serving": "Calories per serving if found",
                "macros": {
                  "carbs": "Carbohydrates amount",
                  "protein": "Protein amount",
                  "fat": "Fat amount"
                }
              },
              "allergens": ["Allergen 1", ...],
              "health_rating_advice": "Vietnamese healthy rating advice starting with a heart (❤️) or warning (⚠️) sign, explaining how healthy this packaged food is."
            }
            """;

        return callGemini(base64Image, cleanMimeType, prompt, () -> getMockOcr(filename));
    }

    private Map<String, Object> callGemini(String base64Image, String mimeType, String prompt, java.util.function.Supplier<Map<String, Object>> fallbackSupplier) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + geminiApiKey;

        // Xây dựng JSON payload
        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mimeType", mimeType);
        inlineData.put("data", base64Image);

        Map<String, Object> inlinePart = new HashMap<>();
        inlinePart.put("inlineData", inlineData);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        List<Map<String, Object>> parts = Arrays.asList(textPart, inlinePart);

        Map<String, Object> contentsObject = new HashMap<>();
        contentsObject.put("parts", parts);

        List<Map<String, Object>> contents = Collections.singletonList(contentsObject);

        Map<String, Object> responseMimeType = new HashMap<>();
        responseMimeType.put("responseMimeType", "application/json");

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", contents);
        payload.put("generationConfig", responseMimeType);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                String responseText = rootNode.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText()
                        .trim();

                // Dọn dẹp markdown code blocks ```json ... ```
                responseText = responseText.replaceAll("^```json\\s*", "");
                responseText = responseText.replaceAll("\\s*```$", "");

                return objectMapper.readValue(responseText, new TypeReference<Map<String, Object>>() {});
            } else {
                log.error("Gemini API call failed with status: " + response.getStatusCode());
                return fallbackSupplier.get();
            }
        } catch (Exception e) {
            log.error("Exception during Gemini API call: ", e);
            return fallbackSupplier.get();
        }
    }

    private String validateMimeType(String mimeType) {
        if (!StringUtils.hasText(mimeType)) return "image/jpeg";
        String lower = mimeType.toLowerCase();
        if (lower.contains("png")) return "image/png";
        if (lower.contains("webp")) return "image/webp";
        if (lower.contains("heic")) return "image/heic";
        if (lower.contains("heif")) return "image/heif";
        return "image/jpeg";
    }

    /**
     * Mock dinh dưỡng thông minh
     */
    public Map<String, Object> getMockNutrition(String filename) {
        String name = filename != null ? filename.toLowerCase() : "";
        Map<String, Object> mock = new HashMap<>();

        if (name.contains("pho") || name.contains("noodle")) {
            mock.put("food_name", "Phở Bò Việt Nam");
            mock.put("calories", 450.0);
            mock.put("carbs", 55.0);
            mock.put("protein", 28.0);
            mock.put("fat", 13.0);
            mock.put("weight_grams", 450.0);
            mock.put("health_score", 7);
            mock.put("health_advice", "❤️ Món ăn truyền thống giàu dinh dưỡng, cung cấp lượng đạm chất lượng cao từ thịt bò và tinh bột nhanh từ bánh phở. Lời khuyên: Hạn chế húp quá nhiều nước lèo vì chứa nhiều mỡ hành và cholesterol cao từ mỡ bò.");
            mock.put("ingredients", Arrays.asList(
                createIngredientMap("Bánh phở tươi", "200g", true),
                createIngredientMap("Thịt bò nạc thái lát", "80g", true),
                createIngredientMap("Nước lèo ninh xương bò", "150ml", false),
                createIngredientMap("Rau hành & Giá đỗ", "30g", true)
            ));
        } else if (name.contains("salad") || name.contains("vegetable")) {
            mock.put("food_name", "Salad Ức Gà Sốt Mè Rang");
            mock.put("calories", 280.0);
            mock.put("carbs", 12.0);
            mock.put("protein", 24.0);
            mock.put("fat", 15.0);
            mock.put("weight_grams", 250.0);
            mock.put("health_score", 9);
            mock.put("health_advice", "❤️ Lựa chọn tuyệt vời cho người giảm cân hoặc duy trì vóc dáng! Ức gà cung cấp protein tinh khiết xây dựng cơ bắp, rau xanh giàu chất xơ giúp no lâu. Lời khuyên: Hạn chế rưới quá nhiều sốt mè rang béo ngậy để kiểm soát calo.");
            mock.put("ingredients", Arrays.asList(
                createIngredientMap("Ức gà xé phay", "100g", true),
                createIngredientMap("Rau xà lách & Cà chua bi", "120g", true),
                createIngredientMap("Sốt mè rang Kewpie", "1.5 muỗng", false),
                createIngredientMap("Hạt hạnh nhân lát", "10g", true)
            ));
        } else if (name.contains("burger") || name.contains("pizza") || name.contains("fast")) {
            mock.put("food_name", "Double Cheese Burger");
            mock.put("calories", 620.0);
            mock.put("carbs", 48.0);
            mock.put("protein", 32.0);
            mock.put("fat", 34.0);
            mock.put("weight_grams", 220.0);
            mock.put("health_score", 4);
            mock.put("health_advice", "⚠️ Hàm lượng chất béo bão hòa và tinh bột tinh chế cao. Dễ gây đầy hơi và dư thừa calo nếu tiêu thụ thường xuyên. Lời khuyên: Nên ăn kèm một đĩa salad xanh không sốt và uống nước lọc thay vì nước ngọt.");
            mock.put("ingredients", Arrays.asList(
                createIngredientMap("Bánh mì hamburger", "1 chiếc", false),
                createIngredientMap("Bò viên nướng", "120g", true),
                createIngredientMap("Phô mai Cheddar", "2 lát", false),
                createIngredientMap("Sốt béo mayonnaise", "15g", false)
            ));
        } else {
            // Mặc định Cơm tấm
            mock.put("food_name", "Cơm Tấm Sườn Nướng Trứng Ốp La");
            mock.put("calories", 710.0);
            mock.put("carbs", 78.0);
            mock.put("protein", 36.0);
            mock.put("fat", 28.0);
            mock.put("weight_grams", 380.0);
            mock.put("health_score", 5);
            mock.put("health_advice", "⚠️ Cung cấp nguồn năng lượng khổng lồ. Tuy nhiên tỉ lệ tinh bột tinh chế từ cơm gạo tấm và chất béo bão hòa khá cao. Lời khuyên: Yêu cầu giảm cơm trắng, thêm dưa leo cà chua, hạn chế rưới quá nhiều mỡ hành.");
            mock.put("ingredients", Arrays.asList(
                createIngredientMap("Cơm tấm trắng", "200g", false),
                createIngredientMap("Sườn sụn heo nướng mật ong", "120g", true),
                createIngredientMap("Trứng ốp la", "1 quả", true),
                createIngredientMap("Mỡ hành & Nước mắm ngọt", "30ml", false)
            ));
        }
        return mock;
    }

    /**
     * Mock OCR bao bì sản phẩm thông minh
     */
    public Map<String, Object> getMockOcr(String filename) {
        String name = filename != null ? filename.toLowerCase() : "";
        Map<String, Object> mock = new HashMap<>();

        if (name.contains("milk") || name.contains("sua")) {
            mock.put("product_name", "Sữa Tươi Tiệt Trùng TH True Milk Ít Đường");
            mock.put("extracted_text", "THÀNH PHẦN DINH DƯỠNG TRONG 100ml: Năng lượng 68 kcal, Chất béo 3.2g, Chất đạm 2.9g, Hydrat cacbon 7.0g. Thành phần: Sữa hoàn toàn từ sữa bò tươi (97%), đường...");
            mock.put("ingredients", Arrays.asList("Sữa bò tươi nguyên chất", "Đường", "Vitamin D3", "Vitamin A"));
            
            Map<String, Object> macros = new HashMap<>();
            macros.put("carbs", "7.0g");
            macros.put("protein", "2.9g");
            macros.put("fat", "3.2g");

            Map<String, Object> facts = new HashMap<>();
            facts.put("serving_size", "100ml");
            facts.put("calories_per_serving", "68 kcal");
            facts.put("macros", macros);

            mock.put("nutrition_facts", facts);
            mock.put("allergens", Collections.singletonList("Sữa bò"));
            mock.put("health_rating_advice", "❤️ Sữa tươi chất lượng tốt cung cấp Canxi tự nhiên và Vitamin D3 giúp phát triển hệ xương. Lời khuyên: Lựa chọn loại ít đường giúp cắt giảm calo dư thừa.");
        } else {
            // Sữa chua nha đam
            mock.put("product_name", "Sữa Chua Hy Lạp Vinamilk Nha Đam");
            mock.put("extracted_text", "NUTRITION FACTS: Serving Size 100g, Calories 95, Protein 5.2g, Carbs 12.5g, Fat 2.7g. Thành phần: Sữa tươi, nha đam (10%), đường refined sugar, men Streptococcus thermophilus...");
            mock.put("ingredients", Arrays.asList("Sữa tươi", "Nha đam 10%", "Đường cát", "Men Lactobacillus bulgaricus"));
            
            Map<String, Object> macros = new HashMap<>();
            macros.put("carbs", "12.5g");
            macros.put("protein", "5.2g");
            macros.put("fat", "2.7g");

            Map<String, Object> facts = new HashMap<>();
            facts.put("serving_size", "100g");
            facts.put("calories_per_serving", "95 kcal");
            facts.put("macros", macros);

            mock.put("nutrition_facts", facts);
            mock.put("allergens", Collections.singletonList("Sữa"));
            mock.put("health_rating_advice", "❤️ Lựa chọn ăn vặt tốt! Sữa chua Hy Lạp cung cấp men vi sinh probiotics hỗ trợ đường ruột và hàm lượng đạm gấp đôi sữa chua thường. Nha đam mát lành tốt cho da.");
        }
        return mock;
    }

    private Map<String, Object> createIngredientMap(String name, String amount, boolean isHealthy) {
        Map<String, Object> map = new HashMap<>();
        map.put("ingredient_name", name);
        map.put("amount", amount);
        map.put("is_healthy", isHealthy);
        return map;
    }
}
