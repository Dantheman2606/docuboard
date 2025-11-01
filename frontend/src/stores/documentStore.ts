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
  pendingSync?: boolean; // Mark documents that need to be synced when online
}

interface DocumentState {
  documents: Record<string, Document>;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  setDocument: (doc: Document) => void;
  updateDocumentContent: (docId: string, content: string) => void;
  updateDocumentTitle: (docId: string, title: string) => void;
  addDocument: (projectId: string, title: string) => Promise<Document>;
  deleteDocument: (docId: string) => void;
  getDocumentsByProject: (projectId: string) => Document[];
  syncDocumentToBackend: (doc: Document) => Promise<void>;
  syncPendingDocuments: () => Promise<void>;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: {},
      isOnline: true,

      setIsOnline: (online) => {
        const wasOnline = get().isOnline;
        set({ isOnline: online });
        
        // Log status change
        if (online && !wasOnline) {
          console.log('🌐 Connection restored - syncing pending documents');
          get().syncPendingDocuments();
        } else if (!online && wasOnline) {
          console.log('📴 Connection lost - switching to offline mode');
        }
      },

      setDocument: (doc) => {
        console.log(`💾 Saving document to localStorage: ${doc.title}`);
        set((state) => ({
          documents: {
            ...state.documents,
            [doc.id]: doc,
          },
        }));
      },

      updateDocumentContent: (docId, content) => {
        const { isOnline } = get();
        const currentDoc = get().documents[docId];
        
        if (!currentDoc) {
          console.warn(`⚠️ Document ${docId} not found in store`);
          return;
        }
        
        const updatedDoc = {
          ...currentDoc,
          content,
          updatedAt: new Date().toISOString(),
          pendingSync: !isOnline, // Mark for sync if offline
        };
        
        // ALWAYS save to localStorage first (via Zustand persist)
        console.log(`💾 Saving content to localStorage: ${updatedDoc.title}`);
        set((state) => ({
          documents: {
            ...state.documents,
            [docId]: updatedDoc,
          },
        }));
        
        // Then try to sync to backend if online
        if (isOnline) {
          console.log(`☁️ Attempting backend sync: ${updatedDoc.title}`);
          api.updateDocument(docId, { content }).catch((error) => {
            console.error('❌ Backend sync failed (content), keeping in localStorage:', error.message);
            // Mark as pending sync if failed - document is ALREADY in localStorage
            set((state) => ({
              documents: {
                ...state.documents,
                [docId]: { ...state.documents[docId], pendingSync: true },
              },
            }));
          });
        } else {
          console.log(`📴 Offline: Content saved to localStorage only`);
        }
      },

      updateDocumentTitle: (docId, title) => {
        const { isOnline } = get();
        const currentDoc = get().documents[docId];
        
        if (!currentDoc) {
          console.warn(`⚠️ Document ${docId} not found in store`);
          return;
        }
        
        const updatedDoc = {
          ...currentDoc,
          title,
          updatedAt: new Date().toISOString(),
          pendingSync: !isOnline, // Mark for sync if offline
        };
        
        // ALWAYS save to localStorage first (via Zustand persist)
        console.log(`💾 Saving title to localStorage: ${title}`);
        set((state) => ({
          documents: {
            ...state.documents,
            [docId]: updatedDoc,
          },
        }));
        
        // Then try to sync to backend if online
        if (isOnline) {
          console.log(`☁️ Attempting backend sync: ${title}`);
          api.updateDocument(docId, { title }).catch((error) => {
            console.error('❌ Backend sync failed (title), keeping in localStorage:', error.message);
            // Mark as pending sync if failed - document is ALREADY in localStorage
            set((state) => ({
              documents: {
                ...state.documents,
                [docId]: { ...state.documents[docId], pendingSync: true },
              },
            }));
          });
        } else {
          console.log(`📴 Offline: Title saved to localStorage only`);
        }
      },

