/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/
 */
(function (root) {
  const pageData = {
  "id": "pod-assign-node-affinity",
  "categoryId": "configure-pods",
  "categoryTitle": "Configure Pods and Containers",
  "titleEn": "Assign Pods to Nodes using Node Affinity",
  "titleTh": "การจัดสรรพอดลงโหนดด้วย Node Affinity",
  "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/",
  "docsPath": "/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/",
  "lead": "Node Affinity เป็นกลไกที่ยืดหยุ่นและทรงพลังในการควบคุมให้ Kubernetes Scheduler นำพอดไปรันบนโหนดที่มีคุณลักษณะหรือ Labels ตรงตามเงื่อนไขที่กำหนด โดยแบ่งเป็นแบบเงื่อนไขบังคับ (Hard) และแบบต้องการเป็นพิเศษ (Soft)",
  "sections": [
    {
      "id": "node-affinity-types",
      "headingEn": "Types of Node Affinity: Required vs Preferred",
      "headingTh": "ประเภทของ Node Affinity: เงื่อนไขบังคับ (Required) และเงื่อนไขพึงประสงค์ (Preferred)",
      "contentMarkdown": "Node Affinity ให้ความสามารถที่เหนือกว่า `nodeSelector` ดั้งเดิม โดยรองรับการใช้ Operators ตรรกะขั้นสูง เช่น In, NotIn, Exists, DoesNotExist, Gt, Lt\n\nKubernetes แบ่ง Node Affinity ออกเป็น 2 ประเภทหลัก:\n\n* **`requiredDuringSchedulingIgnoredDuringExecution` (Hard Rule)**:\n  เงื่อนไขบังคับเด็ดขาด พอดจะสามารถจัดตารางลงบนโหนดได้ก็ต่อเมื่อโหนดนั้นมี Labels ตรงตามเงื่อนไขทุกประการ หากไม่มีโหนดใดตรงเงื่อนไข พอดจะติดสถานะ `Pending`\n* **`preferredDuringSchedulingIgnoredDuringExecution` (Soft Rule)**:\n  เงื่อนไขพึงประสงค์ Scheduler จะพยายามเลือกโหนดที่ตรงเงื่อนไขก่อนตามคะแนนค่าน้ำหนัก (Weight ตั้งแต่ 1 ถึง 100) แต่หากไม่มีโหนดที่ตรงเงื่อนไข Scheduler ก็ยังสามารถวางพอดบนโหนดอื่นได้โดยไม่ติด Pending\n\n> คำว่า `IgnoredDuringExecution` หมายความว่า หากหลังจากที่พอดถูกจัดวางและรันไปแล้ว Labels ของโหนดเกิดการเปลี่ยนแปลงหรือถูกลบออก พอดจะไม่ถูกขับไล่ออกจากโหนดและจะยังคงทำงานต่อไป",
      "codeBlocks": []
    },
    {
      "id": "node-labeling",
      "headingEn": "Labeling Nodes with Custom Key-Value Pairs",
      "headingTh": "การติด Label ให้กับโหนดในคลัสเตอร์",
      "contentMarkdown": "การใช้งาน Node Affinity ต้องอาศัยการติด Label บนโหนดเพื่อให้มีค่าคุณลักษณะที่ตรงกับเงื่อนไขที่พอดต้องการ",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "label-node.sh",
          "code": "# ดูรายชื่อโหนดและ Labels ปัจจุบัน\nkubectl get nodes --show-labels\n\n# ติด Label ระบุโซนและประเภทฮาร์ดแวร์ให้กับโหนด\nkubectl label nodes worker-node-1 topology.kubernetes.io/zone=asia-southeast1-a\nkubectl label nodes worker-node-1 disktype=ssd"
        }
      ]
    },
    {
      "id": "configure-hard-node-affinity",
      "headingEn": "Configuring Required (Hard) Node Affinity",
      "headingTh": "การกำหนด Required (Hard) Node Affinity ด้วย matchExpressions",
      "contentMarkdown": "ตัวอย่างการตั้งค่า Required Node Affinity เพื่อบังคับให้พอดรันบนโหนดที่อยู่ในโซน `asia-southeast1-a` หรือ `asia-southeast1-b` เท่านั้น",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "affinity-required-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: hard-affinity-pod\nspec:\n  affinity:\n    nodeAffinity:\n      requiredDuringSchedulingIgnoredDuringExecution:\n        nodeSelectorTerms:\n        - matchExpressions:\n          - key: topology.kubernetes.io/zone\n            operator: In\n            values:\n            - asia-southeast1-a\n            - asia-southeast1-b\n  containers:\n  - name: nginx\n    image: nginx"
        },
        {
          "lang": "bash",
          "label": "apply-hard-affinity.sh",
          "code": "# สร้างพอดและตรวจสอบว่าพอดถูกนำไปวางบนโหนดที่มี label ตรงกัน\nkubectl apply -f affinity-required-pod.yaml\nkubectl get pod hard-affinity-pod -o wide"
        }
      ]
    },
    {
      "id": "configure-soft-node-affinity",
      "headingEn": "Configuring Preferred (Soft) Node Affinity with Weights",
      "headingTh": "การกำหนด Preferred (Soft) Node Affinity พร้อมค่าน้ำหนัก (Weight)",
      "contentMarkdown": "ตัวอย่างการตั้งค่า Preferred Node Affinity เพื่อบอกว่าพอดต้องการรันบนโหนดที่มี `disktype: ssd` เป็นลำดับแรก (ค่าน้ำหนัก 80) แต่หากไม่มีโหนด SSD ว่าง ก็สามารถรันบนโหนดทั่วไปได้",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "affinity-preferred-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: soft-affinity-pod\nspec:\n  affinity:\n    nodeAffinity:\n      preferredDuringSchedulingIgnoredDuringExecution:\n      - weight: 80\n        preference:\n          matchExpressions:\n          - key: disktype\n            operator: In\n            values:\n            - ssd\n  containers:\n  - name: nginx\n    image: nginx"
        },
        {
          "lang": "bash",
          "label": "apply-soft-affinity.sh",
          "code": "# สร้างพอด soft affinity\nkubectl apply -f affinity-preferred-pod.yaml\nkubectl get pod soft-affinity-pod -o wide"
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
      "title": "Safely Drain a Node",
      "targetType": "tasks",
      "targetPageId": "admin-safely-drain-node",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/"
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
