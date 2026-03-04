import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import slugify from 'slugify';

const articlesDirectory = path.join(process.cwd(), 'src/articles');

export interface PostFrontmatter {
  date: string;
  title: string;
  author: string;
  tags: string[];
  image?: string;
  link?: string;
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

  // Sort by date descending
  posts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime();
    const dateB = new Date(b.frontmatter.date).getTime();
    return dateB - dateA;
  });

  return posts;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

export async function getPostBySlug(slug: string): Promise<PostWithHtml | null> {
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(post.content);
  const contentHtml = processedContent.toString();

  return {
    ...post,
    html: contentHtml,
  };
}
