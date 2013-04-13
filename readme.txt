indi.fcgi
_____________________________________________________________________

This program provides a generic fcgi for connecting an indiserver
to an AJAX web client.

Project home: [http://code.google.com/p/indi-fcgi/]

INDI is the Instrument Neutral Distributed Interface.  For more
information see the INDI white-paper at:
[http://www.clearskyinstitute.com/INDI/INDI.pdf]
_____________________________________________________________________

Prerequisites:

    Qt4:

        Building this program requires a Qt4 C++ development
        environment. Qt4 is available for many platforms including
        Windows, Mac, and Linux.

    FastCGI:

        Download: http://www.fastcgi.com/dist/fcgi.tar.gz
        Untar and build with the following:

        export CXXFLAGS="-include stdio.h"
        ./configure
        make
        sudo make install

    Webserver:

        The included deployment example uses lighttpd.  Lighttpd must
        be configured to handle fcgi scripts.  The script at
        conf/lighttpd.conf demonstrates the configuration for running
        indi.fcgi.  Install as follows:

        sudo cp conf/lighttpd.conf /etc/lighttpd/conf-enabled/10-fastcgi.conf

        Optionally create a link to the included www directory,
        where ${INDIFCGI} is the absolute path to the indi-fcgi
        directory, as:

        cd /var/www
        sudo ln -s ${INDIFCGI}/www indi
_____________________________________________________________________

Building:

    qmake
    make
_____________________________________________________________________

Deployment:

    Launch with bin/spawn.sh.  Spawn.sh may need to be modified
    to specify the indiserver location and port.  Use +host=host[:port]
    to specify the indiserver (-p 17624 specifies the fcgi port and
    must match the port number used in 10-fastcgi.conf).
    LD_LIBRARY_PATH must contain the path to the Qt4 shared object libraries.

    If the webserver and indi.fcgi are configured and launched as
    described, the test page should be visible at: localhost/indi
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
