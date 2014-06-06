#!/bin/sh
 # как обычно, с символа '#' начинаются комментарии
 # в качестве командного интерпретатора использовать /bin/sh
 SHELL=/bin/sh
 # результаты работы отправлять по этому адресу
MAILTO=kid86@list.ru
 # добавить в PATH домашний каталог пользователя
PATH=/home/www/bbot

 #### Здесь начинаются задания

0 15 * * * NODE_CONFIG_DIR=$PATH/config /usr/bin/node $PATH/bot/daily-15.js
