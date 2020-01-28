+++
author = "girigiribauer"
categories = ["tech"]
date = "2016-09-06T09:14:39+09:00"
draft = false
tags = ["Ansible", "automation"]
title = "Ansible で再起動後にも playbook を継続する方法"
aliases = ["/archives/20160906/"]
+++

タイトルの通りですが、正直これ出来ないと思っていたので、出来てすごく嬉しいです。

Chef では少なくともそういった機能は無かったように思えますが（僕が知らないだけかもしれない）、
**Ansible はプッシュベース** だからでしょうか。
実行する主体がいつもローカル側にあるからこそ、
一旦接続を切ってまた繋げるといったことがやりやすいのかもしれません。



## そもそもなぜ再接続したいのか？

ほとんどの playbook では問題ないのですが、
SELinux の設定の反映（一時的な設定だけなら問題なし）などの一部のセットアップにて、
**再起動が必要になるものが存在しています。**

他にもあるかもしれませんが、
例えば SELinux の設定をいじる場合は以下のような手順を踏みます。

	$ getenforce #=> 今の設定確認
	Enforcing
	$ sudo vi /etc/sysconfig/selinux #=> SELINUX=disabled を設定
	$ sudo reboot #=> 再起動

Ansible では playbook 上で reboot すると、
**playbook のステータスが unreachable になってそのまま終了** してしまいます。

	fatal: [machine_name]: UNREACHABLE! => {"changed": false, "msg": "Failed to connect to the host via ssh.", "unreachable": true}

繋がらなくなるのでまあ当然ですよね。

これを一連の playbook で再起動をはさんで実行できると、
playbook を書くときにトリッキーなことをせずに済むこともあるかもしれません。
（SELinux だけみると、最後にまとめて再起動すれば事足りるっちゃあそうですが・・・。）

ちょっと話が逸れますが、 reboot するのが通常の task ではなく handler だった場合、
（handler は変化があった場合のみ、最後にまとめて実行するタスクのこと）
単に再起動だけ実行させて、あとはほったらかしで問題ないケースも出てきます。
その場合は playbook の実行完了を待たない poll の値を設定することで、handler で再起動をさせて終了させることは可能です。

<http://docs.ansible.com/ansible/playbooks_async.html>



## 再接続を可能にする Ansible のモジュール

Ansible で再接続を行うために必要な関連モジュールをメモっておきます。
最初のやつは正確にはモジュールではないかもしれません。キーワード？

### local_action

<http://docs.ansible.com/ansible/playbooks_delegation.html>

この local_action は他のモジュールと同じように使うことが出来るのですが、
モジュールのさらに頭につけることで
**ローカルに処理を委譲することができます。**

ちなみに `delegate_to` というキーワードも存在していて、以下は同じ意味を指すようです。
（先ほどのリンク内から抜粋）

	- name: add back to load balancer pool
	command: /usr/bin/add_back_to_pool {{ inventory_hostname }}
	delegate_to: 127.0.0.1

	- name: take out of load balancer pool
	local_action: command /usr/bin/take_out_of_pool {{ inventory_hostname }}

### wait_for モジュール

<http://docs.ansible.com/ansible/wait_for_module.html>

wait_for モジュールは、 **指定したホスト名・ポートを監視し、有効になるまで待機します。**

先に非同期で再起動するような playbook を用意しておき、
その後 local_action をはさんだ wait_for モジュールを利用して、
再起動で処理が戻るまで待機するような playbook を書くことが可能です。

### set_fact モジュール

<http://docs.ansible.com/ansible/set_fact_module.html>

set_fact モジュールは、ansible-playbook の **実行時の変数を途中で上書きできるモジュール** です。

今回は結局使わなかったのですが、
例えばポート番号を変えたり、パスワード認証から公開鍵認証に変えたりした場合に、
接続するための情報を途中で変更する際に用いました。

あくまで僕のケースですが、個人的には接続方法が大きく変わった時には無理をせず、
強制的に fail などのメッセージを出して（鍵認証に変えたから接続し直してね的なやつ）、
変更後の接続方法で改めて playbook を実行するようにしています。
（この辺の話はまた長くなるので、余裕があれば改めて取りまとめたいですね・・・）



