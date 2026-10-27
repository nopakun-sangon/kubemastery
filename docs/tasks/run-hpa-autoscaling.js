/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/
 */
(function (root) {
  const pageData = {
  "id": "run-hpa-autoscaling",
  "categoryId": "run-applications",
  "categoryTitle": "Run Applications",
  "titleEn": "HorizontalPodAutoscaler Walkthrough",
  "titleTh": "การตั้งค่าขยายพอดอัตโนมัติตามการใช้งาน CPU (HPA)",
  "officialUrl": "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/",
  "docsPath": "/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/",
  "diagram": {
    "src": "images/docs/hpa-autoscaling-loop.svg",
    "caption": "วงจรการทำงานของ HPA: รวบรวมเมตริกจาก Metrics Server และคำนวณปรับ Replicas"
  },
  "lead": "คู่มือปฏิบัติการตั้งค่า Horizontal Pod Autoscaler (HPA) เพื่อขยายและลดจำนวน Pods ของ Deployment โดยอัตโนมัติตามสัดส่วนการใช้งาน CPU หรือ Memory ผ่านตัวควบคุม Autoscaler และ Metrics Server พร้อมการทดสอบจำลองโหลดจริง",
  "sections": [
    {
      "id": "hpa-prerequisites-and-algorithm",
      "headingEn": "Prerequisites & The Autoscaling Algorithm",
      "headingTh": "ข้อกำหนดเบื้องต้นและอัลกอริทึมการคำนวณของ HPA",
      "contentMarkdown": "### สถาปัตยกรรมและข้อกำหนดเบื้องต้น\n\n**HorizontalPodAutoscaler (HPA)** ทำงานเป็น Reconciliation Loop ในเบื้องหลังของ Kubernetes Master (โดยทั่วไปตรวจเช็คทุกๆ 15 วินาที) โดยมีเงื่อนไขจำเป็น 2 ประการ:\n1. **Metrics Server ต้องได้รับการติดตั้งในคลัสเตอร์**:\n   ทดสอบด้วยคำสั่ง:\n   ```bash\n   kubectl top nodes\n   kubectl top pods\n   ```\n   หากคำสั่งด้านบนแสดงการใช้งาน CPU และ RAM แสดงว่า Metrics Server ทำงานสมบูรณ์\n2. **พอดเป้าหมายต้องกำหนด `resources.requests.cpu` เสมอ**:\n   หากคุณลืมใส่ `requests.cpu` ตัว HPA จะไม่สามารถคำนวณเปอร์เซ็นต์การใช้งานได้ และสถานะ TARGETS ในคำสั่ง `kubectl get hpa` จะแสดงเป็น `<unknown>/50%`\n\n### สูตรการคำนวณจำนวนพอดของ HPA\nคอนโทรลเลอร์คำนวณจำนวน Replicas ที่เหมาะสมตามสูตรมาตรฐาน:\n$$\\text{desiredReplicas} = \\left\\lceil \\text{currentReplicas} \\times \\left( \\frac{\\text{currentMetricValue}}{\\text{desiredMetricValue}} \\right) \\right\\rceil$$\n\n*ตัวอย่าง:* หากปัจจุบันมี 1 พอด และใช้ CPU อยู่ที่ 200m ขณะที่เป้าหมายที่ตั้งไว้คือ 100m ระบบจะคำนวณ: $1 \\times (200 / 100) = 2$ Replicas ทันที",
      "codeBlocks": []
    },
    {
      "id": "deploying-sample-php-app",
      "headingEn": "Deploying the Sample Application & Service",
      "headingTh": "การสร้างแอปพลิเคชันตัวอย่างและเปิดใช้งาน Service",
      "contentMarkdown": "เราจะใช้คอนเทนเนอร์ `php-apache` ซึ่งมีสคริปต์คำนวณเลขชี้กำลังทางคณิตศาสตร์เพื่อสร้างภาระงาน CPU สูงเมื่อมี HTTP Request เข้ามา\n\nสร้างไฟล์ `php-apache.yaml` ดังตัวอย่างด้านล่าง:\n* กำหนด `resources.requests.cpu: \"200m\"` (0.2 CPU Core)\n* มี Service ชนิด ClusterIP พอร์ต 80 เพื่อรับทราฟฟิกภายใน\n\nสั่งสร้างทรัพยากร:\n```bash\nkubectl apply -f php-apache.yaml\n```\nตรวจสอบว่าพอดเริ่มทำงาน:\n```bash\nkubectl get deployment php-apache\n```",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "php-apache.yaml",
          "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: php-apache\nspec:\n  selector:\n    matchLabels:\n      run: php-apache\n  replicas: 1\n  template:\n    metadata:\n      labels:\n        run: php-apache\n    spec:\n      containers:\n      - name: php-apache\n        image: registry.k8s.io/hpa-example\n        ports:\n        - containerPort: 80\n        resources:\n          limits:\n            cpu: 500m\n          requests:\n            cpu: 200m\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: php-apache\n  labels:\n    run: php-apache\nspec:\n  ports:\n  - port: 80\n  selector:\n    run: php-apache"
        }
      ]
    },
    {
      "id": "creating-hpa-resource",
      "headingEn": "Creating the HorizontalPodAutoscaler Resource",
      "headingTh": "การสร้างอ็อบเจกต์ HorizontalPodAutoscaler",
      "contentMarkdown": "คุณสามารถสร้าง HPA ได้ 2 วิธี:\n\n### วิธีที่ 1: สั่งผ่านคำสั่ง Imperative (เหมาะสำหรับการทดสอบด่วน)\nสั่งให้สเกล Deployment `php-apache` หากค่าเฉลี่ยการใช้งาน CPU เกิน 50% ของค่าที่ Request ไว้ โดยจำกัดช่วงพอดระหว่าง 1 ถึง 10 ตัว:\n```bash\nkubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=10\n```\n\n### วิธีที่ 2: สร้างผ่าน Declarative YAML (API autoscaling/v2)\nสร้างไฟล์ `php-apache-hpa.yaml` ซึ่งมีความยืดหยุ่นสูง สามารถกำหนดเป้าหมายเมตริกได้ทั้ง CPU, Memory และ Custom Metrics:\n```bash\nkubectl apply -f php-apache-hpa.yaml\n```\n\nตรวจสอบสถานะของ HPA:\n```bash\nkubectl get hpa php-apache\n```\nหลังรอให้ Metrics Server อัปเดตข้อมูลรอบแรก (1-2 นาที) คุณจะเห็นฟิลด์ TARGETS เปลี่ยนจาก `<unknown>/50%` เป็น `0%/50%`",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "php-apache-hpa.yaml",
          "code": "apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: php-apache\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: php-apache\n  minReplicas: 1\n  maxReplicas: 10\n  metrics:\n  - type: Resource\n    resource:\n      name: cpu\n      target:\n        type: Utilization\n        averageUtilization: 50"
        }
      ]
    },
    {
      "id": "generating-load-and-observing",
      "headingEn": "Generating Load and Observing Autoscaling",
      "headingTh": "การจำลองโหลดและสังเกตการณ์ขยายขนาด (Scale Out)",
      "contentMarkdown": "### ยิงโหลดทดสอบอย่างต่อเนื่อง\nเปิดหน้าต่าง Terminal ใหม่ แล้วสั่งรันพอด BusyBox ยิง Request เข้าใส่ `http://php-apache` วนลูปไม่สิ้นสุด:\n```bash\nkubectl run -i --tty load-generator --rm --image=busybox:1.28 --restart=Never -- \\\n  /bin/sh -c \"while sleep 0.01; do wget -q -O- http://php-apache; done\"\n```\n\n### สังเกตการณ์ขยายพอด (Scale Out)\nในหน้าต่าง Terminal เดิม ให้เฝ้าติดตามสถานะของ HPA อย่างต่อเนื่อง:\n```bash\nkubectl get hpa php-apache --watch\n```\nภายใน 1-2 นาที คุณจะเห็นการเปลี่ยนแปลง:\n```\nNAME         REFERENCE               TARGETS    MINPODS   MAXPODS   REPLICAS   AGE\nphp-apache   Deployment/php-apache   0%/50%     1         10        1          3m\nphp-apache   Deployment/php-apache   180%/50%   1         10        1          4m\nphp-apache   Deployment/php-apache   240%/50%   1         10        4          4m30s\nphp-apache   Deployment/php-apache   68%/50%    1         10        5          5m\n```\n\nตรวจสอบพอดที่เพิ่มขึ้นจริง:\n```bash\nkubectl get pods -l run=php-apache\n```\nDeployment ขยายขนาดจาก 1 พอด เป็น 4 และ 5 พอดตามลำดับ เพื่อกระจายภาระงาน CPU ให้ลดลงกลับมาใกล้เคียง 50% ตามที่กำหนด!",
      "codeBlocks": []
    },
    {
      "id": "stopping-load-and-stabilization-window",
      "headingEn": "Stopping Load and the Scale Down Stabilization Window",
      "headingTh": "การหยุดโหลดและช่วงหน่วงเวลาลดขนาด (Stabilization Window)",
      "contentMarkdown": "### สังเกตการย่อขนาดพอด (Scale Down)\nกลับไปที่หน้าต่างที่รัน `load-generator` แล้วกดปุ่ม `Ctrl + C` เพื่อหยุดการยิงทราฟฟิก\n\nเมื่อไม่มีทราฟฟิก โหลด CPU ของพอดจะลดลงสู่ `0%/50%` อย่างไรก็ตาม คุณจะสังเกตเห็นว่าจำนวนพอดจะ **ยังไม่ลดลงในทันที**!\n\n### ทำไมจำนวนพอดจึงไม่ลดลงทันที? (Stabilization Window)\nKubernetes มีกลไกป้องกันปรากฏการณ์ที่เรียกว่า **\"Flapping\" หรือ \"Thrashing\"** (สภาวะที่พอดขยายและยุบสลับกันไปมาอย่างรวดเร็วเมื่อโหลดแกว่งตัว) โดยในสเปกดีฟอลต์ของ HPA v2 จะมีการกำหนด:\n* **`stabilizationWindowSeconds: 300`** (หน่วงเวลา 5 นาที) สำหรับการลดขนาด (Scale Down)\n* ระบบจะบันทึกค่าสถานะที่แนะนำทั้งหมดตลอด 5 นาทีที่ผ่านมา และเลือกค่า Replicas ที่ปลอดภัยที่สุด เพื่อรับประกันว่าหากโหลดกลับมาอีกครั้ง ระบบจะไม่เกิด Downtime\n\nเมื่อครบ 5 นาที ให้รันคำสั่ง:\n```bash\nkubectl get hpa php-apache\n```\nคุณจะพบว่า `REPLICAS` ลดขนาดกลับลงมาเหลือ `1` พอดตามเดิมโดยอัตโนมัติ"
    }
  ],
  "relatedLinks": [
    {
      "title": "Assign Memory and CPU Resources to Containers",
      "targetType": "tasks",
      "targetPageId": "pod-assign-memory-cpu",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/"
    },
    {
      "title": "Run a Stateless Application Using a Deployment",
      "targetType": "tasks",
      "targetPageId": "run-stateless-deployment",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/"
    },
    {
      "title": "Specifying a Disruption Budget for your Application (PDB)",
      "targetType": "tasks",
      "targetPageId": "run-configure-pdb",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/configure-pdb/"
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
