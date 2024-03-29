+++
author = "girigiribauer"
categories = ["tech"]
date = "2018-02-08T09:20:03+09:00"
draft = false
tags = ["Docker"]
title = "Docker 再入門2018 - 実践編"
aliases = ["/archives/20180208/"]
+++

今回は実践編です。
コンテナ編から順に読むことをお勧めします。



## 目次 {#index}

1. **[コンテナ編](/archives/20180205/)**
	- 読むと Docker のコンテナ周りがざっくり分かる
1. **[コマンド編](/archives/20180206/)**
	- 読むと Docker コマンドを中心に Docker の全体像がなんとなく分かる
1. **[エコシステム編](/archives/20180207/)**
	- 読むと DockerHub のサービスの活用方法がざっくり分かる
1. **[実践編](/archives/20180208/) （いまここ）**
	- 読むと Docker で環境構築する方法が分かる、怖くなくなる
	- 自分で LAMP 環境を作ってみる
	- 要件をまとめる
	- 不足した部分だけ Dockerfile を書く
	- さらなる Docker 環境のカスタマイズ
	- おまけ



## 自分で LAMP 環境を作ってみる

ようやくここまでたどり着きました。
そろそろ自分で LAMP 環境を作ってみましょう。

ちなみに **当然知ってるとは思いますが、**
LAMP 環境というのは **Linux, Apache, MySQL(MariaDB), PHP** の頭文字を利用した環境のことです。

もちろん今は LAMP じゃない環境が多く存在しているのは重々承知していますが、
ただ、基本でもあるこの LAMP 環境を（きちんと理解しつつ）自分で作ることが出来れば、
他の環境も自分で用意することが出来るようになるのではないでしょうか。

ということでやったことない人、頑張ってみましょう。

### 考えることは普通のサーバ立てるときとほぼ同じ

誤解を恐れず書きますが、
結局のところ **Docker は薄くて軽い、小さな Linuxとほぼ同じです。**

そう考えると、検討すべきポイントもだいたい予想がつくと思います。

やることは **普通に Linux に対して Apache 、 MySQL 、 PHP などをインストールする手順とほぼ同じです。**
良く分からないという方は、これを機に一通り触れてみると良いかと思います。
この辺はフロントエンドであれ、バックエンドであれ必須項目だと思います。
良い機会だと思ってやってみましょう。

今回の要件は・・・どうしましょうかね。
全く公式と同じ環境だと、そのイメージを入れれば良いよね？って話になってしまうので、
ちょっとだけ違う要件を混ぜてみましょうか。

* Ubuntu じゃなくて、サーバに多そうな CentOS をベースにする
* 日本語周りのサポートを厚めにする（言語設定、タイムゾーン、文字コードなど）
* データベース確認しやすくするために phpmyadmin も入れる
* データベースに SQL を突っ込みやすくしておく

今回は汎用的な LAMP 環境を作りたいのですが、
作ったあとの検証のために何か入れて動かしてみましょう。
とはいえ、特に思いつくものもないので、 WordPress でもインストールしてみましょうか。
（ただし、WordPress のイメージを使うのではなく、作った LAMP 環境にそのまま WordPress を入れてみます）

### 役割ごとに Docker コンテナを分ける

こうした方がシンプルに Docker コンテナを管理出来ます。

* Web アプリケーション: Apache, PHP
* データベース: MySQL

PHP にはモジュール版（Web サーバがモジュールとして PHP を動かす）と CGI 版とがありますが、
Web サーバと PHP を分けても良いのですし、別にしても良いです。
今回は一緒にしてモジュール版で動かすため、 Apache と PHP は同じコンテナにします。

それとは別に、MySQL をデータベースとして用意しておきます。
MySQL のイメージについては、前回まででだいぶ掘り下げて見ているので、利用の仕方は問題ないと思います。
データベース方面は特に特殊な使い方をするわけではないので、
公式で用意されているイメージを継承して、最低限の設定のみ加えます。

### 公式ドキュメントを良く読む

