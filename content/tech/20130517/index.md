---
title: Chef の サードパーティ Cookbook を利用して、yum のリポジトリを追加してみる
author: girigiribauer
date: 2013-05-17T08:05:27+00:00
categories:
  - tech
tags:
  - Chef
  - Vagrant
  - virtualization
aliases:
  - '/archives/1095'
---
よーし、いろいろアプリケーションのインストールの自動化しちゃうぞー！ と思っていましたが、 先に試しておいた方が良さそうなものがあったので、そちらを先にやります。

## yum のリポジトリの追加

RPM系Linuxディストリビューション、つまり CentOS だったり、 Fedora などの Linux のディストリビューションでは、 **yum (Yellowdog Updater Modified)** と呼ばれるパッケージ管理システムが採用されています。

yum に限らずですが、ソースコードから毎回インストールするのはかなり骨の折れる作業だったりします。 （もちろんやったことない場合には、絶対経験しておくべき作業ではあると思うのですが。）

この yum は、パッケージのインストールがコマンド 1行で出来るので非常に便利ではあるものの、そのまま使うと場合によってはちょっと古めのパッケージ（PHP5.3, MySQL5.1 など）がインストールされてしまいます。

ゲストOS上で、sandbox モードになった状態で試しに PHP をインストールしてみます。

※これは、ゲストOSに実際にログインして手作業でコマンド打ってます。

    [vagrant@vmclient1 ~]$ sudo yum install php
    （略）
    Dependencies Resolved

    ================================================================================
     Package            Arch        Version                      Repository    Size
    ================================================================================
    Installing:
     php                x86_64      5.3.3-22.el6                 base         1.1 M
    Installing for dependencies:
     apr                x86_64      1.3.9-5.el6_2                base         123 k
     apr-util           x86_64      1.3.9-3.el6_0.1              base          87 k
     apr-util-ldap      x86_64      1.3.9-3.el6_0.1              base          15 k
     httpd              x86_64      2.2.15-28.el6.centos         updates      821 k
     httpd-tools        x86_64      2.2.15-28.el6.centos         updates       73 k
     mailcap            noarch      2.1.31-2.el6                 base          27 k
     php-cli            x86_64      5.3.3-22.el6                 base         2.2 M
     php-common         x86_64      5.3.3-22.el6                 base         524 k

    Transaction Summary
    ================================================================================
    Install       9 Package(s)

    Total download size: 4.9 M
    Installed size: 16 M
    Is this ok [y/N]: （y と入力）
    （略）
    Installed:
      php.x86_64 0:5.3.3-22.el6

    Dependency Installed:
      apr.x86_64 0:1.3.9-5.el6_2                       apr-util.x86_64 0:1.3.9-3.el6_0.1        apr-util-ldap.x86_64 0:1.3.9-3.el6_0.1        httpd.x86_64 0:2.2.15-28.el6.centos
      httpd-tools.x86_64 0:2.2.15-28.el6.centos        mailcap.noarch 0:2.1.31-2.el6            php-cli.x86_64 0:5.3.3-22.el6                 php-common.x86_64 0:5.3.3-22.el6

    Complete!


入りました。さてバージョンを表示してみます。

    [vagrant@vmclient1 ~]$ php -v
    PHP 5.3.3 (cli) (built: Feb 22 2013 02:51:11)
    Copyright (c) 1997-2010 The PHP Group
    Zend Engine v2.3.0, Copyright (c) 1998-2010 Zend Technologies


**5.3.3** が入ったようです。

ちなみに現時点での最新が5.4.15 で、5.5.0 の RC1（リリース候補版、もうすぐ出るよー的な意味）も出ていますし、 5.3 は若干古くなっているバージョンと言ってもいいかもしれません。 （というと、古くねえよ！全然マシだろ！という声がどこかから上がってくるかもしれませんが・・・）

また、PHP の拡張モジュールも何が入っているのやらさっぱりです。

yum のリポジトリを追加することで、最新のパッケージを選択することが可能となるので、 **RPMforge, EPEL, Remi** あたりのリポジトリを追加して、最新のパッケージをインストールできるよう、Chef で色々設定してみます。

## 手動でリポジトリ追加するのけっこうめんどい

学生のころ、yum のリポジトリの追加を手動で何回かやったことがあるのですが、 これがちょっとめんどくさかった記憶があります。

