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
            to="/docs/getting-started">
            Get Started
          </Link>
          <Link
            className="button button--outline button--lg"
            to="/docs/starter-config"
            style={{marginLeft: '0.5rem'}}>
            Starter Config
          </Link>
        </div>
      </div>
    </header>
  );
}

function UnofficialDisclaimer() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '1rem 1.5rem',
      border: '1px solid var(--ifm-color-warning)',
      borderRadius: '8px',
      backgroundColor: 'var(--ifm-alert--background-color)',
    }}>
      <strong>Unofficial Documentation</strong>
        <p style={{margin: '0.5rem 0 0'}}>
          This is an unofficial documentation site for Dotter. It is not affiliated with or endorsed by the official Dotter project.
          For the official documentation, visit the{' '}
          <a href="https://github.com/SuperCuber/dotter" target="_blank" rel="noopener noreferrer">
            Dotter GitHub repository
          </a>.
        </p>
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Dotter Documentation"
      description="Unofficial documentation for Dotter, a dotfile manager and templater written in Rust. Get started with setup, configuration, and real-world examples.">
      <HomepageHeader />
      <main>
        <UnofficialDisclaimer />
      </main>
    </Layout>
  );
}
