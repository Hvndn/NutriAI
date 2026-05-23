'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/services/store';
import { motion } from 'framer-motion';
import { Lock, Mail, User, Flame, ArrowRight, Apple, CheckCircle2 } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading, error } = useAppStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dailyGoal, setDailyGoal] = useState<number>(2000);
  
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password || !fullName) {
      setValidationError('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Mật khẩu phải dài ít nhất 6 ký tự.');
      return;
    }

    const success = await register(email, password, fullName, dailyGoal);
    if (success) {
      setIsSuccess(true);
      // Reset form
      setEmail('');
      setPassword('');
      setFullName('');
    }
  };

  return (
    <div className="relative py-12 flex justify-center items-center min-h-[80vh]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-premium-green/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard className="flex flex-col gap-6 p-8 md:p-10">
          <div className="text-center flex flex-col gap-2">
            <div className="mx-auto p-3 bg-gradient-to-br from-premium-green to-premium-lime rounded-2xl w-fit shadow-glow">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-2">Bắt Đầu Miễn Phí</h2>
            <p className="text-sm text-gray-400">Kiểm soát chế độ ăn uống một cách thông minh bằng AI.</p>
          </div>

          {/* Đăng ký thành công */}
          {isSuccess ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col gap-4 text-center items-center py-4"
            >
              <CheckCircle2 className="w-16 h-16 text-premium-green animate-pulse-glow" />
              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-bold text-white">Đăng Ký Thành Công!</h4>
                <p className="text-xs text-gray-400">Tài khoản của bạn đã sẵn sàng hoạt động.</p>
              </div>
              <Link
                href="/login"
                className="w-full py-3.5 bg-premium-green hover:bg-premium-green/85 text-white font-extrabold rounded-2xl shadow-glow transition mt-2 text-center"
              >
                Đăng nhập ngay
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Hiển thị lỗi */}
              {(error || validationError) && (
                <div className="p-4 bg-premium-rose/10 border border-premium-rose/30 text-premium-rose rounded-2xl text-xs font-bold leading-relaxed">
                  ⚠️ {error || validationError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Họ & Tên */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Họ và tên *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-premium-border/30 border border-premium-border/50 text-white rounded-2xl text-sm focus:outline-none focus:border-premium-green/60 focus:bg-premium-border/50 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-premium-border/30 border border-premium-border/50 text-white rounded-2xl text-sm focus:outline-none focus:border-premium-green/60 focus:bg-premium-border/50 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Mật khẩu */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Mật khẩu (tối thiểu 6 ký tự) *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-premium-border/30 border border-premium-border/50 text-white rounded-2xl text-sm focus:outline-none focus:border-premium-green/60 focus:bg-premium-border/50 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Mục tiêu Calorie */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Mục tiêu Calories hàng ngày (kcal)</label>
                  <div className="relative">
                    <Flame className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-3 bg-premium-border/30 border border-premium-border/50 text-white rounded-2xl text-sm focus:outline-none focus:border-premium-green/60 focus:bg-premium-border/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-premium-green hover:bg-premium-green/85 text-white font-extrabold rounded-2xl shadow-glow transition hover:scale-102 active:scale-98 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {isLoading ? 'Đang khởi tạo tài khoản...' : 'Đăng ký ngay'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center text-xs text-gray-400 mt-2">
                Đã có tài khoản?{' '}
                <Link href="/login" className="font-bold text-premium-green hover:underline">
                  Đăng nhập
                </Link>
              </div>
            </>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
