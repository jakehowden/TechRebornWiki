import React, { useState } from 'react';
import ItemIcon from '../ItemIcon';
import styles from './styles.module.css';

export interface MultiblockShapeProps {
  data?: {
    layers: string[][][];
  };
}

export default function MultiblockShape({ data }: MultiblockShapeProps) {
  const [layerIdx, setLayerIdx] = useState(0);

  if (!data || !data.layers || data.layers.length === 0) {
    return <div>No multiblock data provided.</div>;
  }

  const currentLayer = data.layers[layerIdx];

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <label>
          Layer {layerIdx + 1} of {data.layers.length}:
          <input 
            type="range" 
            min={0} 
            max={data.layers.length - 1} 
            value={layerIdx}
            onChange={e => setLayerIdx(Number(e.target.value))}
            className={styles.slider}
          />
        </label>
      </div>
      <div className={styles.grid}>
        {currentLayer.map((row, rIdx) => (
          <div key={rIdx} className={styles.row}>
            {row.map((cell, cIdx) => (
              <div key={cIdx} className={styles.cell}>
                {cell !== 'air' && cell ? <ItemIcon id={cell} size={32} /> : null}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.note}>* Top-down view (3D view planned for future)</div>
    </div>
  );
}
