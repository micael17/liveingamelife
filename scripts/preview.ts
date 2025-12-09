/**
 * 마크다운 글을 HTML로 변환하여 로컬에서 미리보기
 */
import { parseMarkdownFile } from './lib/converter.js';
import http from 'http';
import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'posts');
const PORT = 3333;

function getHtmlTemplate(title: string, content: string, labels: string[]): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - 미리보기</title>
  <style>
    /*
    ================================================
    MINIMAL BLACK & WHITE THEME - Preview
    ================================================
    */
    :root {
      --black: #1A1A1A;
      --white: #FFFFFF;
      --gray-light: #FAFAFA;
      --gray-medium: #888888;
      --gray-border: #E5E5E5;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      color: var(--black);
      background: var(--gray-light);
    }

    .preview-banner {
      background: var(--black);
      color: var(--white);
      padding: 10px 20px;
      text-align: center;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      font-size: 14px;
      font-weight: 500;
    }

    .layout {
      max-width: 1100px;
      margin: 0 auto;
      padding: 20px;
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 30px;
    }

    @media (max-width: 800px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }

    .header {
      background: var(--white);
      padding: 40px 20px;
      text-align: center;
      border-bottom: 1px solid var(--gray-border);
      margin-top: 44px;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
    }

    .header h1 a {
      color: var(--black);
      text-decoration: none;
    }

    .header h1 a:hover {
      opacity: 0.7;
    }

    .main {
      padding: 30px 0;
    }

    .post {
      background: var(--white);
      padding: 35px;
      margin-bottom: 25px;
      border-radius: 8px;
      border: 1px solid var(--gray-border);
    }

    .post-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--black);
    }

    .post-meta {
      color: var(--gray-medium);
      font-size: 13px;
      margin-bottom: 20px;
    }

    .post-body {
      font-size: 16px;
      line-height: 1.9;
      color: var(--black);
    }

    .post-body img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 20px 0;
    }

    .post-body a {
      color: var(--black);
      text-decoration: underline;
    }

    .post-body a:hover {
      opacity: 0.7;
    }

    .post-body pre {
      background: var(--black);
      color: var(--white);
      padding: 20px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 20px 0;
    }

    .post-body code {
      background: var(--gray-light);
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
    }

    .post-body pre code {
      background: none;
      padding: 0;
      color: var(--white);
    }

    .post-labels {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid var(--gray-border);
    }

    .post-labels a {
      display: inline-block;
      padding: 5px 12px;
      margin-right: 8px;
      margin-bottom: 8px;
      background: var(--white);
      color: var(--black);
      text-decoration: none;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid var(--black);
      transition: all 0.15s ease;
    }

    .post-labels a:hover {
      background: var(--black);
      color: var(--white);
    }

    /* 사이드바 */
    .sidebar {
      padding: 30px 0;
    }

    .widget {
      background: var(--white);
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      border: 1px solid var(--gray-border);
    }

    .widget h3 {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--gray-border);
    }

    .widget ul {
      list-style: none;
    }

    .widget li {
      padding: 8px 0;
      border-bottom: 1px solid var(--gray-border);
      font-size: 14px;
    }

    .widget li:last-child {
      border-bottom: none;
    }

    .widget a {
      color: var(--black);
      text-decoration: none;
    }

    .widget a:hover {
      opacity: 0.7;
    }

    .footer {
      text-align: center;
      padding: 40px 20px;
      color: var(--gray-medium);
      font-size: 13px;
    }

    ::selection {
      background: var(--black);
      color: var(--white);
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--gray-light); }
    ::-webkit-scrollbar-thumb { background: var(--black); border-radius: 3px; }
  </style>
