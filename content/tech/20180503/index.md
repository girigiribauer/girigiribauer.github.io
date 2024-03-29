+++
author = "girigiribauer"
categories = ["tech"]
tags = ["HTTPS"]
draft = false
date = "2018-05-03T07:00:00+09:00"
title = "GitHub hosting の custom domain が HTTPS 対応したので HTTPS 化してみた"
aliases = ["/archives/20180503/"]
+++

タイトルの通りです。



## ざっくりポイント

* <https://help.github.com/articles/setting-up-an-apex-domain/> をよく読む
* 設定済みのカスタムドメインを1度削除し、再度追加する
* GitHub のリポジトリの setting ページにある Enforce HTTPS の項目をよく読む

最後の Enforce HTTPS の項目についてですが、以下の種類のメッセージが出て来ます。

![https01](resource01.jpg)

まず最初はこれ。

> Unavailable for your site because your domain is not properly configured to support HTTPS

このようなメッセージが出ている場合、待ってても使えるようにはなりません。
公式の help ページなどを見て問題のある箇所を対処しましょう。

具体的には、
https://help.github.com/articles/setting-up-an-apex-domain/
などのページを見て、 A レコードを追加するなどしましょう。

現時点での公式ページによると、以下のものを追加すると良いようです。

- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

ドメイン契約しているところでそれぞれ設定しましょう。
僕はお名前.comで設定してきました。

なお、設定した後は公式にも書いてあるように。一度カスタムドメインを削除し、再度設定し直して設定を有効にします。

![https02](resource02.jpg)

次はこれ。

> Not yet available for your site because the certificate has not finished being issued

このメッセージになったら、あとはしばらく待って証明書が使えるようになるまで待ちましょう。

「もう出来ることは何もない」状態です。

![https03](resource03.jpg)

最後はこれ。メッセージのない状態で、いよいよ使える状態です。

**Enforce HTTPS** にチェックを入れると、 HTTPS 化が始まります。
普通の方はチェックを入れる前に、本当にこのタイミングで HTTPS 化しても良いのか、改めて確認しておきましょう。
特に URL が変わることによる影響は気をつけた方が良いです。

僕のブログについては、もともと『忘れた頃に自分含む誰かがググったときの助けになれば』というポリシーでやっていて、
ブックマーク数やらシェア数やらはどうでも良いので、躊躇することなくポチっとしました。

ちなみに、HTTP から HTTPS へのリダイレクトも勝手にやってくれるので、
今のところ HTTPS 化したことによる影響はほぼないです。
