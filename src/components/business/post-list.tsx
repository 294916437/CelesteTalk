"use client";

import * as React from "react";
import { usePostInteraction } from "@/hooks/post/usePostInteraction";
import { useRouter } from "next/navigation";
import { useReplyDialog } from "@/hooks/post/useReplyDialog";
import { useImagePreview } from "@/hooks/post/useImagePreview";
import { Loader2 } from "lucide-react";
import { ReplyDialog } from "@/components/business/reply-dialog";
import { ImagePreview } from "@/components/business/image-preview";
import { Post } from "@/types/post";
import { Author } from "@/types/user";
import { usePostLike } from "@/hooks/post/usePostLike";
import { PostItem } from "@/components/business/post-item";
import { SearchBar } from "@/components/business/search-bar";
import { usePostSearch } from "@/hooks/post/usePostSearch";
import { useDebouncedCallback } from "@/hooks/common/useDebounce";
import { useBookmark } from "@/hooks/post/usePostBookmark";

interface PostListProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  currentUser: Author | null;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function PostList({ posts: initialPosts, ...props }: PostListProps) {
  const router = useRouter();
  const [posts, setPosts] = React.useState(initialPosts);
  const { filteredPosts, isSearching, searchPosts } = usePostSearch(posts);
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

  const { isPostLiked, processingPosts, toggleLike } = usePostLike(
    posts,
    props.currentUser?.handle ?? "",
    setPosts
  );
  const {
    bookmarkedPosts,
    processingPosts: processingBookmarks,
    toggleBookmark,
  } = useBookmark();
  const { replyingTo, replyDialogOpen, setReplyDialogOpen, openReplyDialog, handleReply } =
    useReplyDialog(props.onRefresh); // 添加刷新回调
  const {
    previewImages,
    initialImageIndex,
    isPreviewOpen,
    setIsPreviewOpen,
    handleImageClick,
  } = useImagePreview();

  // 修改防抖搜索的实现
  const debouncedSearch = useDebouncedCallback(
    (query: string) => {
      searchPosts(query);
    },
    500,
    [searchPosts] // 添加依赖项
  );

  const handleSearch = React.useCallback(
    (query: string) => {
      // 空查询时立即执行
      if (!query.trim()) {
        searchPosts(query);
        return;
      }
      // 非空查询使用防抖
      debouncedSearch(query);
    },
    [searchPosts, debouncedSearch]
  );

  const handlePostClick = (post: Post) => {
    props.onPostClick(post);
    router.push(`/dashboard?postId=${post._id}`);
  };

  // 处理回复提交
  const handleReplySubmit = React.useCallback(
    (content: string, replyToId: string) => {
      if (!props.currentUser?.handle) {
        return;
      }
      handleReply(content, props.currentUser.handle);
    },
    [props.currentUser, handleReply]
  );

  return (
    <>
      <div className='sticky top-14 z-10 bg-background/95 backdrop-blur-sm border-b'>
        <div className='px-4 py-2'>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      <div className='flex flex-col divide-y divide-border'>
        {isSearching ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className='p-8 text-center text-muted-foreground'>没有找到相关帖子</div>
        ) : (
          filteredPosts.map((post) => (
            <PostItem
              key={post._id}
              post={post}
              currentUserHandle={props.currentUser?.handle ?? ""}
              onLike={toggleLike}
              onBookmark={toggleBookmark}
              isProcessingBookmark={processingBookmarks.has(post._id)}
              isBookmarked={bookmarkedPosts.has(post._id)}
              onReply={openReplyDialog}
              onImageClick={handleImageClick}
              onPostClick={handlePostClick}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      {replyingTo && (
        <ReplyDialog
          open={replyDialogOpen}
          onOpenChange={setReplyDialogOpen}
          post={replyingTo?.post ?? null}
          replyTo={replyingTo?.reply ?? null} // replyTo是回复评论的场景
          onReply={handleReplySubmit}
          currentUser={props.currentUser}
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
