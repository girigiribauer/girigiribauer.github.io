+++
author = "girigiribauer"
categories = ["tech"]
date = "2017-05-19T17:53:08+09:00"
draft = false
tags = [
	"Hugo",
]
title = "Hugo v0.19 以上で 404 page not found になる件"
aliases = ["/archives/20170519/"]
+++

軽い気持ちで v0.17 あたりから最新にアップデートしたら
先日思わぬところではまったのでメモ。

（ちょうど Hugo 使ったものが直近で必要だったので焦りました・・・）



## 起きている事象

v0.19 以上の Hugo を利用して
`hugo server --buildDrafts` などでページを見ていると、
詳細ページだけが確認できず '404 page not found' になってしまう。



## 結論

各記事の上の frontmatter 内にある、
layout を削除すると正しく動作するようになります。

frontmatter から layout の記述を削除して
表示確認してから追加すると、 `hugo server` 動作中なら認識するけど、
落としてからまた `hugo server` 立ち上げると再び not found になってしまう・・・。



## 細かいこと

Hugo ではコンテンツを content directory に格納し、
~~layout ごとに sub directory を作って格納します。~~

（誰かに突っ込まれる前に追記） layout ごとではなく section ですね、失礼しました。
詳しくはこっちに書いてあります。
<https://gohugo.io/content/sections/>

`content/post/article01.md`

そういった仕組みがあるので、frontmatter 内に
そもそも layout の指定は不要で、
公式のドキュメントにもそのようなプロパティは存在してません。

古い記述なのか、 v0.19 以上だと
記述が入っていると not found になってしまうようです。

deprecated とかも書いてなくてどこにも情報なかったので、
特定にちょっと時間かかってしまいました・・・。

いつからなくなったんだろうか・・・
git blame でざっと見てみたけどそんなもの無かったです・・・
最初からそんなプロパティ無かったんだろうか・・・
