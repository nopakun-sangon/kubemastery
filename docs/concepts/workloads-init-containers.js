/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/
 */
(function (root) {
  const pageData = {
    "id": "workloads-init-containers",
    "categoryId": "workloads",
    "categoryTitle": "Workloads",
    "titleEn": "Init Containers",
    "titleTh": "อินิตคอนเทนเนอร์ (Init Containers) - สถาปัตยกรรมการเตรียมพร้อมก่อนเริ่มแอปพลิเคชัน",
    "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/init-containers/",
    "docsPath": "/docs/concepts/workloads/pods/init-containers/",
    "diagram": {
      "src": "images/docs/pod-lifecycle-phases.svg",
      "caption": "วงจรชีวิตของพอด: Init Containers ต้องทำงานเสร็จสมบูรณ์ตามลำดับก่อน App Containers จะเริ่มทำงาน"
    },
    "lead": "อินิตคอนเทนเนอร์ (Init Containers) คือคอนเทนเนอร์เฉพาะทางที่ถูกกำหนดให้รันและทำงานจนสำเร็จเสร็จสิ้นก่อนที่แอปพลิเคชันคอนเทนเนอร์หลักในพอดจะเริ่มทำงาน โดยใช้สำหรับงานเตรียมความพร้อม เช่น ดาวน์โหลดคอนฟิก, รอฐานข้อมูลออนไลน์ หรือรันการย้ายโครงสร้างข้อมูล (Database Migration)",
    "sections": [
      {
        "id": "understanding-init-containers",
        "headingEn": "Understanding Init Containers",
        "headingTh": "ความเข้าใจเกี่ยวกับ Init Containers",
        "contentMarkdown": "พอดสามารถมีได้ทั้งแอปพลิเคชันคอนเทนเนอร์ที่รันแอปหลัก และ **Init Containers** ที่ทำหน้าที่เตรียมสภาพแวดล้อมก่อนที่แอปหลักจะเริ่มทำงาน\n\n### คุณลักษณะสำคัญของ Init Containers:\n* **รันตามลำดับทีละตัว (Sequential Execution)**: หากในพอดมี Init Containers หลายตัว ระบบจะสั่งรันตัวแรกจนกระทั่งเสร็จสิ้นสมบูรณ์ (Exit code 0) ก่อน จึงจะเริ่มรันตัวถัดไปตามลำดับที่เขียนไว้ใน YAML\n* **ต้องสำเร็จก่อนเสมอ (Run-to-completion)**: ทุก Init Container จะต้องทำงานเสร็จสมบูรณ์ 100% จึงจะอนุญาตให้ Application Containers เริ่มต้นทำงานได้\n* **การแยกภาพลักษณ์ (Image Isolation)**: Init Container สามารถใช้อิมเมจคนละตัวกับแอปหลักได้ ทำให้คุณสามารถติดตั้งเครื่องมือสำหรับ Setup (เช่น `curl`, `git`, `sed`, `openssl`) ไว้ใน Init Container โดยไม่ต้องใส่ไว้ใน Application Container จริง ซึ่งช่วยลดขนาดอิมเมจของแอปหลักและเพิ่มความปลอดภัยอย่างมาก"
      },
      {
        "id": "differences-from-app-containers",
        "headingEn": "Differences from Regular App Containers",
        "headingTh": "ข้อแตกต่างระหว่าง Init Containers และ Application Containers",
        "contentMarkdown": "แม้ว่า Init Containers จะถูกกำหนดในรูปแบบคล้ายกับ Container ทั่วไป แต่มีข้อแตกต่างเชิงโครงสร้างที่สำคัญ:\n\n* **ไม่มีการใช้งาน Probes**: Init Containers ไม่รองรับ `readinessProbe`, `livenessProbe`, หรือ `startupProbe` เนื่องจากคอนเทนเนอร์ต้องรันจนกระทั่งจบการทำงาน (Completion) เท่านั้น โดยระบบจะดูจาก Exit Code เป็นหลัก\n* **พฤติกรรมการรีสตาร์ตเมื่อล้มเหลว**:\n  * หาก Init Container ตัวใดตัวหนึ่งล้มเหลว (Non-zero exit) Kubelet จะทำการ **รีสตาร์ตพอดซ้ำไปเรื่อยๆ** จนกว่า Init Container จะรันสำเร็จ\n  * ยกเว้นว่าค่า `restartPolicy` ของพอดถูกตั้งเป็น `Never` ซึ่งจะทำให้พอดเปลี่ยนสถานะเป็น `Failed` ทันที\n* **สถานะใน `kubectl get pods`**: ในระหว่างที่ Init Containers กำลังทำงาน สถานะของพอดจะแสดงเป็น `Init:0/2`, `Init:1/2` หรือ `Init:Error` ตามความคืบหน้า"
      },
      {
        "id": "resource-sharing-and-volumes",
        "headingEn": "Shared Volumes and Resource Calculation",
        "headingTh": "การแชร์พื้นที่ผ่าน Volume และการคำนวณทรัพยากร",
        "contentMarkdown": "หัวใจสำคัญของการใช้งาน Init Container คือการทำงานร่วมกับ **Shared Volume** (เช่น `emptyDir`):\n* Init Container ทำการเขียนข้อมูล สคริปต์ หรือดาวน์โหลดไฟล์ลงใน Shared Volume\n* เมื่อแอปพลิเคชันหลักเริ่มทำงาน มันจะเมานต์ Volume เดียวกันขึ้นมาอ่านไฟล์เหล่านั้นได้ทันที\n\n### กฎการคำนวณทรัพยากร (Effective Requests & Limits):\nเนื่องจาก Init Containers รันทีละตัวตามลำดับก่อนที่ App Containers จะรันพร้อมกัน Kubernetes จึงคำนวณการจองทรัพยากรของพอดดังนี้:\n* **CPU/Memory Requests ของพอด** = ค่าสูงสุดระหว่าง (1) ค่า Request สูงสุดของบรรดา Init Containers ใดตัวหนึ่ง กับ (2) ผลรวม Request ของ Application Containers ทั้งหมดรวมกัน\n* ทำให้พอดสามารถใช้ทรัพยากรสูงชั่วคราวในช่วง Init ได้โดยไม่เบียดเบียนการคำนวณขนาดโดยรวมของคลัสเตอร์"
      },
      {
        "id": "practical-use-cases",
        "headingEn": "Common Use Cases & Patterns",
        "headingTh": "กรณีการใช้งานยอดนิยม (Use Cases)",
        "contentMarkdown": "รูปแบบการใช้งาน Init Containers ที่พบบ่อยในระดับ Enterprise:\n\n* **รอเซอร์วิสภายนอกพร้อมใช้งาน (Wait for dependencies)**: รันสคริปต์วนลูปตรวจเช็กจนกระทั่งฐานข้อมูล PostgreSQL หรือ Message Queue พร้อมรับการเชื่อมต่อ ก่อนยอมให้เว็บแอปพลิเคชันสตาร์ต\n* **การย้ายโครงสร้างฐานข้อมูล (Database Schema Migration)**: รันคำสั่ง migration (เช่น Liquibase, Flyway, Prisma) ให้เสร็จก่อนแอปเวอร์ชันใหม่จะเริ่มรับรีเควสต์\n* **การดึงคอนฟิกหรือสร้างใบรับรองความปลอดภัย (Vault / TLS Setup)**: ดึง Secrets จาก HashiCorp Vault หรือสร้าง Self-signed Certificate ลงใน Volume ชั่วคราว\n* **การกำหนดสิทธิ์ระบบไฟล์ (chown / chmod Permissions)**: ปรับแก้ Permissions ของโฟลเดอร์ Storage ให้กับ User ที่ไม่ใช่ Root ก่อนที่แอปพลิเคชันจะเมานต์เข้าไป"
      },
      {
        "id": "manifest-example",
        "headingEn": "Comprehensive Manifest Example",
        "headingTh": "ตัวอย่าง Manifest ของพอดที่มี Init Containers หลายตัว",
        "contentMarkdown": "ตัวอย่างด้านล่างแสดงพอดที่มี Init Containers 2 ตัว ทำหน้าที่รอ Service `myservice` และ `mydb` ให้พร้อม ก่อนที่แอปพลิเคชันหลักจะเริ่มทำงาน:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "init-containers-demo.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: myapp-pod\n  labels:\n    app.kubernetes.io/name: MyApp\nspec:\n  containers:\n  - name: myapp-container\n    image: busybox:1.28\n    command: ['sh', '-c', 'echo The app is running! && sleep 3600']\n  initContainers:\n  - name: init-myservice\n    image: busybox:1.28\n    command: ['sh', '-c', \"until nslookup myservice.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for myservice; sleep 2; done\"]\n  - name: init-mydb\n    image: busybox:1.28\n    command: ['sh', '-c', \"until nslookup mydb.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for mydb; sleep 2; done\"]"
          }
        ]
      },
      {
        "id": "failure-handling-and-troubleshooting",
        "headingEn": "Failure Handling and Troubleshooting",
        "headingTh": "การตรวจสอบปัญหาและการดึง Log เมื่อ Init Container ล้มเหลว",
        "contentMarkdown": "เมื่อพอดค้างอยู่ที่สถานะ `Init:0/1` หรือขึ้นสถานะ `Init:CrashLoopBackOff` สามารถตรวจสอบปัญหาได้ดังนี้:\n\n* **ดูข้อมูล Event และสถานะของแต่ละ Init Container**:\n  `kubectl describe pod myapp-pod`\n  ในส่วน `Init Containers:` จะแสดง Exit Code, Reason (เช่น Error หรือ OOMKilled) และ Message\n\n* **ดึง Log ของ Init Container เฉพาะตัว (ต้องระบุแฟล็ก `-c`)**:\n  `kubectl logs myapp-pod -c init-myservice`\n\n* **ดึง Log ของรอบการทำงานก่อนหน้าที่เพิ่งแครชไป**:\n  `kubectl logs myapp-pod -c init-myservice --previous`\n\n> [!WARNING]\n> หากแก้โค้ดใน `spec.initContainers` พอดที่กำลังรันอยู่จะไม่ถูกอัปเดต เนื่องจากฟิลด์ส่วนใหญ่ใน PodSpec ไม่สามารถแก้ไขได้ (Immutable) คุณต้องลบพอดทิ้งหรือแก้ไขที่ระดับ Deployment เพื่อให้สร้างพอดใหม่ขึ้นมาทดแทน"
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
        "title": "Sidecar Containers (ไซด์คาร์คอนเทนเนอร์)",
        "targetType": "concepts",
        "targetPageId": "workloads-sidecar-containers",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/"
      },
      {
        "title": "Configure Pod Initialization (Task)",
        "targetType": "tasks",
        "targetPageId": "run-stateful-application",
        "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-initialization/"
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
