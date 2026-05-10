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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CharacterBubble } from "@/components/CharacterBubble";
import { getCharacterById } from "@/constants/characters";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const INVITE_BENEFITS = [
  { icon: "star" as const, text: "+30 к карме за каждого друга" },
  { icon: "users" as const, text: "Видите долги друг друга" },
  { icon: "shield" as const, text: "Подтверждение займов" },
  { icon: "trending-up" as const, text: "Совместный рейтинг надёжности" },
];

export default function FriendsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addKarma, updateUser } = useApp();
  const [search, setSearch] = useState("");

  const lucha = getCharacterById("lucha")!;

  const handleInvite = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await Share.share({
        message:
          `${user.name || "Друг"} приглашает тебя в «Дай в долг» — приложение для займов между друзьями без стресса.\n\nФиксируй долги, повышай карму, доверяй. Установи прямо сейчас!`,
        title: "Приглашение в Дай в долг",
      });
      if (result.action === Share.sharedAction) {
        await addKarma(30, "Приглашение друга", "user-plus");
        await updateUser({ friendsCount: user.friendsCount + 1 });
        Alert.alert(
          "Отлично! +30 к карме ⭐",
          "Приглашение отправлено. Как только друг зарегистрируется — карма вырастет!",
          [{ text: "Здорово!" }]
        );
      }
    } catch {
      Alert.alert("Не удалось открыть меню отправки");
    }
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
          Мои друзья
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <CharacterBubble character={lucha} context="home" />

        <Pressable
          style={[styles.inviteCard, { backgroundColor: colors.primary }]}
          onPress={handleInvite}
        >
          <View style={styles.inviteContent}>
            <Text style={[styles.inviteTitle, { color: colors.primaryForeground }]}>
              Пригласить друга
            </Text>
            <Text style={[styles.inviteSub, { color: colors.primaryForeground + "BB" }]}>
              +30 к карме за каждого
            </Text>
          </View>
          <View style={[styles.inviteIconCircle, { backgroundColor: colors.primaryForeground + "20" }]}>
            <Feather name="user-plus" size={22} color={colors.primaryForeground} />
          </View>
        </Pressable>

        <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Зачем приглашать друзей?
          </Text>
          {INVITE_BENEFITS.map((b) => (
            <View key={b.text} style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.primary + "20" }]}>
                <Feather name={b.icon} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.benefitText, { color: colors.foreground }]}>
                {b.text}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.searchRow}>
          <View
            style={[styles.searchInput, { backgroundColor: colors.input, borderColor: colors.border }]}
          >
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchText, { color: colors.foreground }]}
              placeholder="Поиск по имени или номеру"
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {user.friendsCount === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={[styles.emptyIcon, { backgroundColor: colors.muted }]}
            >
              <Feather name="users" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Пока нет друзей в приложении
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Пригласи друзей — займы с ними станут прозрачнее и проще
            </Text>
            <Pressable
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={handleInvite}
            >
              <Text style={[styles.emptyBtnText, { color: colors.primaryForeground }]}>
                Пригласить первого друга
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.friendsList}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Друзья ({user.friendsCount})
            </Text>
            {/* Показываем столько карточек-заглушек, сколько друзей приглашено */}
            {Array.from({ length: user.friendsCount }).map((_, i) => {
              const name = `Друг ${i + 1}`;
              if (search && !name.toLowerCase().includes(search.toLowerCase())) return null;
              return (
                <View
                  key={i}
                  style={[styles.friendCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.friendAvatar, { backgroundColor: colors.primary + "30" }]}>
                    <Feather name="user" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.friendName, { color: colors.foreground }]}>
                      {name}
                    </Text>
                    <Text style={[styles.friendSub, { color: colors.mutedForeground }]}>
                      Принял приглашение
                    </Text>
                  </View>
                  <View style={[styles.friendBadge, { backgroundColor: colors.success + "20" }]}>
                    <Feather name="check" size={12} color={colors.success} />
                    <Text style={[styles.friendBadgeText, { color: colors.success }]}>В сети</Text>
                  </View>
                </View>
              );
            })}
            {search !== "" && user.friendsCount > 0 &&
              !Array.from({ length: user.friendsCount }).some((_, i) =>
                `Друг ${i + 1}`.toLowerCase().includes(search.toLowerCase())
              ) && (
              <Text style={[styles.comingSoon, { color: colors.mutedForeground }]}>
                Никого не найдено по запросу «{search}»
              </Text>
            )}
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
  inviteCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#F5C518",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  inviteContent: {
    gap: 4,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  inviteSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  inviteIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitsCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  searchRow: {},
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
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
    textAlign: "center",
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 280,
  },
  emptyBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  friendsList: {
    gap: 10,
  },
  comingSoon: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  friendName: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  friendSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  friendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  friendBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
