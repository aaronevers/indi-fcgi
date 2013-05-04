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

#ifndef INDIFCGI_H
#define INDIFCGI_H

#include <QtCore>
#include "fcgi_stdio.h"
#include "indiclient.h"

class IndiFcgi : public QThread
{
    Q_OBJECT;

public:
    IndiFcgi(const QMap<QString, QString> &argm);

protected:
    virtual void run();

private:
    QMutex mMutex;
    IndiClient mClient;
    QLinkedList< QPair<QDateTime, QString> > mProperties;
    bool mReadOnly;
    int mMilliseconds;

    QString getDelta(QLinkedListIterator< QPair<QDateTime, QString> > &it, QString &timestamp);

private slots:
    void propertyUpdated(QDomDocument);
    void cullProperties();
};

#endif
