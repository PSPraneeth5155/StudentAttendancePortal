import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { api } from "../services/api";

export default function MarkAttendanceTab() {
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      const list = await api.getStudents();
      setStudents(list);
      setMessage("");
    } catch (e) {
      setMessage("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = className
    ? students.filter((s) =>
        s.class_name.toLowerCase().includes(className.toLowerCase())
      )
    : students;

  const toggleStatus = (id) => {
    setStatusMap((prev) => {
      const current = prev[id] || "Present";
      return {
        ...prev,
        [id]: current === "Present" ? "Absent" : "Present",
      };
    });
  };

  const onSubmit = async () => {
    if (!subject.trim()) {
      setMessage("Please enter subject");
      return;
    }
    if (filteredStudents.length === 0) {
      setMessage("No students to mark");
      return;
    }
    setSubmitting(true);
    try {
      const isoDate = date.toISOString().slice(0, 10);
      const payload = filteredStudents.map((s) => ({
        student_id: s.id,
        date: isoDate,
        subject: subject.trim(),
        status: statusMap[s.id] || "Present",
      }));
      await api.createAttendanceBulk(payload);
      setMessage("Attendance submitted");
    } catch (e) {
      setMessage("Failed to submit attendance");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Loading students...</Text>
      </View>
    );
  }

  if (students.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 8 }}>No students found.</Text>
        <Text style={{ color: "#6b7280" }}>
          Please add students from the Students tab.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Filter by class (e.g. CS-A)"
          value={className}
          onChangeText={setClassName}
        />
        <TextInput
          style={styles.input}
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
        />
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateText}>
            Date: {date.toISOString().slice(0, 10)}
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.sectionTitle}>
        Students ({filteredStudents.length})
      </Text>
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const status = statusMap[item.id] || "Present";
          const isPresent = status === "Present";
          return (
            <View style={styles.row}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.roll_number}  {item.class_name}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.statusChip,
                  { backgroundColor: isPresent ? "#bbf7d0" : "#fecaca" },
                ]}
                onPress={() => toggleStatus(item.id)}
              >
                <Text
                  style={{
                    color: isPresent ? "#166534" : "#991b1b",
                    fontWeight: "600",
                  }}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={[styles.submitButton, submitting && { opacity: 0.6 }]}
        onPress={onSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>
          {submitting ? "Submitting..." : "Submit Attendance"}
        </Text>
      </TouchableOpacity>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  filters: { paddingHorizontal: 12 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: "#374151",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  name: { fontSize: 14, fontWeight: "500" },
  meta: { fontSize: 12, color: "#6b7280" },
  statusChip: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  submitButton: {
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "600" },
  message: {
    textAlign: "center",
    marginBottom: 8,
    color: "#4b5563",
  },
});