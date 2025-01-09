import { useState, useEffect, useCallback } from "react";
import { Post, PostResponse } from "@/types/post";

export function usePosts(initialPosts: Post[] = []) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // 获取帖子数据
      const response = await fetch("/api/v1/posts");
      const data = (await response.json()) as PostResponse;

      if (data.code === 200 && data.data.posts) {
        // 处理帖子数据
      } else {
        setError(data.msg || "获取帖子失败");
      }
    } catch (err) {
      setError("获取帖子时发生错误");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 首次加载时获取数据
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
  };
}
