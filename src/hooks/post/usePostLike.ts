import { useState, useEffect, useCallback } from "react";
import { Post } from "@/types/post";
import { PostService } from "@/services/post.service";

export function usePostLike(
  posts: Post[],
  currentUserHandle: string,
  updatePostLikes: (postId: string, likes: string[]) => void
) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 初始化已点赞的帖子
  useEffect(() => {
    if (currentUserHandle && posts.length > 0) {
      const initialLikedPosts = new Set(
        posts.filter((post) => post.likes.includes(currentUserHandle)).map((post) => post._id)
      );
      setLikedPosts(initialLikedPosts);
    }
  }, [posts, currentUserHandle]);

  const toggleLike = useCallback(
    async (postId: string) => {
      setIsLoading(true);
      const post = posts.find((p) => p._id === postId);
      if (!post) return;

      const isLiked = likedPosts.has(postId);
      const newLikedPosts = new Set(likedPosts);
      const originalLikes = [...post.likes];

      try {
        // 乐观更新
        if (isLiked) {
          newLikedPosts.delete(postId);
          updatePostLikes(
            postId,
            post.likes.filter((like) => like !== currentUserHandle)
          );
        } else {
          newLikedPosts.add(postId);
          updatePostLikes(postId, [...post.likes, currentUserHandle]);
        }
        setLikedPosts(newLikedPosts);

        // 发送API请求
        if (isLiked) {
          await PostService.unlikePost(postId, currentUserHandle);
        } else {
          await PostService.likePost(postId, currentUserHandle);
        }
      } catch (error) {
        if (isLiked) {
          newLikedPosts.add(postId);
        } else {
          newLikedPosts.delete(postId);
        }
        setLikedPosts(newLikedPosts);
        updatePostLikes(postId, originalLikes);
      } finally {
        setIsLoading(false);
      }
    },
    [posts, likedPosts, currentUserHandle, updatePostLikes]
  );

  return {
    likedPosts,
    isLoading,
    toggleLike,
  };
}
