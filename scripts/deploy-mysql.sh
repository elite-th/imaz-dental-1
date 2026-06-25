#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Imaz Dental — Deploy to cPanel MySQL
#  این اسکریپت رو روی سرور سی‌پنل اجرا کنید
#  بیلد رو خودتون locally انجام بدید، این فقط دیتابیس رو آماده میکنه
# ═══════════════════════════════════════════════════════════════

set -e

echo "🔧 Imaz Dental — Deploy Script for cPanel + MySQL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Step 0: Check .env ──
echo ""
echo "📋 Step 0: Checking environment variables..."
if [ ! -f ".env" ]; then
  echo "   ❌ فایل .env وجود ندارد!"
  echo "   .env.production.example رو به .env کپی کنید و مقادیر رو پر کنید:"
  echo "   cp .env.production.example .env"
  exit 1
fi

# Verify required env vars
required_vars=("DATABASE_URL" "ADMIN_USERNAME" "ADMIN_PASSWORD" "SEED_SECRET" "VAPID_PUBLIC_KEY" "VAPID_PRIVATE_KEY")
missing=0
for var in "${required_vars[@]}"; do
  if [ -z "$(grep "^${var}=" .env | cut -d'=' -f2-)" ]; then
    echo "   ⚠️  متغیر ${var} در .env تنظیم نشده"
    missing=1
  fi
done
if [ "$missing" -eq 1 ]; then
  echo "   ❌ متغیرهای ضروری تنظیم نشدن. لطفاً .env رو کامل کنید."
  exit 1
fi
echo "   ✅ Environment variables OK"

# ── Step 1: Switch Prisma schema to MySQL ──
echo ""
echo "📋 Step 1: Switching Prisma schema to MySQL..."
cp prisma/schema.mysql.prisma prisma/schema.prisma
echo "   ✅ schema.prisma switched to MySQL"

# ── Step 2: Install dependencies ──
echo ""
echo "📋 Step 2: Installing dependencies..."
npm install
echo "   ✅ Dependencies installed"

# ── Step 3: Generate Prisma client ──
echo ""
echo "📋 Step 3: Generating Prisma client..."
npx prisma generate
echo "   ✅ Prisma client generated"

# ── Step 4: Push database schema ──
echo ""
echo "📋 Step 4: Creating database tables..."
npx prisma db push
echo "   ✅ Database schema created"

# ── Step 5: Seed database ──
echo ""
echo "📋 Step 5: Seeding database with initial data..."
SEED_SECRET_VAL=$(grep "^SEED_SECRET=" .env | cut -d'=' -f2-)
curl -s -X POST "http://localhost:3000/api/seed?secret=${SEED_SECRET_VAL}" | head -c 200
echo ""
echo "   ✅ Database seeded"

# ── Done ──
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Database setup complete!"
echo ""
echo "📌 حالا بیلد خودتون رو آپلود کنید و سرور رو استارت کنید:"
echo "   npm start"
echo ""
echo "📌 یا با PM2 (پیشنهادی):"
echo "   pm2 start npm --name 'imaz-dental' -- start"
echo ""
echo "📌 یادتون باشه:"
echo "   - فایل .env رو با اطلاعات MySQL پر کنید"
echo "   - Node.js 18+ نصب باشه"
echo "   - پورت 3000 آزاد باشه"
echo "   - SEED_SECRET رو یک رشته تصادفی طولانی بگذارید"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
