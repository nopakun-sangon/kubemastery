/**
 * KubeMastery: CKAD Hands-On Exam Labs & Dynamic Scenario Generator
 * Aligned 100% with the Official CNCF / Linux Foundation CKAD Curriculum (5 Domains)
 * and PSI Bridge Exam Format (English Exam Tasks + Bilingual Post-Exam Review):
 *   1. Application Design and Build (20%)
 *   2. Application Deployment (20%)
 *   3. Application Observability and Maintenance (15%)
 *   4. Application Environment, Configuration and Security (25%)
 *   5. Services and Networking (20%)
 */
(function (root) {
  const CKAD_DOMAINS = [
    {
      id: "domain-1",
      number: 1,
      title: "Application Design and Build",
      titleTh: "การออกแบบและสร้างแอปพลิเคชันบนพอด",
      weight: 20,
      color: "blue",
      topics: "Multi-Container Pods, Native Sidecar, Init Containers, Jobs, CronJobs, Volumes & PVC"
    },
    {
      id: "domain-2",
      number: 2,
      title: "Application Deployment",
      titleTh: "การดีพลอยและบริหารจัดการเวอร์ชันแอปพลิเคชัน",
      weight: 20,
      color: "purple",
      topics: "RollingUpdate, Rollback, Canary Deployment, Blue/Green Switching, Kustomize"
    },
    {
      id: "domain-3",
      number: 3,
      title: "Application Observability and Maintenance",
      titleTh: "การตรวจสอบสุขภาพระบบ การดู Log และการแก้ปัญหาพอด",
      weight: 15,
      color: "teal",
      topics: "Liveness/Readiness/Startup Probes, Troubleshooting CrashLoopBackOff, API Deprecation, Logs"
    },
    {
      id: "domain-4",
      number: 4,
      title: "Application Environment, Configuration and Security",
      titleTh: "การตั้งค่าคอนฟิก ความลับ ความปลอดภัย และโควตาทรัพยากร",
      weight: 25,
      color: "amber",
      topics: "ConfigMap, Secret, SecurityContext, Capabilities, ServiceAccount & RBAC, ResourceQuota"
    },
    {
      id: "domain-5",
      number: 5,
      title: "Services and Networking",
      titleTh: "ระบบเครือข่าย เซอร์วิส Ingress และ NetworkPolicy",
      weight: 20,
      color: "rose",
      topics: "ClusterIP/NodePort Services, Troubleshooting Service Endpoints, Ingress Routing, NetworkPolicy"
    }
  ];

  // Helper to pick an item from array using a numeric seed
  function pick(arr, seed, offset = 0) {
    const idx = Math.abs(Math.floor(seed + offset * 7)) % arr.length;
    return arr[idx];
  }

  /**
   * 20 Official CNCF / PSI Bridge Style CKAD Exam Question Blueprints
   * Each blueprint defines a `build(seed)` function that returns a concrete, parameterized
   * question instance (with randomized cluster context, namespace, names, ports, files,
   * initial cluster state, and verification rules).
   */
  const CKAD_LAB_BLUEPRINTS = [
    // =========================================================================
    // DOMAIN 1: APPLICATION DESIGN AND BUILD (20%)
    // =========================================================================
    {
      id: "ckad-01",
      domainId: "domain-1",
      domainTitle: "Application Design and Build (20%)",
      baseTitle: "Multi-Container Pod & Native Sidecar Log Shipper",
      weight: 7,
      targetMinutes: 6,
      build(seed = 101) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["audit-log-101", "payment-logs-204", "telemetry-prod-309", "stream-core-412"], seed, 1);
        const podName = pick(["web-logger-pod", "order-audit-pod", "api-shipper-pod", "txn-monitor-pod"], seed, 2);
        const sidecarName = pick(["log-shipper", "fluent-sidecar", "audit-agent", "tail-worker"], seed, 3);
        const logPath = pick(["/var/log/app", "/var/log/audit", "/opt/logs/service", "/data/logs"], seed, 4);
        const volName = pick(["shared-logs", "log-storage", "audit-vol"], seed, 5);

        return {
          id: "ckad-01",
          seed,
          domainId: "domain-1",
          domainTitle: "Application Design and Build (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Multi-Container Pod & Native Sidecar Container (${podName})`,
          titleTh: `สร้าง Multi-Container Pod พร้อม Native Sidecar แชร์ Volume (${podName})`,
          weight: 7,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-01`,
          scenario: `A legacy application in namespace \`${ns}\` writes access logs to \`${logPath}/access.log\`. An initial Pod manifest has been provided at \`~/ckad-workspace/ckad-01/pod.yaml\` for Pod \`${podName}\` containing the primary container \`main-app\`.`,
          scenarioTh: `ใน Namespace \`${ns}\` มีไฟล์ตั้งต้น \`~/ckad-workspace/ckad-01/pod.yaml\` สำหรับพอดชื่อ \`${podName}\` ซึ่งมีคอนเทนเนอร์หลักชื่อ \`main-app\` ที่เขียนไฟล์ Log ลงใน \`${logPath}/access.log\``,
          requirements: [
            `Update and apply the Pod manifest so that Pod \`${podName}\` is running in namespace \`${ns}\`.`,
            `Define an \`emptyDir\` volume named \`${volName}\` and mount it into the \`main-app\` container at \`${logPath}\`.`,
            `Add a **Native Sidecar Container** (an entry in \`initContainers\` with \`restartPolicy: Always\`) named \`${sidecarName}\` using image \`busybox:1.36\` and command \`["sh", "-c", "tail -n+1 -f ${logPath}/access.log"]\`.`,
            `Mount the shared volume \`${volName}\` into the sidecar container \`${sidecarName}\` at \`${logPath}\`.`
          ],
          requirementsTh: [
            `สร้างหรือแก้ไขพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ให้ทำงานอยู่ในสถานะ \`Running\``,
            `กำหนด Volume ชนิด \`emptyDir\` ชื่อ \`${volName}\` และนำไป Mount เข้ากับคอนเทนเนอร์ \`main-app\` ที่พาธ \`${logPath}\``,
            `เพิ่ม **Native Sidecar Container** (กำหนดใน \`initContainers\` พร้อมตั้งค่า \`restartPolicy: Always\`) ชื่อ \`${sidecarName}\` ใช้อิมเมจ \`busybox:1.36\` รันคำสั่ง \`["sh", "-c", "tail -n+1 -f ${logPath}/access.log"]\``,
            `Mount Volume \`${volName}\` เข้ากับ Sidecar Container \`${sidecarName}\` ที่พาธ \`${logPath}\` เช่นเดียวกัน`
          ],
          hints: [
            `In Kubernetes 1.29+, a Native Sidecar is defined inside spec.initContainers with restartPolicy: Always at the container level. (ใน K8s ยุคใหม่ Native Sidecar คือการใส่คอนเทนเนอร์ใน spec.initContainers พร้อมระบุ restartPolicy: Always)`,
            `Ensure both main-app and ${sidecarName} mount volume ${volName} at mountPath: ${logPath}. (ตรวจสอบว่าทั้งสองคอนเทนเนอร์ Mount Volume ${volName} ที่พาธ ${logPath} ตรงกัน)`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-01/pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  volumes:
  - name: ${volName}
    emptyDir: {}
  initContainers:
  - name: ${sidecarName}
    image: busybox:1.36
    restartPolicy: Always
    command: ["sh", "-c", "tail -n+1 -f ${logPath}/access.log"]
    volumeMounts:
    - name: ${volName}
      mountPath: ${logPath}
  containers:
  - name: main-app
    image: busybox:1.36
    command: ["sh", "-c", "while true; do date >> ${logPath}/access.log; sleep 2; done"]
    volumeMounts:
    - name: ${volName}
      mountPath: ${logPath}
EOF
kubectl apply -f ~/ckad-workspace/ckad-01/pod.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {
              "pod.yaml": `apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  containers:
  - name: main-app
    image: busybox:1.36
    command: ["sh", "-c", "while true; do date >> ${logPath}/access.log; sleep 2; done"]
`
            },
            resources: []
          },
          verifySpec: {
            checks: [
              {
                id: "pod-exists",
                title: `Pod ${podName} exists in namespace ${ns} and is Running`,
                type: "k8s-resource",
                kind: "Pod",
                namespace: ns,
                name: podName,
                expect: { statusPhase: "Running" },
                failHint: `Pod ${podName} was not found in namespace ${ns} or is not Running. (ตรวจสอบว่าได้สั่ง kubectl apply -f แล้ว)`
              },
              {
                id: "emptydir-vol",
                title: `emptyDir volume ${volName} is defined and mounted at ${logPath} in main-app`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "hasVolumeAndMount",
                volName: volName,
                volType: "emptyDir",
                containerName: "main-app",
                mountPath: logPath,
                failHint: `Ensure spec.volumes defines ${volName}: { emptyDir: {} } and main-app mounts it at ${logPath}. (ตรวจสอบ volumeMounts ใน main-app)`
              },
              {
                id: "native-sidecar",
                title: `Native Sidecar ${sidecarName} (image: busybox:1.36, restartPolicy: Always) mounts ${logPath}`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "hasSidecarContainer",
                containerName: sidecarName,
                imagePrefix: "busybox",
                mountPath: logPath,
                failHint: `Add container ${sidecarName} under initContainers with restartPolicy: Always and volumeMounts at ${logPath}. (ต้องเพิ่มใน initContainers พร้อม restartPolicy: Always)`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-02",
      domainId: "domain-1",
      domainTitle: "Application Design and Build (20%)",
      baseTitle: "Init Container Pre-Configuration Setup",
      weight: 5,
      targetMinutes: 5,
      build(seed = 102) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["web-init-102", "frontend-boot-205", "portal-stage-311", "shop-ui-419"], seed, 1);
        const podName = pick(["init-webapp", "portal-pod", "landing-nginx", "catalog-ui"], seed, 2);
        const initName = pick(["config-initializer", "setup-html", "prepare-assets"], seed, 3);
        const secretText = pick(["CKAD_INIT_READY_2026", "KUBE_PORTAL_OK_99", "SYSTEM_BOOT_VERIFIED", "PROD_CONFIG_LOADED"], seed, 4);

        return {
          id: "ckad-02",
          seed,
          domainId: "domain-1",
          domainTitle: "Application Design and Build (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Init Container Pre-Configuration (${podName})`,
          titleTh: `สร้าง Pod ที่มี Init Container เตรียมไฟล์เริ่มต้น (${podName})`,
          weight: 5,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-02`,
          scenario: `A web server Pod must have its landing page generated dynamically by an initialization container before the main NGINX container starts in namespace \`${ns}\`.`,
          scenarioTh: `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ที่ใช้ Init Container ในการสร้างไฟล์ \`index.html\` ก่อนที่คอนเทนเนอร์ \`nginx:1.25-alpine\` จะเริ่มทำงาน`,
          requirements: [
            `Create a Pod named \`${podName}\` in namespace \`${ns}\` with an \`emptyDir\` volume named \`web-content\`.`,
            `Configure an Init Container (\`initContainers\`) named \`${initName}\` using image \`busybox:1.36\` that mounts \`web-content\` at \`/work-dir\` and writes the string \`${secretText}\` into \`/work-dir/index.html\`.`,
            `Configure the main container named \`web-server\` using image \`nginx:1.25-alpine\`, exposing \`containerPort: 80\`, and mounting \`web-content\` at \`/usr/share/nginx/html\`.`
          ],
          requirementsTh: [
            `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` พร้อม Volume \`emptyDir\` ชื่อ \`web-content\``,
            `กำหนด \`initContainers\` ชื่อ \`${initName}\` ใช้อิมเมจ \`busybox:1.36\` รันคำสั่งสร้างไฟล์ \`/work-dir/index.html\` ที่มีข้อความว่า \`${secretText}\` (โดย Mount Volume \`web-content\` ไว้ที่ \`/work-dir\`)`,
            `กำหนดคอนเทนเนอร์หลักชื่อ \`web-server\` ใช้อิมเมจ \`nginx:1.25-alpine\` เปิดพอร์ต \`80\` และ Mount Volume \`web-content\` ไว้ที่ \`/usr/share/nginx/html\``
          ],
          hints: [
            `Use command: ["sh", "-c", "echo '${secretText}' > /work-dir/index.html"] inside the initContainer. (ใช้คำสั่ง sh -c echo เขียนไฟล์ลงใน /work-dir/index.html)`,
            `Make sure both initContainer (/work-dir) and main container (/usr/share/nginx/html) mount volume web-content. (อย่าลืมผูก Volume web-content ให้ทั้งสองคอนเทนเนอร์)`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-02/init-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  volumes:
  - name: web-content
    emptyDir: {}
  initContainers:
  - name: ${initName}
    image: busybox:1.36
    command: ["sh", "-c", "echo '${secretText}' > /work-dir/index.html"]
    volumeMounts:
    - name: web-content
      mountPath: /work-dir
  containers:
  - name: web-server
    image: nginx:1.25-alpine
    ports:
    - containerPort: 80
    volumeMounts:
    - name: web-content
      mountPath: /usr/share/nginx/html
EOF
kubectl apply -f ~/ckad-workspace/ckad-02/init-pod.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: []
          },
          verifySpec: {
            checks: [
              {
                id: "pod-running",
                title: `Pod ${podName} exists in namespace ${ns} and is Running`,
                type: "k8s-resource",
                kind: "Pod",
                namespace: ns,
                name: podName,
                expect: { statusPhase: "Running" },
                failHint: `Pod ${podName} was not found in namespace ${ns}. (ไม่พบพอด ${podName} ใน Namespace ${ns})`
              },
              {
                id: "init-container-check",
                title: `initContainer ${initName} writes ${secretText} to /work-dir/index.html`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "hasInitContainerCommand",
                containerName: initName,
                commandSubstring: secretText,
                mountPath: "/work-dir",
                failHint: `Check initContainer ${initName} command for '${secretText}' and mountPath: /work-dir. (ตรวจสอบ command และ mountPath ของ initContainer)`
              },
              {
                id: "main-mount-check",
                title: `Main container web-server uses nginx:1.25-alpine and mounts /usr/share/nginx/html`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "hasVolumeAndMount",
                volName: "web-content",
                volType: "emptyDir",
                containerName: "web-server",
                mountPath: "/usr/share/nginx/html",
                failHint: `Main container must be named web-server and mount volume web-content at /usr/share/nginx/html. (คอนเทนเนอร์หลักต้องชื่อ web-server และ Mount ที่ /usr/share/nginx/html)`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-03",
      domainId: "domain-1",
      domainTitle: "Application Design and Build (20%)",
      baseTitle: "CronJob Batch Processing with Parallelism & Deadline",
      weight: 6,
      targetMinutes: 5,
      build(seed = 103) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["batch-jobs-103", "finance-cron-208", "report-engine-315", "data-sync-422"], seed, 1);
        const cronName = pick(["nightly-settlement", "invoice-aggregator", "backup-indexer", "metrics-cleaner"], seed, 2);
        const schedule = pick(["*/5 * * * *", "*/10 * * * *", "0 */2 * * *", "15 * * * *"], seed, 3);
        const completions = pick([3, 4, 5], seed, 4);
        const parallelism = pick([2, 3], seed, 5);
        const deadline = pick([45, 60, 90], seed, 6);

        return {
          id: "ckad-03",
          seed,
          domainId: "domain-1",
          domainTitle: "Application Design and Build (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `CronJob with Parallelism & ActiveDeadlineSeconds (${cronName})`,
          titleTh: `สร้าง CronJob กำหนด Parallelism และ ActiveDeadlineSeconds (${cronName})`,
          weight: 6,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-03`,
          scenario: `The data engineering team requires a scheduled batch processing \`CronJob\` in namespace \`${ns}\` with strict concurrency, completion count, and execution timeout constraints.`,
          scenarioTh: `ทีม Data ต้องการรันงานประมวลผลตามตารางเวลาใน Namespace \`${ns}\` โดยควบคุมจำนวนการทำงานขนานและเวลาสูงสุดต่อรอบ`,
          requirements: [
            `Create a \`CronJob\` named \`${cronName}\` in namespace \`${ns}\` with schedule \`"${schedule}"\`.`,
            `Set \`successfulJobsHistoryLimit: 2\` and \`failedJobsHistoryLimit: 1\` on the CronJob spec.`,
            `Under \`jobTemplate.spec\`, configure \`completions: ${completions}\`, \`parallelism: ${parallelism}\`, and \`activeDeadlineSeconds: ${deadline}\`.`,
            `The Pod template must run image \`busybox:1.36\` with command \`["sh", "-c", "echo Processing batch && sleep 2"]\` and \`restartPolicy: OnFailure\`.`
          ],
          requirementsTh: [
            `สร้าง \`CronJob\` ชื่อ \`${cronName}\` ใน Namespace \`${ns}\` ตั้งตารางเวลารันเป็น \`"${schedule}"\``,
            `กำหนด \`successfulJobsHistoryLimit: 2\` และ \`failedJobsHistoryLimit: 1\` ในสเปกของ CronJob`,
            `ใน \`jobTemplate.spec\` ให้กำหนด \`completions: ${completions}\`, \`parallelism: ${parallelism}\`, และ \`activeDeadlineSeconds: ${deadline}\``,
            `คอนเทนเนอร์ในพอดใช้อิมเมจ \`busybox:1.36\` รันคำสั่ง \`["sh", "-c", "echo Processing batch && sleep 2"]\` และตั้ง \`restartPolicy: OnFailure\``
          ],
          hints: [
            `Generate boilerplate YAML with: kubectl -n ${ns} create cronjob ${cronName} --image=busybox:1.36 --schedule="${schedule}" --dry-run=client -o yaml > cron.yaml -- sh -c "echo Processing batch && sleep 2"`,
            `completions, parallelism, and activeDeadlineSeconds belong under spec.jobTemplate.spec (JobSpec level, not PodSpec). (ฟิลด์ทั้ง 3 อยู่ภายใต้ spec.jobTemplate.spec)`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-03/cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: ${cronName}
  namespace: ${ns}
spec:
  schedule: "${schedule}"
  successfulJobsHistoryLimit: 2
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      completions: ${completions}
      parallelism: ${parallelism}
      activeDeadlineSeconds: ${deadline}
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: batch-worker
            image: busybox:1.36
            command: ["sh", "-c", "echo Processing batch && sleep 2"]
EOF
kubectl apply -f ~/ckad-workspace/ckad-03/cronjob.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: []
          },
          verifySpec: {
            checks: [
              {
                id: "cron-exists",
                title: `CronJob ${cronName} exists in namespace ${ns} with schedule "${schedule}"`,
                type: "k8s-jsonpath",
                kind: "CronJob",
                namespace: ns,
                name: cronName,
                rule: "cronSchedule",
                expectedSchedule: schedule,
                failHint: `CronJob ${cronName} not found in namespace ${ns} or spec.schedule does not match "${schedule}". (ตรวจสอบชื่อและ schedule ของ CronJob)`
              },
              {
                id: "cron-job-spec",
                title: `JobSpec sets completions: ${completions}, parallelism: ${parallelism}, activeDeadlineSeconds: ${deadline}`,
                type: "k8s-jsonpath",
                kind: "CronJob",
                namespace: ns,
                name: cronName,
                rule: "cronJobSpecs",
                completions,
                parallelism,
                activeDeadlineSeconds: deadline,
                failHint: `Verify spec.jobTemplate.spec has completions: ${completions}, parallelism: ${parallelism}, activeDeadlineSeconds: ${deadline}. (ตรวจสอบฟิลด์ใน spec.jobTemplate.spec)`
              },
              {
                id: "cron-history-limits",
                title: `Configures successfulJobsHistoryLimit: 2 and restartPolicy: OnFailure`,
                type: "k8s-jsonpath",
                kind: "CronJob",
                namespace: ns,
                name: cronName,
                rule: "cronHistoryAndRestart",
                successfulJobsHistoryLimit: 2,
                restartPolicy: "OnFailure",
                failHint: `Verify spec.successfulJobsHistoryLimit: 2 and Pod template restartPolicy: OnFailure. (ตรวจสอบ successfulJobsHistoryLimit และ restartPolicy)`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-04",
      domainId: "domain-1",
      domainTitle: "Application Design and Build (20%)",
      baseTitle: "PersistentVolume, PersistentVolumeClaim & Pod Volume Mount",
      weight: 6,
      targetMinutes: 6,
      build(seed = 104) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["storage-app-104", "media-store-211", "archive-db-318", "upload-svc-425"], seed, 1);
        const pvName = pick(["pv-data-104", "pv-media-211", "pv-archive-318", "pv-upload-425"], seed, 2);
        const pvcName = pick(["pvc-app-data", "pvc-media-claim", "pvc-archive-claim", "pvc-upload-claim"], seed, 3);
        const podName = pick(["storage-consumer", "media-writer", "archive-pod", "upload-worker"], seed, 4);
        const size = pick(["500Mi", "1Gi", "2Gi"], seed, 5);
        const mountPath = pick(["/var/lib/data", "/usr/share/nginx/html", "/mnt/storage", "/data/uploads"], seed, 6);

        return {
          id: "ckad-04",
          seed,
          domainId: "domain-1",
          domainTitle: "Application Design and Build (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `PersistentVolume, PVC & Pod Storage Mount (${podName})`,
          titleTh: `สร้าง PV, PVC (${size}) และนำไปผูกใช้งานกับพอด (${podName})`,
          weight: 6,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-04`,
          scenario: `Provision persistent storage and mount it into an application Pod in namespace \`${ns}\`.`,
          scenarioTh: `สร้างพื้นที่จัดเก็บข้อมูลถาวรและนำไปเชื่อมต่อเข้ากับพอดใน Namespace \`${ns}\``,
          requirements: [
            `Create a cluster-scoped \`PersistentVolume\` named \`${pvName}\` with capacity \`storage: ${size}\`, \`accessModes: ["ReadWriteOnce"]\`, \`storageClassName: standard\`, and \`hostPath.path: /mnt/data-${seed}\`.`,
            `Create a \`PersistentVolumeClaim\` named \`${pvcName}\` in namespace \`${ns}\` requesting \`storage: ${size}\`, \`accessModes: ["ReadWriteOnce"]\`, and \`storageClassName: standard\`.`,
            `Create a Pod named \`${podName}\` in namespace \`${ns}\` using image \`nginx:1.25-alpine\` that mounts PVC \`${pvcName}\` at \`${mountPath}\`.`
          ],
          requirementsTh: [
            `สร้าง \`PersistentVolume\` ชื่อ \`${pvName}\` ขนาด \`${size}\`, \`accessModes: ["ReadWriteOnce"]\`, \`storageClassName: standard\`, และ \`hostPath.path: /mnt/data-${seed}\``,
            `สร้าง \`PersistentVolumeClaim\` ชื่อ \`${pvcName}\` ใน Namespace \`${ns}\` ที่ขอขนาด \`${size}\`, \`accessModes: ["ReadWriteOnce"]\`, และ \`storageClassName: standard\``,
            `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ใช้อิมเมจ \`nginx:1.25-alpine\` โดย Mount PVC \`${pvcName}\` ไปไว้ที่พาธ \`${mountPath}\``
          ],
          hints: [
            `PersistentVolume is cluster-scoped (no namespace), whereas PersistentVolumeClaim and Pod must be created in namespace ${ns}. (PV ไม่มี namespace ส่วน PVC และ Pod ต้องอยู่ใน ${ns})`,
            `Ensure storageClassName: standard and accessModes: [ReadWriteOnce] match on both PV and PVC. (ตรวจสอบให้ storageClassName และ accessModes ตรงกัน)`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-04/storage.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: ${pvName}
spec:
  capacity:
    storage: ${size}
  accessModes:
  - ReadWriteOnce
  storageClassName: standard
  hostPath:
    path: /mnt/data-${seed}
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${pvcName}
  namespace: ${ns}
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: ${size}
---
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  volumes:
  - name: data-vol
    persistentVolumeClaim:
      claimName: ${pvcName}
  containers:
  - name: nginx
    image: nginx:1.25-alpine
    volumeMounts:
    - name: data-vol
      mountPath: ${mountPath}
EOF
kubectl apply -f ~/ckad-workspace/ckad-04/storage.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: []
          },
          verifySpec: {
            checks: [
              {
                id: "pv-check",
                title: `PersistentVolume ${pvName} exists with capacity ${size} (ReadWriteOnce)`,
                type: "k8s-jsonpath",
                kind: "PersistentVolume",
                namespace: "",
                name: pvName,
                rule: "pvCheck",
                storage: size,
                failHint: `PersistentVolume ${pvName} not found or capacity.storage is not ${size}. (ไม่พบ PV ${pvName} หรือขนาดไม่ใช่ ${size})`
              },
              {
                id: "pvc-check",
                title: `PersistentVolumeClaim ${pvcName} exists in namespace ${ns} requesting ${size}`,
                type: "k8s-jsonpath",
                kind: "PersistentVolumeClaim",
                namespace: ns,
                name: pvcName,
                rule: "pvcCheck",
                storage: size,
                failHint: `PVC ${pvcName} not found in namespace ${ns} or requests.storage is not ${size}. (ไม่พบ PVC ${pvcName} หรือขนาดไม่ใช่ ${size})`
              },
              {
                id: "pod-pvc-mount",
                title: `Pod ${podName} mounts PVC ${pvcName} at ${mountPath}`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podPvcMount",
                claimName: pvcName,
                mountPath: mountPath,
                failHint: `Pod ${podName} does not reference claimName: ${pvcName} or does not mount it at ${mountPath}. (ตรวจสอบการผูก PVC และ mountPath ในพอด)`
              }
            ]
          }
        };
      }
    },

    // =========================================================================
    // DOMAIN 2: APPLICATION DEPLOYMENT (20%)
    // =========================================================================
    {
      id: "ckad-05",
      domainId: "domain-2",
      domainTitle: "Application Deployment (20%)",
      baseTitle: "RollingUpdate Strategy & Rollback Broken Deployment",
      weight: 8,
      targetMinutes: 6,
      build(seed = 105) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["payment-prod-482", "checkout-live-519", "order-core-621", "billing-api-734"], seed, 1);
        const deployName = pick(["checkout-api", "payment-gateway", "order-processor", "billing-worker"], seed, 2);
        const maxSurge = pick([1, 2, "25%"], seed, 3);
        const goodImage = "nginx:1.25-alpine";
        const brokenImage = "nginx:1.99-broken-tag";

        return {
          id: "ckad-05",
          seed,
          domainId: "domain-2",
          domainTitle: "Application Deployment (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `RollingUpdate Strategy & Deployment Rollback (${deployName})`,
          titleTh: `ปรับกลยุทธ์ RollingUpdate และสั่ง Rollback Deployment ที่พัง (${deployName})`,
          weight: 8,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-05`,
          scenario: `In namespace \`${ns}\`, Deployment \`${deployName}\` (3 replicas) was recently updated to a non-existent container image (\`${brokenImage}\`), causing new Pods to fail with \`ImagePullBackOff\`.`,
          scenarioTh: `ใน Namespace \`${ns}\` มี Deployment ชื่อ \`${deployName}\` (จำนวน 3 Replicas) ที่เพิ่งถูกอัปเดตเป็นอิมเมจที่ไม่มีอยู่จริง (\`${brokenImage}\`) ทำให้พอดใหม่ติดสถานะ \`ImagePullBackOff\``,
          requirements: [
            `Update Deployment \`${deployName}\` in namespace \`${ns}\` so that \`spec.strategy.rollingUpdate.maxSurge\` is \`${maxSurge}\` and \`spec.strategy.rollingUpdate.maxUnavailable\` is \`0\`.`,
            `**Roll back** Deployment \`${deployName}\` to Revision 1 (which runs image \`${goodImage}\`) so that all Pods return to the \`Running\` state.`,
            `Save the output of \`kubectl -n ${ns} rollout history deploy/${deployName}\` to \`~/ckad-workspace/ckad-05/rollout-history.txt\`.`
          ],
          requirementsTh: [
            `แก้ไข Deployment \`${deployName}\` ใน Namespace \`${ns}\` ให้ตั้งค่า \`strategy.rollingUpdate.maxSurge: ${maxSurge}\` และ \`strategy.rollingUpdate.maxUnavailable: 0\``,
            `สั่ง **Rollback** Deployment \`${deployName}\` กลับไปยัง Revision 1 (ที่ใช้อิมเมจ \`${goodImage}\`) จนพอดทั้งหมดกลับมาทำงานปกติ`,
            `บันทึกผลลัพธ์ของคำสั่ง \`kubectl -n ${ns} rollout history deploy/${deployName}\` ลงในไฟล์ \`~/ckad-workspace/ckad-05/rollout-history.txt\``
          ],
          hints: [
            `Use kubectl -n ${ns} edit deploy ${deployName} or kubectl patch to configure maxSurge and maxUnavailable. (ใช้ kubectl edit หรือ patch เพื่อแก้ค่า RollingUpdate)`,
            `Run kubectl -n ${ns} rollout undo deploy/${deployName} to roll back to revision 1 (${goodImage}). (ใช้ kubectl rollout undo เพื่อย้อนกลับไปยังอิมเมจที่ทำงานได้)`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
kubectl -n ${ns} patch deploy ${deployName} -p '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":${typeof maxSurge === "string" ? `"${maxSurge}"` : maxSurge},"maxUnavailable":0}}}}'
kubectl -n ${ns} rollout undo deploy/${deployName}
kubectl -n ${ns} rollout history deploy/${deployName} > ~/ckad-workspace/ckad-05/rollout-history.txt`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: [
              {
                apiVersion: "apps/v1",
                kind: "Deployment",
                metadata: { name: deployName, namespace: ns, annotations: { "deployment.kubernetes.io/revision": "2" } },
                spec: {
                  replicas: 3,
                  selector: { matchLabels: { app: deployName } },
                  strategy: { type: "RollingUpdate", rollingUpdate: { maxSurge: "25%", maxUnavailable: "25%" } },
                  template: {
                    metadata: { labels: { app: deployName } },
                    spec: { containers: [{ name: "web", image: brokenImage, ports: [{ containerPort: 80 }] }] }
                  }
                },
                _revisionHistory: [
                  { revision: 1, image: goodImage, changeCause: "Initial stable release" },
                  { revision: 2, image: brokenImage, changeCause: "Update to broken tag" }
                ]
              }
            ]
          },
          verifySpec: {
            checks: [
              {
                id: "strategy-check",
                title: `RollingUpdate strategy sets maxSurge: ${maxSurge} and maxUnavailable: 0 on ${deployName}`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: deployName,
                rule: "rollingUpdateStrategy",
                maxSurge: String(maxSurge),
                maxUnavailable: "0",
                failHint: `spec.strategy.rollingUpdate on ${deployName} does not match maxSurge: ${maxSurge} and maxUnavailable: 0. (ตรวจสอบค่า maxSurge และ maxUnavailable)`
              },
              {
                id: "rollback-image-check",
                title: `Deployment ${deployName} rolled back to working image ${goodImage}`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: deployName,
                rule: "deploymentImage",
                expectedImage: goodImage,
                failHint: `Deployment ${deployName} still uses the broken image. Run: kubectl -n ${ns} rollout undo deploy/${deployName}`
              },
              {
                id: "history-file-check",
                title: `Rollout history saved to ~/ckad-workspace/ckad-05/rollout-history.txt`,
                type: "file-contains",
                filePath: "rollout-history.txt",
                substrings: ["REVISION", "1"],
                failHint: `File ~/ckad-workspace/ckad-05/rollout-history.txt is missing or does not contain rollout history output.`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-06",
      domainId: "domain-2",
      domainTitle: "Application Deployment (20%)",
      baseTitle: "Canary Deployment Traffic Splitting (80% / 20%)",
      weight: 7,
      targetMinutes: 6,
      build(seed = 106) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["canary-prod-106", "ab-test-214", "release-v2-329", "traffic-split-408"], seed, 1);
        const svcName = pick(["frontend-svc", "storefront-svc", "catalog-svc"], seed, 2);
        const appLabel = pick(["storefront", "catalog-ui", "web-portal"], seed, 3);
        const totalPods = pick([5, 10], seed, 4);
        const stableReplicas = totalPods === 5 ? 4 : 8;
        const canaryReplicas = totalPods === 5 ? 1 : 2;

        return {
          id: "ckad-06",
          seed,
          domainId: "domain-2",
          domainTitle: "Application Deployment (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Canary Deployment 80/20 Traffic Split (${svcName})`,
          titleTh: `ทำ Canary Deployment แบ่งทราฟฟิก 80/20 ภายใต้ Service เดียวกัน (${svcName})`,
          weight: 7,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-06`,
          scenario: `In namespace \`${ns}\`, Deployment \`${appLabel}-stable\` and Service \`${svcName}\` (selecting \`app: ${appLabel}\`) are currently serving production traffic. You must deploy a Canary release receiving **20%** of total traffic across a combined fleet of **${totalPods} Pods**.`,
          scenarioTh: `ใน Namespace \`${ns}\` มี Deployment ชื่อ \`${appLabel}-stable\` และ Service ชื่อ \`${svcName}\` ที่คัดเลือกพอดด้วยเลเบล \`app: ${appLabel}\` อยู่แล้ว ทีมต้องการปล่อยเวอร์ชัน Canary เพื่อรับทราฟฟิก **20%** ของพอดทั้งหมด (รวมทั้งหมด ${totalPods} พอด)`,
          requirements: [
            `Scale existing Deployment \`${appLabel}-stable\` in namespace \`${ns}\` to \`replicas: ${stableReplicas}\` (80% of ${totalPods} total Pods).`,
            `Create a new Deployment named \`${appLabel}-canary\` in namespace \`${ns}\` with \`replicas: ${canaryReplicas}\` (20% of ${totalPods} total Pods).`,
            `Configure \`${appLabel}-canary\` Pod template with labels \`app: ${appLabel}\` and \`track: canary\`, running image \`nginx:1.26-alpine\` on \`containerPort: 80\` so that Service \`${svcName}\` load-balances across both stable and canary Pods.`
          ],
          requirementsTh: [
            `ปรับขนาด (Scale) Deployment \`${appLabel}-stable\` ใน Namespace \`${ns}\` ให้มี \`replicas: ${stableReplicas}\` (คิดเป็น 80% ของ ${totalPods} พอด)`,
            `สร้าง Deployment ตัวใหม่ชื่อ \`${appLabel}-canary\` ใน Namespace \`${ns}\` จำนวน \`replicas: ${canaryReplicas}\` (คิดเป็น 20% ของ ${totalPods} พอด)`,
            `กำหนดให้พอดของ \`${appLabel}-canary\` มีเลเบล \`app: ${appLabel}\` และ \`track: canary\` และใช้อิมเมจ \`nginx:1.26-alpine\` เปิดพอร์ต \`80\` เพื่อให้ Service \`${svcName}\` กระจายทราฟฟิกมาหาทั้งชุด stable และ canary`
          ],
          hints: [
            `Inspect ~/ckad-workspace/ckad-06/stable-deploy.yaml and copy it as a template for canary-deploy.yaml. (คัดลอกไฟล์ stable-deploy.yaml มาดัดแปลงเป็น canary-deploy.yaml)`,
            `Ensure Service ${svcName} selects app: ${appLabel} so it matches both stable (${stableReplicas} replicas) and canary (${canaryReplicas} replicas).`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
kubectl -n ${ns} scale deploy ${appLabel}-stable --replicas=${stableReplicas}
cat << 'EOF' > ~/ckad-workspace/ckad-06/canary-deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appLabel}-canary
  namespace: ${ns}
spec:
  replicas: ${canaryReplicas}
  selector:
    matchLabels:
      app: ${appLabel}
      track: canary
  template:
    metadata:
      labels:
        app: ${appLabel}
        track: canary
    spec:
      containers:
      - name: web
        image: nginx:1.26-alpine
        ports:
        - containerPort: 80
EOF
kubectl apply -f ~/ckad-workspace/ckad-06/canary-deploy.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {
              "stable-deploy.yaml": `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appLabel}-stable
  namespace: ${ns}
spec:
  replicas: ${totalPods}
  selector:
    matchLabels:
      app: ${appLabel}
      track: stable
  template:
    metadata:
      labels:
        app: ${appLabel}
        track: stable
    spec:
      containers:
      - name: web
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
`
            },
            resources: [
              {
                apiVersion: "apps/v1",
                kind: "Deployment",
                metadata: { name: `${appLabel}-stable`, namespace: ns },
                spec: {
                  replicas: totalPods,
                  selector: { matchLabels: { app: appLabel, track: "stable" } },
                  template: {
                    metadata: { labels: { app: appLabel, track: "stable" } },
                    spec: { containers: [{ name: "web", image: "nginx:1.25-alpine", ports: [{ containerPort: 80 }] }] }
                  }
                }
              },
              {
                apiVersion: "v1",
                kind: "Service",
                metadata: { name: svcName, namespace: ns },
                spec: {
                  selector: { app: appLabel },
                  ports: [{ port: 80, targetPort: 80 }]
                }
              }
            ]
          },
          verifySpec: {
            checks: [
              {
                id: "stable-scaled",
                title: `Deployment ${appLabel}-stable scaled to ${stableReplicas} replicas (80%)`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: `${appLabel}-stable`,
                rule: "deploymentReplicas",
                replicas: stableReplicas,
                failHint: `Deployment ${appLabel}-stable is not scaled to ${stableReplicas} replicas. (ยังไม่ได้ปรับขนาดเป็น ${stableReplicas} Replicas)`
              },
              {
                id: "canary-created",
                title: `Deployment ${appLabel}-canary created with ${canaryReplicas} replicas (20%) and image nginx:1.26-alpine`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: `${appLabel}-canary`,
                rule: "canaryCheck",
                replicas: canaryReplicas,
                expectedImage: "nginx:1.26-alpine",
                requiredLabels: { app: appLabel, track: "canary" },
                failHint: `Ensure Deployment ${appLabel}-canary has ${canaryReplicas} replicas, image nginx:1.26-alpine, and labels app: ${appLabel}, track: canary.`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-07",
      domainId: "domain-2",
      domainTitle: "Application Deployment (20%)",
      baseTitle: "Blue/Green Deployment Traffic Cutover",
      weight: 5,
      targetMinutes: 4,
      build(seed = 107) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["bg-deploy-107", "cutover-prod-219", "zero-downtime-304"], seed, 1);
        const svcName = pick(["live-router-svc", "public-api-svc", "customer-web-svc"], seed, 2);
        const greenVersion = pick(["v2.0", "v3.1", "2026.2"], seed, 3);

        return {
          id: "ckad-07",
          seed,
          domainId: "domain-2",
          domainTitle: "Application Deployment (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Blue/Green Deployment Traffic Cutover (${greenVersion})`,
          titleTh: `สลับทราฟฟิกแบบ Blue/Green Deployment ไปยังชุด Green (${greenVersion})`,
          weight: 5,
          targetMinutes: 4,
          namespace: ns,
          workspaceDir: `ckad-07`,
          scenario: `In namespace \`${ns}\`, Deployment \`app-blue\` (\`version: v1.0\`) is currently receiving traffic from Service \`${svcName}\`. Deploy the new \`app-green\` environment and switch Service traffic over to Green.`,
          scenarioTh: `ใน Namespace \`${ns}\` มี Deployment \`app-blue\` (\`version: v1.0\`) ที่กำลังรับทราฟฟิกจาก Service \`${svcName}\` อยู่ ให้คุณสร้าง Deployment \`app-green\` แล้วสลับ Service ไปชี้ที่ชุด Green ทันที`,
          requirements: [
            `Create a Deployment named \`app-green\` in namespace \`${ns}\` with \`3\` replicas using image \`nginx:1.26-alpine\` and Pod labels \`app: web-core\` and \`version: "${greenVersion}"\`.`,
            `Update Service \`${svcName}\` in namespace \`${ns}\` so its selector switches from \`version: "v1.0"\` to \`version: "${greenVersion}"\` (while keeping \`app: web-core\`).`
          ],
          requirementsTh: [
            `สร้าง Deployment ชื่อ \`app-green\` ใน Namespace \`${ns}\` จำนวน \`3\` Replicas ใช้อิมเมจ \`nginx:1.26-alpine\` โดยมีเลเบลพอด \`app: web-core\` และ \`version: "${greenVersion}"\``,
            `แก้ไข Service ชื่อ \`${svcName}\` ใน Namespace \`${ns}\` ให้เปลี่ยน Selector จาก \`version: "v1.0"\` ไปเป็น \`version: "${greenVersion}"\` (คงเลเบล \`app: web-core\` ไว้)`
          ],
          hints: [
            `Reference ~/ckad-workspace/ckad-07/blue-deploy.yaml to create green-deploy.yaml. (ดูโครงสร้างของ app-blue ได้จากไฟล์ blue-deploy.yaml)`,
            `Use kubectl -n ${ns} edit svc ${svcName} or kubectl patch to update spec.selector.version to "${greenVersion}".`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-07/green-deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
  namespace: ${ns}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-core
      version: "${greenVersion}"
  template:
    metadata:
      labels:
        app: web-core
        version: "${greenVersion}"
    spec:
      containers:
      - name: web
        image: nginx:1.26-alpine
        ports:
        - containerPort: 80
EOF
kubectl apply -f ~/ckad-workspace/ckad-07/green-deploy.yaml
kubectl -n ${ns} patch svc ${svcName} -p '{"spec":{"selector":{"app":"web-core","version":"${greenVersion}"}}}'`,
          setupSpec: {
            namespaces: [ns],
            files: {
              "blue-deploy.yaml": `apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
  namespace: ${ns}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-core
      version: "v1.0"
  template:
    metadata:
      labels:
        app: web-core
        version: "v1.0"
    spec:
      containers:
      - name: web
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
`
            },
            resources: [
              {
                apiVersion: "apps/v1",
                kind: "Deployment",
                metadata: { name: "app-blue", namespace: ns },
                spec: {
                  replicas: 3,
                  selector: { matchLabels: { app: "web-core", version: "v1.0" } },
                  template: {
                    metadata: { labels: { app: "web-core", version: "v1.0" } },
                    spec: { containers: [{ name: "web", image: "nginx:1.25-alpine", ports: [{ containerPort: 80 }] }] }
                  }
                }
              },
              {
                apiVersion: "v1",
                kind: "Service",
                metadata: { name: svcName, namespace: ns },
                spec: {
                  selector: { app: "web-core", version: "v1.0" },
                  ports: [{ port: 80, targetPort: 80 }]
                }
              }
            ]
          },
          verifySpec: {
            checks: [
              {
                id: "green-deploy-exists",
                title: `Deployment app-green exists with 3 replicas and label version: "${greenVersion}"`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: "app-green",
                rule: "canaryCheck",
                replicas: 3,
                expectedImage: "nginx:1.26-alpine",
                requiredLabels: { app: "web-core", version: greenVersion },
                failHint: `Deployment app-green not found in namespace ${ns} or labels do not match app: web-core, version: "${greenVersion}".`
              },
              {
                id: "svc-switched",
                title: `Service ${svcName} selector switched to version: "${greenVersion}"`,
                type: "k8s-jsonpath",
                kind: "Service",
                namespace: ns,
                name: svcName,
                rule: "serviceSelector",
                expectedSelector: { app: "web-core", version: greenVersion },
                failHint: `Service ${svcName} still points to the old version. Update spec.selector.version to "${greenVersion}".`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-08",
      domainId: "domain-2",
      domainTitle: "Application Deployment (20%)",
      baseTitle: "Kustomize Configuration & Deployment",
      weight: 5,
      targetMinutes: 5,
      build(seed = 108) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["kustom-prod-108", "overlay-app-221", "gitops-stage-314"], seed, 1);
        const prefix = pick(["prod-", "stage-", "eu-"], seed, 2);
        const envLabel = pick(["production", "staging", "enterprise"], seed, 3);

        return {
          id: "ckad-08",
          seed,
          domainId: "domain-2",
          domainTitle: "Application Deployment (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Kustomize Manifest Transformation (${prefix}api-server)`,
          titleTh: `จัดการ Manifest ด้วย Kustomize (${prefix}api-server)`,
          weight: 5,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-08`,
          scenario: `Base manifests \`deployment.yaml\` and \`service.yaml\` are located in \`~/ckad-workspace/ckad-08/\`. Create a \`kustomization.yaml\` file to customize and deploy these resources into namespace \`${ns}\`.`,
          scenarioTh: `ในโฟลเดอร์ \`~/ckad-workspace/ckad-08/\` มีไฟล์ \`deployment.yaml\` และ \`service.yaml\` เตรียมไว้ให้แล้ว ให้คุณสร้างไฟล์ \`kustomization.yaml\` เพื่อปรับแต่งและสั่ง Apply ลงในคลัสเตอร์`,
          requirements: [
            `Create \`~/ckad-workspace/ckad-08/kustomization.yaml\` setting \`namespace: ${ns}\` and \`namePrefix: ${prefix}\`.`,
            `Configure \`commonLabels\` (or \`labels\`) to apply \`env: ${envLabel}\` to all resources (\`deployment.yaml\` and \`service.yaml\`).`,
            `Apply the Kustomize directory using \`kubectl apply -k ~/ckad-workspace/ckad-08/\` so that Deployment \`${prefix}api-server\` and Service \`${prefix}api-svc\` are created in namespace \`${ns}\`.`
          ],
          requirementsTh: [
            `สร้างไฟล์ \`~/ckad-workspace/ckad-08/kustomization.yaml\` ที่กำหนด \`namespace: ${ns}\` และ \`namePrefix: ${prefix}\``,
            `กำหนดให้เพิ่มป้ายกำกับร่วม (\`commonLabels\` หรือ \`labels\`) คือ \`env: ${envLabel}\` ให้กับทุก Resource (รวมถึง \`deployment.yaml\` และ \`service.yaml\`)`,
            `รันคำสั่ง \`kubectl apply -k ~/ckad-workspace/ckad-08/\` เพื่อสร้าง Deployment ชื่อ \`${prefix}api-server\` และ Service ชื่อ \`${prefix}api-svc\` ใน Namespace \`${ns}\``
          ],
          hints: [
            `In kustomization.yaml, specify resources: ["deployment.yaml", "service.yaml"], namespace: ${ns}, namePrefix: ${prefix}, and commonLabels: { env: ${envLabel} }.`,
            `Preview the generated manifests with kubectl kustomize ~/ckad-workspace/ckad-08/ before running kubectl apply -k.`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-08/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: ${ns}
namePrefix: ${prefix}
commonLabels:
  env: ${envLabel}
resources:
- deployment.yaml
- service.yaml
EOF
kubectl apply -k ~/ckad-workspace/ckad-08/`,
          setupSpec: {
            namespaces: [ns],
            files: {
              "deployment.yaml": `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
      - name: api
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
`,
              "service.yaml": `apiVersion: v1
kind: Service
metadata:
  name: api-svc
spec:
  selector:
    app: api-server
  ports:
  - port: 80
    targetPort: 80
`
            },
            resources: []
          },
          verifySpec: {
            checks: [
              {
                id: "kustomization-file",
                title: `kustomization.yaml defines namePrefix: ${prefix} and env: ${envLabel}`,
                type: "file-contains",
                filePath: "kustomization.yaml",
                substrings: [prefix, envLabel, "deployment.yaml"],
                failHint: `Check ~/ckad-workspace/ckad-08/kustomization.yaml for namePrefix: ${prefix} and commonLabels env: ${envLabel}.`
              },
              {
                id: "kustomize-deploy-applied",
                title: `Deployment ${prefix}api-server is deployed in namespace ${ns}`,
                type: "k8s-resource",
                kind: "Deployment",
                namespace: ns,
                name: `${prefix}api-server`,
                expect: {},
                failHint: `Deployment ${prefix}api-server was not found in namespace ${ns}. Run: kubectl apply -k ~/ckad-workspace/ckad-08/`
              }
            ]
          }
        };
      }
    },

    // =========================================================================
    // DOMAIN 3: APPLICATION OBSERVABILITY AND MAINTENANCE (15%)
    // =========================================================================
    {
      id: "ckad-09",
      domainId: "domain-3",
      domainTitle: "Application Observability and Maintenance (15%)",
      baseTitle: "Configure Liveness, Readiness and Startup Probes",
      weight: 7,
      targetMinutes: 6,
      build(seed = 109) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["health-check-109", "probe-prod-203", "api-monitor-317", "ready-svc-409"], seed, 1);
        const deployName = pick(["health-api", "payment-engine", "inventory-svc", "auth-gateway"], seed, 2);
        const port = pick([80, 8080], seed, 3);
        const path = pick(["/healthz", "/ready", "/livez"], seed, 4);

        return {
          id: "ckad-09",
          seed,
          domainId: "domain-3",
          domainTitle: "Application Observability and Maintenance (15%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Readiness (httpGet) & Liveness (tcpSocket) Probes (${deployName})`,
          titleTh: `ตั้งค่า Readiness Probe (httpGet) และ Liveness Probe (tcpSocket) บน Deployment (${deployName})`,
          weight: 7,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-09`,
          scenario: `Deployment \`${deployName}\` is running in namespace \`${ns}\` without health checks. Configure both a \`readinessProbe\` and a \`livenessProbe\` on its primary container.`,
          scenarioTh: `ใน Namespace \`${ns}\` มี Deployment ชื่อ \`${deployName}\` รันอยู่โดยยังไม่มีระบบตรวจสอบสุขภาพคอนเทนเนอร์ ให้คุณเพิ่มทั้ง \`readinessProbe\` และ \`livenessProbe\` ให้กับคอนเทนเนอร์หลัก`,
          requirements: [
            `Update Deployment \`${deployName}\` in namespace \`${ns}\` to add an \`httpGet\` \`readinessProbe\` on path \`${path}\` and port \`${port}\`, with \`initialDelaySeconds: 5\` and \`periodSeconds: 10\`.`,
            `Add a \`tcpSocket\` \`livenessProbe\` on port \`${port}\`, with \`initialDelaySeconds: 15\` and \`periodSeconds: 20\`.`
          ],
          requirementsTh: [
            `แก้ไข Deployment \`${deployName}\` ใน Namespace \`${ns}\` โดยเพิ่ม \`readinessProbe\` แบบ \`httpGet\` ที่พาธ \`${path}\` พอร์ต \`${port}\`, \`initialDelaySeconds: 5\`, \`periodSeconds: 10\``,
            `เพิ่ม \`livenessProbe\` แบบ \`tcpSocket\` ที่พอร์ต \`${port}\`, \`initialDelaySeconds: 15\`, \`periodSeconds: 20\``
          ],
          hints: [
            `Both readinessProbe and livenessProbe must be placed inside spec.template.spec.containers[0].`,
            `You can edit ~/ckad-workspace/ckad-09/deployment.yaml and run kubectl apply -f ~/ckad-workspace/ckad-09/deployment.yaml.`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-09/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${deployName}
  namespace: ${ns}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${deployName}
  template:
    metadata:
      labels:
        app: ${deployName}
    spec:
      containers:
      - name: web
        image: nginx:1.25-alpine
        ports:
        - containerPort: ${port}
        readinessProbe:
          httpGet:
            path: ${path}
            port: ${port}
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          tcpSocket:
            port: ${port}
          initialDelaySeconds: 15
          periodSeconds: 20
EOF
kubectl apply -f ~/ckad-workspace/ckad-09/deployment.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {
              "deployment.yaml": `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${deployName}
  namespace: ${ns}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${deployName}
  template:
    metadata:
      labels:
        app: ${deployName}
    spec:
      containers:
      - name: web
        image: nginx:1.25-alpine
        ports:
        - containerPort: ${port}
`
            },
            resources: [
              {
                apiVersion: "apps/v1",
                kind: "Deployment",
                metadata: { name: deployName, namespace: ns },
                spec: {
                  replicas: 2,
                  selector: { matchLabels: { app: deployName } },
                  template: {
                    metadata: { labels: { app: deployName } },
                    spec: { containers: [{ name: "web", image: "nginx:1.25-alpine", ports: [{ containerPort: port }] }] }
                  }
                }
              }
            ]
          },
          verifySpec: {
            checks: [
              {
                id: "readiness-probe",
                title: `readinessProbe configured with httpGet path: ${path}, port: ${port}, initialDelaySeconds: 5, periodSeconds: 10`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: deployName,
                rule: "probeCheck",
                probeType: "readinessProbe",
                handlerType: "httpGet",
                path: path,
                port: port,
                initialDelaySeconds: 5,
                periodSeconds: 10,
                failHint: `Check readinessProbe on ${deployName} for httpGet path: ${path}, port: ${port}, initialDelaySeconds: 5, periodSeconds: 10.`
              },
              {
                id: "liveness-probe",
                title: `livenessProbe configured with tcpSocket port: ${port}, initialDelaySeconds: 15, periodSeconds: 20`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: deployName,
                rule: "probeCheck",
                probeType: "livenessProbe",
                handlerType: "tcpSocket",
                port: port,
                initialDelaySeconds: 15,
                periodSeconds: 20,
                failHint: `Check livenessProbe on ${deployName} for tcpSocket port: ${port}, initialDelaySeconds: 15, periodSeconds: 20.`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-10",
      domainId: "domain-3",
      domainTitle: "Application Observability and Maintenance (15%)",
      baseTitle: "Troubleshoot & Fix Pod in CrashLoopBackOff",
      weight: 7,
      targetMinutes: 5,
      build(seed = 110) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["triage-app-110", "debug-prod-209", "fix-crash-312", "hotfix-pod-418"], seed, 1);
        const podName = pick(["broken-worker", "sync-daemon", "queue-processor", "cache-warmer"], seed, 2);
        const wrongCmd = pick(["sllep", "echho", "daate"], seed, 3);

        return {
          id: "ckad-10",
          seed,
          domainId: "domain-3",
          domainTitle: "Application Observability and Maintenance (15%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Troubleshoot & Fix Pod in CrashLoopBackOff (${podName})`,
          titleTh: `วินิจฉัยและซ่อมแซม Pod ที่ติดสถานะ CrashLoopBackOff (${podName})`,
          weight: 7,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-10`,
          scenario: `Pod \`${podName}\` in namespace \`${ns}\` is failing with \`CrashLoopBackOff\` due to a malformed startup command.`,
          scenarioTh: `พอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` กำลังแครชและขึ้นสถานะ \`CrashLoopBackOff\` เนื่องจากคำสั่งเริ่มต้นมีข้อผิดพลาด`,
          requirements: [
            `Inspect Pod \`${podName}\` in namespace \`${ns}\` (or the manifest at \`~/ckad-workspace/ckad-10/broken-pod.yaml\`) to identify the command error.`,
            `Fix the container specification so it runs image \`busybox:1.36\` with command \`["sh", "-c", "echo Worker healthy && sleep 3600"]\` (replacing the invalid \`${wrongCmd}\` command).`,
            `Recreate Pod \`${podName}\` in namespace \`${ns}\` and verify it reaches the \`Running\` state.`
          ],
          requirementsTh: [
            `ตรวจสอบสาเหตุของปัญหาในพอด \`${podName}\` (ดูไฟล์ \`~/ckad-workspace/ckad-10/broken-pod.yaml\` หรือใช้ \`kubectl describe pod ${podName} -n ${ns}\`)`,
            `แก้ไขให้อิมเมจของคอนเทนเนอร์เป็น \`busybox:1.36\` และแก้คำสั่งที่พิมพ์ผิด (\`${wrongCmd}\`) ให้เป็น \`["sh", "-c", "echo Worker healthy && sleep 3600"]\``,
            `ลบพอดเก่าที่พังและสร้างพอด \`${podName}\` ใหม่ใน Namespace \`${ns}\` จนมีสถานะ \`Running\``
          ],
          hints: [
            `A running Pod's command field is immutable. Edit ~/ckad-workspace/ckad-10/broken-pod.yaml, delete the existing Pod, and re-apply. (command ของพอดแก้ไขโดยตรงไม่ได้ ต้องลบพอดเก่าแล้ว apply ใหม่)`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-10/broken-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  containers:
  - name: worker
    image: busybox:1.36
    command: ["sh", "-c", "echo Worker healthy && sleep 3600"]
EOF
kubectl delete pod ${podName} -n ${ns} --ignore-not-found
kubectl apply -f ~/ckad-workspace/ckad-10/broken-pod.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {
              "broken-pod.yaml": `apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  containers:
  - name: worker
    image: busybox:1.36
    command: ["sh", "-c", "${wrongCmd} 3600"]
`
            },
            resources: [
              {
                apiVersion: "v1",
                kind: "Pod",
                metadata: { name: podName, namespace: ns },
                spec: {
                  containers: [{ name: "worker", image: "busybox:1.36", command: ["sh", "-c", `${wrongCmd} 3600`] }]
                },
                status: {
                  phase: "Running",
                  containerStatuses: [{ name: "worker", ready: false, restartCount: 4, state: { waiting: { reason: "CrashLoopBackOff", message: `sh: ${wrongCmd}: not found` } } }]
                }
              }
            ]
          },
          verifySpec: {
            checks: [
              {
                id: "pod-fixed-cmd",
                title: `Pod ${podName} command is fixed (sleep 3600) and no longer contains ${wrongCmd}`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podCommandFixed",
                forbiddenSubstring: wrongCmd,
                requiredSubstring: "sleep 3600",
                failHint: `Pod ${podName} still contains '${wrongCmd}' or has not been recreated with 'sleep 3600'.`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-11",
      domainId: "domain-3",
      domainTitle: "Application Observability and Maintenance (15%)",
      baseTitle: "Migrate Deprecated API Version Manifest",
      weight: 4,
      targetMinutes: 4,
      build(seed = 111) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["legacy-mig-111", "api-upgrade-216", "modernize-305"], seed, 1);
        const deployName = pick(["legacy-billing", "old-inventory", "v1beta-crm"], seed, 2);

        return {
          id: "ckad-11",
          seed,
          domainId: "domain-3",
          domainTitle: "Application Observability and Maintenance (15%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Migrate Deprecated API Version Manifest (${deployName})`,
          titleTh: `อัปเกรดไฟล์ Manifest จาก API Version เก่าที่ถูกถอดออกแล้ว (${deployName})`,
          weight: 4,
          targetMinutes: 4,
          namespace: ns,
          workspaceDir: `ckad-11`,
          scenario: `An older Deployment manifest at \`~/ckad-workspace/ckad-11/legacy-deploy.yaml\` uses the removed \`extensions/v1beta1\` API version and omits required \`apps/v1\` selector fields.`,
          scenarioTh: `ไฟล์ \`~/ckad-workspace/ckad-11/legacy-deploy.yaml\` ถูกเขียนไว้ตั้งแต่ยุค Kubernetes รุ่นเก่า (\`extensions/v1beta1\`) และขาดฟิลด์บังคับของ \`apps/v1\``,
          requirements: [
            `Update \`~/ckad-workspace/ckad-11/legacy-deploy.yaml\` to use \`apiVersion: apps/v1\`.`,
            `Add the required \`spec.selector.matchLabels\` field matching the Pod template label (\`app: ${deployName}\`).`,
            `Apply the updated manifest so Deployment \`${deployName}\` runs in namespace \`${ns}\`.`
          ],
          requirementsTh: [
            `แก้ไขไฟล์ \`~/ckad-workspace/ckad-11/legacy-deploy.yaml\` ให้ใช้ \`apiVersion: apps/v1\``,
            `เพิ่มฟิลด์ \`spec.selector.matchLabels\` ให้ตรงกับป้ายกำกับของพอด (\`app: ${deployName}\`)`,
            `สั่ง Apply ไฟล์นี้ลงใน Namespace \`${ns}\` เพื่อให้ Deployment \`${deployName}\` ทำงานได้จริง`
          ],
          hints: [
            `In apps/v1, Deployments strictly require spec.selector.matchLabels to match spec.template.metadata.labels. (ใน apps/v1 ต้องระบุ spec.selector.matchLabels เสมอ)`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-11/legacy-deploy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${deployName}
  namespace: ${ns}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${deployName}
  template:
    metadata:
      labels:
        app: ${deployName}
    spec:
      containers:
      - name: app
        image: nginx:1.25-alpine
EOF
kubectl apply -f ~/ckad-workspace/ckad-11/legacy-deploy.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {
              "legacy-deploy.yaml": `apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: ${deployName}
  namespace: ${ns}
spec:
  replicas: 2
  template:
    metadata:
      labels:
        app: ${deployName}
    spec:
      containers:
      - name: app
        image: nginx:1.25-alpine
`
            },
            resources: []
          },
          verifySpec: {
            checks: [
              {
                id: "file-updated-v1",
                title: `legacy-deploy.yaml updated to apiVersion: apps/v1 with matchLabels`,
                type: "file-contains",
                filePath: "legacy-deploy.yaml",
                substrings: ["apps/v1", "matchLabels"],
                failHint: `~/ckad-workspace/ckad-11/legacy-deploy.yaml does not contain apiVersion: apps/v1 or matchLabels.`
              },
              {
                id: "deploy-created",
                title: `Deployment ${deployName} is running in namespace ${ns}`,
                type: "k8s-resource",
                kind: "Deployment",
                namespace: ns,
                name: deployName,
                expect: {},
                failHint: `Deployment ${deployName} was not found in namespace ${ns}.`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-12",
      domainId: "domain-3",
      domainTitle: "Application Observability and Maintenance (15%)",
      baseTitle: "Inspect Container Logs & Extract Error Entries",
      weight: 4,
      targetMinutes: 4,
      build(seed = 112) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["log-audit-112", "observability-224", "trace-ops-319"], seed, 1);
        const podName = pick(["payment-authorizer", "tx-validator", "fraud-detector"], seed, 2);
        const errCode = pick(["ERR_DB_TIMEOUT_504", "ERR_AUTH_TOKEN_EXPIRED_401", "ERR_TLS_HANDSHAKE_502"], seed, 3);

        return {
          id: "ckad-12",
          seed,
          domainId: "domain-3",
          domainTitle: "Application Observability and Maintenance (15%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Inspect Container Logs & Extract Errors (${podName})`,
          titleTh: `ดึง Container Logs ที่พบข้อผิดพลาดบันทึกลงไฟล์ (${podName})`,
          weight: 4,
          targetMinutes: 4,
          namespace: ns,
          workspaceDir: `ckad-12`,
          scenario: `Pod \`${podName}\` in namespace \`${ns}\` is emitting application logs that include \`CRITICAL\` error entries.`,
          scenarioTh: `พอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` กำลังทำงานและพิมพ์ข้อความ Log ออกมา ซึ่งมีบรรทัดที่เป็นรหัสข้อผิดพลาด \`CRITICAL\``,
          requirements: [
            `Retrieve the logs from Pod \`${podName}\` in namespace \`${ns}\` and filter only lines containing the string \`CRITICAL\`.`,
            `Write the matching log lines to \`~/ckad-workspace/ckad-12/critical-errors.log\`.`
          ],
          requirementsTh: [
            `ดึงข้อมูล Logs จากพอด \`${podName}\` ใน Namespace \`${ns}\` โดยคัดกรองเฉพาะบรรทัดที่มีคำว่า \`CRITICAL\``,
            `บันทึกบรรทัดที่พบลงในไฟล์ \`~/ckad-workspace/ckad-12/critical-errors.log\``
          ],
          hints: [
            `Run: kubectl -n ${ns} logs ${podName} | grep CRITICAL > ~/ckad-workspace/ckad-12/critical-errors.log`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
kubectl -n ${ns} logs ${podName} | grep CRITICAL > ~/ckad-workspace/ckad-12/critical-errors.log`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: [
              {
                apiVersion: "v1",
                kind: "Pod",
                metadata: { name: podName, namespace: ns },
                spec: {
                  containers: [{ name: "app", image: "busybox:1.36", command: ["sh", "-c", `echo "2026-10-28 INFO Server started"; echo "2026-10-28 CRITICAL ${errCode}: Connection refused by upstream"; echo "2026-10-28 INFO Retrying..." ; sleep 3600`] }]
                },
                _logs: `2026-10-28T10:00:01Z INFO Server started on port 8080\n2026-10-28T10:00:04Z CRITICAL ${errCode}: Connection refused by upstream database\n2026-10-28T10:00:05Z INFO Retrying connection...`
              }
            ]
          },
          verifySpec: {
            checks: [
              {
                id: "log-extracted",
                title: `CRITICAL log entry (${errCode}) written to ~/ckad-workspace/ckad-12/critical-errors.log`,
                type: "file-contains",
                filePath: "critical-errors.log",
                substrings: ["CRITICAL", errCode],
                failHint: `File ~/ckad-workspace/ckad-12/critical-errors.log was not found or is missing the CRITICAL ${errCode} log line.`
              }
            ]
          }
        };
      }
    },

    // =========================================================================
    // DOMAIN 4: APPLICATION ENVIRONMENT, CONFIGURATION AND SECURITY (25%)
    // =========================================================================
    {
      id: "ckad-13",
      domainId: "domain-4",
      domainTitle: "Application Environment, Configuration and Security (25%)",
      baseTitle: "ConfigMap & Secret Injection (Env + Volume Mount)",
      weight: 8,
      targetMinutes: 6,
      build(seed = 113) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["config-sec-113", "vault-app-207", "cred-inject-316"], seed, 1);
        const cmName = pick(["app-settings-cm", "ui-config-cm", "redis-cfg-cm"], seed, 2);
        const secName = pick(["db-credentials-sec", "api-key-sec", "oauth-token-sec"], seed, 3);
        const podName = pick(["configured-backend", "secure-worker", "api-consumer"], seed, 4);
        const appMode = pick(["production", "high-availability", "strict-tls"], seed, 5);
        const dbPass = pick(["Sup3rS3cr3t#2026", "K8sM@st3rKey!99", "P@ssw0rd_CKAD_88"], seed, 6);

        return {
          id: "ckad-13",
          seed,
          domainId: "domain-4",
          domainTitle: "Application Environment, Configuration and Security (25%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `ConfigMap & Secret Injection into Pod (${podName})`,
          titleTh: `สร้าง ConfigMap & Secret และฉีดเข้าพอดทั้งแบบ Env และ Volume (${podName})`,
          weight: 8,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-13`,
          scenario: `An application in namespace \`${ns}\` requires configuration injected via environment variables and sensitive credentials mounted as read-only files.`,
          scenarioTh: `แอปพลิเคชันใน Namespace \`${ns}\` ต้องการรับค่าคอนฟิกผ่านตัวแปรสภาพแวดล้อม (Environment Variable) และอ่านไฟล์ความลับจาก Volume`,
          requirements: [
            `Create a \`ConfigMap\` named \`${cmName}\` in namespace \`${ns}\` containing key-value pair \`APP_MODE=${appMode}\`.`,
            `Create a \`Secret\` named \`${secName}\` in namespace \`${ns}\` containing key-value pair \`db-password=${dbPass}\`.`,
            `Create a Pod named \`${podName}\` in namespace \`${ns}\` using image \`nginx:1.25-alpine\` that injects \`APP_MODE\` from ConfigMap \`${cmName}\` (via \`env\` or \`envFrom\`).`,
            `Mount Secret \`${secName}\` into Pod \`${podName}\` at path \`/etc/secret-volume\` with \`readOnly: true\`.`
          ],
          requirementsTh: [
            `สร้าง \`ConfigMap\` ชื่อ \`${cmName}\` ใน Namespace \`${ns}\` ที่มีคีย์ \`APP_MODE=${appMode}\``,
            `สร้าง \`Secret\` ชื่อ \`${secName}\` ใน Namespace \`${ns}\` ที่มีคีย์ \`db-password=${dbPass}\``,
            `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` (อิมเมจ \`nginx:1.25-alpine\`) โดยดึงค่าจาก ConfigMap \`${cmName}\` มาเป็นตัวแปรสภาพแวดล้อมชื่อ \`APP_MODE\` (หรือใช้ \`envFrom\`)`,
            `Mount Secret \`${secName}\` เข้าไปในพอด \`${podName}\` ที่พาธ \`/etc/secret-volume\` แบบ \`readOnly: true\``
          ],
          hints: [
            `Create the ConfigMap imperatively: kubectl -n ${ns} create configmap ${cmName} --from-literal=APP_MODE=${appMode}`,
            `Create the Secret imperatively: kubectl -n ${ns} create secret generic ${secName} --from-literal=db-password='${dbPass}'`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
kubectl -n ${ns} create configmap ${cmName} --from-literal=APP_MODE=${appMode} --dry-run=client -o yaml | kubectl apply -f -
kubectl -n ${ns} create secret generic ${secName} --from-literal=db-password='${dbPass}' --dry-run=client -o yaml | kubectl apply -f -
cat << 'EOF' > ~/ckad-workspace/ckad-13/pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  volumes:
  - name: sec-vol
    secret:
      secretName: ${secName}
  containers:
  - name: web
    image: nginx:1.25-alpine
    envFrom:
    - configMapRef:
        name: ${cmName}
    volumeMounts:
    - name: sec-vol
      mountPath: /etc/secret-volume
      readOnly: true
EOF
kubectl apply -f ~/ckad-workspace/ckad-13/pod.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: []
          },
          verifySpec: {
            checks: [
              {
                id: "cm-created",
                title: `ConfigMap ${cmName} exists with APP_MODE=${appMode}`,
                type: "k8s-jsonpath",
                kind: "ConfigMap",
                namespace: ns,
                name: cmName,
                rule: "configMapKey",
                key: "APP_MODE",
                expectedValue: appMode,
                failHint: `ConfigMap ${cmName} not found in namespace ${ns} or APP_MODE is not ${appMode}.`
              },
              {
                id: "secret-created",
                title: `Secret ${secName} exists with key db-password`,
                type: "k8s-jsonpath",
                kind: "Secret",
                namespace: ns,
                name: secName,
                rule: "secretKeyExists",
                key: "db-password",
                failHint: `Secret ${secName} not found in namespace ${ns} or missing key db-password.`
              },
              {
                id: "pod-cm-sec-bound",
                title: `Pod ${podName} injects ConfigMap ${cmName} and mounts Secret ${secName} at /etc/secret-volume`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podConfigAndSecret",
                cmName,
                secName,
                mountPath: "/etc/secret-volume",
                failHint: `Verify Pod ${podName} references ConfigMap ${cmName} in env/envFrom and mounts Secret ${secName} at /etc/secret-volume.`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-14",
      domainId: "domain-4",
      domainTitle: "Application Environment, Configuration and Security (25%)",
      baseTitle: "Pod & Container SecurityContext and Linux Capabilities",
      weight: 7,
      targetMinutes: 5,
      build(seed = 114) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["sec-hardening-114", "pci-zone-218", "restricted-307"], seed, 1);
        const podName = pick(["hardened-net-pod", "auditor-agent", "packet-inspector"], seed, 2);
        const uid = pick([1000, 2000, 1001], seed, 3);
        const gid = pick([3000, 4000], seed, 4);
        const cap = pick(["NET_ADMIN", "SYS_TIME", "NET_RAW"], seed, 5);

        return {
          id: "ckad-14",
          seed,
          domainId: "domain-4",
          domainTitle: "Application Environment, Configuration and Security (25%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `SecurityContext & Linux Capabilities (${podName})`,
          titleTh: `ตั้งค่า SecurityContext (runAsUser: ${uid}) และ Linux Capability (${cap})`,
          weight: 7,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-14`,
          scenario: `Security compliance in namespace \`${ns}\` requires Pod \`${podName}\` to run under specific non-root user/group IDs and grant a specific Linux capability at the container level.`,
          scenarioTh: `ทีม Security กำหนดให้พอด \`${podName}\` ใน Namespace \`${ns}\` ต้องรันด้วยสิทธิ์ผู้ใช้ที่ระบุและเพิ่ม Linux Capability เฉพาะระดับคอนเทนเนอร์`,
          requirements: [
            `Create a Pod named \`${podName}\` in namespace \`${ns}\` using image \`busybox:1.36\` and command \`["sh", "-c", "sleep 3600"]\`.`,
            `At the **Pod level** (\`spec.securityContext\`), configure \`runAsUser: ${uid}\` and \`fsGroup: ${gid}\`.`,
            `At the **Container level** (\`spec.containers[0].securityContext\`), configure \`allowPrivilegeEscalation: false\` and add capability \`add: ["${cap}"]\`.`
          ],
          requirementsTh: [
            `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ใช้อิมเมจ \`busybox:1.36\` รันคำสั่ง \`["sh", "-c", "sleep 3600"]\``,
            `ในระดับ **Pod SecurityContext** (\`spec.securityContext\`) ให้ตั้งค่า \`runAsUser: ${uid}\` และ \`fsGroup: ${gid}\``,
            `ในระดับ **Container SecurityContext** (\`spec.containers[0].securityContext\`) ให้ตั้งค่า \`allowPrivilegeEscalation: false\` และเพิ่ม Capability \`add: ["${cap}"]\``
          ],
          hints: [
            `Remember: fsGroup is a Pod-level field (spec.securityContext), whereas capabilities and allowPrivilegeEscalation are Container-level fields (spec.containers[].securityContext).`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-14/sec-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  securityContext:
    runAsUser: ${uid}
    fsGroup: ${gid}
  containers:
  - name: inspector
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        add:
        - "${cap}"
EOF
kubectl apply -f ~/ckad-workspace/ckad-14/sec-pod.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: []
          },
          verifySpec: {
            checks: [
              {
                id: "pod-sec-ctx",
                title: `Pod-level securityContext sets runAsUser: ${uid} and fsGroup: ${gid}`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podSecurityContext",
                runAsUser: uid,
                fsGroup: gid,
                failHint: `Check spec.securityContext on Pod ${podName} for runAsUser: ${uid} and fsGroup: ${gid}.`
              },
              {
                id: "container-sec-ctx",
                title: `Container-level securityContext sets allowPrivilegeEscalation: false and capabilities.add: ["${cap}"]`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "containerSecurityContext",
                allowPrivilegeEscalation: false,
                capability: cap,
                failHint: `Check spec.containers[0].securityContext for allowPrivilegeEscalation: false and capabilities.add: ["${cap}"].`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-15",
      domainId: "domain-4",
      domainTitle: "Application Environment, Configuration and Security (25%)",
      baseTitle: "ServiceAccount, Role & RoleBinding for API Access",
      weight: 7,
      targetMinutes: 6,
      build(seed = 115) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["rbac-app-115", "k8s-watcher-212", "metrics-reader-308"], seed, 1);
        const saName = pick(["pod-reader-sa", "inspector-sa", "monitor-bot-sa"], seed, 2);
        const roleName = pick(["pod-reader-role", "inspector-role", "monitor-role"], seed, 3);
        const bindingName = pick(["pod-reader-binding", "inspector-binding", "monitor-binding"], seed, 4);
        const podName = pick(["api-inspector-pod", "cluster-monitor-pod", "status-checker-pod"], seed, 5);

        return {
          id: "ckad-15",
          seed,
          domainId: "domain-4",
          domainTitle: "Application Environment, Configuration and Security (25%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `RBAC: ServiceAccount, Role & RoleBinding (${saName})`,
          titleTh: `สร้าง ServiceAccount, Role, RoleBinding และผูกเข้ากับพอด (${saName})`,
          weight: 7,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-15`,
          scenario: `A monitoring Pod in namespace \`${ns}\` requires read-only permissions to inspect \`pods\` and \`services\` via the Kubernetes API.`,
          scenarioTh: `พอดมอนิเตอร์ใน Namespace \`${ns}\` ต้องการสิทธิ์ในการเรียกดูรายการ \`pods\` และ \`services\` ผ่าน Kubernetes API`,
          requirements: [
            `Create a \`ServiceAccount\` named \`${saName}\` in namespace \`${ns}\`.`,
            `Create a \`Role\` named \`${roleName}\` in namespace \`${ns}\` granting \`verbs: ["get", "list", "watch"]\` on \`resources: ["pods", "services"]\`.`,
            `Create a \`RoleBinding\` named \`${bindingName}\` in namespace \`${ns}\` binding Role \`${roleName}\` to ServiceAccount \`${saName}\`.`,
            `Create a Pod named \`${podName}\` in namespace \`${ns}\` using image \`nginx:1.25-alpine\` configured with \`serviceAccountName: ${saName}\`.`
          ],
          requirementsTh: [
            `สร้าง \`ServiceAccount\` ชื่อ \`${saName}\` ใน Namespace \`${ns}\``,
            `สร้าง \`Role\` ชื่อ \`${roleName}\` ใน Namespace \`${ns}\` ที่อนุญาต \`verbs: ["get", "list", "watch"]\` สำหรับ \`resources: ["pods", "services"]\``,
            `สร้าง \`RoleBinding\` ชื่อ \`${bindingName}\` ใน Namespace \`${ns}\` เพื่อผูก Role \`${roleName}\` เข้ากับ ServiceAccount \`${saName}\``,
            `สร้างหรืออัปเดตพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` (อิมเมจ \`nginx:1.25-alpine\`) ให้รันโดยใช้ \`serviceAccountName: ${saName}\``
          ],
          hints: [
            `Use imperative commands for speed:
1. kubectl -n ${ns} create sa ${saName}
2. kubectl -n ${ns} create role ${roleName} --verb=get,list,watch --resource=pods,services
3. kubectl -n ${ns} create rolebinding ${bindingName} --role=${roleName} --serviceaccount=${ns}:${saName}`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
kubectl -n ${ns} create sa ${saName} --dry-run=client -o yaml | kubectl apply -f -
kubectl -n ${ns} create role ${roleName} --verb=get,list,watch --resource=pods,services --dry-run=client -o yaml | kubectl apply -f -
kubectl -n ${ns} create rolebinding ${bindingName} --role=${roleName} --serviceaccount=${ns}:${saName} --dry-run=client -o yaml | kubectl apply -f -
cat << 'EOF' > ~/ckad-workspace/ckad-15/pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  serviceAccountName: ${saName}
  containers:
  - name: monitor
    image: nginx:1.25-alpine
EOF
kubectl apply -f ~/ckad-workspace/ckad-15/pod.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: []
          },
          verifySpec: {
            checks: [
              {
                id: "sa-exists",
                title: `ServiceAccount ${saName} exists in namespace ${ns}`,
                type: "k8s-resource",
                kind: "ServiceAccount",
                namespace: ns,
                name: saName,
                expect: {},
                failHint: `ServiceAccount ${saName} was not found in namespace ${ns}.`
              },
              {
                id: "role-check",
                title: `Role ${roleName} grants get, list, watch on pods and services`,
                type: "k8s-jsonpath",
                kind: "Role",
                namespace: ns,
                name: roleName,
                rule: "roleCheck",
                verbs: ["get", "list", "watch"],
                resources: ["pods", "services"],
                failHint: `Check Role ${roleName} for verbs: ["get", "list", "watch"] and resources: ["pods", "services"].`
              },
              {
                id: "rb-and-pod-check",
                title: `RoleBinding ${bindingName} exists and Pod ${podName} uses serviceAccountName: ${saName}`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podServiceAccount",
                serviceAccountName: saName,
                roleBindingName: bindingName,
                failHint: `Ensure RoleBinding ${bindingName} exists and Pod ${podName} sets spec.serviceAccountName: ${saName}.`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-16",
      domainId: "domain-4",
      domainTitle: "Application Environment, Configuration and Security (25%)",
      baseTitle: "Resource Requests, Limits & Namespace ResourceQuota Compliance",
      weight: 6,
      targetMinutes: 5,
      build(seed = 116) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["quota-team-116", "compute-limit-215", "finops-ns-322"], seed, 1);
        const podName = pick(["quota-compliant-pod", "analytics-worker", "ml-inference-pod"], seed, 2);
        const reqCpu = pick(["100m", "200m"], seed, 3);
        const reqMem = pick(["128Mi", "256Mi"], seed, 4);
        const limCpu = pick(["400m", "500m"], seed, 5);
        const limMem = pick(["512Mi", "256Mi"], seed, 6);

        return {
          id: "ckad-16",
          seed,
          domainId: "domain-4",
          domainTitle: "Application Environment, Configuration and Security (25%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Compute Resource Requests & Limits under ResourceQuota (${podName})`,
          titleTh: `กำหนด Resource Requests & Limits ให้ผ่านเกณฑ์ ResourceQuota (${podName})`,
          weight: 6,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-16`,
          scenario: `Namespace \`${ns}\` enforces a \`ResourceQuota\` requiring all Pods to explicitly specify CPU and Memory \`requests\` and \`limits\`.`,
          scenarioTh: `Namespace \`${ns}\` มีการบังคับใช้ \`ResourceQuota\` ทำให้ทุกพอดที่สร้างใน Namespace นี้ต้องระบุทั้ง \`requests\` และ \`limits\` สำหรับ CPU และ Memory`,
          requirements: [
            `Create a Pod named \`${podName}\` in namespace \`${ns}\` using image \`nginx:1.25-alpine\`.`,
            `Configure container \`resources.requests\` with \`cpu: "${reqCpu}"\` and \`memory: "${reqMem}"\`.`,
            `Configure container \`resources.limits\` with \`cpu: "${limCpu}"\` and \`memory: "${limMem}"\`.`
          ],
          requirementsTh: [
            `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ใช้อิมเมจ \`nginx:1.25-alpine\``,
            `กำหนด \`resources.requests\` เป็น \`cpu: "${reqCpu}"\` และ \`memory: "${reqMem}"\``,
            `กำหนด \`resources.limits\` เป็น \`cpu: "${limCpu}"\` และ \`memory: "${limMem}"\``
          ],
          hints: [
            `Memory units are case-sensitive: use Mi (e.g., ${reqMem}, ${limMem}). (หน่วย Memory ต้องใช้ Mi ตัว M พิมพ์ใหญ่และ i พิมพ์เล็ก)`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-16/pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  containers:
  - name: web
    image: nginx:1.25-alpine
    resources:
      requests:
        cpu: "${reqCpu}"
        memory: "${reqMem}"
      limits:
        cpu: "${limCpu}"
        memory: "${limMem}"
EOF
kubectl apply -f ~/ckad-workspace/ckad-16/pod.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: [
              {
                apiVersion: "v1",
                kind: "ResourceQuota",
                metadata: { name: "compute-quota", namespace: ns },
                spec: {
                  hard: { "requests.cpu": "1", "requests.memory": "1Gi", "limits.cpu": "2", "limits.memory": "2Gi" }
                }
              }
            ]
          },
          verifySpec: {
            checks: [
              {
                id: "pod-resources-check",
                title: `Pod ${podName} specifies requests (cpu: ${reqCpu}, memory: ${reqMem}) and limits (cpu: ${limCpu}, memory: ${limMem})`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podResources",
                reqCpu,
                reqMem,
                limCpu,
                limMem,
                failHint: `Check spec.containers[0].resources on Pod ${podName} for requests (${reqCpu}, ${reqMem}) and limits (${limCpu}, ${limMem}).`
              }
            ]
          }
        };
      }
    },

    // =========================================================================
    // DOMAIN 5: SERVICES AND NETWORKING (20%)
    // =========================================================================
    {
      id: "ckad-17",
      domainId: "domain-5",
      domainTitle: "Services and Networking (20%)",
      baseTitle: "Expose Deployment via NodePort Service",
      weight: 5,
      targetMinutes: 4,
      build(seed = 117) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["net-expose-117", "web-edge-206", "public-svc-313"], seed, 1);
        const deployName = pick(["web-frontend", "customer-portal", "partner-api"], seed, 2);
        const svcName = `${deployName}-nodeport`;
        const nodePort = pick([30080, 30180, 30280, 30880], seed, 3);

        return {
          id: "ckad-17",
          seed,
          domainId: "domain-5",
          domainTitle: "Services and Networking (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Expose Deployment via NodePort Service (${svcName})`,
          titleTh: `เปิดเผย Deployment ด้วย Service ชนิด NodePort ที่พอร์ต ${nodePort} (${svcName})`,
          weight: 5,
          targetMinutes: 4,
          namespace: ns,
          workspaceDir: `ckad-17`,
          scenario: `Deployment \`${deployName}\` is running in namespace \`${ns}\` with Pod label \`app: ${deployName}\` and containers listening on port \`8080\`.`,
          scenarioTh: `ใน Namespace \`${ns}\` มี Deployment ชื่อ \`${deployName}\` (คอนเทนเนอร์เปิดพอร์ต \`8080\`, เลเบล \`app: ${deployName}\`) รันอยู่แล้ว`,
          requirements: [
            `Create a \`Service\` named \`${svcName}\` in namespace \`${ns}\` of \`type: NodePort\`.`,
            `Configure the Service to select Pods with label \`app: ${deployName}\`, expose Service \`port: 80\`, forward to \`targetPort: 8080\`, and bind static \`nodePort: ${nodePort}\`.`
          ],
          requirementsTh: [
            `สร้าง \`Service\` ชื่อ \`${svcName}\` ใน Namespace \`${ns}\` ชนิด \`type: NodePort\``,
            `กำหนดให้คัดเลือกพอดด้วยเลเบล \`app: ${deployName}\` โดยเปิดพอร์ตของ Service ที่ \`port: 80\`, ส่งต่อไปยัง \`targetPort: 8080\`, และกำหนด \`nodePort: ${nodePort}\``
          ],
          hints: [
            `Pay attention to the port mapping: Service port is 80, container targetPort is 8080, and nodePort is ${nodePort}.`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-17/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ${svcName}
  namespace: ${ns}
spec:
  type: NodePort
  selector:
    app: ${deployName}
  ports:
  - port: 80
    targetPort: 8080
    nodePort: ${nodePort}
EOF
kubectl apply -f ~/ckad-workspace/ckad-17/service.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: [
              {
                apiVersion: "apps/v1",
                kind: "Deployment",
                metadata: { name: deployName, namespace: ns },
                spec: {
                  replicas: 2,
                  selector: { matchLabels: { app: deployName } },
                  template: {
                    metadata: { labels: { app: deployName } },
                    spec: { containers: [{ name: "web", image: "nginx:1.25-alpine", ports: [{ containerPort: 8080 }] }] }
                  }
                }
              }
            ]
          },
          verifySpec: {
            checks: [
              {
                id: "nodeport-svc-check",
                title: `Service ${svcName} configured with type: NodePort, port: 80, targetPort: 8080, nodePort: ${nodePort}`,
                type: "k8s-jsonpath",
                kind: "Service",
                namespace: ns,
                name: svcName,
                rule: "servicePortCheck",
                svcType: "NodePort",
                port: 80,
                targetPort: 8080,
                nodePort: nodePort,
                expectedSelector: { app: deployName },
                failHint: `Check Service ${svcName} for type: NodePort, selector app: ${deployName}, port: 80, targetPort: 8080, and nodePort: ${nodePort}.`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-18",
      domainId: "domain-5",
      domainTitle: "Services and Networking (20%)",
      baseTitle: "Troubleshoot & Fix Broken Service Routing (Selector & TargetPort)",
      weight: 6,
      targetMinutes: 5,
      build(seed = 118) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["net-debug-118", "svc-triage-220", "broken-net-325"], seed, 1);
        const svcName = pick(["orders-backend-svc", "inventory-api-svc", "shipping-svc"], seed, 2);
        const realLabel = pick(["orders-v2", "inventory-core", "shipping-live"], seed, 3);
        const realPort = pick([8080, 9000, 3000], seed, 4);

        return {
          id: "ckad-18",
          seed,
          domainId: "domain-5",
          domainTitle: "Services and Networking (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Troubleshoot & Fix Broken Service Routing (${svcName})`,
          titleTh: `วินิจฉัยและแก้ไข Service ที่ไม่ส่งทราฟฟิกหาพอด (${svcName})`,
          weight: 6,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-18`,
          scenario: `Clients cannot reach Service \`${svcName}\` in namespace \`${ns}\` because both its label selector and targetPort are misconfigured and do not match the running backend Deployment.`,
          scenarioTh: `ผู้ใช้งานแจ้งว่าไม่สามารถเชื่อมต่อเข้าหา Service ชื่อ \`${svcName}\` ใน Namespace \`${ns}\` ได้ เนื่องจากทั้ง Label Selector และ TargetPort ของ Service ตั้งค่าไว้ไม่ตรงกับ Deployment ที่รันอยู่จริง`,
          requirements: [
            `Inspect the running Pods/Deployment in namespace \`${ns}\` (\`kubectl get pods --show-labels -n ${ns}\`) to determine the actual Pod label and \`containerPort\`.`,
            `Update Service \`${svcName}\` in namespace \`${ns}\` so that \`spec.selector.app\` is \`${realLabel}\` and \`targetPort\` is \`${realPort}\` (keeping Service \`port: 80\`).`
          ],
          requirementsTh: [
            `ตรวจสอบ Labels และ ContainerPort จริงของ Deployment ใน Namespace \`${ns}\` (ใช้ \`kubectl get pods --show-labels -n ${ns}\` หรือดูไฟล์ใน \`~/ckad-workspace/ckad-18/\`)`,
            `แก้ไข Service \`${svcName}\` ใน Namespace \`${ns}\` ให้มี \`selector.app: ${realLabel}\` และ \`targetPort: ${realPort}\` (โดยคง \`port: 80\` ไว้)`
          ],
          hints: [
            `The running Pods use label app: ${realLabel} and containerPort: ${realPort}, whereas the broken Service points to app: wrong-legacy-label and targetPort: 9999.`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
kubectl -n ${ns} patch svc ${svcName} --type=merge -p '{"spec":{"selector":{"app":"${realLabel}"},"ports":[{"port":80,"targetPort":${realPort}}]}}'`,
          setupSpec: {
            namespaces: [ns],
            files: {
              "broken-service.yaml": `apiVersion: v1
kind: Service
metadata:
  name: ${svcName}
  namespace: ${ns}
spec:
  selector:
    app: wrong-legacy-label
  ports:
  - port: 80
    targetPort: 9999
`
            },
            resources: [
              {
                apiVersion: "apps/v1",
                kind: "Deployment",
                metadata: { name: "backend-deploy", namespace: ns },
                spec: {
                  replicas: 2,
                  selector: { matchLabels: { app: realLabel } },
                  template: {
                    metadata: { labels: { app: realLabel } },
                    spec: { containers: [{ name: "app", image: "nginx:1.25-alpine", ports: [{ containerPort: realPort }] }] }
                  }
                }
              },
              {
                apiVersion: "v1",
                kind: "Service",
                metadata: { name: svcName, namespace: ns },
                spec: {
                  selector: { app: "wrong-legacy-label" },
                  ports: [{ port: 80, targetPort: 9999 }]
                }
              }
            ]
          },
          verifySpec: {
            checks: [
              {
                id: "svc-fixed",
                title: `Service ${svcName} updated with selector app: ${realLabel} and targetPort: ${realPort}`,
                type: "k8s-jsonpath",
                kind: "Service",
                namespace: ns,
                name: svcName,
                rule: "servicePortCheck",
                port: 80,
                targetPort: realPort,
                expectedSelector: { app: realLabel },
                failHint: `Service ${svcName} selector is not app: ${realLabel} or targetPort is not ${realPort}.`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-19",
      domainId: "domain-5",
      domainTitle: "Services and Networking (20%)",
      baseTitle: "Ingress Host & Path-Based Routing",
      weight: 7,
      targetMinutes: 6,
      build(seed = 119) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["ingress-gw-119", "edge-router-213", "web-routing-320"], seed, 1);
        const ingName = pick(["main-gateway-ing", "shop-router-ing", "api-edge-ing"], seed, 2);
        const host = pick(["shop.k8s.local", "portal.exam.io", "api.kubemastery.io"], seed, 3);
        const apiPath = pick(["/api", "/v1", "/backend"], seed, 4);

        return {
          id: "ckad-19",
          seed,
          domainId: "domain-5",
          domainTitle: "Services and Networking (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `Ingress Host & Path-Based Routing (${ingName})`,
          titleTh: `สร้าง Ingress แยกเส้นทางตาม Host (${host}) และ Path (${apiPath})`,
          weight: 7,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-19`,
          scenario: `In namespace \`${ns}\`, two Services are running: \`api-service\` (port \`8080\`) and \`web-service\` (port \`80\`). Create an Ingress resource to route HTTP traffic based on host and path.`,
          scenarioTh: `ใน Namespace \`${ns}\` มี Service ชื่อ \`api-service\` (พอร์ต \`8080\`) และ \`web-service\` (พอร์ต \`80\`) รันอยู่แล้ว ให้สร้าง Ingress เพื่อแยกเส้นทางทราฟฟิก`,
          requirements: [
            `Create an \`Ingress\` named \`${ingName}\` in namespace \`${ns}\` with \`ingressClassName: nginx\`.`,
            `Configure a rule for host \`${host}\` with two \`Prefix\` paths (\`pathType: Prefix\`):`,
            `1) Path \`${apiPath}\` routes to Service \`api-service\` on port \`8080\`.`,
            `2) Path \`/web\` routes to Service \`web-service\` on port \`80\`.`
          ],
          requirementsTh: [
            `สร้าง \`Ingress\` ชื่อ \`${ingName}\` ใน Namespace \`${ns}\` กำหนด \`ingressClassName: nginx\``,
            `กำหนด Host เป็น \`${host}\` โดยมี 2 เส้นทาง (\`pathType: Prefix\`):`,
            `1) พาธ \`${apiPath}\` ส่งทราฟฟิกไปยัง Service \`api-service\` พอร์ต \`8080\``,
            `2) พาธ \`/web\` ส่งทราฟฟิกไปยัง Service \`web-service\` พอร์ต \`80\``
          ],
          hints: [
            `Create the Ingress in a single imperative command:
kubectl -n ${ns} create ingress ${ingName} --class=nginx --rule="${host}${apiPath}*=api-service:8080" --rule="${host}/web*=web-service:80"`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
kubectl -n ${ns} create ingress ${ingName} --class=nginx --rule="${host}${apiPath}*=api-service:8080" --rule="${host}/web*=web-service:80" --dry-run=client -o yaml > ~/ckad-workspace/ckad-19/ingress.yaml
kubectl apply -f ~/ckad-workspace/ckad-19/ingress.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: [
              { apiVersion: "v1", kind: "Service", metadata: { name: "api-service", namespace: ns }, spec: { ports: [{ port: 8080 }] } },
              { apiVersion: "v1", kind: "Service", metadata: { name: "web-service", namespace: ns }, spec: { ports: [{ port: 80 }] } }
            ]
          },
          verifySpec: {
            checks: [
              {
                id: "ingress-check",
                title: `Ingress ${ingName} routes host ${host} paths ${apiPath} -> api-service:8080 and /web -> web-service:80`,
                type: "k8s-jsonpath",
                kind: "Ingress",
                namespace: ns,
                name: ingName,
                rule: "ingressCheck",
                host: host,
                expectedPaths: [
                  { path: apiPath, serviceName: "api-service", port: 8080 },
                  { path: "/web", serviceName: "web-service", port: 80 }
                ],
                failHint: `Check Ingress ${ingName} in namespace ${ns} for host: ${host} and paths ${apiPath} (api-service:8080) and /web (web-service:80).`
              }
            ]
          }
        };
      }
    },

    {
      id: "ckad-20",
      domainId: "domain-5",
      domainTitle: "Services and Networking (20%)",
      baseTitle: "NetworkPolicy Pod Isolation (Ingress & Port Restriction)",
      weight: 8,
      targetMinutes: 6,
      build(seed = 120) {
        const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
        const ns = pick(["netpol-sec-120", "zero-trust-225", "db-isolation-330"], seed, 1);
        const polName = pick(["allow-api-to-db", "restrict-redis-access", "db-firewall-policy"], seed, 2);
        const targetRole = pick(["database", "redis-cache", "ledger-store"], seed, 3);
        const allowedRole = pick(["api-backend", "checkout-worker", "auth-service"], seed, 4);
        const port = pick([5432, 6379, 3306], seed, 5);

        return {
          id: "ckad-20",
          seed,
          domainId: "domain-5",
          domainTitle: "Services and Networking (20%)",
          contextCluster,
          contextCommand: `kubectl config use-context ${contextCluster}`,
          title: `NetworkPolicy Ingress & Port Restriction (${polName})`,
          titleTh: `สร้าง NetworkPolicy จำกัดการเข้าถึงพอดฐานข้อมูลเฉพาะพอร์ต ${port} (${polName})`,
          weight: 8,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-20`,
          scenario: `In namespace \`${ns}\`, database Pods run with label \`role: ${targetRole}\`. Security policy requires blocking all incoming traffic to these Pods except TCP connections on port \`${port}\` originating from Pods labeled \`role: ${allowedRole}\`.`,
          scenarioTh: `ใน Namespace \`${ns}\` มีพอดฐานข้อมูลที่มีเลเบล \`role: ${targetRole}\` รันอยู่ ทีม Security ต้องการบล็อกทราฟฟิกขาเข้าทั้งหมด ยกเว้นทราฟฟิกที่มาจากพอดที่มีเลเบล \`role: ${allowedRole}\` ที่เข้ามายังพอร์ต TCP \`${port}\` เท่านั้น`,
          requirements: [
            `Create a \`NetworkPolicy\` named \`${polName}\` in namespace \`${ns}\`.`,
            `Configure \`podSelector\` to target Pods with label \`role: ${targetRole}\` and specify \`policyTypes: ["Ingress"]\`.`,
            `Allow \`ingress\` traffic only from Pods matching \`podSelector.matchLabels.role: ${allowedRole}\` on TCP port \`${port}\`.`
          ],
          requirementsTh: [
            `สร้าง \`NetworkPolicy\` ชื่อ \`${polName}\` ใน Namespace \`${ns}\``,
            `กำหนด \`podSelector\` ให้บังคับใช้กับพอดที่มีเลเบล \`role: ${targetRole}\` และระบุ \`policyTypes: ["Ingress"]\``,
            `อนุญาต \`ingress\` เฉพาะจากพอดที่มี \`podSelector.matchLabels.role: ${allowedRole}\` บนพอร์ต TCP \`${port}\` เท่านั้น`
          ],
          hints: [
            `Ensure ingress[0].from[0].podSelector.matchLabels specifies role: ${allowedRole} and ingress[0].ports[0].port is integer ${port}.`
          ],
          solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/ckad-20/netpol.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${polName}
  namespace: ${ns}
spec:
  podSelector:
    matchLabels:
      role: ${targetRole}
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: ${allowedRole}
    ports:
    - protocol: TCP
      port: ${port}
EOF
kubectl apply -f ~/ckad-workspace/ckad-20/netpol.yaml`,
          setupSpec: {
            namespaces: [ns],
            files: {},
            resources: [
              {
                apiVersion: "v1",
                kind: "Pod",
                metadata: { name: "db-pod", namespace: ns, labels: { role: targetRole } },
                spec: { containers: [{ name: "db", image: "nginx:1.25-alpine", ports: [{ containerPort: port }] }] }
              },
              {
                apiVersion: "v1",
                kind: "Pod",
                metadata: { name: "backend-pod", namespace: ns, labels: { role: allowedRole } },
                spec: { containers: [{ name: "api", image: "nginx:1.25-alpine" }] }
              }
            ]
          },
          verifySpec: {
            checks: [
              {
                id: "netpol-target",
                title: `NetworkPolicy ${polName} isolates role: ${targetRole} and allows role: ${allowedRole} on TCP port ${port}`,
                type: "k8s-jsonpath",
                kind: "NetworkPolicy",
                namespace: ns,
                name: polName,
                rule: "netpolCheck",
                targetRole,
                allowedRole,
                port,
                failHint: `Check NetworkPolicy ${polName} in namespace ${ns} for podSelector role: ${targetRole}, ingress from podSelector role: ${allowedRole}, and port: ${port}.`
              }
            ]
          }
        };
      }
    }
  ];

  /**
   * Official Pre-Built Exam Sets (120 Minutes / 16 Questions / 66% Passing Score)
   * Plus ability to generate unlimited custom/randomized sets
   */
  const INITIAL_EXAM_SETS = [
    {
      id: "set-a",
      badge: "Official Mock Exam — Set A",
      title: "CKAD Official Mock Exam — Set A (Full 16 Questions)",
      description: "Full 2-hour (120 minutes) official-style CKAD certification exam covering all 5 CNCF domains. Passing score: 66%.",
      durationMinutes: 120,
      passingScore: 66,
      seedBase: 100,
      questionIds: [
        "ckad-01", "ckad-02", "ckad-03", "ckad-04",
        "ckad-05", "ckad-06", "ckad-07",
        "ckad-09", "ckad-10", "ckad-12",
        "ckad-13", "ckad-14", "ckad-15",
        "ckad-17", "ckad-18", "ckad-20"
      ]
    },
    {
      id: "set-b",
      badge: "Official Mock Exam — Set B",
      title: "CKAD Official Mock Exam — Set B (120 Minutes / 16 Questions)",
      description: "Full 2-hour (120 minutes) official-style CKAD certification exam with alternate parameters, Kustomize, API deprecation & Ingress routing. Passing score: 66%.",
      durationMinutes: 120,
      passingScore: 66,
      seedBase: 200,
      questionIds: [
        "ckad-01", "ckad-02", "ckad-03", "ckad-04",
        "ckad-05", "ckad-06", "ckad-08",
        "ckad-09", "ckad-10", "ckad-11",
        "ckad-13", "ckad-14", "ckad-16",
        "ckad-18", "ckad-19", "ckad-20"
      ]
    },
    {
      id: "set-c",
      badge: "Official Mock Exam — Set C",
      title: "CKAD Official Mock Exam — Set C (120 Minutes / 16 Questions)",
      description: "Full 2-hour (120 minutes) official-style CKAD certification exam with randomized parameters across all 5 CNCF domains. Passing score: 66%.",
      durationMinutes: 120,
      passingScore: 66,
      seedBase: 300,
      questionIds: [
        "ckad-01", "ckad-03", "ckad-04",
        "ckad-05", "ckad-07", "ckad-08",
        "ckad-09", "ckad-10", "ckad-11", "ckad-12",
        "ckad-13", "ckad-15", "ckad-16",
        "ckad-17", "ckad-19", "ckad-20"
      ]
    }
  ];

  const ckadLabsCatalog = {
    domains: CKAD_DOMAINS,
    blueprints: CKAD_LAB_BLUEPRINTS,
    initialSets: INITIAL_EXAM_SETS,
    buildQuestion(blueprintId, seed = 100) {
      const bp = CKAD_LAB_BLUEPRINTS.find((b) => b.id === blueprintId) || CKAD_LAB_BLUEPRINTS[0];
      return bp.build(seed);
    }
  };

  if (typeof window !== "undefined") {
    window.CKAD_LABS_DATA = ckadLabsCatalog;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = ckadLabsCatalog;
  }
})(typeof window !== "undefined" ? window : globalThis);
