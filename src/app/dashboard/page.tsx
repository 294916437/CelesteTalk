"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PostList } from "@/components/business/post-list";
import { PostDetails } from "@/components/business/post-details";
import { useUserStore } from "@/store/user.store";
import { usePosts } from "@/hooks/post/usePosts";
import { Post } from "@/types/post";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPost_Id, setSelectedPost_Id] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // 使用 hook 获取帖子数据
  const { posts, isLoading, error, fetchPosts } = usePosts();
  const user = useUserStore((state) => state.user);

  const currentUser = user
    ? {
        username: user.username,
        handle: user._id,
        avatar: user.avatar,
      }
    : null;

  // 初始化和路由参数变化时的处理
  useEffect(() => {
    setIsClient(true);
    const post_Id = searchParams.get("post_Id");
    if (post_Id) {
      setSelectedPost_Id(post_Id);
    }
  }, [searchParams]);

  //定期刷新主页的帖子列表
  useEffect(() => {
    // 首次加载数据
    fetchPosts();

    // 设置定时刷新
    const intervalId = setInterval(() => {
      fetchPosts();
    }, 60000); // 每分钟刷新一次

    return () => clearInterval(intervalId);
  }, [fetchPosts]);

  const handlePostClick = (post: Post) => {
    setSelectedPost_Id(post._id);
    router.push(`/dashboard?post_Id=${post._id}`);
  };

  const handleBackToList = () => {
    setSelectedPost_Id(null);
    router.push("/dashboard");
  };

  if (!isClient) {
    return null;
  }

  const selectedPost = posts.find((post) => post._id === selectedPost_Id);

  return (
    <>
      {selectedPost ? (
        <PostDetails post={selectedPost} onBack={handleBackToList} />
      ) : (
        <div className='mx-auto w-full max-w-3xl rounded-xl bg-background'>
          <PostList
            posts={posts}
            isLoading={isLoading}
            error={error}
            onPostClick={handlePostClick}
            currentUser={currentUser}
            onRefresh={fetchPosts} // 添加刷新功能
          />
        </div>
      )}
    </>
  );
}
