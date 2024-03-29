---
title: 'HTML5勉強会 名古屋 #1 に参加してきた話'
author: girigiribauer
date: 2013-02-09T05:52:26+00:00
categories:
  - tech
tags:
  - HTML5
  - study
aliases:
  - '/archives/705'
---
![](resource01.jpg)

特にしゃべってもないので、参加者目線でログを残したいなと思います。



## HTML5勉強会 名古屋 #1

今まで名古屋でこういう会が無かったので、こういう月一で継続して発表の場があるというのは大事なんじゃないかなーと思います。

ちなみに第0回もあったのですが、まだ参加されている皆さんはアウトプットに慣れていないのかなーという印象を受けました。もちろん僕も含めてではあるのですが、 **アウトプットを行わないと、適切な（効率の良い？）インプットが出来ない** と思うので、このあたりは徐々にみんなで出来るようになれるといいなぁと思ってます。

今回のセッションはだいたい以下のような感じでした。

※公式なものではないので、概要をさらっと触れる感じにとどめておきます。

## HTML5で色々なものを再現してみる話

杉本さんの『HTML5で色々なものを再現してみる話』という、まず面白いコンテンツを紹介し、それに使われているHTML5関連の技術を紹介していくという内容の発表でした。

大きく2つのコンテンツが紹介されていて、1つ目はWindows8のOSを模したWebアプリケーションでした。 魚の描画には **Canvas** のAPIを使ったり、動きの表現にはCSSの **animations** ,  **transitions** を使って実現してます、といった感じで、単に面白いもの作ったというだけでなく、セットでこういう技術を使ってます、という内容があることで、聞いている側は『こういうことやりたい』と思ったときの調査のとっかかりになったのではないでしょうか。

2つ目は、ドラゴンクエストの復活の呪文を、HTML5関連の技術を使って再現しちゃおう、という内容でした。 その再現っぷりは半端なく、ちゃんとゲームのコントローラーを接続して、ユーザーインターフェースもそのままに再現されてました。 僕も前々から個人的に気になっていた **Gamepad API** ですが、 **実際に作って試せるところまでコンテンツを作りこんでいるのは見習いたい** なと思います。これくらいさくっと作って試さないとダメですね。僕も頑張ります。

ちなみに、Gamepad API を実装するにあたっては、こちらのサイトが参考になったとのことでした。

[Jumping the Hurdles with the Gamepad API &#8211; HTML5 Rocks][2]



## AR+HTML5

伊藤さんの『AR+HTML5』というタイトルでの発表で、ARコンテンツの『CARKCHO』というサービスをベースにして、将来スマートフォンでのARコンテンツに備えたHTML5を用いた検証など、そもそもHTML5使うべきかどうかなどの話も含めた内容でした。

[CARKCHO][3]

おそらくポイントとしては、ARなどの今までになかったものは、未知のUI、UXを考える必要性が出て来ることが多く、今まで以上に事前の検証が大事となるシーンが多くなるので、後になって導入がスムーズになるように、どんどん事前検証していきましょう、といった感じかなと思います。

プレゼン中にWebGLを使ったスマートフォンの立体表現が紹介されていましたが、こういったものもどんどん取り入れていきつつ、セットで **どの環境でもちゃんと見られるのか、あるいは見られないものをどうするか** を（当然のように）きちんと考えていく必要があるなーと思いました。



## HTML5時代の動画コンテンツ 基礎の基礎 ～Webサービス作ってないし！というあなたに～

最後のセッションはKさんの『HTML5時代の動画コンテンツ 基礎の基礎』という、動画の埋め込みに絡んだ話から、それを踏まえた顧客提案までの幅広い発表でした。

確かに動画の種類、埋め込み方法、メリットデメリットなどの基本的なところは、知識として知っておく必要があるのですが、その上に **どうクライアントに提案して価値を見いだせるか、という一番しっかり考えなければいけないところ** の話が分かりやすく紹介されていて、非常に面白かったです。

**動画と何か** を組み合わせると、アイデア次第で提案できるものが転がっているよ、という中での一例として、 **Popcorn.js** が紹介されてました。

[Popcorn.js][4]

動画が進むにつれて、連動して何かが変化する類いのものは、他にもたくさんありそうですね。そう考えると、ホントに後はアイデア次第なのではないでしょうか。実装まではまだ出来ないけど、出来る人にお願いすればいいじゃん、というのも頼もしい言葉でした。

## まとめ

今回の発表者の方々は、もう日頃からアウトプットをされている方ばかりだったので、こういう風に形にして伝えるのがやはり上手いなーという印象でした。 内容自体もさることながら、まずは **やりたいこと、アウトプットしたいこと** が明確に見えていて、 **それを実現するためのインプット** を行い、それを **さらにまたこういう発表という形でアウトプット** することで、良いサイクルを回していて理想的だなーと思いました。

僕も負けずにアウトプットしていきたいなーと思います。

## 参考URL {#ref}

- [Jumping the Hurdles with the Gamepad API &#8211; HTML5 Rocks][2]
- [CARKCHO][3]
- [Popcorn.js][4]
- [HTML5勉強会 名古屋（Googleグループ）][5]
- [HTML5勉強会 名古屋 #1（イベント募集ページ）][6]
- [HTML5勉強会 名古屋 #1（togetter）][7]

 [2]: http://www.html5rocks.com/en/tutorials/doodles/gamepad/
 [3]: https://app.carkcho.com/
 [4]: http://popcornjs.org/
 [5]: https://groups.google.com/forum/?hl=ja&fromgroups#!forum/html5nagoya
 [6]: http://www.zusaar.com/event/499053
 [7]: http://togetter.com/li/452564
