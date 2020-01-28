---
title: Chef を本番投入してみた
author: girigiribauer
date: 2015-06-09T23:39:55+00:00
categories:
  - tech
tags:
  - Chef
  - Vagrant
aliases:
  - '/archives/1867'
---
メモレベルでごめんなさい。

サーバを移設してみました。 せっかくなので、移設ついでにブログのリニューアル（簡素化）と **Chef cookbook を利用したプロビジョニング**にも挑戦してみたよ、という記録です。

## やったこと概要

  1. Vagrant を利用してローカルに同じ環境を作る（空のVM）
  2. レシピを書きつつ、ローカルと本番環境との差異などを attributes に括り出す
  3. ローカル環境へのプロビジョニングが問題なければ、同じレシピを本番にも適用

本当は Serverspec なども試していきたいですが、そちらは今後やっていければと思います・・・。

多くのサードパーティ製レシピは、[Chef Supermarket][1] に登録してあるのですが、読み方や使い方が分かっていないと意味をなさないケースも多かったです。

レシピは大きく分けて2種類あり、**attributes として json ファイルに値を書いていくスタイル**のものと、もともと Chef に用意されている file, template のような、**レシピ内に Chef の resources として記述するスタイル**のものがあります。以下の記事にもわかりやすく紹介されてます。

[http://tsuchikazu.net/vps_chef_solo/][2]

例えば、今回レシピを適用したいマシンを仮に alpha としておいて、`nodes/alphalocal.json` と `nodes/alphaproduction.json` の2ファイル用意し、それぞれ設定を括り出しておきたいところを記述しておきます。 以下は nodes/alphalocal.json のサンプルです。（実際はもうちょい複雑ですが）

    {
      "name": "alphalocal",
      "automatic": {
        "ipaddress": "192.168.0.10"
      },

      "fqdn":             "alphalocal",
      "platform_family":  "rhel",
      "platform":         "centos",
      "platform_version": "6.6",

      "run_list": [
        "recipe[selinux::disabled]",

        "recipe[yum]",
        "recipe[yum-epel]",
        "recipe[yum-remi]",

        "recipe[ntp]",
        "recipe[locale]",
        "recipe[timezone-ii]"
      ],

      "locale": {
        "lang": "ja_JP.utf8",
        "lc_all": "ja_JP.utf8"
      },
      "ntp": {
        "servers": [
          "ntp.nict.jp",
          "ntp1.jst.mfeed.ad.jp",
          "ntp2.jst.mfeed.ad.jp",
          "ntp3.jst.mfeed.ad.jp"
        ]
      },
      "tz": "Asia/Tokyo"
    }


これは前者の **attributes として json ファイルに値を書いていくスタイル**ですね。後者の場合は、独自にレシピを書いていきつつも、レシピ内で独自の resources を使って書いていく感じです。

以下は apache2 のレシピで用意されている **web_app** resource を用いて、自ら用意したレシピ内でバーチャルホストの設定をするサンプルです。（この通り動いているわけではありません）

      web_app host["id"] do
        server_name         host["server_name"]
        server_aliases      host["server_alias"]
        docroot             host["docroot"]
        enable              host["enable"]
      end


ちょっと話が逸れましたが、attributes として設定を括り出しておくことで、本番環境で動作させるためのレシピを、あらかじめローカル環境で検証することができるようになりました。

## やってみて気づいたこと、思ったこと

だいたいこんなところです。

  * どこまでレシピで書くべきか？
  * データベースのバックアップ大事
  * レシピのテストしなきゃ

どこまでレシピで書くべきか？についてですが、全部レシピで書いて自動化すればいいってもんでもないんですよねえ。特にデプロイ対象のものについては、レシピで書かずに別のツールやシェルスクリプトなどで、いつでもマシン内から呼び出せるようにしておいた方が良さそうです。

Web コンテンツなら、vhosts の設定をして、そこにファイルを置けば表示はされるけど、入れ物だけは用意してあるよー、というあたりが落とし所かなと思いました。（あとは capistrano とかですかね・・・？）

## ついでにリニューアルを

読みづらい部分がまだあったので、読みやすさを重視して見直してみました。

あと一つ気づいたことがあるんですよ。ブログタイトルに丸々ドメイン名とか入れちゃうと、twitter とかその他外部サービスにタイトル付きで貼り付けたときに、**タイトル内に含まれるサイト名にリンクが貼られてしまうんですよねえ・・・。**

これは正直運用するまで盲点でした。今後 gTLD が増えていくのは間違いないので、リンクが意図せず貼られてしまうリスクも併せて考えていった方がいいかもしれませんね。

 [1]: https://supermarket.chef.io/
 [2]: http://tsuchikazu.net/vps_chef_solo/
