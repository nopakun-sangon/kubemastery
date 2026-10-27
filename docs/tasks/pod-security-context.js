/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
 */
(function (root) {
  const pageData = {
  "id": "pod-security-context",
  "categoryId": "configure-pods",
  "categoryTitle": "Configure Pods and Containers",
  "titleEn": "Configure a Security Context for a Pod or Container",
  "titleTh": "การตั้งค่า Security Context สำหรับพอดและคอนเทนเนอร์",
  "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/security-context/",
  "docsPath": "/docs/tasks/configure-pod-container/security-context/",
  "lead": "Security Context คือการกำหนดการตั้งค่าสิทธิ์และการควบคุมการเข้าถึงระดับระบบปฏิบัติการ (Linux Security Controls) เช่น User ID (UID), Group ID (GID), Linux Capabilities, Filesystem permissions, และ Seccomp Profile ให้กับพอดหรือคอนเทนเนอร์",
  "sections": [
    {
      "id": "security-context-scope",
      "headingEn": "Security Context Scope: Pod-level vs Container-level",
      "headingTh": "ขอบเขตของ Security Context: ระดับพอด vs ระดับคอนเทนเนอร์",
      "contentMarkdown": "การตั้งค่า Security Context แบ่งออกเป็นสองระดับชั้นที่มีความสัมพันธ์กัน:\n\n* **ระดับ Pod (`pod.spec.securityContext`)**:\n  มีผลบังคับใช้กับคอนเทนเนอร์ทุกตัวในพอด และรวมถึง Volumes ที่เมานต์เข้ามาด้วย เช่น `runAsUser`, `runAsGroup`, `fsGroup`\n* **ระดับ Container (`pod.spec.containers[*].securityContext`)**:\n  มีผลเฉพาะเจาะจงกับคอนเทนเนอร์นั้นๆ โดยค่าในระดับนี้จะทำการ **Override** ค่าที่กำหนดไว้ในระดับ Pod เสมอ นอกจากนี้ยังมีฟิลด์เฉพาะระดับคอนเทนเนอร์ เช่น `capabilities`, `readOnlyRootFilesystem`, และ `allowPrivilegeEscalation`",
      "codeBlocks": []
    },
    {
      "id": "configure-runasnonroot-and-uid",
      "headingEn": "Configuring Non-Root Execution (runAsNonRoot, runAsUser, fsGroup)",
      "headingTh": "การบังคับไม่ให้รันด้วย Root และการระบุ UID/GID/fsGroup",
      "contentMarkdown": "เพื่อปฏิบัติตามมาตรฐานความปลอดภัยสูงสุด ควรหลีกเลี่ยงการรันโพรเซสในคอนเทนเนอร์ด้วยสิทธิ์ Root (UID 0)\n\n* `runAsUser: 1000`: บังคับให้โพรเซสทำงานภายใต้ UID 1000\n* `runAsGroup: 3000`: บังคับให้โพรเซสทำงานภายใต้ GID หลัก 3000\n* `fsGroup: 2000`: สั่งให้ไฟล์ทั้งหมดที่ถูกสร้างขึ้นใน Volume ที่เมานต์เข้ามา มีความเป็นเจ้าของโดย Group ID 2000",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "security-context-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: security-context-demo\nspec:\n  securityContext:\n    runAsUser: 1000\n    runAsGroup: 3000\n    fsGroup: 2000\n  volumes:\n  - name: sec-ctx-vol\n    emptyDir: {}\n  containers:\n  - name: sec-ctx-demo\n    image: busybox:1.28\n    command: [ \"sh\", \"-c\", \"sleep 1h\" ]\n    volumeMounts:\n    - name: sec-ctx-vol\n      mountPath: /data/demo\n    securityContext:\n      allowPrivilegeEscalation: false"
        },
        {
          "lang": "bash",
          "label": "verify-uid-gid.sh",
          "code": "# สร้างพอดและเข้าไปตรวจสอบ UID และ GID ภายใน\nkubectl apply -f security-context-pod.yaml\nkubectl exec -it security-context-demo -- id\n# ผลลัพธ์: uid=1000 gid=3000 groups=2000"
        }
      ]
    },
    {
      "id": "linux-capabilities",
      "headingEn": "Granting and Dropping Linux Capabilities",
      "headingTh": "การเพิ่มหรือลดสิทธิ์ระบบ Linux Capabilities",
      "contentMarkdown": "ตามค่าเริ่มต้น Docker/Containerd จะให้สิทธิ์ Linux Capabilities บางส่วนกับคอนเทนเนอร์ แต่ตามแนวคิด Least Privilege เราควรทำการ **Drop สิทธิ์ทั้งหมดทิ้ง** ด้วย `drop: [\"ALL\"]` แล้วเพิ่มกลับเข้ามาเฉพาะความสามารถที่แอปพลิเคชันจำเป็นต้องใช้งานจริงๆ",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "drop-capabilities-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: security-capabilities-demo\nspec:\n  containers:\n  - name: sec-capabilities-ctr\n    image: alpine\n    command: [\"sleep\", \"3600\"]\n    securityContext:\n      capabilities:\n        drop:\n        - ALL\n        add:\n        - NET_BIND_SERVICE"
        }
      ]
    },
    {
      "id": "filesystem-protections",
      "headingEn": "Read-Only Root Filesystem and Privilege Escalation Prevention",
      "headingTh": "การล็อกระบบไฟล์แบบอ่านอย่างเดียวและการป้องกันการยกระดับสิทธิ์",
      "contentMarkdown": "* **`readOnlyRootFilesystem: true`**:\n  ป้องกันไม่ให้โพรเซสหรือผู้บุกรุกสามารถเขียน แก้ไข หรือติดตั้งไฟล์ใดๆ ลงใน Root Filesystem ของคอนเทนเนอร์ หากต้องการเขียนไฟล์ชั่วคราว ให้เมานต์ `emptyDir` เข้ามาเฉพาะไดเรกทอรี เช่น `/tmp`\n* **`allowPrivilegeEscalation: false`**:\n  ควบคุมไม่ให้โพรเซสลูกได้รับสิทธิ์มากกว่าโพรเซสแม่ และป้องกันการใช้คำสั่งประเภท `setuid` binaries",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "readonly-rootfs-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: readonly-rootfs-demo\nspec:\n  containers:\n  - name: web\n    image: nginx:alpine\n    securityContext:\n      readOnlyRootFilesystem: true\n      allowPrivilegeEscalation: false\n    volumeMounts:\n    - mountPath: /var/cache/nginx\n      name: cache-vol\n    - mountPath: /var/run\n      name: run-vol\n  volumes:\n  - name: cache-vol\n    emptyDir: {}\n  - name: run-vol\n    emptyDir: {}"
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Configure Service Accounts for Pods",
      "targetType": "tasks",
      "targetPageId": "pod-configure-service-account",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/"
    },
    {
      "title": "Assign Memory and CPU Resources to Containers",
      "targetType": "tasks",
      "targetPageId": "pod-assign-memory-cpu",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/"
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
