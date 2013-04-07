indi.fcgi
_____________________________________________________________________

This program provides a generic fcgi for connecting an indiserver
to an AJAX web client.

Project home: [http://code.google.com/p/indi.fcgi/]

INDI is the Instrument Neutral Distributed Interface.  For more
information see the INDI white-paper at:
[http://www.clearskyinstitute.com/INDI/INDI.pdf]
_____________________________________________________________________

Prerequisites:

Building this program requires a Qt4 development environment.
Qt4 is available for many platforms including Windows, Mac, and Linux.

FastCGI:

    export CXXFLAGS="-include stdio.h"
    ./configure
    make
    sudo make install
_____________________________________________________________________

Building:

_____________________________________________________________________

Installation:

sudo cp conf/lighttpd.conf /etc/lighttpd/conf-enabled/10-fastcgi.conf

_____________________________________________________________________

Copyright © 2013 Aaron Evers

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see [http://www.gnu.org/licenses/].
_____________________________________________________________________
