+++
author = "girigiribauer"
categories = ["tech"]
date = "2018-02-05T11:52:41+09:00"
draft = false
tags = ["Docker"]
title = "Docker 再入門2018 - コンテナ編"
aliases = ["/archives/20180205/"]
+++

最近、Git, Docker あたりはほぼ必須のスキルセットになってきているかと思います。

前者の Git に関しては、
実際に数値を見たわけではないのですが、肌感覚としてデザイナーの方にもある程度広まってきていて、
幅広く使われてきているなあという印象を持っています。

反面、後者の Docker に関しては、
いまいち概念が理解できずにいたり、
あるいは、 **言われた通りにコマンド打って使ってはいるものの、
実際自分が何をやっているのか理解できていない** など、
あまりまだ浸透していない印象を受けます。

現状で **徐々にデジタルディバイドが広がっている感じ** を持ったので、
2018年にもなった今、改めて自分の知識の棚卸しも兼ねて、
**Docker を始めるならこんなところを知っておくべき、押さえておくべき、**
といったことをまとめ直してみようと思います。

（あっ、あと最近ブログ書いてなかったので・・・）

あともう1点書く理由としては、 Docker 周りのアップデートがだいぶ落ち着いてきており、
このタイミングなら記事を書いても、それほど鮮度が急に落ちることはないだろうと思った点があります。

学び直すなら今がちょうど良いかもしれません。

**Let's Docker!**



## 目次 {#index}

だいぶ長くなりそうなので（これを公開してる時点で全部書き終わってるはずですが）、
いくつかの記事に分けてあります。

1. **[コンテナ編](/archives/20180205/) （いまここ）**
	- 読むと Docker のコンテナ周りがざっくり分かる
	- 実際にシンプルな Docker コンテナを作ってみる
	- 用語の整理など
1. **[コマンド編](/archives/20180206/)**
	- 読むと Docker コマンドを中心に Docker の全体像がなんとなく分かる
1. **[エコシステム編](/archives/20180207/)**
	- 読むと DockerHub のサービスの活用方法がざっくり分かる
1. **[実践編](/archives/20180208/)**
	- 読むと Docker で環境構築する方法が分かる、怖くなくなる



## 下準備

Docker がインストールされてなくては何ともなりません。
まずはインストールしましょう。

### Docker のインストール

（正直この項目は省略してもいいんじゃないかと思いましたが、一応書いておきます・・・）

**読むだけじゃなく手を動かしましょう。**

何年か立って、Windows や Mac でも Docker が利用しやすくなりました。
それぞれインストーラが用意されているので、
Docker のインストール自体は非常に簡単です。

※なお、ここから先は2018年1月末時点のものです。
後から見ると画面などが古くなっている可能性があります。

