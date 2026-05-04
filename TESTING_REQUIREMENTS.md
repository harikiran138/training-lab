# Institutional Data Testing Requirements

This document outlines the data formats required to test the system's ingestion engines.

## 1. Excel Data Ingestion (Attendance)
To test bulk uploads for CRT Attendance, your Excel file (`.xlsx` or `.csv`) should follow this structure:

| Branch | Strength | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| CSE-A | 72 | 68 | 65 | 62 | No CRT | 64 | 60 |
| CSE-B | 70 | 66 | 63 | 60 | 58 | 61 | 59 |
| ECE-A | 68 | 62 | 60 | No CRT | 57 | 55 | 53 |
| ECE-B | 65 | 60 | 58 | 55 | No CRT | 54 | 52 |

*   **Branch**: Must match institutional codes (e.g., `CSE-A`, `ECE-B`, `EEE`, `IT`).
*   **Strength**: Total students in the branch.
*   **Days (1-6)**: Number of students attended or the string `No CRT`.

## 2. Vision OCR Ingestion (Image)
To test the "Institutional Vision" engine:
*   **Format**: `.png`, `.jpg`, or `.jpeg`.
*   **Target Content**: 
    ```
    Branch   Strength   Day 1   Day 2   Day 3   Day 4
    CSE-A    70         65      62      60      58
    ECE-B    68         60      58      55      52
    EEE      64         58      56      54      50
    IT       66         61      59      57      55
    ```
*   **Sample Image**: `/public/samples/test-vision.png`

## 3. Institutional Module Data (Manual Entry)
Use these specific data sets for manual validation:

### Placement Summary
*   **CSE**: 120 students, 150 offers, 110 placed, 18 CTC.
*   **ECE**: 100 students, 120 offers, 90 placed, 14 CTC.
*   **EEE**: 80 students, 85 offers, 70 placed, 10 CTC.
*   **IT**: 90 students, 110 offers, 85 placed, 16 CTC.

### Syllabus Log
*   **Python Fundamentals**: 40 total, 32 completed.
*   **Data Structures**: 50 total, 38 completed.
*   **DBMS**: 45 total, 30 completed.
*   **Operating Systems**: 48 total, 36 completed.

### Feedback
*   **Week 1**: 4.2 Score, "Pace was slightly fast for beginners"
*   **Week 2**: 4.0 Score, "Need more practice problems"
*   **Week 3**: 3.8 Score, "Doubt clearing sessions are limited"
*   **Week 4**: 4.5 Score, "Class duration is too long"

## 4. Admin Credentials
*   **Login URL**: `/login`
*   **User**: `admin@admin.com`
*   **Password**: `admin123`

---
**Sample assets are available in `/public/samples/`.**
