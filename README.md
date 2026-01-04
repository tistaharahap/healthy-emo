# healthy-emo

A Next.js 16 journal app for tracking feelings with monthly summaries.

## Setup

```bash
bun install
```

Create a `.env.local` based on `.env.example`.

For Cloudflare R2, set:
- `S3_ENDPOINT` to `https://<accountid>.r2.cloudflarestorage.com`
- `S3_PUBLIC_BASE_URL` to your public bucket URL or custom domain. If you use the
  R2 API endpoint, include the bucket in the path:
  `https://<accountid>.r2.cloudflarestorage.com/<bucket>`
- `S3_REGION` to `auto`

```bash
bun run dev
```
