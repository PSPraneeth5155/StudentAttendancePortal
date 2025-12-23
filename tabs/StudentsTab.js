import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import StudentCard from "../components/StudentCard";
import { api } from "../services/api";

export default function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [className, setClassName] = useState("");
  const [selected, setSelected] = useState(null);
  const [studentSummary, setStudentSummary] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
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
    load();
  }, []);

  const onAdd = async () => {
    if (!name.trim() || !roll.trim() || !className.trim()) {
      setMessage("Please fill all fields");
      return;
    }
    try {
      await api.createStudent({
        name: name.trim(),
        roll_number: roll.trim(),
        class_name: className.trim(),
      });
      setName("");
      setRoll("");
      setClassName("");
      setModalVisible(false);
      await load();
    } catch (e) {
      setMessage("Failed to add student");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.deleteStudent(id);
      await load();
    } catch (e) {
      setMessage("Failed to delete");
    }
  };

  const openDetails = async (student) => {
    setSelected(student);
    setDetailLoading(true);
    setStudentSummary(null);
    try {
      const summary = await api.getAttendanceByStudent(student.id);
      setStudentSummary(summary);
    } catch (e) {
      setStudentSummary(null);
    } finally {
      setDetailLoading(false);
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

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Students</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No students found.</Text>
          <Text style={styles.emptyText}>
            Tap "Add" to create the first student.
          </Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <StudentCard
              student={item}
              onPress={() => openDetails(item)}
              onDelete={() => onDelete(item.id)}
            />
          )}
        />
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Student</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Roll Number"
              value={roll}
              onChangeText={setRoll}
            />
            <TextInput
              style={styles.input}
              placeholder="Class (e.g. CS-A)"
              value={className}
              onChangeText={setClassName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#e5e7eb" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2563eb" }]}
                onPress={onAdd}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailContent}>
            {selected && (
              <>
                <Text style={styles.modalTitle}>{selected.name}</Text>
                <Text style={styles.detailText}>
                  Roll: {selected.roll_number}
                </Text>
                <Text style={styles.detailText}>
                  Class: {selected.class_name}
                </Text>
                {detailLoading ? (
                  <View style={{ marginTop: 8 }}>
                    <ActivityIndicator size="small" color="#2563eb" />
                    <Text>Loading attendance...</Text>
                  </View>
                ) : studentSummary ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.detailText}>
                      Present: {studentSummary.total_present} | Absent:{" "}
                      {studentSummary.total_absent}
                    </Text>
                    <Text style={styles.detailText}>
                      Attendance: {studentSummary.percentage}%
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.detailText}>
                    No attendance records yet.
                  </Text>
                )}
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { marginTop: 16, backgroundColor: "#2563eb" },
                  ]}
                  onPress={() => setSelected(null)}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: "600" },
  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addText: { color: "#fff", fontWeight: "600" },
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
  message: {
    textAlign: "center",
    marginBottom: 8,
    color: "#4b5563",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },
  detailContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  detailText: { fontSize: 13, color: "#374151", marginTop: 2 },
});