import * as React from "react";
import { Post } from "@/types/post";
import { PostService } from "@/services/post.service";

export function usePostLike(
  posts: Post[],
  currentUserHandle: string,
  updatePosts: (updatedPosts: Post[]) => void
) {
  const [processingPosts, setProcessingPosts] = React.useState<Set<string>>(new Set());

  const isPostLiked = React.useCallback(
    (post: Post) => post.likes.includes(currentUserHandle),
    [currentUserHandle]
  );

  const toggleLike = React.useCallback(
    async (postId: string) => {
      if (!currentUserHandle) {
        return;
      }

      if (processingPosts.has(postId)) return;

      const post = posts.find((p) => p._id === postId);
      if (!post) return;

      setProcessingPosts((prev) => new Set([...prev, postId]));

      try {
        // 1. 确定当前点赞状态
        const isCurrentlyLiked = post.likes.includes(currentUserHandle);
        const originalLikes = [...post.likes];

        // 2. 乐观更新
        updatePosts(
          posts.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  likes: isCurrentlyLiked
                    ? p.likes.filter((id) => id !== currentUserHandle)
                    : [...p.likes, currentUserHandle],
                }
              : p
          )
        );

        // 3. API 请求
        if (isCurrentlyLiked) {
          await PostService.unlikePost(postId, currentUserHandle);
        } else {
          await PostService.likePost(postId, currentUserHandle);
        }
      } catch (error) {
        // 4. 发生错误时回滚到原始状态
        const failedPost = posts.find((p) => p._id === postId);
        if (failedPost) {
          updatePosts(
            posts.map((p) =>
              p._id === postId
                ? {
                    ...p,
                    likes: failedPost.likes.includes(currentUserHandle)
                      ? []
                      : [currentUserHandle],
                  }
                : p
            )
          );
        }
      } finally {
        // 5. 清理处理状态
        setProcessingPosts((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    },
    [posts, currentUserHandle, updatePosts]
  );

  return {
    isPostLiked,
    processingPosts,
    toggleLike,
  };
}
