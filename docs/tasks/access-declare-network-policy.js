/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/
 */
(function (root) {
  const pageData = {
  "id": "access-declare-network-policy",
  "categoryId": "administer-cluster",
  "categoryTitle": "Administer a Cluster",
  "titleEn": "Declare Network Policy",
  "titleTh": "การประกาศใช้งานนโยบายเครือข่าย (Network Policy)",
  "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/",
  "docsPath": "/docs/tasks/administer-cluster/declare-network-policy/",
  "diagram": {
    "src": "images/docs/network-policy-isolation.svg",
    "caption": "การตัดแยกและควบคุมการรับส่งข้อมูล (Ingress/Egress) ระหว่างพอดด้วย NetworkPolicy"
  },
  "lead": "คู่มือปฏิบัติการรักษาความปลอดภัยเครือข่ายระดับพอดด้วย Kubernetes NetworkPolicy เพื่อควบคุมและจำกัดการรับส่งทราฟฟิก (Ingress/Egress) ทั้งระหว่างพอดด้วยกันเองและภายนอกคลัสเตอร์ตามหลักการ Zero-Trust (Default-Deny)",
  "sections": [
    {
      "id": "network-policy-prerequisites-and-behavior",
      "headingEn": "Prerequisites & Default Kubernetes Networking Behavior",
      "headingTh": "ข้อกำหนดเบื้องต้นและพฤติกรรมเครือข่ายพื้นฐานของ Kubernetes",
      "contentMarkdown": "### พฤติกรรมเครือข่ายเริ่มต้นของ Kubernetes: Non-Isolated\n\nโดยค่าเริ่มต้นใน Kubernetes โมเดลเครือข่ายถูกออกแบบให้เป็น **\"Flat Network\" ที่ไม่มีการปิดกั้น (Non-Isolated)**:\n* ทุกๆ Pod ในคลัสเตอร์สามารถส่งข้อมูลสื่อสารหากันได้โดยตรง ไม่ว่าจะอยู่ต่าง Node หรือต่าง Namespace กันก็ตาม โดยไม่ต้องผ่าน NAT\n* หาก Pod ใด Pod หนึ่งถูกผู้ไม่ประสงค์ดีโจมตี (Compromised) ผู้โจมตีจะสามารถเคลื่อนที่ในแนวราบ (Lateral Movement) ไปยังฐานข้อมูลหรือเซอร์วิสอื่นๆ ทั่วทั้งคลัสเตอร์ได้ทันที\n\n### เงื่อนไขจำเป็น: Network Plugin (CNI) ที่รองรับ Policy Enforcement\nNetworkPolicy เป็นเพียง API Resource สเปกมาตรฐานของ Kubernetes แต่การบังคับใช้กฎเครือข่ายจริงขึ้นอยู่กับ **CNI Plugin**:\n* **CNI ที่รองรับ NetworkPolicy**: เช่น Calico, Cilium, Weave Net, Kube-router, หรือ Cloud CNI (AWS VPC CNI w/ Network Policy, Azure CNI w/ Azure Network Policy, GKE Datapath V2)\n* **CNI ที่ไม่รองรับ NetworkPolicy**: เช่น Flannel ล้วนๆ (หากสร้าง NetworkPolicy บนคลัสเตอร์ที่ใช้ Flannel กฎจะถูกบันทึกสำเร็จ แต่ **ไม่มีผลบังคับใช้จริง ทราฟฟิกจะยังทะลุผ่านได้ 100%**)\n\n> [!IMPORTANT]\n> เมื่อพอดถูกเลือกโดย Label Selector ใน NetworkPolicy ตัวใดตัวหนึ่ง สถานะของพอดจะเปลี่ยนจาก **Non-Isolated** เป็น **Isolated** ทันที และทราฟฟิกที่ไม่ตรงกับกฎ Allow ใดๆ เลยจะถูก Drop ทิ้ง",
      "codeBlocks": []
    },
    {
      "id": "default-deny-all-policies",
      "headingEn": "Default-Deny All Ingress and Egress Policies",
      "headingTh": "การสร้างนโยบายตัดทราฟฟิกทั้งหมด (Default-Deny Zero-Trust)",
      "contentMarkdown": "แนวทางปฏิบัติที่ดีที่สุดด้านความมั่นคงปลอดภัย (Security Best Practice) คือการเริ่มต้นด้วยนโยบาย **Default-Deny** ในแต่ละ Namespace แล้วค่อยๆ เปิดช่องทางอนุญาตเฉพาะที่จำเป็น (Allow-list):\n\n### 1. Default-Deny All Ingress (บล็อกทราฟฟิกขาเข้าทั้งหมด)\nสร้างไฟล์ `default-deny-ingress.yaml`:\n* `podSelector: {}`: เลือกพอดทุกตัวใน Namespace นี้\n* `policyTypes: [Ingress]`: ควบคุมทราฟฟิกขาเข้า\n* ไม่มีบล็อก `ingress:` หมายความว่า **ไม่อนุญาตให้ทราฟฟิกขาเข้าใดๆ ผ่านได้เลย**\n\n### 2. Default-Deny All Egress (บล็อกทราฟฟิกขาออกทั้งหมด)\n* ป้องกันไม่ให้พอดที่ถูกแฮกส่งข้อมูลรั่วไหลออกนอกคลัสเตอร์ (Data Exfiltration) หรือติดต่อกับ Command & Control Server ของแฮกเกอร์",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "default-deny-all-ingress.yaml",
          "code": "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-ingress\n  namespace: default\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress"
        },
        {
          "lang": "yaml",
          "label": "default-deny-all-egress.yaml",
          "code": "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-egress\n  namespace: default\nspec:\n  podSelector: {}\n  policyTypes:\n  - Egress"
        }
      ]
    },
    {
      "id": "declaring-fine-grained-ingress-rules",
      "headingEn": "Declaring Fine-Grained Ingress and Egress Rules",
      "headingTh": "การประกาศกฎอนุญาตอย่างละเอียด (Fine-Grained Allow Rules)",
      "contentMarkdown": "โครงสร้างของตัวกรองในบล็อก `from` (สำหรับ Ingress) และ `to` (สำหรับ Egress) มี 3 องค์ประกอบหลักที่สามารถผสมผสานกันได้:\n\n1. **`podSelector`**: เลือกเฉพาะพอดที่มีเลเบลตรงกันภายในเนมสเปซเดียวกัน\n2. **`namespaceSelector`**: เลือกพอดทุกตัวที่มาจากเนมสเปซที่มีเลเบลตรงกัน\n3. **`ipBlock`**: กำหนดช่วง IP ภายนอก (CIDR) พร้อมระบุ `except` เพื่อยกเว้นบางช่วง\n\n### ตัวอย่าง: ปกป้องฐานข้อมูล Database Service\nกฎด้านล่างระบุว่า:\n* บังคับใช้กับพอดที่มีเลเบล `role: db`\n* อนุญาตทราฟฟิกขาเข้า (**Ingress**) เฉพาะที่ส่งมาจากพอดที่มีเลเบล `role: frontend`\n* และต้องเรียกเข้าที่ TCP พอร์ต 6379 เท่านั้น",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "db-policy.yaml",
          "code": "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: db-netpolicy\n  namespace: default\nspec:\n  podSelector:\n    matchLabels:\n      role: db\n  policyTypes:\n  - Ingress\n  ingress:\n  - from:\n    - podSelector:\n        matchLabels:\n          role: frontend\n    ports:\n    - protocol: TCP\n      port: 6379"
        }
      ]
    },
    {
      "id": "step-by-step-verification-walkthrough",
      "headingEn": "Step-by-Step Verification and Testing",
      "headingTh": "ขั้นตอนการทดสอบปฏิบัติการจริงในคลัสเตอร์",
      "contentMarkdown": "### 1. สร้าง Deployment สองชุดเพื่อทดสอบ\n```bash\n# สร้าง Backend Web Server\nkubectl create deployment nginx --image=nginx --replicas=1\nkubectl expose deployment nginx --port=80\n\n# ตรวจสอบการเข้าถึงก่อนใช้นโยบาย (ต้องเรียกได้ปกติ)\nkubectl run test-before --rm -i -t --image=busybox:1.28 --restart=Never -- \\\n  wget -qO- --timeout=2 http://nginx\n```\n\n### 2. นำใช้นโยบายปิดกั้นทราฟฟิกเข้า NGINX\nสร้างไฟล์ NetworkPolicy ที่เลือก `app: nginx` และอนุญาตเฉพาะพอดที่ติดเลเบล `access: granted`:\n```yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: access-nginx\nspec:\n  podSelector:\n    matchLabels:\n      app: nginx\n  ingress:\n  - from:\n    - podSelector:\n        matchLabels:\n          access: granted\n```\nสั่ง Apply:\n```bash\nkubectl apply -f access-nginx.yaml\n```\n\n### 3. ทดสอบการปฏิเสธการเชื่อมต่อ (Denied)\nลองเชื่อมต่อจากพอดที่ไม่มีเลเบล `access=granted`:\n```bash\nkubectl run test-denied --rm -i -t --image=busybox:1.28 --restart=Never -- \\\n  wget -qO- --timeout=2 http://nginx\n```\nคำสั่งจะค้างและจบด้วยข้อผิดพลาด: `wget: download timed out` แสดงว่าทราฟฟิกถูก CNI Drop ทิ้งอย่างสมบูรณ์!\n\n### 4. ทดสอบการอนุญาตการเชื่อมต่อ (Allowed)\nรันพอดใหม่พร้อมใส่เลเบล `access=granted`:\n```bash\nkubectl run test-allowed --labels=\"access=granted\" --rm -i -t --image=busybox:1.28 --restart=Never -- \\\n  wget -qO- --timeout=2 http://nginx\n```\nผลลัพธ์จะสามารถดาวน์โหลดหน้าเว็บ Welcome to nginx! ได้สำเร็จทันที",
      "codeBlocks": []
    },
    {
      "id": "dns-pitfall-and-best-practices",
      "headingEn": "The DNS Egress Trap and Critical Considerations",
      "headingTh": "กับดัก DNS Egress และข้อพึงระวังขั้นวิกฤต",
      "contentMarkdown": "> [!CRITICAL]\n> **ระวัง: การเปิด Egress Policy อาจทำให้ระบบ DNS พังทั้ง Namespace!**\n> เมื่อคุณเปิดใช้งานนโยบายจำกัด Egress (ขาออก) บนพอด หากคุณไม่ได้เขียนกฎอนุญาตให้พอดส่งทราฟฟิกไปยัง **CoreDNS (UDP/TCP Port 53 ใน namespace `kube-system`)** พอดจะไม่สามารถค้นหาชื่อโดเมนใดๆ ได้เลย แม้กระทั่งชื่อเซอร์วิสภายในคลัสเตอร์!\n\n### กฎอนุญาต CoreDNS Egress มาตรฐาน:\n```yaml\negress:\n- to:\n  - namespaceSelector:\n      matchLabels:\n        kubernetes.io/metadata.name: kube-system\n    podSelector:\n      matchLabels:\n        k8s-app: kube-dns\n  ports:\n  - protocol: UDP\n    port: 53\n  - protocol: TCP\n    port: 53\n```\n\n### ข้อควรจำสำหรับการสอบ CKA:\n* **ความหมายของ Comma ใน Array vs Element ใหม่**:\n  * ในบล็อก `from:` หากเขียน:\n    ```yaml\n    - namespaceSelector: { matchLabels: { team: a } }\n      podSelector: { matchLabels: { role: client } }\n    ```\n    *(ไม่มีขีด `-` นำหน้าอันที่สอง)* หมายถึงเงื่อนไข **AND** (ต้องมาจากเนมสเปซ team:a **และ** ต้องมีเลเบล role:client ด้วย)\n  * แต่ถ้าเขียนมีขีดทั้งคู่:\n    ```yaml\n    - namespaceSelector: { matchLabels: { team: a } }\n    - podSelector: { matchLabels: { role: client } }\n    ```\n    หมายถึงเงื่อนไข **OR** (มาจากเนมสเปซ team:a **หรือ** เป็นพอดในเนมสเปซนี้ที่มีเลเบล role:client ก็ได้)"
    }
  ],
  "relatedLinks": [
    {
      "title": "Set up Ingress on Minikube with NGINX Controller",
      "targetType": "tasks",
      "targetPageId": "access-ingress-nginx",
      "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/"
    },
    {
      "title": "Debugging DNS Resolution",
      "targetType": "tasks",
      "targetPageId": "debug-dns-resolution",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/"
    },
    {
      "title": "Debug Pods and Services",
      "targetType": "tasks",
      "targetPageId": "debug-pods-services",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/"
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
