import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CharacterBubble } from "@/components/CharacterBubble";
import { LoanCard } from "@/components/LoanCard";
import { getRandomCharacter } from "@/constants/characters";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatAmount(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, loans, notifications, getOwedToMe, getMyDebts } = useApp();
  const [showTip, setShowTip] = useState(true);
  const [character] = useState(() => getRandomCharacter());

  const giveScale = useRef(new Animated.Value(1)).current;
  const takeScale = useRef(new Animated.Value(1)).current;

  const activeLoans = useMemo(
    () => loans.filter((l) => l.status === "active").slice(0, 3),
    [loans]
  );

  const owedToMe = getOwedToMe();
  const myDebts = getMyDebts();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasAnyActivity = owedToMe > 0 || myDebts > 0 || activeLoans.length > 0;

  const animatePress = (anim: Animated.Value, cb: () => void) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(anim, { toValue: 0.96, useNativeDriver: Platform.OS !== "web", speed: 50 }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: Platform.OS !== "web", speed: 50 }),
    ]).start(cb);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Привет, {user.name.split(" ")[0] || "друг"} 👋
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Дай в долг
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/notifications")}
          style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="bell" size={20} color={colors.foreground} />
          {unreadCount > 0 && (
            <View style={[styles.notifBadge, { backgroundColor: colors.destructive }]}>
              <Text style={styles.notifBadgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Summary cards */}
      {(owedToMe > 0 || myDebts > 0) && (
        <View style={[styles.summaryRow, { gap: 10 }]}>
          {owedToMe > 0 && (
            <View style={[styles.summaryCard, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" }]}>
              <View style={styles.summaryIconRow}>
                <View style={[styles.summaryIconWrap, { backgroundColor: colors.primary + "30" }]}>
                  <Feather name="arrow-up-right" size={12} color={colors.primary} />
                </View>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Должны мне</Text>
              </View>
              <Text style={[styles.summaryAmount, { color: colors.foreground }]}>
                {formatAmount(owedToMe)}
              </Text>
            </View>
          )}
          {myDebts > 0 && (
            <View style={[styles.summaryCard, { backgroundColor: colors.destructive + "0D", borderColor: colors.destructive + "25" }]}>
              <View style={styles.summaryIconRow}>
                <View style={[styles.summaryIconWrap, { backgroundColor: colors.destructive + "20" }]}>
                  <Feather name="arrow-down-left" size={12} color={colors.destructive} />
                </View>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Мои долги</Text>
              </View>
              <Text style={[styles.summaryAmount, { color: colors.foreground }]}>
                {formatAmount(myDebts)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Character tip */}
      {showTip && (
        <CharacterBubble
          character={character}
          context="home"
          onDismiss={() => setShowTip(false)}
        />
      )}

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <Animated.View style={[{ flex: 1 }, { transform: [{ scale: giveScale }] }]}>
          <Pressable
            style={[styles.mainBtn, { backgroundColor: colors.primary }]}
            onPress={() => animatePress(giveScale, () => router.push("/loan/give"))}
          >
            <View style={[styles.mainBtnIcon, { backgroundColor: "rgba(0,0,0,0.12)" }]}>
              <Feather name="arrow-up-right" size={20} color={colors.primaryForeground} />
            </View>
            <Text style={[styles.mainBtnText, { color: colors.primaryForeground }]}>
              Дать в долг
            </Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[{ flex: 1 }, { transform: [{ scale: takeScale }] }]}>
          <Pressable
            style={[styles.mainBtn, styles.takeBtnBorder, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => animatePress(takeScale, () => router.push("/loan/take"))}
          >
            <View style={[styles.mainBtnIcon, { backgroundColor: colors.muted }]}>
              <Feather name="arrow-down-left" size={20} color={colors.foreground} />
            </View>
            <Text style={[styles.mainBtnText, { color: colors.foreground }]}>
              Взять в долг
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>или</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Bank offer */}
      <Pressable
        style={[styles.orgBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.selectionAsync();
          Alert.alert(
            "Финансовые организации",
            "Партнёры приложения:\n\n🏦 СберБанк — кредиты от 9.9%\n🏦 Тинькофф — до 2 000 000 ₽\n🏦 Альфа-Банк — решение за 2 мин\n🏦 ВТБ — ставка от 7.9%\n🏦 Газпромбанк — от 100 000 ₽\n\nПодайте заявку напрямую в банк.",
            [{ text: "Понятно" }]
          );
        }}
      >
        <Feather name="briefcase" size={18} color={colors.mutedForeground} />
        <Text style={[styles.orgBtnText, { color: colors.foreground }]}>
          Обратиться в финансовую организацию
        </Text>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </Pressable>

      {/* Invite */}
      <Pressable
        style={[styles.inviteBtn, { borderColor: colors.primary + "60", backgroundColor: colors.primary + "0A" }]}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.selectionAsync();
          router.push("/friends");
        }}
      >
        <Feather name="user-plus" size={16} color={colors.primary} />
        <Text style={[styles.inviteBtnText, { color: colors.primary }]}>
          Пригласить друга +30 к карме
        </Text>
      </Pressable>

      {/* Active loans or empty state */}
      {activeLoans.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Активные займы
            </Text>
            <View style={[styles.countBadge, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                {loans.filter((l) => l.status === "active").length}
              </Text>
            </View>
          </View>
          {activeLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
          {loans.filter((l) => l.status === "active").length > 3 && (
            <Pressable
              style={[styles.seeAllBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push("/(tabs)/cabinet")}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                Смотреть все займы
              </Text>
              <Feather name="arrow-right" size={14} color={colors.primary} />
            </Pressable>
          )}
        </View>
      ) : !hasAnyActivity ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="dollar-sign" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Всё чисто!
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Займов пока нет. Нажми «Дать в долг» чтобы записать первый займ.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  notifBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  summaryRow: {
    flexDirection: "row",
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  summaryIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  mainBtn: {
    height: 96,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  takeBtnBorder: {
    borderWidth: 1.5,
  },
  mainBtnIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mainBtnText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  orgBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  orgBtnText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  inviteBtnText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
