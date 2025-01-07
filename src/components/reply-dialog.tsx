"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Post } from "@/types/post";

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

interface ReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  replyTo?: Post;
  onReply: (content: string, replyToId: string | null) => void;
  currentUser?: {
    username: string;
    avatar: string;
  };
}
//包含回复帖子和回复评论的对话框
export function ReplyDialog({
  open,
  onOpenChange,
  post,
  replyTo,
  onReply,
  currentUser = {
    username: "当前用户",
    avatar: "/placeholder-avatar.jpg",
  },
}: ReplyDialogProps) {
  const [content, setContent] = React.useState("");
  const MAX_CHARS = 280;
  const remainingChars = MAX_CHARS - content.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20;

  const handleReply = () => {
    if (content.trim() && !isOverLimit) {
      onReply(content, replyTo?._id || null);
      setContent("");
      onOpenChange(false);
    }
  };

  const targetPost = replyTo || post;
  const replyingToText = replyTo ? "回复评论" : "回复帖子";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader className='text-xl font-semibold border-b pb-3'>
          <DialogTitle asChild>
            <VisuallyHidden>
              {replyingToText} @{targetPost.author?.username}
            </VisuallyHidden>
          </DialogTitle>
          {replyingToText}
        </DialogHeader>
        <div className='relative mt-4'>
          <div className='flex gap-4'>
            <div className='flex flex-col items-center gap-2'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src={targetPost.author?.avatar} />
                <AvatarFallback>{targetPost.author?.username[0]}</AvatarFallback>
              </Avatar>
              <div className='w-0.5 flex-1 bg-border' />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='font-semibold'>{targetPost.author?.username}</span>
                <span className='text-muted-foreground'>{targetPost.author?.handle}</span>
                <span className='text-muted-foreground'>·</span>
                <span className='text-muted-foreground'>
                  {formatTime(targetPost.updatedAt)}
                </span>
              </div>
              <p className='mt-1 text-sm'>{targetPost.content}</p>
              <p className='mt-4 text-muted-foreground text-sm'>
                回复给 <span className='text-primary'>{targetPost.author?.handle}</span>
              </p>
            </div>
          </div>
          <div className='flex gap-4 mt-4'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.username[0]}</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <Textarea
                placeholder='发送你的回复'
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className='min-h-[100px] resize-none border-0 focus-visible:ring-0 p-0 text-base'
              />
              <Separator className='my-4' />
              <div className='flex items-center justify-between'>
                <div className='flex-1' />
                <div className='flex items-center gap-4'>
                  {content.length > 0 && (
                    <span
                      className={`text-sm ${isNearLimit ? "text-yellow-500" : ""} ${
                        isOverLimit ? "text-red-500" : ""
                      }`}>
                      {remainingChars}
                    </span>
                  )}
                  <Button
                    onClick={handleReply}
                    disabled={isOverLimit || content.length === 0}
                    className='rounded-full px-6'>
                    回复
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
