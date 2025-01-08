"use client";

import * as React from "react";
import { usePostInteraction } from "@/hooks/post/usePostInteraction";
import { useTimeFormat } from "@/hooks/post/useTimeFormat";
import { useReplyDialog } from "@/hooks/post/useReplyDialog";
import { useImagePreview } from "@/hooks/post/useImagePreview";
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/basic/avatar";
import { Button } from "@/components/basic/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/basic/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/feedback/dropdown-menu";
import { VideoPlayer } from "@/components/business/video-player";
import { ReplyDialog } from "@/components/business/reply-dialog";
import { ImagePreview } from "@/components/business/image-preview";
import { cn } from "@/utils/utils";
import { Post } from "@/types/post";

interface PostListProps {
  initialPosts: Post[];
  onPostClick: (post: Post) => void;
  onRefresh?: () => Promise<void>; // 添加刷新回调
  isLoading?: boolean;
  error?: string | null;
}

export function PostList({
  initialPosts,
  onPostClick,
  onRefresh,
  isLoading = false,
  error = null,
}: PostListProps) {
  const { likedPosts, bookmarkedPosts, toggleLike, toggleBookmark } = usePostInteraction();
  const { replyingTo, replyDialogOpen, setReplyDialogOpen, openReplyDialog, handleReply } =
    useReplyDialog();
  const {
    previewImages,
    initialImageIndex,
    isPreviewOpen,
    setIsPreviewOpen,
    handleImageClick,
  } = useImagePreview();

  // 处理点赞
  const handleLike = async (postId: string, event: React.MouseEvent) => {
    event.stopPropagation();
  };

  if (isLoading) {
    return <div className='flex justify-center p-4'>加载中...</div>;
  }

  if (error) {
    return (
      <div className='flex flex-col items-center p-4 text-red-500'>
        <p>{error}</p>
        {onRefresh && (
          <button className='mt-2 text-blue-500 hover:underline' onClick={onRefresh}>
            重试
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col divide-y divide-border'>
        {initialPosts.map((post) => (
          <article
            key={post._id}
            className='p-4 transition-colors duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer'
            onClick={() => onPostClick(post)}>
            {/* Post Content */}
            <div className='flex gap-4'>
              {/* Avatar Section */}
              <Avatar className='h-10 w-10 transition-transform duration-200 hover:scale-105'>
                <AvatarImage src={post.author?.avatar} />
                <AvatarFallback>{post.author?.username}</AvatarFallback>
              </Avatar>

              {/* Main Content Section */}
              <div className='flex-1 space-y-2'>
                {/* Header */}
                <div className='flex items-start justify-between'>
                  {/* Author Info */}
                  <div className='flex flex-wrap items-center gap-1'>
                    <span className='font-semibold hover:underline cursor-pointer'>
                      {post.author?.username}
                    </span>
                    <span className='text-muted-foreground'>{post.author?.username}</span>
                    <span className='text-muted-foreground'>·</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className='text-muted-foreground hover:underline cursor-pointer transition-colors'>
                            {useTimeFormat(post.updatedAt)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side='bottom'
                          className='bg-popover/95 backdrop-blur-sm'>
                          {new Date(post.updatedAt).toLocaleString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0 transition-colors duration-200 hover:bg-muted/80'
                        onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='end'
                      className='w-[180px] bg-bg-100 border-border animate-in slide-in-from-top-2 duration-200'>
                      <DropdownMenuItem className='text-text-100 cursor-pointer transition-colors duration-200'>
                        复制链接
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-text-100 cursor-pointer transition-colors duration-200'>
                        分享
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className='bg-border' />
                      <DropdownMenuItem className='text-destructive cursor-pointer transition-colors duration-200 hover:text-destructive hover:bg-destructive/10'>
                        举报
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Post Content */}
                <p className='text-sm'>{post.content}</p>

                {/* Media Content */}
                {post.media && post.media.length > 0 && (
                  <div
                    className={cn(
                      "mt-2 grid gap-2 max-w-2xl mx-auto",
                      post.media.length === 1 && "grid-cols-1",
                      post.media.length === 2 && "grid-cols-2",
                      post.media.length === 3 && "grid-cols-2",
                      post.media.length === 4 && "grid-cols-2"
                    )}>
                    {post.media.map((media, index) =>
                      media.type === "image" ? (
                        <div
                          key={index}
                          className={cn(
                            "relative group cursor-pointer",
                            post.media!.length === 3 && index === 0 && "col-span-2"
                          )}
                          onClick={(e) => handleImageClick(post, index, e)}>
                          <img
                            src={media.url}
                            alt=''
                            className='rounded-lg w-full h-auto object-contain transition-transform duration-200 hover:brightness-90 max-h-[512px]'
                          />
                        </div>
                      ) : (
                        <div
                          key={index}
                          className={cn(
                            post.media!.length === 1 && "col-span-2",
                            post.media!.length === 3 && index === 0 && "col-span-2"
                          )}
                          onClick={(e) => e.stopPropagation()}>
                          <VideoPlayer src={media.url} />
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Interaction Buttons */}
                <div className='flex gap-4 pt-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={(e) => handleLike(post._id, e)}
                    className={`h-8 gap-1.5 transition-all duration-200 group
                      ${
                        likedPosts.has(post._id)
                          ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                          : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                      }`}>
                    <Heart
                      className={`h-4 w-4 transition-transform duration-200 
                        ${
                          likedPosts.has(post._id)
                            ? "scale-110 fill-current"
                            : "scale-100 group-hover:scale-110"
                        }`}
                    />
                    <span className='text-xs'>
                      {post.stats.likes + (likedPosts.has(post._id) ? 1 : 0)}
                    </span>
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={(e) => {
                      e.stopPropagation();
                      openReplyDialog(post);
                    }}
                    className='h-8 gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-blue-500 hover:bg-blue-50'>
                    <MessageCircle className='h-4 w-4 transition-transform duration-200 group-hover:scale-110' />
                    <span className='text-xs'>{post.stats.comments}</span>
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={(e) => e.stopPropagation()}
                    className='h-8 gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-green-500 hover:bg-green-50'>
                    <Share2 className='h-4 w-4 transition-transform duration-200 group-hover:scale-110' />
                    <span className='text-xs'>{post.stats.shares}</span>
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={(e) => toggleBookmark(post._id, e)}
                    className={`h-8 ml-auto transition-all duration-200
                      ${
                        bookmarkedPosts.has(post._id)
                          ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          : "text-muted-foreground hover:text-blue-500 hover:bg-blue-50"
                      }`}>
                    <Bookmark
                      className={`h-4 w-4 transition-transform duration-200 
                        ${bookmarkedPosts.has(post._id) ? "fill-current" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Dialogs */}
      {replyingTo && (
        <ReplyDialog
          open={replyDialogOpen}
          onOpenChange={setReplyDialogOpen}
          post={replyingTo.post}
          replyTo={replyingTo.reply} // replyTo是回复评论的场景
          onReply={handleReply}
        />
      )}
      {/* Image Preview */}
      <ImagePreview
        images={previewImages}
        initialIndex={initialImageIndex}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </>
  );
}
