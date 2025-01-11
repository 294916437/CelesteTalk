import * as React from "react";
import { Comment } from "@/types/comment";
import { toast } from "react-toastify";
import { CommentService } from "@/services/comment.service";

export function useCommentLike(comments: Comment[], currentUserHandle: string) {
  const [processingComments, setProcessingComments] = React.useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = React.useState<Map<string, number>>(new Map());

  // 初始化点赞数
  React.useEffect(() => {
    const initialLikeCounts = new Map(
      comments
        .filter((comment): comment is Comment & { _id: string } => comment._id !== undefined)
        .map((comment) => [comment._id, comment.likes.length])
    );
    setLikeCounts(initialLikeCounts);
  }, [comments]);

  const isCommentLiked = React.useCallback(
    (commentId: string) => {
      const comment = comments.find((c) => c._id === commentId);
      return comment ? comment.likes.includes(currentUserHandle) : false;
    },
    [comments, currentUserHandle]
  );

  const toggleCommentLike = React.useCallback(
    async (commentId: string) => {
      if (!currentUserHandle) {
        toast.error("请先登录");
        return;
      }

      if (processingComments.has(commentId)) return;

      const comment = comments.find((c) => c._id === commentId);
      if (!comment) return;

      const isLiked = isCommentLiked(commentId);
      const originalLikes = [...comment.likes];
      const originalCount = likeCounts.get(commentId) || 0;

      setProcessingComments((prev) => new Set([...prev, commentId]));

      try {
        // 乐观更新
        comment.likes = isLiked
          ? comment.likes.filter((id) => id !== currentUserHandle)
          : [...comment.likes, currentUserHandle];

        setLikeCounts(
          (prev) =>
            new Map(prev.set(commentId, isLiked ? originalCount - 1 : originalCount + 1))
        );
        //更新帖子

        // API请求
        const response = await CommentService.toggleLike(commentId, currentUserHandle);

        // 使用服务器返回的实际数据更新
        if (response.data) {
          const updatedComment = comments.find((c) => c._id === commentId);
          if (updatedComment) {
            updatedComment.likes = response.data.likes;
            setLikeCounts((prev) => new Map(prev.set(commentId, response.data.likes.length)));
          }
        }
      } catch (error) {
        // 错误回滚
        const failedComment = comments.find((c) => c._id === commentId);
        if (failedComment) {
          failedComment.likes = originalLikes;
          setLikeCounts((prev) => new Map(prev.set(commentId, originalCount)));
        }
        toast.error("操作失败，请重试");
      } finally {
        setProcessingComments((prev) => new Set([...prev].filter((id) => id !== commentId)));
      }
    },
    [comments, currentUserHandle, isCommentLiked]
  );

  return {
    isCommentLiked,
    processingComments,
    toggleCommentLike,
    likeCounts,
  };
}
