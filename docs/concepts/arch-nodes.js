/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/architecture/nodes/
 */
(function (root) {
  const pageData = {
    "id": "arch-nodes",
    "categoryId": "architecture",
    "categoryTitle": "Cluster Architecture",
    "titleEn": "Nodes",
    "titleTh": "โหนดใน Kubernetes (Nodes Architecture & Lifecycle)",
    "officialUrl": "https://kubernetes.io/docs/concepts/architecture/nodes/",
    "docsPath": "/docs/concepts/architecture/nodes/",
    "diagram": {
      "src": "images/docs/components-of-kubernetes.svg",
      "caption": "โครงสร้างส่วนประกอบของ Worker Node: Kubelet, Kube-proxy และ Container Runtime"
    },
    "lead": "โหนด (Node) คือเครื่องคำนวณที่ทำงานใน Kubernetes ซึ่งอาจเป็นเครื่องแม่ข่ายจริง (Bare-metal Physical Machine) หรือเครื่องเสมือน (Virtual Machine) โดยแต่ละโหนดจะมีบริการที่จำเป็นในการรันพอด (Pods) และถูกควบคุมดูแลโดย Kubernetes Control Plane",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\n**Node** คือเครื่องแม่ข่าย (Physical หรือ Virtual Machine) ที่ทำหน้าที่รัน Pods ของแอปพลิเคชัน มีคอมโพเนนต์หลักทำงานอยู่ 3 ตัว ได้แก่ Kubelet, kube-proxy และ Container Runtime โดย Control Plane จะคอยตรวจสอบสุขภาพของโหนดผ่าน Heartbeat Lease และจัดการจัดสรรทรัพยากรให้อย่างเหมาะสม\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **สถานะของโหนด (`status`)**:\n  - *Addresses*: `HostName`, `InternalIP` (สื่อสารภายใน), `ExternalIP` (ไอพีสาธารณะ)\n  - *Conditions*: สถานะสุขภาพ เช่น `Ready` (พร้อมรับพอด), `MemoryPressure`, `DiskPressure`, `PIDPressure`, `NetworkUnavailable`\n  - *Capacity vs Allocatable*: Capacity คือสเปกเครื่องทั้งหมด ส่วน Allocatable คือทรัพยากรที่เหลือให้ Pods ใช้งานจริงหลังหัก Reserved ของระบบ OS และ Kubernetes\n- **Node Controller & Heartbeats**: Kubelet ส่ง Heartbeat ทุก 10 วินาทีผ่าน Lease object ในเนมสเปซ `kube-node-lease` หากขาดการติดต่อนานเกินค่าที่กำหนด โหนดจะถูกปรับสถานะเป็น `Unknown`\n- **Taints อัตโนมัติเมื่อโหนดมีปัญหา**: ระบบจะติด Taint เช่น `node.kubernetes.io/not-ready` หรือ `node.kubernetes.io/unreachable` เพื่อขับไล่พอดที่ไม่มี Toleration ออกไปรันที่อื่น\n- **การบำรุงรักษาโหนด**: ใช้ `cordon` เพื่อหยุดรับพอดใหม่ และใช้ `drain` เพื่อขับไล่พอดเดิมออกอย่างปลอดภัยก่อนปิดเครื่องซ่อมบำรุง\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **ขั้นตอนการ Maintenance โหนด (ออกสอบ CKA บ่อยมาก)**:\n  1. ระงับการจัดสรรพอดใหม่: `kubectl cordon <node-name>`\n  2. ขับไล่พอดเดิมออก: `kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data --force`\n  3. ดำเนินการซ่อมบำรุงหรืออัปเกรดระบบปฏิบัติการ/Kubelet\n  4. เปิดรับพอดใหม่อีกครั้ง: `kubectl uncordon <node-name>`\n- **ตรวจสอบการใช้ทรัพยากร**: `kubectl top node`, `kubectl describe node <node-name>` (ดูหัวข้อ Allocatable และ Non-terminated Pods Allocation)",
    "sections": [
      {
        "id": "node-overview-and-registration",
        "headingEn": "Node Overview and Management",
        "headingTh": "ภาพรวมของโหนดและการลงทะเบียนเข้าคลัสเตอร์",
        "contentMarkdown": "ในคลัสเตอร์ Kubernetes เวิร์กโหลดของแอปพลิเคชันจะถูกนำไปรันบน **Worker Nodes** แต่ละโหนดจะประกอบด้วยบริการสำคัญ 3 ส่วน ได้แก่:\n1. **Kubelet**: เอเจนต์หลักที่คอยสื่อสารกับ API Server และดูแลพอด\n2. **Kube-proxy**: จัดการกฎไฟร์วอลล์และเน็ตเวิร์กของ Service\n3. **Container Runtime**: ซอฟต์แวร์สั่งรันคอนเทนเนอร์ (เช่น containerd หรือ CRI-O)\n\n### วิธีการเพิ่มโหนดเข้าสู่ระบบ API Server:\n1. **Self-registration ผ่าน Kubelet (วิธีมาตรฐาน)**: เมื่อ kubelet เริ่มทำงานและมีแฟล็ก `--register-node=true` มันจะทำการส่งข้อมูลสเปกของเครื่องไปยัง kube-apiserver เพื่อลงทะเบียนสร้าง Node Object ให้อัตโนมัติ\n2. **สร้างออบเจกต์ด้วยตนเอง (Manual Node Creation)**: ผู้ดูแลคลัสเตอร์สามารถเขียนไฟล์ YAML ชนิด `kind: Node` แล้วสั่ง `kubectl apply` เพื่อจองโหนดล่วงหน้าได้\n\nเมื่อ Node Object ถูกสร้างขึ้น Control Plane จะตรวจสอบว่าโหนดนั้นพร้อมทำงานจริงหรือไม่ หากไม่สามารถติดต่อได้ สถานะของโหนดจะคงเป็น `NotReady`"
      },
      {
        "id": "node-status-addresses-conditions",
        "headingEn": "Node Status: Addresses and Conditions",
        "headingTh": "สถานะของโหนด: Addresses และ Conditions",
        "contentMarkdown": "ข้อมูลสถานะของโหนดใน `status` ประกอบด้วยฟิลด์สำคัญที่บ่งบอกความสมบูรณ์ของเครื่อง:\n\n### 1. Addresses (ที่อยู่เครือข่าย)\n* **`HostName`**: ชื่อโฮสต์ของเครื่องโหนด\n* **`InternalIP`**: IP ภายในคลัสเตอร์ที่ใช้สื่อสารระหว่างโหนดและ Control Plane\n* **`ExternalIP`**: IP สาธารณะที่สามารถเข้าถึงได้จากภายนอกคลัสเตอร์ (มักพบใน Cloud Providers)\n\n### 2. Conditions (เงื่อนไขและสุขภาพของโหนด)\nสถานะ Conditions เป็นอาร์เรย์ของออบเจกต์ที่ระบุสภาพแวดล้อม แต่ละเงื่อนไขจะมีสถานะเป็น `True`, `False`, หรือ `Unknown`:\n\n* **`Ready`**: มีค่าเป็น `True` แปลว่าโหนดมีสุขภาพสมบูรณ์และพร้อมรับพอดใหม่เข้ามาทำงาน หากเป็น `False` แปลว่าโหนดไม่พร้อมใช้งาน และหากเป็น `Unknown` แปลว่า Control Plane ขาดการติดต่อกับโหนดเกินระยะเวลาที่กำหนด\n* **`DiskPressure`**: มีค่าเป็น `True` เมื่อพื้นที่ดิสก์บนโหนดเหลือน้อยกว่าค่าเกณฑ์ (Threshold) ซึ่งระบบจะหยุดการจัดสรรพอดใหม่ลงโหนดนี้\n* **`MemoryPressure`**: มีค่าเป็น `True` เมื่อหน่วยความจำของโหนดเหลือน้อย เสี่ยงต่อการเกิด OOM (Out Of Memory)\n* **`PIDPressure`**: มีค่าเป็น `True` เมื่อจำนวน Process IDs บนโหนดถูกใช้งานจนใกล้เต็มขีดจำกัด\n* **`NetworkUnavailable`**: มีค่าเป็น `True` เมื่อการตั้งค่าเน็ตเวิร์กหรือ CNI บนโหนดยังไม่เสร็จสมบูรณ์"
      },
      {
        "id": "capacity-and-allocatable",
        "headingEn": "Capacity and Allocatable Resources",
        "headingTh": "การคำนวณทรัพยากร: Capacity เทียบกับ Allocatable",
        "contentMarkdown": "บนโหนดจะมีทรัพยากรคำนวณ (CPU, Memory, Storage, Pod slots) ซึ่ง Kubernetes แบ่งการจัดการออกเป็น 2 ระดับ:\n\n* **`Capacity`**: ปริมาณทรัพยากรฮาร์ดแวร์จริงทั้งหมดที่มีอยู่บนเครื่องโหนด (เช่น 8 Cores, 32 GiB RAM, 110 Max Pods)\n* **`Allocatable`**: ปริมาณทรัพยากรที่ **อนุญาตให้ Pods ใช้งานได้จริง** โดยถูกคำนวณผ่านสูตร:\n\n$$\\text{Allocatable} = \\text{Capacity} - \\text{System-Reserved} - \\text{Kubelet-Reserved} - \\text{Eviction-Threshold}$$\n\n### คำอธิบายส่วนประกอบที่หักออก:\n1. **`System-Reserved`**: สำรองไว้ให้เซอร์วิสพื้นฐานของ OS (เช่น `sshd`, `systemd`, `journald`)\n2. **`Kubelet-Reserved`**: สำรองไว้ให้ตัว Kubelet และ Container Runtime ทำงานได้ราบรื่น\n3. **`Eviction-Threshold`**: บัฟเฟอร์ความปลอดภัยเพื่อใช้ขับไล่พอดก่อนที่เครื่องจะเกิดภาวะ Kernel Panic\n\n> [!IMPORTANT]\n> `kube-scheduler` จะใช้ค่า **`Allocatable`** ในการคำนวณว่าโหนดนี้มีทรัพยากรเหลือพอที่จะรับพอดใหม่ได้หรือไม่ โดยจะไม่พิจารณาจาก `Capacity` รวม"
      },
      {
        "id": "node-controller-and-heartbeats",
        "headingEn": "Node Controller and Leases",
        "headingTh": "การทำงานของ Node Controller และระบบ Heartbeat ด้วย Leases",
        "contentMarkdown": "**Node Controller** เป็นคอนโทรลเลอร์ภายใน `kube-controller-manager` ที่คอยดูแลสุขภาพของโหนด:\n\n1. **การกำหนด CIDR Block**: จัดสรรช่วงวง IP ย่อย (Pod CIDR) ให้กับแต่ละโหนดเมื่อลงทะเบียนสำเร็จ\n2. **การเฝ้าดู Heartbeats (การเต้นของหัวใจ)**:\n   * Kubelet บนแต่ละโหนดจะส่ง Heartbeat ไปยัง Control Plane อย่างสม่ำเสมอ (ค่าดีฟอลต์ทุกๆ 10 วินาที)\n   * ใน Kubernetes ยุคใหม่ Heartbeat จะส่งผ่านออบเจกต์ **`Lease`** ที่อยู่ในเนมสเปซ **`kube-node-lease`** ซึ่งเป็นออบเจกต์ขนาดเล็กมาก ช่วยลดภาระการเขียนข้อมูลลงใน etcd ได้อย่างมหาศาลเมื่อเทียบกับการอัปเดตทั้ง Node Object\n3. **การเปลี่ยนสถานะเมื่อขาดการติดต่อ**:\n   * หาก Node Controller ไม่ได้รับ Heartbeat ภายในช่วงเวลาที่กำหนด (เช่น 40 วินาทีตามค่า `node-monitor-grace-period`) สถานะของโหนดจะถูกปรับเป็น `Ready=Unknown`"
      },
      {
        "id": "node-eviction-and-taints",
        "headingEn": "Node Eviction and Taints",
        "headingTh": "การขับไล่พอดและการติด Taints อัตโนมัติ",
        "contentMarkdown": "เมื่อโหนดมีปัญหา Control Plane จะติด Taints (รอยมลทิน) ให้กับโหนดโดยอัตโนมัติ:\n\n* **`node.kubernetes.io/not-ready`**: โหนดอยู่ในสถานะ `Ready=False`\n* **`node.kubernetes.io/unreachable`**: โหนดอยู่ในสถานะ `Ready=Unknown` (ขาดการติดต่อ)\n* **`node.kubernetes.io/out-of-disk`**: ดิสก์ของโหนดเต็ม\n* **`node.kubernetes.io/memory-pressure`**: โหนดเผชิญปัญหาแรมไม่พอ\n\n### กระบวนการขับไล่พอด (Eviction):\nพอดทั่วไปจะมีการกำหนด Toleration ต่อ `not-ready` และ `unreachable` มาให้อัตโนมัติเป็นเวลา **300 วินาที (5 นาที)** หากโหนดยังคงดับหรือติดต่อไม่ได้เกิน 300 วินาที Node Controller จะสั่งเริ่มกระบวนการขับไล่พอด (Eviction) ออกจากโหนดนั้น และ Workload Controller (เช่น Deployment) จะสร้างพอดใหม่ไปรันบนโหนดอื่นที่สมบูรณ์ทดแทน"
      },
      {
        "id": "graceful-shutdown-and-maintenance",
        "headingEn": "Graceful Node Shutdown and Maintenance",
        "headingTh": "การปิดโหนดอย่างปลอดภัยและการซ่อมบำรุงด้วย cordon และ drain",
        "contentMarkdown": "เมื่อจำเป็นต้องซ่อมบำรุงเครื่องโหนด (เช่น อัปเกรด Kernel หรือเปลี่ยนฮาร์ดแวร์) ผู้ดูแลระบบต้องปฏิบัติตามขั้นตอนอย่างปลอดภัยผ่าน `kubectl`:\n\n### 1. การ Cordon (ห้ามจัดสรรพอดใหม่)\nสั่งทำเครื่องหมายว่าโหนดนี้ไม่พร้อมรับพอดใหม่ แต่พอดเดิมที่รันอยู่จะไม่ได้รับผลกระทบ:\n`kubectl cordon <node-name>`\n\n### 2. การ Drain (อพยพพอดออกจากโหนดอย่างนุ่มนวล)\nสั่งขับไล่พอดทั้งหมดออกจากโหนดอย่างสง่างาม (Graceful) โดยระบบจะเคารพ `terminationGracePeriodSeconds` และ PodDisruptionBudgets (PDB):\n`kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data`\n\n### 3. การ Uncordon (เปิดรับพอดใหม่อีกครั้ง)\nหลังจากซ่อมบำรุงเครื่องเสร็จและโหนดกลับมาออนไลน์แล้ว ให้ปลดล็อกเพื่อให้ scheduler ส่งพอดมาวางได้อีกครั้ง:\n`kubectl uncordon <node-name>`",
        "codeBlocks": [
          {
            "lang": "shell",
            "label": "ขั้นตอนการบำรุงรักษาโหนด",
            "code": "# 1. สั่งห้ามจัดสรรพอดใหม่\nkubectl cordon node-1.example.com\n\n# 2. อพยพพอดออกเพื่อซ่อมบำรุง\nkubectl drain node-1.example.com --ignore-daemonsets --delete-emptydir-data\n\n# (ดำเนินการซ่อมบำรุงเครื่องแม่ข่าย)\n\n# 3. นำโหนดกลับเข้าสู่คลัสเตอร์\nkubectl uncordon node-1.example.com"
          }
        ]
      }
    ],
    "relatedLinks": [
      {
        "title": "Control Plane to Node Communication",
        "targetType": "concepts",
        "targetPageId": "arch-control-plane-node-comm",
        "officialUrl": "https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/"
      },
      {
        "title": "Controllers and Leases",
        "targetType": "concepts",
        "targetPageId": "arch-controllers-leases",
        "officialUrl": "https://kubernetes.io/docs/concepts/architecture/controller/"
      },
      {
        "title": "Taints and Tolerations",
        "targetType": "concepts",
        "targetPageId": "sched-taint-toleration",
        "officialUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/"
      },
      {
        "title": "Safely Drain a Node (Task)",
        "targetType": "tasks",
        "targetPageId": "admin-safely-drain-node",
        "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/"
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
