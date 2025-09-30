import { UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebarUser() {
  function handleUserClick() {
    setIsOpen(!isOpen);
    setLocalKey(Date.now());
    setTimeout(() => setIsOpen(false));
  }

  const [isOpen, setIsOpen] = useState(false);
  const [localKey, setLocalKey] = useState(Date.now());

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={handleUserClick}
        >
          <UserButton
            after-sign-out-url="/connect"
            defaultOpen={isOpen}
            key={localKey}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              calebe {isOpen ? "open" : "closed"}
            </span>
            <span className="truncate text-xs">calebeaires@gmail.com</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
