import React from 'react';
import ItemIcon from '../ItemIcon';
import styles from './styles.module.css';

interface IngredientObj {
  id?: string;
  tag?: string;
}
type IngredientType = string | IngredientObj;

export interface ShapelessRecipeProps {
  inputs: IngredientType[];
  output: { id: string; count?: number };
}

export default function ShapelessRecipe({ inputs, output }: ShapelessRecipeProps) {
  return (
    <div className={styles.container}>
      <div className={styles.inputsBox}>
        {inputs.map((item, idx) => {
          let itemId: string | undefined;
          if (typeof item === 'string') itemId = item;
          else if (item?.id) itemId = item.id;
          else if (item?.tag) itemId = item.tag;

          return (
            <div key={idx} className={`mc-slot ${styles.slot}`}>
              {itemId && <ItemIcon id={itemId} size={32} />}
            </div>
          );
        })}
      </div>

      <div className="mc-arrow"></div>

      <div className={`mc-slot ${styles.outputSlot}`}>
        <ItemIcon id={output.id} size={48} />
        {output.count && output.count > 1 && (
          <span className={styles.countBadge}>{output.count}</span>
        )}
      </div>
    </div>
  );
}
