/**
 * KubeMastery: CLI Tips, Command Reference & Exam Speed Cheatsheet
 * รวมคำสั่งที่ใช้บ่อยในการทำงานจริงและการสอบ CKAD / CKA
 * พร้อมคำอธิบายหลักการทำงานของแต่ละ Flag และตัวอย่างการรันจริง
 */
(function (root) {
  const CLI_TIPS_CATEGORIES = [
    {
      id: "all",
      title: "ทั้งหมด (All Commands)",
      icon: "📚",
      badge: "All"
    },
    {
      id: "light-k8s-setup",
      title: "0. ติดตั้ง K8s แบบเบาสำหรับสอบ CKAD (Kind / Helm / Docker)",
      icon: "🪶",
      badge: "Lightweight K8s"
    },
    {
      id: "exam-setup",
      title: "1. ตั้งค่าก่อนสอบ & ทางลัดความเร็ว (Alias / Vim / Context)",
      icon: "⚡",
      badge: "Speed Setup"
    },
    {
      id: "pods-exec",
      title: "2. จัดการ Pod, Multi-Container & รันคำสั่งในพอด",
      icon: "📦",
      badge: "Pods & Exec"
    },
    {
      id: "deployments-rollout",
      title: "3. Deployment, Scale, Rollout, Rollback & Kustomize",
      icon: "🚀",
      badge: "Deployments"
    },
    {
      id: "services-networking",
      title: "4. Service, Expose, Ingress, NetworkPolicy & ทดสอบพอร์ต",
      icon: "🌐",
      badge: "Networking"
    },
    {
      id: "config-secrets",
      title: "5. ConfigMap, Secret & การฉีดค่า Env / Volume",
      icon: "⚙️",
      badge: "Config & Secret"
    },
    {
      id: "jobs-cronjobs",
      title: "6. Job & CronJob (งานประมวลผลแบบ Batch)",
      icon: "⏱️",
      badge: "Jobs & Cron"
    },
    {
      id: "rbac-security",
      title: "7. ServiceAccount, RBAC (Role/Binding) & ตรวจสิทธิ์",
      icon: "🔐",
      badge: "RBAC & Security"
    },
    {
      id: "storage-pvc",
      title: "8. PersistentVolume (PV), PVC & การเช็กพื้นที่จัดเก็บ",
      icon: "💾",
      badge: "Storage"
    },
    {
      id: "debug-troubleshooting",
      title: "9. ตรวจหาสาเหตุพอดพัง (Logs, Describe, Events, Explain)",
      icon: "🔍",
      badge: "Troubleshooting"
    },
    {
      id: "jsonpath-advanced",
      title: "10. คัดกรองข้อมูลขั้นสูง (JSONPath, Custom-Columns, Patch, Label)",
      icon: "🎯",
      badge: "JSONPath & Patch"
    }
  ];

  const CLI_TIPS_ITEMS = [
    // =========================================================================
    // 0. LIGHTWEIGHT KUBERNETES SETUP (KIND, HELM, DOCKER BUILD FOR CKAD)
    // =========================================================================
    {
      id: "tip-light-kind-switcher",
      categoryId: "light-k8s-setup",
      categoryTitle: "ติดตั้ง K8s แบบเบาสำหรับสอบ CKAD (Kind / Helm / Docker)",
      title: "สลับโหมดคลัสเตอร์แบบเบา: Simulator (RAM 0 MB) ↔ Kind Cluster จริง (~400 MB)",
      examTag: "Lightweight CKAD Lab",
      importance: "CRITICAL",
      command: `./scripts/ckad-light-setup.sh status
./scripts/ckad-light-setup.sh setup-shell
./scripts/ckad-light-setup.sh mode-kind
./scripts/ckad-light-setup.sh stop-kind`,
      howItWorks:
        "สำหรับเครื่อง RAM 8 GB การเปิด Minikube VM เต็มตัวจะกิน RAM 2–2.5 GB ทำให้เครื่องหน่วง เราจึงจัดเตรียมสคริปต์สลับ 2 โหมดแบบเบาที่สุดไว้ให้:\n" +
        "• **`mode-sim` (RAM 0 MB):** ใช้ตัวจำลองของ KubeMastery โดยไม่ต้องเปิด Docker ทำงานร่วมกับหน้าเว็บ CKAD Exam Labs 100%\n" +
        "• **`mode-kind` (RAM ~400 MB):** เปิด Docker และรันคลัสเตอร์ Kubernetes จริงแบบ Single-Node ด้วย `kind` (เบากว่า Minikube 4 เท่า) พร้อมสลับ `kubectl` ไปยังคลัสเตอร์จริงให้อัตโนมัติ\n" +
        "• **`stop-kind`:** หยุดพัก Container ของ Kind เพื่อคืน RAM ~400–500 MB กลับให้เครื่องทันทีโดยที่ข้อมูลในคลัสเตอร์ไม่หาย!",
      flags: [
        { flag: "status", desc: "ตรวจสอบ RAM ว่าง, สถานะ Docker, Kind, Helm, Vim และโหมด kubectl ปัจจุบัน" },
        { flag: "setup-shell", desc: "ตั้งค่า ~/.vimrc (2-space YAML) และ ~/.bashrc (alias k, $do, $now, bash completion)" },
        { flag: "mode-kind", desc: "เปิด Docker + สร้างหรือสตาร์ทคลัสเตอร์ Kind 'ckad-light' และสลับไปใช้ real kubectl" },
        { flag: "stop-kind", desc: "หยุดคลัสเตอร์ Kind คืน RAM และสลับกลับสู่โหมด Simulator (0 MB RAM)" }
      ],
      exampleCode: `# 1. ตรวจสอบเครื่องมือที่มีในเครื่องและ RAM ว่าง
./scripts/ckad-light-setup.sh status

# 2. เปิดคลัสเตอร์ Kind จริงแบบเบาเมื่อต้องการทดสอบรัน Container / exec / helm
./scripts/ckad-light-setup.sh mode-kind
kubectl get nodes -o wide

# 3. เลิกซ้อมแล้วหยุดคลัสเตอร์คืน RAM ทันที
./scripts/ckad-light-setup.sh stop-kind`,
      examTip: "แนะนำให้เปิด `mode-kind` เฉพาะตอนที่ต้องการลอง `kubectl exec`, `helm install` หรือรันคอนเทนเนอร์จริง และสั่ง `stop-kind` ทุกครั้งหลังซ้อมเสร็จ เครื่องจะลื่นตลอดเวลา!"
    },
    {
      id: "tip-helm-ckad-commands",
      categoryId: "light-k8s-setup",
      categoryTitle: "ติดตั้ง K8s แบบเบาสำหรับสอบ CKAD (Kind / Helm / Docker)",
      title: "คำสั่ง Helm ที่ออกสอบ CKAD บ่อยที่สุด (Install, Upgrade, Rollback, Uninstall)",
      examTag: "CKAD Domain 2 (Helm)",
      importance: "CRITICAL",
      command: `helm repo list && helm repo update
helm list -A
helm install my-release bitnami/nginx -n prod --set replicaCount=2
helm upgrade my-release bitnami/nginx -n prod --set image.tag=1.25
helm rollback my-release 1 -n prod`,
      howItWorks:
        "ข้อสอบ CKAD หมวด Application Deployment (20%) มักมีโจทย์ Helm อย่างน้อย 1 ข้อ เช่น การตรวจสอบ Release ที่ติดตั้งอยู่ทั้งหมด (`helm list -A`), การค้นหา Chart, การอัปเกรดค่า `--set`, หรือการลบ Release ที่ติดสถานะ Pending/Failed",
      flags: [
        { flag: "helm list -A (-a)", desc: "แสดง Helm Releases ทั้งหมดในทุก Namespace (เพิ่ม -a เพื่อดูตัวที่ Failed/Pending ด้วย)" },
        { flag: "--set key=value", desc: "ปรับแก้ค่าพารามิเตอร์ใน values.yaml แบบด่วนจาก Command Line" },
        { flag: "-f values.yaml", desc: "ส่งไฟล์ values.yaml ที่แก้ไขเองเข้าไปตอน install หรือ upgrade" },
        { flag: "helm rollback <release> <rev>", desc: "ย้อนเวอร์ชันของ Helm Release กลับไปยัง Revision ที่ระบุ" }
      ],
      exampleCode: `# ตรวจสอบดู Release ที่พัง (pending-install / failed) แล้วลบทิ้ง
helm list -A -a
helm uninstall broken-app -n staging

# ดูประวัติ Revision ของ Release ก่อนสั่ง Rollback
helm history my-release -n prod
helm rollback my-release 1 -n prod`,
      examTip: "จำ Flag `-A -a` (`helm list -A -a`) ไว้ให้แม่น! เพราะบางครั้งโจทย์ซ่อน Release ที่ติดสถานะ `pending-upgrade` หรือ `failed` ไว้ ซึ่งถ้าพิมพ์แค่ `helm list` เฉยๆ จะมองไม่เห็น!"
    },
    {
      id: "tip-docker-build-save-ckad",
      categoryId: "light-k8s-setup",
      categoryTitle: "ติดตั้ง K8s แบบเบาสำหรับสอบ CKAD (Kind / Helm / Docker)",
      title: "คำสั่ง Docker / Podman สำหรับโจทย์สร้างและส่งออก Container Image ใน CKAD",
      examTag: "CKAD Domain 1 (Images)",
      importance: "HIGH",
      command: `docker build -t my-app:1.0 .
docker save -o /opt/my-app.tar my-app:1.0
kind load docker-image my-app:1.0 --name ckad-light`,
      howItWorks:
        "ในข้อสอบ CKAD หมวด Application Design & Build อาจมีโจทย์ให้เข้าไปในโฟลเดอร์ที่มี `Dockerfile` แล้วสั่ง Build เป็น Container Image ด้วย Tag ที่กำหนด และบันทึก Image ออกเป็นไฟล์ `.tar` (OCI/Docker archive) ลงพาธที่โจทย์ระบุ:\n" +
        "• `docker build -t <name>:<tag> <dir>`: สร้าง Image จาก Dockerfile\n" +
        "• `docker save -o <file.tar> <name>:<tag>`: ส่งออก Image เป็นไฟล์ tar ตามที่โจทย์ตรวจ\n" +
        "• `kind load docker-image ...`: โหลด Image ที่เพิ่ง Build เข้าไปในคลัสเตอร์ Kind โดยไม่ต้อง Push ขึ้น Docker Hub!",
      flags: [
        { flag: "-t <name>:<tag>", desc: "ตั้งชื่อและเวอร์ชัน Tag ให้กับ Image ที่ Build" },
        { flag: "-f <Dockerfile>", desc: "ระบุชื่อไฟล์ Dockerfile หากไม่ได้ใช้ชื่อมาตรฐานว่า Dockerfile" },
        { flag: "save -o <path.tar>", desc: "ส่งออก Image เป็นไฟล์ .tar ไปเก็บไว้ยังพาธที่กำหนด" }
      ],
      exampleCode: `# ตัวอย่างโจทย์ CKAD: Build Image จาก /root/app แล้วส่งออกเป็นไฟล์ tar
cd /root/app
docker build -t registry.local/web-api:v2 .
docker save -o /tmp/web-api-v2.tar registry.local/web-api:v2

# ตรวจสอบไฟล์ tar ที่สร้างขึ้น
ls -lh /tmp/web-api-v2.tar`,
      examTip: "หากในห้องสอบเครื่องนั้นใช้ `podman` แทน `docker` คำสั่งจะเหมือนกัน 100% แค่เปลี่ยนคำว่า `docker` เป็น `podman` (เช่น `podman build -t ...` และ `podman save -o ... --format oci-archive`)"
    },

    // =========================================================================
    // 1. EXAM SETUP, ALIAS & VIM/BASH SPEED TIPS
    // =========================================================================
    {
      id: "tip-alias-env",
      categoryId: "exam-setup",
      categoryTitle: "ตั้งค่าก่อนสอบ & ทางลัดความเร็ว",
      title: "ตั้งค่า Alias และตัวแปรลัด ($do, $now) ประหยัดเวลาพิมพ์ในห้องสอบ",
      examTag: "CKAD / CKA Must-Know",
      importance: "CRITICAL",
      command: `alias k=kubectl
export do="--dry-run=client -o yaml"
export now="--force --grace-period=0"`,
      howItWorks:
        "เป็นการสร้างตัวแปรสภาพแวดล้อม (Environment Variables) และคำสั่งย่อ (Alias) ใน Bash Shell เพื่อให้ไม่ต้องพิมพ์คำสั่งยาวๆ ซ้ำทุกข้อ:\n" +
        "• `alias k=kubectl`: ย่อคำสั่ง `kubectl` เหลือเพียงตัว `k` ตัวเดียว\n" +
        "• `export do=\"--dry-run=client -o yaml\"`: จำลองการสร้าง Resource ที่ฝั่ง Client โดยไม่ส่งไปสร้างจริงบนคลัสเตอร์ แล้วพิมพ์โครงสร้างออกเป็น YAML ทันที (ใช้คู่กับ `> file.yaml`)\n" +
        "• `export now=\"--force --grace-period=0\"`: สั่งลบพอดทันทีโดยไม่ต้องรอเวลา Graceful Shutdown 30 วินาที",
      flags: [
        { flag: "--dry-run=client", desc: "จำลองการตรวจสอบคำสั่งที่ฝั่ง Client โดยไม่สร้าง Object ลงคลัสเตอร์จริง" },
        { flag: "-o yaml", desc: "แสดงผลลัพธ์ออกมาในรูปแบบโครงสร้างไฟล์ YAML มาตรฐาน" },
        { flag: "--force --grace-period=0", desc: "บังคับลบ Resource ทันทีโดยไม่รอให้โปรเซสในคอนเทนเนอร์ปิดตัวเองตามเวลาปกติ" }
      ],
      exampleCode: `# 1. สร้างไฟล์ YAML ของ Pod ด้วยตัวแปร $do ใน 3 วินาที
k run nginx-pod --image=nginx:1.25-alpine $do > pod.yaml

# 2. ลบพอดเก่าที่ค้างอยู่ทันทีด้วยตัวแปร $now
k delete pod nginx-pod $now`,
      examTip: "แนะนำให้รัน 3 บรรทัดนี้ทันทีที่เปิดหน้าต่าง Terminal ในห้องสอบ จะช่วยลดเวลาพิมพ์ตลอด 2 ชั่วโมงได้มากกว่า 15–20 นาที!"
    },
    {
      id: "tip-context-namespace",
      categoryId: "exam-setup",
      categoryTitle: "ตั้งค่าก่อนสอบ & ทางลัดความเร็ว",
      title: "สลับ Cluster Context และล็อก Namespace ปัจจุบัน",
      examTag: "CKAD / CKA Core",
      importance: "CRITICAL",
      command: `kubectl config use-context k8s-c1-H
kubectl config set-context --current --namespace=payment-prod`,
      howItWorks:
        "ในการสอบจริงของ Linux Foundation (PSI Bridge) จะมีคลัสเตอร์หลายตัวอยู่ในไฟล์ kubeconfig เดียวกัน:\n" +
        "• `kubectl config use-context <ชื่อคลัสเตอร์>`: สลับเป้าหมายการเชื่อมต่อของ kubectl ไปยังคลัสเตอร์ที่โจทย์ข้อนั้นกำหนด\n" +
        "• `kubectl config set-context --current --namespace=<ns>`: เปลี่ยนค่า Namespace เริ่มต้นของ Context ปัจจุบัน ทำให้คำสั่งถัดไปไม่ต้องพิมพ์ `-n <ns>` ซ้ำ (แต่ระวังเมื่อเปลี่ยนข้อใหม่ต้องสลับกลับ!)",
      flags: [
        { flag: "use-context <ctx>", desc: "เปลี่ยน Context หลักที่ kubectl ใช้งานอยู่ไปยังคลัสเตอร์ที่ระบุ" },
        { flag: "current-context", desc: "ตรวจสอบว่าปัจจุบันเรากำลังเชื่อมต่ออยู่กับคลัสเตอร์ใด" },
        { flag: "get-contexts", desc: "แสดงรายชื่อ Context คลัสเตอร์ทั้งหมดที่มีในระบบ" }
      ],
      exampleCode: `# ดูรายชื่อคลัสเตอร์ทั้งหมดและดูว่าอยู่คลัสเตอร์ไหน
kubectl config get-contexts
kubectl config current-context

# สลับไปยังคลัสเตอร์ k8s-c2-AC ตามที่โจทย์สั่ง
kubectl config use-context k8s-c2-AC`,
      examTip: "ในห้องสอบจริง ทุกข้อจะมีกล่องคำสั่ง `kubectl config use-context ...` อยู่ด้านบนสุด ต้องก๊อปปี้มารันก่อนเสมอ หากลืมรันจะเท่ากับทำข้อสอบผิดคลัสเตอร์และได้ 0 คะแนนในข้อนั้น!"
    },
    {
      id: "tip-vim-yaml-config",
      categoryId: "exam-setup",
      categoryTitle: "ตั้งค่าก่อนสอบ & ทางลัดความเร็ว",
      title: "ตั้งค่า Vim สำหรับเขียนไฟล์ YAML ไม่ให้ย่อหน้า (Indentation) เพี้ยน",
      examTag: "YAML Productivity",
      importance: "HIGH",
      command: `cat << 'EOF' >> ~/.vimrc
set tabstop=2
set shiftwidth=2
set expandtab
set number
EOF`,
      howItWorks:
        "ไฟล์ YAML ใน Kubernetes อ่อนไหวต่อการเว้นวรรค (Spaces) มากและห้ามใช้ตัวอักษร Tab (`\\t`) เด็ดขาด การตั้งค่า `~/.vimrc` นี้จะบังคับให้การกดปุ่ม Tab ใน Vim แปลงเป็นช่องว่าง 2 เคาะอัตโนมัติ และแสดงเลขบรรทัดเสมอ",
      flags: [
        { flag: "set tabstop=2", desc: "กำหนดความกว้างของการกดปุ่ม Tab เท่ากับ 2 ช่องว่าง" },
        { flag: "set shiftwidth=2", desc: "กำหนดระยะการเลื่อนย่อหน้าด้วยคำสั่ง >> หรือ << ในโหมดปกติเป็น 2 ช่องว่าง" },
        { flag: "set expandtab", desc: "แปลงปุ่ม Tab ให้กลายเป็น Space อัตโนมัติ (ป้องกัน YAML Syntax Error)" },
        { flag: "set number", desc: "แสดงหมายเลขบรรทัดด้านซ้ายมือ ช่วยให้หาบรรทัดที่ kubectl แจ้ง Error ได้ทันที" }
      ],
      exampleCode: `# เทคนิคใน Vim เวลาต้องการเลื่อนย่อหน้าหลายบรรทัดพร้อมกัน:
# 1. กด Shift + V (เข้าสู่ Visual Line Mode) แล้วกดลูกศรลงเพื่อคลุมบรรทัดที่ต้องการ
# 2. กดปุ่ม > เพื่อดันย่อหน้าไปทางขวา 2 เคาะ (หรือกด < เพื่อดึงกลับซ้าย)
# 3. กดปุ่ม . (จุด) เพื่อทำซ้ำการดันย่อหน้าอีกครั้ง`,
      examTip: "หากก๊อปปี้โค้ด YAML จากหน้าเว็บมาวางใน Vim แล้วบรรทัดเยื้องเป็นขั้นบันได ให้พิมพ์ `:set paste` ก่อนวาง แล้วกด `i` เพื่อวางโค้ดได้เลย!"
    },

    // =========================================================================
    // 2. POD & MULTI-CONTAINER (CREATE, RUN, SIDECAR, EXEC)
    // =========================================================================
    {
      id: "tip-pod-run-imperative",
      categoryId: "pods-exec",
      categoryTitle: "จัดการ Pod, Multi-Container & รันคำสั่งในพอด",
      title: "สร้าง Pod พร้อมกำหนดพอร์ต, เลเบล, Env และคำสั่งเริ่มต้นในบรรทัดเดียว",
      examTag: "CKAD Domain 1",
      importance: "CRITICAL",
      command: `kubectl run web-app --image=nginx:1.25-alpine -n prod \\
  --port=80 --labels="app=web,tier=frontend" \\
  --env="APP_ENV=production" --dry-run=client -o yaml > pod.yaml`,
      howItWorks:
        "คำสั่ง `kubectl run` เป็นวิธีที่เร็วที่สุดในการขึ้นโครงร่าง Pod (หรือสร้าง Pod ทันทีหากไม่ใส่ `--dry-run=client`) โดยสามารถแนบพอร์ต ป้ายกำกับ (Labels) และตัวแปรสภาพแวดล้อม (Environment Variables) ไปพร้อมกันได้",
      flags: [
        { flag: "--image=<image:tag>", desc: "ระบุชื่อคอนเทนเนอร์อิมเมจและเวอร์ชันที่ต้องการรัน" },
        { flag: "--port=<number>", desc: "กำหนดค่า containerPort ในสเปกของคอนเทนเนอร์" },
        { flag: "--labels=\"k1=v1,k2=v2\"", desc: "ติดป้ายกำกับ metadata.labels ให้กับพอดตั้งแต่ตอนสร้าง" },
        { flag: "--env=\"KEY=VALUE\"", desc: "ฉีดตัวแปรสภาพแวดล้อมเข้าไปในคอนเทนเนอร์ (ระบุซ้ำหลายตัวได้)" }
      ],
      exampleCode: `# สร้าง Pod ที่รันคำสั่ง sh -c แบบกำหนดเอง (สังเกตขีดกลางสองขีด -- ก่อนคำสั่ง)
kubectl run busy-worker --image=busybox:1.36 -n default \\
  --restart=Never --command -- sh -c "echo Hello && sleep 3600"`,
      examTip: "ข้อควรจำ: `--command --` ต้องวางไว้ท้ายสุดของคำสั่ง `kubectl run` เสมอ เพราะทุกอย่างหลัง `--` จะถูกส่งไปเป็นคำสั่งของคอนเทนเนอร์ ไม่ใช่ Flag ของ kubectl!"
    },
    {
      id: "tip-pod-exec-interactive",
      categoryId: "pods-exec",
      categoryTitle: "จัดการ Pod, Multi-Container & รันคำสั่งในพอด",
      title: "รันคำสั่งหรือเปิด Shell เข้าไปตรวจสอบภายในคอนเทนเนอร์ (kubectl exec)",
      examTag: "CKAD Domain 3",
      importance: "HIGH",
      command: `kubectl exec -it my-pod -n prod -c main-app -- sh`,
      howItWorks:
        "ใช้สำหรับส่งคำสั่งเข้าไปรันภายในคอนเทนเนอร์ที่กำลังมีสถานะ `Running` อยู่ เพื่อตรวจสอบไฟล์ภายใน Volume, ทดสอบยิง `curl`/`wget`, หรือดูตัวแปร `env` จริงในคอนเทนเนอร์",
      flags: [
        { flag: "-i (--stdin)", desc: "เปิดรับข้อมูลนำเข้ามาตรฐาน (Standard Input) ไปยังคอนเทนเนอร์" },
        { flag: "-t (--tty)", desc: "จำลองหน้าจอ Terminal (TTY) เพื่อให้โต้ตอบกับ Shell ได้" },
        { flag: "-c <container-name>", desc: "ระบุชื่อคอนเทนเนอร์เป้าหมาย (จำเป็นเมื่อพอดนั้นมีหลายคอนเทนเนอร์หรือมี Sidecar)" },
        { flag: "-- <command>", desc: "คั่นระหว่าง Flag ของ kubectl กับคำสั่งที่ต้องการรันในคอนเทนเนอร์" }
      ],
      exampleCode: `# รันคำสั่งตรวจดูไฟล์หรือตัวแปร Env โดยไม่ต้องเปิด Shell ค้างไว้
kubectl exec my-pod -n prod -- ls -la /usr/share/nginx/html
kubectl exec my-pod -n prod -- env | grep APP_
kubectl exec my-pod -n prod -- cat /etc/secret-volume/db-password`,
      examTip: "หากต้องการรันแค่คำสั่งเดียวแล้วออกเลย (เช่น `cat` หรือ `env`) ไม่จำเป็นต้องใส่ `-it` ก็ได้ จะช่วยให้ดูผลลัพธ์ใน Terminal ได้เร็วกว่ามาก"
    },
    {
      id: "tip-pod-replace-force",
      categoryId: "pods-exec",
      categoryTitle: "จัดการ Pod, Multi-Container & รันคำสั่งในพอด",
      title: "ดึง YAML ของพอดที่รันอยู่มาแก้ แล้วสั่งลบ-สร้างใหม่ในคำสั่งเดียว",
      examTag: "CKAD Speed Trick",
      importance: "CRITICAL",
      command: `kubectl get pod broken-pod -n prod -o yaml > fix-pod.yaml
vim fix-pod.yaml
kubectl replace --force -f fix-pod.yaml`,
      howItWorks:
        "ใน Kubernetes ฟิลด์ส่วนใหญ่ของ Pod ที่รันอยู่แล้วไม่สามารถแก้ไขตรงๆ ด้วย `kubectl edit` ได้ (ยกเว้น `image`, `activeDeadlineSeconds`, `tolerations`) ดังนั้นวิธีมาตรฐานเมื่อโจทย์สั่งให้แก้ Command, VolumeMount, SecurityContext หรือ Env ของ Pod คือการดึง YAML ออกมาแก้ แล้วใช้ `kubectl replace --force -f` ซึ่งจะทำการลบพอดเก่าและสร้างพอดใหม่จากไฟล์ให้ในคำสั่งเดียว!",
      flags: [
        { flag: "-o yaml > file.yaml", desc: "ดึงสเปกทั้งหมดของ Resource ที่รันอยู่ในคลัสเตอร์ออกมาบันทึกเป็นไฟล์ YAML" },
        { flag: "replace --force -f", desc: "บังคับลบ Resource เดิมทันที (เหมือน --grace-period=0) แล้วสร้างใหม่จากไฟล์ที่ระบุ" }
      ],
      exampleCode: `# ลบพอดเก่าและสร้างพอดใหม่จากไฟล์ที่แก้ไขเสร็จแล้วทันที
kubectl replace --force -f ~/ckad-workspace/ckad-10/broken-pod.yaml`,
      examTip: "คำสั่ง `kubectl replace --force -f pod.yaml` เป็นหนึ่งในคำสั่งที่ช่วยชีวิตผู้เข้าสอบ CKAD มากที่สุด เพราะไม่ต้องรัน `kubectl delete` แล้วรอพอดดับก่อนค่อย `kubectl apply`"
    },

    // =========================================================================
    // 3. DEPLOYMENT, SCALING, ROLLOUT & KUSTOMIZE
    // =========================================================================
    {
      id: "tip-deploy-create-scale",
      categoryId: "deployments-rollout",
      categoryTitle: "Deployment, Scale, Rollout, Rollback & Kustomize",
      title: "สร้าง Deployment, ปรับจำนวน Replicas และเปลี่ยนเวอร์ชัน Image",
      examTag: "CKAD Domain 2",
      importance: "CRITICAL",
      command: `kubectl create deployment checkout-api --image=nginx:1.25-alpine --replicas=3 -n prod
kubectl scale deployment checkout-api --replicas=5 -n prod
kubectl set image deployment/checkout-api nginx=nginx:1.26-alpine -n prod --record`,
      howItWorks:
        "ใช้บริหารจัดการวงจรชีวิตของ Deployment แบบ Imperative โดยไม่ต้องเปิดแก้ไฟล์ YAML:\n" +
        "• `create deployment`: สร้าง Deployment พร้อมกำหนดอิมเมจและจำนวนพอดเริ่มต้น\n" +
        "• `scale`: เพิ่มหรือลดจำนวนพอด (Replicas) ทันที (ใช้บ่อยมากในการทำ Canary Deployment 80/20)\n" +
        "• `set image`: อัปเดตเวอร์ชันของคอนเทนเนอร์อิมเมจเพื่อกระตุ้นการทำ RollingUpdate",
      flags: [
        { flag: "--replicas=<N>", desc: "กำหนดจำนวนพอดที่ต้องการให้ Deployment รักษาสภาพไว้" },
        { flag: "set image deploy/<name> <container>=<image>", desc: "เปลี่ยนอิมเมจของคอนเทนเนอร์ชื่อที่ระบุภายใน Deployment" }
      ],
      exampleCode: `# ตรวจสอบชื่อคอนเทนเนอร์ใน Deployment ก่อนใช้คำสั่ง set image
kubectl get deploy checkout-api -n prod -o jsonpath='{.spec.template.spec.containers[*].name}'

# สร้างไฟล์ YAML ของ Deployment เพื่อนำไปเพิ่ม Probes หรือ Volumes ต่อ
kubectl create deploy web-ui --image=nginx:1.25-alpine --replicas=2 $do > deploy.yaml`,
      examTip: "ก่อนรัน `kubectl set image` ให้เช็กชื่อคอนเทนเนอร์เสมอ เพราะบางครั้งโจทย์ไม่ได้ตั้งชื่อคอนเทนเนอร์ว่า `nginx` แต่อาจตั้งว่า `web` หรือ `app`"
    },
    {
      id: "tip-rollout-undo-history",
      categoryId: "deployments-rollout",
      categoryTitle: "Deployment, Scale, Rollout, Rollback & Kustomize",
      title: "ตรวจสอบสถานะการอัปเดต ดูประวัติ Revision และสั่ง Rollback ย้อนกลับ",
      examTag: "CKAD Domain 2",
      importance: "CRITICAL",
      command: `kubectl rollout status deployment/checkout-api -n prod
kubectl rollout history deployment/checkout-api -n prod
kubectl rollout undo deployment/checkout-api -n prod --to-revision=1`,
      howItWorks:
        "เมื่อ Deployment ถูกเปลี่ยนอิมเมจหรือสเปกพอด Kubernetes จะสร้าง ReplicaSet ตัวใหม่ (Revision ใหม่) หากอิมเมจใหม่มีปัญหา (เช่นติด `ImagePullBackOff` หรือ `CrashLoopBackOff`) เราสามารถใช้ `rollout undo` เพื่อสั่งย้อนกลับไปใช้ ReplicaSet ของ Revision ก่อนหน้าที่ยังทำงานได้ดีทันที",
      flags: [
        { flag: "rollout status", desc: "เฝ้าดูความคืบหน้าของการทำ RollingUpdate จนกว่าพอดใหม่จะพร้อมครบทุกตัว" },
        { flag: "rollout history", desc: "แสดงตารางประวัติ Revision ทั้งหมดของ Deployment" },
        { flag: "rollout undo", desc: "ย้อนกลับไปยัง Revision ก่อนหน้าล่าสุด (หรือระบุ --to-revision=<N> เพื่อเจาะจงเลข Revision)" }
      ],
      exampleCode: `# ดูรายละเอียดสเปกของแต่ละ Revision ว่าใช้อิมเมจอะไร
kubectl rollout history deployment/checkout-api -n prod --revision=1

# ย้อนกลับไปยัง Revision ก่อนหน้าทันที
kubectl rollout undo deployment/checkout-api -n prod`,
      examTip: "ในข้อสอบ CKAD มักให้บันทึกผลลัพธ์ของ `kubectl rollout history deploy/... > history.txt` อย่าลืมตรวจสอบพาธไฟล์ที่โจทย์สั่งให้บันทึกด้วย!"
    },
    {
      id: "tip-kustomize-apply",
      categoryId: "deployments-rollout",
      categoryTitle: "Deployment, Scale, Rollout, Rollback & Kustomize",
      title: "ตรวจสอบและสั่งดีพลอยโปรเจกต์ Kustomize (kubectl kustomize / apply -k)",
      examTag: "CKAD Domain 2",
      importance: "HIGH",
      command: `kubectl kustomize ~/ckad-workspace/ckad-08/
kubectl apply -k ~/ckad-workspace/ckad-08/`,
      howItWorks:
        "Kustomize ช่วยให้เราปรับแต่งไฟล์ YAML ต้นฉบับ (เช่น เติม `namePrefix`, เปลี่ยน `namespace`, เพิ่ม `commonLabels` หรือทำ `patches`) ผ่านไฟล์ `kustomization.yaml` โดยไม่ต้องแก้ไขไฟล์ต้นฉบับ:\n" +
        "• `kubectl kustomize <dir>`: ประมวลผลและพิมพ์ผลลัพธ์ YAML สุดท้ายออกมาดูบนหน้าจอ (เหมือนการพรีวิว)\n" +
        "• `kubectl apply -k <dir>`: ประมวลผล `kustomization.yaml` ในโฟลเดอร์นั้นแล้วส่งไปสร้างบนคลัสเตอร์ทันที",
      flags: [
        { flag: "-k (--kustomize) <dir>", desc: "สั่งให้ kubectl อ่านไฟล์ kustomization.yaml ในโฟลเดอร์ที่ระบุแทนการใช้ -f" }
      ],
      exampleCode: `# ตัวอย่างไฟล์ kustomization.yaml ที่ใช้บ่อยในห้องสอบ
cat << 'EOF' > kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: prod-ns
namePrefix: prod-
commonLabels:
  env: production
resources:
- deployment.yaml
- service.yaml
EOF
kubectl apply -k .`,
      examTip: "รัน `kubectl kustomize <โฟลเดอร์>` เพื่อตรวจดูว่าชื่อ Resource และ Labels ถูกต้องตามโจทย์เสมอ ก่อนรัน `kubectl apply -k <โฟลเดอร์>`"
    },

    // =========================================================================
    // 4. SERVICE, EXPOSE, INGRESS, NETWORKPOLICY & PORT TESTING
    // =========================================================================
    {
      id: "tip-expose-service",
      categoryId: "services-networking",
      categoryTitle: "Service, Expose, Ingress, NetworkPolicy & ทดสอบพอร์ต",
      title: "สร้าง Service เปิดเผย Pod หรือ Deployment ด้วยคำสั่ง kubectl expose",
      examTag: "CKAD Domain 5",
      importance: "CRITICAL",
      command: `kubectl expose deployment web-frontend --name=web-svc \\
  --port=80 --target-port=8080 --type=NodePort -n prod`,
      howItWorks:
        "คำสั่ง `kubectl expose` จะไปดึงค่า Label Selector จาก Pod หรือ Deployment ต้นทางมาใส่ใน `spec.selector` ของ Service ให้อัตโนมัติ ช่วยป้องกันความผิดพลาดจากการพิมพ์ชื่อ Label ผิดเอง!",
      flags: [
        { flag: "--name=<service-name>", desc: "กำหนดชื่อของ Service ที่จะสร้างขึ้น" },
        { flag: "--port=<port>", desc: "พอร์ตของ Service ที่เปิดรับทราฟฟิกภายในคลัสเตอร์" },
        { flag: "--target-port=<port>", desc: "พอร์ตจริงที่คอนเทนเนอร์ภายในพอดเปิดรอรับการเชื่อมต่ออยู่ (containerPort)" },
        { flag: "--type=ClusterIP|NodePort|LoadBalancer", desc: "ชนิดของ Service (ค่าเริ่มต้นคือ ClusterIP)" }
      ],
      exampleCode: `# หากโจทย์กำหนดเลข nodePort เฉพาะเจาะจง (เช่น 30180) ให้ใช้ $do สร้างไฟล์ออกมาเติม nodePort: 30180
kubectl expose deploy web-frontend --name=web-nodeport \\
  --port=80 --target-port=8080 --type=NodePort -n prod $do > svc.yaml
# เปิดไฟล์ svc.yaml เติม nodePort: 30180 ใต้ targetPort: 8080 แล้วสั่ง kubectl apply -f svc.yaml`,
      examTip: "หลังจากสร้างหรือแก้ Service ทุกครั้ง ให้รัน `kubectl get endpoints <ชื่อ-svc> -n <ns>` เพื่อยืนยันว่ามี IP:Port ของพอดโผล่ขึ้นมาแล้ว (ถ้าขึ้น `<none>` แปลว่า Selector ไม่ตรงกับพอด!)"
    },
    {
      id: "tip-create-ingress",
      categoryId: "services-networking",
      categoryTitle: "Service, Expose, Ingress, NetworkPolicy & ทดสอบพอร์ต",
      title: "สร้าง Ingress แยกเส้นทางตาม Host และ Path ในบรรทัดเดียว",
      examTag: "CKAD Domain 5",
      importance: "CRITICAL",
      command: `kubectl create ingress main-ing -n prod --class=nginx \\
  --rule="portal.exam.io/api*=api-service:8080" \\
  --rule="portal.exam.io/web*=web-service:80"`,
      howItWorks:
        "ไม่ต้องจำโครงสร้าง YAML ของ Ingress ที่ลึกหลายชั้น! คำสั่ง `kubectl create ingress` รองรับการระบุ `--class` และ `--rule` ได้หลายเส้นทางพร้อมกัน:\n" +
        "• เครื่องหมาย `*` หลังพาธ (เช่น `/api*`) จะตั้งค่า `pathType: Prefix` ให้โดยอัตโนมัติ\n" +
        "• หากไม่ใส่ `*` (เช่น `/api=api-service:8080`) จะได้ `pathType: Exact`",
      flags: [
        { flag: "--class=<ingress-class>", desc: "กำหนดค่า spec.ingressClassName (เช่น nginx)" },
        { flag: "--rule=\"host/path*=svc:port\"", desc: "กำหนดกฎการส่งทราฟฟิกจาก Host และ Path ไปยัง Service และพอร์ตเป้าหมาย (ใส่ซ้ำหลาย --rule ได้)" }
      ],
      exampleCode: `# กรณีโจทย์ไม่ระบุชื่อ Host (รับทุก Host) ให้เว้นว่างหน้าเครื่องหมาย /
kubectl create ingress catch-all-ing -n prod --class=nginx \\
  --rule="/pay*=payment-svc:3000" $do > ingress.yaml`,
      examTip: "จำรูปแบบ `--rule=\"host/path*=service:port\"` ให้แม่น จะช่วยสร้าง Ingress ที่ซับซ้อนเสร็จได้ภายใน 10 วินาทีโดยไม่เสี่ยงพิมพ์ย่อหน้า YAML ผิด!"
    },
    {
      id: "tip-test-service-curl",
      categoryId: "services-networking",
      categoryTitle: "Service, Expose, Ingress, NetworkPolicy & ทดสอบพอร์ต",
      title: "รันพอดชั่วคราวเพื่อทดสอบเชื่อมต่อ Service หรือ NetworkPolicy (curl / wget)",
      examTag: "CKAD Networking Verify",
      importance: "HIGH",
      command: `kubectl run test-client --image=busybox:1.36 -n prod \\
  --rm -it --restart=Never -- wget -qO- --timeout=2 http://api-service:8080`,
      howItWorks:
        "สร้างพอดทดสอบชั่วคราวขึ้นมาภายในคลัสเตอร์เพื่อยิง HTTP Request หรือทดสอบพอร์ตไปยัง Service/Pod เป้าหมาย เมื่อคำสั่งทำงานเสร็จ พอดจะถูกลบทิ้งอัตโนมัติด้วย `--rm`",
      flags: [
        { flag: "--rm", desc: "ลบพอดทดสอบทิ้งอัตโนมัติทันทีที่คำสั่งทำงานเสร็จสิ้น" },
        { flag: "--restart=Never", desc: "สร้างเป็น Pod เดี่ยวและไม่ต้องรีสตาร์ทเมื่อคำสั่งจบ" },
        { flag: "wget -qO- --timeout=2", desc: "ดึงข้อมูลจาก URL มาแสดงบนหน้าจอโดยตั้งเวลา Timeout 2 วินาที (สำคัญมากเมื่อทดสอบ NetworkPolicy ที่บล็อกทราฟฟิก)" }
      ],
      exampleCode: `# ทดสอบด้วยป้ายกำกับเฉพาะ (เช่น ทดสอบว่าพอดที่มี label role=api-backend เข้าหา db ได้หรือไม่)
kubectl run net-test --image=busybox:1.36 -n prod -l role=api-backend \\
  --rm -it --restart=Never -- nc -zv db-pod-ip 5432`,
      examTip: "ใส่ `--timeout=2` ใน `wget` หรือ `-w 2` ใน `nc` เสมอเวลาทดสอบ NetworkPolicy มิฉะนั้นหากทราฟฟิกถูกบล็อก คำสั่งจะค้างนานหลายนาที!"
    },

    // =========================================================================
    // 5. CONFIGMAP, SECRET & ENVIRONMENT VARIABLES
    // =========================================================================
    {
      id: "tip-configmap-secret-create",
      categoryId: "config-secrets",
      categoryTitle: "ConfigMap, Secret & การฉีดค่า Env / Volume",
      title: "สร้าง ConfigMap และ Secret จากค่า Literal หรือจากไฟล์",
      examTag: "CKAD Domain 4",
      importance: "CRITICAL",
      command: `kubectl create configmap app-cm -n prod --from-literal=APP_MODE=production --from-literal=LOG_LEVEL=info
kubectl create secret generic db-sec -n prod --from-literal=db-password='Sup3rS3cr3t!'`,
      howItWorks:
        "สร้างออบเจกต์เก็บค่าคอนฟิก (`ConfigMap`) และข้อมูลความลับ (`Secret` ชนิด `generic` ซึ่งจะเข้ารหัส Base64 ให้อัตโนมัติเมื่อใช้ `kubectl create secret`) โดยไม่ต้องแปลง Base64 เอง",
      flags: [
        { flag: "--from-literal=KEY=VALUE", desc: "ระบุคู่คีย์และค่าโดยตรงจาก Command Line (ใส่ซ้ำหลายคู่ได้)" },
        { flag: "--from-file=<path>", desc: "นำชื่อไฟล์มาเป็น Key และนำเนื้อหาทั้งไฟล์มาเป็น Value" },
        { flag: "--from-env-file=<path>", desc: "อ่านไฟล์ .env ที่มีหลายบรรทัด (KEY=VALUE) มาสร้างเป็นหลายคีย์พร้อมกัน" }
      ],
      exampleCode: `# วิธีถอดรหัส (Decode) ค่าใน Secret ที่มีอยู่แล้วในคลัสเตอร์ออกมาดูข้อความจริง
kubectl get secret db-sec -n prod -o jsonpath='{.data.db-password}' | base64 -d && echo ""

# ฉีด ConfigMap ทั้งก้อนเข้าไปเป็น Env ใน Deployment ที่มีอยู่แล้วด้วยคำสั่งเดียว
kubectl set env deployment/checkout-api --from=configmap/app-cm -n prod`,
      examTip: "เวลาใช้ `--from-literal` กับรหัสผ่านที่มีเครื่องหมายพิเศษ (เช่น `!` หรือ `$`) ให้ครอบค่าด้วย Single Quote `'...'` เสมอเพื่อไม่ให้ Bash ตีความอักขระพิเศษผิด!"
    },

    // =========================================================================
    // 6. JOBS & CRONJOBS
    // =========================================================================
    {
      id: "tip-cronjob-job-create",
      categoryId: "jobs-cronjobs",
      categoryTitle: "Job & CronJob (งานประมวลผลแบบ Batch)",
      title: "สร้าง Job และ CronJob พร้อมส่งออกเป็น YAML เพื่อเติม Parallelism / Deadline",
      examTag: "CKAD Domain 1",
      importance: "HIGH",
      command: `kubectl create cronjob nightly-report --image=busybox:1.36 \\
  --schedule="*/5 * * * *" -n prod --dry-run=client -o yaml \\
  -- sh -c "date && echo Batch complete" > cronjob.yaml`,
      howItWorks:
        "ใช้สร้างโครงสร้างของ `Job` หรือ `CronJob` ที่มักจำลำดับชั้นของ `jobTemplate.spec.template.spec` ได้ยาก ให้ถูกต้อง 100% ก่อนเปิดไฟล์เติมฟิลด์เพิ่มเติม เช่น `completions`, `parallelism`, `activeDeadlineSeconds`, หรือ `successfulJobsHistoryLimit`",
      flags: [
        { flag: "--schedule=\"* * * * *\"", desc: "ตารางเวลาแบบ Cron 5 ช่อง (นาที ชั่วโมง วันที่ เดือน วันในสัปดาห์)" },
        { flag: "--from=cronjob/<name>", desc: "ใช้กับ kubectl create job เพื่อสั่งรันงานจาก CronJob ที่มีอยู่แล้วทันที 1 รอบโดยไม่ต้องรอเวลา" }
      ],
      exampleCode: `# สั่งรัน Job ทดสอบทันทีจาก CronJob ที่มีอยู่แล้วในคลัสเตอร์ (ออกสอบบ่อย!)
kubectl create job manual-run-01 --from=cronjob/nightly-report -n prod

# ตำแหน่งการวางฟิลด์ในไฟล์ cronjob.yaml:
# spec:
#   schedule: "*/5 * * * *"
#   successfulJobsHistoryLimit: 2      <-- อยู่ใต้ CronJob spec
#   jobTemplate:
#     spec:
#       completions: 4                 <-- อยู่ใต้ Job spec
#       parallelism: 2                 <-- อยู่ใต้ Job spec
#       activeDeadlineSeconds: 60      <-- อยู่ใต้ Job spec`,
      examTip: "จำคำสั่ง `kubectl create job <ชื่อ-job> --from=cronjob/<ชื่อ-cronjob>` ไว้ให้แม่น เพราะข้อสอบมักสั่งให้สร้าง Job จาก CronJob ที่รันอยู่เพื่อทดสอบการทำงานทันที!"
    },

    // =========================================================================
    // 7. RBAC, SERVICEACCOUNT & SECURITY
    // =========================================================================
    {
      id: "tip-rbac-imperative",
      categoryId: "rbac-security",
      categoryTitle: "ServiceAccount, RBAC (Role/Binding) & ตรวจสิทธิ์",
      title: "สร้าง ServiceAccount, Role, RoleBinding และตรวจสอบสิทธิ์ด้วย auth can-i",
      examTag: "CKAD Domain 4 / CKA",
      importance: "CRITICAL",
      command: `kubectl create serviceaccount inspector-sa -n prod
kubectl create role pod-reader --verb=get,list,watch --resource=pods,services -n prod
kubectl create rolebinding inspector-binding --role=pod-reader --serviceaccount=prod:inspector-sa -n prod
kubectl auth can-i list pods --as=system:serviceaccount:prod:inspector-sa -n prod`,
      howItWorks:
        "กระบวนการมอบสิทธิ์ RBAC ใน Kubernetes ประกอบด้วย 3 ส่วนเสมอ:\n" +
        "1. **ServiceAccount (ตัวตนของพอด)**\n" +
        "2. **Role / ClusterRole (สิทธิ์ว่าทำกริยา `verb` อะไรกับ `resource` ไหนได้บ้าง)**\n" +
        "3. **RoleBinding / ClusterRoleBinding (ตัวเชื่อม Role เข้ากับ ServiceAccount)**\n" +
        "และตบท้ายด้วย `kubectl auth can-i` เพื่อจำลองตรวจว่า ServiceAccount นั้นได้รับสิทธิ์จริงหรือยัง!",
      flags: [
        { flag: "--verb=get,list,watch,create,delete", desc: "ระบุสิทธิ์การกระทำที่อนุญาตบน API" },
        { flag: "--resource=pods,services,deployments", desc: "ระบุชนิดของ Kubernetes Resource ที่อนุญาตให้เข้าถึง" },
        { flag: "--serviceaccount=<ns>:<sa-name>", desc: "รูปแบบการระบุ ServiceAccount ใน RoleBinding ต้องใส่ชื่อ Namespace คั่นด้วยโคลอนเสมอ!" },
        { flag: "auth can-i <verb> <resource> --as=...", desc: "ตรวจสอบว่าผู้ใช้หรือ ServiceAccount ที่ระบุมีสิทธิ์ทำคำสั่งนั้นหรือไม่ (ตอบ yes / no)" }
      ],
      exampleCode: `# ตรวจสอบว่า ServiceAccount ของเราสามารถอ่าน configmaps และ secrets ใน namespace prod ได้หรือยัง
kubectl auth can-i get secrets --as=system:serviceaccount:prod:inspector-sa -n prod`,
      examTip: "จุดที่ผู้เข้าสอบผิดบ่อยที่สุดคือ `--serviceaccount=<namespace>:<sa-name>` ต้องมีชื่อ Namespace นำหน้าเสมอ และเวลาทดสอบด้วย `--as=` ต้องเขียนเต็มว่า `system:serviceaccount:<namespace>:<sa-name>`"
    },

    // =========================================================================
    // 8. STORAGE (PV, PVC & VOLUME MOUNTS)
    // =========================================================================
    {
      id: "tip-storage-pv-pvc",
      categoryId: "storage-pvc",
      categoryTitle: "PersistentVolume (PV), PVC & การเช็กพื้นที่จัดเก็บ",
      title: "ตรวจสอบสถานะการจับคู่ (Bound / Pending) ของ PV และ PVC",
      examTag: "CKAD Domain 1",
      importance: "HIGH",
      command: `kubectl get pv,pvc -n prod -o wide`,
      howItWorks:
        "เมื่อสร้าง `PersistentVolumeClaim` (PVC) ระบบจะค้นหา `PersistentVolume` (PV) ที่มีคุณสมบัติตรงกัน 3 ข้อเพื่อจับคู่เข้าด้วยกัน (สถานะเปลี่ยนจาก `Pending` เป็น `Bound`):\n" +
        "1. `storageClassName` ต้องตรงกันทุกตัวอักษร\n" +
        "2. `accessModes` (เช่น `ReadWriteOnce`) ต้องตรงกัน\n" +
        "3. ขนาด `capacity.storage` ของ PV ต้องมากกว่าหรือเท่ากับ `resources.requests.storage` ของ PVC",
      flags: [
        { flag: "get pv,pvc", desc: "แสดงทั้ง PersistentVolume (ระดับคลัสเตอร์) และ PersistentVolumeClaim (ระดับ Namespace) พร้อมกันในหน้าจอเดียว" }
      ],
      exampleCode: `# หาก PVC ค้างสถานะ Pending ให้รัน describe เพื่อดูข้อความแจ้งเหตุผลจาก PersistentVolumeController
kubectl describe pvc my-pvc-claim -n prod`,
      examTip: "ในโจทย์แก้ปัญหาพอดค้าง `Pending` เพราะ PVC ไม่ยอม `Bound` ให้เช็ก `storageClassName` ของ PV กับ PVC เป็นอันดับแรก (ถ้าแก้ `storageClassName` ของ PVC ที่สร้างไปแล้วไม่ได้ ให้ลบ PVC นั้นทิ้งแล้ว `apply` ใหม่)"
    },

    // =========================================================================
    // 9. DEBUGGING, LOGS, EVENTS, DESCRIBE & EXPLAIN
    // =========================================================================
    {
      id: "tip-debug-logs-events",
      categoryId: "debug-troubleshooting",
      categoryTitle: "ตรวจหาสาเหตุพอดพัง (Logs, Describe, Events, Explain)",
      title: "ดู Logs ของคอนเทนเนอร์ (ปัจจุบัน / รอบก่อนแครช) และดู Events ล่าสุด",
      examTag: "CKAD Domain 3",
      importance: "CRITICAL",
      command: `kubectl logs broken-pod -n prod -c worker --previous
kubectl describe pod broken-pod -n prod
kubectl get events -n prod --sort-by='.lastTimestamp'`,
      howItWorks:
        "ชุดคำสั่งหลักในการวินิจฉัยปัญหาพอดติด `CrashLoopBackOff`, `Error`, `ImagePullBackOff`, หรือ `Pending`:\n" +
        "• `kubectl logs`: ดูข้อความ Standard Output / Error ที่แอปพลิเคชันพิมพ์ออกมา\n" +
        "• `kubectl describe`: ดูสถานะ Exit Code, Last State, Readiness/Liveness Probe Failures และ Events ท้ายตาราง\n" +
        "• `kubectl get events`: ดูเหตุการณ์ทั้งหมดใน Namespace เรียงตามเวลาเกิดล่าสุด",
      flags: [
        { flag: "--previous (-p)", desc: "ดู Log ของคอนเทนเนอร์ในรอบก่อนหน้าที่จะแครช (ใช้เมื่อคอนเทนเนอร์เพิ่งรีสตาร์ทใหม่แล้ว Log รอบปัจจุบันยังว่างอยู่)" },
        { flag: "-c <container>", desc: "เลือกดู Log เฉพาะคอนเทนเนอร์ที่ระบุใน Multi-Container Pod" },
        { flag: "--tail=<N>", desc: "แสดงเฉพาะ N บรรทัดสุดท้ายของ Log" }
      ],
      exampleCode: `# คัดกรองเฉพาะบรรทัดที่มีคำว่า CRITICAL หรือ ERROR แล้วบันทึกลงไฟล์ตามที่โจทย์สั่ง
kubectl logs payment-authorizer -n audit-ns | grep CRITICAL > ~/ckad-workspace/errors.log`,
      examTip: "ถ้า `kubectl logs` ไม่แสดงอะไรเลย ให้ดูใน `kubectl describe pod` ตรงหัวข้อ `State / Last State` และ `Events:` ด้านล่างสุด จะบอกสาเหตุชัดเจน เช่น พิมพ์คำสั่ง `command` ผิด หรือ Probe ยิงผิดพอร์ต!"
    },
    {
      id: "tip-kubectl-explain",
      categoryId: "debug-troubleshooting",
      categoryTitle: "ตรวจหาสาเหตุพอดพัง (Logs, Describe, Events, Explain)",
      title: "เปิดคู่มือโครงสร้าง YAML ในตัวด้วย kubectl explain (เมื่อจำชื่อฟิลด์ไม่ได้)",
      examTag: "Exam Lifesaver",
      importance: "CRITICAL",
      command: `kubectl explain pod.spec.securityContext
kubectl explain pod.spec.containers.securityContext.capabilities
kubectl explain cronjob.spec.jobTemplate.spec --recursive`,
      howItWorks:
        "คำสั่ง `kubectl explain` คือโพยคู่มือ Schema ทางการที่ฝังอยู่ในตัว kubectl เอง! ช่วยให้เราเช็กได้ทันทีว่าฟิลด์นั้นสะกดอย่างไร เป็นชนิดข้อมูลอะไร (Object, Array `[]string`, Integer, Boolean) และวางอยู่ใต้ระดับชั้นไหนโดยไม่ต้องเปิดเว็บค้นหา",
      flags: [
        { flag: "--recursive", desc: "แสดงแผนผังชื่อฟิลด์ลูกทั้งหมดที่อยู่ภายใต้พาธนั้นออกมาเป็นลำดับชั้น (Tree)" }
      ],
      exampleCode: `# เช็กว่า livenessProbe มีฟิลด์ย่อยอะไรบ้าง
kubectl explain pod.spec.containers.livenessProbe

# เช็กโครงสร้าง NetworkPolicy ingress rules แบบรวดเร็ว
kubectl explain networkpolicy.spec.ingress --recursive`,
      examTip: "เมื่อไม่แน่ใจว่า `fsGroup` หรือ `capabilities` อยู่ระดับ Pod หรือระดับ Container ให้รัน `kubectl explain pod.spec.securityContext` เทียบกับ `kubectl explain pod.spec.containers.securityContext` จะเห็นคำตอบใน 2 วินาที!"
    },

    // =========================================================================
    // 10. ADVANCED OUTPUT FORMATTING (JSONPATH, PATCH, LABEL)
    // =========================================================================
    {
      id: "tip-jsonpath-patch-label",
      categoryId: "jsonpath-advanced",
      categoryTitle: "คัดกรองข้อมูลขั้นสูง (JSONPath, Custom-Columns, Patch, Label)",
      title: "ดึงค่าเฉพาะเจาะจงด้วย JSONPath, ติด Label และแก้ไขฟิลด์ด้วย kubectl patch",
      examTag: "CKAD / CKA Advanced",
      importance: "HIGH",
      command: `kubectl get pods -n prod -l app=web --show-labels
kubectl label pod web-pod-1 env=production --overwrite -n prod
kubectl patch svc orders-svc -n prod -p '{"spec":{"selector":{"app":"orders-v2"}}}'`,
      howItWorks:
        "ช่วยจัดการแก้ไขฟิลด์เฉพาะจุดหรือคัดกรอง Resource จำนวนมากด้วยความเร็วสูง:\n" +
        "• `kubectl get ... -l key=val`: กรองเฉพาะ Resource ที่มีป้ายกำกับตรงตามเงื่อนไข\n" +
        "• `kubectl label ... --overwrite`: เพิ่มหรือเขียนทับค่า Label ของ Resource ทันที (หากต้องการลบ Label ให้ใส่เครื่องหมายลบต่อท้ายชื่อคีย์ เช่น `env-`)\n" +
        "• `kubectl patch`: ส่ง JSON/YAML เฉพาะฟิลด์ที่ต้องการเปลี่ยนไปอัปเดต Resource บนคลัสเตอร์โดยตรง",
      flags: [
        { flag: "--show-labels", desc: "แสดงคอลัมน์ LABELS ของทุก Resource ในตารางผลลัพธ์" },
        { flag: "--overwrite", desc: "อนุญาตให้เขียนทับค่า Label เดิมหากมีคีย์นั้นอยู่แล้ว" },
        { flag: "-p '<json>'", desc: "ระบุโครงสร้าง JSON เฉพาะส่วนที่ต้องการแก้ไข (Strategic Merge Patch)" },
        { flag: "-o jsonpath='{...}'", desc: "ดึงเฉพาะค่าจากพาธ JSON ที่ระบุออกมาแสดงผล" }
      ],
      exampleCode: `# ดึงรายชื่ออิมเมจของทุกพอดใน Namespace ออกมาดูพร้อมกัน
kubectl get pods -n prod -o custom-columns="POD_NAME:.metadata.name,IMAGE:.spec.containers[*].image"

# สลับทราฟฟิก Blue/Green ของ Service ไปยัง version=v2.0 ในคำสั่งเดียว
kubectl patch svc public-api-svc -n prod -p '{"spec":{"selector":{"version":"v2.0"}}}'`,
      examTip: "คำสั่ง `-o custom-columns=\"NAME:.metadata.name,PORT:.spec.containers[*].ports[*].containerPort\"` มีประโยชน์มากเวลาต้องการตรวจพอร์ตหรืออิมเมจของพอดหลายสิบตัวในตารางเดียว!"
    }
  ];

  // Quick One-Liner Cheat Table for rapid lookup at the top of the Tips View
  const CLI_QUICK_REFERENCE_TABLE = [
    { action: "สลับคลัสเตอร์ Context ก่อนเริ่มทำโจทย์", cmd: "kubectl config use-context k8s-c1-H" },
    { action: "สร้างไฟล์ YAML ของ Pod อย่างรวดเร็ว", cmd: "kubectl run my-pod --image=nginx:1.25-alpine --dry-run=client -o yaml > pod.yaml" },
    { action: "ลบพอดเก่าและสร้างใหม่จากไฟล์ทันที", cmd: "kubectl replace --force -f pod.yaml" },
    { action: "สร้าง Deployment พร้อมกำหนด Replicas", cmd: "kubectl create deploy my-dep --image=nginx:1.25-alpine --replicas=3" },
    { action: "สั่งย้อนกลับ (Rollback) Deployment ที่พัง", cmd: "kubectl rollout undo deploy/my-dep" },
    { action: "สร้าง Service (NodePort / ClusterIP) จาก Deployment", cmd: "kubectl expose deploy my-dep --name=my-svc --port=80 --target-port=8080 --type=NodePort" },
    { action: "สร้าง Ingress แยกเส้นทางตาม Host & Path", cmd: "kubectl create ingress my-ing --class=nginx --rule=\"host.io/path*=svc:80\"" },
    { action: "สร้าง ConfigMap / Secret จากค่าตัวแปร", cmd: "kubectl create cm my-cm --from-literal=KEY=VAL  |  kubectl create secret generic my-sec --from-literal=PASS='123'" },
    { action: "สร้าง Role และ RoleBinding ให้ ServiceAccount", cmd: "kubectl create role my-role --verb=get,list,watch --resource=pods  &&  kubectl create rolebinding my-rb --role=my-role --serviceaccount=ns:sa" },
    { action: "เปิดคู่มือดูโครงสร้างฟิลด์ YAML ในตัว", cmd: "kubectl explain pod.spec.containers.securityContext --recursive" }
  ];

  const cliTipsCatalog = {
    categories: CLI_TIPS_CATEGORIES,
    items: CLI_TIPS_ITEMS,
    quickTable: CLI_QUICK_REFERENCE_TABLE
  };

  if (typeof window !== "undefined") {
    window.CLI_TIPS_DATA = cliTipsCatalog;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = cliTipsCatalog;
  }
})(typeof window !== "undefined" ? window : globalThis);

