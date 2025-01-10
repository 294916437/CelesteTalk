"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Trash2,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/basic/avatar";
import { Button } from "@/components/basic/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/feedback/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/data/alert-dialog";
import { toast } from "react-toastify";
import { VideoPlayer } from "./video-player";
import { ImagePreview } from "./image-preview";
import { cn } from "@/utils/utils";
import { Post } from "@/types/post";
import { Author } from "@/types/user";
import Link from "next/link";
import { ReplyDialog } from "./reply-dialog";
import { getImageUrl } from "@/utils/utils";
interface UserPostsProps {
  posts: Post[];
  isLoading?: boolean;
  error?: string | null;
  onPostClick: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  currentUser: Author | null;
  onRefresh?: () => void; // 添加刷新方法
}

export function UserPosts({
  posts,
  isLoading,
  onDeletePost,
  onPostClick,
  setPosts,
  currentUser,
  onRefresh,
}: UserPostsProps) {
  const router = useRouter();
  const [likedPosts, setLikedPosts] = React.useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = React.useState<Set<string>>(new Set());
  const [deletePostId, setDeletePostId] = React.useState<string | null>(null);
  const [previewImages, setPreviewImages] = React.useState<string[]>([]);
  const [initialImageIndex, setInitialImageIndex] = React.useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = React.useState(false);
  const [replyingTo, setReplyingTo] = React.useState<Post | null>(null);

  const handleImageClick = (post: Post, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const images = post.media?.filter((m) => m.type === "image").map((m) => m.url) || [];
    setPreviewImages(images);
    setInitialImageIndex(index);
    setIsPreviewOpen(true);
  };

  const toggleLike = (postId: string, event: React.MouseEvent) => {
    event.stopPropagation();
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

  const toggleBookmark = (postId: string, event: React.MouseEvent) => {
    event.stopPropagation();
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

  const handleDelete = async (postId: string) => {
    try {
      onDeletePost(postId);
      toast.success("帖子已删除");
      onRefresh?.(); // 调用刷新方法
    } catch (error) {
      toast.error("删除失败，请重试");
    } finally {
      setDeletePostId(null);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "刚刚";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    } else {
      return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }
  };

  const handleReply = React.useCallback(
    (content: string, replyToId: string | null) => {
      // 这里应该调用 API 来保存回复
      console.log(`Replying to post ${replyToId}: ${content}`);
      // 更新本地状态（这应该在 API 调用成功后进行）
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === replyToId
            ? { ...post, stats: { ...post.stats, comments: post.stats.comments + 1 } }
            : post
        )
      );
      setReplyDialogOpen(false);
    },
    [setPosts]
  );

  const openReplyDialog = React.useCallback((post: Post) => {
    setReplyingTo(post);
    setReplyDialogOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (posts.length === 0) {
    return <div className='text-center py-8 text-muted-foreground'>还没有发布任何帖子</div>;
  }

  return (
    <>
      <div className='flex flex-col divide-y divide-border'>
        {posts.map((post) => (
          <article
            key={post._id}
            className='p-4 transition-colors duration-200 hover:bg-black/[0.02] dark:hover:bg白/[0.02] cursor-pointer'
            onClick={() => router.push(`/dashboard/profile?postId=${post._id}`)}>
            <div className='flex gap-4'>
              <Link
                href={`/dashboard/profile/${post.author.handle.slice(1)}`}
                onClick={(e) => e.stopPropagation()}>
                <Avatar className='h-10 w-10 transition-transform duration-200 hover:scale-105'>
                  <AvatarImage src={getImageUrl(post.author.avatar)} />
                  <AvatarFallback>{post.author.username}</AvatarFallback>
                </Avatar>
              </Link>
              <div className='flex-1 space-y-2'>
                <div className='flex items-start justify-between'>
                  <div className='flex flex-wrap items-center gap-1'>
                    <Link
                      href={`/dashboard/profile/${post.author.handle.slice(1)}`}
                      onClick={(e) => e.stopPropagation()}
                      className='flex items-center gap-1 hover:underline'>
                      <span className='font-semibold transition-colors'>
                        {post.author.username}
                      </span>
                      <span className='text-muted-foreground'>{post.author.handle}</span>
                    </Link>
                    <span className='text-muted-foreground'>·</span>
                    <span className='text-muted-foreground hover:underline cursor-pointer transition-colors'>
                      {formatTime(post.createdAt)}
                    </span>
                  </div>
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
                      className='w-[180px] bg-background/95 backdrop-blur-sm rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-200'>
                      <DropdownMenuItem className='flex items-center px-3 py-2.5 text-sm cursor-pointer transition-colors hover:bg-accent focus:bg-accent rounded-lg mx-1 my-1'>
                        复制链接
                      </DropdownMenuItem>
                      <DropdownMenuItem className='flex items-center px-3 py-2.5 text-sm cursor-pointer transition-colors hover:bg-accent focus:bg-accent rounded-lg mx-1 my-1'>
                        分享
                      </DropdownMenuItem>
                      {currentUser && currentUser.handle === post.author.handle && (
                        <DropdownMenuItem
                          className='flex items-center px-3 py-2.5 text-sm cursor-pointer transition-colors hover:bg-destructive/20 focus:bg-destructive/20 text-destructive hover:text-destructive-foreground rounded-lg mx-1 my-1'
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletePostId(post._id);
                          }}>
                          <Trash2 className='h-4 w-4 mr-2' />
                          删除帖子
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className='text-sm'>{post.content}</p>
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
                <div className='flex gap-4 pt-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={(e) => toggleLike(post._id, e)}
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

      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              这条帖子将被永久删除，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => deletePostId && handleDelete(deletePostId)}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImagePreview
        images={previewImages}
        initialIndex={initialImageIndex}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
      {replyingTo && (
        <ReplyDialog
          open={replyDialogOpen}
          onOpenChange={setReplyDialogOpen}
          post={replyingTo!}
          replyTo={null}
          onReply={handleReply}
        />
      )}
    </>
  );
}
