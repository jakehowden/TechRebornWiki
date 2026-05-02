import React from 'react';
import recipesData from '@site/src/data/recipes.json';
import CraftingGrid from '../CraftingGrid';
import ShapelessRecipe from '../ShapelessRecipe';
import MachineRecipe from '../MachineRecipe';
import itemsData from '@site/src/data/items.json';
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
    return (
      <ShapelessRecipe 
        inputs={recipe.ingredients} 
        output={recipe.output} 
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
