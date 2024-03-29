+++
author = "girigiribauer"
categories = ["tech"]
date = "2018-02-07T07:15:52+09:00"
draft = false
tags = ["Docker"]
title = "Docker 再入門2018 - エコシステム編"
aliases = ["/archives/20180207/"]
+++

今回はエコシステム編です。
コンテナ編から順に読むことをお勧めします。



## 目次 {#index}

1. **[コンテナ編](/archives/20180205/)**
	- 読むと Docker のコンテナ周りがざっくり分かる
1. **[コマンド編](/archives/20180206/)**
	- 読むと Docker コマンドを中心に Docker の全体像がなんとなく分かる
1. **[エコシステム編](/archives/20180207/) （いまここ）**
	- 読むと DockerHub のサービスの活用方法がざっくり分かる
	- Dockerfile を読んでみる
	- DockerHub の公式のものをうまく活用する
1. **[実践編](/archives/20180208/)**
	- 読むと Docker で環境構築する方法が分かる、怖くなくなる



## Dockerfile を読んでみる

ここまでで、Docker を利用するという点では必要最低限な知識を持っている状態になったかと思いますが、
ここからはさらに Docker イメージの設計図である Dockerfile を読み込んでみようと思います。

公式はこちら。 ( https://docs.docker.com/engine/reference/builder/ )

![Dockerfile](resource01.jpg)

### Dockerfile とは Docker イメージの設計図

公式のドキュメントの一番下にある https://docs.docker.com/engine/reference/builder/#dockerfile-examples
Nginx のイメージを作る Dockerfile あたりを参考にしてみましょうか。

```Dockerfile
# Nginx
#
# VERSION               0.0.1

FROM      ubuntu
LABEL Description="This image is used to start the foobar executable" Vendor="ACME Products" Version="1.0"
RUN apt-get update && apt-get install -y inotify-tools nginx apache2 openssh-server
```

まあ、最初なので3行くらいがちょうど良いかもしれません。

上部分がコメントなのは良いとして、
**FROM, LABEL, RUN** の部分が Dockerfile の文法に相当します。

大文字小文字は区別しませんが、分かりやすさのために、
Dockerfile の文法に相当する部分は通常大文字で記述します。

- FROM: どのイメージをベースにするか
- LABEL: キーと値のセットの情報を記載、後ほど `docker inspect` などでも参照できる、無くても良い
- RUN: シェルスクリプトを実行し、イメージに変更を加えていく

大事なのは FROM と RUN です。

### Docker イメージは継承して作れる

**FROM は必ず指定が必要です。**

つまり、 Docker イメージを作るためには、必ずベースとなるイメージが必要ですが、
ベースイメージを指定したくない場合でも、 FROM の行は必須です。

**最小限のイメージから始めたい場合は `FROM scratch` と指定します。**

- https://hub.docker.com/_/scratch/
- https://docs.docker.com/samples/library/scratch/

`FROM scratch` から始めた場合は本当に何も入っていないイメージができます。

どういう時に使えるかというと、例えばすぐ実行できるバイナリファイルがあって、
**バイナリファイルを単に実行するだけのコンテナ** が欲しい時なんかは、
余計なものが入っておらずに役立つのではないかと思います。

上の DockerHub の scratch のページにも例がありますが、
手元にある hello というバイナリファイルを一番上のルートにコピーして、
そのまま `/hello` を実行するだけのイメージなどが作れます。

該当ページにサンプル載ってますがこんな感じです。

```Dockerfile
FROM scratch
COPY hello /
CMD ["/hello"]
```

ちょっと話がそれましたが、 Nginx などが欲しい場合は、
centos や ubuntu などの公式が用意されているイメージをベースに、
**必要なアプリケーションのみをインストールするイメージを継承して作る** のが良いです。

ちなみに Linux にはディストリビューションという、流派のようなものが存在しています。

大きく分けて2種類（もちろん他にもありますが、有名どころは2つ）、
RedHat 系ならば CentOS あたり、 Debian 系ならば Ubuntu とかですかね。
使いたい方に合わせて選ぶと良いと思います。

さて、もう一度 Nginx のサンプルを見てみます。（抜粋）

```Dockerfile
FROM      ubuntu
RUN apt-get update && apt-get install -y inotify-tools nginx apache2 openssh-server
```

これは `ubuntu` の公式イメージをベースにして、
そこから `RUN` 以降に書いてある debian 系のパッケージマネージャのコマンドである `apt-get` を使って、
必要なライブラリを一式インストールする、という Dockerfile になりますね。

### Docker イメージは段階ごとにキャッシュされる

`docker image ls` または `docker images` を実行して分かるように、
名前のついていない（名前が &lt;none&gt; となっている）イメージが存在しています。

各行ごとにイメージが作られ、 **同一のものはキャッシュされて次以降の高速化のために利用されます。**
また、 **全く同じイメージは同じ ID になります。**
この辺は Git と同じで、全く同じファイルはハッシュ値が同一になるのと似ています。
（どうもタグ付けされたものは別の ID になるようですが・・・）

先ほどの Nging の Dockerfile のサンプルから、実際に Docker イメージを作ってみましょう。

以下を Dockerfile という名前で保存します。

```Dockerfile
# Nginx
#
# VERSION               0.0.1

FROM      ubuntu
LABEL Description="This image is used to start the foobar executable" Vendor="ACME Products" Version="1.0"
RUN apt-get update && apt-get install -y inotify-tools nginx apache2 openssh-server
```

同じディレクトリ上で `docker build . -t sampleimage1` というタグ名付きでイメージを作ります。

```txt
% docker build . -t sampleimage1
Sending build context to Docker daemon  2.048kB
Step 1/3 : FROM      ubuntu
 ---> 0458a4468cbc
Step 2/3 : LABEL Description="This image is used to start the foobar executable" Vendor="ACME Products" Version="1.0"
 ---> Using cache
 ---> 5e2812d1aee1
Step 3/3 : RUN apt-get update && apt-get install -y inotify-tools nginx apache2 openssh-server
 ---> Using cache
 ---> 58a660b758eb
Successfully built 58a660b758eb
```

ビルド成功と出ました。 イメージ ID は 58a660b758eb ですね。
それとは別に、 Step 1/3 の段階では 0458a4468cbc というイメージ ID のものが出来ています。
（これは ubuntu そのものですね）

途中、 "Using cache" と表示されていますが、
これは僕の方で何回か実行しているために、
同じものはキャッシュをそのまま使いますよーという表示がされています。

`docker image ls` でイメージ一覧を見てみます。

    REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
    sampleimage1            latest              58a660b758eb        3 hours ago         310MB
    ubuntu                  latest              0458a4468cbc        7 days ago          112MB
    <none>                  <none>              88fef13a9951        8 days ago          689MB
    <none>                  <none>              f9134a5e9681        8 days ago          766MB
    <none>                  <none>              5ce7d9cdcde9        8 days ago          1.08GB
    （以下略）

LABEL をつけただけではイメージ ID は出来ないようですが（たぶん）、
**この &lt;none&gt; という名前の中間のイメージが、 Step に応じてどんどん増えていく** 仕組みです。

余裕のある人は、 RUN の行を、

    RUN apt-get update && apt-get install -y inotify-tools nginx apache2 openssh-server
    RUN apt-get install -y zip

のように2行に分けてやってみると、中間イメージが出来る様子が見られると思います。

やってみます。（一旦 sampleimage2 という別名で）

```txt
% docker build . -t sampleimage2
Sending build context to Docker daemon  2.048kB
Step 1/5 : FROM      ubuntu
 ---> 0458a4468cbc
Step 2/5 : LABEL Description="This image is used to start the foobar executable" Vendor="ACME Products" Version="1.0"
 ---> Using cache
 ---> 5e2812d1aee1
Step 3/5 : RUN apt-get update
 ---> Using cache
 ---> 1a4d4c3febc6
Step 4/5 : RUN apt-get install -y inotify-tools nginx apache2 openssh-server
 ---> Using cache
 ---> 1e8148a63daf
Step 5/5 : RUN apt-get install -y zip
 ---> Running in f4f33e750d7c
Reading package lists...
Building dependency tree...
Reading state information...
（中略）
Unpacking zip (3.0-11) ...
Processing triggers for mime-support (3.59ubuntu1) ...
Setting up unzip (6.0-20ubuntu1) ...
Setting up zip (3.0-11) ...
Removing intermediate container f4f33e750d7c
 ---> a15d93167abf
Successfully built a15d93167abf
Successfully tagged sampleimage2:latest
```

Docker のイメージの変遷を見るには、 `docker image history` コマンドが便利です。

```txt
% docker image history sampleimage2
IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
a15d93167abf        5 minutes ago       /bin/sh -c apt-get install -y zip               2.16MB
1e8148a63daf        3 days ago          /bin/sh -c apt-get install -y inotify-tools …   158MB
1a4d4c3febc6        3 days ago          /bin/sh -c apt-get update                       39.6MB
5e2812d1aee1        3 days ago          /bin/sh -c #(nop)  LABEL Description=This im…   0B
0458a4468cbc        11 days ago         /bin/sh -c #(nop)  CMD ["/bin/bash"]            0B
<missing>           11 days ago         /bin/sh -c mkdir -p /run/systemd && echo 'do…   7B
<missing>           11 days ago         /bin/sh -c sed -i 's/^#\s*\(deb.*universe\)$…   2.76kB
<missing>           11 days ago         /bin/sh -c rm -rf /var/lib/apt/lists/*          0B
<missing>           11 days ago         /bin/sh -c set -xe   && echo '#!/bin/sh' > /…   745B
<missing>           11 days ago         /bin/sh -c #(nop) ADD file:a3344b835ea6fdc56…   112MB
```

0458a4468cbc となっているところが ubuntu そのものですね。
a15d93167abf となっているところが sampleimage2 となっているイメージです。

Docker イメージについて、これでなんとなく仕組みが見えて来たでしょうか。

### それ以外の文法

この辺見ましょう。 https://docs.docker.com/compose/compose-file/

よく使いそうなものはだいたいこの辺でしょうか？

- FROM: 前述
- RUN: 前述
- COPY: 手元のファイルをコピーしてイメージの方に反映させる
- CMD: コマンドの実行
- WORKDIR: RUN, COPY, CMD などの作業対象ディレクトリの指定（無ければ作る）

ちょっと長くなってきてしまったので紹介に留めておきます。
**公式ドキュメント見ましょう！**



## DockerHub の公式のものをうまく活用する

Dockerfile を自分で書く前に、大事なポイントがあります。

**車輪の再発明をせずに、今あるものを有効に活用しましょう** ということです。

きっとあなたが考える欲しいものは、
他の人の欲しいものであって、みんなが欲しいもののはずなので、
**すでに用意されている可能性が高いです。**
だいたいはかゆいところに手が届くようになっています。

**公式のドキュメント、ならびに Dockerfile をしっかり読み込んでみましょう。**
自ずと Dockerfile の書き方なんかも理解してくるかもしれません。

### MySQL イメージの例

前回、前触れもなく突然 mysql:5.7 の Docker イメージを利用しましたが、
もっとこれを掘り下げて見てみます。
( https://hub.docker.com/_/mysql/ )

![DockerHub MySQL](resource02.jpg)

もちろん互換性のある MariaDB も用意されているので、そちらでも構いません。
( https://hub.docker.com/_/mariadb/ )

環境変数を設定することで、コンテナ起動時にそれを読み取って予め設定できる、というのは前回触れたかと思いますが、
他にも **自分の欲しい環境に近づけるための設定方法が用意されています。**
（場合によってはドキュメントにもちゃんと書いてないケースがあるので、
後述する Dockerfile の読み込みもしてみると良いと思います）

### ケース1.データベースを予め作っておいて欲しい

これは前に触れた通りです。

勘違いしないで欲しいのは、 Docker にそういう機能があるわけではなく、
Dockerfile 実行時（イメージ作成時）に、この環境変数に何か設定されていたら、
この処理をする、データベース作ったりデータベース用ユーザー作ったりする、
というシェルスクリプトが用意、実行されているからです。

- MYSQL_HOST
- MYSQL_ROOT_PASSWORD
- MYSQL_DATABASE
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_ALLOW_EMPTY_PASSWORD
- MYSQL_RANDOM_ROOT_PASSWORD
- MYSQL_ONETIME_PASSWORD

この辺りが DockerHub 公式にある MySQL には用意されているようです。

`MYSQL_RANDOM_ROOT_PASSWORD` を yes にすると、ランダムでルートのパスワードを設定してくれるようです。
その挙動のために、 Dockerfile 及びシェルスクリプトには、予め apt-get で pwgen というパッケージをインストールして、
以下のシェルスクリプトを実行しています。

```sh
if [ ! -z "$MYSQL_RANDOM_ROOT_PASSWORD" ]; then
    export MYSQL_ROOT_PASSWORD="$(pwgen -1 32)"
    echo "GENERATED ROOT PASSWORD: $MYSQL_ROOT_PASSWORD"
fi
```

### ケース2.こっちが持ってる SQL ファイルを予め実行しておいて欲しい

あるあるですね。

データベースだけでなく、テーブル作ったりレコード突っ込んだり、
あるいは本番環境からダンプして持ってきたダンプデータ（SQL 文）を、そのまま突っ込んで復元したい。

こんなケースもみんな考えるので、当然想定されています。

![DockerHub MySQL - Initializing a fresh instance](resource03.jpg)

ポイントだけ抜粋します。

> it will execute files with extensions .sh, .sql and .sql.gz that are found in /docker-entrypoint-initdb.d.

要は **Docker コンテナの `/docker-entrypoint-initdb.d` というディレクトリに、
拡張子が `.sh`, `.sql`, `.sql.gz` のものを入れておくと、勝手に実行してくれる** とあります。

Docker コンテナ側に直接ファイルは置けませんので、穴を開けてやる必要があります。
手順は以下の通りです。

1. 作業用ディレクトリの中にデータベース初期化用ファイルを置けるディレクトリを作る、ここでは init
1. データベース初期化用ファイルを置く（あるだけ全部実行するので、複数の時はアルファベット順に）
1. `docker run` の時は `-v $(pwd)/init:/docker-entrypoint-initdb.d` オプションをつける、 `docker-compose.yml` の場合は volumes に `init:/docker-entrypoint-initdb.d` を加えて `docker-compose run -d` する

ちなみに、これの設定がなされている Dockerfile 中（正確には呼ばれたシェルスクリプト中）の記述は以下です。

```sh
for f in /docker-entrypoint-initdb.d/*; do
    case "$f" in
        *.sh)     echo "$0: running $f"; . "$f" ;;
        *.sql)    echo "$0: running $f"; "${mysql[@]}" < "$f"; echo ;;
        *.sql.gz) echo "$0: running $f"; gunzip -c "$f" | "${mysql[@]}"; echo ;;
        *)        echo "$0: ignoring $f" ;;
    esac
    echo
done
```

当然自分でそういうイメージを作る経験も大事ですが、
すでに用意されていることを知らずに、それが最短だと信じて無駄な苦労をするのは良くないです。
**適切にレールに乗っていきましょう。**

### ケース3.すでにコンテナ内であれこれやったデータベースをダンプしたい（取り出したい）

若干話逸れてきますが、これもあるあるなので。

![DockerHub MySQL - Creating database dumps](resource04.jpg)

`docker exec` を使った例があるので抜粋します。（長いので改行入れました）

```txt
% docker exec some-mysql sh -c \
'exec mysqldump --all-databases -uroot -p"$MYSQL_ROOT_PASSWORD"' > \
/some/path/on/your/host/all-databases.sql
```

これは何をやっているかというと、
以前紹介した Docker コンテナに対して追加で何かを実行させるコマンドである、
`docker exec` コマンドを使って、インラインでシェルスクリプトを渡しています。
（`sh -c 'script ...` の部分）

これもコンテナの中に入ってあれこれやる、という考え方ではなく、
追加で Docker コンテナに対して任意のコマンドを実行してやる、という考え方です。

#### 別解？

なお、上でも良いのですが、
Docker コンテナに追加で実行する `docker exec` を使って、
もっとシンプルに以下のように書けると思います。
（たぶんこれも問題ないですよね？）

    docker exec -it [containername] mysqldump --all-databases -u[user] -p[pass] > dump.sql

### 先人の知恵をもっと知ろう

一般的なケースであれば、大抵の場合には公式のイメージで事足りるはずです。

MySQL の例で言えば、 Dockerfile がリンク先で GitHub 上で公開されています。
( https://github.com/docker-library/mysql )

![GitHub docker-library/mysql](resource05.jpg)

バージョンごとの `Dockerfile` 、及びそこから呼び出している `docker-entrypoint.sh` をざっと見るだけでも、
どういうイメージの利用のされ方を想定されているか、少し見えてくるかと思います。



## まとめ

コンテナを利用してやりたいことは、 DockerHub にある公式を見ると大抵すでにあったりします。
自分で書こうとする前に、既存のものを利用できないか考えてみましょう。

本当はここまでで終わりたかったのに、まだ自分で環境を作るところまで行かない・・・。

次回でたぶん終わりまで行くと思います・・・。続きます。



## 参考URL {#ref}

- https://docs.docker.com/
- https://hub.docker.com/
