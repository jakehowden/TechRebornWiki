import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/tutorial">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeatureCard({ title, description, to }: { title: string; description: string; to: string }) {
  return (
    <div className="col col--4">
      <Link to={to} className={styles.featureCard}>
        <h3>{title}</h3>
        <p>{description}</p>
      </Link>
    </div>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="An unofficial reference for the Tech Reborn Minecraft mod.">
      <HomepageHeader />
      <main>
        <div className="container padding-vert--xl">
          <div className="row">
            <FeatureCard
              title="Machines & Processing"
              description="Master industrial processing with electric furnaces, grinders, compressors, and advanced multiblock structures."
              to="/docs/processing/lv-machines/electric-furnace"
            />
            <FeatureCard
              title="Energy & Power"
              description="Generate power from solar, wind, and nuclear sources. Build electrical grids with cables, transformers, and storage units."
              to="/docs/power/generators/solid-fuel-generator"
            />
            <FeatureCard
              title="Tools & Armor"
              description="Equip yourself with laser drills, nano armor, and unbreakable tools powered by raw energy."
              to="/docs/tools-armor"
            />
          </div>
        </div>
      </main>
    </Layout>
  );
}
