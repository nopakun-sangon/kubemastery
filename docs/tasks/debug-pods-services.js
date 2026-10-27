/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/
 */
(function (root) {
  const pageData = {
  "id": "debug-pods-services",
  "categoryId": "debugging",
  "categoryTitle": "Monitoring, Logging, and Debugging",
  "titleEn": "Debug Pods",
  "titleTh": "ขั้นตอนการตรวจวินิจฉัยและแก้ปัญหาพอดและเซอร์วิส",
  "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/",
  "docsPath": "/docs/tasks/debug/debug-application/debug-pods/",
  "diagram": {
    "src": "images/docs/pod-lifecycle-phases.svg",
    "caption": "ขั้นตอนการตรวจวินิจฉัยปัญหาพอดตั้งแต่ Pending, CrashLoopBackOff ไปจนถึงข้อผิดพลาดของ Service Endpoints"
  },
  "lead": "กรอบแนวทางปฏิบัติแบบทีละขั้นตอน (Step-by-Step Diagnostic Playbook) ในการตรวจสอบ สืบหาสาเหตุ และแก้ไขข้อผิดพลาดของพอดและเซอร์วิส ตั้งแต่สถานะ Pending, ImagePullBackOff, CrashLoopBackOff ไปจนถึงปัญหาเซอร์วิสไม่ส่งทราฟฟิกไปยังพอดปลายทาง",
  "sections": [
    {
      "id": "pod-troubleshooting-playbook-flow",
      "headingEn": "Pod Diagnostic Flowchart & Triage Protocol",
      "headingTh": "ลำดับขั้นตอนและระเบียบปฏิบัติการตรวจวินิจฉัยปัญหาพอด",
      "contentMarkdown": "### 3 สเต็ปมาตรฐานในการคัดกรองปัญหาพอด (Triage Protocol)\n\nเมื่อแอปพลิเคชันทำงานผิดปกติ ให้ดำเนินตาม 3 สเต็ปมาตรฐานของ Kubernetes Administrator เสมอ:\n\n1. **สเต็ปที่ 1: ตรวจสอบสถานะภาพรวมและโหนด (`kubectl get pods -o wide`)**:\n   สังเกตสถานะในคอลัมน์ `STATUS`, `RESTARTS` และโหนดที่พอดถูกส่งไปรัน\n2. **สเต็ปที่ 2: ตรวจสอบ Events และ Conditions (`kubectl describe pod <pod-name>`)**:\n   **อ่านส่วนล่างสุดของคำสั่งเสมอ!** แท็บ `Events` จะบันทึกข้อความจาก Scheduler, Kubelet, และ Container Runtime โดยตรง เช่น สาเหตุที่โหนดรับพอดไม่ได้ หรือทำไมดึง Image ไม่สำเร็จ\n3. **สเต็ปที่ 3: ตรวจสอบ Application Logs (`kubectl logs <pod-name>`)**:\n   ดูสิ่งที่เกิดขึ้นภายในโค้ดของแอปพลิเคชัน หากพอดเพิ่งตายและถูกรีสตาร์ต ให้ใส่แฟล็ก `--previous` เพื่ออ่าน Logs ของรอบก่อนหน้า:\n   ```bash\n   kubectl logs <pod-name> -c <container-name> --previous\n   ```",
      "codeBlocks": []
    },
    {
      "id": "diagnosing-pending-pods",
      "headingEn": "Diagnosing Pods Stuck in Pending",
      "headingTh": "การแก้ปัญหาพอดติดค้างที่สถานะ Pending",
      "contentMarkdown": "สถานะ **Pending** บ่งบอกว่าพอดถูกสร้างขึ้นใน etcd เรียบร้อยแล้ว แต่ยังไม่สามารถถูกกำหนดให้ไปรันบนโหนดใดโหนดหนึ่งได้ (Scheduling Failed)\n\n### สาเหตุหลัก 3 ประการและวิธีแก้ไข:\n\n1. **ทรัพยากรบนโหนดไม่เพียงพอ (Insufficient CPU / Memory)**:\n   * *ข้อความใน Events*: `0/3 nodes are available: 3 Insufficient cpu.`\n   * *วิธีแก้*: ตรวจสอบว่าพอดขอ `requests.cpu` หรือ `requests.memory` สูงเกินไปหรือไม่ หรือปรับขยายจำนวน Worker Nodes ในคลัสเตอร์\n2. **ติดปัญหา Taints & Tolerations หรือ Node Affinity**:\n   * *ข้อความใน Events*: `0/3 nodes are available: 3 node(s) had untolerated taint {node-role.kubernetes.io/control-plane: }.`\n   * *วิธีแก้*: พอดไม่มี Toleration ตรงกับ Taint ของโหนด หรือ Node Selector/Affinity กำหนดเลเบลที่ไม่มีโหนดใดในคลัสเตอร์ตรงกัน\n3. **ปัญหาการจัดสรร Persistent Volume (Storage Binding Failed)**:\n   * *ข้อความใน Events*: `pod has unbound immediate PersistentVolumeClaims`\n   * *วิธีแก้*: ตรวจสอบว่า StorageClass ทำงานปกติหรือไม่ และตรวจสอบว่ามี PV ว่างตรงตามขนาดและ AccessModes ที่ระบุใน PVC หรือไม่",
      "codeBlocks": []
    },
    {
      "id": "diagnosing-crashloop-and-imagepull",
      "headingEn": "Diagnosing CrashLoopBackOff & ImagePullBackOff",
      "headingTh": "การแก้ปัญหา CrashLoopBackOff และ ImagePullBackOff",
      "contentMarkdown": "### 1. ข้อผิดพลาดเกี่ยวกับอิมเมจ (ImagePullBackOff / ErrImagePull)\n* **ชื่ออิมเมจหรือแท็กผิด**: เช่น พิมพ์ชื่อผิด หรือแท็กนั้นไม่มีอยู่จริงบน Registry\n* **ปัญหาการยืนยันตัวตน (Private Registry)**: ลืมระบุ `imagePullSecrets` ในสเปกของพอด\n* **ติดขีดจำกัด Rate Limit ของ Docker Hub**: ตรวจสอบ Events จะพบข้อความ HTTP 429 Too Many Requests\n\n### 2. วงจรอุบาทว์คอนเทนเนอร์แครช (CrashLoopBackOff)\nหมายความว่าคอนเทนเนอร์สตาร์ตขึ้นมาได้ แต่รันต่อไปไม่ได้และ Exit ดับตัวเอง จากนั้น Kubelet พยายามรีสตาร์ตพอดซ้ำๆ โดยเพิ่มระยะเวลารอ (BackOff delay จาก 10s, 20s, 40s ไปจนถึง 5 นาที)\n\n**วิเคราะห์จาก Exit Codes ของ Container:**\n* **Exit Code 0**: คอนเทนเนอร์รันคำสั่งสำเร็จแล้วปิดตัวลง เนื่องจากไม่มีกระบวนการหลักที่ทำงานค้างไว้ใน Background (เช่น รันคำสั่ง `echo` แล้วจบ ไม่มี Daemon process)\n* **Exit Code 1 หรือ 2**: โค้ดของแอปพลิเคชันเกิด Unhandled Exception, syntax error หรือหาไฟล์คอนฟิกไม่เจอ\n* **Exit Code 137 (128 + 9 / SIGKILL)**: **ถูกเคอร์เนลฆ่าตาย (OOMKilled - Out Of Memory)** ตรวจสอบได้ด้วยคำสั่ง `kubectl describe pod` จะพบฟิลด์ `OOMKilled: true` วิธีแก้คือต้องเพิ่ม `resources.limits.memory`\n* **Exit Code 143 (128 + 15 / SIGTERM)**: พอดถูกส่งสัญญาณขอให้ปิดตัวลงตามคำสั่ง",
      "codeBlocks": []
    },
    {
      "id": "debugging-services-and-endpoints",
      "headingEn": "Debugging Services & Traffic Routing Issues",
      "headingTh": "การแก้ปัญหา Service ไม่ส่งต่อทราฟฟิก (Traffic Drop)",
      "contentMarkdown": "หากพอดรันปกติในสถานะ `Running (1/1)` แต่เมื่อผู้ใช้เรียกผ่าน Service กลับไม่ได้การตอบรับ ให้ตรวจสอบตามลำดับ 4 ขั้นตอน:\n\n### ขั้นตอนที่ 1: ตรวจสอบ Endpoints ของ Service\n```bash\nkubectl get endpoints <service-name>\n```\n* หากผลลัพธ์ในคอลัมน์ `ENDPOINTS` แสดงเป็น **`<none>`** แสดงว่า Service หา Pod ที่จะส่งทราฟฟิกไปให้ไม่พบ!\n\n### ขั้นตอนที่ 2: ตรวจสอบ Label Selector Match\nเปรียบเทียบ `spec.selector` ของ Service กับ `metadata.labels` ของ Pod:\n```bash\n# ดู Selector ของ Service\nkubectl get service <service-name> -o jsonpath='{.spec.selector}'\n\n# ค้นหาพอดที่ตรงกับเลเบลนั้น\nkubectl get pods --selector=<label-key>=<label-value>\n```\nหากไม่มีพอดขึ้นมา แสดงว่าเลเบลใน Service Manifest พิมพ์สะกดผิด!\n\n### ขั้นตอนที่ 3: ตรวจสอบ Readiness Probe\nหากเลเบลตรงกันทุกประการ แต่ Endpoints ยังคงเป็น `<none>` ให้ตรวจสอบ Readiness Probe ของพอด:\n* **กฎของ Kubernetes**: พอดที่ไม่ผ่านการตรวจสุขภาพของ Readiness Probe จะถูก Kubelet ถอด IP ออกจาก Endpoints ของ Service โดยอัตโนมัติ เพื่อป้องกันไม่ให้ทราฟฟิกตกหล่น\n\n### ขั้นตอนที่ 4: ตรวจสอบ Port และ TargetPort\n* `port`: พอร์ตที่ Service เปิดให้ภายนอกเรียก\n* `targetPort`: พอร์ตที่คอนเทนเนอร์กำลัง Listen อยู่จริง ต้องตรงกัน!",
      "codeBlocks": []
    },
    {
      "id": "debugging-cheat-sheet",
      "headingEn": "Admin Debugging Cheat Sheet for CKA",
      "headingTh": "รวมคำสั่งตรวจสอบด่วนและเคล็ดลับการสอบ CKA",
      "contentMarkdown": "### คำสั่งตรวจสอบด่วน (One-Liners):\n```bash\n# ดึง Logs ของทุกคอนเทนเนอร์ในพอด\nkubectl logs <pod-name> --all-containers=true\n\n# ดึง Logs ของพอดทั้งหมดที่มีเลเบลเดียวกัน\nkubectl logs -l app=backend --tail=50\n\n# ดู Events ล่าสุดของทั้ง Namespace เรียงตามเวลา\nkubectl get events --sort-by='.metadata.creationTimestamp'\n\n# รันพอดทดสอบ cURL ไปยัง Service หรือ Pod IP ตรงๆ\nkubectl run curl-test --rm -i -t --image=curlimages/curl -- \\\n  curl -Iv http://my-service:8080/healthz\n\n# ตรวจสอบว่าพอร์ตในคอนเทนเนอร์เปิดฟังอยู่จริงหรือไม่\nkubectl exec <pod-name> -- netstat -tlpn\n```"
    }
  ],
  "relatedLinks": [
    {
      "title": "Get a Shell to a Running Container and Debug Pods",
      "targetType": "tasks",
      "targetPageId": "debug-running-pods-exec",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/get-shell-running-container/"
    },
    {
      "title": "Debugging DNS Resolution",
      "targetType": "tasks",
      "targetPageId": "debug-dns-resolution",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/"
    },
    {
      "title": "Configure Liveness, Readiness and Startup Probes",
      "targetType": "tasks",
      "targetPageId": "pod-liveness-readiness-startup-probes",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/"
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
