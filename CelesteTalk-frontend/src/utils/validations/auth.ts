import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  password: z.string().min(6, { message: "密码至少6个字符" }),
});

export const registerSchema = z.object({
  username: z.string().min(2, "用户名至少需要2个字符").max(50, "用户名不能超过50个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  code: z.string().min(4, "验证码为4位"),
  password: z.string().min(6, "密码至少需要6个字符").max(50, "密码不能超过18个字符"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  code: z.string().min(4, { message: "请输入验证码" }),
  password: z.string().min(6, { message: "新密码至少6个字符" }),
});
