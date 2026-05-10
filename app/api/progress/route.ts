import { NextRequest, NextResponse } from "next/server";
import { readProgress, writeProgress, todayStr } from "@/lib/storage";
import { auth } from "@/lib/auth";

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await readProgress(userId);
  return NextResponse.json({ ...data, userId });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = await readProgress(userId);

  if (body.action === "setStartDate" || body.action === "resetStartDate") {
    if (body.date) data.startDate = body.date;
    else data.startDate = null; // triggers setup screen again
    await writeProgress(userId, data);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "toggleTask") {
    const { date, taskId } = body;
    if (!data.completions[date]) data.completions[date] = [];
    const idx = data.completions[date].indexOf(taskId);
    if (idx === -1) {
      data.completions[date].push(taskId);
    } else {
      data.completions[date].splice(idx, 1);
    }
    await writeProgress(userId, data);
    return NextResponse.json({ ok: true, completions: data.completions[date] });
  }

  if (body.action === "markDayDone") {
    const date = todayStr();
    if (!data.completions[date]) data.completions[date] = [];
    await writeProgress(userId, data);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
