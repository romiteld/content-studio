"use client";
import React, { useState, useEffect } from "react";
import './wealth-integrations-orbit.css';

// Essential wealth management and social platform icons - NO DUPLICATES
const WEALTH_ICONS = [
  // Social Media Platforms
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%230077B5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z'/%3E%3C/svg%3E", // LinkedIn
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%231DA1F2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.244 2.25H21.552L14.325 10.51L22.827 21.75H16.17L10.956 14.933L4.99 21.75H1.68L9.41 12.915L1.254 2.25H8.08L12.793 8.481L18.244 2.25ZM17.083 19.77H18.916L7.084 4.126H5.117L17.083 19.77Z'/%3E%3C/svg%3E", // X/Twitter
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23FF0000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/%3E%3C/svg%3E", // YouTube
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%234267B2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.099 4.388 23.048 10.125 24V15.564H7.078V12.073H10.125V9.405C10.125 6.348 11.917 4.697 14.658 4.697C15.97 4.697 17.344 4.922 17.344 4.922V7.89H15.83C14.34 7.89 13.875 8.717 13.875 9.57V12.073H17.203L16.671 15.564H13.875V24C19.612 23.048 24 18.099 24 12.073Z'/%3E%3C/svg%3E", // Facebook
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23E4405F' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 0C8.74 0 8.333 0.015 7.053 0.072C5.775 0.132 4.905 0.333 4.14 0.63C3.351 0.936 2.681 1.347 2.014 2.014C1.347 2.681 0.935 3.35 0.63 4.14C0.333 4.905 0.131 5.775 0.072 7.053C0.012 8.333 0 8.74 0 12C0 15.26 0.015 15.667 0.072 16.947C0.132 18.224 0.333 19.095 0.63 19.86C0.936 20.648 1.347 21.319 2.014 21.986C2.681 22.652 3.35 23.065 4.14 23.37C4.906 23.666 5.776 23.869 7.053 23.928C8.333 23.988 8.74 24 12 24C15.26 24 15.667 23.988 16.947 23.928C18.224 23.869 19.095 23.666 19.86 23.37C20.648 23.064 21.319 22.652 21.986 21.986C22.652 21.319 23.065 20.651 23.37 19.86C23.666 19.095 23.869 18.224 23.928 16.947C23.988 15.667 24 15.26 24 12C24 8.74 23.985 8.333 23.928 7.053C23.869 5.776 23.666 4.905 23.37 4.14C23.064 3.351 22.652 2.681 21.986 2.014C21.319 1.347 20.651 0.935 19.86 0.63C19.095 0.333 18.224 0.131 16.947 0.072C15.667 0.012 15.26 0 12 0ZM12 5.838C15.403 5.838 18.162 8.597 18.162 12C18.162 15.404 15.403 18.163 12 18.163C8.597 18.163 5.838 15.403 5.838 12C5.838 8.597 8.597 5.838 12 5.838ZM12 16C14.209 16 16 14.209 16 12C16 9.791 14.209 8 12 8C9.791 8 8 9.791 8 12C8 14.209 9.791 16 12 16ZM19.846 5.595C19.846 6.39 19.201 7.035 18.406 7.035C17.611 7.035 16.966 6.39 16.966 5.595C16.966 4.801 17.611 4.156 18.406 4.156C19.201 4.156 19.846 4.801 19.846 5.595Z'/%3E%3C/svg%3E", // Instagram
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23000000' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'/%3E%3C/svg%3E", // TikTok
  
  // Advertising Platforms
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%234285F4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='%2334A853'/%3E%3Cpath d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='%23FBBC05'/%3E%3Cpath d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='%23EA4335'/%3E%3C/svg%3E", // Google Ads
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23008575' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10.39 1.408L5.878 13.236h2.724l.803-2.41h4.874c.517 0 .96.359 1.075.87l.479 2.132a.541.541 0 0 0 1.058-.009l4.582-11.77C21.86 1.137 21.187 0 20.165 0H11.51c-.476 0-.907.284-1.094.723l-.026.061zm6.305 1.125h2.723L16.36 11.07h-2.723l3.058-8.537zM3.958 12.865c0 .447.138.777.345 1.003.172.172.465.362.862.57l.017.009.017.008c.414.224.949.483 1.501.74.555.259 1.134.519 1.638.754.505.237.937.45 1.207.603.144.081.252.143.327.19l-.155.207a.965.965 0 0 1-.327.277 2.034 2.034 0 0 1-.724.276 5.052 5.052 0 0 1-1.104.104c-.914 0-1.64-.26-2.19-.775-.549-.514-.827-1.19-.827-2.035V14h-.5v-.017l-.087-.018v-.5h.5v-.5h-.5v-.1zm9.326.94l-.964 2.889 1.526-1.965-.562-.924zm-.19 3.764c-.31 0-.638.035-.983.104a6.167 6.167 0 0 0-.982.276 3.345 3.345 0 0 0-.81.432.89.89 0 0 0-.362.708c0 .24.103.447.31.62.207.173.483.26.827.26.549 0 1.033-.104 1.446-.31.414-.207.759-.467 1.034-.775.277-.31.484-.638.621-.983.138-.345.207-.673.207-.982v-.552a4.572 4.572 0 0 0-.569.535 5.2 5.2 0 0 1-.74.667z'/%3E%3C/svg%3E", // Bing Ads
  
  // Content Platforms
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%238B5CF6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7c0-.28.22-.5.5-.5s.5.22.5.5v7c0 .28-.22.5-.5.5s-.5-.22-.5-.5zm4 0v-7c0-.28.22-.5.5-.5s.5.22.5.5v7c0 .28-.22.5-.5.5s-.5-.22-.5-.5z'/%3E%3C/svg%3E", // Podcast
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%2310B981' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z'/%3E%3C/svg%3E", // Webinars
  "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23EA4335' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E" // Email
];

