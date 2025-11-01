// components/Sidebar/exports.ts
// Re-export individual components for external use if needed
export { SidebarHeader } from "./SidebarHeader";
export { BackToProjectsButton } from "./BackToProjectsButton";
export { SectionTabs } from "./SectionTabs";
export { DocumentsList } from "./DocumentsList";
export { KanbanBoardsList } from "./KanbanBoardsList";
export { LogoutButton } from "./LogoutButton";
export { AddBoardModal } from "./modals/AddBoardModal";
export { DeleteConfirmationDialog } from "./modals/DeleteConfirmationDialog";
export { useSyncProjectId } from "./hooks/useSyncProjectId";

// Default export is the main Sidebar component
export { default } from "./index";
