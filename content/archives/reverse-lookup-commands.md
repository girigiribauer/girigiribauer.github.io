+++
date = "2017-01-16T14:40:32+09:00"
title = "よく使うコマンドライン逆引きメモ"
author = "girigiribauer"
layout = "archives"
categories = [
  "tech",
]
tags = [
  "CLI",
  "Linux",
]
draft = true

+++
自分用に、こういうことやりたいけどやり方分からない的なコマンドを
都度メモしておき、ある程度溜まってきたら記事オープン状態にしておこうと思います。

* [先頭行（特定行）のみ削除](#lines-delete)
* [特定行の切り出し](#lines-headtail)
* [ファイル名で探しつつ、ファイル名を表示する](#find-by-filename)
* [ファイルの中身で探しつつ、ファイル名を表示する](#find-by-string)
* [出力を見つつファイルにも保存したい](#pipe-output)



## 先頭行（特定行）のみ削除 {#lines-delete}

以下、 numbers.txt を行ごとに連続した数値が入ったファイルとします。

### コマンド

    cat numbers.txt | sed -e '1d'

### 結果

    2
    3
    4
    （後略）

### 補足

複数行の削除は `sed -e '3,6d'` などとする。

削除行ベースで考えるときは sed が便利。
逆に必要行ベースで考えるときは head, tail が便利。



## 特定行の切り出し {#lines-headtail}

### コマンド

    cat numbers.txt | head -n 30 | tail -n 10

### 結果

    21
    22
    23
    （中略）
    28
    29
    30

### 補足

この例は上から30行切り出して、さらに下から10行分切り出すので、合計10行分となる。

一方で `tail -n +10` とした場合、10行目から以下全部切り出すので、

    10
    11
    12
    （中略）
    28
    29
    30

の合計21行分となる。



## ファイル名で探しつつ、ファイル名を表示する {#find-by-filename}

### コマンド

    find . -name '\*.md'

### 結果

    ./path/to/file1.md
    ./path/to/file2.md
    ./path/to/file3.md

### 補足

オプションでフィルタリング可能。ファイルタイプや日付などが利用可能。



## ファイルの中身で探しつつ、ファイル名を表示する {#find-by-string}

### コマンド

    grep -rl 'Auth' .
    
    find . -name '\*.md' | xargs grep -l 'Auth'

### 結果

    ./path/to/file1.md
    ./path/to/file2.md
    ./path/to/file3.md

### 補足

前者は Auth という文字列を含むファイルを再帰的に探し、ファイルとして出力する。

後者は予め拡張子 md のファイルをリスト化しておき、そのファイルごとに Auth という文字列を含むかどうかチェックし、
含む場合はファイルとして出力する。



## 出力を見つつファイルにも保存したい {#pipe-output}

### コマンド

    /path/to/exec.sh | tee log

### 結果

    （略、出力もされて log ファイルにも保存されます）

### 補足

標準出力だけでなく、標準エラー出力も含めたい場合は、 `/path/to/exec.sh 2>&1 | tee log` とする



## やりたいこと名 {#hashtag}
### コマンド
### 結果
### 補足
