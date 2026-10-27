/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/
 */
(function (root) {
  const pageData = {
  "id": "admin-kubeadm-certs",
  "categoryId": "administer-cluster",
  "categoryTitle": "Administer a Cluster",
  "titleEn": "Certificate Management with kubeadm",
  "titleTh": "การจัดการและต่ออายุใบรับรอง (Certificates) ด้วย kubeadm",
  "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/",
  "docsPath": "/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/",
  "lead": "ระบบรักษาความปลอดภัยของ Kubernetes พึ่งพาใบรับรองดิจิทัล PKI TLS ในทุกจุดเชื่อมต่อ โดย kubeadm จะสร้างใบรับรองที่มีอายุเริ่มต้น 1 ปี การตรวจสอบวันหมดอายุและการต่ออายุสม่ำเสมอจึงเป็นหน้าที่สำคัญของผู้ดูแลระบบ",
  "sections": [
    {
      "id": "kubeadm-pki-architecture",
      "headingEn": "kubeadm PKI Architecture and Certificate Lifespan",
      "headingTh": "สถาปัตยกรรม PKI ใน kubeadm และอายุการใช้งานของใบรับรอง",
      "contentMarkdown": "เมื่อติดตั้งคลัสเตอร์ด้วย kubeadm เครื่องมือจะสร้างชุดกุญแจและใบรับรองดิจิทัล (X.509 Certificates) จัดเก็บไว้ที่ไดเรกทอรี `/etc/kubernetes/pki` และ `/etc/kubernetes/pki/etcd`\n\n* **ใบรับรอง Certificate Authority (CA)** มีอายุเริ่มต้น **10 ปี** ได้แก่ `ca.crt`, `front-proxy-ca.crt` และ `etcd/ca.crt`\n* **ใบรับรองของส่วนประกอบระบบ (Client & Server Certificates)** มีอายุเริ่มต้น **1 ปี** ได้แก่:\n  * `apiserver.crt`: ใบรับรองฝั่งเซิร์ฟเวอร์ของ kube-apiserver\n  * `apiserver-kubelet-client.crt`: สำหรับ apiserver สื่อสารกับ kubelet\n  * `apiserver-etcd-client.crt`: สำหรับ apiserver เชื่อมต่อไปยัง etcd\n  * `front-proxy-client.crt`: สำหรับ API Aggregation Layer\n  * `etcd/server.crt`, `etcd/peer.crt`, `etcd/healthcheck-client.crt`: สำหรับ etcd cluster",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "inspect-pki.sh",
          "code": "# ดูรายการไฟล์ใบรับรองทั้งหมดใน Control Plane\nsudo ls -lh /etc/kubernetes/pki\nsudo ls -lh /etc/kubernetes/pki/etcd"
        }
      ]
    },
    {
      "id": "check-certs-expiration",
      "headingEn": "Checking Certificate Expiration Dates",
      "headingTh": "การตรวจสอบวันหมดอายุของใบรับรองในคลัสเตอร์",
      "contentMarkdown": "kubeadm มีคำสั่งสำหรับตรวจสอบวันหมดอายุของใบรับรองทั้งหมดในคลัสเตอร์ได้อย่างสะดวก โดยจะแสดงทั้งวันหมดอายุ (Expires), ระยะเวลาที่เหลืออยู่ (Residual Time), และชื่อ Authority ผู้ออกใบรับรอง",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "check-expiration.sh",
          "code": "# ตรวจสอบวันหมดอายุของใบรับรองทั้งหมด\nsudo kubeadm certs check-expiration"
        }
      ]
    },
    {
      "id": "manual-certs-renewal",
      "headingEn": "Manual Certificate Renewal Procedures",
      "headingTh": "ขั้นตอนการต่ออายุใบรับรองด้วยตนเอง",
      "contentMarkdown": "คุณสามารถสั่งต่ออายุใบรับรองทั้งหมดพร้อมกัน หรือต่ออายุเฉพาะใบรับรองที่ใกล้หมดอายุได้ด้วยคำสั่ง `kubeadm certs renew`\n\nขั้นตอนปฏิบัติ:\n\n1. **สำรองไฟล์ใบรับรองเดิม** ใน `/etc/kubernetes/pki` ไว้ก่อนทุกครั้ง\n2. **รันคำสั่งต่ออายุ**: สั่ง `kubeadm certs renew all` เพื่อต่ออายุใบรับรองทั้งหมดออกไปอีก 1 ปี\n3. **อัปเดตไฟล์ kubeconfig ของระบบ**: คำสั่ง renew จะสร้าง client cert ใหม่ในไฟล์คอนฟิกผู้ดูแลระบบ\n4. **รีสตาร์ท Control Plane Static Pods**: เนื่องจาก static pods (kube-apiserver, kube-controller-manager, kube-scheduler, etcd) จะโหลดใบรับรองเข้ามาในหน่วยความจำตั้งแต่ตอนสตาร์ท จึงต้องรีสตาร์ทคอนเทนเนอร์เพื่อให้โหลดใบรับรองใหม่",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "renew-certs.sh",
          "code": "# 1. สำรองไดเรกทอรี pki เดิม\nsudo cp -r /etc/kubernetes/pki /etc/kubernetes/pki.bak\nsudo cp /etc/kubernetes/admin.conf /etc/kubernetes/admin.conf.bak\n\n# 2. ต่ออายุใบรับรองทั้งหมด\nsudo kubeadm certs renew all\n\n# 3. อัปเดต kubeconfig สำหรับผู้ใช้ปัจจุบัน\nsudo cp /etc/kubernetes/admin.conf ~/.kube/config\nsudo chown $(id -u):$(id -g) ~/.kube/config\n\n# 4. รีสตาร์ท Static Pods โดยการย้าย manifest ออกและนำกลับมา\nsudo mv /etc/kubernetes/manifests/*.yaml /tmp/\nsleep 10\nsudo mv /tmp/*.yaml /etc/kubernetes/manifests/\n\n# 5. ตรวจสอบวันหมดอายุใหม่อีกครั้ง\nsudo kubeadm certs check-expiration"
        }
      ]
    },
    {
      "id": "automatic-renewal-and-custom-ca",
      "headingEn": "Automatic Renewal during Upgrade and External CAs",
      "headingTh": "การต่ออายุอัตโนมัติระหว่างอัปเกรดคลัสเตอร์และการใช้ External CA",
      "contentMarkdown": "* **ต่ออายุอัตโนมัติขณะอัปเกรด**: ทุกครั้งที่คุณรันคำสั่ง `kubeadm upgrade apply` ในระหว่างกระบวนการอัปเกรดเวอร์ชัน Kubernetes ทาง kubeadm จะทำการต่ออายุใบรับรองทั้งหมดที่จัดการให้อัตโนมัติเป็นระยะเวลา 1 ปี\n* **การใช้งาน External CA**: หากองค์กรของคุณมี Root CA ภายนอก คุณสามารถจัดเตรียมเฉพาะไฟล์ `ca.crt` และ `ca.key` ไว้ใน `/etc/kubernetes/pki` จากนั้น kubeadm จะสร้างใบรับรองลูกที่ลงนามโดย External CA นั้นๆ",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "upgrade-auto-renewal.sh",
          "code": "# การอัปเกรดคลัสเตอร์จะต่ออายุใบรับรองให้อัตโนมัติ\nsudo kubeadm upgrade plan\nsudo kubeadm upgrade apply v1.30.2"
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
