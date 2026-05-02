import React from 'react';
import recipesData from '@site/src/data/recipes.json';
import itemsData from '@site/src/data/items.json';
import RecipeFromData from '../RecipeFromData';
import styles from './styles.module.css';

export interface MachineRecipeListProps {
  machine: string;
}

export default function MachineRecipeList({ machine }: MachineRecipeListProps) {
  const targetType = machine.includes(':') ? machine : `techreborn:${machine}`;

  const matchingKeys = Object.keys(recipesData).filter(key => {
    const recipe = (recipesData as any)[key];
    return recipe.type === targetType;
  });

  if (matchingKeys.length === 0) {
    return <p>No recipes found for <code>{targetType}</code>.</p>;
  }

  return (
    <div className={styles.listContainer}>
      {matchingKeys.map(key => {
        const recipe = (recipesData as any)[key];
        const mainOutput = recipe.outputs?.[0] || recipe.output;
        let outputId = '';
        if (typeof mainOutput === 'string') outputId = mainOutput;
        else if (mainOutput?.id) outputId = mainOutput.id;
        else if (mainOutput?.tag) outputId = mainOutput.tag;

        const displayName = outputId 
          ? ((itemsData as any)[outputId]?.displayName || outputId) 
          : key;

        return (
          <details key={key} className={styles.details}>
            <summary className={styles.summary}>{displayName}</summary>
            <div className={styles.recipeWrapper}>
              <RecipeFromData id={key} />
            </div>
          </details>
        );
      })}
    </div>
  );
}
