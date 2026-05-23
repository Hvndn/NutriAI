import 'dart:async';
import 'package:flutter/material';
import 'package:google_fonts/google_fonts.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({Key? key}) : super(key: key);

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  bool _isScanning = false;
  bool _showResult = false;
  int _loadingTextIndex = 0;
  Timer? _timer;

  final List<String> _loadingTexts = [
    "Đang phân tích hình ảnh thực phẩm...",
    "Đang ước lượng calories...",
    "Đang bóc tách thành phần...",
    "Sắp xong rồi!",
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animationController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startScanning() {
    setState(() {
      _isScanning = true;
      _showResult = false;
      _loadingTextIndex = 0;
    });

    _timer = Timer.periodic(const Duration(milliseconds: 1800), (timer) {
      if (_loadingTextIndex < _loadingTexts.length - 1) {
        setState(() {
          _loadingTextIndex++;
        });
      } else {
        timer.cancel();
        setState(() {
          _isScanning = false;
          _showResult = true;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      body: Stack(
        children: [
          # Camera Simulated Preview
          if (!_isScanning && !_showResult) ...[
            Container(
              width: double.infinity,
              height: double.infinity,
              color: Colors.black,
              child: Image.network(
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
                fit: BoxFit.cover,
                color: Colors.white.withOpacity(0.85),
                colorBlendMode: BlendMode.modulate,
              ),
            ),
            # Scanner Overlay
            _buildScannerOverlay(),
          ],

          # Loading Screen
          if (_isScanning) _buildLoadingScreen(),

          # Result Screen
          if (_showResult) _buildResultScreen(),

          # Back Button
          Positioned(
            top: 40,
            left: 20,
            child: CircleAvatar(
              backgroundColor: const Color(0xFF0B0F19).withOpacity(0.6),
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () {
                  if (_showResult) {
                    setState(() {
                      _showResult = false;
                    });
                  } else {
                    Navigator.pop(context);
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScannerOverlay() {
    return Stack(
      children: [
        # Khung ngắm nét đứt
        Center(
          child: Container(
            width: 280,
            height: 280,
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFF10B981), width: 3),
              borderRadius: BorderRadius.circular(30),
            ),
          ),
        ),
        
        # Thanh quét Laser xanh
        AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            double containerHeight = MediaQuery.of(context).size.height;
            double topOffset = containerHeight / 2 - 140 + (_animationController.value * 280);
            return Positioned(
              top: topOffset,
              left: MediaQuery.of(context).size.width / 2 - 140,
              child: Container(
                width: 280,
                height: 4,
                decoration: const BoxDecoration(
                  color: Color(0xFF10B981),
                  boxShadow: [
                    BoxShadow(
                      color: Color(0xFF10B981),
                      blurRadius: 15,
                      spreadRadius: 4,
                    )
                  ],
                ),
              ),
            );
          },
        ),

        # Nút Chụp Ảnh ở dưới
        Positioned(
          bottom: 50,
          left: 0,
          right: 0,
          child: Center(
            child: GestureDetector(
              onTap: _startScanning,
              child: CircleAvatar(
                radius: 40,
                backgroundColor: Colors.white.withOpacity(0.2),
                child: const CircleAvatar(
                  radius: 32,
                  backgroundColor: Color(0xFF10B981),
                  child: Icon(Icons.camera_alt, color: Colors.white, size: 28),
                ),
              ),
            ),
          ),
        )
      ],
    );
  }

  Widget _buildLoadingScreen() {
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: const Color(0xFF0B0F19).withOpacity(0.95),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
              strokeWidth: 5,
            ),
            const SizedBox(height: 30),
            Text(
              _loadingTexts[_loadingTextIndex],
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            Text(
              "Hệ thống AI đang phân tích đĩa thức ăn...",
              style: GoogleFonts.inter(
                fontSize: 13,
                color: Colors.grey[500],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildResultScreen() {
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: const Color(0xFF0B0F19),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            # Food Image Header
            Container(
              height: 300,
              width: double.infinity,
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: NetworkUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"),
                  fit: BoxFit.cover,
                ),
              ),
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFF0B0F19).withOpacity(0.0),
                      const Color(0xFF0B0F19),
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  # Food Title & Health Score
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Salad Cá Hồi Keto",
                              style: GoogleFonts.inter(
                                fontSize: 26,
                                fontWeight: FontWeight.black,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              "Khối lượng ước tính: 320g",
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: Colors.grey[400],
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, py: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF43F5E).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFF43F5E).withOpacity(0.3)),
                        ),
                        child: Text(
                          "❤️ Khỏe: 8/10",
                          style: GoogleFonts.inter(
                            color: const Color(0xFFF43F5E),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 25),

                  # Macronutrients Grid
                  Row(
                    children: [
                      Expanded(child: _buildNutritionItem("Energy", "340 kcal", const Color(0xFF10B981))),
                      const SizedBox(width: 10),
                      Expanded(child: _buildNutritionItem("Carbs", "8g", const Color(0xFF3B82F6))),
                      const SizedBox(width: 10),
                      Expanded(child: _buildNutritionItem("Protein", "26g", const Color(0xFF84CC16))),
                      const SizedBox(width: 10),
                      Expanded(child: _buildNutritionItem("Fat", "22g", const Color(0xFFF43F5E))),
                    ],
                  ),
                  const SizedBox(height: 30),

                  # AI Advice Box
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFF151C2C).withOpacity(0.65),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFF233044).withOpacity(0.4)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.favorite, color: Color(0xFFF43F5E), size: 20),
                            const SizedBox(width: 10),
                            Text(
                              "Lời khuyên của Chuyên gia AI",
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          "❤️ Món ăn giàu đạm chất lượng từ cá hồi nạc và chất xơ dồi dào từ rau xanh giúp no lâu, tăng cường cơ bắp và hỗ trợ đắc lực cho giảm cân. Điểm trừ nhẹ: Hạn chế rưới quá nhiều sốt Mayonnaise vì chứa chất béo bão hòa cao.",
                          style: GoogleFonts.inter(
                            color: Colors.grey[400],
                            fontSize: 13,
                            height: 1.5,
                          ),
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 30),

                  # Ingredients List
                  Text(
                    "Thành phần chi tiết",
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 15),
                  _buildIngredientRow("Thịt cá hồi áp chảo", "100g", true),
                  _buildIngredientRow("Rau xà lách & Cà chua bi", "150g", true),
                  _buildIngredientRow("Sốt bơ tỏi mè rang", "1 muỗng", false),
                  const SizedBox(height: 50),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNutritionItem(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF151C2C).withOpacity(0.65),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF233044).withOpacity(0.4)),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              color: Colors.grey[500],
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.inter(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.black,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIngredientRow(String name, String amount, bool isHealthy) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF151C2C).withOpacity(0.65),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF233044).withOpacity(0.4)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: isHealthy ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                name,
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              )
            ],
          ),
          Text(
            amount,
            style: GoogleFonts.inter(
              color: Colors.grey[400],
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          )
        ],
      ),
    );
  }
}

class NetworkUrl extends ImageProvider<NetworkUrl> {
  final String url;
  const NetworkUrl(this.url);

  @override
  Future<NetworkUrl> obtainKey(ImageConfiguration configuration) {
    return SynchronousFuture<NetworkUrl>(this);
  }
}
