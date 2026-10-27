/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/
 */
(function (root) {
  const pageData = {
  "id": "admin-etcd-backup-restore",
  "categoryId": "administer-cluster",
  "categoryTitle": "Administer a Cluster",
  "titleEn": "Operating etcd clusters for Kubernetes",
  "titleTh": "การสำรองและกู้คืนฐานข้อมูล etcd ใน Kubernetes",
  "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/",
  "docsPath": "/docs/tasks/administer-cluster/configure-upgrade-etcd/",
  "lead": "etcd คือฐานข้อมูล Distributed Key-Value Store ที่เก็บสถานะและข้อมูลความจริงทั้งหมด (Single Source of Truth) ของคลัสเตอร์ Kubernetes การเข้าใจกระบวนการ Snapshot และ Restore จึงเป็นทักษะที่ขาดไม่ได้ของผู้ดูแลระบบ",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\n`etcd` คือฐานข้อมูล Key-Value Store ที่เก็บสถานะและความจริงทั้งหมดของคลัสเตอร์ Kubernetes การทำ Backup และ Restore ด้วย `etcdctl` คือกระบวนการกู้ภัยระดับวิกฤต (Disaster Recovery) ที่ผู้ดูแลระบบต้องทำได้ถูกต้องและรวดเร็วเมื่อเกิดเหตุไม่คาดฝัน\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **สถาปัตยกรรม & พอร์ต**: etcd ใน kubeadm รันเป็น Static Pod บน Control Plane ใช้พอร์ต `2379` สำหรับ Client และ `2380` สำหรับ Peer\n* **ตัวแปร & PKI Certificates**: ต้องใช้ `ETCDCTL_API=3` และระบุใบรับรอง TLS 3 ค่าเสมอ:\n  - `--cacert`: `/etc/kubernetes/pki/etcd/ca.crt`\n  - `--cert`: `/etc/kubernetes/pki/etcd/server.crt`\n  - `--key`: `/etc/kubernetes/pki/etcd/server.key`\n  - (ดูพาธที่แน่นอนได้จากไฟล์ `/etc/kubernetes/manifests/etcd.yaml`)\n* **การ Backup**: ใช้คำสั่ง `etcdctl snapshot save <path.db>` และตรวจสอบความสมบูรณ์ด้วย `etcdctl snapshot status <path.db> --write-out=table`\n* **การ Restore**: รัน `etcdctl snapshot restore <path.db> --data-dir=<new-path>` แล้วแก้ไขพาธ `hostPath` ใน `/etc/kubernetes/manifests/etcd.yaml` ชี้ไปที่โฟลเดอร์ใหม่เพื่อให้ kubelet โหลด etcd ใหม่\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* CKA Favorite Topic: มักสั่งให้แบ็กอัป snapshot ไปยังพาธที่กำหนด และสั่งกู้คืน snapshot เดิมกลับมา\n* สูตรคำสั่ง Backup แบบครบชุด:\n  ```bash\n  ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\\n    --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n    --cert=/etc/kubernetes/pki/etcd/server.crt \\\n    --key=/etc/kubernetes/pki/etcd/server.key \\\n    snapshot save /tmp/etcd-backup.db\n  ```\n* ข้อควรระวังในการ Restore: ห้ามเขียนทับ data-dir เดิมโดยตรง และเมื่อแก้ไฟล์ manifest ใน `/etc/kubernetes/manifests/` ให้รอสักครู่เพื่อตรวจสอบว่า static pod ของ etcd และ kube-apiserver กลับมารันปกติ",
  "sections": [
    {
      "id": "etcd-architecture-prereqs",
      "headingEn": "etcd Architecture and PKI TLS Certificates",
      "headingTh": "สถาปัตยกรรม etcd, พอร์ต และใบรับรอง PKI TLS",
      "contentMarkdown": "ในคลัสเตอร์ Kubernetes ที่ติดตั้งด้วย kubeadm นั้น etcd จะถูกรันในรูปแบบของ **Static Pod** บนโหนด Control Plane\n\n* **พอร์ตที่ใช้งาน**:\n  * `2379`: สำหรับการเชื่อมต่อของ Client (kube-apiserver และ etcdctl)\n  * `2380`: สำหรับการสื่อสารระหว่างโหนดสมาชิกใน etcd cluster (Peer Communication)\n* **ระบบรักษาความปลอดภัยแบบ mTLS**:\n  การสื่อสารกับ etcd ต้องผ่านการยืนยันตัวตนด้วยใบรับรองดิจิทัลแบบ 2 ฝั่ง (Mutual TLS) เสมอ โดยไฟล์ใบรับรองจะถูกเก็บไว้ที่ `/etc/kubernetes/pki/etcd/`:\n  * CA Certificate: `/etc/kubernetes/pki/etcd/ca.crt`\n  * Server/Client Certificate: `/etc/kubernetes/pki/etcd/server.crt`\n  * Private Key: `/etc/kubernetes/pki/etcd/server.key`\n\n> หมายเหตุ: ต้องระบุ `ETCDCTL_API=3` เสมอเมื่อใช้งานคำสั่ง etcdctl เนื่องจาก Kubernetes ใช้ etcd v3 API ในการจัดเก็บข้อมูล",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "inspect-etcd-pki.sh",
          "code": "# ตรวจสอบไฟล์ใบรับรอง etcd บนโหนด Control Plane\nsudo ls -la /etc/kubernetes/pki/etcd/\n\n# ตั้งค่า Environment Variable สำหรับ etcdctl v3\nexport ETCDCTL_API=3"
        }
      ]
    },
    {
      "id": "etcd-snapshot-backup",
      "headingEn": "Taking an etcd Snapshot Backup",
      "headingTh": "ขั้นตอนการสร้าง Snapshot สำรองข้อมูล etcd",
      "contentMarkdown": "การสำรองข้อมูล etcd ทำได้โดยใช้คำสั่ง `etcdctl snapshot save` พร้อมส่ง Flags กำหนด Endpoint และตำแหน่งไฟล์ Certificate ทั้ง 3 ค่า\n\nขั้นตอนปฏิบัติ:\n\n1. รันคำสั่ง `etcdctl snapshot save <path/to/snapshot.db>` พร้อมระบุใบรับรอง PKI\n2. ตรวจสอบความถูกต้องสมบูรณ์ของ Snapshot ที่ได้ ด้วยคำสั่ง `etcdctl snapshot status --write-out=table` ซึ่งจะแสดง Hash, Revision Number, และขนาดของข้อมูล\n3. คัดลอกไฟล์ Snapshot ออกไปเก็บไว้ในพื้นที่จัดเก็บภายนอกที่ปลอดภัย (Off-site backup หรือ Cloud Object Storage)",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "etcd-backup.sh",
          "code": "# กำหนดการใช้งาน etcd v3 API\nexport ETCDCTL_API=3\n\n# สร้าง Snapshot สำรองข้อมูล\nsudo ETCDCTL_API=3 etcdctl snapshot save /var/lib/etcd-backup.db \\\n  --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key\n\n# ตรวจสอบสถานะและความสมบูรณ์ของไฟล์ Snapshot\nsudo ETCDCTL_API=3 etcdctl snapshot status /var/lib/etcd-backup.db --write-out=table"
        }
      ]
    },
    {
      "id": "etcd-snapshot-restore",
      "headingEn": "Restoring an etcd Snapshot (Disaster Recovery)",
      "headingTh": "ขั้นตอนการกู้คืน Snapshot ในสภาวะภัยพิบัติ (Disaster Recovery)",
      "contentMarkdown": "หากคลัสเตอร์เสียหายจนข้อมูลใน etcd สูญหาย หรือเกิดข้อผิดพลาดร้ายแรง คุณสามารถกู้คืนข้อมูลจากไฟล์ Snapshot ได้ตามขั้นตอนดังนี้:\n\n1. **หยุดการทำงานของ Control Plane Components**:\n   ย้ายไฟล์ Static Pod Manifests ของ `kube-apiserver` และ `etcd` ออกจาก `/etc/kubernetes/manifests/` ชั่วคราว เพื่อให้ kubelet หยุดการทำงานของพอด\n\n2. **รันคำสั่งกู้คืน etcdctl snapshot restore**:\n   สั่ง Restore ข้อมูลไปยังไดเรกทอรีใหม่ เช่น `--data-dir=/var/lib/etcd-restored` เพื่อไม่ให้เขียนทับข้อมูลเดิมที่อาจเกิดความขัดแย้ง\n\n3. **ปรับเปลี่ยนการตั้งค่าชี้ไปยัง Data Dir ใหม่**:\n   แก้ไขไฟล์ `/etc/kubernetes/manifests/etcd.yaml` เพื่อเปลี่ยน hostPath mount ให้ชี้ไปยัง `/var/lib/etcd-restored` หรือสลับโฟลเดอร์ของ `/var/lib/etcd`\n\n4. **สตาร์ทส่วนประกอบกลับคืน**:\n   ย้ายไฟล์ Static Pod manifests กลับเข้าที่เดิม kubelet จะทำการสตาร์ท etcd และ kube-apiserver ขึ้นมาใหม่โดยใช้ข้อมูลที่กู้คืนแล้ว",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "etcd-restore.sh",
          "code": "# 1. หยุด static pods ชั่วคราวโดยย้าย manifest ออกไป\nsudo mv /etc/kubernetes/manifests/kube-apiserver.yaml /tmp/\nsudo mv /etc/kubernetes/manifests/etcd.yaml /tmp/\n\n# รอจนคอนเทนเนอร์หยุดทำงาน (ตรวจสอบด้วย crictl ps)\n\n# 2. กู้คืน snapshot ไปยัง data-dir ใหม่\nsudo ETCDCTL_API=3 etcdctl snapshot restore /var/lib/etcd-backup.db \\\n  --data-dir=/var/lib/etcd-restored\n\n# 3. สำรองไดเรกทอรีเดิมและสลับไดเรกทอรีใหม่เข้าแทนที่\nsudo mv /var/lib/etcd /var/lib/etcd-old\nsudo mv /var/lib/etcd-restored /var/lib/etcd\n\n# 4. ย้าย manifest กลับเข้าที่เพื่อให้ kubelet เริ่มต้นพอดใหม่\nsudo mv /tmp/kube-apiserver.yaml /etc/kubernetes/manifests/\nsudo mv /tmp/etcd.yaml /etc/kubernetes/manifests/\n\n# 5. ตรวจสอบสถานะการทำงานของคลัสเตอร์\nkubectl get nodes\nkubectl get pods -A"
        }
      ]
    },
    {
      "id": "backup-automation-best-practices",
      "headingEn": "Backup Automation and Best Practices",
      "headingTh": "แนวทางปฏิบัติที่ดีและการสำรองข้อมูลอัตโนมัติ",
      "contentMarkdown": "* **ตั้งเวลาสำรองข้อมูลเป็นประจำ (Cron Job)**: ควรตั้งเวลา Snapshot อัตโนมัติทุกๆ 1-6 ชั่วโมงขึ้นอยู่กับปริมาณการเปลี่ยนแปลงในคลัสเตอร์\n* **การดูแลรักษาพื้นที่ดิสก์ (Defragmentation)**: เมื่อมีการลบออบเจกต์ในคลัสเตอร์ etcd จะไม่คืนพื้นที่ดิสก์ทันที ให้รันคำสั่ง `etcdctl defrag` เป็นระยะเพื่อกู้คืนพื้นที่ดิสก์และป้องกัน QuotaExceeded error\n* **Quorum และจำนวนโหนด**: แนะนำให้ etcd คลัสเตอร์ในระบบ Production มีจำนวนโหนดเป็นเลขคี่เสมอ เช่น 3 หรือ 5 โหนด โดยคลัสเตอร์ 3 โหนดสามารถรองรับโหนดล่มได้ 1 โหนด ส่วนคลัสเตอร์ 5 โหนดสามารถรองรับโหนดล่มได้ 2 โหนด",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "etcd-defrag.sh",
          "code": "# คำสั่ง Defragment พื้นที่จัดเก็บ etcd\nsudo ETCDCTL_API=3 etcdctl defrag \\\n  --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key"
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Upgrading kubeadm clusters",
      "targetType": "tasks",
      "targetPageId": "admin-kubeadm-upgrade",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/"
    },
    {
      "title": "Certificate Management with kubeadm",
      "targetType": "tasks",
      "targetPageId": "admin-kubeadm-certs",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/"
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
