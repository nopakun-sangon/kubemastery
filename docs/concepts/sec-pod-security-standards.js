/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/security/pod-security-standards/
 */
(function (root) {
  const pageData = {
    "id": "sec-pod-security-standards",
    "categoryId": "security",
    "categoryTitle": "Security",
    "titleEn": "Pod Security Standards",
    "titleTh": "มาตรฐานความปลอดภัยพอด (PSS) และการบังคับใช้ (Pod Security Admission)",
    "officialUrl": "https://kubernetes.io/docs/concepts/security/pod-security-standards/",
    "docsPath": "/docs/concepts/security/pod-security-standards/",
    "lead": "Pod Security Standards (PSS) กำหนดระดับโปรไฟล์ความปลอดภัยของพอดออกเป็น 3 ระดับ เพื่อป้องกันไม่ให้คอนเทนเนอร์เข้าถึงหรือทำลายระบบแม่ข่าย และ Pod Security Admission (PSA) เป็น Built-in Admission Controller ที่นำมาตรฐานนี้มาบังคับใช้ในระดับ Namespace อย่างมีประสิทธิภาพ",
    "summary": "### 🎯 สรุปแก่นสำคัญ (Core Concept / TL;DR)\nPod Security Standards (PSS) กำหนดมาตรฐานความปลอดภัยในการรันพอดออกเป็น 3 ระดับ (Privileged, Baseline, Restricted) เพื่อป้องกันไม่ให้คอนเทนเนอร์เข้าถึงหรือทำลายระบบแม่ข่าย และถูกนำมาบังคับใช้ในระดับ Namespace ผ่านตัวควบคุม Pod Security Admission (PSA) ด้วยการติด Label\n\n### 🔑 ประเด็นสำคัญที่ต้องรู้ (Key Takeaways)\n* **วิวัฒนาการจาก PodSecurityPolicy (PSP)**: PSP ถูกยกเลิกและตัดออกจากระบบถาวรใน Kubernetes v1.25 เนื่องจากความซับซ้อน และแทนที่ด้วย PSS/PSA ที่ติดตั้งมาในตัว\n* **3 ระดับโปรไฟล์ความปลอดภัย (PSS Profiles)**:\n  * `Privileged`: ไม่มีข้อจำกัด ยอมให้ใช้ Privileged Containers, Host Network, HostPath (สำหรับ System Daemons เท่านั้น)\n  * `Baseline`: ระดับเริ่มต้นทั่วไป ป้องกันช่องโหว่พื้นฐาน ห้าม Privileged และ Host Namespace แต่ยอมให้รัน Root ได้\n  * `Restricted`: ปลอดภัยเข้มงวดสูงสุด บังคับรัน Non-root (`runAsNonRoot: true`), ตัด Linux Capabilities ทั้งหมด (`drop: [\"ALL\"]`), บังคับ Seccomp และห้าม Privilege Escalation\n* **3 โหมดการบังคับใช้ของ PSA**:\n  * `enforce`: ปฏิเสธการสร้างพอดทันทีหากไม่ผ่านเกณฑ์\n  * `audit`: อนุญาตให้สร้างได้ แต่บันทึกข้อมูลแจ้งเตือนลง Audit Log\n  * `warn`: อนุญาตให้สร้างได้ แต่พิมพ์ข้อความเตือนให้ผู้สั่ง kubectl ทราบทันที\n\n### ⚡ จุดเน้นสำหรับใช้งานจริง & สอบ CKA/CKAD (Exam & Practical Focus)\n* ออกสอบบ่อยในโจทย์ CKA ด้าน Security! คำสั่งติด Label บังคับใช้บน Namespace:\n  * `kubectl label namespace dev pod-security.kubernetes.io/enforce=baseline`\n  * `kubectl label namespace prod pod-security.kubernetes.io/enforce=restricted`\n* การตั้งค่า securityContext สำหรับ Pod ระดับ Restricted:\n  ```yaml\n  securityContext:\n    runAsNonRoot: true\n    seccompProfile:\n      type: RuntimeDefault\n  containers:\n  - name: app\n    securityContext:\n      allowPrivilegeEscalation: false\n      capabilities:\n        drop: [\"ALL\"]\n  ```\n* คำสั่งตรวจสอบ Labels ด้านความปลอดภัย: `kubectl get ns --show-labels`",
    "sections": [
      {
        "id": "evolution-from-psp",
        "headingEn": "Evolution from PodSecurityPolicy to PSS & PSA",
        "headingTh": "วิวัฒนาการจาก PodSecurityPolicy (PSP) สู่ PSS & PSA",
        "contentMarkdown": "ในอดีต Kubernetes ใช้กลไกที่เรียกว่า **PodSecurityPolicy (PSP)** ในการควบคุมความปลอดภัยของพอด แต่ PSP มีข้อเสียร้ายแรงหลายประการ เช่น ความซับซ้อนอย่างยิ่งในการผูกสิทธิ์ผ่าน RBAC, พฤติกรรมการแอบแก้ไขสเปกของพอดโดยไม่แจ้งเตือน (Silent Mutation), และการไม่มีโหมดทดสอบเพื่อแจ้งเตือนล่วงหน้า (Audit/Dry-run)\n\nส่งผลให้ Kubernetes ได้ยกเลิก (Deprecated) PSP ใน v1.21 และตัดออกจากระบบอย่างถาวรใน **Kubernetes v1.25** โดยแทนที่ด้วยสถาปัตยกรรมใหม่ที่มีความชัดเจนและปลอดภัยกว่ามาก:\n* **Pod Security Standards (PSS)**: มาตรฐานสากลที่นิยามกฎความปลอดภัย 3 ระดับอย่างตรงไปตรงมา\n* **Pod Security Admission (PSA)**: ตัวควบคุมการรับเข้า (Built-in Admission Controller) ที่ฝังอยู่ใน `kube-apiserver` โดยตรงโดยไม่ต้องติดตั้ง Webhook ภายนอกเพิ่มเติม"
      },
      {
        "id": "three-pss-levels",
        "headingEn": "The Three Pod Security Standards Profiles",
        "headingTh": "3 ระดับโปรไฟล์ความปลอดภัยของ Pod Security Standards",
        "contentMarkdown": "PSS กำหนดระดับการป้องกันออกเป็น 3 ระดับชั้น:\n\n### 1. Privileged (ระดับไม่มีข้อจำกัด - Unrestricted)\n* เปิดให้พอดมีสิทธิ์สูงสุดเสมือนรันบนโฮสต์โดยตรง\n* ยอมให้ใช้ `privileged: true`, เข้าถึง Host Namespaces (`hostNetwork`, `hostPID`, `hostIPC`), เมานต์ `hostPath`\n* **ข้อควรระวัง**: ใช้เฉพาะพอดโครงสร้างพื้นฐานระดับระบบ (System Daemons, CNI Plugins, Storage CSI Drivers) เท่านั้น ห้ามใช้กับแอปพลิเคชันทั่วไปเด็ดขาด\n\n### 2. Baseline (ระดับพื้นฐาน - ค่าเริ่มต้นแนะนำสำหรับเวิร์กโหลดทั่วไป)\n* ป้องกันช่องโหว่ความปลอดภัยที่เป็นที่รู้จักและการยกระดับสิทธิ์ (Privilege Escalation)\n* ห้ามใช้ Privileged Containers, ห้ามเข้าถึง Host Namespaces, ห้ามเมานต์ดิสก์ HostPath สุ่มสี่สุ่มห้า\n* ยอมให้พอดรันด้วยสิทธิ์ Root ได้และยอมรับสิทธิ์ Linux Capabilities พื้นฐาน\n\n### 3. Restricted (ระดับเข้มงวดสูงสุด - Hardened Best Practices)\n* ออกแบบมาสำหรับระบบที่ต้องการความปลอดภัยระดับสถาบันการเงินหรือ Production ที่มีข้อมูลละเอียดอ่อน\n* **บังคับรันแบบ Non-root (`runAsNonRoot: true`)** ห้ามรันด้วยสิทธิ์ Root เด็ดขาด\n* **ตัดสิทธิ์ Linux Capabilities ทั้งหมด (`drop: [\"ALL\"]`)**\n* บังคับใช้ Seccomp Profile (`RuntimeDefault` หรือ `Localhost`)\n* สั่งห้าม Privilege Escalation (`allowPrivilegeEscalation: false`)"
      },
      {
        "id": "psa-modes",
        "headingEn": "The Three Enforcement Modes of PSA",
        "headingTh": "3 โหมดการบังคับใช้ของ Pod Security Admission",
        "contentMarkdown": "คุณสามารถกำหนดวิธีการที่คลัสเตอร์จะตอบสนองเมื่อพบพอดที่ไม่ผ่านเกณฑ์ PSS ผ่าน 3 โหมดที่ทำงานร่วมกันได้:\n\n* **`enforce` (บังคับใช้จริง)**: หากพอดไม่ผ่านกฎ ระบบจะปฏิเสธการสร้างพอดทันที (Reject Pod Creation)\n* **`audit` (บันทึกเพื่อตรวจสอบ)**: ยอมให้พอดถูกสร้างขึ้นได้ แต่จะทำการบันทึก Annotation ลงใน Audit Log ของ API Server เพื่อให้ทีม Security ตรวจสอบย้อนหลัง\n* **`warn` (แจ้งเตือนผู้ใช้งาน)**: ยอมให้พอดถูกสร้างขึ้นได้ แต่จะพิมพ์ข้อความ Warning สีส้มแจ้งเตือนบนหน้าจอเทอร์มินัลของคนที่สั่ง `kubectl apply` ทันที"
      },
      {
        "id": "namespace-labeling",
        "headingEn": "Configuring PSA via Namespace Labels",
        "headingTh": "การตั้งค่านโยบายความปลอดภัยด้วย Label บน Namespace",
        "contentMarkdown": "การเปิดใช้งาน PSA ทำได้อย่างเรียบง่ายและทรงพลังเพียงแค่ติด Label บน Namespace ที่ต้องการ:\n\n```yaml\napiVersion: v1\nkind: Namespace\nmetadata:\n  name: finance-workloads\n  labels:\n    # บังคับใช้ระดับ baseline จริง\n    pod-security.kubernetes.io/enforce: baseline\n    pod-security.kubernetes.io/enforce-version: latest\n    # แต่ให้แจ้งเตือนผู้ใช้หากยังไม่ผ่านระดับ restricted\n    pod-security.kubernetes.io/warn: restricted\n    pod-security.kubernetes.io/warn-version: latest\n```\n\nคำสั่ง CLI แบบเร่งด่วน: `kubectl label namespace finance-workloads pod-security.kubernetes.io/enforce=baseline`"
      },
      {
        "id": "hardened-pod-manifest",
        "headingEn": "Restricted Compliant Pod Manifest and Verification",
        "headingTh": "ตัวอย่าง YAML Pod ที่ผ่านเกณฑ์ Restricted และคำสั่งทดสอบ",
        "contentMarkdown": "ตัวอย่างการตั้งค่าบล็อก `securityContext` ในระดับ Pod และ Container ให้สอดคล้องกับมาตรฐานระดับ **Restricted** อย่างสมบูรณ์:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "hardened-restricted-pod.yaml",
            "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: secure-microservice\n  namespace: finance-workloads\nspec:\n  securityContext:\n    runAsNonRoot: true\n    runAsUser: 10001\n    runAsGroup: 10001\n    fsGroup: 10001\n    seccompProfile:\n      type: RuntimeDefault\n  containers:\n  - name: app\n    image: nginxinc/nginx-unprivileged:alpine\n    securityContext:\n      allowPrivilegeEscalation: false\n      readOnlyRootFilesystem: true\n      capabilities:\n        drop:\n        - ALL"
          },
          {
            "lang": "bash",
            "label": "การทดสอบการบังคับใช้ Pod Security",
            "code": "# ทดสอบรันพอดที่มีสิทธิ์ privileged ใน namespace ที่มีนโยบาย enforce=baseline\nkubectl run bad-pod -n finance-workloads --image=nginx --privileged\n# ผลลัพธ์: จะถูกปฏิเสธ (Forbidden) โดยระบุเหตุผลว่าละเมิดกฎ baseline: privileged\n\n# ตรวจสอบ Labels ด้านความปลอดภัยบน Namespace ทั้งหมด\nkubectl get ns --show-labels"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Service Accounts and RBAC](https://kubernetes.io/docs/concepts/security/service-accounts/) สำหรับการจำกัดสิทธิ์ในระดับ API\n* ศึกษา [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) สำหรับการรักษาความปลอดภัยเครือข่ายพอด\n* ศึกษา [Limit Ranges and Resource Quotas](https://kubernetes.io/docs/concepts/policy/resource-quota/) สำหรับการควบคุมปริมาณการใช้ทรัพยากร"
      }
    ],
    "relatedLinks": [
      {
        "title": "Service Accounts and RBAC (การควบคุมสิทธิ์ตามบทบาท)",
        "targetType": "concepts",
        "targetPageId": "sec-service-accounts-rbac",
        "officialUrl": "https://kubernetes.io/docs/concepts/security/service-accounts/"
      },
      {
        "title": "Network Policies (นโยบายความปลอดภัยเครือข่าย)",
        "targetType": "concepts",
        "targetPageId": "net-network-policies",
        "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/network-policies/"
      },
      {
        "title": "Limit Ranges & Quotas (การจำกัดโควตาทรัพยากร)",
        "targetType": "concepts",
        "targetPageId": "policy-limits-quotas",
        "officialUrl": "https://kubernetes.io/docs/concepts/policy/resource-quota/"
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
