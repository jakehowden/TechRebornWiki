import React from 'react';
import ItemIcon from '../ItemIcon';
import styles from './styles.module.css';

interface IngredientObj {
  id?: string;
  tag?: string;
  count?: number;
}
type IngredientType = string | IngredientObj;

export interface MachineRecipeProps {
  machine: string;
  inputs: IngredientType[];
  outputs: IngredientType[];
  power?: number;
  time?: number;
  heat?: number | null;
}

export default function MachineRecipe({ machine, inputs, outputs, power, time, heat }: MachineRecipeProps) {
  // Try to normalize machine ID
  const machineId = machine.includes(':') ? machine : `techreborn:${machine}`;

  return (
    <div className={styles.container}>
      <div className={styles.recipeBody}>
        {/* Machine Icon */}
        <div className={styles.machineCol}>
          <ItemIcon id={machineId} size={48} />
        </div>

        {/* Inputs */}
        <div className={styles.col}>
          {inputs.map((item, idx) => {
            let itemId: string | undefined;
            let count = 1;
            if (typeof item === 'string') itemId = item;
            else {
              if (item?.id) itemId = item.id;
              else if (item?.tag) itemId = item.tag;
              if (item?.count) count = item.count;
            }

            return (
              <div key={idx} className={`mc-slot ${styles.slot}`}>
                {itemId && <ItemIcon id={itemId} size={32} />}
                {count > 1 && <span className={styles.countBadge}>{count}</span>}
              </div>
            );
          })}
        </div>

        <div className="mc-arrow"></div>

        {/* Outputs */}
        <div className={styles.col}>
          {outputs.map((item, idx) => {
            let itemId: string | undefined;
            let count = 1;
            if (typeof item === 'string') itemId = item;
            else {
              if (item?.id) itemId = item.id;
              else if (item?.tag) itemId = item.tag;
              if (item?.count) count = item.count;
            }

            return (
              <div key={idx} className={`mc-slot ${styles.outputSlot}`}>
                {itemId && <ItemIcon id={itemId} size={48} />}
                {count > 1 && <span className={styles.countBadge}>{count}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Stats */}
      {(power !== undefined || time !== undefined || heat) && (
        <div className={styles.footer}>
          {power !== undefined && <span>⚡ {power} E/t</span>}
          {time !== undefined && <span>⏱️ {time} ticks ({time / 20}s)</span>}
          {heat ? <span>🔥 {heat} Heat</span> : null}
        </div>
      )}
    </div>
  );
}
