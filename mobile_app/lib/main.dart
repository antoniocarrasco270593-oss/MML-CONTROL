import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/privacy_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');
  final seenPrivacy = prefs.getBool('seen_privacy') ?? false;

  Widget initialScreen;
  if (!seenPrivacy) {
    initialScreen = const PrivacyScreen();
  } else if (token != null) {
    initialScreen = const DashboardScreen();
  } else {
    initialScreen = const LoginScreen();
  }

  runApp(MyApp(initialScreen: initialScreen));
}

class MyApp extends StatelessWidget {
  final Widget initialScreen;
  const MyApp({super.key, required this.initialScreen});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider(create: (_) => ApiService()),
      ],
      child: MaterialApp(
        title: 'MML-CONTROL',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF0a1512), // mml-dark
          primaryColor: const Color(0xFF00ffa3), // mml-accent
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF00ffa3),
            secondary: Color(0xFF00ffa3),
            surface: Color(0xFF112520), // mml-card
            background: Color(0xFF0a1512),
          ),
          useMaterial3: true,
          fontFamily: 'Roboto', // Default, but ensures clean look
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00ffa3),
              foregroundColor: Colors.black, // Text color on button
              textStyle: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 5,
              shadowColor: const Color(0xFF00ffa3).withOpacity(0.5),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: Colors.black.withOpacity(0.3),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF00ffa3)),
            ),
            labelStyle: const TextStyle(color: Colors.grey),
          ),
        ),
        home: initialScreen,
        routes: {
          '/login': (context) => const LoginScreen(),
          '/dashboard': (context) => const DashboardScreen(),
        },
      ),
    );
  }
}
