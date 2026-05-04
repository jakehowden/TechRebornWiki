# Tech Reborn Wiki

![Build](https://github.com/jakehowden/TechRebornWiki/actions/workflows/deploy.yml/badge.svg)

Unofficial community wiki for Tech Reborn 1.20.1. The official upstream is at [wiki.techreborn.ovh](https://wiki.techreborn.ovh/).

An unofficial reference wiki for the [Tech Reborn](https://github.com/TechReborn/TechReborn) Minecraft mod, built with [Docusaurus 3](https://docusaurus.io/).

**Live URL:** [https://jakehowden.github.io/TechRebornWiki/](https://jakehowden.github.io/TechRebornWiki/)

## Features
- **Data-Driven:** Extracts recipes, items, and machine stats directly from the mod's source using custom Node scripts.
- **Multiblock Viewer:** Custom React components for exploring complex multiblocks layer-by-layer.
- **Versioned:** Tracks different Tech Reborn/Minecraft versions using Docusaurus versioning.
- **Performant:** Achieves Lighthouse scores of 95+ for Performance, Accessibility, and SEO.

## Contributing

We welcome contributions! Please review our [Contributing Guidelines](CONTRIBUTING.md) to get started.

For information on how the original site architecture was planned, check out the [Plans Directory](plans/README.md).

## Local Development

```bash
npm install
npm run start
```
This starts a local development server at `http://localhost:3000`.

## Building

```bash
npm run build
```
Creates an optimized production build in the `build/` directory.
