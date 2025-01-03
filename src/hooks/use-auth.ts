import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function useAuth() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await AuthService.login(credentials);
      if (response.code !== 200 || !response.data) {
        throw new Error(response.message || "登录失败");
      }
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`欢迎回来, ${data.user.username}!`);
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(`登录失败: ${error.message}`);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
    toast.info("您已安全退出登录");
  };

  return {
    login: loginMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}
