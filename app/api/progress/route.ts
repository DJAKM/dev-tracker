import { NextRequest, NextResponse } from "next/server";
import { readProgress, writeProgress, todayStr } from "@/lib/storage";

export async function GET() {
  const data = await readProgress();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await readProgress();

  if (body.action === "setStartDate") {
    data.startDate = body.date;
    await writeProgress(data);
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
    await writeProgress(data);
    return NextResponse.json({ ok: true, completions: data.completions[date] });
  }

  if (body.action === "markDayDone") {
    const date = todayStr();
    if (!data.completions[date]) data.completions[date] = [];
    await writeProgress(data);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
