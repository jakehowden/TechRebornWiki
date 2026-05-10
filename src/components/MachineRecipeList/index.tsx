import React, { useMemo } from 'react';
import recipesData from '@site/src/data/recipes.json';
import itemsData from '@site/src/data/items.json';
import RecipeFromData from '../RecipeFromData';
import ItemIcon from '../ItemIcon';
import styles from './styles.module.css';
import { titleCase } from '@site/src/utils/itemFormatters';

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

function humanizeVariantLabel(localName: string, outputId: string): string {
  const shortOutput = outputId.includes(':') ? outputId.slice(outputId.indexOf(':') + 1) : outputId;
  let rest = localName.startsWith(shortOutput) ? localName.slice(shortOutput.length) : localName;
  rest = rest.replace(/^_/, '').trim();
  if (!rest) return titleCase(localName);
  return titleCase(rest);
}

type Computed =
  | { kind: 'empty' }
  | { kind: 'scrapbox'; possibilities: string[] }
  | { kind: 'list'; sortedFamilies: [string, string[]][] };

export default function MachineRecipeList({ machine, output }: MachineRecipeListProps) {
  const targetType = machine.includes(':') ? machine : `techreborn:${machine}`;

  const computed = useMemo((): Computed => {
    const keys = Object.keys(recipesData).filter(key => {
      const recipe = (recipesData as any)[key];
      if (recipe.type !== targetType) return false;
      if (output && getPrimaryOutputId(recipe) !== output) return false;
      return true;
    });

    if (keys.length === 0) return { kind: 'empty' };

    if (targetType === 'techreborn:scrapbox') {
      return {
        kind: 'scrapbox',
        possibilities: Array.from(new Set(keys.map(k => getPrimaryOutputId((recipesData as any)[k])))),
      };
    }

    const familyMap = new Map<string, string[]>();
    for (const key of keys) {
      const outputId = getPrimaryOutputId((recipesData as any)[key]);
      if (!familyMap.has(outputId)) familyMap.set(outputId, []);
      familyMap.get(outputId)!.push(key);
    }

    return {
      kind: 'list',
      sortedFamilies: Array.from(familyMap.entries()).sort(([a], [b]) =>
        getDisplayName(a).localeCompare(getDisplayName(b))
      ),
    };
  }, [targetType, output]);

  if (computed.kind === 'empty') {
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

  if (computed.kind === 'scrapbox') {
    return (
      <details className={styles.details}>
        <summary className={styles.summary}>Random output ({computed.possibilities.length} possibilities)</summary>
        <div className={styles.scrapboxGrid}>
          {computed.possibilities.map(id => <ItemIcon key={id} id={id} size={32} noLink />)}
        </div>
      </details>
    );
  }

  return (
    <div className={styles.listContainer}>
      {computed.sortedFamilies.map(([outputId, recipeKeys]) => {
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
