export interface RegisterData {
  username: string;
  email: string;
  code: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  password: string;
}

export interface AuthResponseData {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
}

export interface AuthError {
  code: number;
  message: string;
}
