---
title: 3Dグラフィックスのド素人がGLSLについて調べてみた
author: girigiribauer
date: 2012-12-21T14:50:51+00:00
categories:
  - tech
tags:
  - CSSfilter
  - GLSL
  - WebGL
aliases:
  - '/archives/511'
---
こちらの記事は、[LL/ML Advent Calendar][1]の21日目の記事です。

## #LLAdventJPとは？

僕も知りません。 **なごやって素敵** ですね！

（※時間がどうしてもなくて、紹介記事止まりでごめんなさい！）

## この記事を書こうと思ったわけ

&#8220;L&#8221;と&#8221;L&#8221;、もしくは&#8221;M&#8221;と&#8221;L&#8221;がつけばなんでもOKとのことだったので、最悪HT **ML** のことなんか書けばいいかーと思いつつ、悶々としていたのですが、CSS3 custom filterのデモを見ていて、

    -webkit-filter: custom(
      url(shaders/vertex/page-curl.vs) mix(url(shaders/fragment/page-curl.fs) normal source-atop),
      50 50 border-box,
      transform perspective(1000) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg),
      curlPosition 0 0,
      curlDirection 135,
      curlRadius 0.2,
      bleedThrough 0.59
    );


![](resource01.jpg)

この **page-curl.vs とか page-curl.fs ってなんぞ？** と思ったのがきっかけで、いろいろ調べてみたらG **L** S **L** というキーワードにぶち当たったので、なんだろうと思って軽めに調べてみました。

以下、こんな感じで話が進みます。

- [CSS filter、CSS custom filterについて][3]
- [GLSLとは？そもそもシェーダーとは？][4]
- [GLSLのHelloWorld][5]
- [まとめ][6]

ちなみにタイトルにもあるように、3Dグラフィックスの周りはド素人であるため、専門でやられている方にはつまらなく感じるかもしれません。もし間違いとかありましたら、叩かれるのはこわいのでやさしく指摘してくだされば幸いです。



## CSS filter、CSS custom filterについて {#css-filter}

### CSS filter

昨今のモダンブラウザの高速リリースによって、ビジュアル面でもFlashと同等レベルのことが出来るようになってきました。

特にJavaScriptではなく、 **CSSで出来ること** の幅がぐんと広がってきており、CSSで様々なエフェクトがかけられるCSS filterは、その最たる例と言ってもいいのかもしれません。

CSS filterに関しては、こちらのページが分かりやすいです。

[Understanding CSS Filter Effects &#8211; HTML5 Rocks][7]

グレースケール（灰色っぽくする）とか、コントラスト比をいじるとか、Flashで普通に出来たことが、同じようにHTMLに出来るようになっただけでしょ？と思われる方もいるかもしれません。

ただ、僕はそうは思っていなくて、 **任意のDOM要素に対して使える** というのがかなりのメリットではないかと考えています。

### 試してみましょう！

試しにお使いのブラウザ（Chromeなど）の開発者ツールで、このページの下にあるであろう『いいね！』ボタンのiframeを選択し、以下のようなスタイルをあててみてください。

    -webkit-filter: grayscale(100%);


![](resource02.jpg)

どうですか？いいねボタンが白黒になりましたか？ **まるでF** _B_ **のお葬式のようですね！**

これってかなりすごいことで、例えばbodyに対してブラーエフェクト（blur、ぼかしのエフェクトのこと）を先にかけておいて、ちょっと間を置いてエフェクトを消してやれば、 **ぼやけていたWebコンテンツがしゅっと見えるような表現** が出来たりしますよね！

こういった今までつまんない感じだったWebコンテンツを、少しのCSSの記述だけでとても簡単にカッコイイ感じに変身させることができちゃうのです。

※もちろん、色んな要素にエフェクトかけまくっちゃうとレンダリング負荷は高まりますので、それだけあれば何でも解決するかというとそんなことはありません。

公式の仕様は以下に載ってます。僕もまだこれからちゃんと読まないといけないレベルですが、一応紹介までに。

[Filter Effects 1.0(仕様)][9]

### CSS filter の custom filter

この css filter の種類の1つに、 **custom** というのがあります。エフェクトのかけ方を、こちらで自由に制御できちゃうみたいなんですねー。これはすごい。

とりあえずデモを見て、「おー、すげー！」でもしてみましょうか。

[CSS shaders: Cinematic effects for the web | Adobe Developer Connection][10]

**「おー、すげー！」**

css custom filter も、css filter の1つであるため、任意のDOM要素に対してエフェクトがかけられるわけですね。

見る限り、以下のようなことが出来そうです。

  1. 色の塗り分け
  2. 影の付け方をいじる
  3. 3Dを2Dに対応付けして、3Dっぽく見せる

・・・と、ここまで調べてみると、3Dグラフィックスの専門用語がそれなりにわんさか出てきます。GLSLに触れるとともに一通り調べてみました。

## GLSLとは？そもそもシェーダーとは？ {#about-glsl}

まずGLSLについて。

> GLSL (OpenGL Shading Language) はGLslangとしても知られ、C言語をベースとした高レベルシェーディング言語である。これはアセンブリ言語やハードウェアに依存した言語を使わないで、開発者がグラフィックスパイプラインを直接制御できるようにOpenGL ARBで策定された。最新版は、GLSL 4.10（米国時間2010年7月28日）である。

[wikipedia: GLSL][11]より引用

はい、 **OpenGL** の **シェーディング言語** なわけですね。わかりません。

GLはGraphics Libraryの略なので、2D, 3Dのグラフィックスが扱えるとしても、 **シェーディング** 、 **シェーダー** とはなんでしょうか？

> シェーディング（英: shading）は、3次元コンピュータグラフィックスやイラストレーションなどで明暗のコントラストで立体感を与える技法である。絵画では陰影画法と呼ぶ。

[wikipedia: シェーディング][12]より引用

ほほう、これはデモで見て予想した通りのことが出来る技法ですね。

> コンピュータグラフィックスのシェーダ（英: shader）は、主にライティング（光源計算）・シェーディング（陰影処理）とレンダリング（ピクセル化）を実行するためにグラフィック リソースに対して使用するソフトウェア命令の組み合わせである。

[wikipedia: シェーダ][13]より引用

シェーディング（光や影、ピクセルの色や位置などの変化）をシェーダーが担当してくれているのですね。

・・・なるほど。

ということは、一番最初に見たCSSの記述は、シェーダーのことを表しているようです。もう一度見てみます。

    -webkit-filter: custom(
      url(shaders/vertex/page-curl.vs) mix(url(shaders/fragment/page-curl.fs) normal source-atop),
      50 50 border-box,
      transform perspective(1000) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg),
      curlPosition 0 0,
      curlDirection 135,
      curlRadius 0.2,
      bleedThrough 0.59
    );


