const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const mongoose = require("mongoose");

//  GET: Fetch attendance records
router.get("/get-all-attendance", async (req, res) => {
  try {
    const records = await Attendance.find();

    if (!records.length) {
      return res.status(404).json({ message: " No records found" });
    }

    const groupedData = records.map(record => {
      const formattedAttendance = record.daily_attendance.map(att => ({
        date: att.date,
        present_count: att.present_count,
        total_students: att.total_students,
        attendanceRate: ((att.present_count / (att.total_students || 1)) * 100).toFixed(2) + "%"
      }));

      return {
        mod_name: record.mod_name,
        class_name: record.class_name,
        poc_name: record.poc_name,
        daily_attendance: formattedAttendance
      };
    });

    res.json(groupedData);
  } catch (err) {
    console.error(" Error:", err);
    res.status(500).json({ error: err.message });
  }
});



//get by mod id and class name 
router.get("/get-by-mod-id-and-class-name", async (req, res) => {
  try {
    let { mod_name, class_name } = req.query;

    if (!mod_name || !class_name) {
      return res.status(400).json({ message: " Missing mod_name or class_name in request." });
    }

    // Decode in case special characters are present
    class_name = decodeURIComponent(class_name);
    mod_name = decodeURIComponent(mod_name);

    // Query for attendance records
    const attendanceRecords = await Attendance.find({ mod_name, class_name });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: " No attendance records found." });
    }

    // Format the result to group attendance by module and class
    const groupedData = attendanceRecords.map(record => {
      const formattedAttendance = record.daily_attendance.map(att => ({
        date: att.date,
        present_count: att.present_count,
        total_students: att.total_students,
        attendanceRate: ((att.present_count / (att.total_students || 1)) * 100).toFixed(2) + "%"
      }));

      return {
        mod_name: record.mod_name,
        class_name: record.class_name,
        poc_name: record.poc_name,
        daily_attendance: formattedAttendance
      };
    });

    res.status(200).json(groupedData);
  } catch (error) {
    console.error(" Error fetching attendance:", error);
    res.status(500).json({ message: " Internal server error." });
  }
});



router.post("/post-attendance", async (req, res) => {
  console.log("📥 Received POST request:", req.body);

  const { mod_name, class_name, poc_name, date, present_count, total_students } = req.body;

  if (![mod_name, class_name, poc_name, date, present_count, total_students].every(Boolean)) {
    return res.status(400).json({ error: " All fields are required" });
  }

  try {
    const existingRecord = await Attendance.findOne({
      mod_name,
      class_name,
      poc_name
    });

    const attendanceData = {
      date: new Date(date),
      present_count: Number(present_count),
      total_students: Number(total_students)
    };

    if (!existingRecord) {
      // Create new document
      const newRecord = new Attendance({
        mod_name,
        class_name,
        poc_name,
        daily_attendance: [attendanceData]
      });

      await newRecord.save();
      return res.status(201).json({ message: " New attendance entry created" });
    }

    // Check if date already exists
    const dateExists = existingRecord.daily_attendance.some(
      entry => new Date(entry.date).toDateString() === new Date(date).toDateString()
    );

    if (dateExists) {
      return res.status(409).json({ error: " Attendance for this date already exists" });
    }

    // Push new date-based attendance
    existingRecord.daily_attendance.push(attendanceData);
    await existingRecord.save();

    res.status(200).json({ message: " Attendance updated for existing record" });

  } catch (err) {
    console.error(" Error:", err);
    res.status(500).json({ error: err.message });
  }
});


//  PUT: Update attendance record using request body (no URL params)
router.put("/update-attendance-by-date", async (req, res) => {
  const { mod_name, class_name, poc_name, date, present_count, total_students } = req.body;

  if (![mod_name, class_name, poc_name, date].every(Boolean)) {
    return res.status(400).json({ error: " All fields are required" });
  }

  try {
    const record = await Attendance.findOne({ mod_name, class_name, poc_name });
    if (!record) {
      return res.status(404).json({ error: " Record not found" });
    }

    const day = record.daily_attendance.find(
      d => new Date(d.date).toDateString() === new Date(date).toDateString()
    );

    if (!day) {
      return res.status(404).json({ error: " No attendance found for the given date" });
    }

    if (present_count !== undefined) day.present_count = Number(present_count);
    if (total_students !== undefined) day.total_students = Number(total_students);

    await record.save();

    res.json({ message: " Attendance updated for the date", updatedRecord: record });
  } catch (err) {
    console.error(" Error:", err);
    res.status(500).json({ error: err.message });
  }
});
  
//  DELETE: Remove attendance record
router.delete("/delete-attendance-date", async (req, res) => {
  const { mod_name, class_name, poc_name, date } = req.body;

  if (![mod_name, class_name, poc_name, date].every(Boolean)) {
    return res.status(400).json({ error: " All fields are required" });
  }

  try {
    const record = await Attendance.findOne({ mod_name, class_name, poc_name });
    if (!record) {
      return res.status(404).json({ error: " Record not found" });
    }

    const initialLength = record.daily_attendance.length;
    record.daily_attendance = record.daily_attendance.filter(
      d => new Date(d.date).toDateString() !== new Date(date).toDateString()
    );

    if (record.daily_attendance.length === initialLength) {
      return res.status(404).json({ error: " No attendance found for the given date" });
    }

    await record.save();
    res.json({ message: " Attendance entry deleted for the date" });

  } catch (err) {
    console.error(" Error:", err);
    res.status(500).json({ error: err.message });
  }
});

//  GET: Fetch by module and class
router.post("/get-by-module-id-and-module-poc-id", async (req, res) => {
  try {
    let { module_id, module_poc_id } = req.body;

    if (!module_id || !module_poc_id) {
      return res.status(400).json({
        success: false,
        message: " Both 'module_id' and 'module_poc_id' are required."
      });
    }

    module_id = module_id.trim();
    module_poc_id = module_poc_id.trim();

    const records = await Attendance.find({ module_id, module_poc_id });

    if (!records.length) {
      return res.status(404).json({
        success: false,
        message: ` No attendance records found for '${module_id}' and '${module_poc_id}'.`
      });
    }

    const formattedData = records.map(record => ({
      attendance_report_id: record.attendance_report_id,
      mod_name: record.mod_name,
      class_name: record.class_name,
      poc_name: record.poc_name,
      daily_attendance: record.daily_attendance.map(att => ({
        date: att.date,
        present_count: att.present_count,
        total_students: att.total_students,
        attendanceRate: ((att.present_count / (att.total_students || 1)) * 100).toFixed(2) + "%"
      }))
    }));

    return res.status(200).json({
      success: true,
      message: " Attendance records fetched successfully.",
      data: formattedData
    });

  } catch (error) {
    console.error(" Error while fetching attendance:", error);
    return res.status(500).json({ success: false, message: " Internal server error." });
  }
});

module.exports = router;