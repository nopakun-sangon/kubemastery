/**
 * KubeMastery CKAD AI Exam & Question Synthesizer (`aiExamSynthesizer.js`)
 * Supports dual-engine generation:
 *   1. Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash`) when an API key is provided
 *   2. Built-in Compositional AI Scenario Synthesizer (zero-config, instant, offline-capable)
 *      with 16 brand-new CKAD scenario archetypes + natural language prompt matching (Thai & English).
 */

const https = require("https");

const DOMAIN_META = {
  "domain-1": {
    id: "domain-1",
    title: "Application Design and Build (20%)",
    titleTh: "การออกแบบและสร้างแอปพลิเคชันบนพอด (20%)",
    weight: 20
  },
  "domain-2": {
    id: "domain-2",
    title: "Application Deployment (20%)",
    titleTh: "การดีพลอยและบริหารจัดการเวอร์ชันแอปพลิเคชัน (20%)",
    weight: 20
  },
  "domain-3": {
    id: "domain-3",
    title: "Application Observability and Maintenance (15%)",
    titleTh: "การตรวจสอบสุขภาพระบบ การดู Log และการแก้ปัญหาพอด (15%)",
    weight: 15
  },
  "domain-4": {
    id: "domain-4",
    title: "Application Environment, Configuration and Security (25%)",
    titleTh: "การตั้งค่าคอนฟิก ความลับ ความปลอดภัย และโควตาทรัพยากร (25%)",
    weight: 25
  },
  "domain-5": {
    id: "domain-5",
    title: "Services and Networking (20%)",
    titleTh: "ระบบเครือข่าย เซอร์วิส Ingress และ NetworkPolicy (20%)",
    weight: 20
  }
};

function pick(arr, seed, offset = 0) {
  const idx = Math.abs(Math.floor(Number(seed || 100) + offset * 13)) % arr.length;
  return arr[idx];
}

