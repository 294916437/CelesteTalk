import { useState } from "react";

export function usePostInteraction() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  const toggleLike = async (postId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method: "PUT",
      });
      const data = await response.json();
      if (data.code === 200) {
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          if (prev.has(postId)) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const toggleRepost = async (postId: string, content: string) => {
    try {
      const response = await fetch(`/api/v1/posts/${postId}/repost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          authorId: "currentUserId", // 需要从认证状态获取
        }),
      });
      const data = await response.json();
      // 处理响应...
    } catch (error) {
      console.error("Failed to repost:", error);
    }
  };

  const toggleBookmark = (postId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setBookmarkedPosts((prev) => {
      const newSet = new Set(prev);
      if (prev.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  return {
    likedPosts,
    bookmarkedPosts,
    toggleLike,
    toggleRepost,
    toggleBookmark,
  };
}
