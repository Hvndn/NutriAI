'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Camera, CheckCircle, Flame, PieChart, ShieldCheck, Zap } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ScanLine from '@/components/ScanLine';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="relative py-12 md:py-20 flex flex-col items-center gap-24">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-premium-green/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-premium-accent/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full flex flex-col lg:flex-row items-center gap-12 max-w-6xl"
      >
        {/* Hero Left (Text content) */}
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
          <motion.div variants={itemVariants} className="inline-flex self-center lg:self-start items-center gap-2 px-4 py-2 rounded-full glassmorphism text-premium-green border-premium-green/20">
            <Zap className="w-4 h-4 fill-premium-green" />
            <span className="text-xs font-extrabold uppercase tracking-widest">AI Nutrition 2026</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Hiểu Mọi Món Ăn<br />
            Chỉ Qua <span className="text-gradient">Một Bức Ảnh</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-base sm:text-lg text-gray-400 max-w-xl self-center lg:self-start leading-relaxed">
            Sử dụng công nghệ thị giác máy tính AI thế hệ mới để tự động bóc tách thành phần dinh dưỡng, calories và cho điểm sức khỏe thức ăn tức thì. Thay thế hoàn toàn việc tra cứu thủ công nhàm chán!
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
            <Link 
              href="/register" 
              className="px-8 py-4 bg-premium-green hover:bg-premium-green/85 text-white font-extrabold rounded-2xl shadow-glow transition hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Bắt đầu quét ngay
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 glassmorphism hover:bg-premium-border/50 text-white font-bold rounded-2xl border border-premium-border/60 transition text-center"
            >
              Đăng nhập tài khoản
            </Link>
          </motion.div>
        </div>

        {/* Hero Right (Interactive Visual Image Scan Demonstration) */}
        <motion.div 
          variants={itemVariants}
          className="flex-1 w-full max-w-md lg:max-w-none relative flex justify-center"
        >
          <div className="relative w-80 h-96 sm:w-96 sm:h-[450px] rounded-[40px] overflow-hidden border-[10px] border-premium-border/50 shadow-2xl glassmorphism">
            {/* Food Demo Image */}
            <Image 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
              alt="AI Food Scanner Demo"
              fill
              className="object-cover"
              priority
            />
            {/* Hiệu ứng quét laser chạy ngang */}
            <ScanLine />

            {/* Float Card 1: AI Analysis result overlay */}
            <div className="absolute bottom-6 left-6 right-6 backdrop-blur-lg bg-premium-dark/80 border border-premium-border/60 rounded-3xl p-5 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold text-premium-green uppercase tracking-wider">Đã phát hiện thực phẩm</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">Salad Cá Hồi Keto</h3>
                </div>
                <span className="px-2.5 py-1 bg-premium-rose/10 text-premium-rose font-bold text-xs rounded-lg flex items-center gap-1 border border-premium-rose/25">
                  ❤️ 8/10 Healthy
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="bg-premium-border/30 rounded-xl p-2 text-center border border-premium-border/20">
                  <span className="text-[9px] text-gray-400 block uppercase font-bold">Energy</span>
                  <span className="text-xs font-black text-white mt-1 block">340 Kcal</span>
                </div>
                <div className="bg-premium-border/30 rounded-xl p-2 text-center border border-premium-border/20">
                  <span className="text-[9px] text-gray-400 block uppercase font-bold">Carbs</span>
                  <span className="text-xs font-black text-white mt-1 block">8g</span>
                </div>
                <div className="bg-premium-border/30 rounded-xl p-2 text-center border border-premium-border/20">
                  <span className="text-[9px] text-gray-400 block uppercase font-bold">Protein</span>
                  <span className="text-xs font-black text-white mt-1 block">26g</span>
                </div>
                <div className="bg-premium-border/30 rounded-xl p-2 text-center border border-premium-border/20">
                  <span className="text-[9px] text-gray-400 block uppercase font-bold">Fat</span>
                  <span className="text-xs font-black text-white mt-1 block">22g</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Feature Cards Section */}
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12 flex flex-col gap-3">
          <h2 className="text-3xl font-extrabold text-white">Tính Năng Định Hình Tương Lai Dinh Dưỡng</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Trang bị bộ công cụ AI tối tân hỗ trợ tối đa cho hành trình cải thiện sức khỏe toàn diện.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="flex flex-col gap-4 text-center items-center hover:scale-103 transition-transform">
            <div className="p-4 bg-premium-green/10 text-premium-green rounded-2xl">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Quét AI Tức Thì</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tải ảnh lên hoặc chụp bằng camera. Gemini Vision AI nhận diện chính xác món ăn và ước lượng dinh dưỡng chính xác đến 90%.
            </p>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4 text-center items-center hover:scale-103 transition-transform">
            <div className="p-4 bg-premium-accent/10 text-premium-accent rounded-2xl">
              <Flame className="w-8 h-8 text-premium-accent" />
            </div>
            <h3 className="text-xl font-bold text-white">Nhật Ký Calo Tự Động</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tự động cộng dồn calories, protein, tinh bột và chất béo nạp vào trong ngày. Quản lý hạn mức calorie linh hoạt theo mục tiêu.
            </p>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4 text-center items-center hover:scale-103 transition-transform">
            <div className="p-4 bg-premium-lime/10 text-premium-lime rounded-2xl">
              <PieChart className="w-8 h-8 text-premium-lime" />
            </div>
            <h3 className="text-xl font-bold text-white">Analytics Toàn Diện</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Cung cấp Dashboard thống kê, theo dõi calories trung bình, phân loại thực phẩm lành mạnh và quản trị admin trực quan.
            </p>
          </GlassCard>
        </div>
      </div>
      
      {/* Social Trust / Footer */}
      <div className="w-full max-w-6xl text-center py-6 border-t border-premium-border/40 text-gray-500 text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>© 2026 AI Nutrition Scanner. Bản quyền thuộc về Đồ Án Tốt Nghiệp (DATN).</span>
        <div className="flex gap-6 font-bold">
          <Link href="/login" className="hover:text-premium-green transition">Điều khoản</Link>
          <Link href="/register" className="hover:text-premium-green transition">Bảo mật</Link>
        </div>
      </div>
    </div>
  );
}
