"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Post } from "@/types/post";
import { PostDialog } from "@/components/business/post-dialog";
import { PostList } from "@/components/business/post-list";
import { PostDetails } from "@/components/business/post-details";

const getRelativeTimestamp = (hoursAgo: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

// Sample initial posts
const initialPosts: Post[] = [
  {
    _id: "1",
    authorId: "user1",
    content:
      "Just launched my new project! 🚀 Really excited to share this with everyone. What do you think?",
    createdAt: getRelativeTimestamp(2),
    isRepost: false,
    updatedAt: getRelativeTimestamp(2),
    likes: [],
    repostCount: 0,
    author: {
      username: "John Doe",
      handle: "@johndoe",
      avatar: "/placeholder.svg",
    },
    stats: {
      likes: 42,
      comments: 12,
      shares: 5,
      views: 150,
    },
  },
  {
    _id: "2",
    authorId: "user2",
    content:
      "Had an amazing time at the tech conference today! Met so many brilliant minds. #TechConf2024",
    createdAt: getRelativeTimestamp(5),
    isRepost: false,
    updatedAt: getRelativeTimestamp(5),
    likes: [],
    repostCount: 0,
    media: [
      {
        type: "image",
        url: "/preview.jpg?height=512&width=1024",
      },
    ],
    author: {
      username: "Jane Smith",
      handle: "@janesmith",
      avatar: "/placeholder.svg",
    },
    stats: {
      likes: 128,
      comments: 24,
      shares: 16,
      views: 320,
    },
  },
  {
    _id: "3",
    authorId: "user3",
    content: "Check out this cool video with subtitles!",
    createdAt: getRelativeTimestamp(1),
    isRepost: false,
    updatedAt: getRelativeTimestamp(1),
    likes: [],
    repostCount: 0,
    media: [
      {
        type: "video",
        url: "/video.mp4",
      },
    ],
    author: {
      username: "Video Tester",
      handle: "@videotester",
      avatar: "/placeholder.svg",
    },
    stats: {
      likes: 15,
      comments: 3,
      shares: 2,
      views: 75,
    },
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPost_Id, setSelectedPost_Id] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const post_Id = searchParams.get("post_Id");
    if (post_Id) {
      setSelectedPost_Id(post_Id);
    }
  }, [searchParams]);

  const handlePostClick = (post: Post) => {
    setSelectedPost_Id(post._id);
    router.push(`/dashboard?post_Id=${post._id}`);
  };

  const handleBackToList = () => {
    setSelectedPost_Id(null);
    router.push("/dashboard");
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  const selectedPost = posts.find((post) => post._id === selectedPost_Id);

  return (
    <>
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
    </>
  );
}
