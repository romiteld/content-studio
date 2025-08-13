const brandConfig = require('../config/brandLock');

// Generate SVG chart without external dependencies
function generateSVGChart(type, data, width = 800, height = 400) {
  const padding = 50;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  switch (type) {
    case 'bar':
      return generateBarChart(data, width, height, padding);
    case 'line':
      return generateLineChart(data, width, height, padding);
    case 'pie':
      return generatePieChart(data, width, height);
    default:
      return generateBarChart(data, width, height, padding);
  }
}

function generateBarChart(data, width, height, padding) {
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = chartWidth / data.labels.length * 0.7;
  const gap = chartWidth / data.labels.length * 0.3;
  const maxValue = Math.max(...data.values);
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background with subtle gradient -->
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="shadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <feOffset dx="2" dy="2" result="offsetblur"/>
        <feFlood flood-color="#000000" flood-opacity="0.5"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
    
    <!-- Grid lines for better readability -->
    <g transform="translate(${padding}, ${padding})">`;
  
  // Add horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = (chartHeight / 5) * i;
    svg += `<line x1="0" y1="${y}" x2="${chartWidth}" y2="${y}" 
      stroke="${brandConfig.colors.textSecondary}" stroke-width="0.5" opacity="0.2"/>`;
    const value = Math.round(maxValue * (1 - i/5));
    svg += `<text x="-10" y="${y + 4}" text-anchor="end" 
      fill="${brandConfig.colors.textSecondary}" font-size="10" opacity="0.6">
      ${value.toLocaleString()}</text>`;
  }
  
  // Draw bars with enhanced styling
  data.labels.forEach((label, i) => {
    const barHeight = (data.values[i] / maxValue) * chartHeight;
    const x = i * (chartWidth / data.labels.length) + gap/2;
    const y = chartHeight - barHeight;
    
    // Enhanced gradient for each bar
    svg += `<defs>
      <linearGradient id="barGradient${i}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${brandConfig.colors.goldLight};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${brandConfig.colors.gold};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${brandConfig.colors.gold};stop-opacity:0.8" />
      </linearGradient>
    </defs>`;
    
    // Bar with rounded corners and shadow
    svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
      rx="4" ry="4"
      fill="url(#barGradient${i})" 
      filter="filter(shadow)"
      stroke="${brandConfig.colors.goldLight}" 
      stroke-width="1" 
      opacity="0.95"/>`;
    
    // Animated hover effect placeholder
    svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
      rx="4" ry="4"
      fill="transparent" 
      stroke="${brandConfig.colors.cyan}" 
      stroke-width="2" 
      opacity="0"
      class="bar-hover">
      <animate attributeName="opacity" begin="mouseover" dur="0.2s" to="0.5" fill="freeze"/>
      <animate attributeName="opacity" begin="mouseout" dur="0.2s" to="0" fill="freeze"/>
    </rect>`;
    
    // Value label with background
    const labelY = y - 15;
    svg += `<rect x="${x + barWidth/2 - 35}" y="${labelY - 12}" width="70" height="20" 
      rx="10" ry="10" fill="${brandConfig.colors.cyan}" opacity="0.9"/>`;
    svg += `<text x="${x + barWidth/2}" y="${labelY}" 
      text-anchor="middle" fill="#000" font-size="12" font-weight="bold">
      $${(data.values[i]/1000).toFixed(0)}K</text>`;
    
    // X-axis label with better styling
    svg += `<text x="${x + barWidth/2}" y="${chartHeight + 25}" 
      text-anchor="middle" fill="${brandConfig.colors.textPrimary}" 
      font-size="13" font-weight="500" font-family="Inter, sans-serif">
      ${label}</text>`;
  });
  
  svg += `</g></svg>`;
  return svg;
}

function generateLineChart(data, width, height, padding) {
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...data.values);
  const stepX = chartWidth / (data.labels.length - 1);
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#000000"/>
    <g transform="translate(${padding}, ${padding})">`;
  
  // Create path points
  let pathData = 'M ';
  let points = [];
  
  data.labels.forEach((label, i) => {
    const x = i * stepX;
    const y = chartHeight - (data.values[i] / maxValue) * chartHeight;
    points.push({x, y, value: data.values[i], label});
    pathData += `${x},${y} `;
    if (i < data.labels.length - 1) pathData += 'L ';
  });
  
  // Draw line
  svg += `<path d="${pathData}" stroke="${brandConfig.colors.cyan}" stroke-width="3" fill="none"/>`;
  
  // Draw points and labels
  points.forEach(point => {
    svg += `<circle cx="${point.x}" cy="${point.y}" r="5" fill="${brandConfig.colors.goldLight}"/>`;
    svg += `<text x="${point.x}" y="${point.y - 10}" 
      text-anchor="middle" fill="${brandConfig.colors.goldLight}" font-size="12" font-weight="bold">
      ${point.value}</text>`;
    svg += `<text x="${point.x}" y="${chartHeight + 20}" 
      text-anchor="middle" fill="${brandConfig.colors.textPrimary}" font-size="11">
      ${point.label}</text>`;
  });
  
  svg += `</g></svg>`;
  return svg;
}

function generatePieChart(data, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#000000"/>`;
  
  const total = data.values.reduce((sum, val) => sum + val, 0);
  let currentAngle = -90; // Start at top
  
  const colors = [
    brandConfig.colors.gold,
    brandConfig.colors.cyan,
    brandConfig.colors.goldLight,
    brandConfig.colors.cyanLight,
    brandConfig.colors.textPrimary
  ];
  
  data.labels.forEach((label, i) => {
    const percentage = data.values[i] / total;
    const angle = percentage * 360;
    const endAngle = currentAngle + angle;
    
    // Calculate path
    const largeArcFlag = angle > 180 ? 1 : 0;
    const startX = centerX + radius * Math.cos(currentAngle * Math.PI / 180);
    const startY = centerY + radius * Math.sin(currentAngle * Math.PI / 180);
    const endX = centerX + radius * Math.cos(endAngle * Math.PI / 180);
    const endY = centerY + radius * Math.sin(endAngle * Math.PI / 180);
    
    svg += `<path d="M ${centerX},${centerY} L ${startX},${startY} 
      A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z" 
      fill="${colors[i % colors.length]}" stroke="#000" stroke-width="2"/>`;
    
    // Add label
    const labelAngle = currentAngle + angle / 2;
    const labelX = centerX + (radius * 0.7) * Math.cos(labelAngle * Math.PI / 180);
    const labelY = centerY + (radius * 0.7) * Math.sin(labelAngle * Math.PI / 180);
    
    svg += `<text x="${labelX}" y="${labelY}" 
      text-anchor="middle" fill="#000" font-size="14" font-weight="bold">
      ${label}: ${Math.round(percentage * 100)}%</text>`;
    
    currentAngle = endAngle;
  });
  
  svg += `</svg>`;
  return svg;
}

// Generate chart data for documents
function generateChartImage(type, data) {
  const svg = generateSVGChart(type, data);
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

module.exports = {
  generateSVGChart,
  generateChartImage
};