#!/bin/sh

# リンクカード用のOGPキャッシュを更新
if [ -f "scripts/fetch-linkcards.mjs" ]; then
    node scripts/fetch-linkcards.mjs
fi

hugo --buildFuture
