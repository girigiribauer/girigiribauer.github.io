#!/bin/sh

open http://localhost:2424 && hugo server --buildDrafts --buildFuture --port 2424
