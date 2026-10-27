/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/services-networking/network-policies/
 */
(function (root) {
  const pageData = {
    "id": "net-network-policies",
    "categoryId": "services-networking",
    "categoryTitle": "Services, Load Balancing, and Networking",
    "titleEn": "Network Policies",
    "titleTh": "นโยบายความปลอดภัยเครือข่าย (Network Policies)",
    "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/network-policies/",
    "docsPath": "/docs/concepts/services-networking/network-policies/",
    "diagram": {
      "src": "images/docs/network-policy-isolation.svg",
      "caption": "การตัดแยกเครือข่ายด้วย Network Policy: กรองทราฟฟิก Ingress และ Egress ระหว่าง Pods ด้วยโมเดล Zero Trust"
    },
    "lead": "NetworkPolicy เป็นข้อกำหนด API ที่ใช้ควบคุมการไหลเวียนของข้อมูลระดับ IP Packet (Layer 3/4) ระหว่าง Pods หรือระหว่าง Pod กับโลกภายนอก โดยทำงานเสมือนไฟร์วอลล์ระดับซอฟต์แวร์ที่ฝังอยู่รอบตัวพอด เพื่อจำกัดการสื่อสารให้เหลือเฉพาะเส้นทางที่จำเป็นตามหลักการ Zero Trust",
    "sections": [
      {
        "id": "network-policy-fundamentals",
        "headingEn": "Network Policy Fundamentals and Pod Isolation",
        "headingTh": "พื้นฐานของ Network Policies และการแยกความปลอดภัยของพอด",
        "contentMarkdown": "โดยปกติแล้ว เครือข่ายของ Kubernetes จะทำงานในรูปแบบ **Non-isolated (Default Allow)** ซึ่งหมายความว่าทุกพอดในคลัสเตอร์สามารถส่งและรับข้อมูลไปยังพอดอื่นๆ ได้อย่างอิสระโดยไม่มีการขวางกั้น แม้จะอยู่คนละ Namespace ก็ตาม\n\nเมื่อคุณสร้างออบเจกต์ **`NetworkPolicy`** ที่จับคู่กับกลุ่มของพอดผ่าน `podSelector` พอดกลุ่มนั้นจะเปลี่ยนสถานะเป็น **Isolated (ถูกตัดแยกความปลอดภัย)** ทันที:\n* ทราฟฟิกขาเข้า (Ingress) หรือขาออก (Egress) ทั้งหมดจะถูกปิดกั้น (Drop Packet) เป็นค่าเริ่มต้น\n* มีเพียงทราฟฟิกที่ตรงกับเงื่อนไขสีขาว (Allowlist) ที่ระบุไว้ใน Policy เท่านั้นที่จะได้รับอนุญาตให้ผ่านได้\n* หากมีหลาย NetworkPolicy จับคู่กับพอดเดียวกัน กฎทั้งหมดจะถูกนำมารวมกัน (Additive / Union) โดยไม่มีลำดับก่อนหลัง"
      },
      {
        "id": "cni-plugin-prerequisite",
        "headingEn": "CNI Plugin Prerequisite",
        "headingTh": "ข้อกำหนดสำคัญ: CNI Plugin ที่รองรับ NetworkPolicy",
        "contentMarkdown": "> [!IMPORTANT]\n> การสร้างออบเจกต์ NetworkPolicy จะไม่มีผลบังคับใช้ใดๆ หากคลัสเตอร์ของคุณใช้ Network Plugin พื้นฐานที่ไม่รองรับ NetworkPolicy Enforcement!\n\nในการบังคับใช้นโยบายเครือข่าย คลัสเตอร์ต้องติดตั้ง **Container Network Interface (CNI)** ที่มีโมดูลควบคุมความปลอดภัย เช่น:\n* **Calico**: ระบบ CNI ยอดนิยมที่บังคับใช้นโยบายด้วย Linux iptables หรือ eBPF\n* **Cilium**: นวัตกรรม CNI สมัยใหม่ที่ทำงานด้วย Linux eBPF ประสิทธิภาพสูงมาก\n* **Antrea**: CNI ที่ขับเคลื่อนด้วย Open vSwitch (OVS)\n* **AWS VPC CNI / Azure CNI / Google Cloud Datapath V2**: CNI จาก Cloud Providers ที่เปิดใช้งาน Network Policy Add-on"
      },
      {
        "id": "policy-anatomy",
        "headingEn": "The Anatomy of a NetworkPolicy",
        "headingTh": "โครงสร้างส่วนประกอบของ NetworkPolicy",
        "contentMarkdown": "Manifest ของ NetworkPolicy ประกอบด้วย 4 ส่วนสำคัญหลัก:\n\n1. **`podSelector`**: กำหนดว่านโยบายนี้จะถูกบังคับใช้กับพอดใดใน Namespace (หากใส่ `{}` ว่างๆ หมายถึงบังคับใช้กับทุกพอดใน Namespace นั้น)\n2. **`policyTypes`**: ระบุขอบเขตการควบคุม ได้แก่ `Ingress` (ทราฟฟิกขาเข้า), `Egress` (ทราฟฟิกขาออก) หรือทั้งสองอย่าง\n3. **`ingress` / `egress` Rules**: กำหนดเงื่อนไขที่อนุญาต โดยจับคู่ผ่าน 3 กลไก:\n   * **`podSelector`**: อนุญาตเฉพาะพอดที่มีเลเบลตรงตามกำหนด (ใน Namespace เดียวกัน)\n   * **`namespaceSelector`**: อนุญาตเฉพาะพอดที่รันอยู่ใน Namespace ที่มีเลเบลตรงตามกำหนด\n   * **`ipBlock`**: อนุญาตตามช่วงหมายเลข IP Address หรือ CIDR (เช่น `192.168.1.0/24`) พร้อมทั้งรองรับข้อยกเว้น `except`\n4. **`ports`**: จำกัดเฉพาะโปรโตคอล (TCP/UDP) และหมายเลขพอร์ตที่ระบุเท่านั้น"
      },
      {
        "id": "common-scenarios-manifests",
        "headingEn": "Common Real-World Manifests",
        "headingTh": "ตัวอย่าง Manifest สำหรับกรณีการใช้งานจริง",
        "contentMarkdown": "ตัวอย่างนโยบายที่พบบ่อยในการวางระบบความปลอดภัยระดับองค์กร:\n\n### 1. นโยบาย Default Deny All Ingress (ปิดกั้นทราฟฟิกขาเข้าทั้งหมดเป็นฐานความปลอดภัย)",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "default-deny-ingress.yaml",
            "code": "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny-all-ingress\n  namespace: production\nspec:\n  podSelector: {}\n  policyTypes:\n  - Ingress"
          },
          {
            "lang": "yaml",
            "label": "allow-frontend-to-backend.yaml",
            "code": "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: allow-frontend-to-backend\n  namespace: production\nspec:\n  podSelector:\n    matchLabels:\n      app.kubernetes.io/name: backend-api\n  policyTypes:\n  - Ingress\n  ingress:\n  - from:\n    - podSelector:\n        matchLabels:\n          app.kubernetes.io/name: frontend-ui\n    ports:\n    - protocol: TCP\n      port: 8080"
          }
        ]
      },
      {
        "id": "egress-filtering-and-dns-pitfall",
        "headingEn": "Egress Filtering and the Critical DNS Pitfall",
        "headingTh": "การกรองทราฟฟิกขาออก (Egress) และข้อควรระวังเรื่องระบบ DNS",
        "contentMarkdown": "> [!CAUTION]\n> **หลุมพรางยอดนิยม**: เมื่อคุณสร้าง NetworkPolicy ที่กำหนด `policyTypes: [\"Egress\"]` พอดจะถูกตัดขาดจากการส่งข้อมูลขาออกทุกประเภท ซึ่งรวมถึง **CoreDNS (พอร์ต 53 UDP/TCP)** ด้วย! ส่งผลให้พอดไม่สามารถ Resolve ชื่อโฮสต์ใดๆ ได้เลย\n\nหากต้องการจำกัด Egress คุณต้องอนุญาตทราฟฟิกไปยังระบบ DNS ภายในเสมอ ดังตัวอย่างด้านล่าง:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "allow-dns-egress.yaml",
            "code": "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: allow-dns-and-database\n  namespace: production\nspec:\n  podSelector:\n    matchLabels:\n      app.kubernetes.io/name: backend-api\n  policyTypes:\n  - Egress\n  egress:\n  # 1. อนุญาตให้ออกไปหา CoreDNS ได้เสมอ\n  - to:\n    - namespaceSelector: {}\n      podSelector:\n        matchLabels:\n          k8s-app: kube-dns\n    ports:\n    - protocol: UDP\n      port: 53\n    - protocol: TCP\n      port: 53\n  # 2. อนุญาตให้ออกไปหา Database ที่พอร์ต 5432 เท่านั้น\n  - to:\n    - podSelector:\n        matchLabels:\n          app.kubernetes.io/name: postgresql\n    ports:\n    - protocol: TCP\n      port: 5432"
          }
        ]
      },
      {
        "id": "troubleshooting-and-cli",
        "headingEn": "Troubleshooting Network Policies",
        "headingTh": "การตรวจสอบและทดสอบความถูกต้องของนโยบาย",
        "contentMarkdown": "คุณสามารถตรวจสอบสถานะและดีบัก NetworkPolicy ได้ด้วยคำสั่ง kubectl และการทดสอบเชื่อมต่อจริง:",
        "codeBlocks": [
          {
            "lang": "bash",
            "label": "คำสั่งตรวจสอบ NetworkPolicy",
            "code": "# แสดงรายการ Network Policies ใน Namespace\nkubectl get networkpolicies -n production\n\n# ดูรายละเอียดเงื่อนไข Ingress/Egress และ Pod Selector\nkubectl describe networkpolicy allow-frontend-to-backend -n production\n\n# ทดสอบการเชื่อมต่อจากพอด Frontend ไปยัง Backend\nkubectl exec -n production deploy/frontend-ui -- curl -m 3 -sI http://backend-api:8080\n\n# ทดสอบการเข้าถึงที่ไม่ได้รับอนุญาต (ต้องถูก Timeout หรือ Connection Refused)\nkubectl run test-intruder --rm -i --tty --image=curlimages/curl -- curl -m 3 http://backend-api.production:8080"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษาคู่มือปฏิบัติ [Declare Network Policy](https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/)\n* ศึกษา [Service Concepts](https://kubernetes.io/docs/concepts/services-networking/service/) สำหรับการจัดสรรทราฟฟิกภายในคลัสเตอร์\n* ศึกษา [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) สำหรับการควบคุมสิทธิ์ด้านความปลอดภัยของพอด"
      }
    ],
    "relatedLinks": [
      {
        "title": "Service (เซอร์วิสและโหลดบาลานซ์)",
        "targetType": "concepts",
        "targetPageId": "net-service",
        "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/service/"
      },
      {
        "title": "Ingress Controllers (เกตเวย์ HTTP)",
        "targetType": "concepts",
        "targetPageId": "net-ingress-controllers",
        "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/ingress/"
      },
      {
        "title": "Pod Security Standards (มาตรฐานความปลอดภัย)",
        "targetType": "concepts",
        "targetPageId": "sec-pod-security-standards",
        "officialUrl": "https://kubernetes.io/docs/concepts/security/pod-security-standards/"
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
