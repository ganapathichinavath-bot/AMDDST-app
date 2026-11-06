import React from 'react';
import { motion } from 'framer-motion';
import {
  LuBed,
  LuUtensils,
  LuLandmark,
  LuCar,
  LuMapPin,
  LuPhone,
  LuStar,
  LuWifi,
  LuCircleParking,
  LuArrowRight,
  LuTag
} from 'react-icons/lu';

function SearchResults({ results, type, onSelect }) {
  if (!results || results.length === 0) return null;

  const getDomainMeta = () => {
    if (type === 'hotel') {
      return { icon: LuBed, label: 'Accommodations', color: '#F5C518', badge: 'Hotel' };
    }
    if (type === 'restaurant') {
      return { icon: LuUtensils, label: 'Dining Establishments', color: '#F5C518', badge: 'Restaurant' };
    }
    if (type === 'attraction') {
      return { icon: LuLandmark, label: 'Attractions & Venues', color: '#F5C518', badge: 'Attraction' };
    }
    if (type === 'taxi') {
      return { icon: LuCar, label: 'Transit & Dispatches', color: '#F5C518', badge: 'Transit' };
    }
    return { icon: LuMapPin, label: 'Entities', color: '#F5C518', badge: 'Location' };
  };

  const meta = getDomainMeta();
  const DomainIcon = meta.icon;

  const getPriceBadge = (price) => {
    const p = (price || '').toLowerCase();
    if (p === 'cheap') {
      return { text: 'Economy', color: '#34D399', bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.3)' };
    }
    if (p === 'moderate') {
      return { text: 'Standard', color: '#F5C518', bg: 'rgba(245, 197, 24, 0.14)', border: 'rgba(245, 197, 24, 0.3)' };
    }
    if (p === 'expensive') {
      return { text: 'Premium', color: '#F87171', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.3)' };
    }
    return { text: price, color: '#F3E5AB', bg: 'rgba(243, 229, 171, 0.14)', border: 'rgba(243, 229, 171, 0.3)' };
  };

  return (
    <motion.div
      style={{ marginTop: 14 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          fontWeight: 700,
          color: '#F3E5AB',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        <DomainIcon size={14} color="#F5C518" />
        <span>
          Retrieved {results.length} verified {meta.label.toLowerCase()}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {results.map((item, i) => {
          const priceBadge = item.pricerange ? getPriceBadge(item.pricerange) : null;

          return (
            <motion.div
              key={i}
              onClick={() => onSelect && onSelect(item, type)}
              style={{
                background: 'rgba(20, 26, 38, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: 14,
                padding: '16px 18px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              whileHover={{
                background: 'rgba(28, 36, 52, 0.85)',
                borderColor: 'rgba(245, 197, 24, 0.45)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(245, 197, 24, 0.12)',
                y: -1,
              }}
              whileTap={{ scale: 0.99 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                {/* Domain Emblem */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: 'rgba(245, 197, 24, 0.12)',
                    border: '1px solid rgba(245, 197, 24, 0.28)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F5C518',
                  }}
                >
                  <DomainIcon size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title & Badges */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
                        {item.name}
                      </span>

                      {priceBadge && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: priceBadge.color,
                            background: priceBadge.bg,
                            border: `1px solid ${priceBadge.border}`,
                            padding: '2px 8px',
                            borderRadius: 6,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {priceBadge.text}
                        </span>
                      )}

                      {item.stars && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#F5C518' }}>
                          {Array.from({ length: item.stars }).map((_, s) => (
                            <LuStar key={s} size={11} fill="#F5C518" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        padding: '5px 12px',
                        background: 'rgba(245, 197, 24, 0.12)',
                        border: '1px solid rgba(245, 197, 24, 0.35)',
                        borderRadius: 8,
                        color: '#F5C518',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>Select</span>
                      <LuArrowRight size={12} />
                    </div>
                  </div>

                  {/* Address */}
                  {item.address && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 12,
                        color: '#94A3B8',
                        marginTop: 5,
                      }}
                    >
                      <LuMapPin size={13} style={{ flexShrink: 0, color: '#64748B' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.address}
                      </span>
                    </div>
                  )}

                  {/* Meta Amenities */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {item.area && (
                      <span style={{ fontSize: 11, color: '#CBD5E1', textTransform: 'capitalize' }}>
                        Area: <strong style={{ color: '#F8FAFC' }}>{item.area}</strong>
                      </span>
                    )}

                    {item.food && (
                      <span style={{ fontSize: 11, color: '#CBD5E1', textTransform: 'capitalize' }}>
                        Cuisine: <strong style={{ color: '#F8FAFC' }}>{item.food}</strong>
                      </span>
                    )}

                    {item.type && type === 'attraction' && (
                      <span style={{ fontSize: 11, color: '#CBD5E1', textTransform: 'capitalize' }}>
                        Category: <strong style={{ color: '#F8FAFC' }}>{item.type}</strong>
                      </span>
                    )}

                    {item.parking === 'yes' && (
                      <span style={{ fontSize: 11, color: '#34D399', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <LuCircleParking size={13} /> Parking Included
                      </span>
                    )}

                    {item.internet === 'yes' && (
                      <span style={{ fontSize: 11, color: '#F3E5AB', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <LuWifi size={13} /> Complimentary WiFi
                      </span>
                    )}

                    {item.fee && (
                      <span style={{ fontSize: 11, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <LuTag size={12} /> Admission: {item.fee}
                      </span>
                    )}

                    {type === 'taxi' && (
                      <span style={{ fontSize: 11, color: '#F5C518' }}>
                        Dispatch: 24/7 On-Demand
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  {item.phone && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11,
                        color: '#F3E5AB',
                        marginTop: 7,
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      <LuPhone size={12} color="#F5C518" />
                      <span>{item.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default SearchResults;