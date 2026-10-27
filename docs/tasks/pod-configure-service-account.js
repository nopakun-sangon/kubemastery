/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/
 */
(function (root) {
  const pageData = {
  "id": "pod-configure-service-account",
  "categoryId": "configure-pods",
  "categoryTitle": "Configure Pods and Containers",
  "titleEn": "Configure Service Accounts for Pods",
  "titleTh": "การตั้งค่าและผูก Service Accounts ให้กับพอด",
  "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/",
  "docsPath": "/docs/tasks/configure-pod-container/configure-service-account/",
  "lead": "ServiceAccount คือตัวตนประจำตัว (Identity) ของกระบวนการที่รันอยู่ภายในพอด เพื่อใช้ยืนยันตัวตน (Authentication) และขอรับสิทธิ์ตามนโยบาย Role-Based Access Control (RBAC) ในการติดต่อสื่อสารกับ Kubernetes API Server",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\n`ServiceAccount` คือตัวตนประจำตัว (Identity) ของแอปพลิเคชันหรือ Process ที่ทำงานภายในพอด เพื่อใช้ยืนยันตัวตน (Authentication) และขอรับสิทธิ์ตามนโยบาย Role-Based Access Control (RBAC) ในการติดต่อสื่อสารและสั่งการ Kubernetes API Server\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **พฤติกรรมเริ่มต้น**: หากไม่ได้ระบุ พอดจะถูกผูกเข้ากับ ServiceAccount ชื่อ `default` ประจำเนมสเปซนั้นๆ โดยอัตโนมัติ\n* **การระบุให้พอดใช้งาน**: กำหนดผ่านฟิลด์ `spec.serviceAccountName: <sa-name>` ที่ระดับ Pod Spec (ไม่ใช่ในคอนเทนเนอร์)\n* **ไดเรกทอรีจัดเก็บ Token**: Kubernetes จะทำการ Projected Volume เมานต์โทเคนไว้ที่ `/var/run/secrets/kubernetes.io/serviceaccount/token` ภายในคอนเทนเนอร์\n* **ความปลอดภัย (Least Privilege)**: สำหรับ Pod เว็บเซิร์ฟเวอร์หรือแอปทั่วไปที่ไม่จำเป็นต้องคุยกับ API Server ควรกำหนด `automountServiceAccountToken: false` เสมอ เพื่อป้องกัน Token รั่วไหล\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* คำสั่งสร้าง ServiceAccount อย่างรวดเร็ว:\n  ```bash\n  kubectl create sa my-service-account -n <namespace>\n  ```\n* การผูกใน YAML:\n  ```yaml\n  apiVersion: v1\n  kind: Pod\n  metadata:\n    name: app-pod\n  spec:\n    serviceAccountName: my-service-account\n    automountServiceAccountToken: false # หากไม่ต้องการให้ mount token\n    containers:\n    - name: nginx\n      image: nginx\n  ```\n* ข้อควรระวัง: `serviceAccountName` ของ Pod ที่กำลังรันอยู่ไม่สามารถแก้ไขได้โดยตรง หากต้องการเปลี่ยนต้องลบ Pod สร้างใหม่ หรือแก้ผ่าน Deployment template",
  "sections": [
    {
      "id": "serviceaccount-concepts",
      "headingEn": "ServiceAccount Concepts vs User Accounts",
      "headingTh": "แนวคิด ServiceAccount และความแตกต่างจาก User Account",
      "contentMarkdown": "ใน Kubernetes มีการแยกแยะตัวตนของผู้ใช้งานออกเป็น 2 ประเภทหลัก:\n\n* **User Account (ผู้ใช้งานที่เป็นมนุษย์)**: เช่น นักพัฒนา หรือ ผู้ดูแลระบบ จัดการผ่านระบบยืนยันตัวตนภายนอก เช่น Active Directory, LDAP, Google Workspace หรือ TLS Certificates\n* **ServiceAccount (กระบวนการหรือแอปพลิเคชัน)**: เป็นออบเจกต์ที่อยู่ภายในคลัสเตอร์ Kubernetes และผูกอยู่กับเนมสเปซเฉพาะ ใช้สำหรับให้โปรแกรมภายในพอดสามารถส่งคำขอไปยัง kube-apiserver ได้อย่างถูกต้องตามสิทธิ์\n\n> หมายเหตุ: ทุกเนมสเปซจะมี ServiceAccount ชื่อ `default` อยู่เสมอ หากพอดไม่ได้ระบุค่าใดๆ พอดจะถูกผูกกับ `default` ServiceAccount นี้โดยอัตโนมัติ ซึ่งตามแนวปฏิบัติที่ดีด้านความมั่นคงปลอดภัย ควรสร้าง ServiceAccount เฉพาะพร้อมจำกัดสิทธิ์ RBAC ตามหลัก Least Privilege",
      "codeBlocks": []
    },
    {
      "id": "create-custom-serviceaccount",
      "headingEn": "Creating a Custom ServiceAccount",
      "headingTh": "การสร้าง Custom ServiceAccount",
      "contentMarkdown": "คุณสามารถสร้าง ServiceAccount ได้อย่างง่ายดายผ่านคำสั่ง `kubectl create serviceaccount` หรือสร้างผ่านไฟล์ YAML manifest",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "service-account.yaml",
          "code": "apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: build-robot\n  namespace: default"
        },
        {
          "lang": "bash",
          "label": "create-sa.sh",
          "code": "# สร้าง ServiceAccount ผ่าน CLI\nkubectl create serviceaccount build-robot\n\n# ดูรายละเอียดของ ServiceAccount ที่สร้างขึ้น\nkubectl describe serviceaccount build-robot"
        }
      ]
    },
    {
      "id": "assign-sa-to-pod",
      "headingEn": "Assigning a ServiceAccount to a Pod",
      "headingTh": "การผูก ServiceAccount เข้ากับ Pod Specification",
      "contentMarkdown": "การกำหนดให้พอดใช้งาน ServiceAccount ทำได้โดยระบุชื่อในฟิลด์ `serviceAccountName` (หรือ `serviceAccount` ในเวอร์ชันเก่า) ในระดับ `spec` ของพอด",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "pod-with-sa.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: build-robot-pod\nspec:\n  serviceAccountName: build-robot\n  containers:\n  - name: robot-ctr\n    image: curlimages/curl\n    command: [\"sleep\", \"3600\"]"
        },
        {
          "lang": "bash",
          "label": "apply-and-verify-sa.sh",
          "code": "# สร้างพอดและตรวจสอบ ServiceAccount ที่ผูกไว้\nkubectl apply -f pod-with-sa.yaml\n\n# ตรวจสอบว่าพอดถือโทเค็นของ ServiceAccount build-robot จริงหรือไม่\nkubectl exec -it build-robot-pod -- cat /var/run/secrets/kubernetes.io/serviceaccount/namespace"
        }
      ]
    },
    {
      "id": "token-projection-security",
      "headingEn": "Token Projection and Opting Out of API Token Mounting",
      "headingTh": "ระบบ Projected Token และการปิดกั้นไม่ให้เมานต์ API Token",
      "contentMarkdown": "ตามค่าเริ่มต้น Kubernetes จะทำการเมานต์ ServiceAccount Token เข้าสู่คอนเทนเนอร์ที่ไดเรกทอรี `/var/run/secrets/kubernetes.io/serviceaccount/` เสมอ\n\nอย่างไรก็ตาม หากพอดของแอปพลิเคชันของคุณเป็นเพียงเว็บเซิร์ฟเวอร์ทั่วไปที่ไม่จำเป็นต้องสื่อสารกับ Kubernetes API Server **ขอแนะนำอย่างยิ่งให้ปิดการเมานต์โทเค็น** โดยกำหนด `automountServiceAccountToken: false` เพื่อป้องกันไม่ให้ผู้ไม่ประสงค์ดีขโมยโทเค็นไปใช้ยกระดับสิทธิ์",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "disable-automount-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: secure-web-pod\nspec:\n  automountServiceAccountToken: false\n  containers:\n  - name: web\n    image: nginx:alpine"
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Configure a Security Context for a Pod or Container",
      "targetType": "tasks",
      "targetPageId": "pod-security-context",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/security-context/"
    },
    {
      "title": "Distribute Credentials Securely Using Secrets",
      "targetType": "tasks",
      "targetPageId": "inject-credentials-secrets",
      "officialUrl": "https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/"
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
