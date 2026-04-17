"use client";

import { ScrollArea } from "@/modules/shared/components/ui/scroll-area";
import { usePresence } from "@/hooks/usePresence";
import { cn } from "@/lib/utils";
import BaseAvatar from "@/modules/shared/components/common/BaseAvatar";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { formatRole } from "@/lib/role-utils";

export function PresenceSidebar({ className }: { className?: string }) {
  const { onlineUsers, allStaff } = usePresence();
  const { data: session } = useSession();

  const sortedUsers = useMemo(() => {
    // Lọc ra các nhân viên đang online dựa trên Set ID onlineUsers
    const onlineStaffList = allStaff.filter(user => onlineUsers.has(Number(user.id)));
    
    return onlineStaffList.sort((a, b) => {
      const currentUserId = Number(session?.user?.id);
      if (Number(a.id) === currentUserId) return -1;
      if (Number(b.id) === currentUserId) return 1;
      
      const nameA = a.fullName || a.username || "";
      const nameB = b.fullName || b.username || "";
      return nameA.localeCompare(nameB);
    });
  }, [allStaff, onlineUsers, session?.user?.id]);

  return (
    <div className={cn("flex flex-col h-full bg-card border-l", className)}>
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          Đội ngũ trực tuyến
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedUsers.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Chưa có ai trực tuyến
            </div>
          ) : (
            sortedUsers.map((user) => (
              <div
                key={user.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50 group",
                  user.id === Number(session?.user?.id) && "bg-muted/30"
                )}
              >
                <BaseAvatar
                  id={user.id}
                  src={user.avatar}
                  name={user.fullName || user.username}
                  online={true}
                  size="sm"
                  showStatus={false}
                />

                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">
                    {user.fullName || user.username}
                    {user.id === Number(session?.user?.id) && (
                      <span className="ml-1.5 text-[10px] text-primary/70 font-normal">
                        (Bạn)
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {formatRole(user.role)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
