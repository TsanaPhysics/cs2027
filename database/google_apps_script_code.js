/**
 * ==============================================================================
 * Google Apps Script for Course 4124941 Computational Science, RBRU
 * Script: รับข้อมูลการส่งงานของนักศึกษาจากระบบเว็บแอป แล้วบันทึกลง Google Sheet อัตโนมัติ
 * อาจารย์ผู้สอน: ผศ.ดร.ชีวะ ทัศนา (คณะครุศาสตร์ / คณะวิทยาศาสตร์และเทคโนโลยี)
 * ==============================================================================
 * 
 * วิธีการติดตั้ง (ใช้เวลา 1 นาที):
 * 1. เปิด Google Sheets ใหม่ (https://sheets.new) ตั้งชื่อไฟล์ เช่น "ผลการส่งงานวิชาวิทยาการคำนวณ_2570"
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมทั้งหมด แล้วคัดลอกโค้ดนี้ไปวางทับ
 * 4. กดปุ่ม "บันทึก" (รูปแผ่นดิสก์)
 * 5. กดปุ่มสีน้ำเงิน "ทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้รายการใหม่" (New deployment)
 * 6. เลือกประเภท: "เว็บแอป" (Web app)
 * 7. ตั้งค่า:
 *    - คำอธิบาย: "CT Student Submissions Webhook"
 *    - ดำเนินการในฐานะ: "ฉัน" (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง: "ทุกคน" (Anyone)   *** สำคัญมาก ต้องเลือก Anyone ***
 * 8. กด "ทำให้ใช้งานได้" (Deploy) แล้วคัดลอก "URL เว็บแอป" (Web App URL) ที่ขึ้นต้นด้วย:
 *    https://script.google.com/macros/s/.../exec
 * 9. นำ URL นั้นมาใส่ในช่องตั้งค่า Google Sheets บนหน้าเว็บระบบได้ทันที!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // รอคิวไม่เกิน 10 วินาทีเพื่อป้องกันข้อมูลชนกัน
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // ตรวจสอบและสร้างหัวตาราง (Header) อัตโนมัติในแถวที่ 1 หากยังไม่มี
    if (sheet.getLastRow() === 0) {
      setupSheetHeaders(sheet);
    }
    
    // แปลงข้อมูล JSON ที่ส่งมาจาก PHP
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    
    var timestamp = new Date();
    var submissionId = data.submission_id || "-";
    var studentId = data.student_id || "-";
    var studentName = data.student_name || "-";
    var week = data.week ? "สัปดาห์ที่ " + data.week : "-";
    var assignmentTitle = data.assignment_title || "-";
    var workLink = data.work_link || "";
    
    var scores = data.scores || {};
    var sDecomp = scores.decomp !== undefined ? scores.decomp : 0;
    var sPattern = scores.pattern !== undefined ? scores.pattern : 0;
    var sAbstr = scores.abstr !== undefined ? scores.abstr : 0;
    var sAlgo = scores.algo !== undefined ? scores.algo : 0;
    var sTotal = scores.total !== undefined ? scores.total : 0;
    var grade = scores.grade || "-";
    var cognitive = data.cognitive_level || "-";
    
    var feedback = data.personalized_feedback || "-";
    var strengths = data.strengths || "-";
    var growthAreas = data.growth_areas || "-";
    
    var input = data.student_input || {};
    var ansDecomp = input.decomp || "";
    var ansPattern = input.pattern || "";
    var ansAbstr = input.abstr || "";
    var ansAlgo = input.algo || "";
    var ansReflect = input.reflection || "";
    
    // เพิ่มแถวข้อมูลใหม่
    sheet.appendRow([
      timestamp,
      submissionId,
      studentId,
      studentName,
      week,
      assignmentTitle,
      workLink,
      sDecomp,
      sPattern,
      sAbstr,
      sAlgo,
      sTotal,
      grade,
      cognitive,
      feedback,
      strengths,
      growthAreas,
      ansDecomp,
      ansPattern,
      ansAbstr,
      ansAlgo,
      ansReflect
    ]);
    
    // จัดรูปแบบแถวล่าสุด (Wrap text & Alignment)
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
    sheet.getRange(lastRow, 8, 1, 5).setHorizontalAlignment("center");
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "บันทึกลง Google Sheet สำเร็จ",
      row: lastRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Google Apps Script Webhook สำหรับวิชา 4124941 พร้อมทำงาน 100%"
  })).setMimeType(ContentService.MimeType.JSON);
}

function setupSheetHeaders(sheet) {
  var headers = [
    "วัน-เวลาบันทึก",
    "รหัสการส่ง (ID)",
    "รหัสนักศึกษา",
    "ชื่อ-นามสกุล",
    "สัปดาห์",
    "หัวข้องาน / กิจกรรม",
    "ลิงก์ผลงาน (URL)",
    "Decomposition (5)",
    "Pattern (5)",
    "Abstraction (5)",
    "Algorithm (5)",
    "คะแนนรวม (20)",
    "เกรดประเมิน",
    "ระดับพุทธิพิสัย (Bloom)",
    "ข้อเสนอแนะของ อ.ชีวะ",
    "จุดเด่นของผู้เรียน",
    "สิ่งที่ควรพัฒนาเพิ่ม",
    "คำตอบ: แยกส่วนประกอบ",
    "คำตอบ: การรู้จำแบบแผน",
    "คำตอบ: การคิดเชิงนามธรรม",
    "คำตอบ: ขั้นตอนวิธี",
    "คำตอบ: การสะท้อนคิด (Reflection)"
  ];
  
  sheet.appendRow(headers);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0284c7");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);
}

