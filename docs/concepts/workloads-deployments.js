/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
 */
(function (root) {
  const pageData = {
    "id": "workloads-deployments",
    "categoryId": "workloads",
    "categoryTitle": "Workloads",
    "titleEn": "Deployments",
    "titleTh": "ดีพลอยเมนต์ (Deployments)",
    "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/",
    "docsPath": "/docs/concepts/workloads/controllers/deployment/",
    "diagram": {
      "src": "images/docs/workload-controllers-hierarchy.svg",
      "caption": "ลำดับชั้นการควบคุม (Workload Hierarchy): Deployment ควบคุม ReplicaSet และ ReplicaSet ควบคุมดูแล Pods"
    },
    "lead": "Deployment ทำหน้าที่จัดการอัปเดตแบบ Declarative สำหรับ Pods และ ReplicaSets โดยที่คุณอธิบายสถานะที่ต้องการ (Desired State) ใน Deployment และ Deployment Controller จะเปลี่ยนสถานะจริง (Actual State) ให้ตรงกับสถานะที่ต้องการด้วยอัตราความเร็วที่ควบคุมได้ คุณสามารถกำหนด Deployments เพื่อสร้าง ReplicaSets ใหม่ หรือเพื่อลบ Deployments เดิมและนำทรัพยากรทั้งหมดมาใช้กับ Deployment ใหม่ได้\n\n> **หมายเหตุ (Note):** อย่าจัดการ ReplicaSets ที่เป็นของ Deployment โดยตรง (เช่น อย่าสั่งแก้ไขหรือลบ ReplicaSet เอง) หากกรณีการใช้งานของคุณไม่ได้อยู่ในรายการด้านล่าง ให้พิจารณาใช้ API อื่นที่เหมาะสมกว่าใน Kubernetes",
    "sections": [
      {
        "id": "use-case",
        "headingEn": "Use Case",
        "headingTh": "กรณีการใช้งานของ Deployment (Use Case)",
        "contentMarkdown": "ต่อไปนี้คือกรณีการใช้งานทั่วไปของ Deployments ตามเอกสารทางการ:\n\n* **สร้าง Deployment เพื่อ Rollout ReplicaSet ขึ้นทำงาน**: ตัว ReplicaSet จะสร้าง Pods ในเบื้องหลัง คุณสามารถตรวจสอบสถานะของการ Rollout ได้ว่าสำเร็จหรือล้มเหลว\n* **ประกาศสถานะใหม่ของ Pods (Declare the new state of the Pods)**: โดยการอัปเดต `PodTemplateSpec` ของ Deployment ตัว ReplicaSet ใหม่จะถูกสร้างขึ้น และ Deployment จะจัดการย้าย Pods จาก ReplicaSet เก่าไปยัง ReplicaSet ใหม่ด้วยอัตราความเร็วที่ควบคุมได้ โดยที่ ReplicaSet ใหม่แต่ละตัวจะปรับปรุงค่า Revision ของ Deployment เสมอ\n* **ย้อนกลับไปยัง Revision ของ Deployment ก่อนหน้า (Rollback to an earlier Deployment revision)**: หากสถานะปัจจุบันของ Deployment ไม่เสถียร การ Rollback แต่ละครั้งจะอัปเดต Revision ของ Deployment ด้วย\n* **ขยายขนาดของ Deployment (Scale up the Deployment)**: เพื่อรองรับปริมาณโหลดงานที่เพิ่มสูงขึ้น\n* **หยุดพักการ Rollout ชั่วคราว (Pause the rollout of a Deployment)**: เพื่อทำการแก้ไข `PodTemplateSpec` หลายๆ จุดพร้อมกัน จากนั้นจึงสั่งดำเนินการต่อ (Resume) เพื่อเริ่มต้นการ Rollout ครั้งใหม่เพียงครั้งเดียว\n* **ใช้สถานะของ Deployment (Use the status of the Deployment)**: เป็นตัวบ่งชี้ว่าการ Rollout ติดขัดหรือค้างอยู่หรือไม่\n* **เก็บกวาด ReplicaSets เก่าที่ไม่จำเป็นอีกต่อไป (Clean up older ReplicaSets)**: ที่ไม่ต้องการใช้งานแล้วออกจากระบบโดยอัตโนมัติ"
      },
      {
        "id": "creating-a-deployment",
        "headingEn": "Creating a Deployment",
        "headingTh": "การสร้าง Deployment (Creating a Deployment)",
        "contentMarkdown": "ตัวอย่างต่อไปนี้คือ Deployment ที่ประกอบด้วย ReplicaSet ซึ่งทำหน้าที่ปลุก `nginx` Pods จำนวน 3 ตัวขึ้นมาทำงาน:\n\nจากตัวอย่างนี้:\n* Deployment ชื่อ `nginx-deployment` จะถูกสร้างขึ้นตามที่ระบุในฟิลด์ `.metadata.name` ชื่อนี้จะกลายเป็นชื่อตั้งต้นสำหรับสร้าง ReplicaSets และ Pods ในลำดับถัดไป\n* Deployment จะสร้าง ReplicaSet ที่สั่งรัน Pods จำนวน 3 ตัวตามฟิลด์ `.spec.replicas`\n* ฟิลด์ `.spec.selector` กำหนดวิธีที่ Deployment ใช้ค้นหาว่า Pods ใดที่ต้องเข้าดูแลจัดการ ในกรณีนี้เราเลือกใช้ Label ที่ระบุใน Pod Template (`app: nginx`)\n* ฟิลด์ `template` มีฟิลด์ย่อยดังนี้:\n  * พอดถูกติดป้ายกำกับ `app: nginx` ด้วยฟิลด์ `.metadata.labels`\n  * สเปกของพอด (`.template.spec`) ระบุว่าพอดจะรันคอนเทนเนอร์ 1 ตัวชื่อ `nginx` ซึ่งรันอิมเมจ Docker Hub `nginx` เวอร์ชัน `1.14.2`\n  * สร้างคอนเทนเนอร์และเปิดพอร์ต 80 ด้วยฟิลด์ `.spec.template.spec.containers[0].ports[0].containerPort`\n\n1. สร้าง Deployment โดยรันคำสั่ง `kubectl apply -f https://k8s.io/examples/controllers/nginx-deployment.yaml`\n2. รัน `kubectl get deployments` เพื่อตรวจดูว่า Deployment ถูกสร้างขึ้นแล้วหรือไม่ (`NAME`, `READY`, `UP-TO-DATE`, `AVAILABLE`, `AGE`)\n3. ดูสถานะการ Rollout ด้วย `kubectl rollout status deployment/nginx-deployment`\n4. ดู ReplicaSet (`rs`) ที่ Deployment สร้างขึ้นด้วย `kubectl get rs` ซึ่งชื่อของ ReplicaSet จะอยู่ในรูปแบบ `[DEPLOYMENT-NAME]-[HASH]`\n\n### Pod-template-hash label\n\n> **คำเตือน (Caution):** อย่าเปลี่ยนค่าเลเบล `pod-template-hash` นี้โดยเด็ดขาด\n\nDeployment Controller จะเพิ่มเลเบล `pod-template-hash` ให้กับทุกๆ ReplicaSet ที่ Deployment สร้างหรือรับมาดูแลโดยอัตโนมัติ เลเบลนี้ช่วยให้มั่นใจว่า ReplicaSets ลูกของ Deployment จะไม่ทับซ้อนกัน มันถูกสร้างขึ้นโดยการนำ `PodTemplate` ของ ReplicaSet มาคำนวณค่า Hash แล้วนำค่า Hash ที่ได้ไปต่อท้ายชื่อ ReplicaSet และใส่ใน `.spec.selector`",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "controllers/nginx-deployment.yaml",
            "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx-deployment\n  labels:\n    app: nginx\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: nginx\n  template:\n    metadata:\n      labels:\n        app: nginx\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:1.14.2\n        ports:\n        - containerPort: 80"
          },
          {
            "lang": "bash",
            "label": "คำสั่งสร้างและตรวจสอบ Deployment",
            "code": "kubectl apply -f https://k8s.io/examples/controllers/nginx-deployment.yaml\nkubectl get deployments\nkubectl rollout status deployment/nginx-deployment\nkubectl get rs\nkubectl get pods --show-labels"
          }
        ]
      },
      {
        "id": "updating-a-deployment",
        "headingEn": "Updating a Deployment",
        "headingTh": "การอัปเดต Deployment (Updating a Deployment)",
        "contentMarkdown": "> **หมายเหตุ (Note):** การ Rollout ของ Deployment จะถูกทริกเกอร์ก็ต่อเมื่อมีการเปลี่ยนแปลงในส่วนของ Pod Template ของ Deployment เท่านั้น (คือฟิลด์ `.spec.template` เช่น การเปลี่ยน Label หรือ Container Image ของ Template) การอัปเดตอื่นๆ เช่น การปรับขนาด (Scaling) ของ Deployment จะไม่ทริกเกอร์การ Rollout ใหม่\n\nสมมติว่าตอนนี้เราต้องการให้ nginx Pods เปลี่ยนไปใช้อิมเมจ `nginx:1.16.1` แทนที่จะเป็น `nginx:1.14.2`:\n\n* สามารถใช้คำสั่ง `kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.16.1`\n* หรือสั่ง `kubectl edit deployment/nginx-deployment` แล้วเปลี่ยน `.spec.template.spec.containers[0].image` จาก `nginx:1.14.2` เป็น `nginx:1.16.1`\n\nDeployment จะทยอยอัปเดต Pods ด้วยกลยุทธ์ RollingUpdate โดยรับประกันว่าจะมีพอดที่หยุดทำงานพร้อมกันไม่เกินจำนวนที่กำหนด (ค่าดีฟอลต์ทำให้มั่นใจว่ามี Pods พร้อมทำงานอย่างน้อย 75% ของจำนวนที่ต้องการ หรือไม่พร้อมทำงานสูงสุด 25%) และรับประกันว่าจะสร้างพอดเกินจากจำนวนที่ต้องการไม่เกิน 25% (มีพอดรวมไม่เกิน 125%)\n\n### Rollover (aka multiple updates in-flight)\nทุกครั้งที่ Deployment Controller สังเกตเห็น Deployment ใหม่ มันจะสร้าง ReplicaSet ขึ้นมาเพื่อนำพอดไปสู่สถานะที่ต้องการ หากมีการอัปเดต Deployment ซ้ำในขณะที่กำลัง Rollout อยู่ Deployment จะสร้าง ReplicaSet ใหม่และเริ่มขยายขนาด ReplicaSet ใหม่ทันที พร้อมทั้งสั่งลดขนาด (Roll over) ReplicaSet ที่กำลังขยายขนาดอยู่ก่อนหน้านี้ และนำพอดไปรวมในการคำนวณเพื่อลดขนาดลง\n\n### Label selector updates\nโดยทั่วไปไม่แนะนำให้อัปเดต Label Selector และควรวางแผน Selector ให้รอบคอบตั้งแต่ต้น อย่างไรก็ตาม:\n* การเพิ่ม Selector ใหม่จะต้องอัปเดต Pod Template Labels ในสเปกของ Deployment ไปพร้อมกันด้วย มิฉะนั้นจะเกิด Validation Error\n* ใน API เวอร์ชัน `apps/v1` ฟิลด์ **Label Selector ของ Deployment เป็นแบบแก้ไขไม่ได้ (Immutable)** หลังจากถูกสร้างขึ้นแล้ว",
        "codeBlocks": [
          {
            "lang": "bash",
            "label": "การอัปเดตอิมเมจและตรวจสอบสถานะ Rollout",
            "code": "kubectl set image deployment.v1.apps/nginx-deployment nginx=nginx:1.16.1\nkubectl rollout status deployment/nginx-deployment\nkubectl describe deployments nginx-deployment"
          }
        ]
      },
      {
        "id": "rolling-back-a-deployment",
        "headingEn": "Rolling Back a Deployment",
        "headingTh": "การย้อนกลับ Deployment (Rolling Back a Deployment)",
        "contentMarkdown": "ในบางครั้งคุณอาจต้องการย้อนกลับ (Rollback) Deployment เช่น เมื่อการอัปเดต Deployment ไม่เสถียร หรือเกิด CrashLoopBackOff (เช่น พิมพ์ชื่ออิมเมจผิดเป็น `nginx:1.161` แทนที่จะเป็น `nginx:1.16.1`) โดยค่าเริ่มต้น ประวัติการ Rollout ทั้งหมดของ Deployment จะถูกเก็บไว้ในระบบเพื่อให้คุณสามารถสั่ง Rollback ได้ตลอดเวลา\n\n> **หมายเหตุ (Note):** Revision ของ Deployment จะถูกสร้างขึ้นเมื่อการ Rollout ของ Deployment ถูกทริกเกอร์ ซึ่งหมายความว่าจะเกิด Revision ใหม่ก็ต่อเมื่อส่วน Pod Template (`.spec.template`) ของ Deployment มีการเปลี่ยนแปลงเท่านั้น\n\n### Checking Rollout History of a Deployment\nตรวจสอบประวัติการแก้ไขของ Deployment:\n1. รันคำสั่ง `kubectl rollout history deployment/nginx-deployment` เพื่อดูรายการ Revisions ทั้งหมด\n2. หากต้องการดูรายละเอียดของแต่ละ Revision ให้เพิ่มแฟล็ก `--revision=<N>` เช่น `kubectl rollout history deployment/nginx-deployment --revision=2`\n\n### Rolling Back to a Previous Revision\nเมื่อตัดสินใจยกเลิกการ Rollout ปัจจุบันและย้อนกลับไปหา Revision ก่อนหน้า:\n* **ย้อนกลับไปยัง Revision ล่าสุดก่อนหน้า**: `kubectl rollout undo deployment/nginx-deployment`\n* **ย้อนกลับไปยัง Revision ที่ระบุเจาะจง**: ใช้แฟล็ก `--to-revision` เช่น `kubectl rollout undo deployment/nginx-deployment --to-revision=2`",
        "codeBlocks": [
          {
            "lang": "bash",
            "label": "การตรวจสอบประวัติและสั่ง Rollback",
            "code": "kubectl rollout history deployment/nginx-deployment\nkubectl rollout history deployment/nginx-deployment --revision=2\nkubectl rollout undo deployment/nginx-deployment\nkubectl rollout undo deployment/nginx-deployment --to-revision=2"
          }
        ]
      },
      {
        "id": "scaling-a-deployment",
        "headingEn": "Scaling a Deployment",
        "headingTh": "การปรับขยายขนาด Deployment (Scaling a Deployment)",
        "contentMarkdown": "คุณสามารถปรับขนาด (Scale) Deployment ได้โดยใช้คำสั่งต่อไปนี้:\n* ขยายขนาดแบบกำหนดจำนวนคงที่: `kubectl scale deployment/nginx-deployment --replicas=10`\n* ขยายขนาดอัตโนมัติ (Horizontal Pod Autoscaling) หากคลัสเตอร์เปิดใช้งาน HPA อยู่: `kubectl autoscale deployment/nginx-deployment --min=10 --max=15 --cpu-percent=80`\n\n### Proportional scaling\nDeployments ที่ใช้กลยุทธ์ `RollingUpdate` รองรับการรันแอปพลิเคชันหลายเวอร์ชันในเวลาเดียวกัน เมื่อคุณหรือ Autoscaler สั่งปรับขนาด Deployment ที่กำลังอยู่ในระหว่างการ Rollout (ทั้งการกำลัง In-progress หรือ Paused) ตัว Deployment Controller จะทำการเกลี่ยสมดุลจำนวน Replicas เพิ่มเติมให้กับ ReplicaSets ที่กำลังทำงานอยู่ตามสัดส่วน (**Proportional Scaling**) เพื่อลดความเสี่ยงไม่ให้พอดเวอร์ชันใหม่ที่ยังไม่เสร็จสมบูรณ์รับภาระทั้งหมด",
        "codeBlocks": [
          {
            "lang": "bash",
            "label": "คำสั่ง Scale และ Autoscale",
            "code": "kubectl scale deployment/nginx-deployment --replicas=10\nkubectl autoscale deployment/nginx-deployment --min=10 --max=15 --cpu-percent=80"
          }
        ]
      },
      {
        "id": "pausing-and-resuming-a-rollout-of-a-deployment",
        "headingEn": "Pausing and Resuming a rollout of a Deployment",
        "headingTh": "การหยุดพักและดำเนินการต่อของการ Rollout (Pausing and Resuming a rollout of a Deployment)",
        "contentMarkdown": "เมื่อคุณอัปเดต Deployment หรือมีแผนจะอัปเดต คุณสามารถสั่งหยุดพัก (Pause) การ Rollout บน Deployment นั้นไว้ก่อนที่จะทำการเปลี่ยนแปลงหนึ่งอย่างหรือหลายอย่าง แล้วจึงสั่งให้ดำเนินการต่อ (Resume) วิธีการนี้ช่วยให้คุณสามารถแก้ไขคอนฟิกหลายๆ รายการในระหว่างที่พักไว้ โดยไม่กระตุ้นให้เกิดการ Rollout ซ้ำซ้อนโดยไม่จำเป็น\n\n1. สั่งหยุดพัก Deployment: `kubectl rollout pause deployment/nginx-deployment`\n2. อัปเดตอิมเมจและทรัพยากรของคอนเทนเนอร์ (จะยังไม่มีการ Rollout เกิดขึ้นตราบใดที่ยัง Paused อยู่):\n   * `kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1`\n   * `kubectl set resources deployment/nginx-deployment -c=nginx --limits=cpu=200m,memory=512Mi`\n3. สั่งให้ดำเนินการ Rollout ต่อ: `kubectl rollout resume deployment/nginx-deployment`\n\n> **หมายเหตุ (Note):** คุณไม่สามารถสั่ง Rollback บน Deployment ที่อยู่ในสถานะ Paused ได้จนกว่าคุณจะสั่ง Resume เสียก่อน",
        "codeBlocks": [
          {
            "lang": "bash",
            "label": "การสั่ง Pause, แก้ไขหลายค่า และ Resume",
            "code": "kubectl rollout pause deployment/nginx-deployment\nkubectl set image deployment/nginx-deployment nginx=nginx:1.16.1\nkubectl set resources deployment/nginx-deployment -c=nginx --limits=cpu=200m,memory=512Mi\nkubectl rollout resume deployment/nginx-deployment"
          }
        ]
      },
      {
        "id": "deployment-status",
        "headingEn": "Deployment status",
        "headingTh": "สถานะของ Deployment (Deployment status)",
        "contentMarkdown": "Deployment จะเข้าสู่สถานะต่างๆ ในระหว่างวงจรชีวิตการทำงาน โดยแบ่งเป็น 3 สถานะหลัก:\n\n1. **Progressing Deployment**: กำลังดำเนินการสร้าง ReplicaSet ใหม่, กำลังขยายขนาด ReplicaSet ล่าสุด, กำลังลดขนาด ReplicaSets เก่า หรือมี Pods ใหม่ที่เพิ่งพร้อมใช้งาน (Ready/Available) โดยจะมี Condition `type: Progressing`\n2. **Complete Deployment**: Deployment มีลักษณะดังนี้:\n   * Replicas ทั้งหมดที่เกี่ยวข้องกับการอัปเดตได้รับการอัปเดตเป็นเวอร์ชันล่าสุดที่คุณระบุแล้ว\n   * Replicas ทั้งหมดพร้อมใช้งาน (Available)\n   * ไม่มี Replicas เก่าของ Deployment รันหลงเหลืออยู่อีก\n3. **Failed Deployment**: Deployment อาจติดค้างในขณะพยายามดีพลอย ReplicaSet ใหม่จนไม่สามารถทำงานสำเร็จได้ ซึ่งอาจเกิดจากสาเหตุต่อไปนี้:\n   * โควตาทรัพยากรไม่เพียงพอ (Insufficient quota)\n   * ความล้มเหลวของ Readiness probe (Readiness probe failures)\n   * ข้อผิดพลาดในการดึงอิมเมจ (Image pull errors)\n   * สิทธิ์ไม่เพียงพอ (Insufficient permissions)\n   * ขีดจำกัด Limit ranges\n   * การตั้งค่าของโปรแกรมแอปพลิเคชันผิดพลาดเอง (Application runtime misconfiguration)\n\n### Operating on a failed deployment\nคุณสามารถตรวจจับเงื่อนไขความล้มเหลวได้โดยการกำหนดค่า `.spec.progressDeadlineSeconds` ซึ่งระบุจำนวนวินาทีที่ Deployment Controller จะรอก่อนที่จะรายงานว่าความคืบหน้าของ Deployment หยุดชะงัก (`Reason=ProgressDeadlineExceeded`) โดยเมื่อครบกำหนดแล้ว Controller จะหยุดพยายามเฉพาะการแจ้งสถานะ แต่คุณสามารถสั่ง `kubectl rollout undo` เพื่อย้อนกลับ หรือสั่ง Pause เพื่อแก้ไขปัญหาได้"
      },
      {
        "id": "clean-up-policy",
        "headingEn": "Clean up Policy",
        "headingTh": "นโยบายการเก็บกวาดประวัติเก่า (Clean up Policy)",
        "contentMarkdown": "คุณสามารถตั้งค่าฟิลด์ `.spec.revisionHistoryLimit` ใน Deployment เพื่อระบุจำนวนของ ReplicaSets เก่าของ Deployment นี้ที่ต้องการเก็บไว้ในระบบ:\n\n* ReplicaSets ที่เหลือเกินจากจำนวนที่กำหนดจะถูกเก็บกวาดทิ้ง (Garbage-collected) ในเบื้องหลัง\n* โดยค่าเริ่มต้น (Default) ฟิลด์นี้มีค่าเป็น **10**\n* การตั้งค่าฟิลด์นี้เป็น `0` จะส่งผลให้ประวัติทั้งหมดของ Deployment ถูกลบทิ้ง ซึ่งจะทำให้ Deployment นั้นไม่สามารถสั่ง Rollback ได้อีก"
      },
      {
        "id": "canary-deployments",
        "headingEn": "Canary deployments",
        "headingTh": "การปล่อยเวอร์ชันแบบแคนารี (Canary deployments)",
        "contentMarkdown": "หากคุณต้องการปล่อยซอฟต์แวร์เวอร์ชันใหม่ให้กับผู้ใช้หรือเซิร์ฟเวอร์เพียงบางส่วนก่อน (Canary Release) คุณสามารถสร้าง Deployments แยกกันหลายตัวสำหรับแต่ละชุดการปล่อย โดยใช้หลักการจัดการ Labels และ Service Selector ร่วมกัน (เช่น มี Deployment `track: stable` และ Deployment `track: canary` ที่แชร์เลเบลหลัก `app: guestbook` ร่วมกันภายใต้ Service เดียวกัน)"
      },
      {
        "id": "writing-a-deployment-spec",
        "headingEn": "Writing a Deployment Spec",
        "headingTh": "การเขียนสเปกของ Deployment (Writing a Deployment Spec)",
        "contentMarkdown": "เช่นเดียวกับคอนฟิกอื่นๆ ใน Kubernetes ตัว Deployment จำเป็นต้องมีฟิลด์ `.apiVersion`, `.kind`, และ `.metadata` เสมอ ส่วนฟิลด์ภายใต้ `.spec` มีรายละเอียดที่สำคัญดังนี้:\n\n### Pod Template (`.spec.template`)\nฟิลด์ `.spec.template` และ `.spec.selector` เป็นเพียง 2 ฟิลด์ที่บังคับต้องระบุ (Required) ใน `.spec` โดย `.spec.template` คือ `PodTemplateSpec` ซึ่งมีสคีมาเหมือนกับ Pod ทุกประการ ยกเว้น أنهاซ้อนอยู่ด้านในและไม่ต้องระบุ `apiVersion` หรือ `kind` ทั้งนี้ `.spec.template.spec.restartPolicy` ของ Deployment อนุญาตให้ตั้งเป็นค่า `Always` เท่านั้น (เป็นค่าดีฟอลต์หากไม่ระบุ)\n\n### Replicas (`.spec.replicas`)\nเป็นฟิลด์ทางเลือก (Optional) สำหรับระบุจำนวน Pods ที่ต้องการ โดยค่าดีฟอลต์คือ `1`\n\n### Selector (`.spec.selector`)\nเป็นฟิลด์บังคับ (Required) สำหรับระบุ Label Selector ของ Pods ที่เป็นเป้าหมายของ Deployment นี้ โดยต้องตรงกับ `.spec.template.metadata.labels`\n\n### Strategy (`.spec.strategy`)\nระบุกลยุทธ์ที่ใช้แทนที่ Pods เก่าด้วย Pods ใหม่ โดย `.spec.strategy.type` สามารถตั้งเป็น `Recreate` หรือ `RollingUpdate` (ค่าดีฟอลต์คือ `RollingUpdate`):\n* **Recreate Deployment**: พอดที่มีอยู่ทั้งหมดจะถูกฆ่าทิ้งก่อนที่จะสร้างพอดชุดใหม่ขึ้นมา\n* **Rolling Update Deployment**: ทยอยอัปเดตพอดในลักษณะ Rolling update โดยคุณสามารถระบุ `maxUnavailable` และ `maxSurge` เพื่อควบคุมกระบวนการ:\n  * **Max Unavailable** (`.spec.strategy.rollingUpdate.maxUnavailable`): จำนวนพอดสูงสุดที่ไม่สามารถใช้งานได้ระหว่างการอัปเดต ค่าดีฟอลต์คือ `25%`\n  * **Max Surge** (`.spec.strategy.rollingUpdate.maxSurge`): จำนวนพอดสูงสุดที่สามารถสร้างเกินจากจำนวนที่ต้องการได้ ค่าดีฟอลต์คือ `25%`\n\n### Progress Deadline Seconds (`.spec.progressDeadlineSeconds`)\nจำนวนวินาทีที่ต้องการรอให้ Deployment มีความคืบหน้าก่อนที่ระบบจะรายงานว่า Deployment ล้มเหลว (`ProgressDeadlineExceeded`) ค่าดีฟอลต์คือ `600`\n\n### Min Ready Seconds (`.spec.minReadySeconds`)\nจำนวนวินาทีขั้นต่ำที่พอดที่ถูกสร้างขึ้นใหม่จะต้องอยู่ในสถานะ Ready โดยไม่มีคอนเทนเนอร์ใดแครชเลย จึงจะถือว่าพอดนั้นพร้อมใช้งาน (Available) ค่าดีฟอลต์คือ `0`\n\n### Terminating Pods (`.spec.template.spec.terminationGracePeriodSeconds`)\nระยะเวลาผ่อนผันสำหรับการปิดตัวของพอดเมื่อถูกสั่งลบ\n\n### Revision History Limit (`.spec.revisionHistoryLimit`)\nจำนวน ReplicaSets เก่าที่จะเก็บไว้เพื่อให้สามารถสั่ง Rollback ได้ ค่าดีฟอลต์คือ `10`\n\n### Paused (`.spec.paused`)\nฟิลด์ Boolean ทางเลือกสำหรับสั่งหยุดพักหรือดำเนินการต่อของการเกิด Rollout ค่าดีฟอลต์คือ `false`"
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไป (What's next)",
        "contentMarkdown": "* เรียนรู้เพิ่มเติมเกี่ยวกับ [Pods](https://kubernetes.io/docs/concepts/workloads/pods/)\n* ศึกษาคู่มือปฏิบัติ [Run a Stateless Application Using a Deployment](https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/)\n* อ่านเอกสาร API ของ `Deployment` เพื่อทำความเข้าใจสคีมาของอ็อบเจกต์อย่างละเอียด\n* อ่านเกี่ยวกับ [PodDisruptionBudget](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/) และวิธีใช้จัดการความพร้อมใช้งานของแอปพลิเคชันระหว่างเกิดเหตุขัดจังหวะ\n* ใช้ `kubectl` เพื่อสร้าง Deployment"
      }
    ],
    "relatedLinks": [
      {
        "title": "Pods",
        "targetType": "concepts",
        "targetPageId": "workloads-pods",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/"
      },
      {
        "title": "StatefulSets",
        "targetType": "concepts",
        "targetPageId": "workloads-replicaset-statefulset",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/"
      },
      {
        "title": "Run a Stateless Application Using a Deployment",
        "targetType": "tasks",
        "targetPageId": "run-stateless-deployment",
        "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/"
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
