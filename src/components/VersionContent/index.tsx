import React from 'react';

export interface VersionContentProps {
  version: string;
  children: React.ReactNode;
}

export default function VersionContent({ version, children }: VersionContentProps) {
  if (version !== '1.20.1') {
    return null;
  }
  return <div className="version-content">{children}</div>;
}
