+++
categories = [
  "tech",
]
date = "2017-02-08T18:10:11+09:00"
title = "zsh で日付などを補完・入力補助する方法"
tags = [
	"CLI",
	"ShellScript",
]
draft = false
author = "girigiribauer"
aliases = ["/archives/20170208/"]
+++

その場で展開したいのです。

結論から先に書いておきます。

	function print_date() {
	  zle -U `date "+%y%m%d"`
	}
	zle -N print_date
	bindkey "^Xd" print_date

zsh における入力バッファの概念だとか、 zle (zsh line editor) だとか、
その辺が少し分かっていなかったので、ちょっとだけ試行錯誤してました。

せっかくなのでメモしておきます。



## 当初の入力補助する案

当初考えたのがこちら。頭空っぽで書きました。

	function print_date() {
	  echo -n `date "+%y%m%d"`
	}
	bindkey "^Xd" print_date

`bindkey` コマンドで現在割り当ててあるキーマップの一覧が確認できるので、
空いてそうな **Ctrl-X -> D** キーを割り当てることにしました。date の D です。

そして .zshrc に反映して実行してみます。

	% 170208

表示されましたが、ここで違和感が。
**Ctrl-W で消えません。**

あれ？おかしい・・・？と思い、`mkdir ` のあとに実行して 日付のディレクトリを作ってみることに。

	% mkdir 170208
	mkdir: missing operand
	Try 'mkdir --help' for more information.

**missing operand** と表示されここで初めて気づきます。

**あー、これ単に出力されてるだけか、と。**

ここでようやく **マニュアル読まないと、** となりました。



## man zshzle を読む

zsh に関するマニュアルはいくつかに分割されています。

man zsh を引用します。

	OVERVIEW
	       Because zsh contains many features, the zsh manual has been split into a number of sections:

	       zsh          Zsh overview (this section)
	       zshroadmap   Informal introduction to the manual
	       zshmisc      Anything not fitting into the other sections
	       zshexpn      Zsh command and parameter expansion
	       zshparam     Zsh parameters
	       zshoptions   Zsh options
	       zshbuiltins  Zsh built-in functions
	       zshzle       Zsh command line editing
	       zshcompwid   Zsh completion widgets
	       zshcompsys   Zsh completion system
	       zshcompctl   Zsh completion control
	       zshmodules   Zsh loadable modules
	       zshcalsys    Zsh built-in calendar functions
	       zshtcpsys    Zsh built-in TCP functions
	       zshzftpsys   Zsh built-in FTP client
	       zshcontrib   Additional zsh functions and utilities
	       zshall       Meta-man page containing all of the above

マニュアルが分割されているとありますね。

この中で、今回の入力バッファなどの編集については、
**zsh command line editor (zle)** が相当します。
なので zshzle を読みましょう。

	man zshzle

ずらっと読んでいくと、 ZLE BUILTINS の中の zle コマンドのところにこんなオプションがあります。

    -U string
           This  pushes the characters in the string onto the input stack of ZLE.  After the
           widget currently executed finishes ZLE will behave as if the  characters  in  the
           string were typed by the user.

大まか -U の後の文字列を追加することは分かったのですが、
**ん？ widget ってなんです？**

何やら知らない概念があるらしいので、もうちょっと掘り下げてみます。

最初の方に戻ってさらっと読むと、 **Widgets セクションがあるから読んでみて**
とあるのでそちらを探してみます。

・・・。

細かく説明してると手間なので、詳しくは気になる人がそれぞれ実際に読めば良いと思うのですが、
ざっと紹介するとこんな感じです。

zle には widget という概念が存在しており、
builtin で用意された widget とユーザーが独自に定義した widget とを
同じように扱うことができるようです。

**関数をキーバインドで呼び出すのではなく、
widget を呼び出す** のが zsh の流儀のようです。

さらに `zle -N` の説明が書いてあるところを読むと、

    -N widget [ function ]
           Create  a  user-defined  widget.  If there is already a widget with the specified
           name, it is overwritten.  When the new widget is invoked from within the  editor,
           the  specified  shell  function  is called.  If no function name is specified, it
           defaults to the same name as the widget.  For further information, see  the  sec-
           tion `Widgets' below.

これでユーザー定義の widget が登録できるので、
キーバインドを設定する前に、まずは widget を登録します。

ちなみに、用意した引数が widget 分しかなかった場合は、
**同じ名前で function 名がある前提で登録をしてくれるようです。**
合わせておくと管理上分かりやすいので名前を同じにしておきます。

ちょっと分かりづらくなってきたので、まとめるとこんな感じです。

1. ユーザー定義の関数を用意する
2. その関数を **widget として登録する (zle -N)**
3. widget を **キーバインドで呼び出す (bindkey)**

この流れですね。

以上を踏まえて書き直したのがこちら。

	function print_date() {
	  zle -U `date "+%y%m%d"`
	}
	zle -N print_date
	bindkey "^Xd" print_date

これで正しく動作しました。

キーバインドで日付が入力できるようにしておくと、
汎用的に利用ができるので良いと思います。



## まとめ

いつも同じ結論ですが、**マニュアルはきちんと読みましょう。**

そのコマンドなりアプリなりを作ってくれた人は、
**その開発に割いた時間に加えて、ヘルプなりドキュメントなりを書いてくれているのです。
もう本当に感謝しかありません。**

逆にマニュアル読まずにググってばかりの人は、
これを機に **マニュアルを読む癖** をつけた方が良いと思います。
書いてくれた人のためにもね。

僕は感謝しながらマニュアルを読みつつ、
感謝をこめてブログにメモしようと思いました。
