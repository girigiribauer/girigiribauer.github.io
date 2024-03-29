+++
tags = [
"Git",
]
draft = false
author = "girigiribauer"
categories = [
  "tech",
]
date = "2016-12-27T19:59:53+09:00"
title = "git-diff と git-difftool を混同していた話"
aliases = ["/archives/20161227/"]
+++

`git diff` のカスタマイズがしたくて `.gitconfig` に以下のような記述をしたことがある人もいるかと思います。

    [diff]
      tool = vimdiff

でもこれ、違ったんです。
**git diff** 用の設定じゃなくて、 **git difftool** 用の設定だったのです。

**なんだってー！？** （色々略）



## git の diff 周りの設定の整理

diff 周りの設定を `.gitconfig` に何も書いてない状態の時は、

```txt
% git diff .zsh/basic.zsh
diff --git a/.zsh/basic.zsh b/.zsh/basic.zsh
index beff72b..19ac86c 100644
--- a/.zsh/basic.zsh
+++ b/.zsh/basic.zsh
@@ -12,19 +12,15 @@ export LANG="ja_JP.UTF-8"
 export SHELL="/bin/zsh"

 # PAGER
-export PAGER="less"
+export PAGER="lv -c"

 # EDITOR
-export EDITOR="/usr/bin/mvim -v"
-export PATH="/usr/bin/mvim:$PATH"
+export EDITOR="/usr/local/bin/vim -v -p"
+export PATH="/usr/local/bin/vim:$PATH"
```

このように **ユニファイド形式** の差分で出力されます。（テキスト自体の内容は本筋とは関係ありません）

Vim とか使ってると、いやそれ以外のエディタであっても、
diff とったときには左右に分割した状態（diff-mode）で比較したいじゃないですか。

となると、この `git diff` の挙動をカスタマイズしたいと思うのはけっこう自然なことだと思います。

でも、いくら以下のように設定しても、変化はおきません。

```txt
[diff]
  tool = vimdiff
```

そこで色々調べていくうちに、 **git diff** とは別のコマンドが存在していることを知るのです・・・。



## マニュアルをちゃんと読もう

マニュアルをちゃんと読みましょう（自分）。

`git help diff` を実行してマニュアルをよく読むと、
どこにも tool なんて解説項目はありません。

次に `git help config` を実行して diff 周りに tool の設定項目がないか調べてみると、
今度は見つかりました。ただ・・・

```txt
diff.tool
    Controls which diff tool is used by git-difftool(1). This variable overrides the value
    configured in merge.tool. The list below shows the valid built-in values. Any other value
    is treated as a custom diff tool and requires that a corresponding difftool.<tool>.cmd
    variable is defined.
```

**used by git-difftool(1)** とありますね・・・。

そう、 **git-diff** ではなく、 **git-difftool** だったのです・・・。



## git-difftool について

試しに `git difftool` を実行してみると、

```sh
% git difftool

This message is displayed because 'diff.tool' is not configured.
See 'git difftool --tool-help' or 'git help config' for more details.
'git difftool' will now attempt to use one of the following tools:
kompare vimdiff emerge

Viewing (1/1): 'path/to/file'
Launch 'vimdiff' [Y/n]:
```

`--tool-help` オプション付きでヘルプを見ろとあります。

そのまま付けて実行してみます。

```sh
% git difftool --tool-help
'git difftool --tool=<tool>' may be set to one of the following:
                araxis
                emerge
                opendiff
                vimdiff
                vimdiff2
                vimdiff3

The following tools are valid, but not currently available:
                bc
                bc3
                codecompare
                deltawalker
                diffmerge
                diffuse
                ecmerge
                gvimdiff
                gvimdiff2
                gvimdiff3
                kdiff3
                kompare
                meld
                p4merge
                tkdiff
                winmerge
                xxdiff

Some of the tools listed above only work in a windowed
environment. If run in a terminal-only session, they will fail.
```

つまり、 `git difftool` というコマンドが存在していて、 **その差分比較に使える difftool が複数存在しているものの、その標準で使う tool を設定できるのが diff.tool だったのです。**

