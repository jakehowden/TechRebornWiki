const fs = require('fs');

const multiblocks = {
  industrial_blast_furnace: {
    layers: [
      [["casing", "casing", "casing"], ["casing", "controller", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "lava", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "lava", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]]
    ],
    legend: {
      casing: "techreborn:basic_machine_casing",
      controller: "techreborn:industrial_blast_furnace",
      lava: "minecraft:lava"
    },
    heat_table: [
      { casing: "techreborn:basic_machine_casing", lava_layers: 0, heat: 1360 },
      { casing: "techreborn:basic_machine_casing", lava_layers: 2, heat: 1860 },
      { casing: "techreborn:advanced_machine_casing", lava_layers: 0, heat: 2312 },
      { casing: "techreborn:advanced_machine_casing", lava_layers: 2, heat: 2812 },
      { casing: "techreborn:industrial_machine_casing", lava_layers: 0, heat: 3230 },
      { casing: "techreborn:industrial_machine_casing", lava_layers: 2, heat: 3730 }
    ]
  },
  industrial_grinder: {
    layers: [
      [["casing", "casing", "casing"], ["casing", "water", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "controller", "casing"], ["casing", "casing", "casing"]]
    ],
    legend: {
      casing: "techreborn:basic_machine_casing",
      controller: "techreborn:industrial_grinder",
      water: "minecraft:water"
    }
  },
  industrial_centrifuge: {
    layers: [
      [["casing", "casing", "casing"], ["casing", "controller", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]]
    ],
    legend: {
      casing: "techreborn:advanced_machine_casing",
      controller: "techreborn:industrial_centrifuge"
    }
  },
  implosion_compressor: {
    layers: [
      [["casing", "casing", "casing"], ["casing", "controller", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]]
    ],
    legend: {
      casing: "techreborn:advanced_machine_casing",
      controller: "techreborn:implosion_compressor"
    }
  },
  vacuum_freezer: {
    layers: [
      [["casing", "casing", "casing"], ["casing", "controller", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]]
    ],
    legend: {
      casing: "techreborn:advanced_machine_casing",
      controller: "techreborn:vacuum_freezer"
    }
  },
  industrial_sawmill: {
    layers: [
      [["casing", "casing", "casing"], ["casing", "water", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "controller", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]]
    ],
    legend: {
      casing: "techreborn:basic_machine_casing",
      controller: "techreborn:industrial_sawmill",
      water: "minecraft:water"
    }
  },
  distillation_tower: {
    layers: [
      [["casing", "casing", "casing"], ["casing", "controller", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]]
    ],
    legend: {
      casing: "techreborn:advanced_machine_casing",
      controller: "techreborn:distillation_tower"
    }
  },
  fluid_replicator: {
    layers: [
      [["casing", "casing", "casing"], ["casing", "controller", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]],
      [["casing", "casing", "casing"], ["casing", "casing", "casing"], ["casing", "casing", "casing"]]
    ],
    legend: {
      casing: "techreborn:industrial_machine_casing",
      controller: "techreborn:fluid_replicator"
    }
  },
  fusion_reactor: {
    layers: [
      [
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","controller","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"],
        ["coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil","coil"]
      ]
    ],
    legend: {
      coil: "techreborn:fusion_coil",
      controller: "techreborn:fusion_control_computer"
    }
  }
};

fs.writeFileSync('src/data/multiblocks.json', JSON.stringify(multiblocks, null, 2));
