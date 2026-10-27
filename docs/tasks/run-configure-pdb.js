/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/run-application/configure-pdb/
 */
(function (root) {
  const pageData = {
  "id": "run-configure-pdb",
  "categoryId": "run-applications",
  "categoryTitle": "Run Applications",
  "titleEn": "Specifying a Disruption Budget for your Application",
  "titleTh": "การกำหนดงบประมาณการขัดจังหวะพอด (PDB)",
  "officialUrl": "https://kubernetes.io/docs/tasks/run-application/configure-pdb/",
  "docsPath": "/docs/tasks/run-application/configure-pdb/",
  "diagram": {
    "src": "images/docs/workload-controllers-hierarchy.svg",
    "caption": "การปกป้อง High Availability ขณะเกิด Voluntary Disruptions ด้วย PodDisruptionBudget"
  },
  "lead": "คู่มือการตั้งค่า PodDisruptionBudget (PDB) เพื่อจำกัดจำนวน Pods ที่ยอมให้หยุดทำงานพร้อมกันได้ในระหว่างเกิดเหตุการณ์ขัดจังหวะที่วางแผนไว้ล่วงหน้า (Voluntary Disruptions) เช่น การอัปเกรด Node, การ Drain Node หรือการปรับขนาดคลัสเตอร์ เพื่อรักษาระดับความพร้อมใช้งานสูง (High Availability)",
  "sections": [
    {
      "id": "voluntary-vs-involuntary-disruptions",
      "headingEn": "Voluntary vs. Involuntary Disruptions",
      "headingTh": "ความเข้าใจเรื่อง Voluntary vs Involuntary Disruptions",
      "contentMarkdown": "ในการดูแลระบบคลัสเตอร์ Kubernetes พอดอาจหยุดทำงานได้จาก 2 สาเหตุหลักที่มีพฤติกรรมต่างกันสิ้นเชิง:\n\n### 1. Involuntary Disruptions (เหตุขัดจังหวะที่คาดเดาไม่ได้)\nเป็นเหตุการณ์ทางกายภาพหรือความล้มเหลวที่ไม่สามารถวางแผนล่วงหน้าได้ เช่น:\n* ฮาร์ดแวร์ของเครื่องเซิร์ฟเวอร์เสียหาย (Hardware Failure)\n* เคอร์เนลของระบบปฏิบัติการแครช (Kernel Panic)\n* สวิตช์เครือข่ายดับหรือเน็ตเวิร์กขาดการติดต่อ (Network Partition)\n* โหนดถูก Hypervisor หรือ Cloud Provider ลบทิ้งกะทันหัน\n> **PDB ไม่สามารถป้องกัน Involuntary Disruptions ได้!** หากเครื่องดับ พอดบนเครื่องนั้นจะตายทันทีตามสภาพจริง\n\n### 2. Voluntary Disruptions (เหตุขัดจังหวะที่วางแผนไว้ล่วงหน้า)\nเป็นกระบวนการบริหารจัดการคลัสเตอร์ที่สั่งการโดยมนุษย์ (Cluster Administrator) หรือตัวควบคุมอัตโนมัติ เช่น:\n* คำสั่งขับไล่พอดออกจากโหนดเพื่อซ่อมบำรุง (`kubectl drain`)\n* การอัปเกรดเวอร์ชัน Kubernetes ของ Worker Node\n* การลดขนาดคลัสเตอร์อัตโนมัติ (Cluster Autoscaler Scale Down)\n> **PDB ถูกออกแบบมาเพื่อควบคุมและจำกัดผลกระทบของ Voluntary Disruptions โดยเฉพาะ!**",
      "codeBlocks": []
    },
    {
      "id": "specifying-pdb-manifest",
      "headingEn": "Specifying a PodDisruptionBudget Manifest",
      "headingTh": "รูปแบบการเขียน PodDisruptionBudget Manifest",
      "contentMarkdown": "คุณสามารถกำหนดงบประมาณการขัดจังหวะของพอดได้โดยระบุฟิลด์ใดฟิลด์หนึ่งระหว่าง `minAvailable` หรือ `maxUnavailable` (ห้ามใส่พร้อมกัน):\n\n* **`minAvailable`**: จำนวนพอดขั้นต่ำที่สุดที่ **ต้องพร้อมให้บริการ (Ready)** ตลอดเวลา\n  * ระบุเป็นจำนวนเต็ม เช่น `minAvailable: 2`\n  * ระบุเป็นเปอร์เซ็นต์ เช่น `minAvailable: 80%`\n* **`maxUnavailable`**: จำนวนพอดสูงสุดที่ **ยอมให้หยุดทำงานพร้อมกันได้** ในช่วงที่มีการ Drain\n  * ระบุเป็นจำนวนเต็ม เช่น `maxUnavailable: 1`\n  * ระบุเป็นเปอร์เซ็นต์ เช่น `maxUnavailable: 20%`\n\nสร้างไฟล์ `nginx-pdb.yaml` โดยใช้ Label Selector จับคู่กับพอดของ NGINX:\n```bash\nkubectl apply -f nginx-pdb.yaml\n```",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "nginx-pdb.yaml",
          "code": "apiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata:\n  name: nginx-pdb\nspec:\n  minAvailable: 2\n  selector:\n    matchLabels:\n      app: nginx"
        }
      ]
    },
    {
      "id": "deploying-and-verifying-pdb",
      "headingEn": "Deploying and Verifying PDB Status",
      "headingTh": "การตรวจสอบสถานะ PDB ในคลัสเตอร์",
      "contentMarkdown": "สมมติว่าเรามี Deployment `nginx` ที่รันอยู่จำนวน 3 Replicas:\n```bash\nkubectl create deployment nginx --image=nginx:1.25 --replicas=3\nkubectl apply -f nginx-pdb.yaml\n```\n\nตรวจสอบสถานะ PDB:\n```bash\nkubectl get pdb\n```\nผลลัพธ์จะแสดงคอลัมน์สำคัญ:\n```\nNAME        MIN AVAILABLE   MAX UNAVAILABLE   ALLOWED DISRUPTIONS   AGE\nnginx-pdb   2               N/A               1                     45s\n```\nคำอธิบายฟิลด์:\n* `MIN AVAILABLE: 2`: ต้องการให้มีพอดพร้อมทำงานอย่างน้อย 2 ตัว\n* `ALLOWED DISRUPTIONS: 1`: ระบบอนุญาตให้พอดหยุดทำงานในเวลาเดียวกันได้ **สูงสุด 1 ตัวเท่านั้น** (เพราะมีพอดทั้งหมด 3 ตัว: 3 - 2 = 1) หากมีคนพยายาม Drain พอดตัวที่ 2 พร้อมกัน คำสั่งจะถูกสั่งบล็อกทันที!",
      "codeBlocks": []
    },
    {
      "id": "testing-pdb-with-node-drain",
      "headingEn": "Testing PDB Protection with kubectl drain",
      "headingTh": "การทดสอบการปกป้องของ PDB ด้วยคำสั่ง kubectl drain",
      "contentMarkdown": "เมื่อผู้ดูแลระบบสั่งระบายพอดออกจากเครื่อง (Drain Node):\n```bash\nkubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data\n```\n\n### ลำดับเหตุการณ์เบื้องหลัง (Eviction API Flow)\n1. `kubectl drain` ไม่ได้สั่งลบพอดตรงๆ แต่จะส่งคำขอไปยัง **Eviction Subresource API**\n2. Eviction API ตรวจสอบกับ PDB Controller ว่า ณ เสี้ยววินาทีนั้น `ALLOWED DISRUPTIONS` มีค่ามากกว่า 0 หรือไม่\n3. หากค่าเป็น 1: พอดจะถูก Evict ออก และ Deployment Controller จะไปสร้างพอดทดแทนบนโหนดอื่น\n4. หากค่าเป็น 0 (เพราะมีพอดตัวอื่นกำลังปิดตัวอยู่): คำสั่ง Evict จะถูกปฏิเสธพร้อมข้อความ:\n   ```\n   error when evicting pod \"nginx-xxxx\": Cannot evict pod as it would violate the pod's disruption budget.\n   ```\n   คำสั่ง drain จะทำการ Retry เป็นระยะๆ จนกว่าพอดตัวใหม่บนโหนดอื่นจะผ่าน Readiness Probe และเข้าสู่สถานะ Ready ทำให้ค่า Allowed Disruptions กลับมาเป็น 1 อีกครั้ง จึงจะทำการระบายพอดตัวถัดไป",
      "codeBlocks": []
    },
    {
      "id": "best-practices-and-pitfalls",
      "headingEn": "Best Practices and Critical Pitfalls",
      "headingTh": "แนวทางปฏิบัติที่ดีที่สุดและข้อพึงระวัง",
      "contentMarkdown": "> [!CRITICAL]\n> **ระวังการตั้งงบประมาณขัดจังหวะที่เป็นไปไม่ได้ (Deadlock Drain)**:\n> หากคุณมีพอดเพียง 2 Replicas และตั้งค่า `minAvailable: 2` หรือ `maxUnavailable: 0` เมื่อคุณสั่ง `kubectl drain` คำสั่งจะติดค้าง (**Deadlock**) ตลอดกาล เพราะระบบจะไม่ยอมให้พอดใดๆ ดับเลยแม้แต่ตัวเดียว!\n\n### คำแนะนำในการกำหนดค่า PDB\n* **สำหรับ Quorum-based Applications** (เช่น etcd, ZooKeeper, Consul):\n  * มี 3 Replicas -> กำหนด `minAvailable: 2` (อนุญาตให้ตายได้ 1 ตัว เพื่อรักษา Quorum)\n  * มี 5 Replicas -> กำหนด `minAvailable: 3` (อนุญาตให้ตายได้ 2 ตัว)\n* **สำหรับ Stateless Web Services**:\n  * แนะนำให้ใช้เปอร์เซ็นต์ เช่น `maxUnavailable: 25%` หรือ `minAvailable: 75%`\n* พอดที่ถูกนับว่าตรงตามงบประมาณ ต้องเป็นพอดที่มีสถานะ **`Ready`** เท่านั้น พอดที่ยังอยู่ในสถานะ `Pending` หรือ `CrashLoopBackOff` จะไม่ถูกนับรวมในจำนวนพอดที่พร้อมใช้งาน"
    }
  ],
  "relatedLinks": [
    {
      "title": "Safely Drain a Node (การอพยพพอดออกจากโหนดอย่างปลอดภัย)",
      "targetType": "tasks",
      "targetPageId": "admin-safely-drain-node",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/"
    },
    {
      "title": "Upgrading kubeadm clusters",
      "targetType": "tasks",
      "targetPageId": "admin-kubeadm-upgrade",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/"
    },
    {
      "title": "Run a Stateless Application Using a Deployment",
      "targetType": "tasks",
      "targetPageId": "run-stateless-deployment",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/"
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
