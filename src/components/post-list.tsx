"use client";

import * as React from "react";
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VideoPlayer } from "./video-player";
import { ReplyDialog } from "./reply-dialog";

export interface Post {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  media?: {
    type: "image" | "video";
    url: string;
    subtitles?: { src: string; label: string; srcLang: string }[];
  }[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  const [likedPosts, setLikedPosts] = React.useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = React.useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = React.useState<Post | null>(null);

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (prev.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts((prev) => {
      const newSet = new Set(prev);
      if (prev.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleReply = (content: string) => {
    console.log("Reply:", content);
  };

  return (
    <div className='flex flex-col divide-y divide-border'>
      {posts.map((post) => (
        <article
          key={post.id}
          className='p-4 transition-colors duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'>
          <div className='flex gap-4'>
            <Avatar className='h-10 w-10 transition-transform duration-200 hover:scale-105'>
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className='flex-1 space-y-2'>
              <div className='flex items-start justify-between'>
                <div className='space-x-2'>
                  <span className='font-semibold hover:underline cursor-pointer transition-colors'>
                    {post.author.name}
                  </span>
                  <span className='text-muted-foreground hover:underline cursor-pointer transition-colors'>
                    {post.author.handle}
                  </span>
                  <span className='text-muted-foreground'>·</span>
                  <span className='text-muted-foreground hover:underline cursor-pointer transition-colors'>
                    {post.timestamp}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 p-0 transition-colors duration-200 hover:bg-muted/80'>
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
              <p className='text-sm'>{post.content}</p>
              {post.media && post.media.length > 0 && (
                <div className='mt-2 grid gap-2'>
                  {post.media.map((media, index) =>
                    media.type === "image" ? (
                      <img
                        key={index}
                        src={media.url}
                        alt=''
                        className='rounded-lg border object-cover transition-transform duration-200 hover:scale-[1.01]'
                        width={400}
                        height={300}
                      />
                    ) : (
                      <VideoPlayer key={index} src={media.url} subtitles={media.subtitles} />
                    )
                  )}
                </div>
              )}
              <div className='flex gap-4 pt-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => toggleLike(post.id)}
                  className={`h-8 gap-1.5 transition-all duration-200 group
                    ${
                      likedPosts.has(post.id)
                        ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                        : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    }`}>
                  <Heart
                    className={`h-4 w-4 transition-transform duration-200 
                      ${
                        likedPosts.has(post.id)
                          ? "scale-110 fill-current"
                          : "scale-100 group-hover:scale-110"
                      }`}
                  />
                  <span className='text-xs'>
                    {post.stats.likes + (likedPosts.has(post.id) ? 1 : 0)}
                  </span>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setReplyingTo(post)}
                  className='h-8 gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-blue-500 hover:bg-blue-50'>
                  <MessageCircle className='h-4 w-4 transition-transform duration-200 group-hover:scale-110' />
                  <span className='text-xs'>{post.stats.comments}</span>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-green-500 hover:bg-green-50'>
                  <Share2 className='h-4 w-4 transition-transform duration-200 group-hover:scale-110' />
                  <span className='text-xs'>{post.stats.shares}</span>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => toggleBookmark(post.id)}
                  className={`h-8 ml-auto transition-all duration-200
                    ${
                      bookmarkedPosts.has(post.id)
                        ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                        : "text-muted-foreground hover:text-blue-500 hover:bg-blue-50"
                    }`}>
                  <Bookmark
                    className={`h-4 w-4 transition-transform duration-200 
                      ${bookmarkedPosts.has(post.id) ? "fill-current" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </article>
      ))}
      {replyingTo && (
        <ReplyDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setReplyingTo(null);
          }}
          post={replyingTo}
          onReply={handleReply}
        />
      )}
    </div>
  );
}
