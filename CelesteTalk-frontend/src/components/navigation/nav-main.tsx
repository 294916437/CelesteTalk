"use client";

import { LucideIcon, PenSquare } from "lucide-react";
import { Button } from "@/components/basic/button";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/layout/sidebar";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
}

interface NavMainProps {
  items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
  return (
    <div className='flex flex-col items-start gap-1 w-full max-w-[275px]'>
      <SidebarMenu className='w-full'>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={item.isActive}
              className='w-full rounded-full px-4 py-3 text-xl hover:bg-accent transition-colors duration-200 min-h-12 '>
              <a href={item.url} className='flex items-center justify-center'>
                <div className='flex items-center justify-left w-full max-w-[200px]'>
                  <item.icon className='h-7 w-7 mr-4' />
                  <span className='font-medium'>{item.title}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <Button className='w-full mt-4 rounded-full bg-primary px-4 py-3 text-xl font-bold hover:bg-primary/90 transition-colors duration-200'>
        <PenSquare className='mr-2 h-6 w-6' />
        发帖
      </Button>
    </div>
  );
}
