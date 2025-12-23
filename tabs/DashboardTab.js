import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { api } from "../services/api";
import AttendanceRow from "../components/AttendanceRow";
import { ThemeContext } from "../services/theme";

export default function DashboardTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isDark } = useContext(ThemeContext);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
      setError("");
    } catch (e) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#b91c1c" }}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>No dashboard data.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#020617" : "#f3f4f6" }]}>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Students</Text>
          <Text style={styles.cardValue}>{data.total_students}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Classes</Text>
          <Text style={styles.cardValue}>{data.total_classes}</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: "#dbeafe" }]}>
          <Text style={styles.cardLabel}>Today Present %</Text>
          <Text style={styles.cardValue}>{data.today_percentage}%</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Today P/A</Text>
          <Text style={styles.cardValue}>
            {data.today_present}/{data.today_absent}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Attendance</Text>
      {data.recent_attendance.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No attendance records yet.</Text>
        </View>
      ) : (
        <FlatList
          data={data.recent_attendance}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <AttendanceRow item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: 12,
  },
  emptyBox: {
    marginHorizontal: 12,
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  emptyText: {
    color: "#6b7280",
  },
});