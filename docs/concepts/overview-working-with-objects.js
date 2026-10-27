/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/overview/working-with-objects/
 */
(function (root) {
  const pageData = {
    "id": "overview-working-with-objects",
    "categoryId": "overview",
    "categoryTitle": "Overview",
    "titleEn": "Objects In Kubernetes",
    "titleTh": "การทำงานกับออบเจกต์ใน Kubernetes (Working with Kubernetes Objects)",
    "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/",
    "docsPath": "/docs/concepts/overview/working-with-objects/",
    "diagram": {
      "src": "images/docs/object-controller-loop.svg",
      "caption": "วงจรการควบคุมออบเจกต์: Desired State (สเปกที่ต้องการ) เปรียบเทียบกับ Current State (สถานะจริง)"
    },
    "lead": "ใน Kubernetes ออบเจกต์ (Objects) คือเอนทิตีถาวร (Persistent Entities) ที่ใช้แทนสถานะทั้งหมดของระบบคลัสเตอร์ โดยทำหน้าที่เป็น 'บันทึกเจตจำนง' (Record of Intent) เพื่อบอก Kubernetes ว่าคุณต้องการให้แอปพลิเคชันและทรัพยากรทำงานในลักษณะใด",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nออบเจกต์ (Objects) ใน Kubernetes คือเอนทิตีถาวรที่บันทึกสถานะของระบบ ทำหน้าที่เป็น \"บันทึกเจตจำนง\" (Record of Intent) เพื่อระบุสิ่งที่คุณต้องการให้คลัสเตอร์เป็น โดย Kubernetes จะคอยปรับสถานะจริง (Actual State) ให้ตรงกับสถานะที่คุณต้องการ (Desired State) ตลอดเวลา\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **โครงสร้าง Spec vs Status**: `spec` กำหนดสิ่งที่คุณต้องการ (ผู้ใช้สร้าง/อัปเดต), `status` บันทึกสถานะปัจจุบันจริงของระบบ (ระบบและคอนโทรลเลอร์อัปเดตให้อัตโนมัติ)\n- **4 ฟิลด์บังคับในไฟล์ YAML Manifest**:\n  1. `apiVersion`: เวอร์ชันของ Kubernetes API (เช่น `v1`, `apps/v1`)\n  2. `kind`: ชนิดของออบเจกต์ (เช่น `Pod`, `Service`, `Deployment`)\n  3. `metadata`: ข้อมูลระบุตัวตน (เช่น `name`, `namespace`, `labels`)\n  4. `spec`: สเปกและพฤติกรรมที่ต้องการของออบเจกต์นั้น\n- **3 รูปแบบการจัดการออบเจกต์**:\n  - *Imperative Commands*: ใช้คำสั่ง CLI ตรงๆ (`kubectl run`, `kubectl create`) — รวดเร็ว เหมาะกับการทดสอบและทำข้อสอบ\n  - *Imperative Object Configuration*: สั่งผ่านไฟล์เจาะจง (`kubectl create -f`, `kubectl replace -f`)\n  - *Declarative Object Configuration*: สั่งผ่านไดเรกทอรี/ไฟล์ด้วย `kubectl apply -f` — รองรับ Three-way Merge และเหมาะสำหรับ Production / GitOps\n- **Server-Side Field Validation**: API Server ช่วยตรวจฟิลด์ที่ไม่รู้จักหรือสะกดผิดแบบเข้มงวด ป้องกันข้อผิดพลาดจากการพิมพ์ Manifest ผิด\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **เทคนิคเร่งสปีดในห้องสอบ (Imperative Generator)**:\n  - สร้าง YAML ของ Pod: `kubectl run my-pod --image=nginx --dry-run=client -o yaml > pod.yaml`\n  - สร้าง YAML ของ Deployment: `kubectl create deployment web --image=nginx --replicas=3 --dry-run=client -o yaml > deploy.yaml`\n  - สร้าง Service: `kubectl expose deployment web --port=80 --target-port=8080 --dry-run=client -o yaml > svc.yaml`\n- **เครื่องมือค้นหาโครงสร้างฟิลด์**: ใช้ `kubectl explain <resource>.<field>` เช่น `kubectl explain pod.spec.containers` เพื่อดูฟิลด์และตัวอย่างโดยไม่ต้องเปิดเว็บ\n- **การใช้งานจริง**: ใน Production ควรใช้ `kubectl apply -f <path>` เสมอเพื่อรักษาประวัติและรองรับการ Merge โครงสร้าง",
    "sections": [
      {
        "id": "understanding-objects",
        "headingEn": "Understanding Kubernetes Objects",
        "headingTh": "ความเข้าใจพื้นฐานเกี่ยวกับ Kubernetes Objects",
        "contentMarkdown": "ออบเจกต์ใน Kubernetes คือข้อมูลโครงสร้างในระบบที่บันทึกสถานะของคลัสเตอร์ โดย Kubernetes จะใช้ออบเจกต์เหล่านี้เพื่อแสดงข้อมูลว่า:\n\n* มีแอปพลิเคชันคอนเทนเนอร์ใดกำลังทำงานอยู่บ้าง (และทำงานอยู่บนโหนดใด)\n* ทรัพยากรคำนวณ เครือข่าย และพื้นที่จัดเก็บข้อมูลใดบ้างที่พร้อมให้แอปพลิเคชันใช้งาน\n* นโยบายเกี่ยวกับพฤติกรรมของแอปพลิเคชัน เช่น นโยบายการรีสตาร์ต (Restart Policy), การอัปเกรด (Upgrades), และการทนทานต่อความเสียหาย (Fault-tolerance)\n\nเมื่อคุณสร้างออบเจกต์ใน Kubernetes เท่ากับคุณกำลังส่ง **บันทึกเจตจำนง (Record of Intent)** ไปยัง Kubernetes Control Plane ว่าคุณต้องการให้เวิร์กโหลดในคลัสเตอร์มีหน้าตาและพฤติกรรมอย่างไร ซึ่งสิ่งนี้เรียกว่า **Desired State (สถานะที่ต้องการ)**\n\nระบบ Kubernetes จะทำงานอย่างต่อเนื่องและไม่หยุดยั้งผ่านกระบวนการที่เรียกว่า **Control Loop** หรือ **Reconciliation Loop** เพื่อตรวจจับความแตกต่างระหว่างสถานะจริง (**Current State**) และสถานะที่ต้องการ (**Desired State**) จากนั้นสั่งการปรับปรุงสถานะจริงให้ตรงกับที่คุณระบุไว้เสมอ เช่น หากพอดเกิดแครชหรือโหนดดับ คอนโทรลเลอร์จะสร้างพอดใหม่ขึ้นมาทดแทนโดยอัตโนมัติ"
      },
      {
        "id": "object-spec-and-status",
        "headingEn": "Object Spec and Status",
        "headingTh": "โครงสร้าง Spec และ Status: หัวใจของ Kubernetes API",
        "contentMarkdown": "เกือบทุกออบเจกต์ใน Kubernetes ประกอบด้วยฟิลด์อ็อบเจกต์ที่ซ้อนกันอยู่ 2 ส่วนหลักซึ่งควบคุมการทำงานของออบเจกต์นั้น ได้แก่ `spec` และ `status`:\n\n### 1. Object `spec` (Specification)\n* คุณเป็นผู้กำหนดและอัปเดตฟิลด์นี้เมื่อสร้างหรือแก้ไขออบเจกต์\n* ฟิลด์นี้บรรจุคำอธิบายเกี่ยวกับ **Desired State** หรือลักษณะของทรัพยากรที่คุณต้องการให้ Kubernetes คงสถานะไว้\n* ตัวอย่างเช่น ใน Deployment คุณจะระบุว่าต้องการรันพอดจำนวน 3 ตัว (`replicas: 3`) โดยใช้คอนเทนเนอร์อิมเมจใด และเปิดพอร์ตหมายเลขใด\n\n### 2. Object `status` (สถานะปัจจุบัน)\n* **Kubernetes Control Plane เป็นผู้บันทึกและอัปเดตฟิลด์นี้แต่เพียงผู้เดียว** คุณไม่สามารถและไม่ควรกำหนดฟิลด์นี้ในไฟล์ Manifest\n* บรรจุข้อมูลเกี่ยวกับ **Current State** ของออบเจกต์ ณ ปัจจุบัน ซึ่งถูกตรวจสอบและรายงานโดยคอมโพเนนต์ต่างๆ ในคลัสเตอร์ เช่น Kubelet หรือ Controller Manager\n* ตัวอย่างเช่น รายงานว่าขณะนี้มีพอดกำลังรันอยู่จริงกี่ตัว (`readyReplicas: 3`), IP address ที่พอดได้รับคืออะไร และมีเงื่อนไข (Conditions) หรือ Error ใดเกิดขึ้นหรือไม่\n\n> [!NOTE]\n> ในทุกช่วงเวลา Kubernetes Control Plane จะพยายามบริหารจัดการและขับเคลื่อนสถานะจริงของทุกออบเจกต์ (`status`) ให้ตรงกับสถานะที่คุณระบุไว้ใน (`spec`) เสมอ"
      },
      {
        "id": "describing-objects-manifest",
        "headingEn": "Describing a Kubernetes Object & Required Fields",
        "headingTh": "การอธิบายออบเจกต์และ 4 ฟิลด์บังคับในไฟล์ Manifest",
        "contentMarkdown": "เมื่อคุณต้องการสร้างออบเจกต์ใน Kubernetes คุณสามารถส่งข้อมูลผ่าน Kubernetes API โดยตรง หรือสร้างไฟล์ในรูปแบบ **YAML** (หรือ JSON) ที่เรียกว่า **Manifest** แล้วสั่งการผ่าน `kubectl`\n\nในไฟล์ YAML สำหรับสร้าง Kubernetes Object จำเป็นต้องมีฟิลด์ระดับบนสุด (Top-level fields) ครบถ้วนทั้ง 4 ฟิลด์เสมอ:\n\n1. **`apiVersion`**: เวอร์ชันของ Kubernetes API schema ที่ใช้สร้างออบเจกต์นี้ (เช่น `v1`, `apps/v1`, `batch/v1`)\n2. **`kind`**: ชนิดของออบเจกต์ที่ต้องการสร้าง เช่น `Deployment`, `Service`, `Pod`, `ConfigMap`\n3. **`metadata`**: ข้อมูลระบุตัวตน (Metadata) ของออบเจกต์ ประกอบด้วยชื่อ `name`, `namespace` (หากเป็น namespaced resource), รวมถึง `labels` และ `annotations`\n4. **`spec`**: ข้อกำหนดสถานะที่ต้องการของออบเจกต์ (Desired State) ซึ่งรูปแบบและโครงสร้างภายในจะแตกต่างกันไปตามแต่ละ `kind`\n\nตัวอย่าง Manifest ด้านล่างแสดงการสร้าง `Deployment` ชนิด `apps/v1` พร้อมทั้งกำหนดฟิลด์ทั้ง 4 ครบถ้วน:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "deployment-example.yaml",
            "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx-deployment\n  labels:\n    app: nginx\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: nginx\n  template:\n    metadata:\n      labels:\n        app: nginx\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:1.14.2\n        ports:\n        - containerPort: 80"
          },
          {
            "lang": "shell",
            "label": "คำสั่งสร้างออบเจกต์ด้วย kubectl",
            "code": "kubectl apply -f deployment-example.yaml"
          }
        ]
      },
      {
        "id": "server-side-field-validation",
        "headingEn": "Server-Side Field Validation",
        "headingTh": "การตรวจสอบความถูกต้องของฟิลด์ที่ฝั่งเซิร์ฟเวอร์ (Server-Side Field Validation)",
        "contentMarkdown": "ตั้งแต่ Kubernetes 1.25 เป็นต้นมา ฟีเจอร์ **Server-Side Field Validation** ได้รับการเปิดใช้งานเป็นค่าเริ่มต้น โดย API Server จะทำการตรวจสอบว่าฟิลด์และคีย์ต่างๆ ที่ส่งเข้ามาใน Manifest ถูกต้องตามสเปกของ API Resource นั้นหรือไม่\n\nเมื่อส่งคำสั่งผ่าน `kubectl --validate=<mode>` คุณสามารถเลือกโหมดการตรวจสอบได้ 3 ระดับ:\n\n* **`strict`**: ปฏิเสธคำขอทันทีหากพบฟิลด์ที่ไม่รู้จัก (Unknown fields) หรือฟิลด์ที่ซ้ำซ้อน ถือเป็นระดับที่ปลอดภัยที่สุดและเป็นค่าเริ่มต้นในเครื่องมือสมัยใหม่\n* **`warn`**: ยอมรับคำขอและสร้างออบเจกต์ตามปกติ แต่จะแสดงข้อความเตือน (Warning) ไปยังผู้ใช้เกี่ยวกับฟิลด์ที่ไม่ถูกต้อง\n* **`ignore`**: ละเว้นฟิลด์ที่ไม่รู้จักทั้งหมดโดยไม่มีการแจ้งเตือนใดๆ และบันทึกเฉพาะฟิลด์ที่ถูกต้องลงในระบบ"
      },
      {
        "id": "management-techniques",
        "headingEn": "Management Techniques: Imperative vs Declarative",
        "headingTh": "เทคนิคการจัดการออบเจกต์: Imperative Commands, Object Configuration, และ Declarative Config",
        "contentMarkdown": "Kubernetes รองรับ 3 เทคนิคหลักในการสร้าง แก้ไข และบริหารจัดการออบเจกต์ ซึ่งมีจุดเด่นและกรณีการใช้งานที่แตกต่างกัน:\n\n### 1. Imperative Commands (สั่งการทันทีผ่านคำสั่ง CLI)\nผู้ใช้สั่งการทำงานโดยตรงผ่านพารามิเตอร์ของ `kubectl` โดยไม่ต้องเขียนไฟล์ YAML:\n* **ตัวอย่าง**: `kubectl run nginx --image=nginx` หรือ `kubectl create deployment web --image=nginx --replicas=3`\n* **ข้อดี**: รวดเร็ว สะดวก ประหยัดเวลา เหมาะกับการทดสอบชั่วคราวและการสอบใบรับรอง CKA/CKAD\n* **ข้อเสีย**: ไม่มีการจัดเก็บประวัติการเปลี่ยนแปลง (Audit Trail) ลงระบบ Version Control (Git) ไม่เหมาะกับการใช้งานบน Production\n\n### 2. Imperative Object Configuration (สั่งการผ่านไฟล์แบบระบุคำสั่งเจาะจง)\nผู้ใช้เขียนไฟล์ YAML และระบุการกระทำ (Action) เช่น create, replace หรือ delete ลงบนไฟล์โดยตรง:\n* **ตัวอย่าง**: `kubectl create -f nginx.yaml` หรือ `kubectl replace -f nginx.yaml` หรือ `kubectl delete -f nginx.yaml`\n* **ข้อดี**: มีไฟล์คอนฟิกเก็บใน Git ได้ แต่ผู้ใช้ต้องรู้สถานะปัจจุบันของระบบว่าต้องใช้ create หรือ replace\n* **ข้อเสีย**: ไม่สามารถทำงานร่วมกันหลายคนได้ดี หากมีการแก้ไขไฟล์คนละส่วนพร้อมกัน อาจเกิดการเขียนทับ (Overwrite)\n\n### 3. Declarative Object Configuration (การจัดการตามสถานะปลายทาง - มาตรฐาน GitOps)\nผู้ใช้ระบุสถานะปลายทางที่ต้องการไว้ในไฟล์ YAML จากนั้นใช้คำสั่ง `kubectl apply`:\n* **ตัวอย่าง**: `kubectl apply -f ./configs/` หรือ `kubectl apply -k ./overlays/production`\n* **กลไก 3-Way Merge**: Kubernetes จะนำ (1) ไฟล์ Manifest ในเครื่อง, (2) ข้อมูลล่าสุดในคลัสเตอร์ (Live state), และ (3) ข้อมูลการ apply ครั้งก่อนหน้า (`kubectl.kubernetes.io/last-applied-configuration`) มาคำนวณและอัปเดตเฉพาะส่วนต่างอย่างแม่นยำ\n* **ข้อดี**: เป็นรากฐานของ GitOps, ทำงานเป็นทีมได้อย่างปลอดภัย และตรวจสอบย้อนหลังได้ 100%"
      },
      {
        "id": "best-practices-and-tradeoffs",
        "headingEn": "Best Practices and Trade-offs",
        "headingTh": "แนวทางปฏิบัติที่ดีที่สุดและข้อเปรียบเทียบ",
        "contentMarkdown": "ในการบริหารจัดการระบบคลัสเตอร์ขนาดใหญ่ มีคำแนะนำดังต่อไปนี้:\n\n* **อย่านำเทคนิค Imperative และ Declarative มาใช้ปะปนกันบนออบเจกต์เดียวกัน**: หากสร้างออบเจกต์ด้วย `kubectl apply` แล้ว ไม่ควรใช้ `kubectl edit` หรือ `kubectl scale --replicas` เพราะจะทำให้ไฟล์ต้นทางใน Git ไม่ตรงกับสถานะจริงในระบบ (Configuration Drift)\n* **จัดระเบียบไฟล์ตามไดเรกทอรี**: รวมไฟล์ Manifest ที่เกี่ยวข้องกับแอปพลิเคชันเดียวกันไว้ในโฟลเดอร์เดียว เพื่อให้สามารถสั่ง `kubectl apply -f <directory>/` ได้ในคำสั่งเดียว\n* **ใช้ Kustomize หรือ Helm**: สำหรับการจัดการคอนฟิกหลายสภาพแวดล้อม (Dev, Staging, Prod) เพื่อลดความซ้ำซ้อนของโค้ด YAML (Don't Repeat Yourself)"
      }
    ],
    "relatedLinks": [
      {
        "title": "Object Names, UIDs, and Namespaces",
        "targetType": "concepts",
        "targetPageId": "overview-names-uids-namespaces",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/names/"
      },
      {
        "title": "Labels, Selectors, and Annotations",
        "targetType": "concepts",
        "targetPageId": "overview-labels-selectors-annotations",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/"
      },
      {
        "title": "Kubernetes Components (ส่วนประกอบของคลัสเตอร์)",
        "targetType": "concepts",
        "targetPageId": "overview-components",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/components/"
      },
      {
        "title": "Manage Kubernetes Objects (Task Documentation)",
        "targetType": "tasks",
        "targetPageId": "manage-declarative-imperative",
        "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/"
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
