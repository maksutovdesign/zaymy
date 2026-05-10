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
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function BlacklistScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { blacklist, addToBlacklist, removeFromBlacklist } = useApp();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (blacklist.includes(trimmed)) {
      Alert.alert("Уже есть", "Этот контакт уже в чёрном списке");
      return;
    }
    if (Platform.OS !== "web")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await addToBlacklist(trimmed);
    setNewName("");
    setAdding(false);
  };

  const handleRemove = (name: string) => {
    Alert.alert(`Убрать «${name}»?`, "Контакт будет удалён из чёрного списка", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Убрать",
        onPress: async () => {
          if (Platform.OS !== "web") Haptics.selectionAsync();
          await removeFromBlacklist(name);
        },
      },
    ]);
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
          Чёрный список
        </Text>
        <Pressable
          onPress={() => setAdding(true)}
          style={styles.backBtn}
        >
          <Feather name="plus" size={22} color={colors.primary} />
        </Pressable>
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
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.destructive + "10", borderColor: colors.destructive + "30" },
          ]}
        >
          <Feather name="shield" size={18} color={colors.destructive} />
          <Text
            style={[styles.infoText, { color: colors.foreground }]}
          >
            Контакты в чёрном списке не смогут добавить тебя в свои займы. Ты
            можешь добавить сюда недобросовестных должников.
          </Text>
        </View>

        {adding && (
          <View
            style={[
              styles.addCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.addLabel, { color: colors.foreground }]}>
              Имя контакта
            </Text>
            <TextInput
              style={[
                styles.addInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.primary,
                  color: colors.foreground,
                },
              ]}
              placeholder="Введите имя..."
              placeholderTextColor={colors.mutedForeground}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
            <View style={styles.addActions}>
              <Pressable
                style={[styles.cancelBtn, { backgroundColor: colors.muted }]}
                onPress={() => {
                  setAdding(false);
                  setNewName("");
                }}
              >
                <Text
                  style={[
                    styles.cancelBtnText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Отмена
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.addBtn,
                  {
                    backgroundColor: newName.trim()
                      ? colors.destructive
                      : colors.muted,
                  },
                ]}
                onPress={handleAdd}
                disabled={!newName.trim()}
              >
                <Text
                  style={[
                    styles.addBtnText,
                    {
                      color: newName.trim() ? "#FFF" : colors.mutedForeground,
                    },
                  ]}
                >
                  Добавить
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {blacklist.length === 0 && !adding ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.muted },
              ]}
            >
              <Feather
                name="shield-off"
                size={36}
                color={colors.mutedForeground}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Чёрный список пуст
            </Text>
            <Text
              style={[styles.emptySub, { color: colors.mutedForeground }]}
            >
              Надеемся, он таким и останется!
            </Text>
            <Pressable
              style={[styles.emptyBtn, { borderColor: colors.primary }]}
              onPress={() => setAdding(true)}
            >
              <Feather name="plus" size={16} color={colors.primary} />
              <Text
                style={[styles.emptyBtnText, { color: colors.primary }]}
              >
                Добавить контакт
              </Text>
            </Pressable>
          </View>
        ) : (
          blacklist.length > 0 && (
            <View
              style={[
                styles.listCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[styles.listCount, { color: colors.mutedForeground }]}
              >
                {blacklist.length}{" "}
                {blacklist.length === 1 ? "контакт" : "контактов"}
              </Text>
              {blacklist.map((name, idx) => (
                <View key={name}>
                  {idx > 0 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  )}
                  <View style={styles.listRow}>
                    <View
                      style={[
                        styles.listAvatar,
                        { backgroundColor: colors.destructive + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.listInitial,
                          { color: colors.destructive },
                        ]}
                      >
                        {name[0]?.toUpperCase() ?? "?"}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.listName,
                        { color: colors.foreground },
                      ]}
                    >
                      {name}
                    </Text>
                    <Pressable
                      onPress={() => handleRemove(name)}
                      style={[
                        styles.removeBtn,
                        {
                          backgroundColor: colors.destructive + "15",
                        },
                      ]}
                    >
                      <Feather
                        name="x"
                        size={14}
                        color={colors.destructive}
                      />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )
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
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
  },
  addCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  addLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  addInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  addActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  addBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 8,
  },
  emptyBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 16,
  },
  listCount: { fontSize: 12, fontFamily: "Inter_400Regular", paddingVertical: 12 },
  listRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  listAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  listInitial: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  listName: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  removeBtn: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  divider: { height: 1 },
});