      addDocument: async (projectId, title) => {
        const { isOnline } = get();
        const newDoc: Document = {
          id: `doc_${Date.now()}`,
          title: title || "Untitled Document",
          content: "",
          projectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pendingSync: !isOnline, // Mark for sync if offline
        };
        
        // ALWAYS add to localStorage first (via Zustand persist)
        console.log(`💾 Creating new document in localStorage: ${newDoc.title}`);
        set((state) => ({
          documents: {
            ...state.documents,
            [newDoc.id]: newDoc,
          },
        }));
        
        // Then try to sync to backend if online
        if (isOnline) {
          console.log(`☁️ Attempting to create document in backend: ${newDoc.title}`);
          try {
            await api.createDocument(newDoc);
            console.log(`✅ Document created in backend: ${newDoc.title}`);
            // Remove pendingSync flag after successful creation
            set((state) => ({
              documents: {
                ...state.documents,
                [newDoc.id]: { ...state.documents[newDoc.id], pendingSync: false },
              },
            }));
          } catch (error) {
            console.error('❌ Failed to create document in backend, keeping in localStorage:', error);
            // Mark as pending sync if failed - document is ALREADY in localStorage
            set((state) => ({
              documents: {
                ...state.documents,
                [newDoc.id]: { ...state.documents[newDoc.id], pendingSync: true },
              },
            }));
          }
        } else {
          console.log(`📴 Offline: Document created in localStorage only: ${newDoc.title}`);
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
          // Remove pendingSync flag after successful sync
          set((state) => ({
            documents: {
              ...state.documents,
              [doc.id]: { ...state.documents[doc.id], pendingSync: false },
            },
          }));
        } catch (error) {
          console.error('Failed to sync document to backend:', error);
        }
      },

      syncPendingDocuments: async () => {
        const { documents } = get();
        const pendingDocs = Object.values(documents).filter(doc => doc.pendingSync);
        
        if (pendingDocs.length === 0) {
          console.log('✅ No pending documents to sync');
          return;
        }
        
        console.log(`🔄 Syncing ${pendingDocs.length} pending document(s)...`);
        
        for (const doc of pendingDocs) {
          try {
            console.log(`📤 Syncing document: ${doc.title}`);
            // Try to update first, if fails, try to create (in case it's a new doc)
            try {
              await api.updateDocument(doc.id, { 
                title: doc.title, 
                content: doc.content 
              });
              console.log(`✅ Successfully updated: ${doc.title}`);
            } catch (updateError) {
              // If update fails (404), try to create the document
              console.log(`📝 Creating new document: ${doc.title}`);
              await api.createDocument(doc);
              console.log(`✅ Successfully created: ${doc.title}`);
            }
            
            // Remove pendingSync flag after successful sync
            set((state) => ({
              documents: {
                ...state.documents,
                [doc.id]: { ...state.documents[doc.id], pendingSync: false },
              },
            }));
          } catch (error) {
            console.error(`❌ Failed to sync document ${doc.title}:`, error);
          }
        }
        
        console.log('✅ Sync completed');
      },
    }),
    {
      name: "document-storage",
      // Zustand persist will automatically save to localStorage on every state change
      onRehydrateStorage: () => {
        console.log('� Hydrating document store from localStorage...');
        return (state, error) => {
          if (error) {
            console.error('❌ Failed to load from localStorage:', error);
          } else if (state) {
            const docCount = Object.keys(state.documents).length;
            console.log(`✅ Loaded ${docCount} document(s) from localStorage`);
          }
        };
      },
    }
  )
);

// Helper function to check localStorage status
export const checkLocalStorageStatus = () => {
  try {
    const data = localStorage.getItem('document-storage');
    if (data) {
      const parsed = JSON.parse(data);
      const docCount = Object.keys(parsed.state?.documents || {}).length;
      console.log('📊 localStorage Status:');
      console.log(`  - Documents: ${docCount}`);
      console.log(`  - Size: ${(data.length / 1024).toFixed(2)} KB`);
      console.log(`  - Online: ${parsed.state?.isOnline}`);
      return parsed;
    } else {
      console.log('⚠️ No data in localStorage');
      return null;
    }
  } catch (error) {
    console.error('❌ Error reading localStorage:', error);
    return null;
  }
};