function makeUniqueId(prefix = "ai-ckad") {
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

/**
 * 16 Brand-New Advanced CKAD Compositional AI Archetypes
 * Completely distinct from static blueprints ckad-01..ckad-20.
 */
const AI_ARCHETYPES = [
  // =========================================================================
  // 1. StatefulSet & Headless Service Ordered Deployment (Domain 1)
  // =========================================================================
  {
    archetypeId: "arch-statefulset-headless",
    domainId: "domain-1",
    keywords: ["statefulset", "sts", "headless", "clusterip", "ordered", "database", "redis", "cassandra", "stateful", "สเตทฟูล"],
    build(seed = 501, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-sts");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["stateful-db-501", "redis-cluster-602", "ledger-sts-703", "distributed-kv-804"], seed, 1);
      const stsName = pick(["redis-shard", "Write-ledger-db".toLowerCase(), "order-store", "session-node"], seed, 2);
      const svcName = `${stsName}-headless`;
      const replicas = difficulty === "hard" ? 3 : 2;
      const port = pick([6379, 5432, 9042], seed, 3);
      const image = pick(["redis:7.2-alpine", "busybox:1.36", "nginx:1.25-alpine"], seed, 4);
      const mountPath = pick(["/data/state", "/var/lib/redis", "/opt/store"], seed, 5);
      const volName = pick(["state-data", "db-storage", "kv-vol"], seed, 6);
      const weight = difficulty === "hard" ? 9 : 7;

      return {
        id,
        archetypeId: "arch-statefulset-headless",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "StatefulSet & Headless Service Ordered Deployment",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-1",
        domainTitle: DOMAIN_META["domain-1"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `StatefulSet & Headless Service Topology (${stsName})`,
        titleTh: `สร้าง Headless Service และ StatefulSet สำหรับระบบฐานข้อมูลแบบมีลำดับ (${stsName})`,
        weight,
        targetMinutes: difficulty === "hard" ? 9 : 7,
        namespace: ns,
        workspaceDir: id,
        scenario: `The data platform team requires stable network identities for a stateful workload in namespace \`${ns}\`. A draft manifest directory has been initialized at \`~/ckad-workspace/${id}/\`. You must deploy a Headless Service and a StatefulSet with ordered Pod identity.`,
        scenarioTh: `ทีม Data Platform ต้องการรันระบบฐานข้อมูลที่มีชื่อ DNS ประจำตัวของแต่ละพอดอย่างคงที่ใน Namespace \`${ns}\` โดยให้สร้างทั้ง Headless Service และ StatefulSet ในโฟลเดอร์ \`~/ckad-workspace/${id}/\``,
        requirements: [
          `Create a Headless \`Service\` named \`${svcName}\` in namespace \`${ns}\` with \`clusterIP: None\`, selector \`app: ${stsName}\`, and TCP port \`${port}\` (targetPort \`${port}\`).`,
          `Create a \`StatefulSet\` named \`${stsName}\` in namespace \`${ns}\` bound to \`serviceName: ${svcName}\` with \`${replicas}\` replicas and selector/pod template label \`app: ${stsName}\`.`,
          `Configure the primary container named \`db-node\` using image \`${image}\` (if \`busybox:1.36\`, use command \`["sh", "-c", "sleep 3600"]\`), exposing \`containerPort: ${port}\`.`,
          `Define an \`emptyDir\` volume named \`${volName}\` and mount it into \`db-node\` at \`${mountPath}\`.`
        ],
        requirementsTh: [
          `สร้าง Headless \`Service\` ชื่อ \`${svcName}\` ใน Namespace \`${ns}\` โดยตั้งค่า \`clusterIP: None\`, selector \`app: ${stsName}\` และพอร์ต TCP \`${port}\``,
          `สร้าง \`StatefulSet\` ชื่อ \`${stsName}\` ใน Namespace \`${ns}\` ที่ผูกกับ \`serviceName: ${svcName}\` จำนวน \`${replicas}\` Replicas พร้อมเลเบล \`app: ${stsName}\``,
          `ตั้งค่าคอนเทนเนอร์ชื่อ \`db-node\` ใช้อิมเมจ \`${image}\` และเปิดพอร์ต \`containerPort: ${port}\``,
          `สร้าง Volume ชนิด \`emptyDir\` ชื่อ \`${volName}\` และนำไป Mount เข้ากับคอนเทนเนอร์ที่พาธ \`${mountPath}\``
        ],
        hints: [
          `A Headless Service sets spec.clusterIP: None so Kubernetes creates DNS A records for each StatefulSet Pod (${stsName}-0.${svcName}.${ns}.svc.cluster.local).`,
          `Ensure spec.serviceName on the StatefulSet matches "${svcName}" and spec.selector.matchLabels matches spec.template.metadata.labels.`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/statefulset.yaml
apiVersion: v1
kind: Service
metadata:
  name: ${svcName}
  namespace: ${ns}
spec:
  clusterIP: None
  selector:
    app: ${stsName}
  ports:
  - port: ${port}
    targetPort: ${port}
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${stsName}
  namespace: ${ns}
spec:
  serviceName: ${svcName}
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${stsName}
  template:
    metadata:
      labels:
        app: ${stsName}
    spec:
      volumes:
      - name: ${volName}
        emptyDir: {}
      containers:
      - name: db-node
        image: ${image}
        command: ["sh", "-c", "sleep 3600"]
        ports:
        - containerPort: ${port}
        volumeMounts:
        - name: ${volName}
          mountPath: ${mountPath}
EOF
kubectl apply -f ~/ckad-workspace/${id}/statefulset.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {
            "README.txt": `Task ${id}: Create Headless Service ${svcName} and StatefulSet ${stsName} in namespace ${ns}.\n`
          },
          resources: []
        },
        verifySpec: {
          checks: [
            {
              id: "headless-svc",
              title: `Headless Service ${svcName} exists with clusterIP: None and port ${port}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Service",
              namespace: ns,
              name: svcName,
              assertions: [
                { path: "spec.clusterIP", operator: "equals", value: "None" },
                { path: "spec.selector.app", operator: "equals", value: stsName },
                { path: "spec.ports[0].port", operator: "equals", value: port }
              ],
              failHint: `Verify Service ${svcName} in namespace ${ns} has spec.clusterIP: None, selector app=${stsName}, and port ${port}.`
            },
            {
              id: "sts-spec",
              title: `StatefulSet ${stsName} has serviceName=${svcName} and replicas=${replicas}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "StatefulSet",
              namespace: ns,
              name: stsName,
              assertions: [
                { path: "spec.serviceName", operator: "equals", value: svcName },
                { path: "spec.replicas", operator: "equals", value: replicas },
                { path: "spec.selector.matchLabels.app", operator: "equals", value: stsName }
              ],
              failHint: `Verify StatefulSet ${stsName} has spec.serviceName: ${svcName} and spec.replicas: ${replicas}.`
            },
            {
              id: "sts-container-mount",
              title: `StatefulSet container db-node uses ${image} and mounts ${volName} at ${mountPath}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "StatefulSet",
              namespace: ns,
              name: stsName,
              assertions: [
                { path: "spec.template.spec.containers[0].image", operator: "equals", value: image },
                { path: `spec.template.spec.containers[0].volumeMounts[name=${volName}].mountPath`, operator: "equals", value: mountPath }
              ],
              failHint: `Ensure container db-node uses image ${image} and mounts volume ${volName} at ${mountPath}.`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 2. DaemonSet Node-Level Log/Metrics Agent (Domain 2)
  // =========================================================================
  {
    archetypeId: "arch-daemonset-agent",
    domainId: "domain-2",
    keywords: ["daemonset", "ds", "agent", "fluentd", "node-exporter", "telemetry", "node-level", "เดมอนเซ็ต"],
    build(seed = 502, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-ds");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["monitoring-ds-502", "logging-infra-610", "sec-agent-720"], seed, 1);
      const dsName = pick(["node-log-collector", "ebpf-audit-agent", "metrics-daemon"], seed, 2);
      const image = pick(["fluent/fluent-bit:2.2", "prom/node-exporter:v1.7.0", "busybox:1.36"], seed, 3);
      const tolKey = pick(["node-role.kubernetes.io/control-plane", "dedicated-infra", "monitoring-node"], seed, 4);
      const volName = pick(["varlog", "host-metrics", "node-sys"], seed, 5);
      const mountPath = pick(["/var/log/containers", "/host/proc", "/var/run/agent"], seed, 6);
      const weight = difficulty === "hard" ? 8 : 6;

      return {
        id,
        archetypeId: "arch-daemonset-agent",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "DaemonSet Node-Level Agent with Toleration",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-2",
        domainTitle: DOMAIN_META["domain-2"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `DaemonSet Node Telemetry Agent & Tolerations (${dsName})`,
        titleTh: `สร้าง DaemonSet รันเอเจนต์เก็บข้อมูลทุกโหนดพร้อมตั้งค่า Toleration (${dsName})`,
        weight,
        targetMinutes: 6,
        namespace: ns,
        workspaceDir: id,
        scenario: `Platform observability requires a node-level agent running on every cluster node in namespace \`${ns}\`, including tainted nodes. Create a \`DaemonSet\` manifest in \`~/ckad-workspace/${id}/daemonset.yaml\` and apply it.`,
        scenarioTh: `ทีมโครงสร้างพื้นฐานต้องการรันเอเจนต์เก็บข้อมูลบนทุกโหนดในคลัสเตอร์ภายใต้ Namespace \`${ns}\` รวมถึงโหนดที่ติด Taint ด้วย โดยให้สร้าง \`DaemonSet\` ตามสเปกที่กำหนด`,
        requirements: [
          `Create a \`DaemonSet\` named \`${dsName}\` in namespace \`${ns}\` with selector and pod template label \`tier: node-agent\` and \`app: ${dsName}\`.`,
          `Configure container \`agent\` with image \`${image}\`.`,
          `Add a pod \`toleration\` for key \`${tolKey}\` with \`operator: Exists\` and \`effect: NoSchedule\`.`,
          `Define an \`emptyDir\` (or \`hostPath\`) volume named \`${volName}\` and mount it into container \`agent\` at \`${mountPath}\` (with \`readOnly: true\`).`
        ],
        requirementsTh: [
          `สร้าง \`DaemonSet\` ชื่อ \`${dsName}\` ใน Namespace \`${ns}\` พร้อมเลเบล \`tier: node-agent\` และ \`app: ${dsName}\``,
          `ตั้งค่าคอนเทนเนอร์ชื่อ \`agent\` ใช้อิมเมจ \`${image}\``,
          `เพิ่ม \`tolerations\` สำหรับคีย์ \`${tolKey}\` โดยใช้ \`operator: Exists\` และ \`effect: NoSchedule\``,
          `สร้าง Volume ชื่อ \`${volName}\` และนำไป Mount เข้ากับคอนเทนเนอร์ \`agent\` ที่พาธ \`${mountPath}\` (\`readOnly: true\`)`
        ],
        hints: [
          `DaemonSets do not have a replicas field; they schedule one Pod per matching node.`,
          `Place tolerations under spec.template.spec.tolerations.`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: ${dsName}
  namespace: ${ns}
spec:
  selector:
    matchLabels:
      tier: node-agent
      app: ${dsName}
  template:
    metadata:
      labels:
        tier: node-agent
        app: ${dsName}
    spec:
      tolerations:
      - key: ${tolKey}
        operator: Exists
        effect: NoSchedule
      volumes:
      - name: ${volName}
        emptyDir: {}
      containers:
      - name: agent
        image: ${image}
        volumeMounts:
        - name: ${volName}
          mountPath: ${mountPath}
          readOnly: true
EOF
kubectl apply -f ~/ckad-workspace/${id}/daemonset.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: []
        },
        verifySpec: {
          checks: [
            {
              id: "ds-exists-labels",
              title: `DaemonSet ${dsName} exists in ${ns} with selector app=${dsName}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "DaemonSet",
              namespace: ns,
              name: dsName,
              assertions: [
                { path: "spec.selector.matchLabels.app", operator: "equals", value: dsName },
                { path: "spec.template.spec.containers[0].image", operator: "equals", value: image }
              ],
              failHint: `Ensure DaemonSet ${dsName} exists in namespace ${ns} with image ${image}.`
            },
            {
              id: "ds-toleration",
              title: `DaemonSet tolerates key ${tolKey} with effect NoSchedule`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "DaemonSet",
              namespace: ns,
              name: dsName,
              assertions: [
                { path: `spec.template.spec.tolerations[key=${tolKey}].effect`, operator: "equals", value: "NoSchedule" }
              ],
              failHint: `Check spec.template.spec.tolerations for key: ${tolKey} and effect: NoSchedule.`
            },
            {
              id: "ds-vol-mount",
              title: `Container agent mounts volume ${volName} at ${mountPath} (readOnly: true)`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "DaemonSet",
              namespace: ns,
              name: dsName,
              assertions: [
                { path: `spec.template.spec.containers[0].volumeMounts[name=${volName}].mountPath`, operator: "equals", value: mountPath },
                { path: `spec.template.spec.containers[0].volumeMounts[name=${volName}].readOnly`, operator: "equals", value: true }
              ],
              failHint: `Ensure volume ${volName} is mounted at ${mountPath} with readOnly: true.`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 3. HorizontalPodAutoscaler (HPA) CPU Scaling Policy (Domain 2)
  // =========================================================================
  {
    archetypeId: "arch-hpa-autoscaler",
    domainId: "domain-2",
    keywords: ["hpa", "autoscaler", "horizontalpodautoscaler", "autoscale", "cpu", "scaling", "ออโต้สเกล", "สเกลอัตโนมัติ"],
    build(seed = 503, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-hpa");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["autoscale-prod-503", "checkout-scale-611", "api-elastic-722"], seed, 1);
      const deployName = pick(["checkout-api", "payment-gateway", "catalog-service", "order-processor"], seed, 2);
      const hpaName = `${deployName}-hpa`;
      const minRep = pick([2, 3], seed, 3);
      const maxRep = pick([8, 10, 12], seed, 4);
      const cpuUtil = pick([65, 70, 75, 80], seed, 5);
      const reqCpu = pick(["100m", "200m", "250m"], seed, 6);
      const weight = difficulty === "hard" ? 8 : 6;

      return {
        id,
        archetypeId: "arch-hpa-autoscaler",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "HorizontalPodAutoscaler CPU Scaling Policy",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-2",
        domainTitle: DOMAIN_META["domain-2"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `HorizontalPodAutoscaler (HPA) & CPU Requests (${deployName})`,
        titleTh: `ตั้งค่า CPU Requests และสร้าง HorizontalPodAutoscaler สเกลพอดอัตโนมัติ (${deployName})`,
        weight,
        targetMinutes: 6,
        namespace: ns,
        workspaceDir: id,
        scenario: `Deployment \`${deployName}\` in namespace \`${ns}\` experiences traffic spikes during flash sales, but currently lacks CPU resource requests required by the metrics server and has no autoscaler configured.`,
        scenarioTh: `Deployment ชื่อ \`${deployName}\` ใน Namespace \`${ns}\` มีทราฟฟิกพุ่งสูงเป็นช่วงๆ แต่ยังไม่ได้ตั้งค่า CPU Requests (ซึ่งจำเป็นสำหรับคำนวณเปอร์เซ็นต์การใช้งาน CPU) และยังไม่มี HorizontalPodAutoscaler`,
        requirements: [
          `Update Deployment \`${deployName}\` in namespace \`${ns}\` so its primary container specifies CPU resource requests \`resources.requests.cpu: "${reqCpu}"\`.`,
          `Create a \`HorizontalPodAutoscaler\` named \`${hpaName}\` in namespace \`${ns}\` targeting \`Deployment/${deployName}\`.`,
          `Configure \`minReplicas: ${minRep}\`, \`maxReplicas: ${maxRep}\`, and target average CPU utilization of \`${cpuUtil}%\`.`
        ],
        requirementsTh: [
          `อัปเดต Deployment \`${deployName}\` ใน Namespace \`${ns}\` ให้คอนเทนเนอร์มีการจอง \`resources.requests.cpu: "${reqCpu}"\``,
          `สร้าง \`HorizontalPodAutoscaler\` ชื่อ \`${hpaName}\` ใน Namespace \`${ns}\` ชี้ไปยัง \`Deployment/${deployName}\``,
          `กำหนด \`minReplicas: ${minRep}\`, \`maxReplicas: ${maxRep}\` และตั้งเป้าการใช้งาน CPU เฉลี่ยที่ \`${cpuUtil}%\``
        ],
        hints: [
          `You can use: kubectl autoscale deploy ${deployName} --name=${hpaName} --min=${minRep} --max=${maxRep} --cpu-percent=${cpuUtil} -n ${ns} OR apply an autoscaling/v2 YAML manifest.`,
          `Don't forget to patch or edit Deployment ${deployName} so spec.template.spec.containers[0].resources.requests.cpu is "${reqCpu}".`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
kubectl patch deploy ${deployName} -n ${ns} -p '{"spec":{"template":{"spec":{"containers":[{"name":"${deployName}","image":"nginx:1.25-alpine","resources":{"requests":{"cpu":"${reqCpu}"}}}]}}}}'
kubectl autoscale deploy ${deployName} --name=${hpaName} --min=${minRep} --max=${maxRep} --cpu-percent=${cpuUtil} -n ${ns}`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: [
            {
              apiVersion: "apps/v1",
              kind: "Deployment",
              metadata: { name: deployName, namespace: ns, labels: { app: deployName } },
              spec: {
                replicas: 2,
                selector: { matchLabels: { app: deployName } },
                template: {
                  metadata: { labels: { app: deployName } },
                  spec: {
                    containers: [
                      {
                        name: deployName,
                        image: "nginx:1.25-alpine",
                        ports: [{ containerPort: 80 }]
                      }
                    ]
                  }
                }
              }
            }
          ]
        },
        verifySpec: {
          checks: [
            {
              id: "deploy-cpu-request",
              title: `Deployment ${deployName} defines resources.requests.cpu = ${reqCpu}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Deployment",
              namespace: ns,
              name: deployName,
              assertions: [
                { path: "spec.template.spec.containers[0].resources.requests.cpu", operator: "equals", value: reqCpu }
              ],
              failHint: `Ensure Deployment ${deployName} has spec.template.spec.containers[0].resources.requests.cpu set to "${reqCpu}".`
            },
            {
              id: "hpa-bounds",
              title: `HPA ${hpaName} targets Deployment/${deployName} with minReplicas=${minRep}, maxReplicas=${maxRep}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "HorizontalPodAutoscaler",
              namespace: ns,
              name: hpaName,
              assertions: [
                { path: "spec.scaleTargetRef.kind", operator: "equals", value: "Deployment" },
                { path: "spec.scaleTargetRef.name", operator: "equals", value: deployName },
                { path: "spec.minReplicas", operator: "equals", value: minRep },
                { path: "spec.maxReplicas", operator: "equals", value: maxRep }
              ],
              failHint: `Ensure HPA ${hpaName} targets Deployment/${deployName} with minReplicas: ${minRep} and maxReplicas: ${maxRep}.`
            },
            {
              id: "hpa-cpu-util",
              title: `HPA ${hpaName} configures CPU utilization target of ${cpuUtil}%`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "HorizontalPodAutoscaler",
              namespace: ns,
              name: hpaName,
              assertions: [
                { path: "spec.metrics[0].resource.target.averageUtilization", operator: "equals", value: cpuUtil }
              ],
              failHint: `Ensure HPA ${hpaName} specifies averageUtilization: ${cpuUtil} (or --cpu-percent=${cpuUtil}).`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 4. Pod Taints, Tolerations & NodeSelector Placement (Domain 2)
  // =========================================================================
  {
    archetypeId: "arch-taint-toleration-nodeselector",
    domainId: "domain-2",
    keywords: ["taint", "toleration", "nodeselector", "affinity", "placement", "schedule", "gpu", "dedicated", "โหนด"],
    build(seed = 504, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-sched");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["ai-inference-504", "gpu-compute-615", "batch-accel-725"], seed, 1);
      const podName = pick(["llm-worker-pod", "vision-infer-pod", "cuda-scorer-pod"], seed, 2);
      const labelKey = pick(["accelerator", "hardware-tier", "workload-pool"], seed, 3);
      const labelVal = pick(["nvidia-l4", "high-mem-nvme", "ai-dedicated"], seed, 4);
      const taintKey = pick(["dedicated", "gpu-pool", "special-tier"], seed, 5);
      const taintVal = pick(["ai-workload", "gpu-only", "isolated"], seed, 6);
      const image = pick(["nginx:1.25-alpine", "redis:7.2-alpine"], seed, 7);
      const weight = difficulty === "hard" ? 8 : 6;

      return {
        id,
        archetypeId: "arch-taint-toleration-nodeselector",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "Pod Taints, Tolerations & NodeSelector Placement",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-2",
        domainTitle: DOMAIN_META["domain-2"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `NodeSelector & Taint Toleration Scheduling (${podName})`,
        titleTh: `กำหนด NodeSelector และ Toleration เพื่อจัดสรรพอดลงโหนดเฉพาะกิจ (${podName})`,
        weight,
        targetMinutes: 5,
        namespace: ns,
        workspaceDir: id,
        scenario: `High-performance worker nodes in the cluster are labeled with \`${labelKey}=${labelVal}\` and tainted with \`${taintKey}=${taintVal}:NoSchedule\`. You need to schedule Pod \`${podName}\` in namespace \`${ns}\` onto those dedicated nodes.`,
        scenarioTh: `โหนดประมวลผลความเร็วสูงในคลัสเตอร์ถูกติดเลเบล \`${labelKey}=${labelVal}\` และติด Taint \`${taintKey}=${taintVal}:NoSchedule\` ให้สร้างพอด \`${podName}\` ใน Namespace \`${ns}\` เพื่อให้ลงไปรันบนโหนดเหล่านั้นได้`,
        requirements: [
          `Create a Pod named \`${podName}\` in namespace \`${ns}\` running container \`worker\` with image \`${image}\`.`,
          `Configure \`spec.nodeSelector\` with \`${labelKey}: ${labelVal}\`.`,
          `Add a \`toleration\` in \`spec.tolerations\` with \`key: "${taintKey}"\`, \`operator: "Equal"\`, \`value: "${taintVal}"\`, and \`effect: "NoSchedule"\`.`
        ],
        requirementsTh: [
          `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ที่รันคอนเทนเนอร์ \`worker\` ด้วยอิมเมจ \`${image}\``,
          `กำหนด \`spec.nodeSelector\` ให้เลือกโหนดที่มีเลเบล \`${labelKey}: ${labelVal}\``,
          `เพิ่ม \`tolerations\` โดยระบุ \`key: "${taintKey}"\`, \`operator: "Equal"\`, \`value: "${taintVal}"\` และ \`effect: "NoSchedule"\``
        ],
        hints: [
          `Both nodeSelector (attracts Pod to labeled nodes) and tolerations (allows Pod onto tainted nodes) are placed under spec.`,
          `Ensure operator is "Equal" and effect is "NoSchedule".`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  nodeSelector:
    ${labelKey}: ${labelVal}
  tolerations:
  - key: "${taintKey}"
    operator: "Equal"
    value: "${taintVal}"
    effect: "NoSchedule"
  containers:
  - name: worker
    image: ${image}
EOF
kubectl apply -f ~/ckad-workspace/${id}/pod.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: []
        },
        verifySpec: {
          checks: [
            {
              id: "pod-nodeselector",
              title: `Pod ${podName} specifies nodeSelector ${labelKey}=${labelVal}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Pod",
              namespace: ns,
              name: podName,
              assertions: [
                { path: `spec.nodeSelector.${labelKey}`, operator: "equals", value: labelVal },
                { path: "spec.containers[0].image", operator: "equals", value: image }
              ],
              failHint: `Ensure Pod ${podName} has spec.nodeSelector.${labelKey}: "${labelVal}" and image "${image}".`
            },
            {
              id: "pod-toleration",
              title: `Pod ${podName} tolerates ${taintKey}=${taintVal}:NoSchedule`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Pod",
              namespace: ns,
              name: podName,
              assertions: [
                { path: `spec.tolerations[key=${taintKey}].operator`, operator: "equals", value: "Equal" },
                { path: `spec.tolerations[key=${taintKey}].value`, operator: "equals", value: taintVal },
                { path: `spec.tolerations[key=${taintKey}].effect`, operator: "equals", value: "NoSchedule" }
              ],
              failHint: `Ensure spec.tolerations includes key="${taintKey}", operator="Equal", value="${taintVal}", effect="NoSchedule".`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 5. Downward API Environment & Volume Projection (Domain 4)
  // =========================================================================
  {
    archetypeId: "arch-downward-api",
    domainId: "domain-4",
    keywords: ["downward", "downwardapi", "fieldref", "podip", "metadata", "introspection"],
    build(seed = 505, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-downward");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["telemetry-meta-505", "mesh-identity-616", "trace-context-727"], seed, 1);
      const podName = pick(["meta-inspector-pod", "identity-agent-pod", "trace-beacon-pod"], seed, 2);
      const volName = pick(["podinfo", "meta-vol", "downward-vol"], seed, 3);
      const mountPath = pick(["/etc/podinfo", "/var/run/podmeta", "/opt/podinfo"], seed, 4);
      const weight = difficulty === "hard" ? 8 : 6;

      return {
        id,
        archetypeId: "arch-downward-api",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "Downward API Environment & Volume Projection",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-4",
        domainTitle: DOMAIN_META["domain-4"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `Downward API Env & Volume Metadata Projection (${podName})`,
        titleTh: `ดึงข้อมูล Metadata ของพอดด้วย Downward API ผ่าน Env และ Volume (${podName})`,
        weight,
        targetMinutes: 6,
        namespace: ns,
        workspaceDir: id,
        scenario: `A diagnostic agent in namespace \`${ns}\` needs runtime introspection of its own Pod name, Pod IP address, and labels without querying the Kubernetes API server directly. Use the **Downward API** to expose this metadata.`,
        scenarioTh: `แอปพลิเคชันตรวจสอบระบบใน Namespace \`${ns}\` ต้องการทราบชื่อพอด, IP ของพอด และ Labels ของตัวเองโดยไม่ต้องเรียก Kubernetes API โดยตรง ให้ตั้งค่าผ่าน **Downward API**`,
        requirements: [
          `Create a Pod named \`${podName}\` in namespace \`${ns}\` with label \`tier: diagnostics\` running container \`agent\` with image \`busybox:1.36\` and command \`["sh", "-c", "sleep 3600"]\`.`,
          `Inject environment variable \`POD_NAME\` from \`fieldRef.fieldPath: metadata.name\` and \`POD_IP\` from \`fieldRef.fieldPath: status.podIP\`.`,
          `Define a \`downwardAPI\` volume named \`${volName}\` that projects \`metadata.labels\` to a file path \`labels\`, and mount it into \`agent\` at \`${mountPath}\`.`
        ],
        requirementsTh: [
          `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` พร้อมเลเบล \`tier: diagnostics\` รันคอนเทนเนอร์ \`agent\` ใช้อิมเมจ \`busybox:1.36\` คำสั่ง \`["sh", "-c", "sleep 3600"]\``,
          `ฉีดตัวแปรสภาพแวดล้อม \`POD_NAME\` จาก \`fieldRef.fieldPath: metadata.name\` และ \`POD_IP\` จาก \`fieldRef.fieldPath: status.podIP\``,
          `สร้าง Volume ชนิด \`downwardAPI\` ชื่อ \`${volName}\` ที่ส่งออก \`metadata.labels\` ไปยังไฟล์ชื่อ \`labels\` และนำไป Mount ที่พาธ \`${mountPath}\``
        ],
        hints: [
          `Use valueFrom.fieldRef.fieldPath for environment variables POD_NAME (metadata.name) and POD_IP (status.podIP).`,
          `Under volumes, use downwardAPI.items: [{ path: "labels", fieldRef: { fieldPath: "metadata.labels" } }].`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
  labels:
    tier: diagnostics
spec:
  volumes:
  - name: ${volName}
    downwardAPI:
      items:
      - path: "labels"
        fieldRef:
          fieldPath: metadata.labels
  containers:
  - name: agent
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          fieldPath: metadata.name
    - name: POD_IP
      valueFrom:
        fieldRef:
          fieldPath: status.podIP
    volumeMounts:
    - name: ${volName}
      mountPath: ${mountPath}
EOF
kubectl apply -f ~/ckad-workspace/${id}/pod.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: []
        },
        verifySpec: {
          checks: [
            {
              id: "downward-env",
              title: `Pod ${podName} injects POD_NAME (metadata.name) and POD_IP (status.podIP) via fieldRef`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Pod",
              namespace: ns,
              name: podName,
              assertions: [
                { path: "spec.containers[0].env[name=POD_NAME].valueFrom.fieldRef.fieldPath", operator: "equals", value: "metadata.name" },
                { path: "spec.containers[0].env[name=POD_IP].valueFrom.fieldRef.fieldPath", operator: "equals", value: "status.podIP" }
              ],
              failHint: `Ensure env vars POD_NAME and POD_IP use valueFrom.fieldRef.fieldPath for metadata.name and status.podIP.`
            },
            {
              id: "downward-vol",
              title: `Pod ${podName} mounts downwardAPI volume ${volName} at ${mountPath} exposing metadata.labels`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Pod",
              namespace: ns,
              name: podName,
              assertions: [
                { path: `spec.volumes[name=${volName}].downwardAPI.items[0].path`, operator: "equals", value: "labels" },
                { path: `spec.volumes[name=${volName}].downwardAPI.items[0].fieldRef.fieldPath`, operator: "equals", value: "metadata.labels" },
                { path: `spec.containers[0].volumeMounts[name=${volName}].mountPath`, operator: "equals", value: mountPath }
              ],
              failHint: `Ensure volume ${volName} uses downwardAPI projecting metadata.labels to "labels" and is mounted at ${mountPath}.`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 6. Namespace LimitRange & Default Container Constraints (Domain 4)
  // =========================================================================
  {
    archetypeId: "arch-limitrange-defaults",
    domainId: "domain-4",
    keywords: ["limitrange", "limits", "defaultrequest", "constraints", "memory", "cpu", "โควตา", "ลิมิต"],
    build(seed = 506, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-limits");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["tenant-limits-506", "sandbox-quota-617", "dev-guard-728"], seed, 1);
      const lrName = pick(["container-mem-cpu-limits", "default-resource-guard", "tenant-limitrange"], seed, 2);
      const podName = pick(["compliant-app-pod", "bounded-worker-pod", "tenant-api-pod"], seed, 3);
      const defCpu = pick(["300m", "400m"], seed, 4);
      const defMem = pick(["256Mi", "512Mi"], seed, 5);
      const reqCpu = pick(["100m", "150m"], seed, 6);
      const reqMem = pick(["128Mi", "64Mi"], seed, 7);
      const maxMem = pick(["1Gi", "2Gi"], seed, 8);
      const weight = difficulty === "hard" ? 8 : 6;

      return {
        id,
        archetypeId: "arch-limitrange-defaults",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "Namespace LimitRange & Default Container Constraints",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-4",
        domainTitle: DOMAIN_META["domain-4"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `LimitRange Container Defaults & Max Bounds (${lrName})`,
        titleTh: `กำหนด LimitRange ควบคุมค่าเริ่มต้นและเพดานสูงสุดของทรัพยากรคอนเทนเนอร์ (${lrName})`,
        weight,
        targetMinutes: 6,
        namespace: ns,
        workspaceDir: id,
        scenario: `To prevent containers without resource specifications from starving nodes in namespace \`${ns}\`, platform governance requires a \`LimitRange\` object that injects default CPU/Memory requests and limits and enforces a maximum memory ceiling.`,
        scenarioTh: `เพื่อป้องกันไม่ให้พอดที่ไม่ได้ระบุขนาดทรัพยากรแย่งใช้ Memory/CPU จนกระทบโหนดใน Namespace \`${ns}\` ให้สร้าง \`LimitRange\` เพื่อกำหนดค่าเริ่มต้นและเพดานสูงสุดของแต่ละคอนเทนเนอร์`,
        requirements: [
          `Create a \`LimitRange\` named \`${lrName}\` in namespace \`${ns}\` for \`type: Container\`.`,
          `Configure \`default\` limits to \`cpu: "${defCpu}"\` and \`memory: "${defMem}"\`.`,
          `Configure \`defaultRequest\` to \`cpu: "${reqCpu}"\` and \`memory: "${reqMem}"\`, and \`max\` memory to \`memory: "${maxMem}"\`.`,
          `Deploy a Pod named \`${podName}\` in namespace \`${ns}\` using image \`nginx:1.25-alpine\` with explicit \`resources.requests.memory: "${reqMem}"\` and \`resources.limits.memory: "${defMem}"\`.`
        ],
        requirementsTh: [
          `สร้าง \`LimitRange\` ชื่อ \`${lrName}\` ใน Namespace \`${ns}\` สำหรับ \`type: Container\``,
          `ตั้งค่า \`default\` เป็น \`cpu: "${defCpu}"\`, \`memory: "${defMem}"\``,
          `ตั้งค่า \`defaultRequest\` เป็น \`cpu: "${reqCpu}"\`, \`memory: "${reqMem}"\` และค่าสูงสุด \`max\` เป็น \`memory: "${maxMem}"\``,
          `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` ใช้อิมเมจ \`nginx:1.25-alpine\` ที่ระบุ \`requests.memory: "${reqMem}"\` และ \`limits.memory: "${defMem}"\``
        ],
        hints: [
          `LimitRange uses apiVersion: v1, kind: LimitRange, and spec.limits: [{ type: "Container", default: {...}, defaultRequest: {...}, max: {...} }].`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/limitrange.yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: ${lrName}
  namespace: ${ns}
spec:
  limits:
  - type: Container
    default:
      cpu: "${defCpu}"
      memory: "${defMem}"
    defaultRequest:
      cpu: "${reqCpu}"
      memory: "${reqMem}"
    max:
      memory: "${maxMem}"
---
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  containers:
  - name: app
    image: nginx:1.25-alpine
    resources:
      requests:
        cpu: "${reqCpu}"
        memory: "${reqMem}"
      limits:
        cpu: "${defCpu}"
        memory: "${defMem}"
EOF
kubectl apply -f ~/ckad-workspace/${id}/limitrange.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: []
        },
        verifySpec: {
          checks: [
            {
              id: "limitrange-spec",
              title: `LimitRange ${lrName} enforces default (${defCpu}/${defMem}), defaultRequest (${reqCpu}/${reqMem}), and max (${maxMem})`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "LimitRange",
              namespace: ns,
              name: lrName,
              assertions: [
                { path: "spec.limits[0].type", operator: "equals", value: "Container" },
                { path: "spec.limits[0].default.cpu", operator: "equals", value: defCpu },
                { path: "spec.limits[0].default.memory", operator: "equals", value: defMem },
                { path: "spec.limits[0].defaultRequest.cpu", operator: "equals", value: reqCpu },
                { path: "spec.limits[0].defaultRequest.memory", operator: "equals", value: reqMem },
                { path: "spec.limits[0].max.memory", operator: "equals", value: maxMem }
              ],
              failHint: `Check LimitRange ${lrName} in ${ns} for default, defaultRequest, and max fields under spec.limits[0].`
            },
            {
              id: "compliant-pod",
              title: `Pod ${podName} is Running in ${ns} with compliant memory request ${reqMem} and limit ${defMem}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Pod",
              namespace: ns,
              name: podName,
              assertions: [
                { path: "spec.containers[0].resources.requests.memory", operator: "equals", value: reqMem },
                { path: "spec.containers[0].resources.limits.memory", operator: "equals", value: defMem }
              ],
              failHint: `Ensure Pod ${podName} is created in namespace ${ns} with requests.memory=${reqMem} and limits.memory=${defMem}.`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 7. Batch Job with BackoffLimit & ActiveDeadlineSeconds (Domain 1)
  // =========================================================================
  {
    archetypeId: "arch-batch-job-parallel",
    domainId: "domain-1",
    keywords: ["job", "batch", "backofflimit", "completions", "parallelism", "activedeadlineseconds", "worker", "งานแบตช์"],
    build(seed = 507, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-job");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["batch-etl-507", "ledger-close-618", "report-gen-729"], seed, 1);
      const jobName = pick(["invoice-settlement-job", "data-sanitizer-job", "shard-reindex-job"], seed, 2);
      const completions = pick([4, 5, 6], seed, 3);
      const parallelism = pick([2, 3], seed, 4);
      const backoffLimit = pick([3, 4], seed, 5);
      const deadline = pick([90, 120, 180], seed, 6);
      const weight = difficulty === "hard" ? 7 : 6;

      return {
        id,
        archetypeId: "arch-batch-job-parallel",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "Parallel Batch Job with BackoffLimit & ActiveDeadlineSeconds",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-1",
        domainTitle: DOMAIN_META["domain-1"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `Parallel Batch Job & Execution Guards (${jobName})`,
        titleTh: `สร้าง Batch Job แบบขนานพร้อมกำหนด BackoffLimit และ ActiveDeadlineSeconds (${jobName})`,
        weight,
        targetMinutes: 5,
        namespace: ns,
        workspaceDir: id,
        scenario: `Finance operations needs a one-off parallel batch \`Job\` in namespace \`${ns}\` to process \`${completions}\` work items with bounded retries and a strict execution timeout.`,
        scenarioTh: `ทีมการเงินต้องการรัน \`Job\` ประมวลผลแบบขนานใน Namespace \`${ns}\` ให้ครบ \`${completions}\` รอบการทำงาน โดยจำกัดจำนวนครั้งที่อนุญาตให้ลองใหม่และจำกัดเวลาทำงานสูงสุด`,
        requirements: [
          `Create a \`Job\` named \`${jobName}\` in namespace \`${ns}\` using image \`busybox:1.36\` and command \`["sh", "-c", "echo Processing batch item && sleep 1"]\`.`,
          `Set \`completions: ${completions}\` and \`parallelism: ${parallelism}\`.`,
          `Set \`backoffLimit: ${backoffLimit}\`, \`activeDeadlineSeconds: ${deadline}\`, and Pod template \`restartPolicy: Never\`.`
        ],
        requirementsTh: [
          `สร้าง \`Job\` ชื่อ \`${jobName}\` ใน Namespace \`${ns}\` ใช้อิมเมจ \`busybox:1.36\` รันคำสั่ง \`["sh", "-c", "echo Processing batch item && sleep 1"]\``,
          `ตั้งค่า \`completions: ${completions}\` และ \`parallelism: ${parallelism}\``,
          `ตั้งค่า \`backoffLimit: ${backoffLimit}\`, \`activeDeadlineSeconds: ${deadline}\` และ \`restartPolicy: Never\``
        ],
        hints: [
          `In a Job resource (apiVersion: batch/v1), completions, parallelism, backoffLimit, and activeDeadlineSeconds all sit directly under spec.`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: ${jobName}
  namespace: ${ns}
spec:
  completions: ${completions}
  parallelism: ${parallelism}
  backoffLimit: ${backoffLimit}
  activeDeadlineSeconds: ${deadline}
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: worker
        image: busybox:1.36
        command: ["sh", "-c", "echo Processing batch item && sleep 1"]
EOF
kubectl apply -f ~/ckad-workspace/${id}/job.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: []
        },
        verifySpec: {
          checks: [
            {
              id: "job-parallel-counts",
              title: `Job ${jobName} sets completions=${completions} and parallelism=${parallelism}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Job",
              namespace: ns,
              name: jobName,
              assertions: [
                { path: "spec.completions", operator: "equals", value: completions },
                { path: "spec.parallelism", operator: "equals", value: parallelism }
              ],
              failHint: `Verify Job ${jobName} in ${ns} has spec.completions: ${completions} and spec.parallelism: ${parallelism}.`
            },
            {
              id: "job-guards-restart",
              title: `Job ${jobName} sets backoffLimit=${backoffLimit}, activeDeadlineSeconds=${deadline}, restartPolicy=Never`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Job",
              namespace: ns,
              name: jobName,
              assertions: [
                { path: "spec.backoffLimit", operator: "equals", value: backoffLimit },
                { path: "spec.activeDeadlineSeconds", operator: "equals", value: deadline },
                { path: "spec.template.spec.restartPolicy", operator: "equals", value: "Never" }
              ],
              failHint: `Verify backoffLimit: ${backoffLimit}, activeDeadlineSeconds: ${deadline}, and spec.template.spec.restartPolicy: Never.`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 8. Ambassador Pattern Multi-Container Proxy Pod (Domain 1)
  // =========================================================================
  {
    archetypeId: "arch-ambassador-proxy",
    domainId: "domain-1",
    keywords: ["ambassador", "proxy", "multi-container", "haproxy", "envoy", "localhost", "pattern", "แอมบาสเดอร์"],
    build(seed = 508, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-ambassador");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["proxy-mesh-508", "payment-egress-619", "partner-api-730"], seed, 1);
      const podName = pick(["payment-ambassador-pod", "partner-gateway-pod", "redis-proxy-pod"], seed, 2);
      const ambassadorName = pick(["envoy-ambassador", "haproxy-tunnel", "tls-proxy"], seed, 3);
      const cmName = `${ambassadorName}-config`;
      const volName = "proxy-config-vol";
      const mountPath = "/etc/proxy";
      const proxyPort = pick([6379, 8443, 9000], seed, 4);
      const weight = difficulty === "hard" ? 8 : 7;

      return {
        id,
        archetypeId: "arch-ambassador-proxy",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "Ambassador Pattern Multi-Container Proxy Pod",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-1",
        domainTitle: DOMAIN_META["domain-1"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `Ambassador Pattern Multi-Container Proxy Pod (${podName})`,
        titleTh: `ออกแบบพอดแบบ Ambassador Pattern แยกคอนเทนเนอร์ Proxy เชื่อมต่อภายนอก (${podName})`,
        weight,
        targetMinutes: 7,
        namespace: ns,
        workspaceDir: id,
        scenario: `In namespace \`${ns}\`, a ConfigMap named \`${cmName}\` already exists containing proxy routing rules. You must deploy a multi-container Pod named \`${podName}\` implementing the **Ambassador pattern**, where the main application container connects to \`127.0.0.1:${proxyPort}\` and an ambassador container handles outbound proxying.`,
        scenarioTh: `ใน Namespace \`${ns}\` มี ConfigMap ชื่อ \`${cmName}\` เตรียมไว้แล้ว ให้สร้างพอด \`${podName}\` ตามสถาปัตยกรรม **Ambassador Pattern** โดยให้คอนเทนเนอร์หลักเรียกผ่าน \`127.0.0.1:${proxyPort}\` และมีคอนเทนเนอร์ Ambassador คอยรับช่วงต่อ`,
        requirements: [
          `Create Pod \`${podName}\` in namespace \`${ns}\` with two containers: \`main-client\` (image \`busybox:1.36\`, command \`["sh", "-c", "sleep 3600"]\`) and \`${ambassadorName}\` (image \`nginx:1.25-alpine\`).`,
          `In container \`main-client\`, set environment variable \`UPSTREAM_PROXY\` to \`"127.0.0.1:${proxyPort}"\`.`,
          `In container \`${ambassadorName}\`, expose \`containerPort: ${proxyPort}\`.`,
          `Define a ConfigMap volume named \`${volName}\` referencing \`${cmName}\` and mount it into \`${ambassadorName}\` at \`${mountPath}\`.`
        ],
        requirementsTh: [
          `สร้างพอด \`${podName}\` ใน Namespace \`${ns}\` ที่มี 2 คอนเทนเนอร์ ได้แก่ \`main-client\` (\`busybox:1.36\`) และ \`${ambassadorName}\` (\`nginx:1.25-alpine\`)`,
          `ตั้งค่าตัวแปรสภาพแวดล้อม \`UPSTREAM_PROXY="127.0.0.1:${proxyPort}"\` ในคอนเทนเนอร์ \`main-client\``,
          `เปิดพอร์ต \`containerPort: ${proxyPort}\` ในคอนเทนเนอร์ \`${ambassadorName}\``,
          `สร้าง Volume ชื่อ \`${volName}\` จาก ConfigMap \`${cmName}\` และนำไป Mount เข้ากับคอนเทนเนอร์ \`${ambassadorName}\` ที่พาธ \`${mountPath}\``
        ],
        hints: [
          `Containers in the same Pod share the network namespace (localhost) and can mount Pod volumes independently.`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/ambassador-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  volumes:
  - name: ${volName}
    configMap:
      name: ${cmName}
  containers:
  - name: main-client
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    env:
    - name: UPSTREAM_PROXY
      value: "127.0.0.1:${proxyPort}"
  - name: ${ambassadorName}
    image: nginx:1.25-alpine
    ports:
    - containerPort: ${proxyPort}
    volumeMounts:
    - name: ${volName}
      mountPath: ${mountPath}
EOF
kubectl apply -f ~/ckad-workspace/${id}/ambassador-pod.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: [
            {
              apiVersion: "v1",
              kind: "ConfigMap",
              metadata: { name: cmName, namespace: ns },
              data: {
                "proxy.conf": `listen 127.0.0.1:${proxyPort};\nupstream external_service { server 10.100.0.50:443; }\n`
              }
            }
          ]
        },
        verifySpec: {
          checks: [
            {
              id: "main-client-env",
              title: `Container main-client sets UPSTREAM_PROXY="127.0.0.1:${proxyPort}"`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Pod",
              namespace: ns,
              name: podName,
              assertions: [
                { path: "spec.containers[name=main-client].env[name=UPSTREAM_PROXY].value", operator: "equals", value: `127.0.0.1:${proxyPort}` }
              ],
              failHint: `Ensure container main-client defines env UPSTREAM_PROXY="127.0.0.1:${proxyPort}".`
            },
            {
              id: "ambassador-container-mount",
              title: `Ambassador container ${ambassadorName} exposes port ${proxyPort} and mounts ${cmName} at ${mountPath}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Pod",
              namespace: ns,
              name: podName,
              assertions: [
                { path: `spec.containers[name=${ambassadorName}].ports[0].containerPort`, operator: "equals", value: proxyPort },
                { path: `spec.volumes[name=${volName}].configMap.name`, operator: "equals", value: cmName },
                { path: `spec.containers[name=${ambassadorName}].volumeMounts[name=${volName}].mountPath`, operator: "equals", value: mountPath }
              ],
              failHint: `Ensure container ${ambassadorName} exposes port ${proxyPort} and mounts volume ${volName} (ConfigMap ${cmName}) at ${mountPath}.`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 9. ConfigMap Single-File subPath Mount Without Overwriting Directory (Domain 4)
  // =========================================================================
  {
    archetypeId: "arch-configmap-subpath",
    domainId: "domain-4",
    keywords: ["subpath", "configmap", "single-file", "mount", "nginx", "conf.d", "directory", "ซับพาธ"],
    build(seed = 509, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-subpath");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["web-subpath-509", "gateway-conf-620", "edge-nginx-731"], seed, 1);
      const podName = pick(["edge-gateway-pod", "custom-nginx-pod", "static-router-pod"], seed, 2);
      const cmName = pick(["nginx-vhost-cm", "custom-route-cm", "gzip-tuning-cm"], seed, 3);
      const keyName = pick(["vhost.conf", "tuning.conf", "upstream.conf"], seed, 4);
      const volName = "cm-file-vol";
      const targetFileMount = `/etc/nginx/conf.d/${keyName}`;
      const weight = difficulty === "hard" ? 8 : 6;

      return {
        id,
        archetypeId: "arch-configmap-subpath",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "ConfigMap Single-File subPath Volume Mount",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-4",
        domainTitle: DOMAIN_META["domain-4"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `ConfigMap Single-File Mount via subPath (${podName})`,
        titleTh: `การ Mount เฉพาะไฟล์เดียวจาก ConfigMap ด้วย subPath โดยไม่ทับไฟล์เดิมในโฟลเดอร์ (${podName})`,
        weight,
        targetMinutes: 6,
        namespace: ns,
        workspaceDir: id,
        scenario: `Pod \`${podName}\` in namespace \`${ns}\` needs to inject a single configuration file \`${keyName}\` into \`/etc/nginx/conf.d/${keyName}\` without wiping out existing default configuration files inside \`/etc/nginx/conf.d/\`.`,
        scenarioTh: `เราต้องการนำไฟล์คอนฟิก \`${keyName}\` จาก ConfigMap ไปวางที่ \`${targetFileMount}\` ของพอด \`${podName}\` ใน Namespace \`${ns}\` โดยห้ามทำให้ไฟล์อื่นๆ ที่มีอยู่เดิมในโฟลเดอร์ \`/etc/nginx/conf.d/\` หายไป (ต้องใช้ \`subPath\`)`,
        requirements: [
          `Create a \`ConfigMap\` named \`${cmName}\` in namespace \`${ns}\` containing key \`${keyName}\` with value \`"server_tokens off;"\`.`,
          `Create or update Pod \`${podName}\` in namespace \`${ns}\` (image \`nginx:1.25-alpine\`) with a ConfigMap volume named \`${volName}\` referencing \`${cmName}\`.`,
          `Mount volume \`${volName}\` into container \`nginx\` at \`mountPath: ${targetFileMount}\` using \`subPath: ${keyName}\`.`
        ],
        requirementsTh: [
          `สร้าง \`ConfigMap\` ชื่อ \`${cmName}\` ใน Namespace \`${ns}\` ที่มีคีย์ \`${keyName}="server_tokens off;"\``,
          `สร้างพอดชื่อ \`${podName}\` ใน Namespace \`${ns}\` (อิมเมจ \`nginx:1.25-alpine\`) พร้อมกำหนด Volume ชื่อ \`${volName}\` อ้างอิง ConfigMap \`${cmName}\``,
          `ตั้งค่า \`volumeMounts\` ที่พาธ \`mountPath: ${targetFileMount}\` โดยระบุ \`subPath: ${keyName}\``
        ],
        hints: [
          `When mounting a single file from a ConfigMap into an existing directory, set mountPath to the full file path (${targetFileMount}) and subPath to the key name (${keyName}).`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
kubectl create configmap ${cmName} --from-literal=${keyName}="server_tokens off;" -n ${ns}
cat << 'EOF' > ~/ckad-workspace/${id}/pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  volumes:
  - name: ${volName}
    configMap:
      name: ${cmName}
  containers:
  - name: nginx
    image: nginx:1.25-alpine
    volumeMounts:
    - name: ${volName}
      mountPath: ${targetFileMount}
      subPath: ${keyName}
EOF
kubectl apply -f ~/ckad-workspace/${id}/pod.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: []
        },
        verifySpec: {
          checks: [
            {
              id: "cm-key-exists",
              title: `ConfigMap ${cmName} exists in ${ns} with key ${keyName}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "ConfigMap",
              namespace: ns,
              name: cmName,
              assertions: [
                { path: `data.${keyName}`, operator: "contains", value: "server_tokens off" }
              ],
              failHint: `Create ConfigMap ${cmName} in namespace ${ns} with key ${keyName}="server_tokens off;".`
            },
            {
              id: "pod-subpath-mount",
              title: `Pod ${podName} mounts ${volName} at ${targetFileMount} with subPath: ${keyName}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Pod",
              namespace: ns,
              name: podName,
              assertions: [
                { path: `spec.volumes[name=${volName}].configMap.name`, operator: "equals", value: cmName },
                { path: `spec.containers[0].volumeMounts[name=${volName}].mountPath`, operator: "equals", value: targetFileMount },
                { path: `spec.containers[0].volumeMounts[name=${volName}].subPath`, operator: "equals", value: keyName }
              ],
              failHint: `Ensure Pod ${podName} mounts volume ${volName} at mountPath: ${targetFileMount} with subPath: ${keyName}.`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 10. Troubleshooting Broken RBAC Forbidden ServiceAccount Error (Domain 4)
  // =========================================================================
  {
    archetypeId: "arch-rbac-troubleshooting",
    domainId: "domain-4",
    keywords: ["rbac", "forbidden", "serviceaccount", "role", "rolebinding", "permission", "ซ่อม rbac", "สิทธิ์"],
    build(seed = 510, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-rbac");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["rbac-audit-510", "sec-watcher-621", "config-sync-732"], seed, 1);
      const podName = pick(["config-watcher-pod", "secret-sync-pod", "endpoint-auditor-pod"], seed, 2);
      const saName = pick(["watcher-sa", "auditor-sa", "sync-agent-sa"], seed, 3);
      const roleName = pick(["watcher-role", "auditor-role", "sync-role"], seed, 4);
      const rbName = `${roleName}-binding`;
      const targetRes = pick(["configmaps", "secrets", "endpoints"], seed, 5);
      const weight = difficulty === "hard" ? 9 : 8;

      return {
        id,
        archetypeId: "arch-rbac-troubleshooting",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "Troubleshooting Broken RBAC Forbidden ServiceAccount Error",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-4",
        domainTitle: DOMAIN_META["domain-4"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `Troubleshooting RBAC Forbidden Error (${podName})`,
        titleTh: `วิเคราะห์ Log และซ่อมปัญหาสิทธิ์ RBAC Forbidden ของพอด (${podName})`,
        weight,
        targetMinutes: 7,
        namespace: ns,
        workspaceDir: id,
        scenario: `Pod \`${podName}\` in namespace \`${ns}\` is failing to synchronize cluster state. Inspect its logs (\`kubectl logs ${podName} -n ${ns}\`): it reports an RBAC \`Forbidden\` error when trying to \`get\`, \`list\`, and \`watch\` resource \`${targetRes}\`. Furthermore, the existing \`Role\`, \`RoleBinding\`, and \`Pod\` serviceAccount configuration in namespace \`${ns}\` are misconfigured.`,
        scenarioTh: `พอด \`${podName}\` ใน Namespace \`${ns}\` ทำงานผิดพลาด เมื่อตรวจสอบด้วย \`kubectl logs ${podName} -n ${ns}\` พบข้อความแจ้งเตือน \`Forbidden\` เนื่องจากไม่มีสิทธิ์ \`get\`, \`list\`, \`watch\` ทรัพยากร \`${targetRes}\` ให้ตรวจสอบและซ่อมทั้ง \`Role\`, \`RoleBinding\` และ \`serviceAccountName\` ของพอด`,
        requirements: [
          `Inspect the logs of Pod \`${podName}\` in namespace \`${ns}\` and review ServiceAccount \`${saName}\`, Role \`${roleName}\`, and RoleBinding \`${rbName}\`.`,
          `Update Role \`${roleName}\` in namespace \`${ns}\` so it grants verbs \`["get", "list", "watch"]\` on resource \`"${targetRes}"\`.`,
          `Fix RoleBinding \`${rbName}\` so its \`subjects\` reference ServiceAccount \`${saName}\` in namespace \`${ns}\`.`,
          `Recreate or update Pod \`${podName}\` so it runs with \`serviceAccountName: ${saName}\`.`
        ],
        requirementsTh: [
          `ตรวจสอบ Log ของพอด \`${podName}\` ใน Namespace \`${ns}\` และตรวจสอบ \`Role/${roleName}\` กับ \`RoleBinding/${rbName}\``,
          `แก้ไข Role \`${roleName}\` ให้มีสิทธิ์ verbs \`["get", "list", "watch"]\` บน resource \`"${targetRes}"\``,
          `แก้ไข RoleBinding \`${rbName}\` ให้ผูกเข้ากับ ServiceAccount ชื่อ \`${saName}\` ใน Namespace \`${ns}\``,
          `แก้ไขหรือสร้างพอด \`${podName}\` ใหม่ให้ใช้ \`serviceAccountName: ${saName}\``
        ],
        hints: [
          `Run kubectl logs ${podName} -n ${ns} and kubectl get role,rolebinding -n ${ns} -o yaml to see the current misconfigurations.`,
          `Role ${roleName} currently points to the wrong resource, RoleBinding ${rbName} binds to "wrong-sa", and Pod ${podName} uses "default" ServiceAccount.`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
kubectl create role ${roleName} --verb=get,list,watch --resource=${targetRes} -n ${ns} --dry-run=client -o yaml | kubectl apply -f -
kubectl create rolebinding ${rbName} --role=${roleName} --serviceaccount=${ns}:${saName} -n ${ns} --dry-run=client -o yaml | kubectl apply -f -
cat << 'EOF' > ~/ckad-workspace/${id}/pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  serviceAccountName: ${saName}
  containers:
  - name: watcher
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
EOF
kubectl delete pod ${podName} -n ${ns}
kubectl apply -f ~/ckad-workspace/${id}/pod.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: [
            {
              apiVersion: "v1",
              kind: "ServiceAccount",
              metadata: { name: saName, namespace: ns }
            },
            {
              apiVersion: "rbac.authorization.k8s.io/v1",
              kind: "Role",
              metadata: { name: roleName, namespace: ns },
              rules: [
                {
                  apiGroups: [""],
                  resources: ["pods"],
                  verbs: ["get"]
                }
              ]
            },
            {
              apiVersion: "rbac.authorization.k8s.io/v1",
              kind: "RoleBinding",
              metadata: { name: rbName, namespace: ns },
              roleRef: {
                apiGroup: "rbac.authorization.k8s.io",
                kind: "Role",
                name: roleName
              },
              subjects: [
                {
                  kind: "ServiceAccount",
                  name: "wrong-service-account",
                  namespace: ns
                }
              ]
            },
            {
              apiVersion: "v1",
              kind: "Pod",
              metadata: { name: podName, namespace: ns },
              spec: {
                serviceAccountName: "default",
                containers: [
                  {
                    name: "watcher",
                    image: "busybox:1.36",
                    command: ["sh", "-c", "sleep 3600"]
                  }
                ]
              },
              _logs: `2026-11-08T10:12:04Z ERROR k8s-client: ${targetRes} is forbidden: User "system:serviceaccount:${ns}:${saName}" cannot list resource "${targetRes}" in API group "" in the namespace "${ns}" (requires verbs: get, list, watch and serviceAccountName: ${saName})`
            }
          ]
        },
        verifySpec: {
          checks: [
            {
              id: "role-fixed",
              title: `Role ${roleName} grants get, list, watch on ${targetRes}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Role",
              namespace: ns,
              name: roleName,
              assertions: [
                { path: "rules[0].resources", operator: "contains", value: targetRes },
                { path: "rules[0].verbs", operator: "contains", value: "get" },
                { path: "rules[0].verbs", operator: "contains", value: "list" },
                { path: "rules[0].verbs", operator: "contains", value: "watch" }
              ],
              failHint: `Update Role ${roleName} so rules[0].resources includes "${targetRes}" and verbs includes get, list, watch.`
            },
            {
              id: "rb-fixed",
              title: `RoleBinding ${rbName} binds Role ${roleName} to ServiceAccount ${saName}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "RoleBinding",
              namespace: ns,
              name: rbName,
              assertions: [
                { path: "roleRef.name", operator: "equals", value: roleName },
                { path: "subjects[0].name", operator: "equals", value: saName }
              ],
              failHint: `Update RoleBinding ${rbName} so subjects[0].name is "${saName}".`
            },
            {
              id: "pod-sa-fixed",
              title: `Pod ${podName} runs with serviceAccountName: ${saName}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Pod",
              namespace: ns,
              name: podName,
              assertions: [
                { path: "spec.serviceAccountName", operator: "equals", value: saName }
              ],
              failHint: `Ensure Pod ${podName} has spec.serviceAccountName set to "${saName}".`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 11. Troubleshooting Pending Pod with Unbound PVC (Domain 1)
  // =========================================================================
  {
    archetypeId: "arch-pvc-pending-troubleshooting",
    domainId: "domain-1",
    keywords: ["pvc", "pv", "pending", "storageclass", "unbound", "storage", "volume", "ซ่อม pvc"],
    build(seed = 511, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-pvc");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["storage-fix-511", "archive-io-622", "db-mount-733"], seed, 1);
      const pvName = `pv-fast-${seed}`;
      const pvcName = pick(["db-wal-pvc", "audit-store-pvc", "upload-claim-pvc"], seed, 2);
      const podName = pick(["wal-writer-pod", "archive-worker-pod", "upload-svc-pod"], seed, 3);
      const storageClass = pick(["fast-nvme", "ssd-retain", "gold-storage"], seed, 4);
      const storageSize = pick(["2Gi", "4Gi", "5Gi"], seed, 5);
      const mountPath = pick(["/var/lib/wal", "/data/archive", "/mnt/uploads"], seed, 6);
      const weight = difficulty === "hard" ? 9 : 7;

      return {
        id,
        archetypeId: "arch-pvc-pending-troubleshooting",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "Troubleshooting Pending Pod & Unbound PVC Mismatch",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-1",
        domainTitle: DOMAIN_META["domain-1"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `Troubleshooting Unbound PVC & Pending Pod (${podName})`,
        titleTh: `แก้ปัญหาพอดค้างสถานะ Pending จาก PVC ที่จับคู่ StorageClass ไม่ตรงกับ PV (${podName})`,
        weight,
        targetMinutes: 7,
        namespace: ns,
        workspaceDir: id,
        scenario: `Pod \`${podName}\` in namespace \`${ns}\` is stuck in \`Pending\` state. A cluster-scoped \`PersistentVolume\` named \`${pvName}\` is \`Available\` with \`storageClassName: ${storageClass}\`, capacity \`${storageSize}\`, and accessMode \`ReadWriteOnce\`. However, \`PersistentVolumeClaim\` \`${pvcName}\` was created with the wrong \`storageClassName\` (\`wrong-sc\`) and wrong capacity (\`50Gi\`), and Pod \`${podName}\` has not mounted the volume at \`${mountPath}\`.`,
        scenarioTh: `พอด \`${podName}\` ใน Namespace \`${ns}\` ค้างอยู่ในสถานะ \`Pending\` เมื่อตรวจสอบพบว่ามี \`PersistentVolume\` ชื่อ \`${pvName}\` พร้อมใช้งานอยู่ (\`storageClassName: ${storageClass}\`, ขนาด \`${storageSize}\`, \`ReadWriteOnce\`) แต่ \`PersistentVolumeClaim\` ชื่อ \`${pvcName}\` กลับระบุ StorageClass และขนาดไม่ตรงกัน ให้แก้ไข PVC และพอดให้ทำงานได้สมบูรณ์`,
        requirements: [
          `Inspect \`PersistentVolume/${pvName}\` and \`PersistentVolumeClaim/${pvcName}\` in namespace \`${ns}\`.`,
          `Recreate \`PersistentVolumeClaim\` \`${pvcName}\` in namespace \`${ns}\` with \`storageClassName: ${storageClass}\`, \`accessModes: ["ReadWriteOnce"]\`, and \`resources.requests.storage: ${storageSize}\`.`,
          `Update/recreate Pod \`${podName}\` in namespace \`${ns}\` so it mounts PVC \`${pvcName}\` at \`${mountPath}\` and reaches \`Running\` state.`
        ],
        requirementsTh: [
          `ตรวจสอบ \`PersistentVolume/${pvName}\` และ \`PersistentVolumeClaim/${pvcName}\` ใน Namespace \`${ns}\``,
          `ลบและสร้าง \`PersistentVolumeClaim\` ชื่อ \`${pvcName}\` ใหม่ให้ใช้ \`storageClassName: ${storageClass}\`, \`accessModes: ["ReadWriteOnce"]\` และขนาด \`${storageSize}\``,
          `แก้ไขพอด \`${podName}\` ให้ Mount PVC \`${pvcName}\` ที่พาธ \`${mountPath}\` และอยู่ในสถานะ \`Running\``
        ],
        hints: [
          `PVC spec fields like storageClassName are immutable after creation; delete PVC ${pvcName} and recreate it matching PV ${pvName}.`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
kubectl delete pod ${podName} -n ${ns}
kubectl delete pvc ${pvcName} -n ${ns}
cat << 'EOF' > ~/ckad-workspace/${id}/fix-pvc-pod.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${pvcName}
  namespace: ${ns}
spec:
  storageClassName: ${storageClass}
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: ${storageSize}
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
  - name: writer
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    volumeMounts:
    - name: data-vol
      mountPath: ${mountPath}
EOF
kubectl apply -f ~/ckad-workspace/${id}/fix-pvc-pod.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: [
            {
              apiVersion: "v1",
              kind: "PersistentVolume",
              metadata: { name: pvName },
              spec: {
                storageClassName: storageClass,
                capacity: { storage: storageSize },
                accessModes: ["ReadWriteOnce"],
                hostPath: { path: `/mnt/data/${pvName}` }
              },
              status: { phase: "Available" }
            },
            {
              apiVersion: "v1",
              kind: "PersistentVolumeClaim",
              metadata: { name: pvcName, namespace: ns },
              spec: {
                storageClassName: "wrong-archive-sc",
                accessModes: ["ReadWriteMany"],
                resources: { requests: { storage: "50Gi" } }
              },
              status: { phase: "Pending" }
            },
            {
              apiVersion: "v1",
              kind: "Pod",
              metadata: { name: podName, namespace: ns },
              spec: {
                containers: [
                  {
                    name: "writer",
                    image: "busybox:1.36",
                    command: ["sh", "-c", "sleep 3600"]
                  }
                ]
              },
              status: {
                phase: "Pending",
                containerStatuses: [
                  {
                    name: "writer",
                    ready: false,
                    restartCount: 0,
                    state: { waiting: { reason: "ContainerCreating", message: `persistentvolumeclaim "${pvcName}" is not bound` } }
                  }
                ]
              }
            }
          ]
        },
        verifySpec: {
          checks: [
            {
              id: "pvc-bound-spec",
              title: `PVC ${pvcName} uses storageClassName=${storageClass}, ReadWriteOnce, and storage=${storageSize}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "PersistentVolumeClaim",
              namespace: ns,
              name: pvcName,
              assertions: [
                { path: "spec.storageClassName", operator: "equals", value: storageClass },
                { path: "spec.resources.requests.storage", operator: "equals", value: storageSize },
                { path: "spec.accessModes", operator: "contains", value: "ReadWriteOnce" }
              ],
              failHint: `Ensure PVC ${pvcName} has storageClassName: ${storageClass}, storage: ${storageSize}, and ReadWriteOnce.`
            },
            {
              id: "pod-running-mounted",
              title: `Pod ${podName} is Running and mounts PVC ${pvcName} at ${mountPath}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Pod",
              namespace: ns,
              name: podName,
              assertions: [
                { path: "status.phase", operator: "equals", value: "Running" },
                { path: "spec.volumes[0].persistentVolumeClaim.claimName", operator: "equals", value: pvcName },
                { path: "spec.containers[0].volumeMounts[0].mountPath", operator: "equals", value: mountPath }
              ],
              failHint: `Ensure Pod ${podName} is Running and mounts claimName ${pvcName} at ${mountPath}.`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 12. Zero-Trust Combined Ingress & Egress NetworkPolicy (DNS Port 53 + API Port) (Domain 5)
  // =========================================================================
  {
    archetypeId: "arch-netpol-egress-dns",
    domainId: "domain-5",
    keywords: ["netpol", "networkpolicy", "egress", "dns", "53", "zero-trust", "firewall", "เครือข่าย"],
    build(seed = 512, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-netpol");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["zero-trust-512", "pci-zone-623", "banking-sec-734"], seed, 1);
      const polName = pick(["zero-trust-order-netpol", "pci-api-isolation", "strict-payment-netpol"], seed, 2);
      const targetApp = pick(["order-api", "payment-core", "settlement-svc"], seed, 3);
      const allowedIngressTier = pick(["frontend-gateway", "edge-ingress", "public-web"], seed, 4);
      const allowedEgressTier = pick(["postgres-db", "ledger-vault", "redis-store"], seed, 5);
      const appPort = pick([8080, 8443, 3000], seed, 6);
      const dbPort = pick([5432, 6379, 3306], seed, 7);
      const weight = difficulty === "hard" ? 9 : 8;

      return {
        id,
        archetypeId: "arch-netpol-egress-dns",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "Zero-Trust Ingress & Egress NetworkPolicy with DNS Port 53",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-5",
        domainTitle: DOMAIN_META["domain-5"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `Combined Ingress & Egress NetworkPolicy with DNS (${polName})`,
        titleTh: `สร้าง NetworkPolicy ควบคุมทั้ง Ingress, Egress และการคิวรี DNS พอร์ต 53 (${polName})`,
        weight,
        targetMinutes: 8,
        namespace: ns,
        workspaceDir: id,
        scenario: `Security compliance in namespace \`${ns}\` mandates a strict zero-trust \`NetworkPolicy\` governing both incoming and outgoing traffic for Pods labeled \`app: ${targetApp}\`, while still permitting CoreDNS resolution on port \`53\`.`,
        scenarioTh: `มาตรฐานความปลอดภัยใน Namespace \`${ns}\` กำหนดให้สร้าง \`NetworkPolicy\` ที่ควบคุมทั้งทราฟฟิกขาเข้า (\`Ingress\`) และขาออก (\`Egress\`) ของพอดที่มีเลเบล \`app: ${targetApp}\` พร้อมอนุญาตให้เรียกใช้งาน DNS ที่พอร์ต \`53\` ได้`,
        requirements: [
          `Create a \`NetworkPolicy\` named \`${polName}\` in namespace \`${ns}\` targeting Pods with \`podSelector.matchLabels.app: ${targetApp}\`.`,
          `Specify \`policyTypes: ["Ingress", "Egress"]\`.`,
          `Allow \`ingress\` only from Pods with label \`tier: ${allowedIngressTier}\` on TCP port \`${appPort}\`.`,
          `Allow \`egress\` to Pods with label \`tier: ${allowedEgressTier}\` on TCP port \`${dbPort}\`, AND allow DNS egress on port \`53\` (UDP and TCP).`
        ],
        requirementsTh: [
          `สร้าง \`NetworkPolicy\` ชื่อ \`${polName}\` ใน Namespace \`${ns}\` สำหรับพอดที่มีเลเบล \`app: ${targetApp}\``,
          `ระบุ \`policyTypes: ["Ingress", "Egress"]\``,
          `อนุญาต \`ingress\` เฉพาะจากพอดที่มีเลเบล \`tier: ${allowedIngressTier}\` บนพอร์ต TCP \`${appPort}\``,
          `อนุญาต \`egress\` ไปยังพอดที่มีเลเบล \`tier: ${allowedEgressTier}\` บนพอร์ต TCP \`${dbPort}\` และอนุญาต DNS ขาออกที่พอร์ต \`53\` (UDP/TCP)`
        ],
        hints: [
          `Include two egress rules (or ports): one targeting podSelector tier=${allowedEgressTier} on port ${dbPort}, and one allowing port 53 for UDP/TCP.`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/netpol.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${polName}
  namespace: ${ns}
spec:
  podSelector:
    matchLabels:
      app: ${targetApp}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: ${allowedIngressTier}
    ports:
    - protocol: TCP
      port: ${appPort}
  egress:
  - to:
    - podSelector:
        matchLabels:
          tier: ${allowedEgressTier}
    ports:
    - protocol: TCP
      port: ${dbPort}
  - ports:
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53
EOF
kubectl apply -f ~/ckad-workspace/${id}/netpol.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: []
        },
        verifySpec: {
          checks: [
            {
              id: "netpol-selector-types",
              title: `NetworkPolicy ${polName} selects app=${targetApp} with policyTypes Ingress & Egress`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "NetworkPolicy",
              namespace: ns,
              name: polName,
              assertions: [
                { path: "spec.podSelector.matchLabels.app", operator: "equals", value: targetApp },
                { path: "spec.policyTypes", operator: "contains", value: "Ingress" },
                { path: "spec.policyTypes", operator: "contains", value: "Egress" }
              ],
              failHint: `Ensure NetworkPolicy ${polName} selects app=${targetApp} and includes both Ingress and Egress in policyTypes.`
            },
            {
              id: "netpol-ingress-rule",
              title: `Ingress allows tier=${allowedIngressTier} on TCP port ${appPort}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "NetworkPolicy",
              namespace: ns,
              name: polName,
              assertions: [
                { path: "spec.ingress[0].from[0].podSelector.matchLabels.tier", operator: "equals", value: allowedIngressTier },
                { path: "spec.ingress[0].ports[0].port", operator: "equals", value: appPort }
              ],
              failHint: `Check spec.ingress[0] for podSelector tier=${allowedIngressTier} and port=${appPort}.`
            },
            {
              id: "netpol-egress-dns",
              title: `Egress allows tier=${allowedEgressTier} on port ${dbPort} and DNS port 53`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "NetworkPolicy",
              namespace: ns,
              name: polName,
              assertions: [
                { path: "spec.egress[0].to[0].podSelector.matchLabels.tier", operator: "equals", value: allowedEgressTier },
                { path: "spec.egress[0].ports[0].port", operator: "equals", value: dbPort },
                { path: "spec.egress[*].ports[*].port", operator: "contains", value: 53 }
              ],
              failHint: `Ensure spec.egress allows podSelector tier=${allowedEgressTier} on port ${dbPort} and DNS port 53.`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 13. StartupProbe + LivenessProbe for Slow-Starting Legacy Application (Domain 3)
  // =========================================================================
  {
    archetypeId: "arch-startup-liveness-probe",
    domainId: "domain-3",
    keywords: ["startupprobe", "livenessprobe", "probe", "slow", "legacy", "healthz", "โพรบ", "เช็คสุขภาพ"],
    build(seed = 513, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-probe");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["legacy-boot-513", "erp-core-624", "jvm-warmup-735"], seed, 1);
      const deployName = pick(["legacy-erp-api", "jvm-billing-engine", "monolith-core"], seed, 2);
      const port = pick([8080, 8085, 9090], seed, 3);
      const healthPath = pick(["/healthz", "/actuator/health", "/api/ready"], seed, 4);
      const failureThreshold = pick([30, 24], seed, 5);
      const periodSeconds = pick([5, 10], seed, 6);
      const weight = difficulty === "hard" ? 8 : 7;

      return {
        id,
        archetypeId: "arch-startup-liveness-probe",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "StartupProbe + LivenessProbe for Slow-Starting Application",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-3",
        domainTitle: DOMAIN_META["domain-3"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `StartupProbe & LivenessProbe Repair (${deployName})`,
        titleTh: `แก้ไข LivenessProbe และเพิ่ม StartupProbe สำหรับแอปพลิเคชันที่บูตช้า (${deployName})`,
        weight,
        targetMinutes: 6,
        namespace: ns,
        workspaceDir: id,
        scenario: `Deployment \`${deployName}\` in namespace \`${ns}\` runs a slow-starting JVM service listening on port \`${port}\` at path \`${healthPath}\`. Currently, its \`livenessProbe\` points to the wrong port (\`9999\`) and kills the container before initialization finishes.`,
        scenarioTh: `Deployment \`${deployName}\` ใน Namespace \`${ns}\` ใช้เวลาบูตระบบนานและเปิดพอร์ตจริงที่ \`${port}\` พาธ \`${healthPath}\` แต่ปัจจุบัน \`livenessProbe\` ตั้งพอร์ตผิดเป็น \`9999\` และยังไม่มี \`startupProbe\` ทำให้คอนเทนเนอร์ถูกสั่งรีสตาร์ทก่อนบูตเสร็จ`,
        requirements: [
          `Update Deployment \`${deployName}\` in namespace \`${ns}\` to add an HTTP \`startupProbe\` on container \`app\` checking \`path: ${healthPath}\` and \`port: ${port}\`.`,
          `Configure the \`startupProbe\` with \`failureThreshold: ${failureThreshold}\` and \`periodSeconds: ${periodSeconds}\`.`,
          `Fix the existing HTTP \`livenessProbe\` on container \`app\` so it checks \`path: ${healthPath}\` on \`port: ${port}\` with \`periodSeconds: 10\`.`
        ],
        requirementsTh: [
          `อัปเดต Deployment \`${deployName}\` ใน Namespace \`${ns}\` โดยเพิ่ม \`startupProbe\` แบบ \`httpGet\` ที่ \`path: ${healthPath}\` และ \`port: ${port}\``,
          `ตั้งค่า \`startupProbe\` ให้มี \`failureThreshold: ${failureThreshold}\` และ \`periodSeconds: ${periodSeconds}\``,
          `แก้ไข \`livenessProbe\` เดิมให้เช็คที่ \`path: ${healthPath}\` บนพอร์ต \`${port}\` (\`periodSeconds: 10\`)`
        ],
        hints: [
          `Kubernetes disables livenessProbe and readinessProbe until startupProbe succeeds for the first time.`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/deploy-probes.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${deployName}
  namespace: ${ns}
spec:
  replicas: 1
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
        ports:
        - containerPort: ${port}
        startupProbe:
          httpGet:
            path: ${healthPath}
            port: ${port}
          failureThreshold: ${failureThreshold}
          periodSeconds: ${periodSeconds}
        livenessProbe:
          httpGet:
            path: ${healthPath}
            port: ${port}
          periodSeconds: 10
EOF
kubectl apply -f ~/ckad-workspace/${id}/deploy-probes.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: [
            {
              apiVersion: "apps/v1",
              kind: "Deployment",
              metadata: { name: deployName, namespace: ns },
              spec: {
                replicas: 1,
                selector: { matchLabels: { app: deployName } },
                template: {
                  metadata: { labels: { app: deployName } },
                  spec: {
                    containers: [
                      {
                        name: "app",
                        image: "nginx:1.25-alpine",
                        ports: [{ containerPort: port }],
                        livenessProbe: {
                          httpGet: { path: healthPath, port: 9999 },
                          periodSeconds: 5
                        }
                      }
                    ]
                  }
                }
              }
            }
          ]
        },
        verifySpec: {
          checks: [
            {
              id: "startup-probe-http",
              title: `Deployment ${deployName} defines startupProbe on ${healthPath}:${port}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Deployment",
              namespace: ns,
              name: deployName,
              assertions: [
                { path: "spec.template.spec.containers[0].startupProbe.httpGet.path", operator: "equals", value: healthPath },
                { path: "spec.template.spec.containers[0].startupProbe.httpGet.port", operator: "equals", value: port }
              ],
              failHint: `Ensure startupProbe.httpGet checks path ${healthPath} and port ${port}.`
            },
            {
              id: "startup-probe-thresholds",
              title: `startupProbe sets failureThreshold=${failureThreshold} and periodSeconds=${periodSeconds}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Deployment",
              namespace: ns,
              name: deployName,
              assertions: [
                { path: "spec.template.spec.containers[0].startupProbe.failureThreshold", operator: "equals", value: failureThreshold },
                { path: "spec.template.spec.containers[0].startupProbe.periodSeconds", operator: "equals", value: periodSeconds }
              ],
              failHint: `Ensure startupProbe sets failureThreshold: ${failureThreshold} and periodSeconds: ${periodSeconds}.`
            },
            {
              id: "liveness-probe-fixed",
              title: `livenessProbe is fixed to check port ${port} on path ${healthPath}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Deployment",
              namespace: ns,
              name: deployName,
              assertions: [
                { path: "spec.template.spec.containers[0].livenessProbe.httpGet.port", operator: "equals", value: port },
                { path: "spec.template.spec.containers[0].livenessProbe.httpGet.path", operator: "equals", value: healthPath }
              ],
              failHint: `Fix livenessProbe.httpGet.port to ${port} (it was 9999).`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 14. Multi-Service Ingress Routing & Broken Backend Port Debugging (Domain 5)
  // =========================================================================
  {
    archetypeId: "arch-ingress-service-debug",
    domainId: "domain-5",
    keywords: ["ingress", "service", "routing", "path", "backend", "targetport", "503", "ซ่อม ingress"],
    build(seed = 514, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-ingress");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["edge-routing-514", "shop-ingress-625", "api-gateway-736"], seed, 1);
      const ingName = pick(["shop-main-ingress", "platform-edge-ingress", "api-router-ingress"], seed, 2);
      const host = pick(["shop.kubemastery.io", "api.ckad-exam.local", "portal.cloud.internal"], seed, 3);
      const svcName = pick(["catalog-svc", "orders-svc", "checkout-svc"], seed, 4);
      const appLabel = pick(["catalog-v2", "orders-v2", "checkout-v2"], seed, 5);
      const svcPort = pick([80, 8080], seed, 6);
      const containerPort = pick([3000, 5000, 8081], seed, 7);
      const routePath = pick(["/api", "/v2", "/catalog"], seed, 8);
      const weight = difficulty === "hard" ? 9 : 8;

      return {
        id,
        archetypeId: "arch-ingress-service-debug",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "Ingress Routing & Broken Service Port Troubleshooting",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-5",
        domainTitle: DOMAIN_META["domain-5"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `Troubleshooting 503 Ingress & Service Mismatch (${ingName})`,
        titleTh: `ซ่อมปัญหา 503 Service Unavailable จาก Ingress และ Service ชี้พอร์ต/Selector ผิด (${ingName})`,
        weight,
        targetMinutes: 7,
        namespace: ns,
        workspaceDir: id,
        scenario: `Requests to \`http://${host}${routePath}\` in namespace \`${ns}\` return \`503 Service Unavailable\`. Backend Pods run with label \`app: ${appLabel}\` listening on containerPort \`${containerPort}\`, but both \`Service/${svcName}\` and \`Ingress/${ingName}\` have misconfigured selectors and ports.`,
        scenarioTh: `ผู้ใช้งานเรียก \`http://${host}${routePath}\` ใน Namespace \`${ns}\` แล้วเกิดข้อผิดพลาด \`503 Service Unavailable\` โดยพอดเบื้องหลังมีเลเบล \`app: ${appLabel}\` และเปิดพอร์ต \`${containerPort}\` ให้ตรวจสอบและซ่อมทั้ง \`Service/${svcName}\` และ \`Ingress/${ingName}\``,
        requirements: [
          `Fix \`Service\` \`${svcName}\` in namespace \`${ns}\` so its selector is \`app: ${appLabel}\`, \`port: ${svcPort}\`, and \`targetPort: ${containerPort}\`.`,
          `Fix \`Ingress\` \`${ingName}\` in namespace \`${ns}\` (\`ingressClassName: nginx\`) so host \`${host}\` routes path \`${routePath}\` (\`pathType: Prefix\`) to backend service \`${svcName}\` on port \`${svcPort}\`.`
        ],
        requirementsTh: [
          `แก้ไข \`Service\` ชื่อ \`${svcName}\` ใน Namespace \`${ns}\` ให้มี selector \`app: ${appLabel}\`, \`port: ${svcPort}\` และ \`targetPort: ${containerPort}\``,
          `แก้ไข \`Ingress\` ชื่อ \`${ingName}\` ใน Namespace \`${ns}\` (\`ingressClassName: nginx\`) ให้โฮสต์ \`${host}\` พาธ \`${routePath}\` (\`Prefix\`) ชี้ไปยังเซอร์วิส \`${svcName}\` ที่พอร์ต \`${svcPort}\``
        ],
        hints: [
          `Compare kubectl get pods --show-labels -n ${ns} with kubectl get svc ${svcName} -n ${ns} -o yaml and kubectl get ingress ${ingName} -n ${ns} -o yaml.`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/fix-network.yaml
apiVersion: v1
kind: Service
metadata:
  name: ${svcName}
  namespace: ${ns}
spec:
  selector:
    app: ${appLabel}
  ports:
  - port: ${svcPort}
    targetPort: ${containerPort}
    protocol: TCP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${ingName}
  namespace: ${ns}
spec:
  ingressClassName: nginx
  rules:
  - host: ${host}
    http:
      paths:
      - path: ${routePath}
        pathType: Prefix
        backend:
          service:
            name: ${svcName}
            port:
              number: ${svcPort}
EOF
kubectl apply -f ~/ckad-workspace/${id}/fix-network.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: [
            {
              apiVersion: "v1",
              kind: "Pod",
              metadata: { name: `${appLabel}-pod-1`, namespace: ns, labels: { app: appLabel } },
              spec: {
                containers: [{ name: "api", image: "nginx:1.25-alpine", ports: [{ containerPort }] }]
              }
            },
            {
              apiVersion: "v1",
              kind: "Service",
              metadata: { name: svcName, namespace: ns },
              spec: {
                selector: { app: "wrong-legacy-label" },
                ports: [{ port: svcPort, targetPort: 9999, protocol: "TCP" }]
              }
            },
            {
              apiVersion: "networking.k8s.io/v1",
              kind: "Ingress",
              metadata: { name: ingName, namespace: ns },
              spec: {
                ingressClassName: "nginx",
                rules: [
                  {
                    host,
                    http: {
                      paths: [
                        {
                          path: routePath,
                          pathType: "Prefix",
                          backend: {
                            service: { name: "nonexistent-svc", port: { number: 9090 } }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        },
        verifySpec: {
          checks: [
            {
              id: "svc-fixed",
              title: `Service ${svcName} selects app=${appLabel} and maps port ${svcPort} -> targetPort ${containerPort}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Service",
              namespace: ns,
              name: svcName,
              assertions: [
                { path: "spec.selector.app", operator: "equals", value: appLabel },
                { path: "spec.ports[0].port", operator: "equals", value: svcPort },
                { path: "spec.ports[0].targetPort", operator: "equals", value: containerPort }
              ],
              failHint: `Fix Service ${svcName}: selector.app=${appLabel}, ports[0].port=${svcPort}, ports[0].targetPort=${containerPort}.`
            },
            {
              id: "ingress-fixed",
              title: `Ingress ${ingName} routes ${host}${routePath} to ${svcName}:${svcPort}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Ingress",
              namespace: ns,
              name: ingName,
              assertions: [
                { path: `spec.rules[host=${host}].http.paths[0].path`, operator: "equals", value: routePath },
                { path: `spec.rules[host=${host}].http.paths[0].backend.service.name`, operator: "equals", value: svcName },
                { path: `spec.rules[host=${host}].http.paths[0].backend.service.port.number`, operator: "equals", value: svcPort }
              ],
              failHint: `Update Ingress ${ingName} so host ${host} path ${routePath} routes to service ${svcName} port ${svcPort}.`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 15. Immutable ConfigMap & Secret Environment Variable Refactoring (Domain 4)
  // =========================================================================
  {
    archetypeId: "arch-immutable-secret-config",
    domainId: "domain-4",
    keywords: ["immutable", "secret", "configmap", "secretkeyref", "configmapkeyref", "security", "ความลับ"],
    build(seed = 515, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-immutable");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["vault-app-515", "fintech-sec-626", "token-guard-737"], seed, 1);
      const deployName = pick(["billing-worker", "token-signer", "payout-engine"], seed, 2);
      const cmName = `${deployName}-cm`;
      const secName = `${deployName}-secret`;
      const cmKey = "EXEC_REGION";
      const cmVal = pick(["ap-southeast-1", "eu-central-1", "us-east-1"], seed, 3);
      const secKey = "API_SIGNING_KEY";
      const secVal = pick(["sk-live-99482a", "tok-prod-7731b", "key-sec-5519c"], seed, 4);
      const weight = difficulty === "hard" ? 8 : 7;

      return {
        id,
        archetypeId: "arch-immutable-secret-config",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "Immutable ConfigMap & Secret Environment Variable Refactoring",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-4",
        domainTitle: DOMAIN_META["domain-4"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `Immutable ConfigMap/Secret & KeyRef Injection (${deployName})`,
        titleTh: `สร้าง Immutable ConfigMap และ Secret พร้อมฉีดค่าเข้า Deployment แบบระบุคีย์ (${deployName})`,
        weight,
        targetMinutes: 7,
        namespace: ns,
        workspaceDir: id,
        scenario: `To protect against accidental configuration drift and reduce kube-apiserver watch load in namespace \`${ns}\`, security requires creating an **immutable** \`ConfigMap\` and an **immutable** \`Secret\`, and refactoring Deployment \`${deployName}\` to consume them via \`configMapKeyRef\` and \`secretKeyRef\`.`,
        scenarioTh: `เพื่อป้องกันการแก้ไขค่าคอนฟิกโดยไม่ตั้งใจใน Namespace \`${ns}\` ให้สร้าง \`ConfigMap\` และ \`Secret\` ที่ตั้งค่า \`immutable: true\` แล้วแก้ไข Deployment \`${deployName}\` ให้ดึงค่าผ่าน \`configMapKeyRef\` และ \`secretKeyRef\``,
        requirements: [
          `Create an immutable \`ConfigMap\` named \`${cmName}\` in namespace \`${ns}\` with \`immutable: true\` and data \`${cmKey}: "${cmVal}"\`.`,
          `Create an immutable \`Secret\` named \`${secName}\` in namespace \`${ns}\` with \`immutable: true\` and key \`${secKey}\` set to \`"${secVal}"\`.`,
          `Update Deployment \`${deployName}\` in namespace \`${ns}\` so container \`app\` injects env var \`APP_REGION\` from \`${cmName}\` (key \`${cmKey}\`) and env var \`SIGNING_SECRET\` from \`${secName}\` (key \`${secKey}\`).`
        ],
        requirementsTh: [
          `สร้าง \`ConfigMap\` ชื่อ \`${cmName}\` ใน Namespace \`${ns}\` โดยระบุ \`immutable: true\` และข้อมูล \`${cmKey}: "${cmVal}"\``,
          `สร้าง \`Secret\` ชื่อ \`${secName}\` ใน Namespace \`${ns}\` โดยระบุ \`immutable: true\` และคีย์ \`${secKey}: "${secVal}"\``,
          `อัปเดต Deployment \`${deployName}\` ให้คอนเทนเนอร์ \`app\` ดึงตัวแปร \`APP_REGION\` จาก \`${cmName}/${cmKey}\` (\`configMapKeyRef\`) และ \`SIGNING_SECRET\` จาก \`${secName}/${secKey}\` (\`secretKeyRef\`)`
        ],
        hints: [
          `Add immutable: true at the root level of both ConfigMap and Secret YAML manifests.`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/immutable-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${cmName}
  namespace: ${ns}
immutable: true
data:
  ${cmKey}: "${cmVal}"
---
apiVersion: v1
kind: Secret
metadata:
  name: ${secName}
  namespace: ${ns}
immutable: true
type: Opaque
stringData:
  ${secKey}: "${secVal}"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${deployName}
  namespace: ${ns}
spec:
  replicas: 1
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
        env:
        - name: APP_REGION
          valueFrom:
            configMapKeyRef:
              name: ${cmName}
              key: ${cmKey}
        - name: SIGNING_SECRET
          valueFrom:
            secretKeyRef:
              name: ${secName}
              key: ${secKey}
EOF
kubectl apply -f ~/ckad-workspace/${id}/immutable-config.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: [
            {
              apiVersion: "apps/v1",
              kind: "Deployment",
              metadata: { name: deployName, namespace: ns },
              spec: {
                replicas: 1,
                selector: { matchLabels: { app: deployName } },
                template: {
                  metadata: { labels: { app: deployName } },
                  spec: {
                    containers: [
                      {
                        name: "app",
                        image: "nginx:1.25-alpine",
                        env: [{ name: "APP_REGION", value: "hardcoded" }]
                      }
                    ]
                  }
                }
              }
            }
          ]
        },
        verifySpec: {
          checks: [
            {
              id: "cm-immutable",
              title: `ConfigMap ${cmName} has immutable: true and ${cmKey}=${cmVal}`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "ConfigMap",
              namespace: ns,
              name: cmName,
              assertions: [
                { path: "immutable", operator: "equals", value: true },
                { path: `data.${cmKey}`, operator: "equals", value: cmVal }
              ],
              failHint: `Ensure ConfigMap ${cmName} has immutable: true and data.${cmKey}="${cmVal}".`
            },
            {
              id: "secret-immutable",
              title: `Secret ${secName} has immutable: true`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Secret",
              namespace: ns,
              name: secName,
              assertions: [
                { path: "immutable", operator: "equals", value: true }
              ],
              failHint: `Ensure Secret ${secName} has immutable: true.`
            },
            {
              id: "deploy-keyrefs",
              title: `Deployment ${deployName} maps APP_REGION and SIGNING_SECRET via KeyRefs`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Deployment",
              namespace: ns,
              name: deployName,
              assertions: [
                { path: "spec.template.spec.containers[0].env[name=APP_REGION].valueFrom.configMapKeyRef.name", operator: "equals", value: cmName },
                { path: "spec.template.spec.containers[0].env[name=APP_REGION].valueFrom.configMapKeyRef.key", operator: "equals", value: cmKey },
                { path: "spec.template.spec.containers[0].env[name=SIGNING_SECRET].valueFrom.secretKeyRef.name", operator: "equals", value: secName },
                { path: "spec.template.spec.containers[0].env[name=SIGNING_SECRET].valueFrom.secretKeyRef.key", operator: "equals", value: secKey }
              ],
              failHint: `Ensure Deployment ${deployName} uses configMapKeyRef (${cmName}/${cmKey}) and secretKeyRef (${secName}/${secKey}).`
            }
          ]
        }
      };
    }
  },

  // =========================================================================
  // 16. Troubleshooting CrashLoopBackOff Missing Env & Command Exit (Domain 3)
  // =========================================================================
  {
    archetypeId: "arch-crashloop-env-troubleshooting",
    domainId: "domain-3",
    keywords: ["crashloopbackoff", "logs", "troubleshoot", "debug", "exit", "observability", "ซ่อม pod", "แก้พอดพัง"],
    build(seed = 516, difficulty = "standard", customPrompt = "") {
      const id = makeUniqueId("ai-debug");
      const contextCluster = pick(["k8s-c1-H", "k8s-c2-AC", "k8s-c3-CCC"], seed, 0);
      const ns = pick(["ops-rescue-516", "payments-debug-627", "worker-crash-738"], seed, 1);
      const podName = pick(["settlement-daemon-pod", "fraud-detector-pod", "queue-consumer-pod"], seed, 2);
      const reqEnvKey = pick(["QUEUE_DSN", "LEDGER_ENDPOINT", "KAFKA_BROKERS"], seed, 3);
      const reqEnvVal = pick(["redis://10.96.0.10:6379", "https://ledger.internal:8443", "kafka.svc:9092"], seed, 4);
      const weight = difficulty === "hard" ? 8 : 6;

      return {
        id,
        archetypeId: "arch-crashloop-env-troubleshooting",
        aiGenerated: true,
        aiEngine: "KubeMastery Compositional AI",
        aiDifficulty: difficulty,
        aiPromptUsed: customPrompt || "Troubleshooting CrashLoopBackOff Missing Env & Command Typo",
        createdAt: new Date().toISOString(),
        seed,
        domainId: "domain-3",
        domainTitle: DOMAIN_META["domain-3"].title,
        contextCluster,
        contextCommand: `kubectl config use-context ${contextCluster}`,
        title: `Diagnosing CrashLoopBackOff Logs & Missing Env (${podName})`,
        titleTh: `วิเคราะห์ Log แก้ปัญหาพอดติด CrashLoopBackOff จากคำสั่งผิดและขาดตัวแปร Env (${podName})`,
        weight,
        targetMinutes: 5,
        namespace: ns,
        workspaceDir: id,
        scenario: `Pod \`${podName}\` in namespace \`${ns}\` is crashing with \`CrashLoopBackOff\`. Check its logs (\`kubectl logs ${podName} -n ${ns}\`) and inspect its specification: the startup command has a typo (\`sllep 3600\`) and required environment variable \`${reqEnvKey}\` is missing.`,
        scenarioTh: `พอด \`${podName}\` ใน Namespace \`${ns}\` ติดสถานะ \`CrashLoopBackOff\` ให้ตรวจสอบสาเหตุจาก \`kubectl logs ${podName} -n ${ns}\` แล้วซ่อมทั้งคำสั่งที่พิมพ์ผิด (\`sllep\`) และเพิ่มตัวแปรสภาพแวดล้อมที่ขาดหายไป`,
        requirements: [
          `Inspect the logs and YAML definition of Pod \`${podName}\` in namespace \`${ns}\`.`,
          `Fix the container command so it runs \`["sh", "-c", "echo Connected && sleep 3600"]\` (replacing \`sllep\`).`,
          `Set environment variable \`${reqEnvKey}\` to \`"${reqEnvVal}"\` on the container and ensure Pod \`${podName}\` is \`Running\`.`
        ],
        requirementsTh: [
          `ตรวจสอบ Log และสเปกของพอด \`${podName}\` ใน Namespace \`${ns}\``,
          `แก้ไขคำสั่งจาก \`sllep 3600\` เป็น \`["sh", "-c", "echo Connected && sleep 3600"]\``,
          `เพิ่มตัวแปรสภาพแวดล้อม \`${reqEnvKey}="${reqEnvVal}"\` และตรวจสอบว่าพอดอยู่ในสถานะ \`Running\``
        ],
        hints: [
          `Export the Pod YAML with kubectl get pod ${podName} -n ${ns} -o yaml > ~/ckad-workspace/${id}/pod.yaml, edit it, delete the broken Pod, and apply.`
        ],
        solutionCommands: `kubectl config use-context ${contextCluster}
cat << 'EOF' > ~/ckad-workspace/${id}/pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ${podName}
  namespace: ${ns}
spec:
  containers:
  - name: daemon
    image: busybox:1.36
    command: ["sh", "-c", "echo Connected && sleep 3600"]
    env:
    - name: ${reqEnvKey}
      value: "${reqEnvVal}"
EOF
kubectl delete pod ${podName} -n ${ns}
kubectl apply -f ~/ckad-workspace/${id}/pod.yaml`,
        setupSpec: {
          namespaces: [ns],
          files: {},
          resources: [
            {
              apiVersion: "v1",
              kind: "Pod",
              metadata: { name: podName, namespace: ns },
              spec: {
                containers: [
                  {
                    name: "daemon",
                    image: "busybox:1.36",
                    command: ["sh", "-c", "echo Starting && sllep 3600"]
                  }
                ]
              },
              status: {
                phase: "Running",
                containerStatuses: [
                  {
                    name: "daemon",
                    ready: false,
                    restartCount: 4,
                    state: { waiting: { reason: "CrashLoopBackOff", message: "back-off 40s restarting failed container" } }
                  }
                ]
              },
              _logs: `2026-11-08T11:00:01Z FATAL config: missing required environment variable ${reqEnvKey} (expected "${reqEnvVal}")\nsh: sllep: not found`
            }
          ]
        },
        verifySpec: {
          checks: [
            {
              id: "pod-running",
              title: `Pod ${podName} is Running and ready without CrashLoopBackOff`,
              type: "k8s-resource",
              kind: "Pod",
              namespace: ns,
              name: podName,
              expect: { statusPhase: "Running" },
              failHint: `Ensure Pod ${podName} is recreated without command typos so it reaches Running state.`
            },
            {
              id: "pod-env-cmd-fixed",
              title: `Container sets ${reqEnvKey}="${reqEnvVal}" and fixes sleep command`,
              type: "k8s-field",
              rule: "genericK8sCheck",
              kind: "Pod",
              namespace: ns,
              name: podName,
              assertions: [
                { path: `spec.containers[0].env[name=${reqEnvKey}].value`, operator: "equals", value: reqEnvVal },
                { path: "spec.containers[0].command", operator: "contains", value: "sleep 3600" },
                { path: "spec.containers[0].command", operator: "notContains", value: "sllep" }
              ],
              failHint: `Ensure env ${reqEnvKey}="${reqEnvVal}" is set and command uses "sleep 3600".`
            }
          ]
        }
      };
    }
  }
];

/**
 * Matches the best archetype(s) based on domainId, archetypeId, or customPrompt keywords
 */
function selectArchetypes({ domainId = "all", archetypeId = null, customPrompt = "", count = 1, seed = Date.now() }) {
  if (archetypeId) {
    const exact = AI_ARCHETYPES.find((a) => a.archetypeId === archetypeId);
    if (exact) return [exact];
  }

  let pool = [...AI_ARCHETYPES];
  if (domainId && domainId !== "all" && DOMAIN_META[domainId]) {
    const domainPool = pool.filter((a) => a.domainId === domainId);
    if (domainPool.length > 0) pool = domainPool;
  }

  const promptClean = String(customPrompt || "").trim().toLowerCase();
  if (promptClean) {
    const scored = pool.map((arch, idx) => {
      let score = 0;
      for (const kw of arch.keywords) {
        if (promptClean.includes(kw.toLowerCase())) {
          score += 10;
        }
      }
      return { arch, score, idx };
    });
    scored.sort((a, b) => b.score - a.score || ((a.idx + seed) % pool.length) - ((b.idx + seed) % pool.length));
    if (scored[0] && scored[0].score > 0) {
      const out = [];
      for (let i = 0; i < count; i++) {
        out.push(scored[i % scored.length].arch);
      }
      return out;
    }
  }

  // Deterministic rotation using seed
  const out = [];
  const startIdx = Math.abs(Math.floor(Number(seed) || 0)) % pool.length;
  for (let i = 0; i < count; i++) {
    out.push(pool[(startIdx + i) % pool.length]);
  }
  return out;
}

/**
 * Built-in Compositional AI Scenario Synthesizer (zero latency, works offline)
 */
function generateWithCompositionalAI(options = {}) {
  const mode = options.mode === "set" ? "set" : "single";
  const count = mode === "set" ? Math.min(Math.max(Number(options.count) || 16, 1), 16) : Math.min(Math.max(Number(options.count) || 1, 1), 16);
  const difficulty = options.difficulty === "hard" ? "hard" : "standard";
  const domainId = options.domainId || "all";
  const customPrompt = String(options.customPrompt || "").trim();
  const baseSeed = Number(options.seed) || Math.floor(100 + (Date.now() % 8900));

  const chosenArchetypes = selectArchetypes({
    domainId,
    archetypeId: options.archetypeId || null,
    customPrompt,
    count,
    seed: baseSeed
  });

  const questions = chosenArchetypes.map((arch, idx) => {
    const qSeed = baseSeed + idx * 17;
    return arch.build(qSeed, difficulty, customPrompt);
  });

  let examSet = null;
  if (mode === "set") {
    const setId = makeUniqueId("ai-set");
    const domLabel = domainId !== "all" && DOMAIN_META[domainId] ? DOMAIN_META[domainId].title : "All 5 CNCF Domains";
    examSet = {
      id: setId,
      aiGenerated: true,
      aiEngine: "KubeMastery Compositional AI",
      badge: `AI Generated Exam (${difficulty.toUpperCase()})`,
      title: customPrompt
        ? `AI Custom Exam: ${customPrompt.slice(0, 48)} (${questions.length} Tasks)`
        : `AI Generated CKAD Mock Exam — ${domLabel} (${questions.length} Tasks)`,
      description: `AI-synthesized hands-on CKAD exam set (${questions.length} tasks, difficulty: ${difficulty}). Directly executable and verifiable in your real terminal.`,
      durationMinutes: Math.min(120, Math.max(30, questions.length * 7)),
      passingScore: 66,
      seedBase: baseSeed,
      createdAt: new Date().toISOString(),
      questionIds: questions.map((q) => q.id),
      questions
    };
  }

  return {
    engineUsed: "KubeMastery Compositional AI",
    questions,
    examSet
  };
}

/**
 * Helper to invoke Google Gemini REST API using built-in `https`
 */
function callGeminiRestApi(apiKey, modelName, systemInstruction, userPrompt) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload)
        },
        timeout: 25000
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`Gemini API HTTP ${res.statusCode}: ${raw.slice(0, 240)}`));
          }
          try {
            const parsed = JSON.parse(raw);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (!text) {
              return reject(new Error("Empty response from Gemini API"));
            }
            resolve(JSON.parse(text));
          } catch (err) {
            reject(new Error(`Failed to parse Gemini JSON output: ${err.message}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Gemini API request timed out"));
    });
    req.write(payload);
    req.end();
  });
}

function normalizeGeminiQuestion(rawQ, idx, difficulty, customPrompt) {
  const id = rawQ.id && String(rawQ.id).startsWith("ai-") ? String(rawQ.id) : makeUniqueId("ai-gemini");
  const domainId = DOMAIN_META[rawQ.domainId] ? rawQ.domainId : "domain-1";
  const ns = rawQ.namespace || `ai-lab-${100 + idx}`;
  const contextCluster = rawQ.contextCluster || "k8s-c1-H";

  return {
    id,
    aiGenerated: true,
    aiEngine: "Google Gemini AI",
    aiDifficulty: difficulty,
    aiPromptUsed: customPrompt || "Google Gemini AI CKAD Generation",
    createdAt: new Date().toISOString(),
    seed: Number(rawQ.seed) || 700 + idx,
    domainId,
    domainTitle: DOMAIN_META[domainId].title,
    contextCluster,
    contextCommand: `kubectl config use-context ${contextCluster}`,
    title: rawQ.title || `AI Generated CKAD Task (${id})`,
    titleTh: rawQ.titleTh || rawQ.title || `โจทย์ CKAD สร้างโดย AI (${id})`,
    weight: Number(rawQ.weight) || (difficulty === "hard" ? 8 : 6),
    targetMinutes: Number(rawQ.targetMinutes) || 6,
    namespace: ns,
    workspaceDir: id,
    scenario: rawQ.scenario || `Complete the Kubernetes task in namespace \`${ns}\`.`,
    scenarioTh: rawQ.scenarioTh || rawQ.scenario || `ดำเนินการตั้งค่าทรัพยากร Kubernetes ใน Namespace \`${ns}\``,
    requirements: Array.isArray(rawQ.requirements) && rawQ.requirements.length > 0 ? rawQ.requirements : ["Deploy the requested Kubernetes resource."],
    requirementsTh: Array.isArray(rawQ.requirementsTh) && rawQ.requirementsTh.length > 0 ? rawQ.requirementsTh : (rawQ.requirements || []),
    hints: Array.isArray(rawQ.hints) && rawQ.hints.length > 0 ? rawQ.hints : [`Verify your resources with kubectl get all -n ${ns}.`],
    solutionCommands: rawQ.solutionCommands || `kubectl get all -n ${ns}`,
    setupSpec: {
      namespaces: Array.isArray(rawQ.setupSpec?.namespaces) && rawQ.setupSpec.namespaces.length > 0 ? rawQ.setupSpec.namespaces : [ns],
      files: rawQ.setupSpec?.files && typeof rawQ.setupSpec.files === "object" ? rawQ.setupSpec.files : {},
      resources: Array.isArray(rawQ.setupSpec?.resources) ? rawQ.setupSpec.resources : []
    },
    verifySpec: {
      checks: Array.isArray(rawQ.verifySpec?.checks) && rawQ.verifySpec.checks.length > 0
        ? rawQ.verifySpec.checks.map((c, cIdx) => ({
            id: c.id || `chk-${cIdx + 1}`,
            title: c.title || `Verification check ${cIdx + 1}`,
            type: c.type || "k8s-field",
            rule: c.rule || "genericK8sCheck",
            kind: c.kind || "Pod",
            namespace: c.namespace || ns,
            name: c.name || "app",
            assertions: Array.isArray(c.assertions) ? c.assertions : [],
            expect: c.expect,
            failHint: c.failHint || `Check ${c.kind || "resource"} ${c.name || ""} in namespace ${ns}.`
          }))
        : []
    }
  };
}

/**
 * Generates new CKAD Question(s) using Google Gemini API (with automatic fallback)
 */
async function generateWithGemini(options = {}) {
  const apiKey = String(options.geminiApiKey || process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return generateWithCompositionalAI(options);
  }

  const mode = options.mode === "set" ? "set" : "single";
  const count = mode === "set" ? Math.min(Math.max(Number(options.count) || 8, 1), 16) : Math.min(Math.max(Number(options.count) || 1, 1), 5);
  const difficulty = options.difficulty === "hard" ? "hard" : "standard";
  const domainId = options.domainId || "all";
  const customPrompt = String(options.customPrompt || "").trim();

  const systemInstruction = `You are an official CNCF Certified Kubernetes Application Developer (CKAD) Exam Question Architect.
Return ONLY valid JSON with the shape: { "questions": [ ... ] }.
Each question in "questions" MUST have:
- "domainId": one of "domain-1", "domain-2", "domain-3", "domain-4", "domain-5"
- "contextCluster": "k8s-c1-H"
- "namespace": a unique lowercase namespace string
- "title": English task title
- "titleTh": Thai translation of task title
- "weight": integer between 5 and 10
- "targetMinutes": integer between 5 and 9
- "scenario": English PSI Bridge exam scenario description
- "scenarioTh": Thai translation of scenario
- "requirements": array of 3-4 clear English requirements
- "requirementsTh": array of 3-4 clear Thai requirements
- "hints": array of 1-2 practical kubectl/YAML hints
- "solutionCommands": exact bash commands using kubectl / cat << 'EOF' that solve the task 100%
- "setupSpec": { "namespaces": ["<namespace>"], "files": {}, "resources": [] }
- "verifySpec": {
    "checks": [
      {
        "id": "check-1",
        "title": "Human readable check description",
        "type": "k8s-field",
        "rule": "genericK8sCheck",
        "kind": "Pod|Deployment|StatefulSet|DaemonSet|Service|Ingress|NetworkPolicy|ConfigMap|Secret|ServiceAccount|Role|RoleBinding|PersistentVolumeClaim|LimitRange|Job|CronJob|HorizontalPodAutoscaler",
        "namespace": "<namespace>",
        "name": "<resource-name>",
        "assertions": [
          { "path": "spec.replicas", "operator": "equals", "value": 3 }
        ],
        "failHint": "Helpful hint when check fails"
      }
    ]
  }
Supported operators in assertions: "equals", "contains", "notContains", "exists", "gte", "lte".
Supported path syntax: dot notation ("spec.serviceName"), array index ("spec.containers[0].image"), array key filter ("spec.containers[0].env[name=DB_HOST].value"), or wildcard ("spec.egress[*].ports[*].port").`;

  const userPrompt = `Generate ${count} brand-new, realistic CKAD hands-on exam task(s).
Difficulty: ${difficulty}
Target Domain: ${domainId === "all" ? "Mix across domain-1..domain-5" : `${domainId} (${DOMAIN_META[domainId]?.title || ""})`}
${customPrompt ? `User Custom Topic / Prompt Request: "${customPrompt}"` : "Focus on realistic Kubernetes application developer scenarios."}`;

  try {
    let rawResult;
    try {
      rawResult = await callGeminiRestApi(apiKey, "gemini-2.0-flash", systemInstruction, userPrompt);
    } catch (_) {
      rawResult = await callGeminiRestApi(apiKey, "gemini-1.5-flash", systemInstruction, userPrompt);
    }

    const rawQuestions = Array.isArray(rawResult?.questions)
      ? rawResult.questions
      : Array.isArray(rawResult)
      ? rawResult
      : [rawResult];

    const validQuestions = rawQuestions
      .filter((q) => q && typeof q === "object" && q.title && q.verifySpec?.checks?.length > 0)
      .map((q, idx) => normalizeGeminiQuestion(q, idx, difficulty, customPrompt));

    if (validQuestions.length === 0) {
      throw new Error("Gemini returned no valid verifiable questions");
    }

    let examSet = null;
    if (mode === "set") {
      const setId = makeUniqueId("ai-gemini-set");
      examSet = {
        id: setId,
        aiGenerated: true,
        aiEngine: "Google Gemini AI",
        badge: `Gemini AI Exam (${difficulty.toUpperCase()})`,
        title: customPrompt
          ? `Gemini AI Exam: ${customPrompt.slice(0, 48)} (${validQuestions.length} Tasks)`
          : `Google Gemini AI CKAD Exam Set (${validQuestions.length} Tasks)`,
        description: `Generated live by Google Gemini LLM (${validQuestions.length} tasks, difficulty: ${difficulty}).`,
        durationMinutes: Math.min(120, Math.max(30, validQuestions.length * 7)),
        passingScore: 66,
        seedBase: Date.now() % 1000,
        createdAt: new Date().toISOString(),
        questionIds: validQuestions.map((q) => q.id),
        questions: validQuestions
      };
    }

    return {
      engineUsed: "Google Gemini AI",
      questions: validQuestions,
      examSet
    };
  } catch (err) {
    // Graceful fallback to Compositional AI so the user always gets working questions
    const fallback = generateWithCompositionalAI(options);
    return {
      ...fallback,
      engineUsed: "KubeMastery Compositional AI (Fallback)",
      fallbackReason: err.message
    };
  }
}

module.exports = {
  AI_ARCHETYPES,
  DOMAIN_META,
  generateWithCompositionalAI,
  generateWithGemini
};
