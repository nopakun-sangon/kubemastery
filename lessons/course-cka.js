/**
 * KubeMastery: Course CKA - Certified Kubernetes Administrator
 * Complete syllabus aligned 100% with Linux Foundation & CNCF Official Exam Guidelines.
 */

window.COURSE_CKA = {
  "id": "course-cka",
  "badge": "CKA",
  "title": "CKA: Certified Kubernetes Administrator",
  "subtitle": "หลักสูตรเตรียมสอบ CKA สถาปัตยกรรมคลัสเตอร์ การดูแลระบบ และการแก้ปัญหาขั้นสูง",
  "description": "ครอบคลุม 5 หมวดข้อสอบ CKA ตามเกณฑ์ CNCF อย่างเป็นทางการ: Cluster Architecture, Installation & Config (25%), Workloads & Scheduling (15%), Services & Networking (20%), Storage (10%), และ Troubleshooting (30%)",
  "icon": "☸️",
  "color": "from-blue-600 via-teal-600 to-emerald-500",
  "badgeColor": {
    "bg": "bg-teal-100 dark:bg-teal-950",
    "text": "text-teal-700 dark:text-teal-300",
    "border": "border-teal-200 dark:border-teal-800"
  },
  "blocks": [
    {
      "id": "cka-b1",
      "title": "Domain 1: Cluster Architecture, Installation & Config (25%)",
      "titleTh": "สถาปัตยกรรมคลัสเตอร์ การติดตั้ง การอัปเกรด และ RBAC",
      "icon": "🏛️",
      "category": "cluster",
      "description": "ส่วนประกอบ Control Plane และ Worker Node, การ Bootstrap คลัสเตอร์ด้วย Kubeadm, การอัปเกรดเวอร์ชันคลัสเตอร์, การสำรอง/กู้คืน Etcd และ Cluster-wide RBAC",
      "units": [
        {
          "id": "cka-u1-1",
          "title": "Unit 1.1: Control Plane Components & Node Architecture",
          "summary": "เจาะลึกบทบาทและหน้าที่ของ kube-apiserver, etcd, kube-scheduler, kube-controller-manager, kubelet, kube-proxy และ CRI",
          "docsUrl": "https://kubernetes.io/docs/concepts/overview/components/",
          "docsKeyword": "Kubernetes Components",
          "blueprint": "# Control Plane Components:\n# 1. kube-apiserver          : ศูนย์กลาง API Gateway ติดต่อ etcd และรับคำสั่ง\n# 2. etcd                    : Distributed Key-Value Store เก็บ State ทั้งหมดของคลัสเตอร์\n# 3. kube-scheduler          : คำนวณหาโหนดที่เหมาะสมที่สุดสำหรับวาง Pods ใหม่\n# 4. kube-controller-manager : รัน Controller ลูปต่างๆ (Node, ReplicaSet, Endpoints)\n# 5. cloud-controller-manager: จัดการ Resource เชื่อมต่อกับ Cloud Provider\n\n# Worker Node Components:\n# 1. kubelet                 : Agent ดูแลการรันคอนเทนเนอร์บนโหนด (รันเป็น systemd service)\n# 2. kube-proxy              : จัดการ Network Routing และ IP Tables/IPVS สำหรับ Service\n# 3. Container Runtime (CRI) : เช่น containerd, CRI-O จัดการดึง Image และรัน Containers",
          "explanation": "### สถาปัตยกรรมภายในของ Kubernetes ตามเอกสารทางการ\n1. **Control Plane (Master Node)**:\n   * **kube-apiserver**: เป็น Component ตัวเดียวในระบบที่ติดต่อกับ **etcd** โดยตรง ทุก Component อื่นจะต้องสื่อสารผ่าน API Server เสมอ\n   * **etcd**: จัดเก็บสถานะคลัสเตอร์แบบ Highly Available และ Consistent ข้อมูลทุกอย่างที่สร้างด้วย kubectl จะถูกบันทึกลงที่นี่\n   * **kube-scheduler**: ตรวจสอบ Pods ที่ยังไม่มีการระบุ `nodeName` จากนั้นพิจารณาเงื่อนไข Taints, Tolerations, Affinity, และ Resource Requests เพื่อเลือกโหนดที่เหมาะสมที่สุด\n   * **kube-controller-manager**: ตรวจสอบให้ Actual State ตรงกับ Desired State (เช่น ตรวจดูว่า Pod ตายไหม ถ้าตาย ReplicaSet Controller จะสั่งสร้างใหม่)\n\n2. **Worker Node**:\n   * **kubelet**: รันเป็น Daemon Process (Systemd Service) นอกคลัสเตอร์ ทำหน้าที่คุยกับ Container Runtime ผ่าน CRI (Container Runtime Interface)\n   * **kube-proxy**: ดูแลการ Forward Traffic ไปยัง Pod ปลายทางตามกฎของ Service\n   * **Container Runtime**: ซอฟต์แวร์ระดับต่ำที่ใช้รัน Container เช่น `containerd`",
          "examples": [
            {
              "desc": "ตรวจสอบสถานะ Component ใน Control Plane",
              "cmd": "kubectl get componentstatuses (หรือตรวจ Pods ใน kube-system: kubectl get pods -n kube-system)"
            },
            {
              "desc": "ตรวจสอบสถานะการทำงานของ Kubelet Service ผ่าน Systemd",
              "cmd": "sudo systemctl status kubelet"
            }
          ],
          "examTips": [
            "จำไว้ว่า Kubelet เป็น Component เดียวที่ไม่ได้รันเป็น Pod แต่รันเป็น Systemd Service ในระดับ OS ของโหนด",
            "ไฟล์คอนฟิก Static Pods ของ Control plane อยู่ในโฟลเดอร์ '/etc/kubernetes/manifests/'"
          ],
          "quickCheck": {
            "question": "ส่วนประกอบ (Component) ใดของ Kubernetes เป็นตัวเดียวที่ติดต่อสื่อสารและอ่านเขียนข้อมูลกับฐานข้อมูล etcd โดยตรง?",
            "options": [
              "kube-controller-manager",
              "kube-scheduler",
              "kube-apiserver",
              "kubelet"
            ],
            "answer": 2,
            "explanation": "kube-apiserver เป็นเกตเวย์ศูนย์กลางและเป็นคอมโพเนนต์เดียวที่ได้รับอนุญาตให้เข้าถึง etcd โดยตรง เพื่อรักษาความปลอดภัยและความสอดคล้องของข้อมูล"
          }
        },
        {
          "id": "cka-u1-2",
          "title": "Unit 1.2: Cluster Bootstrapping with Kubeadm",
          "summary": "ขั้นตอนการสร้างคลัสเตอร์ด้วย kubeadm init, การตั้งค่า CNI และการ join worker nodes เข้าสู่คลัสเตอร์",
          "docsUrl": "https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/",
          "docsKeyword": "Creating a cluster with kubeadm",
          "blueprint": "# 1. รันบน Control Plane Node เพื่อเริ่มต้นคลัสเตอร์\nsudo kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=<master-ip>\n\n# 2. ตั้งค่า kubeconfig ให้ user ปกติ\nmkdir -p $HOME/.kube\nsudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config\nsudo chown $(id -u):$(id -g) $HOME/.kube/config\n\n# 3. ติดตั้ง Network Plugin (เช่น Flannel หรือ Calico)\nkubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml\n\n# 4. สั่งสร้าง Token และคำสั่ง Join ใหม่สำหรับ Worker Node\nkubeadm token create --print-join-command",
          "explanation": "### การ Bootstrap คลัสเตอร์ด้วย Kubeadm\nKubeadm เป็นเครื่องมือทางการของ Kubernetes ในการติดตั้งคลัสเตอร์ระดับ Production:\n1. `kubeadm init`:\n   * สร้าง CA Certificate และ Key คู่ต่างๆ ที่จำเป็นใน `/etc/kubernetes/pki`\n   * สร้างไฟล์ Static Pod manifests สำหรับ etcd, apiserver, controller-manager, scheduler ไว้ที่ `/etc/kubernetes/manifests`\n   * แจกจ่าย CoreDNS และ Kube-proxy\n\n2. **ความสำคัญของ Pod Network (CNI)**:\n   * หลังรัน `kubeadm init` เสร็จ โหนดจะมีสถานะเป็น **NotReady** จนกว่าเราจะลง Network Plugin เช่น Flannel หรือ Calico\n   * เมื่อ CNI ถูกติดตั้ง Kubelet จึงจะเปลี่ยนสถานะโหนดเป็น **Ready**\n\n3. `kubeadm join`:\n   * นำคำสั่ง Join พร้อม Token และ CA Cert Hash ไปรันบน Worker Node เพื่อเข้าร่วมคลัสเตอร์",
          "examples": [
            {
              "desc": "สร้างคำสั่ง Join Token ใหม่เมื่อ Token เดิมหมดอายุ",
              "cmd": "kubeadm token create --print-join-command"
            }
          ],
          "examTips": [
            "หากรัน kubeadm init แล้ว CoreDNS ติดสถานะ Pending ไม่ต้องตกใจ เป็นเรื่องปกติจนกว่าจะติดตั้ง CNI Plugin",
            "จำ flag '--pod-network-cidr' ให้ดี หากโจทย์ระบุช่วง CIDR ชัดเจน"
          ],
          "quickCheck": {
            "question": "เหตุใดหลังจากรัน kubeadm init เสร็จใหม่ๆ Control Plane Node จึงยังแสดงสถานะเป็น 'NotReady'?",
            "options": [
              "Kubelet ยังไม่ได้รับใบรับรอง (Certificates)",
              "ยังไม่ได้ติดตั้ง Network Plugin (CNI) จึงยังไม่พร้อมส่งแพ็กเก็ตระหว่าง Pod",
              "etcd ยังไม่เริ่มทำงาน",
              "ต้องรันคำสั่ง kubeadm ready เสียก่อน"
            ],
            "answer": 1,
            "explanation": "โหนดจะอยู่ในสถานะ NotReady จนกว่า CNI Plugin (Network Provider) จะถูกติดตั้งและพร้อมแจกจ่าย IP ให้กับ Pods"
          }
        },
        {
          "id": "cka-u1-3",
          "title": "Unit 1.3: Kubeadm Cluster Upgrade Playbook",
          "summary": "คู่มือขั้นตอนการอัปเกรดเวอร์ชัน Kubernetes บน Control Plane และ Worker Node แบบเป็นลำดับโดยไม่มี Downtime",
          "docsUrl": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/",
          "docsKeyword": "Upgrading kubeadm clusters",
          "blueprint": "# === ขั้นตอนที่ 1: อัปเกรด Control Plane Node ===\n# 1.1 ป้องกันไม่ให้มี Pod ใหม่มาลงบน Control Plane\nkubectl drain controlplane --ignore-daemonsets\n\n# 1.2 อัปเกรดเครื่องมือ kubeadm ก่อน\nsudo apt-mark unhold kubeadm && sudo apt-get update && sudo apt-get install -y kubeadm=1.31.0-1.1 && sudo apt-mark hold kubeadm\n\n# 1.3 ตรวจสอบแผนการอัปเกรดและสั่งอัปเกรด\nsudo kubeadm upgrade plan\nsudo kubeadm upgrade apply v1.31.0 -y\n\n# 1.4 อัปเกรด kubelet และ kubectl\nsudo apt-mark unhold kubelet kubectl && sudo apt-get install -y kubelet=1.31.0-1.1 kubectl=1.31.0-1.1 && sudo apt-mark hold kubelet kubectl\nsudo systemctl daemon-reload && sudo systemctl restart kubelet\n\n# 1.5 เปิดให้โหนดกลับมารับงาน (Uncordon)\nkubectl uncordon controlplane\n\n# === ขั้นตอนที่ 2: อัปเกรด Worker Node (ทำทีละเครื่อง) ===\n# บน Master: สั่ง drain worker\nkubectl drain node01 --ignore-daemonsets --delete-emptydir-data\n\n# สลับ SSH ไปที่ node01:\nsudo apt-mark unhold kubeadm && sudo apt-get update && sudo apt-get install -y kubeadm=1.31.0-1.1 && sudo apt-mark hold kubeadm\nsudo kubeadm upgrade node\nsudo apt-mark unhold kubelet kubectl && sudo apt-get install -y kubelet=1.31.0-1.1 kubectl=1.31.0-1.1 && sudo apt-mark hold kubelet kubectl\nsudo systemctl daemon-reload && sudo systemctl restart kubelet\n\n# บน Master: สั่ง uncordon worker\nkubectl uncordon node01",
          "explanation": "### กฎเหล็กการอัปเกรดคลัสเตอร์ตามเกณฑ์ CNCF\n1. **ลำดับการอัปเกรด**:\n   * อัปเกรด Control Plane ให้เสร็จสมบูรณ์ก่อนเสมอ จากนั้นจึงค่อยอัปเกรด Worker Node ทีละเครื่อง\n   * ข้ามเวอร์ชันได้สูงสุด **1 Minor Version** ในแต่ละรอบ (เช่น จาก 1.29 ไป 1.30 ห้ามข้ามจาก 1.28 ไป 1.30 โดยตรง)\n\n2. **ความแตกต่างของคำสั่ง**:\n   * บน Control Plane เครื่องแรก: ใช้ `sudo kubeadm upgrade apply v1.x.x`\n   * บน Worker Node: ใช้ `sudo kubeadm upgrade node` (ห้ามรัน upgrade apply บน worker!)\n\n3. **apt-mark unhold / hold**:\n   * บนระบบ Ubuntu/Debian แพ็กเกจ Kubernetes จะถูกล็อกเวอร์ชันไว้ด้วย `hold` เพื่อไม่ให้อัปเดตอัตโนมัติ ต้องสั่ง `unhold` ก่อนติดตั้งเวอร์ชันใหม่ และสั่ง `hold` คืนเสมอ",
          "examples": [
            {
              "desc": "ตรวจสอบเวอร์ชันของโหนดทั้งหมดในคลัสเตอร์หลังอัปเกรด",
              "cmd": "kubectl get nodes -o wide"
            }
          ],
          "examTips": [
            "ระวัง! อย่าลืมใส่ flag '--ignore-daemonsets' และ '--delete-emptydir-data' เวลาสั่ง drain node",
            "จำสูตร: Master ใช้ 'kubeadm upgrade apply', Worker ใช้ 'kubeadm upgrade node'"
          ],
          "quickCheck": {
            "question": "คำสั่งใดใช้สำหรับอัปเกรด Local Kubelet Configuration บน Worker Node หลังจากอัปเกรด binary ของ kubeadm แล้ว?",
            "options": [
              "kubeadm upgrade apply",
              "kubeadm upgrade node",
              "kubeadm update worker",
              "kubeadm worker-upgrade"
            ],
            "answer": 1,
            "explanation": "บน Worker Nodes คำสั่งอัปเกรดคอนฟิกคือ 'kubeadm upgrade node' (ส่วน 'kubeadm upgrade apply' ใช้เฉพาะบน Control Plane เครื่องแรกเท่านั้น)"
          }
        },
        {
          "id": "cka-u1-4",
          "title": "Unit 1.4: Etcd Snapshot Backup & Disaster Recovery Playbook",
          "summary": "คู่มือการ Backup ข้อมูลด้วย etcdctl snapshot save และขั้นตอนการ Restore ข้อมูลกู้ชีพคลัสเตอร์",
          "docsUrl": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster",
          "docsKeyword": "Backing up an etcd cluster",
          "blueprint": "# 1. ดึง Path ของ Certificates จาก /etc/kubernetes/manifests/etcd.yaml\n# --cacert=/etc/kubernetes/pki/etcd/ca.crt\n# --cert=/etc/kubernetes/pki/etcd/server.crt\n# --key=/etc/kubernetes/pki/etcd/server.key\n\n# 2. บันทึก Snapshot สำรองข้อมูล (Backup)\nETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  snapshot save /opt/etcd-backup.db\n\n# 3. ตรวจสอบความถูกต้องของไฟล์ Snapshot\nETCDCTL_API=3 etcdctl --write-out=table snapshot status /opt/etcd-backup.db\n\n# 4. กู้คืนข้อมูล (Restore) ไปยังโฟลเดอร์ข้อมูลใหม่\nETCDCTL_API=3 etcdctl --data-dir=/var/lib/etcd-restored \\\n  snapshot restore /opt/etcd-backup.db\n\n# 5. แก้ไข hostPath mount ใน /etc/kubernetes/manifests/etcd.yaml\n# เปลี่ยน path จาก /var/lib/etcd ให้ชี้ไปที่ /var/lib/etcd-restored",
          "explanation": "### กระบวนการ Backup & Restore etcd ในห้องสอบ CKA\nข้อสอบ CKA แทบทุกรอบจะมีโจทย์ Etcd Backup/Restore อย่างน้อย 1 ข้อ:\n\n1. **การค้นหา Certificates**:\n   * เปิดไฟล์ `/etc/kubernetes/manifests/etcd.yaml` จะพบ arguments:\n     * `--trusted-ca-file`: ใช้สำหรับ `--cacert`\n     * `--cert-file`: ใช้สำหรับ `--cert`\n     * `--key-file`: ใช้สำหรับ `--key`\n\n2. **ขั้นตอนการ Restore**:\n   * คำสั่ง `etcdctl snapshot restore` จะสร้าง Database Folder ใหม่ขึ้นมาตามที่ระบุใน `--data-dir` (ห้ามกู้ทับ `/var/lib/etcd` เดิมขณะที่โปรเซสกำลังทำงาน)\n   * หลังจาก Restore ไฟล์เสร็จ ให้เปิด `/etc/kubernetes/manifests/etcd.yaml` แล้วเลื่อนลงไปแก้ที่ `spec.volumes` ในส่วน `name: etcd-data` เปลี่ยน `hostPath.path` จากเดิม `/var/lib/etcd` ให้เป็น `/var/lib/etcd-restored`\n   * Kubelet จะตรวจพบการเปลี่ยนแปลงไฟล์ manifest แล้ว restart etcd pod ตัวใหม่ขึ้นมาอ่านข้อมูลที่กู้คืนทันที",
          "examples": [
            {
              "desc": "ตรวจสอบว่า etcd pod รีสตาร์ตด้วย data-dir ใหม่เรียบร้อยแล้ว",
              "cmd": "crictl ps | grep etcd"
            }
          ],
          "examTips": [
            "ต้องใส่ 'ETCDCTL_API=3' นำหน้าคำสั่ง etcdctl เสมอ มิฉะนั้นคำสั่งจะใช้ API version 2 และล้มเหลว",
            "อย่าลืมตรวจ permission ของโฟลเดอร์ /var/lib/etcd-restored ว่า etcd สามารถเข้าถึงได้"
          ],
          "quickCheck": {
            "question": "หลังจากรันคำสั่ง 'etcdctl snapshot restore --data-dir=/var/lib/etcd-new' แล้ว ต้องทำขั้นตอนใดต่อเพื่อให้ etcd บน Control Plane เริ่มใช้งานข้อมูลที่กู้คืนมา?",
            "options": [
              "รันคำสั่ง kubectl apply -f etcd-new",
              "แก้ไข hostPath volume ใน /etc/kubernetes/manifests/etcd.yaml ให้ชี้ไปยัง /var/lib/etcd-new",
              "รีสตาร์ตระบบปฏิบัติการของ Master node",
              "รัน kubeadm etcd reload"
            ],
            "answer": 1,
            "explanation": "เมื่อแก้ไข hostPath ใน Static Pod Manifest (/etc/kubernetes/manifests/etcd.yaml) Kubelet จะตรวจพบและรีสตาร์ตคอนเทนเนอร์ etcd ให้เชื่อมกับ data directory ใหม่โดยอัตโนมัติ"
          }
        },
        {
          "id": "cka-u1-5",
          "title": "Unit 1.5: Role-Based Access Control (RBAC) In-Depth",
          "summary": "การควบคุมสิทธิ์ระดับคลัสเตอร์ด้วย ClusterRole, ClusterRoleBinding, ServiceAccount และการตรวจสอบสิทธิ์ด้วย can-i",
          "docsUrl": "https://kubernetes.io/docs/reference/access-authn-authz/rbac/",
          "docsKeyword": "Using RBAC Authorization",
          "blueprint": "# 1. สร้าง ClusterRole อนุญาตให้อ่าน Nodes และ PersistentVolumes\nkubectl create clusterrole storage-admin --verb=get,list,watch --resource=nodes,persistentvolumes\n\n# 2. ผูก ClusterRole ให้กับ User 'john' ทั่วทั้งคลัสเตอร์\nkubectl create clusterrolebinding john-storage-admin --clusterrole=storage-admin --user=john\n\n# 3. ผูก ClusterRole เข้ากับ ServiceAccount แต่จำกัดสิทธิ์เฉพาะใน Namespace 'dev' (Scoped)\nkubectl create rolebinding dev-sa-binding --clusterrole=storage-admin --serviceaccount=dev:dev-sa -n dev\n\n# 4. ทดสอบสิทธิ์ด้วยคำสั่ง kubectl auth can-i\nkubectl auth can-i create pods --as=john -n default",
          "explanation": "### ความแตกต่างระหว่าง Role vs ClusterRole\n1. **Role & RoleBinding**:\n   * ผูกอยู่กับ Namespace เจาะจง (Namespaced Resources เช่น Pods, Deployments, Services, ConfigMaps)\n2. **ClusterRole & ClusterRoleBinding**:\n   * มีผลครอบคลุมทั้งคลัสเตอร์ ใช้สำหรับ:\n     * Non-namespaced Resources เช่น Nodes, PersistentVolumes, Namespaces\n     * หรือให้สิทธิ์ดู Resources ทุกอย่างในทุก Namespace\n3. **การใช้ RoleBinding ผูกเข้ากับ ClusterRole**:\n   * เทคนิคสำคัญ: คุณสามารถใช้ `RoleBinding` (ระดับ namespace) เพื่อผูกเข้ากับ `ClusterRole` ที่มีอยู่แล้วได้ ซึ่งจะส่งผลให้ผู้ใช้ได้รับสิทธิ์ตาม ClusterRole นั้น **เฉพาะภายใน Namespace นั้นเท่านั้น** ช่วยลดความซ้ำซ้อนในการประกาศ Role ซ้ำๆ ในหลาย Namespace",
          "examples": [
            {
              "desc": "ตรวจสอบว่า ServiceAccount มีสิทธิ์เข้าถึง secrets ใน namespace prod หรือไม่",
              "cmd": "kubectl auth can-i list secrets --as=system:serviceaccount:prod:web-sa -n prod"
            }
          ],
          "examTips": [
            "จำไว้ว่า Nodes และ PV เป็น Cluster-scoped resource ต้องใช้ ClusterRole เท่านั้น ไม่สามารถใช้ Role ธรรมดาได้",
            "ตรวจสอบชื่อ group ในการผูก: ถ้าเป็น ServiceAccount ให้ระบุ 'system:serviceaccount:<namespace>:<name>'"
          ],
          "quickCheck": {
            "question": "หากต้องการให้สิทธิ์ผู้ใช้ 'dave' สามารถตรวจสอบสถานะของ PersistentVolumes ในคลัสเตอร์ ควรใช้ Resource คู่ใด?",
            "options": [
              "Role และ RoleBinding",
              "ClusterRole และ ClusterRoleBinding",
              "Role และ ClusterRoleBinding",
              "NamespaceQuota และ Role"
            ],
            "answer": 1,
            "explanation": "PersistentVolumes เป็นทรัพยากรระดับคลัสเตอร์ (Non-namespaced) จึงจำเป็นต้องใช้ ClusterRole ร่วมกับ ClusterRoleBinding เท่านั้น"
          }
        }
      ]
    },
    {
      "id": "cka-b2",
      "title": "Domain 2: Workloads & Pod Scheduling (15%)",
      "titleTh": "การบริหารจัดการ Workload และการจัดสรรคัดเลือกโหนด",
      "icon": "📅",
      "category": "scheduling",
      "description": "NodeAffinity, NodeSelector, Taints & Tolerations, Pod Affinity & Anti-Affinity, DaemonSets, Static Pods และ Custom Schedulers",
      "units": [
        {
          "id": "cka-u2-1",
          "title": "Unit 2.1: NodeAffinity, NodeSelector & TopologySpreadConstraints",
          "summary": "การควบคุมให้ Pod ไปรันบนโหนดที่ต้องการด้วย NodeAffinity (Hard vs Soft rules) และการกระจายโหลดข้าม Failure Domains",
          "docsUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/",
          "docsKeyword": "Assigning Pods to Nodes",
          "blueprint": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: affinity-pod\nspec:\n  affinity:\n    nodeAffinity:\n      requiredDuringSchedulingIgnoredDuringExecution:\n        nodeSelectorTerms:\n        - matchExpressions:\n          - key: disktype\n            operator: In # In, NotIn, Exists, DoesNotExist, Gt, Lt\n            values:\n            - ssd\n      preferredDuringSchedulingIgnoredDuringExecution:\n      - weight: 80\n        preference:\n          matchExpressions:\n          - key: zone\n            operator: In\n            values:\n            - us-central-a\n  containers:\n  - name: app\n    image: nginx",
          "explanation": "### การเลือกโหนดให้ Pod ในการสอบ CKA\n1. **nodeSelector**: วิธีการที่เรียบง่ายที่สุด แมปค่า key:value ของ Label บนโหนดแบบตรงไปตรงมา\n2. **nodeAffinity**: ยืดหยุ่นกว่าด้วย Operator (In, NotIn, Exists, Gt):\n   * **requiredDuringSchedulingIgnoredDuringExecution** (Hard Rule):\n     * กฎเหล็ก! หากไม่มีโหนดใดในคลัสเตอร์ตรงตามเงื่อนไข Pod จะติดสถานะ **Pending** ทันที ไม่ยอมรัน\n   * **preferredDuringSchedulingIgnoredDuringExecution** (Soft Rule):\n     * กฎพึงประสงค์! Scheduler จะพยายามหาโหนดที่มีคะแนน weight สูงสุด แต่หากไม่มีโหนดตรงตามเงื่อนไข Pod ก็ยังสามารถรันบนโหนดอื่นได้ตามปกติ\n3. **IgnoredDuringExecution**:\n   * หากโหนดถูกลบ Label ทิ้งในภายหลัง Pod ที่กำลังรันอยู่บนโหนดนั้นจะไม่ถูก Evict หรือไล่ออกจากโหนด",
          "examples": [
            {
              "desc": "ใส่ Label ให้กับโหนด node01",
              "cmd": "kubectl label node node01 disktype=ssd zone=us-central-a"
            }
          ],
          "examTips": [
            "จำชื่อฟิลด์ required... และ preferred... ให้ดี: ใช้ 'kubectl explain pod.spec.affinity.nodeAffinity' ช่วยดู spelling",
            "หากโจทย์บอกว่า 'Pod MUST run on node with label...' หมายถึง Hard rule (requiredDuringScheduling)"
          ],
          "quickCheck": {
            "question": "หากต้องการให้ Pod ต้องรันบนโหนดที่มี Label 'gpu=true' เท่านั้น หากไม่มีโหนดตรงเงื่อนไขให้คงสถานะ Pending ไว้ ควรใช้เงื่อนไขใด?",
            "options": [
              "preferredDuringSchedulingIgnoredDuringExecution",
              "requiredDuringSchedulingIgnoredDuringExecution",
              "requiredDuringSchedulingRequiredDuringExecution",
              "strictNodeMatching"
            ],
            "answer": 1,
            "explanation": "requiredDuringSchedulingIgnoredDuringExecution ทำหน้าที่เป็นเงื่อนไขบังคับเด็ดขาด (Hard constraint) หากไม่มีโหนดตรงเงื่อนไข Pod จะไม่ถูก Schedule"
          }
        },
        {
          "id": "cka-u2-2",
          "title": "Unit 2.2: Taints, Tolerations & Node Maintenance (Cordon & Drain)",
          "summary": "การผลัก Pod ออกจากโหนดด้วย Taints และการปิดปรับปรุงเครื่องด้วย kubectl cordon / drain",
          "docsUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/",
          "docsKeyword": "Taints and Tolerations",
          "blueprint": "# 1. สั่งใส่ Taint ให้กับโหนด\nkubectl taint nodes node01 app=blue:NoSchedule\n\n# 2. ถอด Taint ออกจากโหนด (ใส่เครื่องหมายลบ '-' ต่อท้าย)\nkubectl taint nodes node01 app=blue:NoSchedule-\n\n# 3. การเตรียม Maintenance ปิดปรับปรุงโหนด\nkubectl cordon node01 # Mark as Unschedulable (ห้าม Pod ใหม่มาลง)\nkubectl drain node01 --ignore-daemonsets --delete-emptydir-data --force # อพยพ Pods ออก\nkubectl uncordon node01 # เปิดรับ Pod กลับมาตามปกติ",
          "explanation": "### Taints vs Tolerations\n* **Taint**: กำหนดไว้ที่ **Node** เพื่อป้องกันหรือผลัก Pod ไม่ให้มารันบนตัวมัน\n* **Toleration**: กำหนดไว้ที่ **Pod** เพื่อบอกว่า Pod ตัวนี้มีความทนทานและยินดีที่จะรันบนโหนดที่มี Taint นั้นได้\n\n**Taint Effects**:\n1. `NoSchedule`: Pod ที่ไม่มี toleration จะไม่ถูกจับคู่มารันบนโหนดนี้เด็ดขาด (แต่ Pod เดิมที่รันอยู่ก่อนแล้วจะไม่ได้รับผลกระทบ)\n2. `PreferNoSchedule`: พยายามหลีกเลี่ยงโหนดนี้ แต่ถ้าคลัสเตอร์ไม่มีที่อื่นว่างแล้วก็ยังยอมให้รันได้\n3. `NoExecute`: หาก Pod เดิมบนโหนดไม่มี toleration จะถูก **เตะ (Evict) ออกจากโหนดทันที**",
          "examples": [
            {
              "desc": "Pod Manifest ที่มี Toleration ให้รันบนโหนดที่ติด Taint 'app=blue:NoSchedule'",
              "yaml": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: tolerant-pod\nspec:\n  tolerations:\n  - key: \"app\"\n    operator: \"Equal\"\n    value: \"blue\"\n    effect: \"NoSchedule\"\n  containers:\n  - name: web\n    image: nginx"
            }
          ],
          "examTips": [
            "จำวิธีเอา Taint ออก: พิมพ์คำสั่งเดิมเป๊ะๆ แล้วใส่เครื่องหมายขีดลบ (-) ต่อท้าย Effect เช่น 'kubectl taint nodes node01 key:NoSchedule-'",
            "เมื่อ Drain node อย่าลืมว่า DaemonSet pods จะย้ายไม่ได้ จึงต้องใส่ '--ignore-daemonsets'"
          ],
          "quickCheck": {
            "question": "Taint Effect ใดที่ส่งผลให้ Pod เดิมที่กำลังรันอยู่บนโหนดและไม่มี Toleration ตรงกัน ถูกขับไล่ (Evicted) ออกจากโหนดทันที?",
            "options": [
              "NoSchedule",
              "PreferNoSchedule",
              "NoExecute",
              "TerminateImmediately"
            ],
            "answer": 2,
            "explanation": "NoExecute มีผลย้อนหลังต่อ Pod ที่ทำงานอยู่แล้ว หาก Pod นั้นไม่มี Toleration ที่เข้าคู่กัน จะถูก Evict ออกจากโหนดในทันที"
          }
        },
        {
          "id": "cka-u2-3",
          "title": "Unit 2.3: Pod Affinity & Pod Anti-Affinity",
          "summary": "การจัดกลุ่ม Pod ให้อยู่ใกล้กัน (Co-location) หรือแยกกระจายออกจากกันข้ามโหนดและโซนเพื่อทำ High Availability",
          "docsUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#inter-pod-affinity-and-anti-affinity",
          "docsKeyword": "Inter-pod affinity and anti-affinity",
          "blueprint": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: redis-cache\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: store\n  template:\n    metadata:\n      labels:\n        app: store\n    spec:\n      affinity:\n        podAntiAffinity:\n          requiredDuringSchedulingIgnoredDuringExecution:\n          - labelSelector:\n              matchExpressions:\n              - key: app\n                operator: In\n                values:\n                - store\n            topologyKey: \"kubernetes.io/hostname\"\n      containers:\n      - name: redis\n        image: redis:alpine",
          "explanation": "### การจัดวาง Pod เทียบกับ Pod อื่นๆ\n1. **Pod Affinity**: สั่งให้วาง Pod ใหม่ไว้บนโหนดเดียวกันหรือโซนเดียวกันกับ Pod อื่น เช่น อยากให้ Web frontend วางบนเครื่องเดียวกับ Redis cache เพื่อลด Network Latency\n2. **Pod Anti-Affinity**: สั่งห้ามไม่ให้ Pod วางซ้อนบนโหนดหรือโซนเดียวกัน เหมาะสำหรับระบบ High Availability (HA) เช่น กระจาย 3 Replicas ของ Database ให้ไปอยู่คนละเครื่อง ป้องกันเครื่องเดียวล่มแล้วระบบดับหมด\n3. **topologyKey**:\n   * `kubernetes.io/hostname`: กระจายข้ามเครื่องโหนด\n   * `topology.kubernetes.io/zone`: กระจายข้าม Availability Zone",
          "examples": [
            {
              "desc": "ตรวจสอบ Labels ของโหนดที่ใช้เป็น topologyKey",
              "cmd": "kubectl get nodes --show-labels"
            }
          ],
          "examTips": [
            "จำไว้ว่า podAntiAffinity ทำงานโดยการตรวจสอบ 'labels' ของ Pod อื่นๆ จึงต้องระบุ 'labelSelector' เสมอ",
            "topologyKey: 'kubernetes.io/hostname' คือตัวเลือกที่ใช้บ่อยที่สุดเพื่อป้องกันไม่ให้ Pod ชนิดเดียวกันมารันบนโหนดเดียวกัน"
          ],
          "quickCheck": {
            "question": "หากต้องการให้ 3 Replicas ของ Deployment กระจายตัวไปรันบนโหนดที่แตกต่างกัน ห้ามรันบนเครื่องเดียวกันเด็ดขาด ควรใช้ฟีเจอร์ใด?",
            "options": [
              "nodeAffinity พร้อม In operator",
              "podAntiAffinity พร้อม topologyKey: 'kubernetes.io/hostname'",
              "Tolerations พร้อม NoExecute",
              "ResourceQuota ระดับ Pod"
            ],
            "answer": 1,
            "explanation": "podAntiAffinity ที่ระบุ topologyKey เป็น hostname จะปฏิเสธการวาง Pod บนโหนดที่มี Pod ซึ่งมี Label ตรงกับเงื่อนไขรันอยู่แล้ว"
          }
        },
        {
          "id": "cka-u2-4",
          "title": "Unit 2.4: DaemonSets, Static Pods & Custom Schedulers",
          "summary": "การรัน Pod ประจำทุกโหนดด้วย DaemonSet, การสร้าง Static Pods ในโฟลเดอร์ manifests และการตั้งค่า schedulerName",
          "docsUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/",
          "docsKeyword": "Create static pods",
          "blueprint": "# 1. ดูโฟลเดอร์ Static Pod Path ของ Kubelet\ngrep -i staticpodpath /var/lib/kubelet/config.yaml\n# ค่าเริ่มต้นทั่วไปคือ: /etc/kubernetes/manifests\n\n# 2. การสร้าง Static Pod:\n# วางไฟล์ YAML ลงใน /etc/kubernetes/manifests/ บนโหนดเป้าหมายโดยตรง\nsudo cp my-static-pod.yaml /etc/kubernetes/manifests/\n\n# 3. กำหนด Pod ให้รันด้วย Custom Scheduler\napiVersion: v1\nkind: Pod\nmetadata:\n  name: custom-scheduled-pod\nspec:\n  schedulerName: my-custom-scheduler\n  containers:\n  - name: app\n    image: nginx",
          "explanation": "### Workload รูปแบบพิเศษ\n1. **DaemonSets**:\n   * รับประกันว่าจะมี Pod 1 ตัวรันอยู่บนทุกโหนด (หรือโหนดที่เข้าเงื่อนไข) อัตโนมัติ เช่น Log Collector (Fluentd) หรือ Monitoring Agent\n2. **Static Pods**:\n   * ถูกควบคุมและมอนิเตอร์โดย **Kubelet โดยตรง** ไม่ได้ถูกสร้างผ่าน API Server\n   * Kubelet จะคอยสแกนโฟลเดอร์ `staticPodPath` (เช่น `/etc/kubernetes/manifests`) หากมีไฟล์ YAML วางอยู่ Kubelet จะรัน Pod ขึ้นมาทันที และหากไฟล์ถูกลบ Pod ก็จะดับลง\n   * ชื่อของ Static Pod จะลงท้ายด้วยชื่อโหนดเสมอ เช่น `kube-apiserver-controlplane`\n3. **Multiple Schedulers**:\n   * ในคลัสเตอร์สามารถมี Scheduler ได้หลายตัว หากต้องการให้ Pod ใดถูกจัดสรรโดย Custom Scheduler ให้ใส่ฟิลด์ `spec.schedulerName`",
          "examples": [
            {
              "desc": "สร้าง Static Pod บน worker node โดยเข้าไปวาง manifest",
              "cmd": "sudo kubectl run static-web --image=nginx --dry-run=client -o yaml > /etc/kubernetes/manifests/static-web.yaml"
            }
          ],
          "examTips": [
            "หากข้อสอบให้สร้าง Static Pod บนโหนดหนึ่ง: ให้ SSH เข้าไปที่โหนดนั้น เช็กโฟลเดอร์ใน /var/lib/kubelet/config.yaml แล้วเขียน YAML ไว้ที่นั่น",
            "อย่าสั่ง 'kubectl delete pod <static-pod>' เพราะ Kubelet จะสร้างขึ้นมาใหม่ทันที! การลบที่ถูกต้องคือการลบไฟล์ YAML ในโฟลเดอร์ manifests"
          ],
          "quickCheck": {
            "question": "วิธีการที่ถูกต้องที่สุดในการลบ Static Pod ออกจากคลัสเตอร์อย่างถาวรคือข้อใด?",
            "options": [
              "kubectl delete pod <static-pod-name> --force",
              "SSH เข้าไปยังโหนดที่มันรันอยู่ แล้วลบไฟล์ YAML ออกจากโฟลเดอร์ staticPodPath",
              "รัน kubeadm reset บนเครื่องโหนดนั้น",
              "แก้ไข restartPolicy ใน manifest ให้เป็น Never"
            ],
            "answer": 1,
            "explanation": "Static Pod ถูกจัดการโดย Kubelet ที่อ่านไฟล์จากไดเรกทอรีในเครื่อง การลบ Pod ผ่าน kubectl จะทำให้ Kubelet ตรวจพบว่า Pod หายไปและรีสตาร์ตขึ้นมาใหม่ทันที ต้องลบที่ไฟล์ manifest เท่านั้น"
          }
        }
      ]
    },
    {
      "id": "cka-b3",
      "title": "Domain 3: Services & Networking (20%)",
      "titleTh": "ระบบเครือข่าย การนำทางทราฟฟิก และ CoreDNS",
      "icon": "🌐",
      "category": "network",
      "description": "Service Packet Routing, kube-proxy (iptables vs IPVS), Ingress Controllers, CNI Plugins, CoreDNS Service Discovery และ NetworkPolicies",
      "units": [
        {
          "id": "cka-u3-1",
          "title": "Unit 3.1: Services, EndpointSlices & kube-proxy Packet Routing",
          "summary": "ทำความเข้าใจเส้นทางของ Network Packet, โครงสร้าง EndpointSlices และกลไกของ kube-proxy",
          "docsUrl": "https://kubernetes.io/docs/concepts/services-networking/service/",
          "docsKeyword": "Service",
          "blueprint": "# 1. ตรวจสอบ EndpointSlices ที่สร้างคู่กับ Service\nkubectl get endpointslices -l kubernetes.io/service-name=web-service\n\n# 2. ตรวจสอบโหมดการทำงานของ kube-proxy (iptables หรือ IPVS)\nkubectl logs -n kube-system -l k8s-app=kube-proxy | grep -i \"Using iptables Proxier\"\n\n# 3. ดู iptables rules ที่ถูกสร้างโดย kube-proxy\nsudo iptables -t nat -L KUBE-SERVICES -n -v",
          "explanation": "### การทำงานของระบบเครือข่าย Service\n1. **ClusterIP ไม่ใช่อุปกรณ์เน็ตเวิร์กจริง**:\n   * ClusterIP เป็น Virtual IP ที่ไม่มี Network Interface หรือ MAC Address จริงในระบบ\n   * มันมีอยู่แค่ในกฎของ **iptables** หรือ **IPVS** ที่โปรเซส **kube-proxy** เขียนดักไว้บน Kernel ของทุกโหนด\n2. **EndpointSlices**:\n   * พัฒนาขึ้นมาแทน Endpoints เดิมเพื่อรองรับ Scale ขนาดใหญ่ (คลัสเตอร์ที่มี Pod เป็นพันตัว) โดยจะจัดกลุ่ม IP ของ Pod ปลายทางก้อนละไม่เกิน 100 endpoints ต่อ 1 slice\n3. **Packet Flow**:\n   * เมื่อ Client ยิงแพ็กเก็ตไปยัง ClusterIP Kernel จะดักจับผ่าน iptables แล้วทำ **DNAT** (Destination NAT) แปลง IP ปลายทางให้กลายเป็น Pod IP ตัวใดตัวหนึ่งแบบสุ่ม",
          "examples": [
            {
              "desc": "ตรวจสอบว่า Service ตัวไหนไม่มี Pod มารองรับ (Endpoints ว่างเปล่า)",
              "cmd": "kubectl get endpoints -A | grep '<none>'"
            }
          ],
          "examTips": [
            "หาก Service ใช้งานไม่ได้ ให้ตรวจเช็ก 3 จุดตามลำดับ: 1. Pod Labels ตรงกับ Service Selector ไหม, 2. Endpoints มี IP ไหม, 3. targetPort ตรงกับพอร์ตที่ container เปิดฟังจริงไหม"
          ],
          "quickCheck": {
            "question": "ส่วนประกอบใดใน Kubernetes ที่คอยเฝ้าดู Service/EndpointSlices และคอยเขียนกฎ iptables/IPVS บนโหนดเพื่อจัดการ Packet Forwarding?",
            "options": [
              "CoreDNS",
              "kube-proxy",
              "kubelet",
              "flannel-cni"
            ],
            "answer": 1,
            "explanation": "kube-proxy รันอยู่บนทุกโหนด ทำหน้าที่แปลความหมายของ Service Object ให้กลายเป็นกฎ Network NAT (iptables หรือ IPVS) บน Linux Kernel"
          }
        },
        {
          "id": "cka-u3-2",
          "title": "Unit 3.2: Ingress Controllers & Ingress Resources Configuration",
          "summary": "การติดตั้ง Ingress Controller, การเขียน Ingress Routing rules, IngressClass และการจัดการ TLS Certificates",
          "docsUrl": "https://kubernetes.io/docs/concepts/services-networking/ingress/",
          "docsKeyword": "Ingress",
          "blueprint": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: secured-ingress\n  annotations:\n    nginx.ingress.kubernetes.io/ssl-redirect: \"true\"\nspec:\n  ingressClassName: nginx\n  tls:\n  - hosts:\n    - store.k8s.local\n    secretName: store-tls-cert\n  rules:\n  - host: store.k8s.local\n    http:\n      paths:\n      - path: /products\n        pathType: Prefix\n        backend:\n          service:\n            name: product-svc\n            port:\n              number: 80",
          "explanation": "### การทำงานของ Ingress ในระดับ Administrator\n* ในฐานะ Administrator คุณต้องเข้าใจทั้งฝั่ง **Ingress Controller** (แอปพลิเคชัน Proxy ที่รันเป็น Deployment หรือ DaemonSet เช่น ingress-nginx) และฝั่ง **Ingress Resource** (กฎการนำทาง)\n* หากสร้าง Ingress Resource แต่ไม่มี Ingress Controller รันอยู่ หรือไม่ได้ระบุ `ingressClassName` ให้ตรงกัน ทราฟฟิกจะไม่ถูก Route\n* **TLS Secret**: ต้องเป็น Secret ชนิด `kubernetes.io/tls` ที่เก็บ `tls.crt` และ `tls.key`",
          "examples": [
            {
              "desc": "สร้าง Secret สำหรับ TLS จากไฟล์ใบรับรองจริง",
              "cmd": "kubectl create secret tls store-tls-cert --cert=/etc/ssl/cert.pem --key=/etc/ssl/cert.key"
            }
          ],
          "examTips": [
            "สร้าง Secret ชนิด TLS ด้วยคำสั่ง Imperative: 'kubectl create secret tls <name> --cert=... --key=...'",
            "ตรวจสอบว่า Ingress Controller รันอยู่ใน namespace ใด (มักอยู่ใน ingress-nginx)"
          ],
          "quickCheck": {
            "question": "Secret ชนิดใดที่ใช้สำหรับจัดเก็บ SSL/TLS Certificate และ Private Key สำหรับใช้งานร่วมกับ Ingress Resource?",
            "options": [
              "Opaque",
              "kubernetes.io/tls",
              "kubernetes.io/service-account-token",
              "generic"
            ],
            "answer": 1,
            "explanation": "Kubernetes มี Secret type พิเศษคือ 'kubernetes.io/tls' ซึ่งมีโครงสร้างคีย์บังคับ 2 ตัวคือ tls.crt และ tls.key"
          }
        },
        {
          "id": "cka-u3-3",
          "title": "Unit 3.3: Container Network Interface (CNI) Architecture & IPAM",
          "summary": "สถาปัตยกรรม CNI Plugins, ตำแหน่งไฟล์คอนฟิกใน /etc/cni/net.d/, การจัดสรร IP (IPAM) และ NetworkPolicies",
          "docsUrl": "https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/",
          "docsKeyword": "Network Plugins",
          "blueprint": "# 1. ไดเรกทอรีเก็บคอนฟิก CNI บนโหนด\nls -la /etc/cni/net.d/\n\n# 2. ไดเรกทอรีเก็บไฟล์ Executable Binary ของ CNI Plugins\nls -la /opt/cni/bin/\n\n# 3. ตัวอย่างการตรวจสอบไฟล์ CNI Config ลำดับแรก (จัดเรียงตามลำดับตัวอักษร)\ncat /etc/cni/net.d/10-flannel.conflist",
          "explanation": "### หลักการทำงานของ CNI (Container Network Interface)\n1. **บทบาทของ Kubelet และ CNI**:\n   * Kubelet ไม่ได้สร้าง Network Interface หรือแจก IP ด้วยตัวเอง\n   * เมื่อมีคำสั่งสร้าง Pod บนโหนด Kubelet จะมองหาไฟล์คอนฟิกตัวแรกใน `/etc/cni/net.d/` (เรียงตามลำดับตัวอักษร)\n   * Kubelet จะเรียกใช้ Binary Plugin ใน `/opt/cni/bin/` (เช่น bridge, host-local, loopback, flannel, calico) เพื่อสร้าง veth pair, เชื่อมต่อ bridge และจ่าย IP ให้แก่ Pod Network Namespace\n\n2. **IPAM (IP Address Management)**:\n   * ส่วนย่อยใน CNI ที่ทำหน้าที่แจกจ่าย IP จาก Pod CIDR ไม่ให้ซ้ำซ้อนกันระหว่างแต่ละโหนด",
          "examples": [
            {
              "desc": "ค้นหาว่าคลัสเตอร์นี้ใช้ CNI Plugin ตัวใด",
              "cmd": "cat /etc/cni/net.d/* | grep -i type"
            }
          ],
          "examTips": [
            "ข้อสอบ CKA อาจมีโจทย์ที่ Node อยู่ในสถานะ NotReady เนื่องจากไฟล์คอนฟิกใน /etc/cni/net.d/ สูญหาย หรือพิมพ์ผิด ให้เข้าไปเช็กโฟลเดอร์นี้เสมอ",
            "หาก CNI ทำงานผิดพลาด Pod ใหม่จะไม่สามารถรับ IP Address ได้ (IP จะว่างเปล่าใน 'kubectl get pod -o wide')"
          ],
          "quickCheck": {
            "question": "Kubelet ตรวจสอบคอนฟิกของ Network Plugin จากไดเรกทอรีใดบนระบบไฟล์ของ Worker Node?",
            "options": [
              "/etc/kubernetes/cni/",
              "/etc/cni/net.d/",
              "/var/lib/cni/config/",
              "/opt/cni/bin/"
            ],
            "answer": 1,
            "explanation": "ไดเรกทอรีมาตรฐานที่ Kubelet ใช้อ่านไฟล์คอนฟิกเครือข่ายคือ '/etc/cni/net.d/' (ส่วน '/opt/cni/bin/' ใช้เก็บตัวโปรแกรม binary)"
          }
        },
        {
          "id": "cka-u3-4",
          "title": "Unit 3.4: CoreDNS Architecture & Cluster DNS Troubleshooting",
          "summary": "สถาปัตยกรรม DNS ภายในคลัสเตอร์, การคอนฟิก Corefile ใน ConfigMap และการทดสอบด้วย nslookup / dig",
          "docsUrl": "https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/",
          "docsKeyword": "Debugging DNS Resolution",
          "blueprint": "# 1. ดึง Log ของ CoreDNS เพื่อหาสาเหตุ DNS Query ล่ม\nkubectl logs -n kube-system -l k8s-app=kube-dns -f\n\n# 2. ดูคอนฟิก Corefile ภายใน ConfigMap\nkubectl get cm coredns -n kube-system -o yaml\n\n# 3. รัน Pod ทดสอบการ Resolve Domain แบบด่วน\nkubectl run dns-test --image=busybox:1.36 -i --rm --restart=Never -- nslookup kubernetes.default",
          "explanation": "### การทำงานของ CoreDNS\n1. **Service Discovery**:\n   * Pod ทุกตัวจะมีไฟล์ `/etc/resolv.conf` ชี้ไปยัง IP ของ Service `kube-dns` (มักเป็น 10.96.0.10)\n   * รูปแบบ FQDN ของ Service: `<service-name>.<namespace>.svc.cluster.local`\n   * รูปแบบ FQDN ของ Pod: `<pod-ip-with-dashes>.<namespace>.pod.cluster.local`\n\n2. **ปัญหา DNS ที่พบบ่อยในข้อสอบ**:\n   * CoreDNS Pod ติดสถานะ CrashLoopBackOff: มักเกิดจาก Upstream Loop (โฮสต์ใช้ 127.0.0.53)\n   * Service kube-dns ถูกลบ หรือมีพอร์ตผิด ทำให้ Pods ไม่สามารถ resolve ชื่อภายนอกได้",
          "examples": [
            {
              "desc": "ตรวจสอบว่า Service kube-dns มี Endpoints เชื่อมโยงกับ Pods CoreDNS ครบถ้วน",
              "cmd": "kubectl get endpoints kube-dns -n kube-system"
            }
          ],
          "examTips": [
            "ถ้า Pod คุยกันด้วย IP ได้ แต่คุยกันด้วยชื่อ Service ไม่ได้: ให้มุ่งเป้าไปที่ CoreDNS ทันที!",
            "ทดสอบ lookup ชื่อย่อ (svc), ชื่อกลาง (svc.namespace) และชื่อเต็ม (svc.namespace.svc.cluster.local)"
          ],
          "quickCheck": {
            "question": "หากต้องการทดสอบ DNS Resolution ภายในคลัสเตอร์ รูปแบบชื่อเต็ม (FQDN) ของ Service ชื่อ 'db' ใน namespace 'finance' คืออะไร?",
            "options": [
              "db.finance.svc.cluster.local",
              "db.finance.k8s.local",
              "db.service.finance.cluster",
              "finance.db.svc.local"
            ],
            "answer": 0,
            "explanation": "มาตรฐาน Fully Qualified Domain Name ของ Service ใน Kubernetes คือ <service-name>.<namespace>.svc.cluster.local"
          }
        }
      ]
    },
    {
      "id": "cka-b4",
      "title": "Domain 4: Storage Administration (10%)",
      "titleTh": "การบริหารจัดการ Storage และ Persistent Volumes",
      "icon": "💾",
      "category": "storage",
      "description": "PersistentVolumes (PV), PersistentVolumeClaims (PVC), StorageClasses, AccessModes, ReclaimPolicies และ Volume Expansion",
      "units": [
        {
          "id": "cka-u4-1",
          "title": "Unit 4.1: PersistentVolumes, PVCs & StorageClasses In-Depth",
          "summary": "สถาปัตยกรรม Storage 3 ชั้น, การผูกคู่ระหว่าง PV และ PVC, Dynamic Provisioning และการ Mount ลง Pod",
          "docsUrl": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/",
          "docsKeyword": "Persistent Volumes",
          "blueprint": "# 1. ประกาศ PersistentVolume (ระดับ Admin)\napiVersion: v1\nkind: PersistentVolume\nmetadata:\n  name: pv-data\nspec:\n  capacity:\n    storage: 5Gi\n  accessModes:\n    - ReadWriteOnce\n  persistentVolumeReclaimPolicy: Retain # Retain, Delete, Recycle\n  storageClassName: local-storage\n  hostPath:\n    path: /mnt/data\n\n# 2. ประกาศ PersistentVolumeClaim (ระดับ Developer)\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: pvc-data\nspec:\n  accessModes:\n    - ReadWriteOnce\n  storageClassName: local-storage\n  resources:\n    requests:\n      storage: 2Gi",
          "explanation": "### กลไกการจับคู่ระหว่าง PV และ PVC\n1. **Binding Phase**:\n   * Kubernetes Master จะจับคู่ PVC เข้ากับ PV ที่เข้าเกณฑ์:\n     * `storageClassName` ต้องตรงกัน\n     * `accessModes` ต้องรองรับโหมดที่ร้องขอ\n     * ขนาด `capacity` ของ PV ต้องมีขนาดเท่ากับหรือ **มากกว่า** ขนาดที่ PVC ร้องขอ (`requests.storage`)\n   * เมื่อเข้าเกณฑ์ สถานะจะเปลี่ยนจาก `Pending` กลายเป็น `Bound`\n\n2. **Dynamic Provisioning ผ่าน StorageClass**:\n   * หากมี StorageClass และไม่ได้สร้าง PV ไว้ล่วงหน้า CSI Provisioner จะสร้าง Storage จริงบนคลาวด์/ระบบจัดเก็บให้อัตโนมัติทันทีที่มี PVC ร้องขอเข้ามา",
          "examples": [
            {
              "desc": "ตรวจสอบสถานะการ Bound ของ PVC และ PV",
              "cmd": "kubectl get pv,pvc -A"
            }
          ],
          "examTips": [
            "PV เป็น Cluster-scoped (ไม่มี namespace) แต่ PVC เป็น Namespace-scoped (ต้องระบุ namespace)",
            "หาก PVC ค้างที่ Pending ให้รัน 'kubectl describe pvc <name>' เพื่อดูว่าทำไมถึงหา PV ที่เข้ากันไม่ได้"
          ],
          "quickCheck": {
            "question": "ข้อใดกล่าวถูกต้องเกี่ยวกับขอบเขต (Scope) ของ PersistentVolume (PV) และ PersistentVolumeClaim (PVC)?",
            "options": [
              "ทั้ง PV และ PVC ผูกอยู่กับ Namespace เดียวกันเสมอ",
              "PV เป็น Cluster-scoped (ไม่มี Namespace) แต่ PVC เป็น Namespace-scoped",
              "PV เป็น Namespace-scoped แต่ PVC เป็น Cluster-scoped",
              "ทั้งคู่เป็น Cluster-scoped"
            ],
            "answer": 1,
            "explanation": "PersistentVolume เป็นทรัพยากรส่วนกลางของคลัสเตอร์ (Cluster-scoped) จัดเตรียมโดยผู้ดูแลระบบ ขณะที่ PersistentVolumeClaim ถูกสร้างโดยผู้ใช้ภายใน Namespace เพื่อขอตัดแบ่งพื้นที่ไปใช้งาน"
          }
        },
        {
          "id": "cka-u4-2",
          "title": "Unit 4.2: AccessModes, ReclaimPolicies & Volume Expansion",
          "summary": "เจาะลึก 4 โหมด AccessModes, ความแตกต่างของ Retain vs Delete, และการขยายขนาด PVC แบบออนไลน์",
          "docsUrl": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaiming",
          "docsKeyword": "PersistentVolume Reclaim Policy",
          "blueprint": "# AccessModes:\n# ReadWriteOnce (RWO)  : Mount อ่านเขียนได้โดยโหนดเดียว\n# ReadOnlyMany (ROX)   : Mount อ่านได้อย่างเดียวโดยหลายโหนด\n# ReadWriteMany (RWX)  : Mount อ่านเขียนได้โดยหลายโหนดพร้อมกัน\n# ReadWriteOncePod (RWOP): Mount อ่านเขียนได้โดย Pod เดียวเท่านั้น (K8s 1.22+)\n\n# Reclaim Policies:\n# Retain : เมื่อ PVC ถูกลบ PV จะยังคงอยู่ (สถานะ Released) ข้อมูลไม่หาย ต้อง manual ล้าง\n# Delete : เมื่อ PVC ถูกลบ PV และพื้นที่จัดเก็บบน Cloud จะถูกลบทิ้งถาวรทันที\n\n# การขยายขนาด PVC (Volume Expansion):\n# StorageClass ต้องเปิด 'allowVolumeExpansion: true'\nkubectl patch pvc my-pvc -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"10Gi\"}}}}'",
          "explanation": "### การจัดการวงจรชีวิตของข้อมูล\n1. **Reclaim Policy: Retain**:\n   * มักใช้ในระดับ Production เมื่อผู้ใช้เผลอลบ PVC ข้อมูลใน PV จะยังคงปลอดภัย แต่ PV จะเปลี่ยนสถานะเป็น `Released` (ไม่สามารถนำไปให้ PVC อื่นมาผูกต่อได้ทันที จนกว่า Admin จะเคลียร์ข้อมูลเดิมและลบค่า `claimRef` ออก)\n2. **Dynamic Volume Expansion**:\n   * หากต้องการเพิ่มขนาด PVC โดยไม่ต้องทำลาย Pod ให้ตรวจสอบว่า StorageClass มี `allowVolumeExpansion: true` จากนั้นสั่งแก้ไขขนาด storage ใน PVC ได้ทันที K8s จะสั่งขยาย Filesystem บนโหนดให้แบบออนไลน์",
          "examples": [
            {
              "desc": "เปลี่ยน ReclaimPolicy ของ PV จาก Delete ให้กลายเป็น Retain ป้องกันข้อมูลหาย",
              "cmd": "kubectl patch pv pv-data -p '{\"spec\":{\"persistentVolumeReclaimPolicy\":\"Retain\"}}'"
            }
          ],
          "examTips": [
            "ข้อสอบ CKA มักสั่งให้เปลี่ยน Reclaim Policy ของ PV ที่มีอยู่แล้ว ให้ใช้ 'kubectl patch pv <name> -p ...'",
            "จำไว้ว่าเราสามารถขยายขนาด PVC ให้ใหญ่ขึ้นได้เท่านั้น แต่ไม่สามารถลดขนาดลงได้"
          ],
          "quickCheck": {
            "question": "หาก PersistentVolume มี persistentVolumeReclaimPolicy เป็น 'Retain' เมื่อ PersistentVolumeClaim ที่ผูกอยู่ถูกลบทิ้ง จะเกิดสิ่งใดขึ้นกับ PV?",
            "options": [
              "PV จะถูกลบออกไปพร้อมกัน",
              "PV จะเปลี่ยนสถานะเป็น Available และพร้อมให้ PVC ตัวใหม่มา Bind ทันที",
              "PV จะเปลี่ยนสถานะเป็น Released และข้อมูลทั้งหมดยังคงอยู่",
              "PV จะติดสถานะ Failed"
            ],
            "answer": 2,
            "explanation": "นโยบาย Retain จะเก็บรักษา Storage และข้อมูลไว้ โดยเปลี่ยนสถานะของ PV เป็น Released เพื่อรอให้ Administrator เข้ามาสำรองหรือกู้คืนข้อมูลด้วยตนเอง"
          }
        }
      ]
    },
    {
      "id": "cka-b5",
      "title": "Domain 5: Troubleshooting (30%)",
      "titleTh": "การวิเคราะห์และแก้ไขปัญหาคลัสเตอร์ขั้นสูง",
      "icon": "🛠️",
      "category": "troubleshoot",
      "description": "หมวดที่มีสัดส่วนคะแนนสูงสุด (30%): การซ่อมแซม Worker Node NotReady, กู้คืน Control Plane ล่ม, แก้อาการ CrashLoopBackOff และวินิจฉัยปัญหา Network/DNS",
      "units": [
        {
          "id": "cka-u5-1",
          "title": "Unit 5.1: Troubleshooting Worker Node NotReady Failures",
          "summary": "แนวทางการวินิจฉัยโหนดล่ม: ตรวจสอบสถานะ Kubelet Service, Journalctl logs, Disk/Memory Pressure และ Container Runtime",
          "docsUrl": "https://kubernetes.io/docs/tasks/debug/debug-cluster/monitor-node-health/",
          "docsKeyword": "Monitor Node Health",
          "blueprint": "# ขั้นตอนแก้ไขปัญหาเมื่อโหนดเป็น NotReady:\n# 1. ตรวจสอบเงื่อนไขข้อผิดพลาดจาก Master\nkubectl describe node <node-name>\n# ดูหัวข้อ 'Conditions': Ready=False/Unknown, MemoryPressure, DiskPressure\n\n# 2. SSH ข้ามไปยังโหนดที่มีปัญหา\nssh <node-name>\n\n# 3. ตรวจสอบสถานะของ Kubelet Service\nsudo systemctl status kubelet\n\n# 4. อ่าน Error Log ล่าสุดของ Kubelet\nsudo journalctl -u kubelet -e --no-pager\n\n# 5. ตรวจสอบ Container Runtime Service\nsudo systemctl status containerd",
          "explanation": "### สาเหตุยอดฮิตที่ทำให้ Node กลายเป็น NotReady\n1. **Kubelet Service หยุดทำงาน (Inactive/Dead)**:\n   * เกิดจากมีคนสั่งหยุด, cert หมดอายุ หรือ config พัง\n   * แก้ไขด้วยการตรวจสอบ log แล้วสั่ง `sudo systemctl restart kubelet`\n2. **Kubelet เชื่อมต่อ API Server ไม่ได้**:\n   * เช็กไฟล์ `/etc/kubernetes/kubelet.conf` ว่า server IP ถูกต้องหรือไม่\n3. **Container Runtime (containerd) ล่ม**:\n   * ตรวจสอบว่า sock file มีอยู่จริงหรือไม่ (`/run/containerd/containerd.sock`)\n4. **Certificate ของ Kubelet หมดอายุ**:\n   * ตรวจสอบไฟล์ใน `/var/lib/kubelet/pki`",
          "examples": [
            {
              "desc": "สั่งเปิดใช้งานและเริ่มต้นรัน Kubelet หากถูกสั่ง disable ไว้",
              "cmd": "sudo systemctl enable --now kubelet"
            }
          ],
          "examTips": [
            "สูตรสำเร็จ CKA Node NotReady: SSH เข้าเครื่อง -> sudo systemctl status kubelet -> journalctl -u kubelet -e -> แก้จุดที่ฟ้อง -> restart kubelet",
            "อย่าลืมตรวจเช็กว่าโหนดถูก Cordon ไว้อยู่หรือไม่ด้วย 'kubectl uncordon <node>'"
          ],
          "quickCheck": {
            "question": "เมื่อพบว่า Worker Node อยู่ในสถานะ NotReady คำสั่งระดับ OS ตัวใดที่ให้ข้อมูลข้อผิดพลาดภายในของ Kubelet ได้ละเอียดย้อนหลังได้ดีที่สุด?",
            "options": [
              "kubectl logs kubelet",
              "sudo journalctl -u kubelet -e",
              "cat /var/log/syslog",
              "systemctl check kubelet"
            ],
            "answer": 1,
            "explanation": "เนื่องจาก Kubelet ทำงานเป็น Systemd Service ในระดับโฮสต์ คำสั่ง 'journalctl -u kubelet -e' จะแสดง log ข้อความ error ที่ Kubelet พ่นออกมาตรงจุดที่สุด"
          }
        },
        {
          "id": "cka-u5-2",
          "title": "Unit 5.2: Control Plane Failure & Static Pods Recovery",
          "summary": "การกู้คืน Master Node เมื่อ kubectl ใช้งานไม่ได้: การใช้ crictl ตรวจสอบคอนเทนเนอร์ และการแก้ Manifests ที่สะกดผิด",
          "docsUrl": "https://kubernetes.io/docs/tasks/debug/debug-cluster/",
          "docsKeyword": "Troubleshooting Clusters",
          "blueprint": "# 1. เมื่อ kubectl ใช้งานไม่ได้ (The connection to the server was refused)\n# ตรวจสอบว่า Container Runtime ยังรันอยู่หรือไม่\nsudo crictl ps -a\n\n# 2. ดู Log ของคอนเทนเนอร์ Control Plane ที่แครช\nsudo crictl logs <container-id>\n\n# 3. ตรวจสอบไฟล์ Static Pod Manifests บน Master\ncd /etc/kubernetes/manifests\n# ตรวจดู kube-apiserver.yaml, kube-controller-manager.yaml, kube-scheduler.yaml, etcd.yaml",
          "explanation": "### การแก้ปัญหาเมื่อ Control Plane พัง\nเมื่อ API Server ไม่ทำงาน คุณจะไม่สามารถใช้ `kubectl` ได้เลย! เครื่องมือที่คุณต้องพึ่งพาคือ **crictl** (CLI สำหรับติดต่อ Container Runtime โดยตรง):\n\n1. **crictl Commands**:\n   * `crictl ps`: แสดงคอนเทนเนอร์ที่กำลังรันอยู่\n   * `crictl ps -a`: แสดงคอนเทนเนอร์ทั้งหมด รวมถึงตัวที่ Exit หรือ Crash\n   * `crictl logs <id>`: อ่าน Log ภายในคอนเทนเนอร์\n\n2. **จุดที่ข้อสอบมักแกล้งวางยา (Misconfigurations)**:\n   * สะกด path ของ certificate ใน `kube-apiserver.yaml` ผิด (เช่น `/etc/kubernetes/pki/ca.crt` กลายเป็น `/ca-wrong.crt`)\n   * พอร์ต etcd ใน apiserver ไม่ตรงกับพอร์ตจริง\n   * ย้ายไฟล์ manifest ออกไปไว้นอกไดเรกทอรี `/etc/kubernetes/manifests`",
          "examples": [
            {
              "desc": "ตรวจสอบ container ที่ exited ไปเมื่อไม่กี่วินาทีก่อน",
              "cmd": "sudo crictl ps -a --state Exited"
            }
          ],
          "examTips": [
            "crictl ต้องการ root privilege ให้ใช้ 'sudo crictl' เสมอ",
            "เมื่อแก้ไขไฟล์ใน /etc/kubernetes/manifests/ Kubelet จะตรวจจับอัตโนมัติภายใน 10-20 วินาทีและรีสตาร์ต Pod ขึ้นมาเอง ไม่ต้องรีสตาร์ต Kubelet"
          ],
          "quickCheck": {
            "question": "หาก kube-apiserver ล่มและไม่สามารถใช้คำสั่ง kubectl ได้ จะใช้คำสั่งใดเพื่อตรวจสอบรายชื่อคอนเทนเนอร์และอ่าน Log โดยตรงจาก Container Runtime?",
            "options": [
              "docker ps / docker logs",
              "sudo crictl ps / sudo crictl logs",
              "systemctl logs apiserver",
              "kubectl get pods -n kube-system"
            ],
            "answer": 1,
            "explanation": "ใน Kubernetes ยุคปัจจุบันที่ใช้ containerd คำสั่งมาตรฐานคือ 'crictl' ซึ่งทำหน้าที่ติดต่อกับ CRI โดยตรงแม้ API Server จะไม่ทำงานก็ตาม"
          }
        },
        {
          "id": "cka-u5-3",
          "title": "Unit 5.3: Application & Pod Debugging Playbook",
          "summary": "เจาะลึก 5 อาการยอดฮิตของ Pod: CrashLoopBackOff, ImagePullBackOff, OOMKilled, Pending และ CreateContainerConfigError",
          "docsUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/",
          "docsKeyword": "Determine the Reason for Pod Failure",
          "blueprint": "# Flow การวินิจฉัย Pod:\n# 1. ดูสถานะและ Events ล่าสุด\nkubectl describe pod <pod-name>\n\n# 2. ดู Log ย้อนหลังก่อนที่คอนเทนเนอร์จะตาย\nkubectl logs <pod-name> --previous\n\n# 3. เจาะเข้าสู่โหมด Interactive Shell ใน Pod (ถ้ายังรันอยู่)\nkubectl exec -it <pod-name> -- /bin/sh",
          "explanation": "### ถอดรหัสสถานะความผิดพลาดของ Pod\n1. **Pending**:\n   * Scheduler ไม่สามารถหาโหนดที่วางได้ (ทรัพยากร CPU/Memory บนโหนดเต็ม, โหนดติด Taint, หรือ PVC ยังไม่ได้ Bound)\n2. **CrashLoopBackOff**:\n   * แอปพลิเคชันภายในเริ่มทำงานได้แต่เกิด Fatal Error หรือ Exception แล้ว Exit ออกมา Kubelet จึงพยายามรีสตาร์ตซ้ำๆ โดยเว้นระยะเวลาเพิ่มขึ้นเรื่อยๆ\n3. **ImagePullBackOff / ErrImagePull**:\n   * สะกดชื่อ Image หรือ Tag ผิด, Image ไม่มีอยู่จริงบน Registry, หรือลืมระบุ `imagePullSecrets` สำหรับ Private Registry\n4. **CreateContainerConfigError**:\n   * ConfigMap หรือ Secret ที่ระบุไว้ใน `envFrom` หรือ `volumeMounts` ยังไม่ได้ถูกสร้างขึ้นในคลัสเตอร์!\n5. **OOMKilled (Exit Code 137)**:\n   * หน่วยความจำของ Container ทะลุเกินค่า `limits.memory` ที่ตั้งไว้",
          "examples": [
            {
              "desc": "ค้นหา Pods ทั้งหมดที่ติดสถานะ Error หรือ Crash ในทุก Namespace",
              "cmd": "kubectl get pods -A | grep -E 'CrashLoopBackOff|Error|ImagePullBackOff'"
            }
          ],
          "examTips": [
            "คำสั่งแรกที่ต้องรันเสมอเมื่อ Pod มีปัญหาคือ: 'kubectl describe pod <name>' แล้วเลื่อนลงไปอ่านบรรทัด Events ด้านล่างสุด",
            "Exit Code 137 = 128 + 9 (SIGKILL จาก Linux Out of Memory Killer)"
          ],
          "quickCheck": {
            "question": "หาก Pod แสดงสถานะ 'CreateContainerConfigError' สาเหตุที่เป็นไปได้มากที่สุดเกิดจากสิ่งใด?",
            "options": [
              "พอร์ตเครือข่ายชนกับเซอร์วิสอื่น",
              "อ้างอิงชื่อ ConfigMap หรือ Secret ใน Pod Manifest ที่ยังไม่ได้ถูกสร้างขึ้นใน Namespace นั้น",
              "CPU Limits ตั้งไว้ต่ำเกินไป",
              "Worker Node มีพื้นที่ดิสก์เต็ม"
            ],
            "answer": 1,
            "explanation": "CreateContainerConfigError เกิดขึ้นเมื่อ Kubelet เตรียม Environment ก่อนรัน Container แล้วพบว่า ConfigMap หรือ Secret ที่อ้างอิงไว้ไม่มีอยู่ในระบบ"
          }
        },
        {
          "id": "cka-u5-4",
          "title": "Unit 5.4: Cluster Network & DNS Diagnostic Playbook",
          "summary": "แนวทางการแก้ไขปัญหาเครือข่าย: การตรวจสอบ CNI Pods, Service Endpoints, CoreDNS Concurrency และ Security Policies",
          "docsUrl": "https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/",
          "docsKeyword": "Debugging DNS Resolution",
          "blueprint": "# 1. ตรวจสอบว่า CoreDNS Pods รันครบและพร้อมทำงาน\nkubectl get pods -n kube-system -l k8s-app=kube-dns\n\n# 2. ตรวจสอบว่า Service kube-dns ชี้ไปยัง IP ของ CoreDNS Pods ถูกต้อง\nkubectl get endpoints kube-dns -n kube-system\n\n# 3. รัน curl ทดสอบพอร์ตของ Service และ Endpoints โดยตรง\nkubectl run test-curl --image=curlimages/curl -i --rm --restart=Never -- curl -v -m 5 <cluster-ip>:<port>",
          "explanation": "### การแก้ปัญหาเครือข่ายแบบเป็นขั้นตอน (Systematic Network Triage)\nเมื่อแอปพลิเคชัน A เรียกแอปพลิเคชัน B ไม่ได้:\n1. **Step 1: Test IP connectivity**: ยิงตรงไปยัง Pod IP ของตัว B โดยตรง หากต่อได้ แสดงว่า Network CNI ปกติ ปัญหาอยู่ที่ระดับ Service\n2. **Step 2: Test Service Endpoints**: เช็ก `kubectl get endpoints <svc>` ว่ามี IP ของ Pod หรือไม่ หากว่าง แสดงว่า Selector ผิด\n3. **Step 3: Test DNS resolution**: ยิงหา `<svc-name>.<namespace>` หากไม่ติด ให้ตรวจเช็ก CoreDNS Pods และ Service `kube-dns`\n4. **Step 4: Check NetworkPolicies**: ตรวจสอบว่ามี NetworkPolicy ใดใน namespace ดักบล็อกทราฟฟิก Ingress หรือ Egress หรือไม่",
          "examples": [
            {
              "desc": "ตรวจสอบ NetworkPolicies ทั้งหมดใน Namespace ที่มีปัญหา",
              "cmd": "kubectl get netpol -n production"
            }
          ],
          "examTips": [
            "หากข้อสอบให้เช็กว่าทำไม Web Pod เข้า Database ไม่ได้ ให้ตรวจ NetworkPolicy เป็นอันดับแรกๆ",
            "ระวังเรื่อง Default-Deny NetworkPolicy ที่อาจถูกใส่ไว้ใน Namespace โดยที่เราไม่รู้ตัว"
          ],
          "quickCheck": {
            "question": "หากพบว่า Pod สามารถติดต่อสื่อสารด้วย Pod IP ตรงๆ ได้ แต่ไม่สามารถเชื่อมต่อผ่านชื่อ Service ได้ ควรตรวจสอบส่วนประกอบใดเป็นอันดับแรก?",
            "options": [
              "Container Network Interface (CNI)",
              "CoreDNS และ Service Endpoints",
              "Kubelet Systemd Service",
              "Linux Kernel ARP Cache"
            ],
            "answer": 1,
            "explanation": "หาก IP ติดต่อได้แสดงว่า Routing พื้นฐานทำงานแล้ว ปัญหาการเรียกผ่านชื่อ Service เกิดขึ้นจากฝั่ง DNS (CoreDNS) หรือการแมป Service Endpoints"
          }
        }
      ]
    }
  ]
};
