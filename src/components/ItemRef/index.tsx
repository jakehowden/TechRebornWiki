import React from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { useActiveVersion } from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';
import ItemIcon from '@site/src/components/ItemIcon';
import itemsData from '@site/src/data/items.json';
import { shortId, titleCase, resolveItemLink, resolveTagId } from '@site/src/utils/itemFormatters';

type ItemsWithPages = Record<string, Record<string, string>>;
let itemsWithPages: ItemsWithPages = {};
try {
  itemsWithPages = require('@site/docs/items-with-pages.json');
} catch (e) {
  // generated at build time
}

export interface ItemRefProps {
  id: string;
  size?: number;
  name?: string;
  showName?: boolean;
  bold?: boolean;
}

export default function ItemRef({ id, size = 20, name, showName = true, bold = true }: ItemRefProps) {
  const location = useLocation();
  const activeVersion = useActiveVersion('default') as { name: string; path: string } | undefined;

  const resolvedId = resolveTagId(id);
  const short = shortId(resolvedId);
  const itemInfo = (itemsData as Record<string, { displayName?: string }>)[resolvedId];
  const displayName = name ?? itemInfo?.displayName ?? titleCase(short);

  const link = resolveItemLink(resolvedId, activeVersion, location.pathname, itemsWithPages);

  const nameEl = showName
    ? (bold ? <strong>{displayName}</strong> : <span>{displayName}</span>)
    : null;

  const inner = (
    <span className={styles.ref}>
      <ItemIcon id={id} size={size} noLink />
      {nameEl}
    </span>
  );

  if (!link) return inner;
  const externalProps = link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <Link to={link.to} className={styles.refLink} {...externalProps}>
      {inner}
    </Link>
  );
}
