"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Profile } from "@/types/profile";
import { ProfileHeader } from "@/components/business/profile-header";
import { ProfileTabs } from "@/components/business/profile-tabs";
import { Follow } from "@/components/business/follow";
import { UserPosts } from "@/components/business/user-posts";
import { PostDetails } from "@/components/business/post-details";
import { useUserStore } from "@/store/user.store";

import { useUserPosts } from "@/hooks/post/useUserPost";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts");
  // 获取用户数据
  const user = useUserStore((state) => state.user);

  const { posts, isLoading, error, setPosts, fetchUserPosts, deleteUserPost } = useUserPosts(
    user?._id || ""
  );

  // 构建 Profile 数据
  const profile: Profile | null = user
    ? {
        name: user.username,
        handle: user._id,
        avatar: user.avatar,
        headerImage: user.headerImage,
        bio: user.bio || "这里是个人简介",
        isVerified: true,
        createdAt: new Date(user.status.lastLoginAt).toISOString().slice(0, 7),
        stats: {
          following: user.following.length,
          followers: user.followers.length,
        },
      }
    : null;

  // 当前用户信息
  const currentUser = user
    ? {
        name: user.username,
        handle: user._id,
        avatar: user.avatar,
      }
    : null;

  const handleDeletePost = async (postId: string) => {
    await deleteUserPost(postId);
  };

  if (!user || !profile || !currentUser) {
    return null;
  }

  return (
    <div className='w-[70%] mx-auto'>
      <>
        <ProfileHeader profile={profile} currentUser={currentUser} />
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className='divide-y divide-border'>
          {activeTab === "posts" ? (
            <UserPosts
              posts={posts}
              isLoading={isLoading}
              error={error}
              onDeletePost={handleDeletePost}
              setPosts={setPosts}
              currentUser={currentUser}
              onRefresh={fetchUserPosts}
            />
          ) : (
            <div className='px-4'>
              <div className='py-3'>
                <Follow />
              </div>
            </div>
          )}
        </div>
      </>
    </div>
  );
}
