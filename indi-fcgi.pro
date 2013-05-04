TARGET = indi.fcgi

TEMPLATE = app

CONFIG += thread console

QT += network xml
QT -= gui

DESTDIR = bin

OBJECTS_DIR = tmp
MOC_DIR =     tmp
RCC_DIR =     tmp

LIBS += /usr/local/lib/libfcgi.a

HEADERS += src/indiclient.h   src/indifcgi.h
SOURCES += src/indiclient.cpp src/indifcgi.cpp src/main.cpp
