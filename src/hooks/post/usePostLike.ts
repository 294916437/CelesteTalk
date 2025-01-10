import { useState, useCallback, useEffect } from "react";
import { Post } from "@/types/post";
import { PostService } from "@/services/post.service";
import { toast } from "react-toastify";

export function usePostLike(
  posts: Post[],
  currentUserId?: string,
  onUpdatePost?: (postId: string, likes: string[]) => void
) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // 初始化时，根据每个帖子的 likes 数组来设置状态
  useEffect(() => {
    if (!currentUserId) return;
    // 找出当前用户点赞过的所有帖子的 _id
    const likedPostIds = new Set(
      posts.filter((post) => post.likes.includes(currentUserId)).map((post) => post._id)
    );
    setLikedPosts(likedPostIds);
  }, [posts, currentUserId]);

  const likePost = useCallback(
    async (postId: string) => {
      if (!currentUserId) return false;

      // 乐观更新：立即更新UI
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        newSet.add(postId);
        return newSet;
      });

      // 如果提供了更新回调，立即更新帖子数据
      const post = posts.find((p) => p._id === postId);
      if (post && onUpdatePost) {
        onUpdatePost(postId, [...post.likes, currentUserId]);
      }

      try {
        const response = await PostService.likePost(postId, currentUserId);
        if (response.code !== 200) {
          // 如果失败，回滚UI更新
          setLikedPosts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
          if (post && onUpdatePost) {
            onUpdatePost(postId, post.likes);
          }
          return false;
        }
        return true;
      } catch (error) {
        // 发生错误时回滚UI更新
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        if (post && onUpdatePost) {
          onUpdatePost(postId, post.likes);
        }
        return false;
      }
    },
    [currentUserId, posts, onUpdatePost]
  );

  const unlikePost = useCallback(
    async (postId: string) => {
      if (!currentUserId) return false;

      // 乐观更新：立即更新UI
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });

      // 如果提供了更新回调，立即更新帖子数据
      const post = posts.find((p) => p._id === postId);
      if (post && onUpdatePost) {
        onUpdatePost(
          postId,
          post.likes.filter((id) => id !== currentUserId)
        );
      }

      try {
        const response = await PostService.unlikePost(postId, currentUserId);
        if (response.code !== 200) {
          // 如果失败，回滚UI更新
          setLikedPosts((prev) => {
            const newSet = new Set(prev);
            newSet.add(postId);
            return newSet;
          });
          if (post && onUpdatePost) {
            onUpdatePost(postId, post.likes);
          }
          return false;
        }
        return true;
      } catch (error) {
        // 发生错误时回滚UI更新
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });
        if (post && onUpdatePost) {
          onUpdatePost(postId, post.likes);
        }
        return false;
      }
    },
    [currentUserId, posts, onUpdatePost]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!currentUserId) {
        toast.error("请先登录");
        return false;
      }
      // 查找当前帖子
      const post = posts.find((p) => p._id === postId);
      if (!post) return false;

      // 检查当前帖子的 likes 数组中是否包含用户 ID
      const hasLiked = post.likes.includes(currentUserId);

      if (hasLiked) {
        return unlikePost(postId);
      } else {
        return likePost(postId);
      }
    },
    [currentUserId, posts, likePost, unlikePost]
  );

  return {
    likedPosts,
    isLoading,
    toggleLike,
  };
}
