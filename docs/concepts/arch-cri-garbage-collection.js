/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/architecture/cri/
 */
(function (root) {
  const pageData = {
    "id": "arch-cri-garbage-collection",
    "categoryId": "architecture",
    "categoryTitle": "Cluster Architecture",
    "titleEn": "Container Runtime Interface (CRI)",
    "titleTh": "อินเทอร์เฟซรันไทม์คอนเทนเนอร์ (CRI) และการเก็บกวาดขยะในระบบ (Garbage Collection)",
    "officialUrl": "https://kubernetes.io/docs/concepts/architecture/cri/",
    "docsPath": "/docs/concepts/architecture/cri/",
    "diagram": {
      "src": "images/docs/components-of-kubernetes.svg",
      "caption": "สถาปัตยกรรม CRI: Kubelet สื่อสารกับ Container Runtime (containerd, CRI-O) ผ่าน gRPC Socket บนเครื่องโหนด"
    },
    "lead": "Container Runtime Interface (CRI) คือมาตรฐาน API ที่เปิดให้ Kubelet สามารถเชื่อมต่อและใช้งาน Container Runtime ชนิดต่างๆ ได้อย่างอิสระโดยไม่ต้องคอมไพล์โค้ดใหม่ ส่วนระบบ Garbage Collection (GC) ทำหน้าที่ทำความสะอาดและกู้คืนทรัพยากรที่ไม่ได้ใช้งาน ทั้งคอนเทนเนอร์ อิมเมจ และออบเจกต์ที่ถูกลบ",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\n**CRI (Container Runtime Interface)** คือมาตรฐานอินเทอร์เฟซ gRPC ที่เชื่อมระหว่าง Kubelet กับ Container Runtime (เช่น containerd, CRI-O) เพื่อแยกการควบคุมระบบออกจากซอฟต์แวร์รันคอนเทนเนอร์ ส่วน **Garbage Collection (GC)** คือระบบเก็บกวาดทรัพยากรอัตโนมัติ ทั้งออบเจกต์ลูกที่ตกค้าง ซากคอนเทนเนอร์ที่ตายแล้ว และอิมเมจเก่าบนดิสก์\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n- **บริการหลักของ CRI**:\n  - `RuntimeService`: ควบคุมวงจรชีวิตของ Pod Sandbox (เน็ตเวิร์ก/สตอเรจกลาง) และ Container (Start, Stop, Exec)\n  - `ImageService`: ดึง ตรวจสอบ และลบ Container Images\n- **Cascading Deletion (การลบลูกตามแม่)**:\n  - ควบคุมผ่านฟิลด์ `metadata.ownerReferences`\n  - *Foreground*: รอให้ลูกถูกลบจนหมดก่อนแล้วจึงลบแม่\n  - *Background* (ดีฟอลต์): ลบแม่ทันที และ Garbage Collector เบื้องหลังจะตามลบลูก\n  - *Orphan*: ลบเฉพาะแม่ แต่ปล่อยให้ออบเจกต์ลูกยังคงทำงานต่อไป\n- **Image Garbage Collection บนโหนด**:\n  - เมื่อดิสก์ใช้งานเกิน `imageGCHighThresholdPercent` (ดีฟอลต์ 85%): Kubelet เริ่มลบอิมเมจเก่าที่ไม่ได้ใช้งานตามลำดับ LRU (Least Recently Used)\n  - ลบต่อเนื่องจนพื้นที่ดิสก์ลดลงมาถึง `imageGCLowThresholdPercent` (ดีฟอลต์ 80%): หยุดการลบ\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n- **การลบแบบ Orphan**: `kubectl delete deployment my-dep --cascade=orphan` (พอดจะยังคงอยู่แม้ Deployment ถูกลบ)\n- **ปัญหา DiskPressure**: หากดิสก์โหนดเต็มเกินกำหนด โหนดจะติด Condition `DiskPressure=True` ส่งผลให้ไม่รับพอดใหม่ และ Kubelet จะเร่งทำ Container/Image GC ทันที\n- **ตรวจสอบการเชื่อมต่อ CRI ของ Kubelet**: ตรวจสอบแฟ้ม `/var/lib/kubelet/kubeadm-flags.env` หรือตั้งค่าแฟล็ก `--container-runtime-endpoint` (เช่น `unix:///run/containerd/containerd.sock`) และใช้คำสั่ง `crictl` เช่น `crictl ps`, `crictl pods`, `crictl images`",
    "sections": [
      {
        "id": "what-is-cri",
        "headingEn": "What is CRI (Container Runtime Interface)?",
        "headingTh": "CRI คืออะไรและมีบทบาทอย่างไร?",
        "contentMarkdown": "ในยุคแรกเริ่มของ Kubernetes ตัวระบบผูกติดกับ Docker Engine เพียงตัวเดียว ต่อมาเมื่อเกิดรันไทม์ชนิดใหม่ๆ ขึ้น ชุมชนจึงได้ออกแบบ **Container Runtime Interface (CRI)** ขึ้นมาเป็นมาตรฐานกลาง\n\nCRI เป็นปลั๊กอินอินเทอร์เฟซที่ใช้โปรโตคอล **gRPC** โดยมี Kubelet ทำหน้าที่เป็น gRPC Client และ Container Runtime ทำหน้าที่เป็น gRPC Server ที่รับฟังคำสั่งผ่าน UNIX Domain Socket บนโหนด\n\n> [!NOTE]\n> ใน Kubernetes 1.24 เป็นต้นมา โค้ดเชื่อมต่อ Docker ดั้งเดิม (**Dockershim**) ได้ถูกถอดออกจากตัวแกนหลักของ Kubernetes อย่างสมบูรณ์ ทำให้ทุกคลัสเตอร์ต้องใช้ Container Runtime ที่รองรับมาตรฐาน CRI โดยตรง (เช่น containerd หรือ CRI-O)"
      },
      {
        "id": "cri-architecture-services",
        "headingEn": "CRI Architecture: RuntimeService and ImageService",
        "headingTh": "สถาปัตยกรรมและบริการหลักของ CRI",
        "contentMarkdown": "CRI แบ่งการให้บริการออกเป็น 2 ส่วนหลักผ่าน gRPC Services:\n\n### 1. `RuntimeService`\nรับผิดชอบการจัดการวงจรชีวิตของ Pod Sandbox และคอนเทนเนอร์:\n* **Pod Sandbox Management**: การสร้างและทำลายเนมสเปซเครือข่ายและสตอเรจส่วนกลางสำหรับพอด (`RunPodSandbox`, `StopPodSandbox`, `RemovePodSandbox`)\n* **Container Lifecycle**: การสร้าง สตาร์ต หยุด และลบคอนเทนเนอร์ (`CreateContainer`, `StartContainer`, `StopContainer`, `RemoveContainer`)\n* **Streaming Operations**: เปิดช่องทางสตรีมข้อมูลสำหรับการโต้ตอบสด เช่น `Exec`, `Attach`, และ `PortForward`\n\n### 2. `ImageService`\nรับผิดชอบการจัดการอิมเมจในระดับเครื่องโหนด:\n* ตรวจสอบรายการอิมเมจที่มีอยู่บนเครื่อง (`ListImages`)\n* ดึงอิมเมจลงมาจาก Container Registry (`PullImage`)\n* ดึงข้อมูลสถานะและสถิติขนาดของอิมเมจ (`ImageStatus`)\n* สั่งลบอิมเมจที่ไม่ต้องการออกจากดิสก์ (`RemoveImage`)"
      },
      {
        "id": "supported-runtimes",
        "headingEn": "Supported Container Runtimes",
        "headingTh": "รันไทม์ยอดนิยมและ Sandboxed Runtimes",
        "contentMarkdown": "Container Runtime ชั้นนำที่ใช้งานอย่างแพร่หลายในปัจจุบัน:\n\n* **`containerd`**: รันไทม์มาตรฐานอุตสาหกรรมที่แยกตัวออกมาจาก Docker ได้รับการดูแลโดย CNCF เป็นตัวเลือกอันดับหนึ่งสำหรับคลัสเตอร์ส่วนใหญ่ มีปลั๊กอิน `cri` ในตัว\n* **`CRI-O`**: รันไทม์ของ Red Hat ที่ถูกสร้างขึ้นมาเพื่อให้ทำงานกับ Kubernetes CRI โดยเฉพาะ เน้นความเบาและความปลอดภัยสูง\n* **Sandboxed Runtimes (การแยกส่วนระดับสูง)**: สำหรับเวิร์กโหลดที่ไม่น่าไว้วางใจ (Untrusted Workloads) หรือ Multi-tenant คลัสเตอร์ สามารถใช้ CRI สื่อสารกับรันไทม์ที่จำลองเคอร์เนลหรือรันเป็น MicroVM เช่น **gVisor** (`runsc`) หรือ **Kata Containers** ผ่านฟีเจอร์ `RuntimeClass`"
      },
      {
        "id": "object-garbage-collection",
        "headingEn": "Kubernetes Object Garbage Collection",
        "headingTh": "การเก็บกวาดออบเจกต์ในระบบ (Object Cascading Deletion)",
        "contentMarkdown": "Garbage Collection ในระดับ Kubernetes API มีหน้าที่ลบออบเจกต์ที่ไม่มีเจ้าของ หรือออบเจกต์ลูกเมื่อออบเจกต์แม่ถูกลบ โดยพิจารณาจากฟิลด์ **`metadata.ownerReferences`**:\n\nเมื่อผู้ใช้สั่งลบออบเจกต์แม่ (เช่น Deployment) จะมีโหมดการลบลูก (Cascading Deletion) ให้เลือก 3 รูปแบบ:\n\n1. **Foreground Cascading Deletion**:\n   * ออบเจกต์แม่จะเข้าสู่สถานะ \"กำลังถูกลบ\" (`deletionTimestamp` ถูกเซต) แต่จะยังคงอยู่จนกว่าออบเจกต์ลูกทั้งหมด (เช่น ReplicaSet และ Pods) จะถูกลบจนหมดสิ้นก่อน จากนั้นออบเจกต์แม่จึงจะหายไป\n2. **Background Cascading Deletion (ค่าเริ่มต้น)**:\n   * Kubernetes จะลบออบเจกต์แม่ทิ้งทันที จากนั้น Garbage Collector Controller ในเบื้องหลังจะค่อยๆ ทยอยลบออบเจกต์ลูกตามทีหลัง\n3. **Orphan Deletion**:\n   * ลบเฉพาะออบเจกต์แม่ทิ้ง แต่ปล่อยให้ออบเจกต์ลูกยังคงทำงานต่อไปเสมือนเด็กกำพร้า (Orphaned pods)"
      },
      {
        "id": "container-and-pod-gc",
        "headingEn": "Container and Pod Garbage Collection",
        "headingTh": "การเก็บกวาดคอนเทนเนอร์และพอดที่หยุดทำงาน",
        "contentMarkdown": "บน Worker Node แต่ละเครื่อง Kubelet จะคอยตรวจสอบและกำจัดซากคอนเทนเนอร์ที่หยุดทำงานไปแล้ว (Dead Containers) เพื่อคืนพื้นที่ดิสก์และทรัพยากรระบบ:\n\n* **เกณฑ์การเก็บกวาดคอนเทนเนอร์ (Dead Container GC)**:\n  * ควบคุมผ่านการตั้งค่าของ Kubelet เช่น จำนวนคอนเทนเนอร์ที่ตายแล้วสูงสุดที่ยอมให้เก็บไว้ต่อพอด (`maximum-dead-containers-per-container`)\n  * จำนวนคอนเทนเนอร์ที่ตายแล้วรวมทั้งเครื่อง (`maximum-dead-containers`)\n* **Pod Garbage Collection (PodGC Controller)**:\n  * คอนโทรลเลอร์ใน Control Plane จะคอยลบพอดที่ทำงานเสร็จสมบูรณ์หรือล้มเหลว (`Completed` หรือ `Failed`) หากมีจำนวนสะสมเกินกว่าค่าขีดจำกัด (`terminated-pod-gc-threshold` ซึ่งค่าเริ่มต้นคือ 12,500 พอด)"
      },
      {
        "id": "image-garbage-collection",
        "headingEn": "Image Garbage Collection on Nodes",
        "headingTh": "การเก็บกวาดอิมเมจบนเครื่องโหนด (Image GC Thresholds)",
        "contentMarkdown": "Kubelet มีระบบเก็บกวาด Image อัตโนมัติ โดยอ้างอิงจากอัตราการใช้งานพื้นที่ดิสก์ของพาร์ติชันที่เก็บอิมเมจและคอนเทนเนอร์ ผ่าน 2 พารามิเตอร์สำคัญ:\n\n* **`imageGCHighThresholdPercent` (ค่าดีฟอลต์ 85%)**:\n  เมื่อพื้นที่ดิสก์ถูกใช้งานเกิน 85% Kubelet จะสั่งเริ่มกระบวนการ Image Garbage Collection ทันที\n* **`imageGCLowThresholdPercent` (ค่าดีฟอลต์ 80%)**:\n  Kubelet จะทยอยลบอิมเมจที่ไม่ได้ถูกใช้งานโดยพอดใดๆ ในขณะนั้น (Unused Images) ออกไปเรื่อยๆ จนกระทั่งการใช้งานดิสก์ลดลงมาแตะที่ 80% จึงจะหยุดการลบ\n\n### ลำดับการลบอิมเมจ (LRU - Least Recently Used):\nKubelet จะจัดเรียงอิมเมจตามเวลาที่ถูกเรียกใช้งานล่าสุด อิมเมจใดที่ไม่ได้ถูกหยิบมาสร้างคอนเทนเนอร์เป็นเวลานานที่สุดจะถูกเลือกลบก่อนเสมอ",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "kubelet-config-example.yaml",
            "code": "apiVersion: kubelet.config.k8s.io/v1beta1\nkind: KubeletConfiguration\nimageGCHighThresholdPercent: 80\nimageGCLowThresholdPercent: 70\nimageMinimumGCAge: 2m"
          }
        ]
      }
    ],
    "relatedLinks": [
      {
        "title": "Nodes in Kubernetes (สถาปัตยกรรมโหนด)",
        "targetType": "concepts",
        "targetPageId": "arch-nodes",
        "officialUrl": "https://kubernetes.io/docs/concepts/architecture/nodes/"
      },
      {
        "title": "Container Images (อิมเมจคอนเทนเนอร์)",
        "targetType": "concepts",
        "targetPageId": "containers-images",
        "officialUrl": "https://kubernetes.io/docs/concepts/containers/images/"
      },
      {
        "title": "Controllers and Leases",
        "targetType": "concepts",
        "targetPageId": "arch-controllers-leases",
        "officialUrl": "https://kubernetes.io/docs/concepts/architecture/controller/"
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
