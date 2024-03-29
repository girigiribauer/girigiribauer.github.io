---
title: 大なごやJS vol.5 で『WebRTC + Web Audio API = スーパーサイヤ人』のネタを話してきた
author: girigiribauer
date: 2013-02-24T09:16:03+00:00
categories:
  - tech
tags:
  - Canvas
  - getUserMedia
  - WebAudioAPI
  - WebRTC
aliases:
  - '/archives/834'
---
とりあえず各セッションの感想などは一旦置いといて、 自分の発表したやつだけ、軽くまとめておきます。

当日発表した資料は slideshare にアップしてあります。

[WebRTC + Web Audio API = スーパーサイヤ人(slideshare)][1]

また、発表用に作った実験コンテンツは以下にアップしてあります。

~~なれる！スーパーサイヤ人！~~

Twitterのまとめは以下です。

[大なごやJS vol.5 (#daiNagoyaJS) (togetter)][2]

## WebRTC + Web Audio API = スーパーサイヤ人

資料を見ていただければ分かるように、前々回の（約7か月前）大なごやJSで発表した内容にずっと心残りがあって、 ライブ音声入力を検知してコンテンツの変化をさせる、というのをずっとやりたかったのでした。

今回、getUserMedia と Web Audio API との連携が出来るようになり、 ようやくライブ音声入力の検知を使ったコンテンツが実装できるようになったので、 満を持しての実験コンテンツとなります。

会場では、**「はあああああ！！！！」と叫んで、スーパーサイヤ人に変身できて、とても満足**でした。

## ライブ音声入力とは

また細かい話はおいおいまとめていくとして、ポイントだけさらっと触れておこうと思います。

もちろん、今現在の chrome では、getUserMedia や Web Audio API のそれぞれ単体では、すでに実装されています。

ただ、それをつなぐ方法が前回の発表時には無かったため、「はああああ！！！」と叫ぶところを、 **まさかのクリックで代用**という暴挙に出てしまったわけですが、 今回はそれをきちんと実装できて、「はああああ！！！」と叫んで変身することができました。

chrome://flags の中に、『getUserMedia と Web Audio API を使ったライブ音声入力』の項目があるので、 こちらのフラグを有効にしてもらえると、リアルタイムに音声入力をいじることができます。

![](resource01.jpg)

取得したあとは、Web Audio API で扱える範疇になるため、いろいろ応用範囲が広がってくるのではないでしょうか？

## 参考URL {#ref}

  * [WebRTC + Web Audio API = スーパーサイヤ人(slideshare)][1]
  * [大なごやJS vol.5 (#daiNagoyaJS) (togetter)][2]

 [1]: http://www.slideshare.net/girigiribauer/webrtc-web-audio-api
 [2]: http://togetter.com/li/461596

