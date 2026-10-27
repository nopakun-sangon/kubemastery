/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/
 */
(function (root) {
  const pageData = {
  "id": "debug-dns-resolution",
  "categoryId": "administer-cluster",
  "categoryTitle": "Administer a Cluster",
  "titleEn": "Debugging DNS Resolution",
  "titleTh": "การตรวจสอบและแก้ปัญหาระบบ DNS ภายในคลัสเตอร์",
  "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/",
  "docsPath": "/docs/tasks/administer-cluster/dns-debugging-resolution/",
  "diagram": {
    "src": "images/docs/services-routing-overview.svg",
    "caption": "การค้นหาชื่อบริการผ่าน CoreDNS และเส้นทางการส่งคำขอ DNS จาก Pod"
  },
  "lead": "ขั้นตอนการตรวจวินิจฉัยและแก้ไขปัญหาความล้มเหลวในการค้นหาชื่อโดเมน (DNS Resolution Failures) ภายในคลัสเตอร์ Kubernetes ผ่าน CoreDNS, การตรวจสอบไฟล์ `/etc/resolv.conf`, และการทดสอบ Query ด้วยเครื่องมือ dig/nslookup",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nCoreDNS คือบริการค้นหาชื่อโดเมนหลักของ Kubernetes ที่แปลงชื่อ Service ให้เป็น ClusterIP แบบไดนามิก การวิเคราะห์ปัญหา DNS ทำได้โดยไล่ตรวจ 3 จุด: คอนฟิก `/etc/resolv.conf` ภายในพอด, ความพร้อมของ Service/Endpoints `kube-dns`, และสถานะการทำงานรวมถึง Logs ของ CoreDNS Pods\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **โครงสร้าง FQDN**: `<service-name>.<namespace>.svc.cluster.local`\n* **ไฟล์ `/etc/resolv.conf` ภายใน Pod**:\n  - `nameserver`: ต้องชี้ไปยัง IP ของ Service `kube-dns` (เช่น `10.96.0.10`)\n  - `search`: ลำดับค้นหาโดเมนเริ่มต้น เช่น `<ns>.svc.cluster.local`, `svc.cluster.local`, `cluster.local`\n  - `options ndots:5`: ช่วยให้ค้นหาชื่อแบบสั้นได้โดยไม่ต้องพิมพ์ FQDN เต็ม\n* **สาเหตุปัญหา DNS ที่พบบ่อย**:\n  - CoreDNS Pod อยู่ในสถานะ CrashLoopBackOff จาก DNS Loop (`plugin/loop: Loop detected`) เมื่อโหนดใช้ `systemd-resolved`\n  - CNI Plugin ทำงานผิดพลาดจน CoreDNS Pod ค้างสถานะ Pending\n  - ขาด Endpoints ใน Service `kube-dns` (`kubectl get ep kube-dns -n kube-system`)\n  - ถูกบล็อกโดย NetworkPolicy Egress พอร์ต 53\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* สเต็ปคำสั่งไล่เช็คในห้องสอบ CKA:\n  ```bash\n  # 1. เช็ค CoreDNS Pods และ Logs\n  kubectl get pods -n kube-system -l k8s-app=kube-dns\n  kubectl logs -n kube-system -l k8s-app=kube-dns\n\n  # 2. เช็ค CoreDNS Service & Endpoints\n  kubectl get svc,ep kube-dns -n kube-system\n\n  # 3. รันทดสอบ DNS Query จาก Busybox Pod\n  kubectl run dns-test --rm -it --image=busybox:1.28 --restart=Never -- nslookup kubernetes.default\n  ```\n* หาก CoreDNS แครชด้วย Loop ให้แก้ไข ConfigMap `coredns` ใน `kube-system` โดยเปลี่ยน forward upstream จาก `/etc/resolv.conf` เป็น `8.8.8.8` หรือ IP สาธารณะ",
  "sections": [
    {
      "id": "kubernetes-dns-architecture",
      "headingEn": "Kubernetes DNS Architecture & CoreDNS Overview",
      "headingTh": "สถาปัตยกรรม DNS ภายในคลัสเตอร์ และ CoreDNS",
      "contentMarkdown": "### สถาปัตยกรรม DNS ของ Kubernetes\n\nในคลัสเตอร์ Kubernetes เซอร์วิสแทบทุกตัวสื่อสารหากันผ่าน **ชื่อโดเมน (DNS Naming Service)** แทนที่จะจำหมายเลข IP ชั่วคราว โดยระบบ DNS หลักของคลัสเตอร์คือ **CoreDNS** ซึ่งติดตั้งอยู่ใน Namespace `kube-system`\n\n### โครงสร้างชื่อโดเมนมาตรฐาน (FQDN)\nเซอร์วิสทุกตัวจะได้รับชื่อโดเมนที่มีโครงสร้างแน่นอน:\n```\n<service-name>.<namespace>.svc.<cluster-domain>\n```\n*ตัวอย่าง:* เซอร์วิสชื่อ `my-db` ในเนมสเปซ `production` จะมี FQDN คือ `my-db.production.svc.cluster.local`\n* หากเรียกจากพอดในเนมสเปซเดียวกัน สามารถย่อเหลือเพียง `my-db`\n* หากเรียกข้ามเนมสเปซ สามารถเรียก `my-db.production`\n\n### บทบาทของ Kubelet และ `/etc/resolv.conf`\nเมื่อสร้างพอด Kubelet จะทำการตั้งค่าเครือข่ายของคอนเทนเนอร์โดยอัตโนมัติ โดยเขียนไฟล์ `/etc/resolv.conf` ให้ชี้ไปยังไอพีของ Service **`kube-dns`** ในเนมสเปซ `kube-system` เพื่อให้คำขอ DNS ทุกครั้งถูกส่งไปถาม CoreDNS",
      "codeBlocks": []
    },
    {
      "id": "step1-testing-dns-from-pod",
      "headingEn": "Step 1: Testing DNS Resolution from Inside a Pod",
      "headingTh": "ขั้นตอนที่ 1: การทดสอบ Query ค้นหาชื่อจากภายใน Pod",
      "contentMarkdown": "เครื่องมือที่ดีที่สุดในการทดสอบระบบ DNS คือการรันพอดที่มีชุดเครื่องมือ `dnsutils` (เช่น `nslookup`, `dig`):\n\n### สั่งสร้างพอดทดสอบ\n```bash\nkubectl apply -f https://k8s.io/examples/admin/dns/dnsutils.yaml\n```\nตรวจสอบว่าพอดรันสำเร็จ:\n```bash\nkubectl get pods dnsutils\n```\n\n### ทดสอบค้นหาชื่อเซอร์วิสภายในคลัสเตอร์\nยิงคำขอค้นหาเซอร์วิสแกนกลาง `kubernetes.default`:\n```bash\nkubectl exec -i -t dnsutils -- nslookup kubernetes.default\n```\n**ผลลัพธ์ที่ถูกต้องควรได้คำตอบเป็น ClusterIP ของ API Server:**\n```\nServer:    10.96.0.10\nAddress:   10.96.0.10#53\n\nName:      kubernetes.default.svc.cluster.local\nAddress:   10.96.0.1\n```\n\n### ทดสอบค้นหาชื่อโดเมนภายนอกอินเทอร์เน็ต\n```bash\nkubectl exec -i -t dnsutils -- nslookup google.com\n```\nหากค้นหาชื่อภายนอกไม่ผ่าน แต่ภายในผ่าน แสดงว่า CoreDNS มีปัญหาในการส่งต่อ (Upstream Forwarding) ไปยัง DNS Server ภายนอกของโหนด",
      "codeBlocks": []
    },
    {
      "id": "step2-inspecting-resolv-conf",
      "headingEn": "Step 2: Inspecting /etc/resolv.conf Configuration",
      "headingTh": "ขั้นตอนที่ 2: การตรวจสอบคอนฟิก /etc/resolv.conf ของพอด",
      "contentMarkdown": "เปิดอ่านไฟล์คอนฟิกเครือข่ายภายในพอด:\n```bash\nkubectl exec -ti dnsutils -- cat /etc/resolv.conf\n```\n\nผลลัพธ์มาตรฐานควรมีโครงสร้างดังนี้:\n```\nnameserver 10.96.0.10\nsearch default.svc.cluster.local svc.cluster.local cluster.local\noptions ndots:5\n```\n\n### ความหมายของค่าคอนฟิกแต่ละบรรทัด:\n* **`nameserver 10.96.0.10`**: ที่อยู่ IP ของ `kube-dns` Service (ต้องตรงกับผลลัพธ์ของคำสั่ง `kubectl get svc -n kube-system kube-dns`)\n* **`search ...`**: ลำดับโดเมนที่จะถูกนำมาต่อท้ายอัตโนมัติหากชื่อที่เรียกไม่มีเครื่องหมายจุดสมบูรณ์\n* **`options ndots:5`**: กลไกสำคัญของ Kubernetes! หากชื่อที่เรียกมีจุด (`.`) น้อยกว่า 5 จุด ระบบจะทำการเติม search domains ตามลำดับก่อนเสมอ จึงทำให้สามารถเรียกชื่อสั้นอย่าง `my-service` หรือ `my-service.default` ได้โดยตรง",
      "codeBlocks": []
    },
    {
      "id": "step3-inspecting-coredns-health",
      "headingEn": "Step 3: Verifying CoreDNS Health and Endpoints",
      "headingTh": "ขั้นตอนที่ 3: ตรวจสอบความสมบูรณ์ของ CoreDNS Pods & Services",
      "contentMarkdown": "หากพอดไม่สามารถค้นหาชื่อได้ ปัญหามักเกิดจากตัว CoreDNS เอง:\n\n### 1. ตรวจสอบว่า CoreDNS Pods รันอยู่ครบถ้วน\n```bash\nkubectl get pods -n kube-system -l k8s-app=kube-dns\n```\nทั้งสองพอดต้องอยู่ในสถานะ `Running (1/1)` หากขึ้น `CrashLoopBackOff` ให้ดูข้อผิดพลาดในสเต็ปถัดไป\n\n### 2. ตรวจสอบว่า CoreDNS Service มี Endpoints ถูกต้อง\n```bash\nkubectl get endpoints kube-dns -n kube-system\n```\nคอลัมน์ `ENDPOINTS` ต้องแสดงหมายเลข IP ของพอด CoreDNS ทั้งหมด หากขึ้น `<none>` ให้ตรวจสอบว่า Selector ของ Service `kube-dns` แมตช์กับ Labels ของพอดหรือไม่\n\n### 3. อ่าน Logs การทำงานของ CoreDNS\n```bash\nkubectl logs -n kube-system -l k8s-app=kube-dns\n```\nมองหาข้อความ Error หรือ Warning ใน Logs เพื่อหาสาเหตุที่แท้จริง",
      "codeBlocks": []
    },
    {
      "id": "common-causes-and-remediations",
      "headingEn": "Common Root Causes & Emergency Remediations",
      "headingTh": "สาเหตุความผิดพลาดยอดนิยมและวิธีแก้ไขฉุกเฉิน",
      "contentMarkdown": "### 1. ปัญหาลูปวนไม่รู้จบ (Loop Detection in CoreDNS)\n* *อาการ*: CoreDNS Pod แครชและมี Logs ฟ้องว่า: `plugin/loop: Loop (127.0.0.1:xxxx -> :53) detected`\n* *สาเหตุ*: ระบบปฏิบัติการ Linux ของโหนดใช้ `systemd-resolved` และไฟล์ `/etc/resolv.conf` ของโหนดชี้ไปที่ `127.0.0.53` เมื่อ CoreDNS สืบทอดคอนฟิกนี้มา จึงส่ง Forward หาตัวเองจนเกิดลูป\n* *วิธีแก้*: ปรับคอนฟิก Kubelet ให้อ้างอิงไฟล์ upstream resolv.conf ที่แท้จริง (เช่น `/run/systemd/resolve/resolv.conf`) ด้วยแฟล็ก `--resolv-conf`\n\n### 2. นโยบายความปลอดภัย NetworkPolicy ปิดกั้นพอร์ต 53\n* *อาการ*: พอดไม่สามารถเชื่อมต่อ DNS ได้เลยหลังจากเปิดใช้นโยบาย NetworkPolicy\n* *วิธีแก้*: เพิ่มกฎ Allow Egress พอร์ต 53 ทั้งโพรโทคอล UDP และ TCP ไปยัง Namespace `kube-system`\n\n### 3. CoreDNS หน่วยความจำไม่พอ (OOMKilled)\nในคลัสเตอร์ขนาดใหญ่ที่มีคำขอ Query สูงมาก CoreDNS อาจกินแรมเกิน Limit ที่ตั้งไว้ (ดีฟอลต์มักให้เพียง 170Mi)\n* *วิธีแก้*: ขยาย Memory Limits ของ CoreDNS Deployment หรือติดตั้ง **NodeLocal DNSCache** เพื่อทำ DNS Caching ในระดับโหนด ลดโหลดที่ส่งไปยัง CoreDNS",
      "codeBlocks": []
    }
  ],
  "relatedLinks": [
    {
      "title": "Declare Network Policy",
      "targetType": "tasks",
      "targetPageId": "access-declare-network-policy",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/"
    },
    {
      "title": "Debug Pods and Services",
      "targetType": "tasks",
      "targetPageId": "debug-pods-services",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/"
    },
    {
      "title": "Use Port Forwarding & Services to Access Applications",
      "targetType": "tasks",
      "targetPageId": "access-port-forward-services",
      "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/"
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
