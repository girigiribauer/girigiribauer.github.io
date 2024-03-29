---
title: CSS3 PIE の動作の仕組みと副作用について
author: girigiribauer
date: 2014-10-23T09:56:36+00:00
categories:
  - tech
tags:
  - CSS3
  - oldIE
  - polyfills
aliases:
  - '/archives/1636'
---
2014年9月現在、IE のシェアは過去と比べて劇的に変化しています。

http://gs.statcounter.com/#desktop-browser\_version\_partially_combined-JP-monthly-201309-201409 を見ると分かるように、 IE11 が全ブラウザの 30% を上回り、IE8,9,10 がそれぞれ 4% 前後の値です。

![](resource01.jpg)

ここまで来ると、oldIE の対応は完全にマイノリティとなってきており、 出来るブラウザを基準にして作るのがもう当たり前になってきていると言っていいかもしれません。

---

そんな中、

**『IE7,8 などでも、どうしても同じように見せなきゃいけないんだ・・・！』**

という非常にもったいないケースにおいて、 **CSS3 PIE** というライブラリが検討の選択肢に入ってくることもあるかと思います。 （いやぁもったいないですね・・・）

![](resource02.jpg)

このライブラリで、border-radius, box-shadow, linear-gradient などの、本来 oldIE では使えなかった CSS3 のプロパティが使えるようになるわけです。

ですが、**動作原理を知っておかないと思わぬところではまる場合が出てくるので注意が必要です。** 全く同じように動作するわけではなく、**副作用が存在します。**

## CSS3 PIE の使い方（振り返り）

ということで、まずは CSS3 PIE の使い方を軽く振り返ります。

http://css3pie.com/

1. PIE.js を読み込む
2. 対象セレクタ内に behavior: url(PIE.php); を入れる

PIE.php 内では、

```php
header( 'Content-type: text/x-component' );
include( 'PIE.htc' );
```

とあるだけなので、Web サーバの方で ContentType の追加さえできれば、 直接 PIE.htc を読み込んでも良いわけですね。



## PIE.htc の中身

そもそも htc というのは、 **HTML Components** のことを指しています。 （最近流行の Web Components とは全く関係ありません・・・。）

IE9 までは、CSS 内に

```
behavior: ***;
```

などと書くことで、CSS 内部にスクリプトを埋め込むことが出来ます。

ちなみに、PIE.htc の中身はこんな感じにちょっと独自拡張したスクリプトになっています。

```html
<!--
PIE: CSS3 rendering for IE
Version 1.0.0
http://css3pie.com
Dual-licensed for use under the Apache License Version 2.0 or the General Public License (GPL) Version 2.
-->
<PUBLIC:COMPONENT lightWeight="true">
<!-- saved from url=(0014)about:internet -->
<PUBLIC:ATTACH EVENT="oncontentready" FOR="element" ONEVENT="init()" />
<PUBLIC:ATTACH EVENT="ondocumentready" FOR="element" ONEVENT="init()" />
<PUBLIC:ATTACH EVENT="ondetach" FOR="element" ONEVENT="cleanup()" />

<script type="text/javascript">
var doc = element.document;var f=window.PIE;
...（以下略）
```

今更覚えても何の得にもならないと思うので、詳しく知りたい方は以下をご覧ください。

http://msdn.microsoft.com/ja-jp/library/ms532146(v=vs.85).aspx



## 開発者ツールで見てみる

css3pie.com のトップにちょうどサンプルがあるので、それに対してどんな変化が起きているのか開発者ツールで見てみます。

![](resource03.jpg)

なお、IE の開発者ツールは、**HTML が一通り読み込まれた後の DOM の変化については、更新ボタンを押さないと反映されない**ので、左上にある『最新の情報に更新』のアイコンをクリックします。

![](resource04.jpg)

すると、こんな感じに

```html
<css3pie id=_pie_101>
  <pievml:shape id=_pie_shadow0_98>
    <pievml:fill></pievml:fill>
  </pievml:shape>
  <pievml:shape id=_pie_bgImage0_99>
    <pievml:fill></pievml:fill>
  </pievml:shape>
  <pievml:shape id=_pie_border0_100>
    <pievml:fill></pievml:fill>
  </pievml:shape>
</css3pie>
<div class=" pie_first-child " id="target">
```

対象の要素の上に css3pie という要素が追加され、見た目の情報がすべてそちらに描画されます。（動的なスタイルは長くなるので省略）

ちなみに、 css3pie.com のトップでは、どうやら PIE-2.0 beta1 を利用しているようで、 ダウンロードしてきたファイルの PIE_IE678.js 内には、

```javascript
H.createElement("css3pie");
```

や、

```
'<css3pie id="_pie'+h.Q.pa(this)+'" style="'+this.ac()+'">'
```

といった記述が存在しており、HTML Components を利用して、見た目だけの要素を動的に生成していることがここからも分かります。



## CSS3 PIE の副作用

例えば、CSS3 を用いたスタイルを当てたい対象が、以下のようなツリーだったとします。

```html
<ul>
  <li>item 1</li>
  <li id="target">item 2</li>
</ul>
```

これに対して、

```css
li + li {
  background-color: #f00;
}
```

といったように、連続した兄弟セレクタに対して別途スタイルをあてる記述が存在していた場合、 これが**上手く適用されないケース**が存在します。

CSS3 PIE のライブラリが id=&#8221;target&#8221; に対して動作した場合、 ツリーは以下のように変化します。

```html
<ul>
  <li>item 1</li>
  <css3pie ... ></css3pie>
  <li id="target">item 2</li>
</ul>
```

こうなってしまうと、li が連続している前提のスタイルは、**DOM ツリーが変化してしまうことにより** スタイルがあたらない（または意図してないスタイルがあたる）ケースが出てきます。



## まとめ

**そのライブラリが、（大まかにでも）何やってるのか把握するべきだと思います。**

今回のケースでは、『CSS3 PIE というのは、見た目用の要素を対象の要素のすぐ下に生成し、見た目の情報をそちらに全部載せることで実現していて、副作用として DOM ツリーが変化してしまっている』ということまで分かっていれば、どうとでも対処できます。

なんでもかんでも『これさえ読み込めばオッケー！』みたいに考えてると、いざってときに何も出来ないので、 大まかにでも良いのでどういう仕組みで動いているのか、理解することは大事だなーと思います。
