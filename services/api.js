const BASE_URL = "http://10.101.158.41:8000";  // Replace with YOUR IP

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
}

export const api = {
  async getDashboard() {
    const res = await fetch(`${BASE_URL}/dashboard`);
    return handleResponse(res);
  },

  async getStudents() {
    const res = await fetch(`${BASE_URL}/students`);
    return handleResponse(res);
  },

  async createStudent(payload) {
    const res = await fetch(`${BASE_URL}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteStudent(id) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Delete failed");
    }
    return res.json();
  },

  async createAttendanceBulk(records) {
    const res = await fetch(`${BASE_URL}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(records),
    });
    return handleResponse(res);
  },

  async getAttendance(params = {}) {
    const qs = new URLSearchParams();
    if (params.student_id) qs.append("student_id", params.student_id);
    if (params.date) qs.append("date", params.date);
    if (params.subject) qs.append("subject", params.subject);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    const res = await fetch(`${BASE_URL}/attendance${query}`);
    return handleResponse(res);
  },

  async getAttendanceByStudent(id) {
    const res = await fetch(`${BASE_URL}/attendance/student/${id}`);
    return handleResponse(res);
  },

  async resetAll() {
    const res = await fetch(`${BASE_URL}/admin/reset`, {
      method: "POST",
    });
    return handleResponse(res);
  },
};
