"use client";

import { useState } from "react";
import { PostDialog } from "@/components/post-dialog";
import { PostList, Post } from "@/components/post-list";
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
    timestamp: "2h",
    stats: {
      likes: 42,
      comments: 12,
      shares: 5,
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
    timestamp: "5h",
    media: [{ type: "image", url: "/form-side.jpg" }],
    stats: {
      likes: 128,
      comments: 24,
      shares: 16,
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
    timestamp: "1h",
    media: [
      {
        type: "video",
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
    },
  },
];

export default function Page() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const handleNewPost = (newPost: {
    content: string;
    media: { type: "image" | "video"; url: string }[];
  }) => {
    const post: Post = {
      id: (posts.length + 1).toString(),
      author: {
        name: "Current User",
        handle: "@currentuser",
        avatar: "/placeholder-avatar.jpg",
      },
      content: newPost.content,
      timestamp: "刚刚",
      media: newPost.media,
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
    };
    setPosts([post, ...posts]);
  };

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
                  <BreadcrumbPage className='line-clamp-1'>首页</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4'>
          <div className='mx-auto w-full max-w-3xl rounded-xl bg-card p-4'>
            <PostDialog onPost={handleNewPost} />
          </div>
          <div className='mx-auto w-full max-w-3xl rounded-xl bg-background'>
            <PostList posts={posts} />
          </div>
        </div>
      </SidebarInset>
      <SidebarRight />
    </SidebarProvider>
  );
}
