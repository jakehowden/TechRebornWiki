import React from 'react';
import styles from './styles.module.css';

export interface MachineStatsProps {
  power?: number;
  buffer?: number;
  tier?: string;
  inputSlots?: number;
  outputSlots?: number;
}

export default function MachineStats({ power, buffer, tier, inputSlots, outputSlots }: MachineStatsProps) {
  return (
    <div className={styles.container}>
      {power !== undefined && (
        <div className={styles.statBox}>
          <div className={styles.label}>Power</div>
          <div className={styles.value}>⚡ {power} E/t</div>
        </div>
      )}
      {buffer !== undefined && (
        <div className={styles.statBox}>
          <div className={styles.label}>Buffer</div>
          <div className={styles.value}>🔋 {buffer} E</div>
        </div>
      )}
      {tier && (
        <div className={styles.statBox}>
          <div className={styles.label}>Tier</div>
          <div className={styles.value}>{tier}</div>
        </div>
      )}
      {inputSlots !== undefined && (
        <div className={styles.statBox}>
          <div className={styles.label}>Inputs</div>
          <div className={styles.value}>{inputSlots}</div>
        </div>
      )}
      {outputSlots !== undefined && (
        <div className={styles.statBox}>
          <div className={styles.label}>Outputs</div>
          <div className={styles.value}>{outputSlots}</div>
        </div>
      )}
    </div>
  );
}
