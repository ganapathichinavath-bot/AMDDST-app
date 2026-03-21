import React from 'react';
import { motion } from 'framer-motion';

function SearchResults({ results, type, onSelect }) {
  if (!results || results.length === 0) return null;

  const getIcon = () => {
    if (type === 'hotel') return '🏨';
    if (type === 'restaurant') return '🍽️';
    if (type === 'attraction') return '🎭';
    return '📍';
  };

  const getGradient = () => {
    if (type === 'hotel') return 'linear-gradient(135deg, #4facfe, #00f2fe)';
    if (type === 'restaurant') return 'linear-gradient(135deg, #f093fb, #f5576c)';
    if (type === 'attraction') return 'linear-gradient(135deg, #43e97b, #38f9d7)';
    return 'linear-gradient(135deg, #667eea, #764ba2)';
  };

  const getPriceColor = (price) => {
    if (price === 'cheap') return '#43e97b';
    if (price === 'moderate') return '#fee140';
    if (price === 'expensive') return '#f5576c';
    return '#a78bfa';
  };

  const handleSelect = (item) => {
  if (onSelect) {
    onSelect(item, type);
  }
};

  return (
    <motion.div
      style={{ marginTop: 12 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <p style={{
        fontSize: 11, fontWeight: 700,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 1, textTransform: 'uppercase',
        marginBottom: 10,
      }}>
        {getIcon()} Found {results.length} {type}s matching your request
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map((item, i) => (
          <motion.div
            key={i}
            onClick={() => handleSelect(item)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{
              background: 'rgba(255,255,255,0.12)',
              scale: 1.01,
              border: '1px solid rgba(102,126,234,0.4)',
            }}
            whileTap={{ scale: 0.99 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: getGradient(),
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18,
              }}>
                {getIcon()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
                      {item.name}
                    </p>
                    {item.pricerange && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: getPriceColor(item.pricerange),
                        background: `${getPriceColor(item.pricerange)}20`,
                        padding: '2px 8px', borderRadius: 10,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {item.pricerange}
                      </span>
                    )}
                    {item.stars && (
                      <span style={{ fontSize: 11, color: '#fee140' }}>
                        {'⭐'.repeat(item.stars)}
                      </span>
                    )}
                  </div>
                  {/* Select button */}
                  <motion.div
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(102,126,234,0.2)',
                      border: '1px solid rgba(102,126,234,0.4)',
                      borderRadius: 8, color: '#a78bfa',
                      fontSize: 11, fontWeight: 600,
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                    whileHover={{ background: 'rgba(102,126,234,0.4)', color: 'white' }}
                  >
                    Select →
                  </motion.div>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
                  📍 {item.address}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                  {item.area && (
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      🗺️ {item.area}
                    </span>
                  )}
                  {item.food && (
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      🍴 {item.food}
                    </span>
                  )}
                  {item.type && type === 'attraction' && (
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      🎪 {item.type}
                    </span>
                  )}
                  {item.parking === 'yes' && (
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      🅿️ Parking
                    </span>
                  )}
                  {item.internet === 'yes' && (
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      📶 WiFi
                    </span>
                  )}
                  {item.fee && (
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      💰 {item.fee}
                    </span>
                  )}
                </div>
                {item.phone && (
                  <p style={{ fontSize: 11, color: '#4facfe', marginTop: 5 }}>
                    📞 {item.phone}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default SearchResults;