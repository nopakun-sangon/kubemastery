/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/
 */
(function (root) {
  const pageData = {
    "id": "storage-ephemeral-snapshots",
    "categoryId": "storage",
    "categoryTitle": "Storage",
    "titleEn": "Ephemeral Volumes",
    "titleTh": "วอลุ่มชั่วคราวและภาพถ่ายข้อมูลสแน็ปช็อต (Ephemeral Volumes & Snapshots)",
    "officialUrl": "https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/",
    "docsPath": "/docs/concepts/storage/ephemeral-volumes/",
    "diagram": {
      "src": "images/docs/pv-pvc-storageclass-lifecycle.svg",
      "caption": "สถาปัตยกรรมสตอเรจขั้นสูง: การจัดการวอลุ่มชั่วคราวและการสำรองกู้คืนข้อมูลด้วย Volume Snapshot"
    },
    "lead": "จัดการพื้นที่จัดเก็บข้อมูลชั่วคราวที่มีวงจรชีวิตผูกติดอยู่กับตัวพอดด้วย Ephemeral Volumes และเสริมสร้างความต่อเนื่องทางธุรกิจ (Business Continuity) ด้วยสถาปัตยกรรมการสำรองและกู้คืนข้อมูลดิสก์แบบจุดเวลา (Point-in-Time) ผ่าน Volume Snapshots",
    "sections": [
      {
        "id": "ephemeral-volumes-overview",
        "headingEn": "Overview of Ephemeral Volumes",
        "headingTh": "ภาพรวมและความจำเป็นของ Ephemeral Volumes",
        "contentMarkdown": "ในหลายกรณี เวิร์กโหลดไม่ได้ต้องการพื้นที่จัดเก็บข้อมูลถาวรข้ามปี แต่ต้องการเพียงพื้นที่พักข้อมูลชั่วคราว (Scratch Space) สำหรับงานบางประเภท เช่น:\n* ไดเรกทอรีสำหรับคอมไพล์โค้ดใน CI/CD Pipeline\n* แคชไฟล์ขนาดใหญ่สำหรับโมเดลการเรียนรู้ของเครื่อง (Machine Learning Cache)\n* ไฟล์จัดเก็บ Session ชั่วคราวที่สามารถทิ้งได้เมื่อพอดจบการทำงาน\n\n**Ephemeral Volumes** ใน Kubernetes แตกต่างจาก Persistent Volume แบบดั้งเดิมตรงที่:\n* พื้นที่จัดเก็บจะถูกสร้างขึ้นมาพร้อมกับ Pod\n* และที่สำคัญที่สุดคือ **จะถูกลบทิ้งทำลายโดยอัตโนมัติ 100% ทันทีที่ตัวพอดสิ้นสุดการทำงานหรือถูกลบออก**\n* ช่วยป้องกันปัญหาวอลุ่มตกค้าง (Leaked Volumes) ที่ทำให้เปลืองค่าใช้จ่ายคลาวด์โดยไม่รู้ตัว"
      },
      {
        "id": "generic-ephemeral-volumes",
        "headingEn": "Generic Ephemeral Volumes",
        "headingTh": "วอลุ่มชั่วคราวแบบทั่วไป (Generic Ephemeral Volumes)",
        "contentMarkdown": "เริ่มต้นใช้งานอย่างเป็นทางการตั้งแต่ Kubernetes v1.23 ฟีเจอร์ **Generic Ephemeral Volumes** ช่วยให้คุณสามารถระบุ `volumeClaimTemplate` ฝังลงในสเปกของ Pod ได้โดยตรง โดยไม่จำเป็นต้องใช้ StatefulSet:\n\n* รองรับคุณสมบัติของ StorageClass เต็มรูปแบบ (เช่น การใช้ SSD ความเร็วสูง, การกำหนด Access Modes)\n* ระบบจะสร้าง PVC ชั่วคราวขึ้นมาผูกกับ Pod ให้โดยอัตโนมัติ\n* เมื่อ Pod ถูกลบ ระบบจะสั่งลบ PVC และสั่งให้ StorageClass ลบดิสก์เบื้องหลังทิ้งตาม Reclaim Policy ทันที"
      },
      {
        "id": "csi-ephemeral-volumes",
        "headingEn": "CSI Ephemeral Volumes",
        "headingTh": "วอลุ่มชั่วคราวผ่าน CSI Driver (CSI Ephemeral Volumes)",
        "contentMarkdown": "เป็นกลไกพิเศษที่ช่วยให้ Container Storage Interface (CSI) Driver สามารถฉีดข้อมูลโดยตรงเข้าสู่ไดเรกทอรีของพอด โดยไม่ต้องสร้างออบเจกต์ PV หรือ PVC ขึ้นมาใน Kubernetes API เลย:\n\n* **Secrets Store CSI Driver**: ดึงรหัสผ่านหรือใบรับรองจาก Vault ภายนอก (เช่น HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager) มาเมานต์เป็นไฟล์ในแรมของพอดโดยตรง\n* **cert-manager CSI**: สร้างและต่ออายุใบรับรอง TLS ชั่วคราวลงในพอดโดยอัตโนมัติ\n* ข้อมูลจะถูกเก็บอยู่ในแรมหรือโลคัลดิสก์ของเครื่อง และถูกทำลายทิ้งทันทีเมื่อพอดหยุดทำงาน"
      },
      {
        "id": "volume-snapshots-architecture",
        "headingEn": "Volume Snapshots Architecture",
        "headingTh": "สถาปัตยกรรมการถ่ายภาพสแน็ปช็อตข้อมูล (Volume Snapshots)",
        "contentMarkdown": "ระบบ Snapshot ใน Kubernetes ได้รับการออกแบบให้เป็นมาตรฐานสากลผ่าน 3 ออบเจกต์ Custom Resources (CRDs):\n\n1. **`VolumeSnapshotClass`**: แอดมินเป็นผู้สร้าง เพื่อกำหนด CSI driver และพารามิเตอร์การถ่ายภาพ Snapshot บนคลาวด์\n2. **`VolumeSnapshot`**: ผู้ใช้หรือระบบ Backup เป็นผู้สร้าง โดยระบุชื่อ PVC ต้นทางที่ต้องการถ่ายภาพจุดเวลา (Point-in-time Copy)\n3. **`VolumeSnapshotContent`**: ออบเจกต์ระดับคลัสเตอร์ที่ถูกสร้างขึ้นอัตโนมัติเพื่อชี้ไปยัง ID ของ Snapshot จริงบนระบบสตอเรจ (เช่น Snapshot ID บน AWS EBS หรือ GCP Disk)\n\nกระบวนการนี้ทำงานร่วมกับตัวควบคุมภายนอก `snapshot-controller` และ CSI plugin ที่รองรับ Snapshot Capability"
      },
      {
        "id": "snapshot-and-restore-manifest",
        "headingEn": "Manifest Examples: Taking Snapshot and Restoring",
        "headingTh": "ตัวอย่าง Manifest: การถ่ายสแน็ปช็อตและการกู้คืนข้อมูล (Restore)",
        "contentMarkdown": "ตัวอย่างขั้นตอนการถ่าย Snapshot จาก PVC เดิม และการสร้าง PVC ใหม่ขึ้นมาจาก Snapshot นั้น:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "snapshot-and-restore.yaml",
            "code": "# 1. ถ่าย Snapshot จาก PVC ที่ชื่อ db-data-pvc\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nmetadata:\n  name: db-snapshot-2026-10-27\n  namespace: default\nspec:\n  volumeSnapshotClassName: csi-snapclass\n  source:\n    persistentVolumeClaimName: db-data-pvc\n---\n# 2. กู้คืนข้อมูล (Restore) ไปเป็น PVC ใหม่โดยอ้างอิง dataSource\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: restored-db-data-pvc\n  namespace: default\nspec:\n  storageClassName: fast-ssd\n  dataSource:\n    name: db-snapshot-2026-10-27\n    kind: VolumeSnapshot\n    apiGroup: snapshot.storage.k8s.io\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 50Gi"
          },
          {
            "lang": "bash",
            "label": "คำสั่งตรวจสอบสถานะ Snapshot",
            "code": "# ตรวจสอบว่า Snapshot พร้อมใช้งานแล้วหรือไม่ (ดูคอลัมน์ READYTOUSE)\nkubectl get volumesnapshot\n\n# ดูรายละเอียดของ Snapshot และ SnapshotContent ที่ผูกอยู่\nkubectl describe volumesnapshot db-snapshot-2026-10-27"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) พื้นฐานระบบ PV/PVC\n* ศึกษา [StorageClasses](https://kubernetes.io/docs/concepts/storage/storage-classes/) สำหรับการจัดสรรพื้นที่แบบไดนามิก\n* ศึกษา [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) สำหรับการบริหารจัดการเวิร์กโหลดฐานข้อมูล"
      }
    ],
    "relatedLinks": [
      {
        "title": "Persistent Volumes (เพอร์ซิสเทนต์วอลุ่ม)",
        "targetType": "concepts",
        "targetPageId": "storage-persistent-volumes",
        "officialUrl": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/"
      },
      {
        "title": "StorageClasses (สตอเรจคลาส)",
        "targetType": "concepts",
        "targetPageId": "storage-classes-dynamic",
        "officialUrl": "https://kubernetes.io/docs/concepts/storage/storage-classes/"
      },
      {
        "title": "Volumes Overview (ภาพรวมวอลุ่ม)",
        "targetType": "concepts",
        "targetPageId": "storage-volumes",
        "officialUrl": "https://kubernetes.io/docs/concepts/storage/volumes/"
      }
    ]
  };

  if (typeof window !== "undefined") {
    window.KUBE_CONCEPTS_PAGES = window.KUBE_CONCEPTS_PAGES || {};
    window.KUBE_CONCEPTS_PAGES[pageData.id] = pageData;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = pageData;
  }
})(typeof window !== "undefined" ? window : globalThis);
