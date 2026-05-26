'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/services/store';
import { motion } from 'framer-motion';
import { Camera, Edit2, Flame, Award, Apple, ChevronRight, Activity, Sparkles, Download, Trash2, Calendar, TrendingUp } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import DailyRing from '@/components/DailyRing';
import { SkeletonLoader } from '@/components/SkeletonLoader';

export default function DashboardPage() {
  const router = useRouter();
  const { 
    user, 
    token, 
    dailyTracker, 
    fetchDailyTracker, 
    updateDailyGoal, 
    history, 
    fetchHistory, 
    deleteScan, 
    isLoading 
  } = useAppStore();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState<number>(2000);

  // Bảo vệ Router và nạp dữ liệu
  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      fetchDailyTracker();
      fetchHistory();
    }
  }, [token, router, fetchDailyTracker, fetchHistory]);

  useEffect(() => {
    if (user) {
      setNewGoal(user.daily_calorie_goal);
    }
  }, [user]);

  const handleUpdateGoal = async () => {
    await updateDailyGoal(newGoal);
    setShowGoalModal(false);
  };

  const handlePrintReport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!user || !dailyTracker) {
    return (
      <div className="py-12 max-w-4xl mx-auto flex flex-col gap-6">
        <SkeletonLoader variant="rect" className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader variant="rect" className="h-64" />
          <SkeletonLoader variant="rect" className="h-64 col-span-2" />
        </div>
      </div>
    );
  }

  // Lọc các bữa ăn đã quét trong ngày hôm nay
  const todayStr = new Date().toDateString();
  const todaysMeals = history.filter(scan => {
    if (!scan.created_at) return false;
    return new Date(scan.created_at).toDateString() === todayStr;
  });

  const percentage = (dailyTracker.calories_consumed / dailyTracker.calories_goal) * 100;

  // Tính toán Tỷ lệ Cân bằng Dinh dưỡng Đa lượng (Carbs: 4kcal/g, Protein: 4kcal/g, Fat: 9kcal/g)
  const carbCal = dailyTracker.carbs_grams * 4;
  const proteinCal = dailyTracker.protein_grams * 4;
  const fatCal = dailyTracker.fat_grams * 9;
  const totalCalFromMacros = carbCal + proteinCal + fatCal;

  const carbPercent = totalCalFromMacros > 0 ? (carbCal / totalCalFromMacros) * 100 : 0;
  const proteinPercent = totalCalFromMacros > 0 ? (proteinCal / totalCalFromMacros) * 100 : 0;
  const fatPercent = totalCalFromMacros > 0 ? (fatCal / totalCalFromMacros) * 100 : 0;

  // Lời khuyên cá nhân hóa động dựa trên chỉ số nạp vào thực tế
  const getDynamicAdvice = () => {
    if (dailyTracker.scans_count === 0) {
      return "Bạn chưa quét món ăn nào hôm nay. Hãy bắt đầu quét bằng Camera hoặc tải ảnh lên để AI phân tích và đưa ra lời khuyên dinh dưỡng hữu ích nhé!";
    }
    
    let adviceList = [];
    const caloriePercentage = (dailyTracker.calories_consumed / dailyTracker.calories_goal) * 100;
    
    if (caloriePercentage > 100) {
      adviceList.push("⚠️ Bạn đã vượt giới hạn calories mục tiêu hôm nay. Hãy bổ sung đi bộ nhẹ hoặc hạn chế ăn tinh bột trong tối nay.");
    } else if (caloriePercentage >= 85) {
      adviceList.push("👍 Calories nạp vào rất tối ưu so với mục tiêu. Hãy tiếp tục duy trì trạng thái này.");
    } else {
      const remaining = Math.round(dailyTracker.calories_goal - dailyTracker.calories_consumed);
      adviceList.push(`💪 Bạn còn dư khoảng ${remaining} Kcal cho ngày hôm nay. Có thể bổ sung bữa phụ nhẹ lành mạnh.`);
    }

    if (dailyTracker.protein_grams < 60) {
      adviceList.push("🥩 Hàm lượng đạm (Protein) hôm nay khá thấp. Ưu tiên bổ sung thêm ức gà, trứng hoặc hải sản ở bữa tiếp theo để hỗ trợ cơ bắp.");
    } else {
      adviceList.push("🌟 Hàm lượng đạm hôm nay rất tốt, giúp săn chắc cơ bắp và tạo cảm giác no lâu.");
    }

    if (dailyTracker.carbs_grams > 220) {
      adviceList.push("🍚 Tinh bột (Carbs) nạp vào đang hơi cao. Hãy thử giảm bớt cơm trắng hoặc đồ ngọt.");
    }

    return adviceList.join(" • ");
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${API_URL}${url}`;
  };

  const formatScanTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="py-6 flex flex-col gap-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Xin chào, {user.full_name || 'Bạn'} <Sparkles className="w-6 h-6 text-premium-green" />
          </h1>
          <p className="text-sm text-gray-400 mt-1">Hôm nay là một ngày tuyệt vời để ăn uống lành mạnh!</p>
        </div>
        <div className="flex gap-3 self-stretch md:self-auto w-full md:w-auto">
          <button
            onClick={handlePrintReport}
            className="flex-1 md:flex-none px-6 py-3.5 bg-premium-border/40 hover:bg-premium-border/60 text-white font-bold rounded-2xl border border-premium-border/50 transition hover:scale-103 active:scale-97 flex items-center justify-center gap-2 text-center"
          >
            <Download className="w-5 h-5" />
            Xuất Báo Cáo PDF
          </button>
          <button
            onClick={() => router.push('/scan')}
            className="flex-1 md:flex-none px-6 py-3.5 bg-premium-green hover:bg-premium-green/85 text-white font-extrabold rounded-2xl shadow-glow transition hover:scale-103 active:scale-97 flex items-center gap-2 text-center justify-center"
          >
            <Camera className="w-5 h-5" />
            Quét món ăn mới
          </button>
        </div>
      </div>

      {/* Trang in ẩn lúc bình thường, chỉ hiển thị khi bấm Print */}
      <div className="hidden print:flex flex-col gap-6 p-8 bg-white text-black min-h-screen w-full rounded-none">
        <div className="border-b-2 border-green-500 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-green-600 tracking-tight">NutriAI Report</h1>
            <p className="text-sm text-gray-500 mt-1">Báo cáo phân tích dinh dưỡng cá nhân hàng ngày</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">{user.full_name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-500">Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-6">
          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col justify-center items-center">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Calories Đã Nạp</span>
            <span className="text-5xl font-black text-green-600 mt-2">{Math.round(dailyTracker.calories_consumed)} Kcal</span>
            <span className="text-xs text-gray-400 mt-1">mục tiêu {user.daily_calorie_goal} kcal ({Math.round(percentage)}%)</span>
          </div>

          <div className="flex flex-col gap-4 justify-center">
            <div className="flex justify-between border-b pb-2">
              <span className="font-bold text-gray-600">Tinh bột (Carbs):</span>
              <span className="font-black">{dailyTracker.carbs_grams.toFixed(1)}g ({Math.round(carbPercent)}% Calo)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-bold text-gray-600">Chất đạm (Protein):</span>
              <span className="font-black">{dailyTracker.protein_grams.toFixed(1)}g ({Math.round(proteinPercent)}% Calo)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-bold text-gray-600">Chất béo (Fat):</span>
              <span className="font-black">{dailyTracker.fat_grams.toFixed(1)}g ({Math.round(fatPercent)}% Calo)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-600">Số lượng bữa ăn đã quét:</span>
              <span className="font-black">{dailyTracker.scans_count} món</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-6">
          <h4 className="text-lg font-bold text-green-800">Đánh giá sức khỏe tổng quan</h4>
          <p className="text-sm text-green-700 leading-relaxed mt-2">
            {getDynamicAdvice()}
          </p>
        </div>

        {todaysMeals.length > 0 && (
          <div className="mt-6 border border-gray-200 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3">Danh sách món ăn hôm nay</h4>
            <div className="flex flex-col gap-3">
              {todaysMeals.map(scan => (
                <div key={scan.id} className="flex justify-between items-center text-sm border-b pb-2">
                  <span className="font-semibold text-gray-700">{scan.food_name} ({formatScanTime(scan.created_at)})</span>
                  <span className="font-bold text-gray-900">{Math.round(scan.calories)} Kcal (C:{Math.round(scan.carbs)}g • P:{Math.round(scan.protein)}g • F:{Math.round(scan.fat)}g)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto border-t pt-4 text-center text-xs text-gray-400">
          Báo cáo tự động được xuất bởi nền tảng NutriAI 2026.
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Calorie Circle & Macro Balance Breakdown */}
        <div className="flex flex-col gap-6">
          {/* Calorie Ring */}
          <GlassCard className="flex flex-col items-center justify-center py-10 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowGoalModal(true)}
                className="p-2 hover:bg-premium-border/40 text-gray-400 hover:text-white rounded-xl border border-premium-border/20 transition-all"
                title="Chỉnh sửa mục tiêu calo"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            <DailyRing 
              value={dailyTracker.calories_consumed} 
              target={dailyTracker.calories_goal} 
            />
          </GlassCard>

          {/* New Component: Macronutrient Energy Balance Breakdown */}
          <GlassCard className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-premium-accent" /> Phân Bố Năng Lượng Đa Lượng
            </h4>
            
            <div className="flex justify-between items-end text-xs text-gray-400">
              <span>Carb / Protein / Fat</span>
              <span className="font-bold text-premium-green">Tỷ lệ Kcal</span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full bg-premium-border/20 h-4 rounded-full flex overflow-hidden shadow-inner">
              {carbPercent > 0 && (
                <div 
                  className="bg-premium-accent h-full transition-all duration-500 hover:opacity-85" 
                  style={{ width: `${carbPercent}%` }}
                  title={`Tinh bột nạp vào đóng góp ${Math.round(carbPercent)}% tổng calo`}
                />
              )}
              {proteinPercent > 0 && (
                <div 
                  className="bg-premium-green h-full transition-all duration-500 hover:opacity-85" 
                  style={{ width: `${proteinPercent}%` }}
                  title={`Đạm nạp vào đóng góp ${Math.round(proteinPercent)}% tổng calo`}
                />
              )}
              {fatPercent > 0 && (
                <div 
                  className="bg-premium-lime h-full transition-all duration-500 hover:opacity-85" 
                  style={{ width: `${fatPercent}%` }}
                  title={`Chất béo nạp vào đóng góp ${Math.round(fatPercent)}% tổng calo`}
                />
              )}
            </div>

            {/* Legend Indicators */}
            <div className="grid grid-cols-3 gap-2 text-[10px] mt-2">
              <div className="flex flex-col items-center p-2 bg-premium-border/10 rounded-xl">
                <span className="flex items-center gap-1 font-bold text-premium-accent">
                  <span className="w-2 h-2 rounded-full bg-premium-accent" /> Tinh Bột
                </span>
                <span className="text-white font-extrabold mt-1">{Math.round(carbPercent)}%</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-premium-border/10 rounded-xl">
                <span className="flex items-center gap-1 font-bold text-premium-green">
                  <span className="w-2 h-2 rounded-full bg-premium-green" /> Chất Đạm
                </span>
                <span className="text-white font-extrabold mt-1">{Math.round(proteinPercent)}%</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-premium-border/10 rounded-xl">
                <span className="flex items-center gap-1 font-bold text-premium-lime">
                  <span className="w-2 h-2 rounded-full bg-premium-lime" /> Chất Béo
                </span>
                <span className="text-white font-extrabold mt-1">{Math.round(fatPercent)}%</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 text-center leading-relaxed italic mt-1">
              Tỷ lệ lý tưởng tiêu chuẩn: 50% Tinh bột - 20% Đạm - 30% Béo.
            </p>
          </GlassCard>
        </div>

        {/* Center & Right columns: Nutrition details, dynamic advice & today's scans */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Carb Card */}
            <GlassCard className="flex flex-col justify-between h-40 border-l-4 border-l-premium-accent">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tinh bột (Carb)</span>
                <span className="text-[10px] font-bold text-premium-accent bg-premium-accent/10 px-1.5 py-0.5 rounded-md">
                  mục tiêu 250g
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{dailyTracker.carbs_grams.toFixed(1)}g</span>
                  <span className="text-xs text-gray-500">/ {Math.round((dailyTracker.carbs_grams / 250) * 100)}%</span>
                </div>
                <div className="w-full bg-premium-border/30 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-premium-accent h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (dailyTracker.carbs_grams / 250) * 100)}%` }}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Protein Card */}
            <GlassCard className="flex flex-col justify-between h-40 border-l-4 border-l-premium-green">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chất đạm (Protein)</span>
                <span className="text-[10px] font-bold text-premium-green bg-premium-green/10 px-1.5 py-0.5 rounded-md">
                  mục tiêu 120g
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{dailyTracker.protein_grams.toFixed(1)}g</span>
                  <span className="text-xs text-gray-500">/ {Math.round((dailyTracker.protein_grams / 120) * 100)}%</span>
                </div>
                <div className="w-full bg-premium-border/30 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-premium-green h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (dailyTracker.protein_grams / 120) * 100)}%` }}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Fat Card */}
            <GlassCard className="flex flex-col justify-between h-40 border-l-4 border-l-premium-lime">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chất béo (Fat)</span>
                <span className="text-[10px] font-bold text-premium-lime bg-premium-lime/10 px-1.5 py-0.5 rounded-md">
                  mục tiêu 70g
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{dailyTracker.fat_grams.toFixed(1)}g</span>
                  <span className="text-xs text-gray-500">/ {Math.round((dailyTracker.fat_grams / 70) * 100)}%</span>
                </div>
                <div className="w-full bg-premium-border/30 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-premium-lime h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (dailyTracker.fat_grams / 70) * 100)}%` }}
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Daily Advice / Analytics */}
          <GlassCard className="flex gap-4 items-start">
            <div className="p-3 bg-premium-green/10 text-premium-green rounded-2xl shrink-0">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-lg font-bold text-white">Đánh giá sức khỏe & khuyến nghị hôm nay</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {getDynamicAdvice()}
              </p>
            </div>
          </GlassCard>

          {/* New Component: Today's Scanned Meals List */}
          <GlassCard className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-premium-border/30">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Apple className="w-5 h-5 text-premium-green" /> Các bữa ăn hôm nay ({todaysMeals.length})
              </h4>
              <button 
                onClick={() => router.push('/scan')}
                className="text-xs font-semibold text-premium-green hover:underline flex items-center gap-0.5"
              >
                Quét thêm <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaysMeals.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <p className="text-sm text-gray-500">Bạn chưa quét món ăn nào trong hôm nay.</p>
                <button 
                  onClick={() => router.push('/scan')}
                  className="text-xs px-4 py-2 bg-premium-green/10 text-premium-green rounded-xl hover:bg-premium-green/20 transition-all font-bold mt-2"
                >
                  Bắt đầu quét ngay
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                {todaysMeals.map((scan) => {
                  const scoreColorClass = 
                    scan.health_score >= 80 ? 'text-premium-green bg-premium-green/10' :
                    scan.health_score >= 50 ? 'text-premium-accent bg-premium-accent/10' :
                    'text-red-500 bg-red-500/10';

                  return (
                    <div 
                      key={scan.id} 
                      onClick={() => router.push(`/scan?resultId=${scan.id}`)}
                      className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-3 bg-premium-border/10 rounded-2xl border border-premium-border/20 hover:border-premium-border/40 transition-all cursor-pointer hover:bg-premium-border/15"
                    >
                      <div className="flex items-center gap-3">
                        {scan.image_url ? (
                          <img 
                            src={getImageUrl(scan.image_url) || ''} 
                            alt={scan.food_name} 
                            className="w-12 h-12 rounded-xl object-cover border border-premium-border/30"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=120';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-premium-border/30 flex items-center justify-center text-gray-500">
                            <Apple className="w-6 h-6" />
                          </div>
                        )}
                        
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-white">{scan.food_name}</span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" /> {formatScanTime(scan.created_at)} • {scan.weight_grams || 300}g
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="flex flex-col items-end">
                          <span className="font-extrabold text-sm text-white">{Math.round(scan.calories)} Kcal</span>
                          <span className="text-[10px] text-gray-400">
                            C:{Math.round(scan.carbs)}g • P:{Math.round(scan.protein)}g • F:{Math.round(scan.fat)}g
                          </span>
                        </div>

                        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${scoreColorClass}`}>
                          {scan.health_score}đ
                        </span>

                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Bạn có chắc chắn muốn xóa lượt quét món "${scan.food_name}" này khỏi lịch sử?`)) {
                              await deleteScan(scan.id);
                            }
                          }}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          title="Xóa lượt quét"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Goal Modal (iOS Glass Style) */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-premium-dark/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm glassmorphism rounded-3xl p-6 flex flex-col gap-4"
          >
            <h3 className="text-xl font-bold text-white">Mục tiêu Calories hàng ngày</h3>
            <p className="text-xs text-gray-400">Thay đổi lượng calories nạp vào phù hợp với mục tiêu giảm cân hay tăng cơ của bạn.</p>
            
            <div className="relative mt-2">
              <Flame className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-premium-green" />
              <input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-3 bg-premium-border/30 border border-premium-border/50 text-white rounded-2xl text-sm focus:outline-none focus:border-premium-green/60 focus:bg-premium-border/50 transition-all font-bold"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 py-3 bg-premium-border/40 hover:bg-premium-border/60 text-gray-300 font-bold rounded-xl transition text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateGoal}
                className="flex-1 py-3 bg-premium-green hover:bg-premium-green/85 text-white font-extrabold rounded-xl transition text-sm shadow-glow"
              >
                Lưu lại
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
