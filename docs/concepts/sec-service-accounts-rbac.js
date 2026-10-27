/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/concepts/security/service-accounts/
 */
(function (root) {
  const pageData = {
    "id": "sec-service-accounts-rbac",
    "categoryId": "security",
    "categoryTitle": "Security",
    "titleEn": "Service Accounts",
    "titleTh": "เซอร์วิสแอคเคานต์และการควบคุมสิทธิ์ตามบทบาท (Service Accounts & RBAC)",
    "officialUrl": "https://kubernetes.io/docs/concepts/security/service-accounts/",
    "docsPath": "/docs/concepts/security/service-accounts/",
    "diagram": {
      "src": "images/docs/rbac-authorization-flow.svg",
      "caption": "การตรวจสอบสิทธิ์ RBAC: Subject (User/SA) -> Role/ClusterRole -> RoleBinding -> สิทธิ์การเข้าถึง Kubernetes API"
    },
    "lead": "ServiceAccount มอบตัวตนทางดิจิทัล (Identity) ให้แก่โปรเซสและแอปพลิเคชันที่ทำงานอยู่ภายในพอด ในขณะที่ Role-Based Access Control (RBAC) เป็นกลไกหลักในการตรวจสอบและอนุญาตสิทธิ์ (Authorization) ว่าตัวตนนั้นได้รับอนุญาตให้เรียกดูหรือแก้ไขทรัพยากรใดใน Kubernetes API ได้บ้าง",
    "sections": [
      {
        "id": "service-accounts-identity",
        "headingEn": "What are Service Accounts? SA vs User Accounts",
        "headingTh": "Service Accounts คืออะไร และแตกต่างจาก User Accounts อย่างไร?",
        "contentMarkdown": "ในระบบความปลอดภัยของ Kubernetes มีการแบ่งแยกประเภทของบัญชีออกเป็น 2 ประเภทอย่างชัดเจน:\n\n* **User Accounts (บัญชีสำหรับมนุษย์)**: ออกแบบมาสำหรับนักพัฒนาหรือผู้ดูแลระบบภายนอกคลัสเตอร์ โดย Kubernetes **ไม่มีออบเจกต์ User เก็บไว้ในฐานข้อมูล etcd** แต่จะอาศัยระบบ Identity Provider (IdP) ภายนอก เช่น Google OAuth, GitHub, OpenID Connect (OIDC), หรือ X.509 Client Certificates ในการยืนยันตัวตน\n* **Service Accounts (บัญชีสำหรับระบบและโปรเซส)**: ออกแบบมาสำหรับ Pods ที่รันอยู่ภายในคลัสเตอร์และจำเป็นต้องคุยกับ Kubernetes API Server (เช่น CI/CD Runner, Prometheus Operator, Autoscaler)\n  * ServiceAccount ถูกจัดเก็บเป็น Kubernetes API Object ภายใน Namespace\n  * พอดแต่ละตัวสามารถระบุฟิลด์ `spec.serviceAccountName` เพื่อสวมตัวตนนั้นได้\n  * หากไม่ได้ระบุ พอดจะได้รับบัญชี `default` ประจำ Namespace นั้นโดยอัตโนมัติ"
      },
      {
        "id": "projected-tokens-bound-sa",
        "headingEn": "Modern Token Architecture: Bound Service Account Tokens",
        "headingTh": "สถาปัตยกรรมโทเค็นสมัยใหม่: Bound Service Account Tokens",
        "contentMarkdown": "ใน Kubernetes ยุคก่อน v1.22 โทเค็นของ ServiceAccount จะถูกเก็บไว้ใน Secret แบบไม่มีวันหมดอายุ ซึ่งมีความเสี่ยงสูงมากหากโทเค็นรั่วไหล\n\nปัจจุบัน Kubernetes เปลี่ยนมาใช้กลไก **Bound Service Account Tokens (TokenRequest API)** เป็นมาตรฐาน:\n* โทเค็นเป็นรูปแบบ **JSON Web Token (JWT)** ที่มีอายุจำกัด (Time-bound เช่น 1 ชั่วโมง) และมีการต่ออายุอัตโนมัติในเบื้องหลังโดย kubelet\n* โทเค็นจะผูกติด (Bound) อยู่กับตัว Pod ตัวนั้นโดยตรง หาก Pod ถูกลบ โทเค็นจะใช้การไม่ได้ทันที\n* มีการระบุผู้รับ (Audience-bound เช่น `https://kubernetes.default.svc.cluster.local`)\n* ถูกเมานต์เข้าไปในคอนเทนเนอร์ ณ พาธ `/var/run/secrets/kubernetes.io/serviceaccount/token` ผ่าน Projected Volume\n\n> [!TIP]\n> หากพอดของคุณเป็นเว็บแอปพลิเคชันทั่วไปที่ไม่จำเป็นต้องเรียกใช้ Kubernetes API เลย แนะนำให้ตั้งค่า `automountServiceAccountToken: false` ในสเปกของ Pod เพื่อปิดการเมานต์โทเค็นตามหลักการลดพื้นที่การโจมตี (Attack Surface Reduction)"
      },
      {
        "id": "rbac-core-concepts",
        "headingEn": "The 4 Core Elements of RBAC",
        "headingTh": "4 เสาหลักของระบบ Role-Based Access Control (RBAC)",
        "contentMarkdown": "ระบบ RBAC ใช้ 4 ออบเจกต์หลักในการจัดการสิทธิ์:\n\n1. **`Role`**: กำหนดชุดสิทธิ์การเข้าถึงทรัพยากร โดยมีผลบังคับใช้เฉพาะภายใน **Namespace เดียว** ที่ระบุไว้เท่านั้น\n2. **`ClusterRole`**: กำหนดชุดสิทธิ์ในระดับ **Cluster-wide ทั่วทั้งระบบ** หรือใช้กำหนดสิทธิ์สำหรับทรัพยากรที่ไม่มี Namespace (เช่น Nodes, PersistentVolumes, Namespaces, CustomResourceDefinitions)\n3. **`RoleBinding`**: การนำ Role (หรือ ClusterRole) มาผูกเข้ากับ Subject (User, Group หรือ ServiceAccount) เพื่อมอบสิทธิ์นั้น**เฉพาะใน Namespace หนึ่ง**\n4. **`ClusterRoleBinding`**: การนำ ClusterRole มาผูกเข้ากับ Subject เพื่อมอบสิทธิ์นั้น**ครอบคลุมทุก Namespace ทั่วทั้งคลัสเตอร์**"
      },
      {
        "id": "rules-and-api-groups",
        "headingEn": "The Structure of RBAC Rules",
        "headingTh": "โครงสร้างการประกาศกฎสิทธิ์ (API Groups, Resources, Verbs)",
        "contentMarkdown": "การเขียนกฎภายใต้ `rules` ของ Role หรือ ClusterRole ประกอบด้วย:\n\n* **`apiGroups`**: กลุ่มของ API เช่น `\"\"` (Core Group สำหรับ pods, services, secrets), `\"apps\"` (สำหรับ deployments, statefulsets), `\"batch\"` (สำหรับ jobs, cronjobs)\n* **`resources`**: ชนิดของทรัพยากร (ตัวพิมพ์เล็กรูปพหูพจน์เสมอ เช่น `pods`, `services`, `configmaps`)\n* **`subresources`**: ทรัพยากรย่อย เช่น `pods/log` (ดู Log), `pods/exec` (สั่งรันคำสั่งในคอนเทนเนอร์)\n* **`verbs`**: การกระทำที่อนุญาต เช่น `get`, `list`, `watch`, `create`, `update`, `patch`, `delete`"
      },
      {
        "id": "complete-rbac-manifest",
        "headingEn": "End-to-End Manifest Example",
        "headingTh": "ตัวอย่าง Manifest แบบครบวงจร (SA -> Role -> RoleBinding -> Pod)",
        "contentMarkdown": "ตัวอย่างการสร้าง ServiceAccount สำหรับแอปพลิเคชันอ่าน Pod List และการผูกสิทธิ์ผ่าน RoleBinding:",
        "codeBlocks": [
          {
            "lang": "yaml",
            "label": "pod-reader-rbac.yaml",
            "code": "apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: pod-reader-sa\n  namespace: default\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nmetadata:\n  name: pod-reader-role\n  namespace: default\nrules:\n- apiGroups: [\"\"]\n  resources: [\"pods\", \"pods/log\"]\n  verbs: [\"get\", \"list\", \"watch\"]\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata:\n  name: read-pods-binding\n  namespace: default\nsubjects:\n- kind: ServiceAccount\n  name: pod-reader-sa\n  namespace: default\nroleRef:\n  kind: Role\n  name: pod-reader-role\n  apiGroup: rbac.authorization.k8s.io\n---\napiVersion: v1\nkind: Pod\nmetadata:\n  name: monitoring-agent\n  namespace: default\nspec:\n  serviceAccountName: pod-reader-sa\n  containers:\n  - name: agent\n    image: bitnami/kubectl:latest\n    command: [\"kubectl\", \"get\", \"pods\"]"
          }
        ]
      },
      {
        "id": "auditing-and-kubectl-auth",
        "headingEn": "Auditing and Testing Permissions with kubectl auth can-i",
        "headingTh": "การตรวจสอบและทดสอบสิทธิ์ด้วย kubectl auth can-i",
        "contentMarkdown": "คุณสามารถจำลองและตรวจสอบสิทธิ์ได้ทันทีโดยไม่ต้องล็อกอินสลับบัญชีด้วยคำสั่ง `kubectl auth can-i`:",
        "codeBlocks": [
          {
            "lang": "bash",
            "label": "คำสั่งตรวจสอบสิทธิ์ RBAC",
            "code": "# ตรวจสอบว่าตัวเราเองมีสิทธิ์สร้าง Deployment ใน default หรือไม่\nkubectl auth can-i create deployments --namespace default\n\n# จำลองตรวจสอบสิทธิ์ของ ServiceAccount ที่เราเพิ่งสร้าง\nkubectl auth can-i get pods --as=system:serviceaccount:default:pod-reader-sa --namespace default\n# ผลลัพธ์: yes\n\n# ตรวจสอบสิทธิ์ที่ไม่อนุญาต (ต้องได้ no)\nkubectl auth can-i delete pods --as=system:serviceaccount:default:pod-reader-sa --namespace default\n# ผลลัพธ์: no\n\n# แสดงตารางสิทธิ์ทั้งหมดของบัญชีในรูปแบบ Reconciliation Table\nkubectl auth can-i --list --namespace default"
          }
        ]
      },
      {
        "id": "whats-next",
        "headingEn": "What's next",
        "headingTh": "ขั้นตอนถัดไปและเนื้อหาศึกษาต่อ",
        "contentMarkdown": "* ศึกษา [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) สำหรับการจำกัดสิทธิ์ในระดับคอนเทนเนอร์\n* ศึกษา [Using RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) คู่มืออ้างอิงอย่างละเอียดของ RBAC\n* ศึกษา [Secrets Management](https://kubernetes.io/docs/concepts/configuration/secret/) สำหรับการรักษาความปลอดภัยของโทเค็นและรหัสผ่าน"
      }
    ],
    "relatedLinks": [
      {
        "title": "Pod Security Standards (มาตรฐานความปลอดภัย)",
        "targetType": "concepts",
        "targetPageId": "sec-pod-security-standards",
        "officialUrl": "https://kubernetes.io/docs/concepts/security/pod-security-standards/"
      },
      {
        "title": "Secrets (การจัดการข้อมูลความลับ)",
        "targetType": "concepts",
        "targetPageId": "config-secret",
        "officialUrl": "https://kubernetes.io/docs/concepts/configuration/secret/"
      },
      {
        "title": "Limit Ranges & Quotas (โควตาทรัพยากร)",
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
