'use client';

import React, { useEffect, useRef } from 'react';

interface Node { x: number; y: number; label: string; critical?: boolean; }

const NODES: Node[] = [
  { x: 50,  y: 30,  label: 'HGR Goma',    critical: true },
  { x: 200, y: 80,  label: 'CS Masisi',   critical: true },
  { x: 350, y: 25,  label: 'Clinique A' },
  { x: 480, y: 90,  label: 'CBCA Goma' },
  { x: 130, y: 160, label: 'Hôpital B' },
  { x: 320, y: 150, label: 'CS Walikale' },
];

const TRANSFERS = [
  { from: 2, to: 0 },
  { from: 3, to: 1 },
  { from: 4, to: 0 },
];

export default function HeroSVG() {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    pathRefs.current.forEach((p, i) => {
      if (!p) return;
      const len = p.getTotalLength();
      p.style.strokeDasharray  = String(len);
      p.style.strokeDashoffset = String(len);
      p.style.animation = `drawPath 1.5s ease-out ${0.3 + i * 0.4}s forwards`;
    });
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 580 }}>
      <style>{`
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
        @keyframes fadeDot {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-svg-path { animation: none !important; stroke-dashoffset: 0 !important; }
        }
      `}</style>
      <svg viewBox="0 0 540 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {TRANSFERS.map((t, i) => {
          const from = NODES[t.from];
          const to   = NODES[t.to];
          const mx   = (from.x + to.x) / 2;
          const my   = Math.min(from.y, to.y) - 40;
          const d    = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
          return (
            <path
              key={i}
              ref={(el) => { pathRefs.current[i] = el; }}
              className="hero-svg-path"
              d={d}
              stroke="#059669"
              strokeWidth={1.5}
              strokeOpacity={0.7}
              strokeDasharray="4 3"
            />
          );
        })}

        {NODES.map((node, i) => (
          <g key={i} style={{ animation: `fadeDot 0.4s ease-out ${0.1 + i * 0.15}s both` }}>
            <circle
              cx={node.x} cy={node.y} r={node.critical ? 9 : 7}
              fill={node.critical ? '#EF4444' : '#059669'}
              opacity={0.9}
              style={node.critical ? { animation: 'pulse 2s ease-in-out infinite' } : {}}
            />
            <circle cx={node.x} cy={node.y} r={node.critical ? 16 : 13}
              fill={node.critical ? 'rgba(239,68,68,0.15)' : 'rgba(5,150,105,0.12)'}
            />
            <text x={node.x} y={node.y + 26}
              fill="rgba(255,255,255,0.65)"
              fontSize={9}
              fontFamily="var(--mk-font-mono)"
              textAnchor="middle"
            >
              {node.label}
            </text>
          </g>
        ))}

        <g transform="translate(400, 160)">
          <circle cx={8} cy={8} r={5} fill="#EF4444" opacity={0.9} />
          <text x={18} y={12} fill="rgba(255,255,255,0.5)" fontSize={9} fontFamily="var(--mk-font-mono)">Stock critique</text>
          <circle cx={8} cy={26} r={5} fill="#059669" opacity={0.9} />
          <text x={18} y={30} fill="rgba(255,255,255,0.5)" fontSize={9} fontFamily="var(--mk-font-mono)">Surplus disponible</text>
        </g>
      </svg>
    </div>
  );
}
