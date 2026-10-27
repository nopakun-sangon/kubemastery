/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/
 */
(function (root) {
  const pageData = {
  "id": "admin-kubeadm-upgrade",
  "categoryId": "administer-cluster",
  "categoryTitle": "Administer a Cluster",
  "titleEn": "Upgrading kubeadm clusters",
  "titleTh": "ขั้นตอนการอัปเกรดคลัสเตอร์ที่ติดตั้งด้วย kubeadm",
  "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/",
  "docsPath": "/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/",
  "lead": "คู่มือฉบับสมบูรณ์ทีละขั้นตอนในการอัปเกรดคลัสเตอร์ Kubernetes ที่ติดตั้งด้วย kubeadm จากเวอร์ชันหนึ่งไปยังอีกเวอร์ชันหนึ่งอย่างปลอดภัยและปราศจาก Downtime ของระบบ (Zero Downtime Maintenance)",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nการอัปเกรดคลัสเตอร์ Kubernetes ด้วย `kubeadm` ต้องทำเป็นลำดับขั้นทีละ Minor Version (ห้ามกระโดดข้าม เช่น v1.29 -> v1.30 -> v1.31) โดยเริ่มจาก Control Plane โหนดแรก ตามด้วย Control Plane โหนดอื่นๆ (กรณี HA) และปิดท้ายด้วยการทำ Rolling Upgrade ทีละ Worker Node เพื่อความปลอดภัยแบบ Zero Downtime\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **ลำดับการอัปเกรด Control Plane โหนดแรก**:\n  1. อัปเกรด kubeadm: `apt-mark unhold kubeadm && apt-get update && apt-get install -y kubeadm=1.30.x-1.1 && apt-mark hold kubeadm`\n  2. วางแผนและสั่งอัปเกรดคลัสเตอร์: `sudo kubeadm upgrade plan` ตามด้วย `sudo kubeadm upgrade apply v1.30.x`\n  3. Drain โหนด: `kubectl drain <cp-node> --ignore-daemonsets`\n  4. อัปเกรด kubelet & kubectl: `apt-get install -y kubelet=1.30.x-1.1 kubectl=1.30.x-1.1` จากนั้น `systemctl daemon-reload && systemctl restart kubelet`\n  5. Uncordon โหนด: `kubectl uncordon <cp-node>`\n* **Control Plane อื่นๆ (HA)**: ใช้คำสั่ง `sudo kubeadm upgrade node` (แทน `apply`)\n* **Worker Nodes**: Drain โหนดก่อน -> อัปเกรด kubeadm -> รัน `sudo kubeadm upgrade node` -> อัปเกรด kubelet/kubectl และ restart kubelet -> Uncordon โหนด\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* ข้อสอบ CKA ออกแน่นอน: จดจำลำดับคำสั่ง `kubeadm upgrade plan` -> `kubeadm upgrade apply` (สำหรับ CP1) vs `kubeadm upgrade node` (สำหรับ Worker และ Secondary CP)\n* ระวัง: คำสั่ง `kubectl drain` มักติดข้อผิดพลาด ต้องเติม `--ignore-daemonsets` และหากมี emptyDir ให้ใส่ `--delete-emptydir-data`\n* อย่าลืมสั่ง `kubectl uncordon <node>` เสมอหลังการอัปเกรดเสร็จสิ้นในแต่ละโหนด",
  "sections": [
    {
      "id": "upgrade-strategy-prereqs",
      "headingEn": "Upgrade Strategy, Version Skew, and Prerequisites",
      "headingTh": "กลยุทธ์การอัปเกรด นโยบาย Version Skew และการเตรียมความพร้อม",
      "contentMarkdown": "การอัปเกรดคลัสเตอร์ Kubernetes ด้วย `kubeadm` มีหลักการสำคัญและข้อกำหนดที่ต้องปฏิบัติตามอย่างเคร่งครัดดังต่อไปนี้:\n\n* **ห้ามกระโดดข้าม Minor Version**: คุณสามารถอัปเกรดได้ทีละเวอร์ชันเท่านั้น เช่น จาก `1.29.x` ไปยัง `1.30.x` โดยห้ามข้ามจาก `1.29.x` ไป `1.31.x` เด็ดขาด หากต้องการไปข้าม 2 รุ่น ต้องทำทีละสเต็ปตามลำดับ\n* **ลำดับการอัปเกรด (Order of Operations)**:\n  1. อัปเกรดโหนด **Primary Control Plane** โหนดแรก\n  2. อัปเกรดโหนด **Control Plane อื่นๆ** (ในกรณี HA)\n  3. อัปเกรด **Worker Nodes** ทีละโหนด\n* **การสำรองข้อมูล (Backup)**: คุณต้องทำ Snapshot สำรองฐานข้อมูล `etcd` และสำรองไฟล์คอนฟิกูเรชันในไดเรกทอรี `/etc/kubernetes/` ก่อนเริ่มกระบวนการเสมอ\n* **ความพร้อมของคลัสเตอร์**: ตรวจสอบว่าโหนดทุกตัวอยู่ในสถานะ `Ready` และไม่มี Pod สำคัญตกค้างในสถานะ CrashLoopBackOff หรือ Error",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "pre-upgrade-check.sh",
          "code": "# ตรวจสอบสถานะโหนดทั้งหมด\nkubectl get nodes -o wide\n\n# ตรวจสอบสถานะ Pod ในระบบทั้งหมด\nkubectl get pods -A | grep -v Running"
        }
      ]
    },
    {
      "id": "upgrade-first-control-plane",
      "headingEn": "Upgrading the First Control Plane Node",
      "headingTh": "ขั้นตอนการอัปเกรดโหนด Control Plane โหนดแรก",
      "contentMarkdown": "การอัปเกรด Control Plane โหนดแรกเป็นขั้นตอนที่สำคัญที่สุด เพราะจะทำการอัปเกรด Core Components ได้แก่ kube-apiserver, kube-controller-manager, kube-scheduler, etcd และ CoreDNS\n\nขั้นตอนปฏิบัติ:\n\n1. **ค้นหาเวอร์ชันและอัปเกรดแพ็กเกจ kubeadm**:\n   ทำการปลดล็อกแพ็กเกจ `apt-mark unhold kubeadm`, อัปเกรดเป็นเวอร์ชันเป้าหมาย (เช่น `1.30.2-1.1`), และล็อกแพ็กเกจกลับคืน\n\n2. **ตรวจสอบแผนการอัปเกรด**:\n   รันคำสั่ง `sudo kubeadm upgrade plan` เพื่อให้ kubeadm วิเคราะห์ความพร้อมของเวอร์ชันและใบรับรองต่างๆ\n\n3. **ดำเนินการอัปเกรด Control Plane**:\n   รันคำสั่ง `sudo kubeadm upgrade apply v1.30.2` ซึ่งคำสั่งนี้จะอัปเกรดคอนฟิก คลัสเตอร์ manifest และ certificate อัตโนมัติ\n\n4. **Drain และอัปเกรด kubelet & kubectl บนโหนด**:\n   ขับไล่ Pod ออกจากโหนดด้วย `kubectl drain`, อัปเกรดแพ็กเกจ `kubelet` และ `kubectl`, รีสตาร์ทเซอร์วิส, และเปิดรับพอดกลับด้วย `kubectl uncordon`",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "upgrade-control-plane.sh",
          "code": "# 1. อัปเกรดแพ็กเกจ kubeadm\nsudo apt-mark unhold kubeadm\nsudo apt-get update && sudo apt-get install -y kubeadm='1.30.2-*'\nsudo apt-mark hold kubeadm\n\n# ยืนยันเวอร์ชัน kubeadm\nkubeadm version\n\n# 2. ตรวจสอบแผนการอัปเกรด\nsudo kubeadm upgrade plan\n\n# 3. รันการอัปเกรดส่วนประกอบ Control Plane\nsudo kubeadm upgrade apply v1.30.2 --yes\n\n# 4. Drain โหนด Control Plane ก่อนอัปเกรด kubelet\nkubectl drain control-plane-1 --ignore-daemonsets\n\n# 5. อัปเกรด kubelet และ kubectl\nsudo apt-mark unhold kubelet kubectl\nsudo apt-get update && sudo apt-get install -y kubelet='1.30.2-*' kubectl='1.30.2-*'\nsudo apt-mark hold kubelet kubectl\n\n# 6. รีโหลดและรีสตาร์ทเซอร์วิส kubelet\nsudo systemctl daemon-reload\nsudo systemctl restart kubelet\n\n# 7. คืนสถานะโหนดให้พร้อมรับงาน\nkubectl uncordon control-plane-1"
        }
      ]
    },
    {
      "id": "upgrade-additional-control-planes",
      "headingEn": "Upgrading Additional Control Plane Nodes (HA Architecture)",
      "headingTh": "ขั้นตอนการอัปเกรดโหนด Control Plane เพิ่มเติม (สถาปัตยกรรม HA)",
      "contentMarkdown": "ในคลัสเตอร์แบบ High Availability (มี Control Plane มากกว่า 1 โหนด) การอัปเกรดโหนด Control Plane ที่เหลือจะไม่ใช้คำสั่ง `apply` แต่จะใช้คำสั่ง `sudo kubeadm upgrade node` แทน\n\n> ข้อสังเกต: คำสั่ง `kubeadm upgrade apply` จะรันเฉพาะบนโหนด Control Plane โหนดแรกเท่านั้น ส่วนโหนด Control Plane อื่นๆ และ Worker Nodes จะใช้คำสั่ง `kubeadm upgrade node` เหมือนกันทั้งหมด",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "upgrade-secondary-cp.sh",
          "code": "# บนโหนด Control Plane ตัวถัดไป:\nsudo apt-mark unhold kubeadm\nsudo apt-get update && sudo apt-get install -y kubeadm='1.30.2-*'\nsudo apt-mark hold kubeadm\n\n# รันการอัปเกรดระดับโหนด\nsudo kubeadm upgrade node\n\n# จากเครื่องที่มีสิทธิ์ kubectl ให้ drain โหนดนี้\nkubectl drain control-plane-2 --ignore-daemonsets\n\n# อัปเกรด kubelet และ kubectl\nsudo apt-mark unhold kubelet kubectl\nsudo apt-get update && sudo apt-get install -y kubelet='1.30.2-*' kubectl='1.30.2-*'\nsudo apt-mark hold kubelet kubectl\n\nsudo systemctl daemon-reload\nsudo systemctl restart kubelet\n\n# ปลด cordon\nkubectl uncordon control-plane-2"
        }
      ]
    },
    {
      "id": "upgrade-worker-nodes",
      "headingEn": "Upgrading Worker Nodes",
      "headingTh": "ขั้นตอนการอัปเกรด Worker Nodes ทีละโหนด",
      "contentMarkdown": "สำหรับ Worker Nodes คุณควรอัปเกรดทีละโหนด (Rolling Upgrade) เพื่อให้พอดของแอปพลิเคชันยังคงทำงานอยู่บนโหนดอื่นได้อย่างต่อเนื่อง โดยไม่ทำให้เกิด Downtime\n\n1. **Drain Worker Node**: สั่งให้พอดที่มีการจำลอง (Replicated Pods) ย้ายไปทำงานบนโหนดอื่น โดยใช้แฟล็ก `--ignore-daemonsets` และหากพอดใช้ emptyDir ให้ระบุ `--delete-emptydir-data`\n2. **อัปเกรด kubeadm**: อัปเกรดแพ็กเกจ kubeadm บน Worker Node\n3. **รันคำสั่ง kubeadm upgrade node**: ปรับแต่งการกำหนดค่าเฉพาะของโหนด\n4. **อัปเกรด kubelet และ kubectl**: อัปเดตแพ็กเกจและรีสตาร์ทเซอร์วิส\n5. **Uncordon Node**: นำโหนดกลับเข้าสู่คลัสเตอร์เพื่อรับพอดใหม่",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "upgrade-worker.sh",
          "code": "# 1. ดำเนินการ Drain โหนดจากเครื่องควบคุม (หรือ Control Plane)\nkubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data\n\n# 2. ล็อกอินเข้าไปยังเครื่อง worker-1 แล้วอัปเกรด kubeadm\nsudo apt-mark unhold kubeadm\nsudo apt-get update && sudo apt-get install -y kubeadm='1.30.2-*'\nsudo apt-mark hold kubeadm\n\n# 3. สั่งอัปเกรดการกำหนดค่าบนโหนด\nsudo kubeadm upgrade node\n\n# 4. อัปเกรด kubelet และ kubectl\nsudo apt-mark unhold kubelet kubectl\nsudo apt-get update && sudo apt-get install -y kubelet='1.30.2-*' kubectl='1.30.2-*'\nsudo apt-mark hold kubelet kubectl\n\nsudo systemctl daemon-reload\nsudo systemctl restart kubelet\n\n# 5. สั่ง uncordon ให้โหนดกลับมารองรับการรันพอดตามปกติ\nkubectl uncordon worker-1"
        }
      ]
    },
    {
      "id": "verify-cluster-status",
      "headingEn": "Post-Upgrade Verification and Health Check",
      "headingTh": "การตรวจสอบสถานะคลัสเตอร์หลังเสร็จสิ้นการอัปเกรด",
      "contentMarkdown": "หลังดำเนินการอัปเกรดโหนดทั้งหมดเสร็จสิ้นแล้ว ให้ตรวจสอบสถานะความพร้อมสมบูรณ์ของคลัสเตอร์:\n\n* ตรวจสอบว่าโหนดทั้งหมดแสดงเวอร์ชันใหม่และอยู่ในสถานะ `Ready`\n* ตรวจสอบว่าพอดของระบบในเนมสเปซ `kube-system` รันได้อย่างปกติทุกตัว\n* ตรวจสอบ CoreDNS และ CNI Network plugin ว่าเชื่อมต่อและกระจายไอพีได้ตามปกติ",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "verify-cluster.sh",
          "code": "# ตรวจสอบเวอร์ชันและสถานะของโหนดทั้งหมด\nkubectl get nodes -o wide\n\n# ตรวจสอบพอดใน kube-system ทั้งหมด\nkubectl get pods -n kube-system -o wide"
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Certificate Management with kubeadm",
      "targetType": "tasks",
      "targetPageId": "admin-kubeadm-certs",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/"
    },
    {
      "title": "Operating etcd clusters (Backup & Restore)",
      "targetType": "tasks",
      "targetPageId": "admin-etcd-backup-restore",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/"
    }
  ]
};

  if (typeof window !== "undefined") {
    window.KUBE_TASKS_PAGES = window.KUBE_TASKS_PAGES || {};
    window.KUBE_TASKS_PAGES[pageData.id] = pageData;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = pageData;
  }
})(typeof window !== "undefined" ? window : globalThis);
