+++
author = "girigiribauer"
categories = ["tech"]
date = "2016-09-13T14:05:35+09:00"
draft = false
tags = ["Git", "gitconfig"]
title = "Git のユーザー名を複数使い分ける時は global の設定を消す"
aliases = ["/archives/20160913/"]
+++

会社用のアカウントと個人用とで分けたいときなどに。

正攻法じゃないけど、間違えずに済むので一応メモ。

（以下いろいろ編集追記）

**これでしばらくやってみてほぼ困らなくなりましたのでオススメです。**

ライブラリはオープンに個人用アカウントで作っておき、
それを会社用アカウントから利用するみたいなことも想定できるので、
user.name, user.email を複数使い分けられるようにしておいて損はないと思います。



## global の .gitconfig の user.name をあえて空にする

ホームディレクトリに置いてある .gitconfig 内の

	[user]
		name = foobar
		email = foobar@example.com

みたいな記述を **思い切って削除してしまいます。**

そうすると、通常であればコミットする時に
**user.name と user.email がない、お前は誰だ！** と怒られます。

	*** Please tell me who you are.

	Run

	  git config --global user.email "you@example.com"
	  git config --global user.name "Your Name"

	to set your account's default identity.
	Omit --global to set the identity only in this repository.

そのままではコミットできないのですが、
user.name などをグローバルで一括指定する代わりに、
**プロジェクトごとの user.name などの設定を素早くできるようにすれば良いのです。**

.bashrc や .zshrc あたりに

	function gituser-personal() {
	  git config user.name "girigiribauer"
	  git config user.email "girigiribauer@gmail.com"
	  git config --list
	}

	function gituser-company() {
	  git config user.name "foobar"
	  git config user.email "foobar@example.com"
	  git config --list
	}

などといった、自分にとってわかりやすい名前で user.name を指定できる関数を用意しておきます。
今回は **gituser-personal** と **gituser-company** の2種類用意してみました。

あとはプロジェクトの初期（clone 直後とか init 直後とか）に実行してやれば
プロジェクトごとの user.name, user.email が使えるようになりますし、
うっかり忘れていたとしてもコミット手前で名前を教えろという警告でストップし、
（なぜなら global の設定が空だから）
**警告をセーフティのように利用できる** と思います。

僕は当初、 global の .gitconfig にメインで使う user.name の設定を書いたまま
サブで使う場合のみ、
上記の関数を呼び出す方法を使っていたのですが、
ついつい忘れてしまいがちで push した後に気づくんですよね。
あえてグローバルに設定しないようにしたことで、
逆に設定間違えに気づくことが出来るようになりました。

複数アカウントをなんとかして同時に扱おうと頑張ってる方がいるのですが、
global の .gitconfig の設定を空にする方法、地味ですがオススメです。
