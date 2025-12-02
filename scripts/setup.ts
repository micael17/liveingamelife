/**
 * Google OAuth 설정 도우미
 * 최초 1회만 실행하면 됩니다.
 */
import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BLOG_URL = process.env.BLOG_URL || 'https://liveingamelife.blogspot.com';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              🔧 Google API 설정 가이드                          ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  1. Google Cloud Console 접속                                  ║
║     https://console.cloud.google.com                          ║
║                                                                ║
║  2. 새 프로젝트 생성 또는 기존 프로젝트 선택                     ║
║                                                                ║
║  3. API 및 서비스 > 라이브러리 > "Blogger API" 검색 > 사용 설정  ║
║                                                                ║
║  4. API 및 서비스 > 사용자 인증 정보 > OAuth 클라이언트 ID 만들기 ║
║     - 애플리케이션 유형: 데스크톱 앱                            ║
║     - 리디렉션 URI: http://localhost:3000/oauth2callback       ║
║                                                                ║
║  5. .env 파일에 Client ID와 Secret 입력:                        ║
║     GOOGLE_CLIENT_ID=your_client_id                            ║
║     GOOGLE_CLIENT_SECRET=your_client_secret                    ║
║                                                                ║
║  6. 다시 실행: pnpm setup                                       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

const scopes = ['https://www.googleapis.com/auth/blogger'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent',
});

console.log('\n🔐 브라우저에서 다음 URL을 열어 인증하세요:\n');
console.log(authUrl);
console.log('\n⏳ 인증 대기 중...\n');

const server = http.createServer(async (req, res) => {
  const queryObject = url.parse(req.url!, true).query;
  const code = queryObject.code as string;

  if (code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Blog ID 조회
      const blogger = google.blogger({ version: 'v3', auth: oauth2Client });
      const blogResponse = await blogger.blogs.getByUrl({ url: BLOG_URL });
      const blogId = blogResponse.data.id;

      // .env 파일 업데이트
      let envContent = fs.readFileSync('.env.example', 'utf-8');
      envContent = envContent
        .replace('your_client_id', CLIENT_ID)
        .replace('your_client_secret', CLIENT_SECRET)
        .replace('your_refresh_token', tokens.refresh_token || '')
        .replace('BLOG_ID=', `BLOG_ID=${blogId}`);

      fs.writeFileSync('.env', envContent);

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>✅ 인증 완료!</h1>
            <p>이 창을 닫고 터미널로 돌아가세요.</p>
            <p style="color: green;">Blog ID: ${blogId}</p>
          </body>
        </html>
      `);

      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ✅ 설정 완료!                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Blog ID: ${blogId?.padEnd(48)}║
║  .env 파일이 생성되었습니다.                                    ║
║                                                                ║
║  이제 다음 명령어를 사용할 수 있습니다:                          ║
║  - pnpm sync        : 기존 글 전체 백업                         ║
║  - pnpm publish     : 새 글 발행                                ║
║  - pnpm update      : 글 수정                                   ║
║  - pnpm theme:backup: 테마 백업                                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);

      server.close();
      process.exit(0);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('인증 실패');
      console.error('인증 실패:', error);
      server.close();
      process.exit(1);
    }
  }
});

server.listen(3000);
