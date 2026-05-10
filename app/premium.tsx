import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { purchasePremium, restorePurchases } from "@/services/iap";

interface Tier {
  id: 0 | 1 | 2;
  name: string;
  price: string;
  period: string;
  color: string;
  badge?: string;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: 0,
    name: "Базовый",
    price: "Бесплатно",
    period: "навсегда",
    color: "#9CA3AF",
    features: [
      "До 5 активных займов",
      "Базовая система кармы",
      "8 персонажей-советников",
      "История за 30 дней",
    ],
  },
  {
    id: 1,
    name: "Стандарт",
    price: "299 ₽",
    period: "в месяц",
    color: "#3B82F6",
    badge: "Популярный",
    features: [
      "Безлимит активных займов",
      "Полная история займов",
      "Экспорт данных в PDF",
      "Подробная статистика",
      "Напоминания должникам",
      "Чёрный список (безлимит)",
    ],
  },
  {
    id: 2,
    name: "Премиум",
    price: "599 ₽",
    period: "в месяц",
    color: "#F5C518",
    badge: "Максимум",
    features: [
      "Всё из тарифа Стандарт",
      "Premium ID badge",
      "Эксклюзивные звания",
      "Приоритетная поддержка",
      "Ранний доступ к фичам",
      "Безлимит друзей",
      "Персональная аналитика",
    ],
  },
];

