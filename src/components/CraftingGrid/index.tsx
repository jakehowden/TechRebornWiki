import React from 'react';
import ItemIcon from '../ItemIcon';
import styles from './styles.module.css';

interface IngredientObj {
  id?: string;
  tag?: string;
}
type IngredientType = string | IngredientObj;

export interface CraftingGridProps {
  pattern: string[];
  legend: Record<string, IngredientType>;
  output: { id: string; count?: number };
}

export default function CraftingGrid({ pattern, legend, output }: CraftingGridProps) {
  // Normalize pattern to 3x3
  const grid = Array(9).fill(null);
  const rows = pattern.length;
  const cols = rows > 0 ? pattern[0].length : 0;
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const char = pattern[r][c];
      if (char !== ' ') {
        grid[r * 3 + c] = legend[char];
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.gridBox}>
        <table className={styles.table} role="grid" aria-label="Crafting grid">
          <tbody>
            {[0, 1, 2].map(row => (
              <tr key={row}>
                {[0, 1, 2].map(col => {
                  const item = grid[row * 3 + col];
                  let itemId: string | undefined;
                  if (typeof item === 'string') itemId = item;
                  else if (item?.id) itemId = item.id;
                  else if (item?.tag) itemId = item.tag; // Tags are not handled natively in icon yet but placeholder

                  return (
                    <td key={col} className={`mc-slot ${styles.slot}`}>
                      {itemId && <ItemIcon id={itemId} size={32} />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
