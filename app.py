import sqlite3
import os

# Mengatur path ke folder workspaceStorage
ENTRY_PATH = r"C:\Users\bagus\AppData\Roaming\Cursor\User\workspaceStorage"
conn = sqlite3.connect(f"{ENTRY_PATH}\\state.vscdb")  # Pastikan untuk menggunakan double backslash atau raw string
cursor = conn.cursor()

print(f"Path ke database: {ENTRY_PATH}\\state.vscdb")

# Membuat tabel ItemTable jika belum ada
cursor.execute('''
CREATE TABLE IF NOT EXISTS ItemTable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    value TEXT NOT NULL
)
''')
conn.commit()  # Jangan lupa untuk commit perubahan

# Cek tabel yang ada
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tabel yang ada:", tables)

if not tables:
    print("Tidak ada tabel yang ditemukan. Pastikan database telah diinisialisasi dengan benar.")
else:
    # Lanjutkan dengan kueri Anda
    cursor.execute("SELECT * FROM ItemTable WHERE key IN ('aiService.prompts', 'workbench.panel.aichat.view.aichat.chatdata')")
    chats = cursor.fetchall()
    print(chats)

conn.close()