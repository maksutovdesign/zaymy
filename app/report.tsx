import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
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

function fmt(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ComponentProps<typeof Feather>["name"];
}) {
  const colors = useColors();
  return (
    <View
      style={[
        cardStyles.card,
        { backgroundColor: color + "12", borderColor: color + "30" },
      ]}
    >
      <View style={[cardStyles.iconWrap, { backgroundColor: color + "25" }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[cardStyles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[cardStyles.value, { color: colors.foreground }]}>
        {value}
      </Text>
      {sub && (
        <Text style={[cardStyles.sub, { color: colors.mutedForeground }]}>
          {sub}
        </Text>
      )}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 6,
    minWidth: "47%",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  label: { fontSize: 12, fontFamily: "Inter_400Regular" },
  value: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular" },
});

function SimpleBar({
  value,
  maxValue,
  color,
  label,
}: {
  value: number;
  maxValue: number;
  color: string;
  label: string;
}) {
  const colors = useColors();
  const pct = maxValue > 0 ? value / maxValue : 0;
  return (
    <View style={barStyles.row}>
      <Text style={[barStyles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <View style={[barStyles.track, { backgroundColor: colors.muted }]}>
        <View
          style={[
            barStyles.fill,
            { backgroundColor: color, width: `${Math.round(pct * 100)}%` },
          ]}
        />
      </View>
      <Text style={[barStyles.val, { color: colors.foreground }]}>
        {fmt(value)}
      </Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: { width: 56, fontSize: 12, fontFamily: "Inter_400Regular" },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 5, minWidth: 4 },
  val: {
    width: 80,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    textAlign: "right",
  },
});

export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loans, user } = useApp();

  const stats = useMemo(() => {
    const given = loans.filter((l) => l.type === "given");
    const taken = loans.filter((l) => l.type === "taken");
    const returned = loans.filter((l) => l.status === "returned");

    const totalGivenAmt = given.reduce((s, l) => s + l.amount, 0);
    const totalTakenAmt = taken.reduce((s, l) => s + l.amount, 0);
    const totalReturnedAmt = returned
      .filter((l) => l.type === "taken")
      .reduce((s, l) => s + l.amount, 0);

    const activeGiven = given.filter((l) => l.status === "active");
    const activeTaken = taken.filter((l) => l.status === "active");

    // Contact frequency
    const contactFreq: Record<string, number> = {};
    loans.forEach((l) => {
      contactFreq[l.contact] = (contactFreq[l.contact] || 0) + 1;
    });
    const topContact = Object.entries(contactFreq).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Most used account
    const accountFreq: Record<string, number> = {};
    loans.forEach((l) => {
      accountFreq[l.account] = (accountFreq[l.account] || 0) + 1;
    });
    const topAccount = Object.entries(accountFreq).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Average amount
    const avgAmount =
      loans.length > 0
        ? Math.round(
            loans.reduce((s, l) => s + l.amount, 0) / loans.length
          )
        : 0;

    // Return rate
    const returnRate =
      totalTakenAmt > 0
        ? Math.round((totalReturnedAmt / totalTakenAmt) * 100)
        : 100;

    // Overdue
    const overdue = loans.filter(
      (l) =>
        l.status === "active" && new Date(l.dueDate) < new Date()
    );

    return {
      totalGivenAmt,
      totalTakenAmt,
      totalReturnedAmt,
      totalLoans: loans.length,
      activeGiven: activeGiven.length,
      activeTaken: activeTaken.length,
      returnRate,
      avgAmount,
      topContact,
      topAccount,
      overdue: overdue.length,
      givenCount: given.length,
      takenCount: taken.length,
    };
  }, [loans]);

  const maxBarVal = Math.max(
    stats.totalGivenAmt,
    stats.totalTakenAmt,
    stats.totalReturnedAmt,
    1
  );

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
          Отчёт
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.karmaRow}>
          <View
            style={[
              styles.karmaBig,
              { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" },
            ]}
          >
            <Text
              style={[styles.karmaNum, { color: colors.primary }]}
            >
              {user.karma}
            </Text>
            <Text
              style={[styles.karmaLabel, { color: colors.mutedForeground }]}
            >
              очков кармы
            </Text>
          </View>
          <View style={styles.karmaRight}>
            <View
              style={[
                styles.miniStat,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.miniVal, { color: colors.foreground }]}>
                {stats.totalLoans}
              </Text>
              <Text
                style={[
                  styles.miniLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                всего займов
              </Text>
            </View>
            <View
              style={[
                styles.miniStat,
                {
                  backgroundColor:
                    stats.returnRate === 100
                      ? colors.success + "15"
                      : colors.card,
                  borderColor:
                    stats.returnRate === 100
                      ? colors.success + "40"
                      : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.miniVal,
                  {
                    color:
                      stats.returnRate === 100
                        ? colors.success
                        : colors.foreground,
                  },
                ]}
              >
                {stats.returnRate}%
              </Text>
              <Text
                style={[
                  styles.miniLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                возврат
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            label="Дал в долг"
            value={fmt(stats.totalGivenAmt)}
            sub={`${stats.givenCount} займов`}
            color="#F5C518"
            icon="arrow-up-right"
          />
          <StatCard
            label="Занял"
            value={fmt(stats.totalTakenAmt)}
            sub={`${stats.takenCount} займов`}
            color="#3B82F6"
            icon="arrow-down-left"
          />
          <StatCard
            label="Активных (выдал)"
            value={String(stats.activeGiven)}
            color="#10B981"
            icon="users"
          />
          <StatCard
            label="Мои долги"
            value={String(stats.activeTaken)}
            color={stats.activeTaken > 0 ? "#EF4444" : "#10B981"}
            icon="credit-card"
          />
        </View>

        {/* Bar chart */}
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Суммы
          </Text>
          <View style={styles.bars}>
            <SimpleBar
              label="Выдано"
              value={stats.totalGivenAmt}
              maxValue={maxBarVal}
              color="#F5C518"
            />
            <SimpleBar
              label="Занято"
              value={stats.totalTakenAmt}
              maxValue={maxBarVal}
              color="#3B82F6"
            />
            <SimpleBar
              label="Возврат"
              value={stats.totalReturnedAmt}
              maxValue={maxBarVal}
              color="#10B981"
            />
          </View>
        </View>

        {/* Extra stats */}
        <View
          style={[
            styles.extraCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Дополнительно
          </Text>
          {[
            {
              label: "Средняя сумма займа",
              value: stats.avgAmount > 0 ? fmt(stats.avgAmount) : "—",
              icon: "bar-chart-2" as const,
            },
            {
              label: "Самый частый контакт",
              value: stats.topContact
                ? `${stats.topContact[0]} (${stats.topContact[1]})`
                : "—",
              icon: "user" as const,
            },
            {
              label: "Любимый банк / счёт",
              value: stats.topAccount ? stats.topAccount[0] : "—",
              icon: "credit-card" as const,
            },
            {
              label: "Просроченных займов",
              value: String(stats.overdue),
              icon: "alert-circle" as const,
              color: stats.overdue > 0 ? colors.destructive : colors.success,
            },
          ].map((item) => (
            <View key={item.label} style={styles.extraRow}>
              <Feather
                name={item.icon}
                size={16}
                color={item.color ?? colors.mutedForeground}
              />
              <Text
                style={[styles.extraLabel, { color: colors.foreground }]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  styles.extraValue,
                  { color: item.color ?? colors.mutedForeground },
                ]}
              >
                {item.value}
              </Text>
            </View>
          ))}
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
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  karmaRow: { flexDirection: "row", gap: 12 },
  karmaBig: {
    flex: 1.4,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  karmaNum: {
    fontSize: 42,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  karmaLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  karmaRight: { flex: 1, gap: 12 },
  miniStat: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    justifyContent: "center",
  },
  miniVal: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  miniLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chartCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  bars: { gap: 12 },
  extraCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  extraRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  extraLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  extraValue: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
