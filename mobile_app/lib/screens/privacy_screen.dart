import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'login_screen.dart';

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.location_on_outlined, size: 80, color: Colors.blueAccent),
              const SizedBox(height: 32),
              const Text(
                "Uso de Ubicación",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              const Text(
                "Esta aplicación recoge datos de ubicación incluso cuando la app está cerrada o en segundo plano para permitir que el administrador rastree tu posición durante tu jornada laboral.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, color: Colors.black54),
              ),
              const SizedBox(height: 16),
              const Text(
                "La ubicación SÓLO se rastrea cuando pulsas 'Iniciar Jornada' y se detiene automáticamente al pulsar 'Terminar Jornada'.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    final prefs = await SharedPreferences.getInstance();
                    await prefs.setBool('seen_privacy', true);
                    
                    if (context.mounted) {
                      Navigator.pushReplacement(
                        context, 
                        MaterialPageRoute(builder: (_) => const LoginScreen())
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blueAccent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text("ENTENDIDO Y ACEPTAR"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
