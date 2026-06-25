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
/*  POST /api/messages — Create a new message                         */
/* ------------------------------------------------------------------ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, subject, message } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      missing.push("name");
    }
    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      missing.push("email");
    }
    if (!subject || typeof subject !== "string" || subject.trim().length < 2) {
      missing.push("subject");
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      missing.push("message");
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Missing or invalid required fields", fields: missing },
        { status: 400 }
      );
    }

    const created = await db.message.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone:
          phone && typeof phone === "string" && phone.trim() !== ""
            ? phone.trim()
            : null,
        subject: subject.trim(),
        message: message.trim(),
        isRead: false,
      },
    });

    return NextResponse.json(
      {
        message: transformMessage(created),
        info: "Message sent successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/messages] Error:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/messages — List all messages (admin)                     */
/* ------------------------------------------------------------------ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search");
    const unreadOnly = searchParams.get("unread") === "true";

    const where: any = {};
    if (unreadOnly) {
      where.isRead = false;
    }
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery } },
        { email: { contains: searchQuery } },
        { subject: { contains: searchQuery } },
      ];
    }

    const messages = await db.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Compute stats from all messages (unfiltered)
    const allMessages = await db.message.findMany({
      select: { isRead: true },
    });

    const stats = {
      total: allMessages.length,
      unread: allMessages.filter((m) => !m.isRead).length,
    };

    return NextResponse.json({
      messages: messages.map(transformMessage),
      stats,
    });
  } catch (error) {
    console.error("[GET /api/messages] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
