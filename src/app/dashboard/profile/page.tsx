"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Profile } from "@/types/profile";
import { Post } from "@/types/post";
import { ProfileHeader } from "@/components/business/profile-header";
import { ProfileTabs } from "@/components/business/profile-tabs";
import { Follow } from "@/components/business/follow";
import { UserPosts } from "@/components/business/user-posts";

import { PostDetails } from "@/components/business/post-details";

// This would normally come from an API
const mockProfile: Profile = {
  name: "柳井户",
  handle: "@lanigiro514",
  avatar: "/placeholder.svg",
  headerImage: "/placeholder.svg?height=200&width=600",
  bio: "这里是个人简介",
  isVerified: true,
  joinDate: "2024-01",
  stats: {
    following: 0,
    followers: 0,
  },
};

// Sample user posts
const mockPosts: Post[] = [
  {
    _id: "1",
    authorId: "user123",
    content: "这是我的第一条推文！",
    createdAt: new Date().toISOString(),
    isRepost: false,
    updatedAt: new Date().toISOString(),
    likes: [],
    repostCount: 0,
    author: {
      username: "柳井户",
      handle: "@lanigiro514",
      avatar: "/placeholder.svg",
    },
    stats: {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
    },
  },
  {
    _id: "2",
    authorId: "user123",
    content: "欢迎来到我的Twitter克隆版主页！",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRepost: false,
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    likes: [],
    repostCount: 0,
    media: [
      {
        type: "image",
        url: "/placeholder.svg",
      },
    ],
    author: {
      username: "柳井户",
      handle: "@lanigiro514",
      avatar: "/placeholder.svg",
    },
    stats: {
      likes: 5,
      comments: 2,
      shares: 1,
      views: 50,
    },
  },
];

// Simulated current user (this would normally come from an authentication system)
const currentUser = {
  name: "柳井户",
  handle: "@lanigiro514",
  avatar: "/placeholder.svg",
};

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    // 这里应该是一个 API 调用来获取用户数据
    // 现在我们只是模拟这个过程
    console.log(`Fetching data for user: ${mockProfile.handle}`);
    // 设置 mockProfile 和 mockPosts 数据
  }, []);

  useEffect(() => {
    const postId = searchParams.get("postId");
    if (postId) {
      setSelectedPostId(postId);
    }
  }, [searchParams]);

  const handleDeletePost = async (postId: string) => {
    // Here you would typically make an API call to delete the post
    setPosts(posts.filter((post) => post._id !== postId));
  };

  const handleBackToProfile = () => {
    setSelectedPostId(null);
    router.push("/dashboard/profile");
  };

  const selectedPost = posts.find((post) => post._id === selectedPostId);

  return (
    <div className='w-[70%] mx-auto'>
      {selectedPost ? (
        <PostDetails post={selectedPost} onBack={handleBackToProfile} />
      ) : (
        <>
          <ProfileHeader profile={mockProfile} currentUser={currentUser} />
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <div className='divide-y divide-border'>
            {activeTab === "posts" ? (
              <UserPosts
                posts={posts}
                onDeletePost={handleDeletePost}
                setPosts={setPosts}
                currentUser={currentUser}
              />
            ) : (
              <div className='px-4'>
                <div className='py-3'>
                  <Follow />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
