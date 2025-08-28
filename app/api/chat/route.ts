import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://agromarfeed-backend.vercel.app';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await axios.post(`${BACKEND_URL}/api/chat`, body, {
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
            },
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Chat API error:', error.message);
        return NextResponse.json(
            { error: error.response?.data?.error || 'Failed to process chat request' },
            { status: error.response?.status || 500 }
        );
    }
}
