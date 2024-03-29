+++
author = "girigiribauer"
categories = ["tech"]
date = "2018-02-06T08:37:51+09:00"
draft = false
tags = ["Docker"]
title = "Docker 再入門2018 - コマンド編"
aliases = ["/archives/20180206/"]
+++

今回はコマンド編です。
コンテナ編から順に読むことをお勧めします。



## 目次 {#index}

1. **[コンテナ編](/archives/20180205/)**
	- 読むと Docker のコンテナ周りがざっくり分かる
1. **[コマンド編](/archives/20180206/) （いまここ）**
	- 読むと Docker コマンドを中心に Docker の全体像がなんとなく分かる
	- docker コマンドを基準に Docker を掘り下げてみる
	- docker-compose コマンドを基準に Docker を掘り下げてみる
	- コンテナへの侵入、ログの見方など
1. **[エコシステム編](/archives/20180207/)**
	- 読むと DockerHub のサービスの活用方法がざっくり分かる
1. **[実践編](/archives/20180208/)**
	- 読むと Docker で環境構築する方法が分かる、怖くなくなる



## docker コマンドを基準に Docker を掘り下げてみる

前回は Docker コンテナにぼんやりイメージを持ってもらいつつ、
その周辺の用語整理などを行いました。

その際、 `docker` コマンドを多少触りましたが、
今回は他にどんなコマンドがあるかを整理しながら、 Docker をもう少し掘り下げて見てみます。

ちなみに公式ドキュメントはこちらです。
https://docs.docker.com/engine/reference/commandline/docker/#child-commands

![Docker 公式](resource01.jpg)

なお、どこかのバージョンでコマンドの再整理が行われたのですが、
特に新旧対比させてもここでは意味がないので、新しいコマンド体系のみ触れたいと思います。

詳しくは自分で調べてもらうか、以下なんか分かりやすいのではないでしょうか。
https://qiita.com/zembutsu/items/6e1ad18f0d548ce6c266

### コレクション系

コレクション系というのは特に公式で呼ばれているわけではないのですが、
Docker で扱うものがコンテナ以外にも増えてきて、
既存のコマンド体系では支えきれなくなったため、
**サブコマンドの部分にコレクション名を指定して、そこからさらにサブコマンドを増やしたもの** を、
ここではコレクション系と言うことにします。

公式では Management Commands と呼ばれているんですかね？

- docker container
- docker image
- docker volume
- docker network

`docker container` は Docker コンテナのコレクション系に対する操作、
`docker image` は Docker イメージのコレクション系操作だと想像つきます。
下の2つはまだ触れていませんので、これから触れていきたいと思います。

#### Docker におけるボリュームについて

Docker は作って消すといった使い捨てで利用されるため、
**データの永続化** というのは常に課題となってきます。
（破棄するコンテナの中にのみデータを入れていたら、コンテナの削除時にデータも一緒に削除されます）

そこでボリュームを使ってデータを保存することを考えます。