このpage-curl.vs の **vs** は、 **vertex shader** の略のようです。また page-curl.fs の **fs** は、 **fragment shader** の略のようです。

- バーテックスシェーダー（バーテックスは頂点の意味、頂点シェーダーとも呼ばれる）
- フラグメントシェーダー（フラグメントは断片の意味、ピクセルシェーダーとも呼ばれる）

点と面のシェーダーがあるよ、と考えておけばいいのかもしれません。

### つまり・・・

- GLSLはOpenGLのシェーディングのための言語
- .vs .fsといったシェーダーの種類がある

あとおまけで、

- WebGL（Webで3Dグラフィックスが扱える）でもGLSLを使ってた

あたりが分かりました。

## GLSLのHelloWorld {#glsl-helloworld}

さて、WebGLはクロノス・グループという団体が標準化を行っています。

そちらにGLSL 1.0の仕様がありましたので、紹介しつつ少しだけ読んでみようと思います。

[The OpenGL &reg; ES Shading Language][14] ※PDFです

・・・。

・・・・・・。

**やばい、予想以上にC言語っぽい。**

しっかり読んで紹介していると21日目のブログ記事が間に合わなくなってしまうので、ちょっと **落としどころを探りたい** と思いますw

WikipediaのGLSLの項目に、一番シンプルであろう fragment shader の例が載っていたので、それについてだけ調べてみます。

    void main(void)
    {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }


gl\_FragColor や gl\_FragData に代入することで、フラグメントシェーダーとして書き出しますよーということを表します。

ちなみにとても良いサイト見つけました。 そのまま **GLSLを書いて試せる** っぽいです。（[GLSL Sandbox][15]）上記コードは1〜3までの引数でカラー指定をしているようですね！（第4引数はなんだろう、透明度なのかな・・・？）

![](resource03.jpg)

**「おー、すげー！」**



## まとめ {#conclusion}

って感じで、とりあえずHelloWorldまで行くだけでもだいぶ長くなってしまいましたが、ここまで調べられればこの後の導入が比較的スピーディーに行けるのでは？と思っています。

- シェーダーは光や影をつけたりピクセルの色や位置をいじったりできる
- GLSLはCSSのcustom filterやWebGLで使われてる
- とりあえずHelloWorldに相当するやつ書いてみた

これで色んなGLSLを書いて、オリジナルのエフェクトとか作れたらかなり表現の幅が広がりそうです！

## おまけ

僕は余力がなくて参加できてないのですが、 [GraphicalWeb (CSS, SVG, WebGL etc) Advent Calendar 2012][17] の中のyomotsuさんが書かれたCSS shaderに関する一連の記事はかなり勉強になります。時間作ってしっかり読みたいなーと思いました。

 [1]: http://partake.in/events/9658f376-6ce3-4217-b392-b05d3de60021
 [3]: #css-filter
 [4]: #about-glsl
 [5]: #glsl-helloworld
 [6]: #conclusion
 [7]: http://www.html5rocks.com/en/tutorials/filters/understanding-css/
 [9]: http://dvcs.w3.org/hg/FXTF/raw-file/tip/filters/index.html
 [10]: http://www.adobe.com/devnet/html5/articles/css-shaders.html
 [11]: http://ja.wikipedia.org/wiki/GLSL
 [12]: http://ja.wikipedia.org/wiki/%E3%82%B7%E3%82%A7%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0
 [13]: http://ja.wikipedia.org/wiki/%E3%82%B7%E3%82%A7%E3%83%BC%E3%83%80
 [14]: http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf
 [15]: http://glsl.heroku.com/
 [17]: http://www.adventar.org/calendars/10

