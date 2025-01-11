import * as React from "react";
import { Post } from "@/types/post";
import { PostService } from "@/services/post.service";
import { toast } from "react-toastify";

export function usePostSearch(initialPosts: Post[]) {
  const [isSearching, setIsSearching] = React.useState(false);
  const [filteredPosts, setFilteredPosts] = React.useState<Post[]>(initialPosts);
  const [searchQuery, setSearchQuery] = React.useState("");

  // 当初始帖子更新时，重置过滤后的帖子
  React.useEffect(() => {
    if (!searchQuery) {
      setFilteredPosts(initialPosts);
    }
  }, [initialPosts, searchQuery]);

  const searchPosts = React.useCallback(
    async (query: string) => {
      setSearchQuery(query);

      // 如果搜索词为空，显示所有帖子
      if (!query.trim()) {
        setFilteredPosts(initialPosts);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await PostService.searchPost(query.trim());
        setFilteredPosts(response.data.posts);
      } catch (error) {
        // 搜索失败时退回到本地搜索
        const localResults = initialPosts.filter(
          (post) =>
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.author.username.toLowerCase().includes(query.toLowerCase()) ||
            post.author.handle.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredPosts(localResults);
        toast.error("搜索失败，已显示本地结果");
      } finally {
        setIsSearching(false);
      }
    },
    [initialPosts]
  );

  return {
    filteredPosts,
    isSearching,
    searchPosts,
    searchQuery,
  };
}
