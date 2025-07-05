/**
 * Utility function to concatenate CSS classes conditionally
 * Simple implementation without external dependencies
 */
export function cn(...classes: (string | undefined | null | false | Record<string, boolean>)[]): string {
  const result: string[] = [];
  
  for (const cls of classes) {
    if (!cls) continue;
    
    if (typeof cls === 'string') {
      result.push(cls);
    } else if (typeof cls === 'object') {
      // Handle conditional classes: { 'class-name': condition }
      for (const [key, value] of Object.entries(cls)) {
        if (value) {
          result.push(key);
        }
      }
    }
  }
  
  return result.join(' ');
}

/**
 * Alternative class concatenation function
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}