const fs = require('fs');
const files = [
  'docs/multiblocks/industrial-grinder.mdx',
  'docs/multiblocks/industrial-centrifuge.mdx',
  'docs/multiblocks/implosion-compressor.mdx',
  'docs/multiblocks/vacuum-freezer.mdx',
  'docs/multiblocks/industrial-sawmill.mdx',
  'docs/multiblocks/distillation-tower.mdx',
  'docs/multiblocks/fluid-replicator.mdx'
];
for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('import MultiblockShape')) {
    if (content.includes("import MachineRecipeList from '@site/src/components/MachineRecipeList';")) {
      content = content.replace(
        "import MachineRecipeList from '@site/src/components/MachineRecipeList';",
        "import MachineRecipeList from '@site/src/components/MachineRecipeList';\nimport MultiblockShape from '@site/src/components/MultiblockShape';\nimport multiblocksJson from '@site/src/data/multiblocks.json';"
      );
    } else {
      content = content.replace(
        "import ItemIcon from '@site/src/components/ItemIcon';",
        "import ItemIcon from '@site/src/components/ItemIcon';\nimport MultiblockShape from '@site/src/components/MultiblockShape';\nimport multiblocksJson from '@site/src/data/multiblocks.json';"
      );
    }
    
    let machineName = file.split('/').pop().replace('.mdx', '').replace(/-/g, '_');
    content = content.replace(
      '## Recipe',
      '## Multiblock Structure\n<MultiblockShape data={multiblocksJson["' + machineName + '"]} />\n\n## Recipe'
    );
    fs.writeFileSync(file, content);
  }
}
console.log('Updated multiblock pages');
