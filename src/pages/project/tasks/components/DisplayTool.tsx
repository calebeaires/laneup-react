import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useView } from "@/contexts/ViewContext";
import type { _ViewGroupOptionType, _ViewSortOptionType } from "@/types";

export function DisplayTool() {
  const { currentView, updateCurrentView } = useView();

  // Extract display options from current view
  const displayOptions = currentView?.content?.display;

  // Current values
  const groupByValue = displayOptions?.groupBy || null;
  const subgroupByValue = displayOptions?.subgroupBy || null;
  const sortByValue = displayOptions?.sortBy || null;
  const tagsStacked = displayOptions?.tagsStacked || false;

  // Get tag visibility for current view type (defaulting to 'list' for now)
  const currentTagVisibility = displayOptions?.tagVisibility?.list || [];

  // Base options
  const baseGroupOptions = [
    { value: "status", label: "Status" },
    { value: "module", label: "Module" },
    { value: "label", label: "Label" },
    { value: "priority", label: "Priority" },
    { value: "cycle", label: "Cycle" },
  ] as const;

  const baseSubGroupOptions = [
    { value: "status", label: "Status" },
    { value: "module", label: "Module" },
    { value: "label", label: "Label" },
    { value: "priority", label: "Priority" },
    { value: "cycle", label: "Cycle" },
  ] as const;

  const sortOptions = [
    { value: "priority", label: "Priority" },
    { value: "name", label: "Title" },
    { value: "dateRange", label: "Dates" },
    { value: "createdAt", label: "Created At" },
  ] as const;

  const visibilityElements = [
    { value: "priority", label: "Priority" },
    { value: "userIds", label: "Assignee" },
    { value: "dateRange", label: "Dates" },
    { value: "label", label: "Label" },
    { value: "module", label: "Module" },
    { value: "status", label: "Status" },
    { value: "cycle", label: "Cycle" },
  ] as const;

  // Filter options based on current selections
  const groupOptions = baseGroupOptions.filter(
    (option) => option.value !== subgroupByValue,
  );

  const subGroupOptions = baseSubGroupOptions.filter(
    (option) => option.value !== groupByValue,
  );

  // Event handlers with optimistic updates
  const updateGrouping = (value: _ViewGroupOptionType) => {
    if (!currentView) return;

    // Determine if we need to clear subgroup
    const newSubgroupBy = value === subgroupByValue ? null : subgroupByValue;

    // Update with debounced database sync
    updateCurrentView({
      ...currentView,
      content: {
        ...currentView.content,
        display: {
          ...currentView?.content?.display,
          groupBy: value,
          subgroupBy: newSubgroupBy,
        },
      },
    });
  };

  const updateSubGrouping = (value: _ViewGroupOptionType | null) => {
    if (!currentView) return;

    // Can't use same grouping for both
    if (value === groupByValue) {
      return;
    }

    // Update with debounced database sync
    updateCurrentView({
      ...currentView,
      content: {
        ...currentView.content,
        display: {
          ...currentView?.content?.display,
          subgroupBy: value,
        },
      },
    });
  };

  const updateSorting = (value: _ViewSortOptionType | null) => {
    if (!currentView) return;

    updateCurrentView({
      ...currentView,
      content: {
        ...currentView.content,
        display: {
          ...currentView?.content?.display,
          sortBy: value,
        },
      },
    });
  };

  const handleGroupChange = (value: string) => {
    updateGrouping(value as _ViewGroupOptionType);
  };

  const handleSubgroupChange = (value: string) => {
    const subgroupValue =
      value === "none" ? null : (value as _ViewGroupOptionType);
    updateSubGrouping(subgroupValue);
  };

  const handleSortChange = (value: string) => {
    const sortValue = value === "none" ? null : (value as _ViewSortOptionType);
    updateSorting(sortValue);
  };

  const isHidden = (element: string): boolean => {
    // Check if element is in the hidden visibility list
    const elementValue = element as _ViewGroupOptionType;
    return currentTagVisibility.includes(elementValue);
  };

  const toggleVisibility = (element: string) => {
    if (!currentView) return;

    const currentTagVisibility = displayOptions?.tagVisibility?.list || [];
    const elementValue = element as _ViewGroupOptionType;

    // Toggle the element in the visibility list
    const newTagVisibility = currentTagVisibility.includes(elementValue)
      ? currentTagVisibility.filter((item) => item !== elementValue)
      : [...currentTagVisibility, elementValue];

    updateCurrentView({
      ...currentView,
      content: {
        ...currentView.content,
        display: {
          ...currentView?.content?.display,
          tagVisibility: {
            ...currentView?.content?.display?.tagVisibility,
            list: newTagVisibility,
          },
        },
      },
    });
  };

  const handleTagsStackedToggle = (checked: boolean) => {
    if (!currentView) return;

    updateCurrentView({
      ...currentView,
      content: {
        ...currentView.content,
        display: {
          ...currentView?.content?.display,
          tagsStacked: checked,
        },
      },
    });
  };

  return (
    <div data-component="display-options">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-7">
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Display
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 px-2">
          <div className="space-y-4">
            {/* Organization Section */}
            <div className="space-y-2">
              <h4 className="font-medium">Organization</h4>

              {/* Group Select */}
              <div className="space-y-2">
                <Label
                  htmlFor="group-select"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Group
                </Label>
                <Select
                  value={groupByValue || "none"}
                  onValueChange={handleGroupChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subgroup Select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Subgroup
                </Label>
                <Select
                  value={subgroupByValue || "none"}
                  onValueChange={handleSubgroupChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Subgroup" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subGroupOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Sort
                </Label>
                <Select
                  value={sortByValue || "none"}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visibility Section */}
            <Card className="p-0 shadow-none rounded-md gap-1">
              <div className="border-b p-1 px-2 font-medium text-sm">
                Tags Visibility
              </div>
              <div className="space-y-2 p-1 px-2">
                {visibilityElements.map((element) => (
                  <div
                    key={element.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={element.value}
                      checked={!isHidden(element.value)}
                      onCheckedChange={() => toggleVisibility(element.value)}
                    />
                    <Label htmlFor={element.value} className="text-sm">
                      {element.label}
                    </Label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tags Stacked Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="tags-stacked"
                checked={tagsStacked}
                onCheckedChange={handleTagsStackedToggle}
              />
              <Label htmlFor="tags-stacked" className="text-sm">
                Tags Stacked
              </Label>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
