# Tech Reborn Wiki

An unofficial reference wiki for the [Tech Reborn](https://github.com/TechReborn/TechReborn) Minecraft mod (1.20.1).

Live site: **https://jakehowden.github.io/TechRebornWiki/**

## Local development

```bash
npm install
npm run start     # dev server at http://localhost:3000/TechRebornWiki/
npm run build     # production build → build/
```

## Updating TR data

1. Update the local `TechReborn` repository to the desired branch (e.g., `1.20.1`) and run its datagen:
   ```bash
   cd ../TechReborn
   ./gradlew runDatagen
   ```
2. Run the extraction script in the wiki repository:
   ```bash
   npm run extract-data
   ```
3. Verify the counts in the summary output. Expect ~400 item PNGs, ~400 block PNGs, 2000+ recipes, and ~300 items.
4. Check the diff and commit the extracted files in `static/img/` and `src/data/`.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) (added in Phase 7) for content guidelines and the recipe verification rule.

Development workflow and phase breakdown: [`plans/README.md`](plans/README.md).

## License

MIT — see [`LICENSE`](LICENSE). Third-party credits in [`NOTICE.md`](NOTICE.md).
