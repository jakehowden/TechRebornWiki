import React, { ReactNode } from 'react';
import Layout from '@theme/Layout';

export default function NotFound(): ReactNode {
  return (
    <Layout
      title="Page Not Found"
      description="The page you are looking for does not exist.">
      <main className="container margin-vert--xl">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <h1 className="hero__title">Page Not Found</h1>
            <p>
              This page hasn't been written yet (or is here in a future Minecraft version).
            </p>
            <p>
              Please use the search bar to find what you are looking for.
            </p>
            <p>
              Spot a missing page? <a href="https://github.com/jakehowden/TechRebornWiki/issues">Open an issue on GitHub</a>.
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
