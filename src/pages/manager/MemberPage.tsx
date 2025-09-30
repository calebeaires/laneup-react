import { useSpaceContext } from "@/contexts/SpaceContext";

export function MemberPage() {
  const space = useSpaceContext();
  return (
    <div>
      <h1>Member Page {space.memberList.length}</h1>
    </div>
  );
}
