import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:async';
import '../api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isShiftActive = false;
  bool _isLoading = false;
  Timer? _locationTimer;
  String _statusMessage = "Esperando inicio de jornada...";

  Map<String, dynamic>? _userProfile;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final api = Provider.of<ApiService>(context, listen: false);
    final profile = await api.getUserProfile();
    if (mounted) {
      setState(() => _userProfile = profile);
    }
  }

  void _toggleShift() async {
    setState(() => _isLoading = true);
    final api = Provider.of<ApiService>(context, listen: false);
    
    try {
      if (_isShiftActive) {
        // Stop Shift
        await api.endShift();
        _locationTimer?.cancel();
        if (mounted) {
          setState(() {
            _isShiftActive = false;
            _statusMessage = "Jornada finalizada.";
          });
        }
      } else {
        // Start Shift
        _statusMessage = "Verificando permisos...";
        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          permission = await Geolocator.requestPermission();
          if (permission == LocationPermission.denied) {
            if (mounted) setState(() => _statusMessage = "Permiso de ubicación denegado.");
            return;
          }
        }
        
        if (permission == LocationPermission.deniedForever) {
             if (mounted) setState(() => _statusMessage = "Ubicación denegada permanentemente. Habilítala en ajustes.");
             return;
        }

        // 2. Start Backend Shift
        await api.startShift();
        if (mounted) {
          setState(() {
            _isShiftActive = true;
            _statusMessage = "Jornada ACTIVA. Rastreando ubicación.";
          });
        }

        // 3. Start Tracking (Simple Timer for Demo)
        _locationTimer = Timer.periodic(const Duration(seconds: 15), (timer) async {
          if (_isShiftActive) {
              try {
                Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
                await api.sendLocation(position.latitude, position.longitude);
              } catch (e) {
                print("Error tracking: $e");
              }
          }
        });
      }
    } catch (e) {
      if (mounted) setState(() => _statusMessage = "Error: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isActive = _isShiftActive;
    final primaryColor = Theme.of(context).primaryColor;

    return Scaffold(
      appBar: AppBar(
        title: const Text("MML CONTROL", style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(onPressed: _loadProfile, icon: const Icon(Icons.refresh, color: Colors.white54))
        ]
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [const Color(0xFF0a1512), const Color(0xFF050a09)],
          )
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Profile Card
                if (_userProfile != null)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFF112520),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.05)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          height: 50, width: 50,
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.3),
                            shape: BoxShape.circle,
                            border: Border.all(color: primaryColor.withOpacity(0.5))
                          ),
                          child: Center(child: Text(_userProfile!['full_name']?.substring(0,1).toUpperCase() ?? "U", style: TextStyle(color: primaryColor, fontWeight: FontWeight.bold, fontSize: 20))),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_userProfile!['full_name'] ?? 'Usuario', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            Text("ID: #${_userProfile!['worker_number'] ?? '?'}", style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 14)),
                          ],
                        )
                      ],
                    ),
                  ),
                
                const Spacer(),

                // Status Indicator
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(40),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isActive ? primaryColor.withOpacity(0.1) : Colors.red.withOpacity(0.05),
                      boxShadow: isActive ? [BoxShadow(color: primaryColor.withOpacity(0.2), blurRadius: 50, spreadRadius: 10)] : [],
                      border: Border.all(color: isActive ? primaryColor : Colors.white10, width: 2)
                    ),
                    child: Icon(
                      isActive ? Icons.location_on : Icons.location_off,
                      size: 80,
                      color: isActive ? primaryColor : Colors.grey,
                    ),
                  ),
                ),
                const SizedBox(height: 30),
                Text(
                  isActive ? "JORNADA ACTIVA" : "DESCONECTADO",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24, 
                    fontWeight: FontWeight.w900, 
                    letterSpacing: 2.0,
                    color: isActive ? Colors.white : Colors.white24,
                    shadows: isActive ? [Shadow(color: primaryColor, blurRadius: 15)] : []
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  _statusMessage,
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.6)),
                ),

                const Spacer(),

                // Action Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _toggleShift,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isActive ? Colors.red.withOpacity(0.9) : primaryColor,
                      foregroundColor: isActive ? Colors.white : Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      elevation: 10,
                      shadowColor: (isActive ? Colors.red : primaryColor).withOpacity(0.5)
                    ),
                    child: _isLoading 
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(isActive ? Icons.stop_circle_outlined : Icons.play_circle_outline),
                            const SizedBox(width: 10),
                            Text(isActive ? "FINALIZAR TURNO" : "INICIAR JORNADA", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                          ],
                        ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
