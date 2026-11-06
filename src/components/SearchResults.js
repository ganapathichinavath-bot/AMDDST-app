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
      return { icon: LuBed, label: 'Accommodations', color: '#6366F1' };
    }
    if (type === 'restaurant') {
      return { icon: LuUtensils, label: 'Dining', color: '#EC4899' };
    }
    if (type === 'attraction') {
      return { icon: LuLandmark, label: 'Attractions', color: '#10B981' };
    }
    if (type === 'taxi') {
      return { icon: LuCar, label: 'Transit Options', color: '#F59E0B' };
    }
    return { icon: LuMapPin, label: 'Locations', color: '#6366F1' };
  };

  const meta = getDomainMeta();
  const DomainIcon = meta.icon;

  const getPriceBadge = (price) => {
    const p = (price || '').toLowerCase();
    if (p === 'cheap') {
      return { text: 'Economy', color: '#34D399', bg: 'rgba(16, 185, 129, 0.14)' };
    }
    if (p === 'moderate') {
      return { text: 'Standard', color: '#FBBF24', bg: 'rgba(245, 158, 11, 0.14)' };
    }
    if (p === 'expensive') {
      return { text: 'Premium', color: '#F87171', bg: 'rgba(239, 68, 68, 0.14)' };
    }
    return { text: price, color: '#A5B4FC', bg: 'rgba(99, 102, 241, 0.14)' };
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
          gap: 7,
          fontSize: 11,
          fontWeight: 700,
          color: '#94A3B8',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        <DomainIcon size={14} color={meta.color} />
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
                background: 'rgba(15, 23, 42, 0.75)',
                borderRadius: 12,
                padding: '14px 16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              whileHover={{
                background: 'rgba(27, 36, 59, 0.85)',
                borderColor: 'rgba(99, 102, 241, 0.35)',
                y: -1,
              }}
              whileTap={{ scale: 0.99 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                {/* Domain Emblem */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: `${meta.color}15`,
                    border: `1px solid ${meta.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: meta.color,
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#FBBF24' }}>
                          {Array.from({ length: item.stars }).map((_, s) => (
                            <LuStar key={s} size={11} fill="#FBBF24" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(79, 70, 229, 0.15)',
                        border: '1px solid rgba(79, 70, 229, 0.3)',
                        borderRadius: 6,
                        color: '#A5B4FC',
                        fontSize: 11,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
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
                        marginTop: 4,
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
                      <span style={{ fontSize: 11, color: '#94A3B8', textTransform: 'capitalize' }}>
                        Area: <strong>{item.area}</strong>
                      </span>
                    )}

                    {item.food && (
                      <span style={{ fontSize: 11, color: '#94A3B8', textTransform: 'capitalize' }}>
                        Cuisine: <strong>{item.food}</strong>
                      </span>
                    )}

                    {item.type && type === 'attraction' && (
                      <span style={{ fontSize: 11, color: '#94A3B8', textTransform: 'capitalize' }}>
                        Category: <strong>{item.type}</strong>
                      </span>
                    )}

                    {item.parking === 'yes' && (
                      <span style={{ fontSize: 11, color: '#34D399', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <LuCircleParking size={13} /> Parking Included
                      </span>
                    )}

                    {item.internet === 'yes' && (
                      <span style={{ fontSize: 11, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <LuWifi size={13} /> High-Speed WiFi
                      </span>
                    )}

                    {item.fee && (
                      <span style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <LuTag size={12} /> Admission: {item.fee}
                      </span>
                    )}

                    {type === 'taxi' && (
                      <span style={{ fontSize: 11, color: '#FBBF24' }}>
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
                        color: '#38BDF8',
                        marginTop: 6,
                      }}
                    >
                      <LuPhone size={12} />
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
