/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/
 */
(function (root) {
  const pageData = {
  "id": "debug-cluster-crictl",
  "categoryId": "debugging",
  "categoryTitle": "Monitoring, Logging, and Debugging",
  "titleEn": "Debugging Kubernetes nodes with crictl",
  "titleTh": "การแก้ไขปัญหาคลัสเตอร์ระดับลึกด้วยคำสั่ง crictl",
  "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/",
  "docsPath": "/docs/tasks/debug/debug-cluster/crictl/",
  "diagram": {
    "src": "images/docs/components-of-kubernetes.svg",
    "caption": "การใช้งาน crictl สื่อสารตรงกับ Container Runtime บน Node ผ่าน CRI gRPC endpoint"
  },
  "lead": "คู่มือการใช้งานเครื่องมือ `crictl` (Container Runtime Interface CLI) เพื่อตรวจสอบ สืบหา และแก้ไขปัญหาพอด คอนเทนเนอร์ และอิมเมจในระดับ Node โดยตรงเมื่อ API Server หรือ Kubelet เกิดความล้มเหลว (หัวข้อสำคัญมากในการสอบ CKA)",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\n`crictl` เป็นเครื่องมือบรรทัดคำสั่ง (CLI) สำหรับติดต่อสื่อสารกับ Container Runtime (เช่น containerd หรือ CRI-O) บนโหนดโดยตรงผ่าน CRI Socket ช่วยให้ผู้ดูแลระบบสามารถตรวจสอบ สืบหา และแก้ไขปัญหาพอด คอนเทนเนอร์ และอิมเมจในระดับ Node ได้ แม้ในยามที่ Kubelet หรือ Control Plane (เช่น API Server) ล่มจนสั่งงานผ่าน `kubectl` ไม่ได้\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **ทำงานตรงกับ Container Runtime**: `crictl` ไม่ผ่าน Kubernetes API Server จึงเป็นเครื่องมือช่วยชีวิตตัวหลักเมื่อ Control Plane ไม่สามารถให้บริการได้\n* **การแยกแยะระหว่าง Pod Sandbox และ Container**:\n  * Pod Sandbox คือสภาพแวดล้อมเครือข่ายและเนมสเปซส่วนกลางของพอด (ดูด้วย `crictl pods`)\n  * Container คือโพรเซสของแอปพลิเคชันจริงที่รันอยู่ข้างใน Pod Sandbox (ดูด้วย `crictl ps`)\n* **การตั้งค่า Socket Endpoint**: คอนฟิกพาธของ Socket ผ่านไฟล์ `/etc/crictl.yaml` หรือใส่แฟล็ก `--runtime-endpoint unix:///run/containerd/containerd.sock`\n* **การกู้ภัย Static Pods**: หาก Static Pod ของ Control Plane เช่น `kube-apiserver` ดับไป ให้ใช้ `crictl ps -a` หา Container ID แล้วใช้ `crictl logs <id>` ตรวจหาสาเหตุ\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* **ชุดคำสั่งเทียบเคียงที่ออกสอบ CKA บ่อยมาก**:\n  * ดูคอนเทนเนอร์ทั้งหมด (รวมที่ดับไปแล้ว): `crictl ps -a`\n  * ดูพอดแซนด์บ็อกซ์: `crictl pods`\n  * ดูบันทึกข้อผิดพลาด: `crictl logs <container-id>`\n  * ตรวจดูอิมเมจบนเครื่อง: `crictl images`\n  * รันคำสั่งในคอนเทนเนอร์: `crictl exec -it <container-id> sh`\n* **สูตรแก้โจทย์ CKA ยอดนิยม (API Server Crash Troubleshooting)**:\n  1. SSH เข้า Control Plane Node\n  2. ตรวจสอบสถานะ Kubelet: `systemctl status kubelet`\n  3. ตรวจดู Logs ของ API Server Container ด้วย `crictl ps -a | grep apiserver` แล้วตามด้วย `crictl logs <container-id>`\n  4. มักพบปัญหาพิมพ์ผิดใน Manifest ที่ `/etc/kubernetes/manifests/kube-apiserver.yaml`\n* **ข้อควรจำในห้องสอบ**: ปัจจุบัน Kubernetes เลิกใช้ Docker Shim แล้ว ห้ามพิมพ์คำสั่ง `docker ps` หรือ `docker logs` ในการสอบ CKA ให้ใช้ `crictl` เท่านั้น",
  "sections": [
    {
      "id": "crictl-architecture-and-purpose",
      "headingEn": "Why crictl? Architecture and CLI Comparison",
      "headingTh": "ทำไมต้องใช้ crictl? สถาปัตยกรรมและเปรียบเทียบคำสั่ง",
      "contentMarkdown": "### วิกฤตการณ์เมื่อ API Server หรือ Kubelet ล้มเหลว\n\nเมื่อโหนดในคลัสเตอร์หลุดจากการเชื่อมต่อ หรือ Control Plane Component (เช่น `kube-apiserver`, `etcd`) ไม่ทำงาน:\n* คำสั่ง `kubectl` จะไม่สามารถใช้งานได้ เพราะไม่มี API Server คอยตอบสนอง\n* คุณไม่สามารถใช้คำสั่ง `docker` ได้อีกต่อไป เนื่องจาก Kubernetes ได้ปลดระวาง Dockershim และเปลี่ยนมาใช้มาตรฐาน **CRI (Container Runtime Interface)** เช่น **containerd** หรือ **CRI-O**\n\n**`crictl`** คือเครื่องมือบรรทัดคำสั่งที่ถูกสร้างขึ้นโดยเฉพาะเพื่อการตรวจสอบและดีบักระบบรันไทม์ โดยจะสื่อสารโดยตรงกับ Container Runtime ผ่าน UNIX Domain Socket (gRPC) โดยไม่จำเป็นต้องพึ่งพา Kubernetes API Server เลยแม้แต่น้อย\n\n### ตารางเปรียบเทียบคำสั่ง: `docker` vs `crictl` vs `kubectl`\n\n| งานที่ต้องการทำ | คำสั่ง Docker เดิม | คำสั่ง crictl (ระดับ Node) | คำสั่ง kubectl (ระดับ Cluster) |\n|---|---|---|---|\n| ดูรายชื่อพอด | ไม่มี | `crictl pods` | `kubectl get pods` |\n| ดูคอนเทนเนอร์ | `docker ps -a` | `crictl ps -a` | `kubectl get pods -o wide` |\n| อ่าน Logs | `docker logs <id>` | `crictl logs <id>` | `kubectl logs <pod>` |\n| เปิด Shell | `docker exec -it` | `crictl exec -it` | `kubectl exec -it` |\n| ดูรายการ Images | `docker images` | `crictl images` | ไม่มี (ต้อง describe node) |\n| ดึง Image | `docker pull` | `crictl pull` | ไม่มี |",
      "codeBlocks": []
    },
    {
      "id": "configuring-crictl-socket",
      "headingEn": "Configuring the crictl Runtime Endpoint",
      "headingTh": "การตั้งค่า Socket Endpoint ของ crictl",
      "contentMarkdown": "ก่อนจะเริ่มใช้งาน `crictl` บนเครื่อง Worker Node หรือ Control Plane คุณต้องกำหนดค่าปลายทาง Socket ของ Container Runtime ที่ติดตั้งอยู่:\n\nไฟล์คอนฟิกมาตรฐานอยู่ที่: **`/etc/crictl.yaml`**\n\n### ตัวอย่างคอนฟิกสำหรับ containerd (มาตรฐานยอดนิยม):\n```yaml\nruntime-endpoint: \"unix:///run/containerd/containerd.sock\"\nimage-endpoint: \"unix:///run/containerd/containerd.sock\"\ntimeout: 10\ndebug: false\n```\n\n### ตัวอย่างคอนฟิกสำหรับ CRI-O:\n```yaml\nruntime-endpoint: \"unix:///var/run/crio/crio.sock\"\nimage-endpoint: \"unix:///var/run/crio/crio.sock\"\ntimeout: 10\ndebug: false\n```\n\n### ทดสอบการเชื่อมต่อ\n```bash\nsudo crictl info\n```\nหากคอนฟิกถูกต้อง คำสั่งจะแสดงข้อมูลสถาปัตยกรรมของ Container Runtime, ฟีเจอร์ที่เปิดใช้งาน, และเวอร์ชันของ CRI อย่างครบถ้วน",
      "codeBlocks": []
    },
    {
      "id": "inspecting-pods-and-containers",
      "headingEn": "Inspecting Pod Sandboxes and Containers",
      "headingTh": "การตรวจสอบ Pod Sandbox และ Containers บนเครื่อง",
      "contentMarkdown": "### 1. ดูรายชื่อพอดทั้งหมดที่รันอยู่บนโหนดนี้\n```bash\nsudo crictl pods\n```\nผลลัพธ์จะแสดง Pod ID, ชื่อพอด, Namespace, และสถานะ (`Ready` หรือ `NotReady`)\nสามารถกรองตามชื่อได้ เช่น:\n```bash\nsudo crictl pods --name kube-apiserver\n```\n\n### 2. ดูคอนเทนเนอร์ทั้งหมด (รวมตัวที่หยุดทำงานแล้ว)\n```bash\nsudo crictl ps -a\n```\nสังเกตคอลัมน์ `STATE` (`Running` หรือ `Exited`) หากคอนเทนเนอร์แครช คอลัมน์นี้จะระบุสาเหตุ\n\n### 3. อ่าน Logs ของคอนเทนเนอร์โดยตรงจากไฟล์บนดิสก์\nแม้ Kubelet จะดับ คุณก็สามารถอ่าน Logs ของคอนเทนเนอร์ได้โดยตรงผ่าน:\n```bash\nsudo crictl logs <container-id>\n```\n\n### 4. ตรวจสอบรายละเอียดเชิงลึกของคอนเทนเนอร์\n```bash\nsudo crictl inspect <container-id>\n```\nคำสั่งนี้จะแสดงรายละเอียดสถานะการ Exit, Linux cgroups, Mount points, และ Environment Variables ของคอนเทนเนอร์",
      "codeBlocks": []
    },
    {
      "id": "managing-container-images",
      "headingEn": "Managing Container Images on the Node",
      "headingTh": "การตรวจสอบและจัดการ Image แคชบนเครื่อง",
      "contentMarkdown": "### 1. ดูรายการ Image ทั้งหมดที่ถูกแคชไว้ในโหนด\n```bash\nsudo crictl images\n```\nผลลัพธ์จะแสดงชื่อ Repository, Tag, Image ID และขนาดของไฟล์บนดิสก์\n\n### 2. ดาวน์โหลด Image ล่วงหน้า (Pre-pulling Images)\nมีประโยชน์อย่างยิ่งในการเตรียม Node สำหรับแอปพลิเคชันขนาดใหญ่ หรือการเตรียม Control Plane Image ล่วงหน้า:\n```bash\nsudo crictl pull registry.k8s.io/kube-apiserver:v1.31.0\nsudo crictl pull registry.k8s.io/pause:3.9\n```\n\n### 3. การลบ Image ที่ไม่ใช้งานออกจากดิสก์\nหากดิสก์ของโหนดใกล้เต็ม (`DiskPressure`):\n```bash\nsudo crictl rmi <image-id>\n```",
      "codeBlocks": []
    },
    {
      "id": "troubleshooting-control-plane-failure",
      "headingEn": "Recovering Failed Control Plane Components (CKA Scenario)",
      "headingTh": "กรณีศึกษากู้ภัย: เมื่อ Control Plane Static Pods พัง (โจทย์สอบ CKA)",
      "contentMarkdown": "### ปัญหาโลกแตกในการสอบ CKA\nคุณ SSH เข้าเครื่อง Control Plane Node แล้วสั่ง `kubectl get nodes` แต่ระบบแจ้งเตือนว่า:\n`The connection to the server 192.168.1.10:6443 was refused - did you specify the right host or port?`\n\n### ขั้นตอนการกอบกู้ระบบด้วย crictl:\n1. **ตรวจสอบว่า Container Runtime ทำงานอยู่หรือไม่**:\n   ```bash\n   sudo systemctl status containerd\n   ```\n   หากหยุดทำงาน ให้สั่งสตาร์ต `sudo systemctl restart containerd`\n\n2. **ตรวจสอบสถานะของ Kubelet**:\n   ```bash\n   sudo systemctl status kubelet\n   sudo journalctl -u kubelet -n 50 -f\n   ```\n\n3. **ใช้ crictl ค้นหา Static Pods ที่ตาย**:\n   ```bash\n   sudo crictl ps -a | grep kube-apiserver\n   ```\n   หากเห็นคอนเทนเนอร์ของ API Server แครช ให้คัดลอก Container ID แล้วสั่งอ่าน Logs ทันที:\n   ```bash\n   sudo crictl logs <container-id>\n   ```\n   บ่อยครั้งจะพบข้อความฟ้องว่ามีไวยากรณ์ผิดพลาดในไฟล์ Manifest\n\n4. **แก้ไขไฟล์ Manifest ของ Static Pod**:\n   เปิดไฟล์ `/etc/kubernetes/manifests/kube-apiserver.yaml` แล้วแก้ไขจุดที่ผิดพลาด (เช่น พิมพ์ flag ผิด หรือระบุ path ใบรับรองผิด)\n   เมื่อบันทึกไฟล์ Kubelet จะตรวจพบการเปลี่ยนแปลงและสั่งสร้าง Static Pod ขึ้นมาใหม่โดยอัตโนมัติ!"
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
      "title": "Create Static Pods",
      "targetType": "tasks",
      "targetPageId": "pod-static-pods",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/"
    },
    {
      "title": "Operating etcd clusters (Backup & Restore)",
      "targetType": "tasks",
      "targetPageId": "admin-etcd-backup-restore",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/"
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