公式はここ。 ( https://docs.docker.com/storage/volumes/ )

Docker でボリュームを利用する方法は、
**bind mounts** という前回使った方法に近いものと **`docker volume` コマンドでボリュームを作る方法** の2種類あります。

前者は前回 `docker run` で使った、 `-v` の部分がそれに近いです。
そもそも v は volume のことですね。
この方法では、コンテナ側と自分のPC側を繋げて穴を開けることで、そこを経由してデータのやりとりを行なっていました。

この前者の方法だけでは、コンテナが増えてきてコンテナ同士のデータのやりとりが発生してきたりすると、
非常に複雑になってきてしまいます。
そこで、後者の方法として Docker 専用のボリュームを扱えるように `docker volume` コマンドが用意されました。

実際に公式ドキュメントのように打ってみましょう。

    docker volume create my-vol

ちなみに、これらのコレクション系のコマンドには、 **共通で `ls` と `rm` サブコマンドが用意されている** ので、
作ったものを確認したり、削除したりは簡単にできます。

今作ったものを確認してみます。

```txt
% docker volume ls
DRIVER              VOLUME NAME
local               my-vol
```

もしかして、すでに Docker を利用した開発環境を利用されている方は、
今作ったボリューム以外にも存在しているかもしれませんが、
少なくとも今作ったボリュームが存在しているはずです。

なお、実際にコマンドだけで、Docker のボリュームを利用しつつ Docker コンテナ同士を紐付けたりしていると、
おそらくコマンドも長くなってしまって、理解が追いつかないままコマンドをコピペするだけの記事になると思われるので、
今回は概念の理解に留めます。

ついでに消しておきます。

```txt
% docker volume rm my-vol
my-vol
```

消えました。

#### Docker におけるネットワークについて

ネットワークについても同様に後から追加されてきたものです。

コンテナが増えてくると、 `docker run` コマンドで `--link` オプションを使って、
Docker コンテナ同士を紐づけていくのは複雑になってきます。

このあたりは `docker volume` と同じで、`docker network` にて
専用のネットワークを作れるようにして管理しやすくした形です。

`docker network` コマンドに、サブコマンドが色々ついているので、
ぜひともそのまま打って help などを見てみてください。

ちなみに公式はここです。 ( https://docs.docker.com/engine/userguide/networking/ )

これも `create`, `ls`, `rm` と一通りできますが、
ネットワークの説明に大部分時間を割くことになり、本質的ではないので省略します。

ポイントは **Docker コマンドで専用のネットワークを作ったり消したりすることが出来る** 、
ということだけ今は押さえておけば良いです。

### コンテナ操作系

- docker run
- docker start
- docker stop
- docker rm
- docker exec

まあ、この辺は前回大部分触ったし、紹介だけでいいかな。
ただ `exec` はちょっと別ものなので後ほど改めて触れます。

Docker コンテナの各種操作に利用するサブコマンドです。

`docker run` について知りたいなら、 `docker help run` か `docker run --help` と入力すれば、
一言説明と、使えるオプションがずらーっと出てきます。

ただ、コンテナの操作をしたかったら、 `docker container` 以下にコマンドが揃っているので、
`docker run` でもいいですし、 `docker container run` でもいいです。

- docker container run
- docker container start
- docker container stop
- docker container rm

これでも OK です。

### コンテナ調査系

- docker logs (= docker container logs)
- docker inspect (= docker container inspect)

これもさわりだけ。

    docker logs -f [containername]

これでコンテナ内で起きていることのログをチェックすることができます。

`inspect` の方は、実はコレクション系すべてについているサブコマンドなのですが、
特にコンテナを調べるときは省略して `docker inspect` が使えます。

    docker inspect [containername]

掲載すると長くなってしまうので省略しますが、
JSON 形式でコンテナ周りに関するあらゆる情報を確認することが可能です。

### イメージ操作系

- docker images (= docker image ls)
- docker pull (= docker image pull)

`docker images` は前回使いましたが、実際 `docker image ls` でもいいです。

また、 `docker run` の中で自動的に行われている Docker イメージの取得ですが、
このように `docker pull` または `docker image pull` のように明示的に行なってもよいです。

### その他

`docker ps` は `docker container ls` と同一です。まだよく使われているようです。

### あとは必要なときに調べよう

Docker で扱えるコレクション系のものにどういうものがあるのか、
どういったサブコマンドがあるか、あたりが押さえられていれば、
とりあえずの利用には全く問題がないと思います。



## docker-compose コマンドを基準に Docker を掘り下げてみる

次は、 Docker Compose ベースで考えていきます。
前回少しだけ触れたのですが、
**Docker Compose のコマンドに出来て Docker 単体のコマンドに出来ないことは無いです。**

これから Docker Compose に触れていきますが、
頭の中で、これ Docker だったら `docker volume` コマンドを打っているのと同じだな、
みたいに考えるとすごくイメージしやすいと思います。

Docker コマンドが Docker コンテナに与える指示1つ1つだとすれば、
**Docker Compose は指示書にまとめながら「まとめてこれやって」と指示を出すのに近いです。**

公式はこちら。
( https://docs.docker.com/compose/ )

![Docker Compose 公式](resource02.jpg)

もう一度言いますが、
**Docker Compose のコマンドに出来て Docker 単体のコマンドに出来ないことは無いです。**

### 試しに WordPress 立ててみる

公式にもリンクがありますが、
みなさん一番身近であろう WordPress を立ててみます。

"Get started with WordPress" のリンクを辿ってみます。
そちらに一通り方法が掲載されています。

手元に適当な作業用ディレクトリを作り、そこで `docker-compose.yml` というファイルを作ります。

この作業用ディレクトリがコンテナ名のプレフィックスになりますので、
今回の作業ディレクトリ名は、例えば `my_wordpress` とでもしておきます。


```yaml
version: '3'

services:
  db:
    image: mysql:5.7
    volumes:
      - db_data:/var/lib/mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: somewordpress
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress

  wordpress:
    depends_on:
      - db
    image: wordpress:latest
    ports:
      - "8000:80"
    restart: always
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
volumes:
  db_data:
```

この YAML ファイルの読み方を簡単に説明したいと思います。

なお、こちらのファイルの書き方については、
公式ドキュメントの https://docs.docker.com/compose/compose-file/ を見ると早いと思います。

Docker が出て来た当初は、 Docker Compose のバージョンの1と2で大きく文法が異なりましたが、
（先ほど Docker コマンド周りで紹介した、ボリュームやネットワークをこちらに記述する必要が出て来たためです）
最近は落ち着いてきているので **基本的に3以上を使いましょう。**
ちなみに今は最新が3.5のようですね。

### Docker イメージから Docker コンテナを作るところ

イメージからコンテナを作るところにフォーカスしてみます。
つまり services の中だけです。

```yaml
db:
  image: mysql:5.7

wordpress:
  image: wordpress:latest
```

これはそれぞれ、

    docker run mysql:5.7
    docker run wordpress:latest

とコマンドを打っているのと同様です。

前の説明の通り、ユーザー名が省略された形ですので、
公式の DockerHub のイメージを参照しに行っていることが分かります。

まだ WordPress は見てなかったので見てみましょう。
( https://hub.docker.com/_/wordpress/ )

![DockerHub wordpress](resource03.jpg)

公式の Docker イメージを利用する際は、
いわゆる "穴の開け方" を書いてあったりしますので、
必要に応じて参照すると良いと思います。

### 環境変数を利用したパラメータの設定方法

そうそう、穴の開け方でもう1つ紹介してなかったのがありました。
それは **環境変数を利用したパラメータの設定方法** です。

    docker run --name some-wordpress -e WORDPRESS_DB_HOST=10.1.2.3:3306 （中略） wordpress

このように、引数に `-e` をつけることで、コンテナ内に自由に環境変数を設定することができます。

この WordPress のイメージでは、
以下の環境変数を指定することであらかじめこちらの付けたい名前でデータベースを作ってくれます。

- WORDPRESS_DB_HOST
- WORDPRESS_DB_USER
- WORDPRESS_DB_PASSWORD
- WORDPRESS_DB_NAME

WordPress のイメージならば、だいたいこの辺りがよく使われるでしょうか。

環境変数は自由に設定できますが、 **公式の wordpress の中で、上記の環境変数名を正しく指定すると、
それを優先してユーザー名やパスワードに利用してくれる作り** になっており、
カスタマイズが非常にやりやすくなっています。

### 複数コンテナを連携させることが前提となっている

WordPress のコンテナはまさにそれです。

WordPress というアプリケーションを提供するコンテナと、
MySQL というデータベースを提供するコンテナを、
**それぞれコンテナ同士を連携させて全体としてのサービスを提供するようになっています。**

また連携周りだけフォーカスしてみます。

```yaml
services:
  db:
    image: mysql:5.7
    volumes:
      - db_data:/var/lib/mysql

  wordpress:
    depends_on:
      - db
    image: wordpress:latest
volumes:
  db_data:
```

ここから以下のことが分かります。

1. db コンテナと wordpress コンテナが存在している
1. wordpress コンテナは db コンテナに依存している (`depends_on`)
1. db_data というボリュームがある
1. db_data ボリュームは db コンテナにて `/var/lib/mysql` に紐づけられている

### Docker Compose を利用してコンテナ起動してみる

ポート番号だけ、何か他に動かしているものとかぶってないか注意してください。
もし 8000 番と被っていたら、適当に 8091 などと変更します。
うーん、ここでは 8091 に変えておきましょうか。

```yaml
wordpress:
  ports:
    - "8091:80"
```

変更したらいよいよ起動してみます。

    docker-compose up -d

オプションはだいぶ似てます。 `-d` は `docker run` のときと同様にバックグラウンドでの起動です。
無事起動したら、 http://localhost:8091 を見てみます。

![dockerized wordpress](resource04.jpg)

言語設定できてないので言語選択からですが、
テキストファイル1つ書いただけで、2つの Docker コンテナと1つのボリュームを即時に立てることが出来ました！

### Docker Compose における最低限の操作

- docker-compose up
- docker-compose down

起動と終了です。

#### docker-compose up

バックグラウンドで起動するときは、 `docker-compose up -d` です。
これで `docker run` 相当のことをしてくれます。

```txt
% docker-compose up -d
Creating network "mywordpress_default" with the default driver
Creating mywordpress_db_1        ... done
Creating mywordpress_wordpress_1 ... done
```

#### docker-compose down

逆にコンテナの停止、削除まで行なってくれます。
なお、 `docker-compose down -v` のように `-v` をつけると、
ボリュームの削除まで行なってくれます。

```txt
% docker-compose down -v
Stopping mywordpress_wordpress_1 ... done
Stopping mywordpress_db_1        ... done
Removing mywordpress_wordpress_1 ... done
Removing mywordpress_db_1        ... done
Removing network mywordpress_default
Removing volume mywordpress_db_data
```

`-v` をつけない `docker-compose down` だけだと、データが消えることはありません。
(ただし自分のPCがどうにかならない限りは・・・)
ちゃんとボリュームに紐づけられているため、ボリュームを消さない限りは同じデータを常に参照します。

### docker コマンドで色々見てみる

`docker-compose up -d` で立ち上げた状態で `docker` コマンドを使って見てみます。

`docker container ls` でもいいのですが、
出力が横に長すぎるので `--format` オプションで表示コントロールします。

```txt
% docker container ls --format "table {{.Image}}\t{{.Status}}\t{{.Names}}"
IMAGE                          STATUS              NAMES
wordpress:latest               Up 3 minutes        mywordpress_wordpress_1
mysql:5.7                      Up 3 minutes        mywordpress_db_1
```

見ると、予想通り Docker コンテナが2つ立ち上がっているのが分かります。

名前は特につけていないので、ディレクトリ名が頭について、サフィックスとして連番がついています。
連番がつくのは、 Docker Compose 自体がスケーリングの機能を持っていて、
2つ3つとコンテナを増やすことが出来るからです。

今度はボリュームを見てみます。 `docker volume ls` です。

```txt
% docker volume ls
DRIVER              VOLUME NAME
local               mywordpress_db_data
```

mywordpress_db_data という名前のボリュームが出来てました。
これは Docker のコマンドで `docker volume create mywordpress_db_data` と入力するのと同じです。

さらにログを見てみると、ネットワークも出来ていた形跡があるのでそちらも。
`docker network ls` です。

```txt
% docker network ls
NETWORK ID          NAME                    DRIVER              SCOPE
0f4f994415be        mywordpress_default     bridge              local
```

特に設定していないので、名前も mywordpress_default と自動で割り振られていました。

### Docker Compose は Docker に比べて楽

Docker で1つ1つコマンドを作って実行して・・・とやっていると結構しんどいです。

Docker Compose では、やれることは同じですが、
コマンドで入力すべき内容を `docker-compose.yml` というファイルにまとめておき、
それを元にまとめて指示できるので、楽というか、めんどくさくない点がメリットです。

Docker Compose がなかったら、 `docker run` コマンドで穴を開けるためのオプション、
例えば `-e WORDPRESS_DB_PASSWORD=mypassword` とか `-p 8091:80` とか、
あるいは `-v $(pwd)/web:/var/www/html` などをずらずらと5行10行と書くことになっていたかもしれません。

Docker Compose は Docker に比べて楽です。



## コンテナへの侵入、ログの見方など

さて、利用編ということで書いていますが、
あと何があれば過不足ないかというと、
**「なぜか動かないんだけど、どこ見ていいか分からない・・・！」**
といったあたりではないでしょうか。

もしそれを提供してくれた方がいれば、
もうその方に直接聞いた方がいいのかもしれませんが、
それにしても **自分でできる範囲で状況把握ができると良いですね。**

### コンテナで何かを実行する方法

コンテナに入る方法というよりは、
コンテナに対して何かを追加で実行する方法と考えた方が良いです。

ポイントはこの辺りでしょうか。

- **コンテナが起動していないと入れない、実行できない**
- 新たに何かをコンテナ内で実行し、それを自分の端末とつなぐ

Docker コンテナに対して任意のコマンドを実行できるコマンドが用意されています。

    docker exec -it mywordpress_wordpress_1 /bin/bash

`-it` は `docker run` のときと同様で、端末を繋いで穴を開けるためのオプションです。
そのままコンテナ名を指定して、さらに実行したい任意のコマンドを与えます。

`/bin/bash` は実行するとシェル (bash) が起動して、
終了するまで待機状態になります。
なので、  **コンテナに対して /bin/bash を実行して、その最中手元の端末と繋げることで、
実質的にコンテナの中に侵入していることになる** 、というからくりです。

### 実際にコンテナに入ってみる

せっかくなので、 WordPress のアプリが動いているコンテナにそのまま入ってみましょうか。
ただ正確には、 Docker コンテナに対して追加で /bin/bash コマンドを実行しつつ、コンテナと自分との端末をつないでいる（`-it` オプション）だけです。

    docker exec -it mywordpress_wordpress_1 /bin/bash
    root@321ff1fdf395:/var/www/html#

適当に `ls` とか `pwd` とか打ってみます。

```txt
root@321ff1fdf395:/var/www/html# ls
index.php        wp-blog-header.php    wp-cron.php        wp-mail.php
license.txt      wp-comments-post.php  wp-includes        wp-settings.php
readme.html      wp-config-sample.php  wp-links-opml.php  wp-signup.php
wp-activate.php  wp-config.php         wp-load.php        wp-trackback.php
wp-admin         wp-content            wp-login.php       xmlrpc.php
root@321ff1fdf395:/var/www/html# pwd
/var/www/html
root@321ff1fdf395:/var/www/html#
```

中に入れましたね。

### コンテナ内に存在してないコマンドは実行できない

`which /bin/bash` と `which /bin/zsh` をそれぞれ打ってみてください。

```txt
root@321ff1fdf395:/var/www/html# which /bin/bash
/bin/bash
root@321ff1fdf395:/var/www/html# which /bin/zsh
root@321ff1fdf395:/var/www/html#
```

bash はありますが zsh は入ってませんので、実行したいコマンドに `/bin/zsh` を与えても正しく動作しません。

また、 Docker コンテナは作成時に最小限の機能しか持たせないことが多いので、
普段使っているコマンドが入っていないケースなども多くあるかと思います。
その場合は、どうせ使い捨てコンテナなのでその場でインストールしちゃったりしても良いでしょう。

### ログの見方

もう駆け足です。

#### Docker の場合

    docker logs -f [containername]

`-f` オプションをつけるとずっとで続けます。コマンドでいう `tail -f` みたいなのと同じ感じです。

コンテナの標準出力、標準エラー出力がそのままこちらに出ます。

#### Docker Compose の場合

    docker-compose logs -f

この後にコンテナ名（ここでは冗長化されているのでサービスと呼ばれてますが）を指定しないと、
全部混ざって出て来ます。

    docker-compose logs -f [servicename]

wordpress の例でいうと、コンテナ名は mywordpress_wordpress_1 ですが、
wordpress を指定するとフィルタリングしてそれだけログが出ます。



## まとめ

Docker コマンドから Docker を見ると、
Docker で具体的にどういうことが出来るのかが見えてくると思います。

ここまで書いて「（あれ・・・全然終わらねえな・・・）」と思い始めている自分がいます。

まだ続きます。



## 参考URL {#ref}

- https://docs.docker.com/
- https://hub.docker.com/
- https://qiita.com/zembutsu/items/6e1ad18f0d548ce6c266
