import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useActiveVersion } from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';
import itemsData from '@site/src/data/items.json';
import { shortId, titleCase, resolveItemLink, resolveTagId, resolveTexture } from '@site/src/utils/itemFormatters';

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
  noLink?: boolean;
}

export default function ItemIcon({ id, size = 32, className = '', noLink = false }: ItemIconProps) {
  const [imgError, setImgError] = useState(false);
  const location = useLocation();
  const activeVersion = useActiveVersion('default') as { name: string; path: string } | undefined;

  const resolvedId = resolveTagId(id);
  const short = shortId(resolvedId);
  const itemInfo = (itemsData as Record<string, { displayName?: string; texture?: string; category?: string }>)[resolvedId];

  const { texturePath, spriteSlug } = resolveTexture(resolvedId, itemInfo);
  const useSprite = spriteSlug !== null;

  const displayName = itemInfo?.displayName ?? titleCase(short);
  const src = useBaseUrl(texturePath || '/img/unknown.png');

  const link = noLink ? undefined : resolveItemLink(resolvedId, activeVersion, location.pathname, itemsWithPages);

  let content: React.ReactElement;
  if (useSprite) {
    content = (
      <div
        className={`icon-32 ${spriteSlug} ${className}`}
        style={{ '--n': 32 / size, width: size, height: size } as React.CSSProperties}
        title={displayName}
      />
    );
  } else {
    content = (
      <div
        className={`${styles.iconWrapper} ${className}`}
        style={{ width: size, height: size }}
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
  }

  if (!link) return content;
  const externalProps = link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return <Link to={link.to} className={styles.iconLink} {...externalProps}>{content}</Link>;
}
