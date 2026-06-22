import { reloadAppAsync } from "expo";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ resetError }: ErrorFallbackProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch {
      resetError();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          काहीतरी चुकले 😕
        </Text>
        <Text style={[styles.message, { color: colors.mutedForeground }]}>
          App reload करा.
        </Text>
        <Pressable
          onPress={handleRestart}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
            पुन्हा सुरू करा
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  content: { alignItems: "center", gap: 16, width: "100%", maxWidth: 400 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  message: { fontSize: 16, textAlign: "center" },
  button: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, minWidth: 180 },
  buttonText: { fontWeight: "600", textAlign: "center", fontSize: 16 },
});
