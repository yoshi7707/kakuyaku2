import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    const validItems = items
      .map((item: any) => ({
        name: typeof item.name === 'string' ? item.name.trim() : '',
        area: typeof item.area === 'string' ? item.area.trim() : '',
        kakuyaku: typeof item.kakuyaku === 'string' ? item.kakuyaku.trim() : '',
      }))
      .filter((item: { name: string; area: string; kakuyaku: string }) =>
        item.name && item.area && item.kakuyaku
      );

    if (!validItems.length) {
      return NextResponse.json(
        { error: 'items array with name, area, and kakuyaku is required' },
        { status: 400 }
      );
    }

    const createdItems = [] as unknown[];
    const chunkSize = 50;

    for (let i = 0; i < validItems.length; i += chunkSize) {
      const chunk = validItems.slice(i, i + chunkSize);
      const results = await Promise.all(
        chunk.map((item) => prisma.submission.create({ data: item }))
      );
      createdItems.push(...results);
    }

    return NextResponse.json({ ok: true, count: createdItems.length }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
