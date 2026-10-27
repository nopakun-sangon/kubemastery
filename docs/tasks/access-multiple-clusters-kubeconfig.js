/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/
 */
(function (root) {
  const pageData = {
  "id": "access-multiple-clusters-kubeconfig",
  "categoryId": "access-applications",
  "categoryTitle": "Access Applications in a Cluster",
  "titleEn": "Configure Access to Multiple Clusters",
  "titleTh": "การตั้งค่าการเชื่อมต่อหลายคลัสเตอร์ (kubeconfig)",
  "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/",
  "docsPath": "/docs/tasks/access-application-cluster/configure-access-multiple-clusters/",
  "lead": "คู่มือการจัดระเบียบและสลับการเชื่อมต่อหลายคลัสเตอร์ Kubernetes ผ่านไฟล์คอนฟิก `kubeconfig` (`~/.kube/config`) พร้อมเทคนิคการจัดกลุ่ม Clusters, Users, Contexts, และการผสานรวมหลายไฟล์คอนฟิกด้วยตัวแปรสภาพแวดล้อม `KUBECONFIG` (หัวข้อสอบสำคัญใน CKA)",
  "sections": [
    {
      "id": "kubeconfig-anatomy-and-concepts",
      "headingEn": "kubeconfig Anatomy & Core Concepts",
      "headingTh": "โครงสร้าง 3 องค์ประกอบหลักของไฟล์ kubeconfig",
      "contentMarkdown": "### ไฟล์ kubeconfig คืออะไร?\n\nเมื่อคุณสั่งคำสั่ง `kubectl get pods` ตัวไคลเอนต์ kubectl จำเป็นต้องทราบว่า:\n* ต้องคุยกับคลัสเตอร์ไหน? (URL Endpoint และ CA Certificate)\n* จะพิสูจน์ตัวตนด้วยใคร? (Client Certificate, Token, หรือ User/Pass)\n* จะส่งคำสั่งเข้า Namespace ใดเป็นค่าเริ่มต้น?\n\nข้อมูลเหล่านี้ถูกบันทึกไว้ในรูปแบบ YAML ในไฟล์ที่เรียกว่า **kubeconfig** (ตำแหน่งดีฟอลต์อยู่ที่ `~/.kube/config`)\n\n### 3 องค์ประกอบหลักในโครงสร้าง kubeconfig\n1. **`clusters`**: ข้อมูลการเชื่อมต่อไปยัง Kubernetes API Server\n   * `server`: URL ของ Control Plane เช่น `https://192.168.1.10:6443`\n   * `certificate-authority-data`: ใบรับรอง CA ประจำคลัสเตอร์\n2. **`users`**: ข้อมูลรับรองตัวตน (Credentials) ของผู้ใช้งานหรือบอต\n   * เช่น `client-certificate-data`, `client-key-data` หรือ Bearer Token\n3. **`contexts`**: การผูก 3 สหายเข้าด้วยกัน (**Cluster + User + Default Namespace**)\n   * เพื่อความสะดวกในการสลับสภาพแวดล้อมทำงาน\n4. **`current-context`**: ตัวชี้ระบุว่าในขณะนี้ kubectl กำลังใช้ context ใดอยู่",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "kubeconfig-example.yaml",
          "code": "apiVersion: v1\nkind: Config\npreferences: {}\nclusters:\n- cluster:\n    certificate-authority: /etc/kubernetes/pki/ca.crt\n    server: https://192.168.1.50:6443\n  name: production-cluster\n- cluster:\n    insecure-skip-tls-verify: true\n    server: https://127.0.0.1:6443\n  name: development-cluster\nusers:\n- name: dev-admin\n  user:\n    client-certificate: /home/user/.kube/dev.crt\n    client-key: /home/user/.kube/dev.key\n- name: prod-admin\n  user:\n    token: eyJhbGciOiJSUzI1NiIs...\ncontexts:\n- context:\n    cluster: development-cluster\n    namespace: dev\n    user: dev-admin\n  name: dev-context\n- context:\n    cluster: production-cluster\n    namespace: default\n    user: prod-admin\n  name: prod-context\ncurrent-context: dev-context"
        }
      ]
    },
    {
      "id": "defining-clusters-users-contexts-cli",
      "headingEn": "Defining Clusters, Users, and Contexts via CLI",
      "headingTh": "การเพิ่ม Cluster, User และ Context ผ่านคำสั่ง kubectl config",
      "contentMarkdown": "แทนที่จะแก้ไขไฟล์ YAML ด้วย Text Editor ด้วยตนเอง (ซึ่งเสี่ยงต่อความผิดพลาดของ Indentation) คุณสามารถใช้ชุดคำสั่ง `kubectl config` จัดการได้อย่างปลอดภัย:\n\n### 1. เพิ่มหรืออัปเดตข้อมูล Cluster\n```bash\nkubectl config set-cluster staging-cluster \\\n  --server=https://staging.k8s.example.com:6443 \\\n  --certificate-authority=/path/to/staging-ca.crt \\\n  --embed-certs=true\n```\n\n### 2. เพิ่มหรืออัปเดตข้อมูล Credentials ของ User\n```bash\nkubectl config set-credentials staging-developer \\\n  --client-certificate=/path/to/dev.crt \\\n  --client-key=/path/to/dev.key \\\n  --embed-certs=true\n```\n*(แฟล็ก `--embed-certs=true` จะทำการอ่านเนื้อหาไฟล์ Certificate มาแปลงเป็น Base64 ฝังลงใน kubeconfig ทันที ทำให้สามารถย้ายไฟล์ config ไปใช้เครื่องอื่นได้สะดวก)*\n\n### 3. ประกาศสร้าง Context เพื่อจับคู่\n```bash\nkubectl config set-context staging-ctx \\\n  --cluster=staging-cluster \\\n  --user=staging-developer \\\n  --namespace=frontend\n```",
      "codeBlocks": []
    },
    {
      "id": "switching-and-managing-contexts",
      "headingEn": "Switching and Managing Contexts",
      "headingTh": "การตรวจสอบและการสลับ Context ในการทำงานจริง",
      "contentMarkdown": "### ดูรายชื่อ Contexts ทั้งหมดในเครื่อง\n```bash\nkubectl config get-contexts\n```\nผลลัพธ์จะแสดงตาราง และมีเครื่องหมายดอกจัน (`*`) อยู่หน้า Context ที่กำลังใช้งาน:\n```\nCURRENT   NAME          CLUSTER               AUTHINFO            NAMESPACE\n*         dev-context   development-cluster   dev-admin           dev\n          prod-context  production-cluster    prod-admin          default\n          staging-ctx   staging-cluster       staging-developer   frontend\n```\n\n### สลับไปยัง Context อื่น\n```bash\nkubectl config use-context prod-context\n```\nคำสั่งนี้จะเปลี่ยนฟิลด์ `current-context` และหลังจากนี้ทุกคำสั่ง `kubectl` จะถูกส่งตรงไปยัง `production-cluster` ทันที\n\n### เปลี่ยน Default Namespace ของ Context ปัจจุบัน\nหากเบื่อที่จะต้องพิมพ์ `-n <namespace>` ทุกครั้ง:\n```bash\nkubectl config set-context --current --namespace=kube-system\n```\nหลังจากนี้คำสั่ง `kubectl get pods` จะแสดงพอดใน `kube-system` เสมอ\n\n### การลบ Context หรือ Cluster เก่า\n```bash\nkubectl config delete-context dev-context\nkubectl config delete-cluster development-cluster\n```",
      "codeBlocks": []
    },
    {
      "id": "merging-multiple-kubeconfig-files",
      "headingEn": "Merging Multiple kubeconfig Files via KUBECONFIG Env",
      "headingTh": "การรวมไฟล์ kubeconfig หลายไฟล์ด้วยตัวแปร KUBECONFIG",
      "contentMarkdown": "ในสภาพแวดล้อมจริง คุณอาจได้รับไฟล์ config แยกจากหลาย Cloud Providers เช่น ไฟล์ `eks.yaml`, `gke.yaml`, และ `onprem.yaml`\n\n### 1. โหลดหลายไฟล์พร้อมกันด้วยตัวแปรสภาพแวดล้อม\nคุณสามารถคั่นพาธของแต่ละไฟล์ด้วยเครื่องหมายโคลอน (`:`):\n```bash\nexport KUBECONFIG=~/.kube/config:/path/to/eks.yaml:/path/to/gke.yaml\n```\nคำสั่ง `kubectl` จะทำการผสานข้อมูล (Merge) ของทุกไฟล์ในหน่วยความจำชั่วคราวทันที\n\n### 2. บันทึกผลการผสานรวมเป็นไฟล์เดียวถาวร (Flatten)\nสั่งรวมข้อมูลทั้งหมดและเขียนทับลงไฟล์หลัก:\n```bash\nkubectl config view --flatten > ~/.kube/config.new\nmv ~/.kube/config.new ~/.kube/config\nchmod 600 ~/.kube/config\n```\n\n> [!CAUTION]\n> **กำหนดสิทธิ์ความปลอดภัยให้ไฟล์เสมอ (`chmod 600`)**:\n> เนื่องจากไฟล์ `kubeconfig` บรรจุ Client Private Keys และ Token สิทธิ์สูง ควรกำหนดสิทธิ์อ่านเขียนเฉพาะเจ้าของเท่านั้น:\n> `chmod 600 ~/.kube/config`",
      "codeBlocks": []
    },
    {
      "id": "security-auditing-and-best-practices",
      "headingEn": "Security, Auditing, and CKA Exam Tips",
      "headingTh": "แนวทางปฏิบัติเพื่อความปลอดภัยและเคล็ดลับการสอบ CKA",
      "contentMarkdown": "### เคล็ดลับการตรวจสอบสิทธิ์ตนเอง (Self-Subject Review)\nเมื่อสลับ Context เข้าสู่คลัสเตอร์ใหม่ คุณสามารถตรวจสอบได้ทันทีว่า User ใน Context นั้นมีสิทธิ์ทำอะไรได้บ้าง:\n```bash\nkubectl auth can-i create deployments\nkubectl auth can-i delete pods -n kube-system\n```\n\n### เคล็ดลับในห้องสอบ CKA/CKAD\n* ในการสอบ CKA คุณจะต้องสลับ Context บ่อยครั้งก่อนลงมือทำโจทย์แต่ละข้อ โดยโจทย์จะระบุคำสั่งมาให้ชัดเจน เช่น `kubectl config use-context k8s`\n* **กฎเหล็ก**: ตรวจสอบ Context เสมอด้วย `kubectl config current-context` ก่อนสั่งลบหรือแก้ไขทรัพยากร เพื่อป้องกันการทำลายคลัสเตอร์ผิดข้อ!\n* ในการทำงานจริง แนะนำให้ติดตั้งเครื่องมือช่วยอย่าง **`kubectx`** และ **`kubens`** หรือตั้งค่า Shell Prompt (เช่น Starship หรือ kube-ps1) ให้แสดงชื่อ Context และ Namespace ปัจจุบันบน Terminal ตลอดเวลา"
    }
  ],
  "relatedLinks": [
    {
      "title": "Install and Set Up kubectl on Linux",
      "targetType": "tasks",
      "targetPageId": "tools-install-kubectl",
      "officialUrl": "https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/"
    },
    {
      "title": "Configure Service Accounts for Pods",
      "targetType": "tasks",
      "targetPageId": "pod-configure-service-account",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/"
    },
    {
      "title": "Troubleshooting Clusters with crictl",
      "targetType": "tasks",
      "targetPageId": "debug-cluster-crictl",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/"
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
