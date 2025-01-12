import * as React from "react";

export function useBookmark() {
  const [bookmarkedPosts, setBookmarkedPosts] = React.useState<Set<string>>(new Set());
  const [processingPosts, setProcessingPosts] = React.useState<Set<string>>(new Set());

  const toggleBookmark = React.useCallback(
    async (postId: string) => {
      if (processingPosts.has(postId)) return;

      setProcessingPosts((prev) => new Set([...prev, postId]));

      try {
        // 乐观更新
        setBookmarkedPosts((prev) => {
          const newBookmarks = new Set(prev);
          if (prev.has(postId)) {
            newBookmarks.delete(postId);
          } else {
            newBookmarks.add(postId);
          }
          return newBookmarks;
        });

        // TODO: 发送API请求，当后端实现时添加
        // await PostService.toggleBookmark(postId);
      } catch (error) {
        // 错误回滚
        setBookmarkedPosts((prev) => {
          const newBookmarks = new Set(prev);
          if (prev.has(postId)) {
            newBookmarks.add(postId);
          } else {
            newBookmarks.delete(postId);
          }
          return newBookmarks;
        });
      } finally {
        setProcessingPosts((prev) => new Set([...prev].filter((id) => id !== postId)));
      }
    },
    [bookmarkedPosts]
  );

  return {
    bookmarkedPosts,
    processingPosts,
    toggleBookmark,
  };
}
