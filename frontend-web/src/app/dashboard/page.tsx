'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/services/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Edit2, Flame, Award, Apple, ChevronRight, Activity, Sparkles, Download, Trash2, Calendar, TrendingUp, Droplet, Moon, Footprints, Scale, Brain, BookOpen, Plus, Loader2 } from 'lucide-react';
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
    isLoading,
    fetchTodayHealthLog,
    saveHealthLog,
    fetchHealthHistory,
    fetchAICorrelation,
    fetchAIMealPlan,
    todayHealthLog,
    aiCorrelation,
    aiMealPlan
  } = useAppStore();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState<number>(2000);

  // States cho Nhật ký sức khỏe
  const [weightInput, setWeightInput] = useState<string>('');
  const [stepsInput, setStepsInput] = useState<string>('');
  const [sleepInput, setSleepInput] = useState<string>('');
  
  // Accordion & loading states
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [loadingMealPlan, setLoadingMealPlan] = useState(false);
  const [loadingCorrelation, setLoadingCorrelation] = useState(false);

  // Bảo vệ Router và nạp dữ liệu
  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      fetchDailyTracker();
      fetchHistory();
      fetchTodayHealthLog();
      fetchHealthHistory();
    }
  }, [token, router, fetchDailyTracker, fetchHistory, fetchTodayHealthLog, fetchHealthHistory]);

  // Đồng bộ hóa dữ liệu từ database vào các ô nhập liệu
  useEffect(() => {
    if (todayHealthLog) {
      setWeightInput(todayHealthLog.weight ? todayHealthLog.weight.toString() : '');
      setStepsInput(todayHealthLog.steps ? todayHealthLog.steps.toString() : '');
      setSleepInput(todayHealthLog.sleepHours ? todayHealthLog.sleepHours.toString() : '');
    }
  }, [todayHealthLog]);

  useEffect(() => {
    if (user) {
      setNewGoal(user.daily_calorie_goal);
    }
  }, [user]);

  const handleUpdateGoal = async () => {
    await updateDailyGoal(newGoal);
    setShowGoalModal(false);
  };

  const handleSaveVitals = async () => {
    try {
      await saveHealthLog({
        weight: weightInput ? Number(weightInput) : undefined,
        steps: stepsInput ? Number(stepsInput) : undefined,
        sleepHours: sleepInput ? Number(sleepInput) : undefined
      });
      alert("Đã lưu chỉ số sức khỏe sinh lý ngày hôm nay!");
    } catch (err) {}
  };

  const handleIncrementWater = async () => {
    const currentWater = todayHealthLog ? todayHealthLog.waterMl : 0;
    const newWater = currentWater + 250;
    try {
      await saveHealthLog({ waterMl: newWater });
    } catch (err) {}
  };

  const handleLoadMealPlan = async () => {
    setLoadingMealPlan(true);
    try {
      await fetchAIMealPlan();
      setShowMealPlanner(true);
    } catch (err) {
    } finally {
      setLoadingMealPlan(false);
    }
  };

  const handleLoadCorrelation = async () => {
    setLoadingCorrelation(true);
    try {
      await fetchAICorrelation();
    } catch (err) {
    } finally {
      setLoadingCorrelation(false);
    }
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

          {/* Health & Vitals Log */}
          <GlassCard className="flex flex-col gap-5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-premium-green" /> Chỉ Số Sinh Lý & Sức Khỏe
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Cột trái: Nước */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center bg-premium-border/10 p-4 rounded-2xl border border-premium-border/20 relative overflow-hidden h-[190px]">
                <span className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-blue-400" /> Nước Uống
                </span>
                
                {/* Ly nước Glassmorphism */}
                <div className="relative w-14 h-24 border-2 border-white/20 rounded-b-2xl rounded-t-sm flex items-end overflow-hidden bg-white/5 shadow-inner">
                  {/* Lớp nước dâng */}
                  <motion.div 
                    className="w-full bg-gradient-to-t from-blue-600/80 to-blue-400/80"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(100, ((todayHealthLog?.waterMl || 0) / 2000) * 100)}%` }}
                    transition={{ type: 'spring', stiffness: 50 }}
                  />
                  {/* Chỉ số dung tích trên ly */}
                  <div className="absolute inset-0 flex flex-col justify-between items-center py-2 text-[8px] text-gray-500 font-bold pointer-events-none select-none">
                    <span>2.0L</span>
                    <span>1.0L</span>
                    <span>0.5L</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-black text-white">
                    {(todayHealthLog?.waterMl || 0)} <span className="text-[10px] text-gray-500 font-normal">/ 2000 ml</span>
                  </span>
                  <button
                    onClick={handleIncrementWater}
                    className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-110 active:scale-95 shadow-md shadow-blue-500/20"
                    title="Uống thêm 250ml"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cột phải: Các chỉ số sinh lý khác */}
              <div className="sm:col-span-7 flex flex-col gap-3">
                {/* Cân nặng */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                    <Scale className="w-3 h-3 text-premium-accent" /> Cân Nặng (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Chưa nhập"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="px-3 py-2 bg-premium-border/20 border border-premium-border/40 text-white rounded-xl text-xs focus:outline-none focus:border-premium-green/60 transition-all font-bold"
                  />
                </div>

                {/* Số bước chân */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                    <Footprints className="w-3 h-3 text-premium-green" /> Bước Chân (bước)
                  </label>
                  <input
                    type="number"
                    placeholder="Chưa nhập"
                    value={stepsInput}
                    onChange={(e) => setStepsInput(e.target.value)}
                    className="px-3 py-2 bg-premium-border/20 border border-premium-border/40 text-white rounded-xl text-xs focus:outline-none focus:border-premium-green/60 transition-all font-bold"
                  />
                </div>

                {/* Giờ ngủ */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                    <Moon className="w-3 h-3 text-premium-lime" /> Giờ Ngủ (tiếng)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Chưa nhập"
                    value={sleepInput}
                    onChange={(e) => setSleepInput(e.target.value)}
                    className="px-3 py-2 bg-premium-border/20 border border-premium-border/40 text-white rounded-xl text-xs focus:outline-none focus:border-premium-green/60 transition-all font-bold"
                  />
                </div>

                <button
                  onClick={handleSaveVitals}
                  className="w-full mt-1 py-2 bg-premium-green hover:bg-premium-green/85 text-white font-extrabold text-xs rounded-xl shadow-md transition hover:scale-102 active:scale-98 flex items-center justify-center gap-1"
                >
                  Lưu chỉ số sức khỏe
                </button>
              </div>
            </div>
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
          <GlassCard className="flex flex-col gap-4">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-premium-green/10 text-premium-green rounded-2xl shrink-0">
                <Award className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-bold text-white">Đánh giá sức khỏe & khuyến nghị hôm nay</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {getDynamicAdvice()}
                </p>
              </div>
            </div>

            {/* AI Correlation Button & Display */}
            <div className="mt-2 border-t border-premium-border/20 pt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                  <Brain className="w-4 h-4 text-purple-400" /> Trí Tuệ Nhân Tạo Phân Tích Lối Sống
                </span>
                <button
                  onClick={handleLoadCorrelation}
                  disabled={loadingCorrelation}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/40 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/10 hover:shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loadingCorrelation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Phân tích tương quan
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {aiCorrelation?.insight && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl flex gap-3 relative overflow-hidden"
                  >
                    {/* Glowing effect inside */}
                    <div className="absolute -right-12 -top-12 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
                    
                    <Brain className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1 text-xs text-purple-200/90 leading-relaxed whitespace-pre-line">
                      <span className="font-extrabold text-purple-300">Phân tích chuyên sâu từ Gemini:</span>
                      {aiCorrelation.insight}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

          {/* Personalized AI Meal Planner */}
          <GlassCard className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-premium-border/30">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-premium-accent" /> Thực Đơn Gợi Ý AI Hôm Nay
              </h4>
              
              {!aiMealPlan && (
                <button
                  onClick={handleLoadMealPlan}
                  disabled={loadingMealPlan}
                  className="px-4 py-2 bg-premium-accent hover:bg-premium-accent/85 disabled:bg-premium-accent/40 text-white font-extrabold text-xs rounded-xl shadow-glow transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loadingMealPlan ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lên thực đơn...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Lập Thực Đơn
                    </>
                  )}
                </button>
              )}
            </div>

            {loadingMealPlan && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-premium-accent animate-spin" />
                <span className="text-xs text-gray-400 font-medium">Gemini đang tính toán năng lượng tiêu chuẩn và lên thực đơn tốt nhất cho bạn...</span>
              </div>
            )}

            {!loadingMealPlan && !aiMealPlan && (
              <div className="py-8 text-center flex flex-col items-center gap-2 bg-premium-border/5 rounded-2xl border border-dashed border-premium-border/30">
                <Sparkles className="w-8 h-8 text-premium-accent opacity-60 animate-pulse" />
                <p className="text-sm text-gray-500 max-w-sm mt-1">Lượng calories tiêu thụ của bạn hôm nay sẽ được tối ưu tốt nhất qua thực đơn 3 bữa do AI thiết lập.</p>
                <button
                  onClick={handleLoadMealPlan}
                  className="text-xs px-4 py-2 bg-premium-accent/10 text-premium-accent hover:bg-premium-accent/20 rounded-xl transition-all font-bold mt-2 border border-premium-accent/20"
                >
                  Thiết kế thực đơn cá nhân hóa
                </button>
              </div>
            )}

            {!loadingMealPlan && aiMealPlan && (
              <div className="flex flex-col gap-4">
                {/* 3 bữa ăn */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Bữa sáng */}
                  {aiMealPlan.breakfast && (
                    <div className="p-4 bg-premium-border/10 rounded-2xl border border-premium-border/20 flex flex-col justify-between gap-3 hover:bg-premium-border/15 transition-all">
                      <div>
                        <span className="text-[10px] font-black text-premium-accent bg-premium-accent/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Bữa Sáng
                        </span>
                        <h5 className="font-extrabold text-sm text-white mt-2 leading-snug">{aiMealPlan.breakfast.food_name}</h5>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all duration-300">
                          {aiMealPlan.breakfast.recipe_note}
                        </p>
                      </div>
                      <div className="flex justify-between items-center border-t border-premium-border/20 pt-2 mt-2">
                        <span className="text-xs font-black text-white">{Math.round(aiMealPlan.breakfast.calories)} kcal</span>
                        <span className="text-[9px] text-gray-500">
                          C:{Math.round(aiMealPlan.breakfast.carbs)}g P:{Math.round(aiMealPlan.breakfast.protein)}g F:{Math.round(aiMealPlan.breakfast.fat)}g
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bữa trưa */}
                  {aiMealPlan.lunch && (
                    <div className="p-4 bg-premium-border/10 rounded-2xl border border-premium-border/20 flex flex-col justify-between gap-3 hover:bg-premium-border/15 transition-all">
                      <div>
                        <span className="text-[10px] font-black text-premium-green bg-premium-green/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Bữa Trưa
                        </span>
                        <h5 className="font-extrabold text-sm text-white mt-2 leading-snug">{aiMealPlan.lunch.food_name}</h5>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all duration-300">
                          {aiMealPlan.lunch.recipe_note}
                        </p>
                      </div>
                      <div className="flex justify-between items-center border-t border-premium-border/20 pt-2 mt-2">
                        <span className="text-xs font-black text-white">{Math.round(aiMealPlan.lunch.calories)} kcal</span>
                        <span className="text-[9px] text-gray-500">
                          C:{Math.round(aiMealPlan.lunch.carbs)}g P:{Math.round(aiMealPlan.lunch.protein)}g F:{Math.round(aiMealPlan.lunch.fat)}g
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bữa tối */}
                  {aiMealPlan.dinner && (
                    <div className="p-4 bg-premium-border/10 rounded-2xl border border-premium-border/20 flex flex-col justify-between gap-3 hover:bg-premium-border/15 transition-all">
                      <div>
                        <span className="text-[10px] font-black text-premium-lime bg-premium-lime/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Bữa Tối
                        </span>
                        <h5 className="font-extrabold text-sm text-white mt-2 leading-snug">{aiMealPlan.dinner.food_name}</h5>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all duration-300">
                          {aiMealPlan.dinner.recipe_note}
                        </p>
                      </div>
                      <div className="flex justify-between items-center border-t border-premium-border/20 pt-2 mt-2">
                        <span className="text-xs font-black text-white">{Math.round(aiMealPlan.dinner.calories)} kcal</span>
                        <span className="text-[9px] text-gray-500">
                          C:{Math.round(aiMealPlan.dinner.carbs)}g P:{Math.round(aiMealPlan.dinner.protein)}g F:{Math.round(aiMealPlan.dinner.fat)}g
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer note */}
                <div className="text-[10px] text-gray-500 text-center leading-relaxed bg-premium-border/5 py-2 rounded-xl border border-premium-border/20">
                  💡 Thực đơn được thiết kế tự động tối ưu hóa dinh dưỡng theo Mục tiêu Calories ({aiMealPlan.target_calories || user.daily_calorie_goal} Kcal) của bạn.
                </div>
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
