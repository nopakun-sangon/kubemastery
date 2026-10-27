/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/tools/included/optional-kubectl-configs-bash-linux/
 */
(function (root) {
  const pageData = {
  "id": "tools-shell-autocompletion",
  "categoryId": "tools",
  "categoryTitle": "Install Tools",
  "titleEn": "kubectl Quick Reference & Autocompletion",
  "titleTh": "การเปิดใช้งานระบบเติมคำสั่งอัตโนมัติ (Shell Autocompletion)",
  "officialUrl": "https://kubernetes.io/docs/tasks/tools/included/optional-kubectl-configs-bash-linux/",
  "docsPath": "/docs/tasks/tools/included/optional-kubectl-configs-bash-linux/",
  "lead": "การเปิดใช้งานระบบ Shell Autocompletion ช่วยให้คุณสามารถกดปุ่ม Tab เพื่อเติมเต็มชื่อคำสั่ง, Flags, ประเภททรัพยากร (เช่น pods, services, deployments) และชื่อออบเจกต์ในคลัสเตอร์ได้โดยอัตโนมัติ",
  "sections": [
    {
      "id": "bash-completion-prerequisites",
      "headingEn": "Introduction and bash-completion Prerequisites",
      "headingTh": "ข้อกำหนดเบื้องต้นและการติดตั้งแพ็กเกจ bash-completion",
      "contentMarkdown": "สคริปต์เติมคำสั่งอัตโนมัติของ `kubectl` บน Bash ทำงานโดยพึ่งพาแพ็กเกจ **bash-completion** ของระบบปฏิบัติการ ดังนั้นคุณต้องตรวจสอบว่าระบบมีแพ็กเกจนี้ติดตั้งอยู่หรือไม่\n\n* ตรวจสอบว่าระบบมี bash-completion หรือไม่โดยรันคำสั่ง `type _init_completion` ในเทอร์มินัล\n* หากไม่มีผลลัพธ์ปรากฏ คุณจะต้องติดตั้งแพ็กเกจ `bash-completion` ผ่าน Package Manager ของระบบปฏิบัติการ\n* หมายเหตุ: สำหรับผู้ใช้ macOS หรือ Zsh จะมีวิธีการตั้งค่าที่แตกต่างกันเล็กน้อย",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "install-prerequisites.sh",
          "code": "# ตรวจสอบว่ามี bash-completion หรือยัง\ntype _init_completion\n\n# ติดตั้งบน Ubuntu / Debian\nsudo apt-get update && sudo apt-get install -y bash-completion\n\n# ติดตั้งบน CentOS / RHEL / Fedora\nsudo dnf install -y bash-completion"
        }
      ]
    },
    {
      "id": "enable-bash-autocompletion",
      "headingEn": "Enable kubectl Autocompletion for Current and New Shell Sessions",
      "headingTh": "การเปิดใช้งาน kubectl Autocompletion สำหรับเซสชันปัจจุบันและถาวร",
      "contentMarkdown": "คำสั่ง `kubectl completion bash` จะสร้างสคริปต์ Bash สำหรับ autocompletion ออกมาทาง stdout คุณสามารถเปิดใช้งานได้ทั้งสำหรับผู้ใช้คนเดียว หรือสำหรับผู้ใช้ทุกคนในระบบ:\n\n### 1. เปิดใช้งานเฉพาะผู้ใช้ปัจจุบัน (Current User)\nทำการเพิ่มคำสั่ง `source <(kubectl completion bash)` เข้าไปในไฟล์ `~/.bashrc` เพื่อให้โหลดสคริปต์ทุกครั้งที่เปิดเทอร์มินัลใหม่\n\n### 2. เปิดใช้งานสำหรับผู้ใช้งานทุกคนในระบบ (System-wide)\nคัดลอกผลลัพธ์ของคำสั่งไปยังไดเรกทอรี `/etc/bash_completion.d/kubectl` เพื่อให้ผู้ใช้ทุกคนสามารถใช้งานได้โดยไม่ต้องตั้งค่าในแต่ละโฮมไดเรกทอรี",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "enable-completion.sh",
          "code": "# 1. เปิดใช้งานเฉพาะในเซสชันปัจจุบันทันที\nsource <(kubectl completion bash)\n\n# 2. บันทึกให้ทำงานถาวรสำหรับผู้ใช้ปัจจุบัน (~/.bashrc)\necho 'source <(kubectl completion bash)' >> ~/.bashrc\nsource ~/.bashrc\n\n# 3. หรือสร้างเป็น System-wide completion (ต้องใช้สิทธิ์ sudo)\nkubectl completion bash | sudo tee /etc/bash_completion.d/kubectl > /dev/null\nsudo chmod a+r /etc/bash_completion.d/kubectl"
        }
      ]
    },
    {
      "id": "kubectl-alias-completion",
      "headingEn": "Autocompletion with Shell Aliases (e.g., alias k=kubectl)",
      "headingTh": "การตั้งค่าระบบเติมคำสั่งให้กับชื่อย่อ (Shell Aliases เช่น k=kubectl)",
      "contentMarkdown": "ในการทำงานจริง วิศวกร DevOps และผู้ดูแลระบบมักสร้างชื่อย่อ (Alias) เช่น `alias k=kubectl` เพื่อประหยัดเวลาในการพิมพ์คำสั่ง\n\nอย่างไรก็ตาม หากคุณตั้ง Alias เพียงอย่างเดียว ระบบ autocompletion จะไม่ทำงานกับคำสั่ง `k` เพื่อแก้ปัญหานี้ คุณต้องผูกฟังก์ชัน autocompletion ของ kubectl เข้ากับ Alias `k` โดยใช้คำสั่ง Built-in ของ Bash คือ `complete -o default -F __start_kubectl k`\n\n> ข้อแนะนำ: การตั้งค่าทั้ง `alias k=kubectl` และ autocompletion ใน `~/.bashrc` เป็นข้อปฏิบัติมาตรฐานที่แนะนำอย่างยิ่งสำหรับการสอบ Certified Kubernetes Administrator (CKA/CKAD)",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "alias-setup.sh",
          "code": "# เพิ่ม Alias และการ Autocomplete ลงใน ~/.bashrc\ncat << 'EOF' >> ~/.bashrc\n# Kubernetes kubectl alias & autocompletion\nalias k=kubectl\ncomplete -o default -F __start_kubectl k\nEOF\n\n# โหลดไฟล์คอนฟิกใหม่เพื่อทดสอบ\nsource ~/.bashrc\n\n# ทดสอบพิมพ์ k get po แล้วกดปุ่ม Tab สองครั้ง\nk get po <TAB><TAB>"
        }
      ]
    },
    {
      "id": "zsh-autocompletion",
      "headingEn": "Alternative: Zsh Shell Autocompletion Setup",
      "headingTh": "ทางเลือกเสริม: การตั้งค่า Autocompletion บน Zsh Shell",
      "contentMarkdown": "สำหรับผู้ที่ใช้งาน Zsh (Z Shell) เช่น บน macOS หรือระบบ Linux ที่ติดตั้ง Oh My Zsh คุณสามารถเปิดใช้งาน autocompletion ได้ด้วยคำสั่ง `kubectl completion zsh` และผูกเข้ากับ `compdef`",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "zsh-setup.sh",
          "code": "# เพิ่มการทำงานลงใน ~/.zshrc\necho 'source <(kubectl completion zsh)' >> ~/.zshrc\necho 'alias k=kubectl' >> ~/.zshrc\necho 'compdef __start_kubectl k' >> ~/.zshrc\n\n# โหลดคอนฟิกใหม่\nsource ~/.zshrc"
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Install and Set Up kubectl",
      "targetType": "tasks",
      "targetPageId": "tools-install-kubectl",
      "officialUrl": "https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/"
    },
    {
      "title": "Managing Resources Imperatively",
      "targetType": "tasks",
      "targetPageId": "manage-declarative-imperative",
      "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/imperative-command/"
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
