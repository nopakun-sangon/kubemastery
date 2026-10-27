/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
 */
(function (root) {
  const pageData = {
    "id": "overview-labels-selectors-annotations",
    "categoryId": "overview",
    "categoryTitle": "Overview",
    "titleEn": "Labels and Selectors",
    "titleTh": "เลเบล, ตัวเลือก และแอนโนเทชัน (Labels, Selectors & Annotations)",
    "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/",
    "docsPath": "/docs/concepts/overview/working-with-objects/labels/",
    "lead": "เลเบล (Labels) คือคู่คีย์-ค่า (Key-Value Pairs) ที่แนบติดกับออบเจกต์เพื่อใช้ในการจัดกลุ่ม จัดหมวดหมู่ และคัดกรองผ่าน Label Selectors ส่วนแอนโนเทชัน (Annotations) ใช้สำหรับแนบข้อมูล Metadata เสริมที่ระบบหรือเครื่องมือภายนอกนำไปใช้งานโดยตรง",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\n**Labels** คือคู่ Key-Value ที่ใช้ระบุตัวตนและจัดกลุ่มออบเจกต์ (Identifying metadata) เพื่อให้ค้นหาหรือจับคู่ผ่าน **Label Selectors** ได้ ส่วน **Annotations** เป็นคู่ Key-Value สำหรับเก็บข้อมูลรายละเอียดเสริมหรือคอนฟิกของเครื่องมือภายนอก (Non-identifying metadata) ที่ไม่ใช้ในการค้นหาจับคู่\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **Labels (เลเบล)**: มีความหมายต่อการทำงานของคลัสเตอร์ ใช้ในการจัดหมวดหมู่ออบเจกต์ (เช่น `env: prod`, `tier: backend`) และเป็นตัวเชื่อมโยง Service/ReplicaSet กับ Pods\n- **Label Selectors**:\n  - *Equality-based*: `=`, `==`, `!=` (เช่น `tier=backend`)\n  - *Set-based*: `in`, `notin`, `exists` (เช่น `environment in (prod, staging)`, `!canary`) นิยมใช้ใน `matchLabels` และ `matchExpressions`\n- **Annotations (แอนโนเทชัน)**: เก็บ Metadata ก้อนใหญ่หรือ unstructured data (เช่น Git commit hash, build timestamp, ingress controller config, telemetry tags) ไม่สามารถนำมา Query ผ่าน Selector ได้\n- **Recommended Labels**: Kubernetes แนะนำให้ใช้ Prefixes `app.kubernetes.io/` เช่น `name`, `instance`, `version`, `component`, `part-of`, `managed-by` เพื่อความเป็นระเบียบและให้ Tool ต่างๆ ทำงานร่วมกันได้\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **คำสั่งจัดการ Labels ผ่าน CLI**:\n  - ดูพอดพร้อมแสดงเลเบล: `kubectl get pods --show-labels`\n  - กรองพอดด้วย Selector: `kubectl get pods -l 'app=nginx,env=prod'`\n  - เพิ่ม/เปลี่ยนเลเบล: `kubectl label pod my-pod env=prod` (หากทับค่าเดิมต้องใส่ `--overwrite`)\n  - ลบเลเบล: `kubectl label pod my-pod env-` (ใส่เครื่องหมาย `-` หลังคีย์)\n- **คำสั่งจัดการ Annotations**: `kubectl annotate pod my-pod description='Production Web App'`\n- **จุดผิดบ่อยในข้อสอบ**: Service ไม่ส่งทราฟฟิกไปหา Pod มักเกิดจาก `spec.selector` ของ Service ไม่ตรงกับ `metadata.labels` ของ Pod",
    "sections": [
      {
        "id": "understanding-labels",
        "headingEn": "Understanding Labels and Syntax",
        "headingTh": "ความเข้าใจพื้นฐานเกี่ยวกับเลเบลและไวยากรณ์ (Labels Syntax)",
        "contentMarkdown": "**Labels (เลเบล)** คือคู่ Key-Value ที่แนบอยู่กับออบเจกต์ใน Kubernetes (เช่น Pods, Services, Deployments, Nodes) เพื่อใช้ระบุคุณลักษณะที่สำคัญของออบเจกต์ที่มีความหมายต่อผู้ใช้ โดยไม่ส่งผลกระทบโดยตรงต่อการทำงานของระบบหลัก\n\nเลเบลสามารถเพิ่มได้ตั้งแต่ตอนสร้างออบเจกต์ หรือแก้ไขเพิ่มเติมในภายหลังได้ตลอดเวลา\n\n### ไวยากรณ์และข้อจำกัดของเลเบล (Syntax & Constraints):\nคีย์ของเลเบลประกอบด้วย 2 ส่วนคือ **Prefix (ส่วนหน้า)** ที่เป็นทางเลือก และ **Name (ชื่อ)** โดยคั่นด้วยเครื่องหมายทับ (`/`):\n\n* **Name**: ต้องมีความยาวไม่เกิน **63 ตัวอักษร** ประกอบด้วยตัวอักษรภาษาอังกฤษ (`[a-z0-9A-Z]`), ตัวเลข, ขีดกลาง (`-`), จุด (`.`), และขีดล่าง (`_`) โดยต้องขึ้นต้นและลงท้ายด้วยตัวอักษรหรือตัวเลข\n* **Prefix (ทางเลือก)**: ต้องเป็นโดเมนย่อยตามมาตรฐาน DNS (ความยาวไม่เกิน 253 ตัวอักษร) หากไม่มี Prefix คีย์นั้นจะถือว่าเป็นของส่วนตัวของผู้ใช้ (Private to user)\n* **Value**: ค่าของเลเบลต้องมีความยาวไม่เกิน **63 ตัวอักษร** หรือปล่อยให้เป็นค่าว่าง `\"\"` ได้ และต้องขึ้นต้น/ลงท้ายด้วยตัวอักษรหรือตัวเลข\n\n> [!NOTE]\n> ส่วนหน้าที่มีคำว่า `kubernetes.io/` และ `k8s.io/` ถูกสงวนไว้สำหรับการใช้งานภายในของ Kubernetes Core Components"
      },
      {
        "id": "recommended-labels",
        "headingEn": "Standard Recommended Labels",
        "headingTh": "มาตรฐานเลเบลที่ Kubernetes แนะนำ (Recommended Labels)",
        "contentMarkdown": "เพื่อความเป็นระเบียบและทำให้เครื่องมือตรวจสอบ (Monitoring/Dashboard), Helm, และ CI/CD ต่างๆ ทำงานร่วมกันได้ดี Kubernetes ได้กำหนดมาตรฐานชุดเลเบลที่แนะนำ (Prefix `app.kubernetes.io/`):\n\n* **`app.kubernetes.io/name`**: ชื่อแอปพลิเคชัน (เช่น `mysql`, `wordpress`, `frontend`)\n* **`app.kubernetes.io/instance`**: ชื่ออินสแตนซ์ของแอปพลิเคชันที่นำไปใช้งาน (เช่น `mysql-primary`, `wp-blog`)\n* **`app.kubernetes.io/version`**: เวอร์ชันของแอปพลิเคชันหรือแพ็กเกจ (เช่น `5.7.21`, `v1.2.0`)\n* **`app.kubernetes.io/component`**: ส่วนประกอบภายในสถาปัตยกรรม (เช่น `database`, `worker`, `cache`)\n* **`app.kubernetes.io/part-of`**: ชื่อของระบบหรือแพลตฟอร์มภาพรวมที่แอปพลิเคชันนี้สังกัดอยู่ (เช่น `e-commerce-system`)\n* **`app.kubernetes.io/managed-by`**: เครื่องมือที่ใช้ควบคุมหรือติดตั้งออบเจกต์นี้ (เช่น `helm`, `argocd`, `kustomize`)"
      },
      {
        "id": "label-selectors",
        "headingEn": "Label Selectors: Equality-based vs Set-based",
        "headingTh": "ตัวเลือกเลเบล (Label Selectors): Equality-based และ Set-based",
        "contentMarkdown": "ความสามารถที่แท้จริงของเลเบลเกิดขึ้นเมื่อทำงานร่วมกับ **Label Selector** ซึ่งเป็นกลไกหลักที่ Kubernetes ใช้ในการค้นหาและจับคู่ออบเจกต์ (เช่น Service หา Pods เพื่อส่งทราฟฟิก หรือ ReplicaSet ควบคุม Pods ในสังกัด):\n\n### 1. Equality-based Requirements (การเปรียบเทียบตามความเท่ากัน)\nรองรับตัวดำเนินการ 3 ชนิด: `=`, `==` (เท่ากับ) และ `!=` (ไม่เท่ากับ)\n* ตัวอย่าง: `environment = production`, `tier != frontend`\n* นิยมใช้ในออบเจกต์ดั้งเดิม เช่น `spec.selector` ของ Service และ ReplicationController\n\n### 2. Set-based Requirements (การตรวจสอบตามกลุ่มสมาชิกของเซต)\nมีความยืดหยุ่นสูงกว่ามาก รองรับตัวดำเนินการ: `in`, `notin`, `exists` (ระบุแค่คีย์), และ `does not exist`:\n* `environment in (production, qa)`: มีเลเบล environment เป็น production หรือ qa\n* `tier notin (frontend, backend)`: ค่าของ tier ต้องไม่ใช่ frontend หรือ backend\n* `partition`: ต้องมีคีย์ partition ปรากฏอยู่ โดยไม่สนใจว่าจะมีค่าเป็นอะไร\n* `!partition`: ต้องไม่มีคีย์ partition ปรากฏอยู่\n\nโครงสร้างในไฟล์ Manifest มักแบ่งเป็น `matchLabels` (แบบ Equality) และ `matchExpressions` (แบบ Set-based):",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "selector-example.yaml",
            "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: redis-cache\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: redis\n    matchExpressions:\n      - { key: tier, operator: In, values: [cache, memory] }\n      - { key: environment, operator: NotIn, values: [dev] }\n  template:\n    metadata:\n      labels:\n        app: redis\n        tier: cache\n    spec:\n      containers:\n      - name: redis\n        image: redis:alpine"
          }
        ]
      },
      {
        "id": "annotations-overview",
        "headingEn": "Understanding Annotations",
        "headingTh": "การทำความเข้าใจแอนโนเทชัน (Annotations)",
        "contentMarkdown": "**Annotations (แอนโนเทชัน)** เป็นคู่ Key-Value ที่ผูกติดกับออบเจกต์เช่นเดียวกับเลเบล แต่ **ไม่ได้ออกแบบมาเพื่อใช้ในการคัดเลือกหรือจับคู่ออบเจกต์ (Non-identifying metadata)**\n\nข้อมูลใน Annotations สามารถมีขนาดใหญ่กว่าเลเบลมาก รองรับข้อความยาวๆ โครงสร้าง JSON หรือข้อมูลที่ไม่ได้มีโครงสร้างแน่นอน (Unstructured data) ซึ่งเครื่องมือภายนอก (Tools) หรือคอนโทรลเลอร์เฉพาะทางสามารถอ่านและนำไปประมวลผลได้\n\n### ตัวอย่างการใช้งาน Annotations ยอดนิยม:\n* **Ingress Controller Configuration**: กำหนดคอนฟิกของ NGINX Ingress เช่น `nginx.ingress.kubernetes.io/rewrite-target: /` หรือการเปิดใช้ SSL Redirect\n* **Git Commit & Build Information**: บันทึก Commit SHA, วันที่ Build หรืออีเมลของผู้ Deploy\n* **Service Mesh & Sidecar Injection**: ควบคุมการแทรก Envoy Proxy ของ Istio หรือ Linkerd เช่น `sidecar.istio.io/inject: \"true\"`\n* **การแจ้งเตือนและการจัดการสตอเรจ**: ข้อมูล Snapshot, Backup metadata, และการผูกทรัพยากรคลาวด์"
      },
      {
        "id": "labels-vs-annotations",
        "headingEn": "Labels vs Annotations Comparison",
        "headingTh": "ตารางเปรียบเทียบ: ข้อแตกต่างระหว่าง Labels และ Annotations",
        "contentMarkdown": "| คุณลักษณะ | Labels (เลเบล) | Annotations (แอนโนเทชัน) |\n| :--- | :--- | :--- |\n| **จุดประสงค์หลัก** | การระบุตัวตนและจัดหมวดหมู่ (Identifying) | การแนบข้อมูล Metadata เสริม (Non-identifying) |\n| **การ Query ด้วย Selector** | รองรับผ่าน Label Selectors เต็มรูปแบบ | **ไม่รองรับ** การค้นหาด้วย Selector |\n| **ข้อจำกัดความยาว** | ค่าความยาวไม่เกิน 63 ตัวอักษร | รองรับข้อความขนาดใหญ่ (จำกัดตามขนาด API Object) |\n| **การใช้งานหลัก** | Controller จับคู่ Pod, Service Route traffic | Config Ingress, บันทึก Git Commit, ควบคุม Tools |\n| **ผู้ใช้งานหลัก** | มนุษย์, Kubernetes Scheduling, Services | คอมไพเลอร์, ไลบรารี, ปลั๊กอิน, คอนโทรลเลอร์เฉพาะทาง |\n\n> [!WARNING]\n> กฎเหล็ก: หากข้อมูลนั้นต้องการให้ Controller หรือ Service นำไปค้นหา (Query/Filter) ต้องใช้ **Labels** แต่ถ้าเป็นเพียงข้อมูลอธิบายหรือคอนฟิกเฉพาะทางที่ไม่มีการ Query ให้ใช้ **Annotations**"
      },
      {
        "id": "cli-operations",
        "headingEn": "Working with Labels and Annotations via kubectl",
        "headingTh": "การจัดการเลเบลและแอนโนเทชันผ่าน kubectl",
        "contentMarkdown": "คำสั่ง CLI สำหรับการจัดการ Labels และ Annotations ที่พบบ่อยในการปฏิบัติงานและการสอบ CKA:\n\n* **ดูรายการ Pod พร้อมแสดงเลเบลทั้งหมด**:\n  `kubectl get pods --show-labels`\n\n* **ค้นหา Pod ตามเงื่อนไขของเลเบล (Filter)**:\n  `kubectl get pods -l 'environment in (production),tier=frontend'`\n\n* **เพิ่มเลเบลลงในพอดที่กำลังรันอยู่**:\n  `kubectl label pods web-server tier=frontend`\n\n* **แก้ไขเลเบลเดิมที่มีอยู่แล้ว (ต้องใส่ `--overwrite`)**:\n  `kubectl label pods web-server tier=backend --overwrite`\n\n* **ลบเลเบลออกจากพอด (ใส่เครื่องหมายขีดลบ `-` ต่อท้ายชื่อคีย์)**:\n  `kubectl label pods web-server tier-`\n\n* **เพิ่มหรือแก้ไข Annotation ให้กับพอด**:\n  `kubectl annotate pods web-server description=\"Primary Web Interface\"`"
      }
    ],
    "relatedLinks": [
      {
        "title": "Working with Kubernetes Objects",
        "targetType": "concepts",
        "targetPageId": "overview-working-with-objects",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/"
      },
      {
        "title": "Object Names, UIDs, and Namespaces",
        "targetType": "concepts",
        "targetPageId": "overview-names-uids-namespaces",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/names/"
      },
      {
        "title": "Assigning Pods to Nodes (Scheduling)",
        "targetType": "concepts",
        "targetPageId": "sched-assign-pod-node",
        "officialUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/"
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
