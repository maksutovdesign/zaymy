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

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  title: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
  items: FaqItem[];
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: "Как работает карма",
    icon: "star",
    color: "#F5C518",
    items: [
      { q: "Как заработать карму?", a: "Дал займ — +40 очков. Вернул вовремя — +10. Вернул досрочно — +20. Привёл друга — +30." },
      { q: "Можно ли потерять карму?", a: "Да. Каждый день просрочки — минус 5 очков. Следи за сроками!" },
      { q: "На что влияет уровень кармы?", a: "Карма определяет твоё звание: Новичок → Надёжный → Доверенный → Уважаемый → Авторитетный → Великий уровнитель. Каждый уровень открывает новые возможности." },
    ],
  },
  {
    title: "Статусы и звания",
    icon: "award",
    color: "#8B5CF6",
    items: [
      { q: "Как получить статус «Всегда вовремя»?", a: "Нужно иметь хотя бы один возвращённый займ и ни одного просроченного." },
      { q: "Как получить статус «Всегда на связи»?", a: "Набери 200 и более очков кармы." },
      { q: "Как получить статус «Лучший друг»?", a: "Пригласи 3 и более друзей в приложение." },
      { q: "Как получить статус «Семейный»?", a: "Выдай 3 и более займа и набери от 500 очков кармы." },
      { q: "Как получить статус «Инвестор»?", a: "Суммарно выдай займов на сумму от 50 000 ₽." },
      { q: "Как получить статус «Premium»?", a: "Оформи Premium-подписку любого уровня." },
    ],
  },
  {
    title: "Займы",
    icon: "dollar-sign",
    color: "#10B981",
    items: [
      { q: "Как записать займ?", a: "На главном экране нажми «Дать в долг» или «Взять в долг», заполни форму — кому, сумму, срок, процент и счёт." },
      { q: "Что такое коэффициент возврата?", a: "Это отношение возвращённой суммы к занятой. 100% — ты всё вернул. Отображается на странице Профиля." },
      { q: "Как отметить займ возвращённым?", a: "Зайди в карточку займа и нажми «Отметить как возвращённый»." },
      { q: "Можно ли добавить заметку к займу?", a: "Да. В карточке займа есть поле для заметки — напиши что угодно." },
      { q: "Что будет при просрочке?", a: "Каждый день после срока возврата карма снижается на 5 очков. Лучше договориться заранее." },
    ],
  },
  {
    title: "Советники",
    icon: "users",
    color: "#EC4899",
    items: [
      { q: "Кто такие советники?", a: "8 уникальных персонажей-крысят, которые сопровождают тебя советами. У каждого свой характер, история и семья." },
      { q: "Как поменять советника?", a: "Зайди в Настройки → Советник или повторно пройди онбординг." },
      { q: "Кто с кем связан?", a: "Щавель и Топа — родители Градуса. Зюйд и Лейла — родители Луча. Градус дружит с Фофаном. Бисер — подруга Луча." },
    ],
  },
  {
    title: "Premium",
    icon: "zap",
    color: "#3B82F6",
    items: [
      { q: "Что даёт тариф Стандарт?", a: "Безлимит активных займов, полная история, экспорт в PDF, подробная статистика, напоминания должникам, безлимит чёрного списка. 299 ₽/мес." },
      { q: "Что даёт тариф Премиум?", a: "Всё из Стандарта + Premium ID badge, эксклюзивные звания, приоритетная поддержка, ранний доступ к фичам, безлимит друзей, персональная аналитика. 599 ₽/мес." },
      { q: "Базовый тариф бесплатный?", a: "Да, навсегда. Ограничение — до 5 активных займов и история за 30 дней." },
    ],
  },
];

function FaqSection({ section }: { section: FaqSection }) {
  const colors = useColors();
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: section.color + "20" }]}>
          <Feather name={section.icon} size={18} color={section.color} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
      </View>
      {section.items.map((item, i) => (
        <View key={i}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.item} onPress={() => toggle(i)}>
            <Text style={[styles.question, { color: colors.foreground }]}>{item.q}</Text>
            <Feather
              name={openItems.has(i) ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.mutedForeground}
            />
          </Pressable>
          {openItems.has(i) && (
            <Text style={[styles.answer, { color: colors.mutedForeground }]}>{item.a}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

export default function FaqScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>FAQ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Ответы на частые вопросы
        </Text>
        {FAQ_SECTIONS.map((s) => (
          <FaqSection key={s.title} section={s} />
        ))}
        <View style={[styles.supportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="mail" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.supportTitle, { color: colors.foreground }]}>Не нашёл ответ?</Text>
            <Text style={[styles.supportSub, { color: colors.mutedForeground }]}>support@zaymy.app</Text>
          </View>
        </View>
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
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  answer: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  supportSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
