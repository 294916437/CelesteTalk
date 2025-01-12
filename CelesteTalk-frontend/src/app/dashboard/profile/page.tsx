"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Profile } from "@/types/profile";
import { ProfileHeader } from "@/components/business/profile-header";
import { ProfileTabs } from "@/components/business/profile-tabs";
import { Follow } from "@/components/business/follow";
import { UserPosts } from "@/components/business/user-posts";
import { PostDetails } from "@/components/business/post-details";
import { useUserStore } from "@/store/user.store";
import { Post } from "@/types/post";
import { useUserPosts } from "@/hooks/post/useUserPost";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost_Id, setSelectedPost_Id] = useState<string | null>(null);
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
        username: user.username,
        handle: user._id,
        avatar: user.avatar,
      }
    : null;
  useEffect(() => {
    const post_Id = searchParams.get("post_Id");
    if (post_Id) {
      setSelectedPost_Id(post_Id);
    }
  }, [searchParams]);
  const handlePostClick = (post: Post) => {
    setSelectedPost_Id(post._id);
    router.push(`/dashboard?post_Id=${post._id}`);
  };
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
              onPostClick={handlePostClick}
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
