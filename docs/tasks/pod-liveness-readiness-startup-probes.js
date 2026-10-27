/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
 */
(function (root) {
  const pageData = {
  "id": "pod-liveness-readiness-startup-probes",
  "categoryId": "configure-pods",
  "categoryTitle": "Configure Pods and Containers",
  "titleEn": "Configure Liveness, Readiness and Startup Probes",
  "titleTh": "การตั้งค่าระบบตรวจสอบสุขภาพอัตโนมัติ (Health Probes)",
  "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/",
  "docsPath": "/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/",
  "lead": "kubelet ใช้ Health Probes เพื่อตรวจสอบสถานะการทำงานของคอนเทนเนอร์อย่างต่อเนื่อง โดยแยกระหว่างการตรวจจับพอดที่แฮงก์เพื่อรีสตาร์ท (Liveness), การตรวจจับความพร้อมในการรับทราฟฟิก (Readiness), และการรอช่วงบูตระบบที่ใช้เวลานาน (Startup)",
  "sections": [
    {
      "id": "probe-types-differences",
      "headingEn": "Probe Types and Their Distinct Roles",
      "headingTh": "ประเภทของ Probe ทั้ง 3 ชนิดและหน้าที่ที่แตกต่างกัน",
      "contentMarkdown": "การออกแบบระบบ High Availability ใน Kubernetes จำเป็นต้องเข้าใจหน้าที่เฉพาะของ Probe แต่ละประเภทอย่างชัดเจน:\n\n* **Liveness Probe**:\n  ตรวจสอบว่าคอนเทนเนอร์ยังทำงานอยู่หรือไม่ หาก Liveness Probe ล้มเหลว kubelet จะทำการ kill คอนเทนเนอร์นั้นทิ้งทันที และเริ่มกระบวนการรีสตาร์ทใหม่ตามนโยบาย `restartPolicy` เหมาะสำหรับตรวจจับสภาวะ Deadlock หรือแอปพลิเคชันค้างโดยไม่ยอมปิดตัว\n* **Readiness Probe**:\n  ตรวจสอบว่าคอนเทนเนอร์พร้อมที่จะให้บริการรับทราฟฟิกจากภายนอกหรือยัง หาก Readiness Probe ล้มเหลว พอดจะไม่ถูก kill หรือรีสตาร์ท แต่ตัวแทน Service Endpoint Controller จะลบ IP ของพอดออกจากรายการ Endpoints ของ Service ทันที เพื่อป้องกันไม่ให้ส่งผู้ใช้งานไปยังพอดที่ยังเตรียมตัวไม่เสร็จ\n* **Startup Probe**:\n  ออกแบบมาเป็นพิเศษสำหรับแอปพลิเคชันขนาดใหญ่ที่ใช้เวลาเริ่มต้นระบบนาน (Slow Start เช่น Java JVM หรือแอปที่ต้องโหลดโมเดลขนาดใหญ่) โดย Startup Probe จะเข้ามาระงับการทำงานของ Liveness และ Readiness Probe ชั่วคราว จนกว่าระบบจะเริ่มต้นสำเร็จครั้งแรก ช่วยป้องกันปัญหาพอดถูก kill วนซ้ำ (CrashLoopBackOff) ก่อนที่จะบูตเสร็จ",
      "codeBlocks": []
    },
    {
      "id": "probe-handler-mechanisms",
      "headingEn": "Probe Handler Mechanisms: Exec, HTTP GET, and TCP Socket",
      "headingTh": "กลไกการตรวจจับ 3 รูปแบบ: Exec, HTTP GET, และ TCP Socket",
      "contentMarkdown": "Kubernetes รองรับกลไกในการส่งคำขอตรวจสอบความพร้อมของคอนเทนเนอร์ 3 รูปแบบหลัก:\n\n1. **`httpGet`**:\n   kubelet จะส่ง HTTP GET Request ไปยังพอร์ตและเส้นทาง (Path) ที่ระบุ หากตอบกลับด้วยรหัส HTTP Status Code ตั้งแต่ `200` ถึง `399` จะถือว่าผ่าน (Success)\n2. **`tcpSocket`**:\n   kubelet จะพยายามเปิดการเชื่อมต่อ TCP Socket ไปยังพอร์ตที่กำหนด หากสามารถ Establish Connection ได้สำเร็จจะถือว่าผ่าน เหมาะสำหรับฐานข้อมูลหรือเซอร์วิสที่ไม่ใช่เว็บ HTTP\n3. **`exec`**:\n   kubelet จะรันคำสั่งเชลล์ภายในคอนเทนเนอร์ หากคำสั่งส่งคืนค่า Exit Code เป็น `0` จะถือว่าผ่าน",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "probe-handlers.yaml",
          "code": "# ตัวอย่างการตั้งค่าแต่ละ Handler ใน Container spec\n\n# แบบที่ 1: HTTP GET\nlivenessProbe:\n  httpGet:\n    path: /healthz\n    port: 8080\n    httpHeaders:\n    - name: Custom-Header\n      value: Awesome\n\n# แบบที่ 2: TCP Socket\nreadinessProbe:\n  tcpSocket:\n    port: 3306\n\n# แบบที่ 3: Exec Command\nlivenessProbe:\n  exec:\n    command:\n    - cat\n    - /tmp/healthy"
        }
      ]
    },
    {
      "id": "probe-timing-parameters",
      "headingEn": "Configuring Probe Timing Parameters",
      "headingTh": "การปรับแต่งพารามิเตอร์เวลา (Timing Parameters)",
      "contentMarkdown": "การปรับแต่งเวลาให้เหมาะสมกับพฤติกรรมของแอปพลิเคชันมีความสำคัญอย่างยิ่งต่อเสถียรภาพของระบบ:\n\n* **`initialDelaySeconds`**: จำนวนวินาทีที่ kubelet ต้องรอก่อนเริ่มส่ง Probe ครั้งแรกหลังจากคอนเทนเนอร์สตาร์ท\n* **`periodSeconds`**: ความถี่ในการส่ง Probe ตรวจสอบ (ค่าเริ่มต้นคือ 10 วินาที)\n* **`timeoutSeconds`**: ระยะเวลาที่รอคำตอบ หากเกินเวลานี้จะถือว่า Probe ล้มเหลว (ค่าเริ่มต้นคือ 1 วินาที)\n* **`successThreshold`**: จำนวนครั้งที่ต้องผ่านติดต่อกันหลังจากล้มเหลว จึงจะถือว่ากลับมาผ่านอีกครั้ง (ค่าเริ่มต้นคือ 1)\n* **`failureThreshold`**: จำนวนครั้งที่ยอมให้ล้มเหลวติดต่อกัน ก่อนที่ kubelet จะตัดสินใจดำเนินการ (ค่าเริ่มต้นคือ 3)",
      "codeBlocks": []
    },
    {
      "id": "practical-combined-example",
      "headingEn": "Complete Production Example: Combining Startup, Liveness, and Readiness",
      "headingTh": "ตัวอย่างสมบูรณ์แบบ Production: การผสาน Startup, Liveness, และ Readiness Probe",
      "contentMarkdown": "ตัวอย่างการตั้งค่าพอดที่มีครบทั้ง Startup Probe (ให้เวลาเริ่มต้นสูงสุด 120 วินาที), Readiness Probe (เช็คความพร้อมรับทราฟฟิกทุก 5 วินาที), และ Liveness Probe (เช็คว่าระบบยังไม่ค้างทุก 10 วินาที)",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "complete-probes-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: production-ready-app\n  labels:\n    app: web\nspec:\n  containers:\n  - name: web-server\n    image: nginx:alpine\n    ports:\n    - containerPort: 80\n    # 1. Startup Probe: รอให้ระบบบูตเสร็จสมบูรณ์\n    startupProbe:\n      httpGet:\n        path: /\n        port: 80\n      failureThreshold: 30\n      periodSeconds: 4\n    # 2. Readiness Probe: เช็คความพร้อมรับผู้ใช้\n    readinessProbe:\n      httpGet:\n        path: /\n        port: 80\n      initialDelaySeconds: 5\n      periodSeconds: 5\n    # 3. Liveness Probe: เช็คความมีชีวิตของแอปพลิเคชัน\n    livenessProbe:\n      httpGet:\n        path: /\n        port: 80\n      initialDelaySeconds: 10\n      periodSeconds: 10\n      timeoutSeconds: 2\n      failureThreshold: 3"
        },
        {
          "lang": "bash",
          "label": "apply-and-inspect-probes.sh",
          "code": "# สร้างพอดและสังเกตคอลัมน์ READY ใน output\nkubectl apply -f complete-probes-pod.yaml\nkubectl get pod production-ready-app -w\n\n# ดูรายละเอียด Events ของการตรวจ Probe\nkubectl describe pod production-ready-app"
        }
      ]
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
      "title": "Assign Memory and CPU Resources to Containers",
      "targetType": "tasks",
      "targetPageId": "pod-assign-memory-cpu",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/"
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
