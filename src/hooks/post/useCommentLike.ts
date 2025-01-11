import * as React from "react";
import { Comment } from "@/types/comment";
import { toast } from "react-toastify";
import { CommentService } from "@/services/comment.service";

export function useCommentLike(
  comments: Comment[],
  currentUserHandle: string,
  updateComments: (updatedComments: Comment[]) => void
) {
  const [processingComments, setProcessingComments] = React.useState<Set<string>>(new Set());

  const isCommentLiked = React.useCallback(
    (comment: Comment) => {
      return currentUserHandle ? comment.likes.includes(currentUserHandle) : false;
    },
    [currentUserHandle]
  );

  const toggleCommentLike = React.useCallback(
    async (commentId: string) => {
      if (processingComments.has(commentId)) {
        return; // 防止重复操作
      }

      const comment = comments.find((c) => c._id === commentId);
      if (!comment) return;

      const isLiked = isCommentLiked(comment);
      const originalLikes = [...comment.likes];
      const originalStats = { ...comment.stats };

      setProcessingComments((prev) => new Set([...prev, commentId]));

      try {
        // 乐观更新
        if (isLiked) {
          comment.likes = comment.likes.filter((id) => id !== currentUserHandle);
          if (comment.stats) {
            comment.stats.likes = Math.max(0, comment.stats.likes - 1);
          }
        } else {
          comment.likes.push(currentUserHandle);
          if (comment.stats) {
            comment.stats.likes += 1;
          }
        }

        updateComments([...comments]);

        // 发送API请求
        const response = await CommentService.toggleLike(commentId, currentUserHandle);

        // 使用服务器返回的实际数据更新
        if (response.code === 200) {
          const updatedComment = comments.find((c) => c._id === commentId);
          if (updatedComment) {
            updatedComment.likes = response.data.likes;
            updatedComment.stats = response.data.stats;
            updateComments([...comments]);
          }
        }
      } catch (error) {
        // 错误回滚
        const failedComment = comments.find((c) => c._id === commentId);
        if (failedComment) {
          failedComment.likes = originalLikes;
          failedComment.stats = originalStats;
          updateComments([...comments]);
        }
        toast.error("操作失败，请重试");
      } finally {
        setProcessingComments((prev) => new Set([...prev].filter((id) => id !== commentId)));
      }
    },
    [comments, currentUserHandle, isCommentLiked, updateComments]
  );

  return {
    isCommentLiked,
    processingComments,
    toggleCommentLike,
  };
}
