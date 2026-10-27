/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/configuration/secret/
 */
(function (root) {
  const pageData = {
    "id": "config-secret",
    "categoryId": "configuration",
    "categoryTitle": "Configuration",
    "titleEn": "Secrets",
    "titleTh": "ซีเคร็ต (Secrets) - การจัดเก็บข้อมูลความลับอย่างปลอดภัย",
    "officialUrl": "https://kubernetes.io/docs/concepts/configuration/secret/",
    "docsPath": "/docs/concepts/configuration/secret/",
    "lead": "Secret เป็น API Object สำหรับจัดเก็บและบริหารจัดการข้อมูลที่มีความละเอียดอ่อนและต้องการความปลอดภัยสูง เช่น รหัสผ่าน, OAuth Tokens, Private Keys, SSH Keys และ Credentials ต่างๆ โดยแยกข้อมูลลับเหล่านี้ออกจาก Container Image และ Pod Specification เพื่อลดความเสี่ยงจากการรั่วไหล",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nSecret เป็น API Object สำหรับจัดเก็บและบริหารจัดการข้อมูลที่มีความละเอียดอ่อนสูง เช่น รหัสผ่าน, OAuth Tokens, SSH Keys และ Credentials ต่างๆ โดยแยกข้อมูลลับออกจาก Container Image และ Pod Specification เพื่อลดความเสี่ยงจากการรั่วไหล และนำเข้าสู่คอนเทนเนอร์ผ่าน RAM (tmpfs) หรือ Environment Variables\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **Base64 ไม่ใช่การเข้ารหัสความลับ (Not Encryption)**: Base64 เป็นเพียงการทำ Encoding ตัวอักษรเท่านั้น หากต้องการความปลอดภัยจริงต้องเปิดฟีเจอร์ **Encryption at Rest** บน etcd และจำกัดสิทธิ์ด้วย RBAC อย่างเข้มงวด\n* **ชนิดของ Secret (Secret Types)**:\n  * `Opaque` (ชนิดเริ่มต้น): เก็บ Key-Value ทั่วไปตามต้องการ\n  * `kubernetes.io/tls`: เก็บใบรับรองและ Private Key (`tls.crt`, `tls.key`)\n  * `kubernetes.io/dockerconfigjson`: เก็บสิทธิ์ล็อกอิน Private Image Registry สำหรับ `imagePullSecrets`\n  * `kubernetes.io/service-account-token`: เก็บโทเค็นประจำตัว ServiceAccount\n* **`data` เทียบกับ `stringData`**:\n  * `data`: ค่าต้องผ่านการแปลง Base64 มาก่อน\n  * `stringData`: เขียนข้อความธรรมดา (Plain Text) ลงใน YAML ได้เลย ระบบจะ encode เป็น Base64 ให้เองอัตโนมัติ\n* **Volume Mount vs Env**: แนะนำให้เมานต์ผ่าน Volume เพราะระบบจะเก็บไว้ใน RAM (tmpfs) ไม่เขียนข้อมูลความลับลงฮาร์ดดิสก์ของ Worker Node\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* คำสั่งสร้าง Secret ยอดนิยมในข้อสอบ:\n  * `kubectl create secret generic db-pass --from-literal=password=SuperSecret123`\n  * `kubectl create secret tls web-tls --cert=tls.crt --key=tls.key`\n  * `kubectl create secret docker-registry reg-cred --docker-server=... --docker-username=... --docker-password=...`\n* คำสั่งถอดรหัสค่า Base64 ผ่าน CLI:\n  `kubectl get secret db-pass -o jsonpath=\"{.data.password}\" | base64 --decode`\n* นำไปใช้ใน Pod: `spec.containers[*].env[*].valueFrom.secretKeyRef` หรือ `spec.volumes[*].secret.secretName`",
    "sections": [
      {
        "id": "what-is-secret",
        "headingEn": "What is a Secret? Security Fundamentals",
        "headingTh": "Secret คืออะไรและหลักการความปลอดภัยพื้นฐาน",
        "contentMarkdown": "การนำรหัสผ่านหรือ API Keys ฝังไว้ในโค้ดของแอปพลิเคชันหรือใน Dockerfile ถือเป็นช่องโหว่ความปลอดภัยร้ายแรง เพราะใครก็ตามที่มีสิทธิ์ดึง Image ไปใช้งานจะสามารถล่วงรู้ความลับของระบบได้ทั้งหมด\n\n**Kubernetes Secret** ถูกออกแบบมาเพื่อแก้ปัญหานี้โดยเฉพาะ:\n* ทำหน้าที่เป็นที่จัดเก็บข้อมูลลับในระดับ API Object แยกออกจาก Pods\n* พอดสามารถเรียกใช้ Secret ได้โดยการเมานต์เข้ามาเป็นไฟล์ หรือส่งผ่านเป็น Environment Variable\n* ข้อมูล Secret ใน Manifest จะถูกเข้ารหัสแบบ **Base64** เพื่อป้องกันการมองเห็นด้วยสายตาโดยไม่ได้ตั้งใจ\n\n> [!WARNING]\n> **ข้อควรระวังสำคัญ**: การแปลง Base64 **ไม่ใช่การเข้ารหัสความลับ (Not Encryption)**! Base64 เป็นเพียงการเข้ารหัสรูปแบบข้อความ (Encoding) ที่ใครๆ ก็สามารถถอดรหัส (Decode) กลับมาเป็นข้อความเดิมได้อย่างง่ายดาย ดังนั้นการรักษาความปลอดภัยของ Secret จึงต้องอาศัยการตั้งค่า RBAC และการเปิดฟีเจอร์ **Encryption at Rest** บน etcd ร่วมด้วยเสมอ"
      },
      {
        "id": "secret-types",
        "headingEn": "Built-in Secret Types",
        "headingTh": "ชนิดของ Secret ใน Kubernetes (Secret Types)",
        "contentMarkdown": "Kubernetes มีการกำหนดชนิดของ Secret เพื่ออำนวยความสะดวกในการใช้งานกับระบบต่างๆ:\n\n* **`Opaque` (ชนิดเริ่มต้น)**: ชนิดทั่วไปสำหรับเก็บค่า Key-Value อะไรก็ได้ตามที่ผู้ใช้กำหนด (เช่น รหัสผ่านฐานข้อมูล, API Key)\n* **`kubernetes.io/service-account-token`**: เก็บ Token ของ ServiceAccount สำหรับใช้ยืนยันตัวตนกับ API Server\n* **`kubernetes.io/dockercfg` และ `kubernetes.io/dockerconfigjson`**: ใช้เก็บสิทธิ์ Credential สำหรับล็อกอินและดาวน์โหลด Container Image จาก Private Container Registry (`imagePullSecrets`)\n* **`kubernetes.io/tls`**: ใช้เก็บใบรับรอง SSL/TLS และ Private Key (คีย์ `tls.crt` และ `tls.key`) สำหรับ Ingress หรือ HTTPS Endpoints\n* **`kubernetes.io/basic-auth` และ `kubernetes.io/ssh-auth`**: เก็บชื่อผู้ใช้/รหัสผ่าน หรือ Private SSH Key"
      },
      {
        "id": "creating-secrets",
        "headingEn": "Creating Secrets: CLI & data vs stringData",
        "headingTh": "วิธีการสร้าง Secret และความแตกต่างระหว่าง data กับ stringData",
        "contentMarkdown": "คุณสามารถสร้าง Secret ได้อย่างรวดเร็วผ่าน CLI หรือเขียนเป็น YAML Manifest:\n\n### 1. สร้างผ่านคำสั่ง CLI\n`kubectl create secret generic db-credentials --from-literal=username=admin --from-literal=password=SuperSecret123`\n\n### 2. สร้างผ่าน YAML Manifest: `data` เทียบกับ `stringData`\n* **`data`**: คีย์และค่าจะต้องผ่านการแปลงเป็น Base64 ล่วงหน้า (เช่น `echo -n 'admin' | base64`)\n* **`stringData`**: ช่องทางพิเศษที่อนุญาตให้เขียนข้อความธรรมดา (Plain Text) ลงในไฟล์ YAML ได้โดยตรง เมื่อส่งคำสั่งไปยัง API Server ตัว Kubernetes จะแปลงค่าดังกล่าวเป็น Base64 ในช่อง `data` ให้อัตโนมัติ (เหมาะสำหรับการทำ Automation สคริปต์):",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "db-secret.yaml",
            "code": "apiVersion: v1\nkind: Secret\nmetadata:\n  name: db-credentials\n  namespace: default\ntype: Opaque\nstringData:\n  db-user: dbadmin\n  db-password: ComplexPassword!2026"
          }
        ]
      },
      {
        "id": "using-secrets-in-pods",
        "headingEn": "Consuming Secrets in Pods: Volumes vs Env",
        "headingTh": "การนำ Secret ไปใช้งานในพอด: Volume Mounts เทียบกับ Env",
        "contentMarkdown": "คุณสามารถนำ Secret เข้าไปในคอนเทนเนอร์ได้ 2 วิธีหลัก:\n\n### 1. เมานต์เป็นไฟล์ผ่าน Volume (วิธีที่แนะนำสูงสุดด้านความปลอดภัย)\n* เมื่อเมานต์ Secret เป็น Volume ตัว kubelet จะนำข้อมูลไปเก็บไว้ใน **Linux tmpfs (RAM-backed filesystem)** ของเครื่อง Worker Node โดยตรง\n* **ไม่มีการเขียนข้อมูลความลับลงบนฮาร์ดดิสก์ของโหนดเด็ดขาด!**\n* ข้อมูลจะหายไปจากแรมทันทีที่พอดถูกทำลาย\n\n### 2. ส่งผ่านเป็น Environment Variables\n* สะดวกสำหรับแอปพลิเคชันดั้งเดิมที่อ่านค่าคอนฟิกจากตัวแปรสภาพแวดล้อม\n* **ข้อควรระวัง**: ค่า Secret อาจรั่วไหลได้ง่ายผ่าน Crash Dumps, ตัวบันทึก Log ของระบบ, หรือคำสั่ง `kubectl describe pod`"
      },
      {
        "id": "security-best-practices",
        "headingEn": "Production Security Best Practices",
        "headingTh": "แนวทางปฏิบัติที่ดีที่สุดด้านความปลอดภัยในระบบ Production",
        "contentMarkdown": "เพื่อปกป้องข้อมูลความลับให้ปลอดภัยสูงสุดตามมาตรฐานสากล:\n\n1. **เปิดใช้งาน Encryption at Rest บน etcd**: เข้ารหัสข้อมูล Secret ในฐานข้อมูล etcd ด้วยอัลกอริทึม AES-GCM หรือ KMS Provider (เช่น AWS KMS, Google Cloud KMS, Azure Key Vault)\n2. **จำกัดสิทธิ์ด้วย RBAC อย่างเข้มงวด**: จำกัดไม่ให้นักพัฒนาทั่วไปสามารถใช้คำสั่ง `kubectl get secrets` หรือ `kubectl describe secret` ได้\n3. **ใช้งาน External Secrets Operator หรือ CSI Driver**: ใช้เครื่องมือสมัยใหม่ เช่น **External Secrets Operator (ESO)** หรือ **Secrets Store CSI Driver** เพื่อดึงความลับจาก Enterprise Secret Managers ภายนอก (HashiCorp Vault, CyberArk) เข้ามายังพอดโดยตรงโดยไม่ต้องบันทึกถาวรไว้ใน etcd"
      },
      {
        "id": "manifest-and-inspection",
        "headingEn": "Complete Manifest and Verification Commands",
        "headingTh": "ตัวอย่าง Manifest ฉบับสมบูรณ์และคำสั่งถอดรหัสตรวจสอบ",
        "contentMarkdown": "ตัวอย่างการเมานต์ Secret เข้าเป็นไฟล์และอ่านเป็นตัวแปรสภาพแวดล้อมพร้อมกัน:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "pod-using-secret.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: secure-app-pod\nspec:\n  containers:\n  - name: my-app\n    image: alpine\n    command: [\"sh\", \"-c\", \"cat /etc/secret-volume/db-password && sleep 3600\"]\n    env:\n    - name: DATABASE_USER\n      valueFrom:\n        secretKeyRef:\n          name: db-credentials\n          key: db-user\n    volumeMounts:\n    - name: secret-volume\n      mountPath: /etc/secret-volume\n      readOnly: true\n  volumes:\n  - name: secret-volume\n    secret:\n      secretName: db-credentials"
          },
          {
            "lang": "bash",
            "label": "คำสั่งตรวจสอบและถอดรหัส Secret",
            "code": "# แสดงรายการ Secret (ค่าความลับจะถูกซ่อนไว้)\nkubectl get secrets\n\n# คำสั่งถอดรหัส Base64 ของคีย์ db-password ออกมาเป็นข้อความอ่านได้\nkubectl get secret db-credentials -o jsonpath=\"{.data.db-password}\" | base64 --decode; echo \"\""
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) สำหรับการจัดการคอนฟิกทั่วไป\n* ศึกษา [Service Accounts and RBAC](https://kubernetes.io/docs/concepts/security/service-accounts/) สำหรับการจำกัดสิทธิ์การเข้าถึง Secret\n* ศึกษา [Encrypting Confidential Data at Rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/) การเปิดใช้งานการเข้ารหัสบน etcd"
      }
    ],
    "relatedLinks": [
      {
        "title": "ConfigMaps (คอนฟิกแมป)",
        "targetType": "concepts",
        "targetPageId": "config-configmap",
        "officialUrl": "https://kubernetes.io/docs/concepts/configuration/configmap/"
      },
      {
        "title": "Service Accounts and RBAC (การควบคุมสิทธิ์)",
        "targetType": "concepts",
        "targetPageId": "sec-service-accounts-rbac",
        "officialUrl": "https://kubernetes.io/docs/concepts/security/service-accounts/"
      },
      {
        "title": "Pod Security Standards (มาตรฐานความปลอดภัย)",
        "targetType": "concepts",
        "targetPageId": "sec-pod-security-standards",
        "officialUrl": "https://kubernetes.io/docs/concepts/security/pod-security-standards/"
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
