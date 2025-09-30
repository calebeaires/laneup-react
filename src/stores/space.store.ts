import { useQuery } from "convex/react";
import { useEffect } from "react";
import { create } from "zustand";
import { api } from "#/_generated/api";
import type { _MemberType, _WorkspaceType, UserId } from "@/types";

// === ZUSTAND STORE ===
interface SpaceStore {
  memberList: _MemberType[];
  workspaceList: _WorkspaceType[];
  setMember: (members: _MemberType[]) => void;
  setWorkspace: (workspaces: _WorkspaceType[]) => void;
  initialize: () => void;
}

export const useSpaceStore = create<SpaceStore>()((set) => ({
  workspaceList: [],
  memberList: [],
  setMember: (members: _MemberType[]) => {
    set({ memberList: members });
  },
  setWorkspace: (workspaces) => {
    set({ workspaceList: workspaces });
  },
  initialize: () => {
    // This is a placeholder - actual initialization happens in the hook
  },
}));

// === INITIALIZATION HOOK ===
export const useSpaceInitializer = () => {
  const space = useSpaceStore();
  const memberList = useQuery(api.queries.getUserMemberships);
  const workspaceList = useQuery(api.queries.getUserWorkspaces, {
    userId: "jd7ct5xwjdrhwaety8z7xkrt2n7m7s0f" as UserId,
  });

  useEffect(() => {
    if (workspaceList && workspaceList.length > 0) {
      space.setWorkspace(workspaceList);
    }
    if (memberList && memberList.length > 0) {
      space.setMember(memberList);
    }
  }, [memberList, workspaceList]);

  return { memberList, workspaceList };
};
