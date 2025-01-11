"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/basic/avatar";
import { Button } from "@/components/basic/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/data/dialog";
import { Textarea } from "@/components/basic/textarea";
import { Separator } from "@/components/basic/separator";
import { VisuallyHidden } from "@/components/feedback/visually-hidden";
import { Post } from "@/types/post";
import { Author } from "@/types/user";
import { Comment } from "@/types/comment";
import { getImageUrl } from "@/utils/utils";
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
  replyTo: Comment | null;
  onReply: (content: string, replyToId: string) => void;
  currentUser: Author | null;
}

export function ReplyDialog({
  open,
  onOpenChange,
  post,
  replyTo,
  onReply,
  currentUser,
}: ReplyDialogProps) {
  const [content, setContent] = React.useState("");
  const MAX_CHARS = 280;
  const remainingChars = MAX_CHARS - content.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20;

  const handleReply = () => {
    if (content.trim() && !isOverLimit) {
      onReply(content, (replyTo?._id ?? post._id) || "");
      setContent("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader className='text-xl font-semibold border-b pb-3'>
          <DialogTitle asChild>
            <VisuallyHidden>
              回复给 {replyTo ? replyTo.author?.username : post.author.username} (
              {replyTo ? replyTo.author?.handle : post.author.handle})
            </VisuallyHidden>
          </DialogTitle>
          {replyTo ? "回复评论" : "回复帖子"}
        </DialogHeader>
        <div className='relative mt-4'>
          <div className='flex gap-4'>
            <div className='flex flex-col items-center gap-2'>
              <Avatar className='h-10 w-10'>
                <AvatarImage
                  src={getImageUrl(replyTo ? replyTo.author?.avatar : post.author.avatar)}
                />
                <AvatarFallback>
                  {replyTo ? replyTo.author?.username : post.author.username}
                </AvatarFallback>
              </Avatar>
              <div className='w-0.5 flex-1 bg-border' />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='font-semibold'>
                  {replyTo ? replyTo.author?.username : post.author.username}
                </span>
                <span className='text-muted-foreground'>·</span>
                <span className='text-muted-foreground'>
                  {formatTime(replyTo ? replyTo.createdAt : post.createdAt)}
                </span>
              </div>
              <p className='mt-1 text-sm'>{replyTo ? replyTo.content : post.content}</p>
              <p className='mt-4 text-muted-foreground text-sm'>
                {replyTo ? (
                  <>
                    回复{" "}
                    <span className='text-primary font-medium'>{replyTo.author?.handle}</span>{" "}
                    的评论
                  </>
                ) : (
                  <>
                    回复 <span className='text-primary font-medium'>{post.author?.handle}</span>{" "}
                    的帖子
                  </>
                )}
              </p>
            </div>
          </div>
          <div className='flex gap-4 mt-4'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={getImageUrl(currentUser?.avatar)} />
              <AvatarFallback>{currentUser?.username}</AvatarFallback>
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
