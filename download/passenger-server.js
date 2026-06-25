// @ts-nocheck
// ═══════════════════════════════════════════════════════════════
//  Imaz Dental — cPanel/Passenger Startup File
//
//  نحوه استفاده:
//  ۱. این فایل رو در روت پروژه کپی کنید:
//     /home/cpaneluser/imaz-dental/passenger-server.js
//
//  ۲. در سی‌پنل > Setup Node.js App:
//     Application startup file = passenger-server.js
//
//  ۳. این فایل standalone server رو لود می‌کنه و پورت رو
//     از متغیر محیطی PORT می‌خونه (سی‌پنل خودش تنظیم می‌کنه)
// ═══════════════════════════════════════════════════════════════
/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("path");

// Point to the standalone server
const standalonePath = path.join(__dirname, ".next", "standalone", "server.js");

try {
  require(standalonePath);
} catch (err) {
  console.error("=============================================");
  console.error("❌ Failed to start Imaz Dental server");
  console.error("=============================================");
  console.error("");
  console.error("Make sure you have:");
  console.error("  1. npm run build");
  console.error("  2. cp -r .next/static .next/standalone/.next/");
  console.error("  3. cp -r public .next/standalone/");
  console.error("");
  console.error("Error:", err.message);
  console.error("=============================================");
  process.exit(1);
}