では `.gitconfig` の diff 周りの設定を空にした状態で `git difftool` コマンドを使ってみましょう。

```sh
% git difftool .zsh/basic.zsh

This message is displayed because 'diff.tool' is not configured.
See 'git difftool --tool-help' or 'git help config' for more details.
'git difftool' will now attempt to use one of the following tools:
kompare vimdiff emerge

Viewing (1/1): '.zsh/basic.zsh'
Launch 'vimdiff' [Y/n]:
```

今は .gitconfig の diff 周りが未設定の状態で実行しているため、いくつか使用可能な difftool が列挙されています。

ここで Y を押してもいいですが、先に **diff.tool** の設定を追加してからもう一度実行してみます。

```txt
[diff]
  tool = vimdiff
```

上記を追加して、もう一度 `git difftool` コマンドを実行します。

```sh
% git difftool .zsh/basic.zsh

Viewing (1/1): '.zsh/basic.zsh'
Launch 'vimdiff' [Y/n]:
```

余計なメッセージが減りました。 つまり **diff.tool** の設定が正しく適用されています。そのまま Y キーを押します。

![](resource01.jpg)

こんな感じで左右に分割された差分が表示されます。

ちなみに、毎回 Y/n を打つのは面倒なので、 .gitconfig に **difftool.prompt** を設定しておくと、すぐに分割表示されます。

```txt
[difftool]
  prompt = false
```

はい。



## git diff と git difftool の違いについて

結局のところ何が違うのでしょう。 `git difftool` にはこんな説明文が書いてあります。

```txt
DESCRIPTION
       git difftool is a Git command that allows you to compare and edit files between revisions using
       common diff tools. git difftool is a frontend to git diff and accepts the same options and
       arguments. See git-diff(1).
```

要するに、 **git-difftool は（普段使っているような）共通の差分比較ツールを使って比較をするためのコマンド** です。

つまり **vimdiff のような比較表示をしたい場合は、本来こっちの git-difftool コマンドを使うべき** であって、 git-diff を vimdiff に近づけるのは本来の用途とはちょっと違う、と言えるかもしれません。

ちなみに、今回は触れていませんが、 difftool に対して同様に **git-mergetool** というのもあります。ほぼ同じような感じなのであとはお調べください。



## git diff に対するカスタマイズ

それが分かった上で、あえて git diff の挙動を変えることをしようとするならば、 **diff.external** というオプションがありますよ、というのが **git-config** に書いてあります。

```txt
diff.external
    If this config variable is set, diff generation is not performed using the internal diff
    machinery, but using the given command. Can be overridden with the `GIT_EXTERNAL_DIFF'
    environment variable. The command is called with parameters as described under "git Diffs"
    in git(1). Note: if you want to use an external diff program only on a subset of your
    files, you might want to use gitattributes(5) instead.
```

ここから先は
https://technotales.wordpress.com/2009/05/17/git-diff-with-vimdiff/
に書いてある方が詳しいのですが、
**vimdiff** の入出力の関係上、シェルスクリプトを挟みつつ、 diff の際の pager をオフにしてやる必要があるようです。



## まとめ

一言でまとめると、

```txt
[diff]
  tool = vimdiff
[difftool]
  prompt = false
```

**これらの設定は git-diff 用ではなく git-difftool 用です。**
それぞれお間違えなく。

基本的にドキュメント読んだので一応自己解決した話なのですが、
ググって書いてあったからといって盲信するのはよくありません。
**ちゃんとドキュメント読んで自分で検証しましょう。**

2016年もあとわずかですが、
来年も引き続きこういった勘違いとか混乱しやすい気づき系の記事を
不定期で細々と書いていって、
同じように困った人にとって助けになればと思います。

（もし解釈が間違ってるよ！ or 誤字脱字がー、などのツッコミなどあれば Twitter 経由などでいただけると幸いです）

では良いお年を。



## 参考URL {#ref}

- https://git-scm.com/docs/git-config
- https://technotales.wordpress.com/2009/05/17/git-diff-with-vimdiff/
