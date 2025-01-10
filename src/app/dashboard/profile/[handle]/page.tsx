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
import { useUserStore } from "@/store/user.store";
// 获取用户数据

export default function ProfilePage() {
  const params = useParams();
  const user = useUserStore((state) => state.user);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("posts");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const currentUser = user
    ? {
        name: user.username,
        handle: user._id,
        avatar: user.avatar,
      }
    : null;

  useEffect(() => {
    const postId = searchParams.get("postId");
    if (postId) {
      setSelectedPostId(postId);
    }
  }, [searchParams]);

  const handleDeletePost = async (postId: string) => {
    await setPosts(posts.filter((post) => post._id !== post._id));
  };
  const handlePostClick = (post: Post) => {
    setSelectedPostId(post._id);
    router.push(`/dashboard/?postId=${post._id}`);
  };
  const handleBackToProfile = () => {
    setSelectedPostId(null);
    router.push(`/dashboard/profile`);
  };

  const selectedPost = posts.find((post) => post._id === selectedPostId);

  if (!profile) {
    return <div>Loading...</div>;
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
                onPostClick={handlePostClick}
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
