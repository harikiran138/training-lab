import { CrtAttendanceService } from '../CrtAttendanceService';

console.log("Running CrtAttendanceService Validation Test...");

try {
    CrtAttendanceService.processData([{
        branch_code: 'TEST',
        strength: 60,
        daily: [110, 0, 0, 0, 0, 0]
    }]);
    console.error("FAILED: Should have thrown error for 110/60 attendance");
} catch (e: any) {
    console.log("PASSED: Caught expected error:", e.message);
}

const records = CrtAttendanceService.processData([{
    branch_code: 'RISK_TEST',
    strength: 100,
    daily: [70, 70, 70, 70, 70, 70]
}]);

if (records[0].risk_flag === 'RED') {
    console.log("PASSED: 70% attendance correctly flagged as RED (Threshold < 75%)");
} else {
    console.error("FAILED: 70% attendance should be RED");
}
