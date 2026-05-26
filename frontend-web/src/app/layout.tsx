import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'NutriAI - Quét Dinh Dưỡng Thực Phẩm Thông Minh',
  description: 'Ứng dụng AI thông minh tự động quét và phân tích calories, Carb, Protein, Fat và chỉ số Healthy Score của món ăn chỉ qua một bức ảnh.',
  keywords: ['AI Nutrition', 'Cal AI', 'Quét calo đồ ăn', 'Phân tích dinh dưỡng', 'Ăn kiêng giảm cân'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-premium-dark text-gray-100 min-h-screen flex flex-col">
        {/* Navbar responsive dùng chung cho toàn ứng dụng */}
        <Navbar />
        
        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-6">
          {children}
        </main>

        {/* Nhúng Eruda Console di động động khi có tham số debug=true */}
        <Script id="mobile-eruda-debug" strategy="afterInteractive">
          {`
            (function () {
              if (typeof window !== 'undefined' && window.location.search.includes('debug=true')) {
                var script = document.createElement('script');
                script.src = '//cdn.jsdelivr.net/npm/eruda';
                script.onload = function () {
                  eruda.init();
                };
                document.body.appendChild(script);
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
