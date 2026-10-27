/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/services-networking/gateway/
 */
(function (root) {
  const pageData = {
    "id": "net-gateway-api",
    "categoryId": "services-networking",
    "categoryTitle": "Services, Load Balancing, and Networking",
    "titleEn": "Gateway API",
    "titleTh": "เกตเวย์เอพีไอ (Gateway API)",
    "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/gateway/",
    "docsPath": "/docs/concepts/services-networking/gateway/",
    "diagram": {
      "src": "images/docs/ingress-gateway-flow.svg",
      "caption": "สถาปัตยกรรม Gateway API: การแยกชั้นสิทธิ์และบทบาทระหว่าง Cluster Operator (Gateway) และ App Developer (HTTPRoute)"
    },
    "lead": "Gateway API คือกลุ่มของ Custom Resource Definitions (CRDs) ที่ออกแบบมาเป็นมาตรฐานรุ่นถัดไปของ Service Networking ใน Kubernetes โดยมุ่งเน้นการแบ่งแยกบทบาทตามหน้าที่ (Role-oriented), ความยืดหยุ่นในการขยายระบบ (Extensible) และรองรับการจัดการสิทธิ์หลายทีม (Multi-tenancy) เพื่อก้าวข้ามข้อจำกัดของ Ingress แบบเดิม",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nGateway API คือมาตรฐานรุ่นถัดไปของ Service Networking ใน Kubernetes ที่ถูกพัฒนาขึ้นมาแก้ไขข้อจำกัดของ Ingress แบบเดิม โดยออกแบบตามบทบาทหน้าที่ของผู้ใช้งานจริงในองค์กร (Role-Oriented) และยกระดับฟีเจอร์ขั้นสูงอย่าง Canary Traffic Splitting, Header Matching, และ Cross-Namespace Routing ให้เป็น First-class API โดยไม่ต้องพึ่งพา Custom Annotations\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **การแบ่งแยก 3 บทบาทหลัก (Role-Oriented Model)**:\n  * `Infrastructure Provider`: ดูแล `GatewayClass` (ระบุ Controller เครือข่าย เช่น Istio, Envoy Gateway, Cilium)\n  * `Cluster Operator / Platform Engineer`: ดูแล `Gateway` (กำหนดจุดรับทราฟฟิกจริง พอร์ต 80/443 และผูก TLS Certificate ส่วนกลาง)\n  * `Application Developer`: ดูแล Route Objects เช่น `HTTPRoute`, `GRPCRoute`, `TCPRoute` (จัดการเฉพาะกฎ Path/Header และชี้ไปที่ Service ของตนเอง)\n* **Canary Traffic Splitting ในตัว**: รองรับการกำหนดค่าน้ำหนัก `weight` ภายใต้ `backendRefs` เพื่อกระจายสัดส่วนทราฟฟิก (เช่น 90/10) ได้ทันทีโดยไม่ต้องติดตั้ง Service Mesh เพิ่ม\n* **ความปลอดภัยข้าม Namespace ด้วย ReferenceGrant**: ป้องกันการแอบอ้างข้ามโปรเจกต์ หาก Route ใน Namespace หนึ่งต้องการเชื่อมต่อไปยัง Service หรือ Secret ในอีก Namespace จะต้องมี `ReferenceGrant` ยินยอมอย่างชัดเจน\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* สถาปัตยกรรมลำดับชั้น: `GatewayClass` -> `Gateway` -> `HTTPRoute` -> `Service`\n* ฟิลด์สำคัญของ `HTTPRoute`:\n  * `spec.parentRefs`: ระบุชื่อและ Namespace ของ Gateway ที่ต้องการผูก\n  * `spec.rules[*].matches`: กำหนดเงื่อนไข Path, Headers, Query Params\n  * `spec.rules[*].backendRefs`: ระบุ Service, Port และ `weight`\n* คำสั่งตรวจสอบสถานะ: `kubectl get gatewayclasses`, `kubectl get gateways`, `kubectl get httproutes`\n* เช็กความพร้อมใช้งาน: ดูคอลัมน์ `PROGRAMMED` เป็น `True` และตรวจดูรายละเอียดด้วย `kubectl describe httproute <name>`",
    "sections": [
      {
        "id": "what-is-gateway-api",
        "headingEn": "Why Gateway API? Limitations of Ingress",
        "headingTh": "ทำไมต้องมี Gateway API? ข้อจำกัดของ Ingress แบบเดิม",
        "contentMarkdown": "แม้ว่า Ingress จะเป็นมาตรฐานที่ได้รับความนิยมอย่างสูง แต่เมื่อสถาปัตยกรรมคลาวด์เนทีฟเติบโตขึ้น Ingress เริ่มแสดงข้อจำกัดสำคัญ 3 ประการ:\n\n1. **การรวมสเปกไว้ในที่เดียว (Monolithic Resource)**: Ingress มัดรวมทั้งการตั้งค่าโครงสร้างพื้นฐาน (เช่น IP, TLS Certificate, Port) และกฎการจัดเส้นทางของแอปพลิเคชัน (Host, Path) ไว้ใน Manifest ไฟล์เดียวกัน ทำให้ทั้งทีม Platform Ops และทีม Developer ต้องแก้ไขไฟล์เดียวกัน เกิดความขัดแย้งด้านความปลอดภัย\n2. **การพึ่งพา Annotations มากเกินไป**: Ingress มีฟิลด์สเปกแบบมาตรฐานค่อนข้างจำกัด ฟีเจอร์ขั้นสูงอย่าง URL Rewriting, Header Manipulation, Rate Limiting, หรือ Canary Traffic Splitting ต้องอาศัย Annotations ที่เป็น Vendor-specific ซึ่งนำไปใช้ข้าม Ingress Controller แต่ละยี่ห้อไม่ได้\n3. **ขาดการรองรับโปรโตคอลสมัยใหม่**: Ingress มุ่งเน้นเฉพาะ HTTP/HTTPS ทำให้การรองรับ gRPC, TCP, หรือ UDP ไม่มีความยืดหยุ่น\n\n**Gateway API** ถูกสร้างขึ้นโดย Kubernetes SIG-Network เพื่อแก้ปัญหาเหล่านี้ โดยเปลี่ยนเป็นชุด API ที่แยกทรัพยากรตามบทบาทจริงในองค์กร และกำหนดฟีเจอร์ขั้นสูงให้เป็นฟิลด์มาตรฐานระดับ First-class Citizen"
      },
      {
        "id": "role-oriented-design",
        "headingEn": "Role-Oriented Design Model",
        "headingTh": "โมเดลการออกแบบที่แยกตามบทบาทหน้าที่ (Role-Oriented)",
        "contentMarkdown": "Gateway API แบ่งสิทธิ์และความรับผิดชอบออกเป็น 3 บทบาทหลักอย่างชัดเจน:\n\n* **Infrastructure Provider (ผู้ให้บริการคลาวด์หรือระบบเครือข่าย)**:\n  * ดูแล `GatewayClass` ซึ่งระบุกลไกเบื้องหลังของเครือข่าย (เช่น Istio, Envoy Gateway, Cilium, AWS VPC Lattice, Google Cloud Gateway Controller)\n* **Cluster Operator / Platform Engineer (ผู้ดูแลคลัสเตอร์)**:\n  * ดูแลออบเจกต์ `Gateway` กำหนดพอร์ตรับทราฟฟิก (Port 80/443), ผูกกับ Hostname และ TLS Certificates ประจำองค์กร พร้อมกำหนดนโยบายว่า Namespace ใดสามารถต่อเข้ากับ Gateway นี้ได้\n* **Application Developer (ผู้พัฒนาระบบ)**:\n  * ดูแล Route Objects เช่น `HTTPRoute` หรือ `GRPCRoute` โดยนักพัฒนาจัดการเฉพาะกฎการจัดเส้นทาง URL Path, Header Filter, และการชี้ไปยัง Service ของตนเองเท่านั้น โดยไม่ต้องเข้าถึงหรือยุ่งเกี่ยวกับ TLS Secret หรือ IP ส่วนกลาง"
      },
      {
        "id": "core-api-resources",
        "headingEn": "Core API Resources Architecture",
        "headingTh": "โครงสร้างทรัพยากรหลักของ Gateway API",
        "contentMarkdown": "สถาปัตยกรรมของ Gateway API ประกอบด้วยทรัพยากรเชื่อมโยงกันเป็นลำดับชั้น:\n\n```\nGatewayClass (infra) \n     ↓\n  Gateway (cluster admin) \n     ↓\nHTTPRoute / GRPCRoute (app developer)\n     ↓\n  Service (app backend)\n```\n\n* **`GatewayClass`**: กำหนดชนิดของเกตเวย์และ Controller ที่ใช้งาน มีขอบเขตระดับ Cluster-scoped\n* **`Gateway`**: ตัวแทนจุดรับทราฟฟิกจริง (เช่น Load Balancer IP หรือ Proxy Pods) กำหนด Listeners และ TLS Config\n* **`HTTPRoute`**: กำหนดกฎการคัดกรองและการจัดเส้นทางระดับ L7 HTTP/HTTPS เช่น Path Prefix, Headers, Query Parameters\n* **`GRPCRoute`**: ออกแบบมาสำหรับการส่งต่อคำขอ gRPC โดยเฉพาะ รองรับการ Match ตาม Service/Method\n* **`TLSRoute` / `TCPRoute` / `UDPRoute`**: สำหรับการส่งต่อทราฟฟิกระดับ L4 (TCP/UDP) หรือ Passthrough TLS โดยไม่ต้องถอดรหัส"
      },
      {
        "id": "manifest-and-examples",
        "headingEn": "Gateway & HTTPRoute Manifest Examples",
        "headingTh": "ตัวอย่าง Manifest ของ Gateway และ HTTPRoute",
        "contentMarkdown": "ตัวอย่างการตั้งค่าแยกไฟล์ระหว่างทีม Platform (สร้าง Gateway) และทีม Developer (สร้าง HTTPRoute):",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "platform-gateway.yaml",
            "code": "apiVersion: gateway.networking.k8s.io/v1\nkind: Gateway\nmetadata:\n  name: prod-gateway\n  namespace: infra-network\nspec:\n  gatewayClassName: eg-gateway-class\n  listeners:\n  - name: https\n    protocol: HTTPS\n    port: 443\n    hostname: \"*.example.com\"\n    tls:\n      mode: Terminate\n      certificateRefs:\n      - name: wildcard-example-tls\n    allowedRoutes:\n      namespaces:\n        from: All"
          },
          {
            "lang": "yaml",
            "label": "app-httproute.yaml",
            "code": "apiVersion: gateway.networking.k8s.io/v1\nkind: HTTPRoute\nmetadata:\n  name: store-route\n  namespace: store-app\nspec:\n  parentRefs:\n  - name: prod-gateway\n    namespace: infra-network\n  hostnames:\n  - \"store.example.com\"\n  rules:\n  - matches:\n    - path:\n        type: PathPrefix\n        value: /checkout\n    backendRefs:\n    - name: checkout-service\n      port: 8080"
          }
        ]
      },
      {
        "id": "advanced-traffic-management",
        "headingEn": "Advanced Capabilities: Canary Splitting & Cross-Namespace",
        "headingTh": "ความสามารถขั้นสูง: การทำ Canary Deployment และความปลอดภัยข้าม Namespace",
        "contentMarkdown": "Gateway API รองรับฟีเจอร์ระดับองค์กรโดยตรงในตัวสเปก:\n\n### 1. Canary Traffic Splitting (การกระจายทราฟฟิกตามสัดส่วน)\nคุณสามารถกำหนดน้ำหนัก (`weight`) ภายใต้ `backendRefs` เพื่อส่งทราฟฟิก 90% ไปยังเวอร์ชันปัจจุบัน (v1) และ 10% ไปยังเวอร์ชันใหม่ (v2) เพื่อทดสอบได้โดยไม่ต้องลงเครื่องมือ Service Mesh เพิ่มเติม\n\n```yaml\n    backendRefs:\n    - name: store-v1\n      port: 80\n      weight: 90\n    - name: store-v2\n      port: 80\n      weight: 10\n```\n\n### 2. Cross-Namespace Routing ด้วย ReferenceGrant\nเพื่อความปลอดภัยสูงสุดในการทำงานแบบหลายทีม หาก HTTPRoute ใน Namespace ของนักพัฒนาต้องการอ้างอิง Service หรือ Secret ที่อยู่ในอีก Namespace หนึ่ง ผู้ดูแลของ Namespace ปลายทางจะต้องสร้างออบเจกต์ **`ReferenceGrant`** เพื่อให้สิทธิ์อย่างชัดเจน ป้องกันการลักลอบดักทราฟฟิกข้ามโปรเจกต์"
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Ingress and Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress/) เพื่อเปรียบเทียบกับระบบเดิม\n* ศึกษา [Service Networking](https://kubernetes.io/docs/concepts/services-networking/service/) สำหรับการจัดเส้นทางระดับพอด\n* เยี่ยมชม [เว็บไซต์ทางการของ Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/) สำหรับรายการ Implementations ทั้งหมด"
      }
    ],
    "relatedLinks": [
      {
        "title": "Ingress Controllers (เกตเวย์ HTTP เดิม)",
        "targetType": "concepts",
        "targetPageId": "net-ingress-controllers",
        "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/ingress/"
      },
      {
        "title": "Service (การค้นพบบริการ)",
        "targetType": "concepts",
        "targetPageId": "net-service",
        "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/service/"
      },
      {
        "title": "Network Policies (ความปลอดภัยเครือข่าย)",
        "targetType": "concepts",
        "targetPageId": "net-network-policies",
        "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/network-policies/"
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
