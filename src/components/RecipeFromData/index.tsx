import React from 'react';
import recipesData from '@site/src/data/recipes.json';
import Machine, { MachineConfig, MachineSlot } from '../Machine';
import styles from './styles.module.css';

export interface RecipeFromDataProps {
  id: string;
}

type Ingredient =
  | string
  | { id?: string; tag?: string; count?: number; nbt?: { fluid?: string } };

function ingredientToSlot(ing: Ingredient | undefined): MachineSlot {
  if (!ing) return { id: 'minecraft:air', qty: 1 };
  if (typeof ing === 'string') return { id: ing, qty: 1 };
  const id = ing.id ?? ing.tag ?? 'minecraft:air';
  return { id, qty: ing.count ?? 1 };
}

function outputToSlot(out: Ingredient | undefined): MachineSlot {
  if (!out) return { id: 'minecraft:air', qty: 1 };
  if (typeof out === 'string') return { id: out, qty: 1 };
  const slot: MachineSlot = { id: out.id ?? out.tag ?? 'minecraft:air', qty: out.count ?? 1 };
  if (out.nbt?.fluid) slot.fluid = out.nbt.fluid;
  return slot;
}

function shapedToInput(
  pattern: string[],
  key: Record<string, Ingredient>,
): MachineSlot[] {
  // Build a 3x3 grid; pad rows to 3 chars and pad to 3 rows total
  const rows: string[] = [];
  for (let r = 0; r < 3; r++) {
    const row = pattern[r] ?? '';
    rows.push((row + '   ').slice(0, 3));
  }
  const slots: MachineSlot[] = [];
  for (const row of rows) {
    for (const ch of row) {
      if (ch === ' ') {
        slots.push({ id: 'minecraft:air', qty: 1 });
      } else {
        slots.push(ingredientToSlot(key[ch]));
      }
    }
  }
  return slots;
}

function shapelessToInput(ingredients: Ingredient[]): MachineSlot[] {
  // Pad to 9 slots so the 3x3 grid stays intact
  const slots = ingredients.map(ingredientToSlot);
  while (slots.length < 9) slots.push({ id: 'minecraft:air', qty: 1 });
  return slots.slice(0, 9);
}

const VANILLA_COOK_TOOL: Record<string, string> = {
  'minecraft:smelting': 'minecraft:furnace',
  'minecraft:blasting': 'minecraft:blast_furnace',
  'minecraft:smoking': 'minecraft:smoker',
  'minecraft:campfire_cooking': 'minecraft:campfire',
};

export default function RecipeFromData({ id }: RecipeFromDataProps) {
  const recipe = (recipesData as Record<string, any>)[id];

  if (!recipe) {
    console.warn(`Recipe not found: ${id}`);
    return (
      <div className={styles.errorBox}>
        Recipe not found: <code>{id}</code>
      </div>
    );
  }

  let config: MachineConfig | null = null;

  if (recipe.type === 'minecraft:crafting_shaped') {
    config = {
      id,
      tool: 'minecraft:crafting_table',
      input: shapedToInput(recipe.pattern || [], recipe.key || {}),
      output: [outputToSlot(recipe.output)],
    };
  } else if (recipe.type === 'minecraft:crafting_shapeless') {
    config = {
      id,
      tool: 'minecraft:crafting_table',
      input: shapelessToInput(recipe.ingredients || []),
      output: [outputToSlot(recipe.output)],
    };
  } else if (VANILLA_COOK_TOOL[recipe.type]) {
    config = {
      id,
      tool: VANILLA_COOK_TOOL[recipe.type],
      input: [ingredientToSlot(recipe.ingredient)],
      output: [outputToSlot(recipe.output)],
      meta: { time: recipe.cookingtime },
    };
  } else if (typeof recipe.type === 'string' && recipe.type.startsWith('techreborn:')) {
    const ingredients: Ingredient[] = recipe.ingredients || (recipe.ingredient ? [recipe.ingredient] : []);
    const outputs: Ingredient[] = recipe.outputs || (recipe.output ? [recipe.output] : []);
    config = {
      id,
      tool: recipe.type,
      input: ingredients.map(ingredientToSlot),
      output: outputs.map(outputToSlot),
      meta: {
        time: recipe.time,
        power: recipe.power,
        heat: recipe.heat ?? null,
        fluid: recipe.fluid,
      },
    };
  }

  if (!config) {
    return (
      <div className={styles.errorBox}>
        Unsupported recipe type <code>{recipe.type}</code> in <code>{id}</code>
      </div>
    );
  }

  return <Machine config={config} />;
}
