import { useSpaceContext } from "@/contexts/SpaceContext";

export function ProjectPage() {
  const space = useSpaceContext();
  return (
    <div>
      <h1>Project Page {space.projectList.length}</h1>
    </div>
  );
}
