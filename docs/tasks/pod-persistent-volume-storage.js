/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/
 */
(function (root) {
  const pageData = {
  "id": "pod-persistent-volume-storage",
  "categoryId": "configure-pods",
  "categoryTitle": "Configure Pods and Containers",
  "titleEn": "Configure a Pod to Use a PersistentVolume for Storage",
  "titleTh": "การตั้งค่าให้พอดใช้งานพื้นที่จัดเก็บ PersistentVolume",
  "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/",
  "docsPath": "/docs/tasks/configure-pod-container/configure-persistent-volume-storage/",
  "lead": "การแยกวงจรชีวิตของพื้นที่จัดเก็บข้อมูล (Storage Lifecycle) ออกจากวงจรชีวิตของพอดด้วย PersistentVolume (PV) และ PersistentVolumeClaim (PVC) ช่วยให้ข้อมูลคงทนอยู่เสมอ แม้พอดจะถูกรีสตาร์ทหรือย้ายโหนด",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nการจัดการพื้นที่จัดเก็บข้อมูลแบบถาวรใน Kubernetes แยกวงจรชีวิตออกเป็น 2 ส่วน: ผู้ดูแลสร้าง `PersistentVolume (PV)` เป็นตัวแทนของ Storage จริง และนักพัฒนาสร้าง `PersistentVolumeClaim (PVC)` เพื่อขอใช้พื้นที่ เมื่อผูกคู่กัน (Binding) พอดจะนำ PVC ไปเมานต์ใช้งานเพื่อบันทึกข้อมูลอย่างคงทนแม้พอดจะถูกรีสตาร์ท\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **ขอบเขตทรัพยากร (Scope)**:\n  - `PersistentVolume` เป็นออบเจกต์ระดับคลัสเตอร์ (Cluster-scoped)\n  - `PersistentVolumeClaim` เป็นออบเจกต์ประจำเนมสเปซ (Namespace-scoped)\n* **เงื่อนไขการผูกคู่ (Binding Conditions)**:\n  - ขนาดความจุ (`capacity.storage` ของ PV ต้อง $\\ge$ `resources.requests.storage` ของ PVC)\n  - รูปแบบการเข้าถึง (`accessModes` ต้องตรงกัน)\n  - คลาสพื้นที่จัดเก็บ (`storageClassName` ต้องมีชื่อตรงกัน)\n* **โหมดการเข้าถึง (Access Modes)**:\n  - `ReadWriteOnce` (RWO): อ่านเขียนได้จากโหนดเดียว\n  - `ReadOnlyMany` (ROX): อ่านอย่างเดียวจากหลายโหนดพร้อมกัน\n  - `ReadWriteMany` (RWX): อ่านเขียนได้จากหลายโหนดพร้อมกัน\n* **การเมานต์เข้า Pod**: ประกาศ `spec.volumes` ผูกกับ `persistentVolumeClaim.claimName` แล้วนำไปกำหนดจุด mount ใน `spec.containers[].volumeMounts`\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* เช็คสถานะการผูกคู่:\n  ```bash\n  kubectl get pv,pvc\n  ```\n  (ต้องมีสถานะเป็น `Bound` หากขึ้น `Pending` ให้ใช้ `kubectl describe pvc` ตรวจสอบสาเหตุ)\n* ข้อสอบชอบออกโจทย์เชื่อมโยง 3 ขั้นตอน: สร้าง PV -> สร้าง PVC ให้ Bind กับ PV -> สร้าง Pod หรือ Deployment เมานต์ PVC ไปยังพาธที่กำหนด\n* ระวัง: หากระบุ `storageClassName: \"\"` (สตริงว่าง) ใน PV หรือ PVC จะเป็นการปิดการใช้งาน Dynamic Provisioner เพื่อบังคับให้ผูกเฉพาะ Static PV",
  "sections": [
    {
      "id": "pv-pvc-architecture",
      "headingEn": "PersistentVolume and PersistentVolumeClaim Architecture",
      "headingTh": "สถาปัตยกรรมและหลักการทำงานของ PV, PVC และ StorageClass",
      "contentMarkdown": "การจัดการพื้นที่จัดเก็บข้อมูลใน Kubernetes แยกออกเป็น 2 บทบาทหลักตามแนวคิด Separation of Concerns:\n\n* **PersistentVolume (PV)**:\n  ออบเจกต์ระดับคลัสเตอร์ที่สร้างขึ้นโดย Cluster Administrator หรือผ่าน StorageClass อัตโนมัติ (Dynamic Provisioning) เพื่อเป็นตัวแทนของพื้นที่จัดเก็บบนระบบจริง เช่น NFS, iSCSI, หรือ Cloud Block Storage (เช่น AWS EBS, GCP Persistent Disk)\n* **PersistentVolumeClaim (PVC)**:\n  คำร้องขอพื้นที่จัดเก็บที่สร้างโดยนักพัฒนา โดยระบุขนาดความจุที่ต้องการ (Size) และรูปแบบการเข้าถึง (Access Modes) โดยไม่จำเป็นต้องสนใจฮาร์ดแวร์เบื้องหลัง\n\n### Access Modes ที่สำคัญ:\n* `ReadWriteOnce (RWO)`: เมานต์อ่าน/เขียนได้โดยโหนดเดียวในเวลาหนึ่งๆ\n* `ReadOnlyMany (ROX)`: เมานต์อ่านอย่างเดียวได้พร้อมกันจากหลายโหนด\n* `ReadWriteMany (RWX)`: เมานต์อ่าน/เขียนได้พร้อมกันจากหลายโหนด (ต้องการ Network File System เช่น NFS หรือ CephFS)\n* `ReadWriteOncePod (RWOP)`: เมานต์อ่าน/เขียนได้โดยพอดเดียวเท่านั้นในคลัสเตอร์",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "setup-node-dir.sh",
          "code": "# สร้างไดเรกทอรีบนโหนดสำหรับการทดสอบ hostPath\nsudo mkdir -p /mnt/data\nsudo sh -c \"echo 'Hello from Kubernetes Storage' > /mnt/data/index.html\""
        }
      ]
    },
    {
      "id": "create-persistent-volume",
      "headingEn": "Creating a PersistentVolume (PV)",
      "headingTh": "ขั้นตอนการสร้าง PersistentVolume ออบเจกต์",
      "contentMarkdown": "สร้าง PersistentVolume ขนาด 10Gi โดยใช้ hostPath ชี้ไปยัง `/mnt/data` กำหนด accessModes เป็น `ReadWriteOnce` และกำหนด storageClassName เป็น `manual`",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "pv-volume.yaml",
          "code": "apiVersion: v1\nkind: PersistentVolume\nmetadata:\n  name: task-pv-volume\n  labels:\n    type: local\nspec:\n  storageClassName: manual\n  capacity:\n    storage: 10Gi\n  accessModes:\n    - ReadWriteOnce\n  hostPath:\n    path: \"/mnt/data\""
        },
        {
          "lang": "bash",
          "label": "apply-pv.sh",
          "code": "# สร้าง PV และตรวจสอบสถานะ (จะอยู่ในสถานะ Available)\nkubectl apply -f pv-volume.yaml\nkubectl get pv task-pv-volume"
        }
      ]
    },
    {
      "id": "create-persistent-volume-claim",
      "headingEn": "Creating a PersistentVolumeClaim (PVC) and Binding",
      "headingTh": "ขั้นตอนการสร้าง PersistentVolumeClaim และการผูกความสัมพันธ์ (Binding)",
      "contentMarkdown": "สร้าง PVC เพื่อขอพื้นที่ 3Gi ภายใต้ StorageClass `manual` เมื่อสร้างขึ้น Control Plane จะค้นหา PV ที่เข้าเกณฑ์และทำการผูก (Binding) เข้าด้วยกัน โดยสถานะของทั้งคู่จะเปลี่ยนเป็น `Bound`",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "pv-claim.yaml",
          "code": "apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: task-pv-claim\nspec:\n  storageClassName: manual\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 3Gi"
        },
        {
          "lang": "bash",
          "label": "apply-pvc.sh",
          "code": "# สร้าง PVC และตรวจสอบการผูกเข้ากับ PV\nkubectl apply -f pv-claim.yaml\nkubectl get pvc task-pv-claim\n# ตรวจสอบสถานะจะเปลี่ยนเป็น Bound\nkubectl get pv task-pv-volume"
        }
      ]
    },
    {
      "id": "mount-pvc-to-pod",
      "headingEn": "Mounting the PersistentVolumeClaim to a Pod",
      "headingTh": "การตั้งค่าให้พอดเมานต์ PVC และการทดสอบความคงทนของข้อมูล",
      "contentMarkdown": "สร้าง Pod ที่มี Nginx Web Server โดยกำหนด `volumes` ให้อ้างอิงไปยัง PVC `task-pv-claim` และกำหนด `volumeMounts` ในคอนเทนเนอร์ให้เมานต์ไปที่โฟลเดอร์ `/usr/share/nginx/html`",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "pv-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: task-pv-pod\nspec:\n  volumes:\n    - name: task-pv-storage\n      persistentVolumeClaim:\n        claimName: task-pv-claim\n  containers:\n    - name: task-pv-container\n      image: nginx\n      ports:\n        - containerPort: 80\n          name: \"http-server\"\n      volumeMounts:\n        - mountPath: \"/usr/share/nginx/html\"\n          name: task-pv-storage"
        },
        {
          "lang": "bash",
          "label": "test-pv-pod.sh",
          "code": "# สร้างพอดและเปิด shell เข้าไปตรวจสอบไฟล์ที่เมานต์\nkubectl apply -f pv-pod.yaml\nkubectl get pod task-pv-pod\n\n# ทดสอบอ่านไฟล์ที่อยู่ใน persistent volume\nkubectl exec -it task-pv-pod -- cat /usr/share/nginx/html/index.html"
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Run a Stateful Application",
      "targetType": "tasks",
      "targetPageId": "run-stateful-application",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-stateful-application/"
    },
    {
      "title": "Configure a Pod to Use a ConfigMap",
      "targetType": "tasks",
      "targetPageId": "inject-configmap",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/"
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
