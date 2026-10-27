/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/workloads/controllers/job/
 */
(function (root) {
  const pageData = {
    "id": "workloads-jobs-cronjobs",
    "categoryId": "workloads",
    "categoryTitle": "Workloads",
    "titleEn": "Jobs",
    "titleTh": "จ็อบและครอนจ็อบ (Jobs and CronJobs) - การประมวลผลงานแบบแบตช์ตามกำหนดเวลา",
    "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/job/",
    "docsPath": "/docs/concepts/workloads/controllers/job/",
    "diagram": {
      "src": "images/docs/workload-controllers-hierarchy.svg",
      "caption": "สถาปัตยกรรม Job และ CronJob: ควบคุมการรันพอดจนกระทั่งทำงานสำเร็จ (Run-to-completion) และตั้งเวลาแบบ Periodic"
    },
    "lead": "จ็อบ (Job) สร้างพอดอย่างน้อยหนึ่งตัวเพื่อรันงานที่เมื่อทำเสร็จสิ้นตามเป้าหมายแล้วจะหยุดทำงาน (Run-to-completion Workload) แตกต่างจาก Deployment ที่รันค้างไว้ตลอดเวลา ส่วนครอนจ็อบ (CronJob) นำการทำงานของ Job มาสั่งให้รันซ้ำตามตารางเวลาที่กำหนดในลักษณะเดียวกับ crontab บน Linux",
    "sections": [
      {
        "id": "understanding-jobs",
        "headingEn": "Understanding Jobs",
        "headingTh": "ความเข้าใจเกี่ยวกับจ็อบ (Kubernetes Jobs)",
        "contentMarkdown": "ในขณะที่คอนโทรลเลอร์ส่วนใหญ่ (เช่น Deployments หรือ StatefulSets) ถูกออกแบบมาเพื่อรันแอปพลิเคชันที่ต้องเปิดทำงานต่อเนื่องตลอดเวลา (Continuous Workloads เช่น เว็บเซิร์ฟเวอร์หรือฐานข้อมูล) ออบเจกต์ **`Job`** ถูกออกแบบมาเพื่อรันงานที่ทำเสร็จแล้วจบไป (**Run-to-completion Workloads**)\n\n### วงจรการทำงานของ Job:\n* Job จะสร้างพอดขึ้นมา 1 ตัวหรือหลายตัว และคอยติดตามสถานะของพอดเหล่านั้น\n* เมื่อพอดทำงานเสร็จสมบูรณ์ตามเป้าหมาย (Exit Code 0) พอดจะหยุดทำงานและเปลี่ยนสถานะเป็น `Completed`\n* เมื่อจำนวนพอดที่ทำงานสำเร็จครบตามเป้าหมายที่ระบุใน `.spec.completions` ออบเจกต์ Job จะถือว่าประสบความสำเร็จสมบูรณ์ (Success) และไม่มีการสร้างพอดใหม่เพิ่มขึ้นมาอีก\n* พอดที่เสร็จแล้วจะไม่ถูกลบทิ้งทันที เพื่อให้ผู้ดูแลระบบยังคงสามารถเข้ามาดู Log และประวัติการทำงานได้"
      },
      {
        "id": "job-patterns-and-completion-modes",
        "headingEn": "Job Completion Modes & Parallel Execution",
        "headingTh": "โหมดการทำงานและรูปแบบการประมวลผลแบบขนาน",
        "contentMarkdown": "Kubernetes Job รองรับรูปแบบการประมวลผลงาน 3 สไตล์หลัก:\n\n1. **Non-parallel Jobs (งานตัวเดียวแบบมาตรฐาน)**:\n   * ไม่ระบุ `completions` และ `parallelism` (ค่าดีฟอลต์คือ 1)\n   * รันพอด 1 ตัวจนสำเร็จเสร็จสิ้น\n2. **Parallel Jobs with a fixed completion count**:\n   * กำหนด `completions: 10` และ `parallelism: 3`\n   * Job จะรันพอดพร้อมกันสูงสุด 3 ตัวไปเรื่อยๆ จนกระทั่งมีพอดทำงานสำเร็จครบ 10 ตัว จึงถือว่าจบงาน\n3. **Indexed Jobs (`completionMode: Indexed`)**:\n   * เป็นฟีเจอร์ระดับสูงสำหรับ Distributed Computing และ Batch Processing\n   * พอดแต่ละตัวจะได้รับตัวแปร Environment ชื่อ `JOB_COMPLETION_INDEX` เริ่มจาก `0` ถึง `completions - 1` ทำให้พอดสามารถรู้ได้ว่าตนเองต้องไปหยิบข้อมูล Chunk ลำดับใดมาประมวลผลโดยไม่ต้องพึ่งพา Queue กลาง"
      },
      {
        "id": "handling-failures-and-retries",
        "headingEn": "Handling Pod Failures, Retries, and Timeouts",
        "headingTh": "การรับมือข้อผิดพลาด การลองใหม่ (Retries) และ Timeouts",
        "contentMarkdown": "ฟิลด์สำคัญที่ใช้ควบคุมความเสถียรของ Job เมื่อเกิดข้อผิดพลาด:\n\n* **`restartPolicy`**: ภายใน Pod Template ของ Job อนุญาตให้ใช้ได้เพียง **`OnFailure`** (รีสตาร์ตคอนเทนเนอร์ในพอดเดิม) หรือ **`Never`** (ไม่รีสตาร์ตคอนเทนเนอร์เดิม แต่สร้างพอดตัวใหม่ขึ้นมาทดแทน)\n* **`backoffLimit` (ค่าดีฟอลต์ 6)**: จำนวนครั้งสูงสุดที่ยอมให้พอดล้มเหลว หากล้มเหลวเกินกว่านี้ Job จะหยุดทำงานและถูกตัดสินว่าล้มเหลวถาวร (Failed) โดยระบบจะหน่วงเวลาลองใหม่แบบทวีคูณ (Exponential Backoff: 10s, 20s, 40s...)\n* **`activeDeadlineSeconds`**: เวลาจำกัดสูงสุด (Timeout) ของ Job หาก Job ทำงานนานเกินกว่าเวลานี้ ระบบจะส่งคำสั่งฆ่าพอดทั้งหมดทิ้งและระบุสถานะว่า `DeadlineExceeded`\n* **`ttlSecondsAfterFinished`**: เวลาหน่วงเพื่อลบออบเจกต์ Job และพอดที่เกี่ยวข้องทิ้งอัตโนมัติหลังจากทำงานเสร็จ (เช่น ตั้งไว้ `3600` เพื่อให้ลบทิ้งหลังผ่านไป 1 ชั่วโมง)"
      },
      {
        "id": "understanding-cronjobs",
        "headingEn": "Understanding CronJobs & Scheduling Syntax",
        "headingTh": "ความเข้าใจเกี่ยวกับครอนจ็อบ (CronJobs) และการตั้งเวลา",
        "contentMarkdown": "**CronJob** ทำหน้าที่จัดการสร้างออบเจกต์ Job ซ้ำตามกำหนดเวลาอย่างสม่ำเสมอ เหมาะสำหรับงานประเภท:\n* การสำรองข้อมูล (Database Backup) ประจำวัน\n* การส่งอีเมลสรุปยอดขายตอนเที่ยงคืน\n* การรัน Cleanup สคริปต์ทำความสะอาดไฟล์ชั่วคราวทุกชั่วโมง\n\n### ไวยากรณ์ตารางเวลา (Cron Schedule Syntax):\nใช้รูปแบบ 5 ช่องมาตรฐานของ UNIX crontab:\n\n```text\n# ┌───────────── นาที (0 - 59)\n# │ ┌────────────── ชั่วโมง (0 - 23)\n# │ │ ┌─────────────── วันของเดือน (1 - 31)\n# │ │ │ ┌──────────────── เดือน (1 - 12)\n# │ │ │ │ ┌───────────────── วันของสัปดาห์ (0 - 6) (0 = วันอาทิตย์)\n# │ │ │ │ │\n# * * * * *\n```\n\nตัวอย่าง: `0 2 * * *` (รันตอนตีสองของทุกวัน), `*/15 * * * *` (รันทุกๆ 15 นาที)\n\n> [!NOTE]\n> ใน Kubernetes 1.27+ คุณสามารถระบุฟิลด์ `.spec.timeZone` (เช่น `timeZone: \"Asia/Bangkok\"`) เพื่อให้การนับเวลาตรงตาม Timezone ท้องถิ่นแทนที่จะเป็นเวลา UTC ได้อย่างแม่นยำ"
      },
      {
        "id": "cronjob-concurrency-policies",
        "headingEn": "Concurrency Policies and Deadline Limits",
        "headingTh": "นโยบายการทำงานซ้อนทับ (Concurrency Policy)",
        "contentMarkdown": "หากรอบการทำงานของ Job ใช้เวลานานกว่าช่วงเวลาความถี่ของ CronJob (เช่น Job รันนาน 30 นาที แต่ CronJob สั่งรันทุก 15 นาที) อาจเกิดเหตุการณ์ Job สองรอบรันชนกัน ฟิลด์ **`.spec.concurrencyPolicy`** กำหนดวิธีรับมือ:\n\n* **`Allow` (ค่าเริ่มต้น)**: อนุญาตให้ Job ที่สร้างขึ้นใหม่รันคู่ขนานไปพร้อมกับ Job รอบเก่ายังทำงานไม่เสร็จได้\n* **`Forbid` (แนะนำสำหรับงานประมวลผลข้อมูล)**: หากรอบเก่ายังรันไม่เสร็จ ระบบจะ **ข้าม (Skip)** ไม่ยอมเริ่มรัน Job รอบใหม่จนกว่ารอบเก่าจะเสร็จสมบูรณ์ ป้องกันปัญหาแย่งกันเขียนไฟล์หรือ Lock ตารางในฐานข้อมูล\n* **`Replace`**: หากรอบใหม่ถึงเวลาเริ่ม แต่รอบเก่ายังค้างอยู่ ระบบจะ **ฆ่า (Cancel/Kill) Job รอบเก่าทิ้งทันที** แล้วเริ่มรันรอบใหม่ขึ้นมาแทน\n\nนอกจากนี้ ควรกำหนด **`startingDeadlineSeconds`** เพื่อระบุว่าหากมีเหตุทำให้ CronJob ไม่สามารถสร้าง Job ได้ตามเวลา (เช่น Control Plane ดับชั่วคราว) ยอมให้เริ่มย้อนหลังได้ไม่เกินกี่วินาที"
      },
      {
        "id": "manifest-examples-and-cli",
        "headingEn": "Comprehensive Manifests & kubectl Commands",
        "headingTh": "ตัวอย่าง Manifest สมบูรณ์และคำสั่งจัดการ Job / CronJob",
        "contentMarkdown": "ตัวอย่าง Manifest ของ CronJob ที่รันทุกตีหนึ่งตามเวลาประเทศไทย โดยตั้งค่านโยบายไม่ให้รันชนกัน (`concurrencyPolicy: Forbid`):",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "daily-backup-cronjob.yaml",
            "code": "apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: db-backup\nspec:\n  schedule: \"0 1 * * *\"\n  timeZone: \"Asia/Bangkok\"\n  concurrencyPolicy: Forbid\n  successfulJobsHistoryLimit: 3\n  failedJobsHistoryLimit: 1\n  jobTemplate:\n    spec:\n      backoffLimit: 2\n      activeDeadlineSeconds: 1800\n      ttlSecondsAfterFinished: 86400\n      template:\n        spec:\n          restartPolicy: OnFailure\n          containers:\n          - name: backup-runner\n            image: postgres:15-alpine\n            command:\n            - /bin/sh\n            - -c\n            - \"echo 'Starting PostgreSQL backup...' && sleep 10 && echo 'Backup finished successfully'\""
          },
          {
            "lang": "shell",
            "label": "คำสั่ง kubectl สำหรับจัดการ Job และ CronJob",
            "code": "# ดูรายการ CronJob ทั้งหมด\nkubectl get cronjob\n\n# ดูรายการ Job ที่ถูกสร้างขึ้น\nkubectl get jobs --watch\n\n# สั่ง Trigger รัน CronJob ทันทีด้วยตนเอง (Manual Run) โดยไม่ต้องรอตารางเวลา\nkubectl create job --from=cronjob/db-backup manual-backup-test\n\n# หยุดพักการทำงานของ CronJob ชั่วคราว (Suspend)\nkubectl patch cronjob db-backup -p '{\"spec\":{\"suspend\":true}}'\n\n# สั่งให้ CronJob กลับมาทำงานตามปกติ (Resume)\nkubectl patch cronjob db-backup -p '{\"spec\":{\"suspend\":false}}'"
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
        "title": "Sidecar Containers (การทำงานร่วมกับ Job)",
        "targetType": "concepts",
        "targetPageId": "workloads-sidecar-containers",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/"
      },
      {
        "title": "Running Automated Tasks with a CronJob (Task)",
        "targetType": "tasks",
        "targetPageId": "job-cronjobs-work-queue",
        "officialUrl": "https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/"
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
