#!/bin/bash

case "$1" in
  "start")
    echo "启动开发环境..."
    docker-compose up -d mysql
    nr dev
    ;;
  "stop")
    echo "停止开发环境..."
    docker-compose stop mysql
    ;;
  *)
    echo "使用方法: ./dev.sh [start|stop]"
    ;;
esac
