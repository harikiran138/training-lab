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

def get_db():
    if not MONGODB_URI:
        raise ValueError("MONGODB_URI not found in .env.local")
        
    # Extract DB name from URI or use default
    # URI format: mongodb+srv://user:pass@host/dbname?options
    db_name = "test" # default
    match = re.search(r'\/([a-zA-Z0-9_-]+)\?', MONGODB_URI)
    if match:
        db_name = match.group(1)
    else:
        # Check if it ends with /dbname
        match = re.search(r'\/([a-zA-Z0-9_-]+)$', MONGODB_URI.split('?')[0])
        if match:
            db_name = match.group(1)

    print(f"DEBUG: Connecting to DB: {db_name}", file=sys.stderr)
    
    # Increase timeout for Atlas
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
    return client[db_name], client

def calculate_statistical_metrics():
    try:
        db, client = get_db()
    except Exception as e:
        return {"error": f"Connection Error: {str(e)}"}
    
    try:
        # Test connection
        client.admin.command('ping')
        print("DEBUG: Ping successful", file=sys.stderr)

        # 1. Fetch Student Data
        students_cursor = db.students.find({}, {
            'student_id': 1,
            'name': 1,
            'academic_gpa': 1,
            'attendance_discipline_score': 1,
            'branch_code': 1
        })
        
        df = pd.DataFrame(list(students_cursor))
        
        if df.empty:
            print("DEBUG: No data found in students collection", file=sys.stderr)
            return {"error": "No student data found for calculation."}
            
        print(f"DEBUG: Processed {len(df)} students", file=sys.stderr)

        # Clean data
        df['academic_gpa'] = df['academic_gpa'].fillna(0)
        df['attendance_discipline_score'] = df['attendance_discipline_score'].fillna(0)
        
        # --- STATISTICAL CALCULATIONS ---
        correlation = df['attendance_discipline_score'].corr(df['academic_gpa'])
        df['computed_readiness'] = (df['academic_gpa'] * 10 * 0.5) + (df['attendance_discipline_score'] * 0.5)
        
        mean_readiness = df['computed_readiness'].mean()
        std_readiness = df['computed_readiness'].std()
        df['z_score'] = (df['computed_readiness'] - mean_readiness) / std_readiness if std_readiness > 0 else 0
        
        branch_stats = df.groupby('branch_code')['computed_readiness'].agg(['mean', 'std', 'count']).to_dict(orient='index')

        # Fix NaN in branch stats (no variance)
        for b in branch_stats:
            if np.isnan(branch_stats[b]['std']):
                branch_stats[b]['std'] = 0

        # --- PREPARE RESULTS ---
        results = {
            "math_meta": {
                "formulas": {
                    "Readiness_Score": "R = (GPA × 10 × 0.5) + (Attendance × 0.5)",
                    "Z_Score": "Z = (R - μ) / σ",
                    "Correlation": "Pearson's r (Attendance vs GPA)"
                },
                "stats": {
                    "mean": round(float(mean_readiness), 4),
                    "std_dev": round(float(std_readiness), 4),
                    "correlation": round(float(correlation), 4) if not np.isnan(correlation) else 0,
                    "population_size": len(df)
                }
            },
            "risk_outliers": df[df['z_score'] < -1.5][['student_id', 'name', 'computed_readiness', 'z_score']].to_dict(orient='records'),
            "frequency_distribution": [
                {"range": "0-40", "count": int(len(df[df['computed_readiness'] <= 40]))},
                {"range": "41-60", "count": int(len(df[(df['computed_readiness'] > 40) & (df['computed_readiness'] <= 60)]))},
                {"range": "61-80", "count": int(len(df[(df['computed_readiness'] > 60) & (df['computed_readiness'] <= 80)]))},
                {"range": "81-100", "count": int(len(df[df['computed_readiness'] > 80]))}
            ],
            "branch_breakdown": branch_stats
        }
        
        return results

    except Exception as e:
        return {"error": f"Runtime Error: {str(e)}"}
    finally:
        client.close()

if __name__ == "__main__":
    analytics_results = calculate_statistical_metrics()
    print(json.dumps(analytics_results, indent=2))
