+++
author = "girigiribauer"
categories = ["tech"]
date = "2016-10-04T13:11:17+09:00"
draft = false
tags = ["Golang", "Homebrew", "CLI"]
title = "Homebrew で Golang のバイナリを公開してみた"
aliases = ["/archives/20161004/"]
+++

超楽だったのでメモっておきます。

こちらにドキュメントあります。（Golang のバイナリの場合ではないので少し異なりますが）

<https://github.com/Homebrew/brew/blob/master/docs/Formula-Cookbook.md>



## Homebrew 対応

自作コマンド <https://github.com/girigiribauer/db-cli> を公開している時に
リリースバイナリまで GitHub に登録できて一息つけたーというタイミングで、
ふと `brew install db-cli` でインストールできたらいいなあと思ったので
調べてやってみたらさくっと1時間もかからずいけました。

自作コマンド用のリポジトリとは別に、

<https://github.com/girigiribauer/homebrew-db-cli>

という "homebrew-" プレフィックス付きの名前の Homebrew 用のリポジトリを用意し、Ruby ファイルを追加します。

`brew create` コマンドでいけるようですが、
シンプルなので自分で用意しています。

	require 'formula'

	REPOSITORY_URL='https://github.com/girigiribauer/db-cli'
	HOMEBREW_DBCLI_VERSION='0.1.24'

	class DbCli < Formula
	  desc '`db` command line tools (Docker based)'
	  homepage REPOSITORY_URL
	  url "#{REPOSITORY_URL}/releases/download/v#{HOMEBREW_DBCLI_VERSION}/db-darwin-amd64.tar.gz", :tag => "v#{HOMEBREW_DBCLI_VERSION}"
	  sha256 '6bfc2486db1b17ab93d3b3783f5981b3676299319ff9208efd599a4843599a06'
	  head REPOSITORY_URL, :branch => 'master'
	  version HOMEBREW_DBCLI_VERSION

	  def install
	    bin.install 'db'
	  end
	end

Formula クラスの継承をしたうえで、各種ローカル変数を定義します。
下に書いてあるのですが、db-cli という名前なのでクラス名は DbCli で自動で決まるみたいですね。
最初は "DBCli" と書いていました・・・。

install メソッドを定義し、
場合によっては Ruby の外部コマンド実行ができる system コマンドで
実際にインストールに必要なコマンド類を入力してやる必要があるみたいなのですが、
**今回の場合は配布想定のバイナリファイルを配置するだけで Golang 環境は不要なので、
bin.install で指定するだけで問題無い** ようです。

これも Golang の強みの1つですね。
ビルド後のバイナリファイルは、Golang 環境がなくとも（go コマンドがインストールされてなくとも）
普通に動作するので、事前に動作環境をあれこれ入れる必要がないです。

ちなみに bin.install で指定するだけで勝手に圧縮ファイルを展開、配置までしてくれるようですね。

push できたら試しに `brew tap` してみます。

	$ brew tap girigiribauer/db-cli

どうやら Homebrew 1.0 あたりで auto update が自動で行われるようになったようです。
なのでアップデート待ちです。

	==> Tapping girigiribauer/db-cli
	Cloning into '/usr/local/Homebrew/Library/Taps/girigiribauer/homebrew-db-cli'...
	remote: Counting objects: 4, done.
	remote: Compressing objects: 100% (3/3), done.
	remote: Total 4 (delta 0), reused 3 (delta 0), pack-reused 0
	Unpacking objects: 100% (4/4), done.
	Checking connectivity... done.
	Error: Invalid formula: /usr/local/Homebrew/Library/Taps/girigiribauer/homebrew-db-cli/db-cli.rb
	No available formula with the name "db-cli"
	In formula file: /usr/local/Homebrew/Library/Taps/girigiribauer/homebrew-db-cli/db-cli.rb
	Expected to find class DbCli, but only found: DBCli.
	Error: Cannot tap girigiribauer/db-cli: invalid syntax in tap!

あっその名前ダメですか・・・。
Golang だと逆に Db は DB にしろって言われるんですけどね・・・。
Ruby に素直に従っておきます。

ということで素直に DbCli に変更して再度トライ。

	$ brew tap girigiribauer/db-cli
	==> Tapping girigiribauer/db-cli
	Cloning into '/usr/local/Homebrew/Library/Taps/girigiribauer/homebrew-db-cli'...
	remote: Counting objects: 4, done.
	remote: Compressing objects: 100% (3/3), done.
	remote: Total 4 (delta 0), reused 2 (delta 0), pack-reused 0
	Unpacking objects: 100% (4/4), done.
	Checking connectivity... done.
	Tapped 1 formula (27 files, 20.3K)

	$ brew install db-cli
	==> Installing db-cli from girigiribauer/db-cli
	==> Downloading https://github.com/girigiribauer/db-cli/releases/download/v0.1.24/db-darwin-amd64.tar.gz
	==> Downloading from https://github-cloud.s3.amazonaws.com/releases/69738247/d805382a-8822-11e6-89f4-aff058332cdf.g
	######################################################################## 100.0%
	🍺  /usr/local/Cellar/db-cli/0.1.24: 3 files, 8.6M, built in 9 seconds

ひゃっほーい🍺
オレオレ自作コマンドがとうとう Homebrew 経由で自分の元に。



## まとめ

バイナリ配置するだけなんで、
Homebrew の install メソッド内部でやってることもすごくシンプルですね。

namespace 的には既存の Homebrew には影響しないので、
今回のように超短いコマンド名で公開しても全く影響ありません。
（全くではないですね、インストール時に名前がかぶる可能性はあるので、その場合は別途リポジトリ指定する必要があるかもです）

![](resource01.jpg)

全然関係ないけど、Homebrew の命名センスは結構好きですね。
ビールの自家醸造に例えて色々コマンド名が決まってて素敵だなあと思います。

僕ももうちょっとセンスのある命名を考えていければなと思います。
（末尾に24とかつけてる場合じゃない）



## 参考URL {#ref}

* <https://github.com/Homebrew/brew/blob/master/docs/Formula-Cookbook.md>
* <http://dev.classmethod.jp/tool/new-formula-request-to-homebrew/>
* <http://blog.monochromegane.com/blog/2014/05/19/homebrew-formula-for-golang/>
