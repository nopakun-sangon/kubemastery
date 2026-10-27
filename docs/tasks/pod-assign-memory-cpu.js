/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/
 */
(function (root) {
  const pageData = {
  "id": "pod-assign-memory-cpu",
  "categoryId": "configure-pods",
  "categoryTitle": "Configure Pods and Containers",
  "titleEn": "Assign Memory Resources to Containers and Pods",
  "titleTh": "การจัดสรรหน่วยความจำและ CPU ให้กับคอนเทนเนอร์",
  "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/",
  "docsPath": "/docs/tasks/configure-pod-container/assign-memory-resource/",
  "lead": "การระบุ Requests และ Limits สำหรับ CPU และ Memory ช่วยให้ Kubernetes จัดตารางการทำงานของ Pod ไปยังโหนดที่มีทรัพยากรเพียงพอ และจำกัดไม่ให้คอนเทนเนอร์ใช้งานเกินขอบเขตจนส่งผลกระทบต่อคอนเทนเนอร์อื่น",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nการระบุ `requests` และ `limits` ใน Pod Specification ช่วยให้ Kubernetes Scheduler เลือกจัดวาง Pod ลงบนโหนดที่มีทรัพยากรเพียงพอ และจำกัดขอบเขตการใช้งานเพื่อไม่ให้คอนเทนเนอร์ตัวใดตัวหนึ่งแย่งทรัพยากรจนกระทบต่อระบบส่วนรวม\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **Requests vs Limits**:\n  - `requests`: ทรัพยากรขั้นต่ำที่ระบบรับประกันว่าจะต้องมีให้คอนเทนเนอร์ (Scheduler นำค่านี้ไปคำนวณหา Node ที่เหมาะสม)\n  - `limits`: เพดานสูงสุดที่คอนเทนเนอร์ได้รับอนุญาตให้ใช้\n* **พฤติกรรมของ CPU (Compressible Resource)**:\n  - หน่วยวัด: `1` คือ 1 Core / vCPU, `500m` คือ 0.5 Core (500 millicores)\n  - หากใช้เกิน limit จะถูก **CPU Throttling** (การประมวลผลจะช้าลง แต่โพรเซสจะไม่ถูก Kill)\n* **พฤติกรรมของ Memory (Incompressible Resource)**:\n  - หน่วยวัด: ตัวคูณฐาน 2 เช่น `128Mi`, `1Gi`\n  - หากใช้เกิน limit จะถูก Linux OOM Killer ส่งสัญญาณ `SIGKILL` ทำให้ Pod ขึ้นสถานะ **OOMKilled (Exit Code 137)** ทันที\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* โครงสร้าง YAML ในพอด:\n  ```yaml\n  resources:\n    requests:\n      memory: \"64Mi\"\n      cpu: \"250m\"\n    limits:\n      memory: \"128Mi\"\n      cpu: \"500m\"\n  ```\n* ตรวจสอบทรัพยากรแบบเรียลไทม์:\n  ```bash\n  kubectl top pod <pod-name> --containers\n  kubectl top node\n  ```\n* ดีบักพอดที่ล้มเหลว: ใช้ `kubectl describe pod <pod-name>` ดูฟิลด์ `Last State: Terminated` และเหตุผล `Reason: OOMKilled`",
  "sections": [
    {
      "id": "resource-units-and-requests-vs-limits",
      "headingEn": "Resource Units and Requests vs Limits Concepts",
      "headingTh": "หน่วยวัดทรัพยากรและแนวคิด Requests vs Limits",
      "contentMarkdown": "เมื่อระบุทรัพยากรให้กับคอนเทนเนอร์ใน Pod Specification คุณต้องเข้าใจหน่วยและการทำงานของสองค่าหลัก:\n\n* **หน่วยวัด CPU**:\n  วัดในหน่วย Cores โดย `1` หมายถึง 1 vCPU / Core และสามารถแบ่งย่อยเป็น millicores เช่น `500m` หมายถึง 0.5 Core หรือ 50% ของ 1 vCPU\n* **หน่วยวัด Memory**:\n  วัดในหน่วย Bytes โดยนิยมใช้ตัวย่อฐาน 2 (Power of 2): `Ki` (Kibibyte), `Mi` (Mebibyte), `Gi` (Gibibyte) เช่น `256Mi` หรือ `1Gi`\n* **Request (การจองขั้นต่ำ)**:\n  ใช้โดย **kube-scheduler** ในการเลือกโหนดที่จะนำพอดไปวาง หากโหนดไม่มีทรัพยากรเหลือเพียงพอเท่ากับค่า Request พอดจะไม่สามารถวางบนโหนดนั้นได้\n* **Limit (เพดานการใช้งานสูงสุด)**:\n  ใช้โดย Linux **cgroups** บนโหนดเพื่อควบคุมไม่ให้คอนเทนเนอร์ใช้งานเกินขีดจำกัดที่กำหนดไว้",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "resource-spec-snippet.yaml",
          "code": "resources:\n  requests:\n    memory: \"256Mi\"\n    cpu: \"250m\"\n  limits:\n    memory: \"512Mi\"\n    cpu: \"500m\""
        }
      ]
    },
    {
      "id": "assign-memory-resources",
      "headingEn": "Assigning Memory Request and Limit to a Container",
      "headingTh": "การกำหนด Memory Request และ Limit และพฤติกรรม OOMKilled",
      "contentMarkdown": "การกำหนด Memory ให้กับ Container ใน Pod ช่วยรับประกันว่าคอนเทนเนอร์จะได้หน่วยความจำเพียงพอ\n\n> ข้อควรระวัง: Memory เป็น Incompressible Resource หากคอนเทนเนอร์พยายามใช้หน่วยความจำเกินค่า `limits.memory` ระบบเคอร์เนล Linux Out of Memory (OOM) Killer จะบังคับยุติการทำงานของโพรเซสทันที และ Kubernetes จะขึ้นสถานะพอดเป็น `OOMKilled` (Exit Code 137) แล้วทำการรีสตาร์ทพอดใหม่ตาม restartPolicy",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "memory-demo-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: memory-demo\nspec:\n  containers:\n  - name: memory-demo-ctr\n    image: polinux/stress\n    resources:\n      requests:\n        memory: \"100Mi\"\n      limits:\n        memory: \"200Mi\"\n    command: [\"stress\"]\n    args: [\"--vm\", \"1\", \"--vm-bytes\", \"150M\", \"--vm-hang\", \"1\"]"
        },
        {
          "lang": "bash",
          "label": "apply-and-verify-memory.sh",
          "code": "# สร้างพอดทดสอบ memory\nkubectl apply -f memory-demo-pod.yaml\n\n# ตรวจสอบสถานะและปริมาณการใช้งาน\nkubectl get pod memory-demo\nkubectl top pod memory-demo"
        }
      ]
    },
    {
      "id": "assign-cpu-resources",
      "headingEn": "Assigning CPU Request and Limit to a Container",
      "headingTh": "การกำหนด CPU Request และ Limit และพฤติกรรม CPU Throttling",
      "contentMarkdown": "ไม่เหมือนกับ Memory ตัวประมวลผล **CPU เป็น Compressible Resource** เมื่อคอนเทนเนอร์พยายามใช้ CPU เกินกว่าค่า `limits.cpu` ที่กำหนด ระบบเคอร์เนลจะไม่ทำการ kill โพรเซส แต่จะทำการ **Throttle (บีบและหน่วงเวลาการประมวลผล)** ด้วย CFS (Completely Fair Scheduler) quota ทำให้แอปพลิเคชันทำงานช้าลงแต่ไม่หยุดทำงาน",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "cpu-demo-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: cpu-demo\nspec:\n  containers:\n  - name: cpu-demo-ctr\n    image: vish/stress\n    resources:\n      limits:\n        cpu: \"1\"\n      requests:\n        cpu: \"500m\"\n    args:\n    - -cpus\n    - \"2\""
        },
        {
          "lang": "bash",
          "label": "apply-and-verify-cpu.sh",
          "code": "# สร้างพอดทดสอบ cpu\nkubectl apply -f cpu-demo-pod.yaml\n\n# ตรวจสอบการใช้งาน CPU จริง\nkubectl top pod cpu-demo"
        }
      ]
    },
    {
      "id": "monitoring-and-troubleshooting-resources",
      "headingEn": "Monitoring Resource Usage and Troubleshooting",
      "headingTh": "การตรวจสอบปริมาณการใช้ทรัพยากรและการแก้ไขปัญหา",
      "contentMarkdown": "การตรวจสอบการใช้งานทรัพยากรจริงเทียบกับค่าที่จัดสรรไว้ทำได้โดยใช้ Metrics Server:\n* คำสั่ง `kubectl top pod <pod-name>` แสดงปริมาณ CPU (millicores) และ Memory (MiB) ที่กำลังถูกใช้งานอยู่ ณ ปัจจุบัน\n* คำสั่ง `kubectl describe pod <pod-name>` แสดงค่า Requests/Limits และประวัติ Events เช่น สาเหตุที่พอดถูก OOMKilled",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "troubleshoot-resources.sh",
          "code": "# ตรวจสอบการใช้งานของพอดทั้งหมดในเนมสเปซ\nkubectl top pods\n\n# ดูรายละเอียดการจัดสรรทรัพยากรและเหตุการณ์ OOM\nkubectl describe pod memory-demo | grep -A 5 -B 2 \"Last State\""
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Configure Quality of Service for Pods",
      "targetType": "tasks",
      "targetPageId": "pod-quality-of-service",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/"
    },
    {
      "title": "Configure Memory and CPU Quotas for a Namespace",
      "targetType": "tasks",
      "targetPageId": "admin-resource-quota-namespace",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/"
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
