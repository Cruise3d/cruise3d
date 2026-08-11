// src/styles/variables.ts
import { theme } from './theme';

export function generateCSSVariables(themeConfig: typeof theme): string {
  const cssVars: string[] = [];
  
  function flattenObject(obj: any, prefix: string = '') {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const newPrefix = prefix ? `${prefix}-${key}` : key;
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        flattenObject(value, newPrefix);
      } else {
        // Convert color values to CSS variables
        const varName = `--theme-${newPrefix}`;
        cssVars.push(`${varName}: ${value};`);
      }
    });
  }
  
  flattenObject(themeConfig);
  return cssVars.join('\n');
}