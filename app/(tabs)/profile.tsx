import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useEffect } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CharacterBubble } from "@/components/CharacterBubble";
import { getCharacterById } from "@/constants/characters";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatAmount(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

const ALL_BADGES = [
  { id: "ontime", label: "Всегда вовремя", icon: "check-circle" as const, color: "#22C55E" },
  { id: "bestfriend", label: "Лучший друг", icon: "heart" as const, color: "#EC4899" },
  { id: "connected", label: "Всегда на связи", icon: "phone" as const, color: "#3B82F6" },
  { id: "family", label: "Семейный", icon: "home" as const, color: "#F59E0B" },
  { id: "investor", label: "Инвестор", icon: "trending-up" as const, color: "#8B5CF6" },
  { id: "premium", label: "Premium", icon: "star" as const, color: "#F5C518" },
];

function getKarmaTitle(karma: number): string {
  if (karma >= 15001) return "Великий уровнитель";
  if (karma >= 5001) return "Авторитетный";
  if (karma >= 1501) return "Уважаемый";
  if (karma >= 501) return "Доверенный";
  if (karma >= 101) return "Надёжный";
  return "Новичок";
}

function getKarmaColor(karma: number): string {
  if (karma >= 15001) return "#F5C518";
  if (karma >= 5001) return "#8B5CF6";
  if (karma >= 1501) return "#F59E0B";
  if (karma >= 501) return "#34D399";
  if (karma >= 101) return "#60A5FA";
  return "#9CA3AF";
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, loans } = useApp();

  const returnRate =
    user.totalTaken > 0
      ? Math.round((user.totalReturned / user.totalTaken) * 100)
      : 100;

  const totalGiven = loans
    .filter((l) => l.type === "given")
    .reduce((s, l) => s + l.amount, 0);

  const karmaColor = getKarmaColor(user.karma);
  const karmaTitle = getKarmaTitle(user.karma);

  const totalLoansGiven = loans.filter((l) => l.type === "given").length;
  const overdueLoans = loans.filter((l) => l.status === "overdue");

  const earnedBadges = ALL_BADGES.filter((b) => {
    if (b.id === "ontime") return user.totalReturned > 0 && overdueLoans.length === 0;
    if (b.id === "bestfriend") return user.friendsCount >= 3;
    if (b.id === "connected") return user.karma >= 200;
    if (b.id === "family") return totalLoansGiven >= 3 && user.karma >= 500;
    if (b.id === "investor") return totalGiven >= 50000;
    if (b.id === "premium") return user.isPremium;
    return false;
  });

  const selectedChar = getCharacterById(user.selectedCharacterId ?? "lucha");
  const gradus = getCharacterById("gradus")!;
  const avatarScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(avatarScale, {
      toValue: 1,
      tension: 80,
      friction: 6,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, []);

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

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
      <View style={styles.topRow}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>
          Профиль
        </Text>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              router.push("/friends");
            }}
          >
            <Feather name="users" size={22} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              router.push("/settings");
            }}
          >
            <Feather name="settings" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Animated.View
          style={[styles.avatarWrap, { transform: [{ scale: avatarScale }] }]}
        >
          <View style={[styles.avatar, { backgroundColor: karmaColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {user.isPremium && (
            <View style={[styles.premiumBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.premiumBadgeText}>PR</Text>
            </View>
          )}
        </Animated.View>

        <Text style={[styles.userName, { color: colors.foreground }]}>
          {user.name || "Пользователь"}
        </Text>

        <Pressable style={[styles.premiumBtn, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "60" }]}>
          <Feather name="star" size={14} color={colors.primary} />
          <Text style={[styles.premiumBtnText, { color: colors.primary }]}>
            Premium ID
          </Text>
        </Pressable>

        <View style={styles.friendsRow}>
          <View style={styles.friendsDot} />
          <Text style={[styles.friendsText, { color: colors.mutedForeground }]}>
            {user.friendsCount} друзей
          </Text>
          {user.isPrivate && (
            <View style={[styles.privateBadge, { backgroundColor: colors.muted }]}>
              <Feather name="eye-off" size={10} color={colors.mutedForeground} />
              <Text style={[styles.privateText, { color: colors.mutedForeground }]}>
                Приватный
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statItem, { backgroundColor: karmaColor + "15", borderColor: karmaColor + "30" }]}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Карма</Text>
          <Text style={[styles.statVal, { color: karmaColor }]}>
            {user.karma.toLocaleString("ru-RU")}
          </Text>
          <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>очков</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Дал в долг</Text>
          <Text style={[styles.statVal, { color: colors.foreground }]}>
            {formatAmount(totalGiven)}
          </Text>
        </View>
      </View>

      <View style={[styles.returnCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.returnRow}>
          <View>
            <Text style={[styles.returnLabel, { color: colors.mutedForeground }]}>
              Занял / Вернул
            </Text>
            <Text style={[styles.returnValue, { color: colors.foreground }]}>
              {formatAmount(user.totalTaken)} / {formatAmount(user.totalReturned)}
            </Text>
          </View>
        </View>
        <View style={styles.returnRow}>
          <View>
            <Text style={[styles.returnLabel, { color: colors.mutedForeground }]}>
              Коэффициент возврата
            </Text>
            <Text style={[styles.returnPct, { color: colors.success }]}>
              {returnRate}%
            </Text>
          </View>
          {returnRate === 100 ? (
            <View style={[styles.noDebtBadge, { backgroundColor: colors.success + "20", borderColor: colors.success + "40" }]}>
              <Text style={[styles.noDebtText, { color: colors.success }]}>
                Долгов нет
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.titleCard, { backgroundColor: karmaColor + "15", borderColor: karmaColor + "40" }]}>
        <Text style={[styles.titleLabel, { color: colors.mutedForeground }]}>Звание</Text>
        <Text style={[styles.titleValue, { color: karmaColor }]}>{karmaTitle}</Text>
      </View>

      {/* Character advisor card */}
      {selectedChar && (
        <Pressable
          style={[
            styles.advisorCard,
            { backgroundColor: selectedChar.color + "12", borderColor: selectedChar.color + "35" },
          ]}
          onPress={() => router.push(`/character/${selectedChar.id}` as any)}
        >
          <View style={[styles.advisorAvatar, { backgroundColor: selectedChar.color }]}>
            <Text style={styles.advisorInitial}>{selectedChar.initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.advisorLabel, { color: colors.mutedForeground }]}>
              Мой советник
            </Text>
            <Text style={[styles.advisorName, { color: selectedChar.color }]}>
              {selectedChar.name}
            </Text>
            <Text style={[styles.advisorRole, { color: colors.mutedForeground }]} numberOfLines={1}>
              {selectedChar.role}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={selectedChar.color} />
        </Pressable>
      )}

      {/* Quick links */}
      <View style={styles.linksGrid}>
        {[
          { icon: "bar-chart-2" as const, label: "Отчёт", route: "/report" },
          { icon: "zap" as const, label: "Premium", route: "/premium" },
          { icon: "hash" as const, label: "Калькулятор", route: "/calculator" },
          { icon: "help-circle" as const, label: "FAQ", route: "/faq" },
          { icon: "settings" as const, label: "Настройки", route: "/settings" },
        ].map((item) => (
          <Pressable
            key={item.label}
            style={[styles.linkItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              router.push(item.route as any);
            }}
          >
            <Feather name={item.icon} size={18} color={colors.mutedForeground} />
            <Text style={[styles.linkItemText, { color: colors.foreground }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {ALL_BADGES.length > 0 && (
        <View style={[styles.badgesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.badgesHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Статусы</Text>
            <Text style={[styles.badgesCount, { color: colors.mutedForeground }]}>
              {earnedBadges.length}/{ALL_BADGES.length}
            </Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={ALL_BADGES}
            keyExtractor={(b) => b.id}
            contentContainerStyle={styles.badgesScroll}
            renderItem={({ item: badge }) => {
              const earned = earnedBadges.some((b) => b.id === badge.id);
              return (
                <View
                  style={[
                    styles.badgeChip,
                    {
                      backgroundColor: earned ? badge.color + "18" : colors.muted,
                      borderColor: earned ? badge.color + "50" : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.badgeChipIcon, { backgroundColor: earned ? badge.color + "25" : colors.border + "80" }]}>
                    <Feather
                      name={badge.icon}
                      size={16}
                      color={earned ? badge.color : colors.mutedForeground}
                    />
                  </View>
                  <Text
                    style={[
                      styles.badgeChipLabel,
                      { color: earned ? colors.foreground : colors.mutedForeground },
                    ]}
                  >
                    {badge.label}
                  </Text>
                  {!earned && (
                    <Feather name="lock" size={9} color={colors.mutedForeground} style={{ marginTop: 1 }} />
                  )}
                </View>
              );
            }}
          />
        </View>
      )}

      <CharacterBubble character={gradus} context="profile" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  premiumBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#000",
    fontFamily: "Inter_700Bold",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  premiumBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  premiumBtnText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  friendsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  friendsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  friendsText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  privateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4,
  },
  privateText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statVal: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  statUnit: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: -2,
  },
  returnCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  returnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  returnLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  returnValue: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  returnPct: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  noDebtBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  noDebtText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  titleCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 4,
  },
  titleLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  titleValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  badgesCard: {
    borderRadius: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderWidth: 1,
    gap: 14,
    overflow: "hidden",
  },
  badgesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  badgesCount: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  badgesScroll: {
    paddingHorizontal: 18,
    gap: 10,
  },
  badgeChip: {
    flexDirection: "column",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    width: 90,
  },
  badgeChipIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeChipLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 14,
  },
  advisorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  advisorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  advisorInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  advisorLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  advisorName: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  advisorRole: { fontSize: 12, fontFamily: "Inter_400Regular" },
  linksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: "47%",
    flex: 1,
  },
  linkItemText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
