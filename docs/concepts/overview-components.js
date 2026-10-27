/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/overview/components/
 */
(function (root) {
  const pageData = {
    "id": "overview-components",
    "categoryId": "overview",
    "categoryTitle": "Overview",
    "titleEn": "Kubernetes Components",
    "titleTh": "ส่วนประกอบของ Kubernetes (Kubernetes Components)",
    "officialUrl": "https://kubernetes.io/docs/concepts/overview/components/",
    "docsPath": "/docs/concepts/overview/components/",
    "diagram": {
      "src": "images/docs/components-of-kubernetes.svg",
      "caption": "สถาปัตยกรรมและส่วนประกอบของคลัสเตอร์ Kubernetes (Control Plane และ Worker Nodes)"
    },
    "lead": "คลัสเตอร์ของ Kubernetes ประกอบด้วยเครื่องแม่ข่ายที่ทำงานร่วมกัน โดยแบ่งออกเป็นสองส่วนหลักคือ คอนโทรลเพลน (Control Plane) และโหนดคนงาน (Worker Nodes) ที่รัน Application Pods",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nคลัสเตอร์ Kubernetes ประกอบด้วย 2 ส่วนหลัก คือ **Control Plane** (สมองส่วนกลางที่คอยตัดสินใจและรักษาสถานะของระบบ) และ **Worker Nodes** (เครื่องที่ทำหน้าที่รัน Application Pods ตามคำสั่ง) โดยทั้งสองส่วนทำงานประสานกันผ่าน kube-apiserver และบันทึกสถานะทั้งหมดลงใน etcd\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **Control Plane Components**:\n  - `kube-apiserver`: ประตูหน้าบานเดียวที่รับคำสั่ง REST API และประสานงานทุกคอมโพเนนต์ สามารถขยายขนาดแบบ Scale-out ได้\n  - `etcd`: ฐานข้อมูล Distributed Key-Value ที่มีความสอดคล้องสูง (Consistent & HA) เก็บสถานะความจริงทั้งหมดของคลัสเตอร์\n  - `kube-scheduler`: ผู้จัดสรรและเลือกโหนดที่เหมาะสมที่สุดให้พอดใหม่ไปรัน โดยคำนึงถึง Resource Requests, Constraints, Affinity และ Taints\n  - `kube-controller-manager`: รวมลูปควบคุมต่างๆ เพื่อดูแลสถานะ เช่น Node Controller, Job Controller, EndpointSlice Controller\n  - `cloud-controller-manager`: ตัวเชื่อมต่อกับ Cloud Provider (Load Balancer, Routing, Storage)\n- **Worker Node Components**:\n  - `kubelet`: เอเจนต์บนโหนดที่คอยรับ PodSpec มารันผ่าน CRI และรายงานสถานะพอดกลับไปยัง API Server\n  - `kube-proxy`: จัดการกฎเครือข่าย (iptables/IPVS) สำหรับ Service ภายในโหนด\n  - `Container Runtime`: ซอฟต์แวร์ที่รันคอนเทนเนอร์จริง (เช่น containerd, CRI-O)\n- **Cluster Addons**: บริการเสริมที่จำเป็น เช่น CoreDNS (DNS ภายใน), Metrics Server และ Ingress Controller\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **Static Pods**: ในโหนด Control Plane มักรันคอมโพเนนต์หลักเป็น Static Pods อยู่ที่ไดเรกทอรี `/etc/kubernetes/manifests/` (kube-apiserver, etcd, kube-scheduler, kube-controller-manager)\n- **การวินิจฉัยปัญหา (Troubleshooting Matrix)**:\n  - Pod ค้าง `Pending`: เช็ก `kube-scheduler` (หรือดู Taints/Resource ขาด)\n  - คำสั่ง `kubectl` ไม่ตอบสนอง: เช็ก `kube-apiserver` และสุขภาพของ `etcd`\n  - Pod ไม่ยอมเริ่มรันบน Node หรือโหนดสถานะ `NotReady`: เช็กบริการ `kubelet` (`systemctl status kubelet`) และ Container Runtime\n- **คำสั่งสำคัญ**: `kubectl get componentstatuses` (หรือเช็ก Pods ใน `kube-system`: `kubectl get pods -n kube-system`)",
    "sections": [
      {
        "id": "control-plane-components",
        "headingEn": "Control Plane Components",
        "headingTh": "ส่วนประกอบของคอนโทรลเพลน (Control Plane Components)",
        "contentMarkdown": "คอมโพเนนต์ของ Control Plane มีหน้าที่ตัดสินใจภาพรวมของคลัสเตอร์ (เช่น การจัดตารางเวลาพอด) ตรวจจับและตอบสนองต่อเหตุการณ์ในคลัสเตอร์ (เช่น การสร้างพอดใหม่เมื่อมีพอดตายลง):\n\n* **kube-apiserver**:\n  เซิร์ฟเวอร์หลักที่เปิดให้บริการ Kubernetes HTTP API ทำหน้าที่เป็นประตูหน้า (Front-end) สำหรับ Control Plane ทุกคำสั่งจาก `kubectl` และคอมโพเนนต์อื่นๆ จะต้องคุยผ่าน API Server ทั้งหมด ได้รับการออกแบบให้สามารถขยายขนาดในแนวนอน (Scale-out) ได้หลายอินสแตนซ์\n\n* **etcd**:\n  ที่จัดเก็บข้อมูลแบบ Key-Value ที่มีความสอดคล้องสูง (Consistent) และพร้อมใช้งานสูง (HA) ใช้เป็นคลังข้อมูลหลักของคลัสเตอร์สำหรับบันทึกข้อมูลทุกอย่างของ Kubernetes (ควรสำรองข้อมูล etcd อย่างสม่ำเสมอในระบบ Production)\n\n* **kube-scheduler**:\n  คอยเฝ้ามองพอดที่สร้างใหม่แต่ยังไม่ได้ผูกเข้ากับโหนดใดๆ (`spec.nodeName` ยังว่างอยู่) จากนั้นจะทำการเลือกโหนดที่เหมาะสมที่สุดสำหรับพอดนั้น โดยพิจารณาจากปัจจัยต่างๆ เช่น Resource Requests/Limits, Hardware Constraints, Node Affinity, Taints & Tolerations\n\n* **kube-controller-manager**:\n  รันโปรเซสของคอนโทรลเลอร์ต่างๆ ที่คอยควบคุมให้สถานะจริง (Current State) ตรงกับสถานะที่ต้องการ (Desired State) ในทางตรรกะแล้วแต่ละคอนโทรลเลอร์เป็นโปรเซสแยกกัน แต่เพื่อลดความซับซ้อนจึงถูกคอมไพล์รวมอยู่ในไบนารีเดียว ประกอบด้วย:\n  * *Node Controller*: ตรวจจับและตอบสนองเมื่อโหนดหยุดทำงาน\n  * *Job Controller*: ดูแลพอดของ Job ที่รันจนเสร็จแล้วจบไป\n  * *EndpointSlice Controller*: สร้างความเชื่อมโยงระหว่าง Services และ Pods\n  * *ServiceAccount Controller*: สร้าง Default Accounts และ API Access Tokens สำหรับแต่ละ Namespace\n\n* **cloud-controller-manager** (ทางเลือก):\n  รวมตรรกะการควบคุมที่เชื่อมต่อกับ Cloud Provider ภายนอก (เช่น จัดการ Load Balancer ภายนอก, จัดการโหนดบน Cloud)"
      },
      {
        "id": "node-components",
        "headingEn": "Node Components",
        "headingTh": "ส่วนประกอบบนโหนดคนงาน (Worker Node Components)",
        "contentMarkdown": "โหนดคอมโพเนนต์จะทำงานอยู่บนทุกๆ โหนดในคลัสเตอร์ คอยดูแลพอดที่กำลังรันอยู่และจัดเตรียมสภาพแวดล้อมรันไทม์ของ Kubernetes:\n\n* **kubelet**:\n  เอเจนต์หลักที่ทำงานอยู่บนแต่ละโหนดในคลัสเตอร์ ทำหน้าที่ดูแลให้คอนเทนเนอร์ทำงานอยู่ในพอดอย่างถูกต้อง โดย Kubelet จะรับสเปกของ Pod (PodSpecs) ผ่านทางช่องทางต่างๆ (ส่วนใหญ่มาจาก API Server) และทำให้แน่ใจว่าคอนเทนเนอร์ที่อธิบายไว้ใน PodSpecs เหล่านั้นกำลังทำงานอยู่และมีสุขภาพดี\n\n* **kube-proxy** (ทางเลือก/ส่วนใหญ่ใช้งาน):\n  เน็ตเวิร์กพร็อกซีที่รันอยู่บนแต่ละโหนด คอยดูแลรักษากฎระบบเครือข่าย (Network Rules) บนโหนด (เช่น ผ่าน `iptables` หรือ `IPVS`) เพื่อให้สามารถสื่อสารกับพอดต่างๆ ผ่าน Kubernetes Service ทั้งจากภายในและภายนอกคลัสเตอร์ได้\n\n* **Container Runtime**:\n  ซอฟต์แวร์ที่รับผิดชอบการสั่งรันคอนเทนเนอร์จริง โดย Kubernetes รองรับ Container Runtime ใดๆ ก็ตามที่ปฏิบัติตามมาตรฐาน Kubernetes CRI (Container Runtime Interface) เช่น **containerd** หรือ **CRI-O**"
      },
      {
        "id": "addons",
        "headingEn": "Addons",
        "headingTh": "แอดออนเสริมการทำงานของคลัสเตอร์ (Cluster Addons)",
        "contentMarkdown": "Addons ใช้ฟีเจอร์และทรัพยากรของ Kubernetes เอง (เช่น DaemonSet, Deployment) เพื่อขยายความสามารถในการทำงานของคลัสเตอร์ โดยแอดออนส่วนใหญ่จะอยู่ใน Namespace `kube-system`:\n\n* **Cluster DNS** (จำเป็นในเกือบทุกคลัสเตอร์):\n  เซิร์ฟเวอร์ DNS ภายในคลัสเตอร์ (เช่น CoreDNS) คอยให้บริการค้นหาชื่อโดเมนและ IP ของ Services แก่คอนเทนเนอร์\n* **Web UI (Dashboard)**:\n  อินเทอร์เฟซบนเว็บสำหรับบริหารจัดการและแก้ปัญหาแอปพลิเคชันและคลัสเตอร์\n* **Container Resource Monitoring**:\n  เก็บบันทึก Time-series Metrics ของคอนเทนเนอร์ (เช่น CPU/Memory) ลงในฐานข้อมูลส่วนกลาง (เช่น Metrics Server, Prometheus)\n* **Cluster-level Logging**:\n  กลไกเก็บรวบรวม Log ของคอนเทนเนอร์ส่งไปยังศูนย์กลางจัดเก็บข้อมูล (เช่น Elasticsearch, Fluentd, Loki)"
      },
      {
        "id": "flexibility-in-architecture",
        "headingEn": "Flexibility in Architecture",
        "headingTh": "ความยืดหยุ่นในเชิงสถาปัตยกรรม (Flexibility in Architecture)",
        "contentMarkdown": "Kubernetes ออกแบบมาให้มีความยืดหยุ่นสูงในรูปแบบการ Deploy และจัดการส่วนประกอบต่างๆ โดยสามารถปรับเปลี่ยนสถาปัตยกรรมได้ตามความต้องการ:\n* ตั้งแต่คลัสเตอร์ขนาดเล็กสำหรับ Development (เช่น Minikube, Kind, k3s ที่รวมทุกคอมโพเนนต์บนเครื่องเดียว)\n* จนถึงคลัสเตอร์ระดับ Large-scale Production ข้ามหลาย Data Centers หรือ Multi-Cloud ที่แยก Control Plane ออกเป็น High Availability Nodes พร้อม etcd Cluster ภายนอก"
      }
    ],
    "relatedLinks": [
      {
        "title": "What is Kubernetes? (ภาพรวมของแพลตฟอร์ม)",
        "targetType": "concepts",
        "targetPageId": "overview-what-is-kubernetes",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/"
      },
      {
        "title": "Pods (ภาพรวมพอด)",
        "targetType": "concepts",
        "targetPageId": "workloads-pods",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/"
      },
      {
        "title": "Install and Set Up kubectl (การติดตั้งเครื่องมือ)",
        "targetType": "tasks",
        "targetPageId": "tools-install-kubectl",
        "officialUrl": "https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/"
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
