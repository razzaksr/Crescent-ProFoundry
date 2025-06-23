const mongoose = require("mongoose");

const DayAttendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  present_count: { type: Number, required: true },
  total_students: { type: Number, required: true }
}, { _id: false });

const AttendanceSchema = new mongoose.Schema({
  mod_name: { type: String, required: true },
  class_name: { type: String, required: true },
  poc_name: { type: String, required: true },
  daily_attendance: [DayAttendanceSchema]  // ✅ Embedded day-by-day attendance
}, { timestamps: true });

// ✅ Unique constraint to avoid duplicates
AttendanceSchema.index({ mod_name: 1, class_name: 1, poc_name: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema, "student_attendance");