const INTEGRATION_LABELS = [
  "LinkedIn",
  "X (Twitter)", 
  "YouTube",
  "Facebook",
  "Instagram",
  "TikTok",
  "Google Ads",
  "Bing Ads",
  "Podcast",
  "Webinars",
  "Email"
];

interface SemiCircleOrbitProps {
  radius: number;
  centerX: number;
  centerY: number;
  count: number;
  iconSize: number;
  animationDelay?: number;
}

function SemiCircleOrbit({ radius, centerX, centerY, count, iconSize, animationDelay = 0, startIndex = 0 }: SemiCircleOrbitProps & { startIndex?: number }) {
  return (
    <>
      {/* Semi-circle glow background with brand colors */}
      {startIndex === 0 && (
        <div className="absolute inset-0 flex justify-center">
          <div
            className="
              w-[1000px] h-[1000px] rounded-full 
              bg-[radial-gradient(circle_at_center,rgba(79,195,247,0.15),transparent_70%)]
              blur-3xl 
              -mt-40 
              pointer-events-none
            "
            style={{ zIndex: 0 }}
          />
        </div>
      )}

      {/* Orbit icons */}
      {Array.from({ length: count }).map((_, index) => {
        const angle = (index / (count - 1)) * 180;
        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);
        const iconIndex = startIndex + index;
        const icon = WEALTH_ICONS[iconIndex];
        const label = INTEGRATION_LABELS[iconIndex];

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
        <h2 className="mb-4 text-3xl font-bold lg:text-5xl text-white">
          {title}
        </h2>
        <p className="mb-12 max-w-2xl text-gray-400 lg:text-lg leading-relaxed">
          {subtitle}
        </p>

        <div
          className="orbit-container relative"
          style={{ width: baseWidth, height: baseWidth * 0.6 }}
        >
          {/* Two concentric semi-circles with proper icon distribution for 11 platforms */}
          <SemiCircleOrbit 
            radius={baseWidth * 0.28} 
            centerX={centerX} 
            centerY={centerY} 
            count={6}  // First 6 platforms (social media)
            iconSize={iconSize} 
            animationDelay={0}
            startIndex={0}
          />
          <SemiCircleOrbit 
            radius={baseWidth * 0.44} 
            centerX={centerX} 
            centerY={centerY} 
            count={5}  // Remaining 5 platforms (ads + content)
            iconSize={iconSize - 2} 
            animationDelay={0.5}
            startIndex={6}
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-500/30">
            6 Social Platforms
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400 border border-blue-500/30">
            2 Ad Networks
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-900/20 text-purple-400 border border-purple-500/30">
            3 Content Channels
          </span>
        </div>
      </div>
    </section>
  );
}