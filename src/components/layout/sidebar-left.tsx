"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/basic/button";
import { PostDialog } from "@/components/business/post-dialog";
import { Sidebar, SidebarContent, SidebarFooter } from "@/components/layout/sidebar";
import { Home, User, Bell, Mail, Bookmark, List, Users, Lock } from "lucide-react";
import { useUserStore } from "@/store/user.store";
import { usePosts } from "@/hooks/post/usePosts";
const menuItems = [
  { icon: Home, label: "首页", href: "/dashboard" },
  { icon: Bell, label: "通知", href: "/dashboard/notifications" },
  { icon: Mail, label: "消息", href: "/dashboard/messages" },
  { icon: Bookmark, label: "书签", href: "/dashboard/bookmarks" },
  { icon: List, label: "列表", href: "/dashboard/lists" },
  { icon: User, label: "个人资料", href: "/dashboard/profile" },
  { icon: Users, label: "社区", href: "/dashboard/communities" },
  { icon: Lock, label: "修改密码", href: "/dashboard/password" },
];

export function SidebarLeft() {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const { fetchPosts } = usePosts();
  const currentUser = user
    ? {
        name: user.username,
        handle: user._id,
        avatar: user.avatar,
      }
    : null;
  return (
    <Sidebar side='left' className='border-r'>
      <SidebarContent className='flex flex-col gap-4 p-4'>
        <Link
          href='/dashboard'
          className='flex items-center gap-3 hover:opacity-80 transition-opacity duration-200'>
          <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full'>
            <div className='w-full h-full relative'>
              <img
                src='/logo.webp'
                alt='Logo'
                className='w-[170%] h-[170%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover'
              />
            </div>
          </div>
          <span className='text-lg font-semibold text-gray-700 dark:text-gray-300'>
            CesleteTalk
          </span>
          <span className='sr-only'>CesleteTalk Logo</span>
        </Link>
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? "secondary" : "ghost"}
            className='justify-start gap-4 text-xl py-3'
            asChild>
            <Link href={item.href}>
              <item.icon className='h-6 w-6' />
              <span>{item.label}</span>
            </Link>
          </Button>
        ))}
        {currentUser && (
          <div className='mx-auto w-full max-w-3xl rounded-xl bg-card p-4'>
            <PostDialog
              currentUser={currentUser}
              onPost={() => {
                fetchPosts();
              }}
            />
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>{/* Add footer content here */}</SidebarFooter>
    </Sidebar>
  );
}
