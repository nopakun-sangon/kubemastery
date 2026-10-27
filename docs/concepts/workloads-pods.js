/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/workloads/pods/
 */
(function (root) {
  const pageData = {
    "id": "workloads-pods",
    "categoryId": "workloads",
    "categoryTitle": "Workloads",
    "titleEn": "Pods",
    "titleTh": "พอด (Pods) - สถาปัตยกรรมและหลักการทำงานฉบับสมบูรณ์",
    "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/",
    "docsPath": "/docs/concepts/workloads/pods/",
    "diagram": {
      "src": "images/docs/multi-container-sidecar.svg",
      "caption": "สถาปัตยกรรมพอด (Pod Architecture): การแชร์ Network Namespace (localhost) และ Storage Volumes ระหว่างหลายคอนเทนเนอร์"
    },
    "lead": "พอด (Pods) คือหน่วยคำนวณที่เล็กที่สุดที่สามารถ Deploy และจัดการได้ใน Kubernetes โดย Pod เป็นตัวแทนของกลุ่มคอนเทนเนอร์หนึ่งตัวหรือหลายตัวที่ทำงานร่วมกันใน shared context เสมือนเป็น Logical Host เดียวกัน",
    "sections": [
      {
        "id": "what-is-a-pod",
        "headingEn": "What is a Pod?",
        "headingTh": "พอด (Pod) คืออะไรและทำงานอย่างไร?",
        "contentMarkdown": "พอด (**Pod**) มีที่มาจากคำว่าฝักถั่ว (pea pod) หรือฝูงวาฬ (pod of whales) ใน Kubernetes พอดคือกลุ่มของ **คอนเทนเนอร์ (Containers)** หนึ่งตัวหรือหลายตัว ที่ใช้ทรัพยากรพื้นที่จัดเก็บ (Storage) และเครือข่าย (Network) ร่วมกัน พร้อมทั้งมีข้อกำหนดระบุวิธีการรันคอนเทนเนอร์เหล่านั้น\n\nเนื้อหาภายในพอดจะถูกจัดสรรให้อยู่ในโหนดเดียวกันเสมอ (**co-located**) และถูกวางตารางเวลาการทำงานพร้อมกัน (**co-scheduled**) โดยรันอยู่ภายใน Shared Context เดียวกัน พอดจึงทำหน้าที่จำลอง \"โฮสต์เสมือนเฉพาะทางของแอปพลิเคชัน\" (**logical host**) ซึ่งบรรจุคอนเทนเนอร์ที่มีความผูกพันกันอย่างใกล้ชิด (tightly coupled)\n\n> Note: คุณจำเป็นต้องติดตั้ง Container Runtime (เช่น containerd หรือ CRI-O) บนทุกโหนดในคลัสเตอร์ เพื่อให้พอดสามารถรันบนโหนดเหล่านั้นได้\n\nShared Context ของพอดประกอบด้วยชุดของ Linux Namespaces, cgroups และกลไกการแยกส่วน (isolation facets) เช่นเดียวกับที่ใช้แยกคอนเทนเนอร์ โดยแอปพลิเคชันแต่ละตัวภายในพอดยังสามารถมีข้อจำกัดย่อยเพิ่มเติมได้\n\nนอกจากคอนเทนเนอร์ของแอปพลิเคชันทั่วไปแล้ว พอดยังสามารถบรรจุ:\n* **Init Containers**: คอนเทนเนอร์เริ่มต้นที่รันตามลำดับและต้องเสร็จสมบูรณ์ก่อนที่ App Container หลักจะเริ่มทำงาน\n* **Ephemeral Containers**: คอนเทนเนอร์ชั่วคราวที่สามารถแทรก (inject) เข้าไปในพอดที่กำลังรันอยู่เพื่อการ Troubleshoot และ Debug ได้โดยไม่ต้องรีสตาร์ตพอด"
      },
      {
        "id": "using-pods",
        "headingEn": "Using Pods",
        "headingTh": "การใช้งานพอดและตัวอย่างโครงสร้าง YAML",
        "contentMarkdown": "นี่คือตัวอย่างโครงสร้าง Manifest ของพอดอย่างง่าย ประกอบด้วยคอนเทนเนอร์ 1 ตัวที่รันอิมเมจ `nginx:1.14.2`:\n\nหากต้องการสร้างพอดตามตัวอย่างด้านล่าง สามารถรันคำสั่ง `kubectl apply -f https://k8s.io/examples/pods/simple-pod.yaml` ได้ทันที\n\nในการใช้งานจริงในระบบ Production โดยทั่วไปเราจะไม่สร้างพอดตรงๆ แบบเดี่ยวๆ (singleton pods) แต่จะสร้างและบริหารจัดการผ่าน Workload Resources เช่น **Deployment**, **StatefulSet**, หรือ **Job**",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "simple-pod.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: nginx\nspec:\n  containers:\n  - name: nginx\n    image: nginx:1.14.2\n    ports:\n    - containerPort: 80"
          },
          {
            "lang": "shell",
            "label": "kubectl apply",
            "code": "kubectl apply -f https://k8s.io/examples/pods/simple-pod.yaml"
          }
        ]
      },
      {
        "id": "workload-resources-for-managing-pods",
        "headingEn": "Workload resources for managing pods",
        "headingTh": "เวิร์กโหลดรีซอร์สสำหรับควบคุมและจัดการพอด",
        "contentMarkdown": "โดยทั่วไปแล้วคุณไม่จำเป็นต้องสร้างพอดโดยตรง แม้กระทั่งพอดตัวเดียวแบบ Singleton Pod แต่ควรสร้างผ่านตัวควบคุมเวิร์กโหลด (Workload Resources):\n* **Deployment**: เหมาะสำหรับ Stateless Applications รองรับการทำ Rolling Update, Scale Out และ Rollback เวอร์ชันได้โดยไม่สะดุด\n* **StatefulSet**: เหมาะสำหรับ Stateful Applications หรือดาต้าเบสที่ต้องการเอกลักษณ์เฉพาะตัว (Stable Network Identity เช่น `web-0`, `web-1`) และ Persistent Storage คงที่\n* **Job / CronJob**: เหมาะสำหรับ Batch Workloads หรืองานที่รันจนสำเร็จตามเป้าหมาย (Run-to-completion) แล้วหยุดทำงาน\n* **DaemonSet**: เหมาะสำหรับการการันตีว่าต้องมี Pod ชนิดนี้รันอยู่บนทุกโหนด (หรือโหนดที่กำหนด) 1 ตัวเสมอ เช่น Node Monitoring Agent หรือ Log Collector\n\nแต่ละพอดถูกออกแบบมาให้รัน 1 อินสแตนซ์ของแอปพลิเคชัน หากต้องการขยายขนาดแบบแนวนอน (**Horizontal Scaling**) คุณต้องรันพอดหลายตัวขนานกัน ซึ่งใน Kubernetes เรียกว่า **Replication** โดยมี Controller เป็นตัวควบคุมดูแลอย่างต่อเนื่อง"
      },
      {
        "id": "working-with-pods",
        "headingEn": "Working with Pods",
        "headingTh": "ลักษณะการทำงานของพอดและข้อกำหนดของชื่อ",
        "contentMarkdown": "พอดถูกออกแบบมาให้เป็นสิ่งที่มีอายุชั่วคราว (**ephemeral, disposable entities**) เมื่อพอดถูกสร้างขึ้น (ไม่ว่าจะโดยคุณสั่งโดยตรง หรือสร้างโดย Controller) พอดใหม่จะถูก `kube-scheduler` จัดสรรไปรันบนโหนดที่เหมาะสมในคลัสเตอร์\n\nพอดจะยังคงอยู่บนโหนดนั้นจนกว่า:\n1. พอดจะทำงานเสร็จสมบูรณ์ตามกระบวนการ\n2. ออบเจกต์พอดถูกสั่งลบออก (Deletion)\n3. พอดถูกขับไล่ (**Evicted**) เนื่องจากทรัพยากรบนโหนดไม่เพียงพอ\n4. โหนดล้มเหลว (Node Failure)\n\n> Note: การรีสตาร์ตคอนเทนเนอร์ภายในพอด **ไม่ใช่** การรีสตาร์ตพอด! พอดไม่ใช่โปรเซสเดี่ยว แต่เป็นสภาพแวดล้อม (Environment) สำหรับรันคอนเทนเนอร์ พอดจะยังคงมีอยู่จนกว่าจะถูกลบหรือถูกทำลาย\n\n**ข้อกำหนดชื่อของพอด (Pod Name Rules):**\nชื่อของพอดต้องเป็นไปตามมาตรฐาน RFC 1123 DNS Subdomain ซึ่งประกอบด้วยตัวอักษรพิมพ์เล็ก ตัวเลข และขีดกลาง (`-`) ความยาวไม่เกิน 253 ตัวอักษร"
      },
      {
        "id": "pod-os",
        "headingEn": "Pod OS",
        "headingTh": "การระบุระบบปฏิบัติการของพอด (.spec.os.name)",
        "contentMarkdown": "Kubernetes รองรับฟิลด์ `.spec.os.name` โดยสามารถระบุเป็น `linux` หรือ `windows` เพื่อบอกว่าคอนเทนเนอร์ภายในพอดต้องการรันบนระบบปฏิบัติการใด\n\nตัว Kubelet จะปฏิเสธไม่ยอมรันพอดหากค่าของ `.spec.os.name` ไม่ตรงกับระบบปฏิบัติการของ Worker Node นั้นๆ\n\nสำหรับคลัสเตอร์ที่มีทั้งโหนด Linux และ Windows ทำงานร่วมกัน (Heterogeneous Cluster) คุณควรกำหนดเลเบล `kubernetes.io/os` บนโหนด และใส่ `nodeSelector` ในพอดตามเลเบลของ OS เพื่อป้องกันไม่ให้ kube-scheduler นำพอดไปวางบนโหนดที่มี OS ผิดประเภท\n\nนอกจากนี้ มาตรฐานความปลอดภัย **Pod Security Standards** ยังใช้ฟิลด์ `.spec.os.name` เพื่อหลีกเลี่ยงการบังคับใช้นโยบายที่ไม่เกี่ยวข้องกับระบบปฏิบัติการนั้นๆ อีกด้วย"
      },
      {
        "id": "pods-and-controllers",
        "headingEn": "Pods and controllers",
        "headingTh": "พอดกับตัวควบคุม (Controllers & Self-Healing)",
        "contentMarkdown": "คุณสามารถใช้ Workload Resources เพื่อสร้างและบริหารจัดการพอดหลายตัวแทนคุณได้ Controller ของรีซอร์สจะจัดการเรื่อง Replication, Rollout และการรักษาตัวเองโดยอัตโนมัติ (**Self-Healing**) เมื่อเกิดข้อผิดพลาด\n\nตัวอย่างเช่น หาก Worker Node ตัวหนึ่งเกิด Down หรือ Crash ตัว Controller-manager จะตรวจพบว่าพอดบนโหนดนั้นหยุดทำงาน จากนั้นจะสั่งสร้างพอดตัวใหม่ขึ้นมาทดแทนทันที และ `kube-scheduler` จะนำพอดใหม่ไปวางไว้บนโหนดอื่นที่สมบูรณ์"
      },
      {
        "id": "specifying-a-scheduling-group",
        "headingEn": "Specifying a scheduling group",
        "headingTh": "การกำหนดกลุ่มสำหรับจัดตารางเวลา (Gang Scheduling)",
        "contentMarkdown": "โดยค่าเริ่มต้น Kubernetes จะจัดตารางเวลา (Schedule) แต่ละพอดแยกกันเป็นอิสระ อย่างไรก็ตาม แอปพลิเคชันบางประเภทที่มีความสัมพันธ์กันอย่างสูง (เช่น Distributed Machine Learning หรือ Big Data MPI) ต้องการให้พอดทั้งกลุ่มถูกจัดตารางเวลาและวางลงบนโหนดพร้อมๆ กัน (Gang Scheduling หรือ Coordinated Placement)\n\nคุณสามารถเชื่อมโยงพอดเข้ากับ **PodGroup** ผ่านฟิลด์ `spec.schedulingGroup` เพื่อแจ้งให้ `kube-scheduler` ทราบว่าพอดนี้เป็นสมาชิกของกลุ่มใด ทำให้สามารถตัดสินใจจัดสรรตำแหน่งทั้งกลุ่มพร้อมกันได้ (All-or-nothing)"
      },
      {
        "id": "pod-templates",
        "headingEn": "Pod templates",
        "headingTh": "แม่แบบพอด (Pod Templates ใน Workload Manifests)",
        "contentMarkdown": "คอนโทรลเลอร์ของ Workload Resources จะสร้างพอดขึ้นมาจาก **Pod Template** และคอยดูแลพอดเหล่านั้นแทนคุณ `PodTemplate` เป็นสเปกสำหรับสร้างพอดที่ฝังอยู่ในทรัพยากรระดับสูง เช่น Deployments, Jobs, และ DaemonSets\n\nตัวอย่าง Manifest ของ Job ที่ใช้ `template` ในการสั่งรันคอนเทนเนอร์เพื่อพิมพ์ข้อความแล้วรอจบงาน:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "job-template.yaml",
            "code": "apiVersion: batch/v1\nkind: Job\nmetadata:\n  name: hello\nspec:\n  template:\n    # จุดเริ่มต้นของ Pod Template\n    spec:\n      containers:\n      - name: hello\n        image: busybox:1.28\n        command: ['sh', '-c', 'echo \"Hello, Kubernetes!\" && sleep 3600']\n      restartPolicy: OnFailure\n    # สิ้นสุด Pod Template"
          }
        ]
      },
      {
        "id": "pod-update-and-replacement",
        "headingEn": "Pod update and replacement",
        "headingTh": "กฎการอัปเดตและการแทนที่พอด (Immutability Rules)",
        "contentMarkdown": "เมื่อ Pod Template ใน Workload Resource มีการเปลี่ยนแปลง คอนโทรลเลอร์จะทำการสร้างพอดชุดใหม่ขึ้นมาตามแม่แบบใหม่ แทนที่จะแก้ไขลงในพอดเดิมที่กำลังรันอยู่\n\nKubernetes มีกฎเข้มงวดเรื่องความไม่สามารถแก้ไขได้ (**Immutability**) ของฟิลด์ส่วนใหญ่ใน Pod:\n* ข้อมูล Metadata ส่วนใหญ่ไม่สามารถแก้ไขได้ เช่น `namespace`, `name`, `uid`, หรือ `creationTimestamp`\n* ฟิลด์ใน `spec` ที่อนุญาตให้อัปเดตได้ในพอดที่กำลังรันอยู่ มีเพียง:\n  1. `spec.containers[*].image`\n  2. `spec.initContainers[*].image`\n  3. `spec.activeDeadlineSeconds` (สามารถตั้งค่าใหม่ หรือลดตัวเลขลงได้ แต่เพิ่มขึ้นไม่ได้)\n  4. `spec.tolerations` (สามารถเพิ่มรายการใหม่เข้าไปได้ แต่ห้ามลบของเดิม)\n  5. `spec.terminationGracePeriodSeconds`\n  6. `spec.schedulingGates`\n\nหากต้องการแก้ไขฟิลด์อื่นนอกเหนือจากนี้ คุณจำเป็นต้องลบพอดเดิมทิ้งแล้วสร้างใหม่ หรือให้ Controller ดำเนินการ Rolling Update ให้"
      },
      {
        "id": "pod-subresources",
        "headingEn": "Pod subresources",
        "headingTh": "ซับรีซอร์สของพอด (Pod Subresources)",
        "contentMarkdown": "นอกเหนือจากการอัปเดตสเปกหลักแล้ว พอดยังมี Subresources สำหรับการดำเนินการเฉพาะทาง:\n* **Resize Subresource**: อนุญาตให้ปรับเปลี่ยนทรัพยากร CPU และ Memory (`spec.containers[*].resources`) ของคอนเทนเนอร์ได้แบบ In-place ในขณะที่พอดกำลังรันอยู่ โดยไม่ต้อง Restart Pod\n* **Ephemeral Containers Subresource**: อนุญาตให้เพิ่ม Ephemeral Container เข้าไปในพอดเพื่อการ Troubleshooting ระหว่างเกิดปัญหา\n* **Status Subresource**: ใช้สำหรับอัปเดตสถานะของพอด ซึ่งจะถูกเรียกใช้โดย Kubelet และ Control Plane Controllers เท่านั้น\n* **Binding Subresource**: ใช้สำหรับกำหนด `spec.nodeName` โดย Kube-scheduler เพื่อผูกพอดเข้ากับโหนดที่ผ่านการคัดเลือก"
      },
      {
        "id": "pod-generation",
        "headingEn": "Pod generation and observed generation",
        "headingTh": "การติดตามการเปลี่ยนแปลงของสเปกและสถานะ (Generation Tracking)",
        "contentMarkdown": "ฟิลด์ `metadata.generation` จะถูกกำหนดโดยอัตโนมัติจากระบบ พอดใหม่จะมีค่า generation เริ่มต้นเป็น 1 และทุกครั้งที่มีการอัปเดตฟิลด์ mutable ในสเปก ค่า generation จะบวกเพิ่มขึ้น 1 เสมอ\n\nฟิลด์ `status.observedGeneration` เป็นค่าที่ Kubelet บันทึกไว้ในส่วนสถานะของพอด เพื่อสะท้อนว่า Kubelet ได้รับรู้และจัดการสเปกของ Generation ใดไปแล้ว ทำให้คอนโทรลเลอร์ภายนอกสามารถแยกแยะได้ว่าสถานะปัจจุบันตรงกับสเปกเวอร์ชันล่าสุดแล้วหรือไม่\n\n* **Direct Status Updates**: สถานะที่สะท้อนจากสเปกทันที เช่น Resize Status, Allocated Resources จะมี observedGeneration ตรงกับ Generation N ปัจจุบัน\n* **Indirect Status Updates**: สถานะที่เป็นผลลัพธ์จากการประมวลผลที่ต้องใช้เวลา เช่น `ContainerStatus.ImageID` (จะยังเป็นอิมเมจเก่าจนกว่าจะ Pull อิมเมจใหม่เสร็จและรันคอนเทนเนอร์สำเร็จ)"
      },
      {
        "id": "resource-sharing-and-communication",
        "headingEn": "Resource sharing and communication",
        "headingTh": "การแชร์พื้นที่จัดเก็บและเครือข่ายภายในพอด",
        "contentMarkdown": "พอดช่วยอำนวยความสะดวกในการแชร์ข้อมูลและการสื่อสารระหว่างคอนเทนเนอร์ที่เป็นส่วนประกอบ:\n\n### 1. การแชร์ Storage ในพอด (Storage in Pods)\nพอดสามารถกำหนด Shared Storage **Volumes** ร่วมกัน คอนเทนเนอร์ทุกตัวในพอดสามารถ Mount วอลุ่มดังกล่าวเพื่อเข้าถึงข้อมูลชุดเดียวกันได้ ทำให้สามารถแลกเปลี่ยนไฟล์หรือส่งต่อผลลัพธ์ระหว่างกันได้อย่างราบรื่น และหากคอนเทนเนอร์ตัวหนึ่งแครชแล้วรีสตาร์ตขึ้นมา ข้อมูลใน Volume ก็จะยังคงอยู่\n\n### 2. ระบบเครือข่ายของพอด (Pod Networking)\nแต่ละพอดจะได้รับ IP Address ประจำตัว 1 ไอพี (หรือ 2 ไอพีในกรณี Dual-stack IPv4/IPv6) คอนเทนเนอร์ทุกตัวภายในพอดเดียวกันจะแชร์ **Network Namespace** เดียวกัน ซึ่งรวมถึง IP Address และ Port Range:\n* คอนเทนเนอร์ในพอดเดียวกันสามารถสื่อสารกันผ่าน `localhost` ได้โดยตรง\n* คอนเทนเนอร์ในพอดเดียวกัน**ห้ามใช้หมายเลขพอร์ตซ้ำกัน**\n* คอนเทนเนอร์สามารถสื่อสารกันผ่านกลไก IPC ระดับ OS ปกติได้ เช่น SystemV semaphores หรือ POSIX shared memory\n* คอนเทนเนอร์ในต่างพอดกันจะมี IP คนละชุด และสื่อสารกันผ่าน IP Networking ข้ามคลัสเตอร์"
      },
      {
        "id": "pod-security-settings",
        "headingEn": "Pod security settings",
        "headingTh": "การกำหนดความปลอดภัยของพอด (Security Context)",
        "contentMarkdown": "การกำหนดขอบเขตความปลอดภัยของพอดและคอนเทนเนอร์ ทำได้โดยระบุฟิลด์ `securityContext` ใน Pod Specification ซึ่งให้สิทธิ์ควบคุมแบบละเอียด\n\nสำหรับการตั้งค่าความปลอดภัยขั้นพื้นฐาน ควรปฏิบัติตามมาตรฐาน **Baseline Pod Security Standard** โดยหลีกเลี่ยงการรันคอนเทนเนอร์ด้วยสิทธิ์ root (`runAsNonRoot: true` หรือกำหนด `runAsUser`) ตัวอย่างด้านล่างแสดงการรันพอดด้วยสิทธิ์ User ID 1000 และ Group ID 3000 พร้อมกำหนด `fsGroup`:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "security-context-demo.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: security-context-demo\nspec:\n  securityContext:\n    runAsUser: 1000\n    runAsGroup: 3000\n    fsGroup: 2000\n  containers:\n  - name: sec-ctx-demo\n    image: busybox:1.28\n    command: [\"sh\", \"-c\", \"sleep 1h\"]"
          }
        ]
      },
      {
        "id": "resource-requests-and-limits",
        "headingEn": "Resource requests and limits",
        "headingTh": "การกำหนดคำขอและขีดจำกัดทรัพยากร (CPU & Memory Requests/Limits)",
        "contentMarkdown": "เมื่อคุณสร้างพอด คุณสามารถระบุปริมาณทรัพยากรที่แต่ละคอนเทนเนอร์ต้องการได้ โดยทรัพยากรหลักคือ CPU และหน่วยความจำ (RAM):\n* **Requests (คำขอขั้นต่ำ)**: ปริมาณ CPU/RAM ที่คอนเทนเนอร์ต้องการเป็นอย่างน้อย ตัว `kube-scheduler` จะใช้ตัวเลขนี้ในการคำนวณและเลือกโหนดที่มีทรัพยากรว่างเพียงพอเพื่อวางพอดลงไป\n* **Limits (ขีดจำกัดสูงสุด)**: ปริมาณ CPU/RAM สูงสุดที่ยอมให้คอนเทนเนอร์ใช้งานได้ ตัว `kubelet` และเคอร์เนล Linux จะคอยบังคับใช้ขีดจำกัดนี้\n\n**พฤติกรรมเมื่อใช้งานเกิน Limits:**\n* **CPU Limit**: ถูกบังคับใช้ด้วยกลไก **CPU Throttling** (การจำกัดรอบสัญญาณนาฬิกา) คอนเทนเนอร์จะไม่ถูกฆ่า แต่จะทำงานช้าลง\n* **Memory Limit**: ถูกบังคับใช้ด้วยกลไกของเคอร์เนล หากคอนเทนเนอร์ใช้แรมเกิน Limit จะถูกระบบส่งสัญญาณกำจัดทิ้งทันทีด้วยสถานะ **OOMKilled** (Out Of Memory)\n\n> Note: การกำหนด CPU Limit มีข้อดีในการป้องกันปัญหา Noisy Neighbor ในระบบ Multi-tenant แต่ในขณะเดียวกันก็อาจทำให้เกิด CPU Throttling แม้ว่าโหนดจะมี CPU เหลือว่างอยู่ก็ตาม ดังนั้นควรประเมินลักษณะของ Workload อย่างรอบคอบ"
      },
      {
        "id": "static-pods",
        "headingEn": "Static Pods",
        "headingTh": "พอดสแตติกที่ควบคุมโดยตรงจาก Kubelet (Static Pods)",
        "contentMarkdown": "**Static Pods** คือพอดที่ถูกจัดการและดูแลโดยตรงโดย Kubelet daemon บนโหนดนั้นๆ โดยไม่ต้องผ่านการควบคุมของ `kube-apiserver`\n\nในขณะที่พอดส่วนใหญ่ถูกจัดการโดย Control Plane (เช่น Deployment) แต่สำหรับ Static Pods นั้น ตัว Kubelet ประจำโหนดจะคอยมอนิเตอร์และรีสตาร์ตพอดให้หากพอดล้มเหลว\n\nการใช้งานหลักของ Static Pods คือการนำมารัน **Self-Hosted Control Plane** ของ Kubernetes เอง โดย Kubelet จะอ่านไฟล์ Manifest จากไดเรกทอรีเฉพาะบนโหนด (เช่น `/etc/kubernetes/manifests/`) และรันคอมโพเนนต์หลักขึ้นมา ได้แก่:\n* `kube-apiserver`\n* `etcd`\n* `kube-controller-manager`\n* `kube-scheduler`\n\nตัว Kubelet จะทำการสร้าง **Mirror Pod** ไปปรากฏบน API Server โดยอัตโนมัติ เพื่อให้ผู้ดูแลระบบสามารถตรวจสอบสถานะของพอดสแตติกเหล่านี้ผ่านคำสั่ง `kubectl get pods -n kube-system` ได้ตามปกติ"
      },
      {
        "id": "pods-with-multiple-containers",
        "headingEn": "Pods with multiple containers and sidecars",
        "headingTh": "การรันหลายคอนเทนเนอร์ในพอดเดียวและ Native Sidecar Containers",
        "contentMarkdown": "พอดถูกออกแบบมาให้รองรับการทำงานร่วมกันของหลายคอนเทนเนอร์ที่ทำหน้าที่เป็นหน่วยบริการเดียวกัน คอนเทนเนอร์ภายในพอดจะถูก co-located และ co-scheduled บนเครื่องเดียวกันโดยอัตโนมัติ ทำให้สามารถแชร์ไฟล์ สื่อสารผ่าน localhost และควบคุมการปิดระบบร่วมกันได้\n\nรูปแบบการใช้งานหลัก:\n1. **One-Container-per-Pod**: รูปแบบมาตรฐานและพบบ่อยที่สุด พอดทำหน้าที่เป็น wrapper ครอบคอนเทนเนอร์ตัวเดียว\n2. **Multi-Container Pod**: คอนเทนเนอร์หลักทำงานร่วมกับคอนเทนเนอร์เสริม เช่น Web Server ให้บริการไฟล์ใน Shared Volume ควบคู่กับ **Sidecar Container** ที่คอยดึงข้อมูลล่าสุดจาก Git หรือ Cloud Storage มาอัปเดตลงใน Volume\n\n**Native Sidecar Containers (Kubernetes 1.28+):**\nฟีเจอร์ Native Sidecars ช่วยให้คุณสามารถกำหนด Sidecar ในส่วน `initContainers` พร้อมระบุ `restartPolicy: Always` ได้ ซึ่งทำให้ Sidecar เริ่มต้นทำงานก่อน Main Container และจะรันอยู่ตลอดอายุการทำงานของพอดจนกระทั่งพอดปิดตัวลง ต่างจาก Init Container ปกติที่จะหยุดทำงานเมื่อเริ่ม Main Container"
      },
      {
        "id": "container-probes",
        "headingEn": "Container probes",
        "headingTh": "การตรวจสุขภาพคอนเทนเนอร์ (Container Probes)",
        "contentMarkdown": "**Probe** คือการตรวจเช็กเพื่อวินิจฉัยสุขภาพของคอนเทนเนอร์ที่ Kubelet กระทำเป็นระยะ โดยสามารถตรวจสอบผ่าน 3 กลไก:\n* `ExecAction`: สั่งรันคำสั่งภายในคอนเทนเนอร์ หากคืนค่าสถานะเป็น 0 ถือว่าผ่าน\n* `TCPSocketAction`: ตรวจสอบการเชื่อมต่อ TCP Socket ไปยังพอร์ตที่กำหนด\n* `HTTPGetAction`: ยิง HTTP GET Request ไปยัง Path และ Port ของคอนเทนเนอร์ หากคืนค่า Status Code ระหว่าง 200 ถึง 399 ถือว่าผ่าน\n\n**ประเภทของ Probe:**\n1. `startupProbe`: ตรวจสอบว่าแอปพลิเคชันสตาร์ตเสร็จสมบูรณ์หรือยัง (Probe อื่นจะยังไม่ทำงานจนกว่า startupProbe จะผ่าน)\n2. `livenessProbe`: ตรวจสอบว่าคอนเทนเนอร์ยังคงทำงานได้ปกติหรือไม่ หากล้มเหลว Kubelet จะสั่ง Restart คอนเทนเนอร์ตาม `restartPolicy`\n3. `readinessProbe`: ตรวจสอบว่าคอนเทนเนอร์พร้อมรับ Traffic จาก Service แล้วหรือยัง หากไม่พร้อม IP ของพอดจะถูกถอดออกจาก Endpoints ชั่วคราว"
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "เพื่อทำความเข้าใจพอดและการจัดการแอปพลิเคชันอย่างลึกซึ้ง แนะนำให้อ่านเนื้อหาที่เกี่ยวข้องดังนี้:\n* ศึกษา [Pod Lifecycle (วงจรชีวิตของพอด)](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/) เพื่อเข้าใจสถานะ Pending, Running, Succeeded, Failed และ CrashLoopBackOff\n* ศึกษา [PodDisruptionBudget (PDB)](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/) เพื่อบริหารจัดการความพร้อมในการให้บริการระหว่างการอัปเกรดโหนด\n* ศึกษา [Pod Topology Spread Constraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/) เพื่อกระจายพอดข้าม Availability Zones และ Nodes อย่างสมดุล\n* ศึกษา [Advanced Pod Configuration](https://kubernetes.io/docs/concepts/workloads/pods/advanced-pod-config/) เกี่ยวกับ PriorityClasses และ RuntimeClasses"
      }
    ],
    "relatedLinks": [
      {
        "title": "Pod Lifecycle (วงจรชีวิตพอด)",
        "targetType": "concepts",
        "targetPageId": "workloads-pod-lifecycle",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/"
      },
      {
        "title": "Init Containers (คอนเทนเนอร์เริ่มต้น)",
        "targetType": "concepts",
        "targetPageId": "workloads-init-containers",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/init-containers/"
      },
      {
        "title": "Sidecar Containers (คอนเทนเนอร์เสริม)",
        "targetType": "concepts",
        "targetPageId": "workloads-sidecar-containers",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/"
      },
      {
        "title": "Ephemeral Containers & Disruptions (PDB)",
        "targetType": "concepts",
        "targetPageId": "workloads-ephemeral-disruptions",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/"
      },
      {
        "title": "Run a Stateless Application Using a Deployment (Task)",
        "targetType": "tasks",
        "targetPageId": "run-stateless-deployment",
        "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/"
      },
      {
        "title": "Configure a Pod to Use a Volume for Storage (Task)",
        "targetType": "tasks",
        "targetPageId": "pod-persistent-volume-storage",
        "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-volume-storage/"
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
