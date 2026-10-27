/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/
 */
(function (root) {
  const pageData = {
    "id": "workloads-replicaset-statefulset",
    "categoryId": "workloads",
    "categoryTitle": "Workloads",
    "titleEn": "StatefulSets",
    "titleTh": "สเตตฟูลเซ็ตและเรปลิกาเซ็ต (StatefulSets & ReplicaSets)",
    "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/",
    "docsPath": "/docs/concepts/workloads/controllers/statefulset/",
    "diagram": {
      "src": "images/docs/workload-controllers-hierarchy.svg",
      "caption": "การเปรียบเทียบสถาปัตยกรรม: ReplicaSet เหมาะสำหรับ Stateless ส่วน StatefulSet มี Stable Network ID และ Persistent Storage"
    },
    "lead": "ReplicaSet และ StatefulSet เป็นสองตัวควบคุมเวิร์กโหลดหลักของ Kubernetes โดย ReplicaSet เน้นการควบคุมจำนวนพอดที่สามารถแทนที่กันได้อย่างสมบูรณ์ (Stateless) ในขณะที่ StatefulSet ออกแบบมาสำหรับแอปพลิเคชันแบบมีสถานะ (Stateful) ที่ต้องการเอกลักษณ์ประจำตัวคงที่ ลำดับการขยายและหดขนาดที่แน่นอน และการผูกติดสตอเรจอย่างถาวร",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\n**ReplicaSet** ออกแบบมาสำหรับแอปพลิเคชันแบบ **Stateless** ที่พอดแต่ละตัวเหมือนกันทุกประการและสามารถทดแทนกันได้อย่างสมบูรณ์ ในขณะที่ **StatefulSet** ออกแบบมาสำหรับแอปพลิเคชันแบบ **Stateful** (เช่น ฐานข้อมูล หรือระบบ Message Queue) ที่ต้องการเอกลักษณ์ประจำตัวคงที่ ลำดับการสตาร์ตและปิดตัวที่แน่นอน และการผูกติดสตอเรจเฉพาะของแต่ละพอดอย่างถาวร\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **ReplicaSet**: ควบคุมจำนวนพอดให้อยู่ในระดับที่ต้องการตลอดเวลา นิยมใช้งานผ่าน Deployment เพื่อให้ได้ฟีเจอร์ Rollout/Rollback\n- **StatefulSet**:\n  - *Stable Network Identity*: แต่ละพอดจะได้รับชื่อคงที่ตามลำดับดัชนี (Ordinal Index) เริ่มจาก `0, 1, 2, ...` เช่น `web-0`, `web-1`\n  - *Headless Service*: ต้องทำงานร่วมกับ Service ที่มี `clusterIP: None` เพื่อสร้าง Dedicated DNS Record เจาะจงแต่ละพอดในรูปแบบ `$(pod-name).$(service-name).$(namespace).svc.cluster.local`\n  - *volumeClaimTemplates*: สร้าง PersistentVolumeClaim (PVC) แยกเฉพาะของแต่ละพอดให้อัตโนมัติ และเมื่อพอดถูกลบ PVC จะยังคงอยู่ ไม่ถูกลบตาม เพื่อป้องกันข้อมูลสำคัญสูญหาย\n  - *Ordered Deployment & Scaling*: เริ่มสร้างและขยายขนาดตามลำดับ `0 ➔ 1 ➔ 2` (รอให้พอดก่อนหน้า Ready ก่อน) และย่อขนาดตามลำดับย้อนกลับ `2 ➔ 1 ➔ 0`\n- **Parallel Pod Management**: สามารถปรับ `podManagementPolicy: Parallel` เพื่อให้สร้างหรือลบพอดพร้อมกันโดยไม่ต้องรอลำดับได้\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **โครงสร้าง YAML สำคัญของ StatefulSet**:\n  - ต้องกำหนด `serviceName: <headless-service-name>` ใน `spec`\n  - กำหนด Headless Service ควบคู่เสมอ: `clusterIP: None`\n  - กำหนดเทมเพลตสตอเรจใน `volumeClaimTemplates`\n- **คำสั่งสำคัญ**:\n  - ดูสถานะ StatefulSet: `kubectl get sts`\n  - ขยายขนาด: `kubectl scale sts web --replicas=3`\n- **ข้อควรระวังในห้องสอบ CKA**: การลบ StatefulSet หรือลดจำนวน Replicas จะ **ไม่ลบ PersistentVolumeClaim (PVC)** หากต้องการล้างสตอเรจทิ้งทั้งหมด ผู้ดูแลต้องตามไปลบ PVC ด้วยตนเองเสมอ (`kubectl delete pvc -l app=web`)",
    "sections": [
      {
        "id": "understanding-replicasets",
        "headingEn": "Understanding ReplicaSets",
        "headingTh": "ความเข้าใจเกี่ยวกับเรปลิกาเซ็ต (ReplicaSets)",
        "contentMarkdown": "**ReplicaSet** มีเป้าหมายหลักเพียงประการเดียว คือการดูแลให้มีพอดที่ตรงตามสเปกและเลเบลรันอยู่ในคลัสเตอร์เป็นจำนวนคงที่ตามที่กำหนดไว้ใน `.spec.replicas` ตลอดเวลา\n\n* **การดูแลแบบแทนที่กันได้ (Fungible / Cattle)**: พอดที่สร้างโดย ReplicaSet จะถือว่าไม่มีความแตกต่างกัน หากพอดตัวหนึ่งตายลง ReplicaSet จะสร้างพอดตัวใหม่ขึ้นมาทดแทนทันทีโดยมีชื่อสุ่มแบบใหม่ (เช่น `web-6b797885b5-abcde`)\n* **ทำไมจึงไม่ควรสร้าง ReplicaSet โดยตรง**: ในการทำงานจริงเกือบ 100% เราจะใช้งานผ่าน **Deployment** แทน เนื่องจาก Deployment จะเป็นตัวสร้างและควบคุม ReplicaSet อีกชั้นหนึ่ง ทำให้เราสามารถทำ Rolling Update และ Rollback เวอร์ชันแอปพลิเคชันได้โดยอัตโนมัติ"
      },
      {
        "id": "understanding-statefulsets",
        "headingEn": "Understanding StatefulSets",
        "headingTh": "ความเข้าใจเกี่ยวกับสเตตฟูลเซ็ต (StatefulSets)",
        "contentMarkdown": "สำหรับแอปพลิเคชันที่ต้องการเก็บรักษาข้อมูล (Stateful Applications) เช่น ฐานข้อมูลแบบกระจายศูนย์ (Distributed Databases: PostgreSQL Primary-Replica, MySQL, Cassandra, MongoDB), คลัสเตอร์ระบบส่งข้อความ (Kafka, RabbitMQ) หรือระบบประสานงาน (ZooKeeper, etcd) พอดแต่ละตัวจะมีความแตกต่างกัน และไม่สามารถสุ่มชื่อหรือแทนที่กันตามอำเภอใจได้\n\n**StatefulSet** ถูกออกแบบมาเพื่อตอบโจทย์นี้โดยมอบการรับประกัน 4 ประการ:\n\n1. **Stable, Unique Network Identifiers**: พอดแต่ละตัวจะมีชื่อและ Hostname ประจำตัวที่แน่นอนและคาดเดาได้ (เช่น `web-0`, `web-1`, `web-2`)\n2. **Stable, Persistent Storage**: แต่ละพอดจะมี PersistentVolume ประจำตัวที่จะผูกติดอยู่ตลอดไป แม้พอดจะถูกย้ายไปรันบนโหนดใหม่\n3. **Ordered, Graceful Deployment and Scaling**: ลำดับการเปิดเครื่องและการปิดเครื่องจะเป็นไปตามลำดับดัชนีตัวเลขอย่างเคร่งครัด\n4. **Ordered, Automated Rolling Updates**: ทยอยอัปเดตทีละตัวตามลำดับย้อนกลับ"
      },
      {
        "id": "stable-identities-and-headless-service",
        "headingEn": "Stable Network Identity & Headless Services",
        "headingTh": "เอกลักษณ์ทางเครือข่ายคงที่และ Headless Services",
        "contentMarkdown": "StatefulSet จำเป็นต้องทำงานควบคู่กับ **Headless Service** (Service ที่กำหนด `clusterIP: None`) เสมอ\n\n### เหตุผลที่ต้องใช้ Headless Service:\n* Service ทั่วไปจะให้ IP กลาง (ClusterIP) เพียงตัวเดียวและสุ่มส่งทราฟฟิก (Load Balance) ไปยังพอด แต่ระบบคลัสเตอร์อย่าง Kafka หรือ MySQL ต้องการติดต่อกับ Master Node หรือสมาชิกเจาะจงตัวโดยตรง\n* Headless Service จะบอกให้ CoreDNS ไม่สร้าง ClusterIP แต่จะสร้าง DNS A-record แบบเจาะจงให้แต่ละพอด:\n\n$$\\text{FQDN} = \\text{$(pod-name)}.\\text{$(service-name)}.\\text{$(namespace)}.svc.cluster.local$$\n\nตัวอย่าง: ใน StatefulSet ชื่อ `web` ที่มี Headless Service ชื่อ `nginx` พอดตัวแรกจะมี Hostname ในระบบเครือข่ายคือ `web-0.nginx.default.svc.cluster.local` เสมอ แม้พอดจะรีสตาร์ตหรือย้ายเครื่อง โดเมนเนมนี้ก็จะไม่เปลี่ยนแปลง"
      },
      {
        "id": "persistent-storage-volume-claim-templates",
        "headingEn": "Stable Persistent Storage with volumeClaimTemplates",
        "headingTh": "การจัดการพื้นที่จัดเก็บข้อมูลถาวรผ่าน volumeClaimTemplates",
        "contentMarkdown": "ใน Deployment หากระบุ `volumes.persistentVolumeClaim` พอดทุกตัวจะพยายามไปแชร์ PVC เดียวกัน ซึ่งใช้ไม่ได้กับดาต้าเบสที่แต่ละโหนดต้องมีดิสก์ส่วนตัว\n\nStatefulSet จึงมีฟิลด์ **`volumeClaimTemplates`**:\n* เมื่อสร้าง StatefulSet ระบบจะสร้าง **PersistentVolumeClaim (PVC)** ตัวใหม่ให้แต่ละพอดโดยอัตโนมัติ ตามชื่อดัชนี เช่น `www-web-0`, `www-web-1`\n* StorageClass จะทำ Dynamic Provisioning สร้างดิสก์จริงมารองรับ\n\n> [!CAUTION]\n> **กฎเหล็กเพื่อป้องกันข้อมูลสูญหาย (Data Loss Prevention)**: เมื่อคุณสั่งลดขนาด (Scale Down) หรือสั่ง **ลบ StatefulSet ทิ้ง** ระบบ Kubernetes จะ **ไม่ลบ PersistentVolumeClaims (PVCs)** หรือดิสก์ข้อมูลที่เกี่ยวข้องทิ้งให้อัตโนมัติ ผู้ดูแลระบบจะต้องเข้ามาตรวจสอบและสั่งลบ PVC ด้วยตนเองเมื่อมั่นใจแล้วเท่านั้น"
      },
      {
        "id": "deployment-and-scaling-guarantees",
        "headingEn": "Ordered Deployment, Scaling, and Rolling Updates",
        "headingTh": "การรับประกันลำดับการ Deploy, Scaling และ Partition Updates",
        "contentMarkdown": "StatefulSet ให้การรับประกันลำดับที่เข้มงวด:\n\n* **การสร้างพอด (Scaling Up)**: จะเริ่มสร้างจากลำดับ `0` ไปจนถึง `N-1` โดยพอด `web-0` จะต้องสตาร์ตและผ่าน Readiness Probe (`Ready`) เรียบร้อยก่อน ระบบจึงจะเริ่มสร้าง `web-1` เป็นตัวถัดไป\n* **การปิดพอด (Scaling Down)**: จะทำการลบจากลำดับสูงสุดย้อนกลับลงมาเสมอ คือจาก `N-1` ถอยลงมาหา `0` ทีละตัว เพื่อให้คลัสเตอร์ดาต้าเบสมีเวลาจัดสมดุลข้อมูล (Rebalancing) ก่อนโหนดดับ\n\n### Rolling Updates & Partitions:\n* StatefulSet สามารถกำหนด `spec.updateStrategy.rollingUpdate.partition` ได้ เช่น หากตั้ง `partition: 2` ในคลัสเตอร์ที่มี 4 พอด (0 ถึง 3) ระบบจะยอมให้อัปเดตเฉพาะพอดที่มีดัชนี $\\ge 2$ (คือ `web-2` และ `web-3`) เหมาะอย่างยิ่งสำหรับการทำ **Canary Deployments** บนคลัสเตอร์แบบมีสถานะ"
      },
      {
        "id": "statefulset-manifest-example",
        "headingEn": "Comprehensive Manifest Example & Best Practices",
        "headingTh": "ตัวอย่าง Manifest สมบูรณ์ของ StatefulSet พร้อม Headless Service",
        "contentMarkdown": "ตัวอย่าง Manifest ด้านล่างแสดงการสร้าง StatefulSet สอง Replicas ที่ผูกติดกับ Headless Service:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "statefulset-with-headless.yaml",
            "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: nginx\n  labels:\n    app: nginx\nspec:\n  ports:\n  - port: 80\n    name: web\n  clusterIP: None\n  selector:\n    app: nginx\n---\napiVersion: apps/v1\nkind: StatefulSet\nmetadata:\n  name: web\nspec:\n  serviceName: \"nginx\"\n  replicas: 2\n  selector:\n    matchLabels:\n      app: nginx\n  template:\n    metadata:\n      labels:\n        app: nginx\n    spec:\n      containers:\n      - name: nginx\n        image: registry.k8s.io/nginx-slim:0.8\n        ports:\n        - containerPort: 80\n          name: web\n        volumeMounts:\n        - name: www\n          mountPath: /usr/share/nginx/html\n  volumeClaimTemplates:\n  - metadata:\n      name: www\n    spec:\n      accessModes: [ \"ReadWriteOnce\" ]\n      resources:\n        requests:\n          storage: 1Gi"
          }
        ]
      }
    ],
    "relatedLinks": [
      {
        "title": "Deployments (ดีพลอยเมนต์)",
        "targetType": "concepts",
        "targetPageId": "workloads-deployments",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"
      },
      {
        "title": "Pods Overview (สถาปัตยกรรมพอด)",
        "targetType": "concepts",
        "targetPageId": "workloads-pods",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/"
      },
      {
        "title": "Run a Replicated Stateful Application (Task)",
        "targetType": "tasks",
        "targetPageId": "run-stateful-application",
        "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/"
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
