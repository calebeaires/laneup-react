import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { useQuery, useMutation } from "convex/react";
import { useEffect, useCallback } from "react";
import { api } from "#/_generated/api";
import type { Id } from "#/_generated/dataModel";
import type { _ProjectType, _TaskType, _WorkspaceType } from "@/types";

// === TYPES ===
export type ProjectId = Id<"projects">;
export type TaskId = Id<"tasks">;
export type InboxId = Id<"inbox">;
export type WorkspaceId = Id<"workspaces">;
export type MemberId = Id<"members">;

// === STATIC USER DATA (temporary) ===
const STATIC_USER = {
  _id: "jd7ct5xwjdrhwaety8z7xkrt2n7m7s0f" as const,
  lastWorkspaceId: null as WorkspaceId | null,
};

// === ZUSTAND STORE ===
interface SpaceState {
  // === CURRENT CONTEXT ===
  currentWorkspaceId: WorkspaceId | null;
  currentProjectId: ProjectId | null;
  userWorkspaceAccessIds: MemberId[];

  // === CACHED DATA ===
  userWorkspaceAccessList: any[];
  workspaceList: _WorkspaceType[];
  projectList: _ProjectType[];
  memberList: any[];
  taskList: _TaskType[];
  viewList: any[];
  favoriteList: any[];
  inboxList: any[];

  // === LOADING STATES ===
  loadingStates: {
    userWorkspaceAccess: boolean;
    workspaces: boolean;
    projects: boolean;
    members: boolean;
    tasks: boolean;
    views: boolean;
    favorites: boolean;
    inbox: boolean;
  };

  // === ACTIONS ===
  setCurrentWorkspace: (workspaceId: WorkspaceId | null) => void;
  setCurrentProject: (projectId: ProjectId | null) => void;
  setUserWorkspaceAccessIds: (ids: MemberId[]) => void;
  setUserWorkspaceAccessList: (list: any[]) => void;
  setWorkspaceList: (list: _WorkspaceType[]) => void;
  setProjectList: (list: _ProjectType[]) => void;
  setMemberList: (list: any[]) => void;
  setTaskList: (list: _TaskType[]) => void;
  setViewList: (list: any[]) => void;
  setFavoriteList: (list: any[]) => void;
  setInboxList: (list: any[]) => void;
  setLoadingState: (
    key: keyof SpaceState["loadingStates"],
    loading: boolean,
  ) => void;
  selectWorkspace: (
    workspaceId: WorkspaceId,
    workspaceList?: _WorkspaceType[],
  ) => boolean;
  selectProject: (
    projectId: ProjectId,
    projectList?: _ProjectType[],
  ) => boolean;
  reset: () => void;
}

const useSpaceStore = create<SpaceState>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // === STATE ===
        currentWorkspaceId: null,
        currentProjectId: null,
        userWorkspaceAccessIds: [],

        // === CACHED DATA ===
        userWorkspaceAccessList: [],
        workspaceList: [],
        projectList: [],
        memberList: [],
        taskList: [],
        viewList: [],
        favoriteList: [],
        inboxList: [],

        // === LOADING STATES ===
        loadingStates: {
          userWorkspaceAccess: true,
          workspaces: true,
          projects: true,
          members: true,
          tasks: true,
          views: true,
          favorites: true,
          inbox: true,
        },

        // === ACTIONS ===
        setCurrentWorkspace: (workspaceId) =>
          set(
            { currentWorkspaceId: workspaceId },
            false,
            "setCurrentWorkspace",
          ),

        setCurrentProject: (projectId) =>
          set({ currentProjectId: projectId }, false, "setCurrentProject"),

        setUserWorkspaceAccessIds: (ids) =>
          set(
            { userWorkspaceAccessIds: ids },
            false,
            "setUserWorkspaceAccessIds",
          ),

        setUserWorkspaceAccessList: (list) =>
          set(
            { userWorkspaceAccessList: list },
            false,
            "setUserWorkspaceAccessList",
          ),

        setWorkspaceList: (list) =>
          set({ workspaceList: list }, false, "setWorkspaceList"),

        setProjectList: (list) =>
          set({ projectList: list }, false, "setProjectList"),

        setMemberList: (list) =>
          set({ memberList: list }, false, "setMemberList"),

        setTaskList: (list) => set({ taskList: list }, false, "setTaskList"),

        setViewList: (list) => set({ viewList: list }, false, "setViewList"),

        setFavoriteList: (list) =>
          set({ favoriteList: list }, false, "setFavoriteList"),

        setInboxList: (list) => set({ inboxList: list }, false, "setInboxList"),

        setLoadingState: (key, loading) =>
          set(
            (state) => ({
              loadingStates: { ...state.loadingStates, [key]: loading },
            }),
            false,
            `setLoadingState:${key}`,
          ),

        selectWorkspace: (workspaceId, workspaceList) => {
          const state = get();
          const list = workspaceList || state.workspaceList;
          const workspace = list.find((w) => w._id === workspaceId);
          if (!workspace) return false;

          set(
            {
              currentWorkspaceId: workspaceId,
              currentProjectId: null, // Reset project when switching workspace
            },
            false,
            "selectWorkspace",
          );
          return true;
        },

        selectProject: (projectId, projectList) => {
          const state = get();
          const list = projectList || state.projectList;
          const project = list.find((p) => p._id === projectId);
          if (!project) return false;

          const updates: Partial<SpaceState> = { currentProjectId: projectId };

          // Switch workspace if project is in different workspace
          if (project.workspaceId !== state.currentWorkspaceId) {
            updates.currentWorkspaceId = project.workspaceId;
          }

          set(updates, false, "selectProject");
          return true;
        },

        reset: () =>
          set(
            {
              currentWorkspaceId: null,
              currentProjectId: null,
              userWorkspaceAccessIds: [],
              userWorkspaceAccessList: [],
              workspaceList: [],
              projectList: [],
              memberList: [],
              taskList: [],
              viewList: [],
              favoriteList: [],
              inboxList: [],
              loadingStates: {
                userWorkspaceAccess: true,
                workspaces: true,
                projects: true,
                members: true,
                tasks: true,
                views: true,
                favorites: true,
                inbox: true,
              },
            },
            false,
            "reset",
          ),
      }),
      { name: "space-store" },
    ),
  ),
);

