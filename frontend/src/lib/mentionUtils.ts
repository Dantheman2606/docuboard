// lib/mentionUtils.ts
// Utility functions for handling user mentions

/**
 * Extract usernames from text that are mentioned with @username format
 * @param text - The text content to search for mentions
 * @returns Array of unique usernames (without the @ symbol)
 */
export function extractMentions(text: string): string[] {
  if (!text) return [];
  
  // Match @username pattern (alphanumeric and underscore)
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const matches = text.matchAll(mentionRegex);
  
  const usernames = new Set<string>();
  for (const match of matches) {
    if (match[1]) {
      usernames.add(match[1]);
    }
  }
  
  return Array.from(usernames);
}

/**
 * Extract mentions from Tiptap JSON content
 * @param jsonContent - The Tiptap JSON content
 * @returns Array of unique usernames
 */
export function extractMentionsFromTiptap(jsonContent: any): string[] {
  if (!jsonContent) return [];
  
  const mentions = new Set<string>();
  
  function traverse(node: any) {
    if (!node) return;
    
    // Check if this is a mention node
    if (node.type === 'mention' && node.attrs?.id) {
      mentions.add(node.attrs.id);
    }
    
    // Check text content for @mentions (fallback)
    if (node.type === 'text' && node.text) {
      const textMentions = extractMentions(node.text);
      textMentions.forEach(m => mentions.add(m));
    }
    
    // Traverse child nodes
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  }
  
  traverse(jsonContent);
  return Array.from(mentions);
}

/**
 * Get a text snippet/context around a mention for notification purposes
 * @param text - The full text
 * @param username - The mentioned username
 * @param contextLength - Number of characters to include before and after
 * @returns Context string
 */
export function getMentionContext(text: string, username: string, contextLength: number = 50): string {
  if (!text) return '';
  
  const mentionPattern = `@${username}`;
  const index = text.indexOf(mentionPattern);
  
  if (index === -1) return text.substring(0, 100);
  
  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + mentionPattern.length + contextLength);
  
  let context = text.substring(start, end);
  
  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';
  
  return context;
}

/**
 * Highlight mentions in text with HTML
 * @param text - The text to process
 * @returns HTML string with mentions highlighted
 */
export function highlightMentions(text: string): string {
  if (!text) return '';
  
  return text.replace(
    /@([a-zA-Z0-9_]+)/g,
    '<span class="mention">@$1</span>'
  );
}
