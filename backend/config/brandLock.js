const brandConfig = {
  colors: {
    primary: '#000000',
    secondary: '#000000',
    gold: '#BE9E44',
    goldLight: '#D4AF37',
    goldGradientEnd: '#F4E775',
    cyan: '#2EA3F2',
    cyanLight: '#4FC3F7',
    textPrimary: '#E6E6E6',
    textSecondary: '#BFBFBF',
    textMuted: '#9A9A9A',
    darkText: '#1a1a1a'
  },
  
  fonts: {
    primary: "'Inter', 'Arial', 'Helvetica', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    weights: {
      regular: 400,
      medium: 600,
      bold: 700
    }
  },
  
  spacing: {
    vr: '8px',
    pagePadding: '0.5in',
    sectionGap: '20px',
    cardPadding: '20px'
  },
  
  dimensions: {
    pageWidth: '8.5in',
    pageHeight: '11in',
    logoWidth: '140px'
  },
  
  chartThemes: {
    default: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#BE9E44',
      gridColor: 'rgba(255, 255, 255, 0.1)',
      fontColor: '#E6E6E6',
      colors: ['#BE9E44', '#2EA3F2', '#D4AF37', '#4FC3F7', '#E6E6E6', '#BFBFBF']
    }
  },
  
  gradients: {
    gold: 'linear-gradient(135deg, #BE9E44 0%, #F4E775 100%)',
    dark: 'linear-gradient(180deg, #000000 0%, #000000 100%)',
    subtle: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(79, 195, 247, 0.05) 100%)'
  },
  
  components: {
    roleCard: {
      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(79, 195, 247, 0.02) 100%)',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '15px',
      padding: '25px'
    },
    compensationGrid: {
      background: 'rgba(212, 175, 55, 0.1)',
      borderRadius: '10px',
      padding: '12px'
    },
    highlightBox: {
      background: 'linear-gradient(135deg, #BE9E44 0%, #F4E775 100%)',
      borderRadius: '10px',
      padding: '15px'
    },
    ctaSection: {
      background: 'linear-gradient(135deg, #BE9E44 0%, #F4E775 100%)',
      borderRadius: '20px',
      padding: '30px'
    }
  }
};

Object.freeze(brandConfig);
Object.freeze(brandConfig.colors);
Object.freeze(brandConfig.fonts);
Object.freeze(brandConfig.spacing);
Object.freeze(brandConfig.dimensions);
Object.freeze(brandConfig.chartThemes);
Object.freeze(brandConfig.gradients);
Object.freeze(brandConfig.components);

module.exports = brandConfig;