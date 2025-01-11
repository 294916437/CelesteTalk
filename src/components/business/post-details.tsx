"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/basic/avatar";
import { Button } from "@/components/basic/button";
import { Separator } from "@/components/basic/separator";
import { VideoPlayer } from "@/components/business/video-player";
import { ReplyDialog } from "@/components/business/reply-dialog";
import { Post } from "@/types/post";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowLeft,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { useUserStore } from "@/store/user.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/feedback/dropdown-menu";
import { cn, getImageUrl } from "@/utils/utils";
import { Comment } from "@/types/comment";
import { useComments } from "@/hooks/comment/useComments";
import { usePostLike } from "@/hooks/post/usePostLike";
import { useCommentLike } from "@/hooks/comment/useCommentLike";
interface PostDetailsProps {
  post: Post;
  onBack: () => void;
}

function formatPostTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "刚刚";
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时`;
  } else if (diffInSeconds < 604800) {
    // Less than a week
    return `${Math.floor(diffInSeconds / 86400)}天`;
  } else {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }
}

function formatExactTime(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour12: false,
  }).format(date);
}

export function PostDetails({ post: initialPost, onBack }: PostDetailsProps) {
  const user = useUserStore((state) => state.user);
  const [post, setPost] = React.useState(initialPost);
  const [isClient, setIsClient] = React.useState(false);

  const currentUser = user
    ? {
        username: user.username,
        handle: user._id,
        avatar: user.avatar,
      }
    : null;
  // 1. 获取评论列表及相关状态
  const {
    comments,
    fetchComments,
    isLoading: isCommentsLoading,
    replyingTo,
    isDialogOpen,
    setIsDialogOpen,
    handleComment,
    openReplyDialog,
  } = useComments(post, currentUser);
  // // 2. 获取帖子所有的评论变化，定时刷新
  React.useEffect(() => {
    fetchComments();
    // 设置定时刷新
    const intervalId = setInterval(() => {
      fetchComments();
    }, 60000);
  }, [fetchComments]);

  // 3. 将 useCommentLike 移到顶层
  const { isCommentLiked, processingComments, toggleCommentLike, likeCounts } = useCommentLike(
    comments,
    currentUser?.handle ?? ""
  );

  // 3. 点赞相关功能
  const { isPostLiked, processingPosts, toggleLike } = usePostLike(
    [post],
    currentUser?.handle ?? "",
    (posts) => setPost(posts[0])
  );

  // 4. 封装评论列表渲染逻辑
  const renderComments = React.useCallback(() => {
    if (isCommentsLoading) {
      return (
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      );
    }

    if (!comments.length) {
      return (
        <div className='text-center py-8 text-muted-foreground'>还没有评论，来说点什么吧</div>
      );
    }

    return comments.map((comment, index) => (
      <CommentItem
        key={comment._id}
        comment={comment}
        isLast={index === comments.length - 1}
        isLiked={isCommentLiked(comment._id ?? "")}
        isProcessing={processingComments.has(comment._id ?? "")}
        likeCount={likeCounts.get(comment._id ?? "") || 0}
        onLike={() => toggleCommentLike(comment._id ?? "")}
        onReply={() => openReplyDialog(comment)}
        onShare={() => handleShare(comment._id)}
        formatTime={formatPostTime}
      />
    ));
  }, [
    comments,
    isCommentsLoading,
    isCommentLiked,
    processingComments,
    likeCounts,
    toggleCommentLike,
    openReplyDialog,
  ]);

  // 渲染帖子点赞按钮
  const renderPostLikeButton = () => (
    <Button
      variant='ghost'
      size='sm'
      onClick={() => toggleLike(post._id)}
      disabled={processingPosts.has(post._id)}
      className={cn(
        "p-0 h-auto hover:bg-transparent group",
        isPostLiked(post) && "text-red-500"
      )}>
      {processingPosts.has(post._id) ? (
        <Loader2 className='h-5 w-5 mr-1 animate-spin' />
      ) : (
        <Heart
          className={cn("h-5 w-5 mr-1 transition-colors", isPostLiked(post) && "fill-current")}
        />
      )}
      <span className='text-sm'>{post.likes.length}</span>
    </Button>
  );

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleBookmark = React.useCallback(() => {}, [currentUser]);

  const handleShare = React.useCallback((commentId: string | null = null) => {}, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className='max-w-3xl mx-auto bg-background w-full'>
      <div className='sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b'>
        <div className='flex items-center h-14 px-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onBack}
            className='h-9 w-9 rounded-full mr-4'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <span className='font-semibold text-xl'>帖子</span>
        </div>
      </div>
      <article className='px-4 py-3 border-b border-border'>
        <div className='flex items-start gap-3'>
          <Avatar className='h-12 w-12'>
            <AvatarImage src={getImageUrl(post.author.avatar)} />
            <AvatarFallback>{post.author.username}</AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <span className='font-bold text-base'>{post.author.username}</span>
                <span className='text-muted-foreground text-sm'>{post.author.handle}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-9 w-9 rounded-full'>
                    <MoreHorizontal className='h-5 w-5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuItem className='cursor-pointer'>复制链接</DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer'>分享</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className='cursor-pointer text-destructive'>
                    举报
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className='text-xl break-words whitespace-pre-wrap my-3'>{post.content}</div>
            {post.media && post.media.length > 0 && (
              <div className='my-3 rounded-2xl overflow-h_idden'>
                {post.media.map((media, index) =>
                  media.type === "image" ? (
                    <img
                      key={index}
                      src={getImageUrl(media.url)}
                      alt=''
                      className='w-full h-auto object-cover'
                    />
                  ) : (
                    <div key={index} className='aspect-v_ideo'>
                      <VideoPlayer src={getImageUrl(media.url)} />
                    </div>
                  )
                )}
              </div>
            )}
            <div className='text-muted-foreground text-sm mb-3'>
              {formatExactTime(post.createdAt)}
              <span className='mx-1'>·</span>
              <span>{post.stats.views} 浏览</span>
            </div>
            <Separator className='my-3' />
            <div className='flex items-center justify-between py-3'>
              {renderPostLikeButton()}
              <Button
                variant='ghost'
                size='sm'
                // 点击事件打开dialog
                className='p-0 h-auto hover:bg-transparent group'>
                <MessageCircle className='h-5 w-5 mr-1 transition-colors' />
                <span className='text-sm group-hover:text-blue-500'>
                  {post.stats.comments + comments.length}
                </span>
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleShare()}
                className='p-0 h-auto hover:bg-transparent group'>
                <Share2 className='h-5 w-5 mr-1 transition-colors' />
                <span className='text-sm group-hover:text-green-500'>{post.stats.shares}</span>
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleBookmark}
                className={cn("p-0 h-auto hover:bg-transparent", false && "text-blue-500")}>
                <Bookmark className={cn("h-5 w-5", false && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
      </article>
      <div className='px-4'>{renderComments()}</div>
      <ReplyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        post={post}
        replyTo={replyingTo ?? null}
        onReply={handleComment}
        currentUser={currentUser}
      />
    </div>
  );
}

// 抽离评论项组件
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

function CommentItem({
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
            <span className='text-muted-foreground hover:underline cursor-pointer'>
              {comment.author?.handle}
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