// === SELECTOR HOOKS ===
export const useCurrentWorkspaceId = () =>
  useSpaceStore((state) => state.currentWorkspaceId);

export const useCurrentProjectId = () =>
  useSpaceStore((state) => state.currentProjectId);

export const useWorkspaceList = () =>
  useSpaceStore((state) => state.workspaceList);

export const useProjectList = () => useSpaceStore((state) => state.projectList);

export const useTaskList = () => useSpaceStore((state) => state.taskList);

export const useCurrentWorkspace = () =>
  useSpaceStore((state) => {
    const { currentWorkspaceId, workspaceList } = state;
    return currentWorkspaceId
      ? workspaceList.find((w) => w._id === currentWorkspaceId) || null
      : null;
  });

export const useCurrentProject = () =>
  useSpaceStore((state) => {
    const { currentProjectId, projectList } = state;
    return currentProjectId
      ? projectList.find((p) => p._id === currentProjectId) || null
      : null;
  });

export const useLoadingStates = () =>
  useSpaceStore((state) => state.loadingStates);

export const useIsInitializing = () =>
  useSpaceStore((state) => {
    const { currentWorkspaceId, currentProjectId, loadingStates } = state;
    return !currentWorkspaceId || !currentProjectId || loadingStates.views;
  });

// === DATA MANAGEMENT HOOKS ===
export const useSpaceDataManager = () => {
  const store = useSpaceStore();
  const {
    setUserWorkspaceAccessList,
    setWorkspaceList,
    setProjectList,
    setMemberList,
    setTaskList,
    setViewList,
    setFavoriteList,
    setInboxList,
    setLoadingState,
    setUserWorkspaceAccessIds,
  } = store;

  // === CONVEX QUERIES ===
  const userWorkspaceAccessResult = useQuery(
    api.queries.getUserMemberships,
    {},
  );
  const workspacesResult = useQuery(
    api.queries.getWorkspacesByMemberships,
    store.userWorkspaceAccessIds.length > 0
      ? { membershipIds: store.userWorkspaceAccessIds }
      : "skip",
  );
  const projectsResult = useQuery(
    api.queries.getUserAccessibleProjects,
    store.currentWorkspaceId
      ? { workspaceId: store.currentWorkspaceId }
      : "skip",
  );
  const membersResult = useQuery(
    api.queries.getWorkspaceMembers,
    store.currentWorkspaceId
      ? { workspaceId: store.currentWorkspaceId }
      : "skip",
  );
  const tasksResult = useQuery(
    api.queries.getProjectTasks,
    store.currentProjectId ? { projectId: store.currentProjectId } : "skip",
  );
  const viewsResult = useQuery(
    api.queries.getProjectViews,
    store.currentProjectId && STATIC_USER._id
      ? { projectId: store.currentProjectId, userId: STATIC_USER._id }
      : "skip",
  );
  const favoritesResult = useQuery(
    api.queries.getUserFavorites,
    store.currentProjectId ? { projectId: store.currentProjectId } : "skip",
  );
  const inboxResult = useQuery(
    api.queries.getUserInbox,
    store.currentProjectId ? { projectId: store.currentProjectId } : "skip",
  );

  // === SYNC QUERY RESULTS TO STORE ===
  useEffect(() => {
    if (userWorkspaceAccessResult !== undefined) {
      setUserWorkspaceAccessList(userWorkspaceAccessResult || []);
      setLoadingState("userWorkspaceAccess", false);

      // Extract workspace access IDs
      if (userWorkspaceAccessResult && userWorkspaceAccessResult.length > 0) {
        const accessIds = userWorkspaceAccessResult.map((access) => access._id);
        setUserWorkspaceAccessIds(accessIds);
      }
    }
  }, [
    userWorkspaceAccessResult,
    setUserWorkspaceAccessList,
    setLoadingState,
    setUserWorkspaceAccessIds,
  ]);

  useEffect(() => {
    if (workspacesResult !== undefined) {
      setWorkspaceList(workspacesResult || []);
      setLoadingState("workspaces", false);
    }
  }, [workspacesResult, setWorkspaceList, setLoadingState]);

  useEffect(() => {
    if (projectsResult !== undefined) {
      setProjectList(projectsResult || []);
      setLoadingState("projects", false);
    }
  }, [projectsResult, setProjectList, setLoadingState]);

  useEffect(() => {
    if (membersResult !== undefined) {
      setMemberList(membersResult || []);
      setLoadingState("members", false);
    }
  }, [membersResult, setMemberList, setLoadingState]);

  useEffect(() => {
    if (tasksResult !== undefined) {
      setTaskList(tasksResult || []);
      setLoadingState("tasks", false);
    }
  }, [tasksResult, setTaskList, setLoadingState]);

  useEffect(() => {
    if (viewsResult !== undefined) {
      setViewList(viewsResult || []);
      setLoadingState("views", false);
    }
  }, [viewsResult, setViewList, setLoadingState]);

  useEffect(() => {
    if (favoritesResult !== undefined) {
      setFavoriteList(favoritesResult || []);
      setLoadingState("favorites", false);
    }
  }, [favoritesResult, setFavoriteList, setLoadingState]);

  useEffect(() => {
    if (inboxResult !== undefined) {
      setInboxList(inboxResult || []);
      setLoadingState("inbox", false);
    }
  }, [inboxResult, setInboxList, setLoadingState]);

  return null; // This hook only manages data, doesn't return anything
};

