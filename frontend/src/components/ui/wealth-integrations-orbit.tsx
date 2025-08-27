"use client";
import React, { useState, useEffect } from "react";
import './wealth-integrations-orbit.css';

// Essential wealth management and social platform icons
const WEALTH_ICONS = [
  // Financial Platforms (Brand Gold)
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23D4AF37' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z'/%3E%3C/svg%3E", // Security/Trust
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23D4AF37' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z'/%3E%3C/svg%3E", // Banking
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23D4AF37' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z'/%3E%3C/svg%3E", // Analytics
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23D4AF37' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 6H23V18H5V6ZM21 8H7V16H21V8ZM1 4H3V20H1V4Z'/%3E%3C/svg%3E", // Financial Reports
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23D4AF37' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z'/%3E%3C/svg%3E", // Risk Management
  
  // Social Media Platforms (Platform Brand Colors)
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%230077B5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z'/%3E%3C/svg%3E", // LinkedIn
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23000000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.244 2.25H21.552L14.325 10.51L22.827 21.75H16.17L10.956 14.933L4.99 21.75H1.68L9.41 12.915L1.254 2.25H8.08L12.793 8.481L18.244 2.25ZM17.083 19.77H18.916L7.084 4.126H5.117L17.083 19.77Z'/%3E%3C/svg%3E", // X/Twitter
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23E4405F' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 0C8.74 0 8.333 0.015 7.053 0.072C5.775 0.132 4.905 0.333 4.14 0.63C3.351 0.936 2.681 1.347 2.014 2.014C1.347 2.681 0.935 3.35 0.63 4.14C0.333 4.905 0.131 5.775 0.072 7.053C0.012 8.333 0 8.74 0 12C0 15.26 0.015 15.667 0.072 16.947C0.132 18.224 0.333 19.095 0.63 19.86C0.936 20.648 1.347 21.319 2.014 21.986C2.681 22.652 3.35 23.065 4.14 23.37C4.906 23.666 5.776 23.869 7.053 23.928C8.333 23.988 8.74 24 12 24C15.26 24 15.667 23.988 16.947 23.928C18.224 23.869 19.095 23.666 19.86 23.37C20.648 23.064 21.319 22.652 21.986 21.986C22.652 21.319 23.065 20.651 23.37 19.86C23.666 19.095 23.869 18.224 23.928 16.947C23.988 15.667 24 15.26 24 12C24 8.74 23.985 8.333 23.928 7.053C23.869 5.776 23.666 4.905 23.37 4.14C23.064 3.351 22.652 2.681 21.986 2.014C21.319 1.347 20.651 0.935 19.86 0.63C19.095 0.333 18.224 0.131 16.947 0.072C15.667 0.012 15.26 0 12 0ZM12 5.838C15.403 5.838 18.162 8.597 18.162 12C18.162 15.404 15.403 18.163 12 18.163C8.597 18.163 5.838 15.403 5.838 12C5.838 8.597 8.597 5.838 12 5.838ZM12 16C14.209 16 16 14.209 16 12C16 9.791 14.209 8 12 8C9.791 8 8 9.791 8 12C8 14.209 9.791 16 12 16ZM19.846 5.595C19.846 6.39 19.201 7.035 18.406 7.035C17.611 7.035 16.966 6.39 16.966 5.595C16.966 4.801 17.611 4.156 18.406 4.156C19.201 4.156 19.846 4.801 19.846 5.595Z'/%3E%3C/svg%3E", // Instagram
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%234267B2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.099 4.388 23.048 10.125 24V15.564H7.078V12.073H10.125V9.405C10.125 6.348 11.917 4.697 14.658 4.697C15.97 4.697 17.344 4.922 17.344 4.922V7.89H15.83C14.34 7.89 13.875 8.717 13.875 9.57V12.073H17.203L16.671 15.564H13.875V24C19.612 23.048 24 18.099 24 12.073Z'/%3E%3C/svg%3E" // Facebook
];

const INTEGRATION_LABELS = [
  "Portfolio Shield",
  "Wealth Banking",
  "Market Analytics",
  "Financial Reports",
  "Risk Management",
  "LinkedIn",
  "Twitter/X",
  "Instagram",
  "Facebook"
];

interface SemiCircleOrbitProps {
  radius: number;
  centerX: number;
  centerY: number;
  count: number;
  iconSize: number;
  animationDelay?: number;
}

