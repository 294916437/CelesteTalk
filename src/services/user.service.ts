import { HttpClient } from "@/utils/fetch";
import { LoginData, RegisterData, ResetPasswordData, AuthResponseData } from "@/types/auth";
import { ApiResponse } from "@/types/api";

export class UserService {
  static async login(data: LoginData): Promise<ApiResponse> {
    return HttpClient.post<ApiResponse<AuthResponseData>>("/users/login", { data });
  }

  static async register(data: RegisterData): Promise<ApiResponse> {
    return HttpClient.post<ApiResponse<AuthResponseData>>("/users/register", { data });
  }

  static async password(data: ResetPasswordData): Promise<ApiResponse> {
    return HttpClient.post<ApiResponse<void>>("/users/password", { data });
  }
  static async getUser(id: string): Promise<ApiResponse> {
    return HttpClient.get<ApiResponse<void>>(`/users/${id}`);
  }
  static async logout(): Promise<ApiResponse> {
    return HttpClient.post<ApiResponse<void>>("/users/logout");
  }
}
