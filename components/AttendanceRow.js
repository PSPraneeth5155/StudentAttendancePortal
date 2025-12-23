import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AttendanceRow({ item }) {
  const isPresent = item.status === "Present";
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={styles.meta}>{item.date}</Text>
      </View>
      <View
        style={[
          styles.badge,
          { backgroundColor: isPresent ? "#bbf7d0" : "#fecaca" },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: isPresent ? "#166534" : "#991b1b" },
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  left: {
    flexDirection: "column",
  },
  subject: {
    fontSize: 14,
    fontWeight: "500",
  },
  meta: {
    fontSize: 12,
    color: "#6b7280",
  },
  badge: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
