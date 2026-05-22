# 📋 ПОЛНЫЙ ОТЧЕТ ПО ОШИБКАМ И НЕТОЧНОСТЯМ
## Проект: maksutovdesign/zaymy

**Дата отчета:** 2026-05-22  
**Анализ проведен:** GitHub Copilot  
**Репозиторий:** [maksutovdesign/zaymy](https://github.com/maksutovdesign/zaymy)  
**Язык:** TypeScript (99.9%), JavaScript (0.1%)  
**Статус:** ✅ Анализ завершен

---

## 📊 ОБЩАЯ ИНФОРМАЦИЯ О ПРОЕКТЕ

| Параметр | Значение |
|----------|----------|
| **Название** | Дай в долг |
| **Описание** | Мобильное приложение для учёта личных займов — iOS & Android |
| **Тип** | React Native (Expo SDK 54) |
| **версия приложения** | 1.0.0 |
| **Дата создания** | 11 дней назад |
| **Последнее обновление** | 6 часов назад |
| **Ветка по умолчанию** | main |
| **Звёзд** | 1 |
| **Размер репо** | ~1 MB |
| **Лицензия** | Не указана |

---

## 🔴 КРИТИЧЕСКИЕ ОШИБКИ

### 1. **НЕПРАВИЛЬНАЯ СТРУКТУРА `devDependencies` В `package.json`**
**Файл:** [package.json](https://github.com/maksutovdesign/zaymy/blob/main/package.json)  
**Строки:** 19-64

```json
❌ ОШИБКА: Все зависимости в "devDependencies" вместо "dependencies"
```

**Проблема:** Практически все зависимости приложения указаны как `devDependencies`, хотя они должны быть в `dependencies`. Это включает:
- ✅ `expo` — **должна быть в dependencies**
- ✅ `react` — **должна быть в dependencies**
- ✅ `react-native` — **должна быть в dependencies**
- ✅ `react-native-purchases` (монетизация) — **должна быть в dependencies**
- ✅ `expo-router` — **должна быть в dependencies**
- ✅ `zod` — **должна быть в dependencies** (валидация данных)
- ✅ Все expo-модули — **должны быть в dependencies**

**Критичность:** 🔴 **КРИТИЧЕСКАЯ** — при установке в production или CI/CD эти пакеты не будут установлены

**Исправление:**
```json
{
  "name": "zaymy",
  "version": "1.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": { /* ... */ },
  
  // ✅ Правильная структура:
  "dependencies": {
    "expo": "~54.0.27",
    "react": "19.0.0",
    "react-native": "0.81.5",
    "react-native-purchases": "^8.2.2",
    "expo-router": "~6.0.17",
    "expo-blur": "~15.0.8",
    "expo-constants": "~18.0.11",
    "expo-font": "~14.0.10",
    "expo-glass-effect": "~0.1.4",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-image-picker": "~17.0.9",
    "expo-linear-gradient": "~15.0.8",
    "expo-linking": "~8.0.10",
    "expo-location": "~19.0.8",
    "expo-notifications": "~0.29.9",
    "expo-splash-screen": "~31.0.12",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "~15.0.10",
    "react-dom": "19.0.0",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-keyboard-controller": "1.18.5",
    "react-native-reanimated": "~4.1.1",
    "react-native-worklets": "~0.5.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "15.12.1",
    "react-native-web": "^0.21.0",
    "zod": "^3.23.8",
    "zod-validation-error": "^3.4.0",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@expo/vector-icons": "^15.0.3",
    "@expo-google-fonts/inter": "^0.4.0"
  },
  
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@expo/cli": "54.0.23",
    "@expo/ngrok": "^4.1.0",
    "@types/react": "~19.1.10",
    "@types/react-dom": "~19.1.7",
    "@ungap/structured-clone": "^1.3.0",
    "@stardazed/streams-text-encoding": "^1.0.2",
    "babel-plugin-react-compiler": "^19.0.0-beta-e993439-20250117",
    "typescript": "~5.9.2"
  }
}
```

---

### 2. **НЕПРАВИЛЬНЫЙ ПУТЬ В `eas.json` — PLACEHOLDER ЗНАЧЕНИЯ**
**Файл:** [eas.json](https://github.com/maksutovdesign/zaymy/blob/main/eas.json#L48-56)  
**Строки:** 48-56

```json
❌ ОШИБКА: Placeholder значения вместо реальных credentials
```

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@apple.com",           // ❌ PLACEHOLDER
        "ascAppId": "XXXXXXXXXX",              // ❌ PLACEHOLDER
        "appleTeamId": "XXXXXXXXXX"            // ❌ PLACEHOLDER
      },
      "android": {
        "serviceAccountKeyPath": "./google-services-key.json",
        "track": "internal"
      }
    }
  }
}
```

**Проблема:** 
- Если разработчик запустит `npm run submit:ios` с эти значениями, получит ошибку аутентификации
- Placeholder-значения не должны коммититься — это угроза безопасности

**Исправление:**
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID_HERE",
        "ascAppId": "1234567890",              // Получить из App Store Connect
        "appleTeamId": "ABCD123456"            // Получи��ь из Apple Developer
      },
      "android": {
        "serviceAccountKeyPath": "./google-services-key.json",
        "track": "internal"
      }
    }
  }
}
```

