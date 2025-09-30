import { DisplayTool } from "./DisplayTool";
import { ViewTool } from "./ViewTool";

export function ViewBar() {
  return (
    <div className="flex flex-wrap gap-2 w-full items-start px-4 py-1 bg-muted border-b">
      <ViewTool />
      <DisplayTool />
    </div>
  );
}
