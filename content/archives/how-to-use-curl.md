+++
author = "girigiribauer"
categories = ["tech"]
date = "2016-09-14T23:12:06+09:00"
draft = true
layout = "post"
tags = []
title = "改めて curl の使い方まとめ"

+++
2016 年にもなって curl の使い方をまとめるのもどうかという声もあるかもしれませんが、
実際 2016 年になっても **よく使うコマンド** なので、
改めてよく使うオプションなどをまとめておきたいと思います。自分用です。

ちなみに wget に関しては、クローリング機能があるのを過去に知らなかったので、
そちらに関しては以下にまとめたことがあります。

[wgetが超絶便利なwebクローラー、クローリングツールだとは知らなかった・・・！](/archives/925/)



## curl の基本的な使い方

wget はダウンロードが中心の使い方なのに対して、
curl はケースごとにリクエストを投げる、といった使い方に向いてそうな気がします。
アクセスできたかどうかの確認だけならば、
わざわざブラウザを開かずとも黒い画面から `curl` コマンドだけで確認が可能です。

ちなみにここからは以下のバージョンでの話になります。Mac です。

curl 7.43.0 (x86_64-apple-darwin15.0) libcurl/7.43.0 SecureTransport zlib/1.2.5

man curl をみると、

	NAME
	       curl - transfer a URL
	
	SYNOPSIS
	       curl [options] [URL...]

もろもろオプションはあるものの、普通に使うだけならば以下のようにシンプルに使えます。

	curl http://example.com

-0 をつけないといけないみたいな紹介もあったりしますが、過去はそうだったんですかね？
出力は得られた HTML ファイルがそのまま標準出力に表示されます。
JSON ファイルの場合は、そのままパイプにつなげて jq コマンドあたりで整形やフィルタリングなどを
しても便利かもしれません。

ちなみに、プロトコルのバージョン指定のオプションは以下のようなものが用意されています。
なにもつけなければ以下にあるように --http1.1 をつけたのと同じになります。（バージョン 7.33 から？）
最近の HTTP/2 も追加されているようですね。

	-0, --http1.0
	       (HTTP) Tells curl to use HTTP version 1.0 instead of using  its  internally
	       preferred: HTTP 1.1.
	
	--http1.1
	       (HTTP)  Tells  curl  to  use HTTP version 1.1. This is the internal default
	       version. (Added in 7.33.0)
	
	--http2
	       (HTTP) Tells curl to issue its requests using HTTP 2.  This  requires  that
	       the underlying libcurl was built to support it. (Added in 7.33.0)

また、何もつけなければ GET リクエストになりますが、本当にアクセスしたいだけなら
`--head` オプションをつけることで HEAD リクエストにもなります。
本文は送られてこないので、出力はレスポンスヘッダそのままです。

	% curl --head example.com
	HTTP/1.1 200 OK
	Accept-Ranges: bytes
	Cache-Control: max-age=604800
	Content-Type: text/html
	Date: Wed, 14 Sep 2016 14:55:05 GMT
	Etag: "359670651"
	Expires: Wed, 21 Sep 2016 14:55:05 GMT
	Last-Modified: Fri, 09 Aug 2013 23:54:35 GMT
	Server: ECS (pae/3796)
	X-Cache: HIT
	x-ec-custom-error: 1
	Content-Length: 1270

このあたりを最低限知っておくだけでも、
HTTP で GET リクエストの確認をしたいだけの場合に
わざわざブラウザを開かずに済むと思います。

あと、 `-v` オプション（--verbose）をつけることでも
リクエストヘッダ＆レスポンスヘッダを確認することができます。

	% curl --head -v example.com
	* Rebuilt URL to: example.com/
	*   Trying 93.184.216.34...
	* Connected to example.com (93.184.216.34) port 80 (#0)
	> HEAD / HTTP/1.1
	> Host: example.com
	> User-Agent: curl/7.43.0
	> Accept: */*
	>
	< HTTP/1.1 200 OK
	HTTP/1.1 200 OK
	< Accept-Ranges: bytes
	Accept-Ranges: bytes
	< Cache-Control: max-age=604800
	Cache-Control: max-age=604800
	< Content-Type: text/html
	Content-Type: text/html
	< Date: Thu, 15 Sep 2016 09:10:38 GMT
	Date: Thu, 15 Sep 2016 09:10:38 GMT
	< Etag: "359670651"
	Etag: "359670651"
	< Expires: Thu, 22 Sep 2016 09:10:38 GMT
	Expires: Thu, 22 Sep 2016 09:10:38 GMT
	< Last-Modified: Fri, 09 Aug 2013 23:54:35 GMT
	Last-Modified: Fri, 09 Aug 2013 23:54:35 GMT
	< Server: ECS (pae/3796)
	Server: ECS (pae/3796)
	< X-Cache: HIT
	X-Cache: HIT
	< x-ec-custom-error: 1
	x-ec-custom-error: 1
	< Content-Length: 1270
	Content-Length: 1270
	
	<
	* Connection #0 to host example.com left intact

頭に &gt; がついている方がリクエスト、
頭に &lt; がついている方がレスポンスですね。

このあたり＋ `man curl` を覚えておけば、
最低限調べながら使えると思います。



## curl 用途別の使い方

よく使うやつをケースごとにまとめておきます。

### basic 認証内のページにアクセスする

`--basic` オプションと `--user` オプションをつければ OK なのですが、
実際のところ空気読んでくれて `--user` オプションだけでもいけちゃったりします。

	curl -u username:password example.com

man ページ内の関連部分を抜粋しておきます。

	--basic
	       (HTTP)  Tells  curl  to use HTTP Basic authentication with the remote host.
	       This is the default and this option is usually pointless, unless you use it
	       to  override  a  previously set option that sets a different authentication
	       method (such as --ntlm, --digest, or --negotiate).
	
	       Used together with -u, --user and -x, --proxy.
	
	(中略)
	
	-u, --user <user:password>
	       Specify the user name and password to use for server authentication.  Over-
	       rides -n, --netrc and --netrc-optional.

### フォームから POST する

結構簡単です。

	curl -F "id=foobar" example.com

POST の場合、`-x` オプション（`--request`）のあとに POST と指定することもできますが、
試してみたところ `-F` オプション（`--form`）をつけるだけで POST になるようですね。

### JSON を POST する

上記と少し異なり、 `-H` オプションでヘッダの Content-type を json に変えつつ、
実際にポストするデータを `-d` オプションで送ってやれば OK です。

	curl -H "Content-type: application/json" -d '{"id": "foobar"}' example.com

`-d` オプション（`--data`）で指定しているところは、実際の JSON データが入るので、
もちろん JSON valid である必要があります。JSON はダブルクオテーションですよ。

###


## 参考URL {#ref}

* <http://takuya71.hatenablog.com/entry/2012/11/10/143415>

