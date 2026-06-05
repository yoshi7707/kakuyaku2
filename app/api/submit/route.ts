import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: [{ area: 'asc' }, { name: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, area, kakuyaku } = body;

    if (!name || !area || !kakuyaku) {
      return NextResponse.json({ error: 'name, area, and kakuyaku are required' }, { status: 400 });
    }

    const existing = await prisma.submission.findFirst({
      where: { name, area },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      const updated = await prisma.submission.update({
        where: { id: existing.id },
        data: { kakuyaku },
      });
      return NextResponse.json({ ok: true, id: updated.id, updated: true });
    }

    const submission = await prisma.submission.create({
      data: {
        name,
        area,
        kakuyaku,
      },
    });

    return NextResponse.json({ ok: true, id: submission.id, created: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({} as { id?: string }));
    if (body.id) {
      await prisma.submission.delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    const result = await prisma.submission.deleteMany();
    return NextResponse.json({ ok: true, count: result.count });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
