/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/services-networking/ingress/
 */
(function (root) {
  const pageData = {
    "id": "net-ingress-controllers",
    "categoryId": "services-networking",
    "categoryTitle": "Services, Load Balancing, and Networking",
    "titleEn": "Ingress",
    "titleTh": "อินเกรสส์ (Ingress) และตัวควบคุม Ingress Controllers",
    "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/ingress/",
    "docsPath": "/docs/concepts/services-networking/ingress/",
    "diagram": {
      "src": "images/docs/ingress-gateway-flow.svg",
      "caption": "สถาปัตยกรรม Ingress Gateway: การจัดเส้นทาง HTTP/HTTPS ข้าม Host และ Path ไปยัง Backend Services"
    },
    "lead": "Ingress ทำหน้าที่เป็น API Object ที่จัดการการเข้าถึงจากภายนอกคลัสเตอร์มายัง Services ภายใน โดยให้บริการจัดเส้นทางทราฟฟิก HTTP และ HTTPS (Layer 7 Routing), โหลดบาลานซ์, การถอดรหัส SSL/TLS Termination และการจัดการชื่อเสมือน (Name-based Virtual Hosting)",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nIngress ทำหน้าที่เป็นจุดรวมศูนย์การเข้าถึง (Application Gateway / Reverse Proxy) ที่ระดับ Layer 7 (HTTP/HTTPS) ช่วยให้สามารถใช้ Public IP หรือ Cloud Load Balancer เพียงตัวเดียว แต่สามารถกระจายคำขอไปยัง Services นับสิบตัวภายในคลัสเตอร์ตามชื่อโดเมน (Host) หรือเส้นทาง (Path) พร้อมทั้งทำหน้าที่ถอดรหัส SSL/TLS Termination\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **ต้องมี Ingress Controller เสมอ**: การสร้างออบเจกต์ Ingress เพียงอย่างเดียวจะไม่มีผลบังคับใช้ จำเป็นต้องมี Ingress Controller (เช่น `ingress-nginx`, Traefik, HAProxy, AWS ALB Controller) รันอยู่ในคลัสเตอร์เพื่อแปลงสเปกเป็นคอนฟิกจริง\n* **IngressClass**: ทรัพยากรที่ใช้เชื่อมโยง Ingress Object เข้ากับ Controller ที่ต้องการรับผิดชอบ ระบุผ่านฟิลด์ `spec.ingressClassName`\n* **รูปแบบกฎ Routing**:\n  * `Host-based (Name-based Virtual Hosting)`: คัดแยกตามโดเมน เช่น `api.example.com` vs `web.example.com`\n  * `Path-based (Fanout)`: คัดแยกตาม URI Path เช่น `/api` vs `/static` พร้อมระบุ `pathType` (`Prefix`, `Exact`, `ImplementationSpecific`)\n* **TLS Termination**: ติดตั้งใบรับรองผ่านบล็อก `spec.tls` โดยอ้างอิง Secret ชนิด `kubernetes.io/tls` (ต้องมีคีย์ `tls.crt` และ `tls.key`) เพื่อถอดรหัส HTTPS ก่อนส่งเป็น Plain HTTP เข้าพอด\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* คำสั่งสร้าง Ingress พื้นฐานผ่าน CLI:\n  `kubectl create ingress my-ing --class=nginx --rule=\"app.example.com/api*=backend-svc:8080\"`\n* โครงสร้าง YAML สำคัญที่ออกสอบบ่อย: ตรวจสอบความถูกต้องของ `rules.http.paths[*].backend.service.name` และ `port.number`\n* ตรวจสอบการทำงาน: ดู External IP/Host ด้วย `kubectl get ingress` และดูรายละเอียดกฎเส้นทางด้วย `kubectl describe ingress <name>`\n* ดีบักเมื่อ Ingress ไม่ส่งต่อทราฟฟิก: ตรวจสอบ Log ของ Controller ด้วย `kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -f`",
    "sections": [
      {
        "id": "what-is-ingress",
        "headingEn": "What is Ingress?",
        "headingTh": "Ingress คืออะไรและทำหน้าที่อย่างไร?",
        "contentMarkdown": "ในสถาปัตยกรรมเครือข่ายของ Kubernetes นั้น Service ชนิด `NodePort` หรือ `LoadBalancer` จะทำงานที่ระดับ **Transport Layer (Layer 4 TCP/UDP)** โดยการสร้าง LoadBalancer ภายนอกจะผูกติดกับ 1 Service ต่อ 1 External IP เสมอ ซึ่งทำให้สิ้นเปลืองค่าใช้จ่ายคลาวด์และจัดการใบรับรอง SSL/TLS ได้ยากเมื่อระบบมีหลายสิบไมโครเซอร์วิส\n\n**Ingress** เข้ามาทำหน้าที่เป็นจุดรวมศูนย์การเข้าถึง (Application Gateway / Reverse Proxy) ที่ระดับ **Application Layer (Layer 7 HTTP/HTTPS)** ซึ่งเปิดโอกาสให้คุณใช้ Public IP หรือ Cloud Load Balancer เพียงตัวเดียว แต่สามารถกระจายคำขอไปยัง Services นับสิบตัวภายในคลัสเตอร์ได้อย่างชาญฉลาด โดยมีความสามารถหลักดังนี้:\n* **Host-based Routing (Name-based Virtual Hosting)**: คัดแยกคำขอตามชื่อโดเมน เช่น ส่ง `api.example.com` ไปยัง Service หนึ่ง และ `web.example.com` ไปยังอีก Service หนึ่ง\n* **Path-based Routing**: คัดแยกคำขอตาม URI Path เช่น ส่ง `/api/v1` ไปยัง Backend Service และ `/static` ไปยัง File Server\n* **TLS/SSL Termination**: ติดตั้งและถอดรหัส HTTPS ที่ Ingress Controller โดยตรง ทำให้ Pods ด้านในรับส่งเฉพาะ Plain HTTP ช่วยลดภาระการประมวลผลเข้ารหัสในแอปพลิเคชัน\n* **Content-based Load Balancing**: ปรับแต่งกฎการกระจายโหลด, การทำ Rate Limiting, และการ Rewrite URL ผ่าน Annotations"
      },
      {
        "id": "ingress-controllers",
        "headingEn": "Ingress Controllers Requirement",
        "headingTh": "ข้อกำหนดสำคัญ: จำเป็นต้องมี Ingress Controller",
        "contentMarkdown": "> [!WARNING]\n> **สำคัญมาก**: การสร้างออบเจกต์ Ingress เพียงอย่างเดียวจะไม่มีผลใดๆ ต่อระบบเครือข่าย! คุณจำเป็นต้องติดตั้ง **Ingress Controller** ให้พร้อมทำงานอยู่ในคลัสเตอร์เสมอ จึงจะมีการสร้างหรือคอนฟิก Reverse Proxy จริงขึ้นมารองรับทราฟฟิก\n\nIngress Controller คือ Control Loop Daemon ที่คอยเฝ้าติดตาม Kubernetes API Server เมื่อมีออบเจกต์ Ingress ถูกสร้างหรือแก้ไข ตัว Controller จะแปลงสเปกของ Ingress ให้เป็นคอนฟิกของ Reverse Proxy และอัปเดตให้อัตโนมัติทันที ตัวอย่าง Ingress Controllers ยอดนิยมได้แก่:\n* **ingress-nginx**: ตัวควบคุม Ingress มาตรฐานที่ดูแลโดย Kubernetes Community (ขับเคลื่อนด้วย NGINX)\n* **Traefik Ingress Controller**: ทันสมัย รองรับ Let's Encrypt อัตโนมัติ และ Middleware ที่ยืดหยุ่น\n* **HAProxy Ingress**: เหมาะสำหรับระบบที่ต้องการ Throughput และประสิทธิภาพการทำ Concurrency สูงมาก\n* **Cloud Provider Controllers**: เช่น AWS Load Balancer Controller (สร้าง AWS ALB) หรือ GKE Ingress Controller (สร้าง Google Cloud External HTTP(S) Load Balancer)"
      },
      {
        "id": "ingress-class-concept",
        "headingEn": "The IngressClass Resource",
        "headingTh": "การระบุคลาสของอินเกรส (IngressClass)",
        "contentMarkdown": "ในคลัสเตอร์ขนาดใหญ่ มักมี Ingress Controller ทำงานร่วมกันมากกว่าหนึ่งตัว เช่น ตัวหนึ่งใช้รับทราฟฟิกภายนอก (Internet-facing NGINX) และอีกตัวใช้สำหรับเครือข่ายภายในองค์กรเท่านั้น (Internal VPN Gateway)\n\nKubernetes ใช้ทรัพยากรชื่อ **`IngressClass`** เป็นตัวเชื่อมโยงระหว่าง Ingress Object กับ Ingress Controller ที่ต้องการให้รับผิดชอบ โดยในตัว Ingress จะระบุฟิลด์ `spec.ingressClassName` เพื่อเลือกคลาสที่ต้องการ:\n\n```yaml\napiVersion: networking.k8s.io/v1\nkind: IngressClass\nmetadata:\n  name: nginx-external\nspec:\n  controller: k8s.io/ingress-nginx\n```\n\nหากคลัสเตอร์มี IngressClass ที่ตั้งค่า Annotation `ingressclass.kubernetes.io/is-default-class: \"true\"` Ingress ที่ไม่ได้ระบุ `ingressClassName` จะถูกส่งต่อไปให้ Ingress Controller ตัวที่เป็น Default จัดการอัตโนมัติ"
      },
      {
        "id": "types-of-ingress",
        "headingEn": "Types of Ingress Routing Rules",
        "headingTh": "รูปแบบการกำหนดกฎ Ingress (Routing Rules)",
        "contentMarkdown": "Ingress รองรับการจัดเส้นทางหลักๆ 3 รูปแบบ:\n\n### 1. Single Service Ingress\nส่งทราฟฟิกทั้งหมดที่เข้ามายัง Ingress ตัวนี้ตรงไปยัง Service เบื้องหลังเพียงตัวเดียว โดยไม่ต้องระบุกฎ Hosts หรือ Paths ใดๆ เหมาะสำหรับการทำ SSL Termination และรับ Traffic เข้าแอปตัวเดียว\n\n### 2. Path-based Routing (Fanout)\nกระจายทราฟฟิกที่ส่งมายังโดเมนเดียวกัน แต่มี URI Path ต่างกันไปยัง Services ที่ต่างกัน เช่น:\n* `example.com/foo` -> ส่งไปที่ `service1`\n* `example.com/bar` -> ส่งไปที่ `service2`\n\nโดยแต่ละ Path จะต้องกำหนด `pathType` ซึ่งมี 3 ประเภท:\n* `Exact`: ตรงกับ Path ทุกตัวอักษรและคำนึงถึง Case-sensitive\n* `Prefix`: ตรงกับคำขึ้นต้นของ Path คั่นด้วย `/` (เช่น `/foo` จะตรงกับ `/foo/orders` และ `/foo/items`)\n* `ImplementationSpecific`: ขึ้นอยู่กับการตีความของ Ingress Controller แต่ละค่าย\n\n### 3. Name-based Virtual Hosting\nส่งต่อทราฟฟิกโดยตรวจสอบ HTTP `Host` Header ไปยัง Backend Services ที่ต่างกัน เช่น:\n* `foo.example.com` -> ส่งไปที่ `service-foo`\n* `bar.example.com` -> ส่งไปที่ `service-bar`"
      },
      {
        "id": "tls-termination",
        "headingEn": "TLS Termination and Secrets",
        "headingTh": "การรักษาความปลอดภัยด้วย TLS/HTTPS Termination",
        "contentMarkdown": "คุณสามารถเปิดใช้งาน HTTPS บน Ingress ได้โดยกำหนดบล็อก `spec.tls` ซึ่งจะต้องอ้างอิงไปยัง Kubernetes Secret ที่บรรจุ **TLS Private Key** และ **Certificate (CRT)**:\n\n* Secret ชนิด `kubernetes.io/tls` จะต้องมีคีย์ `tls.crt` และ `tls.key`\n* ตัว Ingress Controller จะโหลด Certificate นี้ขึ้นมาเพื่อทำ SSL Handshake กับ Client และส่งต่อข้อมูลที่ถอดรหัสแล้วเข้าสู่ Pods ภายในคลัสเตอร์\n* หากมีหลายโดเมน สามารถระบุรายการ `hosts` ภายใต้แต่ละ `secretName` หรือใช้ Wildcard Certificate (`*.example.com`) ได้"
      },
      {
        "id": "manifest-and-cli",
        "headingEn": "Practical Ingress Manifest and kubectl Commands",
        "headingTh": "ตัวอย่าง Manifest ฉบับสมบูรณ์และคำสั่ง kubectl",
        "contentMarkdown": "ตัวอย่างไฟล์คอนฟิก Ingress ที่รวมทั้ง Host-based, Path-based และ TLS Termination ไว้ในออบเจกต์เดียว:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "complete-ingress.yaml",
            "code": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: app-ingress\n  annotations:\n    nginx.ingress.kubernetes.io/rewrite-target: /$2\n    nginx.ingress.kubernetes.io/ssl-redirect: \"true\"\nspec:\n  ingressClassName: nginx\n  tls:\n  - hosts:\n    - myapp.example.com\n    secretName: myapp-tls-cert\n  rules:\n  - host: myapp.example.com\n    http:\n      paths:\n      - path: /api(/|$)(.*)\n        pathType: ImplementationSpecific\n        backend:\n          service:\n            name: backend-api-service\n            port:\n              number: 8080\n      - path: /()(.*)\n        pathType: ImplementationSpecific\n        backend:\n          service:\n            name: frontend-web-service\n            port:\n              number: 80"
          },
          {
            "lang": "bash",
            "label": "คำสั่ง kubectl ที่ใช้งานบ่อย",
            "code": "# ตรวจสอบรายการ Ingress และ External Address (IP/Host)\nkubectl get ingress\n\n# ดูรายละเอียดและการจัดเส้นทางของ Ingress\nkubectl describe ingress app-ingress\n\n# ดูบันทึกการทำงานของ Ingress Controller เมื่อมีข้อผิดพลาด\nkubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -f"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Gateway API](https://kubernetes.io/docs/concepts/services-networking/gateway/) มาตรฐานรุ่นถัดไปที่ออกแบบมาแทนที่ Ingress\n* ศึกษา [Service Networking](https://kubernetes.io/docs/concepts/services-networking/service/) สำหรับการตั้งค่า ClusterIP และ NodePort เบื้องหลัง\n* ศึกษา [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) เพื่อจำกัดการเข้าถึงระหว่าง Ingress Controller และ Pods"
      }
    ],
    "relatedLinks": [
      {
        "title": "Service (เซอร์วิสและการค้นพบบริการ)",
        "targetType": "concepts",
        "targetPageId": "net-service",
        "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/service/"
      },
      {
        "title": "Gateway API (เกตเวย์เอพีไอ)",
        "targetType": "concepts",
        "targetPageId": "net-gateway-api",
        "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/gateway/"
      },
      {
        "title": "Network Policies (นโยบายเครือข่าย)",
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
