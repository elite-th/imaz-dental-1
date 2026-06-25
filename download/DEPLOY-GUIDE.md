# 🦷 راهنمای دیپلوی کلینیک دندانپزشکی ایماز روی cPanel

> راهنمای گام‌به‌گام برای راه‌اندازی سایت روی هاست سی‌پنل با Node.js App

---

## 💻 اجرای لوکال روی ویندوز (قبل از دیپلوی)

اگر می‌خواید پروژه رو روی ویندوز خودتون تست کنید:

### ۱. فایل `.env` بسازید
فایل `download/.env.example` رو به روت پروژه کپی کنید:
```bash
copy download\.env.example .env
```
یا فایل `.env` رو کنار `package.json` بسازید با محتوای:
```
DATABASE_URL=file:./db/custom.db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Imaz@2026
SEED_SECRET=local-dev-seed-secret
VAPID_PUBLIC_KEY=BJhs952oX3d0OtfqZ6TbjNSH4WqWHO6mTwMqnDwyxc1jNRpVv3GYnIw43LX4Mh0nByTurptxe0yCWUmmeIWUUq8
VAPID_PRIVATE_KEY=w1ZMaYe_rksxNVHhrGzYByQAls0q6ESpH1v2P8FChNQ
VAPID_SUBJECT=mailto:info@imazdental.com
UPLOAD_DIR=public/uploads
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### ۲. دیتابیس SQLite رو بسازید
```bash
mkdir db
npx prisma db push
npx prisma generate
```

### ۳. Seed دیتابیس
```bash
npx tsx prisma/seed.ts
```

### ۴. اجرای سرور توسعه
```bash
npm run dev
```
> 💡 دستور `npm run dev` از Webpack استفاده می‌کنه (مخصوص ویندوز)

### ۵. باز کردن سایت
در مرورگر: `http://localhost:3000`

---

## 📋 پیش‌نیازها

| مورد | حداقل نسخه |
|-------|------------|
| Node.js | 18.x یا بالاتر |
| MySQL | 5.7 یا بالاتر |
| فضای دیسک | حداقل ۵۰۰ مگابایت |
| حافظه RAM | حداقل ۵۱۲ مگابایت |

> ⚠️ **توجه:** در سی‌پنل باید گزینه **Setup Node.js App** موجود باشد. اگر نیست، با پشتیبانی هاست تماس بگیرید.

---

## 🚀 گام ۱: ساخت دیتابیس MySQL در سی‌پنل

1. وارد **cPanel** شوید
2. بخش **MySQL® Databases** را باز کنید
3. یک دیتابیس جدید بسازید:
   - نام دیتابیس: `imazdental` → نام کامل: `cpaneluser_imazdental`
4. یک کاربر MySQL جدید بسازید:
   - نام کاربری: `imazuser` → نام کامل: `cpaneluser_imazuser`
   - رمز عبور: یک رمز قوی انتخاب کنید و **ذخیره کنید**
5. کاربر را به دیتابیس اضافه کنید:
   - **ALL PRIVILEGES** را تیک بزنید

📝 **اطلاعات دیتابیس رو یادداشت کنید:**
```
Database: cpaneluser_imazdental
User:     cpaneluser_imazuser
Password: (رمزی که انتخاب کردید)
Host:     localhost
Port:     3306
```

---

## 📂 گام ۲: آپلود سورس کد

1. فایل ZIP (`imaz-dental-source.zip`) رو در کامپیوتر دانلود کنید
2. وارد **File Manager** سی‌پنل شوید
3. به مسیر `/home/cpaneluser/` بروید
4. یک پوشه جدید بسازید: `imaz-dental`
5. فایل ZIP رو در این پوشه آپلود کنید
6. فایل ZIP رو Extract کنید
7. ساختار نهایی باید این‌طور باشه:
```
/home/cpaneluser/imaz-dental/
├── src/
├── prisma/
├── public/
│   ├── fonts/         ← فونت‌ها (Vazirmatn, DM Sans, Playfair Display)
│   ├── sw.js
│   ├── manifest.json
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── favicon.svg
│   ├── favicon-new.svg
│   ├── logo.svg
│   ├── images/        ← این پوشه رو بسازید
│   └── uploads/       ← این پوشه رو بسازید
├── scripts/
├── .env.production.example
├── package.json
├── next.config.ts
├── tsconfig.json
└── ...
```

