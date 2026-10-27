/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/
 */
(function (root) {
  const pageData = {
  "id": "pod-quality-of-service",
  "categoryId": "configure-pods",
  "categoryTitle": "Configure Pods and Containers",
  "titleEn": "Configure Quality of Service for Pods",
  "titleTh": "การตั้งค่าระดับคุณภาพการบริการ (QoS Class) ของพอด",
  "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/",
  "docsPath": "/docs/tasks/configure-pod-container/quality-service-pod/",
  "lead": "Kubernetes ใช้คลาส Quality of Service (QoS) ในการจัดหมวดหมู่พอดและกำหนดลำดับความสำคัญในการขับไล่พอด (Eviction Priority) เมื่อโหนดตกอยู่ในสภาวะขาดแคลนทรัพยากร (Resource Pressure เช่น OOM หรือดิสก์เต็ม)",
  "sections": [
    {
      "id": "qos-overview",
      "headingEn": "QoS Classes Overview and Eviction Hierarchy",
      "headingTh": "ภาพรวมระดับ QoS ทั้งสามคลาสและลำดับการขับไล่พอด",
      "contentMarkdown": "เมื่อโหนดในคลัสเตอร์ขาดแคลน Memory หรือ Disk ตัวแทน `kubelet` บนโหนดจะต้องตัดสินใจขับไล่ (Evict) พอดบางตัวออกไปเพื่อรักษาเสถียรภาพของเครื่องโหนด\n\nKubernetes จัดระดับความสำคัญในการอยู่รอดของพอดออกเป็น 3 คลาสตามลักษณะการกำหนด Requests และ Limits:\n1. **Guaranteed (ปลอดภัยสูงสุด)**: ได้รับการปกป้องสูงสุด จะถูกขับไล่เป็นลำดับสุดท้ายเมื่อไม่มีพอดอื่นเหลือให้ขับไล่แล้ว\n2. **Burstable (ระดับปานกลาง)**: มีการจองทรัพยากรไว้ระดับหนึ่ง จะถูกขับไล่เมื่อใช้ทรัพยากรเกินกว่าที่ขอไว้\n3. **BestEffort (ความสำคัญต่ำสุด)**: ไม่มีการรับประกันทรัพยากรใดๆ จะเป็นกลุ่มแรกที่ถูกสั่งหยุดและขับไล่ออกจากโหนดทันทีที่โหนดเริ่มมีปัญหาขาดแคลนทรัพยากร",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "inspect-qos.sh",
          "code": "# ดู QoS Class ของพอดด้วย jsonpath\nkubectl get pod <pod-name> -o jsonpath='{.status.qosClass}'"
        }
      ]
    },
    {
      "id": "guaranteed-qos-class",
      "headingEn": "Creating a Pod in the Guaranteed QoS Class",
      "headingTh": "การสร้างพอดที่มีระดับ QoS เป็น Guaranteed",
      "contentMarkdown": "เงื่อนไขที่จะทำให้พอดได้รับคลาส **Guaranteed**:\n* ทุก Container ใน Pod (รวมถึง Init Containers) จะต้องระบุทั้ง CPU Request และ Limit และ Memory Request และ Limit\n* ค่าของ **Request จะต้องเท่ากับค่า Limit ทุกตัวพอดี** ทั้ง CPU และ Memory",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "qos-pod-guaranteed.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: qos-demo-guaranteed\nspec:\n  containers:\n  - name: qos-demo-ctr\n    image: nginx\n    resources:\n      limits:\n        memory: \"200Mi\"\n        cpu: \"700m\"\n      requests:\n        memory: \"200Mi\"\n        cpu: \"700m\""
        },
        {
          "lang": "bash",
          "label": "verify-guaranteed.sh",
          "code": "kubectl apply -f qos-pod-guaranteed.yaml\nkubectl get pod qos-demo-guaranteed -o jsonpath='{.status.qosClass}{\"\\n\"}'\n# ผลลัพธ์: Guaranteed"
        }
      ]
    },
    {
      "id": "burstable-qos-class",
      "headingEn": "Creating a Pod in the Burstable QoS Class",
      "headingTh": "การสร้างพอดที่มีระดับ QoS เป็น Burstable",
      "contentMarkdown": "เงื่อนไขสำหรับคลาส **Burstable**:\n* พอดไม่ตรงตามเงื่อนไขของ Guaranteed\n* มีอย่างน้อยหนึ่ง Container ในพอดที่มีการระบุ Memory หรือ CPU Request หรือ Limit (โดยทั่วไปคือระบุ Request น้อยกว่า Limit)",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "qos-pod-burstable.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: qos-demo-burstable\nspec:\n  containers:\n  - name: qos-demo-ctr\n    image: nginx\n    resources:\n      limits:\n        memory: \"300Mi\"\n      requests:\n        memory: \"100Mi\""
        },
        {
          "lang": "bash",
          "label": "verify-burstable.sh",
          "code": "kubectl apply -f qos-pod-burstable.yaml\nkubectl get pod qos-demo-burstable -o jsonpath='{.status.qosClass}{\"\\n\"}'\n# ผลลัพธ์: Burstable"
        }
      ]
    },
    {
      "id": "besteffort-qos-class",
      "headingEn": "Creating a Pod in the BestEffort QoS Class",
      "headingTh": "การสร้างพอดที่มีระดับ QoS เป็น BestEffort",
      "contentMarkdown": "เงื่อนไขสำหรับคลาส **BestEffort**:\n* คอนเทนเนอร์ทั้งหมดในพอดไม่มีการระบุทั้ง Memory Requests, Memory Limits, CPU Requests และ CPU Limits แม้แต่อย่างเดียว",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "qos-pod-besteffort.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: qos-demo-besteffort\nspec:\n  containers:\n  - name: qos-demo-ctr\n    image: nginx"
        },
        {
          "lang": "bash",
          "label": "verify-besteffort.sh",
          "code": "kubectl apply -f qos-pod-besteffort.yaml\nkubectl get pod qos-demo-besteffort -o jsonpath='{.status.qosClass}{\"\\n\"}'\n# ผลลัพธ์: BestEffort"
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
