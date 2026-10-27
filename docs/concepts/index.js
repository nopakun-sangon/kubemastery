/**
 * KubeMastery: Kubernetes Concepts (แนวคิดและสถาปัตยกรรม) Catalog Index
 * Aggregates all registered pages in docs/concepts/
 */
(function (root) {
  const catalogIndex = {
  "title": "Kubernetes Concepts (แนวคิดและสถาปัตยกรรม)",
  "description": "คำแปลเนื้อหาและสถาปัตยกรรม Kubernetes ฉบับสมบูรณ์ แปลจาก https://kubernetes.io/docs/concepts/",
  "pagesCount": 38,
  "pages": [
    {
      "id": "overview-what-is-kubernetes",
      "categoryId": "overview",
      "categoryTitle": "Overview",
      "titleEn": "Overview",
      "titleTh": "Kubernetes คืออะไร?",
      "officialUrl": "https://kubernetes.io/docs/concepts/overview/",
      "docsPath": "/docs/concepts/overview/"
    },
    {
      "id": "overview-components",
      "categoryId": "overview",
      "categoryTitle": "Overview",
      "titleEn": "Kubernetes Components",
      "titleTh": "ส่วนประกอบต่างๆ ของระบบ Kubernetes",
      "officialUrl": "https://kubernetes.io/docs/concepts/overview/components/",
      "docsPath": "/docs/concepts/overview/components/"
    },
    {
      "id": "overview-working-with-objects",
      "categoryId": "overview",
      "categoryTitle": "Overview",
      "titleEn": "Objects In Kubernetes",
      "titleTh": "การทำงานกับ Kubernetes Objects",
      "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/",
      "docsPath": "/docs/concepts/overview/working-with-objects/"
    },
    {
      "id": "overview-names-uids-namespaces",
      "categoryId": "overview",
      "categoryTitle": "Overview",
      "titleEn": "Object Names and IDs",
      "titleTh": "ชื่อของอ็อบเจกต์, UID และ Namespaces",
      "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/names/",
      "docsPath": "/docs/concepts/overview/working-with-objects/names/"
    },
    {
      "id": "overview-labels-selectors-annotations",
      "categoryId": "overview",
      "categoryTitle": "Overview",
      "titleEn": "Labels and Selectors",
      "titleTh": "ป้ายกำกับ (Labels), Selectors และคำอธิบายกำกับ (Annotations)",
      "officialUrl": "https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/",
      "docsPath": "/docs/concepts/overview/working-with-objects/labels/"
    },
    {
      "id": "arch-nodes",
      "categoryId": "architecture",
      "categoryTitle": "Cluster Architecture",
      "titleEn": "Nodes",
      "titleTh": "โหนด (Nodes) ในสถาปัตยกรรม Kubernetes",
      "officialUrl": "https://kubernetes.io/docs/concepts/architecture/nodes/",
      "docsPath": "/docs/concepts/architecture/nodes/"
    },
    {
      "id": "arch-control-plane-node-comm",
      "categoryId": "architecture",
      "categoryTitle": "Cluster Architecture",
      "titleEn": "Communication between Nodes and the Control Plane",
      "titleTh": "การสื่อสารระหว่าง Control Plane และ Worker Nodes",
      "officialUrl": "https://kubernetes.io/docs/concepts/architecture/control-plane-node-communication/",
      "docsPath": "/docs/concepts/architecture/control-plane-node-communication/"
    },
    {
      "id": "arch-controllers-leases",
      "categoryId": "architecture",
      "categoryTitle": "Cluster Architecture",
      "titleEn": "Controllers",
      "titleTh": "ตัวควบคุม (Controllers) และสัญญาเช่าสถานะ (Leases)",
      "officialUrl": "https://kubernetes.io/docs/concepts/architecture/controller/",
      "docsPath": "/docs/concepts/architecture/controller/"
    },
    {
      "id": "arch-cri-garbage-collection",
      "categoryId": "architecture",
      "categoryTitle": "Cluster Architecture",
      "titleEn": "Container Runtime Interface (CRI)",
      "titleTh": "ส่วนต่อประสานรันไทม์ (CRI) และการเก็บกวาดขยะในระบบ (Garbage Collection)",
      "officialUrl": "https://kubernetes.io/docs/concepts/architecture/cri/",
      "docsPath": "/docs/concepts/architecture/cri/"
    },
    {
      "id": "containers-images",
      "categoryId": "containers",
      "categoryTitle": "Containers",
      "titleEn": "Images",
      "titleTh": "อิมเมจคอนเทนเนอร์ (Container Images)",
      "officialUrl": "https://kubernetes.io/docs/concepts/containers/images/",
      "docsPath": "/docs/concepts/containers/images/"
    },
    {
      "id": "containers-lifecycle-hooks",
      "categoryId": "containers",
      "categoryTitle": "Containers",
      "titleEn": "Container Lifecycle Hooks",
      "titleTh": "จุดดักจับวงจรชีวิตคอนเทนเนอร์ (Lifecycle Hooks)",
      "officialUrl": "https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/",
      "docsPath": "/docs/concepts/containers/container-lifecycle-hooks/"
    },
    {
      "id": "workloads-pods",
      "categoryId": "workloads",
      "categoryTitle": "Workloads",
      "titleEn": "Pods",
      "titleTh": "ภาพรวมของพอด (Pods)",
      "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/",
      "docsPath": "/docs/concepts/workloads/pods/"
    },
    {
      "id": "workloads-pod-lifecycle",
      "categoryId": "workloads",
      "categoryTitle": "Workloads",
      "titleEn": "Pod Lifecycle",
      "titleTh": "วงจรชีวิตของพอด (Pod Lifecycle)",
      "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/",
      "docsPath": "/docs/concepts/workloads/pods/pod-lifecycle/"
    },
    {
      "id": "workloads-init-containers",
      "categoryId": "workloads",
      "categoryTitle": "Workloads",
      "titleEn": "Init Containers",
      "titleTh": "อินิตคอนเทนเนอร์ (Init Containers)",
      "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/init-containers/",
      "docsPath": "/docs/concepts/workloads/pods/init-containers/"
    },
    {
      "id": "workloads-sidecar-containers",
      "categoryId": "workloads",
      "categoryTitle": "Workloads",
      "titleEn": "Sidecar Containers",
      "titleTh": "ไซด์คาร์คอนเทนเนอร์ (Sidecar Containers)",
      "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/",
      "docsPath": "/docs/concepts/workloads/pods/sidecar-containers/"
    },
    {
      "id": "workloads-ephemeral-disruptions",
      "categoryId": "workloads",
      "categoryTitle": "Workloads",
      "titleEn": "Ephemeral Containers",
      "titleTh": "คอนเทนเนอร์ชั่วคราวและการขัดจังหวะการทำงาน (PDB)",
      "officialUrl": "https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/",
      "docsPath": "/docs/concepts/workloads/pods/ephemeral-containers/"
    },
    {
      "id": "workloads-deployments",
      "categoryId": "workloads",
      "categoryTitle": "Workloads",
      "titleEn": "Deployments",
      "titleTh": "ดีพลอยเมนต์ (Deployments)",
      "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/",
      "docsPath": "/docs/concepts/workloads/controllers/deployment/"
    },
    {
      "id": "workloads-replicaset-statefulset",
      "categoryId": "workloads",
      "categoryTitle": "Workloads",
      "titleEn": "StatefulSets",
      "titleTh": "สเตตฟูลเซ็ต (StatefulSets)",
      "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/",
      "docsPath": "/docs/concepts/workloads/controllers/statefulset/"
    },
    {
      "id": "workloads-daemonset",
      "categoryId": "workloads",
      "categoryTitle": "Workloads",
      "titleEn": "DaemonSet",
      "titleTh": "เดมอนเซ็ต (DaemonSets)",
      "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/",
      "docsPath": "/docs/concepts/workloads/controllers/daemonset/"
    },
    {
      "id": "workloads-jobs-cronjobs",
      "categoryId": "workloads",
      "categoryTitle": "Workloads",
      "titleEn": "Jobs",
      "titleTh": "จ็อบและครอนจ็อบ (Jobs and CronJobs)",
      "officialUrl": "https://kubernetes.io/docs/concepts/workloads/controllers/job/",
      "docsPath": "/docs/concepts/workloads/controllers/job/"
    },
    {
      "id": "net-service",
      "categoryId": "services-networking",
      "categoryTitle": "Services, Load Balancing, and Networking",
      "titleEn": "Service",
      "titleTh": "เซอร์วิส (Services) และการนำทางทราฟฟิก",
      "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/service/",
      "docsPath": "/docs/concepts/services-networking/service/"
    },
    {
      "id": "net-ingress-controllers",
      "categoryId": "services-networking",
      "categoryTitle": "Services, Load Balancing, and Networking",
      "titleEn": "Ingress",
      "titleTh": "อินเกรสส์ (Ingress) และตัวควบคุม Ingress Controllers",
      "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/ingress/",
      "docsPath": "/docs/concepts/services-networking/ingress/"
    },
    {
      "id": "net-gateway-api",
      "categoryId": "services-networking",
      "categoryTitle": "Services, Load Balancing, and Networking",
      "titleEn": "Gateway API",
      "titleTh": "เกตเวย์เอพีไอ (Gateway API)",
      "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/gateway/",
      "docsPath": "/docs/concepts/services-networking/gateway/"
    },
    {
      "id": "net-dns-pod-service",
      "categoryId": "services-networking",
      "categoryTitle": "Services, Load Balancing, and Networking",
      "titleEn": "DNS for Services and Pods",
      "titleTh": "ระบบ DNS สำหรับเซอร์วิสและพอด",
      "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/",
      "docsPath": "/docs/concepts/services-networking/dns-pod-service/"
    },
    {
      "id": "net-network-policies",
      "categoryId": "services-networking",
      "categoryTitle": "Services, Load Balancing, and Networking",
      "titleEn": "Network Policies",
      "titleTh": "นโยบายความปลอดภัยเครือข่าย (Network Policies)",
      "officialUrl": "https://kubernetes.io/docs/concepts/services-networking/network-policies/",
      "docsPath": "/docs/concepts/services-networking/network-policies/"
    },
    {
      "id": "storage-volumes",
      "categoryId": "storage",
      "categoryTitle": "Storage",
      "titleEn": "Volumes",
      "titleTh": "ภาพรวมของวอลุ่ม (Volumes)",
      "officialUrl": "https://kubernetes.io/docs/concepts/storage/volumes/",
      "docsPath": "/docs/concepts/storage/volumes/"
    },
    {
      "id": "storage-persistent-volumes",
      "categoryId": "storage",
      "categoryTitle": "Storage",
      "titleEn": "Persistent Volumes",
      "titleTh": "เพอร์ซิสเทนต์วอลุ่ม (Persistent Volumes & PVCs)",
      "officialUrl": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/",
      "docsPath": "/docs/concepts/storage/persistent-volumes/"
    },
    {
      "id": "storage-classes-dynamic",
      "categoryId": "storage",
      "categoryTitle": "Storage",
      "titleEn": "Storage Classes",
      "titleTh": "สตอเรจคลาสและการจัดสรรพื้นที่จัดเก็บแบบไดนามิก",
      "officialUrl": "https://kubernetes.io/docs/concepts/storage/storage-classes/",
      "docsPath": "/docs/concepts/storage/storage-classes/"
    },
    {
      "id": "storage-ephemeral-snapshots",
      "categoryId": "storage",
      "categoryTitle": "Storage",
      "titleEn": "Ephemeral Volumes",
      "titleTh": "วอลุ่มชั่วคราวและภาพถ่ายข้อมูลสแน็ปช็อต (Snapshots)",
      "officialUrl": "https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/",
      "docsPath": "/docs/concepts/storage/ephemeral-volumes/"
    },
    {
      "id": "config-configmap",
      "categoryId": "configuration",
      "categoryTitle": "Configuration",
      "titleEn": "ConfigMaps",
      "titleTh": "คอนฟิกแมป (ConfigMaps)",
      "officialUrl": "https://kubernetes.io/docs/concepts/configuration/configmap/",
      "docsPath": "/docs/concepts/configuration/configmap/"
    },
    {
      "id": "config-secret",
      "categoryId": "configuration",
      "categoryTitle": "Configuration",
      "titleEn": "Secrets",
      "titleTh": "ซีเคร็ต (Secrets) และการรักษาความลับ",
      "officialUrl": "https://kubernetes.io/docs/concepts/configuration/secret/",
      "docsPath": "/docs/concepts/configuration/secret/"
    },
    {
      "id": "config-manage-resources",
      "categoryId": "configuration",
      "categoryTitle": "Configuration",
      "titleEn": "Resource Management for Pods and Containers",
      "titleTh": "การจัดการทรัพยากร CPU และ Memory สำหรับพอด",
      "officialUrl": "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/",
      "docsPath": "/docs/concepts/configuration/manage-resources-containers/"
    },
    {
      "id": "sec-pod-security-standards",
      "categoryId": "security",
      "categoryTitle": "Security",
      "titleEn": "Pod Security Standards",
      "titleTh": "มาตรฐานความปลอดภัยพอด (PSS) และการบังคับใช้",
      "officialUrl": "https://kubernetes.io/docs/concepts/security/pod-security-standards/",
      "docsPath": "/docs/concepts/security/pod-security-standards/"
    },
    {
      "id": "sec-service-accounts-rbac",
      "categoryId": "security",
      "categoryTitle": "Security",
      "titleEn": "Service Accounts",
      "titleTh": "เซอร์วิสแอคเคานต์และการควบคุมสิทธิ์ตามบทบาท (RBAC)",
      "officialUrl": "https://kubernetes.io/docs/concepts/security/service-accounts/",
      "docsPath": "/docs/concepts/security/service-accounts/"
    },
    {
      "id": "policy-limits-quotas",
      "categoryId": "policies",
      "categoryTitle": "Policies",
      "titleEn": "Resource Quotas",
      "titleTh": "นโยบายจำกัดทรัพยากร (Limit Ranges) และโควตาคลัสเตอร์ (Resource Quotas)",
      "officialUrl": "https://kubernetes.io/docs/concepts/policy/resource-quota/",
      "docsPath": "/docs/concepts/policy/resource-quota/"
    },
    {
      "id": "sched-assign-pod-node",
      "categoryId": "scheduling",
      "categoryTitle": "Scheduling, Preemption and Eviction",
      "titleEn": "Assigning Pods to Nodes",
      "titleTh": "การกำหนดและคัดเลือกโหนดให้พอด (NodeAffinity & Selectors)",
      "officialUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/",
      "docsPath": "/docs/concepts/scheduling-eviction/assign-pod-node/"
    },
    {
      "id": "sched-taint-toleration",
      "categoryId": "scheduling",
      "categoryTitle": "Scheduling, Preemption and Eviction",
      "titleEn": "Taints and Tolerations",
      "titleTh": "ข้อจำกัดบนโหนด (Taints) และความทนทานของพอด (Tolerations)",
      "officialUrl": "https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/",
      "docsPath": "/docs/concepts/scheduling-eviction/taint-and-toleration/"
    },
    {
      "id": "admin-logging-extending",
      "categoryId": "administration",
      "categoryTitle": "Cluster Administration",
      "titleEn": "Logging Architecture",
      "titleTh": "สถาปัตยกรรมการจัดการ Log และการสร้าง Custom Resources (CRD)",
      "officialUrl": "https://kubernetes.io/docs/concepts/cluster-administration/logging/",
      "docsPath": "/docs/concepts/cluster-administration/logging/"
    }
  ]
};

  if (typeof window !== "undefined") {
    window.KUBE_CONCEPTS_INDEX = catalogIndex;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = catalogIndex;
  }
})(typeof window !== "undefined" ? window : globalThis);
