# ☸️ KubeMastery: Zero to Kubestronaut (CKAD & CKA Exam Prep Platform)

แพลตฟอร์มเตรียมสอบ **CNCF Kubernetes Certification (CKAD & CKA)** รูปแบบ Micro-learning และ Interactive CLI/YAML Labs ที่ถอดแบบโครงสร้าง UI/UX และสถาปัตยกรรม 100% Offline-first PWA มาจาก **EngMastery**

## ✨ ฟีเจอร์หลัก (Core Features)
1. **🎯 Global Exam Focus Switcher (`ALL` / `CKAD` / `CKA`)**: กรองบทเรียน โจทย์ CLI และโพยสอบตามใบเซอร์ที่กำลังเตรียมสอบได้ทันทีจากแถบด้านบน
2. **☸️ Lessons Hub (6 Core Tracks)**:
   - **Track 1**: CLI Speed & Core Concepts (`[BOTH]`)
   - **Track 2**: Workloads & Pod Scheduling (`[BOTH]`)
   - **Track 3**: App Config, Probes & RBAC Security (`[BOTH]`)
   - **Track 4**: Services, Ingress & NetworkPolicies (`[BOTH]`)
   - **Track 5**: Storage, Helm & Kustomize (`[BOTH / CKAD]`)
   - **Track 6**: Cluster Maintenance & Troubleshooting (`[CKA / BOTH]`)
3. **⌨️ Imperative CLI Speed Playground (Smart Kubectl Parser)**:
   - รองรับทั้งคำสั่งเต็ม `kubectl`, alias `k`, ตัวแปรห้องสอบ `$do` (`--dry-run=client -o yaml`), `$now` (`--force --grace-period=0`), Resource Shortnames (`po`, `deploy`, `svc`, `cm`, `sa`, `ing`, `netpol`) และการสลับตำแหน่ง Flags
4. **🛠️ YAML Fixer & Cluster Troubleshooter**: ฝึกวิเคราะห์และซ่อมไฟล์ YAML ที่พังจากสถานการณ์สอบจริง
5. **📖 Deep Dive & Exam Playbooks**: คัมภีร์ตั้งค่า `.bashrc`/`.vimrc` ใน 60 วินาทีแรกของการสอบ, โพย Etcd Backup/Restore, Kubeadm Upgrade และ NetworkPolicy Recipes
6. **🎲 3D K8s Flashcards & Timed Mock Exam Simulator**: ท่องจำ Shortnames/Ports/Flags และจำลองสอบจับเวลาจริง

## 🚀 การรันใช้งานในเครื่อง (Local Development)
```bash
./start.sh        # เริ่มรันเว็บเซิร์ฟเวอร์ที่ http://localhost:3080
./status.sh       # ตรวจสอบสถานะเซิร์ฟเวอร์
./stop.sh         # หยุดการทำงานเซิร์ฟเวอร์
```

