import { Feather } from "@expo/vector-icons";
import React, { useRef, useEffect } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CharacterBubble } from "@/components/CharacterBubble";
import { CHARACTERS, getCharacterById } from "@/constants/characters";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface KarmaLevel {
  min: number;
  max: number | null;
  title: string;
  color: string;
}

const KARMA_LEVELS: KarmaLevel[] = [
  { min: 0, max: 100, title: "Новичок", color: "#9CA3AF" },
  { min: 101, max: 500, title: "Надёжный", color: "#60A5FA" },
  { min: 501, max: 1500, title: "Доверенный", color: "#34D399" },
  { min: 1501, max: 5000, title: "Уважаемый", color: "#F59E0B" },
  { min: 5001, max: 15000, title: "Авторитетный", color: "#8B5CF6" },
  { min: 15001, max: null, title: "Великий уровнитель", color: "#F5C518" },
];

function getKarmaLevel(karma: number): KarmaLevel {
  return KARMA_LEVELS.find(
    (l) => karma >= l.min && (l.max === null || karma <= l.max)
  ) ?? KARMA_LEVELS[0];
}

function getNextLevel(karma: number): KarmaLevel | null {
  const idx = KARMA_LEVELS.findIndex(
    (l) => karma >= l.min && (l.max === null || karma <= l.max)
  );
  return idx < KARMA_LEVELS.length - 1 ? KARMA_LEVELS[idx + 1] : null;
}

function getProgress(karma: number): number {
  const current = getKarmaLevel(karma);
  if (current.max === null) return 1;
  const range = current.max - current.min;
  const progress = karma - current.min;
  return Math.min(progress / range, 1);
}

const KARMA_RULES = [
  { label: "Вернул вовремя", points: "+10", icon: "check-circle" as const },
  { label: "Вернул досрочно", points: "+20", icon: "zap" as const },
  { label: "Привёл друга", points: "+30", icon: "user-plus" as const },
  { label: "Дал займ", points: "+40", icon: "arrow-up-right" as const },
  { label: "Просрочка (каждый день)", points: "−5", icon: "clock" as const },
];

