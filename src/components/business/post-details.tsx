"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/basic/avatar";
import { Button } from "@/components/basic/button";
import { Separator } from "@/components/basic/separator";
import { VideoPlayer } from "./video-player";
import { ReplyDialog } from "./reply-dialog";
import { Post } from "./post-list";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/feedback/dropdown-menu";
import { cn } from "@/utils/utils";

export interface Reply {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  replyTo: string | null;
  stats: {
    likes: number;
    replies: number;
    shares: number;
  };
}

interface PostDetailsProps {
  post: Post;
  onBack: () => void;
}

const staticReplies: Reply[] = [
  {
    id: "1",
    author: {
      name: "Alice Johnson",
      handle: "@alice_j",
      avatar: "/placeholder.svg",
    },
    content: "Great post! I totally agree with your points.",
    timestamp: "2023-06-15T10:30:00Z",
    replyTo: null,
    stats: {
      likes: 5,
      replies: 1,
      shares: 2,
    },
  },
  {
    id: "2",
    author: {
      name: "Bob Smith",
      handle: "@bobsmith",
      avatar: "/placeholder.svg",
    },
    content: "Interesting perspective. Have you considered the impact on...",
    timestamp: "2023-06-15T11:15:00Z",
    replyTo: null,
    stats: {
      likes: 3,
      replies: 0,
      shares: 1,
    },
  },
  {
    id: "3",
    author: {
      name: "Carol White",
      handle: "@carol_white",
      avatar: "/placeholder.svg",
    },
    content: "I disagree. Here's why...",
    timestamp: "2023-06-15T12:00:00Z",
    replyTo: "1",
    stats: {
      likes: 2,
      replies: 4,
      shares: 0,
    },
  },
];

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

