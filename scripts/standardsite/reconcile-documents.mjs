// document（記事ごとの札）を倉庫と同期する。
// Hugo が出力した public/standardsite.json を「あるべき状態」として、
// 倉庫の既存 document と突き合わせ、差分（新規/更新/削除）だけを applyWrites で反映する。
// 使い方:
//   node --env-file=../../.env reconcile-documents.mjs --dry-run   # 差分を見るだけ
//   node --env-file=../../.env reconcile-documents.mjs             # 新規/更新を反映
//   node --env-file=../../.env reconcile-documents.mjs --prune     # 記事が消えた札の削除も行う
import { AtpAgent } from '@atproto/api'
import { readFile } from 'node:fs/promises'

const COLLECTION = 'site.standard.document'
const JSON_PATH = process.env.STANDARDSITE_JSON ?? '../../public/standardsite.json'

const handle = process.env.BSKY_HANDLE
const password = process.env.BSKY_APP_PASSWORD
if (!handle || !password) {
  console.error('NG: BSKY_HANDLE / BSKY_APP_PASSWORD が未設定です（.env を確認）')
  process.exit(1)
}
const dryRun = process.argv.includes('--dry-run')
const prune = process.argv.includes('--prune')

const agent = new AtpAgent({ service: 'https://bsky.social' })
await agent.login({ identifier: handle, password })
const did = agent.session.did
const pubUri = `at://${did}/site.standard.publication/self`

// 1. あるべき状態（Hugo の JSON から）
const docs = JSON.parse(await readFile(new URL(JSON_PATH, import.meta.url), 'utf8'))
const desired = new Map()
for (const d of docs) {
  desired.set(d.rkey, {
    $type: COLLECTION,
    site: pubUri,
    title: d.title,
    path: d.path,
    description: d.description,
    publishedAt: d.publishedAt,
    tags: d.tags ?? [],
  })
}

// 2. 現状（倉庫の既存 document を全取得）
const existing = new Map()
let cursor
do {
  const res = await agent.com.atproto.repo.listRecords({ repo: did, collection: COLLECTION, limit: 100, cursor })
  for (const r of res.data.records) {
    existing.set(r.uri.split('/').pop(), r.value)
  }
  cursor = res.data.cursor
} while (cursor)

// 3. 差分判定（管理対象フィールドだけを正規化して比較）
const canon = (v) => JSON.stringify({
  site: v.site, title: v.title, path: v.path,
  description: v.description, publishedAt: v.publishedAt, tags: v.tags ?? [],
})
const writes = []
let nCreate = 0, nUpdate = 0, nSkip = 0, nDelete = 0
for (const [rkey, value] of desired) {
  if (!existing.has(rkey)) {
    writes.push({ $type: 'com.atproto.repo.applyWrites#create', collection: COLLECTION, rkey, value })
    nCreate++
  } else if (canon(existing.get(rkey)) !== canon(value)) {
    writes.push({ $type: 'com.atproto.repo.applyWrites#update', collection: COLLECTION, rkey, value })
    nUpdate++
  } else {
    nSkip++
  }
}
for (const rkey of existing.keys()) {
  if (!desired.has(rkey) && prune) {
    writes.push({ $type: 'com.atproto.repo.applyWrites#delete', collection: COLLECTION, rkey })
    nDelete++
  }
}

const orphan = [...existing.keys()].filter((k) => !desired.has(k)).length
console.log(`記事(JSON): ${desired.size} 件 / 倉庫の既存: ${existing.size} 件`)
console.log(`差分 → 新規 ${nCreate} / 更新 ${nUpdate} / 変更なし ${nSkip} / 削除 ${nDelete}` +
  (prune ? '' : `（--prune 未指定。倉庫に残る孤立札 ${orphan} 件は削除しません）`))
for (const w of writes.slice(0, 5)) {
  console.log(`  例: ${w.$type.split('#')[1].padEnd(6)} ${w.rkey}`)
}

if (writes.length === 0) {
  console.log('反映するものはありません')
  process.exit(0)
}
if (dryRun) {
  console.log('[dry-run] 書き込みはしていません')
  process.exit(0)
}

// 4. applyWrites で一括反映（1回最大200件）
for (let i = 0; i < writes.length; i += 200) {
  const batch = writes.slice(i, i + 200)
  await agent.com.atproto.repo.applyWrites({ repo: did, validate: false, writes: batch })
  console.log(`  applyWrites ${i + 1}〜${i + batch.length} 件 完了`)
}
console.log('OK: document の同期が完了しました')
