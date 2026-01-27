import os
import sys
import json
import numpy as np
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv('.env.local')

MONGODB_URI = os.getenv('MONGODB_URI')

# --- REUSABLE STATISTICAL MODELS ---

def compute_overall_score(A, C, S, P, T):
    """
    Weighted Performance Score
    Formula: 0.25A + 0.30C + 0.15S + 0.20P + 0.10T
    """
    weights = np.array([0.25, 0.30, 0.15, 0.20, 0.10])
    scores = np.array([A, C, S, P, T])
    return np.round(np.dot(weights, scores), 2)

def compute_risk_index(attendance, failed_tests, internship_count):
    """
    Calculated Risk Index (0 to 1)
    """
    r = 0.0
    if attendance < 60: r += 0.4
    if failed_tests >= 2: r += 0.35
    if internship_count == 0: r += 0.25
    return min(float(r), 1.0)

def compute_placement_prob(A, C, P, S):
    """
    Logistic Regression Model (Sigmoid)
    P = 1 / (1 + e^-z)
    z = 0.05A + 0.06C + 0.04P + 0.03S - 4
    """
    z = 0.05*A + 0.06*C + 0.04*P + 0.03*S - 4
    prob = 1 / (1 + np.exp(-z))
    return round(float(prob * 100), 2)

# --- ADVANCED ANALYTICS ---

def compute_trend_slope(scores_series):
    """
    Calculate linear trend slope using basic least squares.
    Positive slope = Improving; Negative = Declining.
    Input: List of historical scores over time.
    """
    if not scores_series or len(scores_series) < 2:
        return 0.0
    x = np.arange(len(scores_series))
    y = np.array(scores_series)
    # Slope (m) = (N*Σxy - Σx*Σy) / (N*Σx² - (Σx)²)
    N = len(y)
    num = N * np.dot(x, y) - np.sum(x) * np.sum(y)
    den = N * np.dot(x, x) - np.sum(x)**2
    if den == 0: return 0.0
    return float(num / den)

# --- DATASET GENERATOR (MOCK FAILOVER) ---

def generate_synthetic_data(n=100):
    """Generate high-fidelity synthetic institutional data for simulation/failover"""
    np.random.seed(42)
    
    # Faculty Set
    faculty_list = [
        {"id": "F001", "name": "Dr. Sarah Chen", "subject": "Advanced Algorithms"},
        {"id": "F002", "name": "Prof. Marcus Thorne", "subject": "System Architecture"},
        {"id": "F003", "name": "Dr. Elena Rodriguez", "subject": "Data Science"},
        {"id": "F004", "name": "Prof. Alan Turing", "subject": "Theoretical CS"}
    ]

    # Random but correlated data
    aptitude = np.random.normal(70, 15, n).clip(0, 100)
    coding = aptitude * 0.9 + np.random.normal(0, 10, n)
    coding = coding.clip(0, 100)
    attendance = np.random.normal(80, 10, n).clip(0, 100)
    project = np.random.normal(75, 12, n).clip(0, 100)
    soft_skills = np.random.normal(70, 10, n).clip(0, 100)
    
    data = []
    for i in range(n):
        # Assign random faculty
        faculty = np.random.choice(faculty_list)
        
        # Simulate History (Last 5 weeks) based on current trend + noise
        current_score = (0.25*aptitude[i] + 0.30*coding[i] + 0.15*soft_skills[i] + 0.20*project[i] + 0.10*attendance[i])
        trend_direction = np.random.choice([-1, 0, 1], p=[0.2, 0.5, 0.3]) # Slight upward bias
        history = [max(0, min(100, current_score - (trend_direction * w * 2) + np.random.normal(0, 3))) for w in range(4, -1, -1)]

        data.append({
            "student_id": f"S{1000+i}",
            "name": f"Synthetic Student {i}",
            "aptitude": float(aptitude[i]),
            "coding": float(coding[i]),
            "soft_skills": float(soft_skills[i]),
            "project": float(project[i]),
            "attendance": float(attendance[i]),
            "failed_tests": int(np.random.choice([0, 1, 2, 3], p=[0.7, 0.2, 0.07, 0.03])),
            "internship_count": int(np.random.choice([0, 1, 2], p=[0.4, 0.5, 0.1])),
            "faculty_id": faculty["id"],
            "faculty_name": faculty["name"],
            "subject": faculty["subject"],
            "history_scores": history
        })
    return data

