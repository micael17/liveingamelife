/**
 * 현재 Blogger 테마를 로컬로 백업
 */
import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const blogger = google.blogger({ version: 'v3', auth: oauth2Client });
const BLOG_ID = process.env.BLOG_ID;
const THEMES_DIR = path.join(process.cwd(), 'themes');
const BACKUP_DIR = path.join(THEMES_DIR, 'backup');

async function backupTheme() {
  console.log('📥 테마 백업 중...\n');

  try {
    // Blogger API는 테마 직접 조회를 지원하지 않아서
    // 대안: 블로그 HTML을 가져와서 저장하거나 수동 복사 안내

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `theme-${timestamp}.xml`);

    // 백업 디렉토리 생성
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║              📋 테마 백업 방법 (수동)                            ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Blogger API는 테마 직접 조회를 지원하지 않습니다.               ║
║  다음 방법으로 수동 백업하세요:                                  ║
║                                                                ║
║  1. Blogger 대시보드 접속                                       ║
║     https://www.blogger.com/blog/themes/${BLOG_ID}             ║
║                                                                ║
║  2. 테마 > 맞춤설정 옆 ▼ 클릭 > "HTML 편집"                      ║
║                                                                ║
║  3. 전체 선택 (Cmd+A) 후 복사 (Cmd+C)                           ║
║                                                                ║
║  4. 아래 파일에 붙여넣기:                                        ║
║     ${backupPath.slice(-50).padEnd(50)}║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);

    // 빈 파일 생성 (사용자가 붙여넣기 할 수 있도록)
    fs.writeFileSync(backupPath, '<!-- 여기에 Blogger 테마 XML을 붙여넣으세요 -->\n');
    console.log(`\n📄 백업 파일 생성됨: ${backupPath}\n`);

  } catch (error) {
    console.error('❌ 백업 실패:', error);
    process.exit(1);
  }
}

backupTheme();
