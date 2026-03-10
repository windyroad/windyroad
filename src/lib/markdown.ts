import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Root, Element, Text, ElementContent } from 'hast';
import slugify from 'slugify';

/** Adds role="note" to <aside> elements to prevent landmark clutter. */
function rehypeAsideRole() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'aside') {
        node.properties = node.properties || {};
        node.properties.role = 'note';
      }
    });
  };
}

/**
 * Generates pull quotes from <span data-pull> markers in body text.
 *
 * Usage in markdown:
 *   <span data-pull>Work-in-progress is risk.</span>
 *   <span data-pull data-pull-offset="2">Text here.</span>
 *
 * The plugin:
 * 1. Finds span[data-pull] elements
 * 2. Extracts their text content
 * 3. Creates an <aside role="note"> with that text
 * 4. Inserts it before the Nth ancestor paragraph (offset = 0 means same paragraph)
 * 5. Unwraps the span to plain text
 */
function rehypePullQuotes() {
  return (tree: Root) => {
    // Collect pull quote spans with their parent chain info
    const pullQuotes: { text: string; offset: number; spanNode: Element; parentIndex: number }[] = [];

    // First pass: find all span[data-pull] and record which top-level-ish
    // paragraph they belong to, then unwrap them.
    visit(tree, 'element', (node: Element, index, parent) => {
      if (
        node.tagName === 'span' &&
        node.properties &&
        'dataPull' in node.properties
      ) {
        // Extract text content from the span
        // Capitalize first letter since pull quotes are standalone statements
        const raw = extractText(node);
        const text = raw.charAt(0).toUpperCase() + raw.slice(1);
        const offset = typeof node.properties.dataPullOffset === 'string'
          ? parseInt(node.properties.dataPullOffset, 10) || 0
          : 0;

        // Find the ancestor paragraph in tree.children
        const pIndex = findAncestorIndex(tree, node);

        if (pIndex !== -1) {
          pullQuotes.push({ text, offset, spanNode: node, parentIndex: pIndex });
        }

        // Unwrap: replace span with its children in parent
        if (parent && typeof index === 'number') {
          parent.children.splice(index, 1, ...node.children);
          return index; // revisit this index since we replaced the node
        }
      }
    });

    // Second pass: insert aside elements (process in reverse order to keep indices stable)
    pullQuotes.sort((a, b) => b.parentIndex - a.parentIndex);

    for (const pq of pullQuotes) {
      const insertIndex = Math.max(0, pq.parentIndex - pq.offset);

      const aside: Element = {
        type: 'element',
        tagName: 'aside',
        properties: { 'aria-hidden': 'true' },
        children: [{ type: 'text', value: pq.text } as Text],
      };

      tree.children.splice(insertIndex, 0, aside as ElementContent);
    }
  };
}

/** Recursively extract text content from a hast node. */
function extractText(node: Element | Text): string {
  if (node.type === 'text') return node.value;
  if ('children' in node) {
    return node.children.map((child) => extractText(child as Element | Text)).join('');
  }
  return '';
}

/** Find the index in tree.children of the ancestor that contains the target node. */
function findAncestorIndex(tree: Root, target: Element): number {
  for (let i = 0; i < tree.children.length; i++) {
    const child = tree.children[i];
    if (child === target) return i;
    if ('children' in child && containsNode(child as Element, target)) {
      return i;
    }
  }
  return -1;
}

/** Check if a node contains the target anywhere in its subtree. */
function containsNode(node: Element, target: Element): boolean {
  if (node === target) return true;
  if ('children' in node) {
    return node.children.some((child) =>
      child.type === 'element' && containsNode(child as Element, target)
    );
  }
  return false;
}

const articlesDirectory = path.join(process.cwd(), 'src/articles');

export interface PostFrontmatter {
  date: string;
  title: string;
  author: string;
  tags: string[];
  image?: string;
  link?: string;
  draft?: boolean;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  excerpt: string;
}

export interface PostWithHtml extends Post {
  html: string;
}

export function getAllPosts(): Post[] {
  const dirs = fs.readdirSync(articlesDirectory);

  const posts = dirs
    .filter((dir) => {
      const fullPath = path.join(articlesDirectory, dir, 'index.md');
      return fs.existsSync(fullPath);
    })
    .map((dir) => {
      const fullPath = path.join(articlesDirectory, dir, 'index.md');
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      const frontmatter = data as PostFrontmatter;

      const slug = slugify(frontmatter.title, { lower: true });

      // Generate excerpt: strip markdown links → text only, strip remaining
      // markup, trim to last word boundary ≤ 250 chars, append ellipsis.
      const plainText = content
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) → text
        .replace(/<[^>]+>/g, ' ')                  // HTML tags → space
        .replace(/[#*_`>~]/g, '')                  // remaining markdown symbols
        .replace(/\s+/g, ' ')
        .trim();

      let excerpt: string;
      if (plainText.length <= 250) {
        excerpt = plainText;
      } else {
        const truncated = plainText.substring(0, 250);
        const lastSpace = truncated.lastIndexOf(' ');
        excerpt = (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '\u2026';
      }

      return {
        slug,
        frontmatter,
        content,
        excerpt,
      };
    });

  // Filter out drafts in production
  const filtered = process.env.NODE_ENV === 'development'
    ? posts
    : posts.filter((p) => !p.frontmatter.draft);

  // Sort by date descending
  filtered.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime();
    const dateB = new Date(b.frontmatter.date).getTime();
    return dateB - dateA;
  });

  return filtered;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

export async function getPostBySlug(slug: string): Promise<PostWithHtml | null> {
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;
  if (post.frontmatter.draft && process.env.NODE_ENV !== 'development') return null;

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypePullQuotes)
    .use(rehypeAsideRole)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(post.content);
  const contentHtml = processedContent.toString();

  return {
    ...post,
    html: contentHtml,
  };
}
