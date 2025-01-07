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
        const processedPosts = await Promise.all(
          data.data.posts.map(async (post) => {
            // 获取作者信息
            const authorResponse = await fetch(`/api/v1/users/${post.authorId}`);
            const authorData = await authorResponse.json();

            // 获取评论数
            const commentsResponse = await fetch(`/api/v1/posts/${post._id}/comments/count`);
            const commentsData = await commentsResponse.json();

            return {
              ...post,
              author: authorData.data.user
                ? {
                    username: authorData.data.user.username,
                    handle: authorData.data.user.handle,
                    avatar: authorData.data.user.avatar || "/placeholder.svg",
                  }
                : undefined,
              stats: {
                likes: post.likes.length,
                comments: commentsData.data.count || 0,
                shares: post.repostCount,
                views: 0, // TODO: 实现浏览量统计
              },
            };
          })
        );

        setPosts(processedPosts);
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
