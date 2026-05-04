import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Tech Reborn Wiki",
  tagline: "An unofficial reference for the Tech Reborn Minecraft mod",
  favicon: "img/favicon.ico",

  url: "https://jakehowden.github.io",
  baseUrl: "/TechRebornWiki/",

  organizationName: "jakehowden",
  projectName: "TechRebornWiki",
  deploymentBranch: "gh-pages",
  trailingSlash: false,

  onBrokenLinks: "throw",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/jakehowden/TechRebornWiki/tree/main/",
          lastVersion: "1.20.1",
          versions: {
            current: { label: "Next (in development)", path: "next", banner: "unreleased" },
            "1.20.1": { label: "1.20.1" },
          },
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/og.png",
    metadata: [
      { name: "keywords", content: "techreborn, minecraft, wiki, mod" },
      { name: "description", content: "An unofficial reference for the Tech Reborn Minecraft mod" },
    ],

    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: "Tech Reborn Wiki",
      items: [
        {
          to: "/tutorial",
          label: "Getting Started",
          position: "left",
        },
        {
          type: "docsVersionDropdown",
          position: "left",
        },
        {
          type: "docSidebar",
          sidebarId: "wikiSidebar",
          position: "left",
          label: "Wiki",
        },
        {
          href: "https://github.com/jakehowden/TechRebornWiki",
          label: "GitHub",
          position: "right",
        },
      ],
    },

    footer: {
      style: "dark",
      links: [
        {
          title: "Links",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/jakehowden/TechRebornWiki",
            },
            {
              label: "Tech Reborn Mod",
              href: "https://github.com/TechReborn/TechReborn",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Jake Howden. Built with Docusaurus.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  themes: [
    [
      require.resolve("@cmfcmf/docusaurus-search-local"),
      {
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        language: "en",
      },
    ],
  ],
};

export default config;
