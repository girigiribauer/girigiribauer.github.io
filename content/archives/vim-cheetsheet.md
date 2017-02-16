+++
layout = "archives"
categories = [
  "tech",
]
tags = [
]
draft = true
author = "girigiribauer"
date = "2017-01-23T15:22:44+09:00"
title = "オレオレ Vim cheetsheet"

+++
あまり使いこなせてなかったものを書き溜めておき、ある程度溜まったらリリースする予定。

ちなみに大抵のものは **そのまま help 引けるようになっています。**
`c_CTRL-R` であればコマンドモードにおける Ctrl + R キーを表しています。
Vim 上で `:h c_CTRL-R` と入力すると幸せになれると思います。



## ジャンプ、移動系 {#jump}

| keybind | result | memo |
|---|---|---|
| CTRL-]  | 定義元へジャンプ | 基本、もっと使いこなしたい |
| CTRL-T  | 古いジャンプリストへジャンプ |
| CTRL-O  | 古いジャンプリストへジャンプ |
| CTRL-I  | 新しいジャンプリストへジャンプ |
| ''  | 直前のジャンプリストへジャンプ |



## ヤンク、ペースト系 {#yank}

| keybind | result | memo |
|---|---|---|
| c_CTRL-R "  | コマンドモード上でペースト | ダブルクオートが unnamed register |



## 補完系 {#completion}

| keybind | result | memo |
|---|---|---|
| i_CTRL-X_CTRL-K  | カーソル上の単語から辞書検索 | |



## Denite / Unite 系 {#denite}


