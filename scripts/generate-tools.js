const fs = require('fs');
const path = require('path');

const outDir = 'docs/tools-armor/tools';
fs.mkdirSync(outDir, { recursive: true });

const tools = [
  { id: 'techreborn:treetap', name: 'Treetap', desc: 'Extracts Sap from Rubber Trees.' },
  { id: 'techreborn:wrench', name: 'Wrench', desc: 'Safely removes machines without losing them.' },
  { id: 'techreborn:painting_tool', name: 'Painting Tool', desc: 'Used to dye cables or glass.' },
  { id: 'techreborn:omni_tool', name: 'Omni Tool', desc: 'A universal tool that functions as a wrench and more.' },
  { id: 'techreborn:basic_drill', name: 'Basic Drill', desc: 'An electric alternative to iron pickaxes.' },
  { id: 'techreborn:advanced_drill', name: 'Advanced Drill', desc: 'A faster drill equivalent to diamond.' },
  { id: 'techreborn:industrial_drill', name: 'Industrial Drill', desc: 'The ultimate mining tool with area-of-effect mining capabilities.' },
  { id: 'techreborn:basic_chainsaw', name: 'Basic Chainsaw', desc: 'An electric alternative to iron axes.' },
  { id: 'techreborn:advanced_chainsaw', name: 'Advanced Chainsaw', desc: 'A faster chainsaw.' },
  { id: 'techreborn:industrial_chainsaw', name: 'Industrial Chainsaw', desc: 'The ultimate tree-felling tool.' },
  { id: 'techreborn:basic_jackhammer', name: 'Basic Jackhammer', desc: 'Specialized tool for mining stone-like blocks incredibly fast.' },
  { id: 'techreborn:advanced_jackhammer', name: 'Advanced Jackhammer', desc: 'A faster jackhammer.' },
  { id: 'techreborn:industrial_jackhammer', name: 'Industrial Jackhammer', desc: 'An area-of-effect jackhammer for clearing massive areas of stone.' },
  { id: 'techreborn:nano_saber', name: 'Nano Saber', desc: 'A powerful energy-based weapon.' },
  { id: 'techreborn:frequency_transmitter', name: 'Frequency Transmitter', desc: 'Used to link machines.' },
  { id: 'techreborn:cloaking_device', name: 'Cloaking Device', desc: 'Provides invisibility when worn/activated.' }
];

let order = 1;
for (const tool of tools) {
  const filename = tool.id.replace('techreborn:', '').replace(/_/g, '-') + '.mdx';
  let tier = "Low";
  if (tool.id.includes('advanced')) tier = "Medium";
  if (tool.id.includes('industrial') || tool.id.includes('nano') || tool.id.includes('cloaking')) tier = "High";
  
  const content = `---
title: ${tool.name}
description: ${tool.desc}
sidebar_position: ${order++}
---

import RecipeFromData from '@site/src/components/RecipeFromData';
import ItemIcon from '@site/src/components/ItemIcon';
import MachineStats from '@site/src/components/MachineStats';

<ItemIcon id="${tool.id}" size={64} />

## Overview
${tool.desc}

## Recipe
<RecipeFromData id="techreborn:crafting/${tool.id.replace('techreborn:', '')}" />

## Charging
This item requires energy to operate and can be charged in a ${tier} Voltage energy storage block (such as an ${tier === 'Low' ? 'LV' : tier === 'Medium' ? 'MV' : 'HV'} SU) or using battery packs.
`;

  fs.writeFileSync(path.join(outDir, filename), content);
}

console.log('Tools generated');
