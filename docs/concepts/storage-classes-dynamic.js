/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/storage/storage-classes/
 */
(function (root) {
  const pageData = {
    "id": "storage-classes-dynamic",
    "categoryId": "storage",
    "categoryTitle": "Storage",
    "titleEn": "Storage Classes",
    "titleTh": "สตอเรจคลาสและการจัดสรรพื้นที่จัดเก็บแบบไดนามิก (StorageClasses & Dynamic Provisioning)",
    "officialUrl": "https://kubernetes.io/docs/concepts/storage/storage-classes/",
    "docsPath": "/docs/concepts/storage/storage-classes/",
    "diagram": {
      "src": "images/docs/pv-pvc-storageclass-lifecycle.svg",
      "caption": "การจัดสรรพื้นที่แบบไดนามิกด้วย StorageClass: สร้าง PV และ Cloud Disk อัตโนมัติเมื่อตรวจพบ PVC ใหม่"
    },
    "lead": "StorageClass ช่วยให้ผู้ดูแลระบบคลัสเตอร์สามารถนิยาม \"ประเภทและระดับคุณภาพ\" ของสตอเรจ (เช่น SSD ความเร็วสูง, HDD มาตรฐาน หรือ Shared File System) และเปิดใช้งานระบบจัดสรรพื้นที่จัดเก็บข้อมูลอัตโนมัติ (Dynamic Provisioning) ทันทีที่มีการร้องขอจาก PersistentVolumeClaim โดยไม่ต้องให้มนุษย์เข้าไปสร้างดิสก์ล่วงหน้า",
    "sections": [
      {
        "id": "what-is-storageclass",
        "headingEn": "What is StorageClass and Dynamic Provisioning?",
        "headingTh": "StorageClass คืออะไร และทำไมต้องใช้ Dynamic Provisioning?",
        "contentMarkdown": "ในการบริหารจัดการสตอเรจยุคเดิม (Static Provisioning) ผู้ดูแลระบบต้องคอยคาดเดาความต้องการ และสร้าง PersistentVolume ขนาดต่างๆ (เช่น 10Gi, 50Gi, 100Gi) ทิ้งไว้ในคลัสเตอร์ล่วงหน้า ซึ่งทำให้สิ้นเปลืองค่าใช้จ่ายและเกิดปัญหาคอขวดเมื่อนักพัฒนาต้องการขนาดดิสก์ที่ไม่มีสำรองไว้\n\n**StorageClass** เข้ามาแก้ปัญหานี้ด้วย **Dynamic Provisioning**:\n* แอดมินสร้างเทมเพลต StorageClass ขึ้นมา เช่น คลาส `fast-ssd` หรือ `backup-hdd`\n* เมื่อนักพัฒนาสร้าง PersistentVolumeClaim (PVC) ที่ระบุชื่อ StorageClass นั้น Kubernetes CSI Controller จะส่งคำสั่งไปยัง Cloud Storage API (เช่น AWS EBS, Google Cloud PD, Azure Disk) เพื่อสร้าง Volume จริงตามขนาดที่ขอแบบ On-demand ทันที\n* ระบบจะสร้าง PV ใน Kubernetes และผูกเข้ากับ PVC ให้โดยอัตโนมัติ 100%"
      },
      {
        "id": "storageclass-anatomy",
        "headingEn": "The Anatomy of a StorageClass Resource",
        "headingTh": "โครงสร้างองค์ประกอบของ StorageClass",
        "contentMarkdown": "ออบเจกต์ StorageClass มีฟิลด์หลักที่กำหนดพฤติกรรมของสตอเรจดังนี้:\n\n* **`provisioner`**: ตัวระบุ Container Storage Interface (CSI) Driver ที่จะทำหน้าที่สร้างดิสก์ เช่น `ebs.csi.aws.com`, `pd.csi.storage.gke.io` หรือ `driver.longhorn.io`\n* **`parameters`**: พารามิเตอร์เฉพาะของผู้ให้บริการสตอเรจแต่ละราย เช่น ชนิดดิสก์ (`type: pd-ssd`), IOPS หรือ Filesystem Type (`csi.storage.k8s.io/fstype: ext4`)\n* **`reclaimPolicy`**: นโยบายการจัดการข้อมูลเมื่อลบ PVC โดยดีฟอลต์มักเป็น `Delete` (ลบดิสก์ทิ้งอัตโนมัติ) แต่สามารถตั้งเป็น `Retain` ได้เพื่อความปลอดภัย\n* **`allowVolumeExpansion: true`**: เปิดสิทธิ์ให้ผู้ใช้งานสามารถขยายขนาดความจุของ PVC เพิ่มเติมได้ในภายหลังโดยไม่สูญเสียข้อมูลเดิม\n* **`mountOptions`**: พารามิเตอร์เสริมสำหรับคำสั่ง mount ของระบบปฏิบัติการ เช่น `discard`, `noatime`"
      },
      {
        "id": "volume-binding-mode",
        "headingEn": "Volume Binding Mode: Immediate vs WaitForFirstConsumer",
        "headingTh": "โหมดการผูกวอลุ่ม: Immediate เทียบกับ WaitForFirstConsumer",
        "contentMarkdown": "ฟิลด์ `volumeBindingMode` มีความสำคัญอย่างยิ่งต่อความเสถียรของคลัสเตอร์ โดยเฉพาะในสภาพแวดล้อม Multi-Zone / Cloud:\n\n### 1. Immediate (โหมดดั้งเดิม)\nเมื่อมีการสร้าง PVC ระบบจะสั่งให้ Cloud Provider สร้างดิสก์และผูกกับ PV ทันที โดยที่ยังไม่รู้ว่าพอดที่ต้องการใช้ดิสก์นี้จะไปรันบน Worker Node โหนดใด\n* **ความเสี่ยง**: ดิสก์อาจถูกสร้างขึ้นใน Zone `us-central1-a` แต่ต่อมา kube-scheduler กลับนำพอดไปรันบนโหนดใน Zone `us-central1-b` ซึ่งโหนดข้ามโซนจะไม่สามารถเมานต์ดิสก์นั้นได้ ทำให้พอดติดค้าง\n\n### 2. WaitForFirstConsumer (โหมดแนะนำสำหรับ Production ยุคใหม่)\nระบบจะหน่วงเวลาการสร้างดิสก์ไว้ก่อน เมื่อสร้าง PVC จะคงสถานะ `Pending` ไว้ และจะเริ่มสร้างดิสก์ก็ต่อเมื่อ **มีพอดที่เรียกใช้ PVC นั้นถูกสร้างขึ้นและ scheduler เลือกโหนดได้แล้วเท่านั้น**\n* วิธีนี้รับประกัน 100% ว่าดิสก์จะถูกสร้างขึ้นใน Availability Zone และ Rack เดียวกันกับที่พอดนั้นกำลังจะไปทำงานอย่างแน่นอน"
      },
      {
        "id": "default-storageclass",
        "headingEn": "The Default StorageClass Concept",
        "headingTh": "สตอเรจคลาสเริ่มต้น (Default StorageClass)",
        "contentMarkdown": "คุณสามารถกำหนด StorageClass ตัวใดตัวหนึ่งให้เป็น **Default** ประจำคลัสเตอร์ได้โดยการเพิ่ม Annotation:\n\n`storageclass.kubernetes.io/is-default-class: \"true\"`\n\n* หากผู้ใช้งานสร้าง PVC โดยไม่ระบุฟิลด์ `storageClassName` เลย ตัว Kubernetes Admission Controller จะเติมชื่อ Default StorageClass นี้ลงในสเปกของ PVC ให้อัตโนมัติ\n* ในหนึ่งคลัสเตอร์ควรมี Default StorageClass เพียงตัวเดียวเท่านั้น หากมีมากกว่าหนึ่งตัว พอดที่สร้าง PVC โดยไม่ระบุคลาสจะค้างอยู่ในสถานะ Error"
      },
      {
        "id": "dynamic-manifest-expansion",
        "headingEn": "Manifest Examples and Volume Expansion",
        "headingTh": "ตัวอย่าง Manifest และขั้นตอนการขยายขนาดวอลุ่ม",
        "contentMarkdown": "ตัวอย่างการประกาศ StorageClass คุณภาพสูง และการสร้าง PVC เพื่อทดสอบการจัดสรรพื้นที่อัตโนมัติ:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "fast-ssd-storageclass.yaml",
            "code": "apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast-ssd\n  annotations:\n    storageclass.kubernetes.io/is-default-class: \"true\"\nprovisioner: pd.csi.storage.gke.io\nvolumeBindingMode: WaitForFirstConsumer\nallowVolumeExpansion: true\nreclaimPolicy: Delete\nparameters:\n  type: pd-ssd\n  replication-type: none\n---\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: dynamic-ssd-pvc\nspec:\n  storageClassName: fast-ssd\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 20Gi"
          },
          {
            "lang": "bash",
            "label": "การตรวจสอบและการขยายขนาด PVC",
            "code": "# ตรวจสอบรายการ StorageClasses ในคลัสเตอร์ (ดูเครื่องหมาย (default))\nkubectl get storageclass\n\n# ขยายขนาดพื้นที่จัดเก็บจาก 20Gi เป็น 50Gi แบบออนไลน์\nkubectl patch pvc dynamic-ssd-pvc -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"50Gi\"}}}}'\n\n# ตรวจสอบสถานะการปรับขนาดระบบไฟล์\nkubectl describe pvc dynamic-ssd-pvc"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) สำหรับความเข้าใจเชิงลึกเกี่ยวกับวงจรชีวิต PV\n* ศึกษา [Ephemeral Volumes & Snapshots](https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/) สำหรับการสำรองข้อมูล\n* ศึกษา [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) สำหรับการใช้ volumeClaimTemplates ร่วมกับ StorageClass"
      }
    ],
    "relatedLinks": [
      {
        "title": "Persistent Volumes (สตอเรจถาวรและ PVC)",
        "targetType": "concepts",
        "targetPageId": "storage-persistent-volumes",
        "officialUrl": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/"
      },
      {
        "title": "Volumes Overview (ภาพรวมวอลุ่ม)",
        "targetType": "concepts",
        "targetPageId": "storage-volumes",
        "officialUrl": "https://kubernetes.io/docs/concepts/storage/volumes/"
      },
      {
        "title": "Ephemeral Volumes & Snapshots (วอลุ่มชั่วคราวและสแน็ปช็อต)",
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
