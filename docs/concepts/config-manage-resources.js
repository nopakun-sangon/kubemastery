/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
 */
(function (root) {
  const pageData = {
    "id": "config-manage-resources",
    "categoryId": "configuration",
    "categoryTitle": "Configuration",
    "titleEn": "Resource Management for Pods and Containers",
    "titleTh": "การจัดการทรัพยากร CPU และ Memory สำหรับพอด (Resource Management)",
    "officialUrl": "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/",
    "docsPath": "/docs/concepts/configuration/manage-resources-containers/",
    "lead": "การระบุค่า Requests และ Limits สำหรับทรัพยากรคำนวณ (Compute Resources เช่น CPU, Memory และสตอเรจชั่วคราว) เป็นรากฐานสำคัญในการรับประกันเสถียรภาพ ประสิทธิภาพ และความคุ้มค่าของการจัดสรรพอดลงโหนดของ Kube-Scheduler รวมทั้งป้องกันไม่ให้พอดตัวใดตัวหนึ่งแย่งใช้ทรัพยากรจนระบบล่ม",
    "sections": [
      {
        "id": "requests-vs-limits",
        "headingEn": "Requests vs Limits: The Core Principles",
        "headingTh": "หลักการสำคัญ: Requests แตกต่างจาก Limits อย่างไร?",
        "contentMarkdown": "เมื่อคุณกำหนดทรัพยากรให้แก่คอนเทนเนอร์ใน Kubernetes คุณสามารถระบุค่าได้ 2 ชนิดหลัก:\n\n* **`requests` (ทรัพยากรการันตีขั้นต่ำ)**:\n  * คือปริมาณทรัพยากรที่คอนเทนเนอร์ต้องการเพื่อให้สามารถเริ่มทำงานได้\n  * **Kube-Scheduler** จะใช้ค่า `requests` นี้เพียงอย่างเดียวในการค้นหา Worker Node ที่เหมาะสม โดยระบบจะวางพอดลงบนโหนดได้ก็ต่อเมื่อโหนดนั้นมีทรัพยากรที่ว่างอยู่ (Allocatable Capacity) มากกว่าหรือเท่ากับผลรวมของ Requests ทั้งหมดของพอด\n  * หากไม่มีโหนดใดมีพื้นที่พอ พอดจะค้างอยู่ในสถานะ `Pending`\n* **`limits` (ขีดจำกัดเพดานสูงสุด)**:\n  * คือปริมาณทรัพยากรสูงสุดที่ยอมให้คอนเทนเนอร์ใช้งานได้จริงในระหว่างทำงาน\n  * ถูกควบคุมโดยฟีเจอร์ **Linux cgroups** ในระดับเคอร์เนล เพื่อป้องกันไม่ให้คอนเทนเนอร์ทำงานผิดปกติจนสูบทรัพยากรของเครื่องแม่ข่ายไปจนหมด"
      },
      {
        "id": "resource-units",
        "headingEn": "Resource Units: CPU and Memory",
        "headingTh": "หน่วยวัดของทรัพยากร CPU และ Memory",
        "contentMarkdown": "การระบุค่าตัวเลขใน Kubernetes มีมาตรฐานหน่วยวัดที่เคร่งครัด:\n\n### 1. CPU (หน่วยประมวลผล)\nCPU ถูกวัดในหน่วยของ vCPU/Cores หรือ **Millicores (`m`)**:\n* `1` หรือ `1000m` = พลังการประมวลผลเท่ากับ 1 Core สมบูรณ์\n* `500m` = ครึ่งหนึ่งของคอร์ (0.5 Core)\n* `250m` = หนึ่งในสี่ของคอร์ (0.25 Core)\n* CPU ถือเป็นทรัพยากรที่ **ยืดหยุ่นได้ (Compressible Resource)** หากใช้เกิน Limit คอนเทนเนอร์จะไม่ตาย แต่จะถูกหน่วงเวลา (Throttled)\n\n### 2. Memory (หน่วยความจำ)\nMemory ถูกวัดในหน่วยไบต์ (Bytes) โดยแนะนำให้ใช้หน่วยฐานสอง (Binary Power-of-two / Mebibytes, Gibibytes):\n* `128Mi` = 128 Mebibytes (128 × 1,024 × 1,024 ไบต์)\n* `1Gi` = 1 Gibibyte (1,024 Mebibytes)\n* **ข้อควรระวัง**: อย่าสับสนระหว่าง `M` (ฐานสิบ: 1,000,000 ไบต์) และ `Mi` (ฐานสอง: 1,048,576 ไบต์)\n* Memory ถือเป็นทรัพยากรที่ **ไม่สามารถยืดหยุ่นได้ (Incompressible Resource)** หากใช้เกิน Limit คอนเทนเนอร์จะถูกทำลายทิ้งทันที"
      },
      {
        "id": "qos-classes",
        "headingEn": "Quality of Service (QoS) Classes",
        "headingTh": "ระดับคุณภาพการให้บริการ (QoS Classes ทั้ง 3 ชั้น)",
        "contentMarkdown": "Kubernetes จะจัดกลุ่มพอดเข้าสู่หนึ่งใน 3 QoS Classes โดยอัตโนมัติตามการตั้งค่า Requests และ Limits:\n\n1. **`Guaranteed` (ความเสถียรสูงสุด)**:\n   * ทุกคอนเทนเนอร์ในพอดต้องระบุทั้ง CPU และ Memory และค่า `requests` ต้องมีค่า**เท่ากับ** `limits` พอดี\n   * มีลำดับความสำคัญสูงสุด จะถูกขับไล่ (Evicted) หรือปิดการทำงานเป็นลำดับสุดท้ายเมื่อเครื่องโหนดมีปัญหาแรมหมด\n2. **`Burstable` (ความยืดหยุ่นปานกลาง - นิยมใช้มากที่สุด)**:\n   * มีการระบุ `requests` และอย่างน้อยหนึ่งค่ามี `requests < limits`\n   * ยอมให้พอดใช้ทรัพยากรพุ่งสูงขึ้นชั่วคราวได้เมื่อมีโหลดเข้ามา\n3. **`BestEffort` (ความสำคัญต่ำสุด)**:\n   * ไม่มีการระบุ Requests หรือ Limits ใดๆ เลยแม้แต่ค่าเดียว\n   * จะถูก **Linux OOM Killer** ฆ่าทิ้งเป็นอันดับแรกทันทีที่โหนดเริ่มขาดแคลนหน่วยความจำ"
      },
      {
        "id": "resource-exhaustion",
        "headingEn": "What Happens During Resource Exhaustion?",
        "headingTh": "จะเกิดอะไรขึ้นเมื่อพอดใช้ทรัพยากรเกินเพดาน Limits?",
        "contentMarkdown": "* **เมื่อ CPU เกิน Limit**: เคอร์เนลของ Linux จะใช้กลไก CFS Quota ในการลดความเร็วหรือหน่วงการประมวลผลของคอนเทนเนอร์ลง (**CPU Throttling**) โปรเซสจะทำงานช้าลง Response Time จะสูงขึ้น แต่คอนเทนเนอร์จะไม่ถูกรีสตาร์ต\n* **เมื่อ Memory เกิน Limit**: หากแอปพลิเคชันพยายามจองแรมเกินกว่าค่า `limits.memory` เคอร์เนลจะส่งสัญญาณทำลายโปรเซสนั้นทันทีผ่านกลไก **Out Of Memory (OOM) Killer**\n  * พอดจะมีสถานะเป็น `OOMKilled`\n  * มี Exit Code เท่ากับ **`137`**\n  * ตัว kubelet จะพยายามรีสตาร์ตคอนเทนเนอร์ขึ้นมาใหม่ตามนโยบาย RestartPolicy (จนอาจเกิดภาวะ `CrashLoopBackOff` หากแอปยังคงกินแรมเกิน)"
      },
      {
        "id": "manifest-and-inspection",
        "headingEn": "Resource Manifest and Monitoring with kubectl top",
        "headingTh": "ตัวอย่าง Manifest และคำสั่งตรวจสอบการใช้ทรัพยากรจริง",
        "contentMarkdown": "ตัวอย่างการกำหนดค่า Requests และ Limits ที่ดีสำหรับแอปพลิเคชัน Production:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "resource-demo-pod.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: production-web-api\nspec:\n  containers:\n  - name: web-server\n    image: nginx:alpine\n    resources:\n      requests:\n        memory: \"256Mi\"\n        cpu: \"250m\"\n        ephemeral-storage: \"500Mi\"\n      limits:\n        memory: \"512Mi\"\n        cpu: \"500m\"\n        ephemeral-storage: \"1Gi\""
          },
          {
            "lang": "bash",
            "label": "คำสั่งตรวจสอบการใช้ทรัพยากรจริง",
            "code": "# ตรวจสอบการใช้งาน CPU และ RAM ของ Pods แบบ Real-time (ต้องติดตั้ง Metrics Server)\nkubectl top pods\n\n# ตรวจสอบการใช้งาน CPU และ RAM ของแต่ละ Node\nkubectl top nodes\n\n# ดูรายละเอียด Requests และ Limits ที่พอดจองไว้\nkubectl describe pod production-web-api | grep -A 10 Resources"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Limit Ranges and Resource Quotas](https://kubernetes.io/docs/concepts/policy/resource-quota/) สำหรับการควบคุมเพดานในระดับ Namespace\n* ศึกษา [Horizontal Pod Autoscaling (HPA)](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) การขยายขนาดพอดอัตโนมัติตามค่า CPU/RAM\n* ศึกษา [Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) กลไกการคัดเลือกโหนดของ Scheduler"
      }
    ],
    "relatedLinks": [
      {
        "title": "Limit Ranges & Resource Quotas (โควตาและข้อจำกัดทรัพยากร)",
        "targetType": "concepts",
        "targetPageId": "policy-limits-quotas",
        "officialUrl": "https://kubernetes.io/docs/concepts/policy/resource-quota/"
      },
      {
        "title": "Assigning Pods to Nodes (การจัดสรรพอดลงโหนด)",
        "targetType": "concepts",
        "targetPageId": "sched-assign-pod-node",
        "officialUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/"
      },
      {
        "title": "ConfigMaps (คอนฟิกแมป)",
        "targetType": "concepts",
        "targetPageId": "config-configmap",
        "officialUrl": "https://kubernetes.io/docs/concepts/configuration/configmap/"
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
