/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/containers/images/
 */
(function (root) {
  const pageData = {
    "id": "containers-images",
    "categoryId": "containers",
    "categoryTitle": "Containers",
    "titleEn": "Images",
    "titleTh": "คอนเทนเนอร์อิมเมจ (Container Images & ImagePullPolicy)",
    "officialUrl": "https://kubernetes.io/docs/concepts/containers/images/",
    "docsPath": "/docs/concepts/containers/images/",
    "lead": "คอนเทนเนอร์อิมเมจ (Container Image) คือแพ็กเกจไบนารีที่บรรจุโค้ดของแอปพลิเคชันและสิ่งที่จำเป็นในการรันทั้งหมด (Dependencies) ตามมาตรฐาน OCI โดย Kubernetes จะสั่งให้ Container Runtime บนแต่ละโหนดดึงอิมเมจเหล่านี้มารันเป็นคอนเทนเนอร์จริงภายในพอด",
    "sections": [
      {
        "id": "image-names-tags-digests",
        "headingEn": "Image Names, Tags, and Digests",
        "headingTh": "โครงสร้างชื่ออิมเมจ: Registry, Repository, Tag และ Digest",
        "contentMarkdown": "การอ้างอิงอิมเมจใน Kubernetes ประกอบด้วย 4 ส่วนสำคัญตามมาตรฐาน OCI (Open Container Initiative):\n\n`[REGISTRY_HOST[:PORT]/][NAMESPACE/]REPOSITORY[:TAG|@DIGEST]`\n\n* **Registry**: โดเมนของเซิร์ฟเวอร์ที่เก็บอิมเมจ (เช่น `docker.io`, `ghcr.io`, `gcr.io`, `quay.io`) หากไม่ระบุ ค่าดีฟอลต์ของ Docker/Kubernetes มักหมายถึง Docker Hub (`docker.io`)\n* **Repository**: ชื่อของคลังหรือแอปพลิเคชัน เช่น `library/nginx` หรือ `my-company/payment-service`\n* **Tag**: ป้ายกำกับเวอร์ชัน เช่น `:1.25.0` หรือ `:latest` (คำเตือน: Tag สามารถถูกเขียนทับได้ จึงไม่การันตีว่าจะได้โค้ดเดิมเสมอ)\n* **Digest**: แฮชระบุเนื้อหาของอิมเมจที่แท้จริงแบบ SHA256 (เช่น `@sha256:45b23dee08af5e...`) ซึ่งเป็นสิ่งที่ไม่สามารถเปลี่ยนแปลงได้ (**Immutable**) ทำให้การันตีได้ 100% ว่าทุกโหนดในคลัสเตอร์จะได้ไบนารีเดียวกันทุกประการ"
      },
      {
        "id": "image-pull-policies",
        "headingEn": "Image Pull Policies: Always, IfNotPresent, and Never",
        "headingTh": "นโยบายการดึงอิมเมจ (Image Pull Policies)",
        "contentMarkdown": "ฟิลด์ `imagePullPolicy` บนแต่ละคอนเทนเนอร์ใน PodSpec ควบคุมว่า Kubelet จะพยายามดึง (Pull) อิมเมจลงมาจาก Registry เมื่อใด:\n\n### 1. `IfNotPresent` (ค่าเริ่มต้นเมื่อระบุแท็กเฉพาะ)\n* Kubelet จะตรวจสอบก่อนว่ามีอิมเมจนั้นอยู่ในเครื่องโหนด (Local Cache) แล้วหรือไม่\n* หากมีอยู่แล้ว จะใช้อิมเมจในเครื่องทันทีโดยไม่ติดต่อไปยัง Registry ช่วยประหยัดแบนด์วิดท์และทำให้พอดสตาร์ตเร็วขึ้น\n* หากยังไม่มี จึงจะทำการดาวน์โหลดจาก Registry\n\n### 2. `Always` (ค่าเริ่มต้นเมื่อใช้แท็ก `:latest` หรือไม่ระบุแท็ก)\n* ทุกครั้งที่พอดสตาร์ต Kubelet จะติดต่อไปยัง Registry เสมอ เพื่อตรวจสอบว่า Digest ของอิมเมจมีการเปลี่ยนแปลงหรือไม่ หากมีเวอร์ชันใหม่จะดึงมาทับทันที\n* หากการดึงล้มเหลว (เช่น ขาดการเชื่อมต่อเน็ตเวิร์ก) พอดจะสตาร์ตไม่สำเร็จแม้จะมีอิมเมจเดิมอยู่ในเครื่องก็ตาม\n\n### 3. `Never`\n* Kubelet จะไม่พยายามเชื่อมต่อไปยัง Registry เลย โดยจะสมมติว่ามีอิมเมจเตรียมไว้ในเครื่องล่วงหน้าแล้วเท่านั้น หากหาไม่พอบนเครื่อง พอดจะเข้าสู่สถานะ `ErrImageNeverPull` ทันที นิยมใช้ในคลัสเตอร์แบบ Air-gapped หรือการทดสอบภายในเครื่องผ่าน Kind/Minikube"
      },
      {
        "id": "private-registries-secrets",
        "headingEn": "Pulling from Private Registries",
        "headingTh": "การดึงอิมเมจจาก Private Registry ด้วย ImagePullSecrets",
        "contentMarkdown": "เมื่ออิมเมจถูกเก็บไว้ใน Private Registry ที่ต้องยืนยันตัวตน (เช่น Private Docker Hub, Harbor, AWS ECR, GCP Artifact Registry) คุณต้องสร้าง Secret ชนิด `kubernetes.io/dockerconfigjson` และนำไปผูกเข้ากับพอด:\n\n### 1. สร้าง Secret ผ่าน kubectl:\n`kubectl create secret docker-registry regcred --docker-server=https://index.docker.io/v1/ --docker-username=<user> --docker-password=<pass> --docker-email=<email>`\n\n### 2. ระบุ `imagePullSecrets` ใน Pod Manifest หรือผูกเข้ากับ ServiceAccount:\nหากผูกเข้ากับ ServiceAccount พอดทุกตัวที่ใช้ ServiceAccount นั้นจะดึงอิมเมจได้อัตโนมัติโดยไม่ต้องระบุ `imagePullSecrets` ในทุกไฟล์ Manifest ซ้ำๆ",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "pod-with-private-image.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: private-app\nspec:\n  containers:\n  - name: secure-processor\n    image: my-private-registry.io/org/processor:v2.1\n    imagePullPolicy: IfNotPresent\n  imagePullSecrets:\n  - name: regcred"
          }
        ]
      },
      {
        "id": "multi-architecture-images",
        "headingEn": "Multi-Architecture Images",
        "headingTh": "การรองรับสถาปัตยกรรมฮาร์ดแวร์หลากหลาย (Multi-Arch Images)",
        "contentMarkdown": "ในยุคที่มีคลัสเตอร์แบบไฮบริดซึ่งมีทั้งเครื่องสถาปัตยกรรม **`x86_64` (amd64)** และ **`ARM64`** (เช่น AWS Graviton หรือ Apple Silicon) OCI ได้กำหนดมาตรฐาน **Image Manifest List** (หรือ OCI Image Index):\n\n* ชื่ออิมเมจเดียว (เช่น `nginx:1.25.0`) จะชี้ไปยัง Manifest List ส่วนกลาง\n* เมื่อ Kubelet บนโหนด ARM64 สั่ง Pull อิมเมจ Container Runtime จะเลือกดาวน์โหลดเฉพาะ Layer ที่ตรงกับสถาปัตยกรรมของ CPU เครื่องนั้นๆ โดยอัตโนมัติ โดยที่ผู้ใช้ไม่ต้องเปลี่ยนชื่ออิมเมจใน PodSpec ให้ยุ่งยาก"
      },
      {
        "id": "node-level-authentication",
        "headingEn": "Node-Level Image Authentication",
        "headingTh": "การยืนยันตัวตนระดับโหนด (Kubelet Credential Providers)",
        "contentMarkdown": "บนระบบคลาวด์ขนาดใหญ่ แทนที่จะต้องสร้าง Secret ฝังไว้ในทุกเนมสเปซ Kubernetes รองรับการยืนยันตัวตนในระดับ Kubelet ผ่าน **Kubelet Credential Provider Plugins**:\n\n* ปลั๊กอินภายนอก (ไบนารี) จะทำงานร่วมกับ Cloud IAM Role ของโหนด (เช่น AWS IAM Instance Profile, GCP Service Account) เพื่อดึง Dynamic Auth Token มาให้อัตโนมัติ\n* Kubelet สามารถดึงอิมเมจจาก Private Cloud Registry ได้อย่างโปร่งใสโดยที่นักพัฒนาไม่จำเป็นต้องระบุ `imagePullSecrets` ใน YAML แต่อย่างใด"
      },
      {
        "id": "pre-pulling-best-practices",
        "headingEn": "Pre-pulling Images & Best Practices",
        "headingTh": "เทคนิคการ Pre-pull อิมเมจและแนวทางปฏิบัติที่ดีที่สุด",
        "contentMarkdown": "คำแนะนำเพื่อเพิ่มประสิทธิภาพและความเสถียรในการใช้งานอิมเมจบน Production:\n\n* **หลีกเลี่ยงการใช้แท็ก `:latest` ในระบบ Production**: เพราะไม่สามารถคาดเดาโค้ดได้ และหากพอดรีสตาร์ตอาจดึงเวอร์ชันที่ไม่เข้ากันลงมาโดยไม่รู้ตัว ควรใช้ Semantic Versioning (เช่น `:v1.4.2`) หรือ Digest SHA เสมอ\n* **ใช้ DaemonSet เพื่อทำ Pre-pulling**: หากอิมเมจมีขนาดใหญ่ (หลายกิกะไบต์) การรอให้พอดตัวแรกมาดึงอาจทำให้แอปพลิเคชันสตาร์ตช้าเกินไป สามารถปล่อย DaemonSet เปล่าที่มีอิมเมจนั้นไปรันล่วงหน้าเพื่อให้อิมเมจแคชอยู่บนทุกโหนดก่อนเริ่มปล่อยทราฟฟิกจริง\n* **สแกนช่องโหว่ความปลอดภัย (Vulnerability Scanning)**: ตรวจสอบอิมเมจใน CI/CD Pipeline และใช้ Admission Controllers (เช่น Trivy, Clair, Kyverno) บล็อกไม่อนุญาตให้อิมเมจที่มีช่องโหว่ระดับ Critical มารันในคลัสเตอร์"
      }
    ],
    "relatedLinks": [
      {
        "title": "Pods Overview (สถาปัตยกรรมพอด)",
        "targetType": "concepts",
        "targetPageId": "workloads-pods",
        "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/"
      },
      {
        "title": "Container Lifecycle Hooks",
        "targetType": "concepts",
        "targetPageId": "containers-lifecycle-hooks",
        "officialUrl": "https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/"
      },
      {
        "title": "Pull an Image from a Private Registry (Task)",
        "targetType": "tasks",
        "targetPageId": "inject-credentials-secrets",
        "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/"
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
