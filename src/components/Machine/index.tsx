import React from 'react';
import ItemIcon from '../ItemIcon';
import { shortId, titleCase } from '@site/src/utils/itemFormatters';

export interface MachineSlot {
  id: string;
  qty?: number;
}

export interface MachineConfig {
  id?: string;
  input: MachineSlot[];
  output: MachineSlot[];
  tool: string;
  meta?: {
    time?: number;
    power?: number;
    heat?: number | null;
    fluid?: { amnt: number; name: string };
  };
}

export interface MachineProps {
  config: MachineConfig;
}

const FURNACE_LIKE = { input: { '--cols': '1', '--rows': '1' }, output: { '--cols': '1', '--rows': '1' } };
const CRAFTING_LIKE = { input: { '--cols': '3', '--rows': '3' }, output: { '--cols': '1', '--rows': '1' } };
const TWOWIDE_ONETALL = { input: { '--cols': '2', '--rows': '1' }, output: { '--cols': '2', '--rows': '1' } };
const TWOIN_ONEOUT = { input: { '--cols': '2', '--rows': '1' }, output: { '--cols': '1', '--rows': '1' } };
const TWOIN_FOUROUT = { input: { '--cols': '2', '--rows': '1' }, output: { '--cols': '4', '--rows': '1' } };

const TOOL_LAYOUTS: Record<string, typeof CRAFTING_LIKE> = {
  'minecraft:crafting_table': CRAFTING_LIKE,
  'techreborn:rolling_machine': CRAFTING_LIKE,
  'minecraft:furnace': FURNACE_LIKE,
  'minecraft:blast_furnace': FURNACE_LIKE,
  'minecraft:smoker': FURNACE_LIKE,
  'minecraft:campfire': FURNACE_LIKE,
  'techreborn:iron_furnace': FURNACE_LIKE,
  'techreborn:iron_alloy_furnace': TWOIN_ONEOUT,
  'techreborn:electric_furnace': FURNACE_LIKE,
  'techreborn:compressor': FURNACE_LIKE,
  'techreborn:grinder': FURNACE_LIKE,
  'techreborn:wire_mill': FURNACE_LIKE,
  'techreborn:vacuum_freezer': FURNACE_LIKE,
  'techreborn:extractor': FURNACE_LIKE,
  'techreborn:fluid_replicator': FURNACE_LIKE,
  'techreborn:recycler': FURNACE_LIKE,
  'techreborn:scrapbox': FURNACE_LIKE,
  'techreborn:industrial_blast_furnace': TWOWIDE_ONETALL,
  'techreborn:blast_furnace': TWOIN_ONEOUT,
  'techreborn:fusion_reactor': TWOWIDE_ONETALL,
  'techreborn:industrial_grinder': TWOWIDE_ONETALL,
  'techreborn:assembling_machine': TWOIN_ONEOUT,
  'techreborn:industrial_sawmill': TWOWIDE_ONETALL,
  'techreborn:alloy_smelter': TWOIN_ONEOUT,
  'techreborn:centrifuge': TWOIN_FOUROUT,
  'techreborn:industrial_centrifuge': TWOIN_FOUROUT,
  'techreborn:distillation_tower': TWOIN_FOUROUT,
  'techreborn:chemical_reactor': TWOIN_FOUROUT,
  'techreborn:industrial_electrolyzer': TWOIN_FOUROUT,
  'techreborn:implosion_compressor': TWOWIDE_ONETALL,
  'techreborn:solid_canning_machine': TWOIN_ONEOUT,
  'techreborn:fusion_control_computer': TWOIN_ONEOUT,
};

function mapToolToStyles(tool: string, inputCount: number, outputCount: number) {
  const styles = TOOL_LAYOUTS[tool.toLowerCase()];
  if (styles) return styles;
  if (inputCount > 0 || outputCount > 0) {
    return {
      input: { '--cols': String(Math.max(1, inputCount)), '--rows': '1' },
      output: { '--cols': String(Math.max(1, outputCount)), '--rows': '1' },
    };
  }
  console.warn(`Machine: unknown tool '${tool}', defaulting to crafting layout`);
  return CRAFTING_LIKE;
}

function formatBuckets(amnt: number): string {
  // 81000 droplets = 1 bucket in 1.20+ (matching upstream convention)
  const buckets = amnt / 81000;
  return Number.isInteger(buckets) ? `${buckets}` : buckets.toFixed(2);
}

export default function Machine({ config }: MachineProps) {
  if (!config) return null;
  const styles = mapToolToStyles(config.tool, config.input.length, config.output.length);
  const headerName = titleCase(shortId(config.id || config.output[0]?.id || config.tool));

  return (
    <div className="machine-span">
      <div className="machine-header">
        <ItemIcon id={config.tool} size={24} />
        <span>{headerName}</span>
      </div>

      <div className="crafting">
        <div className="crafting-board" style={styles.input as React.CSSProperties}>
          {config.input.map((item, idx) => (
            <div className="slot" key={idx} data-quantity={item.qty ?? 1}>
              {item.id && item.id !== 'minecraft:air' && <ItemIcon id={item.id} size={32} />}
            </div>
          ))}
        </div>

        <div className="arrow" />

        <div className="crafting-board" style={styles.output as React.CSSProperties}>
          {config.output.map((item, idx) => (
            <div className="slot" key={idx} data-quantity={item.qty ?? 1}>
              {item.id && <ItemIcon id={item.id} size={32} />}
            </div>
          ))}
        </div>
      </div>

      {config.meta && (config.meta.time != null || config.meta.power != null || config.meta.heat != null || config.meta.fluid != null) && (
        <div className="crafting-info">
          {config.meta.time != null && (
            <div className="info-item">
              <span aria-label="Time" role="img">⏱</span>
              <span>{(config.meta.time * 0.05).toFixed(2).replace(/\.?0+$/, '')}s</span>
            </div>
          )}
          {config.meta.power != null && (
            <div className="info-item">
              <span aria-label="Power" role="img">⚡</span>
              <span>{config.meta.power} E/t{config.meta.time != null && ` (${config.meta.power * config.meta.time}E)`}</span>
            </div>
          )}
          {config.meta.heat != null && (
            <div className="info-item">
              <span aria-label="Heat" role="img">🔥</span>
              <span>{config.meta.heat}</span>
            </div>
          )}
          {config.meta.fluid != null && (
            <div className="info-item">
              <span aria-label="Fluid" role="img">💧</span>
              <span>{formatBuckets(config.meta.fluid.amnt)}× 🪣 {titleCase(shortId(config.meta.fluid.name))}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
