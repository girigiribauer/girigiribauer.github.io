#!/bin/sh

hugo server --buildDrafts --buildFuture --port 2424 &
open http://localhost:2424
