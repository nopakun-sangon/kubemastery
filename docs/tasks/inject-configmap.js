/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/
 */
(function (root) {
  const pageData = {
  "id": "inject-configmap",
  "categoryId": "configure-pods",
  "categoryTitle": "Configure Pods and Containers",
  "titleEn": "Configure a Pod to Use a ConfigMap",
  "titleTh": "การตั้งค่าให้พอดดึงค่าคอนฟิกจาก ConfigMap",
  "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/",
  "docsPath": "/docs/tasks/configure-pod-container/configure-pod-configmap/",
  "lead": "ConfigMap ช่วยให้คุณสามารถแยกการกำหนดค่า (Configuration Artifacts) ออกจาก Container Image เพื่อให้แอปพลิเคชันมีความยืดหยุ่นและพกพาได้ง่าย (Portability) ตามหลักการ Cloud Native",
  "sections": [
    {
      "id": "configmap-concepts-and-limits",
      "headingEn": "ConfigMap Concepts, Use Cases, and Limitations",
      "headingTh": "แนวคิดของ ConfigMap รูปแบบการใช้งาน และข้อจำกัด",
      "contentMarkdown": "ในสถาปัตยกรรมคลาวด์เนทีฟ การแยกรหัสโปรแกรม (Code) ออกจากการตั้งค่า (Configuration) เป็นหัวใจสำคัญของความคล่องตัวในการส่งมอบระบบ\n\n**ConfigMap** เก็บข้อมูลในรูปแบบ Key-Value ของข้อความธรรมดา (Plaintext Strings):\n* เหมาะสำหรับ: ไฟล์คอนฟิก เช่น `nginx.conf`, `redis.conf`, JSON หรือไฟล์ `.properties`\n* **ขีดจำกัดขนาดข้อมูล**: ข้อมูลทั้งหมดในหนึ่ง ConfigMap ต้อง **ไม่เกิน 1 MiB** (เนื่องจากเป็นขนาดข้อมูลสูงสุดที่ etcd อนุญาตให้จัดเก็บต่อ 1 Object)\n\n> ข้อควรระวัง: ConfigMap ไม่ได้ผ่านการเข้ารหัสลับ หากข้อมูลเป็นรหัสผ่าน, API Token, หรือกุญแจส่วนตัว ต้องใช้งาน **Secret** แทนเสมอ",
      "codeBlocks": []
    },
    {
      "id": "create-configmap-cli-and-yaml",
      "headingEn": "Creating ConfigMaps from Files, Directories, and Literals",
      "headingTh": "วิธีการสร้าง ConfigMap จากไฟล์ ไดเรกทอรี และ Literal",
      "contentMarkdown": "Kubernetes มีความยืดหยุ่นสูงในการสร้าง ConfigMap ผ่านคำสั่ง `kubectl create configmap`:\n\n1. **สร้างจากค่าคงที่ (Literal)**: เหมาะสำหรับค่าเดี่ยวๆ เช่น ตัวเลขพอร์ต หรือชื่อโดเมน\n2. **สร้างจากไฟล์จริง (File)**: ชื่อไฟล์จะกลายเป็น Key และเนื้อหาทั้งหมดในไฟล์จะกลายเป็น Value\n3. **สร้างผ่าน YAML Manifest**: นิยมใช้ในกระบวนการ GitOps หรือ CI/CD",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "create-configmap-cli.sh",
          "code": "# 1. สร้างจากค่าคงที่เดี่ยวๆ\nkubectl create configmap special-config --from-literal=special.how=very --from-literal=special.type=charm\n\n# 2. สร้างจากไฟล์คอนฟิก\necho -e \"log.level=verbose\\napp.cache=true\" > app.properties\nkubectl create configmap game-config --from-file=app.properties"
        },
        {
          "lang": "yaml",
          "label": "configmap-manifest.yaml",
          "code": "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: game-demo\n  namespace: default\ndata:\n  player_initial_lives: \"3\"\n  ui_properties_file_name: \"user-interface.properties\"\n  game.properties: |\n    enemies.cheat=true\n    enemies.cheat.level=noGoodRotten\n    secret.code.passphrase=UndeProperties\n    secret.code.allowed=true"
        }
      ]
    },
    {
      "id": "mount-configmap-as-volume",
      "headingEn": "Mounting ConfigMap Data as a Volume",
      "headingTh": "การเมานต์ข้อมูลใน ConfigMap ให้เป็นไฟล์ Volume ภายในคอนเทนเนอร์",
      "contentMarkdown": "การนำข้อมูลใน ConfigMap ไปปรากฏเป็นไฟล์ภายในคอนเทนเนอร์ทำได้โดยสร้าง **ConfigMap Volume** ใน Pod Specification\n\n* ข้อมูลแต่ละ Key ใน ConfigMap จะถูกแปลงเป็น 1 ไฟล์ โดยมีชื่อไฟล์ตามชื่อ Key และมีเนื้อหาตาม Value\n* **การอัปเดตแบบอัตโนมัติ (Live Update)**: หากคุณแก้ไขข้อมูลใน ConfigMap ผ่าน `kubectl edit configmap` ไฟล์ที่เมานต์อยู่ภายในพอดจะถูก kubelet ซิงค์อัปเดตเนื้อหาใหม่ให้โดยอัตโนมัติภายในระยะเวลาไม่กี่นาที โดยไม่ต้องรีสตาร์ทพอด (ยกเว้นกรณีที่ใช้งาน `subPath`)",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "pod-configmap-volume.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: dapi-test-pod\nspec:\n  containers:\n    - name: test-container\n      image: busybox:1.28\n      command: [ \"sh\", \"-c\", \"cat /etc/config/game.properties\" ]\n      volumeMounts:\n      - name: config-volume\n        mountPath: /etc/config\n  volumes:\n    - name: config-volume\n      configMap:\n        name: game-demo\n  restartPolicy: Never"
        },
        {
          "lang": "bash",
          "label": "apply-and-verify-vol.sh",
          "code": "# สร้างพอดและอ่านไฟล์คอนฟิกที่ถูกเมานต์\nkubectl apply -f pod-configmap-volume.yaml\nkubectl logs dapi-test-pod"
        }
      ]
    },
    {
      "id": "immutable-configmaps",
      "headingEn": "Creating Immutable ConfigMaps for Performance and Safety",
      "headingTh": "การสร้าง Immutable ConfigMap เพื่อประสิทธิภาพและความปลอดภัย",
      "contentMarkdown": "หากคลัสเตอร์มีขนาดใหญ่และมีพอดจำนวนมากที่เมานต์ ConfigMap ตัวเดียวกัน การเปิดให้ kubelet ต้องคอยเฝ้าสังเกต (Watch) การเปลี่ยนแปลงตลอดเวลาอาจสร้างภาระให้กับ kube-apiserver\n\nคุณสามารถกำหนด `immutable: true` เพื่อล็อกไม่ให้มีการแก้ไขข้อมูลใน ConfigMap นั้นอีก ซึ่งจะช่วยลดโหลดของ API Server และป้องกันความผิดพลาดจากการเผลอแก้ไขคอนฟิกบน Production",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "immutable-configmap.yaml",
          "code": "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: company-policy\ndata:\n  tax_rate: \"0.07\"\nimmutable: true"
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Define Environment Variables for a Container",
      "targetType": "tasks",
      "targetPageId": "inject-env-variables",
      "officialUrl": "https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/"
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
