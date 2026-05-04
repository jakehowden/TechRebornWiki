import React, { useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import itemsData from '@site/src/data/items.json';
import { shortId, titleCase } from '@site/src/utils/itemFormatters';

export interface ItemHeaderProps {
  id?: string;
  file?: string;
  alt?: string;
  size?: number;
  float?: 'left' | 'right' | 'none';
}

export default function ItemHeader({ id, file, alt, size = 200, float = 'right' }: ItemHeaderProps) {
  const [imgError, setImgError] = useState(false);

  let texturePath: string | undefined;
  let displayName: string;

  if (id) {
    const short = shortId(id);
    const itemInfo = (itemsData as Record<string, { displayName?: string; texture?: string }>)[id];
    displayName = alt ?? itemInfo?.displayName ?? titleCase(short);
    if (id.startsWith('techreborn:')) texturePath = `/img/techreborn/${short}.png`;
    else if (id.startsWith('minecraft:')) texturePath = `/img/vanilla/${short}.png`;
    else texturePath = itemInfo?.texture;
  } else if (file) {
    texturePath = `/img/techreborn/${file}.png`;
    displayName = alt ?? titleCase(file);
  } else {
    displayName = alt ?? 'Tech Reborn';
  }

  const src = useBaseUrl(texturePath || '/img/unknown.png');
  const fallbackSrc = useBaseUrl('/img/unknown.png');

  const floatStyle: React.CSSProperties = float === 'none'
    ? { float: 'none', display: 'block', margin: '0 auto 1rem' }
    : { float };

  return (
    <img
      src={imgError || !texturePath ? fallbackSrc : src}
      alt={displayName}
      width={size}
      className={`mc-pixelated ${styles.header}`}
      style={floatStyle}
      onError={() => {
        console.warn(`ItemHeader: missing texture for ${id ?? file} at ${src}`);
        setImgError(true);
      }}
    />
  );
}
