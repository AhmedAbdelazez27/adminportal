import { Injectable } from '@angular/core';
import { EnhancedRouteMappingService } from './enhanced-route-mapping.service';

@Injectable({
  providedIn: 'root'
})
export class RouteMappingValidatorService {

  constructor(private routeMappingService: EnhancedRouteMappingService) { }

  /**
   * Validate all pageNames from backend data against route mappings
   */
  validatePageNames(backendPageNames: string[]): {
    mapped: string[];
    unmapped: string[];
    invalid: string[];
  } {
    const mapped: string[] = [];
    const unmapped: string[] = [];
    const invalid: string[] = [];

    const availablePageNames = this.routeMappingService.getAllPageNames();

    backendPageNames.forEach(pageName => {
      if (availablePageNames.includes(pageName)) {
        const routeInfo = this.routeMappingService.getNavigationPath(pageName);
        if (routeInfo) {
          mapped.push(pageName);
        } else {
          invalid.push(pageName);
        }
      } else {
        unmapped.push(pageName);
      }
    });

    return { mapped, unmapped, invalid };
  }

  /**
   * Get suggestions for unmapped pageNames
   */
  getSuggestions(unmappedPageName: string): string[] {
    const availablePageNames = this.routeMappingService.getAllPageNames();
    const suggestions: string[] = [];

    const lowerUnmapped = unmappedPageName.toLowerCase();

    // Find similar pageNames
    availablePageNames.forEach(pageName => {
      const lowerPageName = pageName.toLowerCase();
      
      // Exact substring match
      if (lowerPageName.includes(lowerUnmapped) || lowerUnmapped.includes(lowerPageName)) {
        suggestions.push(pageName);
      }
      // Similar pattern match
      else if (this.calculateSimilarity(lowerUnmapped, lowerPageName) > 0.5) {
        suggestions.push(pageName);
      }
    });

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Generate a report of unmapped pageNames from backend data
   */
  generateUnmappedReport(backendShortcuts: any[]): void {
    const pageNames = backendShortcuts.map(shortcut => shortcut.pageName);
    const validation = this.validatePageNames(pageNames);

  

    if (validation.unmapped.length > 0) {
       validation.unmapped.forEach(pageName => {
        const suggestions = this.getSuggestions(pageName);
       });
      console.groupEnd();
    }

    if (validation.invalid.length > 0) {
      console.group('⚠️  Invalid Mappings:');
      validation.invalid.forEach(pageName => {
       });
      console.groupEnd();
    }

    console.groupEnd();
  }
}
