import * as React from "react";
import { Plus } from "lucide-react";

import { Calendars } from "@/components/basic/calendars";
import { DatePicker } from "@/components/data/date-picker";
import { NavUser } from "@/components/navigation/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/layout/sidebar";
import { useUserStore } from "@/store/user.store";
export function SidebarRight({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserStore((state) => state.user);
  const data = {
    user: user,
    calendars: [
      {
        name: "My Calendars",
        items: ["Personal", "Work", "Family"],
      },
      {
        name: "Favorites",
        items: ["Holidays", "Birthdays"],
      },
      {
        name: "Other",
        items: ["Travel", "Reminders", "Deadlines"],
      },
    ],
  };

  return (
    <Sidebar
      collapsible='none'
      className='sticky hidden lg:flex top-0 h-svh border-l'
      {...props}>
      <SidebarHeader className='h-16 border-b border-sidebar-border'>
        {data.user && <NavUser user={data.user} />}
      </SidebarHeader>
      <SidebarContent>
        <DatePicker />
        <SidebarSeparator className='mx-0' />
        <Calendars calendars={data.calendars} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
