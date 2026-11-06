import React from 'react';

export default function BrandLogo({ size = 34, showText = true, subtitle = null, className = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }} className={className}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2563EB 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <svg
          width={Math.round(size * 0.58)}
          height={Math.round(size * 0.58)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Neural tracking / multi-domain node icon */}
          <circle cx="12" cy="12" r="3" fill="white" />
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <circle cx="12" cy="12" r="8" strokeOpacity="0.4" strokeDasharray="3 3" />
          <circle cx="12" cy="3" r="1.5" fill="white" />
          <circle cx="12" cy="21" r="1.5" fill="white" />
          <circle cx="3" cy="12" r="1.5" fill="white" />
          <circle cx="21" cy="12" r="1.5" fill="white" />
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontSize: Math.round(size * 0.52),
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
            }}
          >
            AMDDST
          </span>
          {subtitle && (
            <span
              style={{
                fontSize: Math.max(9, Math.round(size * 0.24)),
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#94A3B8',
                marginTop: 3,
                textTransform: 'uppercase',
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
