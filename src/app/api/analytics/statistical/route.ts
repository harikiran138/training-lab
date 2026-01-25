import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'analytics_engine.py');
    
    return new Promise((resolve) => {
      exec(`python3 ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing python script: ${error.message}`);
          resolve(NextResponse.json({ error: 'Failed to run statistical engine' }, { status: 500 }));
          return;
        }
        
        if (stderr) {
          console.error(`Python Stderr: ${stderr}`);
        }

        try {
          const results = JSON.parse(stdout);
          resolve(NextResponse.json(results));
        } catch (parseError) {
          console.error(`Failed to parse python output: ${stdout}`);
          resolve(NextResponse.json({ error: 'Invalid output from statistical engine' }, { status: 500 }));
        }
      });
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
