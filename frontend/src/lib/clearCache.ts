// Clear localStorage cache script
// Run this in browser console if you see old mock data:
// localStorage.removeItem('kanban-storage'); localStorage.removeItem('document-storage'); window.location.reload();

export const clearCache = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('kanban-storage');
    localStorage.removeItem('document-storage');
    console.log('✅ Cache cleared! Reload the page to fetch fresh data from backend.');
  }
};
