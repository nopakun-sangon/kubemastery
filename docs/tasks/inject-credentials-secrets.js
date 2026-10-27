/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/
 */
(function (root) {
  const pageData = {
  "id": "inject-credentials-secrets",
  "categoryId": "inject-data",
  "categoryTitle": "Inject Data Into Applications",
  "titleEn": "Distribute Credentials Securely Using Secrets",
  "titleTh": "การกระจายข้อมูลรับรองอย่างปลอดภัยด้วย Secrets",
  "officialUrl": "https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/",
  "docsPath": "/docs/tasks/inject-data-application/distribute-credentials-secure/",
  "lead": "Kubernetes Secret เป็นออบเจกต์สำหรับจัดเก็บและจัดการข้อมูลที่มีความลับและอ่อนไหวสูง เช่น รหัสผ่าน, OAuth Tokens, Private Keys และ TLS Certificates โดยลดความเสี่ยงจากการรั่วไหลเมื่อเทียบกับการเก็บไว้ในโค้ดหรืออิมเมจ",
  "sections": [
    {
      "id": "secrets-overview-and-types",
      "headingEn": "Secret Types and Base64 Encoding vs Encryption",
      "headingTh": "ประเภทของ Secrets และข้อเท็จจริงระหว่าง Base64 Encoding กับการเข้ารหัส",
      "contentMarkdown": "Kubernetes Secret ถูกออกแบบมาเพื่อจัดเก็บข้อมูลความลับเฉพาะเจาะจง โดยมีประเภทมาตรฐาน (Built-in Types) ดังนี้:\n\n* **`Opaque`**: ประเภททั่วไปสำหรับจัดเก็บข้อมูลความลับแบบ Key-Value ตามที่ผู้ใช้กำหนด (เป็นค่าเริ่มต้น)\n* **`kubernetes.io/tls`**: สำหรับเก็บใบรับรอง TLS (ประกอบด้วยคีย์ `tls.crt` และ `tls.key`)\n* **`kubernetes.io/dockerconfigjson`**: สำหรับจัดเก็บข้อมูลยืนยันตัวตนกับ Container Registry เพื่อใช้ใน `imagePullSecrets`\n* **`kubernetes.io/service-account-token`**: โทเค็นของ ServiceAccount\n\n> ข้อควรระวังอย่างยิ่ง: ค่าข้อมูลที่ปรากฏในฟิลด์ `data` ของไฟล์ YAML Secret นั้น **ถูกเข้ารหัสด้วย Base64 เท่านั้น ซึ่งไม่ใช่การเข้ารหัสลับ (Base64 is Encoding, NOT Encryption!)** บุคคลใดก็ตามที่มีสิทธิ์อ่าน YAML สามารถถอดรหัส Base64 กลับมาเป็นข้อมูลต้นฉบับได้ทันที การรักษาความปลอดภัยระดับ Production จะต้องเปิดใช้งาน **Encryption at Rest** บน etcd ควบคู่ไปด้วยเสมอ",
      "codeBlocks": []
    },
    {
      "id": "create-secret-methods",
      "headingEn": "Creating Secrets using kubectl and YAML",
      "headingTh": "วิธีการสร้าง Secret ผ่าน kubectl CLI และ YAML Manifest",
      "contentMarkdown": "คุณสามารถสร้าง Secret ได้ 2 วิธีหลัก:\n\n1. **ใช้คำสั่ง `kubectl create secret generic`**: วิธีนี้ง่ายและปลอดภัยที่สุด เนื่องจากค่าจะไม่ถูกบันทึกค้างไว้ในประวัติไฟล์ YAML\n2. **สร้างผ่าน YAML Manifest**: หากใช้ฟิลด์ `data` คุณต้องแปลงข้อมูลเป็น Base64 ล่วงหน้า แต่หากใช้ฟิลด์ `stringData` คุณสามารถพิมพ์ข้อความธรรมดาได้ แล้ว Kubernetes จะแปลงเป็น Base64 ให้เองอัตโนมัติเมื่อส่งเข้าสู่คลัสเตอร์",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "create-secret-cli.sh",
          "code": "# สร้าง Secret ผ่าน CLI โดยตรง\nkubectl create secret generic db-credentials \\\n  --from-literal=username='dbadmin' \\\n  --from-literal=password='ComplexP@ssw0rd!'"
        },
        {
          "lang": "yaml",
          "label": "secret-manifest.yaml",
          "code": "apiVersion: v1\nkind: Secret\nmetadata:\n  name: app-secret\ntype: Opaque\nstringData:\n  # ใช้ stringData เพื่อความสะดวก ไม่ต้องแปลง base64 เอง\n  api_key: \"abcdef1234567890\"\n  db_password: \"SuperSecretDbPass\""
        }
      ]
    },
    {
      "id": "consume-secrets-in-pods",
      "headingEn": "Consuming Secrets: Volumes vs Environment Variables",
      "headingTh": "การนำ Secret ไปใช้งาน: เมานต์เป็นไฟล์ Volume เปรียบเทียบกับการส่งเป็น Environment Variable",
      "contentMarkdown": "การนำ Secret เข้าสู่คอนเทนเนอร์สามารถทำได้ 2 รูปแบบ:\n\n* **แบบที่ 1: เมานต์เป็น Secret Volume (วิธีที่แนะนำที่สุดตามมาตรฐานความปลอดภัย)**:\n  Kubernetes จะสร้างระบบไฟล์ชั่วคราวบน RAM (tmpfs) ขึ้นมาบนเครื่องโหนด ทำให้ไฟล์ข้อมูลความลับไม่ถูกเขียนลงฮาร์ดดิสก์จริง และเมื่อแก้ไข Secret ในคลัสเตอร์ ไฟล์ที่เมานต์จะได้รับการอัปเดตให้อัตโนมัติ\n* **แบบที่ 2: ส่งผ่าน Environment Variables (`secretKeyRef`)**:\n  แอปพลิเคชันอ่านค่าง่าย แต่มีความเสี่ยงสูงที่รหัสผ่านจะรั่วไหลออกไปทาง System Logs เมื่อแอปพลิเคชันเกิด Crash Dump หรือถูกตรวจสอบผ่าน `/proc/$PID/environ`",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "pod-consuming-secret.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: secret-consumer-pod\nspec:\n  containers:\n  - name: my-app\n    image: nginx:alpine\n    # 1. ส่งผ่าน Environment Variable\n    env:\n    - name: DB_USER\n      valueFrom:\n        secretKeyRef:\n          name: db-credentials\n          key: username\n    # 2. เมานต์เป็น Secret Volume\n    volumeMounts:\n    - name: secret-volume\n      mountPath: /etc/secrets\n      readOnly: true\n  volumes:\n  - name: secret-volume\n    secret:\n      secretName: db-credentials"
        }
      ]
    },
    {
      "id": "security-best-practices-for-secrets",
      "headingEn": "Security Best Practices for Managing Secrets in Production",
      "headingTh": "แนวทางปฏิบัติเพื่อความปลอดภัยขั้นสูงสุดในการจัดการ Secrets",
      "contentMarkdown": "* **เปิดใช้งาน Encryption at Rest บน etcd**: กำหนดคอนฟิก `EncryptionConfiguration` เพื่อให้ข้อมูลใน etcd ถูกเข้ารหัสด้วยอัลกอริทึม AES-GCM หรือ KMS\n* **จำกัดสิทธิ์การเข้าถึงด้วย RBAC**: ปิดกั้นไม่ให้ User ปกติมีสิทธิ์ `get` หรือ `list` ออบเจกต์ Secret ในเนมสเปซ\n* **เชื่อมต่อกับระบบ External Secrets Manager**: ในสถาปัตยกรรมระดับองค์กร แนะนำให้ใช้ **Secrets Store CSI Driver** เพื่อดึงข้อมูลความลับจาก HashiCorp Vault, AWS Secrets Manager หรือ GCP Secret Manager มาสู่พอดโดยตรงโดยไม่ต้องบันทึกลงในฐานข้อมูล etcd",
      "codeBlocks": []
    }
  ],
  "relatedLinks": [
    {
      "title": "Configure a Pod to Use a ConfigMap",
      "targetType": "tasks",
      "targetPageId": "inject-configmap",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/"
    },
    {
      "title": "Configure Service Accounts for Pods",
      "targetType": "tasks",
      "targetPageId": "pod-configure-service-account",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/"
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
