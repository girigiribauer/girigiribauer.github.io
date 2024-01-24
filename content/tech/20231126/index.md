+++
title = "メモ: テザリングしながら iOS で実機ビルドはできなかった"
description = "テザリングをオフって有線で繋いでおけば大丈夫でしたというメモ、あるいはテザリングした状態で有線を繋がない状態ならば実機ビルドが可能というメモ"
date = "2023-11-26T13:00:00+0900"
lastmod = "2024-01-24T21:40:00+0900"
draft = false
tags = ["Xcode"]
+++

もはやタイトルと説明文の通りなんですが、いつからか分からないものの、テザリングをオンにしながら Xcode を立ち上げると、実機が認識されません。

テザリングをオフにして、 Wi-Fi 同一ネットワークか優先でつなぐかしておくと、実機が認識されます。

ただ、誤解のないよう言っておくと、昨今 Xcode で階発用端末として認識される手順はめっちゃ簡単になっています。

1. 端末の方でデベロッパーモードを ON にして再起動する（正確には再起動直後に ON にする）
2. 有線または無線で同一ネットワークにつなぐ

マジでこれだけで感動しています！ :face_with_tears_of_joy:

繋げたらあとは勝手にやってくれるので、昔の端末を登録してうんぬんの作業から比較すると雲泥の差があります。超楽チンです。 :hugging_face:

## どうやらテザリングで Mac を繋いでいると、同一ネットワークと認識されないらしい

同一ネットワークと認識されないと、以下のエラーメッセージが出ます。

エラーメッセージでググる人もいるでしょうから、エラーメッセージも載せておきます。

![no eligible devices connected to 'My Mac'](resource01.png)

> no eligible devices connected to 'My Mac'

対象デバイスがないらしいです。

---

![Browsing on the local area network for xxx](resource02.png)

> Browsing on the local area network for xxx
>
> Ensure the device is unlocked and attached with a cable or associated with the same local area network as this Mac.
> The device must be opted into Developer Mode to connect wirelessly.

ロックを解除しろ、同一ネットワークにつなげ、デベロッパーモードにしろ、くらいしか言われてません :pleading_face:

## まとめ

たぶん賢い人はググってタイトルを見た瞬間に、なるほどと言って解決することでしょう。完。

## 2024/01/24 追記

今日初めて気づいたのですが、実はテザリングしながら実機ビルドする方法が見つかりまして、 **有線に繋ぎさえしなければ、無線で実機ビルドまでいけた** のでした。なんと・・・！

いつも PC 経由で充電しながらテザリングもやっていたので、先にテザリングで繋いでから、有線して充電する（先に有線で繋ぐと、接続したときだけテザリング状態になり、後で困る）という流れで接続をしていたんですよね。

なので、 **テザリングの無線だけで実機ビルドが出来ることに気づきませんでした・・・！** なんと便利な時代に :hugging_face:
