import { useState, useEffect } from "react";
import { Profile } from "@/types/profile";
import { UserService } from "@/services/user.service";

export function useProfile(handle: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!handle) return;

      try {
        setLoading(true);
        const response = await UserService.getUser(handle);

        if (response.code === 200) {
          const user = response.data.user;
          // 构造 Profile 数据结构
          const profileData: Profile = {
            name: user.username,
            handle: user._id,
            avatar: user.avatar,
            headerImage: user.headerImage,
            bio: user.bio || "这里是个人简介",
            isVerified: true,
            createdAt: user.createdAt,
            stats: {
              following: user.following.length,
              followers: user.followers.length,
            },
          };
          setProfile(profileData);
        } else {
          setError(response.message || "获取用户信息失败");
        }
      } catch (err) {
        setError("获取用户信息失败");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [handle]);

  return { profile, loading, error };
}
