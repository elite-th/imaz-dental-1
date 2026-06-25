import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { stat } from "fs/promises";
import path from "path";

const ZIP_PATH = path.join(process.cwd(), "public", "zip", "imaz-dental.zip");

export async function GET(req: NextRequest) {
  try {
    const fileStat = await stat(ZIP_PATH);
    const fileBuffer = await readFile(ZIP_PATH);

    const headers = new Headers();
    headers.set("Content-Type", "application/zip");
    headers.set("Content-Disposition", "attachment; filename=imaz-dental-backup.zip");
    headers.set("Content-Length", fileStat.size.toString());
    headers.set("Cache-Control", "no-cache");

    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
