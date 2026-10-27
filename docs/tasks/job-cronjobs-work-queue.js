/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/
 */
(function (root) {
  const pageData = {
  "id": "job-cronjobs-work-queue",
  "categoryId": "run-jobs",
  "categoryTitle": "Run Jobs",
  "titleEn": "Running Automated Tasks with a CronJob",
  "titleTh": "การรันงานอัตโนมัติตามตารางเวลาด้วย CronJob",
  "officialUrl": "https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/",
  "docsPath": "/docs/tasks/job/automated-tasks-with-cron-jobs/",
  "diagram": {
    "src": "images/docs/workload-controllers-hierarchy.svg",
    "caption": "ลำดับชั้นการทำงานของ CronJob ที่สั่งสร้าง Job อ็อบเจกต์ตามเวลา และ Job ควบคุมการรัน Pod จนเสร็จสมบูรณ์"
  },
  "lead": "เรียนรู้การกำหนดค่างานประมวลผลอัตโนมัติตามเวลา (CronJob) บน Kubernetes สำหรับงานสำรองข้อมูล, การส่งรายงานประจำวัน, และการประมวลผลแบตช์ (Batch Processing) พร้อมเทคนิคการจัดการ Concurrency Policy, Deadlines, และการจัดการประวัติงาน",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nCronJob ใน Kubernetes ใช้สำหรับจัดการงานประมวลผลแบบแบตช์ตามตารางเวลาที่กำหนดเป็นระยะๆ (เช่น การสำรองข้อมูล, สร้างรายงานประจำคืน) โดยทำหน้าที่สร้าง Job ขึ้นมาตามเวลา และ Job จะสร้าง Pod เพื่อทำงานให้เสร็จสิ้น (Completed / Exit code 0) แล้วหยุดทำงานโดยไม่ถูกนำมารันซ้ำ\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **สถาปัตยกรรม 3 ชั้น**: CronJob (ตารางเวลา) -> Job (ควบคุมงาน) -> Pod (ประมวลผลจริง)\n* **ตารางเวลา 5 ฟิลด์ (Cron Syntax)**: `นาที ชั่วโมง วัน เดือน วันในสัปดาห์` (เช่น `*/15 * * * *` = ทุก 15 นาที)\n* **`concurrencyPolicy` (นโยบายเมื่อมีงานทับซ้อน)**:\n  * `Allow` (ดีฟอลต์): อนุญาตให้รันงานคู่ขนานกันได้\n  * `Forbid`: หากงานรอบเก่ายังไม่เสร็จ ให้ข้าม (Skip) งานรอบใหม่ไปเลย\n  * `Replace`: ยกเลิกและทำลายงานรอบเก่าทิ้ง แล้วเริ่มงานรอบใหม่ทันที\n* **การพักงานชั่วคราว**: กำหนด `spec.suspend: true` เพื่อหยุดการรันรอบใหม่โดยไม่ต้องลบอ็อบเจกต์ทิ้ง\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* **คำสั่งลัด CLI CKA/CKAD**:\n  * สร้าง CronJob ด่วน:\n    `kubectl create cronjob my-job --image=busybox --schedule=\"*/5 * * * *\" -- /bin/sh -c \"date; echo done\"`\n  * สั่งทริกเกอร์ Job ทันทีโดยไม่ต้องรอตารางเวลา:\n    `kubectl create job --from=cronjob/my-job manual-test-01`\n  * พักงาน / เปิดงานต่อ:\n    `kubectl patch cronjob my-job -p '{\"spec\":{\"suspend\":true}}'`\n* **ฟิลด์ควบคุมเพื่อความเสถียรใน Production**:\n  * `activeDeadlineSeconds`: กำหนดเวลาสูงสุดที่อนุญาตให้รัน เพื่อป้องกันงานค้าง (Stuck Job)\n  * `successfulJobsHistoryLimit` และ `failedJobsHistoryLimit`: จำกัดจำนวนพอดประวัติเก่าเพื่อไม่ให้รกคลัสเตอร์\n  * `restartPolicy`: สำหรับ Job ต้องระบุเป็น `OnFailure` หรือ `Never` เท่านั้น (ห้ามใช้ `Always`)",
  "sections": [
    {
      "id": "cronjob-architecture-and-schedule",
      "headingEn": "CronJob Architecture & Standard Cron Syntax",
      "headingTh": "สถาปัตยกรรมของ CronJob และรูปแบบไวยากรณ์ตารางเวลา",
      "contentMarkdown": "### วงจรการทำงานของ CronJob Controller\n\n**CronJob** บน Kubernetes ทำหน้าที่เป็นตัวควบคุมระดับสูงที่สร้าง **Job** อ็อบเจกต์ขึ้นมาตามตารางเวลาที่กำหนดเป็นระยะๆ (Periodic Recurring Tasks) และ Job จะรับช่วงต่อในการสร้าง **Pods** เพื่อปฏิบัติงานประมวลผลให้เสร็จสิ้นและจบการทำงาน (Exit 0 / Completed)\n\n### ไวยากรณ์เวลามาตรฐาน 5 ตำแหน่ง (Cron Syntax)\nฟิลด์ `spec.schedule` กำหนดตามรูปแบบมาตรฐานของ Unix Cron:\n```\n┌───────────── นาที (Minute: 0 - 59)\n│ ┌───────────── ชั่วโมง (Hour: 0 - 23)\n│ │ ┌───────────── วันที่ของเดือน (Day of month: 1 - 31)\n│ │ │ ┌───────────── เดือน (Month: 1 - 12 หรือ JAN-DEC)\n│ │ │ │ ┌───────────── วันในสัปดาห์ (Day of week: 0 - 6 หรือ SUN-SAT โดย 0 คือวันอาทิตย์)\n│ │ │ │ │\n* * * * *\n```\n\n**ตัวอย่างรูปแบบที่ใช้บ่อย:**\n* `*/5 * * * *`: รันทุกๆ 5 นาที\n* `0 2 * * *`: รันทุกวันเวลาตีสอง (02:00 น.)\n* `0 0 1 * *`: รันเที่ยงคืนของวันแรกของทุกเดือน\n* `0 8 * * 1-5`: รันเวลา 08:00 น. ในวันจันทร์ถึงวันศุกร์ (Working Days)\n* `@hourly` หรือ `@daily`: Macros ทางเลือกใน Kubernetes",
      "codeBlocks": []
    },
    {
      "id": "writing-cronjob-manifest",
      "headingEn": "Writing the CronJob Manifest Specification",
      "headingTh": "การเขียน Manifest CronJob และฟารามิเตอร์สำคัญ",
      "contentMarkdown": "สร้างไฟล์ `cronjob.yaml` รันคำสั่งพิมพ์ข้อความและวันที่ปัจจุบันทุกๆ 1 นาที:\n\n### ฟิลด์คอนฟิกสำคัญของ CronJob:\n1. **`schedule: \"*/1 * * * *\"`**: ตารางเวลาที่ต้องการสั่งรัน\n2. **`concurrencyPolicy`**: นโยบายการจัดการหากงานรอบเก่ายังรันไม่เสร็จเมื่องานรอบใหม่มาถึง:\n   * **`Allow`** (ค่าเริ่มต้น): ยอมให้งานรันขนานกันได้\n   * **`Forbid`**: หากงานเก่ายังไม่เสร็จ ให้ข้ามงานรอบใหม่นี้ไปทันที\n   * **`Replace`**: สั่งยกเลิก (Kill) งานรอบเก่าที่ค้างอยู่ แล้วเริ่มงานรอบใหม่ขึ้นมาแทน\n3. **`startingDeadlineSeconds`**: จำนวนวินาทีที่ยอมให้เริ่มงานล่าช้ากว่ากำหนดได้ หากเวลาผ่านไปเกินกว่านี้เนื่องจากคลัสเตอร์โอเวอร์โหลด จะถือว่างานรอบนี้ถูกยกเลิก (Missed Schedule)\n4. **`successfulJobsHistoryLimit: 3`** และ **`failedJobsHistoryLimit: 1`**: จำนวนประวัติ Job ที่ต้องการเก็บไว้ดู Logs หากไม่กำหนดระบบจะเก็บสะสมจนรกคลัสเตอร์\n5. **`restartPolicy`**: สำหรับ Job จะต้องกำหนดเป็น **`OnFailure`** หรือ **`Never`** เท่านั้น (ห้ามใส่ `Always` เด็ดขาด)",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "cronjob.yaml",
          "code": "apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: hello\nspec:\n  schedule: \"*/1 * * * *\"\n  concurrencyPolicy: Forbid\n  successfulJobsHistoryLimit: 3\n  failedJobsHistoryLimit: 1\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          containers:\n          - name: hello\n            image: busybox:1.28\n            command:\n            - /bin/sh\n            - -c\n            - date; echo Hello from the Kubernetes CronJob cluster!\n          restartPolicy: OnFailure"
        }
      ]
    },
    {
      "id": "deploying-and-verifying-cronjobs",
      "headingEn": "Deploying, Tracking, and Manual Triggers",
      "headingTh": "การสั่งรัน, การติดตามผล และการกระตุ้นงานล่วงหน้า",
      "contentMarkdown": "### สั่ง Deploy เข้าคลัสเตอร์\n```bash\nkubectl apply -f cronjob.yaml\n```\n\n### ตรวจสอบสถานะของ CronJob\n```bash\nkubectl get cronjob hello\n```\nผลลัพธ์จะแสดงตาราง:\n```\nNAME    SCHEDULE      SUSPEND   ACTIVE   LAST SCHEDULE   AGE\nhello   */1 * * * *   False     0        12s             2m\n```\nคำอธิบายฟิลด์:\n* `SUSPEND: False`: กำลังทำงานตามตารางเวลาปกติ (ไม่ได้ถูกพักไว้)\n* `ACTIVE`: จำนวน Job ที่กำลังรันอยู่ ณ ปัจจุบัน\n* `LAST SCHEDULE`: ระยะเวลาตั้งแต่รอบล่าสุดที่ทำงาน\n\n### การสั่งรัน Job ทันทีโดยไม่ต้องรอรอบเวลา (Manual Trigger)\nหากต้องการทดสอบโค้ดของ Job ทันทีโดยไม่ต้องรอให้ถึงรอบเวลา Cron:\n```bash\nkubectl create job --from=cronjob/hello hello-manual-run-01\n```\n\n### ดูผลลัพธ์และอ่าน Logs ของงานที่เสร็จสิ้น\n```bash\nkubectl get jobs --watch\nkubectl get pods -l job-name=hello-manual-run-01\nkubectl logs -l job-name=hello-manual-run-01\n```\nผลลัพธ์จะแสดงวันที่และข้อความ `Hello from the Kubernetes CronJob cluster!`",
      "codeBlocks": []
    },
    {
      "id": "suspending-and-resuming-cronjobs",
      "headingEn": "Suspending and Resuming CronJobs",
      "headingTh": "การสั่งระงับชั่วคราวและการเปิดใช้งานต่อ (Suspend & Resume)",
      "contentMarkdown": "ในระหว่างการบำรุงรักษาระบบ คุณอาจต้องการหยุดพักการรันงานแบตช์ชั่วคราวโดยไม่ต้องลบอ็อบเจกต์ CronJob ทิ้ง:\n\n### การสั่งพักงาน (Suspend)\n```bash\nkubectl patch cronjob hello -p '{\"spec\":{\"suspend\":true}}'\n```\nหรือสั่งผ่าน `kubectl edit cronjob hello` แล้วแก้ไข `suspend: true`\n\nเมื่อตรวจสอบด้วย `kubectl get cronjob` คุณจะเห็นคอลัมน์ `SUSPEND` เปลี่ยนเป็น `True` และตัวควบคุมจะไม่เริ่มรอบใหม่จนกว่าจะสั่งปลด\n\n### การเปิดให้กลับมาทำงานต่อ (Resume)\n```bash\nkubectl patch cronjob hello -p '{\"spec\":{\"suspend\":false}}'\n```\n\n> [!NOTE]\n> ในช่วงที่สั่ง Suspend หากมีรอบเวลาผ่านไปมากกว่า 100 รอบ หรือเกินกว่าค่า `startingDeadlineSeconds` ตัวควบคุมจะข้ามรอบที่ค้างไว้และไม่รันงานย้อนหลัง เพื่อป้องกันพายุทราฟฟิก (Thundering Herd Problem)",
      "codeBlocks": []
    },
    {
      "id": "troubleshooting-and-production-caveats",
      "headingEn": "Troubleshooting & Production Considerations",
      "headingTh": "การแก้ปัญหาและข้อควรระวังในระดับ Production",
      "contentMarkdown": "### 1. ปัญหางานค้างไม่ยอมจบ (Stuck Jobs)\nหากแอปพลิเคชันใน Job เกิดข้อผิดพลาดและค้าง (Hang) พอดจะไม่ยอมปิดตัวลง ส่งผลให้กินทรัพยากรคลัสเตอร์ต่อเนื่อง\n* **วิธีแก้**: ควรกำหนด **`activeDeadlineSeconds`** ในระดับ `jobTemplate.spec` เช่น กำหนด `activeDeadlineSeconds: 600` (10 นาที) หากงานไม่เสร็จภายในเวลานี้ Kubernetes จะสั่ง Terminate พอดทิ้งทันที\n\n### 2. หลักการ Idempotency (ทำงานซ้ำได้ผลลัพธ์เดิม)\nตามสถาปัตยกรรมแบบกระจายศูนย์ของ Kubernetes ตัวควบคุม CronJob ทำงานบนหลักการ **\"at least once\" (รับประกันการรันอย่างน้อย 1 ครั้ง แต่อาจเกิดกรณีรันซ้ำซ้อนได้หาก Master Node เกิดการสลับผู้นำ Leader Election)**\n* งานที่รันใน CronJob จะต้องถูกออกแบบให้เป็น **Idempotent** (การรันซ้ำที่ข้อมูลเดิมต้องไม่ทำให้ระบบพังหรือสร้างข้อมูลซ้ำซ้อน)\n\n### 3. การลบทรัพยากรทั้งหมด\n```bash\nkubectl delete cronjob hello\n```\nคำสั่งนี้จะลบทั้งตัว CronJob และ Job พร้อม Pods ย้อนหลังทั้งหมดที่เคยถูกสร้างขึ้น"
    }
  ],
  "relatedLinks": [
    {
      "title": "Run a Stateless Application Using a Deployment",
      "targetType": "tasks",
      "targetPageId": "run-stateless-deployment",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/"
    },
    {
      "title": "Configure QoS for Pods",
      "targetType": "tasks",
      "targetPageId": "pod-quality-of-service",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/"
    },
    {
      "title": "Declarative and Imperative Management",
      "targetType": "tasks",
      "targetPageId": "manage-declarative-imperative",
      "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/"
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
