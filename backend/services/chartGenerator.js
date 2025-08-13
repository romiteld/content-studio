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
  const barWidth = chartWidth / data.labels.length * 0.8;
  const gap = chartWidth / data.labels.length * 0.2;
  const maxValue = Math.max(...data.values);
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#000000"/>
    <g transform="translate(${padding}, ${padding})">`;
  
  // Draw bars
  data.labels.forEach((label, i) => {
    const barHeight = (data.values[i] / maxValue) * chartHeight;
    const x = i * (barWidth + gap);
    const y = chartHeight - barHeight;
    
    // Bar with gradient
    svg += `<defs>
      <linearGradient id="goldGradient${i}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${brandConfig.colors.goldLight};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${brandConfig.colors.gold};stop-opacity:1" />
      </linearGradient>
    </defs>`;
    
    svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
      fill="url(#goldGradient${i})" stroke="${brandConfig.colors.gold}" stroke-width="2"/>`;
    
    // Value label
    svg += `<text x="${x + barWidth/2}" y="${y - 5}" 
      text-anchor="middle" fill="${brandConfig.colors.cyan}" font-size="14" font-weight="bold">
      ${data.values[i]}</text>`;
    
    // X-axis label
    svg += `<text x="${x + barWidth/2}" y="${chartHeight + 20}" 
      text-anchor="middle" fill="${brandConfig.colors.textPrimary}" font-size="12">
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