/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/inject-data-application/downward-api-volume-expose-pod-information/
 */
(function (root) {
  const pageData = {
  "id": "inject-downward-api",
  "categoryId": "inject-data",
  "categoryTitle": "Inject Data Into Applications",
  "titleEn": "Expose Pod Information to Containers Through Files",
  "titleTh": "การเปิดเผยข้อมูลพอดให้คอนเทนเนอร์ด้วย Downward API",
  "officialUrl": "https://kubernetes.io/docs/tasks/inject-data-application/downward-api-volume-expose-pod-information/",
  "docsPath": "/docs/tasks/inject-data-application/downward-api-volume-expose-pod-information/",
  "lead": "Downward API ช่วยให้คอนเทนเนอร์สามารถรับรู้ข้อมูลเมทาดาทาของตัวเองและของคลัสเตอร์ (เช่น ชื่อพอด, เนมสเปซ, โหนดที่รันอยู่, IP Address และค่า Resource Limits/Requests) โดยไม่ต้องเขียนโค้ดเรียก API Server",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nDownward API ช่วยให้แอปพลิเคชันภายในคอนเทนเนอร์เข้าถึงข้อมูลเมทาดาทาและสถานะของพอดตัวเอง (เช่น Pod Name, Namespace, Node Name, Pod IP) รวมถึงค่า Resource Limits และ Requests ได้โดยตรง โดยไม่จำเป็นต้องเขียนโค้ดเรียก API Server หรือขอสิทธิ์ RBAC พิเศษ\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **สองกลุ่มข้อมูลที่รองรับ**:\n  * **`fieldRef` (ข้อมูล Metadata & Status)**: เช่น `metadata.name`, `metadata.namespace`, `metadata.uid`, `spec.nodeName`, `status.podIP`, `spec.serviceAccountName`\n  * **`resourceFieldRef` (ข้อมูลทรัพยากร)**: เช่น `limits.cpu`, `requests.cpu`, `limits.memory`, `requests.memory` (สามารถระบุ `divisor` เพื่อกำหนดหน่วยได้ เช่น `1Mi` หรือ `1m`)\n* **สองช่องทางในการส่งผ่าน**:\n  * **Environment Variables**: สะดวกสำหรับค่าเดี่ยวๆ ที่คงที่ตลอดอายุพอด (เช่น Pod IP, Namespace)\n  * **Downward API Volume**: จำเป็นสำหรับข้อมูลที่มีโครงสร้างเป็น Key-Value แบบไดนามิก เช่น `metadata.labels` และ `metadata.annotations` โดย Kubelet จะเขียนเป็นไฟล์ข้อความและอัปเดตให้เมื่อข้อมูลเปลี่ยน\n* **ข้อจำกัด**: `metadata.labels` และ `annotations` ไม่สามารถส่งผ่าน Environment Variable ได้ ต้องส่งผ่าน Volume เท่านั้น\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* **โครงสร้าง YAML สำคัญ**:\n  * `fieldRef`: `valueFrom: { fieldRef: { fieldPath: metadata.name } }`\n  * `resourceFieldRef`: `valueFrom: { resourceFieldRef: { containerName: my-app, resource: limits.cpu } }`\n* **CKAD Exam Focus**: ข้อสอบมักกำหนดให้ส่งชื่อพอดหรือเนมสเปซเข้าไปเป็น Environment Variable เพื่อนำไปใช้ระบุ Identity ในระบบ Logging หรือ Tracing\n* **ข้อควรระวัง**: ฟิลด์บางตัว เช่น `status.podIP` จะพร้อมให้ใช้งานหลังจากพอดได้รับการจัดสรร IP แล้วเท่านั้น หากอ่านเร็วเกินไปในสคริปต์สตาร์ตอาจได้ค่าว่าง",
  "sections": [
    {
      "id": "downward-api-concepts",
      "headingEn": "Downward API Concepts and Benefits",
      "headingTh": "แนวคิดและประโยชน์ของ Downward API",
      "contentMarkdown": "ในระบบดั้งเดิม หากแอปพลิเคชันที่รันอยู่ในคอนเทนเนอร์ต้องการทราบชื่อ Pod Name ของตัวเอง, ชื่อ Host Node, หรือต้องการรู้ว่าตัวเองได้รับ CPU Limit เท่าใด แอปพลิเคชันนั้นจำเป็นต้องมีสิทธิ์ RBAC และต้องยิงคำขอ REST API ไปยัง Kubernetes API Server ซึ่งสร้างภาระและอาจก่อให้เกิดช่องโหว่ความปลอดภัย\n\n**Downward API** เข้ามาแก้ปัญหานี้ โดยให้ตัวแทน `kubelet` ดึงข้อมูลเมทาดาทาเหล่านั้น แล้ว 'ส่งผ่านลงไป' (Downward) ให้คอนเทนเนอร์ใช้งานได้ทันทีตั้งแต่ตอนเริ่มทำงาน โดยสามารถส่งผ่านได้ 2 ช่องทาง:\n1. ทางตัวแปรสภาพแวดล้อม (Environment Variables)\n2. ทางไฟล์ใน Volume (Downward API Volumes)",
      "codeBlocks": []
    },
    {
      "id": "fieldref-vs-resourcefieldref",
      "headingEn": "Supported Fields: fieldRef vs resourceFieldRef",
      "headingTh": "ประเภทฟิลด์ที่รองรับ: ข้อมูลเมทาดาทา (fieldRef) vs ข้อมูลทรัพยากร (resourceFieldRef)",
      "contentMarkdown": "Downward API แบ่งข้อมูลที่ส่งต่อได้ออกเป็น 2 กลุ่มหลัก:\n\n* **`fieldRef` (ข้อมูลในระดับ Pod Metadata & Status)**:\n  * `metadata.name`: ชื่อของพอด\n  * `metadata.namespace`: เนมสเปซที่พอดสังกัดอยู่\n  * `metadata.uid`: Unique ID ของพอด\n  * `spec.nodeName`: ชื่อโหนดที่พอดถูกจัดวางไปรัน\n  * `spec.serviceAccountName`: ชื่อ ServiceAccount\n  * `status.hostIP`: IP Address ของเครื่องโหนด\n  * `status.podIP`: IP Address ของพอด\n* **`resourceFieldRef` (ข้อมูลทรัพยากรระดับคอนเทนเนอร์)**:\n  * `limits.cpu` และ `requests.cpu`\n  * `limits.memory` และ `requests.memory`\n  * สามารถระบุ `divisor` เพื่อแปลงหน่วยข้อมูลได้ เช่น แปลงไบต์เป็นเมกะไบต์ (`divisor: 1Mi`)",
      "codeBlocks": []
    },
    {
      "id": "expose-via-environment-variables",
      "headingEn": "Exposing Pod Metadata via Environment Variables",
      "headingTh": "การส่งข้อมูลเมทาดาทาผ่านทาง Environment Variables",
      "contentMarkdown": "ตัวอย่างการตั้งค่าพอดให้รับชื่อพอด, เนมสเปซ, IP ของพอด และปริมาณ CPU Request เข้ามาเป็น Environment Variable ภายในคอนเทนเนอร์",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "dapi-env-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: dapi-env-test-pod\nspec:\n  containers:\n  - name: test-container\n    image: busybox:1.28\n    command: [ \"sh\", \"-c\", \"env\" ]\n    resources:\n      requests:\n        memory: \"32Mi\"\n        cpu: \"125m\"\n      limits:\n        memory: \"64Mi\"\n        cpu: \"250m\"\n    env:\n    - name: MY_NODE_NAME\n      valueFrom:\n        fieldRef:\n          fieldPath: spec.nodeName\n    - name: MY_POD_NAME\n      valueFrom:\n        fieldRef:\n          fieldPath: metadata.name\n    - name: MY_POD_NAMESPACE\n      valueFrom:\n        fieldRef:\n          fieldPath: metadata.namespace\n    - name: MY_POD_IP\n      valueFrom:\n        fieldRef:\n          fieldPath: status.podIP\n    - name: MY_CPU_REQUEST\n      valueFrom:\n        resourceFieldRef:\n          containerName: test-container\n          resource: requests.cpu\n  restartPolicy: Never"
        },
        {
          "lang": "bash",
          "label": "apply-and-verify-env.sh",
          "code": "# สร้างพอดและอ่านค่า Downward API ผ่าน logs\nkubectl apply -f dapi-env-pod.yaml\nkubectl logs dapi-env-test-pod | grep MY_"
        }
      ]
    },
    {
      "id": "expose-via-downwardapi-volume",
      "headingEn": "Exposing Pod Labels and Annotations via Downward API Volume",
      "headingTh": "การเมานต์ข้อมูล Labels และ Annotations ผ่าน Downward API Volume",
      "contentMarkdown": "ข้อมูลประเภท `metadata.labels` และ `metadata.annotations` มีโครงสร้างเป็น Key-Value แบบไดนามิก ซึ่งไม่สามารถส่งผ่าน Environment Variable ได้อย่างเหมาะสม\n\nการเมานต์ข้อมูลเหล่านี้ต้องทำผ่าน **Downward API Volume** โดย kubelet จะสร้างไฟล์ข้อความบรรจุ Labels หรือ Annotations ให้ และหากผู้ดูแลระบบทำการแก้ไข Label ของพอด ไฟล์ใน Volume จะได้รับการอัปเดตให้อัตโนมัติ",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "dapi-volume-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: kubernetes-downwardapi-volume-example\n  labels:\n    zone: asia-southeast1-a\n    cluster: production-k8s\n  annotations:\n    build: \"v1.2.3\"\nspec:\n  containers:\n  - name: client-container\n    image: busybox:1.28\n    command: [\"sh\", \"-c\", \"cat /etc/podinfo/labels\"]\n    volumeMounts:\n    - name: podinfo\n      mountPath: /etc/podinfo\n  volumes:\n  - name: podinfo\n    downwardAPI:\n      items:\n      - path: \"labels\"\n        fieldRef:\n          fieldPath: metadata.labels\n      - path: \"annotations\"\n        fieldRef:\n          fieldPath: metadata.annotations\n  restartPolicy: Never"
        },
        {
          "lang": "bash",
          "label": "verify-dapi-volume.sh",
          "code": "# สร้างพอดและตรวจสอบไฟล์ labels ที่สร้างขึ้นใน volume\nkubectl apply -f dapi-volume-pod.yaml\nkubectl logs kubernetes-downwardapi-volume-example"
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Define Environment Variables for a Container",
      "targetType": "tasks",
      "targetPageId": "inject-env-variables",
      "officialUrl": "https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/"
    },
    {
      "title": "Configure a Pod to Use a ConfigMap",
      "targetType": "tasks",
      "targetPageId": "inject-configmap",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/"
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
