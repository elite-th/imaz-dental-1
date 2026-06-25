import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/* ------------------------------------------------------------------ */
/*  GET /api/files/uploads/... — Serve uploaded files                   */
/*                                                                      */
/*  In standalone build, process.cwd() points to .next/standalone/      */
/*  but uploaded files live in the actual project root's public/ dir.   */
/*  We search multiple possible locations to find the file.             */
/* ------------------------------------------------------------------ */

// Possible upload directories — check in order
function getUploadDirs(): string[] {
  const cwd = process.cwd();

  // If UPLOAD_DIR is set via env var, use it
  const envUploadDir = process.env.UPLOAD_DIR;
  const envBased = envUploadDir
    ? [path.join(envUploadDir, "uploads")]
    : [];

  return [
    ...envBased,
    path.join(cwd, "public", "uploads"),                          // Standard: cwd/public/uploads
    path.join(cwd, "..", "..", "public", "uploads"),              // Standalone: .next/standalone/../../public/uploads
  ];
}

// MIME type map
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params;

    // Only allow serving from uploads directory
    if (pathParts[0] !== "uploads") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Build relative path (skip "uploads" prefix since we already know it's uploads)
    const relativePath = pathParts.slice(1).join("/"); // e.g., "collaborations/image.png"

    if (!relativePath) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Search for file in possible upload directories
    const uploadDirs = getUploadDirs();
    let foundFilePath: string | null = null;

    for (const uploadDir of uploadDirs) {
      const filePath = path.join(uploadDir, relativePath);
      const resolvedPath = path.resolve(filePath);

      // Security: prevent directory traversal
      const resolvedDir = path.resolve(uploadDir);
      if (!resolvedPath.startsWith(resolvedDir)) {
        continue;
      }

      if (existsSync(resolvedPath)) {
        foundFilePath = resolvedPath;
        break;
      }
    }

    if (!foundFilePath) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(foundFilePath);
    const ext = path.extname(foundFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // Get file stats for caching
    const fileStat = await stat(foundFilePath);
    const lastModified = fileStat.mtime.toUTCString();
    const etag = `"${fileStat.size}-${fileStat.mtimeMs}"`;

    // Check If-None-Match for caching
    const ifNoneMatch = request.headers.get("If-None-Match");
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Last-Modified": lastModified,
        ETag: etag,
      },
    });
  } catch (error) {
    console.error("[GET /api/files] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
