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

IndiFcgi::IndiFcgi(const QMap<QString, QString> &argm): mClient(argm["reconnects"].toInt()), mReadOnly(false), mUseMappedCache(false)
{
    if (argm.contains("readonly"))
        mReadOnly = true;

    if (argm.contains("mapcache"))
        mUseMappedCache = true;

    mAge = argm["age"].toDouble() / 86400;

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
                if (!mUseMappedCache)
                {
                    QDomDocument doc("");
                    QDomElement getProperties = doc.createElement("getProperties");
                    getProperties.setAttribute("version", indi::VERSION);
                    doc.appendChild(getProperties);
                    mClient.sendProperty(doc);
                }
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

QString IndiFcgi::getDelta(QHashIterator<QString, QString> &it, QString &timestamp)
{
    QString response;
    double datetime = IndiClient::isoDateToJd(timestamp);
    double max = datetime;

    while (it.hasNext())
    {
        it.next();
        QDomDocument doc("");
        if (doc.setContent(it.value()))
        {
            QDomElement el = doc.documentElement();
            if (el.hasAttribute("timestamp"))
            {
                QString ts = el.attribute("timestamp");
                double dt = IndiClient::isoDateToJd(ts);
                if (dt > datetime)
                {
                    if (dt > max)
                    {
                        max = dt;
                        timestamp = ts;
                    }

                    response += it.value();
                }
            }
        }
    }

    return response;
}

QString IndiFcgi::getDelta(QString &timestamp)
{
    QString response;
    double datetime = IndiClient::isoDateToJd(timestamp);
    double max = datetime;

    QMutexLocker lock(&mMutex);

    if (mUseMappedCache)
    {
        QString ts = timestamp;
        QHashIterator<QString, QString> def(mDefinitionMap);
        response += getDelta(def, ts);

        QHashIterator<QString, QString> set(mPropertyMap);
        response += getDelta(set, timestamp);
    }
    else
    {
        QLinkedListIterator< QPair<QString, QString> > it(mProperties);

        while (it.hasNext())
        {
            const QPair<QString, QString> &value = it.next();
            double dt = IndiClient::isoDateToJd(value.first);

            if (dt > datetime)
            {
                if (dt > max)
                {
                    max = dt;
                    timestamp = value.first;
                }

                response += value.second;
            }
        }
    }

    return response;
}

void IndiFcgi::propertyUpdated(QDomDocument doc)
{
    QDomElement e = doc.documentElement();

    if (mUseMappedCache)
    {
        if (e.hasAttribute("device") && e.hasAttribute("name") && e.hasAttribute("state"))
        {
            QString devicename = e.attribute("device") + "." + e.attribute("name");
            QString op = e.tagName().left(3);
            QString text = doc.toString(2);

            {
                QMutexLocker lock(&mMutex);

                if (op == "set")
                    mPropertyMap[devicename] = text;
                else if (op == "def")
                    mDefinitionMap[devicename] = text;
            }
        }
    }
    else
    {
        if (e.hasAttribute("timestamp"))
        {
            QString timestamp = e.attribute("timestamp");
            {
                QMutexLocker lock(&mMutex);
                mProperties << qMakePair(timestamp, doc.toString(2));
            }
            cullProperties(timestamp);
        }
    }
}

void IndiFcgi::cullProperties(const QString &iso)
{
    double now = IndiClient::isoDateToJd(iso);

    QMutexLocker lock(&mMutex);
    QMutableLinkedListIterator< QPair<QString, QString> > it(mProperties);

    while (it.hasNext())
    {
        const QPair<QString, QString> &property = it.next();

        double dt = IndiClient::isoDateToJd(property.first) + mAge;

        if (dt < now)
            it.remove();
    }
}
