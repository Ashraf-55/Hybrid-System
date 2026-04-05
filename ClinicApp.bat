@echo off
title Clinic System Launcher
echo جاري تشغيل سيستم العيادة...

:: تشغيل سيرفر البايثون في الخلفية
start /min python main.py

:: انتظر ثانيتين عشان السيرفر يلحق يشتغل
timeout /t 2 /nobreak > nul

:: افتح صفحة العيادة في المتصفح الافتراضي
start "" "index.html"

exit
