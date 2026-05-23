import json
import base64
import re
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

class AIService:
    @staticmethod
    def get_mock_nutrition(image_name: str = "") -> Dict[str, Any]:
        """Mock data thông minh để phục vụ demo khi thiếu API Key hoặc lỗi kết nối."""
        # Nhận diện từ khóa trong tên file hoặc trả về ngẫu nhiên
        image_name_lower = image_name.lower()
        if "pho" in image_name_lower or "noodle" in image_name_lower:
            return {
                "food_name": "Phở Bò Việt Nam",
                "calories": 450.0,
                "carbs": 55.0,
                "protein": 28.0,
                "fat": 13.0,
                "weight_grams": 450.0,
                "health_score": 7,
                "health_advice": "❤️ Món ăn truyền thống giàu dinh dưỡng, cung cấp lượng đạm chất lượng cao từ thịt bò nạc và tinh bột nhanh từ bánh phở. Lời khuyên: Hạn chế húp quá nhiều nước lèo vì chứa hàm lượng muối và cholesterol cao từ mỡ bò.",
                "ingredients": [
                  {"ingredient_name": "Bánh phở", "amount": "200g", "is_healthy": True},
                  {"ingredient_name": "Thịt bò nạc", "amount": "80g", "is_healthy": True},
                  {"ingredient_name": "Nước lèo bò", "amount": "150ml", "is_healthy": False},
                  {"ingredient_name": "Rau thơm & Giá đỗ", "amount": "30g", "is_healthy": True}
                ]
            }
        elif "salad" in image_name_lower or "vegetable" in image_name_lower:
            return {
                "food_name": "Salad Ức Gà Sốt Mè Rang",
                "calories": 280.0,
                "carbs": 12.0,
                "protein": 24.0,
                "fat": 15.0,
                "weight_grams": 250.0,
                "health_score": 9,
                "health_advice": "❤️ Lựa chọn tuyệt vời cho người giảm cân hoặc duy trì vóc dáng! Ức gà cung cấp protein tinh khiết xây dựng cơ bắp, rau xanh giàu chất xơ giúp no lâu. Lời khuyên: Hạn chế rưới quá nhiều sốt mè rang béo ngậy để kiểm soát calo nạp vào.",
                "ingredients": [
                  {"ingredient_name": "Ức gà hấp xé phay", "amount": "100g", "is_healthy": True},
                  {"ingredient_name": "Rau xà lách & Cà chua bi", "amount": "120g", "is_healthy": True},
                  {"ingredient_name": "Sốt mè rang Kewpie", "amount": "1.5 muỗng", "is_healthy": False},
                  {"ingredient_name": "Hạt hạnh nhân lát", "amount": "10g", "is_healthy": True}
                ]
            }
        elif "burger" in image_name_lower or "pizza" in image_name_lower or "fastfood" in image_name_lower:
            return {
                "food_name": "Double Cheese Burger",
                "calories": 620.0,
                "carbs": 48.0,
                "protein": 32.0,
                "fat": 34.0,
                "weight_grams": 220.0,
                "health_score": 4,
                "health_advice": "⚠️ Hàm lượng chất béo bão hòa, carbohydrate tinh chế và muối cực kỳ cao. Món ăn này có thể gây tăng đột biến đường huyết và tích tụ mỡ xấu nếu tiêu thụ thường xuyên. Lời khuyên: Hãy ăn kèm một đĩa salad rau xanh không sốt và uống nước lọc thay vì soda.",
                "ingredients": [
                  {"ingredient_name": "Vỏ bánh mì kẹp", "amount": "1 cái", "is_healthy": False},
                  {"ingredient_name": "Bò viên nướng", "amount": "120g", "is_healthy": True},
                  {"ingredient_name": "Phô mai Cheddar", "amount": "2 lát", "is_healthy": False},
                  {"ingredient_name": "Sốt mayonnaise & tương cà", "amount": "20g", "is_healthy": False}
                ]
            }
        
        # Món ăn mặc định (Cơm Tấm Sườn Trứng)
        return {
            "food_name": "Cơm Tấm Sườn Nướng Trứng Ốp La",
            "calories": 710.0,
            "carbs": 78.0,
            "protein": 36.0,
            "fat": 28.0,
            "weight_grams": 380.0,
            "health_score": 5,
            "health_advice": "⚠️ Bữa ăn cung cấp nguồn năng lượng khổng lồ. Tuy nhiên tỉ lệ tinh bột tinh chế từ cơm tấm trắng và mỡ sườn khá cao. Lời khuyên: Yêu cầu giảm bớt cơm trắng, thêm dưa leo cà chua, hạn chế rưới nhiều mỡ hành để cắt bớt chất béo bão hòa.",
            "ingredients": [
              {"ingredient_name": "Cơm tấm trắng", "amount": "200g", "is_healthy": False},
              {"ingredient_name": "Sườn cốt lết nướng mật ong", "amount": "120g", "is_healthy": True},
              {"ingredient_name": "Trứng ốp la", "amount": "1 quả", "is_healthy": True},
              {"ingredient_name": "Mỡ hành & Nước mắm ngọt", "amount": "30ml", "is_healthy": False}
            ]
        }

    @classmethod
    async def analyze_food_image(cls, image_bytes: bytes, filename: str = "") -> Dict[str, Any]:
        """Phân tích ảnh món ăn bằng Gemini Vision API, tự động fallback sang mock data nếu không có key hoặc lỗi."""
        
        if not settings.GEMINI_API_KEY:
            # Không cấu hình API Key -> Dùng Mock
            return cls.get_mock_nutrition(filename)

        # Base64 encode ảnh
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        
        # System Prompt định nghĩa rõ ràng cấu trúc mong muốn
        prompt = (
            "You are an expert AI Nutritionist. Analyze this food image and estimate its nutritional values. "
            "IMPORTANT: Your response MUST be a VALID raw JSON object ONLY, with no markdown formatting blocks, "
            "no ```json wrapper, no explanation, no text outside the JSON structure. "
            "The JSON must have the following structure EXACTLY:\n"
            "{\n"
            "  \"food_name\": \"Name of the food in Vietnamese\",\n"
            "  \"calories\": 350.0,\n"
            "  \"carbs\": 45.0,\n"
            "  \"protein\": 22.0,\n"
            "  \"fat\": 10.0,\n"
            "  \"weight_grams\": 400.0,\n"
            "  \"health_score\": 7,\n"
            "  \"health_advice\": \"Vietnamese healthy rating advice starting with a heart (❤️) or warning (⚠️) sign and detail reasons\",\n"
            "  \"ingredients\": [\n"
            "    {\"ingredient_name\": \"Tên nguyên liệu\", \"amount\": \"Khối lượng hoặc lượng dùng\", \"is_healthy\": true},\n"
            "    ...\n"
            "  ]\n"
            "}"
        )

        # Gọi Gemini API 1.5 Flash
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": "image/jpeg",
                                "data": base64_image
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    # Trích xuất text phản hồi
                    text_content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    
                    # Clean markdown wrappers if any
                    text_content = re.sub(r"^```json\s*", "", text_content, flags=re.MULTILINE)
                    text_content = re.sub(r"\s*```$", "", text_content, flags=re.MULTILINE)
                    
                    result = json.loads(text_content)
                    return result
                else:
                    # Lỗi API -> Fallback
                    return cls.get_mock_nutrition(filename)
        except Exception:
            # Bất kỳ ngoại lệ nào khác -> Fallback
            return cls.get_mock_nutrition(filename)
