/**
 * Institutional Academic Intelligence Policy
 * Controls risk thresholds and priority detection heuristics.
 */
export const AI_POLICY = {
  RISK_THRESHOLDS: {
    ATTENDANCE_CRITICAL: 65, // Percentage below which attendance is High Risk
    TEST_PASS_CRITICAL: 50,    // Percentage below which performance is High Risk
    SYLLABUS_LAG: 30,          // Percentage completion below which syllabus is lagging
  },
  PLACEMENT_READINESS: {
    PRI_MINIMUM: 60,           // Minimum PRI score for standard readiness
    PRI_TOP_TIER: 85,          // Above this score is considered Top Tier candidate
  },
  ANALYSIS_WINDOW: 4,          // Number of weeks for moving average calculations
};
