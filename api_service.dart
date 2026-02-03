import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // IMPORTANT: 
  // 1. For Local Dev (Emulator): Use 'http://10.0.2.2:8000'
  // 2. For Local Dev (Real Device): Use 'http://YOUR_PC_IP:8000'
  // 3. For CLOUD (Production): Use 'https://your-app-name.onrender.com'
  static const String baseUrl = 'https://mml-control-backend.onrender.com';
  final Dio _dio = Dio(BaseOptions(baseUrl: baseUrl));

  ApiService() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }

  Future<String?> login(String email, String password) async {
    try {
      final response = await _dio.post('/token', data: {
        'username': email,
        'password': password,
      }, options: Options(contentType: Headers.formUrlEncodedContentType));
      
      final token = response.data['access_token'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      return null; // No error
    } on DioException catch (e) {
      return e.response?.data['detail'] ?? 'Login failed';
    }
  }

  Future<void> startShift() async {
    await _dio.post('/shifts/start');
  }

  Future<void> endShift() async {
    await _dio.post('/shifts/end');
  }

  Future<Map<String, dynamic>?> getUserProfile() async {
    try {
      final response = await _dio.get('/users/me');
      return response.data;
    } catch (e) {
      return null;
    }
  }

  Future<void> sendLocation(double lat, double lng) async {
    try {
      await _dio.post('/location', data: {
        'latitude': lat,
        'longitude': lng,
      });
    } catch (e) {
      print("Location sync failed: $e");
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }
}
