+++
author = "girigiribauer"
categories = ["tech"]
date = "2016-09-12T11:42:17+09:00"
draft = false
tags = ["Ansible", "jinja2"]
title = "Ansible の playbook 内で条件分岐を行う方法"
aliases = ["/archives/20160912/"]
+++

これも公式に詳しく書いてなくて出来るのを分かってなかったので
僕と同じようなところで困っている人のためにメモっておきます。

## jinja2

Ansible では jinja2 というテンプレートエンジンが利用されています。

playbook 内で `{{ ssh_port }}` などの記述を埋め込むことで
外部の設定ファイルから ssh_port の値を環境に応じて出し分けることが可能です。

僕の場合は、ローカル（VirtualBox + Vagrant）環境と本番環境とで
設定値が異なるところを括り出して、Ansible の group_vars ディレクトリ以下に
環境ごとのファイル名をつけて保存しています。

Ansible 関係なく、jinja2 のテンプレートエンジンの解説ページが
以下にあります。

<http://jinja.pocoo.org/docs/dev/templates/>

こちらを見ると分かるように、Ansible の playbook 以外にも
HTML や XML などにも幅広く利用されているようです。

デリミタ（delimiter、区切り文字のこと）の種類として、以下の4つが使えるものとして挙げられています。

* {% ... %} for Statements
* {{ ... }} for Expressions to print to the template output
* {# ... #} for Comments not included in the template output
* #  ... ## for Line Statements

このうち、Ansible の playbook でよく使われるのが `{{ ... }}` の式の実行結果が出力できるやつで、
それ以外のものは公式のドキュメントにはほぼ見かけません。



## Ansible における条件分岐

Ansible で条件分岐できる方法はもちろんあるのですが、
when の中に記述する形のようです。
<http://docs.ansible.com/ansible/playbooks_conditionals.html> から抜粋します。

	tasks:
	    - shell: echo "I've got '{{ foo }}' and am not afraid to use it!"
	      when: foo is defined

	    - fail: msg="Bailing out. this play requires 'bar'"
	      when: bar is undefined

僕がやりたいのはこういうのではなくて（これでもコピペ増やせばできなくはなさそうだけど）、
環境変数を条件によって出し分けたいのです。例えばこんな感じ。

（group_vars 以下のファイルが tls: False のとき）

	env:
	  port: 80

（group_vars 以下のファイルが tls: True のとき）

	env:
	  port: 443

これを例えば以下のようにやってしまうと、エラーになってしまいます。

	env:
	{% if tls %}
	  port: 443
	{% else %}
	  port: 80
	{% endif %}

先ほどの jinja2 のドキュメントの方を参考にすれば、
こういった書き方もいけそうな気がするのですが、
どうやら jinja2 のテンプレートとして評価をする前に、
Ansible 側で **YAML の（設定）ファイルとして Valid かどうかをチェック** しているらしいです。

なので、上記のような書き方は出来ず、
あくまでこういったデリミタなしで YAML として成立してなくてはいけません。

一方で、`{{ ... }}` を埋め込むときは、文字列として `"{{ ... }}"` と囲むことが多いのですが、
文字列であれば YAML のチェックは通ります。

	env:
	  port: "{% if tls %}443{% else %}80{% endif %}"

上記のようにあくまで YAML のファイルで文字列が入ってますよーという風にすれば問題ないっぽいですね。

ちょっと不恰好ではありますが、
group_vars 以下の設定項目が冗長になるよりはだいぶマシかと思います。
（tls を false に変更したら、 port の項目も 443 から 80 に併せて変更、みたいなやつ）



## まとめ

Ansible の playbook を書くときは、

1. **まず YAML として成立させる**
2. **{% ... %} の埋め込みは文字列の中にまとめて入れる**

とやれば問題なさそうです。

不安であれば `ansible-playbook` の出力時に `-vvvv` などとつけてパラメータを確認すると良いかもしれません。



## 参考URL {#ref}

* <http://jinja.pocoo.org/docs/dev/templates/>
* <http://docs.ansible.com/ansible/playbooks_conditionals.html>
