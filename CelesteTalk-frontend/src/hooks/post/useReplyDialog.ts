import { useState, useCallback } from "react";
import { Post } from "@/types/post";
import { Comment } from "@/types/comment";
import { PostService } from "@/services/post.service";
import { toast } from "react-toastify";

export interface ReplyContext {
  post: Post;
  reply?: Comment;
}

export function useReplyDialog(onSuccess?: () => void) {
  const [replyingTo, setReplyingTo] = useState<ReplyContext | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  const openReplyDialog = useCallback((post: Post, reply?: Comment) => {
    setReplyingTo({ post, reply });
    setReplyDialogOpen(true);
  }, []);

  const handleReply = useCallback(
    async (content: string, currentUserHandle: string) => {
      if (!replyingTo) return;

      try {
        const response = await PostService.createPostComment(
          replyingTo.post._id,
          currentUserHandle,
          content
        );
        if (response.code === 200) {
          toast.success("回复成功");
          setReplyDialogOpen(false);
          setReplyingTo(null);
          onSuccess?.();
        } else {
          toast.error("回复失败");
        }
      } catch (error) {
        toast.error("回复失败，请重试");
      }
    },
    [replyingTo, onSuccess]
  );

  return {
    replyingTo,
    replyDialogOpen,
    setReplyDialogOpen,
    openReplyDialog,
    handleReply,
  };
}
