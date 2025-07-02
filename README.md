# 🌟 Hướng Dẫn Cài Đặt & Chạy Dự Án Node.js

---

## 🚧 Bước 1: Cập nhật hệ thống & cài Git

```bash
sudo apt update
sudo apt install git -y
```

---

## 📥 Bước 2: Clone repository từ GitHub

```bash
git clone https://github.com/username/repo-name
cd repo-name
```

---

## 🔧 Bước 3: Cài đặt Node.js phiên bản 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 📦 Bước 4: Cài đặt thư viện & khởi động server

```bash
npm install
npm start
```

---

## 🛡️ Giữ server chạy khi thoát SSH với `tmux`

### ➤ Cài đặt `tmux`

```bash
sudo apt update
sudo apt install tmux
```

### ➤ Mở phiên `tmux` và khởi chạy lại server

```bash
tmux
npm start
```

> 💡 Bạn có thể thoát `tmux` mà không dừng tiến trình bằng cách nhấn `Ctrl + B`, sau đó `D`

---

## 🔁 Quản lý các phiên `tmux`

### 🔙 Vào lại phiên gần nhất

```bash
tmux a
```

---

### 📋 Xem danh sách các phiên đang chạy

```bash
tmux ls
```

---

### 🎯 Vào phiên cụ thể

```bash
tmux attach -t <ID phiên>
# Ví dụ:
tmux attach -t 5
```

---

> ✅ **Mẹo**: Sử dụng `tmux` để đảm bảo server vẫn hoạt động kể cả khi bạn thoát SSH!


---

## 👤 Tác giả

**Thanh Nguyên**  
📘 Facebook: Thanh Nguyên ☔  
🔗 https://facebook.com/thanhnguyentrummeta
