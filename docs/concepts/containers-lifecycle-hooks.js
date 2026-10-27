/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/
 */
(function (root) {
  const pageData = {
    "id": "containers-lifecycle-hooks",
    "categoryId": "containers",
    "categoryTitle": "Containers",
    "titleEn": "Container Lifecycle Hooks",
    "titleTh": "ฮุกวงจรชีวิตคอนเทนเนอร์ (PostStart & PreStop Hooks)",
    "officialUrl": "https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/",
    "docsPath": "/docs/concepts/containers/container-lifecycle-hooks/",
    "diagram": {
      "src": "images/docs/pod-lifecycle-phases.svg",
      "caption": "ลำดับเหตุการณ์ในวงจรชีวิตคอนเทนเนอร์: PostStart ทำงานคู่ขนานกับ ENTRYPOINT และ PreStop ทำงานก่อน SIGTERM"
    },
    "lead": "คอนเทนเนอร์มีวงจรชีวิตที่ชัดเจน โดย Kubernetes ได้เปิดจุดดักจับเหตุการณ์ (Lifecycle Hooks) 2 จุดหลักคือ PostStart และ PreStop เพื่อให้คอนเทนเนอร์สามารถรับรู้การเปลี่ยนแปลงสถานะและสั่งรันโค้ดจัดการสภาพแวดล้อมหรือปิดระบบอย่างนุ่มนวล (Graceful Termination) ได้",
    "sections": [
      {
        "id": "container-hooks-overview",
        "headingEn": "Container Lifecycle Hooks Overview",
        "headingTh": "ภาพรวมของจุดดักจับวงจรชีวิตคอนเทนเนอร์",
        "contentMarkdown": "ในลักษณะเดียวกับเฟรมเวิร์กการเขียนโปรแกรมหลายภาษาที่มี Constructor และ Destructor หรือ Event Hooks ทาง Kubernetes ได้เตรียมจุดเชื่อมต่อให้คอนเทนเนอร์สามารถจัดการกิจกรรมต่างๆ ตามวงจรชีวิตของตนเองได้\n\nมีฮุกหลัก 2 ตัวที่เปิดให้ใช้งาน:\n\n* **`PostStart`**: ถูกสั่งรันทันทีหลังจากที่คอนเทนเนอร์ถูกสร้างขึ้นมาใหม่\n* **`PreStop`**: ถูกสั่งรันทันทีก่อนที่คอนเทนเนอร์จะถูกสั่งปิดการทำงาน (ก่อนส่งสัญญาณ `SIGTERM`)\n\nการใช้ฮุกเหล่านี้ช่วยให้นักพัฒนาสามารถควบคุมกระบวนการ Warm up แคช, ลงทะเบียนบริการ (Service Registration), บันทึกสถานะล่าสุดลงดิสก์, หรือการรอให้ Request ค้างท่อเคลียร์หมดก่อนปิดโปรเซส"
      },
      {
        "id": "poststart-hook",
        "headingEn": "PostStart Hook: Execution & Semantics",
        "headingTh": "ฮุก PostStart: พฤติกรรมการทำงานและการเริ่มระบบ",
        "contentMarkdown": "ฮุก **`PostStart`** จะถูกสั่งรันทันทีหลังจากสร้างคอนเทนเนอร์เสร็จสมบูรณ์ อย่างไรก็ตามมีรายละเอียดเชิงลึกที่ต้องเข้าใจดังนี้:\n\n* **ทำงานคู่ขนานแบบ Asynchronous**: ตัวฮุกจะทำงานควบคู่ไปพร้อมๆ กับคำสั่ง `ENTRYPOINT` หรือ `CMD` ของคอนเทนเนอร์ โดยไม่การันตีว่าสิ่งใดจะรันเสร็จก่อนกัน (No ordering guarantee between hook and entrypoint)\n* **บล็อกสถานะ Running ของ Pod**: แม้จะรันแบบ Asynchronous แต่ Kubelet จะยัง **ไม่ปรับสถานะของคอนเทนเนอร์ให้เป็น `Running`** จนกว่าตัวจัดการฮุก PostStart จะทำงานเสร็จสมบูรณ์\n* **การจัดการเมื่อล้มเหลว (Failure Behavior)**: หากฮุก PostStart คืนค่าสถานะผิดพลาด (Non-zero exit code หรือ HTTP error) Kubelet จะสั่ง **ฆ่าคอนเทนเนอร์ทิ้งทันที** และรีสตาร์ตคอนเทนเนอร์ใหม่ตามนโยบาย `restartPolicy` ของพอด"
      },
      {
        "id": "prestop-hook",
        "headingEn": "PreStop Hook: Graceful Shutdown",
        "headingTh": "ฮุก PreStop: การจัดการปิดระบบอย่างนุ่มนวล",
        "contentMarkdown": "เมื่อพอดกำลังจะถูกลบหรือถูกแทนที่ด้วยเวอร์ชันใหม่ Kubelet จะเริ่มกระบวนการปิดคอนเทนเนอร์ โดยสั่งรันฮุก **`PreStop`** ก่อนสิ่งอื่นใด:\n\n* **ทำงานแบบ Synchronous (บล็อกการทำงาน)**: Kubelet จะรอให้ฮุก PreStop ทำงานจนเสร็จสมบูรณ์ก่อน จึงจะส่งสัญญาณ `SIGTERM` ไปยัง Process ID 1 (PID 1) ของคอนเทนเนอร์\n* **ตัดการรับทราฟฟิกใหม่**: ในระหว่างที่ PreStop กำลังทำงาน EndpointSlice Controller จะถอด IP ของพอดออกจาก Service พร้อมกัน เพื่อไม่ให้มี Request ใหม่วิ่งเข้ามาที่พอดนี้\n* **กรณีการใช้งานยอดนิยม**: สั่งระบายการเชื่อมต่อ (Connection Draining), บันทึก In-memory buffer ลงดาต้าเบส, หรือใส่คำสั่งหน่วงเวลา (sleep) เล็กน้อยเพื่อให้ iptables/ipvs บนโหนดอื่นอัปเดตตัดทราฟฟิกเสร็จเรียบร้อยก่อนแอปปิดตัว ป้องกันปัญหา HTTP 502 Bad Gateway"
      },
      {
        "id": "hook-handlers",
        "headingEn": "Hook Handlers: exec, httpGet, and sleep",
        "headingTh": "รูปแบบของ Hook Handlers ใน Kubernetes",
        "contentMarkdown": "Kubernetes รองรับรูปแบบการกระทำ (Action) ภายในฮุก 3 รูปแบบ:\n\n1. **`exec`**: รันคำสั่งเฉพาะทาง (Shell command) ภายใน Namespaces และ Filesystem ของคอนเทนเนอร์นั้นๆ หากโปรเซสคืนค่าสถานะเป็น 0 ถือว่าสำเร็จ\n2. **`httpGet`**: ส่งคำขอ HTTP GET ไปยังพอร์ตและเส้นทาง (Path) ที่ระบุบน Container IP หากได้รับ HTTP Response Code ในช่วง 200 ถึง 399 ถือว่าสำเร็จ\n3. **`sleep` (ฟีเจอร์ใหม่ใน Kubernetes 1.30+)**: สั่งพักการทำงานเป็นระยะเวลาที่กำหนด (เช่น 10 วินาที) ก่อนดำเนินการขั้นตอนถัดไป โดยไม่ต้องพึ่งพาคำสั่ง `sleep` จาก shell ในอิมเมจ (มีประโยชน์มากสำหรับ Minimal/Distroless Images)",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "lifecycle-hooks-example.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: lifecycle-demo\nspec:\n  containers:\n  - name: web-server\n    image: nginx:1.25\n    lifecycle:\n      postStart:\n        exec:\n          command: [\"/bin/sh\", \"-c\", \"echo Container started at $(date) > /usr/share/nginx/html/status.html\"]\n      preStop:\n        exec:\n          command: [\"/bin/sh\", \"-c\", \"nginx -s quit; sleep 5\"]\n  terminationGracePeriodSeconds: 30"
          }
        ]
      },
      {
        "id": "hook-delivery-guarantees",
        "headingEn": "Hook Delivery Guarantees & Termination Period",
        "headingTh": "การรับประกันการส่งสัญญาณและความสัมพันธ์กับ Grace Period",
        "contentMarkdown": "Kubernetes ออกแบบการันตีของฮุกไว้เป็นแบบ **'At least once' (ส่งอย่างน้อยหนึ่งครั้ง)** นั่นหมายความว่าฮุกอาจถูกเรียกซ้ำได้ในกรณีที่เกิดข้อผิดพลาดระดับระบบ ดังนั้นโค้ดภายในฮุกควรมีความเป็น **Idempotent** (รันซ้ำแล้วได้ผลลัพธ์เดิม ไม่ก่อให้เกิดความเสียหาย)\n\n### ความสัมพันธ์กับ `terminationGracePeriodSeconds`:\n* เวลานับถอยหลังของ Grace Period (ค่าเริ่มต้น 30 วินาที) จะ **เริ่มต้นนับทันทีที่ส่งสัญญาณ PreStop**\n* หากฮุก PreStop ทำงานนานเกินกว่าเวลาของ `terminationGracePeriodSeconds` ตัว Kubelet จะไม่รอให้ PreStop รันจบ แต่จะสั่งส่งสัญญาณ `SIGKILL` ทำลายคอนเทนเนอร์ทิ้งทันที\n* หากฮุก PreStop จำเป็นต้องใช้เวลาในการเคลียร์ข้อมูลนาน (เช่น ปิดดาต้าเบสขนาดใหญ่) คุณต้องขยายค่า `terminationGracePeriodSeconds` ใน PodSpec ให้ยาวนานเพียงพอ (เช่น 60 ถึง 120 วินาที)"
      },
      {
        "id": "debugging-and-pitfalls",
        "headingEn": "Practical Manifests & Common Pitfalls",
        "headingTh": "ข้อควรระวังและปัญหาที่พบบ่อย (Common Pitfalls)",
        "contentMarkdown": "* **PostStart เกิด Deadlock**: หลีกเลี่ยงการเขียนสคริปต์ใน PostStart ที่ต้องรอให้ Port ของ Container เปิดรับ Connection เพราะคอนเทนเนอร์อาจกำลังรัน Entrypoint อยู่และยังไม่เปิดพอร์ต ทำให้ PostStart ค้างจน Kubelet ฆ่าทิ้ง\n* **ไม่มี Shell ภายในคอนเทนเนอร์**: หากใช้อิมเมจแบบ `scratch` หรือ `distroless` การสั่ง `exec: command: [\"/bin/sh\"]` จะล้มเหลวทันทีเนื่องจากไม่มี Shell ไบนารีอยู่ในอิมเมจ ในกรณีนี้ควรใช้ `httpGet` หรือ `sleep` แทน\n* **Log ของ Hook หายไปไหน**: ผลลัพธ์ (Stdout/Stderr) ของคำสั่งที่รันใน Exec Hook จะไม่ถูกบันทึกรวมอยู่ใน `kubectl logs` ของพอด หากเกิดข้อผิดพลาดจะปรากฏเป็น Event `FailedPostStartHook` หรือ `FailedPreStopHook` ใน `kubectl describe pod` เท่านั้น"
      }
    ],
    "relatedLinks": [
      {
        "title": "Container Images (อิมเมจคอนเทนเนอร์)",
        "targetType": "concepts",
        "targetPageId": "containers-images",
        "officialUrl": "https://kubernetes.io/docs/concepts/containers/images/"
      },
      {
        "title": "Pod Lifecycle (วงจรชีวิตของพอด)",
        "targetType": "concepts",
        "targetPageId": "workloads-pod-lifecycle",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/"
      },
      {
        "title": "Attach Handlers to Container Lifecycle Events (Task)",
        "targetType": "tasks",
        "targetPageId": "pod-liveness-readiness-startup-probes",
        "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/attach-handler-lifecycle-event/"
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
