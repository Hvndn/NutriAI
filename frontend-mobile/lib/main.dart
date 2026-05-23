import 'package:flutter/material';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutri_ai/features/dashboard/dashboard_screen.dart';

void main() {
  runApp(
    const ProviderScope(
      child: NutriAIApp(),
    ),
  );
}

class NutriAIApp extends StatelessWidget {
  const NutriAIApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NutriAI',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          secondary: Color(0xFF84CC16),
          background: Color(0xFF0B0F19),
          surface: Color(0xFF151C2C),
          onBackground: Colors.white,
          onSurface: Colors.white,
        ),
      ),
      home: const DashboardScreen(),
    );
  }
}
