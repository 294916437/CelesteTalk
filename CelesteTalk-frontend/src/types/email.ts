export interface EmailVerifyRequest {
  email: string;
  type: "register" | "reset-password" | "update-email";
}

export interface EmailVerifyResponse {
  code: string;
}
