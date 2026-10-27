/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/configuration/configmap/
 */
(function (root) {
  const pageData = {
    "id": "config-configmap",
    "categoryId": "configuration",
    "categoryTitle": "Configuration",
    "titleEn": "ConfigMaps",
    "titleTh": "คอนฟิกแมป (ConfigMaps) - การแยกคอนฟิกออกจากอิมเมจ",
    "officialUrl": "https://kubernetes.io/docs/concepts/configuration/configmap/",
    "docsPath": "/docs/concepts/configuration/configmap/",
    "lead": "ConfigMap เป็น API Object ที่ใช้จัดเก็บข้อมูลการตั้งค่าที่ไม่เป็นความลับในรูปแบบคู่ Key-Value โดยมีจุดมุ่งหมายสำคัญในการแยกค่าคอนฟิกูเรชันออกจาก Container Image ตามหลักการ The Twelve-Factor App ช่วยให้อิมเมจเดียวกันสามารถนำไปใช้งานซ้ำได้ในทุกสภาพแวดล้อม (Dev, Staging, Production)",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nConfigMap เป็น API Object ที่ใช้จัดเก็บข้อมูลการตั้งค่าที่ไม่เป็นความลับในรูปแบบ Key-Value โดยมีจุดมุ่งหมายสำคัญในการแยกค่าคอนฟิกูเรชันออกจาก Container Image ตามหลักการ 12-Factor App ช่วยให้อิมเมจเดียวกันสามารถนำไปใช้งานซ้ำได้ในทุกสภาพแวดล้อม (Dev, Staging, Production) เพียงแค่สลับ ConfigMap\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **การสร้าง ConfigMap (CLI & YAML)**: สร้างได้จากค่าคงที่ (`--from-literal`), ไฟล์เดี่ยว (`--from-file`), หรือไฟล์รวมตัวแปร (`--from-env-file`)\n* **4 วิธีการนำไปใช้งานในพอด**:\n  1. ตัวแปรสภาพแวดล้อมรายตัว (`valueFrom.configMapKeyRef`)\n  2. ตัวแปรสภาพแวดล้อมทั้งหมดพร้อมกัน (`envFrom.configMapRef`)\n  3. ส่งเป็น Command Line Arguments ในคำสั่งรันโปรเซส (`command: [\"$(MY_VAR)\"]`)\n  4. เมานต์เป็นไฟล์ในไดเรกทอรีผ่าน Volume (`volumes.configMap`)\n* **การอัปเดตข้อมูลแบบไดนามิก**: ข้อมูลที่เมานต์ผ่าน Volume จะได้รับการซิงค์อัปเดตเนื้อหาไฟล์อัตโนมัติเมื่อ ConfigMap เปลี่ยน แต่ข้อมูลที่ใช้เป็น Environment Variables จะไม่มีวันอัปเดตจนกว่าจะรีสตาร์ตพอด\n* **Immutable ConfigMaps (`immutable: true`)**: ล็อกไม่ให้แก้ไขค่า ช่วยป้องกันความผิดพลาดและลดภาระ API Server ในการ Watch ข้อมูล\n* **ข้อจำกัดขนาดข้อมูล**: ไม่เกิน **1 MiB** ตามข้อกำหนดของ etcd\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* คำสั่งสร้าง ConfigMap ด่วนที่ออกสอบบ่อย:\n  * `kubectl create configmap app-cfg --from-literal=APP_COLOR=blue --from-literal=MAX_USERS=100`\n  * `kubectl create configmap web-cfg --from-file=config.json`\n* สเปกดึงตัวแปรใน Pod YAML:\n  * ดึงค่าเดี่ยว: `env: [{ name: COLOR, valueFrom: { configMapKeyRef: { name: app-cfg, key: APP_COLOR } } }]`\n  * ดึงทั้งหมด: `envFrom: [{ configMapRef: { name: app-cfg } }]`\n* คำสั่งตรวจสอบ: `kubectl get cm`, `kubectl describe cm <name>`, `kubectl get cm <name> -o yaml`",
    "sections": [
      {
        "id": "what-is-configmap",
        "headingEn": "What is a ConfigMap? The 12-Factor Philosophy",
        "headingTh": "ConfigMap คืออะไรและหลักปรัชญา Twelve-Factor App",
        "contentMarkdown": "ตามหลักการ **The Twelve-Factor App (ข้อที่ 3: Config)** โค้ดของแอปพลิเคชันและค่าคอนฟิกควรถูกแยกขาดจากกันโดยเด็ดขาด การฮาร์ดโค้ด (Hardcode) URL ฐานข้อมูล, หมายเลขพอร์ต หรือ Feature Flags ไว้ใน Container Image จะส่งผลให้คุณต้องเสียเวลา Rebuild อิมเมจใหม่ทุกครั้งที่ย้าย Environment\n\n**ConfigMap** เข้ามาทำหน้าที่เป็นตัวกลางจัดเก็บคอนฟิกใน Kubernetes:\n* จัดเก็บข้อมูลในรูปแบบ Key-Value โดยรองรับทั้งข้อความสั้นๆ (เช่น `LOG_LEVEL: debug`) และเนื้อหาไฟล์คอนฟิกทั้งก้อน (เช่น `nginx.conf`, `appsettings.json`)\n* แตกต่างจาก **Secret** ตรงที่ ConfigMap ออกแบบมาสำหรับข้อมูลทั่วไปที่ไม่เป็นความลับและไม่มีการเข้ารหัสความปลอดภัยขั้นสูง\n* ทำให้คุณสามารถสลับคอนฟิกได้ทันทีเพียงแค่เปลี่ยน ConfigMap Object ที่ผูกอยู่ โดยคง Image ตัวเดิมไว้ 100%"
      },
      {
        "id": "creating-configmaps",
        "headingEn": "Creating ConfigMaps: CLI & Manifest",
        "headingTh": "วิธีการสร้าง ConfigMap จากคำสั่ง CLI และ YAML Manifest",
        "contentMarkdown": "คุณสามารถสร้าง ConfigMap ได้อย่างยืดหยุ่น 2 รูปแบบ:\n\n### 1. การสร้างผ่านคำสั่ง CLI (`kubectl create configmap`)\n* **จากค่าคงที่โดยตรง (Literal)**:\n  `kubectl create configmap app-settings --from-literal=APP_ENV=prod --from-literal=PORT=8080`\n* **จากไฟล์เดี่ยว (File)**:\n  `kubectl create configmap nginx-config --from-file=default.conf`\n* **จากไฟล์รวมตัวแปรสภาพแวดล้อม (Env File)**:\n  `kubectl create configmap env-config --from-env-file=.env`\n\n### 2. การประกาศผ่าน YAML Manifest\nข้อมูลใน Manifest จะถูกเก็บในฟิลด์ `data` (สำหรับข้อความ UTF-8) หรือ `binaryData` (สำหรับข้อมูลไบนารีที่ถูกแปลง Base64):",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "game-config.yaml",
            "code": "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: game-demo\n  namespace: default\ndata:\n  player_initial_lives: \"3\"\n  ui_properties_file_name: \"user-interface.properties\"\n  game.properties: |\n    enemy.types=aliens,monsters\n    weapon.types=laser,missile\n  user-interface.properties: |\n    color.good=purple\n    color.bad=yellow\n    allow.textmode=true"
          }
        ]
      },
      {
        "id": "using-configmaps-in-pods",
        "headingEn": "4 Ways to Consume ConfigMaps in Pods",
        "headingTh": "4 วิธีการนำ ConfigMap ไปใช้งานภายในพอด",
        "contentMarkdown": "คอนเทนเนอร์ในพอดสามารถอ่านข้อมูลจาก ConfigMap ได้ 4 รูปแบบหลัก:\n\n1. **Environment Variable รายตัว (`valueFrom.configMapKeyRef`)**:\n   ดึงเฉพาะบางคีย์จาก ConfigMap เข้ามาเป็นตัวแปรสภาพแวดล้อมในคอนเทนเนอร์\n2. **Environment Variables ทั้งหมดพร้อมกัน (`envFrom.configMapRef`)**:\n   นำทุกคีย์ใน ConfigMap มาแปลงเป็นตัวแปรสภาพแวดล้อมทั้งหมดในบรรทัดเดียวอย่างสะดวก\n3. **ส่งเป็น Command Line Arguments ใน Container Command**:\n   นำค่าจาก ConfigMap ไปประกอบเป็นคำสั่งรันโปรเซส เช่น `command: [\"myapp\", \"$(UI_FILE)\"]`\n4. **เมานต์เป็นไฟล์ในไดเรกทอรีผ่าน Volume (`volumes.configMap`)**:\n   แปลงแต่ละคีย์ใน ConfigMap ให้กลายเป็นไฟล์เดี่ยวๆ ภายในคอนเทนเนอร์ เช่น เมานต์ไปที่ `/etc/config` โดยชื่อคีย์จะเป็นชื่อไฟล์ และเนื้อหาในคีย์จะเป็นเนื้อหาในไฟล์"
      },
      {
        "id": "immutable-configmaps",
        "headingEn": "Immutable ConfigMaps",
        "headingTh": "คอนฟิกแมปแบบแก้ไขไม่ได้ (Immutable ConfigMaps)",
        "contentMarkdown": "คุณสามารถกำหนดฟิลด์ `immutable: true` ในสเปกของ ConfigMap ได้เพื่อล็อกไม่ให้มีการแก้ไขข้อมูลใดๆ เพิ่มเติม:\n\n* **ประโยชน์ด้านความเสถียร**: ป้องกันความผิดพลาดจากการที่มีใครเผลอไปแก้ไขค่าคอนฟิกในขณะที่แอปพลิเคชันกำลังทำงาน\n* **ประโยชน์ด้านประสิทธิภาพ (Performance Optimization)**: ช่วยลดภาระการทำงานของ `kube-apiserver` อย่างมหาศาล เนื่องจากระบบจะปิดการ Watch เฝ้าติดตามการเปลี่ยนแปลงของ ConfigMap ชิ้นนั้น ทำให้คลัสเตอร์ขนาดใหญ่ทำงานได้รวดเร็วขึ้น\n* หากต้องการเปลี่ยนคอนฟิก ให้สร้าง ConfigMap ชื่อใหม่แล้วสั่ง Rollout Deployment แทน"
      },
      {
        "id": "manifest-and-inspection",
        "headingEn": "Complete Manifest and Dynamic Updates",
        "headingTh": "ตัวอย่าง Manifest รวมและการอัปเดตข้อมูลแบบไดนามิก",
        "contentMarkdown": "> [!NOTE]\n> **ข้อแตกต่างสำคัญเรื่องการอัปเดต**: ข้อมูล ConfigMap ที่ถูกเมานต์ผ่าน **Volume** จะได้รับการซิงค์อัปเดตเนื้อหาไฟล์โดยอัตโนมัติเมื่อ ConfigMap ต้นทางเปลี่ยน (ผ่านกลไก Periodic Sync ของ kubelet) แต่ข้อมูลที่ถูกนำไปใช้เป็น **Environment Variables จะไม่มีวันอัปเดต** จนกว่าพอดตัวนั้นจะถูกลบและสร้างใหม่\n\n> [!WARNING]\n> **ข้อจำกัดขนาดข้อมูล**: ConfigMap มีข้อจำกัดขนาดสูงสุดไม่เกิน **1 MiB** ตามข้อกำหนดขนาดข้อมูลของ etcd",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "pod-consuming-configmap.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: config-demo-pod\nspec:\n  containers:\n  - name: demo-container\n    image: alpine\n    command: [\"sh\", \"-c\", \"env && cat /etc/config/game.properties && sleep 3600\"]\n    env:\n    # 1. ดึงค่าคีย์เดี่ยวมาเป็นตัวแปรสภาพแวดล้อม\n    - name: LIVES\n      valueFrom:\n        configMapKeyRef:\n          name: game-demo\n          key: player_initial_lives\n    volumeMounts:\n    # 2. เมานต์ ConfigMap เป็นไฟล์ทั้งโฟลเดอร์\n    - name: config-vol\n      mountPath: /etc/config\n      readOnly: true\n  volumes:\n  - name: config-vol\n    configMap:\n      name: game-demo"
          },
          {
            "lang": "bash",
            "label": "คำสั่งตรวจสอบ ConfigMap",
            "code": "# แสดงรายการ ConfigMap ทั้งหมดใน Namespace\nkubectl get configmaps\n\n# ดูข้อมูลภายในและคีย์ทั้งหมดของ ConfigMap\nkubectl describe configmap game-demo\n\n# แสดงข้อมูลดิบแบบ YAML\nkubectl get configmap game-demo -o yaml"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) สำหรับการจัดเก็บรหัสผ่านและข้อมูลความลับ\n* ศึกษา [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) สำหรับการจำกัด CPU และ Memory\n* ศึกษาคู่มือปฏิบัติ [Configure a Pod to Use a ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/)"
      }
    ],
    "relatedLinks": [
      {
        "title": "Secrets (การจัดการข้อมูลความลับ)",
        "targetType": "concepts",
        "targetPageId": "config-secret",
        "officialUrl": "https://kubernetes.io/docs/concepts/configuration/secret/"
      },
      {
        "title": "Resource Management (การจัดการทรัพยากรพอด)",
        "targetType": "concepts",
        "targetPageId": "config-manage-resources",
        "officialUrl": "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/"
      },
      {
        "title": "Volumes Overview (ภาพรวมวอลุ่ม)",
        "targetType": "concepts",
        "targetPageId": "storage-volumes",
        "officialUrl": "https://kubernetes.io/docs/concepts/storage/volumes/"
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
