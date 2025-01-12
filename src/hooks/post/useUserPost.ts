import { useState, useEffect, useCallback } from "react";
import { Post } from "@/types/post";
import { PostService } from "@/services/post.service";
import { toast } from "react-toastify";

export function useUserPosts(userId: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPosts = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await PostService.getUserPost(userId);
      if (response.code === 200) {
        setPosts(response.data.posts || []);
      } else {
        setError(response.message || "获取用户帖子失败");
      }
    } catch (err) {
      setError("获取用户帖子时发生错误");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 首次加载和 userId 变化时获取数据
  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);
  const deleteUserPost = async (postId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await PostService.deleteUserPost(postId, userId);
      if (response.code === 200) {
        toast.success("删除成功");
        setPosts(posts.filter((post) => post._id !== postId));
      } else {
        toast.error("删除失败");
        setError(response.message || "删除帖子失败");
      }
    } catch (err) {
      setError("删除帖子时发生错误");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return {
    posts,
    isLoading,
    error,
    setPosts,
    fetchUserPosts,
    deleteUserPost,
  };
}
