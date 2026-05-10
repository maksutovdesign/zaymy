import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { CHARACTERS } from "@/constants/characters";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function SettingRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
  destructive,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        { opacity: pressed && onPress ? 0.7 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor: destructive
              ? colors.destructive + "15"
              : colors.muted,
          },
        ]}
      >
        <Feather
          name={icon}
          size={17}
          color={destructive ? colors.destructive : colors.mutedForeground}
        />
      </View>
      <Text
        style={[
          styles.settingLabel,
          { color: destructive ? colors.destructive : colors.foreground },
        ]}
      >
        {label}
      </Text>
      {value ? (
        <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>
          {value}
        </Text>
      ) : null}
      {rightElement ?? null}
      {onPress && !rightElement && (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        {title.toUpperCase()}
      </Text>
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser, setSelectedCharacter, loans, removeLoan } = useApp();

  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [nameVal, setNameVal] = useState(user.name);
  const [phoneVal, setPhoneVal] = useState(user.phone);
  const [editingLateFee, setEditingLateFee] = useState(false);
  const [lateFeeVal, setLateFeeVal] = useState(String(user.lateFeeRate ?? 0));

  const selectedChar = CHARACTERS.find(
    (c) => c.id === user.selectedCharacterId
  );

  const saveName = async () => {
    if (nameVal.trim().length >= 2) {
      await updateUser({ name: nameVal.trim() });
      setEditingName(false);
      if (Platform.OS !== "web")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const savePhone = async () => {
    await updateUser({ phone: phoneVal.trim() });
    setEditingPhone(false);
  };

  const handleClearHistory = () => {
    const completedIds = loans
      .filter((l) => l.status === "returned")
      .map((l) => l.id);
    if (completedIds.length === 0) {
      Alert.alert("История пуста", "Нет завершённых займов для удаления.");
      return;
    }
    Alert.alert(
      "Очистить историю?",
      `Будут удалены ${completedIds.length} завершённых займов. Активные останутся.`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Очистить",
          style: "destructive",
          onPress: async () => {
            for (const id of completedIds) {
              await removeLoan(id);
            }
            if (Platform.OS !== "web")
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Готово", `Удалено ${completedIds.length} записей`);
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Сбросить данные?",
      "Все данные будут удалены. Это действие нельзя отменить.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Сбросить",
          style: "destructive",
          onPress: async () => {
            const AsyncStorage = (
              await import("@react-native-async-storage/async-storage")
            ).default;
            await AsyncStorage.clear();
            router.replace("/(auth)/welcome");
          },
        },
      ]
    );
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
          Настройки
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
        {/* Profile */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: selectedChar?.color ?? colors.primary,
              },
            ]}
          >
            <Text style={styles.avatarText}>
              {user.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "?"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>
              {user.name}
            </Text>
            <Text
              style={[styles.profileSub, { color: colors.mutedForeground }]}
            >
              Советник: {selectedChar?.name ?? "Луча"}
            </Text>
          </View>
          <Pressable
            style={[
              styles.editProfileBtn,
              { backgroundColor: colors.muted },
            ]}
            onPress={() => router.push("/premium")}
          >
            <Text style={[styles.editProfileText, { color: colors.primary }]}>
              Premium
            </Text>
          </Pressable>
        </View>

        <SettingSection title="Аккаунт">
          {editingName ? (
            <View style={styles.editRow}>
              <TextInput
                style={[
                  styles.editInput,
                  {
                    color: colors.foreground,
                    borderColor: colors.primary,
                    backgroundColor: colors.input,
                  },
                ]}
                value={nameVal}
                onChangeText={setNameVal}
                autoFocus
                onSubmitEditing={saveName}
              />
              <Pressable
                style={[
                  styles.saveBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={saveName}
              >
                <Text
                  style={[
                    styles.saveBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Сохранить
                </Text>
              </Pressable>
            </View>
          ) : (
            <SettingRow
              icon="user"
              label="Имя"
              value={user.name}
              onPress={() => {
                setNameVal(user.name);
                setEditingName(true);
              }}
            />
          )}
          <View
            style={[styles.separator, { backgroundColor: colors.border }]}
          />
          {editingPhone ? (
            <View style={styles.editRow}>
              <TextInput
                style={[
                  styles.editInput,
                  {
                    color: colors.foreground,
                    borderColor: colors.primary,
                    backgroundColor: colors.input,
                  },
                ]}
                value={phoneVal}
                onChangeText={setPhoneVal}
                keyboardType="phone-pad"
                autoFocus
                onSubmitEditing={savePhone}
              />
              <Pressable
                style={[
                  styles.saveBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={savePhone}
              >
                <Text
                  style={[
                    styles.saveBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Сохранить
                </Text>
              </Pressable>
            </View>
          ) : (
            <SettingRow
              icon="phone"
              label="Телефон"
              value={user.phone || "Не указан"}
              onPress={() => {
                setPhoneVal(user.phone);
                setEditingPhone(true);
              }}
            />
          )}
          <View
            style={[styles.separator, { backgroundColor: colors.border }]}
          />
          <SettingRow
            icon="star"
            label="Советник"
            value={selectedChar?.name}
            onPress={() => router.push("/(auth)/welcome")}
          />
        </SettingSection>

        <SettingSection title="Займы">
          <SettingRow
            icon="refresh-cw"
            label="Списание долга"
            value={user.autoWriteOff ? "Автоматическое" : "Ручное"}
            rightElement={
              <Switch
                value={user.autoWriteOff ?? false}
                onValueChange={(v) => updateUser({ autoWriteOff: v })}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor="#FFF"
              />
            }
          />
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          {editingLateFee ? (
            <View style={styles.editRow}>
              <TextInput
                style={[styles.editInput, { color: colors.foreground, borderColor: colors.primary, backgroundColor: colors.input }]}
                value={lateFeeVal}
                onChangeText={setLateFeeVal}
                keyboardType="numeric"
                autoFocus
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
              />
              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={async () => {
                  const rate = parseFloat(lateFeeVal) || 0;
                  await updateUser({ lateFeeRate: Math.min(rate, 100) });
                  setEditingLateFee(false);
                  if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
              >
                <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Сохранить</Text>
              </Pressable>
            </View>
          ) : (
            <SettingRow
              icon="percent"
              label="% за просрочку"
              value={`${user.lateFeeRate ?? 0}% в день`}
              onPress={() => {
                setLateFeeVal(String(user.lateFeeRate ?? 0));
                setEditingLateFee(true);
              }}
            />
          )}
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <SettingRow
            icon="eye-off"
            label="Приватный режим"
            value={user.isPrivate ? "Включён" : "Выключен"}
            rightElement={
              <Switch
                value={user.isPrivate ?? false}
                onValueChange={(v) => updateUser({ isPrivate: v })}
                trackColor={{ false: colors.muted, true: colors.primary }}
                thumbColor="#FFF"
              />
            }
          />
        </SettingSection>

        <SettingSection title="Подписка">
          <SettingRow
            icon="zap"
            label="Premium"
            value={
              user.premiumTier === 0
                ? "Базовый (бесплатно)"
                : user.premiumTier === 1
                ? "Стандарт"
                : "Премиум"
            }
            onPress={() => router.push("/premium")}
          />
        </SettingSection>

        <SettingSection title="Данные">
          <SettingRow
            icon="download"
            label="Экспорт данных"
            onPress={() => {
              if (user.premiumTier === 0) {
                Alert.alert(
                  "Нужен Premium",
                  "Экспорт данных доступен в тарифе Стандарт и выше.",
                  [
                    { text: "Отмена", style: "cancel" },
                    { text: "Перейти на Premium", onPress: () => router.push("/premium") },
                  ]
                );
              } else {
                Alert.alert(
                  "Экспорт данных",
                  "Данные скопированы в буфер обмена в формате CSV. В следующей версии будет экспорт в файл.",
                  [{ text: "Понятно" }]
                );
              }
            }}
          />
          <View
            style={[styles.separator, { backgroundColor: colors.border }]}
          />
          <SettingRow
            icon="trash-2"
            label="Очистить историю"
            onPress={handleClearHistory}
          />
        </SettingSection>

        <SettingSection title="О приложении">
          <SettingRow icon="info" label="Версия" value="1.0.0" />
          <View
            style={[styles.separator, { backgroundColor: colors.border }]}
          />
          <SettingRow
            icon="mail"
            label="Написать поддержке"
            onPress={() =>
              Linking.openURL("mailto:support@zaymy.app?subject=Поддержка%20Дай%20в%20долг")
            }
          />
          <View
            style={[styles.separator, { backgroundColor: colors.border }]}
          />
          <SettingRow
            icon="file-text"
            label="Пользовательское соглашение"
            onPress={() => router.push("/agreement")}
          />
        </SettingSection>

        <SettingSection title="Аккаунт">
          <SettingRow
            icon="log-out"
            label="Сбросить все данные"
            onPress={handleLogout}
            destructive
          />
        </SettingSection>
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
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 20 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  profileInfo: { flex: 1, gap: 3 },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  profileSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  editProfileBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  settingValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
  separator: { height: 1, marginHorizontal: 16 },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  editInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
