import * as React from "react";
import { Comment } from "@/types/comment";
import { Post } from "@/types/post";
import { Author } from "@/types/user";
import { PostService } from "@/services/post.service";
import { toast } from "react-toastify";
import { CommentService } from "@/services/comment.service";

export function useComments(post: Post, currentUser: Author | null) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [replyingTo, setReplyingTo] = React.useState<Comment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [processingComments, setProcessingComments] = React.useState<Set<string>>(new Set());
  // 获取评论列表
  const fetchComments = React.useCallback(async () => {
    if (!post._id) return;
    setIsLoading(true);
    try {
      const response = await PostService.getPostComments(post._id);
      if (response.code === 200) {
        setComments(response.data.comments);
      } else {
        toast.error(response.message || "评论加载失败，请重试");
      }
    } catch (error) {
      toast.error("评论加载失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }, [post._id]);

  // 处理评论提交
  const handleComment = React.useCallback(
    async (content: string) => {
      if (!currentUser) {
        return;
      }

      try {
        const response = await PostService.createPostComment(
          post._id,
          currentUser.handle,
          content
        );

        // 乐观更新评论列表
        const newComment: Comment = {
          _id: response.data._id,
          postId: post._id,
          content,
          authorId: currentUser.handle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          replyTo: replyingTo?._id || null,
          likes: [],
          author: {
            username: currentUser.username,
            handle: currentUser.handle,
            avatar: currentUser.avatar,
          },
          stats: {
            likes: 0,
            replies: 0,
            shares: 0,
          },
        };

        setComments((prev) => [newComment, ...prev]);
        setIsDialogOpen(false);
        setReplyingTo(null);
        toast.success("评论成功");
      } catch (error) {
        toast.error("评论失败，请重试");
      }
    },
    [post._id, currentUser, replyingTo]
  );

  // 打开回复对话框
  const openReplyDialog = React.useCallback((comment: Comment) => {
    setReplyingTo(comment);
    setIsDialogOpen(true);
  }, []);

  return {
    comments,
    fetchComments,
    isLoading,
    replyingTo,
    isDialogOpen,
    setIsDialogOpen,
    handleComment,
    openReplyDialog,
  };
}