export default function PremiumScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, setPremiumTier } = useApp();
  const [selected, setSelected] = useState<0 | 1 | 2>(user.premiumTier);
  const [purchasing, setPurchasing] = useState(false);

  const handleSubscribe = async () => {
    if (selected === 0) {
      if (user.premiumTier > 0) {
        Alert.alert(
          "Отменить подписку?",
          "Перейти на базовый (бесплатный) тариф? Вы потеряете доступ к Premium-функциям.\n\nОтмена управляется через настройки App Store / Google Play.",
          [
            { text: "Нет, оставить", style: "cancel" },
            {
              text: "Перейти на базовый",
              style: "destructive",
              onPress: async () => {
                await setPremiumTier(0);
                Alert.alert("Готово", "Вы перешли на базовый тариф.");
              },
            },
          ]
        );
      } else {
        Alert.alert("Базовый тариф", "Вы уже используете базовый тариф.");
      }
      return;
    }

    if (selected === user.premiumTier) {
      Alert.alert(
        "Активный тариф",
        `Тариф «${TIERS[selected].name}» уже активирован.`
      );
      return;
    }

    if (purchasing) return;
    setPurchasing(true);

    try {
      const result = await purchasePremium(selected as 1 | 2);

      if (result.success) {
        await setPremiumTier(result.tier);
        if (Platform.OS !== "web")
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Готово! 🎉",
          `Тариф «${TIERS[result.tier].name}» активирован`,
          [{ text: "Отлично!", onPress: () => router.back() }]
        );
      } else if (!result.cancelled) {
        Alert.alert("Ошибка покупки", result.error);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const result = await restorePurchases();
      if (result.success) {
        await setPremiumTier(result.tier);
        if (result.tier > 0) {
          Alert.alert(
            "Покупки восстановлены",
            `Тариф «${TIERS[result.tier].name}» восстановлен.`
          );
        } else {
          Alert.alert("Нет активных покупок", "Активных подписок не найдено.");
        }
      } else {
        Alert.alert("Ошибка", result.error);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const tier = TIERS[selected];

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
          Premium
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Выбери свой тариф
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Больше возможностей — больше доверия
          </Text>
        </View>

        {TIERS.map((t) => {
          const isActive = selected === t.id;
          const isCurrent = user.premiumTier === t.id;
          return (
            <Pressable
              key={t.id}
              style={[
                styles.tierCard,
                {
                  backgroundColor: isActive ? t.color + "12" : colors.card,
                  borderColor: isActive ? t.color : colors.border,
                  borderWidth: isActive ? 2 : 1,
                },
              ]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                setSelected(t.id);
              }}
            >
              <View style={styles.tierTop}>
                <View style={styles.tierNameRow}>
                  <View
                    style={[
                      styles.tierDot,
                      { backgroundColor: t.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.tierName,
                      { color: isActive ? t.color : colors.foreground },
                    ]}
                  >
                    {t.name}
                  </Text>
                  {t.badge && (
                    <View
                      style={[
                        styles.badgeChip,
                        { backgroundColor: t.color + "25", borderColor: t.color + "60" },
                      ]}
                    >
                      <Text style={[styles.badgeChipText, { color: t.color }]}>
                        {t.badge}
                      </Text>
                    </View>
                  )}
                  {isCurrent && (
                    <View
                      style={[
                        styles.currentChip,
                        { backgroundColor: colors.success + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.currentChipText,
                          { color: colors.success },
                        ]}
                      >
                        Текущий
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.priceRow}>
                  <Text
                    style={[
                      styles.price,
                      { color: isActive ? t.color : colors.foreground },
                    ]}
                  >
                    {t.price}
                  </Text>
                  <Text
                    style={[styles.period, { color: colors.mutedForeground }]}
                  >
                    {" "}{t.period}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.featuresList,
                  { borderTopColor: isActive ? t.color + "30" : colors.border },
                ]}
              >
                {t.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Feather
                      name="check"
                      size={14}
                      color={isActive ? t.color : colors.success}
                    />
                    <Text
                      style={[
                        styles.featureText,
                        { color: colors.foreground },
                      ]}
                    >
                      {f}
                    </Text>
                  </View>
                ))}
              </View>

              {isActive && (
                <View
                  style={[
                    styles.selectIndicator,
                    { backgroundColor: t.color },
                  ]}
                >
                  <Text style={styles.selectIndicatorText}>✓ Выбран</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 16,
          },
        ]}
      >
        <Pressable
          style={[
            styles.subscribeBtn,
            {
              backgroundColor: purchasing
                ? colors.muted
                : selected === 0
                ? colors.muted
                : TIERS[selected].color,
              opacity: purchasing ? 0.7 : 1,
            },
          ]}
          onPress={handleSubscribe}
          disabled={purchasing}
        >
          <Text
            style={[
              styles.subscribeBtnText,
              {
                color:
                  selected === 0
                    ? colors.mutedForeground
                    : selected === 2
                    ? colors.primaryForeground
                    : "#FFF",
              },
            ]}
          >
            {purchasing
              ? "Подождите..."
              : selected === 0
              ? "Текущий тариф"
              : user.premiumTier === selected
              ? "Уже подключён"
              : `Подключить ${tier.name}`}
          </Text>
        </Pressable>
        <Pressable
          style={styles.restoreBtn}
          onPress={handleRestore}
          disabled={purchasing}
        >
          <Text style={[styles.restoreBtnText, { color: colors.mutedForeground }]}>
            Восстановить покупки
          </Text>
        </Pressable>
        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          Оплата списывается через App Store / Google Play при подтверждении. Подписка продлевается автоматически. Управление и отмена — в настройках магазина. Цены указаны в рублях, включая НДС.
        </Text>
      </View>
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
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 14 },
  hero: { alignItems: "center", gap: 6, paddingVertical: 8 },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  tierCard: { borderRadius: 20, overflow: "hidden" },
  tierTop: { padding: 18, gap: 8 },
  tierNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  tierDot: { width: 10, height: 10, borderRadius: 5 },
  tierName: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  badgeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeChipText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  currentChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  currentChipText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  priceRow: { flexDirection: "row", alignItems: "baseline" },
  price: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  period: { fontSize: 14, fontFamily: "Inter_400Regular" },
  featuresList: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  selectIndicator: {
    paddingVertical: 10,
    alignItems: "center",
  },
  selectIndicatorText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  subscribeBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeBtnText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  restoreBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  restoreBtnText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "underline",
  },
  disclaimer: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
