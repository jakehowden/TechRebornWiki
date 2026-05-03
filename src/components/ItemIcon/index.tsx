import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import itemsData from '@site/src/data/items.json';
import tagsData from '@site/src/data/tags.json';
import blocksData from '@site/src/data/blocks.json';
import BlockRenderer from '../BlockRenderer';

let itemsWithPages: string[] = [];
try {
  itemsWithPages = require('@site/docs/items-with-pages.json');
} catch (e) {
  // ignore
}

export interface ItemIconProps {
  id: string;
  size?: number;
  className?: string;
}

const BLOCK_3D_THRESHOLD = 64;

type BlockFaces = Record<string, { top: string; front: string; side: string }>;

export default function ItemIcon({ id, size = 32, className = '' }: ItemIconProps) {
  const [imgError, setImgError] = useState(false);

  // 1. Resolve tags (e.g. "c:diamond_dusts" → "techreborn:diamond_dust")
  const resolvedId = (id in tagsData) ? tagsData[id as keyof typeof tagsData] : id;

  // 2. Compute flat-icon data unconditionally — hooks must not follow early returns
  const itemInfo = itemsData[resolvedId as keyof typeof itemsData];
  let texturePath = itemInfo?.texture;
  let displayName = itemInfo?.displayName || resolvedId;

  if (resolvedId.startsWith('minecraft:') && !texturePath) {
    texturePath = `/img/vanilla/${resolvedId.replace('minecraft:', '')}.png`;
    displayName = resolvedId.replace('minecraft:', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  const src = useBaseUrl(texturePath || '/img/unknown.png');
  const hasPage = itemsWithPages.includes(resolvedId);

  // 3. For large icons (hero displays), render 3D block if face data exists
  const blockFaces = (blocksData as BlockFaces)[resolvedId];
  if (blockFaces && size >= BLOCK_3D_THRESHOLD) {
    return (
      <BlockRenderer
        top={blockFaces.top}
        front={blockFaces.front}
        side={blockFaces.side}
        displayName={displayName}
        size={size}
      />
    );
  }

  // 4. Flat 2D icon rendering
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
          onError={() => {
            console.warn(`Missing texture for ${resolvedId} at ${src}`);
            setImgError(true);
          }}
        />
      ) : (
        <div className={styles.missingTexture} title={displayName}>
          {displayName.substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );

  if (hasPage) {
    const pageUrl = `/items/${resolvedId.replace(':', '/')}`;
    return <Link to={pageUrl} className={styles.iconLink}>{content}</Link>;
  }

  return content;
}
