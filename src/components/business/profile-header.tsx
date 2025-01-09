"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/basic/avatar";
import { VerifiedBadge } from "@/components/feedback/verified-badge";
import { Profile } from "@/types/profile";
import { EditProfile } from "@/components/business/edit-profile";
import { Button } from "@/components/basic/button";

interface ProfileHeaderProps {
  profile: Profile;
  currentUser: { handle: string } | null;
}

export function ProfileHeader({ profile: initialProfile, currentUser }: ProfileHeaderProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleProfileUpdate = (updatedProfile: Partial<Profile>) => {
    setProfile({ ...profile, ...updatedProfile });
    // Here you would typically send the updated profile to your backend
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Here you would typically send a follow/unfollow request to your backend
  };

  const isOwnProfile = currentUser && currentUser.handle === profile.handle;

  return (
    <div className='relative pb-3'>
      <div className='h-[200px] w-full bg-muted'>
        {profile.headerImage && (
          <img src={profile.headerImage} alt='' className='h-full w-full object-cover' />
        )}
      </div>

      <div className='px-4'>
        <div className='relative flex justify-between'>
          <div className='absolute -top-16 left-4 rounded-full p-1 bg-background'>
            <Avatar className='h-[134px] w-[134px] border-4 border-background'>
              <AvatarImage src={profile.avatar} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className='ml-auto mt-4 mr-4'>
            {isOwnProfile ? (
              <EditProfile profile={profile} onSave={handleProfileUpdate} />
            ) : (
              <Button
                variant={isFollowing ? "outline" : "default"}
                className='rounded-full font-semibold'
                onClick={handleFollow}>
                {isFollowing ? "正在关注" : "关注"}
              </Button>
            )}
          </div>
        </div>

        <div className='px-4 mb-4 mt-20'>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl font-bold'>{profile.name}</h2>
            {profile.isVerified && <VerifiedBadge />}
          </div>
          <p className='text-muted-foreground'>{profile.handle}</p>
          {profile.bio && <p className='mt-3 text-sm leading-normal'>{profile.bio}</p>}
          <div className='mt-3 text-sm text-muted-foreground'>
            加入时间：
            {new Date(profile.joinDate).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
            })}
          </div>
          <div className='mt-3 flex gap-4 text-sm'>
            <button className='hover:underline'>
              <span className='font-bold'>{profile.stats.following}</span>{" "}
              <span className='text-muted-foreground hover:text-foreground'>正在关注</span>
            </button>
            <button className='hover:underline'>
              <span className='font-bold'>{profile.stats.followers}</span>{" "}
              <span className='text-muted-foreground hover:text-foreground'>关注者</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
