/**
 * KubeMastery: Kubernetes Tasks (คู่มือปฏิบัติการ Step-by-Step) Catalog Index
 * Aggregates all registered pages in docs/tasks/
 */
(function (root) {
  const catalogIndex = {
  "title": "Kubernetes Tasks (คู่มือปฏิบัติการ Step-by-Step)",
  "description": "คำแปลคู่มือปฏิบัติการทีละขั้นตอน แปลจาก https://kubernetes.io/docs/tasks/",
  "pagesCount": 36,
  "pages": [
    {
      "id": "tools-install-kubectl",
      "categoryId": "tools",
      "categoryTitle": "Install Tools",
      "titleEn": "Install and Set Up kubectl on Linux",
      "titleTh": "การติดตั้งและตั้งค่า kubectl บนระบบ Linux",
      "officialUrl": "https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/",
      "docsPath": "/docs/tasks/tools/install-kubectl-linux/"
    },
    {
      "id": "tools-shell-autocompletion",
      "categoryId": "tools",
      "categoryTitle": "Install Tools",
      "titleEn": "kubectl Quick Reference & Autocompletion",
      "titleTh": "การเปิดใช้งานระบบเติมคำสั่งอัตโนมัติ (Shell Autocompletion)",
      "officialUrl": "https://kubernetes.io/docs/tasks/tools/included/optional-kubectl-configs-bash-linux/",
      "docsPath": "/docs/tasks/tools/included/optional-kubectl-configs-bash-linux/"
    },
    {
      "id": "admin-kubeadm-upgrade",
      "categoryId": "administer-cluster",
      "categoryTitle": "Administer a Cluster",
      "titleEn": "Upgrading kubeadm clusters",
      "titleTh": "ขั้นตอนการอัปเกรดคลัสเตอร์ที่ติดตั้งด้วย kubeadm",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/",
      "docsPath": "/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/"
    },
    {
      "id": "admin-etcd-backup-restore",
      "categoryId": "administer-cluster",
      "categoryTitle": "Administer a Cluster",
      "titleEn": "Operating etcd clusters for Kubernetes",
      "titleTh": "การสำรองและกู้คืนฐานข้อมูล etcd",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/",
      "docsPath": "/docs/tasks/administer-cluster/configure-upgrade-etcd/"
    },
    {
      "id": "admin-safely-drain-node",
      "categoryId": "administer-cluster",
      "categoryTitle": "Administer a Cluster",
      "titleEn": "Safely Drain a Node",
      "titleTh": "การอพยพพอดออกจากโหนดอย่างปลอดภัย (kubectl drain)",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/",
      "docsPath": "/docs/tasks/administer-cluster/safely-drain-node/"
    },
    {
      "id": "admin-resource-quota-namespace",
      "categoryId": "administer-cluster",
      "categoryTitle": "Administer a Cluster",
      "titleEn": "Configure Memory and CPU Quotas for a Namespace",
      "titleTh": "การตั้งค่าโควตา Memory และ CPU สำหรับ Namespace",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/",
      "docsPath": "/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/"
    },
    {
      "id": "admin-kubeadm-certs",
      "categoryId": "administer-cluster",
      "categoryTitle": "Administer a Cluster",
      "titleEn": "Certificate Management with kubeadm",
      "titleTh": "การจัดการและต่ออายุใบรับรอง (Certificates) ด้วย kubeadm",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/",
      "docsPath": "/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/"
    },
    {
      "id": "access-declare-network-policy",
      "categoryId": "administer-cluster",
      "categoryTitle": "Administer a Cluster",
      "titleEn": "Declare Network Policy",
      "titleTh": "การประกาศใช้งานนโยบายเครือข่าย (Network Policy)",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/",
      "docsPath": "/docs/tasks/administer-cluster/declare-network-policy/"
    },
    {
      "id": "debug-dns-resolution",
      "categoryId": "administer-cluster",
      "categoryTitle": "Administer a Cluster",
      "titleEn": "Debugging DNS Resolution",
      "titleTh": "การตรวจสอบและแก้ปัญหาระบบ DNS ภายในคลัสเตอร์",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/",
      "docsPath": "/docs/tasks/administer-cluster/dns-debugging-resolution/"
    },
    {
      "id": "pod-assign-memory-cpu",
      "categoryId": "configure-pods",
      "categoryTitle": "Configure Pods and Containers",
      "titleEn": "Assign Memory Resources to Containers and Pods",
      "titleTh": "การจัดสรรหน่วยความจำและ CPU ให้กับคอนเทนเนอร์",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/",
      "docsPath": "/docs/tasks/configure-pod-container/assign-memory-resource/"
    },
    {
      "id": "pod-quality-of-service",
      "categoryId": "configure-pods",
      "categoryTitle": "Configure Pods and Containers",
      "titleEn": "Configure Quality of Service for Pods",
      "titleTh": "การตั้งค่าระดับคุณภาพการบริการ (QoS Class) ของพอด",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/",
      "docsPath": "/docs/tasks/configure-pod-container/quality-service-pod/"
    },
    {
      "id": "pod-persistent-volume-storage",
      "categoryId": "configure-pods",
      "categoryTitle": "Configure Pods and Containers",
      "titleEn": "Configure a Pod to Use a PersistentVolume for Storage",
      "titleTh": "การตั้งค่าให้พอดใช้งานพื้นที่จัดเก็บ PersistentVolume",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/",
      "docsPath": "/docs/tasks/configure-pod-container/configure-persistent-volume-storage/"
    },
    {
      "id": "pod-liveness-readiness-startup-probes",
      "categoryId": "configure-pods",
      "categoryTitle": "Configure Pods and Containers",
      "titleEn": "Configure Liveness, Readiness and Startup Probes",
      "titleTh": "การตั้งค่าโพรบตรวจสอบสุขภาพพอด (Liveness, Readiness, Startup)",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/",
      "docsPath": "/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/"
    },
    {
      "id": "pod-assign-node-affinity",
      "categoryId": "configure-pods",
      "categoryTitle": "Configure Pods and Containers",
      "titleEn": "Assign Pods to Nodes using Node Affinity",
      "titleTh": "การกำหนดโหนดให้พอดด้วย Node Affinity",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/",
      "docsPath": "/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/"
    },
    {
      "id": "pod-configure-service-account",
      "categoryId": "configure-pods",
      "categoryTitle": "Configure Pods and Containers",
      "titleEn": "Configure Service Accounts for Pods",
      "titleTh": "การตั้งค่าและผูก Service Accounts ให้กับพอด",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/",
      "docsPath": "/docs/tasks/configure-pod-container/configure-service-account/"
    },
    {
      "id": "pod-security-context",
      "categoryId": "configure-pods",
      "categoryTitle": "Configure Pods and Containers",
      "titleEn": "Configure a Security Context for a Pod or Container",
      "titleTh": "การตั้งค่า Security Context สำหรับพอดและคอนเทนเนอร์",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/security-context/",
      "docsPath": "/docs/tasks/configure-pod-container/security-context/"
    },
    {
      "id": "pod-static-pods",
      "categoryId": "configure-pods",
      "categoryTitle": "Configure Pods and Containers",
      "titleEn": "Create Static Pods",
      "titleTh": "การสร้างสแตติกพอด (Static Pods)",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/",
      "docsPath": "/docs/tasks/configure-pod-container/static-pod/"
    },
    {
      "id": "inject-configmap",
      "categoryId": "configure-pods",
      "categoryTitle": "Configure Pods and Containers",
      "titleEn": "Configure a Pod to Use a ConfigMap",
      "titleTh": "การตั้งค่าให้พอดดึงค่าคอนฟิกจาก ConfigMap",
      "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/",
      "docsPath": "/docs/tasks/configure-pod-container/configure-pod-configmap/"
    },
    {
      "id": "inject-command-arguments",
      "categoryId": "inject-data",
      "categoryTitle": "Inject Data Into Applications",
      "titleEn": "Define a Command and Arguments for a Container",
      "titleTh": "การกำหนด Command และ Arguments ให้กับคอนเทนเนอร์",
      "officialUrl": "https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/",
      "docsPath": "/docs/tasks/inject-data-application/define-command-argument-container/"
    },
    {
      "id": "inject-env-variables",
      "categoryId": "inject-data",
      "categoryTitle": "Inject Data Into Applications",
      "titleEn": "Define Environment Variables for a Container",
      "titleTh": "การกำหนดตัวแปรสภาพแวดล้อม (Environment Variables)",
      "officialUrl": "https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/",
      "docsPath": "/docs/tasks/inject-data-application/define-environment-variable-container/"
    },
    {
      "id": "inject-credentials-secrets",
      "categoryId": "inject-data",
      "categoryTitle": "Inject Data Into Applications",
      "titleEn": "Distribute Credentials Securely Using Secrets",
      "titleTh": "การกระจายข้อมูลรับรองอย่างปลอดภัยด้วย Secrets",
      "officialUrl": "https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/",
      "docsPath": "/docs/tasks/inject-data-application/distribute-credentials-secure/"
    },
    {
      "id": "inject-downward-api",
      "categoryId": "inject-data",
      "categoryTitle": "Inject Data Into Applications",
      "titleEn": "Expose Pod Information to Containers Through Files",
      "titleTh": "การเปิดเผยข้อมูลพอดให้คอนเทนเนอร์ด้วย Downward API",
      "officialUrl": "https://kubernetes.io/docs/tasks/inject-data-application/downward-api-volume-expose-pod-information/",
      "docsPath": "/docs/tasks/inject-data-application/downward-api-volume-expose-pod-information/"
    },
    {
      "id": "run-stateless-deployment",
      "categoryId": "run-applications",
      "categoryTitle": "Run Applications",
      "titleEn": "Run a Stateless Application Using a Deployment",
      "titleTh": "การรันแอปพลิเคชันแบบ Stateless ด้วย Deployment",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/",
      "docsPath": "/docs/tasks/run-application/run-stateless-application-deployment/"
    },
    {
      "id": "run-stateful-application",
      "categoryId": "run-applications",
      "categoryTitle": "Run Applications",
      "titleEn": "Run a Replicated Stateful Application",
      "titleTh": "การรันแอปพลิเคชันแบบ Replicated Stateful (MySQL Master-Slave)",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/run-replicated-stateful-application/",
      "docsPath": "/docs/tasks/run-application/run-replicated-stateful-application/"
    },
    {
      "id": "run-hpa-autoscaling",
      "categoryId": "run-applications",
      "categoryTitle": "Run Applications",
      "titleEn": "HorizontalPodAutoscaler Walkthrough",
      "titleTh": "การตั้งค่าขยายพอดอัตโนมัติตามการใช้งาน CPU (HPA)",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/",
      "docsPath": "/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/"
    },
    {
      "id": "run-configure-pdb",
      "categoryId": "run-applications",
      "categoryTitle": "Run Applications",
      "titleEn": "Specifying a Disruption Budget for your Application",
      "titleTh": "การกำหนดงบประมาณการขัดจังหวะพอด (PDB)",
      "officialUrl": "https://kubernetes.io/docs/tasks/run-application/configure-pdb/",
      "docsPath": "/docs/tasks/run-application/configure-pdb/"
    },
    {
      "id": "job-cronjobs-work-queue",
      "categoryId": "run-jobs",
      "categoryTitle": "Run Jobs",
      "titleEn": "Running Automated Tasks with a CronJob",
      "titleTh": "การรันงานอัตโนมัติตามตารางเวลาด้วย CronJob",
      "officialUrl": "https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/",
      "docsPath": "/docs/tasks/job/automated-tasks-with-cron-jobs/"
    },
    {
      "id": "access-port-forward-services",
      "categoryId": "access-applications",
      "categoryTitle": "Access Applications in a Cluster",
      "titleEn": "Use Port Forwarding to Access Applications in a Cluster",
      "titleTh": "การใช้ Port Forwarding และ Services เพื่อเข้าถึงแอปพลิเคชัน",
      "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/",
      "docsPath": "/docs/tasks/access-application-cluster/port-forward-access-application-cluster/"
    },
    {
      "id": "access-ingress-nginx",
      "categoryId": "access-applications",
      "categoryTitle": "Access Applications in a Cluster",
      "titleEn": "Set up Ingress on Minikube with the NGINX Ingress Controller",
      "titleTh": "การติดตั้งและตั้งค่า Ingress ด้วย NGINX Controller",
      "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/",
      "docsPath": "/docs/tasks/access-application-cluster/ingress-minikube/"
    },
    {
      "id": "access-multiple-clusters-kubeconfig",
      "categoryId": "access-applications",
      "categoryTitle": "Access Applications in a Cluster",
      "titleEn": "Configure Access to Multiple Clusters",
      "titleTh": "การตั้งค่าการเชื่อมต่อหลายคลัสเตอร์ (kubeconfig)",
      "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/",
      "docsPath": "/docs/tasks/access-application-cluster/configure-access-multiple-clusters/"
    },
    {
      "id": "debug-pods-services",
      "categoryId": "debugging",
      "categoryTitle": "Monitoring, Logging, and Debugging",
      "titleEn": "Debug Pods",
      "titleTh": "ขั้นตอนการตรวจวินิจฉัยและแก้ปัญหาพอดและเซอร์วิส",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/",
      "docsPath": "/docs/tasks/debug/debug-application/debug-pods/"
    },
    {
      "id": "debug-running-pods-exec",
      "categoryId": "debugging",
      "categoryTitle": "Monitoring, Logging, and Debugging",
      "titleEn": "Get a Shell to a Running Container",
      "titleTh": "การเปิด Shell เข้าสู่คอนเทนเนอร์และการใช้ kubectl debug",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/get-shell-running-container/",
      "docsPath": "/docs/tasks/debug/debug-application/get-shell-running-container/"
    },
    {
      "id": "debug-cluster-crictl",
      "categoryId": "debugging",
      "categoryTitle": "Monitoring, Logging, and Debugging",
      "titleEn": "Debugging Kubernetes nodes with crictl",
      "titleTh": "การแก้ไขปัญหาคลัสเตอร์ระดับลึกด้วยคำสั่ง crictl",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/",
      "docsPath": "/docs/tasks/debug/debug-cluster/crictl/"
    },
    {
      "id": "manage-declarative-imperative",
      "categoryId": "manage-objects",
      "categoryTitle": "Manage Kubernetes Objects",
      "titleEn": "Declarative Management of Kubernetes Objects Using Configuration Files",
      "titleTh": "การจัดการอ็อบเจกต์แบบ Declarative และ Imperative",
      "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/",
      "docsPath": "/docs/tasks/manage-kubernetes-objects/declarative-config/"
    },
    {
      "id": "manage-kustomize-objects",
      "categoryId": "manage-objects",
      "categoryTitle": "Manage Kubernetes Objects",
      "titleEn": "Declarative Management of Kubernetes Objects Using Kustomize",
      "titleTh": "การจัดการอ็อบเจกต์แบบ Declarative ด้วย Kustomize",
      "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/",
      "docsPath": "/docs/tasks/manage-kubernetes-objects/kustomization/"
    },
    {
      "id": "manage-kubectl-patch",
      "categoryId": "manage-objects",
      "categoryTitle": "Manage Kubernetes Objects",
      "titleEn": "Update API Objects in Place Using kubectl patch",
      "titleTh": "การอัปเดตอ็อบเจกต์หน้างานด้วยคำสั่ง kubectl patch",
      "officialUrl": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/",
      "docsPath": "/docs/tasks/manage-kubernetes-objects/update-api-object-kubectl-patch/"
    }
  ]
};

  if (typeof window !== "undefined") {
    window.KUBE_TASKS_INDEX = catalogIndex;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = catalogIndex;
  }
})(typeof window !== "undefined" ? window : globalThis);
