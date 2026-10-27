/**
 * KubeMastery: Course Foundation - K8s Foundation & Imperative CLI Mastery
 * Complete syllabus aligned with CNCF Official Guidelines for both CKA and CKAD.
 */

window.COURSE_FOUNDATION = {
  id: "course-foundation",
  badge: "FOUNDATION",
  title: "K8s Foundation & CLI Speed Mastery",
  subtitle: "ปูรากฐานสถาปัตยกรรม Kubernetes และเทคนิคพิมพ์คำสั่ง Imperative ความเร็วแสง",
  description: "หลักสูตรเตรียมตัวพื้นฐานก่อนลงสนามสอบ CKA/CKAD ครอบคลุมการเซ็ตอัปสิ่งแวดล้อมสอบใน 60 วินาทีแรก, การใช้คำสั่ง Imperative สร้าง YAML โดยไม่ต้องพิมพ์เอง, และการใช้ JSONPath ค้นหาข้อมูล",
  icon: "⚡",
  color: "from-blue-600 via-indigo-600 to-cyan-500",
  badgeColor: {
    bg: "bg-blue-100 dark:bg-blue-950",
    text: "text-blue-700 dark:text-cyan-300",
    border: "border-blue-200 dark:border-blue-800"
  },
  blocks: [
    {
      id: "foundation-b1",
      title: "Exam Environment & Speed Configuration",
      titleTh: "การตั้งค่าสภาพแวดล้อมในห้องสอบ PSI Bridge",
      icon: "⏱️",
      category: "setup",
      description: "เทคนิคการตั้งค่า Bash alias, Vim configuration, Tmux shortcuts และการสลับ Context / Namespace ซึ่งเป็นจุดตายที่ผู้สอบมักเสียเวลามากที่สุด",
      units: [
        {
          id: "fn-u1-1",
          title: "Unit 1.1: First 60 Seconds - Alias, Export & Vimrc Setup",
          summary: "ตั้งค่าตัวแปรลัดและ Indentation ของ Vim ในนาทีแรกของการสอบ เพื่อพิมพ์คำสั่งได้ไวขึ้นและป้องกันไฟล์ YAML พัง",
          docsUrl: "https://kubernetes.io/docs/reference/kubectl/cheatsheet/",
          docsKeyword: "kubectl Cheat Sheet",
          blueprint: `# 1. บันทึก alias & environment variables ลงใน ~/.bashrc
alias k=kubectl
export do="--dry-run=client -o yaml"
export now="--force --grace-period=0"
complete -o default -F __start_kubectl k

# 2. ตั้งค่า Indentation ของ Vim ใน ~/.vimrc
set expandtab
set tabstop=2
set shiftwidth=2
set autoindent
set number
set paste`,
          explanation: `### ทำไมต้องตั้งค่าสิ่งเหล่านี้ทันทีที่เริ่มสอบ?
ในการสอบ CKA และ CKAD บนแพลตฟอร์ม PSI Bridge คุณจะได้ Terminal เสมือนบนเบราว์เซอร์ การพิมพ์ทุกคำสั่งด้วย \`kubectl\` ซ้ำๆ และการแก้ไขไฟล์ YAML ที่กด Tab แล้วเผลอสร้างช่องว่างไม่สม่ำเสมอจะทำให้เสียเวลาอย่างมหาศาล

1. **\`alias k=kubectl\`**: ลดจำนวนการพิมพ์ตัวอักษรลง 6 ตัวในทุกคำสั่ง (ห้องสอบบางคลัสเตอร์มีให้แล้ว แต่การเช็กหรือตั้งไว้ก่อนจะช่วยให้มั่นใจ 100%)
2. **\`export do="--dry-run=client -o yaml"\`**: หัวใจสำคัญที่สุดสำหรับการสร้าง Resource template โดยไม่ต้องจำ syntax YAML เช่น \`k run web --image=nginx $do > pod.yaml\`
3. **\`export now="--force --grace-period=0"\`**: ใช้ลบ Pod ทันทีโดยไม่ต้องรอ Graceful shutdown 30 วินาที (\`k delete pod web $now\`)
4. **\`~/.vimrc\`**: ตั้งค่าให้กดปุ่ม \`Tab\` แล้วกลายเป็น Space 2 ช่องเสมอ (\`expandtab\`, \`shiftwidth=2\`) ป้องกัน error indentation ใน YAML
5. **Auto-completion**: คำสั่ง \`complete -o default -F __start_kubectl k\` ช่วยให้กดปุ่ม Tab เพื่อ autocomplete คำสั่งและชื่อ resource แม้ใช้ alias \`k\` ได้อย่างราบรื่น`,
          examples: [
            {
              desc: "1. ทดสอบสร้าง Pod YAML Template ด้วยตัวแปร $do",
              cmd: "k run test-pod --image=nginx:alpine $do > test-pod.yaml",
              yaml: `apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: test-pod
  name: test-pod
spec:
  containers:
  - image: nginx:alpine
    name: test-pod
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always`
            },
            {
              desc: "2. สั่งลบ Pod ทันทีโดยไม่รอเวลา Graceful period",
              cmd: "k delete pod test-pod $now"
            },
            {
              desc: "3. วิธีตั้งค่า ~/.vimrc แบบบรรทัดเดียว (One-liner)",
              cmd: 'echo -e "set expandtab\\nset tabstop=2\\nset shiftwidth=2\\nset autoindent\\nset number" > ~/.vimrc'
            }
          ],
          examTips: [
            "อย่าลืมว่าใน PSI Terminal การคัดลอก/วางข้อความใช้ปุ่ม Ctrl+Shift+C และ Ctrl+Shift+V",
            "หากเผลอกด Tab ใน Vim แล้ว syntax พัง ให้พิมพ์ :set expandtab ใน Command Mode (:)",
            "ใน ~/.bashrc คุณสามารถใส่ 'source <(kubectl completion bash)' เพื่อเปิดใช้งาน auto-completion ได้ทันที"
          ],
          quickCheck: {
            question: "หากต้องการสร้างไฟล์โครงร่าง YAML ของ Deployment ชื่อ 'backend' จากอิมเมจ 'redis' โดยไม่สั่งรันจริงบนคลัสเตอร์ ควรใช้คำสั่งใด?",
            options: [
              "kubectl run backend --image=redis --dry-run=client -o yaml",
              "kubectl create deployment backend --image=redis --dry-run=client -o yaml",
              "kubectl apply deployment backend --image=redis -o yaml",
              "kubectl new deployment backend --image=redis --dry-run"
            ],
            answer: 1,
            explanation: "สำหรับ Deployment ต้องใช้คำสั่ง 'kubectl create deployment' คู่กับ '--dry-run=client -o yaml' (ถ้าใช้ kubectl run จะได้เป็น Pod เดี่ยว)"
          }
        },
        {
          id: "fn-u1-2",
          title: "Unit 1.2: Context & Namespace Switching กฎเหล็กก่อนลงมือทำ",
          summary: "การสลับ Cluster Context และการกำหนด Namespace เริ่มต้น เพื่อป้องกันการทำโจทย์ผิดคลัสเตอร์",
          docsUrl: "https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/",
          docsKeyword: "Configure Access to Multiple Clusters",
          blueprint: `# 1. สลับ Context ตามกล่องสีฟ้าบนหัวข้อสอบ
kubectl config use-context <cluster-name>

# 2. ดู Context ปัจจุบันที่กำลังเชื่อมต่อ
kubectl config current-context

# 3. สลับ Default Namespace ให้ Context ปัจจุบัน
kubectl config set-context --current --namespace=<namespace-name>`,
          explanation: `### กฎข้อสอบ CNCF: กล่องสีฟ้าบนหัวข้อ
ข้อสอบ CKA/CKAD ประกอบด้วยคลัสเตอร์ 4-6 คลัสเตอร์ที่แตกต่างกัน ทุกครั้งที่เริ่มโจทย์ข้อใหม่:
1. **ต้องรันคำสั่งสลับ Context เสมอ**: กล่องข้อความด้านบนของแต่ละข้อจะมีคำสั่งระบุชัดเจน เช่น \`kubectl config use-context k8s\` หากลืมรัน คุณจะทำโจทย์ในคลัสเตอร์เดิมและเสียคะแนนข้อนั้นทันที
2. **การตั้ง Default Namespace**: หากโจทย์ข้อนั้นระบุว่า 'All tasks must be performed in namespace internal' ให้รันคำสั่งกำหนด namespace ประจำ context จะได้ไม่ต้องคอยพิมพ์ \`-n internal\` ในทุกคำสั่ง`,
          examples: [
            {
              desc: "ดูรายการ Context ทั้งหมดและคลัสเตอร์ที่กำลังใช้งานอยู่",
              cmd: "kubectl config get-contexts"
            },
            {
              desc: "เปลี่ยน Context ปัจจุบันให้ชี้ไปยัง Namespace 'finance' โดยอัตโนมัติ",
              cmd: "kubectl config set-context --current --namespace=finance"
            },
            {
              desc: "ตรวจสอบว่า Namespace ปัจจุบันคืออะไร",
              cmd: "kubectl config view --minify -o jsonpath='{..namespace}'"
            }
          ],
          examTips: [
            "สร้างนิสัย: เมื่อเริ่มอ่านข้อใหม่ ให้คลิก copy คำสั่งสลับ context จากหัวข้อมาแปะใน Terminal เป็นอันดับแรกเสมอ",
            "หากไม่แน่ใจว่ากำลังอยู่คลัสเตอร์ไหน ให้รัน 'kubectl config current-context' เพื่อยืนยัน",
            "หากโจทย์ไม่ได้ระบุ namespace มักหมายถึง 'default' อย่าเผลอทำงานค้างใน namespace ของข้อก่อนหน้า!"
          ],
          quickCheck: {
            question: "คำสั่งใดใช้เปลี่ยน Default Namespace ของ Context ที่กำลังทำงานอยู่ให้เป็น 'monitoring'?",
            options: [
              "kubectl set namespace monitoring",
              "kubectl config set-context --current --namespace=monitoring",
              "kubectl use namespace monitoring",
              "kubectl switch ns monitoring"
            ],
            answer: 1,
            explanation: "คำสั่งมาตรฐานของ kubectl คือ kubectl config set-context --current --namespace=<name>"
          }
        },
        {
          id: "fn-u1-3",
          title: "Unit 1.3: Tmux, Terminal Splits & Vim Navigation Speed",
          summary: "เพิ่มความเร็วในการตรวจสอบ Log พร้อมแก้ไขไฟล์ YAML แบบคู่ขนานด้วย Tmux และปุ่มลัด Vim",
          docsUrl: "https://kubernetes.io/docs/reference/kubectl/cheatsheet/",
          docsKeyword: "kubectl Cheat Sheet",
          blueprint: `# สั่งเปิด Tmux session
tmux

# Tmux Shortcuts (กด Ctrl+B นำหน้าเสมอ)
Ctrl+B แล้ว %   : แบ่งหน้าจอแนวตั้ง (Vertical split)
Ctrl+B แล้ว "   : แบ่งหน้าจอแนวนอน (Horizontal split)
Ctrl+B แล้ว ลูกศร : สลับหน้าจอซ้าย/ขวา/บน/ล่าง
Ctrl+B แล้ว d   : Detach session

# Vim Essential Shortcuts
gg=G           : จัด indentation อัตโนมัติทั้งไฟล์
dd             : ลบบรรทัดปัจจุบัน
yy แล้ว p      : คัดลอกบรรทัดปัจจุบันและวาง`,
          explanation: `### การทำงานแบบคู่ขนาน (Multi-tasking) ในห้องสอบ
ในห้องสอบ คุณสามารถใช้ \`tmux\` เพื่อแบ่งหน้าจอได้ เช่น หน้าจอบนเปิด \`kubectl get pods -w\` หรือ \`journalctl -u kubelet -f\` เพื่อมอนิเตอร์สถานะแบบ Real-time และหน้าจอล่างเปิดแก้ไขไฟล์ YAML ด้วย Vim

**เทคนิค Vim สำหรับ Kubernetes:**
* \`set paste\`: ก่อนวางโค้ดที่ก๊อปปี้จากเว็บ official ให้กด \`:set paste\` เพื่อไม่ให้ Vim เติมช่องว่างจน Indentation เพี้ยน
* \`:set nopaste\`: เมื่อวางเสร็จให้ปิด เพื่อให้ autoindent กลับมาทำงานตามปกติ
* \`shift + v\` ตามด้วยลูกศร: เลือกหลายบรรทัด จากนั้นกด \`>\` หรือ \`<\` เพื่อเลื่อนบล็อก YAML เข้า/ออกทีละ 2 spaces`,
          examples: [
            {
              desc: "เปิด watch pods ในหน้าต่าง tmux หนึ่ง และใช้สร้าง pod ในอีกหน้าต่าง",
              cmd: "tmux new -s exam"
            },
            {
              desc: "เลื่อนบล็อก YAML ใน Vim",
              cmd: "# ใน Vim กด Shift+V เลือกบรรทัดแล้วกด > (เลื่อนขวา) หรือ < (เลื่อนซ้าย)"
            }
          ],
          examTips: [
            "ระวัง! ใน tmux อย่าเผลอกดปุ่มปิด terminal ให้ใช้ 'exit' ในแต่ละ pane เพื่อปิด",
            "หาก tmux ซับซ้อนเกินไป คุณสามารถเปิด Tab ใหม่ใน Terminal ของ PSI Browser ได้เช่นกัน"
          ],
          quickCheck: {
            question: "ใน Vim หากต้องการวางโค้ด YAML จากภายนอกโดยไม่ให้เกิดการเลื่อน Indentation ย่อหน้าซ้ำซ้อน ควรพิมพ์คำสั่งใด?",
            options: [
              ":set yaml",
              ":set paste",
              ":set noformat",
              ":set raw"
            ],
            answer: 1,
            explanation: "คำสั่ง :set paste จะปิดโหมด autoindent ชั่วคราว ทำให้ข้อความที่ถูกวางรักษารูปแบบต้นฉบับไว้ทุกประการ"
          }
        }
      ]
    },
    {
      id: "foundation-b2",
      title: "Imperative CLI & Schema Lookup",
      titleTh: "เทคนิคการสร้าง Resource และเปิดดู Schema ทันที",
      icon: "🔍",
      category: "cli",
      description: "การใช้ kubectl explain เปิดดูฟิลด์ YAML โดยไม่ต้องพึ่งอินเทอร์เน็ต และคำสั่ง Imperative สร้าง Pod, Deployment, Service, ConfigMap, Secret, Job",
      units: [
        {
          id: "fn-u2-1",
          title: "Unit 2.1: kubectl explain - โพย Schema ในตัว Terminal",
          summary: "ค้นหาชื่อฟิลด์ YAML และชนิดข้อมูลโดยตรงจาก Kubernetes API Server ได้เร็วที่สุด",
          docsUrl: "https://kubernetes.io/docs/reference/kubectl/generated/kubectl_explain/",
          docsKeyword: "kubectl explain",
          blueprint: `# ค้นหาฟิลด์แบบเจาะจง
kubectl explain <resource>.<field>

# ค้นหาโครงสร้างต้นไม้ทั้งหมดแบบ Recursive
kubectl explain <resource> --recursive

# ค้นหาฟิลด์ที่มีคำสำคัญ
kubectl explain pod.spec | grep -i security`,
          explanation: `### เมื่อจำชื่อฟิลด์ YAML ไม่ได้ ไม่ต้องเปิดเว็บ!
การเปิดเว็บค้นหาในห้องสอบอาจช้าเนื่องจาก Remote Desktop latency คำสั่ง \`kubectl explain\` จะดึงเอกสาร OpenAPI Schema ออกมาจาก API Server ในเครื่องคุณโดยตรง:

* \`kubectl explain pod.spec.containers.livenessProbe\`: ดูฟิลด์ทั้งหมดของ Probe
* \`kubectl explain deployment.spec.strategy\`: ดูตัวเลือกการ RollingUpdate
* \`kubectl explain pod.spec.securityContext\`: ดูสิทธิ์ระดับ Pod vs Container
* \`kubectl explain ingress.spec.rules.http.paths\`: ดู pathType และ backend spec`,
          examples: [
            {
              desc: "ตรวจสอบโครงสร้างของ readinessProbe แบบเจาะลึก",
              cmd: "kubectl explain pod.spec.containers.readinessProbe.httpGet"
            },
            {
              desc: "ดูโครงสร้าง tree ทั้งหมดของ NetworkPolicy",
              cmd: "kubectl explain netpol.spec --recursive"
            },
            {
              desc: "ตรวจสอบว่า volumes ชนิด configMap มีฟิลด์อะไรบ้าง",
              cmd: "kubectl explain pod.spec.volumes.configMap"
            }
          ],
          examTips: [
            "ถ้าจำไม่ได้ว่า capabilities ต้องใส่ที่ pod หรือ container: ลองรัน kubectl explain pod.spec.securityContext เทียบกับ pod.spec.containers.securityContext",
            "ใช้ grep ช่วยกรอง เช่น kubectl explain pod.spec | grep -i security"
          ],
          quickCheck: {
            question: "คำสั่งใดใช้ดูโครงสร้างฟิลด์ทั้งหมดแบบ Recursive ของ Ingress Spec?",
            options: [
              "kubectl describe ingress spec --all",
              "kubectl explain ingress.spec --recursive",
              "kubectl schema ingress",
              "kubectl get ingress --explain"
            ],
            answer: 1,
            explanation: "kubectl explain <resource> --recursive จะแสดงแผนผังโครงสร้างของทุกฟิลด์ย่อยลงไปอย่างสมบูรณ์"
          }
        },
        {
          id: "fn-u2-2",
          title: "Unit 2.2: Imperative CLI Generators - สูตรลัดสร้างทุก Resource",
          summary: "รวมคำสั่งบรรทัดเดียวสำหรับสร้าง Pod, Deployment, Service, ConfigMap, Secret, Job และ CronJob",
          docsUrl: "https://kubernetes.io/docs/reference/kubectl/cheatsheet/#creating-objects",
          docsKeyword: "kubectl Cheat Sheet creating objects",
          blueprint: `# 1. สร้าง Pod พร้อม Label, Port และ Environment
k run mypod --image=nginx:alpine --port=80 --labels="tier=web,env=prod" --env="DB_HOST=mysql" $do > pod.yaml

# 2. สร้าง Deployment พร้อม Replicas และ Port
k create deploy mydeploy --image=redis:7 --replicas=3 --port=6379 $do > deploy.yaml

# 3. สร้าง Service Expose จาก Pod หรือ Deployment
k expose deploy mydeploy --name=redis-svc --port=6379 --target-port=6379 --type=ClusterIP $do > svc.yaml

# 4. สร้าง ConfigMap & Secret แบบ Literal
k create cm app-config --from-literal=APP_MODE=production --from-literal=PORT=8080
k create secret generic app-secret --from-literal=DB_PASS=supersecret123

# 5. สร้าง Job & CronJob
k create job process-data --image=busybox $do -- sh -c "echo Processing && sleep 5" > job.yaml
k create cronjob daily-report --image=busybox --schedule="0 2 * * *" $do -- sh -c "date" > cronjob.yaml`,
          explanation: `### อย่าเขียน YAML ตั้งแต่บรรทัดที่ 1!
ในห้องสอบ CKA และ CKAD กฎเหล็กคือ **ห้ามเริ่มพิมพ์ไฟล์ YAML จากความว่างเปล่าเด็ดขาด** เพราะจะเสียเวลาเฉลี่ย 3-5 นาทีต่อข้อและเสี่ยงกับข้อผิดพลาด indentation

ให้ใช้ **Imperative Generation Flow**:
1. รันคำสั่ง \`kubectl create ... $do > res.yaml\`
2. เปิด \`vim res.yaml\` เข้าไปแก้ไขเฉพาะฟิลด์ที่คำสั่ง CLI ไม่รองรับ (เช่น livenessProbe, volumeMounts, securityContext)
3. รัน \`kubectl apply -f res.yaml\` เพื่อสร้างจริง`,
          examples: [
            {
              desc: "สร้าง ServiceAccount และ RoleBinding ในบรรทัดเดียว",
              cmd: "k create sa app-sa -n prod && k create rolebinding app-rb --clusterrole=view --serviceaccount=prod:app-sa -n prod"
            },
            {
              desc: "สร้าง NodePort Service โดยตรง",
              cmd: "k create service nodeport web-np --tcp=80:80 --node-port=30080 $do > np.yaml"
            }
          ],
          examTips: [
            "จำสูตร: Pod ใช้ 'k run', Resource อื่นส่วนใหญ่ใช้ 'k create <type>'",
            "การต่อคำสั่ง shell ใน Pod/Job: ให้ใส่ '--' ตามด้วยคำสั่ง เช่น 'k run busy --image=busybox $do -- sleep 3600'"
          ],
          quickCheck: {
            question: "คำสั่งใดสร้าง CronJob ที่ทำงานทุกๆ วันจันทร์ตอนเที่ยงคืน?",
            options: [
              "kubectl run cron --schedule='0 0 * * 1'",
              "kubectl create cronjob my-cron --image=busybox --schedule='0 0 * * 1' -- echo 'run'",
              "kubectl apply cronjob --time='weekly'",
              "kubectl schedule job my-cron --cron='0 0 * * 1'"
            ],
            answer: 1,
            explanation: "คำสั่ง kubectl create cronjob <name> --image=... --schedule='cron-expression' -- <cmd> เป็นวิธี Imperative ที่ถูกต้อง"
          }
        }
      ]
    },
    {
      id: "foundation-b3",
      title: "Output Filtering, JSONPath & Sorting",
      titleTh: "การกรองข้อมูล JSONPath, Custom Columns และเรียงลำดับ",
      icon: "📊",
      category: "cli",
      description: "เทคนิคการดึงค่าเฉพาะส่วน เช่น InternalIP, Pod restart count บันทึกลงไฟล์คำตอบตามที่โจทย์สั่งด้วย JSONPath และ Sorting",
      units: [
        {
          id: "fn-u3-1",
          title: "Unit 3.1: JSONPath Query & Range Masterclass",
          summary: "การเจาะดึงฟิลด์ลึกๆ ใน Kubernetes Object ด้วย JSONPath พร้อมเงื่อนไขกรองและขึ้นบรรทัดใหม่",
          docsUrl: "https://kubernetes.io/docs/reference/kubectl/jsonpath/",
          docsKeyword: "JSONPath Support",
          blueprint: `# 1. ดึงค่าฟิลด์เดี่ยว
kubectl get node node01 -o jsonpath='{.status.nodeInfo.osImage}'

# 2. ดึงค่าใน Array ทั้งหมด พร้อมขึ้นบรรทัดใหม่
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{end}'

# 3. กรองด้วยเงื่อนไข (Filter Query)
kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'`,
          explanation: `### เทคนิคแก้โจทย์ประเภท Export ข้อมูลลงไฟล์
ข้อสอบ CKA/CKAD มักมีข้อประเภท: 'Extract the OS image and Internal IP of all nodes and save to /opt/nodes-info.txt'

**ไวยากรณ์ JSONPath ที่ต้องรู้:**
1. \`{.}\`: อ้างอิง Root object
2. \`{.items[*]}\`: วนลูปทุก Element ใน List
3. \`{range .items[*]} ... {end}\`: ลูปเพื่อจัดรูปแบบผลลัพธ์
4. \`{"\\n"}\`: สั่งขึ้นบรรทัดใหม่หลังจากแต่ละ Element
5. \`[?(@.type=="InternalIP")]\`: กรองเฉพาะ Array item ที่มีค่า type ตรงกับเงื่อนไข`,
          examples: [
            {
              desc: "ดึงรายชื่อ Pods ในทุก Namespace ที่มี restartCount มากกว่า 0",
              cmd: "kubectl get pods -A -o jsonpath='{range .items[?(@.status.containerStatuses[0].restartCount > 0)]}{.metadata.namespace}{\"/\"}{.metadata.name}{\"\\n\"}{end}'"
            },
            {
              desc: "ดึง IP ของ Pod ชื่อ web-app",
              cmd: "kubectl get pod web-app -o jsonpath='{.status.podIP}'"
            }
          ],
          examTips: [
            "หากจำไวยากรณ์ JSONPath ไม่ได้ในห้องสอบ: ให้ใช้ '-o json | jq' หรือใช้ '-o wide | awk' กรองข้อความได้เหมือนกัน",
            "ตรวจสอบผลลัพธ์ในไฟล์คำตอบด้วย cat เสมอ เช่น cat /opt/output.txt"
          ],
          quickCheck: {
            question: "คำสั่งใดดึงเฉพาะ InternalIP ของโหนดทั้งหมดด้วย JSONPath?",
            options: [
              "kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type==\"InternalIP\")].address}'",
              "kubectl get nodes --ip-filter=internal",
              "kubectl get nodes -o jsonpath='{.status.ip}'",
              "kubectl get nodes --internal-ip-only"
            ],
            answer: 0,
            explanation: "การใช้ filter [?(@.type=='InternalIP')].address ภายใน addresses array เป็นวิธีที่แม่นยำที่สุดตาม Kubernetes API spec"
          }
        },
        {
          id: "fn-u3-2",
          title: "Unit 3.2: Custom Columns & Sorting (--sort-by)",
          summary: "การแสดงผลลัพธ์เป็นตารางตามคอลัมน์ที่ต้องการ และการเรียงลำดับ Resource ตามขนาดหรือเวลา",
          docsUrl: "https://kubernetes.io/docs/reference/kubectl/cheatsheet/#viewing-finding-resources",
          docsKeyword: "kubectl Cheat Sheet viewing finding resources",
          blueprint: `# 1. เรียงลำดับ Pods ตามเวลาที่ถูกสร้าง (creationTimestamp)
kubectl get pods -A --sort-by='.metadata.creationTimestamp'

# 2. เรียงลำดับ PersistentVolumes ตามขนาดพื้นที่ความจุ (Capacity)
kubectl get pv --sort-by='.spec.capacity.storage'

# 3. แสดงผลตารางแบบกำหนดคอลัมน์เอง (Custom Columns)
kubectl get pods -o custom-columns=POD_NAME:.metadata.name,NODE:.spec.nodeName,STATUS:.status.phase`,
          explanation: `### การจัดเรียงและแสดงผลข้อมูลอย่างมืออาชีพ
เมื่อโจทย์สั่ง: 'Find the PV with highest capacity' หรือ 'List pods sorted by restarts':
* \`--sort-by\`: รับ JSONPath expression หนึ่งตัว และทำการเรียงลำดับจากน้อยไปมาก
* \`-o custom-columns\`: เหมาะมากเวลาที่ต้องการเห็นข้อมูลหลายฟิลด์พร้อมกัน เช่น ดูว่า Pod ไหนรันอยู่บนโหนดใด`,
          examples: [
            {
              desc: "เรียงลำดับ Pods ใน namespace ปัจจุบันตามจำนวนการ Restart จากน้อยไปมาก",
              cmd: "kubectl get pods --sort-by='.status.containerStatuses[0].restartCount'"
            },
            {
              desc: "แสดงตาราง Service พร้อม ClusterIP และ TargetPort",
              cmd: "kubectl get svc -o custom-columns=NAME:.metadata.name,CLUSTER_IP:.spec.clusterIP,PORT:.spec.ports[0].port"
            }
          ],
          examTips: [
            "เครื่องหมายจุด (.) นำหน้าใน --sort-by สำคัญมาก อย่าลืมใส่ เช่น --sort-by='.metadata.name'",
            "ถ้าต้องการเรียงจากมากไปน้อย สามารถไพพ์เข้า 'tac' หรือ 'sort -r' ได้"
          ],
          quickCheck: {
            question: "คำสั่งใดใช้เรียงลำดับโหนดตามเวอร์ชัน Kubelet จากน้อยไปมาก?",
            options: [
              "kubectl get nodes --sort-by='.status.nodeInfo.kubeletVersion'",
              "kubectl get nodes --order-by='version'",
              "kubectl get nodes -o sort=kubelet",
              "kubectl sort nodes by kubeletVersion"
            ],
            answer: 0,
            explanation: "ข้อมูล Kubelet version อยู่ที่ .status.nodeInfo.kubeletVersion จึงใช้กับ flag --sort-by ได้โดยตรง"
          }
        }
      ]
    }
  ]
};
