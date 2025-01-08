import { HttpClient } from "@/utils/fetch";
import { ApiResponse } from "@/types/api";

export type EmailVerifyType = "register" | "reset-password" | "update-email";

export class EmailService {
  static async sendVerifyCode(email: string, type: EmailVerifyType): Promise<ApiResponse> {
    return HttpClient.post<ApiResponse>("/email/verify", {
      data: { email },
      params: { type },
    });
  }
}
