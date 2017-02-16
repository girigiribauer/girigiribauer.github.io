+++
draft = true
author = "girigiribauer"
layout = "archives"
date = "2017-01-27T19:48:08+09:00"
title = "Syntastic でそもそもチェッカーが有効かどうかをチェックする"
categories = [
  "tech",
]
tags = [
  "Vim",
]

+++
まともな Vimmer なら何らかの syntax checker は入れていると思いますが、
その中でも **Syntastic** を入れている人は一定いると思います。

これ、良いプラグインですよね。
言語ごとにシンタックスチェックの設定ができて、
それに従ってチェックしてくれます。

<https://github.com/vim-syntastic/syntastic>

例えば JavaScript であれば、

    let g:syntastic_javascript_checkers = ['eslint', 'jshint']

などのように、チェッカーを1つ以上指定します。

PHP であれば同様に

    let g:syntastic_php_checkers = ['phpcs']

などですね。

ちなみに、どんな種類があるかは

    :h syntastic-checkers

で確認ができます。

またちょっと古いですが、こちらにも載ってます。

<https://github.com/vim-syntastic/syntastic/wiki/Syntax-Checkers>



## チェッカーを指定したものの、そもそもインストールされてない

僕はときどきやらかすのですが、
チェッカーとして指定しているものの、
その **指定したチェッカーがそもそもインストールされておらず、**
**エラーも出ないので問題ないと判断してしまう** といううっかりが不定期で起こります。

どういうことかというと、
まあ当然といえば当然なんですが、
jshint であれば jshint 自体をインストールしていなければ、
Syntastic 上では使えません。

この場合に問題となるのが、
**エラーが0だった場合とチェッカー自体が使えない場合が、全く表示が同じ** なんですよね。
あまり書かない言語だったりすると、
気づかずにそのままというケースもあったりします。

こういううっかりをなんとかしようと思い、
**指定先がインストールされていない時に警告を出す方法** が何かないかと色々探し、
用意されている hook の仕組みを利用することにしました。

    function! SyntasticCheckHook(errors)
      " チェッカーの有無をチェックする
      try
        let l:checkers = eval(printf("g:syntastic_%s_checkers", &filetype))
      catch
        return
      endtry
      for checker in checkers
        if executable(checker) != 1
          :echohl WarningMsg | echomsg printf("checker '%s' is not executable.", checker) | echohl None
          return
        endif
      endfor
      return
    endfunction

チェック自体はけっこうシンプルで、
Vim にあらかじめ用意されている `executable()` を使って、
その指定されているチェッカーを実行できるかどうかを調べ、
出来なかった場合は警告を出しています。

これを入れておくだけでも、だいぶ安心感が違いますね。

試しに存在しないチェッカー、 aaa を
`g:syntastic_php_checkers` あたりに入れてみます。

    let g:syntastic_php_checkers = ['phpcs', 'aaa']

適当に書いたものを保存してみます。

そうすると Vim の下の方にこんな表示が。

    "sample.php" 1L, 17C written
    checker 'aaa' is not executable.
    Press ENTER or type command to continue

チェッカーがなくてチェック自体できなかったよ、
というのがこれで分かるようになります。良いですね。
