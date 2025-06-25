import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }
  const arrayBuffer = await (file as File).arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = (file as File).type;
  const url = `data:${mimeType};base64,${base64}`;
  return NextResponse.json({ url });
}
