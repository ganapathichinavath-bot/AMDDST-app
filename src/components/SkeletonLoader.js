import React from 'react';
import { motion } from 'framer-motion';

function SkeletonBlock({ width, height, borderRadius = 8, style = {} }) {
  return (
    <motion.div
      style={{
        width, height, borderRadius,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <motion.div
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}

export function ChatSkeleton() {
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Assistant message skeleton */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <SkeletonBlock width={34} height={34} borderRadius={10} style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonBlock width={280} height={44} borderRadius={18} />
          <SkeletonBlock width={80} height={10} borderRadius={4} />
        </div>
      </div>

      {/* User message skeleton */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <SkeletonBlock width={200} height={44} borderRadius={18} />
          <SkeletonBlock width={60} height={10} borderRadius={4} />
        </div>
        <SkeletonBlock width={34} height={34} borderRadius={10} style={{ flexShrink: 0 }} />
      </div>

      {/* Assistant message skeleton */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <SkeletonBlock width={34} height={34} borderRadius={10} style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonBlock width={320} height={60} borderRadius={18} />
          <SkeletonBlock width={80} height={10} borderRadius={4} />
        </div>
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 4px' }}>
          <SkeletonBlock width={24} height={24} borderRadius={6} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <SkeletonBlock width="80%" height={12} borderRadius={4} />
            <SkeletonBlock width="60%" height={10} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <SkeletonBlock width={100} height={100} borderRadius="50%" style={{ margin: '0 auto 15px' }} />
        <SkeletonBlock width={200} height={20} borderRadius={8} style={{ margin: '0 auto 8px' }} />
        <SkeletonBlock width={150} height={14} borderRadius={6} style={{ margin: '0 auto' }} />
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 20, padding: 30,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ marginBottom: 20 }}>
            <SkeletonBlock width={80} height={10} borderRadius={4} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="100%" height={46} borderRadius={10} />
          </div>
        ))}
        <SkeletonBlock width="100%" height={46} borderRadius={12} />
      </div>
    </div>
  );
}

export default SkeletonBlock;