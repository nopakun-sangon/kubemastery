/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/
 */
(function (root) {
  const pageData = {
  "id": "inject-command-arguments",
  "categoryId": "inject-data",
  "categoryTitle": "Inject Data Into Applications",
  "titleEn": "Define a Command and Arguments for a Container",
  "titleTh": "การกำหนด Command และ Arguments ให้กับคอนเทนเนอร์",
  "officialUrl": "https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/",
  "docsPath": "/docs/tasks/inject-data-application/define-command-argument-container/",
  "lead": "การกำหนดหรือเขียนทับ (Override) คำสั่งเริ่มต้นและอาร์กิวเมนต์ที่ถูกระบุไว้ใน Container Image ช่วยให้ปรับแต่งพฤติกรรมการทำงานของแอปพลิเคชันได้อย่างยืดหยุ่นโดยไม่ต้อง Build Image ใหม่",
  "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nKubernetes อนุญาตให้เรากำหนดหรือเขียนทับคำสั่งเริ่มต้นของคอนเทนเนอร์อิมเมจผ่านฟิลด์ `command` และ `args` ใน Container Spec โดย `command` จะเข้าไปเขียนทับ `ENTRYPOINT` ของ Dockerfile ส่วน `args` จะเข้าไปเขียนทับ `CMD` ช่วยให้ปรับแต่งการทำงานของแอปพลิเคชันได้ทันทีโดยไม่ต้องเสียเวลา Build Image ใหม่\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **การจับคู่กับ Dockerfile**: `command` = `ENTRYPOINT`, `args` = `CMD`\n* **พฤติกรรมการ Override**:\n  * ไม่ระบุทั้งคู่ -> ใช้อิมเมจเดิมทั้ง `ENTRYPOINT` และ `CMD`\n  * ระบุเฉพาะ `command` -> ใช้ `command` ใหม่ และลบล้างทั้ง `ENTRYPOINT` และ `CMD` เดิมในอิมเมจ\n  * ระบุเฉพาะ `args` -> ใช้ `ENTRYPOINT` เดิม แต่เปลี่ยนพารามิเตอร์เป็น `args` ใหม่\n  * ระบุทั้งสองอย่าง -> เขียนทับค่าเริ่มต้นทั้งหมด\n* **การขยายตัวแปรสภาพแวดล้อม**: อ้างอิงตัวแปรในอาร์กิวเมนต์ได้ด้วยไวยากรณ์ `$(VAR_NAME)` (หากต้องการส่งเครื่องหมาย `$` จริงให้ escape ด้วย `$$`)\n* **การรันผ่าน Shell**: หากต้องการใช้ shell features (เช่น pipe, redirect, คำสั่งต่อกัน `&&`) ต้องเรียกผ่าน `/bin/sh -c` อย่างชัดเจน\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* **ฟิลด์ YAML**: อยู่ภายใต้ `spec.containers[*].command` และ `spec.containers[*].args` โดยรับค่าเป็น Array ของ Strings\n* **คำสั่งลัด CLI**: เมื่อสั่ง `kubectl run pod --image=... -- <args>` สิ่งที่อยู่หลัง `--` จะถูกส่งเป็น `args` ของคอนเทนเนอร์\n* **ข้อควรระวังในห้องสอบ**: เมื่อรันคำสั่งเชลล์หลายตัว ให้เขียนแบบ `command: [\"/bin/sh\", \"-c\", \"echo hello && sleep 3600\"]` ระวังอย่าลืมเครื่องหมาย quote และ comma\n* **ข้อควรระวังด้านความปลอดภัยและ Graceful Shutdown**: การรันผ่าน `/bin/sh -c` ทำให้เชลล์เป็น PID 1 หากต้องการให้แอปพลิเคชันได้รับสัญญาณ SIGTERM โดยตรง ควรเติม `exec` นำหน้าคำสั่ง เช่น `exec my-app`",
  "sections": [
    {
      "id": "command-args-docker-mapping",
      "headingEn": "Mapping Kubernetes command and args to Docker ENTRYPOINT and CMD",
      "headingTh": "การเปรียบเทียบคำสั่งระหว่าง Kubernetes (command/args) กับ Dockerfile (ENTRYPOINT/CMD)",
      "contentMarkdown": "เมื่อรันคอนเทนเนอร์ใน Kubernetes คุณสามารถกำหนดคำสั่งและอาร์กิวเมนต์ได้ผ่านฟิลด์ `command` และ `args` ใน Container Specification ซึ่งจะเข้าไปแทนที่คำสั่งที่กำหนดไว้ใน Dockerfile ดังนี้:\n\n* **`command` ใน Kubernetes** จะเข้าไปเขียนทับ **`ENTRYPOINT`** ของ Dockerfile\n* **`args` ใน Kubernetes** จะเข้าไปเขียนทับ **`CMD`** ของ Dockerfile\n\n### ตารางพฤติกรรมการทำงานร่วมกัน:\n1. **ไม่ระบุทั้ง command และ args**: จะใช้ค่าเริ่มต้นทั้ง `ENTRYPOINT` และ `CMD` จาก Container Image\n2. **ระบุเฉพาะ command**: จะใช้ `command` ของ Kubernetes และละทิ้งทั้ง `ENTRYPOINT` และ `CMD` เดิมในอิมเมจ\n3. **ระบุเฉพาะ args**: จะใช้ `ENTRYPOINT` เดิมจากอิมเมจ แต่แทนที่อาร์กิวเมนต์ด้วย `args` ที่ระบุใหม่\n4. **ระบุทั้ง command และ args**: จะละทิ้งทั้ง `ENTRYPOINT` และ `CMD` เดิม และใช้ค่าใหม่ทั้งหมดจาก Kubernetes",
      "codeBlocks": []
    },
    {
      "id": "defining-command-and-args",
      "headingEn": "Defining Command and Arguments in Pod Manifest",
      "headingTh": "การกำหนด Command และ Arguments ใน Pod Manifest",
      "contentMarkdown": "ตัวอย่างการสร้างพอดที่สั่งรันคำสั่ง `printenv` พร้อมส่งอาร์กิวเมนต์เพื่อพิมพ์ชื่อตัวแปรสภาพแวดล้อมที่ต้องการออกมาทางหน้าจอ",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "command-demo.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: command-demo\n  labels:\n    purpose: demonstrate-command\nspec:\n  containers:\n  - name: command-demo-container\n    image: debian\n    command: [\"printenv\"]\n    args: [\"KUBERNETES_PORT\"]\n  restartPolicy: OnFailure"
        },
        {
          "lang": "bash",
          "label": "apply-and-check-logs.sh",
          "code": "# สร้างพอดและอ่านผลลัพธ์ผ่านคำสั่ง logs\nkubectl apply -f command-demo.yaml\nkubectl logs command-demo\n# ผลลัพธ์: tcp://10.96.0.1:443"
        }
      ]
    },
    {
      "id": "environment-variable-expansion",
      "headingEn": "Using Environment Variables within Arguments",
      "headingTh": "การนำตัวแปรสภาพแวดล้อมมาขยายใน Arguments ($(VAR_NAME))",
      "contentMarkdown": "คุณสามารถนำค่าจากตัวแปรสภาพแวดล้อม (Environment Variables) ที่นิยามไว้ในพอดมาใช้ใน `args` ได้โดยใช้ไวยากรณ์ `$(VARIABLE_NAME)`\n\n> ข้อแนะนำ: หากคุณต้องการส่งเครื่องหมาย dollar sign ตรงๆ ให้กับโปรแกรมโดยไม่ต้องการให้ Kubernetes ขยายค่า ให้ใช้เครื่องหมายดับเบิล `$$` เช่น `$$(ESCAPE_DOLLAR)`",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "env-in-args.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: env-args-demo\nspec:\n  containers:\n  - name: demo\n    image: busybox:1.28\n    env:\n    - name: MESSAGE\n      value: \"Hello Kubernetes Tasks!\"\n    command: [\"echo\"]\n    args: [\"$(MESSAGE)\"]\n  restartPolicy: OnFailure"
        },
        {
          "lang": "bash",
          "label": "verify-env-args.sh",
          "code": "kubectl apply -f env-in-args.yaml\nkubectl logs env-args-demo\n# ผลลัพธ์: Hello Kubernetes Tasks!"
        }
      ]
    },
    {
      "id": "running-commands-in-a-shell",
      "headingEn": "Running Multiple Commands via Shell and Signal Handling",
      "headingTh": "การรันคำสั่งหลายชุดผ่าน Shell และการจัดการสัญญาณ (PID 1 Signals)",
      "contentMarkdown": "หากคุณต้องการรันคำสั่งหลายๆ คำสั่งต่อเนื่องกัน การ Pipe คำสั่ง หรือการใช้ Shell Constructs (เช่น `while`, `if`) คุณต้องรันผ่าน Shell โดยตรง เช่น `/bin/sh -c`\n\n> ข้อควรระวังด้านความมั่นคงปลอดภัย: เมื่อรันผ่าน shell โพรเซสเชลล์จะกลายเป็น PID 1 หากแอปพลิเคชันเบื้องหลังไม่ได้รับสัญญาณ `SIGTERM` จาก kubelet ตอนพอดจะหยุดทำงาน อาจทำให้เกิดการปิดตัวแบบผิดปกติ (Abrupt Termination) แนะนำให้ใช้คำสั่ง `exec` นำหน้าคำสั่งหลักเพื่อส่งต่อ PID 1 ให้กับแอปพลิเคชันโดยตรง",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "shell-demo-pod.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: shell-demo\nspec:\n  containers:\n  - name: shell-container\n    image: busybox:1.28\n    command: [\"/bin/sh\", \"-c\"]\n    args:\n    - |\n      echo 'Starting background worker...'\n      date\n      sleep 30\n      echo 'Task finished successfully.'"
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
      "title": "Configure a Pod to Use a ConfigMap",
      "targetType": "tasks",
      "targetPageId": "inject-configmap",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/"
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
