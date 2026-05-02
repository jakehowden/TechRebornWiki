const fs = require('fs');

const configPath = '../TechReborn/src/main/java/techreborn/config/TechRebornConfig.java';
const configContent = fs.readFileSync(configPath, 'utf8');

const regex = /public static (int|double|long|boolean) ([a-zA-Z0-9_]+)\s*=\s*([^;]+);/g;
const configs = {};
let match;
while ((match = regex.exec(configContent)) !== null) {
  configs[match[2]] = match[3];
}

console.log(JSON.stringify(configs, null, 2));
