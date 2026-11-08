/**
 * KubeMastery: CKAD Hands-On Exam Labs & Dynamic Scenario Generator
 * Aligned 100% with the Official CNCF CKAD Curriculum (5 Domains):
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
   * 20 Official-Style CKAD Exam Question Blueprints
   * Each blueprint defines a `build(seed)` function that returns a concrete, parameterized
   * question instance (with randomized namespace, names, ports, files, initial cluster state, and verification rules).
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
          title: `สร้าง Multi-Container Pod พร้อม Native Sidecar แชร์ Volume (${podName})`,
          weight: 7,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-01`,
          scenario: `ใน Namespace \`${ns}\` มีไฟล์ตั้งต้น \`~/ckad-workspace/ckad-01/pod.yaml\` สำหรับพอดชื่อ \`${podName}\` ซึ่งมีคอนเทนเนอร์หลักชื่อ \`main-app\` ที่เขียนไฟล์ Log ลงใน \`${logPath}/access.log\``,
          requirements: [
            `สร้างหรือแก้ไขพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ให้ทำงานอยู่ในสถานะ \`Running\``,
            `กำหนด Volume ชนิด \`emptyDir\` ชื่อ \`${volName}\` และนำไป Mount เข้ากับคอนเทนเนอร์ \`main-app\` ที่พาธ \`${logPath}\``,
            `เพิ่ม **Native Sidecar Container** (กำหนดใน \`initContainers\` พร้อมตั้งค่า \`restartPolicy: Always\`) ชื่อ \`${sidecarName}\` ใช้อิมเมจ \`busybox:1.36\` รันคำสั่ง \`["sh", "-c", "tail -n+1 -f ${logPath}/access.log"]\``,
            `Mount Volume \`${volName}\` เข้ากับ Sidecar Container \`${sidecarName}\` ที่พาธ \`${logPath}\` เช่นเดียวกัน`
          ],
          hints: [
            `ใน Kubernetes ยุคใหม่ (CKAD ปัจจุบัน) Native Sidecar คือการใส่คอนเทนเนอร์ไว้ในฟิลด์ spec.initContainers และระบุ restartPolicy: Always ในระดับคอนเทนเนอร์นั้น`,
            `ตรวจสอบให้แน่ใจว่าทั้ง main-app และ ${sidecarName} มี volumeMounts ที่ชื่อ ${volName} และ mountPath: ${logPath} ตรงกัน`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-01/pod.yaml
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
                title: `พบพอดชื่อ ${podName} ใน Namespace ${ns} และมีสถานะ Running`,
                type: "k8s-resource",
                kind: "Pod",
                namespace: ns,
                name: podName,
                expect: { statusPhase: "Running" },
                failHint: `ยังไม่พบพอดชื่อ ${podName} ใน Namespace ${ns} หรือพอดยังไม่ได้ถูกสั่ง kubectl apply`
              },
              {
                id: "emptydir-vol",
                title: `กำหนด Volume emptyDir ชื่อ ${volName} และ Mount ที่ ${logPath} ในคอนเทนเนอร์หลัก`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "hasVolumeAndMount",
                volName: volName,
                volType: "emptyDir",
                containerName: "main-app",
                mountPath: logPath,
                failHint: `ตรวจสอบว่าใน spec.volumes มี ${volName}: { emptyDir: {} } และในคอนเทนเนอร์ main-app มี volumeMounts ที่ mountPath: ${logPath}`
              },
              {
                id: "native-sidecar",
                title: `กำหนด Native Sidecar ชื่อ ${sidecarName} (image: busybox:1.36, restartPolicy: Always) และ Mount ${logPath}`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "hasSidecarContainer",
                containerName: sidecarName,
                imagePrefix: "busybox",
                mountPath: logPath,
                failHint: `ต้องเพิ่มคอนเทนเนอร์ชื่อ ${sidecarName} ใน initContainers (พร้อม restartPolicy: Always) หรือ containers พร้อม volumeMounts ที่ ${logPath}`
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
        const ns = pick(["web-init-102", "frontend-boot-205", "portal-stage-311", "shop-ui-419"], seed, 1);
        const podName = pick(["init-webapp", "portal-pod", "landing-nginx", "catalog-ui"], seed, 2);
        const initName = pick(["config-initializer", "setup-html", "prepare-assets"], seed, 3);
        const secretText = pick(["CKAD_INIT_READY_2026", "KUBE_PORTAL_OK_99", "SYSTEM_BOOT_VERIFIED", "PROD_CONFIG_LOADED"], seed, 4);

        return {
          id: "ckad-02",
          seed,
          domainId: "domain-1",
          domainTitle: "Application Design and Build (20%)",
          title: `สร้าง Pod ที่มี Init Container เตรียมไฟล์เริ่มต้น (${podName})`,
          weight: 5,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-02`,
          scenario: `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ที่ใช้ Init Container ในการสร้างไฟล์ \`index.html\` ก่อนที่คอนเทนเนอร์ \`nginx:1.25-alpine\` จะเริ่มทำงาน`,
          requirements: [
            `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` พร้อม Volume \`emptyDir\` ชื่อ \`web-content\``,
            `กำหนด \`initContainers\` ชื่อ \`${initName}\` ใช้อิมเมจ \`busybox:1.36\` รันคำสั่งสร้างไฟล์ \`/work-dir/index.html\` ที่มีข้อความว่า \`${secretText}\` (โดย Mount Volume \`web-content\` ไว้ที่ \`/work-dir\`)`,
            `กำหนดคอนเทนเนอร์หลักชื่อ \`web-server\` ใช้อิมเมจ \`nginx:1.25-alpine\` เปิดพอร์ต \`80\` และ Mount Volume \`web-content\` ไว้ที่ \`/usr/share/nginx/html\``
          ],
          hints: [
            `คำสั่งใน initContainer สามารถใช้: ["sh", "-c", "echo '${secretText}' > /work-dir/index.html"]`,
            `อย่าลืมผูก Volume web-content ให้ทั้ง initContainer (/work-dir) และคอนเทนเนอร์หลัก (/usr/share/nginx/html)`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-02/init-pod.yaml
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
                title: `พบพอด ${podName} ใน Namespace ${ns}`,
                type: "k8s-resource",
                kind: "Pod",
                namespace: ns,
                name: podName,
                expect: { statusPhase: "Running" },
                failHint: `ไม่พบพอด ${podName} ใน Namespace ${ns}`
              },
              {
                id: "init-container-check",
                title: `มี initContainer ชื่อ ${initName} ที่เขียนข้อความ ${secretText} ลง /work-dir/index.html`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "hasInitContainerCommand",
                containerName: initName,
                commandSubstring: secretText,
                mountPath: "/work-dir",
                failHint: `ตรวจสอบ initContainer ชื่อ ${initName} ว่ามี command เขียนข้อความ '${secretText}' และ mountPath: /work-dir หรือไม่`
              },
              {
                id: "main-mount-check",
                title: `คอนเทนเนอร์หลัก web-server ใช้อิมเมจ nginx:1.25-alpine และ Mount ที่ /usr/share/nginx/html`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "hasVolumeAndMount",
                volName: "web-content",
                volType: "emptyDir",
                containerName: "web-server",
                mountPath: "/usr/share/nginx/html",
                failHint: `คอนเทนเนอร์หลักต้องชื่อ web-server และ Mount Volume web-content ที่ /usr/share/nginx/html`
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
          title: `สร้าง CronJob กำหนด Parallelism และ ActiveDeadlineSeconds (${cronName})`,
          weight: 6,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-03`,
          scenario: `ทีม Data ต้องการรันงานประมวลผลตามตารางเวลาใน Namespace \`${ns}\` โดยควบคุมจำนวนการทำงานขนานและเวลาสูงสุดต่อรอบ`,
          requirements: [
            `สร้าง \`CronJob\` ชื่อ \`${cronName}\` ใน Namespace \`${ns}\` ตั้งตารางเวลารันเป็น \`"${schedule}"\``,
            `กำหนด \`successfulJobsHistoryLimit: 2\` และ \`failedJobsHistoryLimit: 1\` ในสเปกของ CronJob`,
            `ใน \`jobTemplate.spec\` ให้กำหนด \`completions: ${completions}\`, \`parallelism: ${parallelism}\`, และ \`activeDeadlineSeconds: ${deadline}\``,
            `คอนเทนเนอร์ในพอดใช้อิมเมจ \`busybox:1.36\` รันคำสั่ง \`["sh", "-c", "echo Processing batch && sleep 2"]\` และตั้ง \`restartPolicy: OnFailure\``
          ],
          hints: [
            `ใช้คำสั่งลัดสร้างโครงร่างได้: kubectl -n ${ns} create cronjob ${cronName} --image=busybox:1.36 --schedule="${schedule}" --dry-run=client -o yaml > cron.yaml -- sh -c "echo Processing batch && sleep 2"`,
            `completions, parallelism, และ activeDeadlineSeconds ต้องอยู่ภายใต้ spec.jobTemplate.spec (ระดับของ JobSpec ไม่ใช่ PodSpec)`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-03/cronjob.yaml
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
                title: `พบ CronJob ชื่อ ${cronName} ใน Namespace ${ns} พร้อมตารางเวลา "${schedule}"`,
                type: "k8s-jsonpath",
                kind: "CronJob",
                namespace: ns,
                name: cronName,
                rule: "cronSchedule",
                expectedSchedule: schedule,
                failHint: `ไม่พบ CronJob ชื่อ ${cronName} ใน Namespace ${ns} หรือค่า spec.schedule ไม่ตรงกับ "${schedule}"`
              },
              {
                id: "cron-job-spec",
                title: `กำหนด completions: ${completions}, parallelism: ${parallelism}, activeDeadlineSeconds: ${deadline} ถูกต้อง`,
                type: "k8s-jsonpath",
                kind: "CronJob",
                namespace: ns,
                name: cronName,
                rule: "cronJobSpecs",
                completions,
                parallelism,
                activeDeadlineSeconds: deadline,
                failHint: `ตรวจสอบฟิลด์ภายใต้ spec.jobTemplate.spec ว่ามี completions: ${completions}, parallelism: ${parallelism}, activeDeadlineSeconds: ${deadline} ครบถ้วน`
              },
              {
                id: "cron-history-limits",
                title: `กำหนด successfulJobsHistoryLimit: 2 และ restartPolicy: OnFailure`,
                type: "k8s-jsonpath",
                kind: "CronJob",
                namespace: ns,
                name: cronName,
                rule: "cronHistoryAndRestart",
                successfulJobsHistoryLimit: 2,
                restartPolicy: "OnFailure",
                failHint: `ตรวจสอบ spec.successfulJobsHistoryLimit: 2 และ spec.jobTemplate.spec.template.spec.restartPolicy: OnFailure`
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
          title: `สร้าง PV, PVC (${size}) และนำไปผูกใช้งานกับพอด (${podName})`,
          weight: 6,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-04`,
          scenario: `สร้างพื้นที่จัดเก็บข้อมูลถาวรและนำไปเชื่อมต่อเข้ากับพอดใน Namespace \`${ns}\``,
          requirements: [
            `สร้าง \`PersistentVolume\` ชื่อ \`${pvName}\` ขนาด \`${size}\`, \`accessModes: ["ReadWriteOnce"]\`, \`storageClassName: standard\`, และ \`hostPath.path: /mnt/data-${seed}\``,
            `สร้าง \`PersistentVolumeClaim\` ชื่อ \`${pvcName}\` ใน Namespace \`${ns}\` ที่ขอขนาด \`${size}\`, \`accessModes: ["ReadWriteOnce"]\`, และ \`storageClassName: standard\``,
            `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ใช้อิมเมจ \`nginx:1.25-alpine\` โดย Mount PVC \`${pvcName}\` ไปไว้ที่พาธ \`${mountPath}\``
          ],
          hints: [
            `PV เป็น Cluster-scoped resource (ไม่มี namespace) ส่วน PVC และ Pod ต้องอยู่ใน Namespace ${ns}`,
            `ตรวจสอบให้ storageClassName และ accessModes ของ PV และ PVC ตรงกันเพื่อให้สถานะเป็น Bound`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-04/storage.yaml
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
                title: `พบ PersistentVolume ชื่อ ${pvName} ขนาด ${size} (ReadWriteOnce)`,
                type: "k8s-jsonpath",
                kind: "PersistentVolume",
                namespace: "",
                name: pvName,
                rule: "pvCheck",
                storage: size,
                failHint: `ไม่พบ PersistentVolume ชื่อ ${pvName} หรือขนาด capacity.storage ไม่ใช่ ${size}`
              },
              {
                id: "pvc-check",
                title: `พบ PersistentVolumeClaim ชื่อ ${pvcName} ใน Namespace ${ns} ขนาด ${size}`,
                type: "k8s-jsonpath",
                kind: "PersistentVolumeClaim",
                namespace: ns,
                name: pvcName,
                rule: "pvcCheck",
                storage: size,
                failHint: `ไม่พบ PVC ชื่อ ${pvcName} ใน Namespace ${ns} หรือ resources.requests.storage ไม่ใช่ ${size}`
              },
              {
                id: "pod-pvc-mount",
                title: `พอด ${podName} ผูกใช้งาน PVC ${pvcName} ที่พาธ ${mountPath}`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podPvcMount",
                claimName: pvcName,
                mountPath: mountPath,
                failHint: `พอด ${podName} ยังไม่ได้ผูก persistentVolumeClaim.claimName: ${pvcName} หรือไม่ได้ Mount ที่ ${mountPath}`
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
          title: `ปรับกลยุทธ์ RollingUpdate และสั่ง Rollback Deployment ที่พัง (${deployName})`,
          weight: 8,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-05`,
          scenario: `ใน Namespace \`${ns}\` มี Deployment ชื่อ \`${deployName}\` (จำนวน 3 Replicas) ที่เพิ่งถูกอัปเดตเป็นอิมเมจที่ไม่มีอยู่จริง (\`${brokenImage}\`) ทำให้พอดใหม่ติดสถานะ \`ImagePullBackOff\``,
          requirements: [
            `แก้ไข Deployment \`${deployName}\` ใน Namespace \`${ns}\` ให้ตั้งค่า \`strategy.rollingUpdate.maxSurge: ${maxSurge}\` และ \`strategy.rollingUpdate.maxUnavailable: 0\``,
            `สั่ง **Rollback** Deployment \`${deployName}\` กลับไปยัง Revision 1 (ที่ใช้อิมเมจ \`${goodImage}\`) จนพอดทั้งหมดกลับมาทำงานปกติ`,
            `บันทึกผลลัพธ์ของคำสั่ง \`kubectl -n ${ns} rollout history deploy/${deployName}\` ลงในไฟล์ \`~/ckad-workspace/ckad-05/rollout-history.txt\``
          ],
          hints: [
            `ใช้ kubectl -n ${ns} edit deploy ${deployName} เพื่อแก้ maxSurge และ maxUnavailable`,
            `ใช้ kubectl -n ${ns} rollout undo deploy/${deployName} เพื่อย้อนกลับไปยังอิมเมจที่ทำงานได้ (${goodImage})`
          ],
          solutionCommands: `kubectl -n ${ns} patch deploy ${deployName} -p '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":${typeof maxSurge === "string" ? `"${maxSurge}"` : maxSurge},"maxUnavailable":0}}}}'
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
                title: `ตั้งค่า RollingUpdate maxSurge: ${maxSurge} และ maxUnavailable: 0 ใน Deployment ${deployName}`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: deployName,
                rule: "rollingUpdateStrategy",
                maxSurge: String(maxSurge),
                maxUnavailable: "0",
                failHint: `ค่า spec.strategy.rollingUpdate ของ ${deployName} ยังไม่ใช่ maxSurge: ${maxSurge} และ maxUnavailable: 0`
              },
              {
                id: "rollback-image-check",
                title: `สั่ง Rollback สำเร็จ (อิมเมจของ Deployment กลับมาเป็น ${goodImage})`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: deployName,
                rule: "deploymentImage",
                expectedImage: goodImage,
                failHint: `อิมเมจของ Deployment ${deployName} ยังเป็นเวอร์ชันที่พังอยู่ ให้รัน kubectl -n ${ns} rollout undo deploy/${deployName}`
              },
              {
                id: "history-file-check",
                title: `สร้างไฟล์ ~/ckad-workspace/ckad-05/rollout-history.txt บันทึกประวัติ Rollout`,
                type: "file-contains",
                filePath: "rollout-history.txt",
                substrings: ["REVISION", "1"],
                failHint: `ไม่พบไฟล์ ~/ckad-workspace/ckad-05/rollout-history.txt หรือในไฟล์ยังไม่มีข้อมูลจากคำสั่ง kubectl rollout history`
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
          title: `ทำ Canary Deployment แบ่งทราฟฟิก 80/20 ภายใต้ Service เดียวกัน (${svcName})`,
          weight: 7,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-06`,
          scenario: `ใน Namespace \`${ns}\` มี Deployment ชื่อ \`${appLabel}-stable\` และ Service ชื่อ \`${svcName}\` ที่คัดเลือกพอดด้วยเลเบล \`app: ${appLabel}\` อยู่แล้ว ทีมต้องการปล่อยเวอร์ชัน Canary เพื่อรับทราฟฟิก **20%** ของพอดทั้งหมด (รวมทั้งหมด ${totalPods} พอด)`,
          requirements: [
            `ปรับขนาด (Scale) Deployment \`${appLabel}-stable\` ใน Namespace \`${ns}\` ให้มี \`replicas: ${stableReplicas}\` (คิดเป็น 80% ของ ${totalPods} พอด)`,
            `สร้าง Deployment ตัวใหม่ชื่อ \`${appLabel}-canary\` ใน Namespace \`${ns}\` จำนวน \`replicas: ${canaryReplicas}\` (คิดเป็น 20% ของ ${totalPods} พอด)`,
            `กำหนดให้พอดของ \`${appLabel}-canary\` มีเลเบล \`app: ${appLabel}\` และ \`track: canary\` และใช้อิมเมจ \`nginx:1.26-alpine\` เปิดพอร์ต \`80\` เพื่อให้ Service \`${svcName}\` กระจายทราฟฟิกมาหาทั้งชุด stable และ canary`
          ],
          hints: [
            `ดูไฟล์ตั้งต้นใน ~/ckad-workspace/ckad-06/stable-deploy.yaml แล้วคัดลอกมาสร้างเป็น canary-deploy.yaml`,
            `ตรวจสอบว่า Service ${svcName} ใช้ selector app: ${appLabel} เพียงตัวเดียวเพื่อให้จับคู่ได้ทั้งพอด stable (${stableReplicas} ตัว) และ canary (${canaryReplicas} ตัว)`
          ],
          solutionCommands: `kubectl -n ${ns} scale deploy ${appLabel}-stable --replicas=${stableReplicas}
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
                title: `ปรับขนาด Deployment ${appLabel}-stable เป็น ${stableReplicas} Replicas (80%)`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: `${appLabel}-stable`,
                rule: "deploymentReplicas",
                replicas: stableReplicas,
                failHint: `Deployment ${appLabel}-stable ยังไม่ได้ถูกปรับขนาดเป็น ${stableReplicas} Replicas`
              },
              {
                id: "canary-created",
                title: `สร้าง Deployment ${appLabel}-canary จำนวน ${canaryReplicas} Replicas (20%) พร้อมอิมเมจ nginx:1.26-alpine`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: `${appLabel}-canary`,
                rule: "canaryCheck",
                replicas: canaryReplicas,
                expectedImage: "nginx:1.26-alpine",
                requiredLabels: { app: appLabel, track: "canary" },
                failHint: `ตรวจสอบว่าสร้าง Deployment ชื่อ ${appLabel}-canary จำนวน ${canaryReplicas} Replicas, อิมเมจ nginx:1.26-alpine และติดเลเบล app: ${appLabel}, track: canary`
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
        const ns = pick(["bg-deploy-107", "cutover-prod-219", "zero-downtime-304"], seed, 1);
        const svcName = pick(["live-router-svc", "public-api-svc", "customer-web-svc"], seed, 2);
        const greenVersion = pick(["v2.0", "v3.1", "2026.2"], seed, 3);

        return {
          id: "ckad-07",
          seed,
          domainId: "domain-2",
          domainTitle: "Application Deployment (20%)",
          title: `สลับทราฟฟิกแบบ Blue/Green Deployment ไปยังชุด Green (${greenVersion})`,
          weight: 5,
          targetMinutes: 4,
          namespace: ns,
          workspaceDir: `ckad-07`,
          scenario: `ใน Namespace \`${ns}\` มี Deployment \`app-blue\` (\`version: v1.0\`) ที่กำลังรับทราฟฟิกจาก Service \`${svcName}\` อยู่ ให้คุณสร้าง Deployment \`app-green\` แล้วสลับ Service ไปชี้ที่ชุด Green ทันที`,
          requirements: [
            `สร้าง Deployment ชื่อ \`app-green\` ใน Namespace \`${ns}\` จำนวน \`3\` Replicas ใช้อิมเมจ \`nginx:1.26-alpine\` โดยมีเลเบลพอด \`app: web-core\` และ \`version: "${greenVersion}"\``,
            `แก้ไข Service ชื่อ \`${svcName}\` ใน Namespace \`${ns}\` ให้เปลี่ยน Selector จาก \`version: "v1.0"\` ไปเป็น \`version: "${greenVersion}"\` (คงเลเบล \`app: web-core\` ไว้)`
          ],
          hints: [
            `สามารถดูโครงสร้างของ app-blue ได้จากไฟล์ ~/ckad-workspace/ckad-07/blue-deploy.yaml`,
            `ใช้ kubectl -n ${ns} edit svc ${svcName} หรือ kubectl patch เพื่อสลับ selector.version เป็น "${greenVersion}"`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-07/green-deploy.yaml
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
                title: `พบ Deployment ชื่อ app-green จำนวน 3 Replicas พร้อมเลเบล version: "${greenVersion}"`,
                type: "k8s-jsonpath",
                kind: "Deployment",
                namespace: ns,
                name: "app-green",
                rule: "canaryCheck",
                replicas: 3,
                expectedImage: "nginx:1.26-alpine",
                requiredLabels: { app: "web-core", version: greenVersion },
                failHint: `ไม่พบ Deployment app-green ใน Namespace ${ns} หรือเลเบลพอดยังไม่ใช่ app: web-core, version: "${greenVersion}"`
              },
              {
                id: "svc-switched",
                title: `Service ${svcName} สลับ Selector ไปชี้ที่ version: "${greenVersion}" เรียบร้อยแล้ว`,
                type: "k8s-jsonpath",
                kind: "Service",
                namespace: ns,
                name: svcName,
                rule: "serviceSelector",
                expectedSelector: { app: "web-core", version: greenVersion },
                failHint: `Service ${svcName} ยังชี้ไปที่ version เดิมอยู่ ต้องแก้ spec.selector.version เป็น "${greenVersion}"`
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
        const ns = pick(["kustom-prod-108", "overlay-app-221", "gitops-stage-314"], seed, 1);
        const prefix = pick(["prod-", "stage-", "eu-"], seed, 2);
        const envLabel = pick(["production", "staging", "enterprise"], seed, 3);

        return {
          id: "ckad-08",
          seed,
          domainId: "domain-2",
          domainTitle: "Application Deployment (20%)",
          title: `จัดการ Manifest ด้วย Kustomize (${prefix}api-server)`,
          weight: 5,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-08`,
          scenario: `ในโฟลเดอร์ \`~/ckad-workspace/ckad-08/\` มีไฟล์ \`deployment.yaml\` และ \`service.yaml\` เตรียมไว้ให้แล้ว ให้คุณสร้างไฟล์ \`kustomization.yaml\` เพื่อปรับแต่งและสั่ง Apply ลงในคลัสเตอร์`,
          requirements: [
            `สร้างไฟล์ \`~/ckad-workspace/ckad-08/kustomization.yaml\` ที่กำหนด \`namespace: ${ns}\` และ \`namePrefix: ${prefix}\``,
            `กำหนดให้เพิ่มป้ายกำกับร่วม (\`commonLabels\` หรือ \`labels\`) คือ \`env: ${envLabel}\` ให้กับทุก Resource (รวมถึง \`deployment.yaml\` และ \`service.yaml\`)`,
            `รันคำสั่ง \`kubectl apply -k ~/ckad-workspace/ckad-08/\` เพื่อสร้าง Deployment ชื่อ \`${prefix}api-server\` และ Service ชื่อ \`${prefix}api-svc\` ใน Namespace \`${ns}\``
          ],
          hints: [
            `ใน kustomization.yaml ระบุ resources: ["deployment.yaml", "service.yaml"], namespace: ${ns}, namePrefix: ${prefix}, และ commonLabels: { env: ${envLabel} }`,
            `ใช้คำสั่ง kubectl kustomize ~/ckad-workspace/ckad-08/ เพื่อดูตัวอย่าง YAML ก่อนสั่ง kubectl apply -k`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-08/kustomization.yaml
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
                title: `สร้างไฟล์ kustomization.yaml พร้อมระบุ namePrefix: ${prefix} และ env: ${envLabel}`,
                type: "file-contains",
                filePath: "kustomization.yaml",
                substrings: [prefix, envLabel, "deployment.yaml"],
                failHint: `ตรวจสอบไฟล์ ~/ckad-workspace/ckad-08/kustomization.yaml ว่ามี namePrefix: ${prefix} และ commonLabels env: ${envLabel}`
              },
              {
                id: "kustomize-deploy-applied",
                title: `ดีพลอย ${prefix}api-server ลงใน Namespace ${ns} สำเร็จ`,
                type: "k8s-resource",
                kind: "Deployment",
                namespace: ns,
                name: `${prefix}api-server`,
                expect: {},
                failHint: `ยังไม่พบ Deployment ชื่อ ${prefix}api-server ใน Namespace ${ns} (อย่าลืมรัน kubectl apply -k ~/ckad-workspace/ckad-08/)`
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
        const ns = pick(["health-check-109", "probe-prod-203", "api-monitor-317", "ready-svc-409"], seed, 1);
        const deployName = pick(["health-api", "payment-engine", "inventory-svc", "auth-gateway"], seed, 2);
        const port = pick([80, 8080], seed, 3);
        const path = pick(["/healthz", "/ready", "/livez"], seed, 4);

        return {
          id: "ckad-09",
          seed,
          domainId: "domain-3",
          domainTitle: "Application Observability and Maintenance (15%)",
          title: `ตั้งค่า Readiness Probe (httpGet) และ Liveness Probe (tcpSocket) บน Deployment (${deployName})`,
          weight: 7,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-09`,
          scenario: `ใน Namespace \`${ns}\` มี Deployment ชื่อ \`${deployName}\` รันอยู่โดยยังไม่มีระบบตรวจสอบสุขภาพคอนเทนเนอร์ ให้คุณเพิ่มทั้ง \`readinessProbe\` และ \`livenessProbe\` ให้กับคอนเทนเนอร์หลัก`,
          requirements: [
            `แก้ไข Deployment \`${deployName}\` ใน Namespace \`${ns}\` โดยเพิ่ม \`readinessProbe\` แบบ \`httpGet\` ที่พาธ \`${path}\` พอร์ต \`${port}\`, \`initialDelaySeconds: 5\`, \`periodSeconds: 10\``,
            `เพิ่ม \`livenessProbe\` แบบ \`tcpSocket\` ที่พอร์ต \`${port}\`, \`initialDelaySeconds: 15\`, \`periodSeconds: 20\``
          ],
          hints: [
            `ทั้ง readinessProbe และ livenessProbe ต้องอยู่ภายใน spec.template.spec.containers[0]`,
            `สามารถแก้ไขไฟล์ ~/ckad-workspace/ckad-09/deployment.yaml แล้วสั่ง kubectl apply -f ได้เลย`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-09/deployment.yaml
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
                title: `ตั้งค่า readinessProbe httpGet path: ${path}, port: ${port}, initialDelaySeconds: 5, periodSeconds: 10`,
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
                failHint: `ตรวจสอบ readinessProbe ในคอนเทนเนอร์ของ ${deployName} ว่าใช้ httpGet path: ${path}, port: ${port}, initialDelaySeconds: 5, periodSeconds: 10`
              },
              {
                id: "liveness-probe",
                title: `ตั้งค่า livenessProbe tcpSocket port: ${port}, initialDelaySeconds: 15, periodSeconds: 20`,
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
                failHint: `ตรวจสอบ livenessProbe ในคอนเทนเนอร์ของ ${deployName} ว่าใช้ tcpSocket port: ${port}, initialDelaySeconds: 15, periodSeconds: 20`
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
        const ns = pick(["triage-app-110", "debug-prod-209", "fix-crash-312", "hotfix-pod-418"], seed, 1);
        const podName = pick(["broken-worker", "sync-daemon", "queue-processor", "cache-warmer"], seed, 2);
        const wrongCmd = pick(["sllep", "echho", "daate"], seed, 3);

        return {
          id: "ckad-10",
          seed,
          domainId: "domain-3",
          domainTitle: "Application Observability and Maintenance (15%)",
          title: `วินิจฉัยและซ่อมแซม Pod ที่ติดสถานะ CrashLoopBackOff (${podName})`,
          weight: 7,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-10`,
          scenario: `พอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` กำลังแครชและขึ้นสถานะ \`CrashLoopBackOff\` เนื่องจากทั้งอิมเมจและคำสั่งเริ่มต้นมีข้อผิดพลาด`,
          requirements: [
            `ตรวจสอบสาเหตุของปัญหาในพอด \`${podName}\` (ดูไฟล์ \`~/ckad-workspace/ckad-10/broken-pod.yaml\` หรือใช้ \`kubectl describe pod ${podName} -n ${ns}\`)`,
            `แก้ไขให้อิมเมจของคอนเทนเนอร์เป็น \`busybox:1.36\` และแก้คำสั่งที่พิมพ์ผิด (\`${wrongCmd}\`) ให้เป็น \`["sh", "-c", "echo Worker healthy && sleep 3600"]\``,
            `ลบพอดเก่าที่พังและสร้างพอด \`${podName}\` ใหม่ใน Namespace \`${ns}\` จนมีสถานะ \`Running\``
          ],
          hints: [
            `พอดที่รันอยู่แล้วไม่สามารถแก้ command โดยตรงได้ ต้องแก้ในไฟล์ ~/ckad-workspace/ckad-10/broken-pod.yaml แล้วรัน kubectl replace --force -f broken-pod.yaml`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-10/broken-pod.yaml
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
                title: `แก้ไขคำสั่งในคอนเทนเนอร์ของพอด ${podName} ให้ถูกต้อง (sleep 3600) และไม่มีคำสั่งผิด (${wrongCmd})`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podCommandFixed",
                forbiddenSubstring: wrongCmd,
                requiredSubstring: "sleep 3600",
                failHint: `คำสั่งในพอด ${podName} ยังมี '${wrongCmd}' อยู่ หรือยังไม่ได้สั่งลบพอดเก่าแล้ว kubectl apply ใหม่`
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
        const ns = pick(["legacy-mig-111", "api-upgrade-216", "modernize-305"], seed, 1);
        const deployName = pick(["legacy-billing", "old-inventory", "v1beta-crm"], seed, 2);

        return {
          id: "ckad-11",
          seed,
          domainId: "domain-3",
          domainTitle: "Application Observability and Maintenance (15%)",
          title: `อัปเกรดไฟล์ Manifest จาก API Version เก่าที่ถูกถอดออกแล้ว (${deployName})`,
          weight: 4,
          targetMinutes: 4,
          namespace: ns,
          workspaceDir: `ckad-11`,
          scenario: `ไฟล์ \`~/ckad-workspace/ckad-11/legacy-deploy.yaml\` ถูกเขียนไว้ตั้งแต่ยุค Kubernetes รุ่นเก่า (\`extensions/v1beta1\`) และขาดฟิลด์บังคับของ \`apps/v1\``,
          requirements: [
            `แก้ไขไฟล์ \`~/ckad-workspace/ckad-11/legacy-deploy.yaml\` ให้ใช้ \`apiVersion: apps/v1\``,
            `เพิ่มฟิลด์ \`spec.selector.matchLabels\` ให้ตรงกับป้ายกำกับของพอด (\`app: ${deployName}\`)`,
            `สั่ง Apply ไฟล์นี้ลงใน Namespace \`${ns}\` เพื่อให้ Deployment \`${deployName}\` ทำงานได้จริง`
          ],
          hints: [
            `ใน apps/v1 Deployment บังคับว่าต้องมี spec.selector.matchLabels ที่ตรงกับ spec.template.metadata.labels เสมอ`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-11/legacy-deploy.yaml
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
                title: `อัปเดตไฟล์ legacy-deploy.yaml เป็น apiVersion: apps/v1 และเพิ่ม matchLabels`,
                type: "file-contains",
                filePath: "legacy-deploy.yaml",
                substrings: ["apps/v1", "matchLabels"],
                failHint: `ในไฟล์ ~/ckad-workspace/ckad-11/legacy-deploy.yaml ยังไม่ได้แก้เป็น apiVersion: apps/v1 หรือยังไม่มี matchLabels`
              },
              {
                id: "deploy-created",
                title: `ดีพลอย Deployment ${deployName} ลงใน Namespace ${ns} สำเร็จ`,
                type: "k8s-resource",
                kind: "Deployment",
                namespace: ns,
                name: deployName,
                expect: {},
                failHint: `ยังไม่พบ Deployment ${deployName} ใน Namespace ${ns}`
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
        const ns = pick(["log-audit-112", "observability-224", "trace-ops-319"], seed, 1);
        const podName = pick(["payment-Authorizer", "tx-validator", "fraud-detector"].map(s => s.toLowerCase()), seed, 2);
        const errCode = pick(["ERR_DB_TIMEOUT_504", "ERR_AUTH_TOKEN_EXPIRED_401", "ERR_TLS_HANDSHAKE_502"], seed, 3);

        return {
          id: "ckad-12",
          seed,
          domainId: "domain-3",
          domainTitle: "Application Observability and Maintenance (15%)",
          title: `ดึง Container Logs ที่พบข้อผิดพลาดบันทึกลงไฟล์ (${podName})`,
          weight: 4,
          targetMinutes: 4,
          namespace: ns,
          workspaceDir: `ckad-12`,
          scenario: `พอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` กำลังทำงานและพิมพ์ข้อความ Log ออกมา ซึ่งมีบรรทัดที่เป็นรหัสข้อผิดพลาด \`CRITICAL\``,
          requirements: [
            `ดึงข้อมูล Logs จากพอด \`${podName}\` ใน Namespace \`${ns}\` โดยคัดกรองเฉพาะบรรทัดที่มีคำว่า \`CRITICAL\``,
            `บันทึกบรรทัดที่พบลงในไฟล์ \`~/ckad-workspace/ckad-12/critical-errors.log\``
          ],
          hints: [
            `รันคำสั่ง: kubectl -n ${ns} logs ${podName} | grep CRITICAL > ~/ckad-workspace/ckad-12/critical-errors.log`
          ],
          solutionCommands: `kubectl -n ${ns} logs ${podName} | grep CRITICAL > ~/ckad-workspace/ckad-12/critical-errors.log`,
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
                title: `บันทึกบรรทัด CRITICAL (${errCode}) ลงในไฟล์ ~/ckad-workspace/ckad-12/critical-errors.log ถูกต้อง`,
                type: "file-contains",
                filePath: "critical-errors.log",
                substrings: ["CRITICAL", errCode],
                failHint: `ไม่พบไฟล์ ~/ckad-workspace/ckad-12/critical-errors.log หรือในไฟล์ยังไม่มีข้อความ CRITICAL ${errCode} จาก kubectl logs`
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
          title: `สร้าง ConfigMap & Secret และฉีดเข้าพอดทั้งแบบ Env และ Volume (${podName})`,
          weight: 8,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-13`,
          scenario: `แอปพลิเคชันใน Namespace \`${ns}\` ต้องการรับค่าคอนฟิกผ่านตัวแปรสภาพแวดล้อม (Environment Variable) และอ่านไฟล์ความลับจาก Volume`,
          requirements: [
            `สร้าง \`ConfigMap\` ชื่อ \`${cmName}\` ใน Namespace \`${ns}\` ที่มีคีย์ \`APP_MODE=${appMode}\``,
            `สร้าง \`Secret\` ชื่อ \`${secName}\` ใน Namespace \`${ns}\` ที่มีคีย์ \`db-password=${dbPass}\``,
            `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` (อิมเมจ \`nginx:1.25-alpine\`) โดยดึงค่าจาก ConfigMap \`${cmName}\` มาเป็นตัวแปรสภาพแวดล้อมชื่อ \`APP_MODE\` (หรือใช้ \`envFrom\`)`,
            `Mount Secret \`${secName}\` เข้าไปในพอด \`${podName}\` ที่พาธ \`/etc/secret-volume\` แบบ \`readOnly: true\``
          ],
          hints: [
            `สร้างด้วยคำสั่งลัด: kubectl -n ${ns} create configmap ${cmName} --from-literal=APP_MODE=${appMode}`,
            `สร้าง Secret: kubectl -n ${ns} create secret generic ${secName} --from-literal=db-password='${dbPass}'`
          ],
          solutionCommands: `kubectl -n ${ns} create configmap ${cmName} --from-literal=APP_MODE=${appMode} --dry-run=client -o yaml | kubectl apply -f -
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
                title: `พบ ConfigMap ${cmName} ที่มี APP_MODE=${appMode}`,
                type: "k8s-jsonpath",
                kind: "ConfigMap",
                namespace: ns,
                name: cmName,
                rule: "configMapKey",
                key: "APP_MODE",
                expectedValue: appMode,
                failHint: `ไม่พบ ConfigMap ชื่อ ${cmName} ใน Namespace ${ns} หรือค่า APP_MODE ไม่ใช่ ${appMode}`
              },
              {
                id: "secret-created",
                title: `พบ Secret ${secName} ที่มีคีย์ db-password`,
                type: "k8s-jsonpath",
                kind: "Secret",
                namespace: ns,
                name: secName,
                rule: "secretKeyExists",
                key: "db-password",
                failHint: `ไม่พบ Secret ชื่อ ${secName} ใน Namespace ${ns} หรือไม่มีคีย์ db-password`
              },
              {
                id: "pod-cm-sec-bound",
                title: `พอด ${podName} ดึง ConfigMap ${cmName} และ Mount Secret ${secName} ที่ /etc/secret-volume`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podConfigAndSecret",
                cmName,
                secName,
                mountPath: "/etc/secret-volume",
                failHint: `ตรวจสอบว่าพอด ${podName} มีการอ้างอิง ConfigMap ${cmName} ใน env/envFrom และ Mount Secret ${secName} ที่ /etc/secret-volume`
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
          title: `ตั้งค่า SecurityContext (runAsUser: ${uid}) และ Linux Capability (${cap})`,
          weight: 7,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-14`,
          scenario: `ทีม Security กำหนดให้พอด \`${podName}\` ใน Namespace \`${ns}\` ต้องรันด้วยสิทธิ์ผู้ใช้ที่ระบุและเพิ่ม Linux Capability เฉพาะระดับคอนเทนเนอร์`,
          requirements: [
            `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ใช้อิมเมจ \`busybox:1.36\` รันคำสั่ง \`["sh", "-c", "sleep 3600"]\``,
            `ในระดับ **Pod SecurityContext** (\`spec.securityContext\`) ให้ตั้งค่า \`runAsUser: ${uid}\` และ \`fsGroup: ${gid}\``,
            `ในระดับ **Container SecurityContext** (\`spec.containers[0].securityContext\`) ให้ตั้งค่า \`allowPrivilegeEscalation: false\` และเพิ่ม Capability \`add: ["${cap}"]\``
          ],
          hints: [
            `ข้อสอบมักหลอกเรื่องตำแหน่ง: fsGroup ต้องอยู่ที่ระดับ Pod (spec.securityContext) เท่านั้น ส่วน capabilities และ allowPrivilegeEscalation ต้องอยู่ที่ระดับ Container (spec.containers[].securityContext) เท่านั้น`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-14/sec-pod.yaml
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
                title: `ตั้งค่า Pod-level securityContext: runAsUser: ${uid} และ fsGroup: ${gid}`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podSecurityContext",
                runAsUser: uid,
                fsGroup: gid,
                failHint: `ตรวจสอบ spec.securityContext ของพอด ${podName} ว่ามี runAsUser: ${uid} และ fsGroup: ${gid}`
              },
              {
                id: "container-sec-ctx",
                title: `ตั้งค่า Container-level securityContext: allowPrivilegeEscalation: false และ capabilities.add: ["${cap}"]`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "containerSecurityContext",
                allowPrivilegeEscalation: false,
                capability: cap,
                failHint: `ตรวจสอบ spec.containers[0].securityContext ว่ามี allowPrivilegeEscalation: false และ capabilities.add: ["${cap}"]`
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
          title: `สร้าง ServiceAccount, Role, RoleBinding และผูกเข้ากับพอด (${saName})`,
          weight: 7,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-15`,
          scenario: `พอดมอนิเตอร์ใน Namespace \`${ns}\` ต้องการสิทธิ์ในการเรียกดูรายการ \`pods\` และ \`services\` ผ่าน Kubernetes API`,
          requirements: [
            `สร้าง \`ServiceAccount\` ชื่อ \`${saName}\` ใน Namespace \`${ns}\``,
            `สร้าง \`Role\` ชื่อ \`${roleName}\` ใน Namespace \`${ns}\` ที่อนุญาต \`verbs: ["get", "list", "watch"]\` สำหรับ \`resources: ["pods", "services"]\``,
            `สร้าง \`RoleBinding\` ชื่อ \`${bindingName}\` ใน Namespace \`${ns}\` เพื่อผูก Role \`${roleName}\` เข้ากับ ServiceAccount \`${saName}\``,
            `สร้างหรืออัปเดตพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` (อิมเมจ \`nginx:1.25-alpine\`) ให้รันโดยใช้ \`serviceAccountName: ${saName}\``
          ],
          hints: [
            `ใช้คำสั่งลัดได้ครบทั้ง 3 ขั้นตอน:
1. kubectl -n ${ns} create sa ${saName}
2. kubectl -n ${ns} create role ${roleName} --verb=get,list,watch --resource=pods,services
3. kubectl -n ${ns} create rolebinding ${bindingName} --role=${roleName} --serviceaccount=${ns}:${saName}`
          ],
          solutionCommands: `kubectl -n ${ns} create sa ${saName} --dry-run=client -o yaml | kubectl apply -f -
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
                title: `สร้าง ServiceAccount ชื่อ ${saName} ใน Namespace ${ns}`,
                type: "k8s-resource",
                kind: "ServiceAccount",
                namespace: ns,
                name: saName,
                expect: {},
                failHint: `ไม่พบ ServiceAccount ชื่อ ${saName} ใน Namespace ${ns}`
              },
              {
                id: "role-check",
                title: `สร้าง Role ชื่อ ${roleName} อนุญาต get, list, watch บน pods และ services`,
                type: "k8s-jsonpath",
                kind: "Role",
                namespace: ns,
                name: roleName,
                rule: "roleCheck",
                verbs: ["get", "list", "watch"],
                resources: ["pods", "services"],
                failHint: `ตรวจสอบ Role ชื่อ ${roleName} ว่ามี verbs: ["get", "list", "watch"] และ resources: ["pods", "services"]`
              },
              {
                id: "rb-and-pod-check",
                title: `สร้าง RoleBinding ${bindingName} และพอด ${podName} ใช้ serviceAccountName: ${saName}`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podServiceAccount",
                serviceAccountName: saName,
                roleBindingName: bindingName,
                failHint: `ตรวจสอบว่าสร้าง RoleBinding ${bindingName} แล้ว และพอด ${podName} ระบุ spec.serviceAccountName: ${saName}`
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
          title: `กำหนด Resource Requests & Limits ให้ผ่านเกณฑ์ ResourceQuota (${podName})`,
          weight: 6,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-16`,
          scenario: `Namespace \`${ns}\` มีการบังคับใช้ \`ResourceQuota\` ทำให้ทุกพอดที่สร้างใน Namespace นี้ต้องระบุทั้ง \`requests\` และ \`limits\` สำหรับ CPU และ Memory`,
          requirements: [
            `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ใช้อิมเมจ \`nginx:1.25-alpine\``,
            `กำหนด \`resources.requests\` เป็น \`cpu: "${reqCpu}"\` และ \`memory: "${reqMem}"\``,
            `กำหนด \`resources.limits\` เป็น \`cpu: "${limCpu}"\` และ \`memory: "${limMem}"\``
          ],
          hints: [
            `หน่วย Memory ต้องใช้ Mi (Mebibytes) ตัว M พิมพ์ใหญ่และ i พิมพ์เล็ก เช่น ${reqMem}`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-16/pod.yaml
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
                title: `พอด ${podName} กำหนด requests (cpu: ${reqCpu}, memory: ${reqMem}) และ limits (cpu: ${limCpu}, memory: ${limMem}) ครบถ้วน`,
                type: "k8s-jsonpath",
                kind: "Pod",
                namespace: ns,
                name: podName,
                rule: "podResources",
                reqCpu,
                reqMem,
                limCpu,
                limMem,
                failHint: `ตรวจสอบ spec.containers[0].resources ของพอด ${podName} ว่าตรงกับ requests (${reqCpu}, ${reqMem}) และ limits (${limCpu}, ${limMem})`
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
        const ns = pick(["net-expose-117", "web-edge-206", "public-svc-313"], seed, 1);
        const deployName = pick(["web-frontend", "customer-portal", "partner-api"], seed, 2);
        const svcName = `${deployName}-nodeport`;
        const nodePort = pick([30080, 30180, 30280, 30880], seed, 3);

        return {
          id: "ckad-17",
          seed,
          domainId: "domain-5",
          domainTitle: "Services and Networking (20%)",
          title: `เปิดเผย Deployment ด้วย Service ชนิด NodePort ที่พอร์ต ${nodePort} (${svcName})`,
          weight: 5,
          targetMinutes: 4,
          namespace: ns,
          workspaceDir: `ckad-17`,
          scenario: `ใน Namespace \`${ns}\` มี Deployment ชื่อ \`${deployName}\` (คอนเทนเนอร์เปิดพอร์ต \`8080\`, เลเบล \`app: ${deployName}\`) รันอยู่แล้ว`,
          requirements: [
            `สร้าง \`Service\` ชื่อ \`${svcName}\` ใน Namespace \`${ns}\` ชนิด \`type: NodePort\``,
            `กำหนดให้คัดเลือกพอดด้วยเลเบล \`app: ${deployName}\` โดยเปิดพอร์ตของ Service ที่ \`port: 80\`, ส่งต่อไปยัง \`targetPort: 8080\`, และกำหนด \`nodePort: ${nodePort}\``
          ],
          hints: [
            `ระวังจุดที่มักพลาด: port ของ Service คือ 80 แต่คอนเทนเนอร์รันที่ targetPort: 8080 และ nodePort: ${nodePort}`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-17/service.yaml
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
                title: `สร้าง Service ${svcName} (type: NodePort, port: 80, targetPort: 8080, nodePort: ${nodePort})`,
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
                failHint: `ตรวจสอบ Service ชื่อ ${svcName} ว่ามี type: NodePort, selector app: ${deployName}, port: 80, targetPort: 8080, และ nodePort: ${nodePort}`
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
        const ns = pick(["net-debug-118", "svc-triage-220", "broken-net-325"], seed, 1);
        const svcName = pick(["orders-backend-svc", "inventory-api-svc", "shipping-svc"], seed, 2);
        const realLabel = pick(["orders-v2", "inventory-core", "shipping-live"], seed, 3);
        const realPort = pick([8080, 9000, 3000], seed, 4);

        return {
          id: "ckad-18",
          seed,
          domainId: "domain-5",
          domainTitle: "Services and Networking (20%)",
          title: `วินิจฉัยและแก้ไข Service ที่ไม่ส่งทราฟฟิกหาพอด (${svcName})`,
          weight: 6,
          targetMinutes: 5,
          namespace: ns,
          workspaceDir: `ckad-18`,
          scenario: `ผู้ใช้งานแจ้งว่าไม่สามารถเชื่อมต่อเข้าหา Service ชื่อ \`${svcName}\` ใน Namespace \`${ns}\` ได้ เนื่องจากทั้ง Label Selector และ TargetPort ของ Service ตั้งค่าไว้ไม่ตรงกับ Deployment ที่รันอยู่จริง`,
          requirements: [
            `ตรวจสอบ Labels และ ContainerPort จริงของ Deployment ใน Namespace \`${ns}\` (ใช้ \`kubectl get pods --show-labels -n ${ns}\` หรือดูไฟล์ใน \`~/ckad-workspace/ckad-18/\`)`,
            `แก้ไข Service \`${svcName}\` ใน Namespace \`${ns}\` ให้มี \`selector.app: ${realLabel}\` และ \`targetPort: ${realPort}\` (โดยคง \`port: 80\` ไว้)`
          ],
          hints: [
            `พอดจริงในคลัสเตอร์ใช้เลเบล app: ${realLabel} และเปิด containerPort: ${realPort} แต่ Service เดิมชี้ไปที่ app: wrong-label และ targetPort: 9999`
          ],
          solutionCommands: `kubectl -n ${ns} patch svc ${svcName} --type=merge -p '{"spec":{"selector":{"app":"${realLabel}"},"ports":[{"port":80,"targetPort":${realPort}}]}}'`,
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
                title: `แก้ไข Service ${svcName} ให้ชี้ไปยัง selector app: ${realLabel} และ targetPort: ${realPort}`,
                type: "k8s-jsonpath",
                kind: "Service",
                namespace: ns,
                name: svcName,
                rule: "servicePortCheck",
                port: 80,
                targetPort: realPort,
                expectedSelector: { app: realLabel },
                failHint: `Service ${svcName} ยังไม่ได้แก้ selector เป็น app: ${realLabel} หรือ targetPort ยังไม่ใช่ ${realPort}`
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
        const ns = pick(["ingress-gw-119", "edge-router-213", "web-routing-320"], seed, 1);
        const ingName = pick(["main-gateway-ing", "shop-router-ing", "api-edge-ing"], seed, 2);
        const host = pick(["shop.k8s.local", "portal.exam.io", "api.kubemastery.io"], seed, 3);
        const apiPath = pick(["/api", "/v1", "/backend"], seed, 4);

        return {
          id: "ckad-19",
          seed,
          domainId: "domain-5",
          domainTitle: "Services and Networking (20%)",
          title: `สร้าง Ingress แยกเส้นทางตาม Host (${host}) และ Path (${apiPath})`,
          weight: 7,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-19`,
          scenario: `ใน Namespace \`${ns}\` มี Service ชื่อ \`api-service\` (พอร์ต \`8080\`) และ \`web-service\` (พอร์ต \`80\`) รันอยู่แล้ว ให้สร้าง Ingress เพื่อแยกเส้นทางทราฟฟิก`,
          requirements: [
            `สร้าง \`Ingress\` ชื่อ \`${ingName}\` ใน Namespace \`${ns}\` กำหนด \`ingressClassName: nginx\``,
            `กำหนด Host เป็น \`${host}\` โดยมี 2 เส้นทาง (\`pathType: Prefix\`):`,
            `1) พาธ \`${apiPath}\` ส่งทราฟฟิกไปยัง Service \`api-service\` พอร์ต \`8080\``,
            `2) พาธ \`/web\` ส่งทราฟฟิกไปยัง Service \`web-service\` พอร์ต \`80\``
          ],
          hints: [
            `ใช้คำสั่งลัดสร้างได้ในบรรทัดเดียว:
kubectl -n ${ns} create ingress ${ingName} --class=nginx --rule="${host}${apiPath}*=api-service:8080" --rule="${host}/web*=web-service:80"`
          ],
          solutionCommands: `kubectl -n ${ns} create ingress ${ingName} --class=nginx --rule="${host}${apiPath}*=api-service:8080" --rule="${host}/web*=web-service:80" --dry-run=client -o yaml > ~/ckad-workspace/ckad-19/ingress.yaml
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
                title: `สร้าง Ingress ${ingName} สำหรับโฮสต์ ${host} ชี้พาธ ${apiPath} -> api-service:8080 และ /web -> web-service:80`,
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
                failHint: `ตรวจสอบ Ingress ชื่อ ${ingName} ใน Namespace ${ns} ว่ามี host: ${host} และมีทั้งพาธ ${apiPath} (api-service:8080) และ /web (web-service:80)`
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
          title: `สร้าง NetworkPolicy จำกัดการเข้าถึงพอดฐานข้อมูลเฉพาะพอร์ต ${port} (${polName})`,
          weight: 8,
          targetMinutes: 6,
          namespace: ns,
          workspaceDir: `ckad-20`,
          scenario: `ใน Namespace \`${ns}\` มีพอดฐานข้อมูลที่มีเลเบล \`role: ${targetRole}\` รันอยู่ ทีม Security ต้องการบล็อกทราฟฟิกขาเข้าทั้งหมด ยกเว้นทราฟฟิกที่มาจากพอดที่มีเลเบล \`role: ${allowedRole}\` ที่เข้ามายังพอร์ต TCP \`${port}\` เท่านั้น`,
          requirements: [
            `สร้าง \`NetworkPolicy\` ชื่อ \`${polName}\` ใน Namespace \`${ns}\``,
            `กำหนด \`podSelector\` ให้บังคับใช้กับพอดที่มีเลเบล \`role: ${targetRole}\` และระบุ \`policyTypes: ["Ingress"]\``,
            `อนุญาต \`ingress\` เฉพาะจากพอดที่มี \`podSelector.matchLabels.role: ${allowedRole}\` บนพอร์ต TCP \`${port}\` เท่านั้น`
          ],
          hints: [
            `ตรวจสอบให้แน่ใจว่า from.podSelector.matchLabels มี role: ${allowedRole} และ ports มี port: ${port} (เป็นตัวเลข ไม่ใช่สตริง)`
          ],
          solutionCommands: `cat << 'EOF' > ~/ckad-workspace/ckad-20/netpol.yaml
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
                title: `สร้าง NetworkPolicy ${polName} ที่จับคู่ podSelector role: ${targetRole}`,
                type: "k8s-jsonpath",
                kind: "NetworkPolicy",
                namespace: ns,
                name: polName,
                rule: "netpolCheck",
                targetRole,
                allowedRole,
                port,
                failHint: `ตรวจสอบ NetworkPolicy ชื่อ ${polName} ใน Namespace ${ns} ว่ามี podSelector role: ${targetRole}, ingress from podSelector role: ${allowedRole}, และ port: ${port}`
              }
            ]
          }
        };
      }
    }
  ];

  /**
   * Pre-built Exam Sets (Plus ability to generate unlimited custom/randomized sets)
   */
  const INITIAL_EXAM_SETS = [
    {
      id: "set-a",
      badge: "Exam Set A",
      title: "CKAD Full Standard Mock Exam #1",
      description: "ชุดข้อสอบมาตรฐานเสมือนจริง 16 ข้อ ครอบคลุมครบทั้ง 5 หมวดตามสัดส่วนคะแนนสอบจริงของ CNCF (เกณฑ์ผ่าน 66% / เวลา 120 นาที)",
      durationMinutes: 120,
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
      badge: "Exam Set B",
      title: "CKAD Networking, Security & Troubleshooting Focus",
      description: "ชุดข้อสอบเข้มข้น 10 ข้อ เน้นการแก้ปัญหาพอดพัง, Service Endpoints, Ingress, NetworkPolicy, SecurityContext และ RBAC",
      durationMinutes: 75,
      seedBase: 200,
      questionIds: [
        "ckad-05", "ckad-09", "ckad-10", "ckad-12",
        "ckad-14", "ckad-15", "ckad-16",
        "ckad-18", "ckad-19", "ckad-20"
      ]
    },
    {
      id: "set-c",
      badge: "Exam Set C",
      title: "CKAD Workloads, Sidecar, Config & Storage Focus",
      description: "ชุดข้อสอบเข้มข้น 10 ข้อ เน้น Multi-Container Sidecar, InitContainers, CronJobs, PV/PVC, Canary, Blue/Green และ Kustomize",
      durationMinutes: 75,
      seedBase: 300,
      questionIds: [
        "ckad-01", "ckad-02", "ckad-03", "ckad-04",
        "ckad-06", "ckad-07", "ckad-08",
        "ckad-11", "ckad-13", "ckad-17"
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

