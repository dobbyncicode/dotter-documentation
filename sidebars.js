// Docusaurus sidebar configuration

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'quick-reference',
    'overview',
    'how-dotter-works',
    'installation',
    'getting-started',
    'starter-config',
    'usage',
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'config-structure',
        'templates',
        'hooks',
      ],
    },
    'examples',
    'faq',
    'migration',
  ],
};

export default sidebars;
