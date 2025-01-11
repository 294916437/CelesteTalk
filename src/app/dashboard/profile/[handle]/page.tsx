"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Post } from "@/types/post";
import { ProfileHeader } from "@/components/business/profile-header";
import { ProfileTabs } from "@/components/business/profile-tabs";
import { Follow } from "@/components/business/follow";
import { UserPosts } from "@/components/business/user-posts";
import { PostDetails } from "@/components/business/post-details";
import { useUserStore } from "@/store/user.store";
import { useProfile } from "@/hooks/user/use-profile";
// 获取用户数据

export default function ProfilePage() {
  const params = useParams();
  const user = useUserStore((state) => state.user);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // 使用 useProfile hook
  const { profile, loading, error } = useProfile(params.handle as string);

  const currentUser = user
    ? {
        username: user.username,
        handle: user._id,
        avatar: user.avatar,
      }
    : null;

  useEffect(() => {
    const postId = searchParams.get("postId");
    const handle = params.handle;
    if (postId) {
      setSelectedPostId(postId);
    }
  }, [searchParams]);

  const handleDeletePost = async (postId: string) => {
    setPosts(posts.filter((post) => post._id !== post._id));
  };
  const handlePostClick = (post: Post) => {
    setSelectedPostId(post._id);
    // 修改为带 handle 的路由
    router.push(`/dashboard/profile/${params.handle}?postId=${post._id}`);
  };
  const handleBackToProfile = () => {
    setSelectedPostId(null);
    // 返回到对应用户的 profile 页
    router.push(`/dashboard/profile/${params.handle}`);
  };

  const selectedPost = posts.find((post) => post._id === selectedPostId);

  // 修改加载状态的处理
  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error) {
    return <div className='p-8 text-center text-destructive'>{error}</div>;
  }

  if (!profile) {
    return <div className='p-8 text-center text-muted-foreground'>未找到用户信息</div>;
  }

  return (
    <div className='w-[70%] mx-auto'>
      {selectedPost ? (
        <PostDetails post={selectedPost} onBack={handleBackToProfile} />
      ) : (
        <>
          <ProfileHeader profile={profile} currentUser={currentUser} />
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <div className='divide-y divide-border'>
            {activeTab === "posts" ? (
              <UserPosts
                posts={posts}
                onPostClick={handlePostClick}
                onDeletePost={handleDeletePost}
                setPosts={setPosts}
                currentUser={currentUser}
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
      )}
    </div>
  );
}
