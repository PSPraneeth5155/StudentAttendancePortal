import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from "react-native";
import { ThemeContext } from "../services/theme";
import { api } from "../services/api";

export default function SettingsTab() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [resetting, setResetting] = useState(false);

  const onReset = async () => {
    Alert.alert(
      "Reset Data",
      "This will delete all students and attendance records. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setResetting(true);
            try {
              await api.resetAll();
              Alert.alert("Done", "All data has been reset.");
            } catch (e) {
              Alert.alert("Error", "Failed to reset data.");
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>AttendSmart</Text>
        <Text style={styles.subtitle}>
          A simple academic attendance manager for teachers and students.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowText}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowText}>Reset All Data</Text>
          <TouchableOpacity
            style={[
              styles.resetButton,
              resetting && { opacity: 0.6 },
            ]}
            onPress={onReset}
            disabled={resetting}
          >
            <Text style={styles.resetText}>
              {resetting ? "Resetting..." : "Reset"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Backend: FastAPI + SQLite</Text>
        <Text style={styles.footerText}>Frontend: Expo React Native</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "#4b5563", marginTop: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  rowText: { fontSize: 14 },
  resetButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetText: { color: "#fff", fontWeight: "600" },
  footer: {
    marginTop: 12,
    alignItems: "center",
  },
  footerText: { fontSize: 12, color: "#6b7280" },
});