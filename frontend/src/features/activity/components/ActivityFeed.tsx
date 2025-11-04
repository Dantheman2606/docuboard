// features/activity/components/ActivityFeed.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  X, 
  Activity as ActivityIcon, 
  Clock, 
  User, 
  ArrowRight,
  Plus,
  Edit3,
  RefreshCw,
  Trash2,
  Clipboard,
  FileText,
  File
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api, type Activity } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityFeedProps {
  isOpen: boolean;
  onClose: () => void;
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'card_created':
      return Plus;
    case 'card_updated':
      return Edit3;
    case 'card_moved':
      return RefreshCw;
    case 'card_deleted':
      return Trash2;
    case 'board_created':
      return Clipboard;
    case 'board_updated':
      return Edit3;
    case 'board_deleted':
      return Trash2;
    case 'document_created':
      return FileText;
    case 'document_updated':
      return File;
    case 'document_deleted':
      return Trash2;
    default:
      return ActivityIcon;
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInMs = now.getTime() - activityTime.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return activityTime.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: activityTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export function ActivityFeed({ isOpen, onClose }: ActivityFeedProps) {
  const router = useRouter();
  const { id: projectId } = router.query;

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['activities', projectId],
    queryFn: () => api.getActivities(projectId as string, { limit: 100 }),
    enabled: isOpen && !!projectId,
    refetchInterval: 10000, // Refetch every 10 seconds when feed is open
  });

  // Auto-refresh on open
  useEffect(() => {
    if (isOpen && projectId) {
      refetch();
    }
  }, [isOpen, projectId, refetch]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Activity Feed Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Activity Feed
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close activity feed"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Activity List */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ActivityIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No activities yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Start working on your project to see activities here
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const getActivityColor = (type: Activity['type']) => {
    if (type.includes('created')) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (type.includes('updated') || type.includes('moved')) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    if (type.includes('deleted')) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
  };

  const colorClass = getActivityColor(activity.type);
  const IconComponent = getActivityIcon(activity.type);

  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-gray-100 dark:border-gray-800">
      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
        <IconComponent className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-gray-100 leading-snug">
          {activity.action}
        </p>
        
        {/* Metadata for card moves */}
        {activity.type === 'card_moved' && activity.metadata?.fromColumn && activity.metadata?.toColumn && (
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
              {activity.metadata.fromColumn}
            </span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
              {activity.metadata.toColumn}
            </span>
          </div>
        )}

        {/* Metadata for document version saves */}
        {activity.type === 'document_updated' && activity.metadata?.versionNumber && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {activity.metadata.versionDescription && (
              <div className="italic">"{activity.metadata.versionDescription}"</div>
            )}
          </div>
        )}

        {/* User and Time */}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{activity.user.name}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(activity.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
