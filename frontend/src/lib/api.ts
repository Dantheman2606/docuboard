// /lib/api.ts
// import { projects } from "@/lib/mockData";

import { projects } from "./mockData";

interface Project  {
  id: string,
  name: string,
  description: string,
  docs: {
    id: string,
    title: string
  }[]
}

export const api = {
  getProjects: async () =>
    new Promise<Project[]>((resolve) =>
      setTimeout(() => resolve(projects), 500)
    ),

  getProject: async (id: string) =>
    new Promise<Project>((resolve, reject) => {
      const project = projects.find((p) => p.id === id);
      setTimeout(() => {
        project ? resolve(project) : reject(new Error("Project not found"));
      }, 500);
    }),
};
