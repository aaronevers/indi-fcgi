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
#include <iostream>
#include <sys/time.h>

extern QTextStream qout;

IndiFcgi::IndiFcgi(const QMap<QString, QString> &argm): mClient(argm["reconnects"].toInt()), mReadOnly(false)
{
    if (argm.contains("readonly"))
        mReadOnly = true;

    mAge = (qint64) (argm["age"].toDouble() * 1e6);

    connect(&mClient, SIGNAL(propertyUpdate(QDomDocument)), SLOT(propertyUpdated(QDomDocument)));
    mClient.socketConnect(argm["host"]);
}

void IndiFcgi::run()
{
    while (FCGI_Accept() >= 0)
    {
        int size = atoi(getenv("CONTENT_LENGTH"));

        std::string content(size, ' ');
        fread(&content[0], 1, size, stdin);

        QDomDocument doc("");
        if (doc.setContent(QString(content.c_str()), false))
        {
            QString response;
            QDomElement e = doc.documentElement();

            if (e.tagName() == "getProperties")
            {
                QDomDocument doc("");
                QDomElement getProperties = doc.createElement("getProperties");
                getProperties.setAttribute("version", indi::VERSION);
                doc.appendChild(getProperties);
                mClient.sendProperty(doc);
            }
            else if (e.tagName() == "delta" && e.hasAttribute("timestamp"))
            {
                QString timestamp = e.attribute("timestamp");
                response = getDelta(timestamp);
                response = "<delta timestamp='" + timestamp + "'>" + response + "</delta>\n";
            }
            else if (!mReadOnly && e.tagName() == "set" && e.hasAttribute("property") && e.hasAttribute("type"))
            {
                QString type = e.attribute("type");
                QDomDocument set("");
                QDomElement property = set.createElement("new" + type + "Vector");

                QStringList indiprop = e.attribute("property").split(".");
                if (indiprop.size() >= 2)
                {
                    property.setAttribute("device", indiprop[0]);
                    property.setAttribute("name", indiprop[1]);

                    QDomNamedNodeMap attributes = e.attributes();
                    int n;
                    for (n = 0; n < attributes.size(); n++)
                    {
                        QDomNode attr = attributes.item(n);
                        if (attr.nodeName() != "property" && attr.nodeName() != "type")
                        {
                            QDomElement element = doc.createElement("one" + type);
                            element.setAttribute("name", attr.nodeName());
                            element.appendChild(doc.createTextNode(attr.nodeValue()));
                            property.appendChild(element);
                        }
                    }

                    set.appendChild(property);
                    qout << set.toString(2) << endl;
                    mClient.sendProperty(set);

                    response = "<good/>";
                }
            }

            QStringList str;
            str += "Content-type: txt/xml; charset=UTF-8\r\n";
            str += "Content-length: " + QString::number(response.size()) + "\r\n";
            str += "\r\n";
            str += response;
            str += "\r\n";
            str += "\r\n";
            printf("%s", str.join("").toStdString().c_str());
        }
    }
}

QString IndiFcgi::getDelta(QString &timestamp)
{
    QStringList response;
    qint64 datetime = timestamp.toLongLong();
    qint64 max = datetime;

    QMutexLocker lock(&mMutex);

    QLinkedListIterator< QPair<qint64, QString> > it(mProperties);

    while (it.hasNext())
    {
        const QPair<qint64, QString> &value = it.next();

        if (value.first >= datetime)
        {
            max = qMax(value.first, max);
            response += value.second;
        }
    }

    timestamp = QString::number(max);
    return response.join("");
}

void IndiFcgi::propertyUpdated(QDomDocument doc)
{
    QDomElement e = doc.documentElement();

    timeval tv;
    gettimeofday(&tv, NULL);

    qint64 now = (1e6 * tv.tv_sec) + tv.tv_usec;

    {
        QMutexLocker lock(&mMutex);
        mProperties << qMakePair(now, doc.toString(2));
    }

    cullProperties(now);
}

void IndiFcgi::cullProperties(const qint64 &now)
{
    QMutexLocker lock(&mMutex);
    QMutableLinkedListIterator< QPair<qint64, QString> > it(mProperties);

    while (it.hasNext())
    {
        const QPair<qint64, QString> &property = it.next();

        if (now > property.first + mAge)
            it.remove();
    }
}
