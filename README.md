# Дай в долг

> Мобильное приложение для учёта личных займов — iOS & Android

[![Expo](https://img.shields.io/badge/Expo-54.0-000020?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat&logo=typescript)](https://typescriptlang.org)
[![EAS Build](https://img.shields.io/badge/EAS-Build-000020?style=flat&logo=expo)](https://expo.dev/eas)

---

## Идея

**«Дай в долг»** решает одну из самых болезненных бытовых проблем: потерянные деньги из-за устных договорённостей о займах. Банковские переводы стираются в истории, мессенджеры не напоминают о сроках, блокноты теряются.

Приложение закрывает весь цикл работы с займом:
- Создание записи с суммой, сроком, процентом и счётом
- Автоматическое push-напоминание за 3 дня до срока
- Отметка возврата с начислением кармы
- Финансовая репутация пользователя через систему кармы

Все данные хранятся **локально на устройстве** — никакого сервера, никакой регистрации, никакой передачи данных третьим лицам.

---

## Особенности

### 🎭 Система персонажей-советников
8 уникальных персонажей со своими характерами, взаимными историческими отношениями и 56 контекстными советами (7 экранов × 8 персонажей). Персонажи образуют единую вселенную с семейными и социальными связями — это превращает финансовый трекер в живой, эмоциональный продукт.

| Персонаж | Роль | Связи |
|---------|------|-------|
| Градус | Бизнес-советник (20–35) | Сын Щавеля и Топы, влюблён в Лучу |
| Фофан | Вечный должник (20–35) | Друг Градуса, должен Луче |
| Бисер | Советник по стилю (20–35) | Ждёт пока Градус разберётся с долгами |
| Луча | Советник кармы (20–35) | Дочь Зюйда и Лейлы |
| Щавель | Семейный наставник (40–60) | Муж Топы, отец Градуса |
| Топа | Страж района (40–60) | Жена Щавеля, мать Градуса |
| Зюйд | Финансовый ментор (40–60) | Муж Лейлы, отец Лучи |
| Лейла | Мастер учёта (40–60) | Жена Зюйда, мать Лучи |

### ⭐ Система кармы (геймификация)
| Событие | Очки |
|---------|------|
| Регистрация | +100 |
| Дать в долг | +40 |
| Досрочный возврат | +20 |
| Своевременный возврат | +10 |
| Просрочка (раз в сутки) | −5 за займ |

### 💳 Три тарифа монетизации
| | Базовый | Стандарт | Премиум |
|-|---------|---------|---------|
| Цена | Бесплатно | 299 ₽/мес | 599 ₽/мес |
| Займов | До 5 | Безлимит | Безлимит |
| История | 30 дней | Полная | Полная |
| PDF-экспорт | — | ✓ | ✓ |
| Premium ID | — | — | ✓ |
| Аналитика | — | — | Персональная |

---

## Стек технологий

| Категория | Технология |
|-----------|-----------|
| Фреймворк | Expo SDK 54 / React Native 0.81.5 |
| Роутинг | expo-router ~6.0.17 (файловый, typed routes) |
| Язык | TypeScript (strict mode, 0 ошибок) |
| Хранилище | AsyncStorage — без сервера |
| Уведомления | expo-notifications ~0.29.9 |
| Монетизация | RevenueCat / react-native-purchases |
| UI | @expo/vector-icons Feather, expo-linear-gradient, expo-blur |
| Анимации | react-native-reanimated ~4.1.1, Animated API |
| Жесты | react-native-gesture-handler ~2.28.0 |
| Тактильная отдача | expo-haptics |
| Шрифты | Inter 400/500/600/700 (expo-google-fonts) |
| Архитектура | React Context (единый стор) |
| Компилятор | React Compiler (experimental) |
| Рендер | New Architecture (Fabric + JSI) |
| Сборка | EAS Build (dev / preview / production) |

---

## Архитектура

```
app/
  _layout.tsx              # Root: IAP init, push permission, шрифты
  index.tsx                # Guard: welcome → tabs
  (auth)/welcome.tsx       # Онбординг + выбор персонажа
  (tabs)/
    index.tsx              # Главный экран
    cabinet.tsx            # История займов
    karma.tsx              # Карма и достижения
    profile.tsx            # Профиль
  loan/
    give.tsx               # Форма «дать в долг»
    take.tsx               # Форма «занял»
    [id].tsx               # Детали займа
  premium.tsx              # IAP + выбор тарифа
  calculator.tsx           # Калькулятор → prefill в форму
  karma-history.tsx        # Лента кармы
  notifications.tsx        # Центр уведомлений
  blacklist.tsx            # Чёрный список
  friends.tsx              # Социальный граф
  report.tsx               # Финансовый отчёт
  agreement.tsx            # Пользовательское соглашение
  faq.tsx / settings.tsx   # FAQ, настройки

components/
  LoanCard.tsx             # Карточка займа с прогресс-баром
  CharacterBubble.tsx      # Пузырь персонажа

context/AppContext.tsx     # Единый стор: User, Loan, Karma, Notifications
constants/characters.ts    # 8 персонажей × 7 советов
constants/colors.ts        # Design tokens (light + dark)
services/iap.ts            # RevenueCat абстракция
utils/notifications.ts     # Планировщик push-уведомлений
```

---

## Ключевые технические решения

**Строгая типизация иконок**
```typescript
export type FeatherIconName = React.ComponentProps<typeof Feather>["name"];
// Исключает опечатки в названиях иконок на этапе компиляции
```

**Push-уведомления с хранением ID**
```typescript
interface Loan {
  notificationId?: string; // ID запланированного push
}

// При создании займа:
const notifId = await scheduleLoanReminder(id, contact, amount, dueDate);
if (notifId) newLoan.notificationId = notifId;

// При возврате:
await cancelNotification(loan.notificationId);
```

**RevenueCat абстракция (test mode → production за 1 шаг)**
```typescript
// services/iap.ts — раскомментировать блоки TODO после настройки аккаунта
export async function purchasePremium(tier: 1 | 2): Promise<PurchaseResult>
export async function restorePurchases(): Promise<RestoreResult>
export async function syncPremiumStatus(): Promise<PremiumTier>
```

**Автоматическая обработка просрочек при загрузке**
```typescript
// Один раз в сутки (overdueCheckedDate)
// → помечает займы overdue
// → начисляет −5 кармы за каждый просроченный
// → создаёт уведомления в центре
// → уважает флаг autoWriteOff (автосписание)
```

**Design tokens с авто dark mode**
```typescript
// constants/colors.ts: light + dark палитры
// hooks/useColors.ts: useColorScheme() → автопереключение
const colors = useColors(); // { background, foreground, primary, ... }
```

---

## Запуск

```bash
# Установка зависимостей
npm install

# Запуск в Expo Go
npx expo start

# iOS симулятор
npx expo run:ios

# Android
npx expo run:android

# TypeScript проверка
npm run typecheck
```

### EAS Build

```bash
# Preview (internal distribution)
npm run build:preview

# Production
npm run build:production

# Публикация в App Store / Google Play
npm run submit:ios
npm run submit:android
```

---

## Настройка монетизации (RevenueCat)

1. Зарегистрироваться на [app.revenuecat.com](https://app.revenuecat.com)
2. Создать продукты в App Store Connect и Google Play Console:
   - `com.zaymy.app.standard.monthly` — 299 ₽/мес
   - `com.zaymy.app.premium.monthly` — 599 ₽/мес
3. Вставить ключи в `services/iap.ts`:
   ```typescript
   const REVENUECAT_API_KEY_IOS = "appl_...";
   const REVENUECAT_API_KEY_ANDROID = "goog_...";
   ```
4. Раскомментировать блоки `TODO` в `services/iap.ts`
5. `npx expo install react-native-purchases`

---

## Масштаб проекта

- **26 экранов** (`.tsx`)
- **8 персонажей × 7 контекстов = 56 уникальных советов**
- **3 тарифа** с реальной IAP-интеграцией
- **TypeScript strict, 0 ошибок**
- **iOS + Android + Web** из единой кодовой базы
- Полный EAS-пайплайн: dev → preview → production → submit

---

## Лицензия

MIT

---

*Разработано с использованием Expo + React Native. Дизайн и персонажи — оригинальные.*
