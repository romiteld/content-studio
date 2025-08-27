import { brandConfig } from '../config/brandConfig';

export interface StyleOverride {
  selector: string;
  styles: Record<string, string>;
  priority?: 'low' | 'normal' | 'high';
}

class StyleManager {
  private customStyles: Map<string, StyleOverride> = new Map();
  
  constructor() {
    this.initializeProtectedElements();
  }
  
  private initializeProtectedElements() {
    // Ensure protected brand elements always maintain core styles
    if (brandConfig.protectedElements) {
      const protectedStyles = document.createElement('style');
      protectedStyles.id = 'brand-protection-styles';
      protectedStyles.innerHTML = `
        /* Protected Brand Elements - Cannot be overridden */
        ${brandConfig.protectedElements.map(selector => `
          ${selector} {
            /* Core brand colors preserved */
            --brand-gold: ${brandConfig.colors.gold} !important;
            --brand-cyan: ${brandConfig.colors.cyan} !important;
            --brand-black: ${brandConfig.colors.primary} !important;
          }
        `).join('\n')}
      `;
      document.head.appendChild(protectedStyles);
    }
  }
  
  public addCustomStyle(override: StyleOverride): boolean {
    // Check if trying to override protected elements
    const isProtected = brandConfig.protectedElements?.some(
      protectedEl => override.selector.includes(protectedEl.replace('.', ''))
    );
    
    if (isProtected) {
      console.warn(`Cannot override protected brand element: ${override.selector}`);
      return false;
    }
    
    // Allow style override for non-protected elements
    if (brandConfig.allowStyleOverrides) {
      this.customStyles.set(override.selector, override);
      this.applyStyles();
      return true;
    }
    
    return false;
  }
  
  public removeCustomStyle(selector: string): void {
    this.customStyles.delete(selector);
    this.applyStyles();
  }
  
  public clearAllCustomStyles(): void {
    this.customStyles.clear();
    const customStyleEl = document.getElementById('custom-style-overrides');
    if (customStyleEl) {
      customStyleEl.remove();
    }
  }
  
  private applyStyles(): void {
    let styleEl = document.getElementById('custom-style-overrides');
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-style-overrides';
      document.head.appendChild(styleEl);
    }
    
    const styleRules = Array.from(this.customStyles.values())
      .sort((a, b) => {
        const priorityOrder = { low: 0, normal: 1, high: 2 };
        return (priorityOrder[a.priority || 'normal']) - (priorityOrder[b.priority || 'normal']);
      })
      .map(override => {
        const styleString = Object.entries(override.styles)
          .map(([prop, value]) => `${prop}: ${value}`)
          .join('; ');
        
        const importance = override.priority === 'high' ? ' !important' : '';
        return `${override.selector} { ${styleString}${importance}; }`;
      })
      .join('\n');
    
    styleEl.innerHTML = styleRules;
  }
  
  public getCustomStyles(): StyleOverride[] {
    return Array.from(this.customStyles.values());
  }
  
  public exportStyles(): string {
    return Array.from(this.customStyles.values())
      .map(override => {
        const styleString = Object.entries(override.styles)
          .map(([prop, value]) => `  ${prop}: ${value};`)
          .join('\n');
        return `${override.selector} {\n${styleString}\n}`;
      })
      .join('\n\n');
  }
  
  public importStyles(cssString: string): void {
    // Simple CSS parser for importing custom styles
    const rules = cssString.match(/[^{]+\{[^}]*\}/g);
    
    if (rules) {
      rules.forEach(rule => {
        const [selector, stylesBlock] = rule.split('{');
        const styles: Record<string, string> = {};
        
        const styleDeclarations = stylesBlock.replace('}', '').split(';');
        styleDeclarations.forEach(decl => {
          const [prop, value] = decl.split(':').map(s => s.trim());
          if (prop && value) {
            styles[prop] = value;
          }
        });
        
        if (Object.keys(styles).length > 0) {
          this.addCustomStyle({
            selector: selector.trim(),
            styles
          });
        }
      });
    }
  }
}

export const styleManager = new StyleManager();
export default styleManager;