# Архитектура Bbot

## Обзор

Bbot — однопроцессный ежедневный бот для `butsa.ru`. Он использует серверные HTML-страницы как неформальный API: отправляет HTTP-запросы с авторизованной cookie jar, разбирает ответы через Cheerio, выполняет игровые операции и формирует HTML-письмо.

Проект содержит примерно 2 700 строк JavaScript и EJS/CSS. Исходники используют CommonJS. Отдельного веб-сервера, базы данных и постоянного прикладного хранилища нет.

## Контекст выполнения

Основная команда:

```bash
node src/bot/daily-15.js
```

`npm run daily` вызывает эту команду напрямую. `npm run prod` дополнительно задаёт `NODE_ENV=production`. Скрипт `cron/cron.sh` предназначен для запуска по расписанию, но содержит жёсткий deployment path `/home/www/bbot`.

```text
cron / CLI
    │
    ▼
daily-15.js
    │
    ├── авторизация и cookie jar
    │
    ├── параллельные ежедневные задачи
    │       ├── чтение и парсинг HTML
    │       ├── внешние игровые операции
    │       └── заполнение mail buffer
    │
    ├── построение alerts
    │
    └── email-templates (EJS) → Nodemailer → ежедневный email
```

## Главный поток

Точка входа `src/bot/daily-15.js` выполняет следующие стадии:

1. Загружает `.env` и конфигурацию.
2. Запускает общий profiler.
3. Авторизуется через `getAuthCookies.get()`.
4. Авторизуется через общую `fetch`-сессию `reqreq`, которая сохраняет cookies.
5. Загружает singleton `Team`.
6. Параллельно через `Promise.all` запускает:
   - `friendly`;
   - `goods`;
   - `buildings`;
   - `nearMatch`;
   - `getLastResult`;
   - `getTrainingReport`;
   - `getTrainingReportJunior`;
   - `financialReport`;
   - `checkMail`;
   - `setOptimalTraining`.
7. После завершения задач формирует alerts в `setNotifications`.
8. Запускает отправку ежедневного письма.
9. При отклонении любого promise логирует ошибку и запускает error-mail.
10. В `finally` фиксирует полную длительность запуска.

Поскольку задачи стадии 6 параллельны, общий отказ не откатывает уже выполненные операции.

## Слои

### Orchestration

`src/bot/daily-15.js` связывает компоненты и задаёт порядок стадий. Доменных вычислений здесь почти нет.

### Tasks

`src/bot/tasks/` содержит операции уровня пользовательского сценария:

| Task | Источник данных | Внешний эффект |
|---|---|---|
| `friendly` | config + HTTP | заявка на товарищеский матч |
| `goods` | `team.club` + HTTP | покупка товара |
| `buildings` | config + HTTP | ремонт построек |
| `nearMatch` | `team.nearMatch` | данные и эмблемы в buffer |
| `getLastResult` | главная и отчёт матча | комментарий в пресс-центре |
| `getTrainingReport` | `team.trainingMainTeam` | отчёт в buffer |
| `getTrainingReportJunior` | `team.youngs` | отчёт в buffer |
| `financialReport` | `team.finance` | отчёт в buffer |
| `checkMail` | игровая почта | непрочитанные письма в buffer |
| `setOptimalTraining` | `team.club` | назначение тренировок |
| `setNotifications` | club/youngs/finance | alert-объекты в памяти |

`setOptimalTicketPrice` не подключён к entry point и импортирует отсутствующий action.

### Actions

`src/bot/actions/` содержит более узкие действия:

- `getAuthCookies` создаёт авторизованную сессию;
- `addComments` определяет исход матча и отправляет случайные комментарии;
- `getImage` загружает эмблемы и кодирует их в base64;
- `getClubInfo` парсит общую информацию клуба;
- `optimizeTraining` выбирает навык и отправляет тренировочную форму.

### HTTP session

`src/lib/reqreq.js` — singleton-фасад над встроенным в Node.js 24 `fetch`.

Авторизация и все последующие запросы используют один экземпляр `Req` и общую cookie jar. Адаптер преобразует существующий формат `uri/method/qs/form` в `URL`, `Headers` и `URLSearchParams`, поэтому tasks и providers сохраняют прежний контракт.

Метод `request(name, params, callback)`:

1. создаёт logger с именем запроса;
2. выполняет реальный fetch либо читает GET fixture;
3. сохраняет cookies из ответа;
4. возвращает request-подобный объект `{body, headers, statusCode}`;
5. передаёт response пользовательскому parser callback.

Режим `--use-mocks` читает/создаёт JSON в каталоге `mocks`, но POST всегда выполняет реально. Каталог `mocks` в текущем репозитории отсутствует.

### Team data facade

`src/lib/team/index.js` экспортирует singleton `Team`. Его поля — экземпляры `CreateManager`, которые лениво загружают и кэшируют данные.

```text
Team
 ├── club                → roster + goods + clubInfo
 ├── nearMatch           → ближайшие матчи
 ├── trainingMainTeam    → тренировки основы
 ├── youngs              → тренировки ДЮСШ
 └── finance             → операции + вклады
```

`CreateManager.value` имеет три режима:

- возвращает кэшированные данные;
- возвращает уже выполняющийся `pendingPromise`;
- вызывает provider и затем кэширует результат.

Данные `club.roster` объединяются по `player.id` из трёх HTML-представлений:

```text
/roster
 ├── базовый roster
 ├── ?act=parameters
 └── ?act=abilities
          │
          ▼ merge by id
      Player[]
```

### HTML parsers

Парсеры расположены рядом с соответствующей областью:

- `team/club/` — состав, параметры, способности и клуб;
- `team/match/` — ближайшие матчи;
- `team/training/` — отчёты основы и ДЮСШ;
- `team/office/` — финансы и вклады.

