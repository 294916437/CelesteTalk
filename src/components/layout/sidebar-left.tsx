"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/basic/button";
import { PostDialog } from "@/components/business/post-dialog";
import { Sidebar, SidebarContent, SidebarFooter } from "@/components/layout/sidebar";
import { Home, User, Bell, Mail, Bookmark, List, Users, Lock } from "lucide-react";

const menuItems = [
  { icon: Home, label: "首页", href: "/dashboard" },
  { icon: Bell, label: "通知", href: "/dashboard/notifications" },
  { icon: Mail, label: "消息", href: "/dashboard/messages" },
  { icon: Bookmark, label: "书签", href: "/dashboard/bookmarks" },
  { icon: List, label: "列表", href: "/dashboard/lists" },
  { icon: User, label: "个人资料", href: "/dashboard/profile" },
  { icon: Users, label: "社区", href: "/dashboard/communities" },
  { icon: Lock, label: "修改密码", href: "/dashboard/change-password" },
];

export function SidebarLeft() {
  const pathname = usePathname();

  return (
    <Sidebar side='left' className='border-r'>
      <SidebarContent className='flex flex-col gap-4 p-4'>
        <Link
          href='/dashboard'
          className='flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90'>
          {/* Replace with your logo */}
          <span className='sr-only'>Logo</span>
          🐦
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
        <PostDialog />
      </SidebarContent>
      <SidebarFooter>{/* Add footer content here */}</SidebarFooter>
    </Sidebar>
  );
}
