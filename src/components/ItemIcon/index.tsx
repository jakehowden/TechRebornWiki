import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useActiveVersion } from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';
import itemsData from '@site/src/data/items.json';
import tagsData from '@site/src/data/tags.json';
import blocksData from '@site/src/data/blocks.json';
import BlockRenderer from '../BlockRenderer';

type ItemsWithPages = Record<string, Record<string, string>>;
let itemsWithPages: ItemsWithPages = {};
try {
  itemsWithPages = require('@site/docs/items-with-pages.json');
} catch (e) {
  // ignore — generated at build time
}

export interface ItemIconProps {
  id: string;
  size?: number;
  className?: string;
  force3D?: boolean;
  disable3D?: boolean;
}

const BLOCK_3D_THRESHOLD = 32;

type BlockFaces = Record<string, { top: string; front: string; side: string }>;

export default function ItemIcon({ id, size = 32, className = '', force3D = false, disable3D = false }: ItemIconProps) {
  const [imgError, setImgError] = useState(false);
  const location = useLocation();

  const activeVersion = useActiveVersion('default') as { name: string; path: string } | undefined;

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

  // 3. Resolve version-aware page URL
  const versionMap = itemsWithPages[resolvedId];
  let pageUrl: string | undefined;
  if (versionMap) {
    const versionKey = activeVersion?.name ?? 'current';
    const route = versionMap[versionKey] ?? versionMap['1.20.1'] ?? versionMap['current'];
    if (route) {
      pageUrl = `${activeVersion?.path ?? ''}${route}`;
    }
  }
  const hasPage = Boolean(pageUrl) && pageUrl !== location.pathname;

  // 4. Decide on 3D vs 2D
  const blockFaces = (blocksData as BlockFaces)[resolvedId];
  const use3D = blockFaces && !disable3D && (force3D || size >= BLOCK_3D_THRESHOLD);

  // 5. Build content (either 3D or 2D)
  let content: React.ReactElement;
  if (use3D) {
    content = (
      <BlockRenderer
        top={blockFaces.top}
        front={blockFaces.front}
        side={blockFaces.side}
        displayName={displayName}
        size={size}
      />
    );
  } else {
    const imgStyle = { width: size, height: size };
    content = (
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
  }

  // 6. Wrap in Link if a page exists and it's not the current page
  if (hasPage) {
    return <Link to={pageUrl!} className={styles.iconLink}>{content}</Link>;
  }

  return content;
}
