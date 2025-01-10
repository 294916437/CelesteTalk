import { useState } from "react";
import { UserService } from "@/services/user.service";
import { EmailService } from "@/services/email.service";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import type { ResetPasswordData } from "@/types/auth";

export function usePassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

  const handleSendEmailCode = async (email: string) => {
    if (!email) {
      toast.error("请输入邮箱地址");
      return;
    }
    try {
      setLoading(true);
      await EmailService.sendVerifyCode(email, "reset-password");
      toast.success("验证码已发送");
      startCountdown();
    } catch (error) {
      toast.error("验证码发送失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ResetPasswordData) => {
    try {
      setLoading(true);
      await UserService.password(data);
      toast.success("密码重置成功");
      router.push("/login");
    } catch (error) {
      toast.error("密码重置失败");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    countdown,
    handleSendEmailCode,
    handleSubmit,
  };
}
