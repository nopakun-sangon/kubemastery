/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/
 */
(function (root) {
  const pageData = {
    "id": "arch-control-plane-node-comm",
    "categoryId": "architecture",
    "categoryTitle": "Cluster Architecture",
    "titleEn": "Communication between Nodes and the Control Plane",
    "titleTh": "การสื่อสารระหว่าง Control Plane และ Worker Nodes",
    "officialUrl": "https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/",
    "docsPath": "/docs/concepts/architecture/control-plane-node-communication/",
    "diagram": {
      "src": "images/docs/components-of-kubernetes.svg",
      "caption": "เส้นทางการเชื่อมต่อเครือข่ายระหว่าง Control Plane (kube-apiserver) และ Worker Nodes (kubelet)"
    },
    "lead": "เอกสารนี้อธิบายเส้นทางการสื่อสารผ่านเครือข่ายระหว่าง Control Plane (โดยเฉพาะ kube-apiserver) และ Worker Nodes โดยครอบคลุมทั้งการเชื่อมต่อจาก Node ไปยัง Control Plane และจาก Control Plane ไปยัง Node พร้อมทั้งมาตรการรักษาความปลอดภัย",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nการสื่อสารระหว่าง Control Plane และ Worker Nodes ถูกออกแบบมาเพื่อความมั่นคงปลอดภัยสูงสุด โดยแบ่งเป็น 2 ทิศทางหลัก: **Node สู่ Control Plane** (วิ่งเข้าหา API Server ผ่าน HTTPS พอร์ต 6443 เสมอ) และ **Control Plane สู่ Node** (API Server ต่อไปยัง Kubelet พอร์ต 10250 เพื่อดึง Logs/Exec หรือผ่าน Konnectivity Tunnel)\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **Node-to-Control-Plane**:\n  - จุดรับการเชื่อมต่อจุดเดียวคือ `kube-apiserver` (HTTPS/TLS)\n  - Kubelet ยืนยันตัวตนด้วย X.509 Client Certificate และได้รับสิทธิ์ผ่าน Node Authorizer\n  - พอดภายในคลัสเตอร์สามารถต่อหา API Server ได้ผ่าน Service พิเศษชื่อ `kubernetes` ในเนมสเปซ `default` ร่วมกับ ServiceAccount Token\n- **Control-Plane-to-Node**:\n  - `kube-apiserver` เชื่อมต่อหา Kubelet โดยตรงที่พอร์ต `10250` (HTTPS) เมื่อมีคำสั่ง `kubectl logs`, `exec`, `attach` หรือ `port-forward`\n  - หากเครือข่ายระหว่าง Control Plane กับ Node เป็นเครือข่ายสาธารณะ แนะนำให้ใช้ **Konnectivity Service** (TCP Tunnel ผ่าน SSH/gRPC Proxy) เพื่อความปลอดภัย\n- **การเข้าถึง etcd**: etcd จะต้องคุยกับ `kube-apiserver` ผ่าน mTLS เท่านั้น และต้องไม่มีการเปิดให้ Worker Node หรือ Pods ภายนอกเข้าถึงโดยเด็ดขาด\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **การแก้ปัญหา `kubectl exec / logs` ล้มเหลว**: หากได้ข้อผิดพลาด `Connection refused` หรือ `x509: certificate signed by unknown authority` ให้ตรวจเช็ก:\n  1. Kubelet ทำงานปกติและเปิดพอร์ต 10250 หรือไม่\n  2. ไฟร์วอลล์ระหว่าง Control Plane กับ Worker Node อนุญาตพอร์ต 10250 หรือไม่\n  3. ใบรับรอง Kubelet Server Certificate ถูกต้องและผ่านการ Approve CSR แล้วหรือไม่\n- **ServiceAccount Token**: พอดคุยกับ API Server ผ่านพาธ `/var/run/secrets/kubernetes.io/serviceaccount/token` และตรวจสอบ CA ที่ `ca.crt`",
    "sections": [
      {
        "id": "node-to-control-plane",
        "headingEn": "Node to Control Plane Communication",
        "headingTh": "การเชื่อมต่อจาก Worker Node สู่ Control Plane",
        "contentMarkdown": "Kubernetes ใช้สถาปัตยกรรมเครือข่ายแบบ **Hub-and-Spoke (ศูนย์กลางและก้านล้อ)** โดยทราฟฟิกทั้งหมดที่มาจาก Worker Nodes จะต้องสิ้นสุดการเชื่อมต่อที่ **`kube-apiserver`** เพียงจุดเดียวเสมอ โหนดจะไม่สื่อสารกับคอมโพเนนต์อื่นของ Control Plane (เช่น etcd, scheduler หรือ controller-manager) โดยตรง\n\n### กลไกความปลอดภัยของการเชื่อมต่อ:\n* **การเข้ารหัสด้วย TLS**: การเชื่อมต่อทั้งหมดจากโหนดไปยัง API Server จะวิ่งผ่าน HTTPS ที่ปลอดภัย โดยมีการตรวจสอบความถูกต้องของใบรับรอง CA ประจำคลัสเตอร์\n* **การระบุตัวตน (Authentication)**: ตัว Kubelet บนโหนดจะยืนยันตัวตนด้วย **Client Certificate** ที่ระบุว่าโหนดนั้นอยู่ในกลุ่ม `system:nodes` และมีชื่อผู้ใช้ในรูปแบบ `system:node:<nodeName>` หรือใช้ Bootstrap Token สำหรับโหนดที่เพิ่งเข้าร่วมคลัสเตอร์ใหม่\n* **พอร์ตมาตรฐาน**: `kube-apiserver` จะรอรับการเชื่อมต่อที่ปลอดภัยผ่านพอร์ต HTTPS (ค่าเริ่มต้นคือพอร์ต 6443)"
      },
      {
        "id": "node-authorizer-and-admission",
        "headingEn": "Node Authorizer and NodeRestriction",
        "headingTh": "การจำกัดสิทธิ์ของโหนดด้วย Node Authorizer และ NodeRestriction",
        "contentMarkdown": "เพื่อป้องกันไม่ให้โหนดที่มีช่องโหว่หรือถูกแฮกเกอร์โจมตีสามารถดึงข้อมูลของโหนดอื่น หรือแก้ไขทรัพยากรนอกเหนือขอบเขตของตนเองได้ Kubernetes ได้ออกแบบกลไกความปลอดภัย 2 ชั้น:\n\n### 1. Node Authorizer (โหมดการอนุญาตสิทธิ์ระดับโหนด)\n* ทำหน้าที่ตรวจสอบว่าคำขออ่าน/เขียนที่ส่งมาจาก Kubelet (`system:nodes`) เกี่ยวข้องกับพอดที่ได้รับมอบหมายให้รันอยู่บนโหนดของตนเองเท่านั้น\n* ป้องกันไม่ให้ Kubelet บนโหนด A สามารถอ่าน Secret, ConfigMap หรือ PersistentVolume ของพอดที่ทำงานอยู่บนโหนด B ได้\n\n### 2. NodeRestriction Admission Plugin\n* ควบคุมไม่ให้ Kubelet สามารถแก้ไขหรือเขียนทับ Label สำคัญบางตัวบน Node Object ของตนเองได้ เช่น Label ที่ระบุว่าตนเองเป็น Control Plane (`node-role.kubernetes.io/control-plane`) หรือ Label ด้านการแยกส่วนความปลอดภัย (Security Isolation)"
      },
      {
        "id": "control-plane-to-node",
        "headingEn": "Control Plane to Node Communication",
        "headingTh": "การเชื่อมต่อจาก Control Plane ไปยัง Node",
        "contentMarkdown": "มี 2 เส้นทางการเชื่อมต่อหลักจาก Control Plane (kube-apiserver) ส่งกลับไปยัง Worker Nodes:\n\n### 1. จาก kube-apiserver ไปยัง Kubelet Process\n* เป็นการเชื่อมต่อผ่าน **HTTPS Endpoint ของ Kubelet** ซึ่งโดยทั่วไปจะรับฟังอยู่ที่พอร์ต **10250** บนแต่ละ Worker Node\n* ใช้สำหรับการสั่งการแบบ Interactive และการดึงข้อมูลเพื่อการวินิจฉัยปัญหา ได้แก่:\n  * การดึง Log ของพอด (`kubectl logs`)\n  * การเปิดหน้าต่าง Shell หรือสั่งคำสั่งเข้าไปในคอนเทนเนอร์ (`kubectl exec`)\n  * การเชื่อมต่อ Attach เข้ากับโปรเซสของคอนเทนเนอร์ (`kubectl attach`)\n  * การทำ Port Forwarding (`kubectl port-forward`)\n\n### 2. จาก kube-apiserver ไปยัง Nodes, Pods, และ Services โดยตรง\n* การเชื่อมต่อประเภทนี้ (เช่น การทดสอบ Webhook หรือพร็อกซีไปยัง Service IP) ตามค่าเริ่มต้นจะวิ่งผ่านเครือข่ายธรรมดา ซึ่งอาจไม่ได้รับการเข้ารหัส TLS ดังนั้นจึงต้องระมัดระวังเป็นพิเศษหากเครือข่ายคลัสเตอร์เชื่อมต่อข้าม Public Internet"
      },
      {
        "id": "apiserver-operations",
        "headingEn": "API Server Operations: logs, exec, attach, and port-forward",
        "headingTh": "การทำงานของคำสั่ง Logs, Exec, Attach และ Port-Forward",
        "contentMarkdown": "เมื่อผู้ใช้สั่งรันคำสั่ง `kubectl exec -it <pod> -- /bin/sh` หรือ `kubectl logs <pod>` การสื่อสารจะดำเนินไปตามขั้นตอนดังนี้:\n\n1. ไคลเอนต์ `kubectl` ส่งคำขอ HTTP Upgrade (WebSocket/SPDY) ไปยัง `kube-apiserver`\n2. `kube-apiserver` ตรวจสอบสิทธิ์ (Authentication & RBAC) ของผู้ใช้\n3. เมื่อผ่านการตรวจสอบ `kube-apiserver` จะเปิดการเชื่อมต่อ HTTPS ไปยังพอร์ต 10250 ของ Kubelet บนโหนดที่พอดนั้นสังกัดอยู่\n4. Kubelet จะสื่อสารกับ Container Runtime (เช่น containerd ผ่าน CRI) เพื่อเชื่อมต่อสตรีม stdin, stdout, stderr หรือเปิด Streaming Server\n5. สตรีมข้อมูลจะถูกส่งกลับย้อนทวนทางมายังหน้าจอ Terminal ของผู้ใช้แบบเรียลไทม์\n\n> [!NOTE]\n> หากไฟร์วอลล์บล็อกพอร์ต 10250 ระหว่างเครื่อง Control Plane และ Worker Node คำสั่ง `kubectl logs` และ `kubectl exec` จะเกิดข้อผิดพลาด Timeout หรือ Connection Refused ทันที"
      },
      {
        "id": "konnectivity-and-tunnels",
        "headingEn": "Konnectivity Service and SSH Tunnels",
        "headingTh": "การรักษาความปลอดภัยข้ามเครือข่ายด้วย Konnectivity Service",
        "contentMarkdown": "ในสภาพแวดล้อมที่ Control Plane และ Worker Nodes อยู่ในเครือข่ายแยกกันคนละวง หรือโหนดอยู่หลังไฟร์วอลล์/NAT ส่วนตัว (เช่น Managed Kubernetes Services บน Cloud) การที่ Control Plane จะเริ่มการเชื่อมต่อ (Initiate connection) ตรงไปยังโหนดอาจทำไม่ได้โดยตรง\n\nKubernetes ได้พัฒนาบริการ **Konnectivity Service** (เข้ามาทดแทน SSH Tunnels แบบเดิม) เพื่อแก้ไขปัญหานี้:\n\n* **Konnectivity Server**: รันอยู่ฝั่ง Control Plane\n* **Konnectivity Agent**: รันอยู่บน Worker Nodes แต่ละเครื่องเป็น DaemonSet\n* **หลักการทำงาน (Egress Selector)**: ตัว Konnectivity Agent บนโหนดจะเป็นผู้เริ่มสร้างการเชื่อมต่อออกไปหา Konnectivity Server บน Control Plane ก่อน (Outbound Connection) และคงสถานะของอุโมงค์ TCP (Tunnel) เอาไว้ เมื่อ Control Plane ต้องการส่งคำขอไปยัง Kubelet (เช่น logs หรือ exec) มันจะส่งผ่านอุโมงค์นี้กลับลงมาอย่างปลอดภัย โดยไม่ต้องเปิดพอร์ตรับการเชื่อมต่อจากภายนอกบน Worker Node"
      },
      {
        "id": "security-recommendations",
        "headingEn": "Security Recommendations and Best Practices",
        "headingTh": "คำแนะนำและแนวทางปฏิบัติด้านความปลอดภัย",
        "contentMarkdown": "ข้อพึงระวังและแนวทางปรับแต่งเพื่อเพิ่มความปลอดภัยระดับสูงให้กับคลัสเตอร์:\n\n* **เปิดใช้งาน Kubelet Authentication & Authorization**: ห้ามเปิดพอร์ต 10250 เป็นแบบ Anonymous (`--anonymous-auth=false`) และต้องเปิดโหมดตรวจสอบสิทธิ์ `--authorization-mode=Webhook` เพื่อให้ Kubelet ยืนยันสิทธิ์ของ API Server ทุกครั้ง\n* **ตั้งค่าใบรับรอง Kubelet Certificate Rotation**: เปิดใช้งานฟีเจอร์หมุนเวียนใบรับรองอัตโนมัติ เพื่อป้องกันใบรับรองของโหนดหมดอายุกลางคัน\n* **แยกวงเครือข่าย Control Plane**: ใช้ Private Subnet หรือ Private Endpoint สำหรับ API Server และปิดการเข้าถึงจาก Public Internet เว้นแต่จะเชื่อมต่อผ่าน VPN หรือ Bastion Host"
      }
    ],
    "relatedLinks": [
      {
        "title": "Nodes in Kubernetes (สถาปัตยกรรมโหนด)",
        "targetType": "concepts",
        "targetPageId": "arch-nodes",
        "officialUrl": "https://kubernetes.io/docs/concepts/architecture/nodes/"
      },
      {
        "title": "Kubernetes Components (คอมโพเนนต์ของระบบ)",
        "targetType": "concepts",
        "targetPageId": "overview-components",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/components/"
      },
      {
        "title": "Securing a Cluster (ความปลอดภัยคลัสเตอร์)",
        "targetType": "concepts",
        "targetPageId": "sec-service-accounts-rbac",
        "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/securing-a-cluster/"
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
