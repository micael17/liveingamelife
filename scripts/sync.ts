/**
 * Blogger 글 전체를 로컬로 동기화
 * 기존 글을 마크다운 파일로 백업합니다.
 */
import { getAllPosts } from './lib/blogger-client.js';
import { createMarkdownFile, generateFileName } from './lib/converter.js';
import path from 'path';
import fs from 'fs';

const POSTS_DIR = path.join(process.cwd(), 'posts');

async function sync() {
  console.log('📥 Blogger에서 글 가져오는 중...\n');

  try {
    const posts = await getAllPosts();
    console.log(`📄 총 ${posts.length}개의 글을 찾았습니다.\n`);

    // 기존 posts 디렉토리 내용 확인
    const existingFiles = fs.existsSync(POSTS_DIR)
      ? fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))
      : [];

    // postId로 기존 파일 매핑
    const existingPostIds = new Set<string>();
    for (const file of existingFiles) {
      const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
      const match = content.match(/postId:\s*["']?(\d+)["']?/);
      if (match) {
        existingPostIds.add(match[1]);
      }
    }

    let newCount = 0;
    let skipCount = 0;

    for (const post of posts) {
      const fileName = generateFileName(post.title, post.published);
      const filePath = path.join(POSTS_DIR, fileName);

      // 이미 존재하는 글이면 스킵
      if (post.id && existingPostIds.has(post.id)) {
        skipCount++;
        continue;
      }

      createMarkdownFile(filePath, {
        title: post.title,
        content: post.content,
        labels: post.labels,
        postId: post.id,
        published: post.published,
      });

      console.log(`✅ ${fileName}`);
      newCount++;
    }

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    📊 동기화 완료                               ║
╠════════════════════════════════════════════════════════════════╣
║  새로 가져온 글: ${String(newCount).padEnd(43)}║
║  이미 존재하는 글: ${String(skipCount).padEnd(42)}║
║  저장 위치: posts/                                              ║
╚════════════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error('❌ 동기화 실패:', error);
    process.exit(1);
  }
}

sync();
