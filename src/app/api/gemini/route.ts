import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Gemini API key is missing');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Basic prompt size limit for safety
    if (prompt.length > 8000) {
        return NextResponse.json(
            { error: 'Prompt too large' }, 
            { status: 400 }
        );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Gemini API error response:', data);
        return NextResponse.json(
            { error: data.error?.message || 'Gemini API error' },
            { status: response.status }
        );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Gemini relay internal error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
