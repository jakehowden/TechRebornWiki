import React from 'react';
import recipesData from '@site/src/data/recipes.json';
import itemsData from '@site/src/data/items.json';
import RecipeFromData from '../RecipeFromData';
import ItemIcon from '../ItemIcon';
import styles from './styles.module.css';

export interface MachineRecipeListProps {
  machine: string;
  output?: string;
}

function getLocalName(recipeKey: string): string {
  const slashIdx = recipeKey.lastIndexOf('/');
  return slashIdx === -1 ? recipeKey : recipeKey.slice(slashIdx + 1);
}

function getPrimaryOutputId(recipe: any): string {
  const mainOutput = recipe.outputs?.[0] || recipe.output;
  if (typeof mainOutput === 'string') return mainOutput;
  if (mainOutput?.id) return mainOutput.id;
  if (mainOutput?.tag) return mainOutput.tag;
  return '';
}

function getDisplayName(id: string): string {
  return (itemsData as any)[id]?.displayName || id;
}

function titleCaseSlug(slug: string): string {
  return slug.replace(/(^|_)(\w)/g, (_, sep, c) => (sep ? ' ' : '') + c.toUpperCase());
}

function humanizeVariantLabel(localName: string, outputId: string): string {
  const shortOutput = outputId.includes(':') ? outputId.slice(outputId.indexOf(':') + 1) : outputId;
  let rest = localName.startsWith(shortOutput) ? localName.slice(shortOutput.length) : localName;
  rest = rest.replace(/^_/, '').trim();
  if (!rest) return titleCaseSlug(localName);
  return titleCaseSlug(rest);
}

export default function MachineRecipeList({ machine, output }: MachineRecipeListProps) {
  const targetType = machine.includes(':') ? machine : `techreborn:${machine}`;

  const matchingKeys = Object.keys(recipesData).filter(key => {
    const recipe = (recipesData as any)[key];
    if (recipe.type !== targetType) return false;
    if (output && getPrimaryOutputId(recipe) !== output) return false;
    return true;
  });

  if (matchingKeys.length === 0) {
    return (
      <div className={styles.emptyList}>
        <p>No recipes were extracted for <code>{targetType}</code>. This may indicate:</p>
        <ul>
          <li>The machine has no datagen-emitted recipes (configured in-world, not in source).</li>
          <li>The extraction script needs an update for this recipe type.</li>
        </ul>
      </div>
    );
  }

  if (targetType === 'techreborn:scrapbox') {
    const possibilities = Array.from(new Set(matchingKeys.map(k => getPrimaryOutputId((recipesData as any)[k]))));
    return (
      <details className={styles.details}>
        <summary className={styles.summary}>Random output ({possibilities.length} possibilities)</summary>
        <div className={styles.scrapboxGrid}>
          {possibilities.map(id => <ItemIcon key={id} id={id} size={32} noLink />)}
        </div>
      </details>
    );
  }

  // Group by primary output id
  const familyMap = new Map<string, string[]>();

  for (const key of matchingKeys) {
    const recipe = (recipesData as any)[key];
    const outputId = getPrimaryOutputId(recipe);
    if (!familyMap.has(outputId)) familyMap.set(outputId, []);
    familyMap.get(outputId)!.push(key);
  }

  const sortedFamilies = Array.from(familyMap.entries()).sort(([a], [b]) =>
    getDisplayName(a).localeCompare(getDisplayName(b))
  );

  return (
    <div className={styles.listContainer}>
      {sortedFamilies.map(([outputId, recipeKeys]) => {
        const displayName = getDisplayName(outputId);
        const sortedKeys = [...recipeKeys].sort();

        if (recipeKeys.length === 1) {
          return (
            <details key={outputId} className={styles.details}>
              <summary className={styles.summary}>{displayName}</summary>
              <div className={styles.recipeWrapper}>
                <RecipeFromData id={recipeKeys[0]} />
              </div>
            </details>
          );
        }

        return (
          <details key={outputId} className={styles.details}>
            <summary className={styles.summaryGroup}>
              <ItemIcon id={outputId} size={20} noLink />
              <span className={styles.familyName}>{displayName}</span>
              <span className={styles.variantBadge}>{recipeKeys.length} variants</span>
            </summary>
            <div className={styles.nestedList}>
              {sortedKeys.map(recipeKey => {
                const localName = getLocalName(recipeKey);
                const label = humanizeVariantLabel(localName, outputId);
                return (
                  <details key={recipeKey} className={`${styles.details} ${styles.nestedDetails}`}>
                    <summary className={styles.summary}>{label}</summary>
                    <div className={styles.recipeWrapper}>
                      <RecipeFromData id={recipeKey} />
                    </div>
                  </details>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
