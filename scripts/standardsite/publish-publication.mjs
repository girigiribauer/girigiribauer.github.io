// publication（刊行物）の札を倉庫に投入する。
// rkey は "self" 固定。ほぼ1回だけ実行すればよい（名前/説明を変えたら再実行）。
// 使い方:
//   node --env-file=../../.env publish-publication.mjs --dry-run   # 中身を見るだけ
//   node --env-file=../../.env publish-publication.mjs             # 実際に put
import { AtpAgent } from '@atproto/api'
import { readFile } from 'node:fs/promises'

const RKEY = 'self'
// カード左下のロゴ。favicon と同じ絵柄を 256x256 PNG にしたもの（正方形・256px 以上が推奨）。
const ICON_PATH = new URL('./icon.png', import.meta.url)
const PUBLICATION = {
  $type: 'site.standard.publication',
  url: 'https://girigiribauer.com',
  name: 'ばうあーろぐ',
  description: 'IT / Web に関するメモ、あるいは Twentyfour あるいは人生の diff',
  preferences: { showInDiscover: true },
}

const handle = process.env.BSKY_HANDLE
const password = process.env.BSKY_APP_PASSWORD
if (!handle || !password) {
  console.error('NG: BSKY_HANDLE / BSKY_APP_PASSWORD が未設定です（.env を確認）')
  process.exit(1)
}
const dryRun = process.argv.includes('--dry-run')

const agent = new AtpAgent({ service: 'https://bsky.social' })
await agent.login({ identifier: handle, password })
const did = agent.session.did

// icon（ロゴ画像）を blob として倉庫にアップロードし、レコードに添付する。
// dry-run では blob アップロード自体も「書き込み」なので行わず、添付予定だけ伝える。
if (!dryRun) {
  const iconBytes = await readFile(ICON_PATH)
  const { data } = await agent.uploadBlob(iconBytes, { encoding: 'image/png' })
  PUBLICATION.icon = data.blob
}

console.log('publication record:')
console.log(JSON.stringify(PUBLICATION, null, 2))
console.log(`→ at://${did}/site.standard.publication/${RKEY}`)

if (dryRun) {
  console.log(`[dry-run] icon (${ICON_PATH.pathname.split('/').pop()}) は未アップロード。本実行時に添付されます`)
  console.log('[dry-run] 書き込みはしていません')
  process.exit(0)
}

await agent.com.atproto.repo.putRecord({
  repo: did,
  collection: 'site.standard.publication',
  rkey: RKEY,
  record: PUBLICATION,
  validate: false,
})
console.log('OK: publication を put しました')