## SELinux の playbook

他 playbook も参考にしながら、冪等性も踏まえて書いてみたのがこれです。
（抜粋＆本筋じゃないところは省略）

	- name: SELinux のステータス取得
	  shell: getenforce
	  register: selinux_status
	  changed_when: False
	  tags: selinux
	  become: True

	- name: SELinux をコントロールするためのパッケージ導入
	  yum: name=libselinux-python state=installed
	  when: selinux_status.stdout == 'Enforcing'
	  tags: selinux
	  become: True

	- name: SELinux の無効化
	  selinux: state=disabled
	  when: selinux_status.stdout == 'Enforcing'
	  tags: selinux
	  become: True

	- name: SELinux 設定後の再起動
	  shell: "sleep 2 && reboot"
	  async: 1
	  poll: 0
	  when: selinux_status.stdout == 'Enforcing'
	  tags: selinux
	  become: True

	- name: SELinux 設定後の再起動完了まで待機
	  local_action: wait_for host={{ inventory_hostname }} port={{ ssh_port }} delay=30
	  when: selinux_status.stdout == 'Enforcing'
	  tags: selinux
	  become: False

inventory_hostname は <http://docs.ansible.com/ansible/playbooks_variables.html> にあるように
Ansible のインベントリファイルがあるローカルを指しています。予め用意されている変数です。

register については
<http://docs.ansible.com/ansible/playbooks_conditionals.html#register-variables> にありますが、
実行結果などを後で参照するために一時保存してくれる機能です。

SELinux の設定を取得して、有効になっていた場合のみ無効となるような playbook を実行しています（冪等性）。
逆に **2回目以降の playbook の実行ですでに無効になっていた場合は、
when と書いてあるところが False になるので playbook の実行がスキップされます。**
毎回再起動をはさんでいては時間がかかってしまいますので、
時間短縮のため register や when などを用いて変更する必要があるときだけ処理をするようにしています。

ちなみに、再起動自体の playbook ですが、
sleep 2 や async: 1 がないと一番最初の例と同じく unreachable でストップしてしまいます。
shell モジュール内で sleep 2 などを頭につけて実行直後に再起動が実行されないようにしつつ、
async でこの playbook の終了タイミング自体も直後ではなく後ろにずらす必要がありました。

様々な環境で試したところ、両方ずらす必要があるようです。
最初は単にタイミングをずらすだけで良いかと思って sleep 1 になってたんですが、
Vagrant 上は問題がなくとも VPS 上では sleep 2 にしないと unreachable になってしまったりと、
再起動周りは多少経験則が必要なようです・・・。

ここに関しては内部の処理を見たわけではないのですが、
タイミングをずらすことで、再起動の処理の前に
次の local_action &amp; wait_for モジュールに処理を渡してから再起動を行う必要があるようです。



## まとめ

Ansible のプッシュベースであるメリットが出てて便利だなーと思います。

再起動の playbook については、今まで問題があったわけではないのですが、
selinux の部分だけで設定完了することになるので、
playbook の依存関係が少しすっきりした気がします。
ただ、再起動タスクが多ければ多いほど、
最後にまとめて handler として実行した方が playbook 全体の処理時間は短くなると思います。

あと playbook の書き順によっては接続ポートの変更とかぶった場合、
**再起動後に SSH のポートが変わっちゃって接続できなくなっちゃった、** みたいなケースもありうるので
そこは注意が必要かと思います。（今回使っていないset_fact モジュールである程度いけるかと思います）

ちなみに再起動に関してはこの記事の通りなのですが、
再ログインに関してはまだまとめきれてないので、
改めて記事にメモっておこうと思います。



## 参考URL {#ref}

* <http://qiita.com/volanja/items/d38fe0678848bae6902f>
* <https://gyagya1111.blogspot.jp/2015/02/ansibleselinux.html>
* <http://jinja.pocoo.org/docs/dev/templates/>
* <http://stackoverflow.com/questions/23877781/how-to-wait-for-server-restart-using-ansible>