# --- MAIN ENGINE ---

def get_db_data():
    if not MONGODB_URI:
        return None, "NO_URI"
    
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
        db_name = MONGODB_URI.split('/')[-1].split('?')[0] or "training-lab"
        db = client[db_name]
        
        # Pull data
        cursor = db.students.find({}, {
            "student_id": 1, "name": 1, 
            "academic_gpa": 1, "attendance_discipline_score": 1
        })
        records = list(cursor)
        
        if not records:
            return None, "EMPTY"
            
        # Map DB fields to Math fields (Normalized)
        mapped = []
        for r in records:
            # We simulate detailed fields if DB only has GPA for now
            gpa_score = r.get('academic_gpa', 0) * 10 # Scale to 100
            att = r.get('attendance_discipline_score', 0)
            mapped.append({
                "student_id": r['student_id'],
                "name": r['name'],
                "aptitude": float(gpa_score),
                "coding": float(gpa_score * 0.9),
                "soft_skills": 70.0,
                "project": 75.0,
                "attendance": float(att),
                "failed_tests": 1 if att < 60 else 0,
                "internship_count": 1 if att > 80 else 0,
                "faculty_id": "F001", # Default for generic DB records
                "faculty_name": "Dr. Sarah Chen",
                "subject": "Advanced Algorithms",
                "history_scores": [float(gpa_score)] * 5 # Flat trend
            })
        return mapped, "SUCCESS"
    except Exception as e:
        return None, f"ERROR: {str(e)}"

def run_analysis():
    # 1. Acquire Data (Real or Synthetic)
    data, status = get_db_data()
    is_mock = False
    
    if not data:
        print(f"DEBUG: Data acquisition failed ({status}). Falling back to synthetic engine.", file=sys.stderr)
        data = generate_synthetic_data(100)
        is_mock = True
    
    df = pd.DataFrame(data)
    
    # 2. RUN VECTORIZED COMPUTATIONS
    # Overall Score
    df['overall_score'] = df.apply(lambda r: compute_overall_score(
        r.aptitude, r.coding, r.soft_skills, r.project, r.attendance
    ), axis=1)
    
    # Risk Index
    df['risk_index'] = df.apply(lambda r: compute_risk_index(
        r.attendance, r.failed_tests, r.internship_count
    ), axis=1)
    
    # Placement Probability
    df['placement_prob'] = df.apply(lambda r: compute_placement_prob(
        r.aptitude, r.coding, r.project, r.soft_skills
    ), axis=1)
    
    # Trend Slope
    df['trend_slope'] = df['history_scores'].apply(compute_trend_slope)
    
    # Z-Score for Overall Scoring (Outliers)
    mu = df['overall_score'].mean()
    sigma = df['overall_score'].std()
    df['z_score'] = (df['overall_score'] - mu) / sigma
    
    # 3. FACULTY EFFECTIVENESS AGGREGATION
    # Group by faculty and calculate stats
    faculty_stats = df.groupby(['faculty_id', 'faculty_name', 'subject']).agg(
        student_count=('student_id', 'count'),
        avg_score=('overall_score', 'mean'),
        pass_rate=('overall_score', lambda x: (x > 50).mean() * 100), # Assuming >50 is pass
        avg_trend=('trend_slope', 'mean')
    ).reset_index()
    
    # Impact Score: (Avg Score - Global Mean) + (Trend * 10)
    # This measures how much better/worse their students are vs global, plus improvement velocity
    faculty_stats['impact_score'] = (faculty_stats['avg_score'] - mu) + (faculty_stats['avg_trend'] * 10)
    faculty_stats['impact_score'] = faculty_stats['impact_score'].round(2)
    faculty_stats = faculty_stats.round(2)
    # 4. STATISTICAL AGGREGATION
    # Calculate Global History Trend (Average of history_scores columns)
    # df['history_scores'] is a column of lists. We need to stack them and take the mean across column 0, 1, 2, 3, 4
    try:
        if not df['history_scores'].empty:
            history_matrix = np.array(df['history_scores'].tolist())
            global_history = np.mean(history_matrix, axis=0).round(2).tolist()
        else:
            global_history = []
    except Exception as e:
        print(f"Warning: History aggregation failed: {e}", file=sys.stderr)
        global_history = []

    stats = {
        "engine": "NumPy/Pandas Institutional Auditor v2.1",
        "is_mock": is_mock,
        "population": {
            "size": len(df),
            "mean": round(float(mu), 2),
            "std_dev": round(float(sigma), 2),
            "min": round(float(df['overall_score'].min()), 2),
            "max": round(float(df['overall_score'].max()), 2)
        },
        "correlations": {
            "attendance_vs_overall": round(float(df['attendance'].corr(df['overall_score'])), 4),
            "coding_vs_placement": round(float(df['coding'].corr(df['placement_prob'])), 4)
        },
        "distribution": {
            "Fail (0-40)": int(len(df[df['overall_score'] <= 40])),
            "Average (41-60)": int(len(df[(df['overall_score'] > 40) & (df['overall_score'] <= 60)])),
            "Good (61-75)": int(len(df[(df['overall_score'] > 60) & (df['overall_score'] <= 75)])),
            "Very Good (76-90)": int(len(df[(df['overall_score'] > 75) & (df['overall_score'] <= 90)])),
            "Excellent (91-100)": int(len(df[df['overall_score'] > 90]))
        },
        "risk_summary": {
            "safe": int(len(df[df['risk_index'] <= 0.3])),
            "monitor": int(len(df[(df['risk_index'] > 0.3) & (df['risk_index'] <= 0.6)])),
            "critical": int(len(df[df['risk_index'] > 0.6]))
        },
        "outliers": df[df['z_score'].abs() > 2][['student_id', 'name', 'overall_score', 'z_score']].to_dict(orient='records'),
        "faculty_effectiveness": faculty_stats.to_dict(orient='records'),
        "trends": {
            "global_history": global_history
        },
        "formulas": {
            "overall": "0.25A + 0.30C + 0.15S + 0.20P + 0.10T",
            "placement": "1 / (1 + e^-z)",
            "z_score": "(x - μ) / σ",
            "impact_score": "(Subj_Avg - Global_μ) + (Trend_Slope * 10)"
        }
    }
    
    return stats

