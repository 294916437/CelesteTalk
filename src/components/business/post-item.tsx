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
import { cn } from "@/utils/utils"
import Link from 'next/link'
import { Post } from "./post-list"

interface PostItemProps {
    post: Post
    onLike: (postId: string, event: React.MouseEvent) => void
    onBookmark: (postId: string, event: React.MouseEvent) => void
    onReply: (post: Post) => void
    onImageClick: (post: Post, index: number, event: React.MouseEvent) => void
    onPostClick: (post: Post) => void
    isLiked: boolean
    isBookmarked: boolean
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
        const timer = setInterval(formatTime, 60000)
        return () => clearInterval(timer)
    }, [timestamp])

    return formattedTime
}

export function PostItem({
    post,
    onLike,
    onBookmark,
    onReply,
    onImageClick,
    onPostClick,
    isLiked,
    isBookmarked
}: PostItemProps) {
    const formattedTime = useFormattedTime(post.timestamp)

    return (
        <article
            className="p-4 transition-colors duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer"
            onClick={() => onPostClick(post)}
        >
            <div className="flex gap-4">
                <Link href={`/dashboard/profile/${post.author.handle.slice(1)}`} onClick={(e) => e.stopPropagation()}>
                    <Avatar className="h-10 w-10 transition-transform duration-200 hover:scale-105">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-wrap items-center gap-1">
                            <Link
                                href={`/dashboard/profile/${post.author.handle.slice(1)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 hover:underline"
                            >
                                <span className="font-semibold transition-colors">
                                    {post.author.name}
                                </span>
                                <span className="text-muted-foreground">
                                    {post.author.handle}
                                </span>
                            </Link>
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
                                className="w-[180px] bg-background/95 backdrop-blur-sm border-border"
                            >
                                <DropdownMenuItem className="text-foreground cursor-pointer transition-colors duration-200">
                                    复制链接
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-foreground cursor-pointer transition-colors duration-200">
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
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
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
                                        onClick={(e) => onImageClick(post, index, e)}
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
                            onClick={(e) => onLike(post.id, e)}
                            className={`h-8 gap-1.5 transition-all duration-200 group
                ${isLiked
                                    ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                                }`}
                        >
                            <Heart
                                className={`h-4 w-4 transition-transform duration-200 
                  ${isLiked ? 'scale-110 fill-current' : 'scale-100 group-hover:scale-110'}`}
                            />
                            <span className="text-xs">
                                {post.stats.likes + (isLiked ? 1 : 0)}
                            </span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                onReply(post)
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
                            onClick={(e) => onBookmark(post.id, e)}
                            className={`h-8 ml-auto transition-all duration-200
                ${isBookmarked
                                    ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'
                                    : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-50'
                                }`}
                        >
                            <Bookmark
                                className={`h-4 w-4 transition-transform duration-200 
                  ${isBookmarked ? 'fill-current' : ''}`}
                            />
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    )
}

