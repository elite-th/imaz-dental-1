import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Known setting keys with default empty values                       */
/* ------------------------------------------------------------------ */
const SETTING_KEYS = [
  "clinic_name",
  "clinic_phone",
  "clinic_address",
  "working_hours",
  "social_telegram",
  "social_whatsapp",
  "social_bale",
  "social_youtube",
  "social_instagram",
] as const;

type SettingKey = (typeof SETTING_KEYS)[number];

function buildSettingsObject(
  rows: { key: string; value: string }[]
): Record<SettingKey, string> {
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const settings = {} as Record<SettingKey, string>;
  for (const key of SETTING_KEYS) {
    settings[key] = map.get(key) ?? "";
  }
  return settings;
}

/* ------------------------------------------------------------------ */
/*  GET /api/settings — Return all clinic settings as key-value object */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    const rows = await db.clinicSetting.findMany();
    const settings = buildSettingsObject(rows);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[GET /api/settings] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clinic settings" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  PUT /api/settings — Update clinic settings (upsert per key)        */
/*  Body: { clinic_name?, clinic_phone?, clinic_address?,              */
/*          working_hours?, social_telegram?, social_whatsapp?,        */
/*          social_youtube?, social_instagram? }                       */
/* ------------------------------------------------------------------ */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    // Validate that only known keys are provided
    const allowedKeys = new Set<string>(SETTING_KEYS);
    const providedKeys = Object.keys(body);
    const invalidKeys = providedKeys.filter((k) => !allowedKeys.has(k));

    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Unknown setting key(s): ${invalidKeys.join(", ")}` },
        { status: 400 }
      );
    }

    // Upsert each provided key
    for (const key of providedKeys) {
      const value = body[key];

      if (typeof value !== "string") {
        return NextResponse.json(
          { error: `Value for "${key}" must be a string` },
          { status: 400 }
        );
      }

      await db.clinicSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    // Fetch all settings to return the complete object
    const rows = await db.clinicSetting.findMany();
    const settings = buildSettingsObject(rows);

    return NextResponse.json({
      settings,
      message: "Settings saved successfully",
    });
  } catch (error) {
    console.error("[PUT /api/settings] Error:", error);
    return NextResponse.json(
      { error: "Failed to save clinic settings" },
      { status: 500 }
    );
  }
}
