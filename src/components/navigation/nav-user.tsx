"use client";

import { BadgeCheck, Bell, ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/basic/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/feedback/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/layout/sidebar";
import { User } from "@/types/user";
import { useUserStore } from "@/store/user.store";
import Link from "next/link";
import { Router } from "next/router";
import { getImageUrl } from "@/utils/utils";

interface NavUserProps {
  user: User;
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { clearUser } = useUserStore();

  const handleLogout = () => {
    clearUser();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={getImageUrl(user.avatar)} alt={user.username} />
                <AvatarFallback className='rounded-lg'>{user.username[0]}</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>{user.username}</span>
                <span className='truncate text-xs'>{user.email}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? "bottom" : "right"}
            align='start'
            sideOffset={4}>
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={getImageUrl(user.avatar)} alt={user.username} />
                  <AvatarFallback className='rounded-lg'>{user.username[0]}</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user.username}</span>
                  <span className='truncate text-xs'>
                    粉丝: {user.followers.length} · 关注: {user.following.length}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href={"/dashboard/profile"}>
                <DropdownMenuItem>
                  <BadgeCheck className='mr-2' />
                  个人资料
                </DropdownMenuItem>
              </Link>
              <Link href={"/dashboard/settings"}>
                <DropdownMenuItem>
                  <Settings className='mr-2' />
                  设置
                </DropdownMenuItem>
              </Link>
              <Link href={"/dashboard/notifications"}>
                <DropdownMenuItem>
                  <Bell className='mr-2' />
                  通知 {user.settings.notifications.push ? "(开启)" : "(关闭)"}
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <Link href={"/login"}>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className='mr-2' />
                退出登录
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