function SemiCircleOrbit({ radius, centerX, centerY, count, iconSize, animationDelay = 0 }: SemiCircleOrbitProps) {
  return (
    <>
      {/* Semi-circle glow background with brand colors */}
      <div className="absolute inset-0 flex justify-center">
        <div
          className="
            w-[1000px] h-[1000px] rounded-full 
            bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent_70%)]
            dark:bg-[radial-gradient(circle_at_center,rgba(79,195,247,0.15),transparent_70%)]
            blur-3xl 
            -mt-40 
            pointer-events-none
          "
          style={{ zIndex: 0 }}
        />
      </div>

      {/* Orbit icons */}
      {Array.from({ length: count }).map((_, index) => {
        const angle = (index / (count - 1)) * 180;
        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);
        const icon = WEALTH_ICONS[index % WEALTH_ICONS.length];
        const label = INTEGRATION_LABELS[index % INTEGRATION_LABELS.length];

        // Tooltip positioning — above or below based on angle
        const tooltipAbove = angle > 90;

        return (
          <div
            key={index}
            className="orbit-icon absolute flex flex-col items-center group cursor-pointer"
            style={{
              left: `${centerX + x - iconSize / 2}px`,
              top: `${centerY - y - iconSize / 2}px`,
              zIndex: 5,
              animationDelay: `${animationDelay + index * 0.2}s`
            }}
            onClick={() => {
              // Handle integration clicks - could open modals or navigate
              console.log(`Clicked on ${label}`);
            }}
          >
            <div
              className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 p-2 transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-lg hover:border-[#D4AF37]/50"
              style={{
                width: iconSize + 16,
                height: iconSize + 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateZ(0)', // Hardware acceleration
                willChange: 'transform'
              }}
            >
              <img
                src={icon}
                alt={label}
                width={iconSize}
                height={iconSize}
                className="object-contain"
                style={{ minWidth: iconSize, minHeight: iconSize }}
              />
            </div>

            {/* Tooltip with brand styling */}
            <div
              className={`absolute ${
                tooltipAbove ? "bottom-[calc(100%+12px)]" : "top-[calc(100%+12px)]"
              } hidden group-hover:block w-32 rounded-lg bg-black/90 backdrop-blur-sm px-3 py-2 text-xs text-white shadow-xl text-center border border-[#D4AF37]/30`}
            >
              {label}
              <div
                className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-black/90 border-l border-t border-[#D4AF37]/30 ${
                  tooltipAbove ? "top-full -mt-1.5" : "bottom-full -mb-1.5"
                }`}
              ></div>
            </div>

            {/* Enhanced glow animation for integrations */}
            <div
              className="orbit-glow absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
              style={{
                background: `radial-gradient(circle, ${index < 5 ? '#D4AF37' : '#4FC3F7'}30, transparent 60%)`,
                transform: 'scale(1.2)',
                filter: 'blur(1px)'
              }}
            />
          </div>
        );
      })}
    </>
  );
}

interface WealthIntegrationsOrbitProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function WealthIntegrationsOrbit({ 
  title = "Platform Integrations", 
  subtitle = "Connect your wealth management tools and social platforms seamlessly",
  className = ""
}: WealthIntegrationsOrbitProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const baseWidth = Math.min(size.width * 0.9, 800);
  const centerX = baseWidth / 2;
  const centerY = baseWidth * 0.45;

  const iconSize =
    size.width < 480
      ? Math.max(28, baseWidth * 0.045)
      : size.width < 768
      ? Math.max(32, baseWidth * 0.05)
      : Math.max(36, baseWidth * 0.055);

  return (
    <section className={`py-16 relative w-full overflow-hidden ${className}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#D4AF37_1px,transparent_1px),linear-gradient(-45deg,#4FC3F7_1px,transparent_1px)] bg-[length:20px_20px]" />
      </div>

      <div className="relative flex flex-col items-center text-center z-10 container mx-auto px-4">
        <h2 className="mb-4 text-3xl font-bold lg:text-5xl text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="mb-12 max-w-2xl text-gray-600 dark:text-gray-400 lg:text-lg leading-relaxed">
          {subtitle}
        </p>

        <div
          className="orbit-container relative"
          style={{ width: baseWidth, height: baseWidth * 0.6 }}
        >
          {/* Two concentric semi-circles with optimized icon distribution */}
          <SemiCircleOrbit 
            radius={baseWidth * 0.28} 
            centerX={centerX} 
            centerY={centerY} 
            count={5} 
            iconSize={iconSize} 
            animationDelay={0}
          />
          <SemiCircleOrbit 
            radius={baseWidth * 0.44} 
            centerX={centerX} 
            centerY={centerY} 
            count={4} 
            iconSize={iconSize - 2} 
            animationDelay={0.5}
          />

          {/* Central hub indicator */}
          <div 
            className="absolute flex items-center justify-center"
            style={{
              left: `${centerX - 24}px`,
              top: `${centerY - 24}px`,
              width: '48px',
              height: '48px',
              zIndex: 10
            }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#4FC3F7] flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#4FC3F7]" />
              </div>
            </div>
          </div>
        </div>

        {/* Integration status indicators */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-md">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            5 Financial Tools Connected
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            4 Social Platforms Active
          </span>
        </div>
      </div>
    </section>
  );
}