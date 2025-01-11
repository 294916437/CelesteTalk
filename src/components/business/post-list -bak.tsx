"use client";

import * as React from "react";
import { usePostInteraction } from "@/hooks/post/usePostInteraction";
import { useTimeFormat } from "@/hooks/post/useTimeFormat";
import { useReplyDialog } from "@/hooks/post/useReplyDialog";
import { useImagePreview } from "@/hooks/post/useImagePreview";
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, Loader2 } from "lucide-react";
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
import { cn, getImageUrl } from "@/utils/utils";
import { Post } from "@/types/post";
import { Author } from "@/types/user";
import Link from "next/link";
import { usePostLike } from "@/hooks/post/usePostLike";
import { PostItem } from "@/components/business/post-item";
import { SearchBar } from "@/components/business/search-bar";

interface PostListProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  currentUser: Author | null;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

// 创建一个独立的时间显示组件
function TimeDisplay({ timestamp }: { timestamp: string }) {
  const formattedTime = useTimeFormat(timestamp);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='text-muted-foreground hover:underline cursor-pointer transition-colors'>
            {formattedTime}
          </span>
        </TooltipTrigger>
        <TooltipContent side='bottom' className='bg-popover/95 backdrop-blur-sm'>
          {new Date(timestamp).toLocaleString("zh-CN", {
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
  );
}

export function PostList({ posts: initialPosts, ...props }: PostListProps) {
  // 使用内部状态管理帖子数据
  const [posts, setPosts] = React.useState(initialPosts);
  // 当外部 posts 更新时同步内部状态
  React.useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // 更新帖子的点赞状态
  const updatePostLikes = React.useCallback((postId: string, likes: string[]) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post._id === postId ? { ...post, likes } : post))
    );
  }, []);

  const {
    likedPosts,
    isLoading: isLikeLoading,
    toggleLike,
  } = usePostLike(posts, props.currentUser?.handle ?? "", updatePostLikes);
  const { bookmarkedPosts, toggleBookmark } = usePostInteraction();
  const { replyingTo, replyDialogOpen, setReplyDialogOpen, openReplyDialog, handleReply } =
    useReplyDialog();
  const {
    previewImages,
    initialImageIndex,
    isPreviewOpen,
    setIsPreviewOpen,
    handleImageClick,
  } = useImagePreview();

  const handleLike = async (postId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await toggleLike(postId);
  };

  // 2. 创建渲染内容的函数
  const renderPost = React.useCallback(
    (post: Post) => {
      return (
        <article
          key={post._id}
          className='p-4 transition-colors duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer'
          onClick={() => props.onPostClick(post)}>
          <div className='flex gap-4'>
            {/* Avatar Section */}
            <Link
              href={`/dashboard/profile/${post.author.handle.slice(1)}`}
              onClick={(e) => e.stopPropagation()}>
              <Avatar className='h-10 w-10 transition-transform duration-200 hover:scale-105'>
                <AvatarImage src={getImageUrl(post.author.avatar)} />
                <AvatarFallback>{post.author.username}</AvatarFallback>
              </Avatar>
            </Link>

            {/* Main Content Section */}
            <div className='flex-1 space-y-2'>
              {/* Header */}
              <div className='flex items-start justify-between'>
                {/* Author Info */}
                <div className='flex flex-wrap items-center gap-1'>
                  <span className='font-semibold hover:underline cursor-pointer'>
                    {post.author.username}
                  </span>
                  <span className='text-muted-foreground'>·</span>
                  <TimeDisplay timestamp={post.createdAt} />
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
                          src={getImageUrl(media.url)}
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
                        <VideoPlayer src={getImageUrl(media.url)} />
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
                  disabled={isLikeLoading}
                  onClick={(e) => handleLike(post._id, e)}
                  className={cn(
                    "h-8 gap-1.5 transition-all duration-200 group",
                    likedPosts.has(post._id)
                      ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                      : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                  )}>
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      likedPosts.has(post._id)
                        ? "scale-110 fill-current"
                        : "scale-100 group-hover:scale-110"
                    )}
                  />
                  <span className='text-xs'>{post.likes.length}</span>
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
      );
    },
    [
      props.onPostClick,
      handleImageClick,
      handleLike,
      isLikeLoading,
      likedPosts,
      toggleBookmark,
      openReplyDialog,
    ]
  );

  // 3. 渲染列表内容
  const renderContent = () => {
    if (props.isLoading) {
      return (
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      );
    }

    if (props.error) {
      return (
        <div className='flex flex-col items-center p-4 text-red-500'>
          <p>{props.error}</p>
          {props.onRefresh && (
            <button
              className='mt-2 text-blue-500 hover:underline'
              onClick={() => props.onRefresh?.()}>
              重试
            </button>
          )}
        </div>
      );
    }

    if (posts.length === 0) {
      return <div className='text-center py-8 text-muted-foreground'>还没有任何帖子</div>;
    }

    return <div className='flex flex-col divide-y divide-border'>{posts.map(renderPost)}</div>;
  };

  // 4. 返回组件
  return (
    <>
      {renderContent()}

      {/* Dialogs */}
      {replyingTo && (
        <ReplyDialog
          open={replyDialogOpen}
          onOpenChange={setReplyDialogOpen}
          post={replyingTo.post}
          replyTo={replyingTo.reply ?? null} // replyTo是回复评论的场景
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
