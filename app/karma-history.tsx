import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, FeatherIconName } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function KarmaHistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { karmaHistory, user } = useApp();

  const totalEarned = karmaHistory
    .filter((e) => e.points > 0)
    .reduce((s, e) => s + e.points, 0);
  const totalLost = karmaHistory
    .filter((e) => e.points < 0)
    .reduce((s, e) => s + e.points, 0);

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
          История кармы
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
        {/* Summary card */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              Текущая карма
            </Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              {user.karma.toLocaleString("ru-RU")}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              Заработано
            </Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              +{totalEarned}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              Потеряно
            </Text>
            <Text style={[styles.summaryValue, { color: colors.destructive }]}>
              {totalLost}
            </Text>
          </View>
        </View>

        {/* Event list */}
        {karmaHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="clock" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              История пуста
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Начни выдавать займы и возвращать долги — карма начнёт расти!
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.listCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {karmaHistory.map((event, index) => {
              const isPos = event.points > 0;
              return (
                <React.Fragment key={event.id}>
                  <View style={styles.eventRow}>
                    <View
                      style={[
                        styles.eventIcon,
                        {
                          backgroundColor: isPos
                            ? colors.success + "18"
                            : colors.destructive + "18",
                        },
                      ]}
                    >
                      <Feather
                        name={event.icon as FeatherIconName}
                        size={16}
                        color={isPos ? colors.success : colors.destructive}
                      />
                    </View>
                    <View style={styles.eventInfo}>
                      <Text
                        style={[styles.eventReason, { color: colors.foreground }]}
                        numberOfLines={1}
                      >
                        {event.reason}
                      </Text>
                      <Text
                        style={[styles.eventDate, { color: colors.mutedForeground }]}
                      >
                        {formatDate(event.date)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.eventPoints,
                        { color: isPos ? colors.success : colors.destructive },
                      ]}
                    >
                      {isPos ? "+" : ""}
                      {event.points}
                    </Text>
                  </View>
                  {index < karmaHistory.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        )}
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
    gap: 16,
  },
  summaryCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  summaryDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 8,
  },
  listCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  eventReason: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  eventDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  eventPoints: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 280,
  },
});
