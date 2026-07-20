# MODU

AI 쇼핑 동반자 — 자연어로 원하는 상품을 말하면 AI가 조건을 해석하고 여러 쇼핑몰의 가격을 비교해 보여줍니다.

- **프런트엔드**: React (Vite + TypeScript + Tailwind CSS)
- **백엔드**: Python FastAPI
- **상품 데이터**: 네이버 쇼핑 검색 API
- **AI 질의 해석**: Anthropic Claude API
- **DB / 인증**: PostgreSQL(Supabase/Neon 등) + SQLAlchemy(async) + httpOnly 쿠키 JWT

## 1. API 키 발급

### 네이버 쇼핑 검색 API
1. [네이버 개발자센터](https://developers.naver.com/apps/#/register)에서 애플리케이션 등록
2. 사용 API에서 "검색" 선택 (네이버 로그인은 선택하지 않음)
3. 발급된 Client ID / Client Secret 확인

### Anthropic Claude API
1. [Anthropic Console](https://console.anthropic.com/)에서 API 키 발급

### PostgreSQL (회원가입/검색기록 저장용)
로컬에 DB를 설치하지 않고 클라우드 무료 티어를 사용합니다.

1. [Supabase](https://supabase.com/) 또는 [Neon](https://neon.tech/)에서 무료 프로젝트 생성
2. 발급된 연결 문자열(connection string)을 확인하고, 드라이버 부분을 `asyncpg`로 바꿔서 사용:
   ```
   postgresql+asyncpg://<user>:<password>@<host>:<port>/<dbname>
   ```
   (Supabase/Neon이 기본으로 주는 `postgresql://...` 형식에서 `postgresql` 뒤에 `+asyncpg`만 추가하면 됩니다)
3. `.env`의 `DATABASE_URL`에 입력. 앱 실행 시 테이블(`users`, `search_history`)이 자동 생성됩니다(별도 마이그레이션 불필요).

### JWT 시크릿 키
로그인 세션 토큰 서명에 사용하는 임의의 문자열입니다. 터미널에서 생성:
```bash
openssl rand -hex 32
```
결과값을 `.env`의 `JWT_SECRET_KEY`에 입력합니다.

> `DATABASE_URL`을 비워두면 회원가입/로그인/검색기록 기능만 비활성화되고, 검색·가격비교 기능은 그대로 동작합니다.

## 2. 백엔드 실행

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# .env 파일에 NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, ANTHROPIC_API_KEY,
# DATABASE_URL, JWT_SECRET_KEY 입력

uvicorn app.main:app --reload --port 8000
```

백엔드 테스트: `pytest`

> **Windows에서 `greenlet` DLL 오류가 나는 경우**: [Microsoft Visual C++ 재배포 패키지(x64)](https://aka.ms/vs/17/release/vc_redist.x64.exe)를 설치한 뒤 터미널을 재시작하세요.

## 3. 프런트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속. `/api` 요청은 Vite 프록시를 통해 `http://localhost:8000`으로 전달됩니다.

## 4. 배포 (Vercel + Render + modu.run)

프런트엔드는 Vercel, 백엔드는 Render에 올리고 `modu.run` 도메인을 연결합니다.
- `modu.run`, `www.modu.run` → Vercel (프런트엔드)
- `api.modu.run` → Render (백엔드)

### 4-1. GitHub 저장소 준비
Vercel/Render 둘 다 GitHub 저장소를 연결해 배포합니다. GitHub에서 새 저장소를 만든 뒤:
```bash
git remote add origin <저장소 URL>
git branch -M main
git push -u origin main
```

### 4-2. 백엔드 (Render)
1. [Render](https://render.com) → New → Web Service → 방금 만든 GitHub 저장소 선택
2. 설정값:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
3. Environment 탭에서 `.env`에 있는 값을 그대로 옮기고, 아래 값을 추가/변경:
   | 키 | 값 |
   |---|---|
   | `CORS_ORIGINS` | `["https://modu.run","https://www.modu.run"]` |
   | `COOKIE_DOMAIN` | `.modu.run` |
   | `COOKIE_SECURE` | `true` |
4. 배포 완료 후 Render 대시보드 → Settings → Custom Domains에서 `api.modu.run` 추가 → 화면에 표시되는 CNAME 값을 도메인 DNS에 등록

### 4-3. 프런트엔드 (Vercel)
1. [Vercel](https://vercel.com) → Add New → Project → 같은 GitHub 저장소 선택
2. 설정값:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (자동 감지)
3. Environment Variables에 추가 (Production):
   | 키 | 값 |
   |---|---|
   | `VITE_API_URL` | `https://api.modu.run` |
4. 배포 완료 후 Vercel 대시보드 → Settings → Domains에서 `modu.run`, `www.modu.run` 추가 → 화면에 표시되는 A/CNAME 레코드를 도메인 DNS에 등록

### 4-4. 확인
DNS가 전파된 뒤(수 분~수 시간) `https://modu.run`에서 회원가입 → 로그인 → 검색 → 검색기록까지 정상 동작하는지 확인합니다.

## 프로젝트 구조

```
MODU/
├── backend/    # FastAPI 백엔드
├── frontend/   # React 프런트엔드
└── README.md
```

## 현재 범위

- 자연어 검색 → AI 조건 해석 → 가격비교 결과 표시
- 회원가입 / 로그인 / 로그아웃 (httpOnly 쿠키 기반 세션)
- 로그인 사용자의 검색 기록 저장 및 조회
- Vercel(프런트) + Render(백엔드) + modu.run 도메인 배포

다음 단계(수익화 등)는 이후 진행 예정입니다.
