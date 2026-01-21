---
title: "FF HDR Splicer"
date: 2026-01-21
description: "HDR動画専用の簡易的な動画編集デスクトップアプリ"
layout: "projects"
image: "icon.png"
link: "https://github.com/girigiribauer/ff-hdr-splicer/releases"
github: "https://github.com/girigiribauer/ff-hdr-splicer"
---

内部に FFmpeg を内包した、HDR動画専用の簡易的な動画編集デスクトップアプリです。 FFmpeg でできる範囲のみカバーします。

## 使い方

- Windows, Mac ともに署名されてないデスクトップアプリなので、自己判断・自己責任の上インストールしてください
- 署名なしのため、インストール自体も一癖あります
    - 詳しくは GitHub の README を参照

![FF HDR Splicer](resource01.png)

- HDR 動画をドラッグ＆ドロップしてください
- SDR （通常の動画）は動きません、他の編集ソフトを使ってください

![FF HDR Splicer](resource02.png)

- 左上にあるフェードイン・アウトボタンを押すと、動画全体の先頭・末尾にフェードイン・アウトが追加されます
- 左下にあるクロスフェードボタンを押すと、切り取った区間の間にまとめてクロスフェードが追加されます
    - 個別にはできません。つけるかつけないかの2択です
- 編集後に右上の export ボタンを押すと書き出しされます
    - HDR動画なのでそれなりに時間がかかります

## おまけ

無料のHDR動画編集ツールが意外となくて、あったとしても本当に最低限のカットのみでした。

一方で FFmpeg ではHDR動画のフェードイン・フェードアウト・クロスフェードの加工がコマンドライン経由でできるのに対して、どこでフェードをかけたらいいのか？のGUIが足りてない状態でした。

そこで GUI でフェードの位置を特定して、処理を FFmpeg に投げて結果を受け取るだけのデスクトップアプリを作った次第です。
