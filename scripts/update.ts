/**
 * 기존 글 수정
 * 사용법: pnpm update posts/my-post.md
 */
import { updatePost } from './lib/blogger-client.js';
import { parseMarkdownFile, createMarkdownFile } from './lib/converter.js';
import path from 'path';
import fs from 'fs';

async function update() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📝 수정할 파일을 지정하세요.

사용법: pnpm update posts/파일명.md

파일에 postId가 있어야 수정할 수 있습니다.
(pnpm sync로 가져온 파일에는 postId가 포함되어 있습니다)
    `);
    return;
  }

  const filePath = path.resolve(args[0]);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
    process.exit(1);
  }

  try {
    const post = parseMarkdownFile(filePath);

    if (!post.postId) {
      console.error('❌ postId가 없습니다. 새 글이라면 pnpm publish를 사용하세요.');
      process.exit(1);
    }

    console.log(`\n📝 수정 중: ${post.title}\n`);

    await updatePost(post.postId, {
      title: post.title,
      content: post.content,
      labels: post.labels,
    });

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ✅ 수정 완료!                                ║
╠════════════════════════════════════════════════════════════════╣
║  제목: ${post.title.slice(0, 52).padEnd(52)}║
║  Post ID: ${post.postId.padEnd(49)}║
╚════════════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error('❌ 수정 실패:', error);
    process.exit(1);
  }
}

update();
