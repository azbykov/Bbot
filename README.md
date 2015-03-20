Butsa Bot
==

## Текущая версия 0.4.0
* заявка на тов. матч
* покупка товара
* ремонт зданий
* email оповещение о статусе текущих задач
* email оповещение о результатах матчей
* email оповещение о треннировках
* email оповещение о финансах
* комментарии после матча


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
### v0.5.0
покупка талантов
### v0.5.1
продажа талантов
### v0.6.0
отправка состава на текущие матчи
### v1.0.0
* Вэб интерфейс
* отправка состава
* сохранять схемы
* заявка на тов
* отправка состава на тов
* комментарии после матча
* покупка товара
* покупка талантов
* продажа талантов
* оповещение о треннировках на почту
