import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CharacterBubble } from "@/components/CharacterBubble";
import { CHARACTERS, getCharacterById } from "@/constants/characters";
import { useColors } from "@/hooks/useColors";

const RATES = [0, 3, 5, 7, 10, 15];

function fmt(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
}

export default function CalculatorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("30");
  const [rate, setRate] = useState(0);

  const calc = useMemo(() => {
    const amt = parseFloat(amount.replace(/\s/g, "").replace(",", ".")) || 0;
    const t = parseInt(term) || 30;
    const r = rate / 100;
    const months = t / 30;
    const interest = amt * r * months;
    const total = amt + interest;
    const monthlyPayment = t >= 30 ? total / months : total;
    return { amt, t, interest, total, monthlyPayment };
  }, [amount, term, rate]);

  const hasValue = calc.amt > 0;
  const leyla = getCharacterById("leyla") ?? CHARACTERS[0];

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
          Калькулятор
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CharacterBubble character={leyla} context="give" />

        {/* Result card */}
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: hasValue
                ? colors.primary + "15"
                : colors.card,
              borderColor: hasValue ? colors.primary + "40" : colors.border,
            },
          ]}
        >
          <Text
            style={[styles.resultLabel, { color: colors.mutedForeground }]}
          >
            Итого к возврату
          </Text>
          <Text
            style={[
              styles.resultValue,
              { color: hasValue ? colors.foreground : colors.mutedForeground },
            ]}
          >
            {hasValue ? fmt(calc.total) : "0 ₽"}
          </Text>
          {hasValue && rate > 0 && (
            <View style={styles.resultSubs}>
              <View
                style={[
                  styles.resultSubItem,
                  { backgroundColor: colors.muted },
                ]}
              >
                <Text
                  style={[
                    styles.resultSubLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Тело долга
                </Text>
                <Text
                  style={[
                    styles.resultSubVal,
                    { color: colors.foreground },
                  ]}
                >
                  {fmt(calc.amt)}
                </Text>
              </View>
              <View
                style={[
                  styles.resultSubItem,
                  { backgroundColor: colors.destructive + "10" },
                ]}
              >
                <Text
                  style={[
                    styles.resultSubLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Переплата
                </Text>
                <Text
                  style={[
                    styles.resultSubVal,
                    { color: colors.destructive },
                  ]}
                >
                  {fmt(calc.interest)}
                </Text>
              </View>
              {calc.t >= 30 && (
                <View
                  style={[
                    styles.resultSubItem,
                    { backgroundColor: colors.success + "10" },
                  ]}
                >
                  <Text
                    style={[
                      styles.resultSubLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Платёж/мес
                  </Text>
                  <Text
                    style={[
                      styles.resultSubVal,
                      { color: colors.success },
                    ]}
                  >
                    {fmt(calc.monthlyPayment)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Inputs */}
        <View
          style={[
            styles.formCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Сумма займа
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: amount ? colors.primary : colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Введите сумму"
              placeholderTextColor={colors.mutedForeground}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          <View
            style={[styles.fieldDivider, { backgroundColor: colors.border }]}
          />

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Срок (дней)
            </Text>
            <View style={styles.termRow}>
              {[7, 14, 30, 60, 90].map((d) => (
                <Pressable
                  key={d}
                  style={[
                    styles.termChip,
                    {
                      backgroundColor:
                        term === String(d) ? colors.primary : colors.muted,
                    },
                  ]}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                    setTerm(String(d));
                  }}
                >
                  <Text
                    style={[
                      styles.termChipText,
                      {
                        color:
                          term === String(d)
                            ? colors.primaryForeground
                            : colors.foreground,
                      },
                    ]}
                  >
                    {d}
                  </Text>
                </Pressable>
              ))}
              <TextInput
                style={[
                  styles.termInput,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                value={term}
                onChangeText={setTerm}
                keyboardType="numeric"
                placeholder="др."
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          </View>

          <View
            style={[styles.fieldDivider, { backgroundColor: colors.border }]}
          />

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Процент в месяц
            </Text>
            <View style={styles.ratesRow}>
              {RATES.map((r) => (
                <Pressable
                  key={r}
                  style={[
                    styles.rateBtn,
                    {
                      backgroundColor:
                        rate === r ? colors.primary : colors.muted,
                      borderColor:
                        rate === r ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                    setRate(r);
                  }}
                >
                  <Text
                    style={[
                      styles.rateBtnText,
                      {
                        color:
                          rate === r
                            ? colors.primaryForeground
                            : colors.foreground,
                      },
                    ]}
                  >
                    {r}%
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Summary text */}
        {hasValue && (
          <View
            style={[
              styles.summaryRow,
              { backgroundColor: colors.muted, borderRadius: 14 },
            ]}
          >
            <Text
              style={[styles.summaryText, { color: colors.mutedForeground }]}
            >
              При займе{" "}
              <Text style={{ fontWeight: "700", color: colors.foreground }}>
                {fmt(calc.amt)}
              </Text>{" "}
              на{" "}
              <Text style={{ fontWeight: "700", color: colors.foreground }}>
                {calc.t} дней
              </Text>{" "}
              под{" "}
              <Text style={{ fontWeight: "700", color: colors.foreground }}>
                {rate}% в месяц
              </Text>
              , итоговая сумма возврата составит{" "}
              <Text style={{ fontWeight: "700", color: colors.primary }}>
                {fmt(calc.total)}
              </Text>
            </Text>
          </View>
        )}

        <Pressable
          style={[
            styles.useBtn,
            { backgroundColor: hasValue ? colors.primary : colors.muted },
          ]}
          disabled={!hasValue}
          onPress={() => {
            if (!hasValue) return;
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({
              pathname: "/loan/give",
              params: {
                prefillAmount: String(Math.round(calc.amt)),
                prefillTerm: String(calc.t),
                prefillRate: String(rate),
              },
            });
          }}
        >
          <Text
            style={[
              styles.useBtnText,
              { color: hasValue ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            {hasValue ? "Использовать в займе" : "Введите сумму для расчёта"}
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
  resultCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 10,
    alignItems: "center",
  },
  resultLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  resultValue: {
    fontSize: 40,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  resultSubs: { flexDirection: "row", gap: 10, flexWrap: "wrap", width: "100%" },
  resultSubItem: {
    flex: 1,
    minWidth: 80,
    borderRadius: 12,
    padding: 10,
    gap: 3,
    alignItems: "center",
  },
  resultSubLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  resultSubVal: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  field: { padding: 16, gap: 10 },
  fieldLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 17,
    fontFamily: "Inter_400Regular",
  },
  fieldDivider: { height: 1 },
  termRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  termChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 40,
    alignItems: "center",
  },
  termChipText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  termInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minWidth: 50,
  },
  ratesRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  rateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 44,
    alignItems: "center",
  },
  rateBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  summaryRow: { padding: 16 },
  summaryText: { fontSize: 14, lineHeight: 22, fontFamily: "Inter_400Regular" },
  useBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  useBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
