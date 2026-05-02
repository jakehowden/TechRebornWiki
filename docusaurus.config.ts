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

  onBrokenLinks: "warn",

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
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",

    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: "Tech Reborn Wiki",
      items: [
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
          title: "Wiki",
          items: [
            {
              label: "Home",
              to: "/docs/intro",
            },
          ],
        },
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
};

export default config;
