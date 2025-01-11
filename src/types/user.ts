export interface UserStatus {
  isActive: boolean;
  isBanned: boolean;
  lastLoginAt: string;
}

export interface UserSettings {
  language: string;
  theme: "light" | "dark";
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface User {
  _id: string;
  username: string;
  email: string;
  status: UserStatus;
  settings: UserSettings;
  avatar: string;
  headerImage: string;
  bio: string;
  following: string[];
  followers: string[];
  postsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface Author {
  username: string;
  handle: string;
  avatar: string;
}
export interface editProfile {
  name: string;
  handle: string;
  avatar: string;
  headerImage?: string;
  bio: string;
}
// 用于登录响应的数据类型
export interface LoginResponse {
  code: number;
  msg: string;
  data: {
    user: User;
    token: string;
  };
}

// 用于注册请求的数据类型
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  code: string;
}

// 用于更新用户信息的数据类型
export interface UpdateUserData
  extends Partial<Omit<User, "_id" | "email" | "createdAt" | "updatedAt">> {}