確かに今まで出て来た方法でやれば、yum のリポジトリの追加は自動化できるのですが、 そろそろ先人の知恵をお借りしてもいいのではないかなと思います。

![](resource01.jpg)

公式のコミュニティサイトでは、先人の知恵が詰まった Cookbook が多数公開されています。 <http://community.opscode.com/cookbooks>

この中に、yum というのももちろん公開されているので、どんなものかを一通り眺めつつ、サードパーティの Cookbook を使って yum のリポジトリの追加を行ってみようと思います。

### 先にリポジトリの一覧を調べておく

一応、入ったかどうか確認するために、あらかじめ現在の yum のリポジトリ一覧を確認しておきましょう。

    [vagrant@vmclient1 ~]$ yum repolist all
    （長いので略）
    base                                                                            CentOS-6 - Base                                                                         enabled: 6,381
    c6-media                                                                        CentOS-6 - Media                                                                        disabled
    centosplus                                                                      CentOS-6 - Plus                                                                         disabled
    contrib                                                                         CentOS-6 - Contrib                                                                      disabled
    debug                                                                           CentOS-6 - Debuginfo                                                                    disabled
    extras                                                                          CentOS-6 - Extras                                                                       enabled:    12
    updates                                                                         CentOS-6 - Updates                                                                      enabled:   676
    repolist: 7,069


あとで比較に使おうと思います。

## Vagrantfile に Cookbook を追加する

Vagrant で使用する Cookbook は、~/Vagrant/cookbooks ディレクトリに入れていくルールにしてましたので、

    $ cd ~/Vagrant/cookbooks


cookbooks ディレクトリへ移動して、

    $ git clone https://github.com/opscode-cookbooks/yum.git


公開されている yum の Cookbook を git clone で持ってきます。

すると、自分で作った vmclient1, vmclient2 の他に、yum というディレクトリが出来ているはずなので、ざっと中を覗いてみます。

    $ cd yum/recipes


自分で書いたように、通常は recipes/default.rb が呼ばれますので、こちらを見てみると・・・

**コメント文だけで中には特に何も書いてありませんでした。**

さてさて、Vagrant のドキュメントを見てみます。

![](resource02.jpg)

&#8216;apache&#8217; っていう Cookbook が使いたかったら、`chef.add_recipe 'apache'` って書くと追加できるよ！とあります。

また、EPEL であれば &#8216;yum::epel&#8217; 、remi であれば &#8216;yum::remi&#8217; と入れることで Cookbook の指定が出来るようです。

つまり、**default.rb** には何も書いてないけど、**epel.rb** や **remi.rb** にレシピが書いてあるので、 この名前を指定することで**ライブラリのように呼び出して使う**ことができるようですね。

なるほど。

ではさっそく Vagrant に追記して、実行してみます。

### Vagrantfile への追記

Vagrantfile の必要なところだけ抜粋します。

    vmclient.vm.provision :chef_solo do |chef|
      chef.cookbooks_path = "cookbooks"
      chef.data_bags_path = "data_bags"
      chef.add_recipe "yum::epel"
      chef.add_recipe "yum::remi"
      chef.add_recipe "vmclient1"
    end


※どうやら最初にレシピ書いた段階では、`chef.run_list` と書いてましたが、`chef.add_recipe` の方で統一すべきのようです。

### Cookbook への追記

    package 'php' do
      action  :install
    end


ここに options &#8216;hogehoge&#8217; と書くことで、コマンドラインにつけるオプションをそのまま書くことが出来るようですが、 Cookbook で yum のリポジトリを追加するだけでどう変化するのかを見るので、一旦何も指定せずにそのままインストールしてみます。

### vagrant sandbox rollback で元に戻す

そして、さっきゲストOSを色々いじってしまったので、 `vagrant sandbox rollback` で元に戻してから、仮想マシンを再起動します。

    $ vagrant sandbox rollback


綺麗さっぱり元通りです。

## yum のリポジトリ追加 → PHP のインストールのコンボ

    $ vagrant reload


さてどうなるでしょうか。

さすがにログ全部は長過ぎなんで、ポイントだけを順番に抜粋してみます。

    [2013-05-16T18:11:39+00:00] INFO: Setting the run_list to ["recipe[yum::epel]", "recipe[yum::remi]", "recipe[vmclient1]"] from JSON
    [2013-05-16T18:11:39+00:00] INFO: Run List is [recipe[yum::epel], recipe[yum::remi], recipe[vmclient1]]
    [2013-05-16T18:11:39+00:00] INFO: Run List expands to [yum::epel, yum::remi, vmclient1]


