import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className.includes('text-') ? className : `text-primary ${className}`}`}>
      <svg viewBox="0 0 100 100" className="h-[1.2em] w-auto" fill="currentColor" overflow="visible" style={{ height: 'inherit', minHeight: '100%' }}>
        <defs>
          <mask id="face-mask">
            <rect x="-20" y="-20" width="140" height="140" fill="white" />
            <circle cx="38" cy="55" r="4.5" fill="black" />
            <circle cx="62" cy="55" r="4.5" fill="black" />
            {/* Cute open smile */}
            <path d="M44 63 Q50 72 56 63 Z" fill="black" />
          </mask>
        </defs>
        
        {/* Bowtie */}
        <path d="M50 82 L38 95 A 2 2 0 0 0 42 98 L50 88 L58 98 A 2 2 0 0 0 62 95 Z" fill="currentColor" />
        <circle cx="50" cy="85" r="4" fill="#FDF160" />

        {/* Body */}
        <path d="M20 55 C20 35 35 25 50 25 C65 25 80 35 80 55 C80 75 60 85 50 88 C40 85 20 75 20 55 Z" fill="currentColor" mask="url(#face-mask)" />
        
        {/* Leaves */}
        <path d="M48 26 C43 18 35 15 32 18 C30 20 35 26 42 27 Z" fill="#8AC846" />
        <path d="M52 26 C57 12 70 8 75 12 C78 15 65 25 55 28 Z" fill="#8AC846" />
      </svg>
      {showText && (
        <span className="font-black tracking-tight" style={{ fontSize: '1.6em', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          berry
        </span>
      )}
    </div>
  );
}
