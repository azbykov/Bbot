#!/bin/sh
 # как обычно, с символа '#' начинаются комментарии
 # в качестве командного интерпретатора использовать /bin/sh
 SHELL=/bin/sh
 # добавить в PATH домашний каталог пользователя
PATH=/home/www/bbot

 #### Здесь начинаются задания
NODE_ENV=production NODE_CONFIG_DIR=$PATH/config /usr/bin/node $PATH/src/bot/daily-15.js