export function PostDetails({ post, onBack }: PostDetailsProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = React.useState(false);
  const [replies, setReplies] = React.useState<Reply[]>(staticReplies);
  const [replyingTo, setReplyingTo] = React.useState<Reply | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLike = React.useCallback((id: string | null = null) => {
    if (id === null) {
      setIsLiked((prev) => !prev);
    } else {
      setReplies((prevReplies) =>
        prevReplies.map((reply) =>
          reply.id === id
            ? { ...reply, stats: { ...reply.stats, likes: reply.stats.likes + 1 } }
            : reply
        )
      );
    }
  }, []);

  const handleBookmark = React.useCallback(() => {
    setIsBookmarked((prev) => !prev);
  }, []);

  const handleReply = React.useCallback((content: string, replyToId: string | null) => {
    const newReply: Reply = {
      id: Date.now().toString(),
      content,
      author: {
        name: "当前用户",
        handle: "@currentuser",
        avatar: "/placeholder-avatar.jpg",
      },
      timestamp: new Date().toISOString(),
      replyTo: replyToId,
      stats: {
        likes: 0,
        replies: 0,
        shares: 0,
      },
    };
    setReplies((prev) => [newReply, ...prev]);
  }, []);

  const handleShare = React.useCallback((id: string | null = null) => {
    if (id === null) {
      console.log("Sharing main post");
    } else {
      setReplies((prevReplies) =>
        prevReplies.map((reply) =>
          reply.id === id
            ? { ...reply, stats: { ...reply.stats, shares: reply.stats.shares + 1 } }
            : reply
        )
      );
    }
  }, []);

  const openReplyDialog = React.useCallback((reply: Reply | null) => {
    setReplyingTo(reply);
    setReplyDialogOpen(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className='max-w-3xl mx-auto bg-background'>
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
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <span className='font-bold text-base'>{post.author.name}</span>
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
              <div className='my-3 rounded-2xl overflow-hidden'>
                {post.media.map((media, index) =>
                  media.type === "image" ? (
                    <img
                      key={index}
                      src={media.url}
                      alt=''
                      className='w-full h-auto object-cover'
                    />
                  ) : (
                    <div key={index} className='aspect-video'>
                      <VideoPlayer src={media.url} subtitles={media.subtitles} />
                    </div>
                  )
                )}
              </div>
            )}
            <div className='text-muted-foreground text-sm mb-3'>
              {formatExactTime(post.timestamp)}
              <span className='mx-1'>·</span>
              <span>{post.stats.views} 浏览</span>
            </div>
            <Separator className='my-3' />
            <div className='flex items-center justify-between py-3'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleLike()}
                className={cn(
                  "p-0 h-auto hover:bg-transparent group",
                  isLiked && "text-red-500"
                )}>
                <Heart
                  className={cn("h-5 w-5 mr-1 transition-colors", isLiked && "fill-current")}
                />
                <span className='text-sm group-hover:text-red-500'>
                  {post.stats.likes + (isLiked ? 1 : 0)}
                </span>
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => openReplyDialog(null)}
                className='p-0 h-auto hover:bg-transparent group'>
                <MessageCircle className='h-5 w-5 mr-1 transition-colors' />
                <span className='text-sm group-hover:text-blue-500'>
                  {post.stats.comments + replies.length}
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
                className={cn(
                  "p-0 h-auto hover:bg-transparent",
                  isBookmarked && "text-blue-500"
                )}>
                <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>
      </article>
      <div className='px-4'>
        <div className='relative'>
          {replies.map((reply, index) => (
            <div
              key={reply.id}
              className={cn(
                "relative py-3 transition-colors duration-200 hover:bg-muted/30",
                index !== replies.length - 1 && "border-b border-border"
              )}>
              <div className='flex gap-3'>
                <div className='flex flex-col items-center'>
                  <Avatar className='h-10 w-10 transition-transform duration-200 hover:scale-105'>
                    <AvatarImage src={reply.author.avatar} />
                    <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                  </Avatar>
                  {index !== replies.length - 1 && (
                    <div className='w-0.5 flex-1 bg-border/50 mt-2 relative'>
                      <div className='absolute inset-0 bg-gradient-to-b from-background to-transparent h-4 top-0' />
                    </div>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-1 text-sm'>
                    <span className='font-bold hover:underline cursor-pointer transition-colors'>
                      {reply.author.name}
                    </span>
                    <span className='text-muted-foreground hover:underline cursor-pointer transition-colors'>
                      {reply.author.handle}
                    </span>
                    <span className='text-muted-foreground'>·</span>
                    <span className='text-muted-foreground hover:underline cursor-pointer transition-colors'>
                      {formatPostTime(reply.timestamp)}
                    </span>
                  </div>
                  {reply.replyTo && (
                    <div className='text-sm text-muted-foreground mb-1'>
                      回复
                      <span className='text-primary'>
                        {replies.find((r) => r.id === reply.replyTo)?.author.handle ||
                          post.author.handle}
                      </span>
                    </div>
                  )}
                  <p className='mt-1 break-words text-[15px] leading-normal text-foreground/90'>
                    {reply.content}
                  </p>
                  <div className='flex items-center gap-6 mt-2'>
                    <button
                      onClick={() => handleLike(reply.id)}
                      className='group flex items-center gap-1 text-muted-foreground transition-colors duration-200'>
                      <div className='p-1.5 -ml-1.5 rounded-full transition-colors duration-200 group-hover:bg-red-100 group-hover:text-red-500'>
                        <Heart className='h-4 w-4' />
                      </div>
                      <span className='text-xs transition-colors duration-200 group-hover:text-red-500'>
                        {reply.stats.likes}
                      </span>
                    </button>
                    <button
                      onClick={() => openReplyDialog(reply)}
                      className='group flex items-center gap-1 text-muted-foreground transition-colors duration-200'>
                      <div className='p-1.5 -ml-1.5 rounded-full transition-colors duration-200 group-hover:bg-blue-100 group-hover:text-blue-500'>
                        <MessageCircle className='h-4 w-4' />
                      </div>
                      <span className='text-xs transition-colors duration-200 group-hover:text-blue-500'>
                        {reply.stats.replies}
                      </span>
                    </button>
                    <button
                      onClick={() => handleShare(reply.id)}
                      className='group flex items-center gap-1 text-muted-foreground transition-colors duration-200'>
                      <div className='p-1.5 -ml-1.5 rounded-full transition-colors duration-200 group-hover:bg-green-100 group-hover:text-green-500'>
                        <Share2 className='h-4 w-4' />
                      </div>
                      <span className='text-xs transition-colors duration-200 group-hover:text-green-500'>
                        {reply.stats.shares}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ReplyDialog
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        post={post}
        replyTo={replyingTo}
        onReply={handleReply}
      />
    </div>
  );
}
