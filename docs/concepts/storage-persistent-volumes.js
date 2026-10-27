/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/storage/persistent-volumes/
 */
(function (root) {
  const pageData = {
    "id": "storage-persistent-volumes",
    "categoryId": "storage",
    "categoryTitle": "Storage",
    "titleEn": "Persistent Volumes",
    "titleTh": "เพอร์ซิสเทนต์วอลุ่ม (Persistent Volumes & PVCs)",
    "officialUrl": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/",
    "docsPath": "/docs/concepts/storage/persistent-volumes/",
    "diagram": {
      "src": "images/docs/pv-pvc-storageclass-lifecycle.svg",
      "caption": "วงจรชีวิตและการจับคู่ของสตอเรจถาวร: การเชื่อมโยงระหว่าง PV และ PVC ตามขนาดและ Access Mode"
    },
    "lead": "PersistentVolume (PV) และ PersistentVolumeClaim (PVC) เป็นระบบ Abstraction ใน Kubernetes ที่แยกหน้าที่ระหว่างผู้ดูแลระบบคลัสเตอร์ (Admin ผู้จัดเตรียม Storage) และผู้พัฒนาระบบ (Developer ผู้ขอใช้งาน Storage) ช่วยให้เวิร์กโหลดสามารถจัดเก็บข้อมูลได้อย่างถาวรโดยไม่ขึ้นกับอายุขัยของพอดหรือฮาร์ดแวร์เบื้องหลัง",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nPersistentVolume (PV) และ PersistentVolumeClaim (PVC) เป็นสถาปัตยกรรมจัดเก็บข้อมูลถาวรที่แยกหน้าที่ระหว่างผู้ดูแลระบบ (Admin ผู้เตรียม Storage PV) และผู้พัฒนา (Developer ผู้ขอใช้งาน Storage PVC) ช่วยให้เวิร์กโหลดสามารถเก็บรักษาข้อมูลได้อย่างถาวรโดยไม่ขึ้นกับอายุขัยของพอดหรือฮาร์ดแวร์เบื้องหลัง\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **วงจรชีวิต 4 ขั้นตอน**: Provisioning (Static/Dynamic) -> Binding -> Using -> Reclaiming\n* **Reclaim Policy (3 รูปแบบ)**:\n  * `Retain`: ข้อมูลและดิสก์ยังคงอยู่ครบถ้วนเมื่อ PVC ถูกลบ PV จะเปลี่ยนสถานะเป็น `Released` (ปลอดภัยสูงสุดใน Production)\n  * `Delete`: ลบทั้ง PV และดิสก์จริงบน Cloud Storage ทิ้งทันทีเมื่อลบ PVC (ดีฟอลต์ของ Cloud Storage)\n  * `Recycle`: ล้างข้อมูลด้วย `rm -rf` (เลิกใช้งานแล้ว - Deprecated)\n* **Access Modes (4 รูปแบบ)**:\n  * `ReadWriteOnce` (RWO): เมานต์อ่าน/เขียนได้จากโหนดเดียวเท่านั้น (Block Storage ทั่วไป)\n  * `ReadOnlyMany` (ROX): อ่านอย่างเดียวได้พร้อมกันจากหลายโหนด\n  * `ReadWriteMany` (RWX): อ่าน/เขียนพร้อมกันได้จากหลายโหนด (Shared Filesystem เช่น NFS, EFS, Filestore)\n  * `ReadWriteOncePod` (RWOP): อ่าน/เขียนได้จากพอดเดียวเท่านั้นทั่วทั้งคลัสเตอร์\n* **การแก้ปัญหา PVC ติด `Pending`**: ตรวจสอบขนาดความจุว่ามี PV พอหรือไม่, Access Mode ตรงกันหรือไม่, หรือติดโหมด `WaitForFirstConsumer` (ซึ่งจะ Bound เมื่อมี Pod มาเรียกใช้เท่านั้น)\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* จำให้แม่นยำ: **PV เป็นทรัพยากรระดับ Cluster-scoped** (ไม่มี Namespace) แต่ **PVC เป็นทรัพยากรระดับ Namespaced** (ต้องอยู่ใน Namespace เดียวกับ Pod)\n* สเปก Pod ที่เรียกใช้ PVC:\n  `spec.volumes: [{ name: \"data\", persistentVolumeClaim: { claimName: \"app-pvc\" } }]`\n* คำสั่งตรวจสอบสถานะสตอเรจ:\n  * `kubectl get pv` และ `kubectl get pvc -n <namespace>` (ตรวจสอบสถานะ `Bound`)\n  * `kubectl describe pvc <name>` เพื่อดูสาเหตุในส่วน Events เมื่อ PVC ไม่ยอม Bound",
    "sections": [
      {
        "id": "pv-and-pvc-concepts",
        "headingEn": "PV vs PVC Concepts and Separation of Roles",
        "headingTh": "แนวคิด PV เทียบกับ PVC และการแยกหน้าที่ตามบทบาท",
        "contentMarkdown": "เพื่อแก้ปัญหาที่นักพัฒนาต้องรู้รายละเอียดฮาร์ดแวร์จัดเก็บข้อมูล Kubernetes จึงแบ่งสถาปัตยกรรมออกเป็นสองส่วน:\n\n* **PersistentVolume (PV)**: คือชิ้นส่วนทรัพยากรพื้นที่จัดเก็บข้อมูลจริงในคลัสเตอร์ (เปรียบเสมือน Worker Node ที่เป็นทรัพยากรด้าน CPU/RAM) ซึ่งถูกจัดเตรียมไว้โดยผู้ดูแลระบบ (Static Provisioning) หรือสร้างขึ้นอัตโนมัติผ่าน StorageClass (Dynamic Provisioning) โดย PV มีวงจรชีวิตที่เป็นอิสระจากพอดใดๆ\n* **PersistentVolumeClaim (PVC)**: คือใบคำร้องขอใช้งานพื้นที่จัดเก็บข้อมูลที่ส่งโดยผู้ใช้งานหรือนักพัฒนา (เปรียบเสมือน Pod ที่ร้องขอ CPU/RAM) โดยระบุขนาดความจุที่ต้องการ (Size) และโหมดการเข้าถึงข้อมูล (Access Mode)\n\nเมื่อสร้าง PVC ระบบ Master Control Plane จะทำการค้นหา PV ที่มีคุณสมบัติและขนาดที่ตรงกัน แล้วนำมาจับคู่ผูกเข้าด้วยกัน (**Binding**)"
      },
      {
        "id": "lifecycle-phases",
        "headingEn": "The 4 Phases of Storage Lifecycle",
        "headingTh": "วงจรชีวิต 4 ขั้นตอนของระบบจัดเก็บข้อมูล",
        "contentMarkdown": "การทำงานของ PV และ PVC จะดำเนินผ่าน 4 ขั้นตอนหลัก:\n\n1. **Provisioning (การจัดเตรียม)**:\n   * *Static*: แอดมินสร้าง PV ขึ้นมารอไว้ล่วงหน้าจาก Storage Array จริง\n   * *Dynamic*: เมื่อมี PVC เข้ามาและไม่มี PV ว่างที่ตรงกัน คลัสเตอร์จะสั่งให้ StorageClass ไปสร้าง Disk บนคลาวด์ให้อัตโนมัติทันที\n2. **Binding (การผูกความสัมพันธ์)**: Control plane จะจับคู่ PVC เข้ากับ PV ที่เหมาะสมที่สุดในอัตราส่วน 1 ต่อ 1 เสมอ (PVC จะมีสถานะเปลี่ยนเป็น `Bound`)\n3. **Using (การเข้าใช้งาน)**: พอดระบุชื่อ PVC ในบล็อก `volumes.persistentVolumeClaim` และ kubelet จะทำการ Mount พื้นที่จัดเก็บจริงเข้าไปใน Container Path\n4. **Reclaiming (การคืนสภาพพื้นที่)**: เมื่อผู้ใช้ลบ PVC ทิ้ง นโยบาย Reclaim Policy จะเป็นตัวตัดสินว่าจะทำอย่างไรกับข้อมูลและตัว PV เดิม"
      },
      {
        "id": "reclaim-policies",
        "headingEn": "Reclaim Policies: Retain, Delete, and Recycle",
        "headingTh": "นโยบายการคืนสภาพพื้นที่จัดเก็บ (Reclaim Policies)",
        "contentMarkdown": "คุณสามารถกำหนดพฤติกรรมเมื่อ PVC ถูกลบผ่านฟิลด์ `persistentVolumeReclaimPolicy`:\n\n* **`Retain` (แนะนำสำหรับข้อมูลสำคัญใน Production)**:\n  * ข้อมูลและตัว PV จะยังคงอยู่ครบถ้วนใน Storage Provider โดย PV จะเปลี่ยนสถานะเป็น `Released`\n  * PVC อื่นจะไม่สามารถมาแย่งผูกต่อได้ทันที เพื่อป้องกันข้อมูลเดิมรั่วไหล แอดมินจะต้องเข้าไปสำรองข้อมูลหรือลบข้อมูลเดิมออกเองก่อนนำกลับมาใช้ใหม่\n* **`Delete` (ค่าเริ่มต้นของ StorageClass บนคลาวด์ส่วนใหญ่)**:\n  * ตัว PV ใน Kubernetes และดิสก์จริงบน Cloud Provider (เช่น AWS EBS, Google Cloud Persistent Disk, Azure Managed Disk) จะถูกลบทิ้งถาวรทันทีที่ลบ PVC\n* **`Recycle` (เลิกใช้งานแล้ว - Deprecated)**:\n  * ล้างข้อมูลด้วยคำสั่ง `rm -rf /volume/*` พื้นฐาน ปัจจุบันแนะนำให้ใช้ Dynamic Provisioning แทน"
      },
      {
        "id": "access-modes",
        "headingEn": "Access Modes Explained",
        "headingTh": "โหมดการเข้าถึงข้อมูล (Access Modes ทั้ง 4 แบบ)",
        "contentMarkdown": "ผู้ให้บริการสตอเรจแต่ละรายรองรับ Access Mode ที่แตกต่างกัน ซึ่งต้องระบุให้สอดคล้องกันทั้งใน PV และ PVC:\n\n* **`ReadWriteOnce` (RWO)**: อนุญาตให้อ่านและเขียนได้จาก**โหนดเดียวเท่านั้น** (เหมาะสำหรับ Block Storage เช่น AWS EBS หรือ GCP Persistent Disk)\n* **`ReadOnlyMany` (ROX)**: อนุญาตให้อ่านอย่างเดียว แต่สามารถอ่านพร้อมกันได้จาก**หลายๆ โหนด** (เหมาะสำหรับแจกจ่ายไฟล์ Static หรือโมเดล AI)\n* **`ReadWriteMany` (RWX)**: อนุญาตให้อ่านและเขียนพร้อมกันได้จาก**หลายๆ โหนด** (จำเป็นต้องใช้ Network Shared Filesystem เช่น NFS, AWS EFS, Google Cloud Filestore หรือ CephFS)\n* **`ReadWriteOncePod` (RWOP - แนะนำตั้งแต่ Kubernetes v1.22+)**: อนุญาตให้อ่านและเขียนได้โดย**พอดเดียวเท่านั้นทั่วทั้งคลัสเตอร์** เพื่อป้องกันไม่ให้พอดสองตัวบนโหนดเดียวกันเปิดไฟล์แย่งกัน"
      },
      {
        "id": "manifest-and-workflow",
        "headingEn": "Complete PV, PVC, and Pod Manifest",
        "headingTh": "ตัวอย่าง Manifest ของ PV, PVC และ Pod ที่เชื่อมโยงกัน",
        "contentMarkdown": "ตัวอย่างการสร้าง PersistentVolume แบบ Static, PersistentVolumeClaim และการนำไปเมานต์ใช้งานในพอดจริง:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "pv-pvc-pod-bundle.yaml",
            "code": "apiVersion: v1\nkind: PersistentVolume\nmetadata:\n  name: static-nfs-pv\nspec:\n  capacity:\n    storage: 10Gi\n  volumeMode: Filesystem\n  accessModes:\n    - ReadWriteMany\n  persistentVolumeReclaimPolicy: Retain\n  storageClassName: manual\n  nfs:\n    path: /exported/path\n    server: 192.168.1.100\n---\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: app-data-pvc\n  namespace: default\nspec:\n  storageClassName: manual\n  accessModes:\n    - ReadWriteMany\n  resources:\n    requests:\n      storage: 10Gi\n---\napiVersion: v1\nkind: Pod\nmetadata:\n  name: storage-consumer-pod\nspec:\n  containers:\n  - name: my-app\n    image: nginx:alpine\n    volumeMounts:\n    - name: persistent-storage\n      mountPath: /usr/share/nginx/html\n  volumes:\n  - name: persistent-storage\n    persistentVolumeClaim:\n      claimName: app-data-pvc"
          },
          {
            "lang": "bash",
            "label": "คำสั่งตรวจสอบสถานะสตอเรจ",
            "code": "# ตรวจสอบสถานะการ Bound ของ PVC\nkubectl get pvc\n\n# ตรวจสอบรายการ PV และ Reclaim Policy\nkubectl get pv\n\n# ดูรายละเอียดข้อผิดพลาดหาก PVC ไม่ยอม Bound\nkubectl describe pvc app-data-pvc"
          }
        ]
      },
      {
        "id": "troubleshooting-storage",
        "headingEn": "Troubleshooting PVC Stuck in Pending",
        "headingTh": "แนวทางแก้ปัญหาเมื่อ PVC ค้างอยู่ที่สถานะ Pending",
        "contentMarkdown": "สาเหตุที่พบบ่อยที่สุดเมื่อ PVC ไม่ยอมเปลี่ยนสถานะเป็น `Bound`:\n\n1. **ไม่มี PV ที่ตรงตามเงื่อนไข**: ขนาดความจุของ PV ที่มีเหลือน้อยกว่าที่ PVC ร้องขอ หรือ Access Mode ไม่ตรงกัน\n2. **StorageClass ไม่ถูกต้องหรือไม่มีอยู่จริง**: ชื่อ `storageClassName` ที่ระบุสะกดผิด หรือแอดมินยังไม่ได้ติดตั้ง CSI Driver สำหรับ Provisioner นั้น\n3. **โหมด `WaitForFirstConsumer`**: หาก StorageClass ตั้งค่า VolumeBindingMode เป็น `WaitForFirstConsumer` ตัว PVC จะค้างอยู่ที่ `Pending` อย่างถูกต้องตามปกติ **จนกว่าจะมี Pod ที่ใช้งาน PVC นั้นถูกสร้างขึ้นมา** เพื่อให้ระบบเลือกโหนดและ Availability Zone ให้เหมาะสมก่อนสร้างดิสก์"
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [StorageClasses](https://kubernetes.io/docs/concepts/storage/storage-classes/) สำหรับการจัดสรรวอลุ่มอัตโนมัติบนระบบคลาวด์\n* ศึกษา [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) การรันแอปพลิเคชันฐานข้อมูลที่ต้องการ PVC แยกต่อพอด\n* ศึกษา [Volume Snapshots](https://kubernetes.io/docs/concepts/storage/volume-snapshots/) สำหรับการสำรองข้อมูลดิสก์"
      }
    ],
    "relatedLinks": [
      {
        "title": "Volumes Overview (ภาพรวมวอลุ่ม)",
        "targetType": "concepts",
        "targetPageId": "storage-volumes",
        "officialUrl": "https://kubernetes.io/docs/concepts/storage/volumes/"
      },
      {
        "title": "StorageClasses (สตอเรจคลาสแบบไดนามิก)",
        "targetType": "concepts",
        "targetPageId": "storage-classes-dynamic",
        "officialUrl": "https://kubernetes.io/docs/concepts/storage/storage-classes/"
      },
      {
        "title": "Ephemeral Volumes & Snapshots (วอลุ่มชั่วคราวและภาพถ่ายข้อมูล)",
        "targetType": "concepts",
        "targetPageId": "storage-ephemeral-snapshots",
        "officialUrl": "https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/"
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
