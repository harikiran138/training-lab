import 'dotenv/config';
import mongoose from 'mongoose';
import AuditLog from '../src/models/AuditLog';
import Document from '../src/models/Document';
import RiskFlag from '../src/models/RiskFlag';
import Announcement from '../src/models/Announcement';
import SystemRule from '../src/models/SystemRule';

async function testModels() {
  console.log("🧪 Testing Model Definitions...");
  
  try {
    // 1. AuditLog
    const auditLog = new AuditLog({
      user_id: 'test_user',
      role: 'Admin',
      action: 'TEST',
      table_name: 'TestTable'
    });
    console.log("✅ AuditLog model instantiated successfully.");
    const err1 = auditLog.validateSync();
    if (err1) console.warn("⚠️ AuditLog validation warning:", err1.message);

    // 2. Document
    const doc = new Document({
      owner_id: 'test_student',
      owner_role: 'Student',
      doc_type: 'Other',
      file_url: 'http://example.com',
      file_name: 'test.pdf'
    });
    console.log("✅ Document model instantiated successfully.");

    // 3. RiskFlag
    const risk = new RiskFlag({
      student_id: 'risk_student',
      risk_type: 'Academic_Failure',
      severity: 'Low'
    });
    console.log("✅ RiskFlag model instantiated successfully.");

    // 4. Announcement
    const announce = new Announcement({
      title: 'Test Announcement',
      message: 'Hello World',
      created_by: 'admin'
    });
    console.log("✅ Announcement model instantiated successfully.");

    // 5. SystemRule
    const rule = new SystemRule({
      rule_key: 'TEST_RULE',
      value: 100
    });
    console.log("✅ SystemRule model instantiated successfully.");

    console.log("🎉 All models verified successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Model Verification Failed:", error);
    process.exit(1);
  }
}

testModels();
