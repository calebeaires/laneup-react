import React, { memo } from 'react';
import {
  useMinimalSpace,
  useWorkspaceContext,
  useProjectContext,
  useTaskContext,
  useThrottledTaskContext,
  useStableCurrentWorkspace,
  useStableCurrentProject,
  useDebouncedCurrentWorkspaceId,
} from '@/hooks/useSpaceDebounced';
import {
  useCurrentWorkspaceId,
  useCurrentProjectId,
  useSpaceMutations,
} from '@/stores/space.store.optimized';

// 1. Minimal component that only needs basic state
const MinimalStatusComponent = memo(() => {
  const { currentWorkspaceId, currentProjectId, isReady } = useMinimalSpace();

  console.log('MinimalStatusComponent rendered');

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3>Status</h3>
      <p>Workspace: {currentWorkspaceId || 'None'}</p>
      <p>Project: {currentProjectId || 'None'}</p>
      <p>Ready: {isReady ? '✅' : '⏳'}</p>
    </div>
  );
});

// 2. Component that only needs workspace data
const WorkspaceSelector = memo(() => {
  const { currentWorkspace, workspaceList, isLoading } = useWorkspaceContext();

  console.log('WorkspaceSelector rendered');

  if (isLoading) return <div>Loading workspaces...</div>;

  return (
    <div className="p-4 bg-blue-100 rounded">
      <h3>Workspace Selector</h3>
      <p>Current: {currentWorkspace?.name || 'None'}</p>
      <select>
        {workspaceList.map((workspace) => (
          <option key={workspace._id} value={workspace._id}>
            {workspace.name}
          </option>
        ))}
      </select>
    </div>
  );
});

// 3. Component that only needs project data
const ProjectSelector = memo(() => {
  const { currentProject, projectList, isLoading } = useProjectContext();

  console.log('ProjectSelector rendered');

  if (isLoading) return <div>Loading projects...</div>;

  return (
    <div className="p-4 bg-green-100 rounded">
      <h3>Project Selector</h3>
      <p>Current: {currentProject?.name || 'None'}</p>
      <select>
        {projectList.map((project) => (
          <option key={project._id} value={project._id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
});

// 4. Component that needs task data but optimized for performance
const TaskCounter = memo(() => {
  const { taskCount, isLoading, hasTasks } = useTaskContext();

  console.log('TaskCounter rendered');

  return (
    <div className="p-4 bg-yellow-100 rounded">
      <h3>Task Counter</h3>
      {isLoading ? (
        <p>Loading tasks...</p>
      ) : (
        <p>
          {hasTasks ? `${taskCount} tasks` : 'No tasks'}
        </p>
      )}
    </div>
  );
});

// 5. Component with throttled updates for heavy task processing
const TaskAnalytics = memo(() => {
  const { taskList, taskCount, isLoading } = useThrottledTaskContext(2000); // 2 second throttle

  console.log('TaskAnalytics rendered (throttled)');

  if (isLoading) return <div>Loading analytics...</div>;

  const completedTasks = taskList.filter(task => task.completed).length;
  const pendingTasks = taskCount - completedTasks;

  return (
    <div className="p-4 bg-purple-100 rounded">
      <h3>Task Analytics (Throttled Updates)</h3>
      <p>Total: {taskCount}</p>
      <p>Completed: {completedTasks}</p>
      <p>Pending: {pendingTasks}</p>
      <p>Completion Rate: {taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0}%</p>
    </div>
  );
});

// 6. Component with debounced workspace ID for search/filtering
const WorkspaceSearch = memo(() => {
  const debouncedWorkspaceId = useDebouncedCurrentWorkspaceId(500);

  console.log('WorkspaceSearch rendered');

  return (
    <div className="p-4 bg-indigo-100 rounded">
      <h3>Workspace Search (Debounced)</h3>
      <p>Searching in: {debouncedWorkspaceId || 'No workspace'}</p>
      <input
        type="text"
        placeholder="Search..."
        className="mt-2 p-2 border rounded"
      />
    </div>
  );
});

// 7. Component using stable references to prevent unnecessary re-renders
const WorkspaceInfo = memo(() => {
  const workspace = useStableCurrentWorkspace();

  console.log('WorkspaceInfo rendered');

  if (!workspace) return <div>No workspace selected</div>;

  return (
    <div className="p-4 bg-pink-100 rounded">
      <h3>Workspace Info (Stable)</h3>
      <p>Name: {workspace.name}</p>
      <p>Description: {workspace.description}</p>
      <p>ID: {workspace._id}</p>
    </div>
  );
});

// 8. Component that performs actions but doesn't need to re-render often
const TaskActions = memo(() => {
  const currentProjectId = useCurrentProjectId();
  const { updateTask, markAllInboxAsRead } = useSpaceMutations();

  console.log('TaskActions rendered');

  const handleMarkAllRead = async () => {
    if (currentProjectId) {
      await markAllInboxAsRead();
    }
  };

  return (
    <div className="p-4 bg-orange-100 rounded">
      <h3>Task Actions</h3>
      <div className="space-x-2">
        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={!currentProjectId}
        >
          Mark All Read
        </button>
        <button
          onClick={() => console.log('Export tasks')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Export Tasks
        </button>
      </div>
    </div>
  );
});

// 9. High-frequency component that needs very specific data
const LiveTaskCount = memo(() => {
  // Only subscribe to the specific data we need
  const currentProjectId = useCurrentProjectId();

  console.log('LiveTaskCount rendered');

  return (
    <div className="p-2 bg-red-100 rounded text-sm">
      Project: {currentProjectId ? 'Active' : 'None'}
    </div>
  );
});

// Main component demonstrating all optimization patterns
export const OptimizedComponentsDemo = () => {
  console.log('OptimizedComponentsDemo rendered');

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Optimized Components Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MinimalStatusComponent />
        <WorkspaceSelector />
        <ProjectSelector />
        <TaskCounter />
        <TaskAnalytics />
        <WorkspaceSearch />
        <WorkspaceInfo />
        <TaskActions />
      </div>

      <div className="mt-6">
        <LiveTaskCount />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-bold mb-2">Optimization Strategies Used:</h3>
        <ul className="text-sm space-y-1">
          <li>🎯 <strong>Selective Subscriptions:</strong> Components only subscribe to data they need</li>
          <li>⏱️ <strong>Debouncing/Throttling:</strong> Reduce update frequency for heavy operations</li>
          <li>🔄 <strong>Stable References:</strong> Prevent unnecessary re-renders with memoized values</li>
          <li>📦 <strong>React.memo:</strong> Skip re-renders when props haven't changed</li>
          <li>🎛️ <strong>Context Separation:</strong> Split data into logical contexts</li>
          <li>⚡ <strong>Lazy Loading:</strong> Only load data when needed</li>
        </ul>
      </div>
    </div>
  );
};

export default OptimizedComponentsDemo;

// Set display names for better debugging
MinimalStatusComponent.displayName = 'MinimalStatusComponent';
WorkspaceSelector.displayName = 'WorkspaceSelector';
ProjectSelector.displayName = 'ProjectSelector';
TaskCounter.displayName = 'TaskCounter';
TaskAnalytics.displayName = 'TaskAnalytics';
WorkspaceSearch.displayName = 'WorkspaceSearch';
WorkspaceInfo.displayName = 'WorkspaceInfo';
TaskActions.displayName = 'TaskActions';
LiveTaskCount.displayName = 'LiveTaskCount';
