/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/
 */
(function (root) {
  const pageData = {
  "id": "admin-resource-quota-namespace",
  "categoryId": "administer-cluster",
  "categoryTitle": "Administer a Cluster",
  "titleEn": "Configure Memory and CPU Quotas for a Namespace",
  "titleTh": "การตั้งค่าโควตา Memory และ CPU สำหรับ Namespace",
  "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/",
  "docsPath": "/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/",
  "lead": "การจำกัดทรัพยากรประมวลผล (Compute Resources) ในระดับเนมสเปซด้วย ResourceQuota ช่วยป้องกันปัญหา Noisy Neighbor ในระบบ Multi-tenant และควบคุมค่าใช้จ่ายของคลัสเตอร์ได้อย่างมีประสิทธิภาพ",
  "sections": [
    {
      "id": "quota-concepts-overview",
      "headingEn": "ResourceQuota Concepts and Resource Types",
      "headingTh": "แนวคิดของ ResourceQuota และประเภททรัพยากรที่ควบคุม",
      "contentMarkdown": "เมื่อผู้ใช้หรือทีมงานหลายทีมใช้งานคลัสเตอร์ Kubernetes ร่วมกัน อาจเกิดความเสี่ยงที่ทีมใดทีมหนึ่งจะใช้งานทรัพยากร CPU หรือ Memory เกินขนาดจนทำให้แอปพลิเคชันอื่นไม่สามารถทำงานได้\n\n**ResourceQuota** ทำหน้าที่เป็นเพดานจำกัดผลรวมทรัพยากรภายในเนมสเปซนั้นๆ โดยสามารถกำหนดได้ทั้ง:\n* `requests.cpu`: ผลรวมของการจอง CPU ขั้นต่ำที่อนุญาตในเนมสเปซ\n* `requests.memory`: ผลรวมของการจอง Memory ขั้นต่ำที่อนุญาตในเนมสเปซ\n* `limits.cpu`: ผลรวมของขีดจำกัดสูงสุดของ CPU ที่อนุญาตในเนมสเปซ\n* `limits.memory`: ผลรวมของขีดจำกัดสูงสุดของ Memory ที่อนุญาตในเนมสเปซ\n\n> ข้อสำคัญ: เมื่อมีการใช้งาน ResourceQuota ในเนมสเปซ พอดใหม่ทุกลำดับที่จะสร้างขึ้นจะต้องระบุค่า `requests` และ `limits` ของทรัพยากรที่ถูกควบคุมเสมอ หากไม่ระบุ API Server จะปฏิเสธการสร้างพอดนั้นทันที",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "create-namespace.sh",
          "code": "# สร้างเนมสเปซสำหรับการทดสอบ\nkubectl create namespace quota-mem-cpu-example"
        }
      ]
    },
    {
      "id": "create-resource-quota",
      "headingEn": "Creating Namespace and ResourceQuota Manifest",
      "headingTh": "การสร้าง Namespace และนิยาม ResourceQuota Object",
      "contentMarkdown": "ตัวอย่างการสร้าง ResourceQuota เพื่อจำกัดทรัพยากรในเนมสเปซ `quota-mem-cpu-example` โดยกำหนดเงื่อนไขดังนี้:\n* requests CPU รวมไม่เกิน 1 Core และ requests Memory รวมไม่เกิน 1 GiB\n* limits CPU รวมไม่เกิน 2 Cores และ limits Memory รวมไม่เกิน 2 GiB",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "quota-mem-cpu.yaml",
          "code": "apiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: mem-cpu-demo\n  namespace: quota-mem-cpu-example\nspec:\n  hard:\n    requests.cpu: \"1\"\n    requests.memory: 1Gi\n    limits.cpu: \"2\"\n    limits.memory: 2Gi"
        },
        {
          "lang": "bash",
          "label": "apply-and-describe.sh",
          "code": "# นำ ResourceQuota เข้าสู่คลัสเตอร์\nkubectl apply -f quota-mem-cpu.yaml\n\n# ตรวจสอบการตั้งค่าและปริมาณการใช้งานปัจจุบัน (Used vs Hard)\nkubectl describe resourcequota mem-cpu-demo --namespace=quota-mem-cpu-example"
        }
      ]
    },
    {
      "id": "deploying-compliant-pod",
      "headingEn": "Deploying a Pod within Quota Limits",
      "headingTh": "การสร้างพอดที่ปฏิบัติตามโควตา (Compliant Pod)",
      "contentMarkdown": "สร้างพอดแรกโดยระบุ requests CPU `500m`, Memory `600Mi` และ limits CPU `1`, Memory `1Gi` ซึ่งอยู่ภายใต้เพดานโควตาที่กำหนดไว้",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "quota-mem-cpu-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: quota-mem-cpu-demo\n  namespace: quota-mem-cpu-example\nspec:\n  containers:\n  - name: quota-mem-cpu-demo-ctr\n    image: nginx\n    resources:\n      requests:\n        memory: \"600Mi\"\n        cpu: \"500m\"\n      limits:\n        memory: \"1Gi\"\n        cpu: \"1\""
        },
        {
          "lang": "bash",
          "label": "apply-pod.sh",
          "code": "# สร้างพอดที่ปฏิบัติตามโควตา\nkubectl apply -f quota-mem-cpu-pod.yaml\n\n# ตรวจสอบว่าพอดรันสำเร็จ\nkubectl get pod quota-mem-cpu-demo --namespace=quota-mem-cpu-example\n\n# ตรวจสอบสถานะการใช้งานที่เพิ่มขึ้นใน ResourceQuota\nkubectl describe resourcequota mem-cpu-demo --namespace=quota-mem-cpu-example"
        }
      ]
    },
    {
      "id": "testing-quota-violation",
      "headingEn": "Testing Quota Enforcement and Handling Violations",
      "headingTh": "การทดสอบการละเมิดโควตาและข้อผิดพลาดที่เกิดขึ้น",
      "contentMarkdown": "เมื่อพยายามสร้างพอดที่สองโดยขอ requests Memory `700Mi` ซึ่งเมื่อรวมกับของเดิม (`600Mi` + `700Mi` = `1.3GiB`) จะเกินเพดาน `requests.memory: 1Gi` ของเนมสเปซ\n\nAPI Server จะปฏิเสธคำขอทันทีพร้อมแสดงข้อความแจ้งเตือนข้อผิดพลาด (Forbidden: exceeded quota):",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "quota-mem-cpu-pod-2.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: quota-mem-cpu-demo-2\n  namespace: quota-mem-cpu-example\nspec:\n  containers:\n  - name: quota-mem-cpu-demo-2-ctr\n    image: redis\n    resources:\n      requests:\n        memory: \"700Mi\"\n        cpu: \"500m\"\n      limits:\n        memory: \"1Gi\"\n        cpu: \"1\""
        },
        {
          "lang": "bash",
          "label": "test-violation.sh",
          "code": "# ทดลองสร้างพอดตัวที่สอง\nkubectl apply -f quota-mem-cpu-pod-2.yaml\n\n# ผลลัพธ์จะแจ้งข้อผิดพลาด:\n# Error from server (Forbidden): error when creating \"quota-mem-cpu-pod-2.yaml\": pods \"quota-mem-cpu-demo-2\" is forbidden: exceeded quota: mem-cpu-demo, requested: requests.memory=700Mi, used: requests.memory=600Mi, limited: requests.memory=1Gi"
        }
      ]
    },
    {
      "id": "limitrange-synergy",
      "headingEn": "Working in Synergy with LimitRange",
      "headingTh": "การทำงานร่วมกับ LimitRange สำหรับค่าเริ่มต้นอัตโนมัติ",
      "contentMarkdown": "เพื่อป้องกันไม่ให้ผู้ใช้งานสร้างพอดไม่ผ่านเนื่องจากลืมระบุ `resources` ขอแนะนำให้สร้าง **LimitRange** ควบคู่กับ ResourceQuota เสมอ โดย LimitRange จะทำหน้าที่ใส่ค่า Default Request และ Limit ให้กับพอดอัตโนมัติหากผู้ใช้ไม่ได้ระบุมาใน manifest",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "limits.yaml",
          "code": "apiVersion: v1\nkind: LimitRange\nmetadata:\n  name: cpu-resource-constraint\n  namespace: quota-mem-cpu-example\nspec:\n  limits:\n  - default: # default limit\n      cpu: 500m\n      memory: 512Mi\n    defaultRequest: # default request\n      cpu: 100m\n      memory: 256Mi\n    type: Container"
        }
      ]
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
      "title": "Configure Quality of Service for Pods",
      "targetType": "tasks",
      "targetPageId": "pod-quality-of-service",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/"
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
