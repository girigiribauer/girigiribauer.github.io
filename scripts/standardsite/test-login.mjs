// 認証だけを確認する最小テスト。
// App Password でログインし、自分の DID / handle が取れるかを表示する。
// （パスワードは一切出力しない）
import { AtpAgent } from '@atproto/api'

const handle = process.env.BSKY_HANDLE
const password = process.env.BSKY_APP_PASSWORD

if (!handle || !password) {
  console.error('NG: BSKY_HANDLE / BSKY_APP_PASSWORD が未設定です（.env を確認）')
  process.exit(1)
}

const agent = new AtpAgent({ service: 'https://bsky.social' })

try {
  await agent.login({ identifier: handle, password })
  console.log('OK: ログイン成功')
  console.log('  handle :', agent.session?.handle)
  console.log('  DID    :', agent.session?.did)
} catch (err) {
  console.error('NG: ログイン失敗:', err?.message ?? err)
  process.exit(1)
}
