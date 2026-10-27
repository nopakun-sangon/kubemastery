/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/
 */
(function (root) {
  const pageData = {
  "id": "tools-install-kubectl",
  "categoryId": "tools",
  "categoryTitle": "Install Tools",
  "titleEn": "Install and Set Up kubectl on Linux",
  "titleTh": "การติดตั้งและตั้งค่า kubectl บนระบบ Linux",
  "officialUrl": "https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/",
  "docsPath": "/docs/tasks/tools/install-kubectl-linux/",
  "lead": "เครื่องมือ Command-line ของ Kubernetes คือ kubectl ช่วยให้คุณสั่งการคลัสเตอร์ ค้นหา ตรวจสอบ และจัดการทรัพยากรทั้งหมดใน Kubernetes ผ่านทาง Kubernetes API server ได้อย่างครบถ้วน",
  "sections": [
    {
      "id": "before-you-begin",
      "headingEn": "Before you begin & Version Skew Policy",
      "headingTh": "ข้อกำหนดเบื้องต้นและนโยบายความเข้ากันได้ของเวอร์ชัน (Version Skew Policy)",
      "contentMarkdown": "ก่อนเริ่มต้นติดตั้ง `kubectl` สิ่งสำคัญอย่างยิ่งที่ต้องทำความเข้าใจคือ **นโยบายความเข้ากันได้ของเวอร์ชัน (Version Skew Policy)** ของ Kubernetes:\n\n* คุณต้องใช้เวอร์ชันของ `kubectl` ที่มีความต่างจากเวอร์ชันของ Control Plane (API Server) ไม่เกินหนึ่งระดับ Minor Version (ความต่างไม่เกิน +/- 1 version)\n* ตัวอย่างเช่น หากคลัสเตอร์ของคุณทำงานที่เวอร์ชัน **v1.30** ไคลเอนต์ `kubectl` จะสามารถทำงานร่วมกันได้อย่างถูกต้องตั้งแต่เวอร์ชัน **v1.29**, **v1.30** จนถึง **v1.31**\n* การใช้เวอร์ชันที่ห่างกันเกินไปอาจทำให้คำสั่งบางอย่างไม่รองรับ หรือโครงสร้างข้อมูล Serialization ผิดพลาดจนเกิดพฤติกรรมที่ไม่คาดคิด\n\n> ข้อควรระวัง: ตรวจสอบเวอร์ชันของคลัสเตอร์เป้าหมายก่อนทำการติดตั้งหรืออัปเดตเครื่องมือ kubectl เสมอ เพื่อป้องกันข้อผิดพลาดจาก API deprecation",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "check-version.sh",
          "code": "# ตรวจสอบเวอร์ชันของ kubectl ไคลเอนต์ปัจจุบัน\nkubectl version --client --output=yaml"
        }
      ]
    },
    {
      "id": "install-binary-curl",
      "headingEn": "Install kubectl binary with curl on Linux",
      "headingTh": "การดาวน์โหลดและติดตั้งไบนารี kubectl ด้วย curl",
      "contentMarkdown": "การติดตั้งด้วยการดาวน์โหลด Binary โดยตรงเป็นวิธีที่นิยมที่สุด เนื่องจากไม่ต้องพึ่งพา Package Manager ของระบบปฏิบัติการ และสามารถเลือกดาวน์โหลดเวอร์ชันที่ต้องการได้อย่างแม่นยำ\n\nขั้นตอนปฏิบัติมีดังนี้:\n\n1. **ดาวน์โหลดไบนารีเวอร์ชันล่าสุด** สำหรับสถาปัตยกรรม x86-64 (amd64) หรือ ARM64:\n   ใช้คำสั่ง `curl` ดึงไฟล์ไบนารีพร้อมดึงเวอร์ชันเสถียรล่าสุดผ่าน `stable.txt`\n\n2. **ตรวจสอบความถูกต้องด้วย Checksum (SHA-256)**:\n   ดาวน์โหลดไฟล์ `.sha256` ที่ตรงกับเวอร์ชัน และตรวจสอบค่า hash ด้วยคำสั่ง `sha256sum --check` เพื่อให้มั่นใจว่าไฟล์ไบนารีไม่ได้ถูกดัดแปลงหรือดาวน์โหลดเสียหายระหว่างทาง\n\n3. **ติดตั้งไบนารีเข้าสู่ System PATH**:\n   ใช้คำสั่ง `install` เพื่อคัดลอกไฟล์ไปยัง `/usr/local/bin/kubectl` พร้อมกำหนดสิทธิ์ความเป็นเจ้าของเป็น `root:root` และ permission `0755`\n\n4. **ทดสอบการทำงาน**:\n   รันคำสั่ง `kubectl version --client` เพื่อยืนยันว่าการติดตั้งสมบูรณ์",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "install-kubectl-curl.sh",
          "code": "# 1. ดาวน์โหลดไบนารีเวอร์ชันล่าสุด (x86_64)\ncurl -LO \"https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl\"\n\n# 2. ดาวน์โหลดไฟล์ checksum\ncurl -LO \"https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256\"\n\n# ตรวจสอบความถูกต้องของไฟล์ (ต้องขึ้น kubectl: OK)\necho \"$(cat kubectl.sha256)  kubectl\" | sha256sum --check\n\n# 3. ติดตั้งไบนารีลงใน /usr/local/bin\nsudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl\n\n# ลบไฟล์ติดตั้งที่ใช้แล้ว\nrm kubectl kubectl.sha256\n\n# 4. ทดสอบเวอร์ชัน\nkubectl version --client"
        }
      ]
    },
    {
      "id": "install-native-package",
      "headingEn": "Install using native package management (apt and yum/dnf)",
      "headingTh": "การติดตั้งผ่าน Package Manager ของระบบ (APT และ YUM/DNF)",
      "contentMarkdown": "หากคุณต้องการบริหารจัดการแพ็กเกจผ่านระบบปฏิบัติการโดยตรง เช่น Ubuntu, Debian, Red Hat Enterprise Linux หรือ CentOS คุณสามารถเพิ่ม Official Community Repository ของ Kubernetes (`pkgs.k8s.io`) ได้ดังนี้:\n\n### สำหรับระบบตระกูล Debian / Ubuntu (APT)\n* ต้องดาวน์โหลด Public Signing Key ของ Kubernetes จาก Google Cloud Storage\n* สร้างไฟล์ repository source list ใน `/etc/apt/sources.list.d/kubernetes.list`\n* สั่ง `apt-get update` และติดตั้ง `kubectl`\n* แนะนำให้ใช้คำสั่ง `apt-mark hold kubectl` เพื่อป้องกันไม่ให้ระบบอัปเกรดเวอร์ชันอัตโนมัติจนกระทบกับ Version Skew Policy\n\n### สำหรับระบบตระกูล RHEL / CentOS / Fedora (DNF/YUM)\n* เพิ่ม repo config ใน `/etc/yum.repos.d/kubernetes.repo` พร้อมเปิดการตรวจสอบ GPG key และติดตั้งแพ็กเกจ",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "install-apt.sh",
          "code": "# สำหรับ Debian / Ubuntu\nsudo apt-get update\nsudo apt-get install -y apt-transport-https ca-certificates curl gnupg\n\n# ดาวน์โหลด signing key\ncurl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg\nsudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg\n\n# เพิ่ม repository\necho 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list\nsudo chmod 644 /etc/apt/sources.list.d/kubernetes.list\n\n# อัปเดตและติดตั้ง\nsudo apt-get update\nsudo apt-get install -y kubectl\nsudo apt-mark hold kubectl"
        },
        {
          "lang": "bash",
          "label": "install-yum.sh",
          "code": "# สำหรับ Red Hat / CentOS / AlmaLinux / Rocky\ncat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo\n[kubernetes]\nname=Kubernetes\nbaseurl=https://pkgs.k8s.io/core:/stable:/v1.30/rpm/\nenabled=1\ngpgcheck=1\ngpgkey=https://pkgs.k8s.io/core:/stable:/v1.30/rpm/repodata/repomd.xml.key\nEOF\n\nsudo yum install -y kubectl"
        }
      ]
    },
    {
      "id": "verify-and-configure",
      "headingEn": "Verify kubectl configuration and cluster connectivity",
      "headingTh": "การตรวจสอบการตั้งค่าและการเชื่อมต่อไปยังคลัสเตอร์",
      "contentMarkdown": "เพื่อให้ `kubectl` สามารถค้นหาและเข้าถึงคลัสเตอร์ Kubernetes ได้ จำเป็นต้องมีไฟล์คอนฟิกูเรชันที่เรียกว่า **kubeconfig** ซึ่งโดยค่าเริ่มต้นจะถูกค้นหาที่ตำแหน่ง `~/.kube/config`\n\n* ตรวจสอบว่าไฟล์คอนฟิกมีอยู่และระบุคลัสเตอร์ถูกต้องหรือไม่ด้วย `kubectl config view`\n* ทดสอบการเข้าถึง API Server ด้วยคำสั่ง `kubectl cluster-info`\n* หากระบบแสดงข้อความ `The connection to the server <ip>:6443 was refused` แสดงว่ายังไม่มีไฟล์ kubeconfig หรือพอร์ต API server ยังไม่เปิดให้บริการ\n* หากต้องการระบุไฟล์คอนฟิกเฉพาะ ให้ใช้ flag `--kubeconfig` หรือกำหนด Environment Variable `export KUBECONFIG=/path/to/custom/kubeconfig`",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "verify-connectivity.sh",
          "code": "# ตรวจสอบการเชื่อมต่อ API Server\nkubectl cluster-info\n\n# ดูคอนฟิกูเรชันปัจจุบัน (Context, Cluster, User)\nkubectl config view\n\n# ตรวจสอบรายชื่อโหนดในคลัสเตอร์\nkubectl get nodes -o wide"
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Enable Shell Autocompletion",
      "targetType": "tasks",
      "targetPageId": "tools-shell-autocompletion",
      "officialUrl": "https://kubernetes.io/docs/tasks/tools/included/optional-kubectl-configs-bash-linux/"
    },
    {
      "title": "Configure Access to Multiple Clusters",
      "targetType": "tasks",
      "targetPageId": "access-multiple-clusters-kubeconfig",
      "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/"
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
