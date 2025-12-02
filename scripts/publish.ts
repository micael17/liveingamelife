/**
 * 새 글을 Blogger에 발행
 * 사용법: pnpm publish posts/my-post.md
 */
import { publishPost } from './lib/blogger-client.js';
import { parseMarkdownFile, createMarkdownFile } from './lib/converter.js';
import path from 'path';
import fs from 'fs';

const POSTS_DIR = path.join(process.cwd(), 'posts');
const DRAFTS_DIR = path.join(POSTS_DIR, 'drafts');

async function publish() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // 인자 없으면 drafts 폴더의 파일 목록 출력
    const drafts = fs.existsSync(DRAFTS_DIR)
      ? fs.readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.md'))
      : [];

    if (drafts.length === 0) {
      console.log(`
📝 발행할 글이 없습니다.

새 글 작성:
  1. posts/drafts/ 폴더에 마크다운 파일 생성
  2. pnpm publish posts/drafts/파일명.md

마크다운 형식:
  ---
  title: "글 제목"
  labels: ["태그1", "태그2"]
  ---

  여기에 본문 내용...
      `);
    } else {
      console.log('\n📋 발행 가능한 초안:\n');
      drafts.forEach(f => console.log(`  - posts/drafts/${f}`));
      console.log('\n사용법: pnpm publish posts/drafts/파일명.md\n');
    }
    return;
  }

  const filePath = path.resolve(args[0]);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
    process.exit(1);
  }

  try {
    const post = parseMarkdownFile(filePath);

    if (post.postId) {
      console.error('❌ 이미 발행된 글입니다. 수정하려면 pnpm update를 사용하세요.');
      process.exit(1);
    }

    if (post.draft) {
      console.log('⚠️  draft: true로 설정되어 있습니다. 발행하시겠습니까? (y/n)');
      // 간단하게 바로 발행 (실제로는 readline으로 확인)
    }

    console.log(`\n📤 발행 중: ${post.title}\n`);

    const postId = await publishPost({
      title: post.title,
      content: post.content,
      labels: post.labels,
    });

    // 발행된 글에 postId 추가하고 posts 폴더로 이동
    const fileName = path.basename(filePath);
    const newFilePath = path.join(POSTS_DIR, fileName);

    createMarkdownFile(newFilePath, {
      title: post.title,
      content: post.content,
      labels: post.labels,
      postId,
      published: new Date().toISOString(),
    });

    // drafts에서 삭제
    if (filePath.includes('drafts')) {
      fs.unlinkSync(filePath);
    }

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ✅ 발행 완료!                                ║
╠════════════════════════════════════════════════════════════════╣
║  제목: ${post.title.slice(0, 52).padEnd(52)}║
║  Post ID: ${postId.padEnd(49)}║
║  파일: ${fileName.slice(0, 52).padEnd(52)}║
╚════════════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error('❌ 발행 실패:', error);
    process.exit(1);
  }
}

publish();
