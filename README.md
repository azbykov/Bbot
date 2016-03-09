Butsa Bot  [![Build Status](https://travis-ci.org/azbykov/Bbot.svg?branch=master)](https://travis-ci.org/azbykov/Bbot)
==

## Текущая версия 0.6.0
* заявка на тов. матч
* покупка товара
* ремонт зданий
* email оповещение о статусе текущих задач
* email оповещение о результатах матчей
* email оповещение о треннировках
* email оповещение о финансах
* комментарии после матча
* расчет оптимальных тренировок
* Оповещение о новых сообщениях


## Установка
```bash
git clone git@github.com:azbykov/Bbot.git bbot
cd bbot
npm install
```

## Настройка
Указать в  файле `config/default,js`

```js
bot: {
	auth: {
		login: LOGIN,
		password: PASSWORD
	},
	mail: {
		service: MAIL_SERVER	// например 'mail.ru',
		auth: {
			user: LOGIN,
			pass: PASSWORD
		}
	},
}
```

Настройка cron

```bash
crontab -e
```

```cron
 # добавить в PATH домашний каталог пользователя
PATH= PATH_TO_BBOT_DIRECTORY
0 15 * * * /bin/bash $PATH/cron/cron.sh # Каждые день в 15 часов

```


## Запуск
``
node bot/daily-15
``


## CRON
``
crontab cron/cron.sh
``

## Задачи

#### Заявка на тов. матч
Отправляет заявку на тов матч `bot/tasks/friendly.js`

#### Покупка товара
Покупка товара `bot/tasks/goods.js`

#### Ремонт зданий
Ремонт зданий `bot/tasks/buildings.js`


## Road map
### v0.6.1
* Расчет восстановления Ф/Г
* Расчет вероятности получения травмы
### v0.7.0
* Транферный агент
### v1.0.0
* Вэб интерфейс
* отправка состава
* сохранять схемы
* покупка талантов
* продажа талантов
