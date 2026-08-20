# Bbot: инструкции для агентов

## Назначение проекта

Bbot — Node.js-бот для футбольного менеджера «Золотая бутса» (`butsa.ru`). Он авторизуется от имени менеджера, разбирает HTML-страницы клуба, выполняет ежедневные игровые операции и отправляет email-отчёт.

Текущая версия: `0.7.0`. Исходники написаны на CommonJS JavaScript и рассчитаны на Node.js 24.9.0 или новее. Для HTTP используется встроенный `fetch`, для переменных окружения — `process.loadEnvFile()`.

Подробное устройство проекта описано в `ARCHITECTURE.md`.

## Основные команды

```bash
npm install       # установка зависимостей
npm run daily     # ежедневный сценарий
npm run prod      # daily с NODE_ENV=production
npm run lint      # ESLint 10 flat config
npm test          # lint + тесты node:test
npm run audit     # аудит production-зависимостей
```

Не запускай `npm run daily` без явного согласия владельца: сценарий выполняет реальные операции на `butsa.ru` — покупает товар, ремонтирует здания, подаёт заявку, меняет тренировки и публикует комментарий.

Аргумент `--use-mocks` не делает запуск полностью безопасным: `src/lib/reqreq.js` подменяет только GET-запросы, а POST-запросы всё равно отправляются на сайт.

## Навигация

- `src/bot/daily-15.js` — точка входа и orchestration.
- `src/bot/tasks/` — ежедневные пользовательские операции.
- `src/bot/actions/` — низкоуровневые действия.
- `src/lib/team/` — загрузка, парсинг и кэширование данных команды.
- `src/lib/reqreq.js` — HTTP singleton с авторизованной cookie jar.
- `src/lib/buffer.js` — общий буфер ежедневного письма.
- `src/lib/alerts/` — предупреждения.
- `src/lib/mailer/` — сборка и отправка писем.
- `src/constants/uri.js` — адреса и пути `butsa.ru`.
- `config/default.js` — runtime-конфигурация.
- `config/stratege.json` — правила оптимизации тренировок.
- `cron/cron.sh` — production-запуск по расписанию.

## Правила работы

1. Не читай и не публикуй значения из `.env`; это реальные учётные данные.
2. Не выполняй сетевой daily-flow для проверки изменений. Используй lint, unit-тесты и локальные HTML fixtures.
3. Учитывай, что HTML-парсеры зависят от индексов таблиц, колонок и русских строк сайта. Изменение селектора проверяй на fixture.
4. Сохраняй CommonJS-совместимость до утверждения и завершения миграции на TypeScript.
5. Не меняй одновременно поведение и типизацию большого слоя. Мигрируй небольшими вертикальными срезами.
6. Не добавляй новые глобальные singleton-состояния. Текущие `reqreq`, `team`, `buffer` и `notification` уже затрудняют изоляцию тестов.
7. Для операций с внешним эффектом явно обрабатывай повторный запуск, частичный сбой и момент завершения promise.
8. После изменения запускай `npm test`; отдельно указывай, если падение существовало до изменения.

## Переменные окружения

Код в `config/default.js` читает:

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

Известное расхождение: `.env.example` объявляет `BUTSA_LOGIN` и `BUTSA_PASSWORD`, но код ожидает `LOGIN` и `PASSWORD`.

## Текущее состояние проверок

На 20 августа 2026 года `npm test` успешно выполняет ESLint и unit-тесты для HTTP-сессии, дат и рендеринга EJS через `email-templates`. Проверяйте production-зависимости командой `npm run audit` (optional preview-зависимости исключены).

Сетевых integration-тестов и HTML fixture-тестов парсеров пока нет.

## Известные риски

- Получатель daily-mail захардкожен в `src/lib/mailer/daily.js`; `config.mailUsers` не используется.
- `setOptimalTicketPrice.js` импортирует отсутствующий `actions/optimizeTicketPrice` и не включён в daily-flow.
- Redirect-ветка `buildings.js` ожидает `{bBody}` вместо стандартного `{body}`.
- Вложенный status-request в `goods.js` не возвращается вызывающему promise.
- После reject `CreateManager` может сохранить отклонённый `pendingPromise`.
- Параллельный `Promise.all` допускает частично выполненные внешние операции при общем сбое.
- Cookie jar в `reqreq` рассчитан на один домен и пока не моделирует `Path`, `Domain`, `Expires` и `SameSite`.

## Направление миграции на TypeScript

Рекомендуемый порядок:

1. добавить `tsconfig`, `typecheck`, `build` для Node.js 24;
2. типизировать constants, config, alerts, profiler и `Order`;
3. ввести доменные типы `Player`, `ClubInfo`, `Match`, `TrainingReport`, `FinanceReport`, `Deposit`, `MailBuffer`;
4. покрыть HTML-парсеры fixture-тестами и перевести их на TypeScript;
5. сделать `CreateManager<T>` и типизированный `Team`;
6. выделить инъецируемый `HttpClient/Session` вместо глобального `reqreq`;
7. перевести actions, tasks и последним — entry point;
8. после полного паритета удалить временные JavaScript-типы и совместимые обёртки.

## Game-domain knowledge

Before changing game automation, scheduling, parsing, thresholds, formulas, or business rules, read `docs/knowledge/game-mechanics.md`.

Treat that document as a sourced domain guide, not as an infallible specification. Preserve its distinction between confirmed rules, implementation implications, and rules that need verification. When a change establishes that a game rule has changed, update the guide and its source/verification notes in the same commit.

## Keep the code map synchronized

At the start of every code-changing task, compare the current repository with `docs/codemap/codemap.lock`.

Before modifying a module, use `docs/codemap/codemap.json` to answer these questions:

1. What calls it?
2. What does it affect?
3. Which tests cover it?

If the code map is stale or cannot answer those questions, regenerate all three code-map artifacts before changing the code:

- `docs/codemap/codemap.html`
- `docs/codemap/codemap.json`
- `docs/codemap/codemap.lock`

Whenever module boundaries, dependencies, routes, databases, queues, or major data flows change, update all three code-map artifacts in the same commit as the code.
