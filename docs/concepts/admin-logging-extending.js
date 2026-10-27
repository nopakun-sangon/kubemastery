/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/cluster-administration/logging/
 */
(function (root) {
  const pageData = {
    "id": "admin-logging-extending",
    "categoryId": "administration",
    "categoryTitle": "Cluster Administration",
    "titleEn": "Logging Architecture",
    "titleTh": "สถาปัตยกรรมการจัดการ Log และการสร้าง Custom Resources (CRDs)",
    "officialUrl": "https://kubernetes.io/docs/concepts/cluster-administration/logging/",
    "docsPath": "/docs/concepts/cluster-administration/logging/",
    "lead": "สถาปัตยกรรมการบันทึก Log ใน Kubernetes และการขยายขีดความสามารถของ Kubernetes API ให้รองรับทรัพยากรเฉพาะทางขององค์กรผ่าน Custom Resource Definitions (CRDs) และแบบแผน Operator Pattern เพื่อการบริหารจัดการระบบอัตโนมัติขั้นสูง",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nสถาปัตยกรรม Logging ของ Kubernetes ยึดหลักให้แอปพลิเคชันเขียนข้อความออกทาง stdout/stderr เพื่อให้ Container Runtime และ Node Logging Agent รวบรวมข้อมูลสู่ศูนย์กลาง ส่วนการขยายขีดความสามารถของ Kubernetes API ทำได้ผ่าน Custom Resource Definitions (CRDs) ควบคู่กับแบบแผน Operator Pattern เพื่อการบริหารจัดการระบบอัตโนมัติขั้นสูง\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **วงจรการบันทึก Log ระดับคอนเทนเนอร์**: แอปพลิเคชันส่ง log ออก `stdout`/`stderr` -> Container Runtime บันทึกลง `/var/log/pods` บน Worker Node -> Kubelet คอยทำ Log Rotation -> เรียกดูสดผ่านคำสั่ง `kubectl logs`\n* **3 รูปแบบ Centralized Logging ระดับคลัสเตอร์**:\n  1. `Node-level Agent (DaemonSet)`: วิธีมาตรฐาน (เช่น Fluent Bit, Vector, Promtail) รันเครื่องละ 1 ตัว คอยอ่าน log ของทุกพอดบนโหนด ประหยัดทรัพยากรที่สุด\n  2. `Sidecar Logging Agent`: ฝังคอนเทนเนอร์ช่วยอ่านไฟล์ log เฉพาะแอปเก่าแล้วสตรีมออก stdout\n  3. `Direct Push`: แอปพลิเคชันส่ง log ตรงเข้าฐานข้อมูลภายนอกผ่านเครือข่ายโดยตรง\n* **Custom Resource Definitions (CRDs)**: สร้าง API Object ชนิดใหม่เข้าสู่ Kubernetes API Server พร้อมระบบตรวจสอบ Schema ด้วย OpenAPI v3\n* **Operator Pattern (`Operator = CRD + Custom Controller`)**: Custom Controller จะรัน Reconciliation Loop อย่างต่อเนื่องเพื่อปรับระบบจริงให้ตรงกับ Desired State ที่ผู้ใช้ประกาศใน Custom Resource\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* คำสั่ง `kubectl logs` ที่ใช้บ่อยทั้งในชีวิตจริงและในห้องสอบ:\n  * ดู log แบบสด: `kubectl logs -f <pod-name>`\n  * ดู log ของคอนเทนเนอร์เฉพาะเจาะจง: `kubectl logs <pod-name> -c <container-name>`\n  * ดู log ก่อนหน้าที่เพิ่งแครชไป (สำคัญมากตอนดีบัก CrashLoopBackOff): `kubectl logs <pod-name> --previous`\n  * ดู log ของทุกพอดที่ตรงกับเลเบล: `kubectl logs -l app=my-app`\n* คำสั่งตรวจสอบ CRDs: `kubectl get crd` และเรียกดูออบเจกต์ผ่านชื่อย่อ: `kubectl get <shortName>`",
    "sections": [
      {
        "id": "logging-architecture",
        "headingEn": "Basic Container Logging Architecture",
        "headingTh": "สถาปัตยกรรมการบันทึก Log ระดับคอนเทนเนอร์",
        "contentMarkdown": "หลักการพื้นฐานของการทำ Logging ในโลกคลาวด์เนทีฟคือ แอปพลิเคชันในคอนเทนเนอร์ควรเขียนข้อความ Log ออกมาทาง **Standard Output (`stdout`)** และ **Standard Error (`stderr`)** โดยตรง โดยไม่ต้องกังวลเรื่องการจัดการไฟล์ในเครื่อง\n\nกระบวนการที่ Kubernetes จัดการ Log เบื้องหลัง:\n1. **Container Runtime** (เช่น containerd หรือ CRI-O) จะทำการดักจับข้อความจาก stdout/stderr และนำไปบันทึกลงในไฟล์ของ Worker Node ณ ไดเรกทอรี:\n   `/var/log/pods/<namespace>_<pod-name>_<pod-uid>/<container-name>/<run-id>.log`\n2. **Kubelet** จะคอยดูแลการตัดหมุนเวียนไฟล์ (Log Rotation) ตามขนาดที่ตั้งไว้ในคอนฟิก (เช่น `containerLogMaxSize: 10Mi`)\n3. เมื่อคุณสั่งคำสั่ง **`kubectl logs`** ตัว Kubernetes API Server จะส่งคำขอไปยัง kubelet บนโหนดนั้นเพื่อดึงเนื้อหาจากไฟล์ Log ดังกล่าวมาแสดงผลบนหน้าจอทันที"
      },
      {
        "id": "cluster-level-logging-patterns",
        "headingEn": "Cluster-Level Centralized Logging Patterns",
        "headingTh": "3 รูปแบบการรวมศูนย์ Log ระดับคลัสเตอร์ (Centralized Logging)",
        "contentMarkdown": "เนื่องจากไฟล์ Log บนโหนดจะถูกลบทิ้งเมื่อพอดถูกทำลาย การรวบรวม Log ไปเก็บไว้ยังระบบศูนย์กลาง (เช่น Elasticsearch, Grafana Loki, Google Cloud Logging, Splunk) จึงนิยมใช้ 3 รูปแบบหลัก:\n\n### 1. Node-level Logging Agent (วิธีมาตรฐานที่แนะนำสูงสุด)\n* ติดตั้ง Logging Agent (เช่น **Fluent Bit, Fluentd, Vector, Promtail**) ในรูปแบบ **DaemonSet** เพื่อให้มีเอเจนต์รันอยู่บนทุก Worker Node เพียงเครื่องละ 1 ตัว\n* เอเจนต์จะคอยอ่านไฟล์ Log ในไดเรกทอรี `/var/log/pods` ของโหนดนั้น และส่งต่อไปยังระบบจัดเก็บส่วนกลาง\n* ประหยัดทรัพยากรที่สุดและแอปพลิเคชันไม่ต้องเขียนโค้ดเพิ่ม\n\n### 2. Sidecar Container Logging Agent\n* ฝังคอนเทนเนอร์ Sidecar เข้าไปใน Pod เพื่อทำหน้าที่อ่าน Log เฉพาะของแอปพลิเคชันนั้นแล้วส่งต่อไปยังระบบศูนย์กลาง\n* เหมาะสำหรับแอปพลิเคชันรุ่นเก่าที่ยังคงเขียน Log ลงไฟล์เฉพาะในตัวคอนเทนเนอร์และไม่สามารถเปลี่ยนมาใช้ stdout ได้\n\n### 3. Direct Application Push\n* แอปพลิเคชันใช้ SDK เพื่อส่ง Log ตรงไปยังฐานข้อมูลภายนอกผ่านเครือข่ายโดยตรง โดยไม่ผ่านระบบ Logging ของ Kubernetes"
      },
      {
        "id": "extending-k8s-crds",
        "headingEn": "Extending Kubernetes with Custom Resource Definitions (CRDs)",
        "headingTh": "การขยายระบบด้วย Custom Resource Definitions (CRDs)",
        "contentMarkdown": "หนึ่งในจุดแข็งที่สุดของ Kubernetes คือความสามารถในการขยายระบบได้อย่างไร้ขีดจำกัด หากทรัพยากรมาตรฐานที่มีอยู่ (เช่น Pod, Service, Deployment) ไม่เพียงพอต่อการอธิบายระบบของคุณ คุณสามารถสร้างประเภททรัพยากรใหม่ขึ้นมาเองได้ผ่าน **`CustomResourceDefinition` (CRD)**:\n\n* ทำให้คุณสามารถสร้าง Object ชนิดใหม่ เช่น `PostgreSQLCluster`, `KafkaTopic`, `BackupSchedule` เข้าไปใน Kubernetes API Server ได้อย่างแท้จริง\n* รองรับการตรวจสอบความถูกต้องของข้อมูล (Schema Validation) ผ่านมาตรฐาน **OpenAPI v3 schema**\n* สามารถสั่งงานผ่านคำสั่ง `kubectl get`, `kubectl apply`, `kubectl describe` ได้เหมือนกับออบเจกต์มาตรฐานทุกประการ"
      },
      {
        "id": "operator-pattern",
        "headingEn": "The Operator Pattern",
        "headingTh": "แบบแผนโอเปอเรเตอร์ (Operator Pattern)",
        "contentMarkdown": "การสร้าง CRD เพียงอย่างเดียวเป็นเพียงการเพิ่มโครงสร้างข้อมูล (Data Store) แต่หัวใจที่ทำให้ระบบทำงานได้จริงคือ **Operator Pattern**:\n\n`Operator = Custom Resource Definition (CRD) + Custom Controller`\n\n* **Custom Controller** จะรันวงรอบการปรับสถานะ (**Reconciliation Loop**) ตลอดเวลา:\n  * อ่านสถานะที่ต้องการ (Desired State) จาก Custom Resource\n  * เปรียบเทียบกับสถานะจริงของระบบในปัจจุบัน (Current State)\n  * ดำเนินการสั่งงานอัตโนมัติเพื่อให้สถานะจริงตรงกับที่ต้องการ เช่น หากพบ Object `PostgreSQLCluster` ตัว Operator จะสั่งสร้าง StatefulSets, ConfigMaps, Services, ทำ Database Replication และตั้งเวลา Backup ให้อัตโนมัติโดยที่มนุษย์ไม่ต้องลงมือเอง"
      },
      {
        "id": "manifest-examples",
        "headingEn": "Manifest Examples: CRD & Custom Object",
        "headingTh": "ตัวอย่าง Manifest ของ CRD และ Custom Object พร้อมคำสั่ง kubectl",
        "contentMarkdown": "ตัวอย่างการนิยาม CRD ทรัพยากรใหม่ชื่อ `CronTab` และการสร้างออบเจกต์จาก CRD นั้น:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "crontab-crd-and-instance.yaml",
            "code": "# 1. นิยามประเภททรัพยากรใหม่ (CRD)\napiVersion: apiextensions.k8s.io/v1\nkind: CustomResourceDefinition\nmetadata:\n  name: crontabs.stable.example.com\nspec:\n  group: stable.example.com\n  versions:\n    - name: v1\n      served: true\n      storage: true\n      schema:\n        openAPIV3Schema:\n          type: object\n          properties:\n            spec:\n              type: object\n              properties:\n                cronSpec:\n                  type: string\n                image:\n                  type: string\n                replicas:\n                  type: integer\n  scope: Namespaced\n  names:\n    plural: crontabs\n    singular: crontab\n    kind: CronTab\n    shortNames:\n    - ct\n---\n# 2. สร้าง Custom Resource Instance จริง\napiVersion: stable.example.com/v1\nkind: CronTab\nmetadata:\n  name: my-new-cron-object\nspec:\n  cronSpec: \"* * * * */5\"\n  image: my-awesome-cron-image\n  replicas: 3"
          },
          {
            "lang": "bash",
            "label": "คำสั่งจัดการ Logs และ CRD",
            "code": "# ดู Log ของพอดแบบ Real-time และตามดูข้อความใหม่ (-f)\nkubectl logs -f <pod-name>\n\n# ดู Log ของคอนเทนเนอร์เฉพาะเจาะจงในพอดที่มีหลายคอนเทนเนอร์\nkubectl logs <pod-name> -c <container-name>\n\n# ดู Log ย้อนหลังของคอนเทนเนอร์ตัวก่อนหน้าที่เพิ่งแครชไป (--previous)\nkubectl logs <pod-name> --previous\n\n# ตรวจสอบรายการ CRD ที่ติดตั้งอยู่ในคลัสเตอร์\nkubectl get crd\n\n# ใช้งานคำสั่ง kubectl กับ Custom Resource ตัวใหม่ผ่านชื่อย่อ (shortNames)\nkubectl get ct"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Extend the Kubernetes API with CustomResourceDefinitions](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)\n* ศึกษา [Kubernetes Operator SDK](https://operatorframework.io/) สำหรับการสร้าง Controller ด้วยภาษา Go หรือ Python\n* ศึกษา [Cluster Architecture: Controllers](https://kubernetes.io/docs/concepts/architecture/controller/) สำหรับหลักการทำงานของ Controller Loop"
      }
    ],
    "relatedLinks": [
      {
        "title": "Controllers and Leases (ตัวควบคุมและสัญญาเช่า)",
        "targetType": "concepts",
        "targetPageId": "arch-controllers-leases",
        "officialUrl": "https://kubernetes.io/docs/concepts/architecture/controller/"
      },
      {
        "title": "Nodes Architecture (สถาปัตยกรรมโหนด)",
        "targetType": "concepts",
        "targetPageId": "arch-nodes",
        "officialUrl": "https://kubernetes.io/docs/concepts/architecture/nodes/"
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
