import React from 'react';
import recipesData from '@site/src/data/recipes.json';
import CraftingGrid from '../CraftingGrid';
import MachineRecipe from '../MachineRecipe';
import styles from './styles.module.css';

export interface RecipeFromDataProps {
  id: string;
}

export default function RecipeFromData({ id }: RecipeFromDataProps) {
  const recipe = (recipesData as any)[id];

  if (!recipe) {
    console.warn(`Recipe not found: ${id}`);
    return (
      <div className={styles.errorBox}>
        Recipe not found: <code>{id}</code>
      </div>
    );
  }

  if (recipe.type === 'minecraft:crafting_shaped') {
    return (
      <CraftingGrid 
        pattern={recipe.pattern} 
        legend={recipe.key} 
        output={recipe.output} 
      />
    );
  }

  if (recipe.type === 'minecraft:crafting_shapeless') {
    const ings: any[] = recipe.ingredients;
    const chars = ['A','B','C','D','E','F','G','H','I'];
    const legend: Record<string, any> = {};
    ings.slice(0, 9).forEach((ing, i) => { legend[chars[i]] = ing; });
    const flat = chars.slice(0, ings.length).join('').padEnd(9, ' ');
    const pattern = [flat.slice(0, 3), flat.slice(3, 6), flat.slice(6, 9)];
    return (
      <CraftingGrid
        pattern={pattern}
        legend={legend}
        output={recipe.output}
        shapeless
      />
    );
  }

  if (recipe.type.startsWith('techreborn:')) {
    const machineName = recipe.type.replace('techreborn:', '');
    return (
      <MachineRecipe 
        machine={machineName}
        inputs={recipe.ingredients || [recipe.ingredient].filter(Boolean)}
        outputs={recipe.outputs || [recipe.output].filter(Boolean)}
        power={recipe.power}
        time={recipe.time}
        heat={recipe.heat}
      />
    );
  }

  // Fallback for vanilla smelting/blasting/smoking if they are included
  if (['minecraft:smelting', 'minecraft:blasting', 'minecraft:smoking', 'minecraft:campfire_cooking'].includes(recipe.type)) {
    return (
      <MachineRecipe 
        machine={recipe.type.replace('minecraft:', '')} // Using vanilla ID for the machine icon might need hand-authoring
        inputs={[recipe.ingredient].filter(Boolean)}
        outputs={[recipe.output].filter(Boolean)}
        time={recipe.cookingtime}
      />
    );
  }

  return (
    <div className={styles.errorBox}>
      Unsupported recipe type <code>{recipe.type}</code> in <code>{id}</code>
    </div>
  );
}
