from pydantic import BaseModel
from typing import List, Optional


class StudentBase(BaseModel):
    name: str
    roll_number: str
    class_name: str


class StudentCreate(StudentBase):
    pass


class Student(StudentBase):
    id: int

    class Config:
        orm_mode = True


class AttendanceBase(BaseModel):
    student_id: int
    date: str
    subject: str
    status: str


class AttendanceCreate(AttendanceBase):
    pass


class Attendance(AttendanceBase):
    id: int

    class Config:
        orm_mode = True


class DashboardStats(BaseModel):
    total_students: int
    total_classes: int
    today_present: int
    today_absent: int
    today_percentage: float
    recent_attendance: List[Attendance]


class AttendanceFilter(BaseModel):
    student_id: Optional[int] = None
    date: Optional[str] = None
    subject: Optional[str] = None


class AttendanceSummary(BaseModel):
    student: Student
    total_present: int
    total_absent: int
    percentage: float
    records: List[Attendance]
