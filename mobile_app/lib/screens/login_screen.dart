import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  void _login() async {
    setState(() => _isLoading = true);
    final api = Provider.of<ApiService>(context, listen: false);
    final error = await api.login(_emailController.text, _passwordController.text);
    
    setState(() => _isLoading = false);
    
    if (error == null) {
      if (mounted) Navigator.pushReplacementNamed(context, '/dashboard');
    } else {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo Area
              Container(
                height: 120,
                width: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.black.withOpacity(0.5),
                  border: Border.all(color: const Color(0xFF00ffa3), width: 2),
                  boxShadow: [
                    BoxShadow(color: const Color(0xFF00ffa3).withOpacity(0.3), blurRadius: 20, spreadRadius: 5)
                  ]
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Image.asset('assets/mml_logo.png', fit: BoxFit.contain), 
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                "MML-CONTROL",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 28, 
                  fontWeight: FontWeight.w900, 
                  letterSpacing: 3.0,
                  color: Colors.white,
                  shadows: [Shadow(color: Color(0xFF00ffa3), blurRadius: 10)]
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "ACCESO REPARTIDORES",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF00ffa3).withOpacity(0.8), letterSpacing: 2.0),
              ),
              const SizedBox(height: 48),
              
              // Inputs
              TextField(
                controller: _emailController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'EMAIL',
                  prefixIcon: Icon(Icons.email_outlined, color: Color(0xFF00ffa3)),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                obscureText: true,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'CONTRASEÑA',
                  prefixIcon: Icon(Icons.lock_outline, color: Color(0xFF00ffa3)),
                ),
              ),
              const SizedBox(height: 40),
              
              // Button
              ElevatedButton(
                onPressed: _isLoading ? null : _login,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                ),
                child: _isLoading 
                  ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.black)) 
                  : const Text("INICIAR SISTEMA"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
