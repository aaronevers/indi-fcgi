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

#include "fcgi_stdio.h"
#include <cstdlib>
#include <QtCore>
#include "indiclient.h"
#include "indifcgi.h"

QTextStream qout;

int main(int argc, char *argv[])
{
    QCoreApplication app(argc, argv);
    app.setApplicationName("indi.fcgi");
    app.setApplicationVersion("v0.0");
    app.setOrganizationName("indi-fcgi.googlecode.com");
    app.setOrganizationDomain("indi-fcgi.googlecode.com");

    QMap<QString, QString> argm;
    QStringList args = qApp->arguments();
    for (int i = 0; i < args.size(); i++)
        if (args.at(i).startsWith("+"))
            argm[args.at(i).section("+", 0, 0, QString::SectionSkipEmpty).section("=", 0, 0, QString::SectionSkipEmpty)] = args.at(i).section("=", 1);

    if (!argm.contains("log"))
        argm["log"] = "/dev/stdout";

    if (!argm.contains("host"))
        argm["host"] = "localhost";

    QFile *file = new QFile(argm["log"]);
    if (file->open(QIODevice::WriteOnly|QIODevice::Truncate))
        qout.setDevice(file);

    if (argm.contains("help")||argm.contains("h"))
    {
        qout << qApp->applicationName() << " " << qApp->applicationVersion() << endl;
        qout << "Usage: " << qApp->applicationName() << " [options]" << endl;
        qout << "Where [options] are the following:" << endl;
        qout << "  +h|++help             Prints this help statement." << endl;
        qout << "  ++host=<host[:port]>  Sets host[:port] of the indiserver." << endl;
        qout << "  ++log=<log>           Redirects log to the specified log." << endl;
        qout << "  ++readonly            Disables setting INDI properties." << endl;
        qout << endl;
        return false;
    }

    IndiFcgi indifcgi(argm);
    indifcgi.start();

    return app.exec();
}
