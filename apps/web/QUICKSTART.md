# 🚀 Быстрый старт ReborDev Hub

## 📦 Установка за 3 шага

### 1️⃣ Установите зависимости

```bash
cd d:\2\newhub\apps\web
npm install
```

⏱️ Займет ~2-3 минуты

### 2️⃣ Настройте окружение

Создайте файл `.env.local`:

```bash
cp .env.local.example .env.local
```

Откройте `.env.local` и укажите URL вашего API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3️⃣ Запустите приложение

```bash
npm run dev
```

Откройте браузер: **http://localhost:3000**

## ✅ Что проверить

1. **Landing page** (http://localhost:3000)
   - Должен быть градиентный заголовок
   - 3 карточки с фичами
   - Кнопки "Войти" и "Регистрация"

2. **Форма входа** (http://localhost:3000/login)
   - Поля Email и Password
   - Валидация работает
   - Кнопка "Войти"

3. **Форма регистрации** (http://localhost:3000/register)
   - Поля Имя, Email, Password, Подтверждение
   - Валидация паролей
   - Кнопка "Зарегистрироваться"

4. **Dashboard** (http://localhost:3000/dashboard)
   - Требует авторизации (редирект на /login)
   - Sidebar с 8 пунктами меню
   - Header с профилем
   - 4 метрики
   - Проекты и активность

## 🎨 Дизайн

### Темная тема (единственная)
- Фон: `#0F0D1A` (очень темный фиолетовый)
- Карточки: `#1E1B2E` (темный фиолетовый)
- Акцент: `#7C3AED` (яркий фиолетовый)
- Текст: `#FAFAFA` (почти белый)

### Шрифт
- Inter (с поддержкой кириллицы)

## 📱 Страницы

### Публичные
- `/` - Landing page
- `/login` - Вход
- `/register` - Регистрация

### Защищенные (требуют авторизации)
- `/dashboard` - Главная
- `/dashboard/projects` - Проекты
- `/dashboard/freelance` - Фриланс
- `/dashboard/chats` - Чаты
- `/dashboard/team` - Команда
- `/dashboard/servers` - Серверы
- `/dashboard/reports` - Отчёты
- `/dashboard/settings` - Настройки

## 🔧 Команды

```bash
# Разработка
npm run dev

# Продакшн билд
npm run build

# Запуск продакшн версии
npm run start

# Линтинг
npm run lint
```

## 🐛 Проблемы?

### Ошибка: "Module not found"
```bash
rm -rf node_modules
npm install
```

### Ошибка: "Port 3000 is already in use"
```bash
# Остановите процесс на порту 3000 или используйте другой порт
npm run dev -- -p 3001
```

### API не работает
Проверьте `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📚 Документация

- **README.md** - Полная документация
- **INSTALL.md** - Подробная установка
- **FEATURES.md** - Список функций
- **PROJECT_SUMMARY.md** - Итоговая сводка

## 🎯 Что дальше?

1. ✅ Проект установлен и работает
2. 🔄 Интегрируйте с вашим API
3. ➕ Добавьте новые фичи
4. 🚀 Задеплойте на Vercel/Docker

## 💡 Подсказки

### Добавление новой страницы
```bash
# Создайте файл
touch app/dashboard/new-page/page.tsx

# Добавьте в Sidebar
# components/layout/Sidebar.tsx
```

### Создание нового компонента
```bash
# Создайте файл
touch components/ui/new-component.tsx

# Используйте shadcn/ui стиль
```

### API запросы
```typescript
import { authAPI } from '@/lib/api-client';

// Все запросы автоматически включают JWT токен
const response = await authAPI.getProfile();
```

## 🎉 Готово!

Проект полностью настроен и готов к работе.

**Успехов в разработке! 🚀**

---

© 2024 ReborDev. Все права защищены.
