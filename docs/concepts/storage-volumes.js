/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/storage/volumes/
 */
(function (root) {
  const pageData = {
    "id": "storage-volumes",
    "categoryId": "storage",
    "categoryTitle": "Storage",
    "titleEn": "Volumes",
    "titleTh": "ภาพรวมของวอลุ่ม (Volumes Overview)",
    "officialUrl": "https://kubernetes.io/docs/concepts/storage/volumes/",
    "docsPath": "/docs/concepts/storage/volumes/",
    "diagram": {
      "src": "images/docs/pv-pvc-storageclass-lifecycle.svg",
      "caption": "วงจรชีวิตและการเชื่อมโยงสตอเรจใน Kubernetes: Pod -> Volume -> PVC -> StorageClass -> PV"
    },
    "lead": "วอลุ่ม (Volume) ใน Kubernetes เข้ามาแก้ปัญหาข้อจำกัดของระบบไฟล์ในคอนเทนเนอร์ที่มีอายุชั่วคราว (Ephemeral) โดยช่วยรักษาข้อมูลให้คงอยู่แม้คอนเทนเนอร์จะแครชหรือรีสตาร์ต และช่วยให้คอนเทนเนอร์หลายตัวในพอดเดียวกันสามารถแบ่งปันไฟล์ข้อมูลร่วมกันได้อย่างมีประสิทธิภาพ",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nVolume ใน Kubernetes เป็นระบบ Abstraction ของไดเรกทอรีพื้นที่จัดเก็บข้อมูลที่เมานต์เข้าไปในคอนเทนเนอร์ เพื่อแก้ปัญหาข้อมูลสูญหายเมื่อคอนเทนเนอร์แครชหรือรีสตาร์ต โดย Volume มีอายุขัยผูกติดอยู่กับตัว Pod (ไม่ใช่ตัวคอนเทนเนอร์) จึงช่วยรักษาข้อมูลและเปิดให้คอนเทนเนอร์หลายตัวในพอดเดียวกันสามารถแชร์ไฟล์ร่วมกันได้\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **`emptyDir`**: ไดเรกทอรีว่างที่สร้างขึ้นเมื่อพอดถูกกำหนดลงโหนด ข้อมูลจะหายไปเมื่อพอดถูกลบออกจากโหนด (สามารถตั้ง `medium: \"Memory\"` เพื่อใช้ Linux tmpfs ในแรมได้) เหมาะสำหรับแคชชั่วคราวหรือแชร์ข้อมูลระหว่างคอนเทนเนอร์\n* **`hostPath`**: เมานต์ไฟล์หรือโฟลเดอร์จากเครื่องแม่ข่าย (Worker Node) เข้ามาในพอด มีความเสี่ยงด้านความปลอดภัยสูง ควรใช้เฉพาะ System DaemonSets (เช่น Fluentd อ่าน `/var/log`)\n* **Config-driven Volumes**: `configMap`, `secret`, `downwardAPI`, และ `projected` ใช้สำหรับแปลงคอนฟิก รหัสผ่าน หรือ Metadata ให้กลายเป็นไฟล์ในเครื่อง\n* **Persistent Storage**: `persistentVolumeClaim` (PVC) ใช้เชื่อมต่อดิสก์ถาวรภายนอกที่ข้อมูลไม่หายแม้พอดถูกลบ\n* **volumeMounts Configuration**: `mountPath` (จุดเมานต์ในคอนเทนเนอร์), `subPath` (เมานต์เฉพาะไฟล์ย่อยโดยไม่เขียนทับไดเรกทอรีเดิม), `readOnly: true` (ป้องกันการแก้ไขไฟล์)\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* ข้อสอบมักให้ออกแบบ Multi-Container Pod โดยใช้ `emptyDir` เพื่อแชร์ข้อมูลระหว่าง Main App กับ Logging/Sidecar Container\n* โครงสร้างสเปกที่ต้องจับคู่กัน: `spec.volumes[*].name` ต้องตรงกับ `spec.containers[*].volumeMounts[*].name`\n* คำสั่งตรวจสอบ Volume และ Mount Path: `kubectl describe pod <pod-name>`\n* คำสั่งทดสอบเข้าไปดูไฟล์ในไดเรกทอรีที่เมานต์: `kubectl exec <pod-name> -c <container-name> -- ls -la <mountPath>`",
    "sections": [
      {
        "id": "why-volumes",
        "headingEn": "Why Volumes? The Container Filesystem Challenge",
        "headingTh": "ทำไมต้องมี Volume? ปัญหาของระบบไฟล์บนคอนเทนเนอร์",
        "contentMarkdown": "ระบบไฟล์เริ่มต้นของคอนเทนเนอร์ (On-disk Container Filesystem) มีข้อจำกัดสำคัญ 2 ประการ:\n\n1. **ข้อมูลสูญหายเมื่อคอนเทนเนอร์หยุดทำงาน**: หากคอนเทนเนอร์แครชหรือถูกทำลาย kubelet จะสั่งรีสตาร์ตคอนเทนเนอร์ขึ้นมาใหม่ในสถานะว่างเปล่า (Clean State) ไฟล์ทั้งหมดที่ถูกเขียนขึ้นใหม่จะสูญหายทันที\n2. **การแชร์ไฟล์ระหว่างคอนเทนเนอร์ในพอดเดียวกันทำไม่ได้**: เมื่อคุณรันแอปพลิเคชันแบบ Multi-container เช่น คอนเทนเนอร์หลักทำงานร่วมกับ Logging Sidecar คอนเทนเนอร์ทั้งสองตัวจะไม่สามารถมองเห็นไฟล์ของกันและกันได้เลย\n\n**Kubernetes Volume Abstraction** แก้ปัญหานี้โดยนิยามว่า:\n* Volume เป็นไดเรกทอรีที่ถูกเมานต์เข้าไปในคอนเทนเนอร์ ณ จุด `mountPath` ที่ระบุ\n* มีอายุขัย (Lifetime) ผูกติดอยู่กับตัว **Pod** (ไม่ใช่ตัวคอนเทนเนอร์) ดังนั้นข้อมูลใน Volume จึงคงอยู่เสมอแม้คอนเทนเนอร์ภายในจะแครชและรีสตาร์ตใหม่กี่ครั้งก็ตาม\n* คอนเทนเนอร์ทุกตัวในพอดเดียวกันสามารถเมานต์ Volume ตัวเดียวกันได้พร้อมกัน"
      },
      {
        "id": "volume-types-overview",
        "headingEn": "Common Types of Volumes",
        "headingTh": "ประเภทของวอลุ่มที่ใช้งานบ่อย",
        "contentMarkdown": "Kubernetes รองรับชนิดของ Volume ที่หลากหลายเพื่อให้ตอบโจทย์ทุกความต้องการ:\n\n* **`emptyDir`**: ไดเรกทอรีว่างที่ถูกสร้างขึ้นเมื่อพอดถูกกำหนดลงโหนด ข้อมูลจะหายไปเมื่อพอดถูกลบออกจากโหนด เหมาะสำหรับแคชชั่วคราวหรือพื้นที่แลกเปลี่ยนไฟล์ระหว่างคอนเทนเนอร์\n* **`hostPath`**: เมานต์ไฟล์หรือไดเรกทอรีจากระบบไฟล์ของเครื่อง Worker Node เข้ามาในพอด (เหมาะสำหรับ System Daemons แต่มีความเสี่ยงด้านความปลอดภัย)\n* **`configMap` และ `secret`**: แปลงข้อมูลคอนฟิกหรือรหัสผ่านใน Kubernetes API ให้กลายเป็นไฟล์ในเครื่อง เพื่อให้โปรแกรมอ่านได้โดยไม่ต้องแก้โค้ด\n* **`persistentVolumeClaim` (PVC)**: เชื่อมต่อพื้นที่จัดเก็บข้อมูลถาวรภายนอก (เช่น Cloud Block Storage, NFS, Ceph) ซึ่งข้อมูลจะคงอยู่ตลอดไปแม้ตัวพอดจะถูกลบ\n* **`downwardAPI`**: นำค่า Metadata ของพอด (เช่น Pod IP, Namespace, Resource Limits) มาแสดงเป็นไฟล์ข้อความ\n* **`projected`**: รวมศูนย์แหล่งข้อมูลหลายชนิด (Secrets, ConfigMaps, DownwardAPI, ServiceAccountTokens) เข้ามาอยู่ในไดเรกทอรีเดียวกัน"
      },
      {
        "id": "emptydir-and-hostpath-deep-dive",
        "headingEn": "Deep Dive: emptyDir and hostPath",
        "headingTh": "เจาะลึก emptyDir และ hostPath พร้อมข้อควรระวัง",
        "contentMarkdown": "### 1. emptyDir และการใช้ RAM (tmpfs)\nตามปกติ `emptyDir` จะถูกเขียนลงบนดิสก์ของ Worker Node แต่หากคุณต้องการความเร็วสูงมากในการประมวลผล (เช่น เก็บแคชเซสชันสั้นๆ) คุณสามารถตั้งค่า `medium: \"Memory\"` ได้ ซึ่ง kubelet จะสร้าง Linux **tmpfs (RAM-backed filesystem)** ให้แทน โดยความจุจะถูกนับรวมใน Memory Limit ของพอด\n\n### 2. hostPath และข้อควรระวังด้านความปลอดภัย\n> [!CAUTION]\n> **คำเตือนความปลอดภัย**: `hostPath` เปิดโอกาสให้พอดสามารถเข้าถึงระบบไฟล์หลักของเครื่อง Host Node ได้ หากพอดถูกผู้ไม่ประสงค์ดีโจมตี อาจส่งผลกระทบต่อทั้งโหนดและพอดอื่นๆ ในเครื่องเดียวกัน\n\n* หลีกเลี่ยงการใช้ `hostPath` กับแอปพลิเคชันทั่วไป ควรใช้เฉพาะ System DaemonSets เช่น ตัวรวบรวม Log (Fluentd) ที่จำเป็นต้องอ่าน `/var/log` ของเครื่องแม่ข่าย\n* พอดที่ใช้ `hostPath` จะไม่สามารถย้ายไปรันบนโหนดอื่นได้อย่างราบรื่นหากไฟล์ในโหนดใหม่ไม่มีอยู่จริง"
      },
      {
        "id": "volume-mounts-configuration",
        "headingEn": "Mounting Volumes with volumeMounts",
        "headingTh": "การกำหนดค่าการเมานต์ (volumeMounts)",
        "contentMarkdown": "ภายใต้คอนเทนเนอร์แต่ละตัว คุณสามารถกำหนดตัวเลือกการเมานต์ได้ดังนี้:\n* **`mountPath`**: ตำแหน่งปลายทางภายในคอนเทนเนอร์ที่ต้องการให้นำ Volume ไปวาง (เช่น `/app/data`)\n* **`subPath`**: ระบุเพื่อเมานต์เฉพาะไฟล์ย่อยหรือโฟลเดอร์ย่อยจาก Volume โดย**ไม่เขียนทับ**ไฟล์เดิมที่มีอยู่แล้วในไดเรกทอรีปลายทาง\n* **`readOnly: true`**: ป้องกันไม่ให้คอนเทนเนอร์เขียนแก้ไขไฟล์ใน Volume นั้น (เหมาะสำหรับ ConfigMap และ Secret)\n* **`mountPropagation`**: สำหรับแอปพลิเคชันขั้นสูง (เช่น CSI Driver) ในการแชร์ Mount Point ข้ามระหว่าง Host และ Container"
      },
      {
        "id": "manifest-and-examples",
        "headingEn": "Multi-Container Pod Volume Manifest",
        "headingTh": "ตัวอย่าง Manifest การแชร์ Volume ระหว่าง 2 คอนเทนเนอร์",
        "contentMarkdown": "ตัวอย่างการใช้ `emptyDir` เพื่อให้คอนเทนเนอร์เว็บแอปพลิเคชันเขียน Access Log ลงในไดเรกทอรีร่วม และคอนเทนเนอร์ Sidecar ทำหน้าที่อ่าน Log นั้นไปประมวลผล:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "shared-volume-pod.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: shared-volume-demo\nspec:\n  volumes:\n  - name: shared-logs\n    emptyDir: {}\n  - name: config-volume\n    configMap:\n      name: app-config\n  containers:\n  # คอนเทนเนอร์หลัก: สร้างข้อมูล Log\n  - name: web-app\n    image: nginx:alpine\n    volumeMounts:\n    - name: shared-logs\n      mountPath: /var/log/nginx\n    - name: config-volume\n      mountPath: /etc/nginx/conf.d\n      readOnly: true\n  # คอนเทนเนอร์ Sidecar: อ่าน Log จาก Volume เดียวกัน\n  - name: log-collector\n    image: busybox:1.28\n    command: [\"sh\", \"-c\", \"tail -n+1 -f /var/log/nginx/access.log\"]\n    volumeMounts:\n    - name: shared-logs\n      mountPath: /var/log/nginx\n      readOnly: true"
          },
          {
            "lang": "bash",
            "label": "คำสั่งตรวจสอบ Volume ใน Pod",
            "code": "# ตรวจสอบรายละเอียด Volume และ Mount Point ภายใน Pod\nkubectl describe pod shared-volume-demo\n\n# ทดสอบเข้าไปดูไฟล์ในไดเรกทอรีที่เมานต์ไว้\nkubectl exec shared-volume-demo -c web-app -- ls -la /var/log/nginx"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Persistent Volumes (PV & PVC)](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) สำหรับพื้นที่จัดเก็บข้อมูลถาวรข้ามวงจรชีวิตของพอด\n* ศึกษา [StorageClasses](https://kubernetes.io/docs/concepts/storage/storage-classes/) สำหรับการจัดสรรพื้นที่อัตโนมัติ (Dynamic Provisioning)\n* ศึกษา [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) และ [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) สำหรับการเมานต์ไฟล์คอนฟิก"
      }
    ],
    "relatedLinks": [
      {
        "title": "Persistent Volumes (สตอเรจถาวรและ PVC)",
        "targetType": "concepts",
        "targetPageId": "storage-persistent-volumes",
        "officialUrl": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/"
      },
      {
        "title": "StorageClasses (การจัดสรรสตอเรจไดนามิก)",
        "targetType": "concepts",
        "targetPageId": "storage-classes-dynamic",
        "officialUrl": "https://kubernetes.io/docs/concepts/storage/storage-classes/"
      },
      {
        "title": "ConfigMaps (คอนฟิกแมป)",
        "targetType": "concepts",
        "targetPageId": "config-configmap",
        "officialUrl": "https://kubernetes.io/docs/concepts/configuration/configmap/"
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
