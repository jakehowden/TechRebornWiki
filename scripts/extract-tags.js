const fs = require('fs');
const path = require('path');
const recipes = require('../src/data/recipes.json');

const tags = new Set();

for (const recipe of Object.values(recipes)) {
  // Shaped recipes: key values
  if (recipe.key) {
    for (const v of Object.values(recipe.key)) {
      if (v && typeof v === 'object' && v.tag) tags.add(v.tag);
    }
  }
  // Shapeless: ingredients array
  if (recipe.ingredients) {
    for (const ing of recipe.ingredients) {
      if (ing && typeof ing === 'object' && ing.tag) tags.add(ing.tag);
    }
  }
  // Machine recipes: ingredient or ingredients
  if (recipe.ingredient) {
    const ing = recipe.ingredient;
    if (ing && typeof ing === 'object' && ing.tag) tags.add(ing.tag);
    if (Array.isArray(ing)) {
      for (const i of ing) {
        if (i && typeof i === 'object' && i.tag) tags.add(i.tag);
      }
    }
  }
}

const sorted = [...tags].sort();
console.log('All unique tags in recipes.json:', sorted.length);
sorted.forEach(t => console.log(t));
