#!/bin/sh

# OGP画像を生成
if [ -f "./generate-ogp" ]; then
    ./generate-ogp
fi

hugo server --buildDrafts --buildFuture --port 2424 &
open http://localhost:2424
