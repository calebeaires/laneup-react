import { useRef, useState } from "react";
import SidebarLayout, { Header, Body } from "@/layouts/SidebarLayout";
import { useSpace } from "@/stores/space.store";
import { useMinimalSpace } from "@/hooks/useSpaceDebounced";

// Component using the old heavy hook
const OldApproachComponent = () => {
  const space = useSpace();
  const renderCount = useRef(0);

  renderCount.current += 1;
  console.log(`OLD: OldApproachComponent rendered ${renderCount.current} times`);

  return (
    <div className="p-4 bg-red-100 border border-red-300 rounded">
      <h3 className="font-bold text-red-800">Old Approach (Heavy)</h3>
      <p className="text-sm">Renders: {renderCount.current}</p>
      <p className="text-sm">Workspace: {space.currentWorkspaceId || "None"}</p>
      <p className="text-sm">Ready: {space.isInitializing ? "No" : "Yes"}</p>
    </div>
  );
};

// Component using the new optimized hook
const NewApproachComponent = () => {
  const { currentWorkspaceId, isReady } = useMinimalSpace();
  const renderCount = useRef(0);

  renderCount.current += 1;
  console.log(`NEW: NewApproachComponent rendered ${renderCount.current} times`);

  return (
    <div className="p-4 bg-green-100 border border-green-300 rounded">
      <h3 className="font-bold text-green-800">New Approach (Optimized)</h3>
      <p className="text-sm">Renders: {renderCount.current}</p>
      <p className="text-sm">Workspace: {currentWorkspaceId || "None"}</p>
      <p className="text-sm">Ready: {isReady ? "Yes" : "No"}</p>
    </div>
  );
};

// Force some state changes to trigger re-renders
const TriggerComponent = () => {
  const [counter, setCounter] = useState(0);
  const space = useSpace();

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded">
      <h3 className="font-bold text-blue-800">Trigger Actions</h3>
      <div className="space-y-2">
        <button
          onClick={() => setCounter(c => c + 1)}
          className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
        >
          Local Counter: {counter}
        </button>
        <br />
        <button
          onClick={() => {
            const workspaces = space.workspaceList;
            if (workspaces.length > 1) {
              const currentIndex = workspaces.findIndex(w => w._id === space.currentWorkspaceId);
              const nextIndex = (currentIndex + 1) % workspaces.length;
              space.selectWorkspace(workspaces[nextIndex]._id);
            }
          }}
          className="px-3 py-1 bg-purple-500 text-white rounded mr-2"
          disabled={space.workspaceList.length <= 1}
        >
          Switch Workspace
        </button>
        <br />
        <button
          onClick={() => {
            const projects = space.projectList;
            if (projects.length > 1) {
              const currentIndex = projects.findIndex(p => p._id === space.currentProjectId);
              const nextIndex = (currentIndex + 1) % projects.length;
              space.selectProject(projects[nextIndex]._id);
            }
          }}
          className="px-3 py-1 bg-orange-500 text-white rounded"
          disabled={space.projectList.length <= 1}
        >
          Switch Project
        </button>
      </div>
    </div>
  );
};

export default function RenderTest() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  console.log(`RenderTest page rendered ${renderCount.current} times`);

  return (
    <SidebarLayout>
      <Header>Render Test Comparison</Header>
      <Body>
        <div className="space-y-6 p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">
              📊 Render Test Comparison
            </h2>
            <p className="text-yellow-700 text-sm">
              This page compares the old heavy `useSpace` hook vs the new optimized `useMinimalSpace` hook.
              Open the console to see render counts. The green component should render much less!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <OldApproachComponent />
            <NewApproachComponent />
          </div>

          <TriggerComponent />

          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <h3 className="font-bold text-gray-800 mb-2">Expected Behavior:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>🔴 <strong>Red box (Old):</strong> Renders on every Convex data change</li>
              <li>🟢 <strong>Green box (New):</strong> Only renders when workspace ID or ready state changes</li>
              <li>🔵 <strong>Blue box (Trigger):</strong> Use buttons to test different scenarios</li>
              <li>📝 <strong>Console:</strong> Check render counts - green should be much lower!</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-bold text-blue-800 mb-2">🔧 Optimization Techniques Applied:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Selective subscriptions (only workspace ID + ready state)</li>
              <li>✅ Memoized return values</li>
              <li>✅ Separated data fetching from consumption</li>
              <li>✅ React.memo could be added for even better performance</li>
            </ul>
          </div>
        </div>
      </Body>
    </SidebarLayout>
  );
}
