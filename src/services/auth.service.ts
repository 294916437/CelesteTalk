import { HttpClient } from "@/utils/fetch";
import { LoginData, RegisterData, ResetPasswordData, AuthResponseData } from "@/types/auth";
import { ApiResponse } from "@/types/api";

export class AuthService {
  static async login(data: LoginData): Promise<ApiResponse<AuthResponseData>> {
    return HttpClient.post<ApiResponse<AuthResponseData>>("/auth/login", { data });
  }

  static async register(data: RegisterData): Promise<ApiResponse<AuthResponseData>> {
    return HttpClient.post<ApiResponse<AuthResponseData>>("/auth/register", { data });
  }

  static async password(data: ResetPasswordData): Promise<ApiResponse<void>> {
    return HttpClient.post<ApiResponse<void>>("/auth/password", { data });
  }

  static async logout(): Promise<ApiResponse<void>> {
    return HttpClient.post<ApiResponse<void>>("/auth/logout");
  }

  static async sendVerificationCode(email: string): Promise<ApiResponse<void>> {
    return HttpClient.post<ApiResponse<void>>("/auth/verification-code", { data: { email } });
  }
}
