/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/
 */
(function (root) {
  const pageData = {
  "id": "manage-declarative-imperative",
  "categoryId": "manage-objects",
  "categoryTitle": "Manage Kubernetes Objects",
  "titleEn": "Declarative Management of Kubernetes Objects Using Configuration Files",
  "titleTh": "การจัดการอ็อบเจกต์แบบ Declarative และ Imperative",
  "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/",
  "docsPath": "/docs/tasks/manage-kubernetes-objects/declarative-config/",
  "diagram": {
    "src": "images/docs/object-controller-loop.svg",
    "caption": "เปรียบเทียบแนวทางการจัดการ Kubernetes Objects: Imperative Commands vs Imperative Config vs Declarative Config"
  },
  "lead": "เปรียบเทียบแนวทางการบริหารจัดการอ็อบเจกต์ Kubernetes 3 รูปแบบหลัก: Imperative Commands, Imperative Object Configuration, และ Declarative Object Configuration พร้อมเจาะลึกกลไก Three-Way Merge ของ `kubectl apply`",
  "sections": [
    {
      "id": "three-management-techniques",
      "headingEn": "Comparison: Three Object Management Techniques",
      "headingTh": "ภาพรวมและเปรียบเทียบแนวทางบริหารจัดการทั้ง 3 รูปแบบ",
      "contentMarkdown": "การสั่งการและสร้างอ็อบเจกต์ใน Kubernetes สามารถทำได้ 3 แนวทาง ซึ่งมีข้อดีและข้อจำกัดแตกต่างกัน:\n\n### 1. Imperative Commands (คำสั่งสั่งการโดยตรง)\n* ผู้ใช้สั่งการผ่านคำสั่งเดียวจบ เช่น `kubectl run`, `kubectl create deployment`, `kubectl scale`\n* **ข้อดี**: รวดเร็ว พิมพ์สั้น เหมาะกับการทดสอบด่วนในห้องสอบ CKA/CKAD\n* **ข้อเสีย**: ไม่มีการจัดเก็บบันทึกประวัติ (No Audit Trail) ตรวจสอบย้อนหลังไม่ได้ว่าใครแก้ค่าอะไร\n\n### 2. Imperative Object Configuration (การสั่งการผ่านไฟล์อ็อบเจกต์)\n* ผู้ใช้เขียนไฟล์ YAML แต่ระบุชัดเจนด้วยคำสั่งเชิงกริยา เช่น `kubectl create -f nginx.yaml`, `kubectl replace -f nginx.yaml`, `kubectl delete -f nginx.yaml`\n* **ข้อดี**: มีไฟล์คอนฟิกเก็บใน Git ตรวจสอบสเปกได้\n* **ข้อเสีย**: ผู้ใช้ต้องเป็นคนตัดสินใจเองว่าจะ `create` หรือ `replace` ไม่สามารถนำไปรันอัตโนมัติใน CI/CD ไปป์ไลน์แบบ idempotent ได้อย่างราบรื่น\n\n### 3. Declarative Object Configuration (การจัดการตามสถานะพึงประสงค์)\n* ผู้ใช้เพียงระบุสถานะที่ต้องการ (Desired State) ในโฟลเดอร์ของไฟล์ YAML แล้วสั่งคำสั่งเดียว:\n  `kubectl apply -f <directory>/`\n* คอนโทรลเลอร์จะเปรียบเทียบความแตกต่างระหว่างไฟล์กับ Live Object ในคลัสเตอร์ และทำการอัปเดตเฉพาะส่วนที่เปลี่ยนให้ตรงกันโดยอัตโนมัติ\n* **มาตรฐานระดับองค์กรและพื้นฐานของแนวคิด GitOps!**",
      "codeBlocks": []
    },
    {
      "id": "declarative-workflow-with-kubectl-apply",
      "headingEn": "Declarative Workflow with kubectl apply",
      "headingTh": "เวิร์กโฟลว์การทำงานแบบ Declarative ด้วย kubectl apply",
      "contentMarkdown": "### 1. การประยุกต์ใช้กับไดเรกทอรีทั้งชุด\nคุณสามารถจัดเก็บไฟล์ Manifests ทั้งหมดไว้ในโฟลเดอร์เดียว แล้วสั่ง Apply ทั้งหมดในคำสั่งเดียว:\n```bash\nkubectl apply -f ./configs/\n```\n\n### 2. การสั่งแบบค้นหาโฟลเดอร์ย่อย (Recursive Mode)\nหากคุณแบ่งแยกโฟลเดอร์ตามโมดูล ให้ใส่แฟล็ก `-R` หรือ `--recursive`:\n```bash\nkubectl apply -R -f ./manifests/\n```\n\n### 3. การตรวจสอบความแตกต่างก่อนนำไปใช้งานจริง (Dry-Run & Diff)\nก่อนจะปล่อยคอนฟิกลง Production คุณสามารถดูการเปลี่ยนแปลงได้อย่างปลอดภัย:\n```bash\n# แสดงผลต่าง (Unified Diff) ระหว่างไฟล์ในเครื่องกับสถานะปัจจุบันในคลัสเตอร์\nkubectl diff -f ./configs/\n\n# ทดสอบรันการประเมินผลบน API Server โดยไม่บันทึกจริง\nkubectl apply -f ./configs/ --dry-run=server\n```",
      "codeBlocks": []
    },
    {
      "id": "three-way-merge-deep-dive",
      "headingEn": "Three-Way Merge Patch Deep Dive",
      "headingTh": "เจาะลึกกลไก Three-Way Merge ของ kubectl apply",
      "contentMarkdown": "### กลไก Three-Way Merge ทำงานอย่างไร?\n\nเมื่อคุณสั่ง `kubectl apply -f my-app.yaml` ระบบไม่ได้เพียงแค่นำไฟล์บนเครื่องไปทับสถานะในคลัสเตอร์ แต่จะทำการคำนวณจาก **ข้อมูล 3 แหล่ง (Three-Way Merge)**:\n\n1. **Original Configuration (ค่าเดิมที่เคย Apply ครั้งก่อน)**:\n   ถูกเก็บไว้ใน Annotation พิเศษบนอ็อบเจกต์:\n   `kubectl.kubernetes.io/last-applied-configuration`\n2. **Live State (สถานะปัจจุบันที่รันอยู่ใน etcd)**:\n   รวมถึงฟิลด์ที่ระบบอื่น (เช่น Admission Webhook หรือ Autoscaler) เพิ่มเข้ามา\n3. **New Configuration (ไฟล์ใหม่บนเครื่องที่คุณกำลังสั่ง Apply)**\n\n### ทำไม Three-Way Merge จึงเป็นหัวใจสำคัญ?\nสมมติว่าคุณมี Deployment ที่ตั้งค่า `replicas: 2` ในไฟล์ YAML แต่ต่อมา **Horizontal Pod Autoscaler (HPA)** ได้ทำการสเกลพอดในคลัสเตอร์ขึ้นเป็น 5 Replicas\n* หากใช้คำสั่ง `kubectl replace -f` ตัวระบบจะบังคับย้อนค่า Replicas กลับไปเป็น 2 ทันที (ค่าที่ HPA สเกลไว้จะถูก Overwrite หายไป)\n* แต่เมื่อใช้ `kubectl apply` กลไก Three-Way Merge จะตรวจสอบว่าคุณไม่ได้แก้ไขค่า Replicas ในไฟล์รอบใหม่นี้ ดังนั้นระบบจะยอมให้คงค่า Replicas 5 ตัวของ HPA ไว้ตามเดิม และอัปเดตเฉพาะฟิลด์อื่นๆ ที่คุณแก้ไขจริงเท่านั้น!",
      "codeBlocks": []
    },
    {
      "id": "managing-object-deletion-prune",
      "headingEn": "Automated Object Deletion with --prune",
      "headingTh": "การลบอ็อบเจกต์ที่ถูกคัดออกด้วยแฟล็ก --prune",
      "contentMarkdown": "ตามปกติ หากคุณลบไฟล์ YAML ตัวใดตัวหนึ่งออกจากโฟลเดอร์ แล้วสั่ง `kubectl apply -f ./configs/` คำสั่ง apply จะ **ไม่ลบอ็อบเจกต์ตัวนั้นออกจากคลัสเตอร์**\n\n### การเปิดใช้งานระบบเก็บกวาดอ็อบเจกต์อัตโนมัติ (`--prune`)\nหากต้องการให้ Kubernetes ลบอ็อบเจกต์ที่ไม่มีอยู่ในโฟลเดอร์ไฟล์ YAML ออกจากคลัสเตอร์โดยอัตโนมัติ:\n```bash\nkubectl apply -f ./configs/ --prune -l app.kubernetes.io/part-of=my-service\n```\n\n> [!CAUTION]\n> **ข้อควรระวังขั้นสูงในการใช้ `--prune`**:\n> คุณ **ต้องระบุ Label Selector (`-l`) เสมอ** เมื่อใช้ `--prune` หากไม่ใส่ตัวกรอง เลเบล Kubernetes อาจเข้าใจผิดและสั่งลบอ็อบเจกต์ประเภทอื่นๆ ทั่วทั้ง Namespace ที่ไม่มีอยู่ในโฟลเดอร์ของคุณทิ้งทั้งหมด!",
      "codeBlocks": []
    },
    {
      "id": "tradeoffs-and-best-practices",
      "headingEn": "Tradeoffs and Operational Best Practices",
      "headingTh": "ข้อดี ข้อเสีย และข้อพึงระวังในการปฏิบัติงานจริง",
      "contentMarkdown": "### กฎเหล็กในการปฏิบัติงาน: ห้ามสลับกระบวนการไปมา!\n> [!CRITICAL]\n> **อย่าสลับไปมาระหว่าง Imperative Replace และ Declarative Apply บนอ็อบเจกต์เดียวกัน!**\n> หากคุณใช้ `kubectl replace` หรือ `kubectl edit` บันทึกทับ Annotation `last-applied-configuration` จะไม่ได้รับการคำนวณอย่างถูกต้อง ส่งผลให้การสั่ง `kubectl apply` ในรอบถัดไปอาจไม่สามารถลบฟิลด์ที่ต้องการลบออกได้\n\n### สรุปคำแนะนำในการเลือกใช้:\n* **การสอบ CKA/CKAD / งานดีบักฉุกเฉิน**: ใช้ **Imperative Commands** เพื่อความรวดเร็ว เช่น `kubectl create deploy --image=nginx --dry-run=client -o yaml > deploy.yaml`\n* **การพัฒนาและสภาพแวดล้อม Production**: ใช้ **Declarative Configuration** ร่วมกับ Version Control (Git) และเครื่องมือ GitOps (เช่น ArgoCD หรือ Flux) เสมอ"
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
      "title": "Update API Objects in Place Using kubectl patch",
      "targetType": "tasks",
      "targetPageId": "manage-kubectl-patch",
      "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/"
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
