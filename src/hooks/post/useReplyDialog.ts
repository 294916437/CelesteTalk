import { useState } from "react";
import { Post } from "@/types/post";

interface ReplyContext {
  post: Post; // 原始帖子
  reply?: Post; // 要回复的评论（如果有）
}

export function useReplyDialog() {
  const [replyingTo, setReplyingTo] = useState<ReplyContext | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  const openReplyDialog = (post: Post, reply?: Post) => {
    setReplyingTo({ post, reply });
    setReplyDialogOpen(true);
  };

  const handleReply = async (content: string, replyToId: string | null) => {
    try {
      const response = await fetch("/api/v1/posts/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: replyingTo?.post._id,
          content,
          replyTo: replyToId,
        }),
      });

      const data = await response.json();
      if (data.code === 200) {
        setReplyDialogOpen(false);
        setReplyingTo(null);
        // TODO: 更新评论列表
      }
    } catch (error) {
      console.error("Failed to submit reply:", error);
    }
  };

  return {
    replyingTo,
    replyDialogOpen,
    setReplyDialogOpen,
    openReplyDialog,
    handleReply,
  };
}
