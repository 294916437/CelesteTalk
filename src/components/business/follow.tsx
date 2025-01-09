"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/basic/avatar";
import { Button } from "@/components/basic/button";
import { VerifiedBadge } from "@/components/feedback/verified-badge";
import { Suggestion } from "@/types/profile";

const suggestions: Suggestion[] = [
  {
    id: "1",
    name: "LIHKG 讨论区",
    handle: "@lihkg_forum",
    avatar: "/placeholder.svg",
    bio: "汇集城市热门话题、时事、娱乐、创意、日常生活讨论，以自由讨论为宗旨！",
    isVerified: true,
  },
  {
    id: "2",
    name: "Ado",
    handle: "@ado1024imokenp",
    avatar: "/placeholder.svg",
    bio: "日本知名歌手",
    isVerified: true,
  },
];

export function Follow() {
  return (
    <div className='w-full border rounded-none'>
      <h2 className='text-xl font-bold px-4 py-3 border-b'>推荐关注</h2>
      <div className='divide-y'>
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className='flex items-center justify-between gap-3 p-4 hover:bg-muted/80 transition-colors'>
            <div className='flex items-center gap-3'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src={suggestion.avatar} />
                <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-1'>
                  <span className='font-bold truncate hover:underline cursor-pointer'>
                    {suggestion.name}
                  </span>
                  {suggestion.isVerified && <VerifiedBadge />}
                </div>
                <div className='text-sm text-muted-foreground truncate'>
                  {suggestion.handle}
                </div>
              </div>
            </div>
            <Button
              variant='outline'
              className='rounded-full px-4 font-semibold bg-background hover:bg-muted/50 hover:text-foreground'
              size='sm'>
              关注
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
