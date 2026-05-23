import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NetworkClient {
  late final Dio dio;
  
  # Cấu hình IP cục bộ. 10.0.2.2 là localhost trên Android Emulator kết nối với máy chủ host.
  # Trong production, đổi thành URL của Railway (Ví dụ: https://your-backend-railway.app)
  static const String baseUrl = "http://10.0.2.2:8000/api";

  NetworkClient() {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    # Interceptor tự động nạp Token
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        if (e.response?.statusCode == 401) {
          # Xử lý Logout hoặc Clear Token khi Unauthorized
          SharedPreferences.getInstance().then((prefs) {
            prefs.remove('token');
            prefs.remove('user');
          });
        }
        return handler.next(e);
      },
    ));
  }
}
export 'package:dio/dio.dart';
export 'package:shared_preferences/shared_preferences.dart';
