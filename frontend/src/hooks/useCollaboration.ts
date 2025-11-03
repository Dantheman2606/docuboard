// /hooks/useCollaboration.ts
import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { getUserColor, getWebSocketUrl } from '@/lib/collaboration';

export interface CollaboratorInfo {
  userId: string;
  userName: string;
  color: string;
  connectedAt?: Date;
}

interface UseCollaborationOptions {
  documentId: string;
  userName: string;
  userId: string;
  onUsersChange?: (users: CollaboratorInfo[]) => void;
}

interface UseCollaborationReturn {
  provider: WebsocketProvider | null;
  ydoc: Y.Doc | null;
  isConnected: boolean;
  collaborators: CollaboratorInfo[];
}

export function useCollaboration({
  documentId,
  userName,
  userId,
  onUsersChange,
}: UseCollaborationOptions): UseCollaborationReturn {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [ydoc] = useState<Y.Doc>(() => new Y.Doc());
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const providerRef = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    if (!documentId || !userName || !userId) {
      return;
    }

    // Get WebSocket URL from environment or use default
    const wsUrl = getWebSocketUrl();
    
    console.log(`🔄 Connecting to collaboration server for document: ${documentId}`);

    // Create WebSocket provider
    const newProvider = new WebsocketProvider(
      wsUrl,
      `doc-${documentId}`,
      ydoc,
      {
        params: {
          doc: documentId,
          user: userName,
          userId: userId,
        },
      }
    );

    providerRef.current = newProvider;

    // Handle connection status
    newProvider.on('status', (event: { status: string }) => {
      const connected = event.status === 'connected';
      setIsConnected(connected);
      console.log(`📡 WebSocket status: ${event.status}`);
    });

    // Handle sync status
    newProvider.on('sync', (synced: boolean) => {
      console.log(`🔄 Document ${synced ? 'synced' : 'syncing'}...`);
    });

    // Set awareness (user presence)
    const awareness = newProvider.awareness;
    const userColor = getUserColor(userId);
    
    awareness.setLocalStateField('user', {
      name: userName,
      userId: userId,
      color: userColor,
    });

    // Listen for awareness changes (users joining/leaving)
    const awarenessChangeHandler = () => {
      const states = awareness.getStates();
      const users: CollaboratorInfo[] = [];
      
      states.forEach((state, clientId) => {
        const user = state.user;
        if (user && user.userId) {
          users.push({
            userId: user.userId,
            userName: user.name,
            color: user.color,
            connectedAt: new Date(),
          });
        }
      });

      setCollaborators(users);
      if (onUsersChange) {
        onUsersChange(users);
      }
    };

    awareness.on('change', awarenessChangeHandler);

    setProvider(newProvider);

    // Cleanup on unmount
    return () => {
      console.log(`👋 Disconnecting from collaboration server for document: ${documentId}`);
      awareness.off('change', awarenessChangeHandler);
      newProvider.destroy();
      providerRef.current = null;
    };
  }, [documentId, userName, userId, ydoc, onUsersChange]);

  return {
    provider,
    ydoc,
    isConnected,
    collaborators,
  };
}
