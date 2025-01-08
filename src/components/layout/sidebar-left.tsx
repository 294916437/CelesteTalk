"use client";

import * as React from "react";
import {
  Command,
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  Users,
  User,
  MoreHorizontal,
  BadgeCheck,
} from "lucide-react";
import { NavMain, NavItem } from "@/components/navigation/nav-main";
import { Sidebar, SidebarHeader } from "@/components/layout/sidebar";

const navItems: NavItem[] = [
  { title: "首页", url: "/", icon: Home, isActive: true },
  { title: "探索", url: "/explore", icon: Search },
  { title: "通知", url: "/notifications", icon: Bell },
  { title: "消息", url: "/messages", icon: Mail },
  { title: "书签", url: "/bookmarks", icon: Bookmark },
  { title: "社区", url: "/communities", icon: Users },
  { title: "已认证", url: "/verified", icon: BadgeCheck },
  { title: "个人资料", url: "/profile", icon: User },
  { title: "更多", url: "/more", icon: MoreHorizontal },
];

export function SidebarLeft({}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className='border-r-0 bg-background flex flex-col items-end pr-4'>
      <SidebarHeader className='p-4 w-full max-w-[275px]'>
        <div className='flex items-center justify-start mb-4 pl-4'>
          <Command className='h-8 w-8' />
        </div>
        <NavMain items={navItems} />
      </SidebarHeader>
    </Sidebar>
  );
}
