import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'analytics_engine.py');
    
    return new Promise<NextResponse>((resolve) => {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scriptPath = path.join(process.cwd(), 'scripts', 'analytics_engine.py');
    const simulationArgs = JSON.stringify(body);
    
    // Escape single quotes for shell command safety - this is a basic measure
    //Ideally we'd use spawn with array args, but exec is simpler for this quick prototype
    const safeArgs = simulationArgs.replace(/'/g, "'\\''");

    return new Promise<NextResponse>((resolve) => {
      exec(`python3 ${scriptPath} --simulate '${safeArgs}'`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing python script: ${error.message}`);
          resolve(NextResponse.json({ error: 'Failed to run simulation' }, { status: 500 }));
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
