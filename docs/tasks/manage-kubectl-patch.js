/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/
 */
(function (root) {
  const pageData = {
  "id": "manage-kubectl-patch",
  "categoryId": "manage-objects",
  "categoryTitle": "Manage Kubernetes Objects",
  "titleEn": "Update API Objects in Place Using kubectl patch",
  "titleTh": "การอัปเดตอ็อบเจกต์หน้างานด้วยคำสั่ง kubectl patch",
  "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/",
  "docsPath": "/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/",
  "diagram": {
    "src": "images/docs/object-controller-loop.svg",
    "caption": "กลไกการ Patch อ็อบเจกต์ของ Kubernetes: Strategic Merge Patch, JSON Merge Patch และ JSON Patch"
  },
  "lead": "คู่มือการแก้ไขและอัปเดตฟิลด์ของ Kubernetes API Objects แบบเฉพาะจุด (In-place Update) ด้วยคำสั่ง `kubectl patch` พร้อมเจาะลึกความแตกต่างระหว่าง 3 กลยุทธ์การ Patch: Strategic Merge Patch, JSON Merge Patch, และ JSON Patch (RFC 6902)",
  "sections": [
    {
      "id": "when-to-use-kubectl-patch",
      "headingEn": "Why and When to Use kubectl patch",
      "headingTh": "ทำไมต้องใช้ kubectl patch? และเมื่อไหร่ควรใช้",
      "contentMarkdown": "### เปรียบเทียบเครื่องมืออัปเดตอ็อบเจกต์ใน Kubernetes\n\nเมื่อต้องการแก้ไขอ็อบเจกต์ที่กำลังทำงานอยู่ในคลัสเตอร์:\n* **`kubectl edit`**: เปิดหน้าต่าง Text Editor (เช่น Vim หรือ Nano) ให้ผู้ใช้แก้ไขด้วยตนเอง - เหมาะกับมนุษย์แก้ไขเฉพาะหน้า แต่ไม่สามารถนำไปใส่ในสคริปต์อัตโนมัติได้\n* **`kubectl apply`**: ต้องมีไฟล์ Manifest ครบถ้วนทั้งชุด - เทอะทะหากต้องการเปลี่ยนเพียงค่าเดียว\n* **`kubectl patch`**: ส่งคำสั่งแก้ไขเฉพาะฟิลด์เป้าหมายในบรรทัดเดียว (One-Liner) - **เหมาะที่สุดสำหรับ CI/CD Automation, Shell Scripts, และการกู้สถานการณ์ฉุกเฉิน**\n\n### 3 กลยุทธ์ในการ Patch (Patch Strategies)\nKubernetes รองรับกลยุทธ์การ Patch 3 รูปแบบ ซึ่งมีพฤติกรรมต่อ List/Array ต่างกันสิ้นเชิง:\n1. **Strategic Merge Patch** (ค่าเริ่มต้น)\n2. **JSON Merge Patch** (ตามมาตรฐาน RFC 7396)\n3. **JSON Patch** (ตามมาตรฐาน RFC 6902)",
      "codeBlocks": []
    },
    {
      "id": "strategy-1-strategic-merge-patch",
      "headingEn": "Strategy 1: Strategic Merge Patch (Default)",
      "headingTh": "กลยุทธ์ที่ 1: Strategic Merge Patch (ค่าเริ่มต้น)",
      "contentMarkdown": "**Strategic Merge Patch** คือกลยุทธ์อัจฉริยะที่ Kubernetes สร้างขึ้นเอง โดยตัว API Server จะเข้าใจโครงสร้างของ Kubernetes Objects:\n* รู้ว่าฟิลด์ประเภท List ตัวไหนควรทำการ **\"Merge (ผสาน)\"** หรือควรทำการ **\"Replace (แทนที่)\"**\n* ในกรณีของ List ที่มี Struct ซับซ้อน เช่น รายการคอนเทนเนอร์ใน `spec.template.spec.containers` ตัว Kubernetes จะใช้ฟิลด์ **`name`** เป็น Patch Key (ตัวระบุตัวตน)\n\n### ตัวอย่างการทดสอบ:\nสร้าง Deployment ที่มีคอนเทนเนอร์ 2 ตัว:\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: patch-demo\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: patch-demo\n  template:\n    metadata:\n      labels:\n        app: patch-demo\n    spec:\n      containers:\n      - name: patch-demo-ctr-1\n        image: redis\n      - name: patch-demo-ctr-2\n        image: nginx\n```\n\nสั่งอัปเดต Image ของเฉพาะคอนเทนเนอร์ `patch-demo-ctr-2` ให้เป็น `nginx:alpine`:\n```bash\nkubectl patch deployment patch-demo --patch '\nspec:\n  template:\n    spec:\n      containers:\n      - name: patch-demo-ctr-2\n        image: nginx:alpine\n'\n```\nผลลัพธ์: คอนเทนเนอร์ `patch-demo-ctr-1` ที่เป็น `redis` จะยังคงอยู่เหมือนเดิมอย่างปลอดภัย ระบบจะอัปเดตเฉพาะ `patch-demo-ctr-2` เท่านั้น!",
      "codeBlocks": []
    },
    {
      "id": "strategy-2-json-merge-patch",
      "headingEn": "Strategy 2: JSON Merge Patch (RFC 7396)",
      "headingTh": "กลยุทธ์ที่ 2: JSON Merge Patch (RFC 7396)",
      "contentMarkdown": "เปิดใช้งานโดยระบุแฟล็ก: **`--type='merge'`**\n\n### พฤติกรรมต่อ List ของ JSON Merge Patch\nตามมาตรฐาน RFC 7396 หากคุณส่งข้อมูลฟิลด์ที่เป็น List หรือ Array ระบบจะ **เขียนทับ (Overwrite) List เดิมทั้งหมด** ไม่ทำการผสานตามชื่อ:\n* หากคุณใช้ JSON Merge Patch กับตัวอย่างด้านบนโดยระบุเฉพาะ `patch-demo-ctr-2` คอนเทนเนอร์ `patch-demo-ctr-1` **จะถูกลบทิ้งทันที!**\n\n### กรณีการใช้งานที่เหมาะสมของ JSON Merge Patch:\n1. **การ Patch บน Custom Resource Definitions (CRDs)**: เนื่องจาก CRD ทั่วไปไม่มี Go Struct Schema ระบุ Patch Key จึงต้องใช้ JSON Merge Patch\n2. **การลบฟิลด์ออกจากอ็อบเจกต์ (Delete Field)**: ทำได้ง่ายๆ โดยการกำหนดค่าฟิลด์นั้นให้เป็น `null`\n\n### ตัวอย่าง: การลบ Finalizer ที่ติดค้าง\n```bash\nkubectl patch namespace stuck-namespace -p '{\"metadata\":{\"finalizers\":null}}' --type='merge'\n```",
      "codeBlocks": []
    },
    {
      "id": "strategy-3-json-patch-rfc6902",
      "headingEn": "Strategy 3: JSON Patch (RFC 6902)",
      "headingTh": "กลยุทธ์ที่ 3: JSON Patch (RFC 6902)",
      "contentMarkdown": "เปิดใช้งานโดยระบุแฟล็ก: **`--type='json'`**\n\nJSON Patch ทำงานโดยการส่ง Array ของคำสั่งระบุ Operation เจาะจงตามมาตรฐาน RFC 6902:\n* `op: add` (เพิ่มข้อมูลใหม่)\n* `op: replace` (แทนที่ข้อมูลเดิม)\n* `op: remove` (ลบข้อมูลออก)\n* `op: test` (ตรวจสอบค่าเดิมก่อน หากไม่ตรงจะปฏิเสธการ Patch เพื่อป้องกัน Race Condition)\n\nตำแหน่งของฟิลด์จะถูกอ้างอิงด้วย **JSON Pointer Path** เช่น `/spec/replicas` หรืออ้างอิงลำดับใน Array เช่น `/spec/template/spec/containers/0/image`\n\n### ตัวอย่างที่ 1: ปรับ Replicas และเพิ่ม NodeSelector\n```bash\nkubectl patch deployment patch-demo --type='json' -p='[\n  {\"op\": \"replace\", \"path\": \"/spec/replicas\", \"value\": 4},\n  {\"op\": \"add\", \"path\": \"/spec/template/spec/nodeSelector\", \"value\": {\"disktype\": \"ssd\"}}\n]'\n```\n\n### ตัวอย่างที่ 2: ลบ Limit ทรัพยากรของ Container ตัวแรก\n```bash\nkubectl patch deployment patch-demo --type='json' -p='[\n  {\"op\": \"remove\", \"path\": \"/spec/template/spec/containers/0/resources/limits\"}\n]'\n```",
      "codeBlocks": []
    },
    {
      "id": "practical-recipes-and-pitfalls",
      "headingEn": "Production Patch Recipes and Critical Pitfalls",
      "headingTh": "รวมสูตรคำสั่งยอดนิยมและข้อควรระวังใน Production",
      "contentMarkdown": "### รวมสูตรลัดที่ใช้บ่อยใน Production:\n\n1. **เพิ่ม Taint ให้กับ Worker Node ผ่าน Patch**:\n   ```bash\n   kubectl patch node worker-01 -p '{\"spec\":{\"taints\":[{\"key\":\"dedicated\",\"value\":\"gpu\",\"effect\":\"NoSchedule\"}]}}'\n   ```\n\n2. **เปิดการใช้งาน HostNetwork บนพอด**:\n   ```bash\n   kubectl patch pod my-pod -p '{\"spec\":{\"hostNetwork\":true}}'\n   ```\n\n3. **แก้ไข Type ของ Service ให้เป็น LoadBalancer**:\n   ```bash\n   kubectl patch svc web-service -p '{\"spec\":{\"type\":\"LoadBalancer\"}}'\n   ```\n\n> [!CAUTION]\n> **ระวังการระบุ Array Index ใน JSON Patch**:\n> การใช้พาทเช่น `/spec/template/spec/containers/0/image` มีความเสี่ยงสูงหากลำดับของคอนเทนเนอร์ในคลัสเตอร์มีการเปลี่ยนแปลง (เช่น จากการทำงานของ Mutation Webhook หรือการเพิ่ม Sidecar) คำสั่งอาจไปเปลี่ยน Image ของผิดคอนเทนเนอร์ได้! หากเป็นไปได้ควรใช้ Strategic Merge Patch เป็นลำดับแรก"
    }
  ],
  "relatedLinks": [
    {
      "title": "Declarative Management of Objects Using Kustomize",
      "targetType": "tasks",
      "targetPageId": "manage-kustomize-objects",
      "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/"
    },
    {
      "title": "Declarative and Imperative Management of Objects",
      "targetType": "tasks",
      "targetPageId": "manage-declarative-imperative",
      "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/"
    },
    {
      "title": "Working with Kubernetes Objects",
      "targetType": "concepts",
      "targetPageId": "overview-working-with-objects",
      "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/"
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
