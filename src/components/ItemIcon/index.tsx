import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import itemsData from '@site/src/data/items.json';

// In Phase 2 we assume items-with-pages.json exists or we gracefully handle its absence.
let itemsWithPages: string[] = [];
try {
  // Try importing dynamically or just assume empty for now.
  // We'll catch if it fails.
  itemsWithPages = require('@site/docs/items-with-pages.json');
} catch (e) {
  // ignore
}

export interface ItemIconProps {
  id: string;
  size?: number;
  className?: string;
}

export default function ItemIcon({ id, size = 32, className = '' }: ItemIconProps) {
  const [imgError, setImgError] = useState(false);

  // Look up item info
  const itemInfo = itemsData[id as keyof typeof itemsData];
  let texturePath = itemInfo?.texture;
  let displayName = itemInfo?.displayName || id;

  // Handle vanilla fallback
  if (id.startsWith('minecraft:') && !texturePath) {
    texturePath = `/img/vanilla/${id.replace('minecraft:', '')}.png`;
    displayName = id.replace('minecraft:', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  const src = useBaseUrl(texturePath || '/img/unknown.png');
  const hasPage = itemsWithPages.includes(id);

  const imgStyle = { width: size, height: size };

  const content = (
    <div 
      className={`${styles.iconWrapper} ${className}`} 
      style={imgStyle}
      title={displayName}
    >
      {!imgError && texturePath ? (
        <img 
          src={src} 
          alt={displayName} 
          className={`mc-pixelated ${styles.iconImg}`}
          onError={(e) => {
            console.warn(`Missing texture for ${id} at ${src}`);
            setImgError(true);
          }}
        />
      ) : (
        <div className={styles.missingTexture}>?</div>
      )}
    </div>
  );

  if (hasPage) {
    const pageUrl = `/items/${id.replace(':', '/')}`; // Just a guess for now
    return <Link to={pageUrl} className={styles.iconLink}>{content}</Link>;
  }

  return content;
}
