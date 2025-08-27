import React, { useEffect, useRef, useState } from 'react';
// Lazy-load Chart.js on client to reduce initial bundle
let ChartAuto: any;
import { brandConfig } from '../../config/brandConfig';

interface ChartContainerProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  title: string;
  data: {
    labels: string[];
    datasets: {
      label?: string;
      data: number[];
    }[];
  };
}

const ChartContainer: React.FC<ChartContainerProps> = ({ type, title, data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!chartRef.current) return;
    let cancelled = false;

    (async () => {
      if (!ChartAuto) {
        const mod = await import('chart.js/auto');
        ChartAuto = mod.default || mod;
      }
      if (cancelled) return;
      setReady(true);
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const brandColors = brandConfig.chartThemes.default.colors;
    
    const styledDatasets = data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: type === 'line' 
        ? `${brandColors[index % brandColors.length]}33`
        : brandColors[index % brandColors.length],
      borderColor: brandColors[index % brandColors.length],
      borderWidth: 2,
      tension: 0.4
    }));

    chartInstance.current = new ChartAuto(ctx, {
      type: type as any,
      data: {
        labels: data.labels,
        datasets: styledDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: brandConfig.colors.textPrimary,
              font: {
                family: brandConfig.fonts.primary,
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: title,
            color: brandConfig.colors.gold,
            font: {
              family: brandConfig.fonts.primary,
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: type !== 'pie' && type !== 'doughnut' && type !== 'radar' && type !== 'polarArea' ? {
          x: {
            grid: {
              color: brandConfig.chartThemes.default.gridColor
            },
            ticks: {
              color: brandConfig.colors.textSecondary
            }
          },
          y: {
            grid: {
              color: brandConfig.chartThemes.default.gridColor
            },
            ticks: {
              color: brandConfig.colors.textSecondary
            }
          }
        } : undefined
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, title, data, ready]);

  return (
    <div className="chart-container">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ChartContainer;