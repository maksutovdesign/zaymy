import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoanCard } from "@/components/LoanCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatAmount(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const colors = useColors();

  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        style={styles.sectionHeader}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.selectionAsync();
          setOpen((v) => !v);
        }}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        {count !== undefined && count > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>
              {count}
            </Text>
          </View>
        )}
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedForeground}
          style={{ marginLeft: "auto" }}
        />
      </Pressable>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

export default function CabinetScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, loans, notifications, blacklist, getMyDebts, getOwedToMe } = useApp();

  const myDebts = getMyDebts();
  const owedToMe = getOwedToMe();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const givenLoans = loans.filter((l) => l.type === "given");
  const activeGiven = givenLoans.filter((l) => l.status === "active");
  const completedLoans = loans.filter((l) => l.status === "returned");

  const handleRemindAll = async () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      await Share.share({
        message: `Привет! Напоминаю о долге. Приложение «Дай в долг» ждёт тебя.`,
        title: "Напоминание о долге",
      });
    } catch {
      Alert.alert("Напоминание отправлено", "Должники получат уведомление о долге");
    }
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
      <View style={styles.topRow}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>
          Личный кабинет
        </Text>
        <View style={styles.topActions}>
          {unreadCount > 0 && (
            <View style={[styles.notifDot, { backgroundColor: colors.destructive }]}>
              <Text style={styles.notifDotText}>{unreadCount}</Text>
            </View>
          )}
          <Pressable style={[styles.premiumTag, { backgroundColor: colors.primary }]}>
            <Text style={[styles.premiumText, { color: colors.primaryForeground }]}>
              Premium ID
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Мои долги
          </Text>
          <Text style={[styles.statValue, { color: myDebts > 0 ? colors.destructive : colors.success }]}>
            {formatAmount(myDebts)}
          </Text>
          {myDebts === 0 && (
            <Text style={[styles.statBadge, { color: colors.success }]}>Долгов нет ✓</Text>
          )}
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Должны мне
          </Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {formatAmount(owedToMe)}
          </Text>
          {activeGiven.length > 0 && (
            <Pressable onPress={handleRemindAll}>
              <Text style={[styles.remindBtn, { color: colors.primary }]}>
                Напомнить
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View
        style={[styles.bonusRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.bonusInfo}>
          <Text style={[styles.bonusLabel, { color: colors.mutedForeground }]}>
            Мой бонус
          </Text>
          <Text style={[styles.bonusValue, { color: colors.foreground }]}>
            {user.karma} баллов
          </Text>
        </View>
        <Pressable
          style={[styles.historyBtn, { backgroundColor: colors.muted }]}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.selectionAsync();
            router.push("/karma-history");
          }}
        >
          <Feather name="clock" size={14} color={colors.mutedForeground} />
          <Text style={[styles.historyText, { color: colors.mutedForeground }]}>
            История
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.bankOffer, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.selectionAsync();
          Alert.alert("Предложение от банка", "Специальные условия кредитования доступны для вас как для Premium пользователя");
        }}
      >
        <Feather name="zap" size={20} color={colors.primary} />
        <View style={styles.bankOfferText}>
          <Text style={[styles.bankOfferTitle, { color: colors.foreground }]}>
            Предложение от банка
          </Text>
          <Text style={[styles.bankOfferSub, { color: colors.mutedForeground }]}>
            Специальные условия для вас
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.primary} />
      </Pressable>

      <Pressable
        style={[styles.friendsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.selectionAsync();
          router.push("/friends");
        }}
      >
        <View style={[styles.friendsIconWrap, { backgroundColor: colors.primary + "20" }]}>
          <Feather name="users" size={18} color={colors.primary} />
        </View>
        <View style={styles.friendsInfo}>
          <Text style={[styles.friendsTitle, { color: colors.foreground }]}>Мои друзья</Text>
          <Text style={[styles.friendsSub, { color: colors.mutedForeground }]}>
            {user.friendsCount > 0 ? `${user.friendsCount} друзей` : "Пригласи друзей +30 к карме"}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </Pressable>

      <Section title="Должники" count={activeGiven.length}>
        {activeGiven.length === 0 ? (
          <Text style={[styles.emptySection, { color: colors.mutedForeground }]}>
            Нет активных должников
          </Text>
        ) : (
          activeGiven.map((loan) => <LoanCard key={loan.id} loan={loan} compact />)
        )}
      </Section>

      <Section title={`История (${completedLoans.length})`} count={completedLoans.length}>
        {completedLoans.length === 0 ? (
          <Text style={[styles.emptySection, { color: colors.mutedForeground }]}>
            Нет завершённых займов
          </Text>
        ) : (
          completedLoans.slice(0, 5).map((loan) => <LoanCard key={loan.id} loan={loan} compact />)
        )}
      </Section>

      {/* Blacklist quick section */}
      <Pressable
        style={[styles.blacklistCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.selectionAsync();
          router.push("/blacklist");
        }}
      >
        <View style={[styles.blacklistIcon, { backgroundColor: colors.destructive + "15" }]}>
          <Feather name="shield" size={18} color={colors.destructive} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.blacklistTitle, { color: colors.foreground }]}>
            Чёрный список
          </Text>
          <Text style={[styles.blacklistSub, { color: colors.mutedForeground }]}>
            {blacklist.length === 0 ? "Пуст" : `${blacklist.length} контактов`}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </Pressable>

      <View style={styles.actionsGrid}>
        {[
          { icon: "bar-chart-2" as const, label: "Отчёт", route: "/report" },
          { icon: "hash" as const, label: "Калькулятор", route: "/calculator" },
          { icon: "users" as const, label: "Друзья", route: "/friends" },
          { icon: "help-circle" as const, label: "FAQ", route: "/faq" },
          { icon: "settings" as const, label: "Настройки", route: "/settings" },
        ].map((item) => (
          <Pressable
            key={item.label}
            style={[styles.actionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              router.push(item.route as any);
            }}
          >
            <Feather name={item.icon} size={20} color={colors.mutedForeground} />
            <Text style={[styles.actionItemText, { color: colors.foreground }]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
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
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notifDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  notifDotText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  premiumTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  statBadge: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  remindBtn: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  bonusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  bonusInfo: {
    gap: 2,
  },
  bonusLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  bonusValue: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  historyText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  bankOffer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  bankOfferText: {
    flex: 1,
    gap: 2,
  },
  bankOfferTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  bankOfferSub: {
    fontSize: 12,
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
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  sectionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  emptySection: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    paddingVertical: 8,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionItem: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionItemText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  friendsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  friendsIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  friendsInfo: {
    flex: 1,
    gap: 2,
  },
  friendsTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  friendsSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  blacklistCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  blacklistIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  blacklistTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  blacklistSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
