/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/services-networking/service/
 */
(function (root) {
  const pageData = {
    "id": "net-service",
    "categoryId": "services-networking",
    "categoryTitle": "Services, Load Balancing, and Networking",
    "titleEn": "Service",
    "titleTh": "เซอร์วิส (Services) - กลไกค้นพบบริการและโหลดบาลานซ์ฉบับสมบูรณ์",
    "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/service/",
    "docsPath": "/docs/concepts/services-networking/service/",
    "diagram": {
      "src": "images/docs/services-routing-overview.svg",
      "caption": "สถาปัตยกรรม Service ClusterIP: การกระจาย Packet ผ่าน kube-proxy ไปยัง Pod Endpoints"
    },
    "lead": "Service เป็นวิธีที่เป็นนามธรรม (Abstraction) ในการเปิดเผยแอปพลิเคชันที่ทำงานบนชุดของ Pods ออกสู่ระบบเครือข่าย โดยให้ IP Address คงที่และชื่อ DNS เดียว แม้ว่าพอดเบื้องหลังจะถูกสร้างหรือทำลายอย่างต่อเนื่องก็ตาม",
    "sections": [
      {
        "id": "why-services",
        "headingEn": "Why Services? The Ephemeral Pod Problem",
        "headingTh": "ทำไมต้องมี Service? ปัญหาเรื่องอายุชั่วคราวของ Pod IP",
        "contentMarkdown": "พอดใน Kubernetes เป็นสิ่งที่มีอายุชั่วคราว (**Ephemeral Resources**) เมื่อพอดตายลงหรือถูกแทนที่ด้วย ReplicaSet/Deployment พอดใหม่ที่สร้างขึ้นมาจะได้ IP Address ชุดใหม่เสมอ\n\nปัญหานี้ทำให้เกิดคำถามสำคัญ: หากคุณมีชุดของ Backend Pods ที่ให้บริการแก่ Frontend Pods ภายในคลัสเตอร์ ตัว Frontend จะรู้ได้อย่างไรว่าจะต้องเชื่อมต่อไปยัง IP ใดในเมื่อ IP ของ Backend เปลี่ยนแปลงตลอดเวลา?\n\n**ทางออกคือ Kubernetes Service!**\nService จะสร้างจุดเชื่อมต่อคงที่ขึ้นมา (Virtual IP และชื่อ DNS) โดย Frontend จะส่ง Request มาที่ Service เสมอ จากนั้น Service จะทำหน้าที่ค้นหาและกระจาย Traffic (Load Balancing) ไปยัง Backend Pods ที่มีสุขภาพดีให้อัตโนมัติ โดยที่คุณไม่ต้องแก้ไขโค้ดของแอปพลิเคชันเลย"
      },
      {
        "id": "defining-a-service",
        "headingEn": "Defining a Service",
        "headingTh": "การประกาศสร้าง Service และตัวอย่าง YAML",
        "contentMarkdown": "ตัวอย่าง Manifest ด้านล่างแสดงการสร้าง Service ชื่อ `my-service` เพื่อส่งต่อคำขอบนพอร์ต 80 ไปยังพอร์ต 9376 ของพอดที่มีเลเบล `app.kubernetes.io/name: MyApp`:\n\n* `spec.ports[*].port`: หมายเลขพอร์ตที่ Service เปิดรับการเชื่อมต่อ\n* `spec.ports[*].targetPort`: หมายเลขพอร์ตจริงที่คอนเทนเนอร์ในพอดเปิดรับ (สามารถระบุเป็นตัวเลขหรือชื่อพอร์ต Named Port ก็ได้)\n* `spec.selector`: ตัวกำหนดเงื่อนไขในการจับคู่พอดที่จะเข้ามารับ Traffic",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "my-service.yaml",
            "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: my-service\nspec:\n  selector:\n    app.kubernetes.io/name: MyApp\n  ports:\n    - protocol: TCP\n      port: 80\n      targetPort: 9376"
          }
        ]
      },
      {
        "id": "service-types",
        "headingEn": "Service Types",
        "headingTh": "ประเภทของ Service ทั้ง 4 รูปแบบ (Service Types)",
        "contentMarkdown": "คุณสามารถกำหนดประเภทของ Service ผ่านฟิลด์ `.spec.type` เพื่อควบคุมขอบเขตการเข้าถึง:\n\n### 1. ClusterIP (ค่าเริ่มต้น - Default)\nเปิดเผย Service ด้วย IP เสมือนภายในคลัสเตอร์เท่านั้น (Internal IP) ทำให้เข้าถึงได้เฉพาะจากพอดหรือโหนดภายในคลัสเตอร์เดียวกัน เหมาะสำหรับ Backend APIs, ดาต้าเบส และ Internal Services ทั่วไป\n\n### 2. NodePort\nเปิดพอร์ตคงที่บน Worker Node ทุกเครื่องในคลัสเตอร์ (ช่วงพอร์ต **30000-32767**) ทำให้ผู้ใช้งานภายนอกคลัสเตอร์สามารถเรียกใช้บริการได้โดยส่งคำขอไปยัง `<NodeIP>:<NodePort>` โดย NodePort จะส่งต่อคำขอเข้าไปยัง ClusterIP เบื้องหลังอัตโนมัติ\n\n### 3. LoadBalancer\nสร้าง Network Load Balancer ภายนอกของ Cloud Provider (เช่น GCP Cloud Load Balancing, AWS NLB, Azure Load Balancer) ขึ้นมาให้อัตโนมัติ โดย Cloud Load Balancer จะส่ง Traffic ตรงมายังพอร์ตของ NodePort และ ClusterIP ตามลำดับ เหมาะสำหรับการเปิดแอปพลิเคชันสู่ Internet ในสภาพแวดล้อม Cloud\n\n### 4. ExternalName\nแมปชื่อ Service ไปยังค่า CNAME ภายนอก (เช่น `my.database.example.com`) โดยส่งคืน CNAME record ผ่าน CoreDNS โดยตรงโดยไม่มีการสร้าง Proxy หรือ IP เสมือนใดๆ"
      },
      {
        "id": "headless-services",
        "headingEn": "Headless Services (clusterIP: None)",
        "headingTh": "เฮดเลสเซอร์วิส (Headless Services)",
        "contentMarkdown": "ในบางกรณีที่คุณไม่ต้องการให้มี Load Balancing หรือ Virtual IP ส่วนกลาง แต่ต้องการให้ Client สามารถเชื่อมต่อไปยังพอดแต่ละตัวได้โดยตรง (เช่น Stateful Applications, Cassandra, Kafka หรือ Master-Worker Database Replication)\n\nคุณสามารถสร้าง **Headless Service** ได้โดยระบุค่า `spec.clusterIP: None`:\n* CoreDNS จะไม่คืนค่า Virtual ClusterIP แต่จะส่งคืนรายการ **DNS A/AAAA Records** ของ Pod IPs ทั้งหมดที่ตรงกับ Selector โดยตรง\n* ทำให้ Client สามารถเลือกเชื่อมต่อกับ Pod ตัวที่ต้องการได้เอง"
      },
      {
        "id": "service-discovery-dns",
        "headingEn": "Service Discovery and DNS Format",
        "headingTh": "การค้นพบบริการผ่านระบบ DNS (DNS Naming Format)",
        "contentMarkdown": "Kubernetes มาพร้อมกับ CoreDNS ในตัว ทำให้พอดสามารถเรียกหา Service ใดๆ ผ่านชื่อ DNS ได้อย่างสะดวกตามรูปแบบมาตรฐาน FQDN (Fully Qualified Domain Name):\n\n`<service-name>.<namespace>.svc.cluster.local`\n\n* **ภายใน Namespace เดียวกัน**: สามารถเรียกผ่านชื่อย่อได้ทันที เช่น `curl http://my-service`\n* **ข้าม Namespace ต่างกัน**: เรียกผ่านชื่อที่ระบุ Namespace เช่น `curl http://my-service.prod` หรือระบุ FQDN เต็มรูปแบบ"
      },
      {
        "id": "traffic-policies",
        "headingEn": "Traffic Policies: externalTrafficPolicy & internalTrafficPolicy",
        "headingTh": "นโยบายการกระจายทราฟฟิก (Traffic Policies)",
        "contentMarkdown": "ฟิลด์ `spec.externalTrafficPolicy` ควบคุมพฤติกรรมการส่งต่อแพ็กเก็ตที่มาจากภายนอก:\n* **Cluster (ค่าเริ่มต้น)**: โหนดที่ได้รับ Request สามารถส่งต่อ (Forward) แพ็กเก็ตไปยังพอดที่อยู่บนโหนดอื่นได้ เพื่อกระจายโหลดให้เท่ากัน ข้อเสียคือจะทำให้สูญเสีย Client Source IP ดั้งเดิม (ถูกทำ SNAT)\n* **Local**: โหนดที่ได้รับ Request จะส่งต่อแพ็กเก็ตไปยังพอดที่รันอยู่บนโหนดของตัวเองเท่านั้น หากโหนดนั้นไม่มีพอดที่ตรงกัน แพ็กเก็ตจะถูกดรอป ข้อดีคือรักษา **Client Source IP** ไว้ได้อย่างสมบูรณ์ และลด Network Hop ระหว่างโหนด"
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress/) สำหรับการทำ HTTP/HTTPS Path-based Routing ที่ Layer 7\n* ศึกษา [Gateway API](https://kubernetes.io/docs/concepts/services-networking/gateway/) มาตรฐานใหม่สำหรับการจัดการ Service Networking\n* ศึกษา [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) สำหรับควบคุมความปลอดภัยและการกรองทราฟฟิก"
      }
    ],
    "relatedLinks": [
      {
        "title": "Ingress Controllers (เกตเวย์ HTTP/HTTPS)",
        "targetType": "concepts",
        "targetPageId": "net-ingress-controllers",
        "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/ingress/"
      },
      {
        "title": "Network Policies (นโยบายไฟร์วอลล์พอด)",
        "targetType": "concepts",
        "targetPageId": "net-network-policies",
        "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/network-policies/"
      },
      {
        "title": "Connect Applications with Services (Task)",
        "targetType": "tasks",
        "targetPageId": "access-port-forward-services",
        "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/connecting-frontend-backend/"
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
