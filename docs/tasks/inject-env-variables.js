/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/
 */
(function (root) {
  const pageData = {
  "id": "inject-env-variables",
  "categoryId": "inject-data",
  "categoryTitle": "Inject Data Into Applications",
  "titleEn": "Define Environment Variables for a Container",
  "titleTh": "การกำหนดตัวแปรสภาพแวดล้อม (Environment Variables) ให้กับคอนเทนเนอร์",
  "officialUrl": "https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/",
  "docsPath": "/docs/tasks/inject-data-application/define-environment-variable-container/",
  "lead": "การส่งผ่านตัวแปรสภาพแวดล้อม (Environment Variables) เข้าสู่คอนเทนเนอร์เป็นวิธีมาตรฐานตามหลัก Twelve-Factor App ในการปรับแต่งการทำงานของแอปพลิเคชันตามสภาพแวดล้อม (Dev, Staging, Production) โดยไม่ต้องสร้างอิมเมจใหม่",
  "sections": [
    {
      "id": "define-static-env-variables",
      "headingEn": "Defining Static Environment Variables (Key-Value)",
      "headingTh": "การกำหนดตัวแปรสภาพแวดล้อมแบบคงที่ด้วยคู่ Key-Value",
      "contentMarkdown": "การกำหนดค่าตัวแปรแบบตรงไปตรงมาทำได้โดยระบุรายการในอาร์เรย์ `env` ภายใต้ Container Specification โดยแต่ละตัวแปรจะประกอบด้วย `name` (ชื่อตัวแปร) และ `value` (ค่าข้อมูล)",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "env-static-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: env-single-demo\nspec:\n  containers:\n  - name: env-demo-container\n    image: busybox:1.28\n    command: [\"sh\", \"-c\", \"env\"]\n    env:\n    - name: DEMO_GREETING\n      value: \"Hello from Kubernetes Env\"\n    - name: DEMO_FAREWELL\n      value: \"Goodbye from Kubernetes Env\"\n  restartPolicy: OnFailure"
        },
        {
          "lang": "bash",
          "label": "apply-and-verify.sh",
          "code": "# สร้างพอดและอ่านค่าตัวแปรสภาพแวดล้อมผ่าน logs\nkubectl apply -f env-static-pod.yaml\nkubectl logs env-single-demo | grep DEMO_"
        }
      ]
    },
    {
      "id": "dependent-environment-variables",
      "headingEn": "Using Dependent Environment Variables (Variable Substitution)",
      "headingTh": "การใช้ตัวแปรสภาพแวดล้อมที่อ้างอิงค่าจากตัวแปรอื่น (Dependent Variables)",
      "contentMarkdown": "เมื่อคุณกำหนดตัวแปรหลายตัว คุณสามารถให้ตัวแปรตัวถัดไปนำค่าของตัวแปรตัวก่อนหน้ามาผสมหรือต่อยอดได้โดยใช้รูปแบบ `$(VAR_NAME)`\n\n> ข้อสำคัญ: การอ้างอิงแบบนี้จะทำงานได้ก็ต่อเมื่อตัวแปรที่ถูกอ้างอิงถูกประกาศไว้ **ก่อนหน้า** ในรายการ `env` เท่านั้น",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "env-dependent-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: env-dependent-demo\nspec:\n  containers:\n  - name: app\n    image: busybox:1.28\n    command: [\"sh\", \"-c\", \"echo Base URL is $SERVICE_URL\"]\n    env:\n    - name: SERVICE_HOST\n      value: \"api.internal.local\"\n    - name: SERVICE_PORT\n      value: \"8443\"\n    # อ้างอิงตัวแปรที่ประกาศไว้ข้างต้น\n    - name: SERVICE_URL\n      value: \"https://$(SERVICE_HOST):$(SERVICE_PORT)/v1\"\n  restartPolicy: OnFailure"
        },
        {
          "lang": "bash",
          "label": "verify-dependent.sh",
          "code": "kubectl apply -f env-dependent-pod.yaml\nkubectl logs env-dependent-demo\n# ผลลัพธ์: Base URL is https://api.internal.local:8443/v1"
        }
      ]
    },
    {
      "id": "inject-from-configmap-and-secret",
      "headingEn": "Injecting Environment Variables from ConfigMaps and Secrets",
      "headingTh": "การดึงค่าตัวแปรสภาพแวดล้อมจาก ConfigMap และ Secret (valueFrom)",
      "contentMarkdown": "แทนที่จะใส่ค่าข้อมูลไว้ในพอดโดยตรง คุณสามารถดึงค่ามาจากออบเจกต์ **ConfigMap** หรือ **Secret** ได้ โดยใช้ `valueFrom.configMapKeyRef` หรือ `valueFrom.secretKeyRef`",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "env-valuefrom-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: env-valuefrom-demo\nspec:\n  containers:\n  - name: app\n    image: alpine\n    command: [\"sleep\", \"3600\"]\n    env:\n    - name: APP_CONFIG_MODE\n      valueFrom:\n        configMapKeyRef:\n          name: app-settings\n          key: mode\n    - name: DB_PASSWORD\n      valueFrom:\n        secretKeyRef:\n          name: db-credentials\n          key: password"
        }
      ]
    },
    {
      "id": "bulk-injection-with-envfrom",
      "headingEn": "Bulk Environment Injection using envFrom",
      "headingTh": "การโหลดตัวแปรทั้งหมดเข้ามาแบบกลุ่มด้วย envFrom",
      "contentMarkdown": "หากคุณมี ConfigMap หรือ Secret ที่บรรจุการตั้งค่านับสิบค่า การเขียน `valueFrom` ทีละตัวจะทำให้ไฟล์ manifest ยาวเกินไป คุณสามารถใช้ **`envFrom`** เพื่อนำคีย์ทุกตัวที่อยู่ในออบเจกต์เข้ามาเป็นตัวแปรสภาพแวดล้อมอัตโนมัติในครั้งเดียว พร้อมทั้งสามารถเติม `prefix` นำหน้าเพื่อป้องกันชื่อตัวแปรชนกันได้อีกด้วย",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "envfrom-bulk.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: envfrom-demo\nspec:\n  containers:\n  - name: worker\n    image: busybox:1.28\n    command: [\"sh\", \"-c\", \"env\"]\n    envFrom:\n    - configMapRef:\n        name: app-config\n    - secretRef:\n        name: app-secrets\n      prefix: SECURE_\n  restartPolicy: OnFailure"
        }
      ]
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
