+++
author = "girigiribauer"
categories = ["tech"]
date = "2016-08-07T22:54:14+09:00"
draft = true
layout = "post"
tags = ["Ansible", "Raspberry Pi"]
title = "Ansible による Raspberry Pi のセットアップ"

+++
これまただいぶ前の話になりますが、
Raspberry Pi Zero を触ったときのセットアップ方法を
軽く自分用にまとめておきます。

前段のラズパイ部分は大部分を <http://www.raspi.jp/2016/07/pizero-usb-otg/> を参考にしています。

USB **OTG** というのは、On The Go の略で、USB さえ挿せば OK ですよの意（意訳）です。
ぶっちゃけモニターとかキーボードとか別途挿して GUI 環境を用意するのだるいよね・・・。

USB の差込口が2箇所しかないのですが、物理的に USB で接続して SSH さえできれば、
あとは Ansible で流しこめるので GUI 関連のアプリケーションとかは不要かと思います。
（むしろ入れない方が良い）

なお、インストールする OS イメージについては、
全部入りの（GUI 含む） Raspbian Jessie の方ではなく、
minimal なパッケージ構成となっている **Raspbian Jessie Lite** の方で問題ないかと思います。

---

ちなみに、ここ最近溜まりに溜まっていた記事をどどっと表に出してますが、
やはりアウトプットしやすい環境は大事ですね。
これで一連の下書き記事の便秘解消が果たせます。



## 大まかな手順

1. micro SD カードのフォーマット（今回のストレージ）
2. df -h で どこにマウントされてたか確認してから umount (以下 /dev/disk2s1 とする)
3. unmount (`diskutil unmount disk2s1`)
4. OS イメージの micro SD カードへの書き込み
	* `sudo dd bs=1M if=/path/to/2016-05-27-raspbian-jessie-lite.img of=/dev/disk2`
5. USB OTG の設定
	* config.txt, cmdline.txt の書き換え
	* この場合（Mac）だと /Volumes/boot/cmdline.txt などのパス
6. unmount
7. USB 接続（電源は USB から給電）、SSH できるか確認
8. Mac 側で Raspberry Pi から外へのネットワーク接続設定
9. Ansible 実行
	* user: pi, password: raspberry

1.の SD カードのフォーマットですが、ここだけ Mac 上で GUI のアプリケーションを利用しています。
Mac ならディスクユーティリティでもできるようです。

![][1]

3.の dd コマンドのオプションですが、
自分の Mac の環境では bs=1m ではなく bs=1M の大文字でないと受け取ってくれませんでした。
この辺は `man dd` 読みながらなんとかしています。

8.のネットワーク設定ですが、Mac であればシステム環境設定の共有から設定可能です。

![][2]



## ansible-playbook

さて、本編の Ansible 実行についてですが、
やりたいことを箇条書きにしてみます。

* ansible ユーザーの作成
* ansible ユーザーの公開鍵登録
* sudoer の設定
* apt-get update
* 時刻合わせ
* root パスワードの変更
* pi ユーザーの削除

TODO: ansible 部分



## まとめ

どんなマシンであっても、 **SSH さえできればそこから先は Ansible にお任せできる** の良いですね。

Raspberry Pi Zero は USB 差込口が 2 つしかなく、
電源以外に有線の通信として使えるのは 1 つしかないので、
キーボードやらディスプレイやらを接続して GUI で色々設定するのは正直苦痛だと思います。
セットアップ対象の方に色々と入れなくて済むという Ansible のプッシュベースも
最小構成の Raspberry Pi Zero にとっては非常にありがたいメリットですね。

今回は特に Raspberry Pi 側にプログラミング環境などは入れていませんが、
今のところ Golang のワンバイナリ構成を考えています。
Golang と Raspberry Pi は非常に相性が良いと思います。
クロスコンパイルの仕組みもそうだし、 Raspberry Pi 側に環境をインストールしなくていいというのもありますね。

 [1]: /img/2016/09/raspi01.png
 [2]: /img/2016/09/raspi02.png

## 参考URL {#ref}

* <http://qiita.com/R-STYLE/items/b481ba2d695ddf8bcee4>
