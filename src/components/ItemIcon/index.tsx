import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useActiveVersion } from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';
import itemsData from '@site/src/data/items.json';
import tagsData from '@site/src/data/tags.json';

type ItemsWithPages = Record<string, Record<string, string>>;
let itemsWithPages: ItemsWithPages = {};
try {
  itemsWithPages = require('@site/docs/items-with-pages.json');
} catch (e) {
  // generated at build time
}

export interface ItemIconProps {
  id: string;
  size?: number;
  className?: string;
}

function shortId(id: string): string {
  const idx = id.indexOf(':');
  return idx === -1 ? id : id.slice(idx + 1);
}

function titleCase(slug: string): string {
  return slug
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
    .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase());
}

export default function ItemIcon({ id, size = 32, className = '' }: ItemIconProps) {
  const [imgError, setImgError] = useState(false);
  const location = useLocation();
  const activeVersion = useActiveVersion('default') as { name: string; path: string } | undefined;

  // 1. Resolve tags (e.g. "c:diamond_dusts" → "techreborn:diamond_dust")
  const resolvedId = (id in tagsData) ? (tagsData as Record<string, string>)[id] : id;

  // 2. Pick a texture path
  const itemInfo = (itemsData as Record<string, { displayName?: string; texture?: string; category?: string }>)[resolvedId];
  let texturePath: string | undefined;
  let displayName = itemInfo?.displayName;

  if (resolvedId.startsWith('techreborn:')) {
    texturePath = `/img/techreborn/${shortId(resolvedId)}.png`;
    if (!displayName) displayName = titleCase(shortId(resolvedId));
  } else if (resolvedId.startsWith('minecraft:')) {
    texturePath = `/img/vanilla/${shortId(resolvedId)}.png`;
    if (!displayName) displayName = titleCase(shortId(resolvedId));
  } else {
    texturePath = itemInfo?.texture;
    if (!displayName) displayName = titleCase(shortId(resolvedId));
  }

  const src = useBaseUrl(texturePath || '/img/unknown.png');

  // 3. Resolve version-aware page URL
  const versionMap = itemsWithPages[resolvedId];
  let pageUrl: string | undefined;
  if (versionMap) {
    const versionKey = activeVersion?.name ?? 'current';
    const route = versionMap[versionKey] ?? versionMap['1.20.1'] ?? versionMap['current'];
    if (route) pageUrl = `${activeVersion?.path ?? ''}${route}`;
  }
  const hasPage = Boolean(pageUrl) && pageUrl !== location.pathname;

  const wrapperStyle = { width: size, height: size };

  const content = (
    <div
      className={`${styles.iconWrapper} ${className}`}
      style={wrapperStyle}
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
          {(displayName || '??').substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );

  if (hasPage) {
    return <Link to={pageUrl!} className={styles.iconLink}>{content}</Link>;
  }
  return content;
}
