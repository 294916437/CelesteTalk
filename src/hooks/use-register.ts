import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import { RegisterData, AuthError } from "@/types/auth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useRegister() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  const handleSendCode = async (email: string) => {
    if (!email) {
      toast.error("请输入邮箱地址");
      return;
    }
    try {
      setLoading(true);
      await AuthService.sendVerificationCode(email);
      toast.success("验证码已发送");
      startCountdown();
    } catch (error) {
      toast.error("验证码发送失败");
    } finally {
      setLoading(false);
    }
  };
  const register = async (data: RegisterData) => {
    setIsRegistering(true);
    try {
      const response = await AuthService.register(data);

      if (response.code === 200) {
        toast.success("注册成功！");
        // 注册成功后跳转到登录页
        router.push("/login");
      } else {
        toast.error(response.message || "注册失败，请重试");
      }
    } catch (error) {
      const err = error as AuthError;
      toast.error(err.message || "注册过程中出现错误");
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    loading,
    countdown,
    handleSendCode,
    register,
    isRegistering,
  };
}
