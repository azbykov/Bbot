#!/bin/sh
 # как обычно, с символа '#' начинаются комментарии
 # в качестве командного интерпретатора использовать /bin/sh
 SHELL=/bin/sh
 # добавить в PATH домашний каталог пользователя
PATH=

 #### Здесь начинаются задания

0 15 * * * NODE_ENV=production NODE_CONFIG_DIR=$PATH/config /usr/bin/node $PATH/bot/daily-15.js
