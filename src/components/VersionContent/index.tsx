import React from 'react';

export interface VersionContentProps {
  version: string;
  children: React.ReactNode;
}

export default function VersionContent({ version, children }: VersionContentProps) {
  // Phase 2 implementation: only render 1.20.1 content.
  // Phase 7+ will implement full Docusaurus Tabs integration.
  if (version !== '1.20.1') {
    return null;
  }
  return <div className="version-content">{children}</div>;
}
