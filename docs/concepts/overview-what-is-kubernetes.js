/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/overview/
 */
(function (root) {
  const pageData = {
    "id": "overview-what-is-kubernetes",
    "categoryId": "overview",
    "categoryTitle": "Overview",
    "titleEn": "Overview",
    "titleTh": "Kubernetes คืออะไร? - ภาพรวมและหลักการฉบับสมบูรณ์",
    "officialUrl": "https://kubernetes.io/docs/concepts/overview/",
    "docsPath": "/docs/concepts/overview/",
    "diagram": {
      "src": "images/docs/components-of-kubernetes.svg",
      "caption": "สถาปัตยกรรมและวิวัฒนาการการจัดการคอนเทนเนอร์ใน Kubernetes"
    },
    "lead": "Kubernetes เป็นแพลตฟอร์ม Open-source ที่มีความยืดหยุ่น ขยายต่อได้ (Extensible) สำหรับบริหารจัดการแอปพลิเคชันที่รันในรูปแบบคอนเทนเนอร์ (Containerized Workloads & Services) โดยสนับสนุนทั้งการตั้งค่าแบบ Declarative และการทำงานแบบอัตโนมัติ (Automation)",
    "sections": [
      {
        "id": "origin-and-background",
        "headingEn": "Origin and Background",
        "headingTh": "ที่มาและความเป็นมาของ Kubernetes (K8s)",
        "contentMarkdown": "ชื่อ **Kubernetes** มีต้นกำเนิดมาจากภาษากรีก แปลว่า \"คนคัดท้ายเรือ\" หรือ \"กัปตันเรือ\" (Helmsman หรือ Pilot)\n\nตัวย่อ **K8s** มาจากการนับจำนวนตัวอักษร 8 ตัวที่อยู่ระหว่างตัว \"K\" และตัว \"s\"\n\nGoogle ได้เปิดตัวโครงการ Kubernetes เป็น Open-source ในปี 2014 โดยเป็นการผสมผสานระหว่าง**ประสบการณ์อันยาวนานกว่า 15 ปีของ Google** ในการรัน Production Workload ขนาดมหาศาล (ผ่านระบบภายในชื่อ Borg) เข้ากับแนวคิดและแนวปฏิบัติที่ดีที่สุดจากชุมชนนักพัฒนาทั่วโลก"
      },
      {
        "id": "why-you-need-kubernetes-and-what-can-it-do",
        "headingEn": "Why you need Kubernetes and what it can do",
        "headingTh": "ทำไมคุณจึงต้องใช้ Kubernetes และมันทำอะไรได้บ้าง?",
        "contentMarkdown": "คอนเทนเนอร์เป็นวิธีที่ดีเยี่ยมในการรวม Bundle และรันแอปพลิเคชันของคุณ แต่ในสภาพแวดล้อม Production จริง คุณจำเป็นต้องมีระบบที่คอยจัดการคอนเทนเนอร์เหล่านั้นเพื่อให้มั่นใจว่าจะไม่มีช่วงเวลาที่ระบบหยุดทำงาน (Zero Downtime)\n\nตัวอย่างเช่น หากคอนเทนเนอร์ตัวหนึ่งแครชหรือตายลง ระบบจะต้องเริ่มต้นคอนเทนเนอร์ตัวใหม่ขึ้นมาทดแทนทันทีอย่างอัตโนมัติ นั่นคือสิ่งที่ Kubernetes เข้ามาช่วยคุณแก้ปัญหา!\n\n**ความสามารถหลัก 10 ประการของ Kubernetes:**\n\n1. **Service discovery and load balancing (การค้นพบบริการและโหลดบาลานซ์)**:\n   Kubernetes สามารถเปิดเผยคอนเทนเนอร์ผ่านชื่อ DNS หรือผ่าน IP Address ประจำตัวได้ และหากปริมาณ Traffic พุ่งสูง ระบบจะกระจาย Network Traffic เพื่อให้ Deployment มีความเสถียรเสมอ\n\n2. **Storage orchestration (การบริหารจัดการพื้นที่จัดเก็บข้อมูล)**:\n   อนุญาตให้คุณ Mount ระบบจัดเก็บข้อมูลตามที่ต้องการได้อัตโนมัติ ไม่ว่าจะเป็น Local Storage, Cloud Storage (เช่น AWS EBS, GCP Persistent Disk, Azure Disk) หรือ Network Storage (NFS, Ceph, iSCSI)\n\n3. **Automated rollouts and rollbacks (การปล่อยเวอร์ชันและย้อนกลับอัตโนมัติ)**:\n   คุณสามารถประกาศสถานะที่ต้องการ (Desired State) สำหรับคอนเทนเนอร์ที่ Deploy และ Kubernetes สามารถทยอยเปลี่ยนสถานะจริงไปสู่สถานะที่ต้องการได้อย่างเป็นจังหวะตามอัตราที่ควบคุมได้ (เช่น Canary หรือ Rolling Update)\n\n4. **Automatic bin packing (การจัดสรรทรัพยากรลงโหนดอย่างคุ้มค่า)**:\n   คุณกำหนดค่า CPU และ Memory (RAM) ที่แต่ละคอนเทนเนอร์ต้องการ (Requests & Limits) แล้ว Kubernetes จะจัดวางคอนเทนเนอร์ลงบนโหนดต่างๆ เพื่อให้เกิดการใช้ทรัพยากรอย่างคุ้มค่าสูงสุด\n\n5. **Self-healing (การรักษาและฟื้นฟูตัวเอง)**:\n   Kubernetes จะสั่งรีสตาร์ตคอนเทนเนอร์ที่ล้มเหลว, เปลี่ยนทดแทนคอนเทนเนอร์ที่ตาย, สั่งปิดคอนเทนเนอร์ที่ไม่ตอบสนองต่อ Health Check และจะไม่ส่ง Traffic ไปให้คอนเทนเนอร์จนกว่าจะพร้อมให้บริการจริง\n\n6. **Secret and configuration management (การจัดการความลับและการตั้งค่า)**:\n   ช่วยให้คุณจัดเก็บและบริหารจัดการข้อมูลที่ละเอียดอ่อน เช่น รหัสผ่าน, OAuth Tokens, และ SSH Keys ได้อย่างปลอดภัย โดยไม่ต้อง Rebuild Container Image ใหม่\n\n7. **Batch execution (การรันงานประมวลผลเป็นชุด)**:\n   นอกเหนือจาก Long-running Services แล้ว Kubernetes ยังสามารถจัดการ Batch Workloads และ CI Workflows พร้อมระบบรันซ้ำอัตโนมัติหากงานล้มเหลว\n\n8. **Horizontal scaling (การขยายและย่อขนาดแบบแนวนอน)**:\n   ขยายหรือลดจำนวนอินสแตนซ์ของแอปพลิเคชันได้ง่ายๆ ผ่านคำสั่ง CLI, แดชบอร์ด หรือขยายอัตโนมัติตามการใช้งาน CPU (HPA)\n\n9. **IPv4/IPv6 dual-stack**:\n   รองรับการจัดสรรทั้งที่อยู่ IPv4 และ IPv6 ให้กับ Pods และ Services\n\n10. **Designed for extensibility (ออกแบบมาเพื่อรองรับการขยายต่อ)**:\n    คุณสามารถเพิ่มฟีเจอร์และ Custom Resources (CRDs) ให้กับคลัสเตอร์ได้โดยไม่ต้องแก้ไขซอร์สโค้ดหลักของ Kubernetes"
      },
      {
        "id": "what-kubernetes-is-not",
        "headingEn": "What Kubernetes is not",
        "headingTh": "สิ่งที่ Kubernetes ไม่ใช่ (What Kubernetes is not)",
        "contentMarkdown": "Kubernetes **ไม่ใช่** ระบบ PaaS (Platform as a Service) สำเร็จรูปที่รวมทุกอย่างไว้ในตัวแบบดั้งเดิม เนื่องจาก Kubernetes ทำงานในระดับคอนเทนเนอร์ไม่ใช่ระดับฮาร์ดแวร์ จึงเน้นการเตรียม Building Blocks ที่ยืดหยุ่น โดยไม่ผูกมัดหรือจำกัดทางเลือกของผู้ใช้งาน:\n\n* **ไม่จำกัดประเภทของแอปพลิเคชัน**: รองรับ Workloads ที่หลากหลาย ทั้ง Stateless, Stateful, และ Data Processing หากแอปของคุณสามารถรันในคอนเทนเนอร์ได้ ก็สามารถรันบน Kubernetes ได้อย่างราบรื่น\n* **ไม่ Deploy ซอร์สโค้ดและไม่บิลด์แอปพลิเคชัน**: Kubernetes ไม่มีระบบ CI ในตัว ผู้ใช้สามารถเลือกใช้เครื่องมือ CI/CD ตามที่ต้องการได้อิสระ\n* **ไม่มี Application-level Services ในตัว**: เช่น มิดเดิลแวร์, ดาต้าเบส, หรือ Message Queue สำเร็จรูป แต่เปิดให้คุณติดตั้งแอปพลิเคชันเหล่านี้ผ่านคอนเทนเนอร์ได้เอง\n* **ไม่ผูกขาดระบบ Logging, Monitoring หรือ Alerting**: Kubernetes มีโครงสร้างพื้นฐานรองรับ แต่ปล่อยให้ผู้ใช้เลือกใช้เครื่องมือ เช่น Prometheus, Grafana, ELK Stack ตามความเหมาะสม\n* **ไม่บังคับใช้ Configuration Language เฉพาะ**: มี Declarative API (YAML/JSON) ที่เปิดกว้างให้เครื่องมือใดๆ เชื่อมต่อได้\n* **ไม่ใช่แค่ Workflow Orchestration แบบดั้งเดิม**: ในความหมายทางเทคนิค Orchestration ทั่วไปคือการสั่งทำตามลำดับขั้นตอน (ทำ A -> B -> C) แต่ Kubernetes ประกอบด้วยกลุ่มของกระบวนการควบคุมที่เป็นอิสระ (Independent Control Loops) ซึ่งคอยผลักดันสถานะปัจจุบันเข้าสู่ Desired State อย่างต่อเนื่อง โดยไม่สำคัญว่าจะมีจุดเริ่มต้นหรือเส้นทางอย่างไร ทำให้ระบบมีความทนทาน (Resilient) และขยายต่อได้ดีกว่าอย่างมหาศาล"
      },
      {
        "id": "historical-context-going-back-in-time",
        "headingEn": "Historical context: Traditional vs Virtualized vs Container Deployment",
        "headingTh": "ย้อนรอยวิวัฒนาการ: Traditional สู่ Virtualized จนถึง Container Deployment",
        "contentMarkdown": "เพื่อทำความเข้าใจว่าทำไม Kubernetes จึงมีความจำเป็น เรามาดูวิวัฒนาการ 3 ยุคสำคัญของการ Deploy ซอฟต์แวร์:\n\n### 1. Traditional Deployment Era (ยุคดั้งเดิม)\n* องค์กรต่างๆ จะรันแอปพลิเคชันลงบน Physical Server โดยตรง\n* **ปัญหาสำคัญ**: ไม่สามารถกำหนดขอบเขตทรัพยากร (Resource Boundaries) ระหว่างแอปพลิเคชันได้ หากแอปตัวหนึ่งกิน Memory จนหมด จะดึงให้แอปตัวอื่นบนเซิร์ฟเวอร์เดียวกันล่มตามไปด้วย และการซื้อเซิร์ฟเวอร์แยกแต่ละแอปพลิเคชันก็มีต้นทุนมหาศาลและใช้ทรัพยากรไม่คุ้มค่า\n\n### 2. Virtualized Deployment Era (ยุคเครื่องเสมือน VM)\n* เทคโนโลยี Virtualization เข้ามาแก้ปัญหาโดยทำให้สามารถรัน Virtual Machines (VMs) หลายเครื่องบน CPU ของ Physical Server เดียวกันได้\n* มีความปลอดภัยและเป็นสัดส่วนสูงขึ้นเนื่องจากแอปถูกแยกขาดจากกันในระดับ Guest OS\n* **ข้อเสีย**: แต่ละ VM มี Overhead สูง เพราะต้องแบกรับระบบปฏิบัติการของตัวเองเต็มรูปแบบ ทำให้กินแรม กินเนื้อที่ และสตาร์ตช้า\n\n### 3. Container Deployment Era (ยุคคอนเทนเนอร์)\n* คอนเทนเนอร์มีแนวคิดคล้าย VM แต่จะ**แชร์ระบบปฏิบัติการ (OS Kernel) ร่วมกัน**ระหว่างแอปพลิเคชัน ทำให้คอนเทนเนอร์มีน้ำหนักเบา (Lightweight) เริ่มต้นทำงานได้ในระดับเสี้ยววินาที\n* คอนเทนเนอร์แยกส่วน Filesystem, CPU, Memory และ Process Space ของตนเองออกจากกัน\n\n**ประโยชน์สำคัญที่ทำให้ Container ได้รับความนิยม:**\n* **Agile Creation & Deployment**: สร้างและนำอิมเมจไปรันได้สะดวกรวดเร็วกว่า VM\n* **Dev and Ops Separation**: แยกความรับผิดชอบชัดเจน นักพัฒนาสร้างอิมเมจที่พร้อมรันตั้งแต่ขั้นตอน Build ทำให้แอปพลิเคชันไม่ผูกติดกับโครงสร้างพื้นฐานเบื้องล่าง\n* **Environmental Consistency**: สิ่งที่รันบน Laptop ของคุณ จะทำงานเหมือนกันเป๊ะบน Staging และบน Production Cloud\n* **Cloud and OS Portability**: รันได้ทุกที่ ทั้งบน Ubuntu, RHEL, On-premises หรือ Public Clouds ชั้นนำ\n* **Resource Isolation & Predictable Performance**: ควบคุมทรัพยากรได้อย่างแม่นยำ ประสิทธิภาพคาดเดาได้"
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "เมื่อเข้าใจภาพรวมของ Kubernetes แล้ว แนะนำให้ศึกษาเนื้อหาต่อเนื่องในส่วนสถาปัตยกรรมและเครื่องมือ:\n* ศึกษา [Kubernetes Components (สถาปัตยกรรมและส่วนประกอบ)](https://kubernetes.io/docs/concepts/overview/components/)\n* ศึกษา [The Kubernetes API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/)\n* ศึกษาคู่มือการใช้ [kubectl](https://kubernetes.io/docs/concepts/overview/kubectl/) สำหรับสั่งการคลัสเตอร์"
      }
    ],
    "relatedLinks": [
      {
        "title": "Kubernetes Components (สถาปัตยกรรมและส่วนประกอบ)",
        "targetType": "concepts",
        "targetPageId": "overview-components",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/components/"
      },
      {
        "title": "Working with Objects in Kubernetes (การทำงานกับออบเจกต์)",
        "targetType": "concepts",
        "targetPageId": "overview-working-with-objects",
        "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/"
      },
      {
        "title": "Install and Set Up kubectl (คู่มือติดตั้งเครื่องมือ)",
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
