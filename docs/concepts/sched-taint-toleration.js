/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/
 */
(function (root) {
  const pageData = {
    "id": "sched-taint-toleration",
    "categoryId": "scheduling",
    "categoryTitle": "Scheduling, Preemption and Eviction",
    "titleEn": "Taints and Tolerations",
    "titleTh": "ข้อจำกัดบนโหนด (Taints) และความทนทานของพอด (Tolerations)",
    "officialUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/",
    "docsPath": "/docs/concepts/scheduling-eviction/taint-and-toleration/",
    "diagram": {
      "src": "images/docs/scheduling-affinity-taints.svg",
      "caption": "การทำงานของ Taints และ Tolerations: โหนดผลักไสพอดออกไป เว้นแต่พอดจะยอมรับเงื่อนไขได้"
    },
    "lead": "Taints และ Tolerations ทำงานตรงกันข้ามกับ Node Affinity: ในขณะที่ Node Affinity ทำหน้าที่ดึงดูดพอดให้เข้ามาหาโหนด แต่ Taint เป็นการติด \"เงื่อนไขผลักไส\" ไว้บนโหนด ทำให้โหนดนั้นปฏิเสธไม่ยอมให้พอดทั่วไปมารัน เว้นแต่พอดนั้นจะมี Toleration (ความทนทาน) ที่ตรงกันพอดี",
    "sections": [
      {
        "id": "concept-taint-vs-toleration",
        "headingEn": "Core Concept: Taint vs Toleration",
        "headingTh": "แนวคิดหลัก: Taint เปรียบเทียบกับ Toleration",
        "contentMarkdown": "ลองจินตนาการว่า **Taint** คือป้ายเตือนอันตรายที่ติดอยู่หน้าประตูของห้อง (โหนด) พอดทั่วไปที่ไม่รู้เรื่องรู้ราวจะไม่สามารถเดินผ่านประตูเข้าไปได้ และมีเพียงพอดที่มี **Toleration** (เสมือนชุดป้องกันสารพิษหรือกุญแจพิเศษ) เท่านั้นที่จะได้รับอนุญาตให้เข้าไปทำงานในห้องนั้นได้\n\n**กรณีการใช้งานจริงในองค์กร**:\n* **การสงวนโหนดพิเศษ (Dedicated Nodes)**: เช่น โหนดที่มีฮาร์ดแวร์ราคาแพงอย่าง NVIDIA GPU หรือโหนดความปลอดภัยสูงสำหรับระบบการเงิน เพื่อไม่ให้พอดเว็บทั่วไปที่ไม่มีส่วนเกี่ยวข้องแย่งใช้\n* **การปกป้อง Control Plane Nodes**: คลัสเตอร์ Kubernetes จะติด Taint บนโหนดที่เป็น Master/Control Plane ไว้โดยอัตโนมัติ เพื่อป้องกันไม่ให้เวิร์กโหลดของผู้ใช้ทั่วไปไปรบกวนการทำงานของ etcd และ apiserver\n* **การจัดการโหนดที่มีปัญหา (Node Problem Eviction)**: เมื่อโหนดเกิดปัญหาด้านเครือข่ายหรือดิสก์เต็ม ระบบจะติด Taint อัตโนมัติเพื่อสั่งขับไล่พอดออกไปหาโหนดใหม่"
      },
      {
        "id": "taint-effects",
        "headingEn": "The Three Taint Effects",
        "headingTh": "ผลลัพธ์ของ Taint ทั้ง 3 รูปแบบ (Taint Effects)",
        "contentMarkdown": "เมื่อกำหนด Taint บนโหนด คุณจะต้องระบุค่า Effect ซึ่งกำหนดพฤติกรรมการจัดการพอด:\n\n### 1. `NoSchedule` (ห้ามจัดสรรพอดใหม่ - Hard Rule)\nหากพอดไม่มี Toleration ที่ตรงกับ Taint ตัว Kube-Scheduler จะ **ไม่ยอมส่งพอดนั้นมารันบนโหนดนี้เด็ดขาด** อย่างไรก็ตาม พอดเดิมที่กำลังทำงานอยู่บนโหนดนี้อยู่ก่อนแล้วจะยังคงทำงานต่อไปได้ตามปกติโดยไม่ถูกไล่ออก\n\n### 2. `PreferNoSchedule` (พยายามหลีกเลี่ยง - Soft Rule)\nระบบจะพยายามหลีกเลี่ยงไม่นำพอดที่ไม่มี Toleration มาวางบนโหนดนี้ แต่หากในคลัสเตอร์ไม่มีโหนดอื่นๆ ว่างเหลืออยู่อีกแล้วจริงๆ Scheduler ก็จะยอมนำพอดมาวางบนโหนดนี้ได้เพื่อไม่ให้พอดค้าง\n\n### 3. `NoExecute` (ห้ามรันและขับไล่พอดเดิมทันที - Eviction Rule)\nเป็นระดับที่เข้มงวดและมีผลกระทบสูงสุด:\n* หากพอดใหม่ไม่มี Toleration จะไม่สามารถมาลงได้\n* **และหากมีพอดเดิมรันอยู่บนโหนดนี้อยู่แล้ว แต่ไม่มี Toleration พอดเดิมเหล่านั้นจะถูกสั่งขับไล่ (Evicted) ออกจากโหนดทันที!**"
      },
      {
        "id": "applying-taints",
        "headingEn": "Managing Taints with kubectl",
        "headingTh": "การเพิ่มและลบ Taint บนโหนดด้วยคำสั่ง kubectl",
        "contentMarkdown": "คุณสามารถจัดการ Taint ได้อย่างสะดวกรวดเร็วผ่านคำสั่ง CLI:\n\n* **การเพิ่ม Taint บนโหนด** (รูปแบบ `key=value:effect`):\n  `kubectl taint nodes gpu-node-01 sku=gpu:NoSchedule`\n\n* **การลบ Taint ออกจากโหนด** (ใส่เครื่องหมายขีดลบ `-` ต่อท้าย Effect):\n  `kubectl taint nodes gpu-node-01 sku=gpu:NoSchedule-`\n\n* **การตรวจสอบ Taints ที่มีอยู่บนโหนด**:\n  `kubectl describe node gpu-node-01 | grep Taints`"
      },
      {
        "id": "toleration-syntax",
        "headingEn": "Toleration Syntax in Pod Specification",
        "headingTh": "รูปแบบการเขียน Toleration ในพอดสเปก",
        "contentMarkdown": "ในไฟล์สเปกของ Pod คุณสามารถกำหนดบล็อก `tolerations` ได้ 2 รูปแบบโอเปอเรเตอร์:\n\n### 1. ตัวดำเนินการ `Equal` (จับคู่ตรงตัวทั้ง Key และ Value)\n```yaml\ntolerations:\n- key: \"sku\"\n  operator: \"Equal\"\n  value: \"gpu\"\n  effect: \"NoSchedule\"\n```\n\n### 2. ตัวดำเนินการ `Exists` (สนใจเฉพาะมี Key หรือไม่ โดยไม่สน Value)\n```yaml\ntolerations:\n- key: \"sku\"\n  operator: \"Exists\"\n  effect: \"NoSchedule\"\n```\n\n* **`tolerationSeconds`**: ใช้ร่วมกับเอฟเฟกต์ `NoExecute` เพื่อระบุระยะเวลาหน่วงเวลา (เช่น 3600 วินาที) ที่ยอมให้พอดรันต่อไปได้หลังจากโหนดติด Taint ก่อนจะยอมให้ระบบขับไล่พอดออกไป"
      },
      {
        "id": "taint-based-evictions",
        "headingEn": "Taint-based Evictions and Built-in Node Taints",
        "headingTh": "การขับไล่พอดอัตโนมัติเมื่อโหนดมีปัญหา (Built-in Taints)",
        "contentMarkdown": "Node Controller จะทำการติด Taint บนโหนดโดยอัตโนมัติเมื่อตรวจพบความผิดปกติของระบบฮาร์ดแวร์หรือเครือข่าย:\n\n* `node.kubernetes.io/not-ready`: โหนดหยุดส่ง Heartbeat หรืออยู่ในสถานะ NotReady\n* `node.kubernetes.io/unreachable`: โหนดขาดการติดต่อกับ Control Plane\n* `node.kubernetes.io/memory-pressure`: โหนดเริ่มขาดแคลนหน่วยความจำ\n* `node.kubernetes.io/disk-pressure`: พื้นที่ฮาร์ดดิสก์ของโหนดใกล้เต็ม\n\n> [!NOTE]\n> โดยค่าเริ่มต้น Kubernetes จะใส่ Toleration สำหรับ `not-ready` และ `unreachable` ขนาด **300 วินาที (5 นาที)** ให้แก่พอดทุกตัวโดยอัตโนมัติ เพื่อป้องกันไม่ให้เกิดการอพยพพอด (Pod Eviction) อย่างตื่นตระหนกในกรณีที่เครือข่ายของโหนดกระตุกเพียงชั่วคราว"
      },
      {
        "id": "use-cases-and-manifest",
        "headingEn": "Complete Manifest Example: Dedicated GPU Workload",
        "headingTh": "ตัวอย่าง Manifest เวิร์กโหลด GPU ที่จับคู่ Taint และ Toleration",
        "contentMarkdown": "> [!TIP]\n> **เคล็ดลับการออกแบบ**: Taints และ Tolerations มีหน้าที่เพียงอนุญาตให้พอดผ่านเข้าไปได้ แต่ไม่ได้การันตีว่าพอดจะเลือกโหนดนั้นเสมอไป! ดังนั้นในการสงวนโหนดเฉพาะทาง (เช่น GPU) คุณควรใช้ **Tolerations ควบคู่กับ NodeAffinity หรือ nodeSelector** เสมอ เพื่อให้มั่นใจว่าพอดจะถูกส่งไปยังโหนดที่ต้องการอย่างแน่นอน",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "gpu-ml-training-pod.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: cuda-ml-training\nspec:\n  # 1. ระบุ Toleration เพื่อให้มีสิทธิ์รันบนโหนด GPU ที่ติด Taint ไว้ได้\n  tolerations:\n  - key: \"accelerator\"\n    operator: \"Equal\"\n    value: \"nvidia-tesla-v100\"\n    effect: \"NoSchedule\"\n  # 2. ระบุ nodeSelector เพื่อดึงดูดพอดให้มุ่งหน้าไปยังโหนด GPU นี้โดยเฉพาะ\n  nodeSelector:\n    accelerator: \"nvidia-tesla-v100\"\n  containers:\n  - name: ml-worker\n    image: nvidia/cuda:11.8.0-base-ubuntu22.04\n    command: [\"nvidia-smi\"]\n    resources:\n      limits:\n        nvidia.com/gpu: 1"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) การใช้ NodeAffinity\n* ศึกษา [Pod Priority and Preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/) การจัดลำดับความสำคัญของพอดเมื่อทรัพยากรไม่พอ\n* ศึกษา [Nodes in Kubernetes](https://kubernetes.io/docs/concepts/architecture/nodes/) สถาปัตยกรรมและสถานะของโหนด"
      }
    ],
    "relatedLinks": [
      {
        "title": "Assigning Pods to Nodes (การจัดสรรพอดลงโหนด)",
        "targetType": "concepts",
        "targetPageId": "sched-assign-pod-node",
        "officialUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/"
      },
      {
        "title": "Nodes (สถาปัตยกรรมโหนด)",
        "targetType": "concepts",
        "targetPageId": "arch-nodes",
        "officialUrl": "https://kubernetes.io/docs/concepts/architecture/nodes/"
      },
      {
        "title": "Resource Management (การจัดการทรัพยากร)",
        "targetType": "concepts",
        "targetPageId": "config-manage-resources",
        "officialUrl": "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/"
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
