import React from 'react';
import { motion } from 'framer-motion';

function SkeletonBlock({ width, height, borderRadius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'rgba(255, 255, 255, 0.04)',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(245, 197, 24, 0.06) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <SkeletonBlock width={34} height={34} borderRadius={10} style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonBlock width={280} height={42} borderRadius={14} />
          <SkeletonBlock width={80} height={10} borderRadius={4} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <SkeletonBlock width={220} height={42} borderRadius={14} />
          <SkeletonBlock width={60} height={10} borderRadius={4} />
        </div>
        <SkeletonBlock width={34} height={34} borderRadius={10} style={{ flexShrink: 0 }} />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <SkeletonBlock width={34} height={34} borderRadius={10} style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonBlock width={340} height={56} borderRadius={14} />
          <SkeletonBlock width={80} height={10} borderRadius={4} />
        </div>
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 4px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 4px' }}>
          <SkeletonBlock width={20} height={20} borderRadius={6} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <SkeletonBlock width="75%" height={12} borderRadius={4} />
            <SkeletonBlock width="50%" height={10} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '36px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <SkeletonBlock width={76} height={76} borderRadius="50%" style={{ margin: '0 auto 14px' }} />
        <SkeletonBlock width={160} height={18} borderRadius={6} style={{ margin: '0 auto 8px' }} />
        <SkeletonBlock width={120} height={12} borderRadius={4} style={{ margin: '0 auto' }} />
      </div>
      <div
        style={{
          background: 'rgba(20, 26, 38, 0.65)',
          backdropFilter: 'blur(24px)',
          borderRadius: 18,
          padding: 24,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ marginBottom: 16 }}>
            <SkeletonBlock width={70} height={10} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonBlock width="100%" height={40} borderRadius={8} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonBlock;