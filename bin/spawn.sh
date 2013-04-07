#!/bin/sh

export LD_LIBRARY_PATH="/usr/local/lib;/usr/lib/x86_64-linux-gnu"

killall indi.fcgi 2>/dev/null
spawn-fcgi -p 17624 indi.fcgi ++log=/tmp/indi.fcgi.log
