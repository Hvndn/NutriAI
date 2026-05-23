'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/services/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, RefreshCw, Heart, Info, ArrowLeft, Plus, CheckCircle, Save } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ScanLine from '@/components/ScanLine';
import api from '@/services/api';

export default function ScanPage() {
  const router = useRouter();
  const { token, uploadAndAnalyzeImage, isLoading, error } = useAppStore();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  
  // States cho chỉnh sửa thủ công & thêm nguyên liệu
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    food_name: '',
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    weight_grams: 100,
    health_score: 5,
    health_advice: ''
  });
  
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    ingredient_name: '',
    amount: '',
    is_healthy: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Bảo vệ router
  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Loading text rotation
  const loadingTexts = [
    "Đang phân tích hình ảnh thực phẩm...",
    "Đang nhận diện món ăn...",
    "Đang ước lượng calories và dinh dưỡng...",
    "Đang chuẩn bị kết quả...",
    "Sắp xong rồi!"
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null); // Clear previous result
    }
  };

  // Kích hoạt camera webcam
  const startCamera = async () => {
    setIsCameraActive(true);
    setPreviewUrl(null);
    setSelectedFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Không thể khởi động camera. Vui lòng cho phép quyền truy cập camera trình duyệt.");
      setIsCameraActive(false);
    }
  };

  // Chụp ảnh từ camera
  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            
            // Tắt camera stream
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setIsCameraActive(false);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    
    const result = await uploadAndAnalyzeImage(selectedFile);
    if (result) {
      setScanResult(result);
      setEditForm({
        food_name: result.food_name,
        calories: result.calories,
        carbs: result.carbs,
        protein: result.protein,
        fat: result.fat,
        weight_grams: result.weight_grams,
        health_score: result.health_score,
        health_advice: result.health_advice || ''
      });
    }
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = async () => {
    try {
      const response = await api.put(`/scans/${scanResult.id}`, editForm);
      setScanResult(response.data);
      setIsEditing(false);
    } catch (err) {}
  };

  // Thêm thành phần thủ công
  const handleAddIngredient = async () => {
    if (!newIngredient.ingredient_name) return;
    try {
      const response = await api.post(`/scans/${scanResult.id}/ingredients`, newIngredient);
      setScanResult((prev: any) => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), response.data]
      }));
      setShowAddIngredient(false);
      setNewIngredient({ ingredient_name: '', amount: '', is_healthy: true });
    } catch (err) {}
  };

  return (
    <div className="py-6 max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2.5 bg-premium-border/40 hover:bg-premium-border/60 text-gray-400 hover:text-white rounded-xl border border-premium-border/20 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Quét AI Dinh Dưỡng</h1>
          <p className="text-xs text-gray-400">Chọn hoặc chụp ảnh món ăn của bạn để phân tích.</p>
        </div>
      </div>

      {!isLoading && !scanResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload / Camera Box */}
          <GlassCard className="flex flex-col items-center justify-center p-8 min-h-[380px] border-dashed border-2 border-premium-border/60 relative overflow-hidden">
            {isCameraActive ? (
              <div className="w-full h-full flex flex-col gap-4 items-center">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl aspect-[4/3] object-cover bg-black" />
                <button
                  onClick={capturePhoto}
                  className="px-6 py-3 bg-premium-green text-white font-extrabold rounded-xl shadow-glow transition hover:scale-103"
                >
                  Chụp ảnh
                </button>
              </div>
            ) : previewUrl ? (
              <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-premium-border/30">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 bg-premium-border/40 hover:bg-premium-border/60 text-gray-300 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Đổi ảnh
                  </button>
                  <button
                    onClick={startCamera}
                    className="flex-1 py-3 bg-premium-border/40 hover:bg-premium-border/60 text-gray-300 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Bật Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <div className="p-4 bg-premium-green/10 text-premium-green rounded-3xl animate-pulse-glow">
                  <Camera className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Chụp hoặc Tải ảnh lên</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">AI sẽ phân tích đĩa thức ăn hoặc bao bì dinh dưỡng của sản phẩm.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 px-4 bg-premium-border/40 hover:bg-premium-border/60 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Chọn ảnh Gallery
                  </button>
                  <button
                    onClick={startCamera}
                    className="flex-1 py-3 px-4 bg-premium-green hover:bg-premium-green/85 text-white font-extrabold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-glow"
                  >
                    <Camera className="w-4 h-4" /> Chụp Camera
                  </button>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
          </GlassCard>

          {/* Action / Help box */}
          <GlassCard className="flex flex-col justify-between p-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-premium-green" /> Hướng dẫn quét tốt nhất
              </h3>
              <ul className="flex flex-col gap-3 text-sm text-gray-400">
                <li className="flex gap-2 items-start">
                  <span className="text-premium-green font-bold">1.</span> Đảm bảo ánh sáng rõ ràng, đĩa thức ăn nằm trọn trong khung hình.
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-premium-green font-bold">2.</span> Chụp nghiêng góc khoảng 45 độ để AI nhận biết rõ độ dày và thể tích đĩa thức ăn.
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-premium-green font-bold">3.</span> AI cũng có thể đọc bảng nutrition facts đằng sau bao bì sản phẩm (quét OCR).
                </li>
              </ul>
            </div>
            
            {previewUrl && (
              <button
                onClick={handleScan}
                className="w-full py-4 bg-premium-green hover:bg-premium-green/85 text-white font-black rounded-2xl shadow-glow transition hover:scale-102 mt-8 flex items-center justify-center gap-2"
              >
                Bắt đầu phân tích AI
              </button>
            )}
          </GlassCard>
        </div>
      )}

      {/* Loading Screen */}
      {isLoading && (
        <GlassCard className="flex flex-col items-center justify-center py-20 min-h-[400px] gap-8 relative overflow-hidden">
          <div className="relative w-64 h-48 rounded-2xl overflow-hidden border border-premium-border/50 shadow-2xl">
            <img src={previewUrl || ''} className="w-full h-full object-cover opacity-60" alt="Scanning" />
            <ScanLine />
          </div>
          
          <div className="flex flex-col items-center gap-2 text-center">
            <RefreshCw className="w-10 h-10 text-premium-green animate-spin" />
            <h3 className="text-xl font-bold text-white mt-4">{loadingTexts[loadingTextIndex]}</h3>
            <p className="text-xs text-gray-400">Hệ thống xử lý mất từ 3-5 giây để đưa ra kết quả phân tích đầy đủ.</p>
          </div>
        </GlassCard>
      )}

      {/* Result Screen (Khi đã có scanResult) */}
      {scanResult && !isLoading && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Food Image Overlay */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="relative aspect-[4/3] md:aspect-[3/4] rounded-3xl overflow-hidden border border-premium-border/30 shadow-2xl">
                <img src={scanResult.image_url || previewUrl || ''} className="w-full h-full object-cover" alt={scanResult.food_name} />
                <div className="absolute top-4 left-4 bg-premium-dark/85 backdrop-blur-md border border-premium-border/50 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-2xl">
                  ❤️ Điểm sức khỏe: {scanResult.health_score}/10
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setScanResult(null);
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  className="flex-1 py-3 bg-premium-border/40 hover:bg-premium-border/60 text-gray-300 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 border border-premium-border/20"
                >
                  <RefreshCw className="w-4 h-4" /> Quét ảnh khác
                </button>
              </div>
            </div>

            {/* Right Column: Nutrition Cards, Advice, Ingredients */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Food Info Header */}
              <GlassCard className="flex flex-col gap-4">
                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      value={editForm.food_name}
                      onChange={(e) => setEditForm({ ...editForm, food_name: e.target.value })}
                      className="bg-premium-border/30 border border-premium-border/60 text-white rounded-xl px-4 py-2 text-lg font-bold"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Kcal</label>
                        <input
                          type="number"
                          value={editForm.calories}
                          onChange={(e) => setEditForm({ ...editForm, calories: Number(e.target.value) })}
                          className="w-full bg-premium-border/30 border border-premium-border/60 text-white rounded-lg px-2 py-1 text-sm text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Carbs (g)</label>
                        <input
                          type="number"
                          value={editForm.carbs}
                          onChange={(e) => setEditForm({ ...editForm, carbs: Number(e.target.value) })}
                          className="w-full bg-premium-border/30 border border-premium-border/60 text-white rounded-lg px-2 py-1 text-sm text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Protein (g)</label>
                        <input
                          type="number"
                          value={editForm.protein}
                          onChange={(e) => setEditForm({ ...editForm, protein: Number(e.target.value) })}
                          className="w-full bg-premium-border/30 border border-premium-border/60 text-white rounded-lg px-2 py-1 text-sm text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Fat (g)</label>
                        <input
                          type="number"
                          value={editForm.fat}
                          onChange={(e) => setEditForm({ ...editForm, fat: Number(e.target.value) })}
                          className="w-full bg-premium-border/30 border border-premium-border/60 text-white rounded-lg px-2 py-1 text-sm text-center font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-premium-border/40 rounded-lg text-xs font-bold text-gray-400">Hủy</button>
                      <button onClick={handleSaveEdit} className="px-3 py-1 bg-premium-green rounded-lg text-xs font-bold text-white">Lưu</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-white">{scanResult.food_name}</h2>
                      <span className="text-xs font-bold text-gray-400 mt-1 block">Khối lượng ước tính: {scanResult.weight_grams}g</span>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3.5 py-1.5 bg-premium-border/40 hover:bg-premium-border/60 text-gray-300 font-bold rounded-xl text-xs border border-premium-border/20 transition-all"
                    >
                      Sửa kết quả
                    </button>
                  </div>
                )}

                {/* Macronutrient mini cards */}
                <div className="grid grid-cols-4 gap-3 mt-2">
                  <div className="bg-premium-border/30 p-3 rounded-2xl text-center border border-premium-border/20">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Calories</span>
                    <span className="text-lg font-black text-white mt-1 block">{scanResult.calories} kcal</span>
                  </div>
                  <div className="bg-premium-border/30 p-3 rounded-2xl text-center border border-premium-border/20">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Tinh bột</span>
                    <span className="text-lg font-black text-white mt-1 block">{scanResult.carbs}g</span>
                  </div>
                  <div className="bg-premium-border/30 p-3 rounded-2xl text-center border border-premium-border/20">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Chất đạm</span>
                    <span className="text-lg font-black text-white mt-1 block">{scanResult.protein}g</span>
                  </div>
                  <div className="bg-premium-border/30 p-3 rounded-2xl text-center border border-premium-border/20">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Chất béo</span>
                    <span className="text-lg font-black text-white mt-1 block">{scanResult.fat}g</span>
                  </div>
                </div>
              </GlassCard>

              {/* Lời khuyên sức khỏe AI */}
              <GlassCard className="flex gap-4 items-start">
                <div className="p-3 bg-premium-green/10 text-premium-green rounded-2xl shrink-0">
                  <Heart className="w-6 h-6 fill-premium-green" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-lg font-bold text-white">Đánh giá sức khỏe & Lời khuyên AI</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{scanResult.health_advice}</p>
                </div>
              </GlassCard>

              {/* Ingredients List */}
              <GlassCard className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-bold text-white">Thành phần chi tiết</h4>
                  <button
                    onClick={() => setShowAddIngredient(true)}
                    className="px-3.5 py-1.5 bg-premium-green/10 hover:bg-premium-green/20 text-premium-green font-bold rounded-xl text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4" /> Thêm thành phần
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {scanResult.ingredients && scanResult.ingredients.map((ing: any) => (
                    <div key={ing.id} className="flex justify-between items-center bg-premium-border/25 p-3.5 rounded-2xl border border-premium-border/20">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${ing.is_healthy ? 'bg-premium-green' : 'bg-premium-rose'}`} />
                        <span className="text-sm font-bold text-white">{ing.ingredient_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-bold bg-premium-border/40 px-2 py-0.5 rounded-lg">{ing.amount || 'Không rõ'}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${ing.is_healthy ? 'bg-premium-green/10 text-premium-green' : 'bg-premium-rose/10 text-premium-rose'}`}>
                          {ing.is_healthy ? 'Tốt' : 'Hạn chế'}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {(!scanResult.ingredients || scanResult.ingredients.length === 0) && (
                    <span className="text-xs text-gray-500 italic text-center py-4">Chưa có thành phần chi tiết được chèn.</span>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Ingredient */}
      {showAddIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-premium-dark/85 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm glassmorphism rounded-3xl p-6 flex flex-col gap-4"
          >
            <h3 className="text-xl font-bold text-white">Thêm thành phần thủ công</h3>
            
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-bold text-gray-400">Tên nguyên liệu *</label>
              <input
                type="text"
                placeholder="Rau thơm, Trứng ốp la..."
                value={newIngredient.ingredient_name}
                onChange={(e) => setNewIngredient({ ...newIngredient, ingredient_name: e.target.value })}
                className="w-full px-4 py-3 bg-premium-border/30 border border-premium-border/50 text-white rounded-2xl text-sm focus:outline-none focus:border-premium-green/60 focus:bg-premium-border/50 transition-all font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400">Hàm lượng (g, muỗng...)</label>
              <input
                type="text"
                placeholder="50g, 1 quả..."
                value={newIngredient.amount}
                onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                className="w-full px-4 py-3 bg-premium-border/30 border border-premium-border/50 text-white rounded-2xl text-sm focus:outline-none focus:border-premium-green/60 focus:bg-premium-border/50 transition-all font-medium"
              />
            </div>

            <div className="flex items-center justify-between px-1 mt-2">
              <span className="text-xs font-bold text-gray-400">Nguyên liệu tốt cho sức khỏe?</span>
              <button
                onClick={() => setNewIngredient({ ...newIngredient, is_healthy: !newIngredient.is_healthy })}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  newIngredient.is_healthy ? 'bg-premium-green/10 text-premium-green border border-premium-green/30' : 'bg-premium-rose/10 text-premium-rose border border-premium-rose/30'
                }`}
              >
                {newIngredient.is_healthy ? 'Tốt (Healthy)' : 'Không (Unhealthy)'}
              </button>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddIngredient(false)}
                className="flex-1 py-3 bg-premium-border/40 hover:bg-premium-border/60 text-gray-300 font-bold rounded-xl transition text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleAddIngredient}
                className="flex-1 py-3 bg-premium-green hover:bg-premium-green/85 text-white font-extrabold rounded-xl transition text-sm shadow-glow"
              >
                Xác nhận thêm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
