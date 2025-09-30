import type {
  _ProjectStatusType,
  _ProjectType,
  _TaskPriorityType,
  _ViewType,
} from "@/types";
import { getId } from "./getId";

export const defaultViewOptionsContent: _ViewType["content"] = {
  display: {
    groupBy: "status",
    subgroupBy: null,
    sortBy: null,
    expandedGroups: [],
    tagsStacked: false,
    tagVisibility: {
      list: [],
      board: [],
      table: [],
      timeline: [],
    },
  },
  filter: {
    searchTerm: "",
    status: [],
    label: [],
    module: [],
    cycle: [],
    priority: [],
    userIds: [],
  },
  settings: {
    currentViewTab: "board",
  },
};

export const defaultPriorityList: _TaskPriorityType[] = [
  {
    _id: "urgent",
    name: "priority.urgent",
    order: 1,
    color: "#DC2626",
    icon: "flag",
  },
  {
    _id: "high",
    name: "priority.high",
    order: 2,
    color: "#FFC53D",
    icon: "flag", // Lucide icon name
  },
  {
    _id: "medium",
    name: "priority.medium",
    order: 3,
    color: "#3E63DD",
    icon: "flag", // Lucide icon name
  },
  {
    _id: "low",
    name: "priority.low",
    order: 4,
    color: "#BBB",
    icon: "flag", // Lucide icon name
  },
  {
    _id: "none",
    name: "priority.none",
    order: 4,
    color: "#BBB",
    icon: "minusCircle", // Lucide icon name
  },
];

export const defaultStatusGroupList = [
  {
    name: "project.status.backlog",
    _id: "backlog",
    order: 1,
    icon: "circleDashed",
    color: "#6366F1",
  },
  {
    name: "project.status.todo",
    _id: "todo",
    order: 2,
    icon: "circleDotDashed",
    color: "#3F63DD",
  },
  {
    name: "project.status.inProgress",
    _id: "inProgress",
    order: 3,
    icon: "circleDot",
    color: "#FFC107",
  },
  {
    name: "project.status.done",
    _id: "done",
    order: 4,
    icon: "circleCheckBig",
    color: "#009688",
  },
  {
    name: "project.status.cancelled",
    _id: "cancelled",
    order: 5,
    icon: "circleSlash",
    color: "#C6292F",
  },
];

export const projectDefaultStatus: _ProjectStatusType[] = [
  {
    _id: getId(),
    name: "Backlog",
    color: "#6366F1",
    group: "backlog",
    deleted: false,
  },
  {
    _id: getId(),
    name: "Todo",
    color: "#8B5CF6",
    group: "todo",
    deleted: false,
  },
  {
    _id: getId(),
    name: "On Progress",
    color: "#EC4899",
    group: "inProgress",
    deleted: false,
  },

  {
    _id: getId(),
    name: "Completed",
    color: "#10B981",
    group: "done",
    deleted: false,
  },
  {
    _id: getId(),
    name: "Cancelled",
    color: "#EF4444",
    group: "cancelled",
    deleted: false,
  },
];

export const useProjectDefault = (base: _ProjectType): _ProjectType => {
  return {
    name: "My First Project",
    description: "A sample project to help you get started",
    alias: "KEL",
    aliasCount: 0,
    status: projectDefaultStatus,
    cycle: [],
    module: [],
    label: [
      {
        _id: getId(),
        name: "Feature",
        color: "#6366F1",
        description: "A new feature",
        deleted: false,
      },
    ],
    storyPoints: [0, 1, 2, 3, 5, 8, 13, 21],
    icon: "",
    color: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),

    // custom user fields
    ...base,
  };
};

export const defaultFeatureTranslated = <
  T extends Partial<{ _id: string; name: string }>,
>(
  list: T[],
  t: (key: string) => string,
) => {
  return list.map((item) => ({
    ...item,
    name: t(item.name || ""),
  }));
};
