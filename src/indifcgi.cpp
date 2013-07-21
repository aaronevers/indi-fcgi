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
#include <sys/time.h>

extern QTextStream qout;

IndiFcgi::IndiFcgi(const QMap<QString, QString> &argm): mMutex(QMutex::Recursive), mClient(argm["reconnects"].toInt()), mReadOnly(false)
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
                QStringList delta;
                qint64 timestamp = e.attribute("timestamp").toLongLong();

                if (e.hasChildNodes())
                {
                    qint64 ts = timestamp;
                    QDomElement c;
                    for (c = e.firstChildElement(); !c.isNull(); c = c.nextSiblingElement())
                    {
                        if (c.nodeName() == "device")
                            delta += getDelta(timestamp, ts, c.text().trimmed());
                    }
                }
                else
                {
                    delta += getDelta(timestamp, timestamp);
                }

                response = "<delta timestamp='" + QString::number(timestamp) + "'>" + delta.join("") + "</delta>\n";
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

QString IndiFcgi::getDelta(qint64 &max, const qint64 &datetime)
{
    QStringList response;
    QMutexLocker lock(&mMutex);
    QListIterator<QString> it(mProperties.keys());
    while (it.hasNext())
        response += getDelta(max, datetime, it.next());
    return response.join("");
}

QString IndiFcgi::getDelta(qint64 &max, const qint64 &datetime, const QString &device)
{
    QStringList response;
    max = qMax(max, datetime);

    QMutexLocker lock(&mMutex);

    if (device.size())
    {
        if (mProperties.contains(device))
        {
            QLinkedListIterator< QPair<qint64, QString> > it(mProperties[device]);
            while (it.hasNext())
            {
                const QPair<qint64, QString> &value = it.next();

                if (value.first >= datetime)
                {
                    max = qMax(value.first, max);
                    response += value.second;
                }
            }
        }
    }

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
        mProperties[e.attribute("device")] << qMakePair(now, doc.toString(2));
    }

    cullProperties(now, e.attribute("device"));
}

void IndiFcgi::cullProperties(const qint64 &now, const QString &device)
{
    QMutexLocker lock(&mMutex);
    QMutableLinkedListIterator< QPair<qint64, QString> > it(mProperties[device]);

    while (it.hasNext())
    {
        const QPair<qint64, QString> &property = it.next();

        if (now > property.first + mAge)
            it.remove();
    }
}
