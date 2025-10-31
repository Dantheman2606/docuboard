// /stores/documentStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export interface Document {
  id: string;
  title: string;
  content: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentState {
  documents: Record<string, Document>;
  setDocument: (doc: Document) => void;
  updateDocumentContent: (docId: string, content: string) => void;
  updateDocumentTitle: (docId: string, title: string) => void;
  addDocument: (projectId: string, title: string) => Promise<Document>;
  deleteDocument: (docId: string) => void;
  getDocumentsByProject: (projectId: string) => Document[];
  syncDocumentToBackend: (doc: Document) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: {},

      setDocument: (doc) =>
        set((state) => ({
          documents: {
            ...state.documents,
            [doc.id]: doc,
          },
        })),

      updateDocumentContent: (docId, content) => {
        const updatedDoc = {
          ...get().documents[docId],
          content,
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          documents: {
            ...state.documents,
            [docId]: updatedDoc,
          },
        }));
        
        // Sync to backend (fire and forget)
        api.updateDocument(docId, { content }).catch(console.error);
      },

      updateDocumentTitle: (docId, title) => {
        const updatedDoc = {
          ...get().documents[docId],
          title,
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          documents: {
            ...state.documents,
            [docId]: updatedDoc,
          },
        }));
        
        // Sync to backend (fire and forget)
        api.updateDocument(docId, { title }).catch(console.error);
      },

      addDocument: async (projectId, title) => {
        const newDoc: Document = {
          id: `doc_${Date.now()}`,
          title: title || "Untitled Document",
          content: "",
          projectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Add to local state first
        set((state) => ({
          documents: {
            ...state.documents,
            [newDoc.id]: newDoc,
          },
        }));
        
        // Sync to backend
        try {
          await api.createDocument(newDoc);
        } catch (error) {
          console.error('Failed to create document in backend:', error);
        }
        
        return newDoc;
      },

      deleteDocument: (docId) => {
        set((state) => {
          const { [docId]: _, ...rest } = state.documents;
          return { documents: rest };
        });
        
        // Sync to backend (fire and forget)
        api.deleteDocument(docId).catch(console.error);
      },

      getDocumentsByProject: (projectId) => {
        const docs = Object.values(get().documents).filter(
          (doc) => doc.projectId === projectId
        );
        return docs.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      },

      syncDocumentToBackend: async (doc: Document) => {
        try {
          await api.updateDocument(doc.id, doc);
        } catch (error) {
          console.error('Failed to sync document to backend:', error);
        }
      },
    }),
    {
      name: "document-storage",
    }
  )
);
