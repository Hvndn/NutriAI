from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from app.models.user import User
from app.models.scan import Scan

class StatsService:
    @staticmethod
    def get_admin_dashboard_stats(db: Session) -> Dict[str, Any]:
        """Lấy dữ liệu thống kê tổng hợp cho Admin Dashboard."""
        
        # 1. Tổng số người dùng
        total_users = db.query(func.count(User.id)).scalar() or 0
        
        # 2. Tổng số lượt quét
        total_scans = db.query(func.count(Scan.id)).scalar() or 0
        
        # 3. Lượng calories trung bình trên mỗi lượt quét
        average_calories = db.query(func.avg(Scan.calories)).scalar() or 0.0
        average_calories = round(float(average_calories), 1)
        
        # 4. Top 5 món ăn được quét nhiều nhất
        top_foods_query = (
            db.query(Scan.food_name, func.count(Scan.id).label("scan_count"))
            .group_by(Scan.food_name)
            .order_by(func.count(Scan.id).desc())
            .limit(5)
            .all()
        )
        
        top_foods = [
            {"food_name": item[0], "scan_count": item[1]} for item in top_foods_query
        ]
        
        # Điền dữ liệu mock nếu chưa có dữ liệu thật để admin không bị trống biểu đồ
        if not top_foods:
            top_foods = [
                {"food_name": "Phở Bò Việt Nam", "scan_count": 12},
                {"food_name": "Salad Ức Gà Sốt Mè Rang", "scan_count": 8},
                {"food_name": "Cơm Tấm Sườn Nướng", "scan_count": 6},
                {"food_name": "Double Cheese Burger", "scan_count": 3},
            ]

        # 5. Biểu đồ tăng trưởng số lượt scan theo ngày (7 ngày qua)
        scan_growth = []
        today = datetime.now(timezone.utc).date()
        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            # Query đếm số lượt quét trong ngày
            count = (
                db.query(func.count(Scan.id))
                .filter(func.date(Scan.created_at) == target_date)
                .scalar() or 0
            )
            
            # Nếu chưa có dữ liệu thật, chèn mock tăng trưởng đẹp đẽ
            if total_scans == 0:
                mock_counts = [5, 8, 12, 7, 15, 22, 28]
                count = mock_counts[6 - i]

            scan_growth.append({
                "date": target_date.strftime("%d/%m"),
                "scans": count
            })
            
        return {
            "total_users": total_users if total_users > 0 else 24, # Mock fallback cho demo
            "total_scans": total_scans if total_scans > 0 else 85,
            "average_calories": average_calories if average_calories > 0 else 460.5,
            "top_foods": top_foods,
            "scan_growth": scan_growth
        }
