import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CHARACTERS } from "@/constants/characters";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setUserName } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [selectedChar, setSelectedChar] = useState("lucha");
  const [isLoading, setIsLoading] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const canStep1 = name.trim().length >= 2;

  const goToStep2 = () => {
    if (!canStep1) return;
    if (Platform.OS !== "web") Haptics.selectionAsync();
    Animated.timing(slideAnim, {
      toValue: -1,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => {
      setStep(2);
      slideAnim.setValue(1);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 10,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    });
  };

  const handleStart = async () => {
    if (Platform.OS !== "web")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(btnScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
    setIsLoading(true);
    await setUserName(name.trim(), "", selectedChar);
    router.replace("/(tabs)");
  };

  const selectedCharacter = CHARACTERS.find((c) => c.id === selectedChar)!;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop:
              insets.top + (Platform.OS === "web" ? 67 : 0) + 24,
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress dots */}
        <View style={styles.dots}>
          {[1, 2].map((s) => (
            <View
              key={s}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    s === step ? colors.primary : colors.muted,
                  width: s === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {step === 1 ? (
          <Animated.View
            style={[
              styles.stepView,
              {
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [-300, 0, 300],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Hero */}
            <View style={styles.hero}>
              <View
                style={[
                  styles.logoCircle,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.logoEmoji}>🐀</Text>
              </View>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Дай в долг
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.mutedForeground }]}
              >
                Финансовые отношения без стресса.{"\n"}Фиксируй, отслеживай,
                доверяй.
              </Text>
            </View>

            {/* Preview characters */}
            <View style={styles.charsRow}>
              {CHARACTERS.slice(0, 4).map((ch, i) => (
                <Animated.View
                  key={ch.id}
                  style={[
                    styles.previewChar,
                    { transform: [{ scale: 1 }] },
                  ]}
                >
                  <View
                    style={[
                      styles.previewCircle,
                      { backgroundColor: ch.color },
                    ]}
                  >
                    <Text style={styles.previewInitial}>{ch.initial}</Text>
                  </View>
                  <Text
                    style={[
                      styles.previewName,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {ch.name}
                  </Text>
                </Animated.View>
              ))}
            </View>

            <View
              style={[
                styles.teamLabel,
                { backgroundColor: colors.muted },
              ]}
            >
              <Text
                style={[
                  styles.teamText,
                  { color: colors.mutedForeground },
                ]}
              >
                8 советников всегда рядом
              </Text>
            </View>

            {/* Name input */}
            <View style={styles.form}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                Как тебя зовут?
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: name.length > 0 ? colors.primary : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="Имя и фамилия"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
                onSubmitEditing={goToStep2}
                returnKeyType="next"
              />
              <Pressable
                style={[
                  styles.nextBtn,
                  {
                    backgroundColor: canStep1 ? colors.primary : colors.muted,
                  },
                ]}
                onPress={goToStep2}
                disabled={!canStep1}
              >
                <Text
                  style={[
                    styles.nextBtnText,
                    {
                      color: canStep1
                        ? colors.primaryForeground
                        : colors.mutedForeground,
                    },
                  ]}
                >
                  Далее →
                </Text>
              </Pressable>
            </View>

            {/* Features */}
            <View style={styles.featuresRow}>
              {[
                { icon: "💸", text: "Займы с друзьями" },
                { icon: "⭐", text: "Система кармы" },
                { icon: "🏆", text: "Звания и статусы" },
              ].map((f) => (
                <View
                  key={f.text}
                  style={[
                    styles.featureItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text
                    style={[
                      styles.featureText,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {f.text}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.stepView,
              {
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [-300, 0, 300],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.step2Header}>
              <Text style={[styles.step2Title, { color: colors.foreground }]}>
                Выбери советника
              </Text>
              <Text
                style={[
                  styles.step2Sub,
                  { color: colors.mutedForeground },
                ]}
              >
                Твой главный крысёнок будет всегда рядом
              </Text>
            </View>

            {/* Selected character preview */}
            <View
              style={[
                styles.selectedPreview,
                {
                  backgroundColor: selectedCharacter.color + "15",
                  borderColor: selectedCharacter.color + "50",
                },
              ]}
            >
              <View
                style={[
                  styles.selectedCircle,
                  { backgroundColor: selectedCharacter.color },
                ]}
              >
                <Text style={styles.selectedInitial}>
                  {selectedCharacter.initial}
                </Text>
              </View>
              <View style={styles.selectedInfo}>
                <Text
                  style={[
                    styles.selectedName,
                    { color: selectedCharacter.color },
                  ]}
                >
                  {selectedCharacter.name}
                </Text>
                <Text
                  style={[
                    styles.selectedRole,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {selectedCharacter.role}
                </Text>
                <Text
                  style={[styles.selectedTip, { color: colors.foreground }]}
                  numberOfLines={2}
                >
                  «{selectedCharacter.tips.home}»
                </Text>
              </View>
            </View>

            {/* Grid */}
            <View style={styles.charGrid}>
              {CHARACTERS.map((ch) => {
                const isSelected = selectedChar === ch.id;
                return (
                  <Pressable
                    key={ch.id}
                    style={[
                      styles.charCell,
                      {
                        backgroundColor: isSelected
                          ? ch.color + "20"
                          : colors.card,
                        borderColor: isSelected ? ch.color : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.selectionAsync();
                      setSelectedChar(ch.id);
                    }}
                  >
                    <View
                      style={[
                        styles.charCellCircle,
                        { backgroundColor: ch.color },
                      ]}
                    >
                      <Text style={styles.charCellInitial}>{ch.initial}</Text>
                    </View>
                    <Text
                      style={[
                        styles.charCellName,
                        {
                          color: isSelected ? ch.color : colors.foreground,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {ch.name}
                    </Text>
                    {isSelected && (
                      <View
                        style={[
                          styles.checkmark,
                          { backgroundColor: ch.color },
                        ]}
                      >
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <Pressable
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
                onPress={handleStart}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.startBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {isLoading ? "Входим..." : "Начать"}
                </Text>
              </Pressable>
            </Animated.View>

            <Pressable onPress={() => setStep(1)}>
              <Text
                style={[styles.backLink, { color: colors.mutedForeground }]}
              >
                ← Назад
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, gap: 24 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: { height: 8, borderRadius: 4 },
  stepView: { gap: 20 },
  hero: { alignItems: "center", gap: 12 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 44 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },
  charsRow: { flexDirection: "row", justifyContent: "center", gap: 18 },
  previewChar: { alignItems: "center", gap: 5 },
  previewCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  previewInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  previewName: { fontSize: 11, fontFamily: "Inter_400Regular" },
  teamLabel: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  teamText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  form: { gap: 12 },
  label: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  nextBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  featuresRow: { flexDirection: "row", gap: 10 },
  featureItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  featureIcon: { fontSize: 22 },
  featureText: {
    fontSize: 11,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  // Step 2
  step2Header: { alignItems: "center", gap: 8 },
  step2Title: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  step2Sub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  selectedPreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  selectedCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  selectedInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  selectedInfo: { flex: 1, gap: 4 },
  selectedName: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  selectedRole: { fontSize: 12, fontFamily: "Inter_400Regular" },
  selectedTip: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
    fontStyle: "italic",
  },
  charGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  charCell: {
    width: "22.5%",
    aspectRatio: 0.85,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    position: "relative",
  },
  charCellCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  charCellInitial: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  charCellName: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: { fontSize: 10, color: "#FFF", fontWeight: "700" },
  startBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  backLink: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    paddingVertical: 4,
  },
});
