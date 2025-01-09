"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Profile } from "@/types/profile";
import { Post } from "@/types/post";
import { ProfileHeader } from "@/components/business/profile-header";
import { ProfileTabs } from "@/components/business/profile-tabs";
import { Follow } from "@/components/business/follow";
import { UserPosts } from "@/components/business/user-posts";
import { PostDetails } from "@/components/business/post-details";

// 静态用户数据
const users = {
  lanigiro514: {
    name: "柳井户",
    handle: "@lanigiro514",
    avatar: "/placeholder.svg",
    headerImage: "/placeholder.svg?height=200&width=600",
    bio: "这里是柳井户的个人简介",
    isVerified: true,
    joinDate: "2024-01",
    stats: {
      following: 123,
      followers: 456,
    },
  },
  johndoe: {
    name: "John Doe",
    handle: "@johndoe",
    avatar: "/placeholder.svg",
    headerImage: "/placeholder.svg?height=200&width=600",
    bio: "This is John Doe's bio",
    isVerified: false,
    joinDate: "2023-06",
    stats: {
      following: 789,
      followers: 1011,
    },
  },
  janesmith: {
    name: "Jane Smith",
    handle: "@janesmith",
    avatar: "/placeholder.svg",
    headerImage: "/placeholder.svg?height=200&width=600",
    bio: "Jane Smith's profile description",
    isVerified: true,
    joinDate: "2023-12",
    stats: {
      following: 234,
      followers: 567,
    },
  },
};

// 静态帖子数据
const staticPosts: Post[] = [
  {
    _id: "1",
    authorId: "lanigiro514",
    content: "这是柳井户的第一条推文！",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRepost: false,
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    likes: [],
    repostCount: 0,
    author: {
      username: "柳井户",
      handle: "@lanigiro514",
      avatar: "/placeholder.svg",
    },
    stats: {
      likes: 10,
      comments: 2,
      shares: 1,
      views: 100,
    },
  },
  {
    _id: "2",
    authorId: "johndoe",
    content: "Hello, Twitter clone!",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isRepost: false,
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    likes: [],
    repostCount: 0,
    author: {
      username: "John Doe",
      handle: "@johndoe",
      avatar: "/placeholder.svg",
    },
    stats: {
      likes: 15,
      comments: 3,
      shares: 2,
      views: 150,
    },
  },
  {
    _id: "3",
    authorId: "janesmith",
    content: "Just joined this amazing platform!",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    isRepost: false,
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    likes: [],
    repostCount: 0,
    author: {
      username: "Jane Smith",
      handle: "@janesmith",
      avatar: "/placeholder.svg",
    },
    stats: {
      likes: 20,
      comments: 5,
      shares: 3,
      views: 200,
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
  const params = useParams();
  const handle = params.handle as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("posts");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    // 模拟API调用来获取用户数据
    const userData = users[handle as keyof typeof users];
    if (userData) {
      setProfile(userData);
      // 过滤出属于该用户的帖子
      const userPosts = staticPosts.filter((post) => post.author?.handle === userData.handle);
      setPosts(userPosts);
    } else {
      // 处理用户不存在的情况
      router.push("/404"); // 假设你有一个404页面
    }
  }, [handle, router]);

  useEffect(() => {
    const postId = searchParams.get("postId");
    if (postId) {
      setSelectedPostId(postId);
    }
  }, [searchParams]);

  const handleDeletePost = async (postId: string) => {
    // 这里应该是一个API调用来删除帖子
    setPosts(posts.filter((post) => post._id !== postId));
  };

  const handleBackToProfile = () => {
    setSelectedPostId(null);
    router.push(`/dashboard/profile/${handle}`);
  };

  const selectedPost = posts.find((post) => post._id === selectedPostId);

  if (!profile) {
    return <div>Loading...</div>; // 或者一个更好的加载指示器
  }

  return (
    <div className='w-[70%] mx-auto'>
      {selectedPost ? (
        <PostDetails post={selectedPost} onBack={handleBackToProfile} />
      ) : (
        <>
          <ProfileHeader profile={profile} currentUser={currentUser} />
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
