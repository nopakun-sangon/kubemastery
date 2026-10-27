/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/
 */
(function (root) {
  const pageData = {
  "id": "manage-kustomize-objects",
  "categoryId": "manage-objects",
  "categoryTitle": "Manage Kubernetes Objects",
  "titleEn": "Declarative Management of Kubernetes Objects Using Kustomize",
  "titleTh": "การจัดการอ็อบเจกต์แบบ Declarative ด้วย Kustomize",
  "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/",
  "docsPath": "/docs/tasks/manage-kubernetes-objects/kustomization/",
  "diagram": {
    "src": "images/docs/object-controller-loop.svg",
    "caption": "โครงสร้าง Kustomize: Base Manifests ผสานรวมกับ Overlays เพื่อปรับแต่งค่าตามสภาพแวดล้อมโดยไม่ต้องแก้ไขไฟล์ต้นฉบับ"
  },
  "lead": "เรียนรู้การจัดการอ็อบเจกต์ Kubernetes แบบ Declarative ไร้ Template Engine ด้วย Kustomize (เครื่องมือในตัวของ `kubectl -k`) เพื่อปรับแต่งค่าคอนฟิกตามสภาพแวดล้อม Development, Staging, และ Production ผ่านโครงสร้าง Base และ Overlays",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nKustomize เป็นเครื่องมือบริหารจัดการ Kubernetes Manifests แบบ Declarative โดยไม่ต้องพึ่งพา Template Engine (Template-free) ถูกรวมมาในตัว `kubectl` ผ่านแฟล็ก `-k` โดยใช้แนวคิดแยกโครงสร้างพื้นฐานร่วมกัน (Base) ออกจากส่วนปรับแต่งเฉพาะสภาพแวดล้อม (Overlays) ผ่านไฟล์ `kustomization.yaml` เพื่อลดความซ้ำซ้อนของโค้ด\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **สถาปัตยกรรม Base และ Overlays**:\n  * `base/`: เก็บไฟล์ Manifest กลางที่เป็นค่าตั้งต้นของทุกระบบ\n  * `overlays/development/` หรือ `overlays/production/`: อ้างอิงโฟลเดอร์ base แล้วกำหนดเฉพาะส่วนต่าง (Diff) เช่น ปรับจำนวน Replicas, เปลี่ยน Tag ของอิมเมจ, หรือเพิ่ม Resource Limits\n* **ฟิลด์สำคัญใน `kustomization.yaml`**:\n  * `resources`: ระบุรายการไฟล์ YAML หรือพาธ Base ที่นำมาใช้\n  * `patches` / `patchesStrategicMerge`: ส่วนแก้ไขค่าเฉพาะจุด\n  * `namespace`: กำหนดเนมสเปซให้กับทุกอ็อบเจกต์ที่ประกอบร่าง\n  * `namePrefix` / `nameSuffix`: เติมคำนำหน้าหรือต่อท้ายชื่ออ็อบเจกต์\n* **Generators พร้อม Hash ท้ายชื่อ**: `configMapGenerator` และ `secretGenerator` จะสร้างชื่ออ็อบเจกต์พร้อมแฮชเนื้อหา (เช่น `app-config-8f7d6a`) เพื่อบังคับให้เกิด Rolling Update อัตโนมัติเมื่อค่าคอนฟิกเปลี่ยน\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* **คำสั่งสำคัญที่ต้องจำ**:\n  * ดูผลลัพธ์การประกอบร่าง Pure YAML โดยไม่ต้อง Deploy: `kubectl kustomize ./overlays/production`\n  * สั่ง Deploy เข้าคลัสเตอร์ทันที: `kubectl apply -k ./overlays/production`\n  * สั่งลบอ็อบเจกต์ทั้งหมดที่จัดการด้วย Kustomize: `kubectl delete -k ./overlays/production`\n* **CKA/CKAD Focus**: ข้อสอบอาจให้โฟลเดอร์ที่มีไฟล์ `kustomization.yaml` มา แล้วสั่งให้นำไป Deploy ให้จำไว้ว่าต้องใช้แฟล็ก `-k` แทน `-f` (เช่น `kubectl apply -k <dir>`)\n* **ข้อดีเด่น**: ไม่ต้องติดตั้งเครื่องมือเสริม ไม่ต้องเรียนรู้ภาษา Template ที่ซับซ้อน และผลลัพธ์ทุกไฟล์ยังคงเป็น Valid Kubernetes YAML 100%",
  "sections": [
    {
      "id": "kustomize-philosophy-and-integration",
      "headingEn": "The Philosophy of Kustomize: Template-Free Customization",
      "headingTh": "ปรัชญาของ Kustomize: การปรับแต่งคอนฟิกโดยไม่ต้องพึ่งพา Template",
      "contentMarkdown": "### ปัญหาของ Template Engines แบบดั้งเดิม (เช่น Helm)\n\nในเครื่องมือจำพวก Template Engine ดั้งเดิม ไฟล์ YAML จะถูกแทรกด้วยไวยากรณ์พิเศษ เช่น `{{ .Values.replicaCount }}` หรือคำสั่งเงื่อนไข `if/else`\n* ทำให้ไฟล์ Manifest นั้นไม่ใช่ไฟล์ YAML ที่ถูกต้องตามหลักไวยากรณ์อีกต่อไป\n* ไม่สามารถใช้เครื่องมือ Linter หรือ Validator มาตรฐานตรวจสอบได้\n* สเกลซับซ้อนและเกิดความผิดพลาดในการเว้นวรรค (Indentation bugs) ได้ง่าย\n\n### แนวคิดของ Kustomize: Template-Free Configuration\n**Kustomize** นำเสนอแนวทางใหม่โดยยึดหลัก:\n1. **ไฟล์ Manifests ทุกตัวต้องเป็น Pure YAML 100%**: สามารถ `kubectl apply` ตรงๆ ได้ทันที\n2. **ไม่แก้ไขไฟล์ต้นฉบับ (Base)**: รักษาไฟล์ Base ให้อยู่นิ่ง (Immutable)\n3. **ใช้การปะทับแบบเลเยอร์ (Overlay Layering)**: สภาพแวดล้อมต่างๆ (Dev, Staging, Prod) จะเขียนเฉพาะไฟล์ Patch สั้นๆ เพื่อปรับแต่งค่าเฉพาะจุด\n\n> [!NOTE]\n> Kustomize ถูกรวมเข้ามาเป็นส่วนหนึ่งของ `kubectl` อย่างเป็นทางการตั้งแต่เวอร์ชัน 1.14 ขึ้นไป ทำให้คุณสามารถใช้งานได้ทันทีโดยไม่ต้องติดตั้งโปรแกรมอื่นเสริม ผ่านแฟล็ก **`kubectl -k`**",
      "codeBlocks": []
    },
    {
      "id": "anatomy-of-kustomization-yaml",
      "headingEn": "Anatomy of a kustomization.yaml File",
      "headingTh": "โครงสร้างและฟิลด์สำคัญใน kustomization.yaml",
      "contentMarkdown": "ไฟล์กำหนดการทำงานหลักของ Kustomize จะต้องตั้งชื่อว่า **`kustomization.yaml`** เสมอ\n\n### ฟิลด์คอนฟิกยอดนิยม:\n* **`resources`**: รายการไฟล์ YAML ที่ต้องการนำเข้ามาประมวลผล\n* **`commonLabels`**: เพิ่มเลเบลให้กับทุกอ็อบเจกต์และทุก Pod Selector โดยอัตโนมัติ\n* **`namespace`**: กำหนด Namespace เป้าหมายให้ทุกอ็อบเจกต์ในชุด\n* **`namePrefix` / `nameSuffix`**: เติมคำนำหน้าหรือต่อท้ายชื่ออ็อบเจกต์ เช่น เติม `dev-` เพื่อไม่ให้ชื่อชนกัน\n* **`configMapGenerator` / `secretGenerator`**: สั่งสร้าง ConfigMap หรือ Secret จากไฟล์ข้อความ พร้อมเติม Content Hash (เช่น `config-b89g95h`) ต่อท้ายชื่ออัตโนมัติ ซึ่งจะช่วยบังคับให้เกิด Rolling Update ทันทีเมื่อคอนฟิกมีการเปลี่ยนแปลง!",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "kustomization.yaml",
          "code": "apiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\n\nresources:\n- deployment.yaml\n- service.yaml\n\nnamespace: my-namespace\nnamePrefix: dev-\n\ncommonLabels:\n  app.kubernetes.io/managed-by: kustomize\n  environment: development\n\nconfigMapGenerator:\n- name: app-config\n  files:\n  - config.properties"
        }
      ]
    },
    {
      "id": "base-and-overlays-pattern",
      "headingEn": "Architectural Pattern: Base and Overlays",
      "headingTh": "รูปแบบสถาปัตยกรรม Base และ Overlays",
      "contentMarkdown": "โครงสร้างโฟลเดอร์มาตรฐานสำหรับการนำ Kustomize ไปใช้งานจริงในองค์กร:\n\n```\nmy-app/\n├── base/\n│   ├── deployment.yaml\n│   ├── service.yaml\n│   └── kustomization.yaml\n└── overlays/\n    ├── development/\n    │   ├── kustomization.yaml\n    │   └── patch-replicas.yaml\n    └── production/\n        ├── kustomization.yaml\n        └── patch-resources.yaml\n```\n\n### ตัวอย่าง `base/kustomization.yaml`:\n```yaml\napiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nresources:\n- deployment.yaml\n- service.yaml\n```\n\n### ตัวอย่าง `overlays/production/kustomization.yaml`:\n```yaml\napiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nresources:\n- ../../base\nnamePrefix: prod-\nreplicas:\n- name: my-app\n  count: 5\npatches:\n- path: patch-resources.yaml\n```",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "overlays/production/patch-resources.yaml",
          "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  template:\n    spec:\n      containers:\n      - name: app\n        resources:\n          limits:\n            cpu: \"2\"\n            memory: 4Gi\n          requests:\n            cpu: \"500m\"\n            memory: 1Gi"
        }
      ]
    },
    {
      "id": "building-and-deploying-with-kubectl",
      "headingEn": "Building and Deploying with kubectl -k",
      "headingTh": "คำสั่งประกอบร่าง (Build) และ Deploy สู่คลัสเตอร์",
      "contentMarkdown": "### 1. ดูผลลัพธ์การประกอบร่างโดยไม่ต้อง Deploy (Dry Build)\nก่อนสั่งส่งเข้าคลัสเตอร์ คุณสามารถดูผลรวมของ YAML ทั้งหมดที่ถูก Kustomize ผสานเรียบร้อยแล้ว:\n```bash\nkubectl kustomize ./overlays/production\n```\nคำสั่งนี้จะพิมพ์เนื้อหา Pure YAML ออกมาทางหน้าจอ เพื่อให้คุณตรวจสอบความถูกต้องของ Labels, Names, และ Resources\n\n### 2. สั่ง Deploy เข้าคลัสเตอร์จริง\nสั่งประยุกต์ใช้ผ่านแฟล็ก `-k` (ซึ่งย่อมาจาก Kustomize):\n```bash\nkubectl apply -k ./overlays/production\n```\n\n### 3. สั่งลบทรัพยากรทั้งหมดในชุดเดียวกัน\n```bash\nkubectl delete -k ./overlays/development\n```",
      "codeBlocks": []
    },
    {
      "id": "best-practices-and-pitfalls",
      "headingEn": "Kustomize Best Practices and Secret Management",
      "headingTh": "แนวทางปฏิบัติที่ดีที่สุดและการจัดการข้อมูลความลับ (Secrets)",
      "contentMarkdown": "### 1. การจัดการ Secrets ผ่าน secretGenerator\nอย่าบันทึกไฟล์ Secret YAML ดิบลงใน Git repository แต่ให้ใช้ `secretGenerator` ร่วมกับเครื่องมือเข้ารหัส เช่น **SealedSecrets**, **SOPS**, หรือดึงค่าจาก Environment Variables:\n```yaml\nsecretGenerator:\n- name: db-secret\n  envs:\n  - .env.secret\n```\n\n### 2. การเปลี่ยน Image Tag ใน CI/CD Pipeline\nในระบบอัตโนมัติ คุณสามารถสั่งอัปเดต Image Tag ใน `kustomization.yaml` ได้โดยไม่ต้องแก้ไขไฟล์เอง:\n```bash\ncd overlays/production\nkustomize edit set image my-app=my-registry.com/app:v2.1.0\n```\nคำสั่งนี้จะอัปเดตฟิลด์ `images:` ใน `kustomization.yaml` อย่างแม่นยำ พร้อมสำหรับการ Commit ขึ้น Git ต่อไป"
    }
  ],
  "relatedLinks": [
    {
      "title": "Declarative and Imperative Management of Objects",
      "targetType": "tasks",
      "targetPageId": "manage-declarative-imperative",
      "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/"
    },
    {
      "title": "Update API Objects in Place Using kubectl patch",
      "targetType": "tasks",
      "targetPageId": "manage-kubectl-patch",
      "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/"
    },
    {
      "title": "Configure a Pod to Use a ConfigMap",
      "targetType": "tasks",
      "targetPageId": "inject-configmap",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/"
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
