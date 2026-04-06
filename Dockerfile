FROM node:22-bullseye

# تثبيت الأدوات اللازمة للبناء
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# نسخ ملفات التعريف أولاً
COPY package*.json ./

# حذف أي بقايا قديمة وتثبيت نظيف للمكتبات
RUN rm -rf node_modules && npm install

# نسخ باقي الملفات
COPY . .

EXPOSE 3000

# التأكد من تشغيل الملف بالحروف الصغيرة
CMD ["node", "main.js"]