Большинство парсеров использует позиционные CSS-селекторы (`.maintable[2]`, `nth-child`) и текстовые маркеры. Поэтому HTML `butsa.ru` является критической внешней зависимостью, хотя формальной схемы нет.

### In-memory state

`src/lib/buffer.js` экспортирует один mutable object. Tasks добавляют в него:

- ближайшие матчи;
- последний результат;
- тренировки;
- финансы;
- непрочитанные письма;
- информационные log records.

`src/lib/notification.js` аналогично экспортирует singleton с массивом `alerts`.

Состояние живёт до завершения Node.js-процесса и не сохраняется между cron-запусками.

### Alerts

Базовый `Alert` имеет тип `WARN` или `ALERT` и возвращает HTML-текст методом `getText()`.

Реализации:

- `BonusPointsAlert` — игрок может повысить бонус;
- `InjureOperationAlert` — травма дольше 15 дней;
- `TalentAlert` — достижение таланта в пределах 5 дней;
- `DepositAlert` — вклад заканчивается в пределах 5 туров или нужен новый вклад.

### Mailer

`src/lib/mailer/daily.js` объединяет mail template, buffer, alerts и данные команды. `email-templates` рендерит EJS-шаблоны HTML/text из `src/lib/mailer/templates` и передаёт письмо в явно настроенный актуальный Nodemailer transport через сервис из config.

Daily recipient сейчас задан непосредственно в `daily.js`. `config.mailUsers` не участвует в отправке. Error-mail создаётся отдельным шаблоном.

### Logging

`src/lib/log/index.js` создаёт именованные Winston loggers:

- console transport: уровень `info`;
- file transport: уровень `debug`, файл `log/node.log`;
- каждое `info`-событие также добавляется в mail buffer.

`src/lib/profiler.js` хранит времена старта по label и возвращает длительность операции в миллисекундах.

## Доменные данные

Явных схем и типов пока нет. Фактически используются следующие основные структуры:

- `Player`: id, ссылка, имя, позиция, возраст, физическая форма, усталость, навыки, бонусные очки, травма и тренировочные параметры;
- `ClubInfo`: клуб, менеджер, город, стадион, дивизион, фонд и показатели силы;
- `Match`: дата, турнир, соперник, домашний/гостевой статус, заявка, ссылки и эмблема;
- `MatchResult`: команды, счёт, зрители, события и изображения;
- `TrainingReport`: прогресс, регресс и оставшиеся тренировки;
- `YoungPlayer`: данные воспитанника и прогноз дней до таланта;
- `FinanceOperation`: дата, комментарий, сумма, контрагент, баланс;
- `Deposit`: сумма, ставка, оставшиеся туры, доход и комиссия.

При миграции на TypeScript эти структуры следует сделать явными прежде, чем типизировать orchestration.

## Оптимизация тренировок

`config/stratege.json` задаёт правила по игроку, позиции, группе ролей и набору тактик. Приоритет:

1. `byPlayerId`;
2. `byPosition` — код ветки пока не реализован;
3. `byRole`;
4. fallback `vinoslevost`.

Стратегия либо циклически выбирает следующий навык, либо выбирает минимальный из разрешённых. Вратарям ability не назначается. Для остальных игроков отправляется `PercentTrain = 100`.

## Конфигурация

`config/default.js` объединяет env-настройки и параметры задач. Код читает:

```dotenv
LOGIN=
PASSWORD=
TEAM_NAME=
TEAM_ID=
PORT=
MAIL_LOGIN=
MAIL_PASSWORD=
MAIL_SERVICE=
```

`.env.example` ошибочно использует `BUTSA_LOGIN` и `BUTSA_PASSWORD`. Значения `.env` являются секретами и не должны попадать в документацию или логи.

Все endpoint paths сосредоточены в `src/constants/uri.js`. Некоторые task form parameters также находятся в `config/default.js`.

## Обработка ошибок и согласованность

Верхний уровень имеет один общий `catch`, но транзакционной границы нет. Например, покупка товара может завершиться успешно, после чего ошибка парсинга тренировок приведёт к error-mail. Повторный запуск способен повторить часть действий.

Известные проблемы promise/error handling:

- auth деструктурирует response до проверки `error`;
- redirect-ветка buildings ожидает неверное имя `bBody`;
- goods не возвращает вложенный status-request;
- `CreateManager.pendingPromise` не сбрасывается при reject;
- отправка email запускается, но её promise не возвращается вызывающему коду.

Целевое состояние — каждая task возвращает структурированный результат, явно классифицирует read/write operation и поддерживает безопасный повторный запуск.

## Проверки

`npm test` выполняет:

```bash
npm run lint && node --test
```

На 20 августа 2026 года lint и 9 unit-тестов проходят. Покрыты env-конфигурация, cookie-сессия и form encoding HTTP-адаптера, даты, EJS-рендеринг и безопасный send-path через `email-templates`. Перед значительным изменением scraping нужны обезличенные HTML fixtures и parser tests. Сетевой daily-flow не должен быть smoke-тестом.

## Целевая эволюция

Рекомендуемая последовательность:

1. стабилизировать env, email-конфигурацию, lint и promise handling;
2. добавить fixtures и тесты HTML-парсеров;
3. поддерживать зафиксированный минимум Node.js 24.9.0;
4. ввести TypeScript и доменные типы;
5. сделать `CreateManager<T>`;
6. заменить глобальную HTTP-сессию инъецируемым интерфейсом;
7. отделить pure parsers от network providers;
8. добавить идемпотентность и результаты задач;
9. перевести actions/tasks и затем entry point;
10. развивать встроенные Node.js API без возврата к deprecated HTTP/date-библиотекам.