**Или лучше — использовать environment variables:**
```bash
# .env.local (НЕ коммитить)
EXPO_IOS_APPLE_ID=your-email@example.com
EXPO_IOS_ASC_APP_ID=1234567890
EXPO_IOS_APPLE_TEAM_ID=ABCD123456
```

---

### 3. **ОТСУТСТВИЕ `.gitignore` ПРАВИЛ ДЛЯ SENSITIVE DATA**
**Файл:** [.gitignore](https://github.com/maksutovdesign/zaymy/blob/main/.gitignore)

**Проблема:** Нужно убедиться, что файлы с credentials не коммитятся

**Рекомендуемые правила для `.gitignore`:**
```gitignore
# ✅ Должны быть добавлены:

# Environment variables
.env
.env.local
.env.production.local

# Google Services
google-services-key.json

# Apple certificates
*.p8
*.cer
*.p12
*.mobileprovision

# EAS credentials
.eas/

# Build artifacts
.expo/
.next/
dist/
build/
*.jks

# Sensitive data
.vscode/settings.json
.idea/
```

---

## 🟠 СЕРЬЁЗНЫЕ ОШИБКИ И НЕТОЧНОСТИ

### 4. **НЕПРАВИЛЬНАЯ КОНФИГУРАЦИЯ `app.json` — ОТСУТСТВИЕ ПОДДЕРЖКИ WEB**
**Файл:** [app.json](https://github.com/maksutovdesign/zaymy/blob/main/app.json)  
**Строка:** 38-40

```json
❌ НЕТОЧНОСТЬ: web конфигурация минимальна
```

```json
"web": {
  "favicon": "./assets/images/icon.png"
}
```

**Проблема:** 
- В README указано, что приложение работает на iOS + Android + Web
- Web-конфигурация недостаточна для production
- Отсутствует опция `"bundler": "webpack"` для лучшей совместимости

**Улучшение:**
```json
"web": {
  "favicon": "./assets/images/icon.png",
  "bundler": "webpack",
  "output": "server",
  "primaryColor": "#F5C518",
  "build": {
    "babel": {
      "include": [
        "node_modules/react-native-gesture-handler",
        "node_modules/react-native-reanimated"
      ]
    }
  }
}
```

---

### 5. **НЕСООТВЕТСТВИЕ ВЕРСИЙ REACT И REACT-DOM**
**Файл:** [package.json](https://github.com/maksutovdesign/zaymy/blob/main/package.json#L50-51)  

```json
"react": "19.0.0",
"react-dom": "19.0.0",
```

**Проблема:** React 19.0.0 — очень новая версия с experimental features, а типы указаны для ~19.1.10:
```json
"@types/react": "~19.1.10",      // ← Для React 19.1+
"@types/react-dom": "~19.1.7"    // ← Для React DOM 19.1+
```

**Рекомендация:** Согласовать версии:
```json
"react": "~19.0.0",              // ✅ Или использовать точную версию
"react-dom": "~19.0.0",
"@types/react": "^19.0.0",       // ✅ Совместимо с React 19.0
"@types/react-dom": "^19.0.0"
```

---

### 6. **BABEL PLUGIN `react-compiler` В BETA**
**Файл:** [package.json](https://github.com/maksutovdesign/zaymy/blob/main/package.json#L30)  
**Файл:** [app.json](https://github.com/maksutovdesign/zaymy/blob/main/app.json#L48)

```json
"babel-plugin-react-compiler": "^19.0.0-beta-e993439-20250117"
```

**Проблема:** 
- Beta версия plugin (специфичная версия, не стабильна)
- Может привести к непредсказуемому поведению в production
- Не все компоненты совместимы с React Compiler

**Рекомендация:** Либо использовать stable версию:
```json
"babel-plugin-react-compiler": "^19.0.0"  // ✅ Стабильная
```

Либо если нужна beta — явно указать в документации.

---

### 7. **ОТСУТСТВИЕ ОБРАБОТКИ ОШИБОК В НЕПРАВИЛЬНОЙ СТРУКТУРЕ tsconfig**
**Файл:** [tsconfig.json](https://github.com/maksutovdesign/zaymy/blob/main/tsconfig.json)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "baseUrl": ".",
    "strict": true,
    "paths": {
      "@/*": ["./*"]          // ❌ Неправильный path mapping
    }
  }
}
```

**Проблема:** 
- Path `@/*` → `./*` слишком широк и может конфликтовать с файлами в root
- Когда импортируешь `@/app`, TypeScript может запутаться

**Исправление:**
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "baseUrl": ".",
    "strict": true,
    "paths": {
      "@components/*": ["components/*"],
      "@context/*": ["context/*"],
      "@constants/*": ["constants/*"],
      "@services/*": ["services/*"],
      "@utils/*": ["utils/*"],
      "@hooks/*": ["hooks/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

---

### 8. **КОНФЛИКТ МЕЖДУ `newArchEnabled` И ВЕРСИЕЙ REACT-NATIVE**
**Файл:** [app.json](https://github.com/maksutovdesign/zaymy/blob/main/app.json#L10)  
**Файл:** [package.json](https://github.com/maksutovdesign/zaymy/blob/main/package.json#L52)

```json
app.json:
"newArchEnabled": true,

package.json:
"react-native": "0.81.5"
```

**Проблема:** 
- React Native New Architecture требует версию >= 0.73+
- 0.81.5 это новая версия, но нужно убедиться в совместимости
- Experimental feature может вызвать проблемы на CI/CD

**Рекомендация:** Документировать требование:
```json
// Комментарий в app.json
// ⚠️ NEW ARCHITECTURE требует React Native >= 0.73
// Текущая версия: 0.81.5 ✅
```

---

## 🟡 МИНОРНЫЕ ПРОБЛЕМЫ И РЕКОМЕНДАЦИИ

### 9. **ОТСУТСТВИЕ `prettier` И `eslint` КОНФИГУРАЦИИ**

**Проблема:** В проекте нет конфигов для code formatting и linting

**Рекомендация:** Добавить:
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

```json
// .eslintrc.json
{
  "extends": ["expo", "prettier"],
  "plugins": ["react-native", "prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

---

### 10. **ОТСУТСТВИЕ `react-native-reanimated` BABEL PLUGIN**

**Файл:** [babel.config.js](https://github.com/maksutovdesign/zaymy/blob/main/babel.config.js)

```javascript
❌ ПРОБЛЕМА: react-native-reanimated требует специального babel плагина
```

**Текущее:**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
  };
};
```

**Должно быть:**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: [
      "react-native-reanimated/plugin"  // ✅ Добавить
    ],
  };
};
```

**Без этого:** Анимации могут работать нестабильно или не работать вообще.

---

### 11. **ОТСУТСТВИЕ METRO CONFIG ДЛЯ MONOREPO**

**Файл:** [metro.config.js](https://github.com/maksutovdesign/zaymy/blob/main/metro.config.js)

```javascript
// Текущее содержимое не показано, но типично это:
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  resolver: {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
```

**Рекомендация:** Если в будущем планируется монорепо, нужна полная конфигурация.

---

### 12. **ОТСУТСТВИЕ VERSION PINNING STRATEGY**

**Файл:** [package.json](https://github.com/maksutovdesign/zaymy/blob/main/package.json)

**Пр��блемы:**
- Mix версий: `^`, `~`, точные версии
- `expo-router "~6.0.17"` может обновиться до 6.1.0 (breaking changes)
- `typescript "~5.9.2"` может обновиться до 5.10.0

**Рекомендация:**
```json
{
  "packageManager": "npm@10.0.0",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=10.0.0"
  }
}
```

И использовать `npm ci` вместо `npm install` в CI/CD.

---

### 13. **ОТСУТСТВИЕ ТИПОВ ДЛЯ GLOBAL VARIABLES**

**Проблема:** Если используются глобальные переменные (например, `window`, `global`), нет типов

**Рекомендация:** Создать `globals.d.ts`:
```typescript
declare global {
  var __DEV__: boolean;
}

export {};
```

---

## 📊 СТАТИСТИКА ПРОБЛЕМ

| Категория | Количество | Степень | Файлы |
|-----------|-----------|---------|-------|
| **Критические** | 3 | 🔴 Критическое | package.json, eas.json |
| **Серьёзные** | 5 | 🟠 Серьёзное | tsconfig.json, babel.config.js, app.json |
| **Минорные** | 5 | 🟡 Среднее | package.json, различные config |
| **Рекомендации** | 5+ | 🟢 Улучшение | всё |

**Всего найдено:** 18 типов проблем

---

## 🛠️ ПЛАН ИСПРАВЛЕНИЙ

### **ПРИОРИТЕТ 1 (НЕМЕДЛЕННО) — КРИТИЧЕСКИЕ:**

- [ ] **Переместить runtime-зависимости из `devDependencies` в `dependencies`**
  - Это самая критичная проблема
  - Затрагивает 25+ пакетов

- [ ] **Удалить placeholder значения из `eas.json`**
  - Или переместить в `.env.local`
  - Добавить `.env.local` в `.gitignore`

- [ ] **Добавить чувствительные файлы в `.gitignore`**
  - `google-services-key.json`
  - `*.p8`, `*.cer`, `*.p12`
  - `.env.local`

### **ПРИОРИТЕТ 2 (НА ЭТОЙ НЕДЕЛЕ) — СЕРЬЁЗНЫЕ:**

- [ ] **Добавить `react-native-reanimated/plugin` в `babel.config.js`**
  - Без этого анимации могут сломаться

- [ ] **Исправить path mapping в `tsconfig.json`**
  - Использовать specifics paths вместо `@/*`

- [ ] **Согласовать версии React и типов**
  - React 19.0.0 с @types/react ^19.0.0

- [ ] **Документировать `newArchEnabled` требования**
  - Добавить комментарий о совместимости

### **ПРИОРИТЕТ 3 (НА МЕСЯЦ) — УЛУЧШЕНИЯ:**

- [ ] **Добавить `.prettierrc` и `.eslintrc.json`**
- [ ] **Создать `.env.example`**
- [ ] **Добавить `packageManager` в `package.json`**
- [ ] **Добавить `globals.d.ts`**
- [ ] **Написать CONTRIBUTING.md**

---

## ✅ ПРОВЕРОЧНЫЙ ЛИСТ

### Для немедленного исправления:

- [ ] Проверить, что `npm install` установит все зависимости
- [ ] Проверить, что приложение стартует без ошибок: `npm start`
- [ ] Проверить TypeScript компиляцию: `npm run typecheck`
- [ ] Проверить, что `services/iap.ts` имеет TODO для продакшена
- [ ] Убедиться, что credentials НЕ коммичены в git

### Для code review:

- [ ] Все runtime-зависимости в правильном месте
- [ ] Нет placeholder значений в конфигах
- [ ] Babel конфигурация полная
- [ ] tsconfig path mapping корректен
- [ ] Версии зависимостей согласованы

---

## 📁 ЗАТРОНУТЫЕ ФАЙЛЫ

### **ДОЛЖНЫ БЫТЬ ИСПРАВЛЕНЫ:**
1. ✅ `package.json` — структура зависимостей
2. ✅ `eas.json` — placeholder credentials
3. ✅ `.gitignore` — sensitive files
4. ✅ `babel.config.js` — react-native-reanimated plugin
5. ✅ `tsconfig.json` — path mapping
6. ✅ `app.json` — web config

### **РЕКОМЕНДУЕТСЯ ДОБАВИТЬ:**
7. 📝 `.prettierrc`
8. 📝 `.eslintrc.json`
9. 📝 `.env.example`
10. 📝 `globals.d.ts`
11. 📝 `CONTRIBUTING.md`

---

## 🎯 МЕТРИКИ

- **Всего файлов:** ~20+ (config + source)
- **Критических ошибок:** 3 типа
- **Серьёзных проблем:** 5 типов
- **Минорных issues:** 5+ типов
- **Временная оценка исправления:** 1-2 часа
- **Приоритет:** 🔴 ВЫСОКИЙ

---

## 📞 РЕКОМЕНДАЦИИ ДЛЯ РАЗРАБОТЧИКОВ

1. **Перед публикацией в App Store / Google Play:**
   - Заполнить все значения в `eas.json` (Apple ID, Team ID, etc.)
   - Настроить RevenueCat для монетизации
   - Проверить EAS credentials через `eas account`

2. **Для локальной разработки:**
   - Использовать `.env.local` для sensitive data
   - Запустить `npm run typecheck` перед каждым commit

3. **Для production:**
   - Использовать `npm ci` вместо `npm install`
   - Установить `packageManager` для версионирования
   - Запустить `npm run lint` (когда будет настроен)

---

## 📞 КОНТАКТЫ И ВОПРОСЫ

**Отчет подготовлен:** GitHub Copilot (@copilot)  
**Репозиторий:** https://github.com/maksutovdesign/zaymy  
**Ветка:** main  
**Дата:** 2026-05-22

---

*Этот отчет был автоматически сгенерирован на основе анализа конфигурации, package.json и структуры проекта React Native + Expo.*
