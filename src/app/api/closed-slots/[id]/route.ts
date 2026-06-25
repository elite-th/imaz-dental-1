import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  DELETE /api/closed-slots/[id] — Reopen a closed slot/day          */
/* ------------------------------------------------------------------ */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.closedSlot.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Closed slot not found" },
        { status: 404 }
      );
    }

    await db.closedSlot.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: existing.time ? "اسلات باز شد" : "روز باز شد",
    });
  } catch (error) {
    console.error("[DELETE /api/closed-slots/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to reopen slot" },
      { status: 500 }
    );
  }
}
