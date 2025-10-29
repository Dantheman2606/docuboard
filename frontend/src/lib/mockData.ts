// /lib/mockData.ts

interface Project  {
  id: string,
  name: string,
  description: string,
  docs: {
    id: string,
    title: string
  }[]
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
  },
  {
    id: "p2",
    name: "Design System",
    description: "UI Components & tokens",
    docs: [
      { id: "d1", title: "Component Library" },
      { id: "d2", title: "Figma Sync Plan" },
    ],
  },
];
