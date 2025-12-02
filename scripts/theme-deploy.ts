/**
 * 로컬 테마를 Blogger에 적용
 * 주의: Blogger API는 테마 업로드를 지원하지 않아 수동 안내
 */
import fs from 'fs';
import path from 'path';

const THEMES_DIR = path.join(process.cwd(), 'themes');

async function deployTheme() {
  const args = process.argv.slice(2);
  let themePath: string;

  if (args.length === 0) {
    // 기본 테마 파일 찾기
    const themeFile = path.join(THEMES_DIR, 'my-theme.xml');
    if (fs.existsSync(themeFile)) {
      themePath = themeFile;
    } else {
      // themes 폴더의 xml 파일 목록 출력
      const xmlFiles = fs.existsSync(THEMES_DIR)
        ? fs.readdirSync(THEMES_DIR).filter(f => f.endsWith('.xml') && !f.includes('backup'))
        : [];

      if (xmlFiles.length === 0) {
        console.log(`
📝 배포할 테마 파일이 없습니다.

테마 파일 생성:
  themes/my-theme.xml 파일을 만들거나
  기존 테마를 백업(pnpm theme:backup)한 후 수정하세요.
        `);
        return;
      }

      console.log('\n📋 사용 가능한 테마 파일:\n');
      xmlFiles.forEach(f => console.log(`  - themes/${f}`));
      console.log('\n사용법: pnpm theme:deploy themes/파일명.xml\n');
      return;
    }
  } else {
    themePath = path.resolve(args[0]);
  }

  if (!fs.existsSync(themePath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${themePath}`);
    process.exit(1);
  }

  const themeContent = fs.readFileSync(themePath, 'utf-8');

  // 클립보드에 복사 (macOS)
  const { execSync } = await import('child_process');
  try {
    execSync('pbcopy', { input: themeContent });
    console.log('\n✅ 테마 내용이 클립보드에 복사되었습니다!\n');
  } catch {
    console.log('\n⚠️  클립보드 복사 실패. 수동으로 복사하세요.\n');
  }

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              📤 테마 적용 방법                                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  1. Blogger 대시보드 접속                                       ║
║     https://www.blogger.com/blog/themes/${process.env.BLOG_ID} ║
║                                                                ║
║  2. 테마 > 맞춤설정 옆 ▼ 클릭 > "HTML 편집"                      ║
║                                                                ║
║  3. 전체 선택 (Cmd+A) 후 붙여넣기 (Cmd+V)                        ║
║     (클립보드에 이미 복사됨)                                     ║
║                                                                ║
║  4. 💾 저장 버튼 클릭                                           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

deployTheme();
