"use client";

import { useState, useEffect } from "react";
import { PostService } from "@/services/post.service";
import { PostDialog } from "@/components/business/post-dialog";
import { PostList } from "@/components/business/post-list";
import { PostDetails } from "@/components/business/post-details";
import { SidebarLeft } from "@/components/layout/sidebar-left";
import { SidebarRight } from "@/components/layout/sidebar-right";
import { Post } from "@/types/post";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/navigation/breadcrumb";
import { Separator } from "@/components/basic/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/layout/sidebar";

export default function Page() {
  // 1. 所有hooks都放在最顶层
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  // 2. useEffect的使用
  useEffect(() => {
    setIsClient(true);
    // 获取首页帖子列表
    const fetchPosts = async () => {
      try {
        const response = await PostService.getPosts();
        if (response.code === 200 && response.data) {
          setPosts(response.data.posts);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

    fetchPosts();
  }, []);

  // 3. 事件处理函数
  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  // 4. 渲染内容
  const renderContent = () => {
    if (!isClient) {
      return <div>Loading...</div>;
    }

    return (
      <SidebarProvider>
        <SidebarLeft />
        <SidebarInset>
          <header className='sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur'>
            <div className='flex flex-1 items-center gap-2 px-3'>
              <SidebarTrigger />
              <Separator orientation='vertical' className='mr-2 h-4' />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className='line-clamp-1'>
                      {selectedPost ? "帖子" : "首页"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className='flex flex-1 flex-col gap-4 p-4'>
            {selectedPost ? (
              <PostDetails post={selectedPost} onBack={handleBackToList} />
            ) : (
              <>
                <div className='mx-auto w-full max-w-3xl rounded-xl bg-card p-4'>
                  <PostDialog />
                </div>
                <div className='mx-auto w-full max-w-3xl rounded-xl bg-background'>
                  <PostList initialPosts={posts} onPostClick={handlePostClick} />
                </div>
              </>
            )}
          </div>
        </SidebarInset>
        <SidebarRight />
      </SidebarProvider>
    );
  };

  // 5. 返回渲染结果
  return renderContent();
}
