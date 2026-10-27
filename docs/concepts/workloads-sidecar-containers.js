/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/
 */
(function (root) {
  const pageData = {
    "id": "workloads-sidecar-containers",
    "categoryId": "workloads",
    "categoryTitle": "Workloads",
    "titleEn": "Sidecar Containers",
    "titleTh": "ไซด์คาร์คอนเทนเนอร์ (Sidecar Containers) - สถาปัตยกรรม Native Sidecar ใน Kubernetes",
    "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/",
    "docsPath": "/docs/concepts/workloads/pods/sidecar-containers/",
    "diagram": {
      "src": "images/docs/multi-container-sidecar.svg",
      "caption": "สถาปัตยกรรม Sidecar Container: ทำงานเคียงข้าง Main Application และแชร์ Volume/Network ร่วมกัน"
    },
    "lead": "ไซด์คาร์คอนเทนเนอร์ (Sidecar Containers) คือคอนเทนเนอร์เสริมที่ทำงานอยู่เคียงข้างแอปพลิเคชันหลักภายในพอดเดียวกัน เพื่อขยายขีดความสามารถ เช่น การเก็บรวบรวม Log, การส่งต่อสถิติ Metrics, หรือ Service Mesh Proxy โดยตั้งแต่ Kubernetes 1.28+ ได้เปิดตัวฟีเจอร์ Native Sidecar Containers ที่จัดการวงจรชีวิตได้อย่างสมบูรณ์แบบ",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\n**Native Sidecar Containers** (Kubernetes 1.28+, GA 1.32) คือการรองรับรูปแบบ Sidecar อย่างเป็นทางการในระดับสถาปัตยกรรม โดยกำหนดเป็นคอนเทนเนอร์ใน `spec.initContainers` ที่มีฟิลด์ `restartPolicy: Always` ทำให้เริ่มทำงานก่อนแอปพลิเคชันหลัก อยู่รันต่อเนื่องตลอดอายุขัยพอด และไม่บล็อกการปิดตัวของ Kubernetes Jobs\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **ปัญหาของ Sidecar แบบดั้งเดิม**: Sidecar ใน `spec.containers` ไม่มีลำดับการเริ่มและปิดที่แน่นอน และในเวิร์กโหลดประเภท Job ตัว Sidecar จะรันค้างไม่ยอมจบ ทำให้ Job ไม่สำเร็จสมบูรณ์\n- **ไวยากรณ์ Native Sidecar**: ประกาศไว้ใน `spec.initContainers` พร้อมระบุฟิลด์ `restartPolicy: Always`\n- **ลำดับการเริ่มต้นทำงาน (Startup Sequence)**:\n  1. Kubelet เริ่มรัน Native Sidecar ในช่วงของ Init Containers\n  2. หากกำหนด `startupProbe` ไว้ ระบบจะรอจนกว่า Probe จะผ่าน (`Success`)\n  3. เมื่อผ่านแล้ว Kubelet จึงจะเริ่ม Init Container ถัดไปหรือแอปพลิเคชันหลัก\n- **ลำดับการปิดระบบ (Termination Sequence)**:\n  1. Kubelet ส่งสัญญาณปิด (`SIGTERM`) ไปยัง Application Containers หลักทั้งหมดก่อน\n  2. เมื่อแอปหลักปิดการทำงานเสร็จสิ้นสมบูรณ์ Kubelet จึงจะส่ง `SIGTERM` ไปปิด Native Sidecar\n- **การแก้ปัญหา Job**: เมื่อแอปพลิเคชันหลักของ Job ทำงานเสร็จ (Exit 0) Kubelet จะสั่งปิด Native Sidecar ให้อัตโนมัติ ทำให้ Job จบสถานะ `Completed` ได้ทันที\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **ตัวอย่าง YAML ของ Native Sidecar**:\n  ```yaml\n  spec:\n    initContainers:\n    - name: log-collector\n      image: fluent/fluent-bit:latest\n      restartPolicy: Always\n      startupProbe:\n        httpGet:\n          path: /api/v1/health\n          port: 2020\n    containers:\n    - name: app\n      image: myapp:v1\n  ```\n- **ข้อเปรียบเทียบในห้องสอบ**:\n  - *Init Container ทั่วไป*: รันจบทีละตัว ➔ บล็อกตัวถัดไปจน Exit 0\n  - *Regular Container*: สตาร์ตรันขนานกัน ไม่การันตีลำดับ\n  - *Native Sidecar*: สตาร์ตก่อนและบล็อกจน Startup Probe ผ่าน ➔ รันยาวต่อเนื่องตลอดชีพ ➔ ปิดหลังสุด",
    "sections": [
      {
        "id": "what-is-a-sidecar",
        "headingEn": "What is a Sidecar Container?",
        "headingTh": "ไซด์คาร์คอนเทนเนอร์คืออะไร และปัญหาในอดีต",
        "contentMarkdown": "รูปแบบ **Sidecar Pattern** เป็นดีไซน์แพตเทิร์นยอดนิยมในระบบคลาวด์ ซึ่งเปรียบเสมือนรถมอเตอร์ไซค์พ่วงข้าง โดยมีคอนเทนเนอร์หลัก (Main App) ทำหน้าที่ขับเคลื่อนฟังก์ชันทางธุรกิจ และมีคอนเทนเนอร์เสริม (Sidecar) คอยสนับสนุนบริการเสริม เช่น:\n\n* **Log Shipping**: ส่งต่อ Log ไฟล์ของแอปพลิเคชันไปยังศูนย์กลางจัดเก็บ (เช่น Fluentbit หรือ Vector)\n* **Service Mesh Proxies**: จัดการ Network Routing, mTLS, และ Telemetry (เช่น Envoy Proxy ใน Istio/Linkerd)\n* **Secret Management / Vault Agent**: คอยดึงและหมุนเวียน API Keys หรือ Token ลงใน Shared Volume\n\n### ปัญหาของ Sidecar ใน Kubernetes ยุคดั้งเดิม:\nในอดีต Kubernetes ไม่มีการแยกแยะความแตกต่างระหว่าง Sidecar และ App Container ปกติใน `spec.containers` ทำให้เกิดปัญหาใหญ่ 2 ประการ:\n1. **App เริ่มก่อน Sidecar พร้อม**: แอปหลักสตาร์ตขึ้นมาและพยายามเชื่อมต่อเน็ตเวิร์ก แต่พร็อกซี Sidecar ยังไม่พร้อม ทำให้แอปแครชทันที\n2. **ปัญหาใน Kubernetes Jobs**: เมื่อโค้ดของ Job ทำงานเสร็จแล้ว แต่พอดไม่ยอมจบการทำงาน (ค้างอยู่ที่ `Not Completed`) เพราะคอนเทนเนอร์ Sidecar ยังคงรันไม่หยุด"
      },
      {
        "id": "native-sidecars-kubernetes",
        "headingEn": "Native Sidecar Containers",
        "headingTh": "สถาปัตยกรรม Native Sidecars (Kubernetes 1.28+)",
        "contentMarkdown": "เพื่อแก้ปัญหาดังกล่าวอย่างถาวร Kubernetes ได้เปิดตัวฟีเจอร์ **Native Sidecar Containers** (GA ใน Kubernetes 1.32)\n\n### หลักการกำหนดค่า (Syntax Rule):\nแทนที่จะเขียนไว้ใน `spec.containers` ให้กำหนดคอนเทนเนอร์ Sidecar ไว้ใน **`spec.initContainers`** พร้อมทั้งระบุฟิลด์พิเศษ:\n\n```yaml\nrestartPolicy: Always\n```\n\nเมื่อ Kubelet พบว่า Init Container ตัวใดมี `restartPolicy: Always` ระบบจะรับรู้ทันทีว่านี่คือ **Native Sidecar Container** และจะปรับเปลี่ยนพฤติกรรมวงจรชีวิตให้ทำงานตลอดอายุขัยของพอด"
      },
      {
        "id": "sidecar-lifecycle-and-startup",
        "headingEn": "Sidecar Lifecycle & Startup Sequence",
        "headingTh": "วงจรชีวิตและลำดับการสตาร์ตของ Native Sidecar",
        "contentMarkdown": "Native Sidecar มีลำดับการเริ่มต้นทำงานที่เป็นระเบียบและแน่นอน:\n\n1. Kubelet เริ่มรัน Native Sidecar ในช่วงของ Init Containers ตามลำดับที่ระบุ\n2. หาก Sidecar มีการกำหนด **`startupProbe`** ระบบ Kubelet จะรอจนกระทั่ง Startup Probe ผ่านการตรวจสอบสำเร็จ (`Success`) เสียก่อน\n3. เมื่อ Probe ผ่านแล้ว Kubelet จึงจะอนุญาตให้เริ่มรัน Init Container ลำดับถัดไป หรืออนุญาตให้ Main Application Containers เริ่มต้นทำงาน\n\n> [!NOTE]\n> การันตีนี้ช่วยรับประกันว่า เมื่อแอปพลิเคชันหลักตื่นขึ้นมา Service Mesh หรือ Database Proxy ที่เป็น Sidecar จะพร้อมให้บริการทันที 100% หมดปัญหา Connection Refused ตอนบูตเครื่อง"
      },
      {
        "id": "sidecar-shutdown-sequence",
        "headingEn": "Graceful Shutdown Sequence",
        "headingTh": "ลำดับการปิดระบบอย่างสง่างาม (Termination Sequence)",
        "contentMarkdown": "ในขั้นตอนการปิดตัวหรือลบพอด (Pod Termination) Native Sidecar จะปฏิบัติตามลำดับย้อนกลับอย่างเคร่งครัด:\n\n1. Kubelet จะส่งสัญญาณปิด (`SIGTERM` หรือเรียก `PreStop`) ไปยัง **Main Application Containers ทั้งหมดก่อน**\n2. Kubelet รอจนกระทั่งแอปพลิเคชันหลักปิดการทำงานเสร็จสิ้นทั้งหมด\n3. จากนั้น Kubelet จึงจะส่งสัญญาณปิดไปยัง **Native Sidecar Containers เป็นลำดับสุดท้าย**\n\nลำดับนี้มีความสำคัญอย่างยิ่ง เพราะช่วยให้ Sidecar ที่ทำหน้าที่ส่ง Log หรือบันทึก Metrics สามารถเก็บตกข้อมูลช่วงวินาทีสุดท้ายของการปิดแอปพลิเคชันหลักได้อย่างครบถ้วนโดยไม่มีข้อมูลสูญหาย"
      },
      {
        "id": "jobs-and-sidecars",
        "headingEn": "Sidecars with Jobs and Batch Workloads",
        "headingTh": "การแก้ไขปัญหา Sidecar บน Kubernetes Jobs",
        "contentMarkdown": "สำหรับเวิร์กโหลดประเภท **Job** หรือ **CronJob** เมื่อรัน Native Sidecar:\n\n* เมื่อคอนเทนเนอร์ของ Job (Main Container) ทำงานเสร็จสิ้นสมบูรณ์ (Exit 0)\n* Kubernetes จะมองว่าภารกิจของพอดสำเร็จแล้วทันที และ Kubelet จะส่งสัญญาณ `SIGTERM` ไปปิดคอนเทนเนอร์ Native Sidecar ให้อัตโนมัติ\n* พอดของ Job จะสามารถเปลี่ยนสถานะเป็น `Completed` ได้อย่างถูกต้องและตรงไปตรงมา โดยไม่ต้องเขียน Shell Hack สคริปต์เพื่อสั่งฆ่า Sidecar เหมือนในอดีตอีกต่อไป"
      },
      {
        "id": "manifest-example-and-comparison",
        "headingEn": "Manifest Example & Comparison",
        "headingTh": "ตัวอย่าง Manifest และตารางเปรียบเทียบคอนเทนเนอร์ 3 รูปแบบ",
        "contentMarkdown": "ตัวอย่าง Manifest ของ Pod ที่ใช้ Native Sidecar สำหรับรวบรวม Log:\n\n| คุณสมบัติ | Init Container ทั่วไป | Regular Container | Native Sidecar (`restartPolicy: Always`) |\n| :--- | :--- | :--- | :--- |\n| **บล็อกลำดับถัดไปตอนเริ่ม** | บล็อกจนรันเสร็จ (Exit 0) | ไม่บล็อก รันขนานกัน | บล็อกจน `startupProbe` ผ่าน |\n| **ระยะเวลาทำงาน** | จบงานแล้วหยุด (One-shot) | ทำงานตลอดอายุพอด | ทำงานตลอดอายุพอด |\n| **ลำดับการปิดตัว** | ไม่เกี่ยวข้อง (จบไปแล้ว) | ปิดพร้อมกันตามปกติ | ปิดตัว **เป็นลำดับสุดท้าย** |\n| **ผลต่อการจบงานของ Job** | ไม่ขัดขวางการจบงาน | ทำให้ Job ค้างไม่ยอมจบ | **ระบบสั่งปิดให้อัตโนมัติ** |",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "native-sidecar-demo.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: app-with-native-sidecar\nspec:\n  initContainers:\n  - name: log-shipper-sidecar\n    image: fluent/fluent-bit:latest\n    restartPolicy: Always\n    volumeMounts:\n    - name: shared-logs\n      mountPath: /var/log/app\n  containers:\n  - name: main-application\n    image: nginx:alpine\n    volumeMounts:\n    - name: shared-logs\n      mountPath: /var/log/nginx\n  volumes:\n  - name: shared-logs\n    emptyDir: {}"
          }
        ]
      }
    ],
    "relatedLinks": [
      {
        "title": "Init Containers (อินิตคอนเทนเนอร์)",
        "targetType": "concepts",
        "targetPageId": "workloads-init-containers",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/init-containers/"
      },
      {
        "title": "Pods Overview (สถาปัตยกรรมพอด)",
        "targetType": "concepts",
        "targetPageId": "workloads-pods",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/"
      },
      {
        "title": "Jobs and CronJobs (งานแบบแบตช์)",
        "targetType": "concepts",
        "targetPageId": "workloads-jobs-cronjobs",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/job/"
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
