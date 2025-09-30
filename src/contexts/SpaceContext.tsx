import { useQuery } from 'convex/react';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import { api } from '#/_generated/api';
import type {
	_FavoriteType,
	_InboxType,
	_MemberType,
	_ProjectType,
	_TaskType,
	_ViewType,
	_WorkspaceType,
	UserId
} from '@/types';

// === ATOMS ===
// List atoms
export const memberListAtom = atom<_MemberType[]>([]);
export const workspaceListAtom = atom<_WorkspaceType[]>([]);
export const projectListAtom = atom<_ProjectType[]>([]);
export const viewListAtom = atom<_ViewType[]>([]);
export const taskListAtom = atom<_TaskType[]>([]);
export const favoriteListAtom = atom<_FavoriteType[]>([]);
export const inboxListAtom = atom<_InboxType[]>([]);

// Current state atoms
export const currentWorkspaceAtom = atom<_WorkspaceType | null>(null);
export const currentProjectAtom = atom<_ProjectType | null>(null);
export const isLoadingAtom = atom<boolean>(false);

// === TYPES ===
interface SpaceContextType {
	memberList: _MemberType[];
	workspaceList: _WorkspaceType[];
	projectList: _ProjectType[];
	viewList: _ViewType[];
	favoriteList: _FavoriteType[];
	inboxList: _InboxType[];
	taskList: _TaskType[];

	currentWorkspace: _WorkspaceType | null;

	currentProject: _ProjectType | null;
	setCurrentProject: (project: _ProjectType | null) => void;

	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;
}

// === CONTEXT ===
const SpaceContext = createContext<SpaceContextType | undefined>(undefined);
const userId = 'jd7ct5xwjdrhwaety8z7xkrt2n7m7s0f' as UserId;

// === PROVIDER ===
export function SpaceProvider({ children }: { children: ReactNode }) {
	// Atom hooks
	const [memberList, setMemberList] = useAtom(memberListAtom);
	const [workspaceList, setWorkspaceList] = useAtom(workspaceListAtom);
	const [projectList, setProjectList] = useAtom(projectListAtom);
	const [viewList, setViewList] = useAtom(viewListAtom);
	const [taskList, setTaskList] = useAtom(taskListAtom);
	const [favoriteList] = useAtom(favoriteListAtom);
	const [inboxList] = useAtom(inboxListAtom);

	const [currentWorkspace, setCurrentWorkspace] = useAtom(currentWorkspaceAtom);
	const [currentProject, setCurrentProject] = useAtom(currentProjectAtom);
	const [isLoading, setIsLoading] = useAtom(isLoadingAtom);

	// Data fetching hooks
	const fetchedMembers = useQuery(api.queries.getUserMemberships);
	const fetchedWorkspaces = useQuery(api.queries.getUserWorkspaces, {
		userId
	});
	const fetchedProjects = useQuery(api.queries.getUserAccessibleProjects, {
		workspaceId: currentWorkspace?._id ? currentWorkspace._id : null
	});
	const fetchedTasks = useQuery(api.queries.getProjectTasks, {
		projectId: currentProject?._id ? currentProject._id : null
	});
	const fetchedViews = useQuery(api.queries.getProjectViews, {
		projectId: currentProject?._id ? currentProject._id : null,
		userId
	});

	// Effects for data synchronization
	useEffect(() => {
		console.log('SpaceContext: Data update effect triggered');
		if (fetchedMembers && fetchedMembers.length > 0) {
			setMemberList(fetchedMembers);
		}
		if (fetchedWorkspaces && fetchedWorkspaces.length > 0) {
			setCurrentWorkspace(fetchedWorkspaces[0]);
			setWorkspaceList(fetchedWorkspaces);
		}
		if (
			fetchedProjects &&
			Array.isArray(fetchedProjects) &&
			fetchedProjects.length > 0
		) {
			setProjectList(fetchedProjects as _ProjectType[]);
			// Only set current project if none is selected
			if (!currentProject && fetchedProjects[0]) {
				setCurrentProject(fetchedProjects[0] as _ProjectType);
			}
		}
		if (
			fetchedTasks &&
			Array.isArray(fetchedTasks) &&
			fetchedTasks.length > 0
		) {
			setTaskList(fetchedTasks as _TaskType[]);
		}

		if (
			fetchedViews &&
			Array.isArray(fetchedViews) &&
			fetchedViews.length > 0
		) {
			setViewList(fetchedViews as _ViewType[]);
		}
	}, [
		fetchedMembers,
		fetchedWorkspaces,
		fetchedProjects,
		fetchedTasks,
		fetchedViews,
		currentProject,
		setMemberList,
		setWorkspaceList,
		setCurrentWorkspace,
		setProjectList,
		setCurrentProject,
		setTaskList,
		setViewList
	]);

	// Context value
	const contextValue: SpaceContextType = {
		memberList,
		workspaceList,
		projectList,
		viewList,
		favoriteList,
		taskList,
		inboxList,
		currentWorkspace,
		currentProject,
		setCurrentProject,
		isLoading,
		setIsLoading
	};

	return (
		<SpaceContext.Provider value={contextValue}>
			{children}
		</SpaceContext.Provider>
	);
}

// === HOOKS ===
export function useSpaceContext() {
	const context = useContext(SpaceContext);
	if (context === undefined) {
		throw new Error('useSpaceContext must be used within a SpaceProvider');
	}
	return context;
}

// Convenient hooks for using atoms directly
export const useMemberList = () => useAtomValue(memberListAtom);
export const useWorkspaceList = () => useAtomValue(workspaceListAtom);
export const useProjectList = () => useAtomValue(projectListAtom);
export const useViewList = () => useAtomValue(viewListAtom);
export const useTaskList = () => useAtomValue(taskListAtom);
export const useFavoriteList = () => useAtomValue(favoriteListAtom);
export const useInboxList = () => useAtomValue(inboxListAtom);
export const useCurrentWorkspace = () => useAtomValue(currentWorkspaceAtom);
export const useCurrentProject = () => useAtomValue(currentProjectAtom);
export const useIsLoading = () => useAtomValue(isLoadingAtom);

// Setter hooks
export const useSetCurrentProject = () => useSetAtom(currentProjectAtom);
export const useSetIsLoading = () => useSetAtom(isLoadingAtom);
