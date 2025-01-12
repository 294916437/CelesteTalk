import { useMutation } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/user.store";

export function useLogin() {
  const { setUser, clearUser } = useUserStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await UserService.login(credentials);
      if (response.code !== 200 || !response.data) {
        throw new Error(response.message || "登录失败");
      }
      return response.data;
    },
    onSuccess: async (data) => {
      // 只设置用户信息
      setUser(data.user);

      // 给一个小延迟确保存储完成
      await new Promise((resolve) => setTimeout(resolve, 100));
      toast.success(`欢迎回来, ${data.user.username}!`);
      router.replace("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(`登录失败: ${error.message}`);
      clearUser();
    },
  });

  const logout = () => {
    clearUser();
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