// === AUTO-INITIALIZATION HOOK ===
export const useSpaceAutoInit = () => {
  const currentWorkspaceId = useCurrentWorkspaceId();
  const currentProjectId = useCurrentProjectId();
  const workspaceList = useWorkspaceList();
  const projectList = useProjectList();
  const loadingStates = useLoadingStates();
  const { selectWorkspace, selectProject } = useSpaceStore();

  // Auto-select first workspace when workspaces load
  useEffect(() => {
    if (
      !loadingStates.workspaces &&
      workspaceList.length > 0 &&
      !currentWorkspaceId
    ) {
      const userLastWorkspace = STATIC_USER.lastWorkspaceId;

      if (userLastWorkspace) {
        const workspace = workspaceList.find(
          (w) => w._id === userLastWorkspace,
        );
        if (workspace) {
          selectWorkspace(workspace._id, workspaceList);
        } else {
          selectWorkspace(workspaceList[0]._id, workspaceList);
        }
      } else {
        selectWorkspace(workspaceList[0]._id, workspaceList);
      }
    }
  }, [
    loadingStates.workspaces,
    workspaceList,
    currentWorkspaceId,
    selectWorkspace,
  ]);

  // Auto-select first project when projects load
  useEffect(() => {
    if (
      !loadingStates.projects &&
      projectList.length > 0 &&
      !currentProjectId &&
      currentWorkspaceId
    ) {
      selectProject(projectList[0]._id, projectList);
    }
  }, [
    loadingStates.projects,
    projectList,
    currentProjectId,
    currentWorkspaceId,
    selectProject,
  ]);
};

