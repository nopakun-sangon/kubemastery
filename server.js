#!/usr/bin/env node
/**
 * KubeMastery Local Web & CKAD Lab Verification Server (`server.js`)
 * - Serves static frontend assets on PORT (default: 3080)
 * - Initializes `~/ckad-workspace` and `~/ckad-workspace/bin/kubectl`
 * - Provides REST API endpoints for CKAD Hands-On Labs:
 *     GET  /api/lab/status
 *     POST /api/lab/setup
 *     POST /api/lab/verify
 *     GET  /api/lab/analytics
 *     POST /api/lab/analytics
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT_DIR = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 3080);
const WORKSPACE_ROOT = process.env.CKAD_WORKSPACE || path.join(os.homedir(), "ckad-workspace");
const BIN_DIR = path.join(WORKSPACE_ROOT, "bin");
const KUBECTL_BIN = path.join(BIN_DIR, "kubectl");
const STATE_FILE = path.join(WORKSPACE_ROOT, ".cluster-state.json");
const ANALYTICS_FILE = path.join(WORKSPACE_ROOT, "ckad-analytics.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function syncDeploymentPods(state) {
  const deployments = (state.resources || []).filter((r) => r.kind === "Deployment");
  state.resources = (state.resources || []).filter((r) => !r._ownedByDeployment);

  for (const deploy of deployments) {
    const ns = deploy.metadata?.namespace || "default";
    const deployName = deploy.metadata?.name || "app";
    const replicas = deploy.spec?.replicas !== undefined ? Number(deploy.spec.replicas) : 1;
    const podLabels = { ...(deploy.spec?.template?.metadata?.labels || { app: deployName }) };
    const podSpec = JSON.parse(JSON.stringify(deploy.spec?.template?.spec || { containers: [] }));
    const firstImg = podSpec.containers?.[0]?.image || "";
    const isBroken = firstImg.includes("broken") || firstImg.includes("nonexistent") || firstImg.includes("invalid");

    const count = Math.max(0, Math.min(replicas, 12));
    for (let i = 0; i < count; i++) {
      const suffix = `${(i + 1) * 11}x${(i + 3) * 7}`;
      state.resources.push({
        apiVersion: "v1",
        kind: "Pod",
        metadata: {
          name: `${deployName}-6b7f8c-${suffix}`,
          namespace: ns,
          labels: podLabels,
          creationTimestamp: deploy.metadata?.creationTimestamp || new Date().toISOString()
        },
        spec: podSpec,
        status: isBroken
          ? {
              phase: "Pending",
              containerStatuses: [
                {
                  name: podSpec.containers?.[0]?.name || "app",
                  ready: false,
                  restartCount: 0,
                  state: { waiting: { reason: "ImagePullBackOff", message: `Back-off pulling image "${firstImg}"` } }
                }
              ]
            }
          : {
              phase: "Running",
              podIP: `10.244.1.${20 + i}`,
              containerStatuses: (podSpec.containers || []).map((c) => ({
                name: c.name,
                ready: true,
                restartCount: 0,
                state: { running: { startedAt: new Date().toISOString() } }
              }))
            },
        _ownedByDeployment: `${ns}/${deployName}`
      });
    }
  }
}

function loadClusterState() {
  fs.mkdirSync(WORKSPACE_ROOT, { recursive: true });
  if (!fs.existsSync(STATE_FILE)) {
    const initial = {
      currentNamespace: "default",
      activeQuestion: null,
      namespaces: ["default", "kube-system", "kube-public"],
      resources: []
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch (_) {
    return {
      currentNamespace: "default",
      activeQuestion: null,
      namespaces: ["default", "kube-system"],
      resources: []
    };
  }
}

function saveClusterState(state) {
  syncDeploymentPods(state);
  fs.mkdirSync(WORKSPACE_ROOT, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function createInitialAnalytics() {
  return {
    updatedAt: new Date().toISOString(),
    attempts: [],
    setHistory: [],
    domainStats: {
      "domain-1": { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 },
      "domain-2": { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 },
      "domain-3": { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 },
      "domain-4": { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 },
      "domain-5": { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 }
    },
    mistakes: {}
  };
}

function loadAnalytics() {
  fs.mkdirSync(WORKSPACE_ROOT, { recursive: true });
  if (!fs.existsSync(ANALYTICS_FILE)) {
    const init = createInitialAnalytics();
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(init, null, 2), "utf8");
    return init;
  }
  try {
    const data = JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf8"));
    if (!data.domainStats) data.domainStats = createInitialAnalytics().domainStats;
    if (!data.mistakes) data.mistakes = {};
    if (!Array.isArray(data.attempts)) data.attempts = [];
    if (!Array.isArray(data.setHistory)) data.setHistory = [];
    return data;
  } catch (_) {
    return createInitialAnalytics();
  }
}

function saveAnalytics(analytics) {
  analytics.updatedAt = new Date().toISOString();
  fs.mkdirSync(WORKSPACE_ROOT, { recursive: true });
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), "utf8");
}

function ensureWorkspaceEnvironment() {
  fs.mkdirSync(BIN_DIR, { recursive: true });

  // Copy ckad-kubectl.js to ~/ckad-workspace/bin/kubectl
  const srcKubectl = path.join(ROOT_DIR, "ckad-kubectl.js");
  if (fs.existsSync(srcKubectl)) {
    fs.copyFileSync(srcKubectl, KUBECTL_BIN);
    fs.chmodSync(KUBECTL_BIN, 0o755);

    // Also link into ~/.local/bin/kubectl if ~/.local/bin exists so existing terminals work without sourcing
    const localBinDir = path.join(os.homedir(), ".local", "bin");
    if (fs.existsSync(localBinDir)) {
      const localKubectl = path.join(localBinDir, "kubectl");
      try {
        fs.copyFileSync(srcKubectl, localKubectl);
        fs.chmodSync(localKubectl, 0o755);
      } catch (_) {}
    }
  }

  // Write ~/ckad-workspace/env.sh
  const envShPath = path.join(WORKSPACE_ROOT, "env.sh");
  const envShContent = `#!/usr/bin/env bash
export PATH="${BIN_DIR}:$PATH"
alias k=kubectl
echo "✅ KubeMastery CKAD Terminal Environment Active (kubectl -> ${KUBECTL_BIN})"
`;
  fs.writeFileSync(envShPath, envShContent, "utf8");
  fs.chmodSync(envShPath, 0o755);

  // Ensure ~/.bashrc has ~/ckad-workspace/bin in PATH
  const bashrcPath = path.join(os.homedir(), ".bashrc");
  try {
    const existingBashrc = fs.existsSync(bashrcPath) ? fs.readFileSync(bashrcPath, "utf8") : "";
    if (!existingBashrc.includes("ckad-workspace/bin")) {
      const snippet = `\n# KubeMastery CKAD Lab Environment\nexport PATH="${BIN_DIR}:$PATH"\nalias k=kubectl\n`;
      fs.appendFileSync(bashrcPath, snippet, "utf8");
    }
  } catch (_) {}

  loadClusterState();
  loadAnalytics();
}

function setupQuestionEnvironment(question) {
  if (!question || !question.id) {
    throw new Error("Invalid question payload");
  }

  const wsSubdir = question.workspaceDir || question.id;
  const qDir = path.join(WORKSPACE_ROOT, wsSubdir);

  // Clean and recreate workspace folder for this question
  fs.rmSync(qDir, { recursive: true, force: true });
  fs.mkdirSync(qDir, { recursive: true });

  const files = question.setupSpec?.files || {};
  for (const [relName, content] of Object.entries(files)) {
    const targetFile = path.join(qDir, relName);
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.writeFileSync(targetFile, content, "utf8");
  }

  const state = loadClusterState();
  const targetNamespaces = question.setupSpec?.namespaces || (question.namespace ? [question.namespace] : ["default"]);

  for (const ns of targetNamespaces) {
    if (!state.namespaces.includes(ns)) {
      state.namespaces.push(ns);
    }
  }

  // Remove old resources in these namespaces and any cluster-scoped PVs from previous runs
  state.resources = (state.resources || []).filter((r) => {
    if (r._ownedByDeployment) return false;
    if (r.kind === "PersistentVolume" && r.metadata?.name?.startsWith("pv-")) return false;
    const rNs = r.metadata?.namespace;
    if (rNs && targetNamespaces.includes(rNs)) return false;
    return true;
  });

  // Insert initial setupSpec resources
  const initialResources = JSON.parse(JSON.stringify(question.setupSpec?.resources || []));
  for (const res of initialResources) {
    if (!res.metadata) res.metadata = {};
    if (!res.metadata.creationTimestamp) {
      res.metadata.creationTimestamp = new Date().toISOString();
    }
    if (res.kind === "Pod" && !res.status) {
      res.status = {
        phase: "Running",
        podIP: "10.244.0.12",
        containerStatuses: (res.spec?.containers || []).map((c) => ({
          name: c.name,
          ready: true,
          restartCount: 0,
          state: { running: { startedAt: new Date().toISOString() } }
        }))
      };
    }
    state.resources.push(res);
  }

  state.currentNamespace = question.namespace || targetNamespaces[0] || "default";
  state.activeQuestion = {
    id: question.id,
    seed: question.seed,
    title: question.title,
    domainId: question.domainId,
    namespace: state.currentNamespace,
    workspaceDir: wsSubdir,
    setupAt: new Date().toISOString()
  };

  saveClusterState(state);

  // Write current-question.txt summary
  const summaryTxt = [
    `===================================================================`,
    `KubeMastery CKAD Lab: ${question.id.toUpperCase()} - ${question.title}`,
    `Namespace     : ${state.currentNamespace}`,
    `Workspace Dir : ${qDir}`,
    `===================================================================`,
    ``,
    `Scenario:`,
    `  ${question.scenario}`,
    ``,
    `Requirements:`,
    ...(question.requirements || []).map((req, i) => `  ${i + 1}. ${req}`),
    ``
  ].join("\n");
  fs.writeFileSync(path.join(WORKSPACE_ROOT, "current-question.txt"), summaryTxt, "utf8");

  return {
    ok: true,
    workspacePath: qDir,
    filesCreated: Object.keys(files),
    namespaces: targetNamespaces,
    activeQuestion: state.activeQuestion,
    message: `เตรียมสภาพแวดล้อมสำหรับข้อ ${question.id.toUpperCase()} ใน ~/ckad-workspace/${wsSubdir} เรียบร้อยแล้ว`
  };
}

function evaluateCheck(check, question, state) {
  const wsSubdir = question.workspaceDir || question.id;
  const qDir = path.join(WORKSPACE_ROOT, wsSubdir);

  if (check.type === "file-contains") {
    const filePath = path.isAbsolute(check.filePath)
      ? check.filePath
      : path.join(qDir, check.filePath);
    if (!fs.existsSync(filePath)) {
      return {
        id: check.id,
        title: check.title,
        passed: false,
        detail: `ไม่พบไฟล์ ${filePath}`,
        failHint: check.failHint
      };
    }
    const content = fs.readFileSync(filePath, "utf8");
    const missing = (check.substrings || []).filter((s) => !content.includes(String(s)));
    const passed = missing.length === 0;
    return {
      id: check.id,
      title: check.title,
      passed,
      detail: passed ? `พบข้อมูลครบถ้วนในไฟล์ ${check.filePath}` : `ในไฟล์ยังไม่มีข้อความ: ${missing.join(", ")}`,
      failHint: passed ? null : check.failHint
    };
  }

  // Find resource in cluster state
  const r = (state.resources || []).find(
    (item) =>
      item.kind === check.kind &&
      item.metadata?.name === check.name &&
      (!check.namespace || (item.metadata?.namespace || "default") === check.namespace)
  );

  if (!r) {
    return {
      id: check.id,
      title: check.title,
      passed: false,
      detail: `ไม่พบ ${check.kind} ชื่อ "${check.name}"${check.namespace ? ` ใน Namespace "${check.namespace}"` : ""}`,
      failHint: check.failHint
    };
  }

  if (check.type === "k8s-resource") {
    let passed = true;
    if (check.expect?.statusPhase) {
      const phase = r.status?.phase || "Running";
      const waitingReason = r.status?.containerStatuses?.[0]?.state?.waiting?.reason;
      passed = phase === check.expect.statusPhase && !waitingReason;
    }
    return {
      id: check.id,
      title: check.title,
      passed,
      detail: passed ? `พบ ${check.kind}/${check.name} ทำงานปกติ` : `สถานะของ ${check.kind}/${check.name} ยังไม่พร้อม`,
      failHint: passed ? null : check.failHint
    };
  }

  if (check.type === "k8s-jsonpath") {
    let passed = false;
    const podSpec = r.spec?.template?.spec || r.spec || {};

    switch (check.rule) {
      case "hasVolumeAndMount": {
        const vol = (podSpec.volumes || []).find((v) => v.name === check.volName);
        const hasVolType = check.volType === "emptyDir" ? Boolean(vol && vol.emptyDir !== undefined) : Boolean(vol);
        const container = (podSpec.containers || []).find((c) => !check.containerName || c.name === check.containerName);
        const hasMount = Boolean(
          container &&
            (container.volumeMounts || []).some((m) => m.name === check.volName && m.mountPath === check.mountPath)
        );
        passed = hasVolType && hasMount;
        break;
      }

      case "hasSidecarContainer": {
        const initSidecar = (podSpec.initContainers || []).find(
          (c) => c.name === check.containerName && c.restartPolicy === "Always"
        );
        const stdSidecar = (podSpec.containers || []).find((c) => c.name === check.containerName);
        const target = initSidecar || stdSidecar;
        const imgOk = Boolean(target && (target.image || "").includes(check.imagePrefix || ""));
        const mountOk = Boolean(
          target && (target.volumeMounts || []).some((m) => m.mountPath === check.mountPath)
        );
        passed = Boolean(target && imgOk && mountOk);
        break;
      }

      case "hasInitContainerCommand": {
        const initC = (podSpec.initContainers || []).find(
          (c) => !check.containerName || c.name === check.containerName
        );
        const cmdStr = [...(initC?.command || []), ...(initC?.args || [])].join(" ");
        const mountOk = Boolean(initC && (initC.volumeMounts || []).some((m) => m.mountPath === check.mountPath));
        passed = Boolean(initC && cmdStr.includes(check.commandSubstring) && mountOk);
        break;
      }

      case "cronSchedule": {
        passed = String(r.spec?.schedule || "").trim() === String(check.expectedSchedule).trim();
        break;
      }

      case "cronJobSpecs": {
        const js = r.spec?.jobTemplate?.spec || {};
        passed =
          Number(js.completions) === Number(check.completions) &&
          Number(js.parallelism) === Number(check.parallelism) &&
          Number(js.activeDeadlineSeconds) === Number(check.activeDeadlineSeconds);
        break;
      }

      case "cronHistoryAndRestart": {
        const limitOk = Number(r.spec?.successfulJobsHistoryLimit) === Number(check.successfulJobsHistoryLimit);
        const rp = r.spec?.jobTemplate?.spec?.template?.spec?.restartPolicy;
        passed = limitOk && rp === check.restartPolicy;
        break;
      }

      case "pvCheck": {
        const storageOk = String(r.spec?.capacity?.storage) === String(check.storage);
        const modeOk = Array.isArray(r.spec?.accessModes) && r.spec.accessModes.includes("ReadWriteOnce");
        passed = storageOk && modeOk;
        break;
      }

      case "pvcCheck": {
        const storageOk = String(r.spec?.resources?.requests?.storage) === String(check.storage);
        const modeOk = Array.isArray(r.spec?.accessModes) && r.spec.accessModes.includes("ReadWriteOnce");
        passed = storageOk && modeOk;
        break;
      }

      case "podPvcMount": {
        const pvcVol = (r.spec?.volumes || []).find(
          (v) => v.persistentVolumeClaim?.claimName === check.claimName
        );
        const mounted = Boolean(
          pvcVol &&
            (r.spec?.containers || []).some((c) =>
              (c.volumeMounts || []).some((m) => m.name === pvcVol.name && m.mountPath === check.mountPath)
            )
        );
        passed = mounted;
        break;
      }

      case "rollingUpdateStrategy": {
        const ru = r.spec?.strategy?.rollingUpdate || {};
        passed =
          String(ru.maxSurge) === String(check.maxSurge) &&
          String(ru.maxUnavailable) === String(check.maxUnavailable);
        break;
      }

      case "deploymentImage": {
        const containers = r.spec?.template?.spec?.containers || [];
        passed = containers.some((c) => c.image === check.expectedImage);
        break;
      }

      case "deploymentReplicas": {
        passed = Number(r.spec?.replicas) === Number(check.replicas);
        break;
      }

      case "canaryCheck": {
        const repOk = Number(r.spec?.replicas) === Number(check.replicas);
        const imgOk = (r.spec?.template?.spec?.containers || []).some((c) => c.image === check.expectedImage);
        const podLabels = r.spec?.template?.metadata?.labels || {};
        const labelsOk = Object.entries(check.requiredLabels || {}).every(
          ([k, v]) => String(podLabels[k]) === String(v)
        );
        passed = repOk && imgOk && labelsOk;
        break;
      }

      case "serviceSelector": {
        const sel = r.spec?.selector || {};
        passed = Object.entries(check.expectedSelector || {}).every(([k, v]) => String(sel[k]) === String(v));
        break;
      }

      case "probeCheck": {
        const c = (podSpec.containers || [])[0] || {};
        const pr = c[check.probeType] || {};
        const handler = pr[check.handlerType] || {};
        const portOk = Number(handler.port) === Number(check.port);
        const pathOk = !check.path || handler.path === check.path;
        const delayOk = Number(pr.initialDelaySeconds) === Number(check.initialDelaySeconds);
        const periodOk = Number(pr.periodSeconds) === Number(check.periodSeconds);
        passed = Boolean(pr && pr[check.handlerType] && portOk && pathOk && delayOk && periodOk);
        break;
      }

      case "podCommandFixed": {
        const c = (r.spec?.containers || [])[0] || {};
        const cmdStr = [...(c.command || []), ...(c.args || [])].join(" ");
        const waitingReason = r.status?.containerStatuses?.[0]?.state?.waiting?.reason;
        passed =
          !waitingReason &&
          !cmdStr.includes(check.forbiddenSubstring) &&
          cmdStr.includes(check.requiredSubstring);
        break;
      }

      case "configMapKey": {
        passed = String(r.data?.[check.key]) === String(check.expectedValue);
        break;
      }

      case "secretKeyExists": {
        passed = Boolean(r.data?.[check.key] !== undefined || r.stringData?.[check.key] !== undefined);
        break;
      }

      case "podConfigAndSecret": {
        const containers = r.spec?.containers || [];
        const hasCm = containers.some(
          (c) =>
            (c.envFrom || []).some((ef) => ef.configMapRef?.name === check.cmName) ||
            (c.env || []).some((e) => e.valueFrom?.configMapKeyRef?.name === check.cmName)
        );
        const secVol = (r.spec?.volumes || []).find((v) => v.secret?.secretName === check.secName);
        const hasSecMount = Boolean(
          secVol &&
            containers.some((c) =>
              (c.volumeMounts || []).some((m) => m.name === secVol.name && m.mountPath === check.mountPath)
            )
        );
        passed = hasCm && hasSecMount;
        break;
      }

      case "podSecurityContext": {
        const sc = r.spec?.securityContext || {};
        passed =
          Number(sc.runAsUser) === Number(check.runAsUser) &&
          Number(sc.fsGroup) === Number(check.fsGroup);
        break;
      }

      case "containerSecurityContext": {
        const csc = (r.spec?.containers || [])[0]?.securityContext || {};
        passed =
          csc.allowPrivilegeEscalation === check.allowPrivilegeEscalation &&
          Array.isArray(csc.capabilities?.add) &&
          csc.capabilities.add.includes(check.capability);
        break;
      }

      case "roleCheck": {
        const rules = r.rules || [];
        const allVerbs = rules.flatMap((ru) => ru.verbs || []);
        const allRes = rules.flatMap((ru) => ru.resources || []);
        passed =
          (check.verbs || []).every((v) => allVerbs.includes(v)) &&
          (check.resources || []).every((res) => allRes.includes(res));
        break;
      }

      case "podServiceAccount": {
        const saOk = (r.spec?.serviceAccountName || r.spec?.serviceAccount) === check.serviceAccountName;
        const rb = (state.resources || []).find(
          (item) =>
            item.kind === "RoleBinding" &&
            item.metadata?.name === check.roleBindingName &&
            (item.metadata?.namespace || "default") === check.namespace
        );
        const rbOk = Boolean(rb && (rb.subjects || []).some((s) => s.name === check.serviceAccountName));
        passed = saOk && rbOk;
        break;
      }

      case "podResources": {
        const res = (r.spec?.containers || [])[0]?.resources || {};
        passed =
          String(res.requests?.cpu) === String(check.reqCpu) &&
          String(res.requests?.memory) === String(check.reqMem) &&
          String(res.limits?.cpu) === String(check.limCpu) &&
          String(res.limits?.memory) === String(check.limMem);
        break;
      }

      case "servicePortCheck": {
        const typeOk = !check.svcType || (r.spec?.type || "ClusterIP") === check.svcType;
        const p = (r.spec?.ports || [])[0] || {};
        const portOk =
          Number(p.port) === Number(check.port) &&
          Number(p.targetPort ?? p.port) === Number(check.targetPort);
        const nodePortOk = !check.nodePort || Number(p.nodePort) === Number(check.nodePort);
        const sel = r.spec?.selector || {};
        const selOk = Object.entries(check.expectedSelector || {}).every(
          ([k, v]) => String(sel[k]) === String(v)
        );
        passed = typeOk && portOk && nodePortOk && selOk;
        break;
      }

      case "ingressCheck": {
        const rules = (r.spec?.rules || []).filter((ru) => ru.host === check.host);
        const allPaths = rules.flatMap((ru) => ru.http?.paths || []);
        passed = (check.expectedPaths || []).every((ep) =>
          allPaths.some(
            (p) =>
              (p.path === ep.path || p.path === `${ep.path}*`) &&
              p.backend?.service?.name === ep.serviceName &&
              Number(p.backend?.service?.port?.number) === Number(ep.port)
          )
        );
        break;
      }

      case "netpolCheck": {
        const targetOk = r.spec?.podSelector?.matchLabels?.role === check.targetRole;
        const ing = (r.spec?.ingress || [])[0] || {};
        const fromOk = (ing.from || []).some((f) => f.podSelector?.matchLabels?.role === check.allowedRole);
        const portOk = (ing.ports || []).some((p) => Number(p.port) === Number(check.port));
        passed = Boolean(targetOk && fromOk && portOk);
        break;
      }

      default:
        passed = true;
    }

    return {
      id: check.id,
      title: check.title,
      passed,
      detail: passed ? "ผ่านเกณฑ์การตรวจสอบ" : check.failHint,
      failHint: passed ? null : check.failHint
    };
  }

  return {
    id: check.id,
    title: check.title,
    passed: false,
    detail: "Unknown check type",
    failHint: check.failHint
  };
}

function verifyQuestion(question, timeSpentSeconds = 0, setId = "practice", recordAnalytics = true) {
  const state = loadClusterState();
  const checks = question.verifySpec?.checks || [];
  const results = checks.map((chk) => evaluateCheck(chk, question, state));

  const totalChecks = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const passedAll = totalChecks > 0 && passedCount === totalChecks;
  const maxScore = Number(question.weight) || 5;
  const earnedScore = totalChecks > 0 ? Math.round((passedCount / totalChecks) * maxScore * 10) / 10 : 0;

  const analytics = loadAnalytics();
  if (recordAnalytics) {
    const failedChecks = results
      .filter((r) => !r.passed)
      .map((r) => ({ id: r.id, title: r.title, failHint: r.failHint }));

    analytics.attempts.unshift({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      questionId: question.id,
      seed: question.seed,
      title: question.title,
      domainId: question.domainId,
      domainTitle: question.domainTitle,
      setId,
      passedAll,
      passedCount,
      totalChecks,
      earnedScore,
      maxScore,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      failedChecks,
      timestamp: new Date().toISOString()
    });
    if (analytics.attempts.length > 200) {
      analytics.attempts = analytics.attempts.slice(0, 200);
    }

    const domId = question.domainId || "domain-1";
    if (!analytics.domainStats[domId]) {
      analytics.domainStats[domId] = { attempts: 0, passed: 0, totalEarned: 0, totalMax: 0 };
    }
    analytics.domainStats[domId].attempts += 1;
    if (passedAll) analytics.domainStats[domId].passed += 1;
    analytics.domainStats[domId].totalEarned =
      Math.round((analytics.domainStats[domId].totalEarned + earnedScore) * 10) / 10;
    analytics.domainStats[domId].totalMax += maxScore;

    for (const r of results) {
      const mKey = `${question.id}:${r.id}`;
      if (!r.passed) {
        const prev = analytics.mistakes[mKey] || {
          key: mKey,
          questionId: question.id,
          questionTitle: question.title,
          domainId: question.domainId,
          domainTitle: question.domainTitle,
          checkId: r.id,
          checkTitle: r.title,
          failHint: r.failHint,
          count: 0,
          resolved: false
        };
        prev.count += 1;
        prev.resolved = false;
        prev.lastSeen = new Date().toISOString();
        prev.failHint = r.failHint;
        analytics.mistakes[mKey] = prev;
      } else if (analytics.mistakes[mKey]) {
        analytics.mistakes[mKey].resolved = true;
        analytics.mistakes[mKey].resolvedAt = new Date().toISOString();
      }
    }

    saveAnalytics(analytics);
  }

  return {
    ok: true,
    questionId: question.id,
    passedAll,
    passedCount,
    totalChecks,
    earnedScore,
    maxScore,
    results,
    analytics
  };
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

ensureWorkspaceEnvironment();

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  try {
    if (pathname === "/api/lab/status" && req.method === "GET") {
      const state = loadClusterState();
      return sendJson(res, 200, {
        ok: true,
        mode: "ckad-local-engine",
        workspaceRoot: WORKSPACE_ROOT,
        kubectlPath: KUBECTL_BIN,
        activeQuestion: state.activeQuestion || null,
        currentNamespace: state.currentNamespace || "default",
        namespaces: state.namespaces || [],
        resourceCount: (state.resources || []).length
      });
    }

    if (pathname === "/api/lab/setup" && req.method === "POST") {
      const body = await readJsonBody(req);
      let question = body.question;
      if (!question && body.blueprintId) {
        const catalog = require("./data/ckadLabsData.js");
        question = catalog.buildQuestion(body.blueprintId, body.seed || 100);
      }
      const result = setupQuestionEnvironment(question);
      return sendJson(res, 200, result);
    }

    if (pathname === "/api/lab/verify" && req.method === "POST") {
      const body = await readJsonBody(req);
      let question = body.question;
      if (!question && body.blueprintId) {
        const catalog = require("./data/ckadLabsData.js");
        question = catalog.buildQuestion(body.blueprintId, body.seed || 100);
      }
      if (!question) {
        return sendJson(res, 400, { ok: false, error: "Missing question object" });
      }
      const result = verifyQuestion(
        question,
        body.timeSpentSeconds || 0,
        body.setId || "practice",
        body.recordAnalytics !== false
      );
      return sendJson(res, 200, result);
    }

    if (pathname === "/api/lab/analytics" && req.method === "GET") {
      return sendJson(res, 200, { ok: true, analytics: loadAnalytics() });
    }

    if (pathname === "/api/lab/analytics" && req.method === "POST") {
      const body = await readJsonBody(req);
      if (body.action === "reset") {
        const fresh = createInitialAnalytics();
        saveAnalytics(fresh);
        return sendJson(res, 200, { ok: true, analytics: fresh });
      }
      const analytics = loadAnalytics();
      if (body.setResult) {
        analytics.setHistory.unshift({
          id: `set-run-${Date.now()}`,
          ...body.setResult,
          timestamp: body.setResult.timestamp || new Date().toISOString()
        });
        if (analytics.setHistory.length > 50) {
          analytics.setHistory = analytics.setHistory.slice(0, 50);
        }
        saveAnalytics(analytics);
      }
      return sendJson(res, 200, { ok: true, analytics });
    }
  } catch (err) {
    return sendJson(res, 500, { ok: false, error: err.message || String(err) });
  }

  // Serve static files
  let relPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(path.join(ROOT_DIR, relPath));
  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache"
    });
    fs.createReadStream(safePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`🚀 KubeMastery Server & CKAD Lab Engine listening on http://localhost:${PORT}`);
  console.log(`📁 CKAD Workspace : ${WORKSPACE_ROOT}`);
  console.log(`🔧 Local kubectl  : ${KUBECTL_BIN}`);
});
