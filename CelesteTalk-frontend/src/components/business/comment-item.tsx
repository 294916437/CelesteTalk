"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/basic/avatar";
import { Heart, MessageCircle, Share2, Loader2 } from "lucide-react";

import { cn, getImageUrl } from "@/utils/utils";
import { Comment } from "@/types/comment";
interface CommentItemProps {
  comment: Comment;
  isLast: boolean;
  isLiked: boolean;
  isProcessing: boolean;
  likeCount: number;
  onLike: () => void;
  onReply: () => void;
  onShare: () => void;
  formatTime: (time: string) => string;
}
export function CommentItem({
  comment,
  isLast,
  isLiked,
  isProcessing,
  likeCount,
  onLike,
  onReply,
  onShare,
  formatTime,
}: CommentItemProps) {
  return (
    <div
      className={cn(
        "relative py-3 transition-colors duration-200 hover:bg-muted/30",
        !isLast && "border-b border-border"
      )}>
      {/* Avatar and author info */}
      <div className='flex gap-3'>
        <div className='flex flex-col items-center'>
          <Avatar className='h-10 w-10 transition-transform duration-200 hover:scale-105'>
            <AvatarImage src={getImageUrl(comment.author?.avatar)} />
            <AvatarFallback>{comment.author?.username}</AvatarFallback>
          </Avatar>
          {!isLast && (
            <div className='w-0.5 flex-1 bg-border/50 mt-2 relative'>
              <div className='absolute inset-0 bg-gradient-to-b from-background to-transparent h-4 top-0' />
            </div>
          )}
        </div>

        {/* Comment content and actions */}
        <div className='flex-1 min-w-0'>
          {/* Author info and timestamp */}
          <div className='flex items-center gap-1 text-sm'>
            <span className='font-bold hover:underline cursor-pointer'>
              {comment.author?.username}
            </span>
            <span className='text-muted-foreground'>·</span>
            <span className='text-muted-foreground hover:underline cursor-pointer'>
              {formatTime(comment.createdAt)}
            </span>
          </div>

          {/* Reply reference */}
          {comment.replyTo && (
            <div className='text-sm text-muted-foreground mb-1'>
              回复 <span className='text-primary'>{/* TODO: 回复用户名称 */}</span>
            </div>
          )}

          {/* Comment text */}
          <p className='mt-1 break-words text-[15px] leading-normal text-foreground/90'>
            {comment.content}
          </p>

          {/* Action buttons */}
          <div className='flex items-center gap-6 mt-2'>
            {/* Like button */}
            <button
              onClick={onLike}
              disabled={isProcessing}
              className={cn(
                "group flex items-center gap-1",
                "text-muted-foreground transition-colors duration-200",
                isLiked && "text-red-500"
              )}>
              <div className='p-1.5 -ml-1.5 rounded-full transition-colors duration-200 group-hover:bg-red-100 group-hover:text-red-500'>
                {isProcessing ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                )}
              </div>
              <span className='text-xs'>{likeCount}</span>
            </button>

            {/* Reply button */}
            <button
              onClick={onReply}
              className='group flex items-center gap-1 text-muted-foreground transition-colors duration-200'>
              <div className='p-1.5 -ml-1.5 rounded-full transition-colors duration-200 group-hover:bg-blue-100 group-hover:text-blue-500'>
                <MessageCircle className='h-4 w-4' />
              </div>
              <span className='text-xs transition-colors duration-200 group-hover:text-blue-500'>
                {comment.stats?.replies || 0}
              </span>
            </button>

            {/* Share button */}
            <button
              onClick={onShare}
              className='group flex items-center gap-1 text-muted-foreground transition-colors duration-200'>
              <div className='p-1.5 -ml-1.5 rounded-full transition-colors duration-200 group-hover:bg-green-100 group-hover:text-green-500'>
                <Share2 className='h-4 w-4' />
              </div>
              <span className='text-xs transition-colors duration-200 group-hover:text-green-500'>
                {comment.stats?.shares || 0}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
