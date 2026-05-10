import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const SECTIONS = [
  {
    title: "1. Общие положения",
    body: `Настоящее Пользовательское соглашение регулирует отношения между ООО «Займи» (далее — «Компания») и пользователем мобильного приложения «Дай в долг» (далее — «Пользователь»).

Использование приложения означает полное и безоговорочное принятие условий настоящего Соглашения. Если вы не согласны с условиями, прекратите использование приложения.`,
  },
  {
    title: "2. Описание сервиса",
    body: `Приложение «Дай в долг» предоставляет инструменты для:
• Учёта займов между физическими лицами
• Отслеживания сроков и сумм возврата
• Управления репутацией (система кармы)
• Напоминаний о задолженностях

Приложение не является финансовой организацией, не осуществляет банковскую деятельность и не является посредником в финансовых операциях между пользователями.`,
  },
  {
    title: "3. Регистрация и аккаунт",
    body: `Пользователь вправе использовать приложение без регистрации на внешних серверах. Все данные хранятся локально на устройстве пользователя.

Пользователь несёт ответственность за сохранность своих данных. Компания не несёт ответственности за потерю данных при удалении приложения или сбросе устройства.`,
  },
  {
    title: "4. Персональные данные",
    body: `Приложение хранит следующие данные исключительно на устройстве пользователя:
• Имя и номер телефона
• Информация о займах и контактах
• История кармы и уведомлений

Данные не передаются на серверы компании без явного согласия пользователя. Для функций обмена данными (приглашение друзей) используются стандартные системные механизмы ОС.`,
  },
  {
    title: "5. Premium-подписка",
    body: `Приложение предлагает платные тарифы (Стандарт, Премиум), расширяющие функциональность. Оплата производится через App Store (iOS) или Google Play (Android) согласно их условиям.

Возврат средств осуществляется в соответствии с политикой возврата App Store / Google Play. Компания не обрабатывает платёжные данные напрямую.

Подписка возобновляется автоматически, если не отменена за 24 часа до окончания периода.`,
  },
  {
    title: "6. Ограничение ответственности",
    body: `Компания не несёт ответственности:
• За реальные финансовые потери, возникшие в результате займов между пользователями
• За достоверность информации, введённой пользователями
• За действия третьих лиц
• За убытки при потере данных устройства

Приложение является инструментом учёта. Юридическую силу имеют только документы, оформленные в соответствии с законодательством РФ.`,
  },
  {
    title: "7. Запрещённые действия",
    body: `Запрещается:
• Использовать приложение для мошенничества или введения в заблуждение
• Вносить заведомо ложные данные о займах
• Использовать данные других пользователей без их согласия
• Нарушать действующее законодательство РФ при использовании приложения`,
  },
  {
    title: "8. Изменение условий",
    body: `Компания вправе изменять условия настоящего Соглашения. Актуальная версия всегда доступна в разделе «Настройки → Пользовательское соглашение».

Продолжение использования приложения после публикации изменений означает согласие с новыми условиями.`,
  },
  {
    title: "9. Контакты",
    body: `По всем вопросам обращайтесь:
Email: support@zaymy.app
Время ответа: 1–3 рабочих дня

Версия соглашения: 1.0
Дата последнего обновления: 1 января 2026 г.`,
  },
];

export default function AgreementScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Пользовательское соглашение
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
          <Feather name="shield" size={18} color={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.foreground }]}>
            Ваши данные хранятся локально на устройстве и не передаются третьим лицам.
          </Text>
        </View>

        {SECTIONS.map((section, i) => (
          <View
            key={i}
            style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Pressable
              style={styles.sectionHeader}
              onPress={() => setExpanded(expanded === i ? null : i)}
            >
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                {section.title}
              </Text>
              <Feather
                name={expanded === i ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.mutedForeground}
              />
            </Pressable>
            {expanded === i && (
              <Text style={[styles.sectionBody, { color: colors.mutedForeground }]}>
                {section.body}
              </Text>
            )}
          </View>
        ))}

        <Text style={[styles.version, { color: colors.mutedForeground }]}>
          Версия 1.0 · Обновлено 1 января 2026 г.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  topBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  version: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
  },
});
