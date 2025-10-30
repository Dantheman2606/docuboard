// /lib/mockData.ts

export interface Card {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  labels?: string[];
  docId?: string; // link to docs
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

export interface KanbanBoard {
  columns: Record<string, Column>;
  cards: Record<string, Card>;
  columnOrder: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  docs: {
    id: string;
    title: string;
  }[];
  board: KanbanBoard;
}

export const projects: Project[] = [
  {
    id: "p1",
    name: "AI Collaboration",
    description: "Docs + Kanban integration",
    docs: [
      { id: "d1", title: "Overview" },
      { id: "d2", title: "Architecture" },
      { id: "d3", title: "Sprint Notes" },
    ],
    board: {
      columnOrder: ["todo", "inprogress", "done"],
      columns: {
        todo: {
          id: "todo",
          title: "To Do",
          cardIds: ["c1", "c2"],
        },
        inprogress: {
          id: "inprogress",
          title: "In Progress",
          cardIds: ["c3"],
        },
        done: {
          id: "done",
          title: "Done",
          cardIds: ["c4"],
        },
      },
      cards: {
        c1: {
          id: "c1",
          title: "Set up project structure",
          description: "Initialize Next.js + Tailwind + Zustand + React Query",
          assignee: "Alice",
          labels: ["setup"],
          dueDate: "2025-10-30",
        },
        c2: {
          id: "c2",
          title: "Design sidebar navigation",
          description: "Sidebar for project docs and Kanban link",
          assignee: "Bob",
          labels: ["UI"],
        },
        c3: {
          id: "c3",
          title: "Implement useProject hook",
          description: "Fetch project data and handle loading states",
          assignee: "Alice",
          labels: ["data", "state"],
        },
        c4: {
          id: "c4",
          title: "Basic layout shell ready",
          description: "Layout + routing verified",
          assignee: "Bob",
          labels: ["done"],
        },
      },
    },
  },
  {
    id: "p2",
    name: "Design System",
    description: "UI Components & tokens",
    docs: [
      { id: "d1", title: "Component Library" },
      { id: "d2", title: "Figma Sync Plan" },
    ],
    board: {
      columnOrder: ["todo", "inprogress", "done"],
      columns: {
        todo: {
          id: "todo",
          title: "To Do",
          cardIds: ["c5"],
        },
        inprogress: {
          id: "inprogress",
          title: "In Progress",
          cardIds: ["c6"],
        },
        done: {
          id: "done",
          title: "Done",
          cardIds: ["c7"],
        },
      },
      cards: {
        c5: {
          id: "c5",
          title: "Audit component gaps",
          description: "Review missing Figma tokens vs UI",
          assignee: "Charlie",
          labels: ["review"],
        },
        c6: {
          id: "c6",
          title: "Build Button component",
          description: "Use shadcn/ui + consistent tokens",
          assignee: "Dana",
          labels: ["frontend"],
        },
        c7: {
          id: "c7",
          title: "Typography system setup",
          description: "Base font scale and heading sizes finalized",
          assignee: "Charlie",
          labels: ["done", "design"],
        },
      },
    },
  },
];
