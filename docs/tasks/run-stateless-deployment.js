/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/
 */
(function (root) {
  const pageData = {
  "id": "run-stateless-deployment",
  "categoryId": "run-applications",
  "categoryTitle": "Run Applications",
  "titleEn": "Run a Stateless Application Using a Deployment",
  "titleTh": "การรันแอปพลิเคชันแบบ Stateless ด้วย Deployment",
  "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/",
  "docsPath": "/docs/tasks/run-application/run-stateless-application-deployment/",
  "diagram": {
    "src": "images/docs/workload-controllers-hierarchy.svg",
    "caption": "การควบคุมเวิร์กโหลด: Deployment สร้างและดูแลจัดการ ReplicaSet เพื่อควบคุม Pods แบบไร้สถานะ"
  },
  "lead": "เรียนรู้วิธีการกำหนดค่าและบริหารจัดการแอปพลิเคชันแบบไร้สถานะ (Stateless Application) ผ่าน Kubernetes Deployment Object ตั้งแต่การสร้าง Pods, การตรวจสอบสถานะการทำงาน, การขยายขนาด (Scaling), การอัปเดตเวอร์ชันซอฟต์แวร์โดยไม่มี Downtime (Rolling Update) ไปจนถึงการย้อนกลับเวอร์ชัน (Rollback)",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nDeployment เป็นคอนโทรลเลอร์มาตรฐานสำหรับบริหารจัดการแอปพลิเคชันแบบไร้สถานะ (Stateless Applications) โดยทำหน้าที่ควบคุม ReplicaSet เพื่อรับประกันจำนวนพอดที่ต้องการ และดูแลกระบวนการอัปเดตเวอร์ชันซอฟต์แวร์แบบ Rolling Update โดยไม่เกิด Downtime พร้อมความสามารถในการย้อนกลับเวอร์ชัน (Rollback) ทันทีเมื่อเกิดปัญหา\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **ธรรมชาติของ Stateless Application**: พอดทุกตัวสามารถทดแทนกันได้สมบูรณ์ หากพอดตัวใดหยุดทำงาน คอนโทรลเลอร์จะสร้างตัวใหม่ขึ้นมาทดแทนทันทีโดยข้อมูลส่วนรวมไม่สูญหาย\n* **ลำดับชั้นการทำงาน**: Deployment -> ReplicaSet -> Pods (Deployment จะไม่สั่งสร้างพอดโดยตรง แต่จะสั่งผ่าน ReplicaSet)\n* **กลยุทธ์การอัปเดต (RollingUpdate)**: ค่อยๆ สร้างพอดเวอร์ชันใหม่ขึ้นมาควบคู่กับการทยอยทำลายพอดเวอร์ชันเก่า ควบคุมผ่าน 2 พารามิเตอร์:\n  * `maxSurge`: จำนวนพอดสูงสุดที่อนุญาตให้มีเกินเป้าหมายได้ระหว่างอัปเดต (เช่น `25%` หรือ `1`)\n  * `maxUnavailable`: จำนวนพอดสูงสุดที่ยอมให้หยุดทำงานพร้อมกันได้ระหว่างอัปเดต (เช่น `25%` หรือ `0`)\n* **การจัดการ Revision**: ทุกครั้งที่มีการเปลี่ยนแปลง Pod Template ใน Deployment ระบบจะบันทึก Revision ใหม่ลงในประวัติ Rollout ทำให้ Rollback กลับได้เสมอ\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* **คำสั่งลัด CLI ที่ต้องจำให้แม่น**:\n  * สร้าง Deployment: `kubectl create deployment web --image=nginx:1.25 --replicas=3`\n  * ปรับขยายขนาด: `kubectl scale deployment web --replicas=5`\n  * เปลี่ยนเวอร์ชันอิมเมจ: `kubectl set image deployment/web nginx=nginx:1.26`\n  * ตรวจสอบสถานะการอัปเดต: `kubectl rollout status deployment/web`\n  * ดูประวัติ Revision: `kubectl rollout history deployment/web`\n  * ถอยกลับเวอร์ชัน: `kubectl rollout undo deployment/web` (หรือ `--to-revision=2`)\n  * สั่งรีสตาร์ตพอดทั้งหมดแบบ Graceful: `kubectl rollout restart deployment/web`\n* **ข้อควรระวังในห้องสอบ**: เลเบลใน `spec.selector.matchLabels` ต้องตรงกับ `spec.template.metadata.labels` เสมอ หากไม่ตรง API Server จะปฏิเสธไฟล์ Manifest",
  "sections": [
    {
      "id": "stateless-architecture-and-creating-deployment",
      "headingEn": "Stateless Applications & Creating a Deployment",
      "headingTh": "แอปพลิเคชันแบบ Stateless และการสร้าง Deployment",
      "contentMarkdown": "### ทำความเข้าใจแอปพลิเคชันแบบ Stateless บน Kubernetes\n\n**Stateless Application (แอปพลิเคชันไร้สถานะ)** คือแอปพลิเคชันที่ไม่จำเป็นต้องผูกติดกับดิสก์หรือที่เก็บข้อมูลเฉพาะตัวของพอดใดพอดหนึ่ง แต่ละพอดสามารถรับคำขอ (Request) จากไคลเอนต์แทนกันได้อย่างสมบูรณ์แบบ หากพอดตัวใดตัวหนึ่งหยุดทำงาน คอนโทรลเลอร์สามารถสร้างพอดตัวใหม่ขึ้นมาทดแทนได้ทันทีโดยไม่สูญเสียข้อมูล ตัวอย่างของเวิร์กโหลดแบบนี้ ได้แก่ Web Frontends (เช่น NGINX, Apache), RESTful API Services, และ Microservices ที่ส่งข้อมูลไปจัดเก็บที่ฐานข้อมูลภายนอก (External Databases)\n\nKubernetes มอบ **Deployment Controller** มาทำหน้าที่จัดการวงจรชีวิตของแอปพลิเคชันแบบ Stateless อย่างเป็นระบบ โดย Deployment จะประกาศสร้างและควบคุม **ReplicaSet** ในเบื้องหลัง และ ReplicaSet จะดูแลจำนวนพอดให้อยู่ในสถานะที่ต้องการ (Desired State) เสมอ\n\n### การประกาศสร้าง Deployment\n\nสร้างไฟล์ Manifest ชื่อ `nginx-deployment.yaml` ดังตัวอย่างด้านล่าง:\n* `replicas: 2`: สั่งให้รันพอด NGINX จำนวน 2 อินสแตนซ์พร้อมกัน\n* `selector.matchLabels`: กฎสำหรับ Deployment ในการจับคู่พอดที่อยู่ภายใต้การควบคุม โดยในที่นี้คือเลเบล `app: nginx`\n* `template.metadata.labels`: เลเบลที่ติดให้กับพอดใหม่ทุกลูก ต้องตรงกับ `matchLabels` เสมอ\n* `spec.containers`: กำหนดคอนเทนเนอร์ `nginx` ที่ใช้อิมเมจ `nginx:1.14.2` และเปิดรับทราฟฟิกบนพอร์ต 80\n\nนำไฟล์เข้าสู่คลัสเตอร์ด้วยคำสั่ง:\n```bash\nkubectl apply -f nginx-deployment.yaml\n```\n\n> [!NOTE]\n> คุณสามารถสร้าง Deployment ได้โดยตรงจาก URL ตัวอย่างของ Kubernetes ทางการ:\n> `kubectl apply -f https://k8s.io/examples/application/deployment.yaml`",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "nginx-deployment.yaml",
          "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx-deployment\n  labels:\n    app: nginx\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: nginx\n  template:\n    metadata:\n      labels:\n        app: nginx\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:1.14.2\n        ports:\n        - containerPort: 80"
        }
      ]
    },
    {
      "id": "inspecting-deployment-status",
      "headingEn": "Inspecting Deployment and Pods Status",
      "headingTh": "การตรวจสอบสถานะของ Deployment และ Pods",
      "contentMarkdown": "หลังสั่ง Apply เรียบร้อยแล้ว ให้ตรวจสอบสถานะของทรัพยากรที่ถูกสร้างขึ้นในคลัสเตอร์ด้วยคำสั่งต่อไปนี้:\n\n1. **ตรวจสอบภาพรวมของ Deployment**:\n   ```bash\n   kubectl get deployments\n   ```\n   ผลลัพธ์จะแสดงคอลัมน์สำคัญ:\n   * `READY`: จำนวนพอดที่พร้อมใช้งานจริงเทียบกับจำนวนที่ต้องการ (เช่น `2/2`)\n   * `UP-TO-DATE`: จำนวนพอดที่ได้รับการอัปเดตตรงตามเวอร์ชันสเปกล่าสุด\n   * `AVAILABLE`: จำนวนพอดที่พร้อมรับทราฟฟิกจากผู้ใช้งานจริง\n   * `AGE`: ระยะเวลาตั้งแต่สร้าง Deployment\n\n2. **ดูรายละเอียดเชิงลึกและประวัติ Events**:\n   ```bash\n   kubectl describe deployment nginx-deployment\n   ```\n   คำสั่งนี้จะแสดงข้อมูลกลยุทธ์การอัปเดต (`RollingUpdateStrategy`), พารามิเตอร์ `maxUnavailable` และ `maxSurge`, รวมถึงประวัติ `Events` ที่แสดงว่า Deployment Controller ได้สั่งสร้าง ReplicaSet ชื่ออะไร\n\n3. **ตรวจสอบพอดที่ถูกสร้างขึ้นจริง**:\n   ```bash\n   kubectl get pods -l app=nginx -o wide\n   ```\n   คุณจะสังเกตเห็นว่าชื่อพอดแต่ละตัวจะขึ้นต้นด้วยชื่อ Deployment ตามด้วยสุ่ม Hash ของ ReplicaSet และรหัสสุ่มของพอด เช่น `nginx-deployment-75675f5897-abcde`"
    },
    {
      "id": "scaling-the-deployment",
      "headingEn": "Scaling the Application (Imperative & Declarative)",
      "headingTh": "การขยายและย่อขนาดพอด (Scaling Replicas)",
      "contentMarkdown": "เมื่อแอปพลิเคชันได้รับทราฟฟิกสูงขึ้น คุณสามารถปรับขยายจำนวนพอด (Scale Out) ได้อย่างรวดเร็ว โดย Kubernetes รองรับทั้งแบบคำสั่ง Imperative และการแก้ไขไฟล์ Declarative:\n\n### วิธีที่ 1: การ Scale ผ่านคำสั่งด่วน (Imperative CLI)\nสั่งปรับเพิ่มจำนวน Replicas จาก 2 เป็น 4 ตัว:\n```bash\nkubectl scale deployment/nginx-deployment --replicas=4\n```\nตรวจสอบผลลัพธ์ทันที:\n```bash\nkubectl get pods -l app=nginx\n```\nคุณจะเห็นพอดใหม่เพิ่มขึ้นอีก 2 ตัว และเข้าสู่สถานะ `ContainerCreating` จนกลายเป็น `Running` ภายในเวลาไม่กี่วินาที\n\n### วิธีที่ 2: การ Scale แบบ Declarative (แนวทาง GitOps แนะนำ)\nเปิดไฟล์ `nginx-deployment.yaml` แล้วแก้ไขฟิลด์ `spec.replicas: 4` จากนั้นสั่ง apply:\n```bash\nkubectl apply -f nginx-deployment.yaml\n```\nแนวทางนี้เป็นที่แนะนำสำหรับการทำงานจริงในองค์กร เนื่องจากประวัติการแก้ไขจะถูกบันทึกไว้ใน Version Control (Git) อย่างโปร่งใส\n\n> [!TIP]\n> หากต้องการลดขนาดพอด (Scale Down) กลับไปเป็น 2 Replicas เพียงสั่ง:\n> `kubectl scale deployment/nginx-deployment --replicas=2`\n> Controller จะทำการลบพอดส่วนเกินออกอย่างปลอดภัยโดยส่งสัญญาณ SIGTERM ให้พอดค่อยๆ ปิดตัว (Graceful Termination)"
    },
    {
      "id": "rolling-update-and-rollout-status",
      "headingEn": "Performing a Zero-Downtime Rolling Update",
      "headingTh": "การอัปเดตเวอร์ชันซอฟต์แวร์แบบไร้ Downtime (Rolling Update)",
      "contentMarkdown": "หัวใจสำคัญของ Deployment คือความสามารถในการอัปเกรดเวอร์ชันซอฟต์แวร์โดยไม่ทำให้ระบบหยุดให้บริการ ผ่านกลยุทธ์ **RollingUpdate**:\n\n### กลไกการทำงานของ RollingUpdate\nDeployment จะค่อยๆ สร้างพอดเวอร์ชันใหม่ขึ้นมาทีละชุด และเมื่อพอดใหม่พร้อมให้บริการแล้วเท่านั้น จึงจะเริ่มทำลายพอดเวอร์ชันเก่าทิ้ง โดยควบคุมจังหวะผ่าน 2 ตัวแปร:\n* **`maxSurge`** (ค่าเริ่มต้น 25%): จำนวนพอดสูงสุดที่ยอมให้มีเกินกว่าค่า replicas ที่กำหนดได้ระหว่างการอัปเกรด\n* **`maxUnavailable`** (ค่าเริ่มต้น 25%): จำนวนพอดสูงสุดที่ยอมให้หยุดทำงานหรือไม่พร้อมใช้งานได้ในขณะอัปเกรด\n\n### สั่งอัปเดต Image เวอร์ชันใหม่\nสมมติว่าต้องการอัปเดต NGINX จากเวอร์ชัน `1.14.2` เป็น `1.16.1`:\n```bash\nkubectl set image deployment/nginx-deployment nginx=nginx:1.16.1 --record\n```\n\n### ติดตามความคืบหน้าของการ Rollout\nคุณสามารถเฝ้าสังเกตกระบวนการเปลี่ยนผ่านได้แบบเรียลไทม์ด้วยคำสั่ง:\n```bash\nkubectl rollout status deployment/nginx-deployment\n```\nผลลัพธ์จะรายงานขั้นตอนทีละสเต็ป:\n```\nWaiting for deployment \"nginx-deployment\" rollout to finish: 1 out of 4 new replicas have been updated...\nWaiting for deployment \"nginx-deployment\" rollout to finish: 2 out of 4 new replicas have been updated...\nWaiting for deployment \"nginx-deployment\" rollout to finish: 3 of 4 updated replicas are available...\ndeployment \"nginx-deployment\" successfully rolled out\n```\n\n> [!WARNING]\n> เพื่อความปลอดภัยสูงสุดในสภาพแวดล้อม Production ควรกำหนด **Readiness Probe** ในสเปกพอดเสมอ เพื่อให้แน่ใจว่า Kubernetes จะไม่ส่งทราฟฟิกผู้ใช้งานไปยังพอดใหม่ที่ยังโหลด Config หรือเริ่มแอปพลิเคชันไม่เสร็จสมบูรณ์"
    },
    {
      "id": "rollback-and-cleanup",
      "headingEn": "Rolling Back Revisions and Cleanup",
      "headingTh": "การย้อนกลับเวอร์ชัน (Rollback) และการลบทรัพยากร",
      "contentMarkdown": "หากเวอร์ชันใหม่ที่นำไปใช้งานมีข้อผิดพลาด (เช่น บั๊กในโค้ดหรือค่าคอนฟิกผิดพลาดจนทำให้พอดแครช) คุณสามารถสั่งถอยกลับ (Rollback) สู่เวอร์ชันก่อนหน้าได้ในทันที\n\n### การตรวจสอบประวัติการ Rollout\nตรวจสอบประวัติการอัปเดต Revision ทั้งหมดของ Deployment:\n```bash\nkubectl rollout history deployment/nginx-deployment\n```\nตรวจสอบรายละเอียดเฉพาะของ Revision ที่ 1:\n```bash\nkubectl rollout history deployment/nginx-deployment --revision=1\n```\n\n### การสั่ง Rollback สู่สถานะปกติ\n1. **ย้อนกลับไปยัง Revision ก่อนหน้าทันที**:\n   ```bash\n   kubectl rollout undo deployment/nginx-deployment\n   ```\n2. **ย้อนกลับไปยัง Revision ที่ระบุเฉพาะเจาะจง**:\n   ```bash\n   kubectl rollout undo deployment/nginx-deployment --to-revision=1\n   ```\n\n### การลบทรัพยากรเมื่อสิ้นสุดการทดสอบ (Cleanup)\nเมื่อเสร็จสิ้นการทดสอบ สามารถลบ Deployment และพอดทั้งหมดที่อยู่ภายใต้การดูแลได้ด้วยคำสั่งเดียว:\n```bash\nkubectl delete deployment nginx-deployment\n```\nการลบ Deployment จะส่งสัญญาณลบแบบ Cascading ไปยัง ReplicaSet และทำลายพอดทั้งหมดโดยอัตโนมัติ"
    }
  ],
  "relatedLinks": [
    {
      "title": "Deployments Concepts (สถาปัตยกรรม Deployment)",
      "targetType": "concepts",
      "targetPageId": "workloads-deployments",
      "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"
    },
    {
      "title": "Run a Replicated Stateful Application",
      "targetType": "tasks",
      "targetPageId": "run-stateful-application",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/"
    },
    {
      "title": "HorizontalPodAutoscaler Walkthrough",
      "targetType": "tasks",
      "targetPageId": "run-hpa-autoscaling",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/"
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
