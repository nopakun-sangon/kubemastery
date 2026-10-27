/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/debug/debug-application/get-shell-running-container/
 */
(function (root) {
  const pageData = {
  "id": "debug-running-pods-exec",
  "categoryId": "debugging",
  "categoryTitle": "Monitoring, Logging, and Debugging",
  "titleEn": "Get a Shell to a Running Container",
  "titleTh": "การเปิด Shell เข้าสู่คอนเทนเนอร์และการใช้ kubectl debug",
  "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/get-shell-running-container/",
  "docsPath": "/docs/tasks/debug/debug-application/get-shell-running-container/",
  "diagram": {
    "src": "images/docs/multi-container-sidecar.svg",
    "caption": "การเปิด Shell แบบโต้ตอบและการแทรก Ephemeral Container เข้าสู่พอดเพื่อการ Debug แบบเรียลไทม์"
  },
  "lead": "เรียนรู้วิธีการเข้าถึง Shell ภายในคอนเทนเนอร์ที่กำลังทำงานด้วย `kubectl exec` และการใช้ฟีเจอร์ระดับสูง `kubectl debug` เพื่อแทรก Ephemeral Containers เข้าไปตรวจสอบพอดแบบ Distroless หรือ Production โดยไม่ต้องรีสตาร์ตหรือแก้ไขอิมเมจเดิม",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nคำสั่ง `kubectl exec` ช่วยให้ผู้ดูแลระบบเปิด Interactive Shell เข้าสู่คอนเทนเนอร์ที่กำลังทำงานเพื่อตรวจสอบสภาพแวดล้อมและรันคำสั่งดีบักได้โดยตรง และสำหรับคอนเทนเนอร์สมัยใหม่ที่เป็น Minimal หรือ Distroless Images ซึ่งไม่มีโปรแกรมเชลล์ภายใน Kubernetes มีคำสั่ง `kubectl debug` สำหรับแนบ Ephemeral Container ช่วยตรวจวินิจฉัยโดยไม่ต้องหยุดพอด\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **การเปิด Interactive Shell**: ใช้แฟล็ก `-i` (stdin) และ `-t` (tty) เช่น `kubectl exec -it <pod-name> -- /bin/sh` (หรือ `/bin/bash` หากมีติดตั้งไว้)\n* **พอดที่มีหลายคอนเทนเนอร์ (Multi-container Pods)**: ต้องระบุคอนเทนเนอร์เป้าหมายด้วยแฟล็ก `-c <container-name>` มิฉะนั้น kubectl จะเชื่อมต่อไปยังคอนเทนเนอร์ตัวแรกในลิสต์โดยอัตโนมัติ\n* **การรันคำสั่งเดี่ยวโดยไม่ต้องเปิดเชลล์**: สั่งได้โดยตรง เช่น `kubectl exec <pod-name> -- printenv` หรือ `cat /etc/resolv.conf`\n* **การรับมือกับ Distroless Containers**:\n  * แนบ **Ephemeral Debug Container** เข้าไปในพอดที่มีอยู่: `kubectl debug -it <pod> --image=busybox:1.28 --target=<container>`\n  * โคลนพอดออกมาทดสอบพร้อมแชร์ Process Namespace: `kubectl debug <pod> -it --copy-to=debug-pod --share-processes --image=nicolaka/netshoot`\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* **สูตรคำสั่งที่ต้องใช้บ่อยในการสอบ**:\n  * เปิดเชลล์เจาะจงคอนเทนเนอร์: `kubectl exec -i -t <pod> -c <container> -- sh`\n  * ทดสอบ DNS และการเชื่อมต่อภายใน: `kubectl exec <pod> -- nslookup kubernetes.default`\n* **แนวทางปฏิบัติด้านความปลอดภัยใน Production**: ในสภาพแวดล้อม Production ควรกำหนด RBAC ปิดกั้นสิทธิ์ `pods/exec` และเปิดใช้งาน Audit Logging เพื่อบันทึกว่าใครสั่งคำสั่งใดลงในคอนเทนเนอร์บ้าง\n* **ข้อควรระวัง**: สัญลักษณ์ `--` มีความสำคัญมาก เป็นตัวแบ่งแยกระหว่างพารามิเตอร์ของ `kubectl` กับคำสั่งที่จะส่งไปรันข้างในคอนเทนเนอร์",
  "sections": [
    {
      "id": "interactive-shell-with-kubectl-exec",
      "headingEn": "Interactive Shell and One-Off Commands with kubectl exec",
      "headingTh": "การเปิด Interactive Shell และคำสั่งเดี่ยวด้วย kubectl exec",
      "contentMarkdown": "### คำสั่งเปิด Interactive Shell เข้าสู่พอด\nคุณสามารถเปิดเซสชันเทอร์มินัลเข้าไปในคอนเทนเนอร์โดยตรงด้วยแฟล็ก `-i` (stdin) และ `-t` (tty):\n```bash\nkubectl exec -i -t <pod-name> -- /bin/sh\n```\nหากคอนเทนเนอร์มี Bash Shell ติดตั้งไว้ สามารถใช้:\n```bash\nkubectl exec -it <pod-name> -- /bin/bash\n```\n\n### การระบุ Container เมื่อพอดมีหลายคอนเทนเนอร์ (Multi-Container Pod)\nหากพอดมีคอนเทนเนอร์มากกว่า 1 ตัว คุณต้องระบุชื่อคอนเทนเนอร์ด้วยแฟล็ก `-c`:\n```bash\nkubectl exec -it <pod-name> -c <container-name> -- /bin/sh\n```\n\n### การสั่งรันคำสั่งเดี่ยวโดยไม่ต้องเปิด Shell\nหากต้องการเพียงอ่านค่าคอนฟิกหรือตรวจสอบสภาพแวดล้อม:\n```bash\n# ดูตัวแปรสภาพแวดล้อมในคอนเทนเนอร์\nkubectl exec <pod-name> -- env\n\n# อ่านไฟล์การตั้งค่า DNS\nkubectl exec <pod-name> -- cat /etc/resolv.conf\n\n# ตรวจสอบพื้นที่ดิสก์\nkubectl exec <pod-name> -- df -h\n```",
      "codeBlocks": []
    },
    {
      "id": "the-distroless-challenge",
      "headingEn": "The Distroless Container Dilemma",
      "headingTh": "ข้อจำกัดของ Distroless Containers ในยุคใหม่",
      "contentMarkdown": "### ทำไมคำสั่ง kubectl exec จึงใช้ไม่ได้ผลใน Production?\n\nในสภาพแวดล้อมระดับ Production ที่มีความเข้มงวดด้านความมั่นคงปลอดภัย อิมเมจคอนเทนเนอร์ส่วนใหญ่มักถูกสร้างขึ้นด้วยเทคโนโลยี **Distroless**, **Minimal**, หรือ **Scratch** ซึ่งบรรจุเฉพาะไบนารีของแอปพลิเคชันเท่านั้น\n* ไม่มี Shell (`/bin/sh`, `/bin/bash`)\n* ไม่มี Package Manager (`apt`, `apk`, `yum`)\n* ไม่มีคำสั่งเน็ตเวิร์กพื้นฐาน (`curl`, `ping`, `netstat`)\n\nหากคุณสั่ง `kubectl exec -it <pod> -- /bin/sh` บนพอดที่เป็น Distroless คุณจะพบกับข้อผิดพลาดทันที:\n```\nOCI runtime exec failed: exec: \"/bin/sh\": executable file not found in $PATH: unknown\n```\n> **ทางออกของ Kubernetes ยุคใหม่**: การใช้ **Ephemeral Containers** ผ่านคำสั่ง **`kubectl debug`**!",
      "codeBlocks": []
    },
    {
      "id": "debugging-with-ephemeral-containers",
      "headingEn": "Debugging with Ephemeral Containers (kubectl debug)",
      "headingTh": "การแทรก Ephemeral Container เพื่อ Debug โดยไม่ต้องรีสตาร์ต",
      "contentMarkdown": "**Ephemeral Containers** คือคอนเทนเนอร์พิเศษชั่วคราวที่สามารถแทรกลงไปในพอดที่กำลังทำงานอยู่ได้ โดยไม่ส่งผลกระทบต่อคอนเทนเนอร์หลักและไม่ต้องรีสตาร์ตพอด\n\n### คำสั่งแทรกกล่องเครื่องมือดีบัก (Debug Toolbox)\nเราสามารถแทรกอิมเมจเครื่องมือที่มี Network Tools ครบถ้วน (เช่น `nicolaka/netshoot` หรือ `busybox`) เข้าไปในพอด:\n```bash\nkubectl debug -it <pod-name> --image=nicolaka/netshoot --target=<container-name>\n```\n\n### พลังของแฟล็ก `--target`: การแชร์ Process Namespace\n* เมื่อใส่ `--target=<container-name>` คอนเทนเนอร์ดีบักตัวใหม่จะแชร์ **Process ID (PID) Namespace** ร่วมกับคอนเทนเนอร์เป้าหมาย\n* เมื่อคุณสั่ง `ps aux` คุณจะมองเห็นโปรเซสทั้งหมดของแอปพลิเคชันหลัก\n* คุณสามารถเข้าไปตรวจสอบไฟล์ภายในของคอนเทนเนอร์หลักได้โดยตรงผ่านโฟลเดอร์:\n  `/proc/<pid>/root/`",
      "codeBlocks": []
    },
    {
      "id": "debugging-nodes-and-copying-pods",
      "headingEn": "Debugging Nodes and Creating Debug Pod Copies",
      "headingTh": "การดีบักระดับโหนดและการคัดลอกพอดจำลอง",
      "contentMarkdown": "นอกจาก Ephemeral Containers แล้ว `kubectl debug` ยังมีความสามารถขั้นสูงอีก 2 รูปแบบ:\n\n### 1. การคัดลอกพอดออกมาแก้ไขโดยไม่รบกวน Production (`--copy-to`)\nหากต้องการแก้ไข Environment Variables หรือเปลี่ยน Image เพื่อทดสอบแก้บั๊กโดยไม่แตะต้องพอดที่กำลังให้บริการจริง:\n```bash\nkubectl debug <pod-name> -it --copy-to=my-debug-pod --image=busybox:1.28 --set-image=<container>=<new-image>\n```\nคำสั่งนี้จะโคลนสเปกของพอดเดิมออกมาสร้างเป็นพอดใหม่ชื่อ `my-debug-pod` เพื่อให้คุณทดสอบได้อย่างปลอดภัย\n\n### 2. การเปิด Shell เข้าสู่ระดับโฮสต์ของ Worker Node\nหากเกิดปัญหาในระดับ OS ของ Worker Node คุณสามารถเปิด Shell ดีบักเข้าไปที่โหนดได้โดยตรง:\n```bash\nkubectl debug node/<node-name> -it --image=busybox:1.28\n```\nคำสั่งจะสร้าง Pod พิเศษขึ้นมารันบนโหนดนั้น และ Mount ระบบไฟล์จริงของเครื่องโฮสต์ไว้ที่ไดเรกทอรี `/host` คุณสามารถใช้คำสั่ง:\n```bash\nchroot /host\n```\nเพื่อสลับบริบทเข้าควบคุมระบบปฏิบัติการของ Worker Node เสมือนการ SSH เข้าเครื่อง!",
      "codeBlocks": []
    },
    {
      "id": "security-auditing-and-rbac",
      "headingEn": "Security Governance, RBAC, and Audit Logging",
      "headingTh": "การควบคุมความปลอดภัย, สิทธิ์ RBAC และ Audit Logging",
      "contentMarkdown": "### สิทธิ์ RBAC สำหรับคำสั่ง Exec และ Debug\nสิทธิ์ในการรันคำสั่ง `exec` และ `debug` ถือเป็นสิทธิ์ระดับสูงสุด (เทียบเท่าการเข้าถึงรีโมตเชลล์):\n* Subresource สำหรับ exec: `pods/exec`\n* Subresource สำหรับ ephemeral containers: `pods/ephemeralcontainers`\n\n```yaml\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nmetadata:\n  namespace: production\n  name: pod-debugger\nrules:\n- apiGroups: [\"\"]\n  resources: [\"pods\"]\n  verbs: [\"get\", \"list\"]\n- apiGroups: [\"\"]\n  resources: [\"pods/exec\", \"pods/ephemeralcontainers\"]\n  verbs: [\"create\"]\n```\n\n> [!CAUTION]\n> ในสภาพแวดล้อม Production ทุกเซสชันของ `kubectl exec` ควรถูกบันทึกผ่าน **Kubernetes Audit Policy** เพื่อตรวจสอบย้อนหลังว่าผู้ดูแลระบบคนใดสั่งรันคำสั่งอะไรเข้าไปในคอนเทนเนอร์"
    }
  ],
  "relatedLinks": [
    {
      "title": "Debug Pods and Services",
      "targetType": "tasks",
      "targetPageId": "debug-pods-services",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/"
    },
    {
      "title": "Troubleshooting Clusters and Debugging with crictl",
      "targetType": "tasks",
      "targetPageId": "debug-cluster-crictl",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/"
    },
    {
      "title": "Configure a Security Context for a Pod or Container",
      "targetType": "tasks",
      "targetPageId": "pod-security-context",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/security-context/"
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
