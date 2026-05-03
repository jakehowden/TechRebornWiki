import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

export interface BlockRendererProps {
  top: string;
  front: string;
  side: string;
  displayName?: string;
  size?: number;
}

export default function BlockRenderer({ top, front, side, displayName = '', size = 96 }: BlockRendererProps) {
  const topSrc = useBaseUrl(top);
  const frontSrc = useBaseUrl(front);
  const sideSrc = useBaseUrl(side);

  // Each cube face is sized so the full isometric projection fits within `size x size`.
  // For a cube with face size F, the isometric bounding box is ≈ F*√2 wide × F*√(2/3)*2 tall.
  // Using F = size * 0.6 keeps the rendered cube comfortably within the container.
  const faceSize = Math.round(size * 0.75);
  const half = faceSize / 2;

  // Perspective large enough to appear near-orthographic (isometric-like)
  const perspective = size * 8;

  const sceneStyle: React.CSSProperties = {
    width: size,
    height: size,
    perspective,
  };

  const cubeStyle: React.CSSProperties = {
    width: faceSize,
    height: faceSize,
    // Center the cube within the scene
    margin: `${(size - faceSize) / 2}px auto 0`,
  };

  const faceBase: React.CSSProperties = {
    width: faceSize,
    height: faceSize,
    top: 0,
    left: 0,
  };

  const topFaceStyle: React.CSSProperties = {
    ...faceBase,
    backgroundImage: `url(${topSrc})`,
    transform: `rotateX(90deg) translateZ(${-half}px)`,
    transformOrigin: 'bottom center',
    filter: 'brightness(1.0)',
  };

  const frontFaceStyle: React.CSSProperties = {
    ...faceBase,
    backgroundImage: `url(${frontSrc})`,
    transform: `translateZ(${half}px)`,
    filter: 'brightness(0.85)',
  };

  const sideFaceStyle: React.CSSProperties = {
    ...faceBase,
    backgroundImage: `url(${sideSrc})`,
    transform: `rotateY(90deg) translateZ(${half}px)`,
    transformOrigin: 'left center',
    filter: 'brightness(0.65)',
  };

  return (
    <div className={styles.scene} style={sceneStyle} title={displayName}>
      <div className={styles.cube} style={cubeStyle}>
        <div className={`${styles.face} ${styles.faceTop}`} style={topFaceStyle} />
        <div className={`${styles.face} ${styles.faceFront}`} style={frontFaceStyle} />
        <div className={`${styles.face} ${styles.faceRight}`} style={sideFaceStyle} />
      </div>
    </div>
  );
}
