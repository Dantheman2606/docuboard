import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import { useUIStore } from "@/stores/uiStore";
import { useProject } from "@/hooks/useProject";
import { DocumentEditor } from "@/features/editor/components";
import { useDocumentStore } from "@/stores/documentStore";
import { api } from "@/lib/api";

export default function DocPage() {
  const router = useRouter();
  const { id, pageId } = router.query;
  const projectId = typeof id === "string" ? id : "";
  const docId = typeof pageId === "string" ? pageId : "";
  
  const { setCurrentProject, currentProjectId } = useUIStore();
  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(projectId);
  const { documents, setDocument, isOnline, setIsOnline } = useDocumentStore();
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const lastFetchedDocIdRef = useRef<string>("");
  const lastOnlineStatusRef = useRef<boolean>(true);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, currentProjectId, setCurrentProject]);

  // Fetch document from backend if online, otherwise use localStorage
  useEffect(() => {
    const fetchDocument = async () => {
      if (!docId || !projectId) return;
      
      // Check if we need to fetch
      const docIdChanged = lastFetchedDocIdRef.current !== docId;
      const onlineStatusChanged = lastOnlineStatusRef.current !== isOnline;
      
      // Skip if same document and connection status hasn't changed
      if (!docIdChanged && !onlineStatusChanged && documents[docId]) {
        setIsLoadingDoc(false);
        return;
      }
      
      // Update refs
      lastFetchedDocIdRef.current = docId;
      lastOnlineStatusRef.current = isOnline;
      
      // Check if document exists in localStorage
      const existingDoc = documents[docId];
      
      setIsLoadingDoc(true);
      
      try {
        // First, check actual connection by testing if we can reach the backend
        const connectionAvailable = navigator.onLine;
        
        if (connectionAvailable) {
          // Test actual connectivity with a quick backend check
          console.log('� Checking backend connectivity...');
          try {
            const doc = await api.getDocument(docId);
            console.log('✅ Document fetched from backend:', doc.title);
            setDocument(doc);
            
            // Ensure online state is set to true
            if (!isOnline) {
              console.log('🌐 Connection confirmed - setting online');
              setIsOnline(true);
            }
          } catch (error) {
            console.log('⚠️ Backend not reachable, using localStorage');
            
            // Connection failed, set offline state
            if (isOnline) {
              console.log('📴 No backend connection - setting offline');
              setIsOnline(false);
            }
            
            // Use localStorage if available
            if (existingDoc) {
              console.log('📦 Using cached document from localStorage:', existingDoc.title);
            } else {
              // Create placeholder from project data
              console.log('⚠️ Document not in localStorage, creating placeholder');
              if (project) {
                const projectDoc = project.docs.find((d) => d.id === docId);
                if (projectDoc) {
                  const newDoc = {
                    id: projectDoc.id,
                    title: projectDoc.title,
                    content: "",
                    projectId: projectId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  setDocument(newDoc);
                }
              }
            }
          }
        } else {
          // Browser reports offline, use localStorage immediately
          console.log('📴 Browser offline: Using localStorage');
          setIsOnline(false);
          
          if (existingDoc) {
            // Document exists in localStorage
            console.log('📦 Document loaded from localStorage:', existingDoc.title);
          } else {
            // Document doesn't exist in localStorage yet
            console.log('⚠️ Document not in localStorage, creating placeholder');
            if (project) {
              const projectDoc = project.docs.find((d) => d.id === docId);
              if (projectDoc) {
                const newDoc = {
                  id: projectDoc.id,
                  title: projectDoc.title,
                  content: "",
                  projectId: projectId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                setDocument(newDoc);
              }
            }
          }
        }
      } finally {
        setIsLoadingDoc(false);
      }
    };

    fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, projectId, isOnline]);

  // Handle access denied error
  useEffect(() => {
    if (projectError) {
      router.push('/dashboard');
    }
  }, [projectError, router]);

  if (projectLoading || isLoadingDoc) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (projectError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to view this project.
          </p>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Project Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The project you're looking for doesn't exist.
          </p>
        </div>
      </Layout>
    );
  }
  
  // If project failed to load but we have documents in localStorage, continue anyway
  if (!project && projectError && documents[docId]) {
    console.log('📦 Project failed to load but document exists in localStorage, continuing...');
  }

  // Check if document exists in project or in document store
  const doc = project?.docs.find((d) => d.id === docId);
  const docInStore = documents[docId];

  if (!doc && !docInStore) {
    return (
      <>
        <Head>
          <title>Document Not Found - Docuboard</title>
        </Head>
        <Layout>
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Document Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The document you're looking for doesn't exist.
            </p>
          </div>
        </Layout>
      </>
    );
  }

  const documentTitle = doc?.title || docInStore?.title || 'Document';
  const projectName = project?.name || 'Project';

  return (
    <>
      <Head>
        <title>{documentTitle} - {projectName} - Docuboard</title>
      </Head>
      <Layout>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Document Editor */}
          <DocumentEditor documentId={docId} projectId={projectId} />
        </div>
      </Layout>
    </>
  );
}
