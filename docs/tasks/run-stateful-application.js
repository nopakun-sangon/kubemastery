/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/
 */
(function (root) {
  const pageData = {
  "id": "run-stateful-application",
  "categoryId": "run-applications",
  "categoryTitle": "Run Applications",
  "titleEn": "Run a Replicated Stateful Application",
  "titleTh": "การรันแอปพลิเคชันแบบ Replicated Stateful (MySQL Master-Slave)",
  "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/",
  "docsPath": "/docs/tasks/run-application/run-replicated-stateful-application/",
  "diagram": {
    "src": "images/docs/pv-pvc-storageclass-lifecycle.svg",
    "caption": "สถาปัตยกรรม StatefulSet ร่วมกับ Headless Service และ PersistentVolumeClaim templates"
  },
  "lead": "คู่มือปฏิบัติการขั้นสูงในการติดตั้งและบริหารจัดการระบบฐานข้อมูลที่มีการจำลองข้อมูลแบบกระจายศูนย์ (Replicated Stateful Application) บน Kubernetes โดยใช้ StatefulSet, Headless Service, ConfigMap, และ PersistentVolumeClaim พร้อมตัวอย่างสถาปัตยกรรม MySQL Primary-Replica Topology",
  "sections": [
    {
      "id": "stateful-architecture-overview",
      "headingEn": "Stateful Architecture & Core Principles",
      "headingTh": "สถาปัตยกรรม StatefulSet และหลักการทำงานพื้นฐาน",
      "contentMarkdown": "### ความท้าทายของ Stateful Application บน Kubernetes\n\nฐานข้อมูลอย่าง MySQL, PostgreSQL หรือ MongoDB ไม่สามารถรันผ่าน Deployment ปกติได้อย่างราบรื่น เนื่องจากมีความต้องการเฉพาะทาง:\n1. **พอดแต่ละตัวมีบทบาทต่างกัน**: ตัวแรกต้องเป็น Primary (Master) รับการเขียน (Write), ตัวถัดๆ ไปเป็น Replicas (Slaves) รับการอ่าน (Read)\n2. **อัตลักษณ์ของพอดต้องคงเดิมเสมอ (Stable Network ID)**: พอดต้องมีชื่อและที่อยู่ DNS ที่แน่นอน แม้พอดจะแครชหรือถูกย้ายโหนดก็ตาม\n3. **การผูกติดพื้นที่จัดเก็บข้อมูล (Dedicated Persistent Storage)**: พอดแต่ละตัวต้องมี Persistent Volume เป็นของตนเอง พอด `mysql-0` ต้องผูกกับดิสก์เดิมเสมอเมื่อรีสตาร์ต\n\n### กฎสำคัญ 3 ประการของ StatefulSet\n* **Ordinal Indexing (ลำดับหมายเลขแน่นอน)**: พอดจะถูกตั้งชื่อเรียงตามลำดับจำนวนเต็มศูนย์เป็นต้นไป เช่น `mysql-0`, `mysql-1`, `mysql-2`\n* **Ordered Start & Termination (สร้างและทำลายตามลำดับ)**: คอนโทรลเลอร์จะสร้างพอดตามลำดับจากหมายเลข 0 ก่อน และรอจนกว่าจะ Ready สมบูรณ์ จึงจะสร้างหมายเลข 1 และเมื่อสั่งลบจะลบจากหมายเลขสูงสุดถอยหลังกลับมา\n* **Headless Service**: เซอร์วิสที่ไม่มี ClusterIP (`clusterIP: None`) เพื่อให้ DNS Controller ทำหน้าที่ Resolve ชื่อตรงไปยัง IP ของแต่ละพอด (Direct Pod IP Addressing)",
      "codeBlocks": []
    },
    {
      "id": "configuring-services-and-configmap",
      "headingEn": "Configuring Services and ConfigMap for MySQL",
      "headingTh": "การสร้าง Services (Headless & Read Service) และ ConfigMap",
      "contentMarkdown": "ในการสร้างระบบ MySQL Replicated Topology เราต้องการเซอร์วิส 2 ตัว และ ConfigMap 1 ตัว:\n\n1. **Headless Service (`mysql`)**:\n   กำหนด `clusterIP: None` เพื่อให้พอดภายในคุยกันเองได้ตามชื่อ DNS คงที่ เช่น `mysql-0.mysql`\n2. **Client Read Service (`mysql-read`)**:\n   มี ClusterIP ปกติ ทำหน้าที่กระจายโหลด (Load Balancing) คำสั่ง Read Queries ไปยัง MySQL Replicas ทุกตัว\n3. **ConfigMap (`mysql-config`)**:\n   จัดเก็บคอนฟิกไฟล์ `my.cnf` แยกสำหรับ Master และ Slave (กำหนด `server-id` อัตโนมัติตาม Ordinal Index และเปิดฟังก์ชัน `binlog` สำหรับการทำ Replication)\n\nสร้างไฟล์ `mysql-services-configmap.yaml` แล้วนำไปประยุกต์ใช้:\n```bash\nkubectl apply -f mysql-services-configmap.yaml\n```",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "mysql-services-configmap.yaml",
          "code": "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: mysql-config\n  labels:\n    app: mysql\ndata:\n  primary.cnf: |\n    [mysqld]\n    log-bin\n  replica.cnf: |\n    [mysqld]\n    super-read-only\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: mysql\n  labels:\n    app: mysql\nspec:\n  ports:\n  - name: mysql\n    port: 3306\n  clusterIP: None\n  selector:\n    app: mysql\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: mysql-read\n  labels:\n    app: mysql\nspec:\n  ports:\n  - name: mysql\n    port: 3306\n  selector:\n    app: mysql"
        }
      ]
    },
    {
      "id": "statefulset-manifest-deep-dive",
      "headingEn": "StatefulSet Manifest Deep Dive & Init Containers",
      "headingTh": "โครงสร้าง StatefulSet Manifest และ Init Containers",
      "contentMarkdown": "หัวใจสำคัญของตัวอย่างทางการนี้คือการใช้ **Init Containers** จำนวน 2 ตัวในการจัดเตรียมคอนฟิกและคัดลอกข้อมูลก่อนที่ MySQL ตัวหลักจะเริ่มทำงาน:\n\n1. **Init Container `init-mysql`**:\n   อ่านชื่อโฮสต์ของพอด (เช่น `mysql-1`) สกัดตัวเลขอันดับ (Ordinal: 1) และคำนวณ `server-id = 100 + ordinal` จากนั้นเลือกคัดลอกคอนฟิก `primary.cnf` (ถ้าเป็น 0) หรือ `replica.cnf` (ถ้าเป็นตัวอื่น)\n2. **Init Container `clone-mysql`**:\n   หากเป็นพอดตัวใหม่ (Ordinal > 0) และยังไม่มีข้อมูลในเครื่อง จะทำการเชื่อมต่อไปยังพอดตัวก่อนหน้า (`mysql-<ordinal-1>`) เพื่อ Clone สแน็ปช็อตข้อมูลเริ่มต้นด้วยโปรแกรม **Percona XtraBackup**\n3. **Primary Container `mysql`**:\n   รันเอนจิน MySQL เวอร์ชัน 5.7 พร้อมอ่านข้อมูลจาก Persistent Volume\n4. **Sidecar Container `xtrabackup`**:\n   รันเคียงคู่ในพอดเดียวกันเพื่อรอรับคำขอทำ Online Backup จากพอด Replicas ตัวถัดไป\n5. **volumeClaimTemplates**:\n   สร้างคำขอ PersistentVolumeClaim ขนาด 10Gi โดยอัตโนมัติต่อหนึ่งพอด ทำให้แต่ละพอดได้ดิสก์อิสระจากกัน",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "mysql-statefulset-snippet.yaml",
          "code": "apiVersion: apps/v1\nkind: StatefulSet\nmetadata:\n  name: mysql\nspec:\n  selector:\n    matchLabels:\n      app: mysql\n  serviceName: mysql\n  replicas: 3\n  template:\n    metadata:\n      labels:\n        app: mysql\n    spec:\n      initContainers:\n      - name: init-mysql\n        image: mysql:5.7\n        command:\n        - bash\n        - \"-c\"\n        - |\n          set -ex\n          [[ `hostname` =~ -([0-9]+)$ ]] || exit 1\n          ordinal=${BASH_REMATCH[1]}\n          echo [mysqld] > /mnt/conf.d/server-id.cnf\n          echo server-id=$((100 + $ordinal)) >> /mnt/conf.d/server-id.cnf\n          if [[ $ordinal -eq 0 ]]; then\n            cp /mnt/config-map/primary.cnf /mnt/conf.d/\n          else\n            cp /mnt/config-map/replica.cnf /mnt/conf.d/\n          fi\n        volumeMounts:\n        - name: conf\n          mountPath: /mnt/conf.d\n        - name: config-map\n          mountPath: /mnt/config-map\n      containers:\n      - name: mysql\n        image: mysql:5.7\n        env:\n        - name: MYSQL_ALLOW_EMPTY_PASSWORD\n          value: \"1\"\n        ports:\n        - name: mysql\n          containerPort: 3306\n        volumeMounts:\n        - name: data\n          mountPath: /var/lib/mysql\n          subPath: mysql\n        - name: conf\n          mountPath: /etc/mysql/conf.d\n  volumeClaimTemplates:\n  - metadata:\n      name: data\n    spec:\n      accessModes: [\"ReadWriteOnce\"]\n      resources:\n        requests:\n          storage: 10Gi"
        }
      ]
    },
    {
      "id": "deploying-and-testing-replication",
      "headingEn": "Deploying and Testing Master-Slave Replication",
      "headingTh": "การรันเวิร์กโหลดและการทดสอบส่งข้อมูล Replicated Data",
      "contentMarkdown": "### ขั้นตอนการสั่ง Deploy และติดตามสถานะ\nสั่งรัน StatefulSet:\n```bash\nkubectl apply -f https://k8s.io/examples/application/mysql/mysql-statefulset.yaml\n```\n\nติดตามการสร้างพอดทีละตัวตามลำดับ:\n```bash\nkubectl get pods -l app=mysql -w\n```\nสังเกตว่า `mysql-0` จะถูกสร้างและเข้าสู่สถานะ `Running` ก่อน จากนั้น `mysql-1` จึงจะเริ่มสร้าง และตามด้วย `mysql-2` ตามลำดับ\n\n### ทดสอบการเขียนข้อมูลเข้า Master Pod (`mysql-0`)\nเปิดพอดไคลเอนต์ชั่วคราวเพื่อส่งคำสั่งสร้างตารางและ Insert ข้อมูลไปยัง `mysql-0.mysql`:\n```bash\nkubectl run mysql-client --image=mysql:5.7 -i --rm --restart=Never -- \\\n  mysql -h mysql-0.mysql -e \"\n    CREATE DATABASE test;\n    CREATE TABLE test.messages (message VARCHAR(250));\n    INSERT INTO test.messages VALUES ('Hello Kubernetes StatefulSet!');\"\n```\n\n### ทดสอบการอ่านข้อมูลจาก Client Service (`mysql-read`)\nส่งคำสั่งอ่านข้อมูลผ่าน Service `mysql-read` ซึ่งจะสุ่มโหลดกระจายไปยัง Replicas:\n```bash\nkubectl run mysql-client --image=mysql:5.7 -i --rm --restart=Never -- \\\n  mysql -h mysql-read -e \"SELECT @@server_id, message FROM test.messages;\"\n```\nรันคำสั่งซ้ำหลายๆ ครั้ง คุณจะเห็นว่าค่า `@@server_id` จะเปลี่ยนสลับระหว่าง `100`, `101`, และ `102` แต่ข้อมูล `message` จะมีค่าเดียวกันทุกตัว แสดงว่าการ Replicate ข้อมูลประสบความสำเร็จอย่างสมบูรณ์!",
      "codeBlocks": []
    },
    {
      "id": "scaling-and-node-failure-handling",
      "headingEn": "Scaling Replicas & Handling Failures",
      "headingTh": "การปรับขนาดพอดและการรับมือเมื่อโหนดล้มเหลว",
      "contentMarkdown": "### การขยายขนาด (Scaling Up)\nสั่งขยายขนาด Replicas จาก 3 เป็น 5 ตัว:\n```bash\nkubectl scale statefulset mysql --replicas=5\n```\nStatefulSet Controller จะทำการสร้าง `mysql-3` ตามด้วย `mysql-4` โดยแต่ละตัวจะรัน Init Container เพื่อ Clone ฐานข้อมูลจาก `mysql-2` และ `mysql-3` อย่างราบรื่น\n\n### การลดขนาด (Scaling Down) และข้อควรระวังเรื่อง Storage\nเมื่อสั่งลดขนาดพอดลง:\n```bash\nkubectl scale statefulset mysql --replicas=3\n```\nController จะทำลาย `mysql-4` และตามด้วย `mysql-3`\n\n> [!CAUTION]\n> **PersistentVolumeClaims จะไม่ถูกลบโดยอัตโนมัติ!**\n> เพื่อป้องกันการสูญหายของข้อมูลสำคัญขององค์กร Kubernetes จงใจไม่ลบ PersistentVolumeClaim หรือ PersistentVolume ที่ผูกกับพอดออกเมื่อมีการ Scale Down หากคุณต้องการล้างข้อมูลทิ้งจริงๆ คุณต้องสั่งลบ PVC ด้วยตนเองผ่านคำสั่ง `kubectl delete pvc -l app=mysql`\n\n### พฤติกรรมเมื่อ Node เกิดความล้มเหลว (Node Failure)\nหาก Node ที่ `mysql-1` รันอยู่เกิดดับลง (NotReady) Kubernetes จะไม่สร้าง `mysql-1` ซ้ำซ้อนขึ้นมาบน Node อื่นทันทีจนกว่าจะแน่ใจว่า Pod เก่าถูก Terminate แล้วจริงๆ หรือจนกว่า Node จะถูก Drain เพื่อป้องกันปัญหา **Split-Brain** ในระบบฐานข้อมูลแบบกระจายศูนย์"
    }
  ],
  "relatedLinks": [
    {
      "title": "StatefulSets Concepts (แนวคิดเวิร์กโหลดแบบสถานะ)",
      "targetType": "concepts",
      "targetPageId": "workloads-replicaset-statefulset",
      "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/"
    },
    {
      "title": "Configure Persistent Volume Storage",
      "targetType": "tasks",
      "targetPageId": "pod-persistent-volume-storage",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/"
    },
    {
      "title": "Specifying a Disruption Budget for your Application (PDB)",
      "targetType": "tasks",
      "targetPageId": "run-configure-pdb",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/configure-pdb/"
    }
  ]
};

  if (typeof window !== "undefined") {
    window.KUBE_TASKS_PAGES = window.KUBE_TASKS_PAGES || {};
    window.KUBE_TASKS_PAGES[pageData.id] = pageData;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = pageData;
  }
})(typeof window !== "undefined" ? window : globalThis);