### 📸 آپلود فایل‌های تصویری

پوشه `public/images/` و `public/uploads/` رو بسازید و فایل‌های تصویری زیر رو آپلود کنید:

**تصاویر ضروری:**
```
public/images/og-image.png         (تصویر Open Graph - 1200x630)
public/images/hero-dental.png      (تصویر هیرو)
public/images/imaz-logo.png        (لوگو)
public/images/imaz-logo-new.svg    (لوگو SVG)
public/images/dentist-portrait.jpg (عکس دکتر)
public/images/booking-bg.png       (پس‌زمینه رزرو)
public/images/hero-bg-abstract.png (پس‌زمینه هیرو)
```

**تصاویر گالری (Before/After):**
```
public/images/before-1.png, before-2.png, before-3.png
public/images/after-1.png, after-2.png, after-3.png
```

**آواتارها:**
```
public/images/avatar-p1.png, avatar-p2.png, avatar-p3.png
public/images/avatar-t1.png, avatar-t2.png, avatar-t3.png
```

> 💡 **نکته:** این فایل‌ها توی نسخه لوکال شما موجود هستن. از پوشه `public/` پروژه لوکال کپی کنید.

---

## ⚙️ گام ۳: تنظیم Node.js App در سی‌پنل

1. وارد **cPanel** شوید
2. بخش **Setup Node.js App** را باز کنید
3. روی **Create Application** کلیک کنید
4. تنظیمات زیر رو وارد کنید:

| فیلد | مقدار |
|------|-------|
| **Node.js version** | 18.x یا 20.x |
| **Application mode** | Production |
| **Application root** | `/home/cpaneluser/imaz-dental` |
| **Application URL** | `imazdental.com` (یا ساب‌دامین) |
| **Application startup file** | `.next/standalone/server.js` |
| **Passenger log file** | (پیش‌فرض) |

5. روی **Create** کلیک کنید

> ⚠️ **مهم:** Application startup file رو فعلاً `.next/standalone/server.js` بگذارید. بعد از بیلد ساخته میشه.

---

## 🔧 گام ۴: تنظیم متغیرهای محیطی

در صفحه **Setup Node.js App**، بخش **Environment variables**، متغیرهای زیر رو اضافه کنید:

```
DATABASE_URL=mysql://cpaneluser_imazuser:PASSWORD@localhost:3306/cpaneluser_imazdental
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Imaz@2026
SEED_SECRET=a1b2c3d4-e5f6-7890-abcd-ef1234567890
VAPID_PUBLIC_KEY=BJhs952oX3d0OtfqZ6TbjNSH4WqWHO6mTwMqnDwyxc1jNRpVv3GYnIw43LX4Mh0nByTurptxe0yCWUmmeIWUUq8
VAPID_PRIVATE_KEY=w1ZMaYe_rksxNVHhrGzYByQAls0q6ESpH1v2P8FChNQ
VAPID_SUBJECT=mailto:info@imazdental.com
UPLOAD_DIR=/home/cpaneluser/imaz-dental/public/uploads
NEXT_PUBLIC_SITE_URL=https://imazdental.com
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=3000
```

> 🔐 **تغییرات ضروری:**
> - `PASSWORD` → رمز دیتابیس که در گام ۱ ساختید
> - `cpaneluser` → یوزرنیم سی‌پنل خودتون
> - `SEED_SECRET` → یک رشته تصادفی طولانی و یکتا بگذارید
> - `ADMIN_PASSWORD` → رمز دلخواه برای پنل ادمین

بعد از اضافه کردن، روی **Save** کلیک کنید.

---

## 📦 گام ۵: نصب و بیلد از طریق Terminal

1. در سی‌پنل، بخش **Terminal** رو باز کنید (یا از SSH استفاده کنید)
2. به پوشه پروژه بروید:
```bash
cd /home/cpaneluser/imaz-dental
```

3. **سوئیچ Prisma به MySQL:**
```bash
cp prisma/schema.mysql.prisma prisma/schema.prisma
```

4. **نصب وابستگی‌ها:**
```bash
npm install
```

5. **ساخت Prisma Client:**
```bash
npx prisma generate
```

6. **ایجاد جداول دیتابیس:**
```bash
npx prisma db push
```

