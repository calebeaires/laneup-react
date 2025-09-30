import { useSpaceContext } from "@/contexts/SpaceContext";

export function WorkspacePage() {
  const space = useSpaceContext();
  return (
    <div>
      <h1>Workspace Page {space.workspaceList.length}</h1>
    </div>
  );
}
