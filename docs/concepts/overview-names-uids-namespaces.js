/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
 */
(function (root) {
  const pageData = {
    "id": "overview-names-uids-namespaces",
    "categoryId": "overview",
    "categoryTitle": "Overview",
    "titleEn": "Object Names and IDs",
    "titleTh": "ชื่อออบเจกต์, UIDs และเนมสเปซ (Object Names, UIDs & Namespaces)",
    "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/names/",
    "docsPath": "/docs/concepts/overview/working-with-objects/names/",
    "lead": "ทุกออบเจกต์ในคลัสเตอร์ Kubernetes จะต้องมีชื่อ (Name) ที่ไม่ซ้ำกันสำหรับประเภททรัพยากรนั้นในเนมสเปซเดียวกัน และมีรหัสระบุตัวตน UID ที่ระบบสร้างขึ้นเฉพาะตัวตลอดอายุขัย ส่วนเนมสเปซ (Namespaces) ทำหน้าที่แบ่งคลัสเตอร์ทางกายภาพออกเป็นคลัสเตอร์เสมือนหลายส่วนเพื่อการจัดการทรัพยากรและความปลอดภัย",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nออบเจกต์ทุกตัวใน Kubernetes ต้องมีชื่อ (**Name**) ที่ไม่ซ้ำกันในเนมสเปซเดียวกัน และมีรหัสเฉพาะสากล (**UID**) ตลอดอายุขัย ส่วน **Namespace** เปรียบเสมือนกำแพงแบ่งคลัสเตอร์ทางกายภาพออกเป็น \"คลัสเตอร์เสมือน\" หลายห้อง เพื่อจัดสรรสิทธิ์ (RBAC), โควตาทรัพยากร (ResourceQuota) และแบ่งแยกสภาพแวดล้อมอย่างปลอดภัย\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **Name vs UID**: Name ตั้งโดยผู้ใช้ (ต้องตรงตามมาตรฐาน DNS Subdomain/Label ความยาวไม่เกิน 253 หรือ 63 ตัวอักษร), UID สร้างโดยระบบด้วยรูปแบบ UUID ไม่ซ้ำกันตลอดกาลแม้จะลบแล้วสร้างชื่อเดิมใหม่\n- **4 เนมสเปซเริ่มต้นของระบบ**:\n  - `default`: พื้นที่เริ่มต้นสำหรับออบเจกต์ที่ไม่ได้ระบุเนมสเปซ\n  - `kube-system`: พื้นที่สำหรับคอมโพเนนต์ภายในของระบบ Kubernetes\n  - `kube-public`: พื้นที่สาธารณะที่สามารถอ่านได้โดยไม่ต้องล็อกอิน (เช่น ข้อมูลคลัสเตอร์)\n  - `kube-node-lease`: พื้นที่เก็บ Lease objects สำหรับ Heartbeat ของแต่ละโหนด\n- **DNS Resolution ข้ามเนมสเปซ**: พอดสามารถเรียกหา Service ข้ามเนมสเปซได้ด้วย FQDN: `<service-name>.<namespace>.svc.cluster.local` (ถ้าอยู่ในเนมสเปซเดียวกันเรียกแค่ `<service-name>` ได้เลย)\n- **ขอบเขตออบเจกต์**: บางออบเจกต์ผูกกับเนมสเปซ (Namespaced เช่น Pod, Service, ConfigMap) และบางออบเจกต์อยู่ระดับคลัสเตอร์ (Cluster-wide เช่น Node, PersistentVolume, Namespace, ClusterRole)\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **ข้อควรระวังในห้องสอบ**: ระวังลืมใส่ Flag `-n <namespace>` ข้อสอบมักสั่งให้สร้างหรือตรวจสอบใน Namespace เฉพาะ\n- **คำสั่งสำคัญ**:\n  - สร้างเนมสเปซ: `kubectl create ns <name>`\n  - สลับเนมสเปซดีฟอลต์ใน Context ปัจจุบัน: `kubectl config set-context --current --namespace=<name>`\n  - ตรวจสอบว่า Resource ใดเป็น Namespaced หรือ Cluster-scoped: `kubectl api-resources --namespaced=true` หรือ `--namespaced=false`\n  - ค้นหาในทุกเนมสเปซ: `kubectl get pods -A` หรือ `--all-namespaces`",
    "sections": [
      {
        "id": "object-names-and-uids",
        "headingEn": "Object Names and UIDs",
        "headingTh": "ชื่อออบเจกต์ (Name) และรหัสเฉพาะสากล (UID)",
        "contentMarkdown": "ทุกออบเจกต์ใน Kubernetes จะมีข้อมูลระบุตัวตน 2 ชนิดในฟิลด์ `metadata`:\n\n### 1. Object Name (ชื่อออบเจกต์)\n* กำหนดโดยผู้ใช้หรือ Client ในฟิลด์ `metadata.name` ในขณะสร้างออบเจกต์ หรือสร้างอัตโนมัติผ่าน `metadata.generateName` (ระบบจะเติมคำต่อท้ายแบบสุ่มให้)\n* **ขอบเขตความเฉพาะตัว (Uniqueness)**: ชื่อของออบเจกต์จะต้องไม่ซ้ำกัน (**Unique**) สำหรับออบเจกต์ประเภทเดียวกัน (`kind`) ภายในเนมสเปซเดียวกัน (`namespace`)\n* ตัวอย่าง: คุณไม่สามารถมี Pod ชื่อ `web-frontend` สองตัวในเนมสเปซ `production` พร้อมกันได้ แต่คุณสามารถมี Pod ชื่อ `web-frontend` ในเนมสเปซ `staging` และมี Service ชื่อ `web-frontend` ในเนมสเปซ `production` ได้เนื่องจากเป็นประเภททรัพยากรต่างกัน\n\n### 2. UID (Universally Unique Identifier)\n* สร้างขึ้นโดย Kubernetes Control Plane (kube-apiserver) ในฟิลด์ `metadata.uid` เมื่อออบเจกต์ถูกบันทึกสำเร็จ\n* เป็นค่า UUID รูปแบบมาตรฐาน (เช่น `ebf01037-ecf9-4b47-9759-9069d30c5e7b`)\n* **ขอบเขตความเฉพาะตัว**: การันตีความไม่ซ้ำกันตลอดกาลทั่วทั้งคลัสเตอร์ ข้ามกาลเวลาและพื้นที่ (Across time and space)\n* หากคุณลบออบเจกต์ชื่อ `web-frontend` ทิ้งไป แล้วสร้างออบเจกต์ใหม่ด้วยชื่อ `web-frontend` เดิม ออบเจกต์ใหม่จะได้รับ UID ตัวใหม่เสมอ ทำให้ระบบและคอนโทรลเลอร์สามารถแยกแยะความแตกต่างระหว่างออบเจกต์เดิมและออบเจกต์ใหม่ได้อย่างชัดเจน"
      },
      {
        "id": "name-constraints-and-dns",
        "headingEn": "Naming Constraints and Syntax Types",
        "headingTh": "ข้อกำหนดการตั้งชื่อและมาตรฐาน DNS Subdomain/Label",
        "contentMarkdown": "Kubernetes กำหนดกฎเกณฑ์และไวยากรณ์สำหรับชื่อออบเจกต์ เพื่อให้สอดคล้องกับมาตรฐานของโปรโตคอลระบบเครือข่ายและระบบไฟล์ โดยแบ่งข้อจำกัดออกเป็นรูปแบบหลักๆ ดังนี้:\n\n### 1. DNS Subdomain Names (RFC 1123)\nทรัพยากรส่วนใหญ่ใน Kubernetes (เช่น Pods, Services, Deployments, Nodes) ต้องเป็นไปตามมาตรฐานนี้:\n* ความยาวสูงสุดไม่เกิน **253 ตัวอักษร**\n* ประกอบด้วยตัวอักษรภาษาอังกฤษตัวพิมพ์เล็ก (`a-z`), ตัวเลข (`0-9`), ขีดกลาง (`-`), และจุด (`.`)\n* ต้องขึ้นต้นและลงท้ายด้วยตัวอักษรตัวพิมพ์เล็กหรือตัวเลขเท่านั้น (ห้ามขึ้นต้นหรือลงท้ายด้วย `-` หรือ `.`) ป้องกันปัญหาการแปลงเป็นโดเมนเนม\n\n### 2. DNS Label Names (RFC 1035)\nใช้สำหรับทรัพยากรบางชนิดที่ต้องการความสั้นและเข้ากันได้กับ DNS Label ดั้งเดิม:\n* ความยาวสูงสุดไม่เกิน **63 ตัวอักษร**\n* ประกอบด้วยตัวอักษรพิมพ์เล็ก (`a-z`), ตัวเลข (`0-9`), และขีดกลาง (`-`)\n* ต้องขึ้นต้นและลงท้ายด้วยตัวอักษรหรือตัวเลข\n\n### 3. Path Segment Names\nทรัพยากรบางประเภทต้องสามารถนำชื่อไปใช้เป็นส่วนหนึ่งของ Path ใน URL หรือ File path ได้อย่างปลอดภัย:\n* ห้ามใช้เครื่องหมายจุดคู่ (`..`), จุดเดี่ยว (`.`), ทับ (`/`), หรือเปอร์เซ็นต์ (`%`)\n* หลีกเลี่ยงอักขระพิเศษที่ไม่ปลอดภัยต่อการส่งผ่าน HTTP REST API"
      },
      {
        "id": "understanding-namespaces",
        "headingEn": "Understanding Namespaces",
        "headingTh": "ความเข้าใจเกี่ยวกับเนมสเปซ (Namespaces)",
        "contentMarkdown": "**Namespace (เนมสเปซ)** คือกลไกการแบ่งคลัสเตอร์ทางกายภาพหนึ่งคลัสเตอร์ออกเป็น 'คลัสเตอร์เสมือน' (Virtual Clusters) หลายๆ ส่วน เหมาะสำหรับองค์กรที่มีทีมงานหลายทีม หรือมีผู้ใช้งานหลายกลุ่มร่วมกัน (Multi-tenancy)\n\n### ประโยชน์สำคัญของ Namespace:\n* **การแบ่งแยกขอบเขตชื่อ (Scope of Names)**: คุณสามารถตั้งชื่อออบเจกต์ซ้ำกันได้ ตราบใดที่อยู่คนละ Namespace\n* **การจำกัดการเข้าถึง (Access Control)**: กำหนดสิทธิ์ผ่าน Role-Based Access Control (RBAC) ในระดับเฉพาะแต่ละเนมสเปซ เพื่อให้ทีมพัฒนาเข้าถึงได้เฉพาะเนมสเปซของตนเอง\n* **การควบคุมโควตาทรัพยากร (Resource Quotas)**: กำหนดเพดานการใช้ CPU, Memory, และจำนวนพอดสูงสุดในแต่ละเนมสเปซ ป้องกันไม่ให้แอปพลิเคชันทีมใดทีมหนึ่งแย่งทรัพยากรจนหมดคลัสเตอร์\n\n### ทรัพยากรที่ไม่ขึ้นกับเนมสเปซ (Cluster-scoped Resources)\nไม่ใช่ทุกออบเจกต์จะอยู่ในเนมสเปซ ออบเจกต์ระดับโครงสร้างพื้นฐานของคลัสเตอร์จะอยู่นอกเนมสเปซ (Cluster-scoped):\n* **Nodes** (โหนดเครื่องแม่ข่าย)\n* **PersistentVolumes (PV)** (พื้นที่จัดเก็บข้อมูลระดับคลัสเตอร์)\n* **StorageClasses** (คลาสการจัดสรรสตอเรจ)\n* **Namespaces** (ตัวเนมสเปซเอง)\n* **CustomResourceDefinitions (CRDs)** (การขยายสกีมาของระบบ)\n\n> [!NOTE]\n> สามารถตรวจสอบว่าทรัพยากรชนิดใดเป็น Namespaced หรือ Cluster-scoped ได้ผ่านคำสั่ง:\n> `kubectl api-resources --namespaced=true` (แบบอยู่ในเนมสเปซ)\n> `kubectl api-resources --namespaced=false` (แบบระดับคลัสเตอร์)"
      },
      {
        "id": "initial-namespaces",
        "headingEn": "Initial Namespaces in Kubernetes",
        "headingTh": "เนมสเปซเริ่มต้นทั้ง 4 ของระบบ",
        "contentMarkdown": "เมื่อคุณติดตั้งคลัสเตอร์ Kubernetes ขึ้นมาใหม่ ระบบจะสร้างเนมสเปซพื้นฐานมาให้โดยอัตโนมัติ 4 เนมสเปซ:\n\n1. **`default`**:\n   * เนมสเปซเริ่มต้นสำหรับผู้ใช้ หากคุณสั่งสร้างออบเจกต์โดยไม่ระบุ `--namespace` หรือฟิลด์ `metadata.namespace` ออบเจกต์นั้นจะถูกจัดให้อยู่ใน `default` โดยอัตโนมัติ\n\n2. **`kube-system`**:\n   * เนมสเปซสงวนไว้สำหรับคอมโพเนนต์การทำงานภายในของ Kubernetes เอง เช่น `kube-dns` / `coredns`, `kube-proxy`, `etcd`, `kube-scheduler` และ CNI plugin ห้ามใช้งานหรือสร้างเวิร์กโหลดทั่วไปในเนมสเปซนี้\n\n3. **`kube-public`**:\n   * เนมสเปซที่เปิดให้ผู้ใช้ทุกคนสามารถอ่านข้อมูลได้ แม้กระทั่ง Client ที่ยังไม่ผ่านการยืนยันตัวตน (Unauthenticated) นิยมใช้เก็บ ConfigMap ข้อมูลสาธารณะของคลัสเตอร์ เช่น ข้อมูลการเชื่อมต่อเพื่อการ Bootstrap โหนด (Cluster Info)\n\n4. **`kube-node-lease`**:\n   * เนมสเปซพิเศษที่เก็บออบเจกต์ประเภท `Lease` สำหรับแต่ละโหนด ซึ่ง Kubelet จะส่ง Heartbeat มาอัปเดตสม่ำเสมอ เพื่อลด Overhead ในการส่งข้อมูลสถานะของโหนดไปยัง etcd"
      },
      {
        "id": "namespaces-and-dns",
        "headingEn": "Namespaces and DNS Resolution",
        "headingTh": "ความสัมพันธ์ระหว่างเนมสเปซและระบบ DNS",
        "contentMarkdown": "เมื่อคุณสร้าง Kubernetes Service ขึ้นมา ระบบ DNS ประจำคลัสเตอร์ (CoreDNS) จะสร้างเรคอร์ด DNS ให้กับ Service นั้นโดยอ้างอิงกับเนมสเปซ:\n\nรูปแบบ Fully Qualified Domain Name (FQDN) ของ Service คือ:\n`<service-name>.<namespace>.svc.cluster.local`\n\n### กฎการเรียกใช้งานข้ามเนมสเปซ:\n* **ภายในเนมสเปซเดียวกัน**: พอดสามารถเรียกชื่อ Service สั้นๆ ได้โดยตรง เช่น `curl http://backend-api` DNS Resolver ภายในพอดจะเติม domain search suffix ให้เอง\n* **ข้ามเนมสเปซ**: พอดในเนมสเปซ `frontend` ต้องการติดต่อกับ Service ในเนมสเปซ `backend` จะต้องระบุชื่อเนมสเปซกำกับด้วย เช่น `curl http://backend-api.backend` หรือระบุ FQDN เต็มรูปแบบ `curl http://backend-api.backend.svc.cluster.local`\n\n> [!WARNING]\n> หากต้องการจำกัดไม่ให้พอดจากเนมสเปซอื่นติดต่อสื่อสารข้ามมายังเนมสเปซของคุณ คุณจำเป็นต้องประกาศใช้นโยบาย **NetworkPolicy** เนื่องจากโดยค่าเริ่มต้น Kubernetes เปิดให้ทุกพอดในทุกเนมสเปซสื่อสารถึงกันได้โดยไม่มีการบล็อก"
      },
      {
        "id": "working-with-namespaces-cli",
        "headingEn": "Managing Namespaces with kubectl",
        "headingTh": "การจัดการเนมสเปซและสลับ Context ด้วย kubectl",
        "contentMarkdown": "ตัวอย่างคำสั่ง CLI ที่จำเป็นสำหรับการจัดการ Namespace ในชีวิตประจำวันและการสอบ CKA:\n\n* **ดูรายการเนมสเปซทั้งหมด**:\n  `kubectl get namespaces`\n\n* **สร้างเนมสเปซใหม่**:\n  `kubectl create namespace staging`\n\n* **ดูทรัพยากรในเนมสเปซเฉพาะ**:\n  `kubectl get pods -n staging`\n\n* **ดูทรัพยากรในทุกเนมสเปซพร้อมกัน (All Namespaces)**:\n  `kubectl get pods -A`  (หรือ `--all-namespaces`)\n\n* **เปลี่ยนเนมสเปซปริยายของ Context ปัจจุบัน** (ไม่ต้องพิมพ์ `-n <name>` ทุกครั้ง):\n  `kubectl config set-context --current --namespace=staging`\n\nตัวอย่าง Manifest ในการประกาศสร้าง Namespace:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "namespace-example.yaml",
            "code": "apiVersion: v1\nkind: Namespace\nmetadata:\n  name: production\n  labels:\n    environment: production\n    team: payment"
          },
          {
            "lang": "shell",
            "label": "คำสั่งสร้างและตั้งค่า Namespace",
            "code": "kubectl apply -f namespace-example.yaml\nkubectl config set-context --current --namespace=production"
          }
        ]
      }
    ],
    "relatedLinks": [
      {
        "title": "Working with Kubernetes Objects",
        "targetType": "concepts",
        "targetPageId": "overview-working-with-objects",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/"
      },
      {
        "title": "Labels, Selectors, and Annotations",
        "targetType": "concepts",
        "targetPageId": "overview-labels-selectors-annotations",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/"
      },
      {
        "title": "Configure Resource Quotas for a Namespace (Task)",
        "targetType": "tasks",
        "targetPageId": "admin-resource-quota-namespace",
        "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/"
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