7. **بیلد پروژه (و کپی خودکار فایل‌ها):**
```bash
npm run build:standalone
```

> ⏳ بیلد ممکنه ۲ تا ۵ دقیقه طول بکشه. صبور باشید.

> 💡 این دستور شامل بیلد Next.js + کپی فایل‌های static و public به standalone هست.

> ⚠️ اگر دستور بالا کار نکرد (مثلاً در ویندوز)، بیلد رو جداگانه انجام بدید:
> ```bash
> npm run build
> # سپس دستی کپی کنید:
> xcopy /E /I /Y .next\static .next\standalone\.next\static
> xcopy /E /I /Y public .next\standalone\public
> ```

---

## 🌱 گام ۶: Seed کردن دیتابیس

بعد از اینکه سرور بالا اومد، دیتابیس رو با اطلاعات اولیه پر کنید:

```bash
# ابتدا سرور رو استارت کنید (گام ۷)
# سپس این دستور رو اجرا کنید:
curl -X POST "http://localhost:3000/api/seed?secret=a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

> 📝 `secret` باید همون مقداری باشه که در `SEED_SECRET` تنظیم کردید.

---

## ▶️ گام ۷: استارت سرور

### روش ۱: از طریق سی‌پنل (پیشنهادی)

اگر گام ۳ و ۴ رو درست انجام داده باشید، کافیه در صفحه **Setup Node.js App** روی **Restart** کلیک کنید.

سی‌پنل از **Phusion Passenger** استفاده می‌کنه و فایل `.next/standalone/server.js` رو اجرا می‌کنه.

### روش ۲: با PM2 (پایدارتر)

```bash
cd /home/cpaneluser/imaz-dental
npm install -g pm2
pm2 start .next/standalone/server.js --name imaz-dental
pm2 save
pm2 startup
```

> 💡 **نکته:** PM2 باعث میشه سرور بعد از ریستارت سرور هم دوباره بالا بیاد.

---

## 🌐 گام ۸: تنظیم دامین

### اگر دامین روی همون هاست هست:

1. وارد **cPanel** شوید
2. بخش **Domains** یا **Addon Domains**
3. دامین `imazdental.com` رو اضافه کنید
4. **Document Root** رو به `/home/cpaneluser/imaz-dental` تنظیم کنید

### تنظیم DNS:

در پنل دامین (مثل Cloudflare یا پنل ثبت‌کننده):

```
A Record: imazdental.com → آی‌پی سرور
A Record: www.imazdental.com → آی‌پی سرور
```

---

## 🔀 گام ۹: تنظیم .htaccess (برای Proxy به Node.js)

اگر از **Phusion Passenger** سی‌پنل استفاده می‌کنید، معمولاً نیاز به `.htaccess` نیست.

اما اگر از روش **subdomain + port** استفاده می‌کنید، فایل `.htaccess` بسازید:

```apache
# /home/cpaneluser/imaz-dental/.htaccess
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

> 💡 **نکته:** اگر سی‌پنل از Passenger پشتیبانی می‌کنه، این فایل لازم نیست.

---

## ✅ گام ۱۰: تست و بررسی

بعد از استارت سرور، این موارد رو چک کنید:

### تست‌های ضروری:

| # | تست | روش |
|---|------|------|
| 1 | سایت بالا میاد؟ | `https://imazdental.com` رو باز کنید |
| 2 | تصاویر لود میشن؟ | هیرو، لوگو و گالری رو چک کنید |
| 3 | فرم رزرو کار میکنه؟ | یک نوبت ثبت کنید |
| 4 | پنل ادمین؟ | `https://imazdental.com/admin` رو باز کنید |
| 5 | لاگین ادمین؟ | با یوزر/پسورد تنظیم شده وارد شوید |
| 6 | نوتیفیکیشن؟ | بعد از لاگین، اجازه نوتیفیکیشن بدید |
| 7 | API سالمه؟ | `https://imazdental.com/api/slots/available` رو چک کنید |
| 8 | فایل‌های آپلودی؟ | عکس‌های گالری و همکاری‌ها رو چک کنید |

### تست Seed:
```bash
curl -X POST "https://imazdental.com/api/seed?secret=YOUR_SEED_SECRET"
```

---

## 🔥 رفع مشکلات رایج

