/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/architecture/controller/
 */
(function (root) {
  const pageData = {
    "id": "arch-controllers-leases",
    "categoryId": "architecture",
    "categoryTitle": "Cluster Architecture",
    "titleEn": "Controllers",
    "titleTh": "คอนโทรลเลอร์และระบบเช่าสิทธิ์ (Controllers and Leases)",
    "officialUrl": "https://kubernetes.io/docs/concepts/architecture/controller/",
    "docsPath": "/docs/concepts/architecture/controller/",
    "diagram": {
      "src": "images/docs/object-controller-loop.svg",
      "caption": "กลไก Control Loop: เฝ้าดู Watch Events และปรับปรุง Current State สู่ Desired State"
    },
    "lead": "ใน Kubernetes คอนโทรลเลอร์ (Controllers) คือวงจรการควบคุม (Control Loops) ที่คอยเฝ้ามองสถานะของคลัสเตอร์ และทำการปรับปรุงเปลี่ยนแปลงเพื่อให้สถานะจริง (Current State) เบนเข้าสู่สถานะที่ต้องการ (Desired State) เสมอ ส่วน Leases ทำหน้าที่เป็นกลไกล็อกแบบกระจายศูนย์ (Distributed Locking) สำหรับการเลือกผู้นำ (Leader Election) และการส่ง Heartbeat ของโหนด",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\n**Controllers** คือลูปควบคุมอัตโนมัติ (Control Loops) ที่คอยเฝ้าดูสถานะจริงของคลัสเตอร์และปรับแก้ให้ตรงกับสถานะที่ต้องการ (Desired State) ตลอดเวลา ส่วน **Leases** คือกลไกการเช่าสิทธิ์แบบมีเวลาจำกัด ใช้สำหรับ Node Heartbeat เพื่อลดภาระระบบ และใช้ในการคัดเลือกผู้นำ (Leader Election) สำหรับระบบที่มีความพร้อมใช้งานสูง (HA)\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **กลไกการทำงานของ Controller**: ยึดหลัก `Watch` ➔ `Compare` ➔ `Act` ตรวจจับการเปลี่ยนแปลงผ่าน API Server อย่างต่อเนื่อง หากสถานะจริงเบี่ยงเบนจากสเปก คอนโทรลเลอร์จะสั่งการแก้ไขทันที\n- **ตัวอย่าง Controllers สำคัญ**:\n  - `Node Controller`: จัดการและตอบสนองเมื่อโหนดหยุดทำงาน\n  - `ReplicaSet / Deployment Controller`: ดูแลจำนวนและเวอร์ชันของพอด\n  - `Job Controller`: ควบคุมการรันพอดของงานประมวลผลจนเสร็จสิ้น\n  - `EndpointSlice Controller`: จัดการ IP ของพอดที่พร้อมรับทราฟฟิกสำหรับ Service\n- **บทบาทของ Leases (`coordination.k8s.io`)**:\n  - *Node Heartbeats*: Kubelet อัปเดต Lease object ขนาดเล็กในเนมสเปซ `kube-node-lease` ทุกๆ 10 วินาที ช่วยลดภาระการเขียนข้อมูลก้อนใหญ่ลง etcd อย่างมหาศาล\n  - *Leader Election*: ใช้ใน Control Plane แบบ HA เพื่อกำหนดว่าอินสแตนซ์ใดของ `kube-controller-manager` หรือ `kube-scheduler` จะเป็น Active Leader ตัวหลัก\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **ตรวจสอบ Lease Objects**:\n  - ดูสถานะ Heartbeat ของโหนด: `kubectl get leases -n kube-node-lease`\n  - ดู Leader ของระบบ: `kubectl get leases -n kube-system` (ตรวจสอบฟิลด์ `HOLDER` เพื่อดูว่า Control Plane โหนดใดเป็น Active Leader)\n- **การวินิจฉัยปัญหา Controller**: คอนโทรลเลอร์ทั้งหมดถูกรวมอยู่ในไบนารีเดียวคือ `kube-controller-manager` หากพบว่าพอดที่ลบไปไม่ถูกสร้างใหม่ หรือ ReplicaSet ไม่สเกล ให้ตรวจเช็ก Log ของ pod `kube-controller-manager` ใน `kube-system`",
    "sections": [
      {
        "id": "controller-pattern",
        "headingEn": "The Controller Pattern & Control Loops",
        "headingTh": "รูปแบบการออกแบบตัวควบคุมและวงจร Reconciliation Loop",
        "contentMarkdown": "ในศาสตร์การควบคุมแบบอัตโนมัติ (Robotics and Automation) **Control Loop** คือวงจรที่ไม่มีวันสิ้นสุดซึ่งคอยควบคุมสถานะของระบบ สำหรับ Kubernetes คอนโทรลเลอร์ก็คือ Control Loop ที่คอยเฝ้ามองสถานะอย่างน้อยหนึ่งชนิดของทรัพยากรในคลัสเตอร์\n\n### วงจรการทำงานพื้นฐาน:\n1. **สังเกตการณ์ (Observe)**: คอยเฝ้าดูสถานะจริง (Current State) ผ่าน Kubernetes API Server ด้วยกลไก Watch/Informer\n2. **วิเคราะห์ความแตกต่าง (Analyze)**: เปรียบเทียบสถานะจริงกับสถานะที่ระบุไว้ในสเปก (Desired State ใน `.spec`)\n3. **ลงมือแก้ไข (Act / Reconcile)**: ส่งคำสั่งสร้าง แก้ไข หรือลบทรัพยากร เพื่อบีบให้สถานะจริงตรงกับ Desired State\n\n### Level-triggered vs Edge-triggered (ระดับสัญญาณเทียบกับขอบสัญญาณ):\n* Kubernetes ได้รับการออกแบบให้ทำงานแบบ **Level-triggered (อิงระดับสถานะปัจจุบัน)** แทนที่จะเป็น Edge-triggered (อิงตามเหตุการณ์ที่เกิดขึ้นเพียงครั้งเดียว)\n* ข้อดีคือ หากระบบเกิดเน็ตเวิร์กหลุด หรือมี Event หล่นหายไประหว่างทาง เมื่อคอนโทรลเลอร์กลับมาทำงานใหม่ มันจะตรวจเช็กความจริงของระบบ ณ ขณะนั้น และปรับปรุงให้ถูกต้องได้เสมอโดยไม่เกิดสถานะตกค้าง (Self-healing)"
      },
      {
        "id": "core-controllers",
        "headingEn": "Built-in Controllers in kube-controller-manager",
        "headingTh": "คอนโทรลเลอร์หลักภายใน kube-controller-manager",
        "contentMarkdown": "ในทางตรรกะแล้ว แต่ละคอนโทรลเลอร์เป็นโปรเซสที่แยกจากกัน แต่เพื่อลดความซับซ้อนในการบริหารจัดการ จึงถูกคอมไพล์รวมอยู่ในไบนารีเดียวคือ **`kube-controller-manager`**:\n\n* **Deployment Controller**: คอยสร้างและอัปเดต ReplicaSets เพื่อรองรับการ Rollout และ Rollback แอปพลิเคชันแบบไร้ Downtime\n* **ReplicaSet Controller**: คอยควบคุมดูแลจำนวนพอดที่กำลังรันอยู่ให้เท่ากับจำนวน `replicas` ที่ระบุไว้ตลอดเวลา\n* **Node Controller**: ตรวจจับและตอบสนองเมื่อโหนดหยุดทำงาน จัดการ IP subnet และสั่งขับไล่พอด (Eviction)\n* **Job Controller**: ดูแลพอดของ Job ที่รันจนกระทั่งจบงาน (Run-to-completion) และจัดการการ Retry เมื่อเกิด Failure\n* **EndpointSlice Controller**: เชื่อมโยงพอดที่พร้อมให้บริการเข้ากับ EndpointSlices เพื่อให้ Service สามารถนำทางทราฟฟิกไปยังพอดได้ถูกต้อง\n* **ServiceAccount Controller**: สร้าง ServiceAccount เริ่มต้นและ API Tokens ให้กับแต่ละ Namespace โดยอัตโนมัติ"
      },
      {
        "id": "custom-controllers-and-operators",
        "headingEn": "Custom Controllers & Operator Pattern",
        "headingTh": "การขยายขีดความสามารถด้วย Custom Controllers และ Operator Pattern",
        "contentMarkdown": "Kubernetes เปิดโอกาสให้ผู้ใช้สามารถขยายขีดความสามารถของระบบได้โดยการสร้าง **Custom Resource Definitions (CRDs)** ควบคู่ไปกับ **Custom Controller** ซึ่งรูปแบบนี้เรียกว่า **Operator Pattern**:\n\n* **CRD**: ทำหน้าที่ประกาศ Schema ใหม่ลงใน Kubernetes API เช่น `PostgreSQLCluster`, `KafkaTopic`\n* **Operator (Custom Controller)**: โค้ดที่รันอยู่นอกหรือในคลัสเตอร์ ซึ่งมีความรู้เฉพาะทาง (Domain Knowledge) ของซอฟต์แวร์นั้นๆ เช่น รู้วิธีการ Backup ดาต้าเบสอัตโนมัติ, การทำ Failover ข้ามเครื่อง, หรือการ Restore ข้อมูลเมื่อเครื่องพัง\n* เครื่องมือยอดนิยมในการพัฒนา Controller และ Operator ได้แก่ **Kubebuilder** และ **Operator Framework (Operator SDK)** ซึ่งเตรียมโครงสร้าง Client-go, Shared Informer Factory, และ Workqueue มาให้พร้อมใช้งาน"
      },
      {
        "id": "understanding-leases",
        "headingEn": "Understanding Leases in Kubernetes",
        "headingTh": "ความเข้าใจเกี่ยวกับออบเจกต์ Lease ใน coordination.k8s.io",
        "contentMarkdown": "ออบเจกต์ **`Lease`** (อยู่ในกลุ่ม API `coordination.k8s.io/v1`) คือกลไกการประสานงาน (Coordination) และการถือสิทธิ์ชั่วคราว (Distributed Lease Mechanism) ภายในคลัสเตอร์\n\nโครงสร้างของ Lease ประกอบด้วยข้อมูลสำคัญ:\n* `spec.holderIdentity`: ชื่อของคอมโพเนนต์หรือโหนดที่กำลังถือสิทธิ์ใน Lease นี้\n* `spec.leaseDurationSeconds`: ระยะเวลาที่การถือสิทธิ์นี้มีผลบังคับใช้ (เช่น 15 วินาที)\n* `spec.acquireTime`: เวลาที่ผู้ถือสิทธิ์เริ่มครอบครอง Lease\n* `spec.renewTime`: เวลาที่ผู้ถือสิทธิ์ทำการต่ออายุ (Renew) Lease ล่าสุด\n\nตัวอย่าง Manifest ของ Lease:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "lease-example.yaml",
            "code": "apiVersion: coordination.k8s.io/v1\nkind: Lease\nmetadata:\n  name: kube-controller-manager\n  namespace: kube-system\nspec:\n  holderIdentity: control-plane-node-1_e3b8a1\n  leaseDurationSeconds: 15\n  acquireTime: '2026-10-27T10:00:00.000000Z'\n  renewTime: '2026-10-27T10:05:30.000000Z'\n  leaseTransitions: 2"
          }
        ]
      },
      {
        "id": "leader-election",
        "headingEn": "Leader Election for High Availability",
        "headingTh": "การเลือกผู้นำ (Leader Election) สำหรับระบบความพร้อมใช้งานสูง (HA)",
        "contentMarkdown": "เมื่อรัน Kubernetes Control Plane ในโหมดความพร้อมใช้งานสูง (High Availability - HA) เราจะมีอินสแตนซ์ของ `kube-controller-manager` และ `kube-scheduler` รันขนานกันอยู่หลายเครื่องบน Master Nodes ต่างๆ\n\nเพื่อป้องกันไม่ให้คอนโทรลเลอร์จากหลายเครื่องส่งคำสั่งชนกัน (Split-Brain) จำเป็นต้องมีผู้นำเพียง **1 เครื่องเท่านั้น** ที่มีสิทธิ์สั่งการจริง (Active-Passive Architecture):\n\n1. อินสแตนซ์ทั้งหมดจะแข่งขันกันพยายามเขียนชื่อของตนเองลงในฟิลด์ `holderIdentity` ของ Lease ออบเจกต์\n2. เครื่องที่เขียนสำเร็จก่อนจะได้เป็น **Leader** และมีสิทธิ์สั่งรัน Control Loops\n3. Leader จะต้องส่งคำสั่งมา 'ต่ออายุ' (`renewTime`) ของ Lease อย่างสม่ำเสมอ\n4. หาก Leader เครื่องเดิมเกิดแครชหรือไฟดับ จนทำให้ `renewTime` ขาดการต่ออายุเกิน `leaseDurationSeconds` อินสแตนซ์เครื่องอื่นที่สแตนด์บายอยู่จะตรวจพบและเข้าแย่งสิทธิ์ครอบครอง Lease ขึ้นเป็น Leader ตัวใหม่ทันที (Failover ภายในไม่กี่วินาที)"
      },
      {
        "id": "node-heartbeats-lease",
        "headingEn": "Node Heartbeats via Leases",
        "headingTh": "การส่ง Heartbeat ของโหนดผ่าน kube-node-lease",
        "contentMarkdown": "ใน Kubernetes ยุคก่อนหน้า แต่ละโหนดจะส่ง Heartbeat โดยการเขียนอัปเดตสถานะลงบน `Node` Object โดยตรง ซึ่ง Node Object มีขนาดใหญ่มากและมีข้อมูลคอนฟิกมากมาย ทำให้ etcd ต้องแบกรับภาระ I/O สูงมากในคลัสเตอร์ที่มีหลายพันโหนด\n\nKubernetes จึงเปลี่ยนมาใช้กลไก **Node Heartbeat Leases**:\n* แต่ละโหนดจะมีออบเจกต์ Lease ประจำตัว 1 ชิ้น อยู่ในเนมสเปซ **`kube-node-lease`**\n* Kubelet จะส่ง Heartbeat มาอัปเดตเฉพาะฟิลด์ `renewTime` ของ Lease ทุกๆ 10 วินาที\n* มีขนาดข้อมูลเล็กมากเพียงไม่กี่ไบต์ ช่วยลดปริมาณการเขียนข้อมูลลง etcd และแบนด์วิดท์เครือข่ายลงได้อย่างมหาศาล โดยจะอัปเดต Node Object ตัวเต็มเฉพาะเมื่อมีเหตุการณ์สำคัญเกิดขึ้นจริงๆ เท่านั้น (เช่น สถานะ Condition เปลี่ยนแปลง)"
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
        "title": "Control Plane to Node Communication",
        "targetType": "concepts",
        "targetPageId": "arch-control-plane-node-comm",
        "officialUrl": "https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/"
      },
      {
        "title": "Working with Kubernetes Objects",
        "targetType": "concepts",
        "targetPageId": "overview-working-with-objects",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/"
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
