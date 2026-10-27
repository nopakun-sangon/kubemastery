/**
 * KubeMastery: Course CKAD - Certified Kubernetes Application Developer
 * Complete syllabus aligned 100% with Linux Foundation & CNCF Official Exam Guidelines.
 */

window.COURSE_CKAD = {
  "id": "course-ckad",
  "badge": "CKAD",
  "title": "CKAD: Certified Kubernetes Application Developer",
  "subtitle": "หลักสูตรเตรียมสอบ CKAD ฉบับสมบูรณ์ อ้างอิงตาม CNCF Official Curriculum ล่าสุด",
  "description": "ครอบคลุมเนื้อหาทั้ง 5 หมวดหลักของการสอบ CKAD: Application Design & Build (20%), Application Deployment (20%), Application Observability & Maintenance (15%), App Configuration & Security (25%), และ Services & Networking (20%)",
  "icon": "📦",
  "color": "from-purple-600 via-indigo-600 to-blue-500",
  "badgeColor": {
    "bg": "bg-purple-100 dark:bg-purple-950",
    "text": "text-purple-700 dark:text-purple-300",
    "border": "border-purple-200 dark:border-purple-800"
  },
  "blocks": [
    {
      "id": "ckad-b1",
      "title": "Domain 1: Application Design and Build (20%)",
      "titleTh": "การออกแบบและสร้างแอปพลิเคชันบน Kubernetes",
      "icon": "🏗️",
      "category": "design",
      "description": "ทำความเข้าใจ Pod Lifecycle, Multi-container design patterns (Sidecar, Adapter, Ambassador), Native Sidecar containers, Jobs, CronJobs และ Ephemeral Volumes",
      "units": [
        {
          "id": "ckad-u1-1",
          "title": "Unit 1.1: Pod Lifecycle, Container Phases & Restart Policies",
          "summary": "เจาะลึกสถานะวงจรชีวิตของ Pod (Pending, Running, Succeeded, Failed), Init Containers และนโยบาย restartPolicy",
          "docsUrl": "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/",
          "docsKeyword": "Pod Lifecycle",
          "blueprint": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: lifecycle-demo\nspec:\n  restartPolicy: OnFailure # Always (default), OnFailure, Never\n  initContainers:\n  - name: init-myservice\n    image: busybox:1.36\n    command: ['sh', '-c', 'until nc -z -w 2 db-service 3306; do echo waiting for db; sleep 2; done']\n  containers:\n  - name: app-container\n    image: nginx:alpine",
          "explanation": "### วงจรชีวิตของ Pod ตามเอกสารทางการ Kubernetes\nPod จะผ่านขั้นตอนต่างๆ นับตั้งแต่ถูกสร้างโดย API Server จนกระทั่งทำงานเสร็จสิ้น:\n\n1. **Pod Phases**:\n   * **Pending**: Pod ได้รับการยอมรับจาก API Server แล้ว แต่ยังรันคอนเทนเนอร์ไม่ได้ (กำลังรอ Scheduler เลือกโหนด หรือกำลังดึง Container Image)\n   * **Running**: Pod ถูกผูกกับโหนดแล้ว และมีคอนเทนเนอร์อย่างน้อยหนึ่งตัวกำลังทำงาน หรือกำลังเริ่มต้น/รีสตาร์ต\n   * **Succeeded**: คอนเทนเนอร์ทั้งหมดใน Pod ทำงานเสร็จสิ้นด้วย exit code 0 และจะไม่ถูกรีสตาร์ตอีก (มักพบใน Jobs)\n   * **Failed**: คอนเทนเนอร์ทั้งหมดใน Pod ยุติการทำงาน และมีอย่างน้อยหนึ่งคอนเทนเนอร์ที่ล้มเหลว (exit code != 0)\n   * **Unknown**: ไม่สามารถสื่อสารกับโหนดที่ Pod รันอยู่ได้\n\n2. **Init Containers**:\n   * ทำงานแบบตามลำดับ (Sequential) ทีละตัวจนเสร็จสมบูรณ์ (exit code 0) ก่อนที่แอปพลิเคชันหลักจะเริ่มต้น\n   * หาก Init Container ล้มเหลว Kubernetes จะรีสตาร์ต Pod ซ้ำๆ ตามนโยบาย restartPolicy จนกว่าจะสำเร็จ\n   * นิยมใช้สำหรับรอ External dependencies พร้อมทำงาน (เช่น ฐานข้อมูล) หรือดาวน์โหลดค่า Configuration\n\n3. **restartPolicy**:\n   * **Always**: รีสตาร์ตคอนเทนเนอร์ทันทีเมื่อหยุดทำงาน (ค่าเริ่มต้นของ Pod ทั่วไปและ Deployment)\n   * **OnFailure**: รีสตาร์ตเฉพาะเมื่อคอนเทนเนอร์ exit ด้วย code ที่ไม่เท่ากับ 0 (แนะนำสำหรับ Job)\n   * **Never**: ไม่รีสตาร์ตคอนเทนเนอร์เลย ไม่ว่าจะจบด้วย code ใดก็ตาม",
          "examples": [
            {
              "desc": "สร้าง Pod ที่มี restartPolicy เป็น Never สำหรับงาน One-time task",
              "cmd": "kubectl run one-time --image=busybox --restart=Never $do -- sh -c 'echo Done' > one-time.yaml",
              "yaml": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: one-time\nspec:\n  restartPolicy: Never\n  containers:\n  - name: one-time\n    image: busybox\n    command: [\"sh\", \"-c\", \"echo Done\"]"
            },
            {
              "desc": "ตรวจสอบ Phase และ Container Statuses ของ Pod",
              "cmd": "kubectl get pod lifecycle-demo -o jsonpath='{.status.phase}{\"\\n\"}{range .status.containerStatuses[*]}{.name}{\": \"}{.state}{\"\\n\"}{end}'"
            }
          ],
          "examTips": [
            "จำไว้ว่า restartPolicy ใช้กำหนดที่ระดับ Pod Spec ไม่ใช่ระดับ Container Spec",
            "หากข้อสอบให้เขียน Init Container ให้ตรวจดูว่า indentation ตรงกับ containers หรือไม่ (initContainers อยู่ระดับเดียวกับ containers)",
            "ถ้า Pod ติดสถานะ CrashLoopBackOff ให้เช็ก 'kubectl logs <pod> --previous' เพื่อดู error ก่อนที่ container จะตาย"
          ],
          "quickCheck": {
            "question": "หากต้องการให้คอนเทนเนอร์ใน Pod รีสตาร์ตเฉพาะเมื่อเกิดข้อผิดพลาด (Non-zero exit code) ต้องตั้งค่า restartPolicy เป็นค่าใด?",
            "options": [
              "Always",
              "OnFailure",
              "Never",
              "OnError"
            ],
            "answer": 1,
            "explanation": "OnFailure จะสั่งให้ Kubelet รีสตาร์ตคอนเทนเนอร์เฉพาะเมื่อตัวโปรเซสจบการทำงานด้วย Exit code ที่ไม่ใช่ 0"
          }
        },
        {
          "id": "ckad-u1-2",
          "title": "Unit 1.2: Multi-Container Patterns & Native Sidecars",
          "summary": "การออกแบบ Pod แบบหลายคอนเทนเนอร์: Sidecar, Adapter, Ambassador และฟีเจอร์ Native Sidecar (K8s 1.28+)",
          "docsUrl": "https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/",
          "docsKeyword": "Sidecar Containers",
          "blueprint": "# Native Sidecar Container (Kubernetes 1.28+)\napiVersion: v1\nkind: Pod\nmetadata:\n  name: web-with-native-sidecar\nspec:\n  initContainers:\n  - name: vault-agent\n    image: hashicorp/vault:1.13.0\n    restartPolicy: Always # <--- หัวใจสำคัญของ Native Sidecar!\n    command: [\"vault\", \"agent\", \"-config=/etc/vault/vault-agent-config.hcl\"]\n  containers:\n  - name: main-app\n    image: nginx:alpine",
          "explanation": "### รูปแบบ Multi-Container Patterns ตามหลักสูตร CKAD\nคอนเทนเนอร์ใน Pod เดียวกันจะแชร์ Network Namespace (localhost) และ Storage Volumes ร่วมกัน:\n\n1. **Sidecar Pattern**: คอนเทนเนอร์ตัวรองที่ช่วยเสริมการทำงานของคอนเทนเนอร์หลัก เช่น คอนเทนเนอร์อ่าน log file ที่แอปพลิเคชันหลักเขียนลง Shared Volume แล้วส่งต่อไปยังระบบศูนย์กลาง\n2. **Adapter Pattern**: ปรับรูปแบบ Output ของคอนเทนเนอร์หลักให้เป็นมาตรฐาน เช่น แปลง Log Format หรือปรับแต่ง Metrics ให้ Prometheus ดึงไปอ่านได้\n3. **Ambassador Pattern**: ทำหน้าที่เป็น Proxy ตัวแทนในการเชื่อมต่อกับโลกภายนอก เช่น ทำ Database Proxy หรือ Local Redis Cache ให้แอปหลักต่อ localhost:6379 แล้วตัวมันจัดการ route ข้ามคลัสเตอร์\n4. **Native Sidecar Containers (K8s 1.28+)**:\n   * ในอดีต Sidecar แบบเดิมถูกวางไว้ใน `spec.containers` ทำให้ไม่สามารถรับประกันได้ว่า Sidecar จะเริ่มทำงานก่อนแอปหลัก และอาจดับก่อนแอปหลักทำงานเสร็จ\n   * K8s 1.28 แนะนำ **Native Sidecars** โดยใส่ไว้ใน `spec.initContainers` แต่เพิ่ม `restartPolicy: Always`\n   * Kubelet จะรัน Sidecar ตัวนี้ขึ้นมาก่อน รอจน Startup probe ผ่าน แล้วจึงเริ่มรันคอนเทนเนอร์หลัก และ Sidecar จะทำงานต่อไปเรื่อยๆ ตลอดอายุขัยของ Pod",
          "examples": [
            {
              "desc": "Sidecar Pattern ดั้งเดิมที่แชร์ข้อมูลผ่าน emptyDir Volume",
              "yaml": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: log-collector-pod\nspec:\n  volumes:\n  - name: log-volume\n    emptyDir: {}\n  containers:\n  - name: app\n    image: busybox\n    command: [\"sh\", \"-c\", \"while true; do date >> /var/log/app.log; sleep 1; done\"]\n    volumeMounts:\n    - name: log-volume\n      mountPath: /var/log\n  - name: sidecar\n    image: busybox\n    command: [\"sh\", \"-c\", \"tail -F /var/log/app.log\"]\n    volumeMounts:\n    - name: log-volume\n      mountPath: /var/log"
            },
            {
              "desc": "เข้าถึงคอนเทนเนอร์ตัวที่สองใน Multi-container Pod ผ่าน CLI",
              "cmd": "kubectl logs log-collector-pod -c sidecar -f"
            }
          ],
          "examTips": [
            "เวลาดู log ของ Pod ที่มีหลายคอนเทนเนอร์ ถ้าไม่ใส่ '-c <container-name>' คำสั่งจะ error ให้ระบุชื่อเสมอ",
            "โจทย์สอบมักจะให้ Shared Volume แบบ emptyDir เพื่อให้คอนเทนเนอร์ตัวหนึ่งเขียนไฟล์ และอีกตัวหนึ่งอ่าน"
          ],
          "quickCheck": {
            "question": "ฟิลด์ใดที่ทำให้ Init Container กลายเป็น Native Sidecar Container ที่ทำงานต่อเนื่องตลอดอายุขัยของ Pod?",
            "options": [
              "type: Sidecar ใน spec.initContainers",
              "restartPolicy: Always ใน spec.initContainers",
              "isSidecar: true ใน spec.containers",
              "lifecycle: native ใน metadata"
            ],
            "answer": 1,
            "explanation": "ใน Kubernetes 1.28+ การระบุ restartPolicy: Always ภายใน initContainers จะเปลี่ยนคอนเทนเนอร์นั้นให้กลายเป็น Native Sidecar ทันที"
          }
        },
        {
          "id": "ckad-u1-3",
          "title": "Unit 1.3: Jobs, CronJobs & Concurrency Policies",
          "summary": "การประมวลผลงานแบบ Batch processing ด้วย Job, การตั้งเวลาด้วย CronJob และการจัดการการทำงานทับซ้อน",
          "docsUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/",
          "docsKeyword": "CronJob",
          "blueprint": "apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: batch-processor\nspec:\n  schedule: \"*/5 * * * *\" # ทุก 5 นาที\n  concurrencyPolicy: Forbid # Allow, Forbid, Replace\n  startingDeadlineSeconds: 100\n  successfulJobsHistoryLimit: 3\n  failedJobsHistoryLimit: 1\n  jobTemplate:\n    spec:\n      completions: 3\n      parallelism: 1\n      backoffLimit: 4\n      template:\n        spec:\n          restartPolicy: OnFailure\n          containers:\n          - name: worker\n            image: busybox\n            command: [\"sh\", \"-c\", \"echo Batch job finished\"]",
          "explanation": "### การจัดการ Batch Processing ด้วย Job และ CronJob\n1. **Job Primitives**:\n   * `completions`: จำนวน Pod ที่ต้องทำงานจบสำเร็จ (exit 0) Job จึงจะถือว่าเสร็จสมบูรณ์\n   * `parallelism`: จำนวน Pod สูงสุดที่อนุญาตให้รันพร้อมกันได้ในเวลาหนึ่งๆ\n   * `backoffLimit`: จำนวนครั้งที่ยอมให้ Pod ล้มเหลวก่อนที่จะประกาศว่า Job นั้นล้มเหลว (ค่าเริ่มต้นคือ 6)\n   * `activeDeadlineSeconds`: กำหนดเวลาสูงสุด (วินาที) ที่ยอมให้ Job ทำงาน หากเกินเวลา Kubelet จะ Terminate Pod ทันที\n\n2. **CronJob Concurrency Policies**:\n   * **Allow** (default): อนุญาตให้ Job ที่ตั้งเวลาไว้รันพร้อมกันได้ แม้ Job ก่อนหน้ายังทำงานไม่เสร็จ\n   * **Forbid**: หาก Job ก่อนหน้ายังรันค้างอยู่ จะข้ามรอบการทำงานปัจจุบันไป ไม่อนุญาตให้รันซ้อนกัน\n   * **Replace**: หาก Job ก่อนหน้ายังรันค้างอยู่ จะสั่งยกเลิก (Terminate) ตัวเดิม แล้วเริ่มรันตัวใหม่ทันที",
          "examples": [
            {
              "desc": "สร้าง Job แบบ Imperative พร้อม arguments",
              "cmd": "kubectl create job calc-job --image=busybox $do -- sh -c 'expr 10 + 20' > calc-job.yaml"
            },
            {
              "desc": "สร้าง CronJob รันทุกวันเวลา 03:30 AM",
              "cmd": "kubectl create cronjob nightly-backup --image=busybox --schedule='30 3 * * *' $do -- sh -c 'echo backup' > cron.yaml"
            },
            {
              "desc": "สั่งให้ CronJob เริ่มรัน Job ทันทีแบบ Manual (Ad-hoc trigger)",
              "cmd": "kubectl create job --from=cronjob/nightly-backup manual-test-01"
            }
          ],
          "examTips": [
            "จำรูปแบบฟิลด์ Cron: นาที (0-59) ชั่วโมง (0-23) วันที่ (1-31) เดือน (1-12) วันในสัปดาห์ (0-6)",
            "ใน Pod Spec ของ Job: ค่า restartPolicy ต้องเป็น 'OnFailure' หรือ 'Never' เท่านั้น ห้ามเป็น 'Always'",
            "หากต้องการลบ Pods ทั้งหมดที่สร้างขึ้นโดย Job ให้สั่งลบที่ตัว Job object"
          ],
          "quickCheck": {
            "question": "หากต้องการป้องกันไม่ให้ CronJob สร้าง Job ใหม่ขึ้นมาทำงานทับซ้อนกับ Job เดิมที่ยังรันไม่เสร็จ ต้องตั้งค่า concurrencyPolicy เป็นค่าใด?",
            "options": [
              "Replace",
              "Never",
              "Forbid",
              "Strict"
            ],
            "answer": 2,
            "explanation": "concurrencyPolicy: Forbid จะตรวจสอบว่าหากมี Job จากรอบก่อนหน้ายังรันไม่เสร็จ จะข้ามรอบปัจจุบันไปทันที"
          }
        },
        {
          "id": "ckad-u1-4",
          "title": "Unit 1.4: Ephemeral Volumes (emptyDir & downwardAPI)",
          "summary": "การใช้งาน Volumes ชั่วคราว: emptyDir สำหรับแชร์ข้อมูลระหว่างคอนเทนเนอร์ และ downwardAPI สำหรับส่งออก Metadata",
          "docsUrl": "https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/",
          "docsKeyword": "Ephemeral Volumes",
          "blueprint": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: ephemeral-demo\n  labels:\n    tier: frontend\nspec:\n  volumes:\n  - name: shared-cache\n    emptyDir:\n      medium: Memory # ใช้ RAM สร้าง RAM-disk\n      sizeLimit: 64Mi\n  - name: pod-info\n    downwardAPI:\n      items:\n      - path: \"labels\"\n        fieldRef:\n          fieldPath: metadata.labels\n  containers:\n  - name: web\n    image: nginx:alpine\n    volumeMounts:\n    - name: shared-cache\n      mountPath: /cache\n    - name: pod-info\n      mountPath: /etc/podinfo",
          "explanation": "### ชนิดของ Ephemeral Volumes ที่พบบ่อยในข้อสอบ CKAD\n1. **emptyDir**:\n   * ถูกสร้างขึ้นพร้อมกับที่ Pod ถูก assign ลงบนโหนด และคงอยู่ตราบเท่าที่ Pod นั้นยังรันอยู่บนโหนดเดิม\n   * ข้อมูลจะคงอยู่แม้คอนเทนเนอร์ภายใน Pod จะรีสตาร์ตหรือ crash\n   * เมื่อ Pod ถูกลบออกจากโหนด ข้อมูลใน emptyDir จะถูกทำลายทิ้งถาวร\n   * การใส่ `medium: Memory` จะสั่งให้ Kubelet สร้าง `tmpfs` (RAM-backed filesystem) ทำให้การอ่านเขียนเร็วมาก เหมาะสำหรับ Cache\n\n2. **downwardAPI Volume**:\n   * อนุญาตให้คอนเทนเนอร์เข้าถึง Metadata ของตนเอง (เช่น Pod Name, Namespace, Labels, Annotations, Resource limits) ในรูปแบบของไฟล์ข้อความ",
          "examples": [
            {
              "desc": "สร้าง Pod พร้อม emptyDir ผ่าน YAML Template",
              "yaml": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: cache-worker\nspec:\n  volumes:\n  - name: scratch-pad\n    emptyDir: {}\n  containers:\n  - name: worker\n    image: redis:alpine\n    volumeMounts:\n    - name: scratch-pad\n      mountPath: /data/scratch"
            }
          ],
          "examTips": [
            "emptyDir ไม่ต้องใช้ PersistentVolume (PV) หรือ StorageClass สามารถประกาศใน Pod spec ได้ทันที",
            "หากข้อสอบสั่งให้ mount โฟลเดอร์ชั่วคราวระหว่าง 2 คอนเทนเนอร์ ให้ใช้ emptyDir เสมอ"
          ],
          "quickCheck": {
            "question": "ข้อใดเป็นจริงเกี่ยวกับ emptyDir volume ใน Kubernetes?",
            "options": [
              "ข้อมูลจะยังคงอยู่แม้ Pod จะถูกลบออกจากคลัสเตอร์",
              "ข้อมูลจะถูกล้างทิ้งทันทีที่คอนเทนเนอร์หนึ่งใน Pod รีสตาร์ต",
              "ข้อมูลจะคงอยู่ข้ามการรีสตาร์ตของคอนเทนเนอร์ แต่จะถูกลบทิ้งเมื่อ Pod ถูกลบออกจากโหนด",
              "ต้องมี PersistentVolumeClaim ผูกอยู่ด้วยเสมอจึงจะใช้งานได้"
            ],
            "answer": 2,
            "explanation": "emptyDir ผูกติดอยู่กับอายุขัยของ Pod ข้อมูลจะปลอดภัยจากการรีสตาร์ตของคอนเทนเนอร์ แต่จะถูกลบทิ้งเมื่อ Pod ถูกทำลาย"
          }
        }
      ]
    },
    {
      "id": "ckad-b2",
      "title": "Domain 2: Application Deployment & Management (20%)",
      "titleTh": "การจัดการและ Deploy แอปพลิเคชัน",
      "icon": "🚀",
      "category": "deploy",
      "description": "ทำความเข้าใจ Deployments, Rolling Updates, Rollouts History, Rollback, Blue/Green, Canary, Helm 3 และ Kustomize",
      "units": [
        {
          "id": "ckad-u2-1",
          "title": "Unit 2.1: Deployments, Rolling Updates & History Revision Rollback",
          "summary": "การจัดการ Deployments, การตั้งค่ายุทธศาสตร์ maxSurge/maxUnavailable, และคำสั่ง Rollout History/Undo",
          "docsUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/",
          "docsKeyword": "Deployment RollingUpdate",
          "blueprint": "# 1. อัปเดต Image และบันทึกคำสั่ง\nkubectl set image deployment/frontend-app web=nginx:1.25 --record\n\n# 2. ตรวจสอบสถานะการ Rollout\nkubectl rollout status deployment/frontend-app\n\n# 3. ดูประวัติและสาเหตุของการแก้ไข (History & Change-Cause)\nkubectl rollout history deployment/frontend-app\n\n# 4. ย้อนการอัปเดตกลับไปยัง Revision ที่ต้องการ (Rollback)\nkubectl rollout undo deployment/frontend-app --to-revision=2",
          "explanation": "### ยุทธศาสตร์การอัปเดต RollingUpdate\nDeployment รองรับสองยุทธศาสตร์หลัก: `Recreate` (สั่งดับ Pod เดิมทั้งหมดก่อนสร้างใหม่) และ `RollingUpdate` (ค่อยๆ อัปเดตทีละส่วนโดยไม่มี Downtime)\n\nฟิลด์สำคัญใน `spec.strategy.rollingUpdate`:\n* **maxSurge**: จำนวน Pod สูงสุดที่อนุญาตให้มีเกินจำนวน replicas ที่กำหนดไว้ในระหว่างอัปเดต (อาจระบุเป็นจำนวนเต็ม เช่น `1` หรือเปอร์เซ็นต์ เช่น `25%`)\n* **maxUnavailable**: จำนวน Pod สูงสุดที่ยอมให้ไม่พร้อมให้บริการในระหว่างอัปเดต\n\n**Revision History**:\nทุกครั้งที่มีการแก้ไข Pod Template ใน Deployment (เช่น แก้ image, env, labels) Kubernetes จะสร้าง ReplicaSet ตัวใหม่ขึ้นมาคุม Pod ชุดใหม่ หากต้องการย้อนกลับ ให้ใช้คำสั่ง `kubectl rollout undo`",
          "examples": [
            {
              "desc": "สร้าง Deployment พร้อม RollingUpdate Strategy แบบกำหนดเอง",
              "yaml": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-deploy\nspec:\n  replicas: 4\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0 # รับประกันว่าระบบจะไม่ลดจำนวน Pod ต่ำกว่า 4\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:1.24\n        ports:\n        - containerPort: 80"
            },
            {
              "desc": "หยุดพัก (Pause) และเริ่มทำ Rollout ต่อ (Resume)",
              "cmd": "kubectl rollout pause deploy/web-deploy && kubectl rollout resume deploy/web-deploy"
            }
          ],
          "examTips": [
            "ถ้าข้อสอบสั่งให้ rollback ให้รัน 'kubectl rollout undo deploy/<name>' หรือใส่ '--to-revision=<n>' ตามที่โจทย์ระบุ",
            "หากต้องการดูรายละเอียดของ revision เจาะจง ให้ใช้ 'kubectl rollout history deploy/<name> --revision=2'"
          ],
          "quickCheck": {
            "question": "หากมี Deployment 4 replicas และกำหนด maxSurge: 1, maxUnavailable: 0 ในระหว่างที่กำลัง RollingUpdate จะมีจำนวน Pod สูงสุดและต่ำสุดได้กี่ตัวตามลำดับ?",
            "options": [
              "สูงสุด 5 ตัว, ต่ำสุด 4 ตัว",
              "สูงสุด 4 ตัว, ต่ำสุด 3 ตัว",
              "สูงสุด 5 ตัว, ต่ำสุด 3 ตัว",
              "สูงสุด 6 ตัว, ต่ำสุด 4 ตัว"
            ],
            "answer": 0,
            "explanation": "maxSurge: 1 ยอมให้เกินได้ 1 (4 + 1 = 5 ตัว) และ maxUnavailable: 0 ไม่อนุญาตให้ Pod ขาด ทำให้มีอย่างน้อย 4 ตัวตลอดเวลา"
          }
        },
        {
          "id": "ckad-u2-2",
          "title": "Unit 2.2: Advanced Deployment Strategies (Blue/Green & Canary)",
          "summary": "การประยุกต์ใช้ Selector ของ Service เพื่อสลับทราฟฟิก (Blue/Green) และการกระจายโหลดตามสัดส่วน Pod (Canary)",
          "docsUrl": "https://kubernetes.io/docs/concepts/cluster-administration/manage-deployment/",
          "docsKeyword": "Canary Deployments",
          "blueprint": "# Blue/Green Deployment: สลับ Traffic ด้วย Service Selector\nkubectl patch service app-service -p '{\"spec\":{\"selector\":{\"version\":\"v2\"}}}'",
          "explanation": "### ยุทธศาสตร์การ Deploy ขั้นสูงใน Kubernetes\n1. **Blue/Green Deployment**:\n   * มี Deployments 2 ชุดรันอยู่พร้อมกัน: ชุดเดิม (Blue, เช่น `version: v1`) และชุดใหม่ (Green, เช่น `version: v2`)\n   * Service จะชี้ไปที่ Blue อยู่\n   * เมื่อทดสอบ Green จนมั่นใจแล้ว จะแก้ไข `spec.selector` ของ Service ให้ชี้ไปยัง Green ทันที (สลับทราฟฟิกแบบ 100% ทันที)\n   * หากเกิดปัญหา สามารถ patch selector กลับไปที่ Blue ได้ภายในเสี้ยววินาที\n\n2. **Canary Deployment**:\n   * ปล่อยแอปพลิเคชันเวอร์ชันใหม่ไปให้ผู้ใช้งานเพียงกลุ่มเล็กๆ ทดสอบก่อน\n   * ใน Kubernetes ทำได้โดยให้ Deployments ทั้งสองเวอร์ชันมี Label ร่วมกันตัวหนึ่ง (เช่น `app: web`) เพื่อให้ Service ตัวเดียวกันส่งทราฟฟิกมาหาทั้งคู่\n   * ควบคุมสัดส่วนทราฟฟิกผ่านจำนวน Pod (เช่น เวอร์ชันเก่า 9 Pods, เวอร์ชันใหม่ 1 Pod = ทราฟฟิกใหม่ประมาณ 10%)",
          "examples": [
            {
              "desc": "Canary Strategy: สร้าง Deployment เวอร์ชันทดสอบ (1 Pod)",
              "yaml": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-canary\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: frontend\n      track: canary\n  template:\n    metadata:\n      labels:\n        app: frontend\n        track: canary\n    spec:\n      containers:\n      - name: web\n        image: nginx:alpine-slim"
            }
          ],
          "examTips": [
            "ข้อสอบ CKAD มักทดสอบความเข้าใจเรื่อง Service Selector ว่าจะแมปเข้ากับ Label ใด",
            "จำไว้ว่า Service จะกระจายโหลดแบบ Round-robin ไปยังทุก Pod ที่มี Labels ครบถ้วนตาม Selector ของ Service"
          ],
          "quickCheck": {
            "question": "ในสถาปัตยกรรม Blue/Green Deployment การสลับทราฟฟิกทั้งหมดจากเวอร์ชันเดิมไปยังเวอร์ชันใหม่กระทำที่ Resource ชนิดใด?",
            "options": [
              "Service (แก้ไข spec.selector)",
              "Ingress (ลบ host เดิม)",
              "ConfigMap (แก้ IP)",
              "ReplicaSet (สลับชื่อ)"
            ],
            "answer": 0,
            "explanation": "หัวใจของ Blue/Green คือการแก้ไข Selector ของ Service เพื่อให้ Service หันไปส่งแพ็กเก็ตให้กับ Pods ชุดใหม่ทันที"
          }
        },
        {
          "id": "ckad-u2-3",
          "title": "Unit 2.3: Helm 3 Package Manager In-Depth",
          "summary": "การติดตั้ง ตรวจสอบค่าคอนฟิก อัปเกรด และ Rollback แอปพลิเคชันด้วยคำสั่ง Helm CLI ในห้องสอบ",
          "docsUrl": "https://helm.sh/docs/intro/using_helm/",
          "docsKeyword": "Using Helm",
          "blueprint": "# 1. เพิ่มและอัปเดต Helm Repository\nhelm repo add bitnami https://charts.bitnami.com/bitnami\nhelm repo update\n\n# 2. ค้นหา Chart ที่ต้องการ\nhelm search repo redis\n\n# 3. ติดตั้ง Release พร้อม override ค่า values\nhelm install my-cache bitnami/redis --set auth.enabled=false --namespace cache-ns --create-namespace\n\n# 4. ดูรายการ Release และประวัติการแก้ไข\nhelm list -A\nhelm history my-cache -n cache-ns\n\n# 5. ย้อนกลับไปยัง Revision ก่อนหน้า\nhelm rollback my-cache 1 -n cache-ns",
          "explanation": "### การใช้งาน Helm ในการสอบ CKAD\nHelm ทำหน้าที่เป็น Package Manager สำหรับ Kubernetes โดยรวบรวมไฟล์ YAML ทั้งหมดไว้ในแพ็กเกจที่เรียกว่า **Chart**\n\n**คำสั่งหลักที่ต้องใช้ในห้องสอบ:**\n1. `helm list -A`: แสดงรายการ Release ทั้งหมดในทุก Namespace\n2. `helm install <release-name> <chart> -f values.yaml`: ติดตั้งแอปพลิเคชันจากไฟล์ values\n3. `helm upgrade <release-name> <chart> --set key=value`: ปรับแต่งค่าของ Release\n4. `helm rollback <release-name> <revision>`: กู้คืนเวอร์ชันหากเกิดข้อผิดพลาด\n5. `helm uninstall <release-name> -n <ns>`: ถอนการติดตั้ง",
          "examples": [
            {
              "desc": "ดาวน์โหลด values.yaml ออกมาแก้ไขในเครื่อง",
              "cmd": "helm show values bitnami/nginx > /tmp/nginx-values.yaml"
            },
            {
              "desc": "อัปเกรด release พร้อมส่งไฟล์ values ที่แก้ไขแล้ว",
              "cmd": "helm upgrade my-web bitnami/nginx -f /tmp/nginx-values.yaml -n prod"
            }
          ],
          "examTips": [
            "อย่าลืมใส่ flag '-n <namespace>' ในทุกคำสั่งของ Helm เสมอ เพราะ Helm จะค้นหา Release ใน namespace default หากไม่ได้ระบุ",
            "หากข้อสอบให้ override ค่าคอนฟิกเดี่ยวๆ ให้ใช้ flag '--set key=value' จะเร็วกว่าการสร้างไฟล์ values.yaml ใหม่"
          ],
          "quickCheck": {
            "question": "คำสั่งใดใช้ย้อนกลับ Helm Release ชื่อ 'webapp' ใน namespace 'prod' กลับไปยัง revision ที่ 2?",
            "options": [
              "helm undo webapp 2 -n prod",
              "helm rollback webapp 2 -n prod",
              "helm revert webapp --to=2 -n prod",
              "kubectl rollout undo helm webapp -n prod"
            ],
            "answer": 1,
            "explanation": "คำสั่งมาตรฐานของ Helm คือ 'helm rollback <release-name> <revision-number>'"
          }
        },
        {
          "id": "ckad-u2-4",
          "title": "Unit 2.4: Kustomize Overlays & Configuration Management",
          "summary": "การจัดการคอนฟิกหลาย Environment (dev, staging, prod) ด้วย kustomization.yaml โดยไม่ต้องใช้ Template Engine",
          "docsUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/",
          "docsKeyword": "Declarative Management of Kubernetes Objects Using Kustomize",
          "blueprint": "# โครงสร้างโฟลเดอร์ Kustomize\n# ├── base/\n# │   ├── deployment.yaml\n# │   ├── service.yaml\n# │   └── kustomization.yaml\n# └── overlays/\n#     └── prod/\n#         ├── kustomization.yaml\n#         └── replica-patch.yaml\n\n# สั่งประมวลผลและตรวจสอบ YAML ที่ถูกประกอบร่างแล้ว\nkubectl kustomize overlays/prod/\n\n# สั่ง Deploy โดยตรง\nkubectl apply -k overlays/prod/",
          "explanation": "### Kustomize ในตัว kubectl (Built-in)\nKustomize เป็นเครื่องมือจัดแต่ง Resource แบบ Declarative โดยใช้หลักการ Base + Overlays:\n\n1. **base/kustomization.yaml**: เก็บ Resource พื้นฐานที่ทุกสภาพแวดล้อมใช้ร่วมกัน\n2. **overlays/prod/kustomization.yaml**: ปรับแต่งค่าเฉพาะ เช่น:\n   * `namePrefix`: เติมคำนำหน้าชื่อ Resource เช่น `prod-`\n   * `nameSuffix`: เติมคำต่อท้ายชื่อ\n   * `commonLabels`: ใส่ Labels ให้กับทุก Resource และ Selector อัตโนมัติ\n   * `replicas`: กำหนดจำนวน Pod เพิ่มเติม\n   * `patches`: เขียนไฟล์ Strategic Merge Patch ทับฟิลด์เฉพาะ",
          "examples": [
            {
              "desc": "ตัวอย่างไฟล์ overlays/prod/kustomization.yaml",
              "yaml": "apiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nresources:\n- ../../base\nnamePrefix: prod-\ncommonLabels:\n  env: production\nreplicas:\n- name: web-app\n  count: 5"
            },
            {
              "desc": "สั่ง Apply Resource ผ่าน Kustomize",
              "cmd": "kubectl apply -k ./overlays/prod"
            }
          ],
          "examTips": [
            "สังเกตคำสั่ง: ให้ใช้ 'kubectl apply -k <folder>' (สังเกต flag -k ตัวเล็ก ไม่ใช่ -f)",
            "หากข้อสอบให้สร้าง configMap จากไฟล์โดยใช้ Kustomize ให้ใช้ฟิลด์ 'configMapGenerator'"
          ],
          "quickCheck": {
            "question": "คำสั่งใดใช้ตรวจสอบผลลัพธ์ของไฟล์ YAML ที่ถูกประกอบร่างโดย Kustomize โดยไม่ส่งไปรันจริงบนคลัสเตอร์?",
            "options": [
              "kubectl kustomize <dir>",
              "kubectl apply -k <dir> --dry-run",
              "kubectl render -k <dir>",
              "kustomize test <dir>"
            ],
            "answer": 0,
            "explanation": "คำสั่ง 'kubectl kustomize <dir>' จะพิมพ์ผลลัพธ์ manifest ทั้งหมดที่ render แล้วออกทาง stdout"
          }
        }
      ]
    },
    {
      "id": "ckad-b3",
      "title": "Domain 3: Application Observability and Maintenance (15%)",
      "titleTh": "การเฝ้าระวังและการดูแลรักษาแอปพลิเคชัน",
      "icon": "🩺",
      "category": "observability",
      "description": "Health Probes (Liveness, Readiness, Startup), Container Logging, Metrics Server (kubectl top) และ Ephemeral Debug Containers",
      "units": [
        {
          "id": "ckad-u3-1",
          "title": "Unit 3.1: Liveness, Readiness & Startup Health Probes In-Depth",
          "summary": "เจาะลึก 3 ชนิด Health Probes, กลไกการตรวจสอบ (httpGet, tcpSocket, exec, gRPC) และพารามิเตอร์จูนค่า",
          "docsUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/",
          "docsKeyword": "Configure Liveness Readiness and Startup Probes",
          "blueprint": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: robust-app\nspec:\n  containers:\n  - name: web\n    image: nginx:alpine\n    startupProbe:\n      httpGet:\n        path: /healthz\n        port: 80\n      failureThreshold: 30\n      periodSeconds: 10\n    readinessProbe:\n      httpGet:\n        path: /ready\n        port: 80\n      initialDelaySeconds: 5\n      periodSeconds: 10\n    livenessProbe:\n      exec:\n        command:\n        - cat\n        - /tmp/healthy\n      initialDelaySeconds: 15\n      periodSeconds: 20",
          "explanation": "### เปรียบเทียบความแตกต่างระหว่าง 3 Probes\n1. **Startup Probe**:\n   * ตรวจสอบว่าแอปพลิเคชันเริ่มต้นเสร็จแล้วหรือไม่\n   * **ระหว่างที่ Startup Probe ยังทำงานอยู่ Liveness และ Readiness จะถูกปิดการทำงานไว้ชั่วคราว**\n   * เหมาะกับแอปพลิเคชัน Legacy ที่ใช้เวลา Bootstrapping นาน เพื่อป้องกันไม่ให้ Liveness ฆ่าทิ้งไปก่อน\n\n2. **Readiness Probe**:\n   * ตรวจสอบว่าแอปพลิเคชันพร้อมรับ Request หรือ Traffic จากภายนอกหรือไม่\n   * หากตรวจสอบไม่ผ่าน Kubelet จะ **ตัด IP ของ Pod ออกจาก EndpointSlices ของ Service** ทราฟฟิกจะไม่ถูกส่งมายัง Pod ตัวนี้\n   * **จะไม่รีสตาร์ตคอนเทนเนอร์เด็ดขาด!**\n\n3. **Liveness Probe**:\n   * ตรวจสอบว่าแอปพลิเคชันยังมีชีวิตและทำงานปกติหรือไม่ (เช่น ตรวจจับ Deadlock)\n   * หากตรวจสอบล้มเหลวเกิน `failureThreshold` Kubelet จะ **สั่งฆ่า (Kill) และรีสตาร์ตคอนเทนเนอร์ใหม่** ตาม restartPolicy\n\n**Mechanisms**:\n* `httpGet`: ส่ง HTTP GET ไปยังพอร์ตและ path (HTTP status 200-399 ถือว่าผ่าน)\n* `tcpSocket`: พยายามเปิด TCP Connection ไปยังพอร์ต\n* `exec`: รันคำสั่ง shell ภายในคอนเทนเนอร์ (exit code 0 ถือว่าผ่าน)\n* `grpc`: ส่ง gRPC Health checking protocol ไปยังเซอร์วิส",
          "examples": [
            {
              "desc": "tcpSocket Probe สำหรับ Database Pod",
              "yaml": "readinessProbe:\n  tcpSocket:\n    port: 5432\n  initialDelaySeconds: 5\n  periodSeconds: 10"
            }
          ],
          "examTips": [
            "จำผลกระทบให้แม่น: Readiness ไม่ผ่าน = ถอดออกจาก Service Endpoint (ไม่รีสตาร์ต), Liveness ไม่ผ่าน = สั่งรีสตาร์ตคอนเทนเนอร์",
            "อย่าลืมตรวจดู 'periodSeconds' และ 'initialDelaySeconds' ตามที่โจทย์ระบุ"
          ],
          "quickCheck": {
            "question": "หากแอปพลิเคชันไม่สามารถตอบสนองต่อ Readiness Probe ได้ทันเวลา จะเกิดผลลัพธ์ใดขึ้นในระบบ?",
            "options": [
              "Kubelet จะรีสตาร์ตคอนเทนเนอร์ทันที",
              "Pod จะถูกลบออกจากโหนด",
              "IP ของ Pod จะถูกถอดออกจาก Service Endpoints ชั่วคราว โดยคอนเทนเนอร์ไม่ถูกรีสตาร์ต",
              "สถานะของ Pod จะกลายเป็น CrashLoopBackOff"
            ],
            "answer": 2,
            "explanation": "Readiness Probe ควบคุมการรับ Traffic ของ Service หากไม่ผ่าน Pod จะถูกตัดออกจาก Endpoint ชั่วคราว แต่จะไม่ถูกรีสตาร์ต"
          }
        },
        {
          "id": "ckad-u3-2",
          "title": "Unit 3.2: Container Logging, Metrics Server & API Deprecations",
          "summary": "การดึง Logs แบบ Real-time, การวิเคราะห์การใช้ Resource ด้วย kubectl top และการรับมือกับ API Deprecations",
          "docsUrl": "https://kubernetes.io/docs/concepts/cluster-administration/logging/",
          "docsKeyword": "Logging Architecture",
          "blueprint": "# 1. ดึง Log ของ Pod หรือระบุ Container\nkubectl logs <pod-name> -c <container-name> --tail=50 -f\n\n# 2. ดึง Log ของ Container รอบก่อนหน้าที่เพิ่ง Crash ไป\nkubectl logs <pod-name> --previous\n\n# 3. ตรวจสอบการใช้ CPU / Memory ของ Pods\nkubectl top pod -A --sort-by=cpu\nkubectl top pod -A --sort-by=memory\n\n# 4. ตรวจสอบ API Resource ที่ใช้งานอยู่ในคลัสเตอร์\nkubectl api-resources --sort-by=name",
          "explanation": "### เทคนิค Observability ในข้อสอบ\n1. **Container Logging**:\n   * ทุกข้อความที่แอปพลิเคชันเขียนออกทาง `stdout` และ `stderr` จะถูกดักเก็บไว้โดย Container Runtime\n   * `kubectl logs <pod> --previous`: เป็นคำสั่งสำคัญที่สุดเวลาเจอ Pod สถานะ CrashLoopBackOff เพราะจะช่วยให้อ่าน error log ของคอนเทนเนอร์รอบที่เพิ่งตายไปได้\n\n2. **Metrics Server & kubectl top**:\n   * ข้อสอบมักมีโจทย์: 'Find the pod consuming highest CPU in namespace monitoring and save its name to /tmp/heavy-pod.txt'\n   * ใช้คำสั่ง: `kubectl top pods -n monitoring --sort-by=cpu --no-headers | head -n 1 | awk '{print $1}' > /tmp/heavy-pod.txt`\n\n3. **API Deprecations**:\n   * เมื่อเวอร์ชัน Kubernetes อัปเกรดขึ้น API version บางตัวจะถูกปลดระวาง เช่น `extensions/v1beta1` หรือ `networking.k8s.io/v1beta1` กลายเป็น `networking.k8s.io/v1`\n   * ใช้ `kubectl explain <resource>` เสมอเพื่อตรวจสอบ `apiVersion` ปัจจุบันที่รองรับในคลัสเตอร์",
          "examples": [
            {
              "desc": "ดึงรายชื่อ Pod ที่ใช้ Memory สูงสุดลงไฟล์คำตอบ",
              "cmd": "kubectl top pod -n production --sort-by=memory --no-headers | head -n 1 | awk '{print $1}' > /opt/max-mem-pod.txt"
            }
          ],
          "examTips": [
            "คำสั่ง kubectl top จะใช้งานได้ก็ต่อเมื่อมี Metrics Server ติดตั้งอยู่ในคลัสเตอร์",
            "หากโจทย์ถามเรื่อง pod restart อย่าลืมเช็ก flag --previous ใน logs"
          ],
          "quickCheck": {
            "question": "คำสั่งใดใช้ดึง Log ของคอนเทนเนอร์รอบก่อนหน้าที่เพิ่งแครชไปเพื่อหาสาเหตุการล่ม?",
            "options": [
              "kubectl logs <pod> --history",
              "kubectl logs <pod> --previous",
              "kubectl logs <pod> --last-crash",
              "kubectl describe pod <pod> --logs"
            ],
            "answer": 1,
            "explanation": "flag --previous จะบอกให้ kubectl ร้องขอ log ของ container instance ตัวเดิมที่เพิ่งหยุดทำงานไปจาก Container Runtime"
          }
        },
        {
          "id": "ckad-u3-3",
          "title": "Unit 3.3: Interactive Debugging & Ephemeral Debug Containers",
          "summary": "การกู้คืนและตรวจสอบ Pod ด้วยคำสั่ง kubectl debug โดยไม่ต้องสร้าง Pod หรือแก้ไขไฟล์ Manifest ใหม่",
          "docsUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/",
          "docsKeyword": "Debug Running Pods",
          "blueprint": "# 1. ใส่ Ephemeral Container เข้าไปใน Pod ที่กำลังรันอยู่เพื่อ Inspect\nkubectl debug -it <running-pod> --image=busybox:1.36 --target=<container-name>\n\n# 2. ก็อปปี้ Pod เดิมออกมาเป็นตัวใหม่พร้อมแก้ไขคำสั่ง Command\nkubectl debug <crashing-pod> -it --copy-to=debug-pod --container=app -- sh\n\n# 3. ก็อปปี้ Pod เดิมพร้อมเปลี่ยน Image\nkubectl debug <faulty-pod> --copy-to=fixed-pod --set-image=app=nginx:latest",
          "explanation": "### การ Debug ระดับโปรด้วย kubectl debug (K8s 1.25+)\nเมื่อเจอแอปพลิเคชันที่เป็น Distroless image (ไม่มี bash, ไม่มี curl, ไม่มีเครื่องมือ network):\n1. **Ephemeral Containers**:\n   * คำสั่ง `kubectl debug -it <pod> --image=busybox --target=<container>` จะแนบ Ephemeral Container ใหม่เข้าไปใน Pod เดิมที่กำลังรันอยู่\n   * สามารถแชร์ Process Namespace ร่วมกับคอนเทนเนอร์เป้าหมาย (`--target`) ทำให้สามารถมองเห็น process และไฟล์ผ่าน `/proc/<pid>/root` ได้\n\n2. **Pod Copy Debugging**:\n   * คำสั่ง `kubectl debug --copy-to=new-pod` จะโคลน Pod ขึ้นมาใหม่ โดยอนุญาตให้เราเปลี่ยน command, environment หรือ image เพื่อเข้าไปทดสอบแก้ไขโค้ดได้โดยไม่กระทบ Pod ตัวจริง",
          "examples": [
            {
              "desc": "สร้างสำเนา Pod เพื่อเข้าไปเช็กสภาพแวดล้อมด้วย Shell",
              "cmd": "kubectl debug web-app -it --copy-to=web-test --container=web -- sh"
            }
          ],
          "examTips": [
            "Ephemeral Containers ไม่สามารถลบออกจาก Pod ได้เมื่อเพิ่มเข้าไปแล้ว",
            "หากข้อสอบให้ debug pod ที่ไม่มี bash ให้ลองใช้ 'kubectl exec -it <pod> -- sh' ดูก่อน หากไม่มี sh ค่อยใช้ 'kubectl debug'"
          ],
          "quickCheck": {
            "question": "คำสั่งใดใช้สร้างสำเนาของ Pod ชื่อ 'prod-app' ให้กลายเป็น Pod ใหม่ชื่อ 'test-app' พร้อมเข้าสู่ shell เพื่อตรวจสอบปัญหา?",
            "options": [
              "kubectl clone pod prod-app --name=test-app",
              "kubectl debug prod-app -it --copy-to=test-app --container=main -- sh",
              "kubectl cp prod-app test-app --shell",
              "kubectl run test-app --from=prod-app -it"
            ],
            "answer": 1,
            "explanation": "kubectl debug <pod> --copy-to=<new-pod> เป็นคำสั่งมาตรฐานสำหรับโคลน Pod เพื่อทำ Interactive Troubleshooting"
          }
        }
      ]
    },
    {
      "id": "ckad-b4",
      "title": "Domain 4: App Configuration and Security (25%)",
      "titleTh": "การตั้งค่าและการรักษาความปลอดภัยของแอปพลิเคชัน",
      "icon": "🔐",
      "category": "security",
      "description": "ConfigMaps, Secrets, SecurityContexts, Linux Capabilities, ServiceAccounts, RBAC และ Resource Requirements (Quotas & Limits)",
      "units": [
        {
          "id": "ckad-u4-1",
          "title": "Unit 4.1: ConfigMaps & Secrets (env, envFrom, Volume Mount & subPath)",
          "summary": "การแยก Configuration และ Credentials ออกจาก Container Images ผ่าน Environment variables และ Volume Mounts",
          "docsUrl": "https://kubernetes.io/docs/concepts/configuration/secret/",
          "docsKeyword": "Secrets",
          "blueprint": "# 1. สร้าง ConfigMap & Secret จาก CLI\nkubectl create cm app-cfg --from-literal=MAX_CLIENTS=100 --from-literal=APP_MODE=prod\nkubectl create secret generic db-creds --from-literal=username=admin --from-literal=password=P@ssw0rd\n\n# 2. การ Mount เฉพาะไฟล์เดี่ยวด้วย subPath\nvolumeMounts:\n- name: config-vol\n  mountPath: /etc/nginx/nginx.conf\n  subPath: nginx.conf",
          "explanation": "### วิธีการดึงข้อมูลจาก ConfigMap และ Secret\n1. **แบบ Environment Variables เดี่ยว (`valueFrom`)**:\n   * ดึง key ตัวใดตัวหนึ่งมาแมปเข้ากับชื่อตัวแปร เช่น `configMapKeyRef` หรือ `secretKeyRef`\n2. **แบบโหลดทุก Key ในก้อนเดียว (`envFrom`)**:\n   * โหลดทุก key-value ใน ConfigMap/Secret มาตั้งเป็น Environment Variables ใน Container ทันที สะดวกและรวดเร็วมาก\n3. **แบบ Mount เป็น Directory (`volumes`)**:\n   * แต่ละ Key จะกลายเป็นไฟล์เดี่ยว และ Value จะเป็นเนื้อหาภายในไฟล์\n   * หากใช้ `subPath` จะช่วย mount ทับเฉพาะไฟล์เดียว โดยไม่ลบไฟล์อื่นๆ ที่อยู่ในโฟลเดอร์ปลายทางทิ้งไป!",
          "examples": [
            {
              "desc": "Pod ตัวอย่างที่โหลดค่าจาก Secret และ ConfigMap ครบทุกรูปแบบ",
              "yaml": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: secured-app\nspec:\n  volumes:\n  - name: cfg-volume\n    configMap:\n      name: app-cfg\n  containers:\n  - name: server\n    image: nginx:alpine\n    env:\n    - name: DB_PASS\n      valueFrom:\n        secretKeyRef:\n          name: db-creds\n          key: password\n    envFrom:\n    - configMapRef:\n        name: app-cfg\n    volumeMounts:\n    - name: cfg-volume\n      mountPath: /etc/app"
            }
          ],
          "examTips": [
            "ระวัง! การ mount volume ปกติจะทำให้ไฟล์เดิมใน mountPath ถูกซ่อนทับทั้งหมด หากโจทย์ต้องการเติมแค่ไฟล์เดียว ให้ใช้ 'subPath'",
            "Secret ถูกเข้ารหัสด้วย Base64 เสมอ สามารถถอดรหัสได้ด้วยคำสั่ง: echo 'c3VwZXI=' | base64 -d"
          ],
          "quickCheck": {
            "question": "หากต้องการ Mount ไฟล์คอนฟิกเดี่ยวๆ จาก ConfigMap ไปยังโฟลเดอร์ที่มีไฟล์ระบบเดิมอยู่แล้ว โดยไม่ให้ไฟล์เดิมถูกซ่อนทับ ต้องใช้ฟิลด์ใด?",
            "options": [
              "singleFile: true",
              "subPath: <filename>",
              "mountType: FileOnly",
              "override: false"
            ],
            "answer": 1,
            "explanation": "subPath ช่วยให้เรา mount เฉพาะไฟล์หรือโฟลเดอร์ย่อยจาก Volume เข้าไปยังโฟลเดอร์ปลายทางโดยไม่ทับไฟล์อื่นที่มีอยู่แล้ว"
          }
        },
        {
          "id": "ckad-u4-2",
          "title": "Unit 4.2: SecurityContexts, Linux Capabilities & Hardening",
          "summary": "การจำกัดสิทธิ์คอนเทนเนอร์ด้วย runAsUser, runAsNonRoot, readOnlyRootFilesystem และ Linux Capabilities (NET_ADMIN, SYS_TIME)",
          "docsUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/security-context/",
          "docsKeyword": "Configure a Security Context for a Pod or Container",
          "blueprint": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: hardened-pod\nspec:\n  securityContext: # Pod-level: มีผลกับทุกคอนเทนเนอร์ใน Pod\n    runAsUser: 1000\n    runAsGroup: 3000\n    fsGroup: 2000\n  containers:\n  - name: app\n    image: nginx:alpine\n    securityContext: # Container-level: มีผลเฉพาะคอนเทนเนอร์นี้ (Override ค่าระดับ Pod ได้)\n      allowPrivilegeEscalation: false\n      readOnlyRootFilesystem: true\n      capabilities:\n        add: [\"NET_BIND_SERVICE\"]\n        drop: [\"ALL\"]",
          "explanation": "### การตั้งค่าความปลอดภัยระดับ Linux Kernel\n1. **Pod-level vs Container-level**:\n   * `fsGroup`: กำหนด group owner สำหรับ Volumes ที่ mount เข้ามา (มีให้ตั้งเฉพาะที่ระดับ Pod)\n   * `runAsUser` / `runAsGroup`: กำหนด UID และ GID สำหรับรัน process ภายในคอนเทนเนอร์\n   * `capabilities`: สามารถใส่ได้ **เฉพาะที่ระดับ Container เท่านั้น** (หากใส่ที่ระดับ Pod จะเกิด Schema validation error ทันที!)\n\n2. **Linux Capabilities**:\n   * ระบบตัดแบ่งอำนาจของ root ออกเป็นสิทธิ์ย่อยๆ เช่น `NET_ADMIN` (ปรับแต่ง Network), `SYS_TIME` (ตั้งเวลาระบบ)\n   * Best practice คือสั่ง `drop: [\"ALL\"]` แล้วค่อยเลือก `add` เฉพาะ capability ที่จำเป็น",
          "examples": [
            {
              "desc": "ตั้งค่า Pod ให้รันแบบ Non-root และอ่านเขียน filesystem แบบ read-only",
              "yaml": "securityContext:\n  runAsNonRoot: true\n  readOnlyRootFilesystem: true"
            }
          ],
          "examTips": [
            "จำจุดหลอกยอดนิยม: capabilities ต้องอยู่ใต้ 'containers[].securityContext' ห้ามใส่ใน 'spec.securityContext'",
            "หากตั้ง readOnlyRootFilesystem: true แล้วแอปต้องเขียนไฟล์ /tmp ให้ mount emptyDir volume ไว้ที่ /tmp"
          ],
          "quickCheck": {
            "question": "ฟิลด์ 'capabilities: { add: [...], drop: [...] }' สามารถกำหนดไว้ที่ตำแหน่งใดใน Manifest ได้อย่างถูกต้อง?",
            "options": [
              "spec.securityContext (ระดับ Pod เท่านั้น)",
              "spec.containers[].securityContext (ระดับ Container เท่านั้น)",
              "ทั้งระดับ Pod และ Container",
              "metadata.annotations"
            ],
            "answer": 1,
            "explanation": "Linux Capabilities ผูกอยู่กับ Container Process จึงสามารถกำหนดได้เฉพาะภายใน spec.containers[].securityContext เท่านั้น"
          }
        },
        {
          "id": "ckad-u4-3",
          "title": "Unit 4.3: ServiceAccounts, Roles & RoleBindings (Application RBAC)",
          "summary": "การอนุญาตให้แอปพลิเคชันภายใน Pod สื่อสารกับ Kubernetes API Server อย่างปลอดภัยด้วย RBAC",
          "docsUrl": "https://kubernetes.io/docs/reference/access-authn-authz/rbac/",
          "docsKeyword": "Using RBAC Authorization",
          "blueprint": "# 1. สร้าง ServiceAccount\nkubectl create sa app-reader -n dev\n\n# 2. สร้าง Role กำหนดสิทธิ์ระดับ Namespace\nkubectl create role pod-reader-role --verb=get,list,watch --resource=pods,pods/log -n dev\n\n# 3. ผูก Role เข้ากับ ServiceAccount\nkubectl create rolebinding app-reader-rb --role=pod-reader-role --serviceaccount=dev:app-reader -n dev\n\n# 4. ทดสอบสิทธิ์ด้วยคำสั่ง can-i\nkubectl auth can-i get pods --as=system:serviceaccount:dev:app-reader -n dev",
          "explanation": "### การเชื่อมโยง RBAC สำหรับ Application Pods\nเมื่อแอปพลิเคชันใน Pod ต้องการ query ข้อมูลจาก API Server (เช่น ต้องการดึงรายชื่อ Pods หรือ ConfigMaps):\n1. แอปจะต้องใช้ **ServiceAccount (SA)** เป็นตัวตน (Identity)\n2. **Role**: กำหนดชุดสิทธิ์ (`verbs` เช่น get, list, watch, create, delete) ต่อ `resources` ใน Namespace หนึ่งๆ\n3. **RoleBinding**: เชื่อมผูก Role เข้ากับ ServiceAccount\n4. ใน Pod Manifest จะต้องระบุฟิลด์ `serviceAccountName: app-reader`",
          "examples": [
            {
              "desc": "ตัวอย่าง Pod ที่ผูกเข้ากับ ServiceAccount",
              "yaml": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: api-client\n  namespace: dev\nspec:\n  serviceAccountName: app-reader\n  containers:\n  - name: client\n    image: curlimages/curl\n    command: [\"sleep\", \"3600\"]"
            }
          ],
          "examTips": [
            "ระวังชื่อฟิลด์ใน Pod spec คือ 'serviceAccountName' (ในอดีตเคยมี serviceAccount แต่ถูก deprecate แล้ว)",
            "ทดสอบสิทธิ์ด้วย 'kubectl auth can-i <verb> <resource> --as=system:serviceaccount:<ns>:<sa> -n <ns>' เสมอก่อนตอบข้อสอบ"
          ],
          "quickCheck": {
            "question": "คำสั่งใดใช้ตรวจสอบว่า ServiceAccount ชื่อ 'monitoring-sa' ใน namespace 'prod' มีสิทธิ์ลบ ConfigMaps หรือไม่?",
            "options": [
              "kubectl auth check sa monitoring-sa delete cm",
              "kubectl auth can-i delete configmaps --as=system:serviceaccount:prod:monitoring-sa -n prod",
              "kubectl rbac verify monitoring-sa --verb=delete",
              "kubectl describe sa monitoring-sa --rights"
            ],
            "answer": 1,
            "explanation": "คำสั่ง 'kubectl auth can-i' ร่วมกับ flag '--as=system:serviceaccount:<namespace>:<name>' เป็นมาตรฐานการตรวจสอบสิทธิ์"
          }
        },
        {
          "id": "ckad-u4-4",
          "title": "Unit 4.4: Resource Requirements, LimitRanges & ResourceQuotas",
          "summary": "การจัดสรรทรัพยากร CPU / Memory, การรับมือ OOMKilled, และการควบคุมเพดานด้วย Quota & LimitRange",
          "docsUrl": "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/",
          "docsKeyword": "Resource Management for Pods and Containers",
          "blueprint": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: resource-demo\nspec:\n  containers:\n  - name: app\n    image: nginx:alpine\n    resources:\n      requests:\n        memory: \"64Mi\"\n        cpu: \"250m\" # 250 milliCPU (0.25 core)\n      limits:\n        memory: \"128Mi\"\n        cpu: \"500m\"",
          "explanation": "### ความแตกต่างระหว่าง Requests และ Limits\n1. **Requests**:\n   * ปริมาณทรัพยากรขั้นต่ำที่ Pod การันตีว่าต้องมี Scheduler จะใช้ค่านี้ในการตัดสินใจว่าโหนดใดมีพื้นที่ว่างพอที่จะวาง Pod ได้\n2. **Limits**:\n   * เพดานทรัพยากรสูงสุดที่คอนเทนเนอร์ได้รับอนุญาตให้ใช้:\n   * **CPU เกิน Limit**: คอนเทนเนอร์จะไม่ถูกฆ่า แต่จะถูก **CPU Throttled** (บีบความเร็วลง)\n   * **Memory เกิน Limit**: คอนเทนเนอร์จะถูก Kernel ฆ่าทันทีด้วยสถานะ **OOMKilled (Exit Code 137)**\n\n3. **LimitRange vs ResourceQuota**:\n   * **LimitRange**: กำหนดค่า default request/limit หรือค่า min/max สำหรับแต่ละ Pod/Container ภายใน Namespace\n   * **ResourceQuota**: กำหนดผลรวมทรัพยากรทั้งหมดใน Namespace (เช่น ห้ามใช้ CPU เกิน 4 cores และห้ามมี Pod เกิน 10 ตัว)",
          "examples": [
            {
              "desc": "สร้าง ResourceQuota สำหรับจำกัด CPU และ Memory ใน Namespace",
              "yaml": "apiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: compute-quota\n  namespace: dev\nspec:\n  hard:\n    requests.cpu: \"2\"\n    requests.memory: 2Gi\n    limits.cpu: \"4\"\n    limits.memory: 4Gi\n    pods: \"10\""
            }
          ],
          "examTips": [
            "หากใน Namespace มี ResourceQuota บังคับใช้ Pod ทุกตัวที่ถูกสร้างใน Namespace นั้นจะต้องระบุทั้ง requests และ limits เสมอ มิฉะนั้น API Server จะ Reject",
            "จำหน่วย CPU: 1 CPU = 1000m (1000 milliCPU)"
          ],
          "quickCheck": {
            "question": "หากคอนเทนเนอร์ใช้หน่วยความจำเกินค่า limits.memory ที่ระบุไว้ จะเกิดผลลัพธ์ใดขึ้น?",
            "options": [
              "Kubelet จะทำการ Throttle ชะลอความเร็วของแอปพลิเคชัน",
              "คอนเทนเนอร์จะถูก Terminate ทันทีด้วยสถานะ OOMKilled (Exit Code 137)",
              "Pod จะถูก Evict ย้ายไปรันที่โหนดอื่น",
              "Kubernetes จะขยาย memory limit ให้อัตโนมัติ"
            ],
            "answer": 1,
            "explanation": "Memory ไม่สามารถบีบอัดได้ (Non-compressible resource) เมื่อคอนเทนเนอร์ใช้เกิน Limit ระบบ Linux Out-Of-Memory Killer จะส่งสัญญาณ SIGKILL (137) ปลิดชีพโปรเซสทันที"
          }
        }
      ]
    },
    {
      "id": "ckad-b5",
      "title": "Domain 5: Services and Networking (20%)",
      "titleTh": "ระบบเครือข่าย บริการ และความปลอดภัยทราฟฟิก",
      "icon": "🌐",
      "category": "network",
      "description": "Services (ClusterIP, NodePort, LoadBalancer, Headless), Ingress Controllers, NetworkPolicies และ Kubernetes Gateway API",
      "units": [
        {
          "id": "ckad-u5-1",
          "title": "Unit 5.1: Services Architecture & Endpoints Resolution",
          "summary": "การเข้าถึงแอปพลิเคชันด้วย ClusterIP, NodePort, Headless Services และการทำงานของ CoreDNS",
          "docsUrl": "https://kubernetes.io/docs/concepts/services-networking/service/",
          "docsKeyword": "Service",
          "blueprint": "# 1. สร้าง ClusterIP Service จาก CLI\nkubectl expose deployment web-deploy --port=80 --target-port=8080 --name=web-service\n\n# 2. ตรวจสอบ Endpoints ที่ผูกติดกับ Service\nkubectl get endpoints web-service\nkubectl get endpointslices -l kubernetes.io/service-name=web-service\n\n# 3. ทดสอบการเข้าถึงผ่านชื่อ DNS ภายในคลัสเตอร์\n# รูปแบบ: <service-name>.<namespace>.svc.cluster.local",
          "explanation": "### ชนิดของ Service ใน Kubernetes\n1. **ClusterIP** (Default): ให้ Virtual IP ภายในคลัสเตอร์เท่านั้น พอดภายนอกเข้าไม่ถึง\n2. **NodePort**: เปิดพอร์ตคงที่บนโหนดทุกเครื่องในคลัสเตอร์ (ช่วง 30000-32767) ให้ภายนอกยิงเข้ามาที่ `<NodeIP>:<NodePort>` ได้\n3. **LoadBalancer**: สร้าง Cloud Provider External Load Balancer อัตโนมัติ\n4. **Headless Service (`clusterIP: None`)**:\n   * ไม่แจก Virtual IP และไม่ทำ Load Balancing\n   * DNS Server จะส่งคืน IP ของ Pods ทุกตัวที่จับคู่กับ Selector โดยตรง เหมาะสำหรับ StatefulSet ฐานข้อมูลแบบ Master-Slave",
          "examples": [
            {
              "desc": "สร้าง NodePort Service ผ่าน YAML",
              "yaml": "apiVersion: v1\nkind: Service\nmetadata:\n  name: web-nodeport\nspec:\n  type: NodePort\n  selector:\n    app: web\n  ports:\n  - port: 80\n    targetPort: 8080\n    nodePort: 30080"
            }
          ],
          "examTips": [
            "จำสูตร: 'port' คือพอร์ตที่ Service เปิดรอรับ, 'targetPort' คือพอร์ตที่ container ข้างใน Pod กำลังรันอยู่",
            "หาก Service สร้างแล้วแต่เรียกไม่ติด ให้เช็ก 'kubectl get endpoints <svc>' ถ้าว่างเปล่า แสดงว่า Selector ไม่ตรงกับ Labels ของ Pod"
          ],
          "quickCheck": {
            "question": "หากต้องการสร้าง Service ชนิด Headless ที่คืนค่า IP ของ Pod แต่ละตัวผ่าน DNS โดยไม่แจก ClusterIP ต้องตั้งค่าฟิลด์ใด?",
            "options": [
              "type: Headless",
              "clusterIP: None",
              "loadBalancer: false",
              "endpoints: Direct"
            ],
            "answer": 1,
            "explanation": "การระบุ 'clusterIP: None' ใน Service Spec จะทำให้ Service ตัวนั้นกลายเป็น Headless Service ทันที"
          }
        },
        {
          "id": "ckad-u5-2",
          "title": "Unit 5.2: Ingress Controllers & Path-Based Routing",
          "summary": "การเปิดทางเข้าทราฟฟิก HTTP/HTTPS ระดับ L7, การตั้งกฎ Routing, IngressClass และการกำหนด TLS Secret",
          "docsUrl": "https://kubernetes.io/docs/concepts/services-networking/ingress/",
          "docsKeyword": "Ingress",
          "blueprint": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: main-ingress\n  annotations:\n    nginx.ingress.kubernetes.io/rewrite-target: /\nspec:\n  ingressClassName: nginx\n  rules:\n  - host: app.example.com\n    http:\n      paths:\n      - path: /api\n        pathType: Prefix\n        backend:\n          service:\n            name: api-svc\n            port:\n              number: 8080\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: web-svc\n            port:\n              number: 80",
          "explanation": "### องค์ประกอบของ Ingress\n1. **Ingress Resource**: ไฟล์กฎการนำทาง (Routing Rules) บอกว่าโดเมนใด หรือ path ใดให้ส่งไปยัง Service ตัวไหน\n2. **Ingress Controller**: ซอฟต์แวร์ Proxy (เช่น Ingress-NGINX, Traefik) ที่คอยอ่าน Ingress Resource แล้วปรับแต่ง Routing Table จริง\n3. **pathType**:\n   * **Prefix**: จับคู่ตามเส้นทางนำหน้า เช่น `/api` จะครอบคลุมทั้ง `/api`, `/api/users`, `/api/orders`\n   * **Exact**: จับคู่ตรงตัวอักษรทุกตัวเป๊ะๆ",
          "examples": [
            {
              "desc": "สร้าง Ingress แบบ Imperative ผ่านคำสั่ง CLI",
              "cmd": "kubectl create ingress simple-ing --rule='web.org/*=web-svc:80' $do > ing.yaml"
            }
          ],
          "examTips": [
            "อย่าลืมตรวจดู 'ingressClassName' หากในคลัสเตอร์มีหลาย Ingress Controller ติดตั้งอยู่",
            "ใน networking.k8s.io/v1 พอร์ตของ Service ใน backend ต้องใส่ใต้ 'port: { number: 80 }' ไม่ใช่ 'servicePort'"
          ],
          "quickCheck": {
            "question": "ใน Ingress API (networking.k8s.io/v1) หากต้องการให้ path แมปครอบคลุมทุก URL ย่อยที่ขึ้นต้นด้วย '/v1' ควรใช้ pathType ค่าใด?",
            "options": [
              "Exact",
              "Prefix",
              "ImplementationSpecific",
              "Wildcard"
            ],
            "answer": 1,
            "explanation": "pathType: Prefix จะจับคู่ path เริ่มต้นและทุก subpath ที่ตามหลังเครื่องหมายทับ (/)"
          }
        },
        {
          "id": "ckad-u5-3",
          "title": "Unit 5.3: NetworkPolicies - Ingress, Egress & Default-Deny",
          "summary": "การควบคุมความปลอดภัยระดับเครือข่าย: podSelector, namespaceSelector, ipBlock และกับดัก AND vs OR Logic",
          "docsUrl": "https://kubernetes.io/docs/concepts/services-networking/network-policies/",
          "docsKeyword": "Network Policies",
          "blueprint": "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: secure-db-netpol\n  namespace: prod\nspec:\n  podSelector:\n    matchLabels:\n      role: db\n  policyTypes:\n  - Ingress\n  - Egress\n  ingress:\n  - from:\n    - podSelector:\n        matchLabels:\n          role: backend\n    ports:\n    - protocol: TCP\n      port: 5432",
          "explanation": "### กฎเหล็กของ NetworkPolicy ในห้องสอบ\n1. **Default Allow**: หากไม่มี NetworkPolicy ใดเลือก Pod นั้น Pod จะสามารถรับและส่งทราฟฟิกหาใครก็ได้ทั้งในและนอกคลัสเตอร์\n2. **Isolated**: ทันทีที่มี NetworkPolicy แมปตรงกับ Pod (ผ่าน `podSelector`) Pod นั้นจะถูกจำกัดสิทธิ์ทันที โดยทราฟฟิกที่ไม่ตรงกับกฎจะถูก Block ทันที\n3. **AND vs OR Logic (จุดที่ผู้สอบตกม้าตายบ่อยที่สุด!)**:\n   * **OR Logic (มีขีดนำหน้าทั้งสองบรรทัด)**:\n     ```yaml\n     - from:\n       - namespaceSelector: ... # หรือ\n       - podSelector: ...       # หรือ\n     ```\n   * **AND Logic (อยู่ในก้อนเดียวกัน ไม่มีขีดที่บรรทัดที่สอง)**:\n     ```yaml\n     - from:\n       - namespaceSelector: ... # และต้องอยู่ใน\n         podSelector: ...       # pod ที่มี label นี้ด้วย\n     ```",
          "examples": [
            {
              "desc": "กฎ Default-Deny ทั้ง Ingress และ Egress สำหรับล็อกดาวน์ Namespace",
              "yaml": "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-all\n  namespace: restricted\nspec:\n  podSelector: {} # เลือกทุก Pod ใน namespace\n  policyTypes:\n  - Ingress\n  - Egress"
            }
          ],
          "examTips": [
            "สังเกตขีด (-) ในรายการ 'from:' ให้ดี! ถ้ามีขีดนำหน้า podSelector แสดงว่าเป็น OR (อนุญาตคนละกรณี)",
            "NetworkPolicy ต้องการ Network Plugin (CNI) ที่รองรับการกรอง เช่น Calico หรือ Cilium หากเป็น Flannel ธรรมดา กฎจะไม่ถูกบังคับใช้"
          ],
          "quickCheck": {
            "question": "หากต้องการสร้าง NetworkPolicy บังคับใช้กับทุก Pod ภายใน Namespace ปัจจุบัน ต้องกำหนด podSelector เป็นค่าใด?",
            "options": [
              "podSelector: all",
              "podSelector: '*'",
              "podSelector: {}",
              "podSelector: { all: true }"
            ],
            "answer": 2,
            "explanation": "การใส่ 'podSelector: {}' (Empty Selector) หมายถึงเลือกทุก Pod ทั้งหมดใน Namespace นั้น"
          }
        },
        {
          "id": "ckad-u5-4",
          "title": "Unit 5.4: Kubernetes Gateway API Fundamentals",
          "summary": "วิวัฒนาการใหม่ของระบบ Routing ใน Kubernetes: GatewayClass, Gateway และ HTTPRoute",
          "docsUrl": "https://kubernetes.io/docs/concepts/services-networking/gateway/",
          "docsKeyword": "Gateway API",
          "blueprint": "apiVersion: gateway.networking.k8s.io/v1\nkind: HTTPRoute\nmetadata:\n  name: app-route\nspec:\n  parentRefs:\n  - name: internal-gateway\n  rules:\n  - matches:\n    - path:\n        type: PathPrefix\n        value: /v2\n    backendRefs:\n    - name: v2-service\n      port: 8080",
          "explanation": "### ทำไมต้องมี Gateway API ทดแทน Ingress?\nGateway API เป็นมาตรฐานรุ่นใหม่ที่ออกแบบมาเพื่อแก้ไขข้อจำกัดของ Ingress แบบเดิม โดยแบ่งแยกความรับผิดชอบอย่างชัดเจนตาม Role:\n\n1. **GatewayClass**: กำหนดโดย Infrastructure Provider / Cloud Admin (ระบุชนิดของ Controller)\n2. **Gateway**: จัดการโดย Cluster Admin เพื่อเปิดพอร์ตและ IP ทางเข้าหลักของคลัสเตอร์\n3. **HTTPRoute / GRPCRoute**: จัดการโดย Application Developer (ผู้สอบ CKAD) เพื่อระบุกฎว่า URL ไหนให้ route เข้า service ของทีมตัวเอง ข้าม Namespace ได้อย่างปลอดภัย",
          "examples": [
            {
              "desc": "ตรวจสอบ Gateway และ HTTPRoute ในคลัสเตอร์",
              "cmd": "kubectl get gateway,httproute -A"
            }
          ],
          "examTips": [
            "ในข้อสอบ CKAD รุ่นใหม่: ให้จำว่า Application Developer จะทำงานหลักอยู่กับ resource ชนิด 'HTTPRoute'",
            "HTTPRoute จะต้องอ้างอิง parentRefs ไปยัง Gateway ที่ Admin สร้างไว้แล้วเสมอ"
          ],
          "quickCheck": {
            "question": "ในสถาปัตยกรรม Gateway API รีซอร์สใดที่ Application Developer เป็นผู้เขียนเพื่อผูก Routing กฎเข้ากับแอปพลิเคชันของตน?",
            "options": [
              "GatewayClass",
              "Gateway",
              "HTTPRoute",
              "IngressRule"
            ],
            "answer": 2,
            "explanation": "HTTPRoute เป็น Resource สำหรับนักพัฒนาในการกำหนดกฎการนำทาง HTTP Request ไปยัง Service ปลายทาง"
          }
        }
      ]
    }
  ]
};
