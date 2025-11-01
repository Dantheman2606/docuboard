import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
  
  const { setCurrentProject } = useUIStore();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { documents, setDocument } = useDocumentStore();
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  // Fetch document from backend
  useEffect(() => {
    const fetchDocument = async () => {
      if (!docId) return;
      
      setIsLoadingDoc(true);
      try {
        // Try to fetch from backend first
        const doc = await api.getDocument(docId);
        setDocument(doc);
      } catch (error) {
        console.log('Document not found in backend, checking project docs');
        // If not in backend, check if it's in project's docs list
        if (project) {
          const projectDoc = project.docs.find((d) => d.id === docId);
          if (projectDoc) {
            // Create document in backend and local store
            const newDoc = {
              id: projectDoc.id,
              title: projectDoc.title,
              content: "",
              projectId: projectId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setDocument(newDoc);
            // Sync to backend
            api.createDocument(newDoc).catch(console.error);
          }
        }
      } finally {
        setIsLoadingDoc(false);
      }
    };

    fetchDocument();
  }, [docId, project, projectId, setDocument]);

  if (projectLoading || isLoadingDoc) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

  // Check if document exists in project or in document store
  const doc = project.docs.find((d) => d.id === docId);
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

  return (
    <>
      <Head>
        <title>{documentTitle} - {project.name} - Docuboard</title>
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
