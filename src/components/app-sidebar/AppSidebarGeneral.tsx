import { FolderKanban, Home, Inbox, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSpaceContext } from "@/contexts/SpaceContext";

const AppSidebarGeneral = () => {
  const navigate = useNavigate();
  const { inboxList } = useSpaceContext();

  const items = [
    { title: "Home", icon: Home, path: "/" },
    { title: "Inbox", icon: Inbox, path: "/inbox" },
    { title: "Members", icon: Users, path: "/members" },
    { title: "Projects", icon: FolderKanban, path: "/project" },
  ];

  const inboxCount = inboxList.filter((item) => !item.isRead).length;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              {item.title === "Inbox" && inboxCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-auto h-5 px-1.5 text-xs"
                >
                  {inboxCount}
                </Badge>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default AppSidebarGeneral;