</head>
<body>
  <div class="preview-banner">
    📝 미리보기 모드 - Minimal B&W Theme
  </div>

  <header class="header">
    <h1><a href="/">liveingamelife</a></h1>
  </header>

  <div class="layout">
    <main class="main">
      <article class="post">
        <h2 class="post-title">${title}</h2>
        <div class="post-meta">Preview</div>
        <div class="post-body">
          ${content}
        </div>
        ${labels.length > 0 ? `
        <div class="post-labels">
          ${labels.map(l => `<a href="#">${l}</a>`).join('')}
        </div>
        ` : ''}
      </article>
    </main>

    <aside class="sidebar">
      <div class="widget">
        <h3>About</h3>
        <p style="font-size: 14px; color: #666;">게임과 일상을 기록하는 블로그</p>
      </div>
      ${labels.length > 0 ? `
      <div class="widget">
        <h3>Labels</h3>
        <ul>
          ${labels.map(l => `<li><a href="#">${l}</a></li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </aside>
  </div>

  <footer class="footer">
    <p>© liveingamelife</p>
  </footer>
</body>
</html>
  `;
}

function getFileListHtml(files: string[]): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>글 목록 - 미리보기</title>
  <style>
    :root {
      --black: #1A1A1A;
      --white: #FFFFFF;
      --gray-light: #FAFAFA;
      --gray-medium: #888888;
      --gray-border: #E5E5E5;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--gray-light);
      color: var(--black);
      line-height: 1.6;
    }

    .preview-banner {
      background: var(--black);
      color: var(--white);
      padding: 10px 20px;
      text-align: center;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      font-size: 14px;
      font-weight: 500;
    }

    .header {
      background: var(--white);
      padding: 40px 20px;
      text-align: center;
      border-bottom: 1px solid var(--gray-border);
      margin-top: 44px;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--black);
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .file-list {
      background: var(--white);
      padding: 30px;
      border-radius: 8px;
      border: 1px solid var(--gray-border);
    }

    .file-list h2 {
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid var(--gray-border);
      color: var(--black);
    }

    .file-list a {
      display: block;
      padding: 15px;
      border-bottom: 1px solid var(--gray-border);
      color: var(--black);
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .file-list a:last-child {
      border-bottom: none;
    }

    .file-list a:hover {
      background: var(--gray-light);
      padding-left: 20px;
    }

    .file-list a.draft {
      color: var(--gray-medium);
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 8px;
      background: var(--black);
      color: var(--white);
    }

    .footer {
      text-align: center;
      padding: 40px 20px;
      color: var(--gray-medium);
      font-size: 13px;
    }

    ::selection {
      background: var(--black);
      color: var(--white);
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--gray-light); }
    ::-webkit-scrollbar-thumb { background: var(--black); border-radius: 3px; }
  </style>
</head>
<body>
  <div class="preview-banner">
    📝 미리보기 모드 - Minimal B&W Theme
  </div>

  <header class="header">
    <h1>liveingamelife</h1>
  </header>

  <div class="container">
    <div class="file-list">
      <h2>Posts</h2>
      ${files.map(f => {
        const isDraft = f.includes('drafts/');
        return `<a href="/preview/${encodeURIComponent(f)}" class="${isDraft ? 'draft' : ''}">${f}${isDraft ? '<span class="badge">Draft</span>' : ''}</a>`;
      }).join('')}
    </div>
  </div>

  <footer class="footer">
    <p>© liveingamelife</p>
  </footer>
</body>
</html>
  `;
}

function getAllMarkdownFiles(): string[] {
  const files: string[] = [];

  function scanDir(dir: string, prefix: string = '') {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = prefix ? `${prefix}/${item}` : item;
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath, relativePath);
      } else if (item.endsWith('.md')) {
        files.push(relativePath);
      }
    }
  }

  scanDir(POSTS_DIR);
  return files.sort().reverse(); // 최신순
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url!, `http://localhost:${PORT}`);

  if (url.pathname === '/' || url.pathname === '/preview') {
    // 파일 목록
    const files = getAllMarkdownFiles();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getFileListHtml(files));
  } else if (url.pathname.startsWith('/preview/')) {
    // 개별 파일 미리보기
    const fileName = decodeURIComponent(url.pathname.replace('/preview/', ''));
    const filePath = path.join(POSTS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('파일을 찾을 수 없습니다');
      return;
    }

    try {
      const post = parseMarkdownFile(filePath);
      const html = getHtmlTemplate(post.title, post.content, post.labels);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (error) {
      res.writeHead(500);
      res.end(`오류: ${error}`);
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              📖 미리보기 서버 실행 중                            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  URL: http://localhost:${PORT}                                   ║
║                                                                ║
║  posts/ 폴더의 마크다운 파일을 미리볼 수 있습니다.               ║
║  종료: Ctrl+C                                                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});
