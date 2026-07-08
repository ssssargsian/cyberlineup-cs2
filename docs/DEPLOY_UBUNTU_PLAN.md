# CyberLineup SR — Ubuntu Deploy Plan

Пока деплой не выполняется. Это план для будущего production-запуска.

## Stack
- Ubuntu 24.04
- Node.js 20 LTS или 22 LTS
- pnpm
- PostgreSQL
- Nginx
- PM2 или systemd
- Certbot / Let’s Encrypt
- домен будет добавлен позже

## Plan
1. Установить Node.js LTS и pnpm.
2. Установить PostgreSQL или поднять его через Docker Compose.
3. Скопировать проект на сервер.
4. Настроить `.env.production`.
5. Выполнить `pnpm install`.
6. Выполнить `pnpm prisma generate`.
7. Применить миграции production-safe командой `pnpm prisma migrate deploy`.
8. Запустить импорт реальных данных: `pnpm bootstrap:real` или отдельный production-safe pipeline без `migrate dev`.
9. Выполнить `pnpm build`.
10. Запустить Next.js через PM2 или systemd.
11. Настроить Nginx reverse proxy на порт приложения.
12. Настроить SSL через Certbot / Let’s Encrypt.
13. Проверить `/`, `/search`, `/maps`, `/lineups/[slug]`, `/assistant`, `/admin/imports`.

## Important Production Rules
- В production не использовать `prisma migrate dev`.
- Использовать `pnpm prisma migrate deploy`.
- Не запускать агрессивный импорт на каждый deploy.
- Demo-данные должны быть `rejected` и не должны попадать в публичную выдачу.
- `sourceUrl` и `sourceName` должны сохраняться для импортированных раскидов.

## Suggested PM2 Start
```bash
pnpm build
pm2 start pnpm --name cyberlineup-sr -- start
pm2 save
```

## Suggested Nginx Shape
```nginx
server {
  server_name example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Verification
- `/search?q=молик%20car%20inferno` возвращает опубликованные реальные раскиды.
- `/maps/inferno` открывается без дублей карт.
- Любой опубликованный imported lineup открывается на `/lineups/[slug]`.
- Фото карточек, hero и шагов видны сразу.
- Ассистент не выдумывает данные.