export default function KarmaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useApp();

  const karmaLevel = getKarmaLevel(user.karma);
  const nextLevel = getNextLevel(user.karma);
  const progress = getProgress(user.karma);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const karmaAnim = useRef(new Animated.Value(0)).current;

  // Card entrance animation — runs once on mount
  useEffect(() => {
    Animated.timing(karmaAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, []);

  // Progress bar animation — re-runs whenever karma (and therefore `progress`) changes
  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const lucha = getCharacterById("lucha") ?? CHARACTERS[0];

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
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>
        Карма
      </Text>

      <Animated.View
        style={[
          styles.karmaCard,
          {
            backgroundColor: karmaLevel.color + "18",
            borderColor: karmaLevel.color + "40",
            opacity: karmaAnim,
            transform: [{ scale: karmaAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
          },
        ]}
      >
        <Text style={[styles.karmaValue, { color: karmaLevel.color }]}>
          {user.karma.toLocaleString("ru-RU")}
        </Text>
        <Text style={[styles.karmaLabel, { color: colors.mutedForeground }]}>
          очков кармы
        </Text>

        <View style={[styles.titleBadge, { backgroundColor: karmaLevel.color }]}>
          <Text style={styles.titleBadgeText}>{karmaLevel.title}</Text>
        </View>

        <View style={styles.progressSection}>
          {nextLevel && (
            <>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                  До уровня «{nextLevel.title}»
                </Text>
                <Text style={[styles.progressLabel, { color: karmaLevel.color, fontWeight: "700" }]}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              {/* Thick segmented progress bar */}
              <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: karmaLevel.color,
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
                {/* Segment markers at 25%, 50%, 75% */}
                {[0.25, 0.5, 0.75].map((pos) => (
                  <View
                    key={pos}
                    style={[
                      styles.segmentMark,
                      { left: `${pos * 100}%` as any },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.progressFooter}>
                <Text style={[styles.progressFooterText, { color: colors.mutedForeground }]}>
                  {karmaLevel.min.toLocaleString("ru-RU")}
                </Text>
                <Text style={[styles.progressFooterText, { color: colors.mutedForeground }]}>
                  {(nextLevel.min - 1).toLocaleString("ru-RU")}
                </Text>
              </View>
            </>
          )}
          {!nextLevel && (
            <Text style={[styles.maxTitle, { color: karmaLevel.color }]}>
              Максимальный уровень достигнут! 🏆
            </Text>
          )}
        </View>
      </Animated.View>

      <CharacterBubble character={lucha} context="karma" />

      <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Как начисляется карма
        </Text>
        {KARMA_RULES.map((rule) => {
          const isNeg = rule.points.startsWith("−");
          return (
            <View key={rule.label} style={styles.ruleRow}>
              <View
                style={[
                  styles.ruleIcon,
                  {
                    backgroundColor: isNeg
                      ? colors.destructive + "15"
                      : colors.success + "15",
                  },
                ]}
              >
                <Feather
                  name={rule.icon}
                  size={16}
                  color={isNeg ? colors.destructive : colors.success}
                />
              </View>
              <Text style={[styles.ruleLabel, { color: colors.foreground }]}>
                {rule.label}
              </Text>
              <Text
                style={[
                  styles.rulePoints,
                  { color: isNeg ? colors.destructive : colors.success },
                ]}
              >
                {rule.points}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Как получить статус
        </Text>
        {[
          { label: "Всегда вовремя", hint: "Нет просроченных долгов + есть возвраты", icon: "check-circle" as const, color: "#22C55E" },
          { label: "Всегда на связи", hint: "Карма от 200 очков", icon: "phone" as const, color: "#3B82F6" },
          { label: "Лучший друг", hint: "3 и более друзей в приложении", icon: "heart" as const, color: "#EC4899" },
          { label: "Семейный", hint: "3+ займа выдано + карма от 500", icon: "home" as const, color: "#F59E0B" },
          { label: "Инвестор", hint: "Суммарно дал в долг от 50 000 ₽", icon: "trending-up" as const, color: "#8B5CF6" },
          { label: "Premium", hint: "Активная Premium-подписка", icon: "star" as const, color: "#F5C518" },
        ].map((s) => (
          <View key={s.label} style={styles.ruleRow}>
            <View style={[styles.ruleIcon, { backgroundColor: s.color + "15" }]}>
              <Feather name={s.icon} size={16} color={s.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ruleLabel, { color: colors.foreground }]}>{s.label}</Text>
              <Text style={[styles.ruleHint, { color: colors.mutedForeground }]}>{s.hint}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.levelsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Уровни
        </Text>
        {KARMA_LEVELS.map((level) => {
          const isActive = karmaLevel.title === level.title;
          return (
            <View
              key={level.title}
              style={[
                styles.levelRow,
                isActive && { backgroundColor: level.color + "15", borderRadius: 10, paddingHorizontal: 8 },
              ]}
            >
              <View style={[styles.levelDot, { backgroundColor: level.color }]} />
              <Text
                style={[
                  styles.levelTitle,
                  { color: isActive ? level.color : colors.foreground, fontWeight: isActive ? "700" : "400" },
                ]}
              >
                {level.title}
              </Text>
              <Text style={[styles.levelRange, { color: colors.mutedForeground }]}>
                {level.max ? `${level.min}–${level.max}` : `${level.min}+`}
              </Text>
              {isActive && (
                <Feather name="check" size={14} color={level.color} />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  karmaCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 10,
  },
  karmaValue: {
    fontSize: 56,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -2,
  },
  karmaLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: -6,
  },
  titleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  titleBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  progressSection: {
    width: "100%",
    gap: 8,
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  progressBg: {
    height: 14,
    borderRadius: 7,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    borderRadius: 7,
  },
  segmentMark: {
    position: "absolute",
    top: 3,
    bottom: 3,
    width: 1.5,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 1,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressFooterText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  maxTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  rulesCard: {
    borderRadius: 20,
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
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ruleIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  rulePoints: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  ruleHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  levelsCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    gap: 8,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  levelTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  levelRange: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
