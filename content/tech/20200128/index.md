+++
author = "girigiribauer"
categories = ["tech"]
tags = ["Hugo", "Static Site Generator"]
draft = false
date = 2020-01-28T17:00:00+09:00
lastmod = 2020-02-13T00:00:00+09:00
title = "Hugo をしばらく触ってなかったので、わかりやすくまとめ直した"
+++
タイトルの通りです。

インプット・アウトプットを色々見直そうと思った一環なのですが、
しばらく触っていなかった Hugo (Static Site Generator) のテンプレートをあれこれ見直していたら、
なんだかよく分からない機能があれこれ増えていて、あるいはすっかり忘れてしまった機能もあったりしたので、改めて調べてみた記録です。

![Hugo](resource01.jpg)

Hugo めっちゃ軽くて、 markdown や黒い画面とか触る人にはめっちゃおすすめな Static Site Generator なので、
使いたいけどよく分からない人は、こちらをさくっと読んでどんどん使っていったらいいと思います。



## ページにどのような種類（Kind）があるか？

まずページの種類を把握しないことにはなんともならないので、どういったものがあるか調べます。

- **Home Page**
    - トップページ
    - トップページも結局リストなので、対応記事は存在しない
- **Regular Pages**
    - 通常ページ、詳細ページ
    - `content/` 以下にある記事（ `sample.md` とか `tech/20200128.md` とか）が1対1に紐づいて表示される
- **Section List Pages**
    - セクション一覧ページ（カテゴリーとは異なる）
    - `content/` 以下にディレクトリを作ると、それがセクションとなる
    - つまり2つ以上のセクションにまたがった記事は存在しない
    - `content/xxx/_index.md` を作ることで、セクション一覧用の記事を作ることができる
- **Taxonomy Terms Pages**
    - タクソノミー一覧ページ ~~タクソノミーに属する記事一覧ページ~~
    - いわゆるタグ一覧ページ、カテゴリー一覧ページ
    - リストの対象が記事ではなく、タクソノミー自体の一覧
- **Taxonomy List Pages**
    - タクソノミーに属する記事一覧ページ ~~タクソノミー一覧ページ~~
    - いわゆるタグに属する記事一覧、カテゴリーに属する記事一覧がそれに相当する
    - ちなみに `categories`, `tags` のタクソノミーは最初からある

**2/13 追記: taxonomy と taxonomyTerm の説明が逆になっていたので修正（すみません・・・）**

ああ、この辺過去に理解したつもりだったけどすっかり忘れてました・・・。

特に **セクションとカテゴリーを混同しやすい** ので注意が必要かもしれません。
カテゴリーもタグと同じく複数のカテゴリーに属することができるので、どこか必ず一つにのみ属するものが必要なのであれば、セクションを活用すべきですね。

一方でカテゴリーはあくまでタクソノミーの一種類でしかすぎません。
`categories` や `tags` とは異なるタクソノミーを独自に作ることも可能です。

もしややこしくてどちらか使いたくないのであれば、 `config.toml` の設定ファイル内に `disableKinds` を定義して、
`home`, `page`, `section`, `taxonomy`, `taxonomyTerm` のいずれか、または複数指定して無効化すれば、混乱することもなくなるかもしれません。



## テンプレートの表示順序について

先に Base テンプレートの仕組みを理解する必要があります。

### Base テンプレート

名前の通りベースのテンプレートとして使われるやつです。知っておくべきルールは以下あたりです。

1. すべての HTML の共通部分を頭から（`<!DOCTYPE HTML>` から）全部書く
1. 特になければ `layouts/_default/baseof.html` に配置する
1. セクションごとに特化した Base テンプレートは `layouts/[section_name]/baseof.html` に配置すると優先して使われる
1. テンプレート内でブロックを定義 `{{ block "main" . }}{{ end }}` して、後に続くテンプレート階層で必要に応じてブロック単位で上書きして使う

最後のルールがちょっと分かりづらい（最初知らなかった）ので掘り下げます。

```
layouts/_default/baseof.html

<!DOCTYPE HTML>
（略）
<main role="main">
{{ block "main" . }}
<h1>ベースのページです</h1>
{{ end }}
</main>
```

`layouts/_default/baseof.html` の方に block を指定します。

```
layouts/_default/list.html

{{ define "main" }}
<h1>一覧ページです</h1>
{{ end }}
```

そして `layouts/_default/list.html` などのテンプレートに define を指定します。

こうすると、レンダリング結果として以下のようになります。

```
<!DOCTYPE HTML>
（略）
<main role="main">
<h1>一覧ページです</h1>
</main>
```

もし仮に `layouts/_default/list.html` のテンプレートが存在してなければ、存在していても `define "main"` で上書きされていなければ、 `ベースのページです` とそのまま表示されます。

つまり、共通のものはできるだけ `baseof.html` の方に書いて、あとで差分が出そうなところを `block` で上書きできるように準備しつつ、
Base テンプレート以外のテンプレート階層のファイルで必要に応じて上書きしていきます。

