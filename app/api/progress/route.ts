import { NextRequest, NextResponse } from "next/server";
import { readProgress, writeProgress, todayStr } from "@/lib/storage";
import { auth } from "@/lib/auth";

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

function nanoId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
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

  // ─── Task completions ────────────────────────────────────────────────────────
  if (body.action === "setStartDate" || body.action === "resetStartDate") {
    data.startDate = body.date ?? null;
    await writeProgress(userId, data);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "toggleTask") {
    const { date, taskId } = body;
    if (!data.completions[date]) data.completions[date] = [];
    const idx = data.completions[date].indexOf(taskId);
    if (idx === -1) data.completions[date].push(taskId);
    else data.completions[date].splice(idx, 1);
    await writeProgress(userId, data);
    return NextResponse.json({ ok: true, completions: data.completions[date] });
  }

  if (body.action === "markDayDone") {
    const date = todayStr();
    if (!data.completions[date]) data.completions[date] = [];
    await writeProgress(userId, data);
    return NextResponse.json({ ok: true });
  }

  // ─── Submissions ─────────────────────────────────────────────────────────────

  // Save a new code attempt (before revealing answer)
  if (body.action === "submitAttempt") {
    const { questionId, code } = body;
    if (!data.submissions) data.submissions = {};
    if (!data.submissions[questionId]) data.submissions[questionId] = [];

    const submission = {
      id: nanoId(),
      code: code ?? "",
      submittedAt: new Date().toISOString(),
      revealedAnswer: false,
      viewedSolution: false,
    };
    data.submissions[questionId].unshift(submission); // newest first
    await writeProgress(userId, data);
    return NextResponse.json({ ok: true, submission });
  }

  // Mark that the user revealed the answer on their latest submission
  if (body.action === "markRevealed") {
    const { questionId } = body;
    if (!data.submissions) data.submissions = {};
    if (!data.submissions[questionId]) data.submissions[questionId] = [];

    // If no submission yet (user revealed without writing code), create a blank one
    if (data.submissions[questionId].length === 0) {
      data.submissions[questionId].unshift({
        id: nanoId(),
        code: "",
        submittedAt: new Date().toISOString(),
        revealedAnswer: true,
        viewedSolution: false,
      });
    } else {
      data.submissions[questionId][0].revealedAnswer = true;
    }
    await writeProgress(userId, data);
    return NextResponse.json({ ok: true });
  }

  // Mark that user viewed the full code solution
  if (body.action === "markViewedSolution") {
    const { questionId } = body;
    if (!data.submissions) data.submissions = {};
    if (!data.submissions[questionId]) data.submissions[questionId] = [];

    if (data.submissions[questionId].length === 0) {
      data.submissions[questionId].unshift({
        id: nanoId(),
        code: "",
        submittedAt: new Date().toISOString(),
        revealedAnswer: true,
        viewedSolution: true,
      });
    } else {
      data.submissions[questionId][0].revealedAnswer = true;
      data.submissions[questionId][0].viewedSolution = true;
    }
    await writeProgress(userId, data);
    return NextResponse.json({ ok: true });
  }

  // Rate their own attempt after seeing the answer
  if (body.action === "rateSubmission") {
    const { questionId, rating } = body; // rating: "wrong" | "partial" | "correct"
    if (!data.submissions?.[questionId]?.length) {
      return NextResponse.json({ error: "No submission to rate" }, { status: 400 });
    }
    data.submissions[questionId][0].selfRating = rating;
    await writeProgress(userId, data);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
