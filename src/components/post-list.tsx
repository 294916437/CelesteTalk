"use client"

import * as React from "react"
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { VideoPlayer } from "./video-player"
import { ReplyDialog } from "./reply-dialog"
import { ImagePreview } from "./image-preview"
import { cn } from "@/utils/utils"
import { useRouter } from 'next/navigation'

export interface Post {
  id: string
  author: {
    name: string
    handle: string
    avatar: string
  }
  content: string
  timestamp: string
  media?: {
    type: 'image' | 'video'
    url: string
    subtitles?: { src: string; label: string; srcLang: string }[]
  }[]
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
  }
}

interface Reply {
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

interface PostListProps {
  initialPosts: Post[]
  onPostClick: (post: Post) => void
}

function useFormattedTime(timestamp: string) {
  const [formattedTime, setFormattedTime] = React.useState("")

  React.useEffect(() => {
    const formatTime = () => {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      let formatted = ""
      if (diffInSeconds < 60) {
        formatted = '刚刚'
      } else if (diffInSeconds < 3600) {
        formatted = `${Math.floor(diffInSeconds / 60)}分钟前`
      } else if (diffInSeconds < 86400) {
        formatted = `${Math.floor(diffInSeconds / 3600)}小时前`
      } else {
        formatted = new Intl.DateTimeFormat('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(date)
      }
      setFormattedTime(formatted)
    }

    formatTime()
    const timer = setInterval(formatTime, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [timestamp])

  return formattedTime
}

export function PostList({ initialPosts, onPostClick }: PostListProps) {
  const router = useRouter()
  const [likedPosts, setLikedPosts] = React.useState<Set<string>>(new Set())
  const [bookmarkedPosts, setBookmarkedPosts] = React.useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = React.useState<{ post: Post; reply: Reply | null } | null>(null)
  const [replyDialogOpen, setReplyDialogOpen] = React.useState(false);
  const [previewImages, setPreviewImages] = React.useState<string[]>([])
  const [initialImageIndex, setInitialImageIndex] = React.useState(0)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [posts] = React.useState<Post[]>(initialPosts)

  const handleImageClick = (post: Post, index: number, event: React.MouseEvent) => {
    event.stopPropagation()
    const images = post.media
      ?.filter(m => m.type === 'image')
      .map(m => m.url) || []
    setPreviewImages(images)
    setInitialImageIndex(index)
    setIsPreviewOpen(true)
  }

  const toggleLike = (postId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (prev.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const toggleBookmark = (postId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev)
      if (prev.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const openReplyDialog = (post: Post, reply: Reply | null = null) => {
    setReplyingTo({ post, reply })
    setReplyDialogOpen(true)
  }

  const handleReply = (content: string, replyToId: string | null) => {
    console.log('Reply:', content, 'To:', replyToId);
    // Here you would typically update the posts state with the new reply
    const newReply: Reply = {
      id: Date.now().toString(),
      author: {
        name: "当前用户",
        handle: "@currentuser",
        avatar: "/placeholder-avatar.jpg",
      },
      content,
      timestamp: new Date().toISOString(),
      replyTo: replyToId,
      stats: {
        likes: 0,
        replies: 0,
        shares: 0,
      },
    };
    // Add logic here to update the posts state with the new reply
  };

  const handlePostClick = (post: Post) => {
    onPostClick(post)
  }

  return (
    <>
      <div className="flex flex-col divide-y divide-border">
        {posts.map((post) => {
          const formattedTime = useFormattedTime(post.timestamp)

          return (
            <article
              key={post.id}
              className="p-4 transition-colors duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer"
              onClick={() => handlePostClick(post)}
            >
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 transition-transform duration-200 hover:scale-105">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="font-semibold hover:underline cursor-pointer transition-colors">
                        {post.author.name}
                      </span>
                      <span className="text-muted-foreground">
                        {post.author.handle}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-muted-foreground hover:underline cursor-pointer transition-colors">
                              {formattedTime}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="bg-popover/95 backdrop-blur-sm"
                          >
                            {new Date(post.timestamp).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 transition-colors duration-200 hover:bg-muted/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[180px] bg-bg-100 border-border animate-in slide-in-from-top-2 duration-200"
                      >
                        <DropdownMenuItem className="text-text-100 cursor-pointer transition-colors duration-200">
                          复制链接
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-text-100 cursor-pointer transition-colors duration-200">
                          分享
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer transition-colors duration-200 hover:text-destructive hover:bg-destructive/10"
                        >
                          举报
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm">{post.content}</p>
                  {post.media && post.media.length > 0 && (
                    <div
                      className={cn(
                        "mt-2 grid gap-2 max-w-2xl mx-auto",
                        post.media.length === 1 && "grid-cols-1",
                        post.media.length === 2 && "grid-cols-2",
                        post.media.length === 3 && "grid-cols-2",
                        post.media.length === 4 && "grid-cols-2"
                      )}
                    >
                      {post.media.map((media, index) => (
                        media.type === 'image' ? (
                          <div
                            key={index}
                            className={cn(
                              "relative group cursor-pointer",
                              post.media!.length === 3 && index === 0 && "col-span-2"
                            )}
                            onClick={(e) => handleImageClick(post, index, e)}
                          >
                            <img
                              src={media.url}
                              alt=""
                              className="rounded-lg w-full h-auto object-contain transition-transform duration-200 hover:brightness-90 max-h-[512px]"
                            />
                          </div>
                        ) : (
                          <div
                            key={index}
                            className={cn(
                              post.media!.length === 1 && "col-span-2",
                              post.media!.length === 3 && index === 0 && "col-span-2"
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <VideoPlayer src={media.url} subtitles={media.subtitles} />
                          </div>
                        )
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => toggleLike(post.id, e)}
                      className={`h-8 gap-1.5 transition-all duration-200 group
                        ${likedPosts.has(post.id)
                          ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                          : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                        }`}
                    >
                      <Heart
                        className={`h-4 w-4 transition-transform duration-200 
                          ${likedPosts.has(post.id) ? 'scale-110 fill-current' : 'scale-100 group-hover:scale-110'}`}
                      />
                      <span className="text-xs">
                        {post.stats.likes + (likedPosts.has(post.id) ? 1 : 0)}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        openReplyDialog(post)
                      }}
                      className="h-8 gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-blue-500 hover:bg-blue-50"
                    >
                      <MessageCircle className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      <span className="text-xs">{post.stats.comments}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-green-500 hover:bg-green-50"
                    >
                      <Share2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      <span className="text-xs">{post.stats.shares}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => toggleBookmark(post.id, e)}
                      className={`h-8 ml-auto transition-all duration-200
                        ${bookmarkedPosts.has(post.id)
                          ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'
                          : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-50'
                        }`}
                    >
                      <Bookmark
                        className={`h-4 w-4 transition-transform duration-200 
                          ${bookmarkedPosts.has(post.id) ? 'fill-current' : ''}`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {replyingTo && (
        <ReplyDialog
          open={replyDialogOpen}
          onOpenChange={setReplyDialogOpen}
          post={replyingTo?.post!}
          replyTo={replyingTo?.reply}
          onReply={handleReply}
        />
      )}
      <ImagePreview
        images={previewImages}
        initialIndex={initialImageIndex}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </>
  )
}

