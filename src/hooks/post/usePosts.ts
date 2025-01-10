import { useState, useEffect, useCallback } from "react";
import { Post } from "@/types/post";
import { PostService } from "@/services/post.service";
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await PostService.getHomePosts();
      if (response.code === 200) {
        setPosts(response.data.posts || []);
      } else {
        setError(response.message || "获取主页帖子失败");
      }
    } catch (err) {
      setError("获取主页帖子时发生错误");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const likePost = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await PostService.getHomePosts();
      if (response.code === 200) {
        setPosts(response.data.posts || []);
      } else {
        setError(response.message || "获取主页帖子失败");
      }
    } catch (err) {
      setError("获取主页帖子时发生错误");
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
