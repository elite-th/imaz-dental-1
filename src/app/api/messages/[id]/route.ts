import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Helper: transform DB row to API Message (snake_case)              */
/* ------------------------------------------------------------------ */
function transformMessage(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    is_read: row.isRead,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/messages/[id] — Update message (mark read/unread)      */
/* ------------------------------------------------------------------ */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isRead } = body;

    if (typeof isRead !== "boolean") {
      return NextResponse.json(
        { error: "Invalid isRead value — must be boolean" },
        { status: 400 }
      );
    }

    const existing = await db.message.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    const updated = await db.message.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json({
      message: transformMessage(updated),
      info: isRead ? "Message marked as read" : "Message marked as unread",
    });
  } catch (error) {
    console.error("[PATCH /api/messages/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/messages/[id] — Delete a message                      */
/* ------------------------------------------------------------------ */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.message.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    await db.message.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      info: "Message deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/messages/:id] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
