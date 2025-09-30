import { useSpaceContext } from "@/contexts/SpaceContext";

export function InboxPage() {
  const space = useSpaceContext();
  return (
    <div>
      <h1>Inbox Page {space.inboxList.length}</h1>
    </div>
  );
}