### مشکل: `502 Bad Gateway`
**علت:** سرور Node.js اجرا نیست
**راه‌حل:**
```bash
cd /home/cpaneluser/imaz-dental
pm2 restart imaz-dental
# یا از سی‌پنل Restart کنید
```

### مشکل: تصاویر لود نمیشه
**علت:** پوشه `public/` به `.next/standalone/` کپی نشده
**راه‌حل:**
```bash
cd /home/cpaneluser/imaz-dental
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
# سپس ریستارت کنید
```

### مشکل: `Prisma Client could not be found`
**علت:** Prisma Client بعد از بیلد تولید نشده
**راه‌حل:**
```bash
cd /home/cpaneluser/imaz-dental
npx prisma generate
npm run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
```

### مشکل: `Can't reach database server`
**علت:** DATABASE_URL اشتباه هست
**راه‌حل:** فرمت صحیح:
```
mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME
```
دقت کنید یوزر و دیتابیس شامل پیشوند سی‌پنل هستن (مثل `cpaneluser_imazdental`)

### مشکل: `EADDRINUSE: address already in use :::3000`
**علت:** پورت ۳۰۰۰ قبلاً اشغال شده
**راه‌حل:**
```bash
# پیدا کردن پروسه:
lsof -i :3000
# یا:
fuser -k 3000/tcp
# سپس ریستارت کنید
```

### مشکل: سرور بعد از ریبوت هاست بالا نمیاد
**راه‌حل:** از PM2 استفاده کنید:
```bash
pm2 start .next/standalone/server.js --name imaz-dental
pm2 save
pm2 startup
```

### مشکل: `Turbopack is not supported on this platform` (ویندوز)
**علت:** باینری SWC سازگار با ویندوز شما نصب نشده
**راه‌حل:** از Webpack استفاده کنید:
```bash
npm run dev
# اگر باز هم خطا داد:
npx next dev --webpack
```
این مشکل فقط در ویندوز هست. روی سرور لینوکس (سی‌پنل) این ارور رو ندارید.

---

## 📁 ساختار نهایی روی سرور

```
/home/cpaneluser/imaz-dental/
├── .env                          ← متغیرهای محیطی
├── .next/
│   └── standalone/               ← بیلد نهایی
│       ├── server.js             ← فایل اجرایی اصلی
│       ├── .next/static/         ← فایل‌های استاتیک JS/CSS
│       └── public/               ← فایل‌های پابلیک کپی شده
├── node_modules/
├── prisma/
│   ├── schema.prisma             ← اسکیمای MySQL
│   └── schema.mysql.prisma       ← نسخه بکاپ
├── public/
│   ├── images/                   ← تصاویر سایت
│   ├── uploads/                  ← فایل‌های آپلودی
│   ├── sw.js                     ← سرویس ورکر
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── src/                          ← سورس کد
├── package.json
└── ...
```

---

## 🔄 بروزرسانی سایت

وقتی تغییری در سورس کد دادید:

```bash
cd /home/cpaneluser/imaz-dental

# ۱. آپلود سورس جدید (یا git pull)

# ۲. نصب وابستگی‌های جدید (اگر پکیج اضافه شده)
npm install

# ۳. بیلد مجدد
npm run build

# ۴. کپی فایل‌های استاتیک
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# ۵. ریستارت سرور
pm2 restart imaz-dental
```

---

## 🛡️ نکات امنیتی مهم

1. **رمز ADMIN_PASSWORD** رو قوی انتخاب کنید (حداقل ۱۲ کاراکتر)
2. **SEED_SECRET** رو یک UUID تصادفی بگذارید
3. **VAPID_PRIVATE_KEY** رو هرگز به اشتراک نگذارید
4. فایل `.env` رو هرگز در Git کامیت نکنید
5. پورت ۳۰۰۰ رو از فایروال ببندید (فقط ۸۰ و ۴۴۳ باز باشن)
6. SSL رو فعال کنید (Let's Encrypt از سی‌پنل)

---

## 📞 پشتیبانی

اگر مشکلی داشتید:
1. لاگ‌های سرور رو چک کنید: `pm2 logs imaz-dental`
2. لاگ‌های Passenger رو در سی‌پنل چک کنید
3. مطمئن بشید Node.js 18+ نصب هست: `node -v`

---

*🦷 کلینیک دندانپزشکی ایماز — راهنمای دیپلوی نسخه ۱.۰*
