# 自分用のブログ更新方法まとめ

これはあくまで自分用のメモです。
WordPress から Hugo に移行した話は別にまとめてあるのでそちらをご覧ください。
<http://girigiribauer.com/archives/20160705/>



## 更新の仕方

新規記事の作成（最終的に日付にリネームするものの、いつ公開するか不明なので英単語をつないだものでわかりやすくしておく）

	hugo new post/foobar.md

一時的にレンダリング結果を確認（下書き含む）

	hugo server --buildDrafts

記事の下書き解除

	hugo undraft content/post/foobar.md

公開用ファイル生成（先に公開用 URL とファイル名を日付にする）

	hugo
	git add content/post/yyyymmdd.md
	git add public/
	git commit

develop から master へ push

	git subtree push --prefix=public git@github.com:girigiribauer/girigiribauer.github.io.git master



## 以下メモ

（初回のみ）master に何らかファイルがないと、後で subtree できないのでファイルを追加する

	git checkout master
	touch .gitkeep
	git add .gitkeep
	git commit
	git push origin master

（初回のみ）develop ブランチ内に master ブランチを subtree としてもたせる

	git checkout develop
	git subtree add --prefix=public git@github.com:girigiribauer/girigiribauer.github.io.git master --squash

（初回のみ）subtree pull してコンフリクトを避ける

	git subtree pull --prefix=public git@github.com:girigiribauer/girigiribauer.github.io.git master



## 参考URL

* <https://help.github.com/articles/using-a-custom-domain-with-github-pages/>