3つのレシピが順に実行されていくのが分かります。

    [2013-05-16T18:12:35+00:00] WARN: Cloning resource attributes for yum_key[RPM-GPG-KEY-EPEL-6] from prior resource (CHEF-3694)
    [2013-05-16T18:12:35+00:00] WARN: Previous yum_key[RPM-GPG-KEY-EPEL-6]: /tmp/vagrant-chef-1/chef-solo-1/cookbooks/yum/recipes/epel.rb:22:in `from_file'
    [2013-05-16T18:12:35+00:00] WARN: Current  yum_key[RPM-GPG-KEY-EPEL-6]: /tmp/vagrant-chef-1/chef-solo-1/cookbooks/yum/providers/repository.rb:85:in `repo_config'


途中でGPGキーに関する警告が色々出てるっぽいです。この辺今回はすっ飛ばしてやってますからねー。

    [2013-05-16T18:12:36+00:00] INFO: template[/etc/yum.repos.d/epel.repo] updated content
    [2013-05-16T18:12:36+00:00] INFO: template[/etc/yum.repos.d/epel.repo] mode changed to 644
    [2013-05-16T18:12:36+00:00] INFO: template[/etc/yum.repos.d/epel.repo] sending run action to execute[yum-makecache] (immediate)


Template Resource を使って、 \`/etc/yum.repos.d/epel.repo を色々書いてくれていますね。

    [2013-05-16T18:15:39+00:00] INFO: Processing yum_key[RPM-GPG-KEY-remi] action add (yum::remi line 22)


remi リポジトリも同様でした。

    [2013-05-16T18:24:58+00:00] INFO: Processing package[php][/php] action install (vmclient1::default line 19)
    [2013-05-16T18:24:58+00:00] INFO: package[php][/php] installing php-5.4.15-1.el6.remi from remi repository


さて、PHP のインストールがされているようですが、 どうやら **PHP 5.4.15** が入っているようですね！

こんな感じで一通りの自動化作業が終わったところで、実際に何がインストールされたか見てみましょう。

    [vagrant@vmclient1 ~]$ php -v
    PHP 5.4.15 (cli) (built: May  9 2013 08:20:20)
    Copyright (c) 1997-2013 The PHP Group
    Zend Engine v2.4.0, Copyright (c) 1998-2013 Zend Technologies


おおー、ちゃんと入っておりました。

ちなみに yum のリポジトリはどうでしょう？

    base                                                              CentOS-6 - Base                                                                                       enabled: 6,381
    c6-media                                                          CentOS-6 - Media                                                                                      disabled
    centosplus                                                        CentOS-6 - Plus                                                                                       disabled
    contrib                                                           CentOS-6 - Contrib                                                                                    disabled
    debug                                                             CentOS-6 - Debuginfo                                                                                  disabled
    epel                                                              Extra Packages for Enterprise Linux                                                                   enabled: 8,783
    extras                                                            CentOS-6 - Extras                                                                                     enabled:    12
    remi                                                              Les RPM de remi pour Enterprise Linux 6.4 - x86_64                                                    enabled: 1,015
    updates                                                           CentOS-6 - Updates                                                                                    enabled:   678
    repolist: 16,869


**epel と remi が増えておりますね！**

## まとめ

時間がないので今回はここまでですが、あとでサードパーティ Cookbook の中で何が行われていて、結果どういうファイルがどう変わったか？というのは、しっかりと見ておこうと思います。

中で何やってるのかよく分からないけど、順番通りにやったらなんかできましたーみたいなのをよく聞きますが、 そういう**ブラックボックス的な使い方は非常に危険だと思う**ので、 あくまで「普通にやったら 100 の労力かかるけど、それを 1 にしてくれるショートカットツール」みたいな、 **めんどくさいところの時間短縮を行ってくれるツール、という位置づけで常に使うことを心がけていきたいです。**

（あ、前者の使い方って、実装者が「よくわかんないけど jQuery プラグインをポンと入れたら動いちゃったんでオッケーですー」って言ってるのと大差ないかもしれないですね・・・。）

## 参考URL

  * <http://community.opscode.com/cookbooks>
  * <https://github.com/opscode-cookbooks/yum>
  * [CentOS6 で remi から php や mysql をインストールするための yum の設定][3]

 [3]: http://qiita.com/items/98a7cc5ac33225619e69
