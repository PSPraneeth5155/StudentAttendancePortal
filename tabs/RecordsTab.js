import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
} from "react-native";
import AttendanceRow from "../components/AttendanceRow";
import { api } from "../services/api";

export default function RecordsTab() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState("");
  const [subject, setSubject] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState("");

  const loadStudents = async () => {
    try {
      const list = await api.getStudents();
      setStudents(list);
    } catch {
    }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (studentId) params.student_id = Number(studentId);
      if (date) params.date = date;
      if (subject) params.subject = subject;
      const recs = await api.getAttendance(params);
      setRecords(recs);
      setMessage("");
      if (studentId) {
        try {
          const s = await api.getAttendanceByStudent(Number(studentId));
          setSummary(s);
        } catch {
          setSummary(null);
        }
      } else {
        setSummary(null);
      }
    } catch (e) {
      setMessage("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    loadRecords();
  }, []);

  const onFilterChange = async () => {
    await loadRecords();
  };

  const studentName =
    students.find((s) => s.id === Number(studentId))?.name || "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Records</Text>

      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Student ID (optional)"
          value={studentId}
          onChangeText={setStudentId}
          onEndEditing={onFilterChange}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          onEndEditing={onFilterChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
          onEndEditing={onFilterChange}
        />
      </View>

      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {studentName || summary.student.name}
          </Text>
          <Text style={styles.summaryText}>
            Present: {summary.total_present} | Absent: {summary.total_absent}
          </Text>
          <Text style={styles.summaryText}>
            Percentage: {summary.percentage}%
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text>Loading records...</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No records match filters.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <AttendanceRow item={item} />}
        />
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8 },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 12,
    marginBottom: 4,
  },
  filters: { paddingHorizontal: 12, marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyBox: {
    marginHorizontal: 12,
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  emptyText: { color: "#6b7280" },
  summaryCard: {
    marginHorizontal: 12,
    marginBottom: 6,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: 10,
  },
  summaryTitle: { fontSize: 15, fontWeight: "600" },
  summaryText: { fontSize: 13, color: "#374151" },
  message: {
    textAlign: "center",
    marginBottom: 8,
    color: "#4b5563",
  },
});