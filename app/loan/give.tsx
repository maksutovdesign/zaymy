import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { getCharacterById } from "@/constants/characters";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const RATES = [0, 3, 5, 7];

export default function GiveLoanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addLoan } = useApp();
  const params = useLocalSearchParams<{
    prefillAmount?: string;
    prefillTerm?: string;
    prefillRate?: string;
  }>();

  const [contact, setContact] = useState("");
  const [amount, setAmount] = useState(params.prefillAmount ?? "");
  const [term, setTerm] = useState(params.prefillTerm ?? "");
  const [rate, setRate] = useState(Number(params.prefillRate ?? 0));
  const [account, setAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = contact.trim() && amount.trim() && term.trim() && account.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const amountNum = parseFloat(amount.replace(/\s/g, "").replace(",", "."));
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Ошибка", "Укажите корректную сумму");
      return;
    }

    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLoading(true);

    const dueDate = new Date();
    const termDays = parseInt(term) || 30;
    dueDate.setDate(dueDate.getDate() + termDays);

    const result = await addLoan({
      type: "given",
      contact: contact.trim(),
      amount: amountNum,
      term: `${termDays} дней`,
      interestRate: rate,
      account: account.trim(),
      status: "active",
      dueDate: dueDate.toISOString(),
    });

    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Лимит займов", result.error ?? "Не удалось добавить займ");
      return;
    }

    Alert.alert(
      "Займ записан!",
      `${contact} — ${amountNum.toLocaleString("ru-RU")} ₽\nКарма +40 ⭐`,
      [{ text: "Готово", onPress: () => router.back() }]
    );
  };

  const zyuyd = getCharacterById("zyuyd")!;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={colors.primaryForeground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primaryForeground }]}>
          Дать в долг
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.form,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CharacterBubble character={zyuyd} context="give" style={styles.tip} />

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Кому</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: contact ? colors.primary : colors.border, color: colors.foreground }]}
            placeholder="Имя или контакт"
            placeholderTextColor={colors.mutedForeground}
            value={contact}
            onChangeText={setContact}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Сумма</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: amount ? colors.primary : colors.border, color: colors.foreground }]}
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Срок (дней)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: term ? colors.primary : colors.border, color: colors.foreground }]}
            placeholder="30"
            placeholderTextColor={colors.mutedForeground}
            value={term}
            onChangeText={setTerm}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Выберите процент</Text>
          <View style={styles.ratesRow}>
            {RATES.map((r) => (
              <Pressable
                key={r}
                style={[
                  styles.rateBtn,
                  {
                    backgroundColor: rate === r ? colors.primary : colors.card,
                    borderColor: rate === r ? colors.primary : colors.border,
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
                    { color: rate === r ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {r}%
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Ваш счёт</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: account ? colors.primary : colors.border, color: colors.foreground }]}
            placeholder="Название банка или номер карты"
            placeholderTextColor={colors.mutedForeground}
            value={account}
            onChangeText={setAccount}
          />
        </View>

        <Pressable
          style={[
            styles.submitBtn,
            { backgroundColor: canSubmit ? colors.primary : colors.muted },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit || isLoading}
        >
          <Text
            style={[
              styles.submitBtnText,
              { color: canSubmit ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            {isLoading ? "Сохраняем..." : "Далее →"}
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
    paddingBottom: 20,
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
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  tip: {
    marginBottom: 4,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  ratesRow: {
    flexDirection: "row",
    gap: 10,
  },
  rateBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  rateBtnText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});
