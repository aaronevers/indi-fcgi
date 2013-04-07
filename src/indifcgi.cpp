/***********************************************************************
 * Copyright © 2013 Aaron Evers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 ***********************************************************************/

#include "indifcgi.h"

extern QTextStream qout;

IndiFcgi::IndiFcgi(const QMap<QString, QString> &argm)
{
    connect(&mClient, SIGNAL(propertyUpdate(QDomDocument)), SLOT(propertyUpdated(QDomDocument)));
    mClient.socketConnect(argm["host"]);
}

void IndiFcgi::run()
{
    int count = 0;
    while(FCGI_Accept() >= 0)
    {
        printf("Content-type: text/html\r\n"
           "\r\n"
           "<title>FastCGI Hello! (C, fcgi_stdio library)</title>"
           "<h1>FastCGI Hello! (C, fcgi_stdio library)</h1>"
           "Request number %d running on host <i>%s</i>\n",
           ++count, getenv("SERVER_NAME"));
    }
}

void IndiFcgi::propertyUpdated(QDomDocument doc)
{
    QDomElement e = doc.documentElement();
    if (e.hasAttribute("device") && e.hasAttribute("name") && e.hasAttribute("state"))
    {
        QString state = e.attribute("state");
        QString device = e.attribute("device");
        QString name = e.attribute("name");
        QString op = e.tagName().left(3);
        QString type = e.tagName().mid(3);
        QString devicename = device + "." + name;

        if (op == "set")
        {
            qout << devicename << ": " << endl;
        }
    }
}
