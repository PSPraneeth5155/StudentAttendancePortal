import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function StudentCard({ student, onPress, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{student.name}</Text>
        {onDelete && (
          <TouchableOpacity onPress={onDelete}>
            <Text style={styles.delete}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.meta}>Roll: {student.roll_number}</Text>
      <Text style={styles.meta}>Class: {student.class_name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    marginHorizontal: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
    color: "#6b7280",
  },
  delete: {
    fontSize: 12,
    color: "#dc2626",
  },
});
