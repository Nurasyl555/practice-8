# 🚀 CosmoDex — Redux Toolkit, PWA & Firebase Authentication (Task 8)

**CosmoDex** — интерактивное веб-приложение каталога экзопланет на **React**, переведённое на **Redux Toolkit (`@reduxjs/toolkit` + `react-redux`)** для централизованного управления глобальным состоянием и асинхронными операциями, с сохранением аутентификации через **Firebase Auth**, маршрутизации, URL-параметров, CRUD и **PWA/оффлайн-режима**.

---

## 🔗 Ссылки для сдачи работы

* **GitHub Repository:** [https://github.com/Nurasyl555/practice-8](https://github.com/Nurasyl555/practice-8)
* **Deployed Application:** [https://Nurasyl555.github.io/practice-8/](https://Nurasyl555.github.io/practice-8/)

---

## 🧠 Архитектура Redux Toolkit (Slices, Thunks & Selectors)

Глобальное управление состоянием вынесено в `src/store/` с чётким разделением слоёв:
* **API-сервисы** (`src/services/api.js`, `src/services/service.js`) — чистая работа с `fetch`, `AbortSignal` и `localStorage` без привязки к Redux.
* **Redux-слой** (`src/store/`) — конфигурация `store.js`, feature-based слайсы (`slices/`), асинхронные операции (`thunks/`) и мемоизированные селекторы (`selectors/`).
* **Кастомные хуки** (`src/hooks/usePlanets.js`) — связывают Redux (`useDispatch`, `useSelector`) с UI-компонентами, реализуют `debounce` для поиска и автоматическую отмену запросов (`promise.abort()`) при размонтировании или смене параметров.
* **Локальное UI-состояние и Auth** — временное UI-состояние (открытие модальных окон, тост-уведомления, поля форм) оставлено локальным (`useState`), а аутентификация Firebase инкапсулирована в `AuthContext`.

### 1. Store (`src/store/store.js`)
Сконфигурирован через `configureStore` и подключён к приложению в `src/App.jsx` с помощью `<Provider store={store}>`.

### 2. Feature-based Slices (`src/store/slices/`)
1. **`planetsSlice` (`src/store/slices/planetsSlice.js`)**
   * Управляет каталогом экзопланет: списком `items`, объектом `pagination`, метаданными Service Worker кэша (`isCached`, `cachedAt`), статусами загрузки и мутаций (`status`, `error`, `mutationStatus`, `mutationError`), а также счётчиком `invalidateVersion`.
   * Обрабатывает `pending`, `fulfilled`, `rejected` через `extraReducers`, включая защиту от устаревших запросов (`currentRequestId`) и отменённых запросов (`action.meta.aborted`).
2. **`planetDetailSlice` (`src/store/slices/planetDetailSlice.js`)**
   * Хранит кэш открытых карточек планет в словаре `byId`, идентификатор активной планеты `activeId`, статус загрузки/ошибки и `currentRequestId`.
   * При создании новой планеты (`createPlanet.fulfilled`) сразу сохраняет её в `byId`, а при сбросе каталога (`resetPlanets.fulfilled`) очищает пользовательские записи `exo-user-*`.
3. **`dashboardSlice` (`src/store/slices/dashboardSlice.js`)**
   * Управляет полным набором данных `allPlanets` для аналитики и фильтрами интерактивного среза (`selectedMission`, `selectedHabitability`).
   * Автоматически обновляет `allPlanets` после мутаций `createPlanet` и `resetPlanets`, а при восстановлении сети (`onReconnect`) помечается флагом `isStale` для перезагрузки.

### 3. Async Thunks (`src/store/thunks/planetThunks.js`)
* **`fetchPlanets`** — загрузка страницы каталога с фильтрами, сортировкой и поиском (с передачей `AbortSignal`).
* **`fetchPlanetById`** — загрузка детальной информации о планете. Использует `condition` для предотвращения лишних сетевых запросов, если планета уже есть в `byId` (и не передан `force: true` для повторного запроса).
* **`fetchAllPlanets`** — загрузка полного каталога для аналитического дашборда (также защищена через `condition` от избыточных повторных запросов).
* **`createPlanet`** — мутация создания новой пользовательской экзопланеты; после успеха обновляет каталог, кэш деталей и дашборд.
* **`resetPlanets`** — мутация сброса пользовательских записей к исходным 105 экзопланетам с обновлением затронутых слайсов.

### 4. Selectors (`src/store/selectors/planetSelectors.js`)
* **Базовые селекторы:** `selectPlanetsState`, `selectPlanetDetailState`, `selectDashboardState`, `selectPlanetsList`, `selectPlanetsPagination`, `selectActivePlanet`, `selectAllDashboardPlanets`, `selectDashboardFilters`.
* **Мемоизированные селекторы (`createSelector`):**
  * `selectPlanetsMutationState` — возвращает состояние и ошибку мутаций каталога.
  * `selectIsCatalogEmpty` — определяет состояние пустого результата после успешного запроса.
  * `selectFilteredDashboardPlanets` — фильтрует полный список планет по выбранным миссии и зоне обитаемости.
  * `selectDashboardStats` — вычисляет ключевые метрики (общее количество, число и процент обитаемых миров, средние температуру и расстояние, ближайшую и самую массивную планету).
  * `selectDashboardBreakdowns` — формирует процентные разбивки по классам планет и космическим миссиям.

---

## 📱 PWA и оффлайн-режим

* Сервис-воркер `public/sw.js` и контекст `PwaContext` сохранены без изменений.
* При восстановлении интернет-соединения (`onReconnect` в `src/App.jsx`) диспатчатся экшены `invalidatePlanetsCache()`, `invalidatePlanetDetails()` и `invalidateDashboardCache()`, чтобы обновить отображаемые данные.

---

## 🛠 Таблица маршрутов (Routing Table)

| Маршрут | Доступ | Описание |
| :--- | :--- | :--- |
| `/` | Публичный | Главная страница CosmoDex |
| `/planets` | Публичный | Каталог экзопланет (Redux Toolkit, URL-фильтры, debounce, пагинация, CRUD) |
| `/planets/:id` | Публичный | Детальный научный паспорт объекта (кэш `byId` в Redux) |
| `/dashboard` | Публичный | Аналитический дашборд (вычисления через `createSelector`) |
| `/about` | Публичный | Информация о проекте и технологиях |
| `/offline` | Публичный | Оффлайн-страница PWA |
| `/login` | Гостевой | Авторизация (Email/пароль + вход через Google) |
| `/signup` | Гостевой | Регистрация нового исследователя |
| `/profile` | **Защищенный** | Профиль пользователя (Email, UID, Logout) |
| `*` | Публичный | Страница ошибки 404 |

---

## 💻 Локальный запуск

```bash
# 1. Установка зависимостей
npm install

# 2. Настройка окружения
cp .env.example .env.local
# Заполните ключи Firebase в .env.local

# 3. Запуск сервера разработки
npm run dev

# 4. Проверка линтера и продакшн-сборка
npm run lint
npm run build
```
