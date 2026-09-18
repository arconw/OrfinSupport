import { useId } from 'react';
import type { Product } from '../catalog';

export function ProductArt({ product, compact = false }: { product: Product; compact?: boolean }) {
  const id = useId().replace(/:/g, '');
  const pro = product.art === 'pro';
  return (
    <svg
      className={`product-art art-${product.art}`}
      viewBox="0 0 480 340"
      role="img"
      aria-label={`${product.name} illustration`}
    >
      <defs>
        <linearGradient id={`${id}-body`} x2="0.6" y2="1">
          <stop stopColor="#c4ccd3" />
          <stop offset="1" stopColor="#8f9ca8" />
        </linearGradient>
        <linearGradient id={`${id}-screen`} x2="1" y2="1">
          <stop stopColor={pro ? '#2d4562' : '#5d91bc'} />
          <stop offset="1" stopColor={pro ? '#72919e' : '#d1e9ed'} />
        </linearGradient>
        <linearGradient id={`${id}-ribbon`} x2="0.8" y2="1">
          <stop stopColor={pro ? '#d8bcad' : '#e9f7ee'} />
          <stop offset="1" stopColor={pro ? '#a75e62' : '#468dab'} />
        </linearGradient>
      </defs>
      <ellipse cx="240" cy="298" rx={compact ? 112 : 145} ry="14" fill="#203750" opacity=".09" />
      {(product.art === 'compact' || pro) && (
        <g transform={pro ? 'translate(-12 -6) scale(1.05)' : 'translate(15 10) scale(.94)'}>
          <path d="M218 224h44l9 59h-62z" fill={`url(#${id}-body)`} />
          <path d="M169 285q69-13 142 0l8 10H160z" fill="#acb7c1" />
          <rect x="50" y="37" width="380" height="215" rx="9" fill="#2e3b48" />
          <rect x="57" y="44" width="366" height="199" rx="3" fill={`url(#${id}-screen)`} />
          <path
            d="M57 214C131 42 195 222 259 132S362 39 423 65v178H57z"
            fill={`url(#${id}-ribbon)`}
          />
          <path
            d="M57 217c83-37 92 55 170-3s98-99 196-104v133H57z"
            fill={pro ? '#ddc5b3' : '#bce2de'}
            opacity=".6"
          />
          <circle cx="240" cy="247" r="1.5" fill="#e4ebef" />
        </g>
      )}
      {product.art === 'light' && (
        <g>
          <ellipse cx="223" cy="285" rx="75" ry="12" fill="#879b99" />
          <path d="M220 281V175l89-81" stroke="#a8b9b5" strokeWidth="13" fill="none" />
          <circle cx="220" cy="174" r="12" fill="#839992" />
          <path d="m265 77 92 25-5 22-94-25z" fill="#d3dcd5" />
          <path d="m262 100 90 24-27 142-157-37z" fill="#ffefb0" opacity=".25" />
          <path d="m265 98 86 23" stroke="#fff8da" strokeWidth="5" />
        </g>
      )}
      {product.art === 'bag' && (
        <g>
          <path d="M198 66q-8-31 34-32t39 32" fill="none" stroke="#687885" strokeWidth="12" />
          <path d="M155 80q79-51 166 0l20 180q-91 42-198-1z" fill="#9da9b0" />
          <path d="m163 88-4 153q78 29 166-1l-12-152" fill="#b8c0c3" />
          <rect x="170" y="157" width="139" height="91" rx="17" fill="#8697a1" />
          <path d="M187 174h105" stroke="#d1d8dc" strokeWidth="3" />
          <rect x="220" y="110" width="36" height="14" rx="2" fill="#e5e9e5" />
        </g>
      )}
    </svg>
  );
}
