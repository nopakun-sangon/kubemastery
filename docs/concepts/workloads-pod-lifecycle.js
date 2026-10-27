/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
 */
(function (root) {
  const pageData = {
    "id": "workloads-pod-lifecycle",
    "categoryId": "workloads",
    "categoryTitle": "Workloads",
    "titleEn": "Pod Lifecycle",
    "titleTh": "วงจรชีวิตของพอด (Pod Lifecycle)",
    "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/",
    "docsPath": "/docs/concepts/workloads/pods/pod-lifecycle/",
    "diagram": {
      "src": "images/docs/pod-lifecycle-phases.svg",
      "caption": "ลำดับการเปลี่ยนผ่านสถานะของพอด (Pod Phases), Container States และบทบาทของ Health Probes"
    },
    "lead": "หน้านี้จะอธิบายวงจรชีวิตของ Pod โดยพอดใน Kubernetes จะดำเนินไปตามวงจรชีวิตที่กำหนดไว้อย่างเป็นระเบียบ เริ่มต้นในระยะ `Pending` จากนั้นเคลื่อนผ่านระยะ `Running` หากมีคอนเทนเนอร์หลักอย่างน้อยหนึ่งตัวเริ่มทำงานได้สำเร็จ และจากนั้นจะเข้าสู่ระยะ `Succeeded` หรือ `Failed` ขึ้นอยู่กับว่ามีคอนเทนเนอร์ใดในพอดที่จบการทำงานด้วยความล้มเหลวหรือไม่",
    "sections": [
      {
        "id": "pod-lifetime",
        "headingEn": "Pod lifetime",
        "headingTh": "อายุขัยของพอด (Pod lifetime)",
        "contentMarkdown": "เช่นเดียวกับคอนเทนเนอร์ของแอปพลิเคชันแต่ละตัว พอดถูกออกแบบให้เป็นเอนทิตีที่ค่อนข้างเป็นสิ่งชั่วคราว (Ephemeral) มากกว่าที่จะคงอยู่ถาวร พอดจะถูกสร้างขึ้น ได้รับการจัดสรร ID ที่ไม่ซ้ำกัน (UID) และถูกจัดตารางเวลา (Scheduled) ให้ไปรันบนโหนดที่มันจะคงอยู่จนกว่าจะสิ้นสุดการทำงาน (ตามค่า `restartPolicy`) หรือจนกว่าจะถูกลบออก หากโหนดตายลง พอดที่ถูกจัดสรรไปยังโหนดนั้นก็จะถูกกำหนดเวลาให้ถูกลบทิ้งหลังจากพ้นระยะเวลา Timeout\n\n### Pods and fault recovery\nในขณะที่พอดกำลังทำงาน ตัว `kubelet` สามารถรีสตาร์ตคอนเทนเนอร์เพื่อจัดการกับข้อผิดพลาดบางประเภทได้ ภายในพอด Kubernetes จะติดตามสถานะของคอนเทนเนอร์ที่แตกต่างกันและกำหนดว่าจะต้องดำเนินการอย่างไรเพื่อให้พอดกลับมามีสุขภาพดีอีกครั้ง\n\n### Associated lifetimes\nหากมีสิ่งใดที่ระบุว่ามีอายุขัยเท่ากับพอด เช่น Volume นั่นหมายความว่าสิ่งนั้นจะคงอยู่ตราบเท่าที่พอดนั้น (ที่มี UID นั้น) ยังคงอยู่ หากพอดถูกลบไม่ว่าด้วยสาเหตุใดก็ตาม และแม้ว่าจะมีการสร้างพอดทดแทนที่เหมือนกันทุกประการขึ้นมา สิ่งที่ผูกอยู่กับพอดเดิม (เช่น Volume ชั่วคราว) ก็จะถูกทำลายและสร้างขึ้นมาใหม่ด้วยเช่นกัน"
      },
      {
        "id": "pod-phase",
        "headingEn": "Pod phase",
        "headingTh": "ระยะของพอด (Pod phase)",
        "contentMarkdown": "ฟิลด์ `status` ของ Pod เป็นอ็อบเจกต์ `PodStatus` ซึ่งมีฟิลด์ `phase` อยู่ภายใน โดยระยะ (Phase) ของพอดคือการสรุประดับสูงอย่างง่ายว่าพอดอยู่ในจุดใดของวงจรชีวิต โดยค่าที่เป็นไปได้สำหรับ `phase` มี 5 ค่าดังนี้:\n\n* **`Pending`**: พอดได้รับการยอมรับเข้าสู่คลัสเตอร์ Kubernetes แล้ว แต่มีคอนเทนเนอร์อย่างน้อยหนึ่งตัวที่ยังไม่ได้ถูกตั้งค่าและทำให้พร้อมรัน ซึ่งรวมถึงเวลาที่พอดกำลังรอการจัดตารางเวลา (Scheduling) ตลอดจนเวลาที่ใช้ในการดาวน์โหลดคอนเทนเนอร์อิมเมจผ่านเครือข่าย\n* **`Running`**: พอดถูกผูกเข้ากับโหนดเรียบร้อยแล้ว และคอนเทนเนอร์ทั้งหมดถูกสร้างขึ้นแล้ว โดยมีคอนเทนเนอร์อย่างน้อยหนึ่งตัวที่กำลังรันอยู่ หรืออยู่ในกระบวนการเริ่มต้นหรือกำลังรีสตาร์ต\n* **`Succeeded`**: คอนเทนเนอร์ทั้งหมดในพอดได้สิ้นสุดการทำงานด้วยความสำเร็จแล้ว และจะไม่ถูกรีสตาร์ตขึ้นมาอีก\n* **`Failed`**: คอนเทนเนอร์ทั้งหมดในพอดได้สิ้นสุดการทำงานแล้ว และมีคอนเทนเนอร์อย่างน้อยหนึ่งตัวที่สิ้นสุดการทำงานด้วยความล้มเหลว นั่นคือคอนเทนเนอร์จบการทำงานด้วยสถานะที่ไม่ใช่ศูนย์ (Non-zero exit status) หรือถูกระบบสั่งยุติการทำงาน\n* **`Unknown`**: ไม่สามารถรับรู้สถานะของพอดได้ด้วยเหตุผลบางประการ โดยปกติมักเกิดจากข้อผิดพลาดในการสื่อสารกับโฮสต์ที่พอดนั้นรันอยู่\n\n> **หมายเหตุ (Note):** เมื่อพอดกำลังถูกลบ มันจะแสดงเป็นสถานะ `Terminating` ในคำสั่งของ `kubectl` บางคำสั่ง ทั้งนี้สถานะ `Terminating` ไม่ใช่หนึ่งใน Pod phases แต่เป็นพอดที่ได้รับการกำหนดระยะเวลาผ่อนผันเพื่อปิดตัวลง (ค่าเริ่มต้นคือ 30 วินาที)"
      },
      {
        "id": "container-states",
        "headingEn": "Container states",
        "headingTh": "สถานะของคอนเทนเนอร์ (Container states)",
        "contentMarkdown": "นอกจากระยะของพอดโดยรวมแล้ว Kubernetes ยังติดตามสถานะของแต่ละคอนเทนเนอร์ภายในพอดด้วย โดยใช้ Container Runtime Hooks เพื่อทริกเกอร์เหตุการณ์ในบางจุดของวงจรชีวิตคอนเทนเนอร์ เมื่อ Scheduler จัดสรรพอดให้กับโหนดแล้ว `kubelet` จะเริ่มสร้างคอนเทนเนอร์สำหรับพอดนั้นโดยใช้ Container Runtime ซึ่งมีสถานะของคอนเทนเนอร์ที่เป็นไปได้ 3 สถานะ คือ `Waiting`, `Running`, และ `Terminated`:\n\n### Waiting\nหากคอนเทนเนอร์ไม่ได้อยู่ในสถานะ `Running` หรือ `Terminated` มันจะอยู่ในสถานะ `Waiting` คอนเทนเนอร์ในสถานะ `Waiting` คือคอนเทนเนอร์ที่กำลังปฏิบัติการที่จำเป็นเพื่อให้เริ่มต้นทำงานสำเร็จ เช่น การดึงคอนเทนเนอร์อิมเมจจาก Container Registry หรือการนำข้อมูล Secret มาผูกใช้งาน พร้อมแสดงฟิลด์ Reason เพื่ออธิบายสาเหตุ\n\n### Running\nสถานะ `Running` บ่งชี้ว่าคอนเทนเนอร์กำลังประมวลผลอยู่โดยไม่มีปัญหา หากมีการกำหนดค่า `postStart` hook ไว้ มันได้ถูกสั่งทำงานและเสร็จสิ้นไปแล้ว เมื่อใช้ `kubectl describe pod` คุณจะเห็นข้อมูลเวลาที่คอนเทนเนอร์เข้าสู่สถานะ `Running`\n\n### Terminated\nคอนเทนเนอร์ในสถานะ `Terminated` คือคอนเทนเนอร์ที่เคยเริ่มทำงานไปแล้ว และต่อมาได้รันจนจบสมบูรณ์ หรือล้มเหลวด้วยเหตุผลบางประการ เมื่อใช้ `kubectl describe pod` จะเห็นเหตุผล รหัสทางออก (Exit code) รวมถึงเวลาเริ่มต้นและเวลาสิ้นสุดของคอนเทนเนอร์นั้น"
      },
      {
        "id": "how-pods-handle-problems-with-containers",
        "headingEn": "How Pods handle problems with containers",
        "headingTh": "วิธีที่พอดจัดการกับปัญหาของคอนเทนเนอร์ (How Pods handle problems with containers)",
        "contentMarkdown": "Kubernetes จัดการความล้มเหลวของคอนเทนเนอร์ภายในพอดโดยใช้นโยบาย `restartPolicy` ที่กำหนดไว้ใน Pod `spec` นโยบายนี้จะกำหนดว่า Kubernetes จะตอบสนองอย่างไรเมื่อคอนเทนเนอร์จบการทำงานเนื่องจากข้อผิดพลาดหรือสาเหตุอื่น:\n\n### Container restarts\nค่าที่เป็นไปได้สำหรับ `restartPolicy` ได้แก่:\n* **`Always`**: รีสตาร์ตคอนเทนเนอร์โดยอัตโนมัติหลังจากการสิ้นสุดการทำงานทุกครั้ง นี่คือค่าเริ่มต้น (Default)\n* **`OnFailure`**: รีสตาร์ตคอนเทนเนอร์เฉพาะเมื่อคอนเทนเนอร์จบการทำงานด้วยข้อผิดพลาด (Non-zero exit status) เท่านั้น\n* **`Never`**: ไม่รีสตาร์ตคอนเทนเนอร์ที่สิ้นสุดการทำงานเลยโดยอัตโนมัติ\n\n### Reduced container restart delay\nหลังจากคอนเทนเนอร์ในพอดหยุดทำงานและต้องรีสตาร์ต ตัว `kubelet` จะหน่วงเวลาก่อนทำการรีสตาร์ตด้วยอัตราแบบทวีคูณ (**Exponential back-off delay**: 10 วินาที, 20 วินาที, 40 วินาที, ...) โดยมีเพดานสูงสุดอยู่ที่ **5 นาที (300 วินาที)** ในระหว่างขั้นตอนนี้จะแสดงสถานะเป็น `CrashLoopBackOff` และเมื่อคอนเทนเนอร์รันได้อย่างต่อเนื่องเป็นเวลา **10 นาที** โดยไม่มีปัญหา ตัว `kubelet` จะทำการรีเซ็ตตัวนับเวลาหน่วง (Back-off timer) ของคอนเทนเนอร์นั้นกลับเป็นศูนย์\n\n### Configurable container restart delay\nคุณสามารถกำหนดค่าหรือปรับแต่งพฤติกรรมการรีสตาร์ตระดับคอนเทนเนอร์และระยะเวลา Back-off ได้ตามฟีเจอร์ใหม่ของ Kubernetes สำหรับงานเฉพาะทาง"
      },
      {
        "id": "pod-conditions",
        "headingEn": "Pod conditions",
        "headingTh": "เงื่อนไขสถานะของพอด (Pod conditions)",
        "contentMarkdown": "Pod มี `PodStatus` ซึ่งมีอาร์เรย์ของ `PodConditions` ที่พอดได้ผ่านหรือยังไม่ผ่าน โดยแต่ละรายการในอาร์เรย์จะมีฟิลด์ `type` ดังต่อไปนี้:\n\n* **`PodScheduled`**: พอดได้รับการจัดตารางเวลาไปยังโหนดเรียบร้อยแล้ว\n* **`PodReadyToStartContainers`**: (ฟีเจอร์เบต้า เปิดเป็นค่าเริ่มต้น) Sandbox ของพอดถูกสร้างขึ้นสำเร็จและเครือข่ายถูกตั้งค่าเรียบร้อยแล้ว\n* **`ContainersReady`**: คอนเทนเนอร์ทั้งหมดในพอดมีความพร้อมแล้ว\n* **`Initialized`**: Init containers ทั้งหมดได้เริ่มต้นและทำงานเสร็จสมบูรณ์แล้ว\n* **`Ready`**: พอดสามารถให้บริการคำขอได้แล้ว และควรถูกเพิ่มเข้าไปในกลุ่ม Load balancing ของทุก Services ที่ตรงเงื่อนไข\n\n### Pod readiness\nแอปพลิเคชันของคุณสามารถฉีดการตรวจสอบหรือสัญญาณเพิ่มเติมเข้าไปใน `PodStatus` ได้ผ่านกลไก **Pod readiness** โดยระบุรายการ `readinessGates` ใน `spec` ของพอด\n\n### Status for Pod readiness\nคุณสามารถใช้คำสั่ง `kubectl patch` เพื่ออัปเดตสถานะของ Custom readiness gate condition ได้\n\n### Pod readiness to start containers\nเงื่อนไข `PodReadyToStartContainers` จะถูกตั้งเป็น `True` โดย Kubelet หลังจากที่สร้าง Pod sandbox และกำหนดค่าเครือข่ายเสร็จสมบูรณ์แล้ว"
      },
      {
        "id": "resizing-pods",
        "headingEn": "Resizing Pods",
        "headingTh": "การปรับขนาดทรัพยากรของพอด (Resizing Pods)",
        "contentMarkdown": "### In-place Pod resize\nKubernetes รองรับการปรับขนาดทรัพยากร CPU และ Memory ของคอนเทนเนอร์ที่กำลังรันอยู่โดยไม่ต้องสร้างพอดใหม่ (In-place Pod Vertical Scaling) โดยกำหนด `resizePolicy` สำหรับแต่ละทรัพยากร (`NotRequired` หรือ `RestartContainer`)\n\n### Resizing by launching replacement Pods\nหากไม่ใช้การปรับขนาดแบบ In-place การเปลี่ยนขนาดทรัพยากรใน Pod Template ของ Workload Controller (เช่น Deployment) จะเป็นการทริกเกอร์ให้สร้างพอดชุดใหม่ขึ้นมาแทนที่พอดชุดเดิม"
      },
      {
        "id": "container-probes",
        "headingEn": "Container probes",
        "headingTh": "โพรบตรวจสอบสุขภาพคอนเทนเนอร์ (Container probes)",
        "contentMarkdown": "**Probe** คือการตรวจวินิจฉัยที่ดำเนินการเป็นระยะโดย `kubelet` กับคอนเทนเนอร์ เพื่อทำการตรวจวินิจฉัย `kubelet` สามารถเรียกใช้ Handler ภายในคอนเทนเนอร์ หรือส่งคำขอเครือข่ายไปยังคอนเทนเนอร์ได้ โดยมีกลไกตรวจสอบ 4 รูปแบบ (`exec`, `grpc`, `httpGet`, `tcpSocket`) และมี Probe 3 ชนิด:\n\n### Startup probe\nบ่งชี้ว่าแอปพลิเคชันภายในคอนเทนเนอร์ได้เริ่มต้นทำงานแล้วหรือไม่ โพรบอื่นๆ ทั้งหมดจะถูกปิดการทำงานไว้หากมีการกำหนด Startup probe จนกว่า Startup probe จะทำงานสำเร็จ หาก Startup probe ล้มเหลว `kubelet` จะฆ่าคอนเทนเนอร์และคอนเทนเนอร์จะต้องเข้าสู่กระบวนการตาม `restartPolicy`\n\n### Liveness probe\nบ่งชี้ว่าคอนเทนเนอร์กำลังทำงานอยู่หรือไม่ หาก Liveness probe ล้มเหลว `kubelet` จะฆ่าคอนเทนเนอร์ และคอนเทนเนอร์จะต้องปฏิบัติตาม `restartPolicy` ของมัน (ใช้ตรวจจับอาการ Deadlock ที่โปรเซสยังรันอยู่แต่ไม่สามารถประมวลผลต่อได้)\n\n### Readiness probe\nบ่งชี้ว่าคอนเทนเนอร์พร้อมที่จะตอบสนองต่อคำขอ (Requests) หรือไม่ หาก Readiness probe ล้มเหลว ตัว Endpoints controller จะลบที่อยู่ IP ของพอดออกจาก Endpoints ของทุก Services ที่ตรงกับพอดนั้น"
      },
      {
        "id": "termination-of-pods",
        "headingEn": "Termination of Pods",
        "headingTh": "การยุติการทำงานของพอด (Termination of Pods)",
        "contentMarkdown": "เนื่องจากพอดเป็นตัวแทนของโปรเซสที่รันอยู่บนโหนดในคลัสเตอร์ จึงเป็นสิ่งสำคัญที่จะต้องอนุญาตให้โปรเซสเหล่านั้นปิดตัวลงอย่างนุ่มนวล (**Gracefully terminate**) เมื่อไม่ต้องการใช้งานอีกต่อไป แทนที่จะถูกตัดจบด้วยสัญญาณ `KILL` โดยไม่มีโอกาสเคลียร์สถานะ\n\n### Stop Signals\nโดยปกติเมื่อถึงเวลาต้องหยุดคอนเทนเนอร์ Container runtime จะส่งสัญญาณระบบ (ค่าเริ่มต้นคือ `SIGTERM`) ไปยังโปรเซสหลัก (PID 1)\n\n### Defining custom stop signals\nสามารถปรับแต่งสัญญาณหยุดได้ในสเปกของคอนเทนเนอร์หากระบบปฏิบัติการและรันไทม์รองรับ\n\n### Pod Termination Flow\nเมื่อผู้ใช้สั่งลบพอด (ระยะเวลาผ่อนผันเริ่มต้นคือ **30 วินาที**):\n1. API Server บันทึกเวลา `deletionTimestamp` ที่พอดควรถือว่าตายลง และแสดงสถานะ `Terminating`\n2. `kubelet` เริ่มกระบวนการปิดพอด:\n   * หากคอนเทนเนอร์มี `preStop` hook ตัว `kubelet` จะรัน Hook นั้นภายในคอนเทนเนอร์ก่อน\n   * จากนั้น `kubelet` จะสั่งให้ Container runtime ส่งสัญญาณ `TERM` ไปยังโปรเซสที่ 1 ของแต่ละคอนเทนเนอร์\n3. ในเวลาเดียวกัน (ขนานกันไป) Control Plane จะประเมินว่าจะถอดพอดที่กำลังปิดตัวนี้ออกจาก `EndpointSlice` (และ `Endpoints`) ของ Services เพื่อหยุดส่งทราฟฟิกใหม่เข้ามา\n4. เมื่อระยะเวลาผ่อนผัน (`terminationGracePeriodSeconds`) หมดลง โปรเซสใดที่ยังรันอยู่จะถูกสั่งฆ่าทันทีด้วยสัญญาณ `SIGKILL`\n5. `kubelet` จะลบอ็อบเจกต์พอดออกจาก API Server โดยตั้งค่า Grace period เป็น 0\n\n### Forced Pod termination\nการบังคับลบพอดทันทีสามารถทำได้ด้วยคำสั่ง `kubectl delete pods <pod> --grace-period=0 --force` ซึ่งควรระมัดระวังเป็นพิเศษสำหรับงาน StatefulSet\n\n### Pod shutdown and sidecar containers\nหากพอดมี Sidecar containers (คอนเทนเนอร์ใน `initContainers` ที่มี `restartPolicy: Always`) ตัว `kubelet` จะรอให้คอนเทนเนอร์แอปพลิเคชันหลักทั้งหมดปิดตัวลงก่อน จึงจะสั่งปิด Sidecar containers เป็นลำดับสุดท้าย\n\n### Garbage collection of Pods\nสำหรับพอดที่ล้มเหลว (`Failed`) หรือทำงานสำเร็จแล้ว (`Succeeded`) อ็อบเจกต์ API จะยังคงอยู่ในระบบจนกว่ามนุษย์หรือ Controller (เช่น Pod garbage collector หรือ PodGC) จะทำการลบออกเมื่อจำนวนพอดที่จบการทำงานเกินค่าธรณีที่กำหนด",
        "codeBlocks": [
          {
            "lang": "bash",
            "label": "การสั่งลบพอดด้วยระยะเวลาผ่อนผันและการบังคับลบ",
            "code": "kubectl delete pod my-pod --grace-period=60\nkubectl delete pod my-pod --grace-period=0 --force"
          }
        ]
      },
      {
        "id": "pod-behavior-during-kubelet-restarts",
        "headingEn": "Pod behavior during kubelet restarts",
        "headingTh": "พฤติกรรมของพอดเมื่อ kubelet รีสตาร์ต (Pod behavior during kubelet restarts)",
        "contentMarkdown": "### Detection of kubelet restarts\nเมื่อโปรเซส `kubelet` บนโหนดถูกรีสตาร์ตปกติ มันจะไม่ฆ่าพอดที่กำลังรันอยู่เดิมทิ้ง แต่จะตรวจสอบสถานะของ Sandbox และคอนเทนเนอร์ที่มีอยู่และเชื่อมต่อการดูแลเข้ากับ Kubelet Sync Loop ต่อไป อย่างไรก็ตาม หากโหนดทั้งเครื่องเกิดการรีบูต (Node Reboot) สถานะของคอนเทนเนอร์จะเปลี่ยนไปตามนโยบายของพอดนั้น"
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไป (What's next)",
        "contentMarkdown": "* ลงมือปฏิบัติการแนบ Handler เข้ากับเหตุการณ์วงจรชีวิตคอนเทนเนอร์ใน [Container Lifecycle Hooks](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/)\n* ลงมือปฏิบัติการตั้งค่าใน [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)\n* เรียนรู้เพิ่มเติมเกี่ยวกับ [Container Lifecycle Hooks](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/)\n* ดูข้อมูลสคีมาฉบับเต็มของสถานะพอดและคอนเทนเนอร์ในเอกสารอ้างอิง API สำหรับ [PodStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#podstatus-v1-core) และ [ContainerStatus](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#containerstatus-v1-core)"
      }
    ],
    "relatedLinks": [
      {
        "title": "Pods",
        "targetType": "concepts",
        "targetPageId": "workloads-pods",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/"
      },
      {
        "title": "Configure Liveness, Readiness and Startup Probes",
        "targetType": "tasks",
        "targetPageId": "pod-liveness-readiness-startup-probes",
        "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/"
      },
      {
        "title": "Container Lifecycle Hooks",
        "targetType": "concepts",
        "targetPageId": "containers-lifecycle-hooks",
        "officialUrl": "https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/"
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
