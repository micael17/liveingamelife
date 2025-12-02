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
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    .preview-banner {
      background: #ff6b6b;
      color: white;
      padding: 10px 20px;
      text-align: center;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      font-size: 14px;
    }
    article {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-top: 50px;
    }
    h1 { margin-top: 0; color: #333; }
    .labels {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .label {
      background: #e9ecef;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      color: #666;
    }
    img { max-width: 100%; height: auto; }
    pre {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    pre code { background: none; padding: 0; }
    .file-list {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      margin-top: 50px;
    }
    .file-list h2 { margin-top: 0; }
    .file-list a {
      display: block;
      padding: 10px;
      border-bottom: 1px solid #eee;
      color: #333;
      text-decoration: none;
    }
    .file-list a:hover { background: #f8f9fa; }
  </style>
</head>
<body>
  <div class="preview-banner">
    📝 미리보기 모드 - 실제 Blogger 스타일과 다를 수 있습니다
  </div>
  <article>
    <h1>${title}</h1>
    ${labels.length > 0 ? `
    <div class="labels">
      ${labels.map(l => `<span class="label">${l}</span>`).join('')}
    </div>
    ` : ''}
    ${content}
  </article>
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
  <title>글 목록 - 미리보기</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    .file-list {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 { margin-top: 0; }
    a {
      display: block;
      padding: 15px;
      border-bottom: 1px solid #eee;
      color: #333;
      text-decoration: none;
    }
    a:hover { background: #f8f9fa; }
    .draft { color: #999; }
  </style>
</head>
<body>
  <div class="file-list">
    <h1>📋 글 목록</h1>
    ${files.map(f => {
      const isDraft = f.includes('drafts/');
      return `<a href="/preview/${encodeURIComponent(f)}" class="${isDraft ? 'draft' : ''}">${f} ${isDraft ? '(초안)' : ''}</a>`;
    }).join('')}
  </div>
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
