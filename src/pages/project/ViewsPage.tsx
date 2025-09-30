import { Settings, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ViewsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <p className="text-gray-600">
            Manage and customize your project views
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-2">List View</h3>
            <p className="text-sm text-gray-600">
              Traditional task list format
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-2">Board View</h3>
            <p className="text-sm text-gray-600">Kanban-style board layout</p>
          </div>

          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-2">Calendar View</h3>
            <p className="text-sm text-gray-600">
              Timeline and deadline focused
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
