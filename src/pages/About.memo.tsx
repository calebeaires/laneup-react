import { useRef, memo } from "react";
import SidebarLayout, { Header, Body } from "@/layouts/SidebarLayout";
import { useCurrentWorkspaceId } from "@/stores/space.store.optimized";

const About = memo(() => {
  const currentWorkspaceId = useCurrentWorkspaceId();
  const renderCount = useRef(0);

  renderCount.current += 1;
  console.log(`About component rendered ${renderCount.current} times`);
  console.log(currentWorkspaceId);

  return (
    <SidebarLayout>
      <Header>Header test</Header>
      <Body>teste body</Body>
    </SidebarLayout>
  );
});

About.displayName = 'About';

export default About;
