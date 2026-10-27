/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/
 */
(function (root) {
  const pageData = {
  "id": "admin-safely-drain-node",
  "categoryId": "administer-cluster",
  "categoryTitle": "Administer a Cluster",
  "titleEn": "Safely Drain a Node",
  "titleTh": "การอพยพพอดออกจากโหนดอย่างปลอดภัย (kubectl drain)",
  "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/",
  "docsPath": "/docs/tasks/administer-cluster/safely-drain-node/",
  "lead": "เมื่อมีความจำเป็นต้องปิดปรับปรุงโหนด (Maintenance), อัปเกรดระบบปฏิบัติการ หรือถอดฮาร์ดแวร์ คำสั่ง kubectl drain ช่วยให้คุณสามารถอพยพพอดออกจากโหนดได้อย่างปลอดภัย โดยไม่ทำให้บริการของแอปพลิเคชันเกิด Downtime",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\n`kubectl drain` เป็นคำสั่งมาตรฐานสำหรับเตรียมปิดปรับปรุงโหนด (Maintenance) โดยระบบจะทำเครื่องหมายห้ามพอดใหม่มาลง (Cordon) พร้อมทั้งส่งคำขอ Eviction ขับไล่พอดที่มี Controller ดูแลอยู่เดิมให้ย้ายไปสร้างใหม่บนโหนดอื่นอย่างปลอดภัยโดยไม่กระทบต่อผู้ใช้งาน\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **`cordon` vs `drain`**:\n  - `kubectl cordon <node>`: ปรับสถานะเป็น `SchedulingDisabled` พอดใหม่ห้ามลง แต่พอดเดิมยังคงรันต่อไปตามปกติ\n  - `kubectl drain <node>`: รวมการ cordon เข้ากับการ evict (ขับไล่) พอดเดิมทั้งหมดออกจากโหนด\n* **3 แฟล็กจำเป็นของคำสั่ง drain**:\n  1. `--ignore-daemonsets`: ละเว้นพอดประเภท DaemonSet (เพราะ DaemonSet บังคับรันทุกโหนด ย้ายไปไหนไม่ได้)\n  2. `--delete-emptydir-data`: ยืนยันยอมรับการลบข้อมูลชั่วคราวในโฟลเดอร์ emptyDir ของ Pod\n  3. `--force`: บังคับลบ Standalone Pods ที่ไม่มี Deployment หรือ ReplicaSet คอยดูแล\n* **การเคารพ PDB**: drain จะปฏิบัติตาม `PodDisruptionBudget` อย่างเคร่งครัด หากการขับไล่ทำให้จำนวนพอดต่ำกว่าค่า `minAvailable` คำสั่งจะรอจนกว่าพอดใหม่บนโหนดอื่นจะพร้อมใช้งาน\n* **การคืนสถานะ**: เมื่อบำรุงรักษาเสร็จ ให้สั่ง `kubectl uncordon <node>` เพื่อเปิดรับโหลดอีกครั้ง\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* คำสั่งสำเร็จรูปสำหรับการ Drain ในข้อสอบ CKA:\n  ```bash\n  kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data --force\n  ```\n* อย่าลืมขั้นตอนสุดท้ายหลัง Maintenance:\n  ```bash\n  kubectl uncordon <node-name>\n  ```\n* ตรวจสอบสถานะโหนดด้วย `kubectl get nodes` (ต้องเปลี่ยนจาก `Ready,SchedulingDisabled` กลับมาเป็น `Ready`)",
  "sections": [
    {
      "id": "cordon-vs-drain",
      "headingEn": "Understanding kubectl cordon vs kubectl drain",
      "headingTh": "ทำความเข้าใจความแตกต่างระหว่าง cordon และ drain",
      "contentMarkdown": "ก่อนสั่งการซ่อมบำรุงโหนด ต้องเข้าใจความแตกต่างระหว่างสองคำสั่งนี้:\n\n* **`kubectl cordon <node>`**:\n  ทำเครื่องหมายให้โหนดเปลี่ยนสถานะเป็น `SchedulingDisabled` โดยโหนดจะไม่รับพอดใหม่ที่ถูกสร้างขึ้น แต่พอดที่รันอยู่เดิมจะไม่ถูกแตะต้องและยังคงทำงานต่อไปตามปกติ\n* **`kubectl drain <node>`**:\n  ทำการ cordon โหนดอัตโนมัติก่อน จากนั้นจะส่งคำขอ Eviction API เพื่อขับไล่พอดที่กำลังทำงานอยู่ทั้งหมดบนโหนดนั้นออกไป เพื่อให้ Kubernetes Scheduler นำพอดเหล่านั้นไปเริ่มต้นทำงานใหม่บนโหนดอื่นที่พร้อมให้บริการ\n\n> ข้อควรระวัง: พอดที่ไม่ได้บริหารจัดการด้วย Controller (เช่น Naked/Bare Pods ที่สร้างขึ้นตรงๆ โดยไม่มี Deployment, ReplicaSet หรือ StatefulSet) จะถูกลบทิ้งอย่างถาวรหากไม่ได้ระบุแฟล็กป้องกัน",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "cordon-example.sh",
          "code": "# ทำเครื่องหมายโหนดไม่ให้รับพอดใหม่\nkubectl cordon worker-node-1\n\n# ตรวจสอบสถานะโหนด (จะเห็น SchedulingDisabled)\nkubectl get nodes"
        }
      ]
    },
    {
      "id": "execute-drain-node",
      "headingEn": "Executing kubectl drain with Essential Flags",
      "headingTh": "การรันคำสั่ง kubectl drain และแฟล็กที่จำเป็น",
      "contentMarkdown": "โดยทั่วไปเมื่อรันคำสั่ง `kubectl drain <node>` ระบบจะตรวจสอบและอาจแจ้งข้อผิดพลาดหากพบเงื่อนไขพิเศษ คุณจำเป็นต้องใช้แฟล็กเสริมต่อไปนี้เพื่อสั่งการให้ถูกต้อง:\n\n1. **`--ignore-daemonsets`**:\n   จำเป็นต้องระบุเสมอ เนื่องจากพอดประเภท DaemonSet ถูกผูกให้ต้องรันบนทุกโหนด และไม่สามารถย้ายไปยังโหนดอื่นได้ หากไม่ใส่แฟล็กนี้ คำสั่ง drain จะล้มเหลวทันที\n2. **`--delete-emptydir-data`**:\n   ใช้สำหรับอนุญาตให้ลบพอดที่มีการใช้ Volume ชนิด `emptyDir` โดยข้อมูลใน volume ดังกล่าวจะสูญหายไปเมื่อพอดถูกลบ\n3. **`--force`**:\n   บังคับให้ขับไล่ Bare Pods (พอดที่ไม่มี Controller ดูแล) ออกจากโหนด\n4. **`--grace-period`**:\n   กำหนดระยะเวลาเป็นวินาทีเพื่อให้คอนเทนเนอร์ในพอดปิดตัวลงอย่างราบรื่น (Graceful Termination) ก่อนถูกบังคับตัดสัญญาณ",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "drain-command.sh",
          "code": "# คำสั่ง drain มาตรฐานสำหรับการบำรุงรักษาโหนด\nkubectl drain worker-node-1 \\\n  --ignore-daemonsets \\\n  --delete-emptydir-data \\\n  --grace-period=60"
        }
      ]
    },
    {
      "id": "pod-disruption-budget",
      "headingEn": "Interaction with PodDisruptionBudget (PDB)",
      "headingTh": "การทำงานร่วมกับ PodDisruptionBudget (PDB) และการแก้ปัญหาค้าง",
      "contentMarkdown": "**PodDisruptionBudget (PDB)** คือทรัพยากรที่กำหนดว่าแอปพลิเคชันหนึ่งๆ สามารถหยุดทำงานพร้อมกันได้มากที่สุดกี่ตัว (Disruption Limit)\n\n* ในระหว่างการรันคำสั่ง `kubectl drain` คำสั่งจะส่งคำขอ Eviction ไปยัง API Server ซึ่ง API Server จะตรวจสอบกฎของ PDB ก่อนเสมอ\n* หากการขับไล่พอดจะทำให้จำนวนพอดที่พร้อมใช้งานต่ำกว่าขีดจำกัดที่กำหนดไว้ใน PDB คำขอ Eviction จะถูกปฏิเสธ และคำสั่ง drain จะวนพยายามใหม่จนกว่าพอดบนโหนดอื่นจะพร้อมให้บริการ\n* หากคำสั่ง drain ค้างอยู่เป็นเวลานาน ให้ตรวจสอบ PDB ด้วยคำสั่ง `kubectl get pdb -A` เพื่อดูว่ามีพอดที่ไม่สามารถย้ายได้หรือไม่",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "check-pdb.sh",
          "code": "# ตรวจสอบนโยบาย PodDisruptionBudget ในคลัสเตอร์\nkubectl get pdb -A\n\n# ดูรายละเอียดข้อผิดพลาดของพอดในโหนดที่กำลัง drain\nkubectl describe node worker-node-1"
        }
      ]
    },
    {
      "id": "uncordon-node",
      "headingEn": "Uncordoning Node after Maintenance",
      "headingTh": "การเปิดให้โหนดกลับมารองรับพอดอีกครั้ง (kubectl uncordon)",
      "contentMarkdown": "เมื่อกระบวนการซ่อมบำรุงโหนด, ติดตั้งแพตช์ระบบปฏิบัติการ, หรือรีบูตเครื่องเสร็จสมบูรณ์แล้ว คุณต้องแจ้งให้ Kubernetes Scheduler ทราบว่าโหนดนี้พร้อมรับงานอีกครั้งโดยใช้คำสั่ง `kubectl uncordon`\n\n> หมายเหตุ: การ uncordon จะไม่ย้ายพอดที่กำลังรันอยู่บนโหนดอื่นกลับมาที่โหนดนี้ในทันที (Non-preemptive) พอดจะถูกจัดตารางมาลงที่โหนดนี้ก็ต่อเมื่อมีการสร้างพอดใหม่ หรือมีการ scale เพิ่มขึ้นเท่านั้น",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "uncordon-command.sh",
          "code": "# เปิดให้โหนดกลับมารองรับการรันพอดตามปกติ\nkubectl uncordon worker-node-1\n\n# ยืนยันสถานะโหนดว่ากลับมาเป็น Ready (ไม่มี SchedulingDisabled)\nkubectl get node worker-node-1"
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Upgrading kubeadm clusters",
      "targetType": "tasks",
      "targetPageId": "admin-kubeadm-upgrade",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/"
    },
    {
      "title": "Configure PodDisruptionBudget (PDB)",
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
