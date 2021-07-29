Butsa Bot  [![Build Status](https://travis-ci.org/azbykov/Bbot.svg?branch=master)](https://travis-ci.org/azbykov/Bbot)  [![dependencies](https://david-dm.org/azbykov/Bbot.svg)](https://david-dm.org/azbykov/Bbot)
==

## Текущая версия 0.7.0
* заявка на тов. матч
* покупка товара
* ремонт зданий
* email оповещение
  * о статусе текущих задач
  * о результатах матчей
  * о треннировках
  * о финансах
  * о новых сообщениях
* комментарии после матча
* расчет оптимальных тренировок
* Расчет тренировок таланта


## Установка
```bash
git clone git@github.com:azbykov/Bbot.git bbot
cd bbot
npm install
```

## Настройка
Указать в  файле `config/default.js`

```js
bot: {
	auth: {
		// логин и пароль к butsa.ru
		login: LOGIN,
		password: PASSWORD
	},
	mail: {
		service: MAIL_SERVER	// например 'mail.ru',
		auth: {
		// логин и пароль к почтовому серверу, например 'mail.ru'
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
npm run daily
``

## CRON
``
crontab cron/cron.sh
``

## Road map
### v1.0.0
* Вэб интерфейс
* отправка состава
* сохранять схемы
* покупка талантов
* продажа талантов
* Расчет восстановления Ф/Г
* Расчет вероятности получения травмы
* Расчет посещаимости
* Изменения в турнирной таблице
* Транферный агент
