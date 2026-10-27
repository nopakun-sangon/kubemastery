/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/
 */
(function (root) {
  const pageData = {
    "id": "workloads-daemonset",
    "categoryId": "workloads",
    "categoryTitle": "Workloads",
    "titleEn": "DaemonSet",
    "titleTh": "เดมอนเซ็ต (DaemonSets) - การรัน Pod ประจำทุกโหนดในคลัสเตอร์",
    "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/",
    "docsPath": "/docs/concepts/workloads/controllers/daemonset/",
    "diagram": {
      "src": "images/docs/workload-controllers-hierarchy.svg",
      "caption": "สถาปัตยกรรม DaemonSet: รับประกันว่าจะมี Pod ชนิดนี้รันอยู่บนทุก Worker Node อย่างละ 1 ตัวเสมอ"
    },
    "lead": "เดมอนเซ็ต (DaemonSet) มีหน้าที่รับประกันว่า ทุกโหนด (หรือกลุ่มโหนดที่ผ่านการคัดเลือก) ในคลัสเตอร์จะมีสำเนาของพอดชนิดนี้รันอยู่ 1 ตัวเสมอ เมื่อมีโหนดใหม่ถูกเพิ่มเข้ามาในคลัสเตอร์ พอดจะถูกสร้างไปรันบนโหนดนั้นโดยอัตโนมัติ และเมื่อโหนดถูกลบออก พอดก็จะถูกเก็บกวาดไป",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\n**DaemonSet** ทำหน้าที่รับประกันว่าจะมีสำเนาของพอดรันอยู่บน **ทุกโหนด** (หรือโหนดเฉพาะกลุ่มที่เลือก) ในคลัสเตอร์เสมอ 1 ตัว เมื่อมีโหนดใหม่เพิ่มเข้ามา ระบบจะสร้างพอดไปรันบนโหนดนั้นโดยอัตโนมัติ และเมื่อโหนดถูกลบออก พอดก็จะถูกเก็บกวาดไป เหมาะอย่างยิ่งสำหรับบริการระดับโครงสร้างพื้นฐาน เช่น งานเก็บ Log ตรวจวัดประสิทธิภาพ หรือไดรเวอร์สตอเรจ\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **กรณีการใช้งานยอดนิยม**:\n  - *Log Collection*: รัน Fluentd, Fluentbit, หรือ Promtail ประจำทุกโหนดเพื่อดูด Log ส่งออก\n  - *Node Monitoring*: รัน Prometheus Node Exporter หรือ Datadog Agent เพื่อดึงสถิติ CPU, Memory, Disk ของแต่ละโหนด\n  - *Cluster Storage Daemons*: รันไดรเวอร์สตอเรจแบบกระจายศูนย์ เช่น Ceph, GlusterFS บนเครื่องสตอเรจโหนด\n- **การจัดสรรโหนด (Scheduling) & Taints**:\n  - จัดการโดย `kube-scheduler` ตามปกติ\n  - สามารถใช้ `nodeSelector` หรือ `nodeAffinity` เพื่อจำกัดให้รันเฉพาะโหนดบางประเภท (เช่น โหนดที่มี GPU หรือโหนดกลุ่ม Edge)\n  - ต้องระบุ `tolerations` หากต้องการให้รันบนโหนดที่มี Taints เช่น โหนด Master / Control Plane\n- **ยุทธศาสตร์การอัปเดต (`spec.updateStrategy`)**:\n  - `RollingUpdate` (ดีฟอลต์): ทยอยเปลี่ยนพอดทีละโหนด ควบคุมอัตราด้วย `maxUnavailable` (ดีฟอลต์ 1)\n  - `OnDelete`: ไม่อัปเดตพอดอัตโนมัติ จะสร้างพอดใหม่ก็ต่อเมื่อผู้ดูแลสั่งลบพอดเก่าบนโหนดนั้นด้วยมือ\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **เทคนิคการสร้าง Manifest ในห้องสอบ**:\n  - `kubectl` ไม่มีคำสั่ง `kubectl create daemonset` โดยตรง!\n  - วิธีที่เร็วที่สุดในห้องสอบ: สร้าง Deployment แบบ Dry-run ก่อน:\n    `kubectl create deployment my-ds --image=fluentd --dry-run=client -o yaml > ds.yaml`\n    จากนั้นเปิดไฟล์แก้ `kind: Deployment` เป็น `kind: DaemonSet` แล้วลบฟิลด์ `replicas` และ `strategy` ออก\n- **Tolerations สำหรับ Control Plane Nodes**:\n  ```yaml\n  tolerations:\n  - key: node-role.kubernetes.io/control-plane\n    operator: Exists\n    effect: NoSchedule\n  ```\n- **คำสั่งตรวจสอบสถานะ**: `kubectl get ds`, `kubectl rollout status ds/<name>`, `kubectl rollout undo ds/<name>`",
    "sections": [
      {
        "id": "understanding-daemonsets",
        "headingEn": "Understanding DaemonSets",
        "headingTh": "ความเข้าใจเกี่ยวกับเดมอนเซ็ต (DaemonSets)",
        "contentMarkdown": "ในสถาปัตยกรรมระบบแบบดั้งเดิม เรามักมีโปรแกรมประเภท 'Daemon' หรือ Service เบื้องหลังที่ต้องรันอยู่บนทุกเครื่องเซิร์ฟเวอร์ เช่น โปรแกรมดึง Log หรือส่งสถิติการใช้งาน CPU ใน Kubernetes ออบเจกต์ **`DaemonSet`** คือตัวควบคุมเวิร์กโหลดที่ทำหน้าที่นี้โดยตรง\n\n### ข้อแตกต่างระหว่าง DaemonSet และ Deployment:\n* **Deployment**: เหมาะสำหรับบริการของแอปพลิเคชัน โดยระบบจะจัดสรรพอดไปวางบนโหนดใดก็ได้ตามทรัพยากรที่ว่าง และสามารถมีพอดหลายตัวอยู่บนโหนดเดียวกัน หรือบางโหนดอาจไม่มีพอดเลยก็ได้\n* **DaemonSet**: การันตีความสัมพันธ์แบบ 1-to-1 กับเครื่องโหนด โดยจะมีพอด 1 ตัวรันอยู่บนทุกๆ โหนดที่ตรงตามเงื่อนไขเสมอ เมื่อมีการเพิ่มเครื่องเซิร์ฟเวอร์เข้ามาในคลัสเตอร์ (Scale out nodes) DaemonSet Controller จะส่งพอดไปรันบนเครื่องใหม่ทันทีโดยที่คุณไม่ต้องสั่งการใดๆ"
      },
      {
        "id": "typical-use-cases",
        "headingEn": "Typical Use Cases",
        "headingTh": "กรณีการใช้งานยอดนิยมของ DaemonSet",
        "contentMarkdown": "DaemonSet มักถูกนำมาใช้สำหรับบริการระดับโครงสร้างพื้นฐาน (Infrastructure Services) ที่ต้องเข้าถึงสภาพแวดล้อมจริงของเครื่องโหนด:\n\n* **Cluster Storage Daemons**: เช่น การรันไดรเวอร์จัดเก็บข้อมูลแบบกระจายศูนย์อย่าง Ceph, GlusterFS, หรือ Portworx บนเครื่องสตอเรจโหนด\n* **Logs Collection Daemons**: การรันเอเจนต์เก็บไฟล์ Log ของระบบและคอนเทนเนอร์ (เช่น Fluentd, Fluent Bit, Vector, Promtail, Filebeat) เพื่อส่งไปยังส่วนกลาง\n* **Node Monitoring Daemons**: การรันตัวเก็บ Metrics ด้านฮาร์ดแวร์และเคอร์เนล เช่น Prometheus Node Exporter, Datadog Agent, หรือ Dynatrace OneAgent\n* **Networking & Security Plugins**: คอมโพเนนต์หลักของเครือข่ายคลัสเตอร์ เช่น `kube-proxy`, Cilium, Calico CNI, และโปรแกรมเฝ้าระวังความปลอดภัยอย่าง Falco"
      },
      {
        "id": "scheduling-and-taints",
        "headingEn": "Scheduling DaemonSet Pods & Taints",
        "headingTh": "การจัดตารางเวลาและกลไก Taints/Tolerations",
        "contentMarkdown": "ใน Kubernetes ยุคปัจจุบัน DaemonSet Pods จะถูกจัดตารางเวลาโดย **`kube-scheduler`** ตามปกติ โดยจะปฏิบัติตามข้อกำหนดใน PodSpec:\n\n### 1. การจำกัดโหนดเฉพาะเจาะจง (`nodeSelector` และ `nodeAffinity`)\nหากคุณต้องการให้ DaemonSet รันเฉพาะบนโหนดบางประเภท (เช่น รันเฉพาะโหนดที่มีการ์ดจอ GPU เพื่อเก็บ GPU Metrics หรือรันเฉพาะโหนดที่เป็น Edge Gateway) สามารถระบุ `nodeSelector` หรือ `nodeAffinity` ใน Pod Template ได้\n\n### 2. การละเว้น Taints บน Master/Control Plane Nodes (Tolerations)\nตามค่าเริ่มต้น เครื่อง Control Plane มักจะมีการติด Taint ห้ามพอดทั่วไปมารัน เช่น `node-role.kubernetes.io/control-plane:NoSchedule`\n\nหาก DaemonSet นั้นเป็นส่วนประกอบของระบบโครงสร้าง (เช่น CNI หรือ Node Exporter) และจำเป็นต้องมอนิเตอร์เครื่อง Master ด้วย คุณจะต้องใส่ **`tolerations`** ที่ตรงกับ Taint ของ Control Plane ไว้ในไฟล์ Manifest เสมอ"
      },
      {
        "id": "communicating-with-daemon-pods",
        "headingEn": "Communicating with DaemonSet Pods",
        "headingTh": "รูปแบบการสื่อสารกับพอดของ DaemonSet",
        "contentMarkdown": "มีหลายวิธีในการติดต่อกับพอดที่สร้างโดย DaemonSet:\n\n* **Push Model (ส่งข้อมูลออก)**: พอดของ DaemonSet ทำหน้าที่เป็นผู้ส่งข้อมูลออกไปยังเซิร์ฟเวอร์ภายนอกเอง เช่น Fluentbit ส่ง Log ไปยัง OpenSearch/Elasticsearch โดยไม่ต้องรอให้ใครมาต่อ\n* **NodeIP and Known Port (`hostPort`)**: กำหนด `hostPort` เพื่อให้พอดเปิดพอร์ตบน Network Interface ของเครื่องโหนดโดยตรง ทำให้ไคลเอนต์สามารถเชื่อมต่อไปที่ `<NodeIP>:<hostPort>` ได้โดยตรง\n* **DNS / Service**: สร้าง Headless Service หรือ Service ปกติที่มี Label Selector ตรงกับ DaemonSet เพื่อให้เรียกใช้งานผ่าน Domain Name ได้"
      },
      {
        "id": "updating-daemonsets",
        "headingEn": "Updating a DaemonSet: RollingUpdate vs OnDelete",
        "headingTh": "ยุทธศาสตร์การอัปเดต DaemonSet: RollingUpdate และ OnDelete",
        "contentMarkdown": "ฟิลด์ `.spec.updateStrategy.type` รองรับ 2 ยุทธศาสตร์:\n\n### 1. `RollingUpdate` (กลยุทธ์เริ่มต้น - แนะนำ)\nเมื่อมีการแก้ไข Pod Template คอนโทรลเลอร์จะทยอยลบพอดเก่าและสร้างพอดใหม่ขึ้นมาทีละโหนดโดยอัตโนมัติ:\n* ควบคุมอัตราการอัปเดตผ่าน **`maxUnavailable`** (ค่าดีฟอลต์ 1): จำนวนโหนดสูงสุดที่ยอมให้ DaemonSet Pod หยุดทำงานพร้อมกันในระหว่างการอัปเกรด\n\n### 2. `OnDelete` (อัปเดตเมื่อสั่งลบเอง)\nเมื่อแก้ไข Pod Template ระบบจะยังไม่มีอะไรเปลี่ยนแปลง พอดใหม่จะถูกสร้างขึ้นบนโหนดก็ต่อเมื่อผู้ดูแลระบบเข้าไปสั่งลบ (Kill/Delete) พอดเดิมบนโหนดนั้นด้วยตนเอง เหมาะสำหรับระบบที่มีความเสี่ยงสูงและต้องการควบคุมเวลาในการรีสตาร์ตอย่างละเอียดทีละเครื่อง"
      },
      {
        "id": "daemonset-manifest-example",
        "headingEn": "Comprehensive Manifest Example & Troubleshooting",
        "headingTh": "ตัวอย่าง Manifest สมบูรณ์และคำสั่งตรวจสอบสถานะ",
        "contentMarkdown": "ตัวอย่าง Manifest ของ DaemonSet สำหรับรัน Fluentd เพื่อรวบรวม Log จากทุกโหนดในคลัสเตอร์:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "fluentd-daemonset.yaml",
            "code": "apiVersion: apps/v1\nkind: DaemonSet\nmetadata:\n  name: fluentd-elasticsearch\n  namespace: kube-system\n  labels:\n    k8s-app: fluentd-logging\nspec:\n  selector:\n    matchLabels:\n      name: fluentd-elasticsearch\n  template:\n    metadata:\n      labels:\n        name: fluentd-elasticsearch\n    spec:\n      tolerations:\n      # อนุญาตให้รันบนเครื่อง Master / Control Plane ได้\n      - key: node-role.kubernetes.io/control-plane\n        operator: Exists\n        effect: NoSchedule\n      containers:\n      - name: fluentd-elasticsearch\n        image: quay.io/fluentd_elasticsearch/fluentd:v2.5.2\n        resources:\n          limits:\n            memory: 200Mi\n          requests:\n            cpu: 100m\n            memory: 200Mi\n        volumeMounts:\n        - name: varlog\n          mountPath: /var/log\n      volumes:\n      - name: varlog\n        hostPath:\n          path: /var/log"
          },
          {
            "lang": "shell",
            "label": "คำสั่งตรวจสอบ DaemonSet ด้วย kubectl",
            "code": "# ดูสถานะการทำงาน (Desired, Current, Ready, Up-to-date, Available)\nkubectl get daemonsets -n kube-system\n\n# ตรวจสอบประวัติการ Rollout\nkubectl rollout status daemonset/fluentd-elasticsearch -n kube-system"
          }
        ]
      }
    ],
    "relatedLinks": [
      {
        "title": "Nodes in Kubernetes (สถาปัตยกรรมโหนด)",
        "targetType": "concepts",
        "targetPageId": "arch-nodes",
        "officialUrl": "https://kubernetes.io/docs/concepts/architecture/nodes/"
      },
      {
        "title": "Taints and Tolerations",
        "targetType": "concepts",
        "targetPageId": "sched-taint-toleration",
        "officialUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/"
      },
      {
        "title": "Perform a Rolling Update on a DaemonSet (Task)",
        "targetType": "tasks",
        "targetPageId": "run-stateless-deployment",
        "officialUrl": "https://kubernetes.io/docs/tasks/manage-daemon/rollback-daemon-set/"
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
