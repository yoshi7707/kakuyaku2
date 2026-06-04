import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

const HTML_FILE_PATH = path.join(process.cwd(), 'public', 'index.html');

function parseKakuyakuData(html: string) {
  const startMarker = 'const DATA =';
  const endMarker = '\n\n// Load state';
  const startIndex = html.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error('DATA section not found in public/index.html');
  }

  const endIndex = html.indexOf(endMarker, startIndex);
  if (endIndex === -1) {
    throw new Error('End marker for DATA section not found in public/index.html');
  }

  const rawJson = html
    .slice(startIndex + startMarker.length, endIndex)
    .trim()
    .replace(/;$/, '');

  return JSON.parse(rawJson) as Array<{
    group: string;
    members: Array<{ name: string; checked: boolean }>;
  }>;
}

export async function GET() {
  try {
    const html = fs.readFileSync(HTML_FILE_PATH, 'utf-8');
    const data = parseKakuyakuData(html);

    const items = data.flatMap((group) =>
      group.members.map((member) => ({
        name: member.name,
        area: group.group,
        kakuyaku: member.checked ? '確約済み' : '未確約',
      }))
    );

    if (!items.length) {
      return NextResponse.json({ error: 'No kakuyaku items found' }, { status: 400 });
    }

    const chunkSize = 50;
    let total = 0;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const created = await Promise.all(
        chunk.map((item) => prisma.submission.create({ data: item }))
      );
      total += created.length;
    }

    return NextResponse.json({ ok: true, count: total }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