![docker docs - Best practices for writing Dockerfiles](resource01.jpg)

**docker docs - Best practices for writing Dockerfiles** というページが公式に用意されています。
( https://docs.docker.com/develop/develop-images/dockerfile_best-practices/ )

このブログの毎度の記事の最後には、まとめに『ドキュメントを良く読む』で締めている記事が多いのですが、
**大抵の問題はドキュメントを読めば解決します。**

例えば・・・

- Avoid installing unnecessary packages （不必要なパッケージのインストールを避ける）
- Minimize the number of layers (レイヤーの数を最小限に抑える、RUN などの命令1行分のこと)
- ADD or COPY (ADD と COPY どっち使ったらいいの？)
- Examples for Official Repositories (公式のリポジトリあるから参考にするといいよ)

とか、諸々書いてあります。 **本格的に書く前には一通り読みましょう。**



## 要件をまとめる

あくまで2018年1月末時点の情報です。
都度アップデートなどしましょう。

- CentOS 7 (latest)
- Apache 2.4
- MySQL 5.7
- PHP 7.2

なお、もし本番環境がすでにあって、それ向けの開発環境を作りたい場合は、
このように先に要件を全部洗い出してから、環境が可能な限り近くなるように作ると良いです。
**本番環境に開発環境を合わせていきましょう。**

### CentOS

これはあくまで僕の印象値ですが、
日本では RedHat 系（CentOS はこっち）、海外では Debian 系（Ubuntu はこっち）という感じがしてます。

Chef のレシピや DockerHub のイメージなどで公開されているものは、大抵 Debian 系になっており、
RedHat 系をベースにしたものはあまりないです。
（海外だからなのか、サーバ用途じゃないからなのか、定かではないですが・・・。
その辺の事情知ってる方居たらぜひ教えてください！）

今回はサーバに CentOS が採用されているであろうことを想定して CentOS の最新版にします。

### Apache

Apache は 1.3, 2.0, 2.2, 2.4 とバージョンが複数ありますが、
最近まで使われていたであろう 2.2 系については、
**2017年7月11日の最終版のリリースの後はセキュリティアップデートがなされていないようですので、もう使うのはやめましょう。**
( https://httpd.apache.org/#apache-httpd-2234-released-end-of-life-2017-07-11 )

Apache 使うなら 2.4 使いましょう。（または Apache 以外でもいいです）

#### Apache 設定ファイル

また、事前に知ってないといけないことをまとめておきます。（RedHad 系）

- メインの設定ファイルは通常 `/etc/httpd/conf/httpd.conf` にある
- サブの設定ファイルは `/etc/httpd/conf.d/` 以下に拡張子 conf で入れると昇順で読み込む

これ Docker 関係なく事前に知っておくべき話です。

### MySQL

MySQL は、特にこだわりもないので最新版でも入れておきましょうか。
2018年1月末時点で 5.7.20 が最新のようです。
DockerHub でも、 5.7 が提供されているようですので、そちらを入れます。

なお、互換性を持つ MariaDB を入れても構いません。
( https://hub.docker.com/_/mariadb/ )

ざっくり言うと、 MySQL 5.5 ≒ MariaDB 5.5 で、そこから MySQL が 5.6 になったのに対して、 MariaDB は 10.0 になってます。
**より OSS 寄りなものを扱いたいなら、 MariaDB を選択した方が良いかもしれません。**
こちらも話が逸れてしまうので、詳しくはおググりください。

### PHP

PHP は 5.5, 5.6 の次が 7.0 になって、現在 7.2 が最新です。
いくつか廃止になった機能はあるものの、大部分は互換性を保っていますので、
特に問題なければ一旦最新の 7.2 を入れておきます。

もし万が一もっと古い PHP のバージョンの環境が必要であれば、
おそらく Docker イメージが公開されていないと思います。（現時点で 5.6 までしか用意されていませんね）

その場合、公式の Dockerfile を参考にしつつ、自分で古い PHP の Docker イメージを作ると良いです。
ただし、その前にその古い環境をなんとか出来ないか努力する方が先でしょうけども。

### PHP のバッケージ

PHP 本体以外に、以下のものを入れたいと思います。

- php-cli: コマンドラインで PHP を実行
- php-common: 大抵依存関係で入る
- php-devel: phpize とか拡張モジュール追加したりするやつ
- php-gd: 画像関係
- php-mbstring: マルチバイト文字列
- php-mysqli: MySQL 、後述
- php-mysqlnd: MySQL 、後述
- php-pecl-apcu: キャッシュ機構のサポート
- php-xml: XML
- php-xmlrpc: XML-RPC のサポート

不要なパッケージは入れなくて良いと思います。
（XML-RPC とか要らんと思うけど、一応あとで WordPress とか入れるので・・・）

MySQL については、PHP の公式にドキュメントが用意されています。

- どの API を使うか: http://php.net/manual/ja/mysqlinfo.api.choosing.php
- どのライブラリを選ぶか: http://php.net/manual/ja/mysqlinfo.library.choosing.php

この辺をざっと見て、 mysqli (API) と mysqlnd (driver) を入れることにします。



## 不足した部分だけ Dockerfile を書く

さて、ようやく作るところまで来ました。
作業用ディレクトリを作りましょう。仮に名前を `my_lamp` とします。

また、 Docker の設定を行うディレクトリを `docker-compose.yml` と並列に作るので、
ファイル構成はだいたいこんな感じになりそうです。

- my_lamp/
	- docker-compose.yml
	- docker/
		- app/
			- Dockerfile
		- mysql/
			- Dockerfile
		- public/

あーあと Web 用の公開ディレクトリが要りますね。
`public` としておきます。

一番最初にも書きましたが、やったことない人は **読むだけじゃなく手を動かしましょうね。**

### docker-compose.yml

```yaml
version: "3"
services:
  app:
    build:
      context: "docker/app/"
    ports:
      - 8093:80
    volumes:
      - "./public/:/var/www/html"
    depends_on:
      - mysql
  mysql:
    build:
      context: "docker/mysql/"
    environment:
      - MYSQL_DATABASE=sampledb
      - MYSQL_HOST=localhost
      - MYSQL_USER=root
      - MYSQL_ROOT_PASSWORD=mypassword
    volumes:
      - "storage:/var/lib/mysql"
  phpmyadmin:
    image: phpmyadmin/phpmyadmin:latest
    ports:
      - 8094:80
    environment:
      - PMA_HOST=mysql
      - PMA_USER=root
      - PMA_PASSWORD=mypassword
    depends_on:
      - mysql
volumes:
  storage:
```

通常イメージを指定するところを、今回は Dockerfile を元にイメージをビルドするので、
`image` の代わりに `build` となっています。

抜粋します。

```yaml
app:
  build:
    context: "docker/app/"
mysql:
  build:
    context: "docker/mysql/"
```

公式にあるイメージを見に行く代わりに、手元の `docker/app/` 以下にある Dockerfile をベースにして、
Docker イメージを作ります。

phpmyadmin については特にカスタマイズする必要がないので、
そのまま phpmyadmin が提供しているイメージを引っ張って来て利用します。
( https://github.com/phpmyadmin/docker )

```yaml
phpmyadmin:
  image: phpmyadmin/phpmyadmin:latest
```

もう詳しく説明はしませんが、 https://hub.docker.com/r/phpmyadmin/phpmyadmin/ に書いてある、
環境変数を適切に設定することでカスタマイズすることが可能です。

なお、ポート番号はそれぞれ 8093, 8094 としていますが、
使っていたりすれば他のものに変えてください。

### docker/app/Dockerfile

```Dockerfile
FROM centos:7

# 各パッケージのアップデート
RUN yum -y update

# remi リポジトリの追加（remi を入れるには epel も必要）
RUN yum -y install epel-release
RUN rpm -Uvh http://rpms.famillecollet.com/enterprise/remi-release-7.rpm

# Apache(httpd), PHP のインストール
RUN yum -y --enablerepo=remi,remi-php72 install \
    httpd \
    php \
    php-cli \
    php-common \
    php-devel \
    php-gd \
    php-mbstring \
    php-mysqli \
    php-mysqlnd \
    php-pecl-apcu \
    php-xml \
    php-xmlrpc

# httpd.conf のログを stdout, stderr に繋ぐ
RUN ln -sf /dev/stdout /var/log/httpd/access_log && \
    ln -sf /dev/stderr /var/log/httpd/error_log

# mime タイプのファイル追加
RUN ln -sf /etc/mime.types /etc/httpd/conf/mime.types

# httpd をフォアグラウンドで動かす（コンテナ内で処理が終わらない）
CMD ["/usr/sbin/httpd","-D","FOREGROUND"]
```

一旦正しく動作するところまでやって、後から若干のカスタマイズをします。

PHP 7.2 を入れるには、 yum のパッケージマネージャに remi リポジトリを追加する必要があります。
remi リポジトリを追加するには、先に epel リポジトリを入れる必要があります。
ちなみにこの辺は全然 Docker の話ではなくて、普通に CentOS7 で PHP7.2 入れるなら、という話なので、
詳しくはおググりください。たくさん記事ありますよ。

#### ログの表示について

Docker の `/dev/stdout`, `/dev/stderr` が、
それぞれ Docker コンテナの外側から見たログになります。
なので、シンボリックリンクなどで `/dev/stdout`, `/dev/stderr` に紐づけてやれば、
そのまま外からログを確認することが出来ます。

追記: あと MIME 設定もないとエラー出てたんで追加しました。

#### CMD の使い方

実行したいコマンドを CMD の後に続けて書きますが、
複数書きたい場合は配列っぽい書き方で上のように列挙します。

一番最初のコンテナ編で書いたのですが、 Docker コンテナというのは本来処理を一通り終えたら終了するものです。
apache も例外ではなく、
**特に何も指定しなければバックグラウンドで動作し、メインプロセスはそのまま終了します。**

`service httpd start` みたいなコマンドを打ったことがあると思いますが、
打った後はそのまま入力可能な状態に戻るかと思います。それはつまりバックグラウンド処理になっているということです。

フォアグラウンドで処理をさせ、apache が動いている間は主導権を返さない、ということであれば、
**`-DFOREGROUND` オプションをつけましょう。**
( https://httpd.apache.org/docs/2.4/programs/httpd.html#options )

一旦ここまでで、とりあえず Apache + PHP は動くと思います。
`docker build docker/app/` などと入力して、ビルドできるかテストしてみましょう。

### docker/mysql/Dockerfile

```Dockerfile
FROM mysql:5.7
```

特に設定しないのなら、公式のをそのまま使えばいいんですけどね・・・。
あとで追記するのを見越して、一旦 FROM 行だけにしておきます。

これはビルドできるに決まってますが、ログだけ貼り付けておきます。

```txt
% docker build docker/mysql/
Sending build context to Docker daemon  2.048kB
Step 1/1 : FROM mysql:5.7
 ---> f008d8ff927d
Successfully built f008d8ff927d
```

### 最低限の動作確認

一旦ここまでで、用意した環境が一式ビルド出来るか確認してみましょう！
先に `public` ディレクトリを作っておきます。

さて、 `docker-compose build` を実行してみます。
それぞれの Docker イメージで `docker build .` を実行しているのと同じです。

```txt
% dcom build
Building mysql
Step 1/1 : FROM mysql:5.7
 ---> f008d8ff927d
Successfully built f008d8ff927d
Successfully tagged mylamp_mysql:latest
Building app
Step 1/7 : FROM centos:7
 ---> ff426288ea90
Step 2/7 : RUN yum -y update
 ---> Using cache
 ---> da7857a866c6
Step 3/7 : RUN yum -y install epel-release
 ---> Using cache
 ---> 7b3d7660b892
Step 4/7 : RUN rpm -Uvh http://rpms.famillecollet.com/enterprise/remi-release-7.rpm
 ---> Using cache
 ---> 940ef752a0a8
Step 5/7 : RUN yum -y --enablerepo=remi,remi-php72 install     httpd     php     php-cli     php-common     php-devel     php-gd     php-mbstring     php-mysqli     php-mysqlnd     php-pecl-apcu     php-xml     php-xmlrpc
 ---> Using cache
 ---> e11733031a7a
Step 6/7 : RUN ln -sf /dev/stdout /var/log/httpd/access_log &&     ln -sf /dev/stderr /var/log/httpd/error_log
 ---> Using cache
 ---> a3033aa0525f
Step 7/7 : CMD ["/usr/sbin/httpd","-D","FOREGROUND"]
 ---> Using cache
 ---> 06c309459634
Successfully built 06c309459634
Successfully tagged mylamp_app:latest

phpmyadmin uses an image, skipping
```

出来ましたね。

では、 `docker-compose up -d` して http://localhost:8093 にアクセスしてみましょう！

![my_lamp1](resource02.jpg)

**おおっ、表示できてます！**

さらに、 public の中に index.php を作り、 `<?php phpinfo();` を書いてみましょう。

![my_lamp2](resource03.jpg)

**良いですね、良いですね！**

さらに DB にアクセス出来るかどうか、先ほど PHP 公式ページにあったテストコードで試してみましょう。

```php
<?php
// mysqli
$mysqli = new mysqli("mysql", "root", "mypassword", "sampledb");
$result = $mysqli->query("SELECT 'Hello, dear MySQL user!' AS _message FROM DUAL");
$row = $result->fetch_assoc();
echo htmlentities($row['_message']);
```

さっきの `phpinfo()` の代わりに、こちらの mysqli を介して MySQL に接続するコードを貼り付けます。
`Hello, dear MySQL user!` というメッセージが出たでしょうか？

ちなみに、 Docker コンテナの中にある `/etc/resolv.conf` と、
外に自動的に作られた `mylamp_default` というネットワークが名前解決をしてくれているので、
**mysql という名前をつけたコンテナに対して、 mysql という名前でネットワークが通ります。**
なので、 app コンテナから mysql コンテナに対しては、 **localhost ではなく mysql という名前で呼びましょう。**

そもそも app コンテナの中に MySQL はないのですから、 localhost という指定は間違いだと分かりますね。

それにしても、ネットワークの名前解決がめっちゃ便利ですね。
**Docker コマンド単体で行なっていたら、この辺のネットワークも事前に作っておかないといけないのですが、この辺もうまく Docker Compose が行なってくれています。楽すぎる・・・！**

ちなみに、昔は `/etc/hosts` に自動で書かれていたように思いますが・・・
（もしかするとコンテナ同士を繋げる `--link` オプションがそうなるのかもしれません、ちょっと確かじゃないです）
いずれにしても便利になったものです。



## さらなる Docker 環境のカスタマイズ

さて、もう少しだけ頑張ってみましょう。

公式のイメージは、日本語環境の場合とかはあんまり考えてくれてません。
まあ全世界共通のイメージですからある意味当然です。

* ~~Ubuntu じゃなくて、サーバに多そうな CentOS をベースにする~~
* 日本語周りのサポートを厚めにする（言語設定、タイムゾーン、文字コードなど）
* ~~データベース確認しやすくするために phpmyadmin も入れる~~
* データベースに SQL を突っ込みやすくしておく

半分くらいは片付いているので、残り半分見直していきます。
まずは DB 側からカスタマイズしましょうか。

### docker/mysql/Dockerfile の改修

やりたいことは以下の通りです。

* MySQL の設定ファイルである my.cnf に日本語周りの設定を追記したい
* コンテナ内の /docker-entrypoint-initdb.d に穴を開けて、sql を自動で実行できるようにしておきたい

前者は、`/etc/my.cnf` を直接書き換えるか、 `/etc/mysql/conf.d/*.cnf` にファイルを置けるようにするか、
どちらかの方法で実現できます。

ちなみに `/etc/mysql/conf.d/docker.cnf` と `/etc/mysql/conf.d/mysql.cnf` はすでに存在してますので、
この辺は触らない方が良さそうですね・・・。
逆に、 `/etc/my.cnf` は Docker コンテナの中には存在していないようです。
このため、 `/etc/my.cnf` を直接書き換える（というか無いので新規作成）方法を取ります。

`docker/mysql/my.cnf` を作りつつ、
ファイルの中身を日本語周りの設定にしておきます。

```txt
[mysqld]
character-set-server=utf8mb4

[client]
default-character-set=utf8mb4
```

さらに、Dockerfile に COPY 行を追記します。

```Dockerfile
FROM mysql:5.7

COPY my.cnf /etc/my.cnf
```

`docker/mysql/initdb/` というディレクトリを新たに作り、
`docker-compose.yml` の方に `/docker-entrypoint-initdb.d` との穴を繋ぐための設定を書きます。

MySQL のところだけ抜粋するとこんな感じですね。

```yaml
mysql:
  build:
    context: "docker/mysql/"
  environment:
    - MYSQL_DATABASE=sampledb
    - MYSQL_HOST=localhost
    - MYSQL_USER=root
    - MYSQL_ROOT_PASSWORD=mypassword
  volumes:
    - "storage:/var/lib/mysql"
    - "./docker/mysql/initdb/:/docker-entrypoint-initdb.d"
```

MySQL の方はここまでで OK ですね。

ちなみに、一方は Dockerfile のイメージの方に、
もう一方は docker-compose.yml の方に、つまり Docker コンテナ起動時に設定する方に書いてますが、
実際必要に応じて使い分ければ良いと思います。

今回は日本語設定のカスタマイズがされたイメージを作り、
そこからさらに SQL ファイルがあったときだけ必要に応じて穴をあけてファイルを突っ込める、
という感じで作っています。

### docker/app/Dockerfile の改修

やりたいことは以下の通りです。

* 大元の Linux のタイムゾーンを設定する
* php.ini を設置して日本語周りの設定を追記したい
* httpd.conf を設置して、サーバの設定変更したい

#### タイムゾーン

タイムゾーンまだでした。

Docker 関係ないですが、タイムゾーンの設定は
`/usr/share/zoneinfo/Asia/Tokyo` に置いてあるサンプルファイルを、
`/etc/localtime` に置いたらおっけーです。

Dockerfile 上で RUN のあとにシンボリックリンク貼ったらいいです。

```Dockerfile
RUN ln -sf  /usr/share/zoneinfo/Asia/Tokyo /etc/localtime
```

#### php.ini の日本語周り

php.ini は Dockerfile 上で、
httpd.conf は docker-compose.yml 上で行うことにします。

`docker/app/php.ini` を書いておきます。

```php.ini
default_charset = "UTF-8"

mbstring.language = Japanese

# エンコーディング、自動変換しない
mbstring.encoding_translation = Off

# 文字コード自動検出の優先順位
mbstring.detect_order = "UTF-8,SJIS,EUC-JP,JIS,ASCII"

date.timezone = "Asia/Tokyo"

# X-Powered-By ヘッダーでバージョン晒す
expose_php = On

# 使用メモリ
memory_limit = 128M

# POST リクエスト最大サイズ
post_max_size = 128M

# アップロードファイル最大サイズ
upload_max_filesize = 128M
```

`docker/app/Dockerfile` に対して、最後の CMD の前あたりに以下を追記します。

```Dockerfile
# PHP 設定ファイル
COPY php.ini /etc/php.ini
```

#### httpd.conf を自由にいじれるように

さらに、 Docker のコンテナ内から httpd.conf を持ってきて、
`docker/app/httpd.conf` に配置して適当にカスタマイズします。

今回は別にそのままでも良いのでカスタマイズは載せませんが、
コンテナの中身を持ってくるときは以下のコマンドが便利です。

    docker exec -it mylamp_app_1 cat /etc/httpd/conf/httpd.conf > httpd.conf

コンテナに対して端末を共有しつつ、 `cat` 以下のコマンドを実行させて、
表示された内容を自分のところにファイルとして保存する、といった流れです。

最後に、 `docker-compose.yml` に穴を開ける箇所を追記します。
app 部分だけ抜粋します。

```Dockerfile
app:
  build:
    context: "docker/app/"
  ports:
    - 8093:80
  volumes:
    - "./public/:/var/www/html"
    - "./docker/app/httpd.conf:/etc/httpd/conf/httpd.conf"
  depends_on:
    - mysql
```

これで app 周りのカスタマイズはすべて完了です。

### カスタマイズ完了！

長くなりましたが、これで一通り終えましたので以下を順に実行します。

1. docker-compose build
1. docker-compose up -d
1. http://localhost:8093 を確認
1. WordPress の公式から最新をダウンロードして `public` 以下に解凍して置く
1. `wp-config-sample.php` をコピーして wp-config.php を作る
1. 以下のように編集する
1. http://localhost:8093/wordpress/ を確認

```php
/** WordPress のためのデータベース名 */
define('DB_NAME', 'sampledb');

/** MySQL データベースのユーザー名 */
define('DB_USER', 'root');

/** MySQL データベースのパスワード */
define('DB_PASSWORD', 'mypassword');

/** MySQL のホスト名 */
define('DB_HOST', 'mysql');

/** データベースのテーブルを作成する際のデータベースの文字セット */
define('DB_CHARSET', 'utf8');
```

結構記事ボリュームが増えてきているので、WordPress の設置は箇条書きで端折ります・・・。

さて、アクセスしてみましょう。

![my_lamp - WordPress](resource04.jpg)

**できてたー！**

Docker を使いはしたものの、そんなに難しいことはしてません。
**ぜひとも自分でやってみてください！**


### 最終形

ここに置いてあります。
https://github.com/girigiribauer/sample-dockerized-lamp

以下の順に実行していけば LAMP 環境が動作します。

1. git clone https://github.com/girigiribauer/sample-dockerized-lamp
1. cd sample-dockerized-lamp/
1. docker-compose build
1. docker-compose up -d
1. http://localhost:8093

これである程度特殊な要件の環境も、Docker ベースで作れるようになったと思います。

そろそろローカル環境に立ててあった MAMP, XAMPP, Vagrant などの環境を、
順次 Docker に置き換えて行っても良いのではないでしょうか？



## おまけ

Docker 豆知識 です。

### Docker コマンドは良く使うのでショートカットを用意しておく

僕の場合ですが、もうすでに `d` は `docker` コマンドのショートカットにしてあります。
**D は Docker の D!**

また、コレクション系も `docker image` を `di` にしたり、
`docker-compose` を `dcom` とかにしたりすると捗ります。

- docker = d
- docker container = dc (dc は元々逆ポーランド計算機のコマンドが入ってたりするので注意)
- docker image = di
- docker network = dn
- docker volume = dv
- docker-compose = dcom

こうしておくと、イメージ一覧見たいときに `di ls` だけで済みますし、
Docker Compose 使って起動したいときは `dcom up -d` だけで済みます。
単に長いの置き換えてるだけなので、 他のオプションも `dcom build` とか `dcom down` とか使えて便利ですね。



## まとめ

Docker 周りはまだ色々ありますが、再入門という範囲では必要十分な内容がまとめられたかと思います。

結局のところ、今まで説明したことの **大部分は公式のドキュメントに書いてあります。**
自分含めてですが、 **公式のドキュメントをもっとちゃんと読みましょう。**

いやー、4部作になってしまった・・・やっと終わった・・・。

もし読んでみて理解しやすかったならば、
周りの Docker よく分からんとか言って食わず嫌いしている社員の方とかにオススメしてみてください。
分かってない人が減れば、各々関わっているプロジェクトで Docker の開発環境をより提供しやすくなると思います。



## 参考URL {#ref}

- https://docs.docker.com/
- https://hub.docker.com/
- https://qiita.com/tsukapah/items/677b1f5c89dcbe520344
- http://affiwork.net/php-settings/
