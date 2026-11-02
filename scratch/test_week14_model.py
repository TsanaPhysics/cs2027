# โปรแกรม: Classroom Safety & Cyberbullying Intervention Engine
# รายวิชา: 4124941 วิทยาการคำนวณสำหรับการสอนวิทยาศาสตร์ (Computational Science)
# อาจารย์ผู้สอน: ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา | มหาวิทยาลัยราชภัฏรำไพพรรณี
# มาตรฐาน: Python 3.11 Standard Library (100% Standalone & Deterministic)
# ==============================================================================

import re
import unittest
from typing import Dict, Any, List, Tuple

class ClassroomSafetyAnalyzer:
    # โมดูลวิเคราะห์ความปลอดภัยทางไซเบอร์และตรวจจับ Cyberbullying ในห้องเรียน
    
    def __init__(self):
        # คลังคำสุ่มเสี่ยง Cyberbullying และคำล้อเลียนในห้องเรียนวิทยาศาสตร์
        self.toxic_keywords = {
            "โง่": 3, "ควาย": 4, "กาก": 2, "น่ารำคาญ": 2, "ตัวถ่วง": 3,
            "แบนมัน": 3, "เตะออก": 2, "หน้าโง่": 4, "กระจอก": 3, "ปัญญาอ่อน": 4
        }
        
        # คลังคำเชิงบวกที่ส่งเสริมการเรียนรู้แบบสืบเสาะ (Constructive Pedagogical Words)
        self.positive_keywords = {
            "เยี่ยม": 2, "ยอดเยี่ยม": 3, "น่าสนใจ": 2, "ช่วยกัน": 2, "ขอบคุณ": 2,
            "เป็นกำลังใจ": 3, "ลองดูใหม่": 2, "เสนอแนะ": 2, "ชื่นชม": 3
        }

    def analyze_message(self, message: str) -> Dict[str, Any]:
        # วิเคราะห์ระดับความเป็นพิษ (Toxicity) และประเมินข้อความ
        clean_msg = message.strip()
        detected_toxic = []
        toxic_score = 0
        
        for word, weight in self.toxic_keywords.items():
            if word in clean_msg:
                detected_toxic.append(word)
                toxic_score += weight
                
        detected_positive = []
        positive_score = 0
        for word, weight in self.positive_keywords.items():
            if word in clean_msg:
                detected_positive.append(word)
                positive_score += weight

        # ตรวจสอบการตะโกนด้วย ALL CAPS หรือเครื่องหมายตกใจซ้ำซ้อน
        has_shouting = bool(re.search(r'[!]{3,}', clean_msg))
        if has_shouting:
            toxic_score += 1

        # กำหนดระดับความเสี่ยง (Safety Status)
        if toxic_score >= 4:
            status = "HIGH_RISK_CYBERBULLYING"
            action = "BLOCK_MESSAGE_AND_ALERT_TEACHER"
        elif toxic_score >= 2:
            status = "MODERATE_RISK_UNETHICAL"
            action = "WARN_USER_NETIQUETTE_REMINDER"
        else:
            status = "SAFE_CONSTRUCTIVE"
            action = "ALLOW_POST"

        return {
            "original_text": clean_msg,
            "toxic_score": toxic_score,
            "positive_score": positive_score,
            "detected_toxic_words": detected_toxic,
            "detected_positive_words": detected_positive,
            "status": status,
            "recommended_action": action,
            "is_safe": toxic_score == 0
        }

    def calculate_classroom_climate(self, messages_log: List[str]) -> Dict[str, Any]:
        # คำนวณดัชนีบรรยากาศเชิงบวกของชั้นเรียน (Classroom Climate Index: 0.0 - 1.0)
        if not messages_log:
            return {"climate_index": 1.0, "grade": "A_EXCELLENT"}
            
        total_toxic = 0
        total_positive = 0
        
        for msg in messages_log:
            res = self.analyze_message(msg)
            total_toxic += res["toxic_score"]
            total_positive += res["positive_score"]

        # สูตรดัชนีบรรยากาศห้องเรียน: Base 0.8 + ปัจจัยบวก - ปัจจัยลบ
        base_index = 0.8 + (total_positive * 0.05) - (total_toxic * 0.1)
        clamped_index = round(max(0.0, min(1.0, base_index)), 2)
        
        if clamped_index >= 0.85:
            grade = "EXCELLENT_POSITIVE_CLIMATE"
        elif clamped_index >= 0.65:
            grade = "GOOD_SAFE_CLIMATE"
        else:
            grade = "ALERT_REQUIRES_INTERVENTION"

        return {
            "total_messages_analyzed": len(messages_log),
            "total_toxic_score": total_toxic,
            "total_positive_score": total_positive,
            "climate_index": clamped_index,
            "climate_grade": grade
        }

# ==============================================================================
# ระบบการทดสอบ Unit Test อัตโนมัติ (100% Deterministic Verification)
# ==============================================================================

class TestClassroomSafety(unittest.TestCase):
    
    def setUp(self):
        self.analyzer = ClassroomSafetyAnalyzer()

    def test_safe_constructive_message(self):
        res = self.analyzer.analyze_message("กลุ่ม 5 ทำการจำลองคลื่นได้ยอดเยี่ยมมากครับ ชื่นชมเลย")
        self.assertTrue(res["is_safe"])
        self.assertEqual(res["status"], "SAFE_CONSTRUCTIVE")
        self.assertGreater(res["positive_score"], 0)

    def test_cyberbullying_detection(self):
        res = self.analyzer.analyze_message("ทำแล็บภาษาอะไร โง่ชะมัด เป็นตัวถ่วงกลุ่มจริง!!!")
        self.assertFalse(res["is_safe"])
        self.assertEqual(res["status"], "HIGH_RISK_CYBERBULLYING")
        self.assertEqual(res["recommended_action"], "BLOCK_MESSAGE_AND_ALERT_TEACHER")
        self.assertIn("โง่", res["detected_toxic_words"])

    def test_shouting_detection(self):
        res = self.analyzer.analyze_message("ส่งงานเดี๋ยวนี้!!!!")
        self.assertGreaterEqual(res["toxic_score"], 1)

    def test_moderate_risk_netiquette(self):
        res = self.analyzer.analyze_message("โค้ดแล็บนี้กากจัง")
        self.assertEqual(res["status"], "MODERATE_RISK_UNETHICAL")

    def test_classroom_climate_healthy(self):
        chat_log = [
            "กลุ่ม 6 โมเดลการแพร่สารน่าสนใจมากครับ",
            "ขอบคุณสำหรับข้อเสนอแนะ จะลองดูใหม่นะ",
            "ช่วยกันตรวจสอบค่าตัวแปรออสโมซิสอีกรอบครับ"
        ]
        climate = self.analyzer.calculate_classroom_climate(chat_log)
        self.assertGreaterEqual(climate["climate_index"], 0.85)
        self.assertEqual(climate["climate_grade"], "EXCELLENT_POSITIVE_CLIMATE")

if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestClassroomSafety)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    print(f"Unit Test Results: Ran {result.testsRun} tests, Errors: {len(result.errors)}, Failures: {len(result.failures)}")
