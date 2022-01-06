---
title: ScalaでFizzBuzz（Scalaことはじめ）
author: girigiribauer
date: 2013-01-14T07:17:05+00:00
categories:
  - tech
tags:
  - Scala
aliases:
  - '/archives/654'
---
（ことはじめ、って書いておいたらたぶん叩かれることはないだろうと思って・・・）

## ScalaでFizzBuzz書いてみる

まだまだScalaは書き慣れないのですが、この前の1/11に[なごやかScala #8][1]にて

**『ScalaでFizzBuzzの例題を、パターンマッチで書いてみるといいよ！』**

と聞いたので、がんばって色々書いてみようと思いました。

## まず最初に書いたもの

    object FizzBuzz {
      def fizzbuzz(n: Int):String = n match {
        case x if x % 15 == 0 =&gt; &quot;fizzbuzz&quot;
        case x if x % 3 == 0 =&gt; &quot;fizz&quot;
        case x if x % 5 == 0 =&gt; &quot;buzz&quot;
        case x =&gt; x.toString
      }

      def main(args: Array[String]) = {
        (1 to 100).toList.foreach{ n =&gt;
          println(fizzbuzz(n))
        }
      }
    }


  * とりあえず思いつくままに書いてみたもの
  * 副作用うんぬんってところは前に聞いていて気をつけなきゃと思っていたので、数字を受け取って文字列を返す形に統一した（中でprintlnとか書かない）
  * 変数 x のところは最初 n って書いてたけど、『パターンマッチで別の変数を割り当てられるよー』ってところを分かりやすくするために x にしてみた

うーん、素人目でも分かるように、無駄が多そうですね。

特に**mainの中がなんかごちゃごちゃしてる気がする**ので、ここからもうちょっとすっきりするように書き直してみます。

## 次に書いてみたもの

    object FizzBuzz {
      def fizzbuzz(n: Int):String = n match {
        case x if x % 15 == 0 =&gt; &quot;fizzbuzz&quot;
        case x if x % 3 == 0 =&gt; &quot;fizz&quot;
        case x if x % 5 == 0 =&gt; &quot;buzz&quot;
        case x =&gt; x.toString
      }

      def main(args: Array[String]) = {
        (1 to 100).map(fizzbuzz).foreach(println)
      }
    }


  * そもそも Range に対して toList してから、みたいなのは不要っぽい
  * foreachの戻り値はUnit型（戻り値がないことを意味する戻り値）らしいので、何かそのまま返してくれるやつを使うべき？ -> map ぽかったので変更
  * 最後 println するとこは何も返さなくてよいので foreach のまま

これでよいのかな？まだまだ慣れないけど、

  1. 1から100のリストを作り、
  2. fizzbuzzに変換して、
  3. それぞれ出力する

っていう流れは main 見るだけでざっと分かるようになっているんじゃないかと思いました。 これって、main見るだけでざっと処理全体が分かる ≒ 概要、アウトラインを意味するように書けば良いのでは？って少し思いました。

まだまだ道のりは長そうです・・・。

 [1]: http://partake.in/events/ff2ed11e-e438-4dde-809e-5e3bf8ab6c07

