# استخدام نسخة Node.js الرسمية
FROM node:22-bullseye

# تثبيت الأدوات اللازمة لبناء المكتبات (Python و C++)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات الإعدادات أولاً
COPY package*.json ./

# تثبيت المكتبات مع السماح بالبناء
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

# فتح المنفذ
EXPOSE 3000

# أمر التشغيل
CMD ["node", "main.js"]
