import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CHARACTERS,
  TipContext,
  getCharacterById,
} from "@/constants/characters";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const TIP_LABELS: Record<TipContext, string> = {
  home: "Главная",
  give: "При выдаче займа",
  take: "При займе",
  overdue: "При просрочке",
  karma: "О карме",
  profile: "О профиле",
  cabinet: "Кабинет",
};

function TipRow({ label, text }: { label: string; text: string }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen((v) => !v)}>
      <View style={tipStyles.row}>
        <Text style={[tipStyles.label, { color: colors.foreground }]}>
          {label}
        </Text>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedForeground}
        />
      </View>
      {open && (
        <Text style={[tipStyles.text, { color: colors.mutedForeground }]}>
          {text}
        </Text>
      )}
    </Pressable>
  );
}

const tipStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  label: { fontSize: 14, fontFamily: "Inter_500Medium" },
  text: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
    paddingBottom: 12,
    fontStyle: "italic",
  },
});

export default function CharacterDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, setSelectedCharacter } = useApp();

  const character = getCharacterById(id ?? "");
  const isSelected = user.selectedCharacterId === id;

  const avatarScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(avatarScale, {
      toValue: 1,
      tension: 80,
      friction: 6,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, []);

  if (!character) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.mutedForeground }}>
          Персонаж не найден
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
            backgroundColor: character.color + "18",
            borderBottomColor: character.color + "30",
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={character.color} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: character.color }]}>
          {character.name}
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
        {/* Hero */}
        <Animated.View
          style={[
            styles.heroCard,
            {
              backgroundColor: character.color + "15",
              borderColor: character.color + "40",
              transform: [{ scale: avatarScale }],
            },
          ]}
        >
          <View
            style={[styles.bigAvatar, { backgroundColor: character.color }]}
          >
            <Text style={styles.bigInitial}>{character.initial}</Text>
          </View>
          <Text style={[styles.charName, { color: character.color }]}>
            {character.name}
          </Text>
          <Text style={[styles.charRole, { color: colors.mutedForeground }]}>
            {character.role}
          </Text>
          <View style={styles.tagsRow}>
            <View
              style={[
                styles.tag,
                { backgroundColor: character.color + "20" },
              ]}
            >
              <Text style={[styles.tagText, { color: character.color }]}>
                {character.gender === "М" ? "♂ Мужской" : "♀ Женский"}
              </Text>
            </View>
            <View
              style={[
                styles.tag,
                { backgroundColor: character.color + "20" },
              ]}
            >
              <Text style={[styles.tagText, { color: character.color }]}>
                {character.age} лет
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* All characters */}
        <View
          style={[
            styles.othersCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Все советники
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.othersRow}
          >
            {CHARACTERS.map((ch) => (
              <Pressable
                key={ch.id}
                style={[
                  styles.otherItem,
                  ch.id === id && {
                    backgroundColor: ch.color + "20",
                    borderColor: ch.color,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => router.replace(`/character/${ch.id}`)}
              >
                <View
                  style={[
                    styles.otherCircle,
                    { backgroundColor: ch.color },
                  ]}
                >
                  <Text style={styles.otherInitial}>{ch.initial}</Text>
                </View>
                <Text
                  style={[
                    styles.otherName,
                    {
                      color:
                        ch.id === id ? ch.color : colors.mutedForeground,
                    },
                  ]}
                >
                  {ch.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tips */}
        <View
          style={[
            styles.tipsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Советы {character.name}а
          </Text>
          {(Object.keys(TIP_LABELS) as TipContext[]).map((ctx, idx, arr) => (
            <View key={ctx}>
              <TipRow label={TIP_LABELS[ctx]} text={character.tips[ctx]} />
              {idx < arr.length - 1 && (
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: colors.border },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Select button */}
        <Pressable
          style={[
            styles.selectBtn,
            {
              backgroundColor: isSelected ? colors.success : character.color,
            },
          ]}
          onPress={async () => {
            await setSelectedCharacter(character.id);
            router.back();
          }}
        >
          <Text style={styles.selectBtnText}>
            {isSelected ? "✓ Мой советник" : `Выбрать ${character.name}`}
          </Text>
        </Pressable>
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
  heroCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  bigAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  bigInitial: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  charName: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  charRole: { fontSize: 15, fontFamily: "Inter_400Regular" },
  tagsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  tagText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  othersCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  othersRow: { gap: 12, paddingVertical: 4 },
  otherItem: {
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  otherCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  otherInitial: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  otherName: { fontSize: 11, fontFamily: "Inter_400Regular" },
  tipsCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 0 },
  divider: { height: 1 },
  selectBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  selectBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
});
