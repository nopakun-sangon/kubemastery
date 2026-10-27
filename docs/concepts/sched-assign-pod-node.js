/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/
 */
(function (root) {
  const pageData = {
    "id": "sched-assign-pod-node",
    "categoryId": "scheduling",
    "categoryTitle": "Scheduling, Preemption and Eviction",
    "titleEn": "Assigning Pods to Nodes",
    "titleTh": "การกำหนดและคัดเลือกโหนดให้พอด (NodeAffinity & Selectors)",
    "officialUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/",
    "docsPath": "/docs/concepts/scheduling-eviction/assign-pod-node/",
    "diagram": {
      "src": "images/docs/scheduling-affinity-taints.svg",
      "caption": "กลไกการคัดเลือกโหนด: nodeSelector, NodeAffinity, PodAffinity และ Taints/Tolerations"
    },
    "lead": "Kubernetes จัดเตรียมกลไกที่ยืดหยุ่นหลากหลายระดับเพื่อควบคุมการจัดวางตำแหน่งของพอดลงบนโหนดที่เหมาะสม (Pod Placement) ตั้งแต่วิธีจับคู่เลเบลพื้นฐานอย่าง nodeSelector ไปจนถึงกฎเงื่อนไขขั้นสูงอย่าง Node Affinity, Pod Affinity และ Pod Anti-Affinity เพื่อรองรับความพร้อมใช้งานระดับสูง (High Availability)",
    "sections": [
      {
        "id": "nodeselector",
        "headingEn": "nodeSelector: The Simplest Placement Mechanism",
        "headingTh": "nodeSelector: กลไกคัดเลือกโหนดแบบพื้นฐาน",
        "contentMarkdown": "วิธีที่ง่ายที่สุดในการกำหนดให้พอดรันบนโหนดใดโหนดหนึ่งคือการใช้ **`nodeSelector`** ภายใต้สเปกของ Pod:\n\n* ทำงานโดยจับคู่ Key-Value ที่ระบุไว้ในพอด เข้ากับ **Labels** ที่ติดอยู่บน Worker Node แต่ละเครื่อง\n* ถือเป็นเงื่อนไขแบบบังคับเด็ดขาด (Hard Constraint) หากไม่มีโหนดใดในคลัสเตอร์ที่มี Label ตรงกันครบถ้วน พอดจะค้างอยู่ในสถานะ `Pending`\n* เหมาะสำหรับการแยกกลุ่มงานแบบหยาบๆ เช่น สั่งให้พอดไปรันบนโหนดที่มีดิสก์ SSD เท่านั้น:\n\n```yaml\nspec:\n  nodeSelector:\n    disktype: ssd\n```\n\nคำสั่งติดเลเบลบนโหนด: `kubectl label nodes node-01 disktype=ssd`"
      },
      {
        "id": "node-affinity",
        "headingEn": "Node Affinity: Expressive Node Selection",
        "headingTh": "Node Affinity: การคัดเลือกโหนดด้วยกฎเงื่อนไขขั้นสูง",
        "contentMarkdown": "Node Affinity ช่วยขยายความสามารถเหนือกว่า `nodeSelector` อย่างมาก โดยแบ่งออกเป็น 2 ระดับเงื่อนไข:\n\n### 1. `requiredDuringSchedulingIgnoredDuringExecution` (เงื่อนไขแบบบังคับ - Hard Rule)\n* คล้ายกับ nodeSelector คือ Kube-Scheduler **จำเป็นต้อง** นำพอดไปลงบนโหนดที่ผ่านเงื่อนไขนี้เท่านั้น หากไม่มีโหนดที่ตรง พอดจะไม่ถูกรัน\n* รองรับตัวดำเนินการเปรียบเทียบที่หลากหลายกว่า เช่น `In`, `NotIn`, `Exists`, `DoesNotExist`, `Gt`, `Lt`\n\n### 2. `preferredDuringSchedulingIgnoredDuringExecution` (เงื่อนไขแบบชอบใจ - Soft Rule)\n* เป็นการแจ้งความต้องการว่า \"ถ้าเป็นไปได้ อยากให้ลงโหนดที่มีคุณสมบัตินี้ แต่ถ้าไม่มีโหนดว่าง ก็ยอมให้ไปลงโหนดอื่นได้\"\n* สามารถกำหนดน้ำหนักคะแนนความชอบ (**`weight`** ตั้งแต่ 1 ถึง 100) ได้ เพื่อให้ Scheduler นำไปคำนวณคะแนนรวมในการเลือกโหนดที่ดีที่สุด\n\n* **`IgnoredDuringExecution`**: หมายถึงหากในอนาคตมีคนไปแก้ไขหรือลบ Label บนโหนด พอดที่กำลังรันอยู่แล้วบนโหนดนั้นจะไม่ถูกไล่ออก ยังคงทำงานต่อไปได้ตามปกติ"
      },
      {
        "id": "affinity-operators",
        "headingEn": "Node Affinity Match Operators",
        "headingTh": "ตัวดำเนินการเปรียบเทียบใน Node Affinity",
        "contentMarkdown": "คุณสามารถเขียนเงื่อนไขที่ซับซ้อนได้ผ่านโอเปอเรเตอร์ต่างๆ:\n\n* **`In`**: ค่าของเลเบลบนโหนดต้องตรงกับค่าใดค่าหนึ่งในลิสต์\n* **`NotIn`**: ค่าของเลเบลต้องไม่ตรงกับค่าใดๆ ในลิสต์ (มีประโยชน์มากในการห้ามพอดไปรันบนโหนดบางประเภท)\n* **`Exists`**: ตรวจสอบเพียงว่ามีคีย์เลเบลนี้อยู่บนโหนดหรือไม่ โดยไม่สนใจว่าจะมีค่าเป็นอะไร\n* **`DoesNotExist`**: รับประกันว่าต้องไม่มีคีย์เลเบลนี้บนโหนด\n* **`Gt` / `Lt`**: เปรียบเทียบค่าตัวเลขว่ามากกว่า (Greater than) หรือน้อยกว่า (Less than)"
      },
      {
        "id": "pod-affinity-and-anti-affinity",
        "headingEn": "Inter-pod Affinity and Anti-Affinity",
        "headingTh": "Pod Affinity และ Pod Anti-Affinity: การจัดตำแหน่งโดยอิงพอดข้างเคียง",
        "contentMarkdown": "ในขณะที่ Node Affinity ตัดสินจากเลเบลของโหนด แต่ **Inter-pod Affinity** จะตัดสินจากเลเบลของ **Pods อื่นๆ** ที่กำลังทำงานอยู่บนโหนดนั้นหรือในโซนนั้น:\n\n* **`podAffinity` (ดึงดูดให้อยู่ใกล้กัน - Co-location)**:\n  * เหมาะสำหรับกรณีที่ต้องการให้พอด 2 ชนิดรันอยู่บนโหนดเดียวกันหรือใน Data Center เดียวกัน เพื่อลด Network Latency เช่น สั่งให้เว็บแอปพลิเคชันพยายามไปอยู่ใกล้กับ Redis Cache\n* **`podAntiAffinity` (ผลักไสให้อยู่ห่างกัน - High Availability)**:\n  * **หัวใจสำคัญของการทำ HA ใน Production!** ป้องกันไม่ให้พอดของแอปพลิเคชันเดียวกันไปรันกระจุกอยู่บน Worker Node เครื่องเดียวกัน หรืออยู่ใน Cloud Availability Zone เดียวกัน หากโหนดหนึ่งหรือโซนหนึ่งล่ม แอปพลิเคชันจะยังคงทำงานต่อได้โดยไม่มี Downtime\n* **`topologyKey`**: พารามิเตอร์ชี้ขาดขอบเขตของโดเมนความล้มเหลว (Failure Domain) เช่น `kubernetes.io/hostname` (ระดับเครื่องเซิร์ฟเวอร์) หรือ `topology.kubernetes.io/zone` (ระดับ Cloud Availability Zone)"
      },
      {
        "id": "nodename-pitfall",
        "headingEn": "Direct Node Selection: nodeName Pitfall",
        "headingTh": "การระบุโหนดแบบเจาะจง (nodeName) และข้อควรระวัง",
        "contentMarkdown": "> [!CAUTION]\n> การระบุฟิลด์ `spec.nodeName: node-01` ลงในพอดโดยตรง เป็นการสั่งบายพาส (Bypass) Kube-Scheduler โดยสิ้นเชิง!\n\n* kubelet บนโหนดที่ถูกระบุจะพยายามสั่งรันพอดทันทีโดยไม่มีการตรวจสอบว่าโหนดนั้นมี CPU/RAM เหลือพอหรือไม่ หรือโหนดนั้นติดสถานะ NotReady หรือไม่\n* หากโหนดนั้นเกิดไฟดับหรือถูกลบออกจากคลัสเตอร์ พอดจะตายตามไปด้วยและไม่สามารถย้ายไปรันบนโหนดอื่นได้โดยอัตโนมัติ\n* **ข้อแนะนำ**: ควรหลีกเลี่ยงการใช้ `nodeName` ในแอปพลิเคชัน Production และใช้ Node Affinity แทนเสมอ"
      },
      {
        "id": "ha-deployment-manifest",
        "headingEn": "Production High-Availability Manifest",
        "headingTh": "ตัวอย่าง Manifest ระบบพร้อมใช้งานสูง (HA Deployment) ข้ามโซน",
        "contentMarkdown": "ตัวอย่าง Deployment ที่กระจายพอดข้าม Availability Zones ด้วย PodAntiAffinity และดึงดูดเฉพาะโหนดที่มีสเปก SSD ด้วย NodeAffinity:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "ha-web-deployment.yaml",
            "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ha-web-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: ha-web\n  template:\n    metadata:\n      labels:\n        app: ha-web\n    spec:\n      affinity:\n        # 1. บังคับให้อยู่บนโหนด SSD\n        nodeAffinity:\n          requiredDuringSchedulingIgnoredDuringExecution:\n            nodeSelectorTerms:\n            - matchExpressions:\n              - key: disktype\n                operator: In\n                values:\n                - ssd\n        # 2. กระจายพอดไม่ให้ซ้ำโหนดกัน (HA Anti-Affinity)\n        podAntiAffinity:\n          requiredDuringSchedulingIgnoredDuringExecution:\n          - labelSelector:\n              matchExpressions:\n              - key: app\n                operator: In\n                values:\n                - ha-web\n            topologyKey: \"kubernetes.io/hostname\"\n      containers:\n      - name: web\n        image: nginx:alpine"
          },
          {
            "lang": "bash",
            "label": "คำสั่งตรวจสอบการจัดวางพอดบนโหนด",
            "code": "# ตรวจสอบว่าพอดแต่ละตัวกระจายไปลงที่โหนดใดบ้าง (ดูคอลัมน์ NODE)\nkubectl get pods -o wide -l app=ha-web\n\n# ดูรายละเอียดการตัดสินใจของ Kube-Scheduler เมื่อพอดไม่ยอม Schedule\nkubectl describe pod <pod-name> | grep -A 5 Events"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Taints and Tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) สำหรับการตั้งค่าให้โหนดปฏิเสธพอด\n* ศึกษา [Topology Spread Constraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/) สำหรับการเกลี่ยสัดส่วนพอดให้สมดุลเท่ากันทุกโซน\n* ศึกษา [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) สำหรับการตั้งค่า Requests และ Limits"
      }
    ],
    "relatedLinks": [
      {
        "title": "Taints and Tolerations (ข้อจำกัดบนโหนด)",
        "targetType": "concepts",
        "targetPageId": "sched-taint-toleration",
        "officialUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/"
      },
      {
        "title": "Resource Management (การจัดการทรัพยากรพอด)",
        "targetType": "concepts",
        "targetPageId": "config-manage-resources",
        "officialUrl": "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/"
      },
      {
        "title": "Nodes (สถาปัตยกรรมโหนด)",
        "targetType": "concepts",
        "targetPageId": "arch-nodes",
        "officialUrl": "https://kubernetes.io/docs/concepts/architecture/nodes/"
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
