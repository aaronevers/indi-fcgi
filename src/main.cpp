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

#include <QtCore>
#include "fcgi_stdio.h"
#include <cstdlib>
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

    if (!argm.contains("age"))
        argm["age"] = "30.0";

    if (!argm.contains("reconnects"))
        argm["reconnects"] = "3";

    QFile *file = new QFile(argm["log"]);
    if (file->open(QIODevice::WriteOnly|QIODevice::Truncate))
        qout.setDevice(file);

    if (argm.contains("help")||argm.contains("h"))
    {
        qout << qApp->applicationName() << " " << qApp->applicationVersion() << endl;
        qout << "Usage: " << qApp->applicationName() << " [options]" << endl;
        qout << "Where [options] are the following:" << endl;
        qout << "  +h|++help             Prints this help statement." << endl;
        qout << "  ++age=<seconds>       Specifies the minimum age of properties to keep cached (Defaults to 30.0)." << endl;
        qout << "  ++host=<host[:port]>  Sets host[:port] of the indiserver (Defaults to localhost:7624)." << endl;
        qout << "  ++log=<log>           Redirects log to the specified log." << endl;
        qout << "  ++readonly            Disables setting INDI properties." << endl;
        qout << "  ++reconnects=<n>      Sets the number of automatic reconnects to the indiserver (Defaults to 3)." << endl;
        qout << endl;
        return false;
    }

    IndiFcgi indifcgi(argm);
    indifcgi.start();

    return app.exec();
}
