"use client";

import { useState, useEffect } from "react";
import { Post } from "@/components/post-list";
import { PostDialog } from "@/components/post-dialog";
import { PostList } from "@/components/post-list";
import { PostDetails } from "@/components/post-details";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const getRelativeTimestamp = (hoursAgo: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

const initialPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "John Doe",
      handle: "@johndoe",
      avatar: "/placeholder.svg",
    },
    content:
      "Just launched my new project! 🚀 Really excited to share this with everyone. What do you think?",
    timestamp: getRelativeTimestamp(2), // 2 hours ago
    stats: {
      likes: 42,
      comments: 12,
      shares: 5,
      views: 150,
    },
  },
  {
    id: "2",
    author: {
      name: "Jane Smith",
      handle: "@janesmith",
      avatar: "/placeholder.svg",
    },
    content:
      "Had an amazing time at the tech conference today! Met so many brilliant minds. #TechConf2024",
    timestamp: getRelativeTimestamp(5),
    media: [
      {
        type: "image" as const,
        url: "/preview.jpg?height=512&width=1024",
      },
    ],
    stats: {
      likes: 128,
      comments: 24,
      shares: 16,
      views: 320,
    },
  },
  {
    id: "3",
    author: {
      name: "Video Tester",
      handle: "@videotester",
      avatar: "/placeholder.svg",
    },
    content: "Check out this cool video with subtitles!",
    timestamp: getRelativeTimestamp(1), // 1 hour ago
    media: [
      {
        type: "video" as const,
        url: "/video.mp4",
        subtitles: [
          { src: "/subtitles/en.vtt", label: "English", srcLang: "en" },
          { src: "/subtitles/es.vtt", label: "Español", srcLang: "es" },
        ],
      },
    ],
    stats: {
      likes: 15,
      comments: 3,
      shares: 2,
      views: 75,
    },
  },
];

export default function Page() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  if (!isClient) {
    return null; // or a loading spinner
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
                <PostList initialPosts={initialPosts} onPostClick={handlePostClick} />
              </div>
            </>
          )}
        </div>
      </SidebarInset>
      <SidebarRight />
    </SidebarProvider>
  );
}
