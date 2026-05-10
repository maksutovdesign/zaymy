import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Character, TipContext } from "@/constants/characters";
import { useColors } from "@/hooks/useColors";

interface Props {
  character: Character;
  context: TipContext;
  onDismiss?: () => void;
  style?: object;
}

export function CharacterBubble({ character, context, onDismiss, style }: Props) {
  const colors = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 90,
        friction: 9,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, []);

  const tip = character.tips[context];

  return (
    <Animated.View
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        style,
      ]}
    >
      {/* Avatar row sits above the bubble */}
      <View style={styles.avatarRow}>
        <View style={[styles.avatar, { backgroundColor: character.color }]}>
          <Text style={styles.avatarText}>{character.initial}</Text>
        </View>
        <View style={styles.nameLine}>
          <Text style={[styles.name, { color: character.color }]}>{character.name}</Text>
          <Text style={[styles.role, { color: colors.mutedForeground }]}>{character.role}</Text>
        </View>
        {onDismiss && (
          <Pressable onPress={onDismiss} hitSlop={10} style={styles.dismissBtn}>
            <Text style={[styles.dismissText, { color: colors.mutedForeground }]}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Tail */}
      <View style={styles.tailWrap}>
        <View style={[styles.tailOuter, { borderBottomColor: character.color + "40" }]} />
        <View style={[styles.tailInner, { borderBottomColor: colors.card }]} />
      </View>

      {/* Bubble */}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: colors.card,
            borderColor: character.color + "40",
          },
        ]}
      >
        <Text style={[styles.tip, { color: colors.foreground }]}>{tip}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 4,
    marginBottom: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
  },
  nameLine: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  role: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  dismissBtn: {
    padding: 4,
  },
  dismissText: {
    fontSize: 14,
  },
  tailWrap: {
    marginLeft: 18,
    width: 16,
    height: 10,
    position: "relative",
  },
  tailOuter: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  tailInner: {
    position: "absolute",
    left: 1.5,
    top: 1.5,
    width: 0,
    height: 0,
    borderLeftWidth: 6.5,
    borderRightWidth: 6.5,
    borderBottomWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  bubble: {
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1.5,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  tip: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
});
