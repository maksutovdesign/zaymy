import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Loan, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  loan: Loan;
  compact?: boolean;
}

function formatAmount(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function getDaysLeft(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getTimeProgress(createdAt: string, dueDate: string): number {
  const start = new Date(createdAt).getTime();
  const end = new Date(dueDate).getTime();
  const now = Date.now();
  if (end <= start) return 1;
  return Math.min(Math.max((now - start) / (end - start), 0), 1);
}

// Deterministic color from contact name
const AVATAR_COLORS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#10B981",
  "#F59E0B", "#EF4444", "#06B6D4", "#84CC16",
];
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function LoanCard({ loan, compact = false }: Props) {
  const colors = useColors();
  const { updateLoanStatus, removeLoan } = useApp();

  const isGiven = loan.type === "given";
  const daysLeft = getDaysLeft(loan.dueDate);
  const isOverdue = daysLeft < 0 && loan.status === "active";
  const isSoonDue = daysLeft <= 3 && daysLeft >= 0 && loan.status === "active";
  const timeProgress = getTimeProgress(loan.createdAt, loan.dueDate);

  const statusColor =
    loan.status === "returned"
      ? colors.success
      : isOverdue
      ? colors.destructive
      : isSoonDue
      ? colors.warning
      : colors.mutedForeground;

  const progressColor =
    loan.status === "returned"
      ? colors.success
      : isOverdue
      ? colors.destructive
      : isSoonDue
      ? colors.warning
      : colors.primary;

  const statusLabel =
    loan.status === "returned"
      ? "Возвращён"
      : isOverdue
      ? `Просрочка ${Math.abs(daysLeft)} дн.`
      : isSoonDue
      ? `${daysLeft} дн. осталось`
      : `${daysLeft} дн. осталось`;

  const avatarColor = getAvatarColor(loan.contact);
  const initials = getInitials(loan.contact);

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push(`/loan/${loan.id}`);
  };

  const handleMarkReturned = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Пометить как возвращённый?",
      `${loan.contact} — ${formatAmount(loan.amount)}`,
      [
        { text: "Отмена", style: "cancel" },
        { text: "Возвращён", onPress: async () => {
          await updateLoanStatus(loan.id, "returned").catch(console.error);
        }},
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert("Удалить запись?", undefined, [
      { text: "Отмена", style: "cancel" },
      { text: "Удалить", style: "destructive", onPress: async () => {
        await removeLoan(loan.id).catch(console.error);
      }},
    ]);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isOverdue ? colors.destructive + "50" : colors.border,
          opacity: pressed ? 0.93 : 1,
        },
      ]}
    >
      {/* Main row */}
      <View style={styles.mainRow}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarColor + "22" }]}>
          <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.contact, { color: colors.foreground }]} numberOfLines={1}>
              {loan.contact}
            </Text>
            <View style={[styles.typeTag, { backgroundColor: isGiven ? colors.primary + "20" : colors.muted }]}>
              <Text style={[styles.typeText, { color: isGiven ? colors.primary : colors.mutedForeground }]}>
                {isGiven ? "дал" : "занял"}
              </Text>
            </View>
          </View>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {formatDate(loan.createdAt)}
            {loan.interestRate > 0 ? ` · ${loan.interestRate}%` : ""}
            {" · до "}{formatDate(loan.dueDate)}
          </Text>
        </View>

        {/* Amount + actions */}
        <View style={styles.right}>
          <Text style={[styles.amount, { color: isOverdue ? colors.destructive : colors.foreground }]}>
            {formatAmount(loan.amount)}
          </Text>
          {loan.status === "active" && !compact ? (
            <View style={styles.actions}>
              <Pressable
                onPress={handleMarkReturned}
                style={[styles.actionBtn, { backgroundColor: colors.success + "20" }]}
                hitSlop={6}
              >
                <Feather name="check" size={13} color={colors.success} />
              </Pressable>
              <Pressable
                onPress={handleDelete}
                style={[styles.actionBtn, { backgroundColor: colors.destructive + "15" }]}
                hitSlop={6}
              >
                <Feather name="trash-2" size={13} color={colors.destructive} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Status row for compact / returned */}
      {(compact || loan.status === "returned") && (
        <View style={styles.statusRowCompact}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      )}

      {/* Time progress bar */}
      {loan.status === "active" && (
        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: progressColor,
                width: `${Math.round(timeProgress * 100)}%`,
                opacity: isOverdue ? 1 : 0.7,
              },
            ]}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 0,
    borderWidth: 1,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  info: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contact: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    flexShrink: 1,
  },
  typeTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  amount: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  statusRowCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  progressBg: {
    height: 4,
    borderRadius: 0,
    marginHorizontal: -14,
    marginBottom: 0,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
});
