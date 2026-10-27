/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
 */
(function (root) {
  const pageData = {
    "id": "net-dns-pod-service",
    "categoryId": "services-networking",
    "categoryTitle": "Services, Load Balancing, and Networking",
    "titleEn": "DNS for Services and Pods",
    "titleTh": "ระบบ DNS สำหรับเซอร์วิสและพอด (DNS for Services and Pods)",
    "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/",
    "docsPath": "/docs/concepts/services-networking/dns-pod-service/",
    "diagram": {
      "src": "images/docs/services-routing-overview.svg",
      "caption": "ระบบค้นพบบริการผ่าน DNS: พอดเรียกคำขอผ่านชื่อ FQDN ไปยัง CoreDNS เพื่อแปลงเป็น IP ของ Service หรือ Pod"
    },
    "lead": "Kubernetes จัดเตรียมระบบ DNS ภายในคลัสเตอร์ (ขับเคลื่อนโดย CoreDNS) เพื่อทำ Service Discovery โดยอัตโนมัติ ทำให้คอนเทนเนอร์สามารถเชื่อมต่อหากันผ่านชื่อโดเมนคงที่ (Fully Qualified Domain Name - FQDN) แทนที่จะต้องบันทึกหรือค้นหา IP Address ที่เปลี่ยนแปลงตลอดเวลา",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nระบบ DNS ภายใน Kubernetes (ขับเคลื่อนโดย CoreDNS) ทำหน้าที่ค้นพบบริการ (Service Discovery) อัตโนมัติ โดยแปลงชื่อโดเมนคงที่ (FQDN) ให้กลายเป็น IP Address ของ Service หรือ Pod ช่วยให้คอนเทนเนอร์สามารถเชื่อมต่อหากันได้สะดวกโดยไม่ต้องบันทึกหรือค้นหา IP ที่เปลี่ยนแปลงตลอดเวลา\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **โครงสร้าง FQDN มาตรฐานของ Service**: `<service-name>.<namespace>.svc.<cluster-domain>` (เช่น `my-svc.prod.svc.cluster.local`)\n  * ถ้าอยู่ใน Namespace เดียวกัน: เรียกผ่านชื่อสั้นได้ทันที เช่น `curl http://my-svc`\n  * ถ้าอยู่ข้าม Namespace: เรียกผ่าน `<service-name>.<namespace>` เช่น `curl http://my-svc.prod`\n* **Headless Service DNS**: CoreDNS จะส่งคืนรายการ A Records ของ Pod IPs ทั้งหมดที่ตรงกับ Selector โดยตรงเพื่อทำ Client-side Load Balancing\n* **DNS Record สำหรับ Pod**: มีรูปแบบ `<pod-ip-with-dashes>.<namespace>.pod.cluster.local` (เช่น `10-244-1-5.default.pod.cluster.local`)\n* **Hostname และ Subdomain**: หากตั้ง `spec.hostname` และ `spec.subdomain` (ตรงกับ Headless Service) พอดจะได้ชื่อเฉพาะ เช่น `web-0.nginx.default.svc.cluster.local` ซึ่งเป็นกลไกหลักของ StatefulSet\n* **นโยบาย dnsPolicy**: `ClusterFirst` (ค้นหา CoreDNS ในคลัสเตอร์ก่อน - ค่าเริ่มต้น), `Default` (ใช้ DNS ของ Host Node), `None` (กำหนดรายละเอียด `dnsConfig` เอง)\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* รัน Pod ชั่วคราวเพื่อทดสอบคำสั่ง nslookup และ dig:\n  `kubectl run -i --tty --rm debug-dns --image=busybox:1.28 --restart=Never -- nslookup kubernetes.default`\n* แนวทางแก้ปัญหาเมื่อพอดค้นหา DNS ไม่เจอ:\n  1. ตรวจสอบสถานะ Pod ของ CoreDNS: `kubectl get pods -n kube-system -l k8s-app=kube-dns`\n  2. ตรวจสอบว่า Service kube-dns มี Endpoints ครบ: `kubectl get endpoints -n kube-system kube-dns`\n  3. ตรวจสอบไฟล์ `/etc/resolv.conf` ภายในพอดว่าชี้ไปยัง Nameserver ของ CoreDNS ถูกต้องหรือไม่",
    "sections": [
      {
        "id": "how-kubernetes-dns-works",
        "headingEn": "How Kubernetes DNS Architecture Works",
        "headingTh": "สถาปัตยกรรมและหลักการทำงานของ Kubernetes DNS",
        "contentMarkdown": "ทุกพอดที่ถูกสร้างขึ้นใน Kubernetes จะได้รับการกำหนดค่าเนมเซิร์ฟเวอร์ในไฟล์ `/etc/resolv.conf` โดยอัตโนมัติจาก kubelet โดยชี้ไปยัง Virtual IP ของเซอร์วิส CoreDNS (โดยทั่วไปจะตั้งอยู่ใน `kube-system` namespace เช่น IP `10.96.0.10`)\n\nเมื่อคอนเทนเนอร์ส่งคำขอค้นหาชื่อโฮสต์ เช่น `http://backend-api`:\n1. ตัว resolver ของระบบปฏิบัติการในพอดจะนำชื่อโฮสต์ไปค้นหาผ่าน DNS Server ของคลัสเตอร์\n2. CoreDNS จะตรวจสอบชื่อที่ร้องขอ หากตรงกับ Service หรือ Pod ภายในคลัสเตอร์ CoreDNS จะตอบกลับด้วย IP Address นั้นทันที\n3. หากเป็นชื่อโดเมนอินเทอร์เน็ตภายนอก (เช่น `google.com`) CoreDNS จะส่งต่อ (Forward) คำขอนั้นไปยัง Upstream DNS Server ของโฮสต์หรือคลาวด์โปรไวเดอร์"
      },
      {
        "id": "service-dns-records",
        "headingEn": "DNS Records for Services",
        "headingTh": "รูปแบบ DNS Records สำหรับ Services",
        "contentMarkdown": "Kubernetes สร้าง DNS Records สำหรับ Services ตามมาตรฐานดังนี้:\n\n### 1. A / AAAA Records (Standard ClusterIP Services)\nชื่อโดเมนเต็ม (FQDN) ของ Service จะมีโครงสร้างมาตรฐานคือ:\n`<service-name>.<namespace>.svc.<cluster-domain>`\n* ตัวอย่าง: `my-service.prod.svc.cluster.local`\n* **ภายใน Namespace เดียวกัน**: สามารถเรียกผ่านชื่อสั้นได้ทันที เช่น `my-service` เนื่องจาก search path ใน `/etc/resolv.conf` มี `<namespace>.svc.cluster.local` กำหนดไว้\n* **ข้าม Namespace**: สามารถเรียกด้วย `<service-name>.<namespace>` เช่น `my-service.prod`\n\n### 2. Headless Services (spec.clusterIP: None)\nสำหรับ Headless Service ที่ไม่มี ClusterIP นั้น CoreDNS จะส่งคืนรายการ **A Records หลายค่า** ซึ่งเป็น IP Address โดยตรงของ Pods ทั้งหมดที่ผ่านเงื่อนไข Selector ทำให้ Client สามารถทำ Client-side Load Balancing หรือเชื่อมต่อกับ Pod เฉพาะเจาะจงได้\n\n### 3. SRV Records (Named Ports)\nหาก Service มีการตั้งชื่อพอร์ต (`spec.ports[*].name`) CoreDNS จะสร้าง SRV Records ตามรูปแบบ:\n`_<port-name>._<protocol>.<service-name>.<namespace>.svc.<cluster-domain>`\nตัวอย่างเช่น `_http._tcp.my-service.default.svc.cluster.local` สำหรับการค้นหาทั้งหมายเลขพอร์ตและโปรโตคอล"
      },
      {
        "id": "pod-dns-records",
        "headingEn": "DNS Records for Pods",
        "headingTh": "รูปแบบ DNS Records สำหรับ Pods",
        "contentMarkdown": "นอกจาก Services แล้ว Pods แต่ละตัวยังสามารถมี DNS Record ของตนเองได้เช่นกัน:\n\n* **Pod A Record จาก IP**: มีรูปแบบคือ `<pod-ip-with-dashes>.<namespace>.pod.<cluster-domain>`\n  * ตัวอย่าง: พอดที่มี IP `172.17.0.3` ใน namespace `default` จะมีชื่อ DNS คือ `172-17-0-3.default.pod.cluster.local`\n\n* **Pod Hostname และ Subdomain**:\n  หากคุณกำหนดฟิลด์ `spec.hostname` และ `spec.subdomain` ใน Pod สเปก (โดยที่ `subdomain` ตรงกับชื่อของ Headless Service ใน Namespace เดียวกัน) พอดตัวนั้นจะได้ชื่อ DNS ที่มีความหมายและอ่านง่าย:\n  `<hostname>.<subdomain>.<namespace>.svc.<cluster-domain>`\n  รูปแบบนี้เป็นหัวใจสำคัญที่ทำให้ **StatefulSet** สามารถสร้างชื่อพอดที่คงที่ เช่น `web-0.nginx.default.svc.cluster.local`"
      },
      {
        "id": "pod-dns-policies-and-config",
        "headingEn": "Pod DNS Policies and dnsConfig",
        "headingTh": "นโยบาย DNS ของพอด (dnsPolicy) และการปรับแต่ง dnsConfig",
        "contentMarkdown": "คุณสามารถควบคุมพฤติกรรม DNS ของแต่ละพอดได้ผ่านฟิลด์ `spec.dnsPolicy`:\n\n* **`ClusterFirst` (ค่าเริ่มต้น)**: สอบถามชื่อ DNS กับ CoreDNS ของคลัสเตอร์ก่อน หากค้นหาไม่พบจึงส่งต่อไปยัง Upstream DNS\n* **`ClusterFirstWithHostNet`**: สำหรับพอดที่เปิดใช้งาน `hostNetwork: true` เพื่อให้ยังคงสามารถค้นหาชื่อ Service ภายในคลัสเตอร์ได้\n* **`Default`**: สืบทอดการตั้งค่า DNS มาจากโหนด (Node OS) โดยตรง ไม่ใช้ CoreDNS ของคลัสเตอร์\n* **`None`**: ละเลยการตั้งค่าอัตโนมัติทั้งหมด โดยต้องระบุรายละเอียดเนมเซิร์ฟเวอร์เองในบล็อก `dnsConfig`"
      },
      {
        "id": "manifest-and-troubleshooting",
        "headingEn": "Custom DNS Manifest and Troubleshooting Guide",
        "headingTh": "ตัวอย่าง Manifest และแนวทางตรวจสอบปัญหา DNS",
        "contentMarkdown": "ตัวอย่างการตั้งค่าพอดที่มี Hostname และ Custom DNS Options:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "pod-dns-custom.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: custom-dns-pod\n  namespace: default\nspec:\n  containers:\n  - name: test-app\n    image: busybox:1.28\n    command: ['sh', '-c', 'sleep 3600']\n  dnsPolicy: \"None\"\n  dnsConfig:\n    nameservers:\n      - 10.96.0.10\n      - 8.8.8.8\n    searches:\n      - default.svc.cluster.local\n      - svc.cluster.local\n      - cluster.local\n    options:\n      - name: ndots\n        value: \"2\"\n      - name: edns0"
          },
          {
            "lang": "bash",
            "label": "การทดสอบและดีบักระบบ DNS ในคลัสเตอร์",
            "code": "# รันพอดชั่วคราวเพื่อทดสอบคำสั่ง nslookup และ dig\nkubectl run -i --tty --rm debug-dns --image=busybox:1.28 --restart=Never -- nslookup kubernetes.default\n\n# ทดสอบการค้นหา Service เฉพาะเจาะจง\nkubectl run -i --tty --rm debug-dns --image=busybox:1.28 --restart=Never -- nslookup my-service.prod.svc.cluster.local\n\n# ตรวจสอบการทำงานของ CoreDNS Pods\nkubectl get pods -n kube-system -l k8s-app=kube-dns\nkubectl logs -n kube-system -l k8s-app=kube-dns -f"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Service Concepts](https://kubernetes.io/docs/concepts/services-networking/service/) สำหรับรายละเอียด ClusterIP และ Headless Services\n* ศึกษา [Debugging DNS Resolution](https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/) ขั้นตอนการแก้ปัญหาเมื่อพอด resolve โดเมนไม่ได้\n* ศึกษา [Customizing DNS Service](https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/) การปรับแต่ง CoreDNS Corefile"
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
        "title": "Ingress Controllers (เกตเวย์ HTTP)",
        "targetType": "concepts",
        "targetPageId": "net-ingress-controllers",
        "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/ingress/"
      },
      {
        "title": "Network Policies (นโยบายความปลอดภัยเครือข่าย)",
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
