import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { CHARACTERS, getRandomCharacter } from "@/constants/characters";
import { Loan, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatAmount(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDaysLeft(dueDate: string) {
  return Math.ceil(
    (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function InfoRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const colors = useColors();
  return (
    <View style={infoStyles.row}>
      <Text style={[infoStyles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[infoStyles.value, { color: color ?? colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: { fontSize: 14, fontFamily: "Inter_400Regular" },
  value: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});

export default function LoanDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loans, user, updateLoanStatus, updateLoanNote, removeLoan } = useApp();
  const [character] = useState(() => getRandomCharacter());
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  const loan = loans.find((l) => l.id === id);

  // Initialize note from persisted loan data
  useEffect(() => {
    if (loan?.note) setNoteText(loan.note);
  }, [loan?.id]);

  if (!loan) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.mutedForeground }}>Займ не найден</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  const isGiven = loan.type === "given";
  const daysLeft = getDaysLeft(loan.dueDate);
  const isOverdue = daysLeft < 0 && loan.status === "active";

  const statusColor =
    loan.status === "returned"
      ? colors.success
      : isOverdue
      ? colors.destructive
      : daysLeft <= 3
      ? colors.warning
      : colors.foreground;

  const statusLabel =
    loan.status === "returned"
      ? "Возвращён"
      : isOverdue
      ? `Просрочка ${Math.abs(daysLeft)} дн.`
      : `${daysLeft} дн. осталось`;

  const tipContext = isOverdue
    ? "overdue"
    : isGiven
    ? "give"
    : "take";

  const handleRemind = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const action = isGiven ? "вернуть" : "напомнить";
    const roleLabel = isGiven ? `${loan.contact} должен тебе` : `Ты должен ${loan.contact}`;
    const msg = `Привет! ${roleLabel} ${formatAmount(loan.amount)}. Срок: ${formatDate(loan.dueDate)}. Приложение «Дай в долг» напоминает — возврат скоро!`;

    try {
      await Share.share({ message: msg, title: "Напоминание о долге" });
    } catch {
      Alert.alert("Не удалось открыть меню отправки");
    }
  };

  const handleMarkReturned = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Пометить как возвращённый?",
      `${loan.contact} — ${formatAmount(loan.amount)}`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Возвращён",
          onPress: async () => {
            await updateLoanStatus(loan.id, "returned");
            router.back();
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert("Удалить запись?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          await removeLoan(loan.id);
          router.back();
        },
      },
    ]);
  };

  const totalWithInterest =
    loan.interestRate > 0
      ? loan.amount * (1 + (loan.interestRate / 100) * (parseInt(loan.term) / 30))
      : loan.amount;

  const daysOverdue = isOverdue ? Math.abs(daysLeft) : 0;
  const lateFee =
    isOverdue && user.lateFeeRate > 0
      ? Math.round(loan.amount * (user.lateFeeRate / 100) * daysOverdue)
      : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            backgroundColor: isGiven ? colors.primary : colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather
            name="arrow-left"
            size={22}
            color={isGiven ? colors.primaryForeground : colors.foreground}
          />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: isGiven ? colors.primaryForeground : colors.foreground },
          ]}
        >
          {isGiven ? "Дал в долг" : "Занял"}
        </Text>
        <Pressable onPress={handleDelete} style={styles.backBtn}>
          <Feather
            name="trash-2"
            size={18}
            color={isGiven ? colors.primaryForeground + "BB" : colors.destructive}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.amountBlock}>
          <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>
            {isGiven ? loan.contact + " должен тебе" : "Ты должен " + loan.contact}
          </Text>
          <Text style={[styles.amountValue, { color: colors.foreground }]}>
            {formatAmount(loan.amount)}
          </Text>
          {loan.interestRate > 0 && (
            <Text style={[styles.amountWithInterest, { color: colors.mutedForeground }]}>
              Итого с процентами: {formatAmount(Math.round(totalWithInterest))}
            </Text>
          )}
          {lateFee > 0 && (
            <Text style={[styles.amountWithInterest, { color: colors.destructive }]}>
              Пеня за {daysOverdue} дн. ({user.lateFeeRate}%/день): +{formatAmount(lateFee)}
            </Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow label="Контакт" value={loan.contact} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Сумма" value={formatAmount(loan.amount)} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Срок" value={loan.term} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Процент" value={loan.interestRate + "%"} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Счёт" value={loan.account} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Дата займа" value={formatDate(loan.createdAt)} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow
            label="Срок возврата"
            value={formatDate(loan.dueDate)}
            color={isOverdue ? colors.destructive : undefined}
          />
        </View>

        <CharacterBubble character={character} context={tipContext} />

        {editingNote ? (
          <View style={[styles.noteField, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.noteInput, { color: colors.foreground }]}
              placeholder="Добавить заметку..."
              placeholderTextColor={colors.mutedForeground}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              autoFocus
            />
            <Pressable
              onPress={async () => {
                await updateLoanNote(loan.id, noteText);
                setEditingNote(false);
              }}
              style={[styles.noteSaveBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.noteSaveTxt, { color: colors.primaryForeground }]}>
                Сохранить
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setEditingNote(true)}
            style={[styles.noteBtn, { borderColor: colors.border }]}
          >
            <Feather name="edit-3" size={16} color={colors.mutedForeground} />
            <Text style={[styles.noteBtnText, { color: colors.mutedForeground }]}>
              {noteText || "Добавить заметку"}
            </Text>
          </Pressable>
        )}

        {loan.status === "active" && (
          <View style={styles.actions}>
            <Pressable
              style={[styles.remindBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleRemind}
            >
              <Feather name="send" size={18} color={colors.foreground} />
              <Text style={[styles.remindBtnText, { color: colors.foreground }]}>
                Напомнить
              </Text>
            </Pressable>
            <Pressable
              style={[styles.returnBtn, { backgroundColor: colors.success }]}
              onPress={handleMarkReturned}
            >
              <Feather name="check-circle" size={18} color="#FFF" />
              <Text style={styles.returnBtnText}>Возвращён</Text>
            </Pressable>
          </View>
        )}

        {loan.status === "returned" && (
          <View
            style={[
              styles.returnedBanner,
              { backgroundColor: colors.success + "15", borderColor: colors.success + "40" },
            ]}
          >
            <Feather name="check-circle" size={20} color={colors.success} />
            <Text style={[styles.returnedText, { color: colors.success }]}>
              Займ закрыт. Карма растёт!
            </Text>
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
    paddingBottom: 20,
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
    paddingTop: 20,
    gap: 16,
  },
  amountBlock: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  amountValue: {
    fontSize: 44,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  amountWithInterest: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  card: {
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: -16,
    marginLeft: 0,
    marginRight: 0,
  },
  noteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  noteBtnText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  noteField: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  noteInput: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 60,
  },
  noteSaveBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  noteSaveTxt: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  remindBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
  },
  remindBtnText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  returnBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  returnBtnText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    color: "#FFF",
  },
  returnedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  returnedText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
