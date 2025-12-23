from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from models import (
    StudentCreate,
    Student,
    AttendanceCreate,
    Attendance,
    DashboardStats,
    AttendanceFilter,
    AttendanceSummary,
)
from attendance_service import (
    create_student,
    list_students,
    delete_student,
    create_attendance_bulk,
    list_attendance,
    get_attendance_by_student,
    get_dashboard_stats,
    reset_all_data,
)

app = FastAPI(title="AttendSmart API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.post("/students", response_model=Student)
def api_create_student(student: StudentCreate):
    return create_student(student)


@app.get("/students", response_model=List[Student])
def api_list_students():
    return list_students()


@app.delete("/students/{student_id}")
def api_delete_student(student_id: int):
    delete_student(student_id)
    return {"detail": "Student deleted"}


@app.post("/attendance", response_model=List[Attendance])
def api_create_attendance(records: List[AttendanceCreate]):
    if not records:
        raise HTTPException(status_code=400, detail="No attendance records provided")
    return create_attendance_bulk(records)


@app.get("/attendance", response_model=List[Attendance])
def api_list_attendance(
    student_id: Optional[int] = None,
    date: Optional[str] = None,
    subject: Optional[str] = None,
):
    f = AttendanceFilter(student_id=student_id, date=date, subject=subject)
    return list_attendance(f)


@app.get("/attendance/student/{student_id}", response_model=AttendanceSummary)
def api_attendance_by_student(student_id: int):
    try:
        return get_attendance_by_student(student_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Student not found")


@app.get("/dashboard", response_model=DashboardStats)
def api_dashboard():
    return get_dashboard_stats()


@app.post("/admin/reset")
def api_reset_all():
    reset_all_data()
    return {"detail": "All data reset"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
