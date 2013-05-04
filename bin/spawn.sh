#!/bin/sh

export LD_LIBRARY_PATH="/usr/lib/x86_64-linux-gnu"

bin=$(dirname $0)

killall indi.fcgi 2>/dev/null
spawn-fcgi -p 17624 $bin/indi.fcgi +log=/tmp/indi.fcgi.log
