import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Authors use site-root URLs in Markdown; deployments may have a base path.
function remarkArticleLinks({ base, directory }) {
  return (tree, file) => {
    if (!file.path || !path.resolve(file.path).startsWith(directory + path.sep)) return;
    function visit(node) {
      if (['link', 'definition', 'image'].includes(node.type) && node.url.startsWith('/') && !node.url.startsWith('//')) {
        node.url = base + node.url;
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

/** @returns {import('astro').AstroIntegration} */
export default function articleLinks() {
  return {
    name: 'article-links',
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        updateConfig({ markdown: { remarkPlugins: [[remarkArticleLinks, {
          base: config.base.replace(/\/$/, ''),
          directory: fileURLToPath(new URL('content/articles', config.srcDir)),
        }]] } });
      },
    },
  };
}
