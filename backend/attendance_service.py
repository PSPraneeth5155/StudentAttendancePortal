from typing import List, Optional, Tuple
from datetime import date as date_cls

from database import get_connection
from models import (
    StudentCreate,
    Student,
    AttendanceCreate,
    Attendance,
    DashboardStats,
    AttendanceFilter,
    AttendanceSummary,
)


def create_student(data: StudentCreate) -> Student:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO students (name, roll_number, class_name) VALUES (?, ?, ?)",
        (data.name, data.roll_number, data.class_name),
    )
    conn.commit()
    student_id = cur.lastrowid
    cur.execute(
        "SELECT id, name, roll_number, class_name FROM students WHERE id = ?",
        (student_id,),
    )
    row = cur.fetchone()
    conn.close()
    return Student(id=row["id"], name=row["name"], roll_number=row["roll_number"], class_name=row["class_name"])


def list_students() -> List[Student]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, roll_number, class_name FROM students ORDER BY class_name, roll_number")
    rows = cur.fetchall()
    conn.close()
    return [
        Student(id=r["id"], name=r["name"], roll_number=r["roll_number"], class_name=r["class_name"])
        for r in rows
    ]


def delete_student(student_id: int) -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM attendance WHERE student_id = ?", (student_id,))
    cur.execute("DELETE FROM students WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()


def create_attendance_bulk(records: List[AttendanceCreate]) -> List[Attendance]:
    conn = get_connection()
    cur = conn.cursor()
    created: List[Attendance] = []
    for rec in records:
        cur.execute(
            """
            INSERT INTO attendance (student_id, date, subject, status)
            VALUES (?, ?, ?, ?)
            """,
            (rec.student_id, rec.date, rec.subject, rec.status),
        )
        attendance_id = cur.lastrowid
        cur.execute(
            "SELECT id, student_id, date, subject, status FROM attendance WHERE id = ?",
            (attendance_id,),
        )
        row = cur.fetchone()
        created.append(
            Attendance(
                id=row["id"],
                student_id=row["student_id"],
                date=row["date"],
                subject=row["subject"],
                status=row["status"],
            )
        )
    conn.commit()
    conn.close()
    return created


def list_attendance(f: AttendanceFilter) -> List[Attendance]:
    conn = get_connection()
    cur = conn.cursor()

    query = "SELECT id, student_id, date, subject, status FROM attendance WHERE 1=1"
    params: List = []

    if f.student_id is not None:
        query += " AND student_id = ?"
        params.append(f.student_id)
    if f.date is not None:
        query += " AND date = ?"
        params.append(f.date)
    if f.subject is not None:
        query += " AND subject = ?"
        params.append(f.subject)

    query += " ORDER BY date DESC, subject"

    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    return [
        Attendance(
            id=r["id"],
            student_id=r["student_id"],
            date=r["date"],
            subject=r["subject"],
            status=r["status"],
        )
        for r in rows
    ]


def get_attendance_by_student(student_id: int) -> AttendanceSummary:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id, name, roll_number, class_name FROM students WHERE id = ?",
        (student_id,),
    )
    srow = cur.fetchone()
    if not srow:
        conn.close()
        raise ValueError("Student not found")

    cur.execute(
        "SELECT id, student_id, date, subject, status FROM attendance WHERE student_id = ? ORDER BY date DESC",
        (student_id,),
    )
    rows = cur.fetchall()

    total_present = sum(1 for r in rows if r["status"] == "Present")
    total_absent = sum(1 for r in rows if r["status"] == "Absent")
    total = total_present + total_absent
    percentage = (total_present / total * 100.0) if total > 0 else 0.0

    conn.close()

    student = Student(
        id=srow["id"],
        name=srow["name"],
        roll_number=srow["roll_number"],
        class_name=srow["class_name"],
    )
    records = [
        Attendance(
            id=r["id"],
            student_id=r["student_id"],
            date=r["date"],
            subject=r["subject"],
            status=r["status"],
        )
        for r in rows
    ]

    return AttendanceSummary(
        student=student,
        total_present=total_present,
        total_absent=total_absent,
        percentage=round(percentage, 2),
        records=records,
    )


def get_dashboard_stats() -> DashboardStats:
    today = date_cls.today().isoformat()
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) AS c FROM students")
    total_students = cur.fetchone()["c"]

    cur.execute("SELECT COUNT(DISTINCT class_name) AS c FROM students")
    total_classes = cur.fetchone()["c"]

    cur.execute(
        "SELECT COUNT(*) AS c FROM attendance WHERE date = ? AND status = 'Present'",
        (today,),
    )
    today_present = cur.fetchone()["c"]

    cur.execute(
        "SELECT COUNT(*) AS c FROM attendance WHERE date = ? AND status = 'Absent'",
        (today,),
    )
    today_absent = cur.fetchone()["c"]

    total_today = today_present + today_absent
    today_percentage = (today_present / total_today * 100.0) if total_today > 0 else 0.0

    cur.execute(
        """
        SELECT id, student_id, date, subject, status
        FROM attendance
        ORDER BY date DESC, id DESC
        LIMIT 10
        """
    )
    rows = cur.fetchall()
    conn.close()

    recent = [
        Attendance(
            id=r["id"],
            student_id=r["student_id"],
            date=r["date"],
            subject=r["subject"],
            status=r["status"],
        )
        for r in rows
    ]

    return DashboardStats(
        total_students=total_students,
        total_classes=total_classes,
        today_present=today_present,
        today_absent=today_absent,
        today_percentage=round(today_percentage, 2),
        recent_attendance=recent,
    )


def reset_all_data() -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM attendance")
    cur.execute("DELETE FROM students")
    conn.commit()
    conn.close()
