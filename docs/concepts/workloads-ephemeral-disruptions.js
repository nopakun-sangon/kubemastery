/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/
 */
(function (root) {
  const pageData = {
    "id": "workloads-ephemeral-disruptions",
    "categoryId": "workloads",
    "categoryTitle": "Workloads",
    "titleEn": "Ephemeral Containers",
    "titleTh": "คอนเทนเนอร์ชั่วคราวและการขัดจังหวะการทำงาน (Ephemeral Containers & Disruptions)",
    "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/",
    "docsPath": "/docs/concepts/workloads/pods/ephemeral-containers/",
    "lead": "คอนเทนเนอร์ชั่วคราว (Ephemeral Containers) เป็นคอนเทนเนอร์ชนิดพิเศษที่รันชั่วคราวในพอดที่กำลังทำงานอยู่เพื่อการตรวจสอบและแก้ไขปัญหา (Interactive Debugging) โดยไม่ต้องรีสตาร์ตพอด ส่วน Pod Disruptions และ Pod Disruption Budgets (PDB) ทำหน้าที่ปกป้องความพร้อมใช้งานของแอปพลิเคชันจากการหยุดทำงานตามแผน (Voluntary Disruptions)",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nหน้านี้ครอบคลุม 2 เรื่องสำคัญในการบริหารจัดการเวิร์กโหลด: **Ephemeral Containers** (คอนเทนเนอร์ชั่วคราวที่ฉีดเข้าไปในพอดที่กำลังรันอยู่เพื่อตรวจเช็กและดีบักปัญหา) และ **Pod Disruptions / PDB** (การบริหารจัดการเหตุขัดจังหวะเพื่อการันตีว่าจะมีพอดพร้อมให้บริการตามเกณฑ์ขั้นต่ำเสมอ)\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **Ephemeral Containers (คอนเทนเนอร์ชั่วคราว)**:\n  - ใช้สำหรับ Troubleshooting เมื่อคอนเทนเนอร์หลักสร้างจาก Distroless หรือ Scratch Image ที่ไม่มี Shell หรือคำสั่งเครือข่าย\n  - ไม่มีการจองพอร์ต ไม่รองรับ Probes และไม่สามารถรีสตาร์ตได้\n  - ถูกฉีดเข้าไปใน Pod ผ่าน Subresource `pods/ephemeralcontainers` โดยไม่ต้องลบหรือสร้างพอดใหม่\n- **Voluntary vs Involuntary Disruptions**:\n  - *Involuntary Disruptions*: เหตุการณ์สุดวิสัยนอกการควบคุม เช่น ฮาร์ดแวร์ล่ม, Kernel panic, เครื่อง VM ดับ\n  - *Voluntary Disruptions*: เหตุการณ์ที่เกิดจากการกระทำของผู้ดูแลหรือระบบ เช่น Node drain เพื่อบำรุงรักษา, การลบโหนดเพื่อย่อขนาดคลัสเตอร์, การอัปเดตเวอร์ชันซอฟต์แวร์\n- **Pod Disruption Budget (PDB)**:\n  - ออบเจกต์ที่ใช้กำหนดขีดจำกัดความพร้อมใช้งานเพื่อป้องกันผลกระทบจาก Voluntary Disruptions\n  - สามารถกำหนดได้ทั้ง `minAvailable` (จำนวนพอดขั้นต่ำที่ต้องรันอยู่ เช่น 2 หรือ 80%) หรือ `maxUnavailable` (จำนวนพอดสูงสุดที่ยอมให้หยุดทำงาน เช่น 1 หรือ 20%)\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **การใช้คำสั่ง `kubectl debug` สำหรับดีบักพอด**:\n  `kubectl debug -it <pod-name> --image=busybox:1.28 --target=<container-name>` (ใช้ `--target` เพื่อแชร์ Process Namespace กับคอนเทนเนอร์เป้าหมาย)\n- **การสร้าง PodDisruptionBudget**:\n  ```yaml\n  apiVersion: policy/v1\n  kind: PodDisruptionBudget\n  metadata:\n    name: web-pdb\n  spec:\n    minAvailable: 2\n    selector:\n      matchLabels:\n        app: web\n  ```\n- **ข้อควรระวังในห้องสอบ CKA**: เมื่อสั่ง `kubectl drain <node-name>` หากคำสั่งค้างหรือไม่สำเร็จ อาจเกิดจากการติดเงื่อนไขของ PDB ซึ่งไม่อนุญาตให้ Evict พอดจนกว่าจะมีพอดใหม่ในโหนดอื่นขึ้นมาทดแทน",
    "sections": [
      {
        "id": "understanding-ephemeral-containers",
        "headingEn": "Understanding Ephemeral Containers",
        "headingTh": "ความเข้าใจเกี่ยวกับคอนเทนเนอร์ชั่วคราว (Ephemeral Containers)",
        "contentMarkdown": "ในระบบ Production ยุคใหม่ อิมเมจส่วนใหญ่มักสร้างแบบ **Distroless** หรือเป็น **Minimal Images** (เช่น `scratch` หรือไม่มี shell / curl / netstat / ping) เพื่อความปลอดภัยและขนาดที่เล็กมาก ปัญหาคือเมื่อแอปพลิเคชันบน Production เกิดปัญหา วิศวกรไม่สามารถใช้ `kubectl exec` เข้าไปเปิด Shell เพื่อตรวจสอบปัญหาได้\n\nนอกจากนี้ ฟิลด์ `spec.containers` ของพอดเป็นสิ่งที่ไม่สามารถเปลี่ยนแปลงได้ (Immutable) คุณจึงไม่สามารถเพิ่มคอนเทนเนอร์ใหม่เข้าไปในพอดที่กำลังรันอยู่ได้ตามปกติ\n\nKubernetes จึงสร้าง **Ephemeral Containers** ขึ้นมา:\n* เป็นคอนเทนเนอร์พิเศษที่ถูกแทรกเข้าไปในพอดที่กำลังรันอยู่ผ่าน Subresource `ephemeralcontainers`\n* **ไม่มีการการันตีทรัพยากร**: ไม่สามารถระบุ `resources.requests` หรือ `resources.limits` ได้\n* **ไม่มี Ports และ Probes**: ห้ามกำหนดพอร์ต และไม่มี health checks\n* **ไม่รีสตาร์ต**: เมื่อทำงานเสร็จหรือโปรเซสดับไปแล้ว จะไม่มีการรีสตาร์ตขึ้นมาใหม่"
      },
      {
        "id": "debugging-with-kubectl-debug",
        "headingEn": "Interactive Debugging with kubectl debug",
        "headingTh": "การตรวจแก้ปัญหาแบบเรียลไทม์ด้วย kubectl debug",
        "contentMarkdown": "คำสั่ง **`kubectl debug`** ช่วยให้คุณสามารถแทรก Ephemeral Container ที่มีเครื่องมือพร้อมสรรพ (เช่น `busybox` หรือ `nicolaka/netshoot`) เข้าไปในพอดที่มีปัญหาได้ทันที:\n\n* **การแชร์ Process Namespace (`--target`)**:\n  เมื่อระบุแฟล็ก `--target=<container-name>` ตัว Ephemeral Container จะเข้าไปอยู่ใน PID Namespace เดียวกันกับคอนเทนเนอร์เป้าหมาย ทำให้คุณสามารถรัน `ps aux` เพื่อมองเห็นและตรวจสอบโปรเซสของคอนเทนเนอร์หลัก รวมถึงเข้าถึง `/proc/<pid>/root` ได้อย่างสะดวก",
        "codeBlocks": [
          {
            "lang": "shell",
            "label": "คำสั่ง kubectl debug สำหรับ Pod",
            "code": "# แทรก busybox เข้าไปในพอด my-pod พร้อมแชร์ PID กับ my-container\nkubectl debug -it my-pod --image=busybox:1.28 --target=my-container\n\n# ใช้ netshoot สำหรับวิเคราะห์ปัญหาเน็ตเวิร์ก\nkubectl debug -it my-pod --image=nicolaka/netshoot"
          }
        ]
      },
      {
        "id": "node-and-pod-copy-debugging",
        "headingEn": "Node Debugging & Pod Copy Workflows",
        "headingTh": "การวินิจฉัยปัญหาเครื่องโหนดและการคัดลอกพอด",
        "contentMarkdown": "`kubectl debug` ยังรองรับกรณีการใช้งานระดับแอดวานซ์อีก 2 รูปแบบ:\n\n### 1. การ Debug ระดับ Worker Node (`kubectl debug node/...`)\n* สร้างพอดชั่วคราวขึ้นมาบนโหนดที่ระบุ โดยเปิดสิทธิ์การเข้าถึง Host Namespaces, IPC, Network, และ PID รวมถึงเมานต์ Root Filesystem ของเครื่องโหนดไว้ที่ `/host`\n* คำสั่ง: `kubectl debug node/node-1.example.com -it --image=ubuntu`\n* เหมาะสำหรับวิเคราะห์ปัญหา Kubelet หรือไดรเวอร์เน็ตเวิร์กบนโหนดโดยไม่ต้อง SSH ตรงเข้าเครื่อง\n\n### 2. การสร้างสำเนาของพอดเพื่อทดสอบ (`--copy-to`)\n* หากพอดเกิดแครชจน Ephemeral Container ไม่สามารถแทรกได้ คุณสามารถสร้างสำเนาพอดใหม่ขึ้นมาพร้อมดัดแปลงคอนฟิก เช่น เปลี่ยนคำสั่งสตาร์ต หรือเปลี่ยนอิมเมจ:\n* `kubectl debug my-crashed-pod --copy-to=my-debug-pod --set-image=app=app:debug-v2`"
      },
      {
        "id": "voluntary-vs-involuntary-disruptions",
        "headingEn": "Voluntary vs Involuntary Pod Disruptions",
        "headingTh": "การเปรียบเทียบการขัดจังหวะการทำงาน (Pod Disruptions)",
        "contentMarkdown": "พอดในคลัสเตอร์อาจหยุดทำงานได้จาก 2 สาเหตุหลัก:\n\n### 1. Involuntary Disruptions (การขัดจังหวะโดยไม่สมัครใจ / อุบัติเหตุ)\n* เกิดจากความล้มเหลวทางฮาร์ดแวร์หรือระบบภายนอกที่ควบคุมไม่ได้ เช่น:\n  * ฮาร์ดแวร์เครื่องแม่ข่ายพัง, เมนบอร์ดช็อต, ไฟฟ้าดับ\n  * สายเคเบิลเครือข่ายหลุด หรือ VM บนคลาวด์ถูกลบทิ้งกะทันหัน\n  * Kernel panic บนโหนด\n  * โหนดเกิดภาวะแรมหมด จนพอดถูกขับไล่ด้วย Node Eviction (Out of Memory)\n\n### 2. Voluntary Disruptions (การขัดจังหวะโดยสมัครใจ / ตามแผนงาน)\n* เกิดจากการกระทำที่มีการวางแผนไว้ล่วงหน้าโดยผู้ดูแลระบบหรือระบบอัตโนมัติ เช่น:\n  * การสั่งอัปเกรดเวอร์ชัน Kubernetes บนโหนดผ่านคำสั่ง `kubectl drain`\n  * การปรับลดขนาดคลัสเตอร์โดย Cluster Autoscaler เพื่อประหยัดค่าใช้จ่าย\n  * การ Rollout แอปพลิเคชันเวอร์ชันใหม่ใน Deployment\n* **Kubernetes สามารถควบคุมและจำกัดผลกระทบของ Voluntary Disruptions ได้ผ่าน PDB**"
      },
      {
        "id": "pod-disruption-budgets",
        "headingEn": "Pod Disruption Budgets (PDB)",
        "headingTh": "การควบคุมความพร้อมใช้งานด้วย Pod Disruption Budgets (PDB)",
        "contentMarkdown": "**PodDisruptionBudget (PDB)** คือออบเจกต์ในกลุ่ม API `policy/v1` ที่ใช้ประกาศข้อตกลงว่า ในช่วงที่มีการบำรุงรักษาคลัสเตอร์ (Voluntary Disruptions) ยอมให้พอดของแอปพลิเคชันนี้หยุดทำงานได้มากน้อยเพียงใด เพื่อไม่ให้เกิดภาวะระบบล่ม (Downtime)\n\nคุณสามารถระบุเงื่อนไขอย่างใดอย่างหนึ่งใน PDB:\n\n* **`minAvailable`**: การันตีว่าต้องมีพอดที่พร้อมให้บริการอยู่อย่างน้อยกี่ตัวเสมอ (ระบุเป็นจำนวนตัวเลข เช่น `2` หรือเปอร์เซ็นต์ เช่น `80%`)\n* **`maxUnavailable`**: อนุญาตให้มีพอดหยุดทำงานพร้อมกันได้สูงสุดไม่เกินกี่ตัว (ระบุเป็นตัวเลข เช่น `1` หรือเปอร์เซ็นต์ เช่น `25%`)\n\n> [!IMPORTANT]\n> PDB จะมีผลคุ้มครองเฉพาะการหยุดทำงานแบบ **Voluntary Disruptions** เท่านั้น หากฮาร์ดแวร์พัง (Involuntary) PDB จะไม่สามารถป้องกันเหตุการณ์นั้นได้ แต่จะช่วยควบคุมจังหวะไม่ให้ผู้ดูแลระบบสั่ง Drain โหนดหลายเครื่องพร้อมกันจนแอปดับหมด"
      },
      {
        "id": "pdb-manifest-and-drain-interaction",
        "headingEn": "PDB Manifest & Node Drain Interaction",
        "headingTh": "ตัวอย่าง Manifest ของ PDB และการทำงานร่วมกับ kubectl drain",
        "contentMarkdown": "เมื่อผู้ดูแลระบบสั่ง `kubectl drain <node>` คำสั่ง drain จะส่งคำขอ Eviction API ไปยัง Control Plane ซึ่ง API Server จะตรวจสอบว่าการลบพอดนั้นละเมิด PDB หรือไม่ หากพบว่าจะทำให้จำนวนพอดต่ำกว่า `minAvailable` คำขอ drain จะถูก **บล็อกและรอ (Wait/Block)** จนกว่าพอดบนโหนดอื่นจะพร้อมทำงาน หรือแจ้งข้อผิดพลาด `Cannot evict pod: PodDisruptionBudget is violated`",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "pdb-example.yaml",
            "code": "apiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata:\n  name: zk-pdb\nspec:\n  minAvailable: 2\n  selector:\n    matchLabels:\n      app: zookeeper"
          },
          {
            "lang": "shell",
            "label": "การตรวจสอบ PDB ในคลัสเตอร์",
            "code": "kubectl get poddisruptionbudgets\n# หรือตัวย่อ\nkubectl get pdb"
          }
        ]
      }
    ],
    "relatedLinks": [
      {
        "title": "Pods Overview (สถาปัตยกรรมพอด)",
        "targetType": "concepts",
        "targetPageId": "workloads-pods",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/"
      },
      {
        "title": "Deployments (ดีพลอยเมนต์)",
        "targetType": "concepts",
        "targetPageId": "workloads-deployments",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"
      },
      {
        "title": "Configure a Pod Disruption Budget (Task)",
        "targetType": "tasks",
        "targetPageId": "run-configure-pdb",
        "officialUrl": "https://kubernetes.io/docs/tasks/run-application/configure-pdb/"
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