公式はこちら。 ( https://www.docker.com/ )

![Docker 公式](resource01.jpg)

公式からドキュメントのページへ行くと、
最初の項目が Docker のインストールについて書かれています。

こちらです。 ( https://docs.docker.com/install/ )

順に読んで行くとそれぞれ Windows, Mac 用のインストールページへのリンクがあります。

![Docker Supported platforms](resource02.jpg)

それぞれのページで Stable （安定板）と書かれたものをダウンロードして、
そのままインストールを進めてください。

なお、気をつけないといけないのが、
**Windows 版については 64 ビットの Windows 10 Pro 以上でないと、 Docker は動作しません。**
もってない Windows ユーザーの人は大人しく買うか、さもなくば Mac or Linux に乗り換えるなどしましょう。

そもそも、 **本来 Docker というのは Linux の上で動作するものです。**
Windows の上で動いているのを奇跡だと思ってありがたく使いましょう。

一通りインストールが済んで、黒い画面を開いて `docker` と打ったら、
`Usage:  docker COMMAND` の行に続いてサブコマンドがずらずら・・・と表示されたら、
インストールは完了です。

あるいは各種プラットフォームのステータスバーなどにクジラのアイコンがあるので、
そちらに "Docker is running" と書いてあれば動作しています。

コマンドに慣れるためにも `docker` と打って確認してみましょう。

```txt
Usage:  docker COMMAND

A self-sufficient runtime for containers

Options:
      --config string      Location of client config files (default "/Users/[username]/.docker")
  -D, --debug              Enable debug mode
  -H, --host list          Daemon socket(s) to connect to
  -l, --log-level string   Set the logging level ("debug"|"info"|"warn"|"error"|"fatal") (default "info")
      --tls                Use TLS; implied by --tlsverify
      --tlscacert string   Trust certs signed only by this CA (default "/Users/[username]/.docker/ca.pem")
      --tlscert string     Path to TLS certificate file (default "/Users/[username]/.docker/cert.pem")
      --tlskey string      Path to TLS key file (default "/Users/[username]/.docker/key.pem")
      --tlsverify          Use TLS and verify the remote
  -v, --version            Print version information and quit

Management Commands:
  checkpoint  Manage checkpoints
  config      Manage Docker configs
  container   Manage containers
  （以下略）

Commands:
  attach      Attach local standard input, output, and error streams to a running container
  build       Build an image from a Dockerfile
  commit      Create a new image from a container's changes
  （以下略）

Run 'docker COMMAND --help' for more information on a command.
```

最近のコマンドは **多機能でサブコマンド化** されています。
（namespace が docker で、各コマンドは独立してると考えることも出来そうです）
`git commit [filename]` と同様に、
Docker では `docker run foobar` などのように続きます。



## どういうところで使われているか？

用語の整理の前に、現状どういうところで使われているかを見ていこうと思います。

どの例が分かりやすいですかね・・・。
なるべくシンプルにすぐ見た目確認できそうなやつだと、
**nginx** あたりでしょうか。
さすがに説明不要かと思いますが、 Web サーバです。

### nginx をコマンド1行で動かす

良くあるサービス、データベース、プログラミング言語環境などは、
やはりみんなが使うため、すでに公式で用意されています。
DockerHub というサイトです。

こちら。 ( https://hub.docker.com/ )

![DockerHub](resource03.jpg)

ここから `nginx` を検索すると、nginx official というリストが上あたりに表示されているかと思います。
それを選びます。

https://hub.docker.com/_/nginx/

URL を見ると、アンダーバーが間にありますが、ここは本来ユーザー名が入るところです。
DockerHub へは登録すれば誰でも Docker 用のリポジトリを作ることが出来て、
`[username]/[repositoryname]` の形で管理されます。

一方でみんなが良く使うものは公式で用意されているので、
ユーザー名は存在せず、 `[repositoryname]` だけで呼び出すことが可能です。

Docker を起動して nginx の空ページを表示してみます。
まだ Docker 良くわかってない人も、ここでは一旦考えずにコピペしましょう。
ちなみにコマンドを実行する場所はどこでも良いですが、
作業が自由にできるパスで行うことをお勧めします。

    docker run --name sample1 -p 8090:80 -d nginx

他と被ってなさそうなポート番号を適当に選びましたが、
`-p [自分のPC側ポート]:[Docker側ポート]` の順に書けばいいので、被っていれば適当に変えましょう。
8090 の場合は <http://localhost:8090> にアクセスすると、以下の空ページが表示されるはずです。

![Welcome to nginx!](resource04.jpg)

・・・コマンド1つで Web サーバが立てられてしまいました。すごい！

### Docker コンテナの性質

他の操作を行う前に、 Docker コンテナの性質について一通り。

1. コンテナには自分で名前をつけることができます（`--name sample1` のところ）
1. **同じ名前のコンテナは作れません** （消さないと作れない）
1. コンテナは **Created（作成した状態）** 、**Up（起動している最中）** 、**Exit（終了した状態）** などの状態を持ちます
1. `docker run` は Created から Up までを一気に行なっています
1. **コンテナは終了した状態でないと削除できません**
1. コンテナは閉じた世界です
1. コンテナの世界から自分のPC側へ、 **必要に応じて穴を開けることが可能です**

これらの Docker コンテナの性質を踏まえて、先ほどのコマンドを振り返ってみます。

    docker run --name sample1 -p 8090:80 -d nginx

* `--name sample1` というオプションは、あとでこの名前を指定してコンテナを削除するためです。
* `-p 8090:80` というオプションは、 Docker コンテナの世界では80番で nginx が起動しているのを、自分のPC側の世界で8090番に紐づけて、穴を開けることで表示確認しています。

おまけですが、 `-d` はコマンド入力したあとに nginx がバックグラウンドで動作するオプションです。
これを入れないと nginx が動作している最中は操作がこちらに戻りません。
（試してみると良いですが、停止させたいときは Ctrl-C です）

### nginx のコンテナにもっと穴を開ける

まず作りっぱなしのコンテナを停止させて削除しましょう。

    docker stop sample1
    docker rm sample1

これで `sample1` という名前のコンテナは無くなったのでまた作れます。

作る前に、今度は自分の HTML ファイルを表示してみたいですよね。
さらに穴を開けてみることにします。

今いるディレクトリ上で、名前は何でもいいですが、 `web` という名前のディレクトリを作ります。
さらに、 `web/index.html` というファイルを作り、中身を "hello docker!" とでもしておきます。
以下コピペすれば出来るようになってます。
（あ、Windows の人は該当コマンドがあるかどうか分からないので GUI で作るかお調べください・・・）

    mkdir web
    echo hello docker! > web/index.html

nginx のコンテナに穴を開けるにはどうすれば良いでしょうか？
その答えは DockerHub の nginx のページにあります。

https://hub.docker.com/_/nginx/

![How to use this image](resource05.jpg)

**How to use this image** という見出しがありますが、要は使い方です。

コンテナ側の世界では、 `/usr/share/nginx/html` というパスの中が、
いわゆる Web サーバのドキュメントルートとなっています。ここに HTML ファイルが置かれれば表示できます。
ファイルパスに関する穴を開けるのは、 `-v` オプションを使います。

    docker run --name sample1 -p 8090:80 -v $PWD/web:/usr/share/nginx/html -d nginx

キャプチャは貼りませんが、 <http://localhost:8090> にアクセスして "hello docker!" と表示されていれば成功です。

`-v [自分のPC側ファイルパス]:[Docker側ファイルパス]` の部分がファイルパスに関する穴を開けたオプションです。
手前側の $PWD というのは、自分のいるディレクトリを指します。直接スラッシュから全部入れてもいいですが、相対パスでは動きません。

### Web サーバだけじゃない Docker コンテナ

ここまでで終わってしまうと、Docker ≒ Web サーバ？と勘違いされてしまいそうなので、
別の例も挙げておきます。

そうですね、プログラミング言語で **Ruby** あたりどうでしょう？
( https://hub.docker.com/_/ruby/ )

以下をそのままコピペしましょう。

    docker run -it --rm --name sample2 ruby:latest ruby -e 'p 1+2'

最後の `ruby -e 'p 1+2'` の部分は、 Ruby そのものの話で Docker とは関係ないです。
`1+2` をざっくり表示しているだけのワンライナー（1行）プログラムです。

先ほどと異なるオプションだけ触れておきます。

- `-it` は先ほどの例で例えるなら、 **端末（黒い画面）に穴を開けて繋げている** ようなものです。 Docker 側で起きた出力結果を自分のPC側の端末に返してもらうためのものです。
- `--rm` は終了したら即コンテナを削除するオプションです。 `docker run` で作成、実行まで一気に行なっているのと逆ですね。

**通常、処理がすべて終われば Docker コンテナは停止します。**

ここ、地味に大事なところなんですが、普通は Docker コンテナって停止するものなんですよね。

先ほどの Web サーバの例は、サービスとして常に起動している必要があるため、
コンテナの中で終了させないようずっと止めているだけで、Docker コンテナの使われ方としては、
本来こちらの方が標準的というか、自然の姿なのかもしれません。

一旦サンプルとしてはここまでにしておきます。

### 触ってみてのまとめ

さわりだけですが、使ってもらって実感されたように、
Docker はインストールしたものの、 nginx や Ruby はインストールしてません。
つまり、 **自分のPC環境を汚さずにその環境を利用することが出来ます。**

すごいですね。

ちなみに、 Ruby ってそれなりにインストール時間かかるんですよ。

ちなみに、理解してないのにここまで手を動かさずに来ちゃった人は、
**今からでも戻って実際に手を動かしましょう。**



## Docker の特徴をざっくりと

現時点で見てきた部分の範囲で、ざっくり特徴を挙げてみます。

### コンテナは使い捨て

作成、実行中、終了、削除で使い捨てです。

### 必要に応じてコンテナと自分のPCとの間に穴を開けて使う

ポート番号をつないだり、ファイルパスを繋いだり、端末を繋いだりします。

### コンテナは閉じた環境

自分のPCとは隔離された状態なので、自分の環境を汚しません。

### Docker コンテナはインターフェース？

Web サーバ（nginx）と、プログラミング言語（Ruby）とが、
同じコンテナとして扱えてしまいました。

そういう意味で、Docker コンテナは外部環境を隔離して扱う、
インターフェースとしてみなすことが出来るかもしれません。

### 開発環境の配布にも使える

使えそうというか、実際使っているところはすでに多くあります。

開発環境を用意するというのは、本来専門書の最初の1～2章を割いて大きく説明するところなのですが、
Docker を利用することで、自分のPCに何がインストールされているかとは無関係に、
同一の環境を用意することが出来ます。



## 用語の整理

Docker コンテナに対するなんとなくのイメージが出来たところで、
そろそろ用語の整理をしたいと思います。

なお、イメージすることを優先するため、正確性を欠くところも出てくるかと思います。
ぜひとも公式ドキュメントも併せてお読みください。

### Docker イメージ

誤解を恐れずに言うと **Docker コンテナを作るときの雛形** に相当するものです。
先に Docker イメージを作っておくことで、
それを元にした Docker コンテナは意外とさくさく素早く作れます。

また、コンテナの機能が複雑になればなるほど、元となる Docker イメージのファイルは重くなります。

#### 実はさきほど利用しています

先ほど `docker run` した時に、手元に Docker イメージがない場合はダウンロードして作っています。

試しに `docker images` と入力してみましょう。
少なくとも先ほど `docker run` で作った元となっている nginx, ruby のイメージが出来ているはずです。
（なお、 docker のサブコマンドについては次回以降でもう少し触れます）

・・・今は Docker コンテナの雛形だと覚えておけば良いと思います。
実際にこの後作っていくうちに、だんだんとイメージできるようになると思います。

### Dockerize

一般的に **環境を Docker に閉じ込めることを Dockerize**  と言います。

なお、 dockerize という名前のプロダクトもあるようです。

### Docker Compose

これは Docker コンテナの起動、停止などのショートカット版と捉えてもらって良いと思います。

Docker をインストールすれば `docker-compose` コマンドも一緒にインストールされています。
試しに `docker-compose` と打ってみます。

```txt
Define and run multi-container applications with Docker.

Usage:
  docker-compose [-f <arg>...] [options] [COMMAND] [ARGS...]
  docker-compose -h|--help

Options:
  -f, --file FILE             Specify an alternate compose file (default: docker-compose.yml)
  -p, --project-name NAME     Specify an alternate project name (default: directory name)
  --verbose                   Show more output
  --no-ansi                   Do not print ANSI control characters
  -v, --version               Print version and exit
  -H, --host HOST             Daemon socket to connect to

  --tls                       Use TLS; implied by --tlsverify
  --tlscacert CA_PATH         Trust certs signed only by this CA
  --tlscert CLIENT_CERT_PATH  Path to TLS certificate file
  --tlskey TLS_KEY_PATH       Path to TLS key file
  --tlsverify                 Use TLS and verify the remote
  --skip-hostname-check       Don't check the daemon's hostname against the name specified
                              in the client certificate (for example if your docker host
                              is an IP address)
  --project-directory PATH    Specify an alternate working directory
                              (default: the path of the Compose file)

Commands:
  build              Build or rebuild services
  bundle             Generate a Docker bundle from the Compose file
  config             Validate and view the Compose file
  （以下略）
```

先ほど紹介したものはとてもシンプルな例だったので、
コンテナ1つで事足りるものでしたが、
実際はそれで収まらないことがほとんどです。

コンテナが2つ3つになって、開けたい穴も5箇所、10箇所と増えていくと、
何行にも渡ってコマンドを書くことになってしまいます。
人間さすがにそれはしんどいので、 Docker Compose などを利用して管理しやすい形にします。

詳しい話はコンテナ間の連携の話まで置いておきますが、
これだけは理解しておくと良いかと思います。

**Docker Compose のコマンドに出来て Docker 単体のコマンドに出来ないことは無いです。**
そういった意味で Docker コマンドのショートカット版と思ってもらって良いかと思います。

### kubernetes, k8s

なんか突然 Docker 関係ないようなワードですが、これも Docker 関連のワードです。

ちなみに、どうやらクベルネテスという読み方で落ち着いたご様子・・・。
http://yomikata.org/word/kubernetes
（くーばーねてす、じゃなかったのか・・・）

Docker コンテナをデプロイしたり、必要に応じて増やしたりと、
増えてきた Docker コンテナを交通整理する（オーケストレーション）ための仕組みです。

少なくとも最初の方では使うことはないでしょう。

### Docker Swarm (Swarm mode)

これも役割としては kubernetes と同様で、
元々 Docker と同梱されていたオーケストレーションツールです。

現在では kubernetes と docker swarm の両方が選べるようになっているようですね。
詳しくはおググりください。

### Dockerfile

Docker イメージを作るための設計図です。

つまり、 Docker コンテナを作るには、

1. Dockerfile から Docker イメージを作る
1. Docker イメージから Docker コンテナを作る

という2段階の作業が必要でした。

ただ、先ほどのような DockerHub には、
**すでに Dockerfile から Docker イメージが作られていて、タグ付きで公開されています。**

https://hub.docker.com/r/_/nginx/

![DockerHub nginx tags](resource06.jpg)

ちなみに、タグは何も指定しないと `latest` になります。

つまり、

    docker run -it --rm --name sample2 ruby:latest ruby -e 'p 1+2'

これと、

    docker run -it --rm --name sample2 ruby ruby -e 'p 1+2'

これは同一です。

### DockerHub

https://hub.docker.com/

公式の Docker イメージが公開されています。
Docker に関する Web サービスです。

Apache やら MySQL やら、よく使われるものは大抵公開されています。

イメージを引っ張ってくるだけなら、ログイン不要で使えます。

なお、悪意を持った人が Docker イメージを公開している可能性もゼロではないため、
何も考えなしにホイホイ Docker イメージを持ってきて利用するのはよろしくないかと思います。



## まとめ

Docker コンテナ周りの仕組みは何となく分かった感じでしょうか。
コンテナだけ見れば、それほど難しいものではありませんね。

ここから Docker コンテナを軸にして色々分からないところに踏み込んでいきます。

もちろんまだ続きます。

[コマンド編](/archives/20180206/)


## 参考URL {#ref}

- https://docs.docker.com/
- https://hub.docker.com/