def simulate_student_outcome(current_metrics, changes):
    """
    Simulate how changes in specific metrics affect the Overall Score and Placement Probability.
    
    Args:
        current_metrics (dict): {'aptitude': 70, 'coding': 80, ...}
        changes (dict): {'coding': +10, 'attendance': -5}
    """
    # Base State
    base = current_metrics.copy()
    
    # Apply Changes
    simulated = base.copy()
    for k, v in changes.items():
        if k in simulated:
            simulated[k] = max(0, min(100, simulated[k] + v))
            
    # Re-compute Scores
    new_overall = compute_overall_score(
        simulated.get('aptitude', 0), simulated.get('coding', 0), 
        simulated.get('soft_skills', 0), simulated.get('project', 0), 
        simulated.get('attendance', 0)
    )
    
    new_prob = compute_placement_prob(
        simulated.get('aptitude', 0), simulated.get('coding', 0), 
        simulated.get('project', 0), simulated.get('soft_skills', 0)
    )
    
    return {
        "original": {
            "overall_score": compute_overall_score(base['aptitude'], base['coding'], base['soft_skills'], base['project'], base['attendance']),
            "placement_prob": compute_placement_prob(base['aptitude'], base['coding'], base['project'], base['soft_skills'])
        },
        "simulated": {
            "overall_score": new_overall,
            "placement_prob": new_prob,
            "deltas": {
                "overall_score": round(new_overall - compute_overall_score(base['aptitude'], base['coding'], base['soft_skills'], base['project'], base['attendance']), 2),
                "placement_prob": round(new_prob - compute_placement_prob(base['aptitude'], base['coding'], base['project'], base['soft_skills']), 2)
            }
        },
        "inputs": simulated
    }

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Run Institutional Analytics')
    parser.add_argument('--simulate', type=str, help='JSON string for simulation parameters')
    args = parser.parse_args()

    if args.simulate:
        try:
            # Expected format: {"current": {...}, "changes": {...}}
            sim_input = json.loads(args.simulate)
            result = simulate_student_outcome(sim_input.get('current', {}), sim_input.get('changes', {}))
            print(json.dumps(result, indent=2))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)
    else:
        results = run_analysis()
        print(json.dumps(results, indent=2))