// === MUTATIONS HOOK ===
export const useSpaceMutations = () => {
  const currentProjectId = useCurrentProjectId();

  // === MUTATIONS ===
  const updateTaskMutation = useMutation(api.modules.tasks.update);
  const toggleInboxReadMutation = useMutation(api.modules.inbox.toggleRead);
  const archiveInboxMutation = useMutation(api.modules.inbox.archive);
  const unarchiveInboxMutation = useMutation(api.modules.inbox.unarchive);
  const snoozeInboxMutation = useMutation(api.modules.inbox.snooze);
  const markAllInboxAsReadMutation = useMutation(
    api.modules.inbox.markAllAsRead,
  );

  // === WRAPPED ACTIONS ===
  const updateTask = useCallback(
    async (taskId: TaskId, updates: Partial<_TaskType>) => {
      return updateTaskMutation({ _id: taskId, ...updates });
    },
    [updateTaskMutation],
  );

  const markInboxAsRead = useCallback(
    (inboxId: InboxId) => toggleInboxReadMutation({ inboxId, isRead: true }),
    [toggleInboxReadMutation],
  );

  const markInboxAsUnread = useCallback(
    (inboxId: InboxId) => toggleInboxReadMutation({ inboxId, isRead: false }),
    [toggleInboxReadMutation],
  );

  const archiveInbox = useCallback(
    (inboxId: InboxId) => archiveInboxMutation({ inboxId }),
    [archiveInboxMutation],
  );

  const unarchiveInbox = useCallback(
    (inboxId: InboxId) => unarchiveInboxMutation({ inboxId }),
    [unarchiveInboxMutation],
  );

  const snoozeInbox = useCallback(
    (inboxId: InboxId, days: number) => {
      const snoozeDate = new Date();
      snoozeDate.setDate(snoozeDate.getDate() + days);
      return snoozeInboxMutation({
        inboxId,
        snoozeUntil: snoozeDate.getTime(),
      });
    },
    [snoozeInboxMutation],
  );

  const markAllInboxAsRead = useCallback(() => {
    if (!currentProjectId) return Promise.resolve();
    return markAllInboxAsReadMutation({ projectId: currentProjectId });
  }, [currentProjectId, markAllInboxAsReadMutation]);

  return {
    updateTask,
    markInboxAsRead,
    markInboxAsUnread,
    archiveInbox,
    unarchiveInbox,
    snoozeInbox,
    markAllInboxAsRead,
  };
};

// === MAIN HOOK (Backwards compatibility) ===
export const useSpace = () => {
  const store = useSpaceStore();
  const currentWorkspace = useCurrentWorkspace();
  const currentProject = useCurrentProject();
  const loadingStates = useLoadingStates();
  const isInitializing = useIsInitializing();
  const mutations = useSpaceMutations();

  return {
    // === STATE ===
    currentWorkspaceId: store.currentWorkspaceId,
    currentProjectId: store.currentProjectId,
    userId: STATIC_USER._id,

    // === DATA ===
    userWorkspaceAccessList: store.userWorkspaceAccessList,
    workspaceList: store.workspaceList,
    projectList: store.projectList,
    memberList: store.memberList,
    taskList: store.taskList,
    viewList: store.viewList,
    favoriteList: store.favoriteList,
    inboxList: store.inboxList,

    // === COMPUTED ===
    currentWorkspace,
    currentProject,
    hasUserWorkspaceAccess: store.userWorkspaceAccessList.length > 0,
    hasWorkspaces: store.workspaceList.length > 0,
    hasProjects: store.projectList.length > 0,
    hasMembers: store.memberList.length > 0,
    hasTasks: store.taskList.length > 0,
    hasViews: store.viewList.length > 0,
    hasFavorites: store.favoriteList.length > 0,
    hasInbox: store.inboxList.length > 0,

    // === LOADING ===
    userWorkspaceAccessLoading: loadingStates.userWorkspaceAccess,
    workspacesLoading: loadingStates.workspaces,
    projectsLoading: loadingStates.projects,
    membersLoading: loadingStates.members,
    tasksLoading: loadingStates.tasks,
    viewsLoading: loadingStates.views,
    favoritesLoading: loadingStates.favorites,
    inboxLoading: loadingStates.inbox,
    isInitializing,

    // === ACTIONS ===
    selectWorkspace: store.selectWorkspace,
    selectProject: store.selectProject,
    ...mutations,
  };
};

// === UTILITY FUNCTIONS FOR OUTSIDE REACT ===
export const getSpaceState = () => useSpaceStore.getState();

export const getCurrentProjectId = () => getSpaceState().currentProjectId;

export const getCurrentWorkspaceId = () => getSpaceState().currentWorkspaceId;

export const subscribeToWorkspaceChanges = (
  callback: (workspaceId: WorkspaceId | null) => void,
) => {
  return useSpaceStore.subscribe((state) => state.currentWorkspaceId, callback);
};

export const subscribeToProjectChanges = (
  callback: (projectId: ProjectId | null) => void,
) => {
  return useSpaceStore.subscribe((state) => state.currentProjectId, callback);
};
