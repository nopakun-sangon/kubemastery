/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/policy/resource-quota/
 */
(function (root) {
  const pageData = {
    "id": "policy-limits-quotas",
    "categoryId": "policies",
    "categoryTitle": "Policies",
    "titleEn": "Resource Quotas",
    "titleTh": "นโยบายจำกัดทรัพยากร (Limit Ranges) และโควตาคลัสเตอร์ (Resource Quotas)",
    "officialUrl": "https://kubernetes.io/docs/concepts/policy/resource-quota/",
    "docsPath": "/docs/concepts/policy/resource-quota/",
    "lead": "การแบ่งปันคลัสเตอร์ร่วมกันระหว่างหลายทีม (Multi-Tenancy) จำเป็นต้องมีกลไกกำกับดูแลทรัพยากรระดับ Namespace ด้วย LimitRange (กำหนดค่าต่ำสุด, สูงสุด และค่าดีฟอลต์ต่อคอนเทนเนอร์) และ ResourceQuota (จำกัดผลรวมทรัพยากรและจำนวนออบเจกต์ทั้งหมดใน Namespace) เพื่อป้องกันปัญหา Noisy Neighbor และงบประมาณบานปลาย",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nการแบ่งปันคลัสเตอร์ร่วมกันระหว่างหลายทีม (Multi-Tenancy) จำเป็นต้องมี LimitRange เพื่อควบคุมขนาดทรัพยากรและกำหนดค่าเริ่มต้น (Default) ของแต่ละ Pod/Container และ ResourceQuota เพื่อจำกัดผลรวมทรัพยากรประมวลผล (Compute) และจำนวนออบเจกต์รวมในระดับ Namespace เพื่อป้องกันปัญหา Noisy Neighbor และการใช้งบประมาณบานปลาย\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **LimitRange (ควบคุมระดับคอนเทนเนอร์/พอด)**:\n  * กำหนดขนาดทรัพยากรต่ำสุด (`min`) และสูงสุด (`max`) ที่คอนเทนเนอร์ขอได้\n  * **`default` และ `defaultRequest`**: เติมค่า Limits และ Requests ให้คอนเทนเนอร์อัตโนมัติหากผู้พัฒนาไม่ได้ระบุมา\n  * `maxLimitRequestRatio`: จำกัดอัตราส่วนความต่างระหว่าง Limits ต่อ Requests ไม่ให้ห่างกันเกินไป\n* **ResourceQuota (ควบคุมระดับผลรวมในเนมสเปซ)**:\n  * จำกัดผลรวม CPU/Memory: `requests.cpu`, `requests.memory`, `limits.cpu`, `limits.memory`\n  * จำกัดจำนวนออบเจกต์: `pods`, `services`, `services.loadbalancers`, `persistentvolumeclaims`\n  * จำกัดขนาดสตอเรจรวม: `requests.storage` หรือจำกัดแยกตาม StorageClass\n* **กฎเหล็กของ ResourceQuota**: หากเปิดใช้งาน Compute Quota ใน Namespace พอดทุกตัวที่จะสร้างต้องระบุ Requests และ Limits เสมอ (หรือต้องมี LimitRange คอยเติมให้) มิฉะนั้น API Server จะปฏิเสธทันที\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* คำสั่งสร้าง ResourceQuota:\n  `kubectl create quota my-quota --hard=cpu=2,memory=4Gi,pods=10 -n dev`\n* คำสั่งตรวจสอบโควตาคงเหลือ (Used vs Hard):\n  `kubectl describe quota my-quota -n dev`\n* คำสั่งตรวจสอบข้อจำกัดของ LimitRange:\n  `kubectl describe limitrange <name> -n dev`\n* ข้อควรระวังในห้องสอบ: หากสั่งสร้าง Pod ไม่ผ่านด้วย Error `Forbidden: exceeded quota` หรือ `must specify requests/limits` ให้ตรวจสอบ Quota และ LimitRange ในเนมสเปซนั้นทันที",
    "sections": [
      {
        "id": "why-governance",
        "headingEn": "Multi-Tenancy and the Noisy Neighbor Problem",
        "headingTh": "การใช้งานคลัสเตอร์ร่วมกันและปัญหา Noisy Neighbor",
        "contentMarkdown": "เมื่อองค์กรมีทีมพัฒนาหลายสิบทีมทำงานอยู่บน Kubernetes Cluster เดียวกัน หากไม่มีนโยบายควบคุมทรัพยากรที่รัดกุม อาจเกิดปัญหาที่เรียกว่า **\"Noisy Neighbor\"**:\n\n* ทีมหนึ่งเขียนโปรแกรมที่เกิด Memory Leak จนพอดขยายกินแรมของเครื่อง Worker Node ไปจนหมด ทำให้พอดของทีมอื่นที่อยู่บนเครื่องเดียวกันถูกทำลายทิ้ง\n* สคริปต์อัตโนมัติสร้าง Service ชนิด `LoadBalancer` นับร้อยตัวจนเกิดค่าใช้จ่ายคลาวด์มหาศาลเกินงบประมาณ\n\nKubernetes จัดเตรียมเครื่องมือบริหารจัดการ 2 ระดับที่ทำงานสอดประสานกัน:\n1. **`LimitRange`**: ควบคุมขนาดทรัพยากรของ **แต่ละ Pod หรือแต่ละ Container เดี่ยวๆ** ภายใน Namespace\n2. **`ResourceQuota`**: ควบคุม **ผลรวมทรัพยากรทั้งหมดและจำนวนออบเจกต์รวม** ที่ได้รับอนุญาตให้มีได้ใน Namespace นั้น"
      },
      {
        "id": "limitrange-explained",
        "headingEn": "LimitRange: Container-Level Constraints & Defaults",
        "headingTh": "LimitRange: การกำหนดขอบเขตและค่าเริ่มต้นระดับคอนเทนเนอร์",
        "contentMarkdown": "ออบเจกต์ **`LimitRange`** ช่วยบังคับใช้นโยบายดังต่อไปนี้กับคอนเทนเนอร์ทุกตัวที่ถูกสร้างใน Namespace:\n\n* **`min` และ `max`**: กำหนดขนาด CPU และ Memory ต่ำสุดและสูงสุดที่ยอมให้พอดขอได้ (ป้องกันไม่ให้พอดขอทรัพยากรน้อยเกินไปจนแอปพัง หรือขอมากเกินไปจนผูกขาดเครื่อง)\n* **`default` และ `defaultRequest`**: **ฟีเจอร์สำคัญที่สุด!** หากนักพัฒนาเขียนพอดโดยลืมระบุค่า Requests หรือ Limits ตัว Admission Controller จะนำค่าเริ่มต้นจาก LimitRange นี้ไปเติมใส่ในสเปกของคอนเทนเนอร์ให้อัตโนมัติทันที\n* **`maxLimitRequestRatio`**: จำกัดอัตราส่วนความต่างระหว่าง Limits กับ Requests ไม่ให้ห่างกันเกินไป เพื่อควบคุมไม่ให้เกิด Overcommit มากจนเสี่ยงต่อความเสถียร"
      },
      {
        "id": "resourcequota-compute",
        "headingEn": "ResourceQuota for Compute Resources",
        "headingTh": "ResourceQuota: การจำกัดผลรวมทรัพยากรประมวลผล",
        "contentMarkdown": "ออบเจกต์ **`ResourceQuota`** จะติดตามผลรวมของทรัพยากรทั้งหมดที่ Pods ใน Namespace จองไว้:\n\n* **`requests.cpu` และ `requests.memory`**: ผลรวมของ Requests ทั้งหมดใน Namespace ต้องไม่เกินเพดานที่กำหนด\n* **`limits.cpu` และ `limits.memory`**: ผลรวมของ Limits ทั้งหมดใน Namespace ต้องไม่เกินเพดานที่กำหนด\n\n> [!IMPORTANT]\n> **กฎเหล็กของ ResourceQuota**: เมื่อใดก็ตามที่คุณเปิดใช้งาน ResourceQuota ด้าน Compute ใน Namespace นั้น **พอดทุกตัวที่จะสร้างใหม่หลังจากนี้ จะต้องระบุค่า Requests และ Limits เสมอ!** หากพอดใดไม่ได้ระบุ และไม่มี LimitRange คอยเติมค่าเริ่มต้นให้ การสร้างพอดจะถูกปฏิเสธ (Forbidden) ทันที"
      },
      {
        "id": "resourcequota-objects-and-storage",
        "headingEn": "Object Count and Storage Quotas",
        "headingTh": "การจำกัดจำนวนออบเจกต์และโควตาสตอเรจ",
        "contentMarkdown": "นอกจาก CPU และ Memory แล้ว ResourceQuota ยังสามารถควบคุมสิ่งต่อไปนี้ได้:\n\n* **การจำกัดจำนวนออบเจกต์ (Object Counts)**:\n  * `pods`: จำนวนพอดรวมสูงสุดที่รันได้ใน Namespace (เช่น ไม่เกิน 20 พอด)\n  * `services`: จำนวน Service ทั้งหมด\n  * `services.loadbalancers`: จำนวน Cloud Load Balancer (เพื่อคุมงบประมาณคลาวด์)\n  * `secrets`, `configmaps`, `persistentvolumeclaims`\n* **โควตาระบบสตอเรจ (Storage Quotas)**:\n  * `requests.storage`: ปริมาณพื้นที่ดิสก์รวมที่ขอได้ใน Namespace (เช่น ไม่เกิน 500Gi)\n  * ควบคุมแยกตามคลาส: เช่น `<storage-class-name>.storageclass.storage.k8s.io/requests.storage` เพื่อจำกัดว่าคลาส `fast-ssd` ราคาแพงขอได้ไม่เกิน 100Gi เท่านั้น"
      },
      {
        "id": "manifest-and-inspection",
        "headingEn": "LimitRange & ResourceQuota Manifests and Inspection",
        "headingTh": "ตัวอย่าง Manifest และคำสั่งตรวจสอบโควตาคงเหลือ",
        "contentMarkdown": "ตัวอย่างการตั้งค่านโยบาย LimitRange และ ResourceQuota สำหรับ Namespace ทีมพัฒนา:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "governance-policy.yaml",
            "code": "apiVersion: v1\nkind: LimitRange\nmetadata:\n  name: dev-limit-range\n  namespace: team-dev\nspec:\n  limits:\n  - type: Container\n    default:\n      cpu: \"500m\"\n      memory: \"512Mi\"\n    defaultRequest:\n      cpu: \"100m\"\n      memory: \"128Mi\"\n    max:\n      cpu: \"2\"\n      memory: \"2Gi\"\n    min:\n      cpu: \"50m\"\n      memory: \"64Mi\"\n---\napiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: dev-compute-quota\n  namespace: team-dev\nspec:\n  hard:\n    requests.cpu: \"4\"\n    requests.memory: \"8Gi\"\n    limits.cpu: \"8\"\n    limits.memory: \"16Gi\"\n    pods: \"10\"\n    services.loadbalancers: \"1\"\n    requests.storage: \"100Gi\""
          },
          {
            "lang": "bash",
            "label": "คำสั่งตรวจสอบโควตาและการใช้งานจริง",
            "code": "# ตรวจสอบการใช้งานโควตาคงเหลือใน Namespace (แสดงคอลัมน์ Used / Hard)\nkubectl describe quota dev-compute-quota -n team-dev\n\n# ดูรายละเอียดข้อจำกัดของ LimitRange\nkubectl describe limitrange dev-limit-range -n team-dev"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Resource Management for Pods](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) การตั้งค่า Requests และ Limits ในพอด\n* ศึกษา [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) มาตรฐานความปลอดภัยระดับคอนเทนเนอร์\n* ศึกษา [Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) การจัดสรรพอดลงโหนด"
      }
    ],
    "relatedLinks": [
      {
        "title": "Resource Management (การจัดการทรัพยากร CPU และ Memory)",
        "targetType": "concepts",
        "targetPageId": "config-manage-resources",
        "officialUrl": "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/"
      },
      {
        "title": "Pod Security Standards (มาตรฐานความปลอดภัย)",
        "targetType": "concepts",
        "targetPageId": "sec-pod-security-standards",
        "officialUrl": "https://kubernetes.io/docs/concepts/security/pod-security-standards/"
      },
      {
        "title": "Service Accounts and RBAC (การควบคุมสิทธิ์ตามบทบาท)",
        "targetType": "concepts",
        "targetPageId": "sec-service-accounts-rbac",
        "officialUrl": "https://kubernetes.io/docs/concepts/security/service-accounts/"
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
