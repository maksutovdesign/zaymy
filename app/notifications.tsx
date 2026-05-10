import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { CHARACTERS } from "@/constants/characters";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  if (hrs < 1) return "только что";
  if (hrs < 24) return `${hrs} ч. назад`;
  const days = Math.floor(hrs / 24);
  return `${days} дн. назад`;
}

const TYPE_ICONS: Record<string, { icon: "bell" | "star" | "zap" | "clock" | "user-plus" | "briefcase"; color: string }> = {
  reminder: { icon: "clock", color: "#F59E0B" },
  received: { icon: "zap", color: "#22C55E" },
  overdue: { icon: "bell", color: "#EF4444" },
  karma: { icon: "star", color: "#F5C518" },
  friend: { icon: "user-plus", color: "#3B82F6" },
  offer: { icon: "briefcase", color: "#8B5CF6" },
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, markNotificationRead } = useApp();

  const handlePress = (id: string) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    markNotificationRead(id);
  };

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
          Уведомления
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="bell-off" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Нет уведомлений
            </Text>
          </View>
        ) : (
          notifications.map((notif) => {
            const character = CHARACTERS.find((c) => c.id === notif.characterId) ?? CHARACTERS[0];
            const typeInfo = TYPE_ICONS[notif.type] ?? TYPE_ICONS.reminder;
            return (
              <Pressable
                key={notif.id}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: notif.read ? colors.card : colors.primary + "0A",
                    borderColor: notif.read ? colors.border : colors.primary + "30",
                  },
                ]}
                onPress={() => handlePress(notif.id)}
              >
                <View style={[styles.charAvatar, { backgroundColor: character.color }]}>
                  <Text style={styles.charInitial}>{character.initial}</Text>
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTop}>
                    <Text style={[styles.notifTitle, { color: colors.foreground }]}>
                      {notif.title}
                    </Text>
                    {!notif.read && (
                      <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.notifMsg, { color: colors.mutedForeground }]}>
                    {notif.message}
                  </Text>
                  <View style={styles.notifMeta}>
                    <Feather
                      name={typeInfo.icon}
                      size={11}
                      color={typeInfo.color}
                    />
                    <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>
                      {timeAgo(notif.createdAt)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })
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
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  notifCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: "flex-start",
  },
  charAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  charInitial: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notifMsg: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  notifMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  notifTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