詳しくはこちら。 https://gohugo.io/templates/base/

### `Home` テンプレート

ということで、ここから先は Base テンプレートで定義してある前提の話です。

1. `baseof.html` テンプレートを基準に描画
1. `layouts/index.html` で必要に応じて `block` を上書き
1. 上記を用意していなければ `layouts/_default/list.html` が使われる

### `Regular Pages` テンプレート

いわゆる詳細ページのテンプレートです。

1. `baseof.html` テンプレートを基準に描画
1. `layouts/_default/single.html` で必要に応じて `block` を上書き
1. 特定のセクションでレイアウトを変えたいときは `layouts/[section_name]/single.html` に配置すると優先して上書き

### `Section List Pages` テンプレート

セクション一覧のテンプレートです。

1. `baseof.html` テンプレートを基準に描画
1. `layouts/_default/section.html` で必要に応じて `block` を上書き
1. 上記を用意していなければ `layouts/_default/list.html` が使われる
1. 特定のセクションでレイアウトを変えたいときは `layouts/[section_name]/section.html` に配置すると優先して上書き

### `Taxonomy Terms Pages` テンプレート

いわゆるタグやカテゴリに属する記事一覧のテンプレートです。

1. `baseof.html` テンプレートを基準に描画
1. `layouts/_default/terms.html` で必要に応じて `block` を上書き
1. 上記を用意していなければ `layouts/_default/list.html` が使われる
1. 特定のタクソノミーでレイアウトを変えたいときは `layouts/[taxonomy_name]/terms.html` に配置すると優先して上書き

ちなみにここでいう `[taxonomy_name]` は、すでに用意してある `categories` や `tags` が相当します。

### `Taxonomy List Pages` テンプレート

タグやカテゴリ自体の一覧テンプレートです。

1. `baseof.html` テンプレートを基準に描画
1. `layouts/_default/taxonomy.html` で必要に応じて `block` を上書き
1. 上記を用意していなければ `layouts/_default/list.html` が使われる
1. 特定のタクソノミーでレイアウトを変えたいときは `layouts/[taxonomy_name]/taxonomy.html` に配置すると優先して上書き

### それ以外のテンプレート階層について

種別としては上記までですべて出てるので、他のものは覚える必要はありません。

例えば `Home` テンプレートは `index.html` だけではなく `home.html` という名前で配置すれば同じようにアクセスできたり、
一部テンプレートは `list.html.html` などという `.html` が重複してても良いようなルールになっているらしかったり、
この辺が Hugo を若干複雑にしてきてる感があるのですが、もうちょっと簡素にしちゃってもいいんじゃないかなあとは思います。



## 独自テーマの作り方

上記テンプレート階層のルールを把握しておけば、あとは既存のテーマを参考にしながら作ると非常にスムーズだと思います。

https://gohugo.io/getting-started/quick-start/

Quick Start でも紹介されている Ananke というテーマが都合が良いかもしれません。

![Hugo](resource02.jpg)

https://themes.gohugo.io/gohugo-theme-ananke/

こちらのテーマは機能がすべて入っているため、公式の Quick Start でも紹介されていて、テーマの勉強ついでに触ってみるのも良いですね。

あるいは僕が今やっている方法なのですが、 `layouts/_default/baseof.html` だけをまず先に作って、
必要なページをすべて表示した状態で徐々にテンプレートを追加していくのもありだと思います。
（それで階層構造を把握しつつ公式ドキュメントを読んでたりしてました）

### おまけ知識

あとはおまけ知識です。

- 日付のフォーマットは Golang なので、 **日付は必ず2006年01月02日** を使う必要があります
    - 詳しくはここ https://golang.org/pkg/time/#pkg-constants
    - `YYYYMMDD` みたいな書き方ではない
    - たぶん英語的な表示順で 01, 02... とついてるので、英語的に見るとわかりやすいのかもしれないが、年から並べると意味不明なのでこれはよくない
- `<head />` 内に定義するよくあるやつは、 `_internal` テンプレートとして予め用意されてる
    - https://gohugo.io/templates/internal/
- よく使う CLI コマンドは `hugo server`, `hugo` あたり
    - `draft: true` の記事が localhost で表示されなくてハマるので `hugo server --buildDrafts` で起動するか `config.toml` の `buildDrafts` オプションで設定する
- `{{- xxx -}}` のように、前後に `-` を入れることで、 HTML 出力時に改行やインデントをカットできる

これ以上は実際に触ってみた方が早いです！ **Let's try!**



## まとめ

恒例の締めなんですが、公式ドキュメントをちゃんと読みましょうってことですね。

分からないことの9割以上は公式のドキュメントに書いてあるはずなので、それをじっくり読みながら試しながらでやっていくといいと思います。



## 参考 URL

- https://gohugo.io/
