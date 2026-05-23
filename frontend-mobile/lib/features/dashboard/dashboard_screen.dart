import 'dart:math';
import 'package:flutter/material';
import 'package:google_fonts/google_fonts.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  # Mock data cho demo mượt mà
  double caloriesConsumed = 1250.0;
  double caloriesGoal = 2000.0;
  double carbs = 145.0;
  double protein = 85.0;
  double fat = 45.0;

  @override
  Widget build(BuildContext context) {
    double remaining = max(0.0, caloriesGoal - caloriesConsumed);
    double percentage = (caloriesConsumed / caloriesGoal);

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          "NutriAI",
          style: GoogleFonts.inter(
            fontWeight: FontWeight.black,
            fontSize: 22,
            color: Colors.white,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle_outlined, color: Colors.white, size: 28),
            onPressed: () {},
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Chào buổi sáng, Bạn! 👋",
              style: GoogleFonts.inter(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              "Cùng kiểm soát calories của bạn hôm nay nhé.",
              style: GoogleFonts.inter(
                fontSize: 14,
                color: Colors.grey[400],
              ),
            ),
            const SizedBox(height: 30),

            # Activity Ring Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF151C2C).withOpacity(0.65),
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: const Color(0xFF233044).withOpacity(0.4)),
              ),
              child: Center(
                child: CustomPaint(
                  size: const Size(200, 200),
                  painter: CalorieRingPainter(
                    percentage: percentage,
                    consumed: caloriesConsumed,
                    goal: caloriesGoal,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 25),

            # Macronutrient Cards
            Row(
              children: [
                Expanded(
                  child: _buildMacroCard(
                    "Tinh bột",
                    "${carbs.toStringAsFixed(0)}g",
                    const Color(0xFF3B82F6),
                    carbs / 250,
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: _buildMacroCard(
                    "Chất đạm",
                    "${protein.toStringAsFixed(0)}g",
                    const Color(0xFF10B981),
                    protein / 120,
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: _buildMacroCard(
                    "Chất béo",
                    "${fat.toStringAsFixed(0)}g",
                    const Color(0xFF84CC16),
                    fat / 70,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),

            # Advice Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF151C2C).withOpacity(0.65),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFF233044).withOpacity(0.4)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: const Icon(
                      Icons.star,
                      color: Color(0xFF10B981),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Đánh giá sức khỏe hôm nay",
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          "Chế độ ăn của bạn hôm nay đang rất cân đối. Hãy tiếp tục uống đủ nước và bổ sung thêm rau xanh cho bữa tối nhé!",
                          style: GoogleFonts.inter(
                            color: Colors.grey[400],
                            fontSize: 13,
                            height: 1.4,
                          ),
                        )
                      ],
                    ),
                  )
                ],
              ),
            )
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: const Color(0xFF10B981),
        icon: const Icon(Icons.camera_alt, color: Colors.white),
        label: Text(
          "Quét đồ ăn mới",
          style: GoogleFonts.inter(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildMacroCard(String label, String value, Color color, double progress) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF151C2C).withOpacity(0.65),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF233044).withOpacity(0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              color: Colors.grey[400],
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: GoogleFonts.inter(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.black,
            ),
          ),
          const SizedBox(height: 10),
          LinearProgressIndicator(
            value: min(1.0, progress),
            backgroundColor: const Color(0xFF233044).withOpacity(0.5),
            color: color,
            borderRadius: BorderRadius.circular(4),
          )
        ],
      ),
    );
  }
}

class CalorieRingPainter extends CustomPainter {
  final double percentage;
  final double consumed;
  final double goal;

  CalorieRingPainter({
    required this.percentage,
    required this.consumed,
    required this.goal,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width / 2, size.height / 2) - 10;

    # Nền vòng tròn
    final bgPaint = Paint()
      ..color = const Color(0xFF233044).withOpacity(0.3)
      ..strokeWidth = 16
      ..style = PaintingStyle.stroke;
    canvas.drawCircle(center, radius, bgPaint);

    # Vòng tròn tiến độ gradient
    final progressPaint = Paint()
      ..shader = const SweepGradient(
        colors: [
          Color(0xFF84CC16), // Lime
          Color(0xFF10B981), // Emerald
        ],
        transform: GradientRotation(-pi / 2),
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..strokeWidth = 16
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final sweepAngle = 2 * pi * percentage;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -pi / 2,
      sweepAngle,
      false,
      progressPaint,
    );

    # Viết chữ ở giữa vòng tròn
    final textPainter = TextPainter(
      text: TextSpan(
        children: [
          TextSpan(
            text: "ĐÃ NẠP\n",
            style: GoogleFonts.inter(
              color: Colors.grey[400],
              fontSize: 12,
              fontWeight: FontWeight.bold,
              height: 1.5,
            ),
          ),
          TextSpan(
            text: "${consumed.toStringAsFixed(0)}\n",
            style: GoogleFonts.inter(
              color: Colors.white,
              fontSize: 34,
              fontWeight: FontWeight.black,
              height: 1.2,
            ),
          ),
          TextSpan(
            text: "Mục tiêu ${goal.toStringAsFixed(0)} kcal",
            style: GoogleFonts.inter(
              color: Colors.grey[500],
              fontSize: 11,
              fontWeight: FontWeight.bold,
              height: 1.5,
            ),
          ),
        ],
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    );

    textPainter.layout(minWidth: size.width, maxWidth: size.width);
    textPainter.paint(
      canvas,
      Offset(0, size.height / 2 - textPainter.height / 2),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
