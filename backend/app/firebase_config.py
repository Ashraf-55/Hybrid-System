import os
import firebase_admin
from firebase_admin import credentials, storage

# تحديد المسار
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
service_account_path = os.path.join(BASE_DIR, "serviceAccountKey.json")

# 1. تشغيل الفايربيز
if not firebase_admin._apps:
    try:
        # لو الملف موجود شغله، لو مش موجود كمل عشان السيرفر ميوقفش
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred, {
                'storageBucket': 'hybrid-system-99.appspot.com' 
            })
            print("✅ Firebase initialized successfully!")
        else:
            print("⚠️ Firebase key not found, skipping initialization...")
    except Exception as e:
        print(f"❌ Firebase error: {e}")

# 2. الدالة اللي السيرفر بيدور عليها (مهمة جداً)
def upload_file_to_firebase(local_path, remote_path):
    try:
        bucket = storage.bucket()
        blob = bucket.blob(remote_path)
        blob.upload_from_filename(local_path)
        blob.make_public()
        return blob.public_url
    except Exception as e:
        print(f"Upload error: {e}")
        return None