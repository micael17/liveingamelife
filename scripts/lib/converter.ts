import { marked } from 'marked';
import TurndownService from 'turndown';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// HTML → Markdown
export function htmlToMarkdown(html: string): string {
  return turndown.turndown(html);
}

// Markdown → HTML
export function markdownToHtml(markdown: string): string {
  return marked(markdown) as string;
}

// 마크다운 파일 파싱 (frontmatter 포함)
export interface ParsedPost {
  title: string;
  content: string;
  labels: string[];
  postId?: string;
  draft: boolean;
}

export function parseMarkdownFile(filePath: string): ParsedPost {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    title: data.title || path.basename(filePath, '.md'),
    content: markdownToHtml(content),
    labels: data.labels || data.tags || [],
    postId: data.postId,
    draft: data.draft || false,
  };
}

// 마크다운 파일 생성
export function createMarkdownFile(
  filePath: string,
  post: {
    title: string;
    content: string;
    labels?: string[];
    postId?: string;
    published?: string;
  }
): void {
  const frontmatter: Record<string, unknown> = {
    title: post.title,
    labels: post.labels || [],
  };

  if (post.postId) {
    frontmatter.postId = post.postId;
  }

  if (post.published) {
    frontmatter.date = post.published;
  }

  const markdown = htmlToMarkdown(post.content);
  const fileContent = matter.stringify(markdown, frontmatter);

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, fileContent);
}

// 파일명 생성 (날짜-제목.md)
export function generateFileName(title: string, date?: string): string {
  const dateStr = date
    ? new Date(date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  return `${dateStr}-${slug}.md`;
}
