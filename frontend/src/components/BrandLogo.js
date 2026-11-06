import React from 'react';

export default function BrandLogo({ size = 34, showText = true, subtitle = null, className = '' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }} className={className}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          background: 'linear-gradient(135deg, #FDE047 0%, #F5C518 45%, #D97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(245, 197, 24, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <svg
          width={Math.round(size * 0.58)}
          height={Math.round(size * 0.58)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0A0D14"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" fill="#0A0D14" />
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <circle cx="12" cy="12" r="8" strokeOpacity="0.5" strokeDasharray="3 3" />
          <circle cx="12" cy="3" r="1.5" fill="#0A0D14" />
          <circle cx="12" cy="21" r="1.5" fill="#0A0D14" />
          <circle cx="3" cy="12" r="1.5" fill="#0A0D14" />
          <circle cx="21" cy="12" r="1.5" fill="#0A0D14" />
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                fontSize: Math.round(size * 0.52),
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans)',
              }}
            >
              AMDDST
            </span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#F5C518',
                display: 'inline-block',
                boxShadow: '0 0 8px rgba(245, 197, 24, 0.8)',
              }}
            />
          </div>
          {subtitle && (
            <span
              style={{
                fontSize: Math.max(9, Math.round(size * 0.24)),
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#F3E5AB',
                marginTop: 3,
                textTransform: 'uppercase',
                fontFamily: 'var(--font-sans)',
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
