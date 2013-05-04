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

extern QTextStream qout;

IndiFcgi::IndiFcgi(const QMap<QString, QString> &argm): mClient(argm["reconnects"].toInt()), mReadOnly(false)
{
    if (argm.contains("readonly"))
        mReadOnly = true;

    double seconds = argm["age"].toDouble();
    mMilliseconds = seconds * 1000;

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

            if (e.tagName() == "delta" && e.hasAttribute("timestamp"))
            {
                QString timestamp = e.attribute("timestamp");

                QMutexLocker lock(&mMutex);
                QLinkedListIterator< QPair<QDateTime, QString> > it(mProperties);
                response = getDelta(it, timestamp);
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

            QString str;
            str += "Content-type: txt/xml; charset=UTF-8\r\n";
            str += "Content-length: " + QString::number(response.size()) + "\r\n";
            str += "\r\n";
            str += response;
            str += "\r\n";
            str += "\r\n";
            printf("%s", str.toStdString().c_str());
        }
    }
}

QString IndiFcgi::getDelta(QLinkedListIterator< QPair<QDateTime, QString> > &it, QString &timestamp)
{
    QString response;
    QDateTime datetime = QDateTime::fromString(timestamp, Qt::ISODate);
    QDateTime max = datetime;

    while (it.hasNext())
    {
        const QPair<QDateTime, QString> &value = it.next();
        if (value.first > datetime)
        {
            if (value.first > max)
            {
                max = value.first;
                timestamp = value.first.toString(Qt::ISODate);
            }

            response += value.second;
        }
    }

    return response;
}

void IndiFcgi::propertyUpdated(QDomDocument doc)
{
    QDomElement e = doc.documentElement();
    if (e.hasAttribute("timestamp"))
    {
        QDateTime datetime = QDateTime::fromString(e.attribute("timestamp"), Qt::ISODate);
        {
            QMutexLocker lock(&mMutex);
            mProperties << qMakePair(datetime, doc.toString(2));
        }
        cullProperties(datetime);
    }
}

void IndiFcgi::cullProperties(const QDateTime &now)
{
    QMutexLocker lock(&mMutex);
    QLinkedList< QPair<QDateTime, QString> >::iterator it = mProperties.begin();

    for (; it != mProperties.end(); it++)
    {
        if (it->first.addMSecs(mMilliseconds) < now)
            it = mProperties.erase(it);
    }
}
