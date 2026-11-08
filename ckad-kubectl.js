#!/usr/bin/env node
/**
 * KubeMastery CKAD Local Terminal Kubectl Engine (`ckad-kubectl.js`)
 * Provides a realistic, persistent Kubernetes CLI experience backed by
 * `~/ckad-workspace/.cluster-state.json` and Python3 PyYAML for 100% YAML fidelity.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const WORKSPACE_ROOT = process.env.CKAD_WORKSPACE || path.join(os.homedir(), "ckad-workspace");
const STATE_FILE = path.join(WORKSPACE_ROOT, ".cluster-state.json");

const KIND_MAP = {
  po: { kind: "Pod", apiVersion: "v1", plural: "pods", short: "pod", namespaced: true },
  pod: { kind: "Pod", apiVersion: "v1", plural: "pods", short: "pod", namespaced: true },
  pods: { kind: "Pod", apiVersion: "v1", plural: "pods", short: "pod", namespaced: true },

  deploy: { kind: "Deployment", apiVersion: "apps/v1", plural: "deployments", short: "deployment.apps", namespaced: true },
  deployment: { kind: "Deployment", apiVersion: "apps/v1", plural: "deployments", short: "deployment.apps", namespaced: true },
  deployments: { kind: "Deployment", apiVersion: "apps/v1", plural: "deployments", short: "deployment.apps", namespaced: true },
  "deployment.apps": { kind: "Deployment", apiVersion: "apps/v1", plural: "deployments", short: "deployment.apps", namespaced: true },

  svc: { kind: "Service", apiVersion: "v1", plural: "services", short: "service", namespaced: true },
  service: { kind: "Service", apiVersion: "v1", plural: "services", short: "service", namespaced: true },
  services: { kind: "Service", apiVersion: "v1", plural: "services", short: "service", namespaced: true },

  cj: { kind: "CronJob", apiVersion: "batch/v1", plural: "cronjobs", short: "cronjob.batch", namespaced: true },
  cronjob: { kind: "CronJob", apiVersion: "batch/v1", plural: "cronjobs", short: "cronjob.batch", namespaced: true },
  cronjobs: { kind: "CronJob", apiVersion: "batch/v1", plural: "cronjobs", short: "cronjob.batch", namespaced: true },

  job: { kind: "Job", apiVersion: "batch/v1", plural: "jobs", short: "job.batch", namespaced: true },
  jobs: { kind: "Job", apiVersion: "batch/v1", plural: "jobs", short: "job.batch", namespaced: true },

  pv: { kind: "PersistentVolume", apiVersion: "v1", plural: "persistentvolumes", short: "persistentvolume", namespaced: false },
  persistentvolume: { kind: "PersistentVolume", apiVersion: "v1", plural: "persistentvolumes", short: "persistentvolume", namespaced: false },
  persistentvolumes: { kind: "PersistentVolume", apiVersion: "v1", plural: "persistentvolumes", short: "persistentvolume", namespaced: false },

  pvc: { kind: "PersistentVolumeClaim", apiVersion: "v1", plural: "persistentvolumeclaims", short: "persistentvolumeclaim", namespaced: true },
  persistentvolumeclaim: { kind: "PersistentVolumeClaim", apiVersion: "v1", plural: "persistentvolumeclaims", short: "persistentvolumeclaim", namespaced: true },
  persistentvolumeclaims: { kind: "PersistentVolumeClaim", apiVersion: "v1", plural: "persistentvolumeclaims", short: "persistentvolumeclaim", namespaced: true },

  cm: { kind: "ConfigMap", apiVersion: "v1", plural: "configmaps", short: "configmap", namespaced: true },
  configmap: { kind: "ConfigMap", apiVersion: "v1", plural: "configmaps", short: "configmap", namespaced: true },
  configmaps: { kind: "ConfigMap", apiVersion: "v1", plural: "configmaps", short: "configmap", namespaced: true },

  secret: { kind: "Secret", apiVersion: "v1", plural: "secrets", short: "secret", namespaced: true },
  secrets: { kind: "Secret", apiVersion: "v1", plural: "secrets", short: "secret", namespaced: true },

  sa: { kind: "ServiceAccount", apiVersion: "v1", plural: "serviceaccounts", short: "serviceaccount", namespaced: true },
  serviceaccount: { kind: "ServiceAccount", apiVersion: "v1", plural: "serviceaccounts", short: "serviceaccount", namespaced: true },
  serviceaccounts: { kind: "ServiceAccount", apiVersion: "v1", plural: "serviceaccounts", short: "serviceaccount", namespaced: true },

  role: { kind: "Role", apiVersion: "rbac.authorization.k8s.io/v1", plural: "roles", short: "role.rbac.authorization.k8s.io", namespaced: true },
  roles: { kind: "Role", apiVersion: "rbac.authorization.k8s.io/v1", plural: "roles", short: "role.rbac.authorization.k8s.io", namespaced: true },

  rb: { kind: "RoleBinding", apiVersion: "rbac.authorization.k8s.io/v1", plural: "rolebindings", short: "rolebinding.rbac.authorization.k8s.io", namespaced: true },
  rolebinding: { kind: "RoleBinding", apiVersion: "rbac.authorization.k8s.io/v1", plural: "rolebindings", short: "rolebinding.rbac.authorization.k8s.io", namespaced: true },
  rolebindings: { kind: "RoleBinding", apiVersion: "rbac.authorization.k8s.io/v1", plural: "rolebindings", short: "rolebinding.rbac.authorization.k8s.io", namespaced: true },

  quota: { kind: "ResourceQuota", apiVersion: "v1", plural: "resourcequotas", short: "resourcequota", namespaced: true },
  resourcequota: { kind: "ResourceQuota", apiVersion: "v1", plural: "resourcequotas", short: "resourcequota", namespaced: true },
  resourcequotas: { kind: "ResourceQuota", apiVersion: "v1", plural: "resourcequotas", short: "resourcequota", namespaced: true },

  ing: { kind: "Ingress", apiVersion: "networking.k8s.io/v1", plural: "ingresses", short: "ingress.networking.k8s.io", namespaced: true },
  ingress: { kind: "Ingress", apiVersion: "networking.k8s.io/v1", plural: "ingresses", short: "ingress.networking.k8s.io", namespaced: true },
  ingresses: { kind: "Ingress", apiVersion: "networking.k8s.io/v1", plural: "ingresses", short: "ingress.networking.k8s.io", namespaced: true },

  netpol: { kind: "NetworkPolicy", apiVersion: "networking.k8s.io/v1", plural: "networkpolicies", short: "networkpolicy.networking.k8s.io", namespaced: true },
  networkpolicy: { kind: "NetworkPolicy", apiVersion: "networking.k8s.io/v1", plural: "networkpolicies", short: "networkpolicy.networking.k8s.io", namespaced: true },
  networkpolicies: { kind: "NetworkPolicy", apiVersion: "networking.k8s.io/v1", plural: "networkpolicies", short: "networkpolicy.networking.k8s.io", namespaced: true },

  ns: { kind: "Namespace", apiVersion: "v1", plural: "namespaces", short: "namespace", namespaced: false },
  namespace: { kind: "Namespace", apiVersion: "v1", plural: "namespaces", short: "namespace", namespaced: false },
  namespaces: { kind: "Namespace", apiVersion: "v1", plural: "namespaces", short: "namespace", namespaced: false }
};

function normalizeKind(raw) {
  if (!raw) return null;
  const key = String(raw).trim().toLowerCase();
  if (KIND_MAP[key]) return KIND_MAP[key];
  // Match by exact kind name case-insensitively
  for (const val of Object.values(KIND_MAP)) {
    if (val.kind.toLowerCase() === key) return val;
  }
  return {
    kind: raw.charAt(0).toUpperCase() + raw.slice(1),
    apiVersion: "v1",
    plural: key.endsWith("s") ? key : `${key}s`,
    short: key,
    namespaced: true
  };
}

function parseYamlDocs(yamlText) {
  if (!yamlText || !yamlText.trim()) return [];
  const trimmed = yamlText.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (_) {
      // fall through to Python PyYAML
    }
  }
  const pyScript = `
import sys, yaml, json
try:
    docs = [d for d in yaml.safe_load_all(sys.stdin.read()) if d is not None]
    print(json.dumps(docs))
except Exception as e:
    sys.stderr.write(str(e))
    sys.exit(1)
`;
  const res = spawnSync("/usr/bin/python3", ["-c", pyScript], {
    input: yamlText,
    encoding: "utf8"
  });
  if (res.status !== 0) {
    throw new Error(`error parsing YAML: ${res.stderr || "invalid YAML syntax"}`);
  }
  return JSON.parse(res.stdout || "[]");
}

function dumpYaml(obj) {
  const clean = JSON.parse(JSON.stringify(obj, (k, v) => (k.startsWith("_") ? undefined : v)));
  const pyScript = `
import sys, yaml, json
data = json.loads(sys.stdin.read())
print(yaml.safe_dump(data, sort_keys=False, default_flow_style=False).rstrip())
`;
  const res = spawnSync("/usr/bin/python3", ["-c", pyScript], {
    input: JSON.stringify(clean),
    encoding: "utf8"
  });
  if (res.status === 0) {
    return res.stdout;
  }
  return JSON.stringify(clean, null, 2) + "\n";
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
    const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    if (!Array.isArray(state.namespaces)) state.namespaces = ["default", "kube-system"];
    if (!Array.isArray(state.resources)) state.resources = [];
    if (!state.currentNamespace) state.currentNamespace = "default";
    return state;
  } catch (_) {
    return {
      currentNamespace: "default",
      activeQuestion: null,
      namespaces: ["default", "kube-system"],
      resources: []
    };
  }
}

function syncDeploymentPods(state) {
  // Remove auto-generated deployment pods whose deployment no longer exists or will be refreshed
  const deployments = state.resources.filter((r) => r.kind === "Deployment");
  state.resources = state.resources.filter((r) => !r._ownedByDeployment);

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

function saveClusterState(state) {
  syncDeploymentPods(state);
  fs.mkdirSync(WORKSPACE_ROOT, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function resolvePath(p) {
  if (!p || p === "-") return "-";
  if (p.startsWith("~/")) {
    return path.join(os.homedir(), p.slice(2));
  }
  return path.resolve(process.cwd(), p);
}

function upsertResource(state, doc, defaultNs) {
  if (!doc || typeof doc !== "object") return null;
  if (doc.kind === "List" && Array.isArray(doc.items)) {
    const out = [];
    for (const item of doc.items) {
      const res = upsertResource(state, item, defaultNs);
      if (res) out.push(res);
    }
    return out;
  }

  const info = normalizeKind(doc.kind);
  if (!info) throw new Error(`error: unknown resource kind "${doc.kind}"`);

  // Validate deprecated API versions on Deployment (for ckad-11 realism)
  if (info.kind === "Deployment" && doc.apiVersion && doc.apiVersion !== "apps/v1") {
    throw new Error(
      `error: resource mapping not found for name: "${doc.metadata?.name}" namespace: "${doc.metadata?.namespace || defaultNs}" from manifest: no matches for kind "Deployment" in version "${doc.apiVersion}" (ensure apiVersion: apps/v1 and spec.selector.matchLabels are set)`
    );
  }
  if (info.kind === "Deployment" && !doc.spec?.selector?.matchLabels) {
    throw new Error(
      `The Deployment "${doc.metadata?.name}" is invalid: spec.selector: Required value (apps/v1 requires spec.selector.matchLabels)`
    );
  }

  doc.kind = info.kind;
  if (!doc.apiVersion) doc.apiVersion = info.apiVersion;
  if (!doc.metadata) doc.metadata = {};
  const name = doc.metadata.name;
  if (!name) throw new Error(`error: metadata.name is required for ${doc.kind}`);

  if (info.kind === "Namespace") {
    if (!state.namespaces.includes(name)) state.namespaces.push(name);
  }

  const ns = info.namespaced ? (doc.metadata.namespace || defaultNs || state.currentNamespace || "default") : "";
  if (info.namespaced) {
    doc.metadata.namespace = ns;
    if (!state.namespaces.includes(ns)) {
      state.namespaces.push(ns);
    }
  } else {
    delete doc.metadata.namespace;
  }

  if (!doc.metadata.creationTimestamp) {
    doc.metadata.creationTimestamp = new Date().toISOString();
  }

  // Default healthy status for Pods/PV/PVC/Deployment
  if (doc.kind === "Pod" && !doc.status) {
    const firstCmd = [...(doc.spec?.containers?.[0]?.command || []), ...(doc.spec?.containers?.[0]?.args || [])].join(" ");
    const hasBadCmd = /\b(sllep|echho|daate)\b/.test(firstCmd);
    doc.status = hasBadCmd
      ? {
          phase: "Running",
          containerStatuses: [
            {
              name: doc.spec?.containers?.[0]?.name || "app",
              ready: false,
              restartCount: 3,
              state: { waiting: { reason: "CrashLoopBackOff", message: "back-off 40s restarting failed container" } }
            }
          ]
        }
      : {
          phase: "Running",
          podIP: "10.244.0.15",
          containerStatuses: (doc.spec?.containers || []).map((c) => ({
            name: c.name,
            ready: true,
            restartCount: 0,
            state: { running: { startedAt: new Date().toISOString() } }
          }))
        };
  } else if (doc.kind === "PersistentVolume" && !doc.status) {
    doc.status = { phase: "Available" };
  } else if (doc.kind === "PersistentVolumeClaim" && !doc.status) {
    doc.status = { phase: "Bound" };
  } else if (doc.kind === "Deployment") {
    const img = doc.spec?.template?.spec?.containers?.[0]?.image || "nginx:latest";
    if (!Array.isArray(doc._revisionHistory) || doc._revisionHistory.length === 0) {
      doc._revisionHistory = [{ revision: 1, image: img, changeCause: "<none>" }];
    }
  }

  const idx = state.resources.findIndex(
    (r) =>
      r.kind === doc.kind &&
      r.metadata?.name === name &&
      (info.namespaced ? (r.metadata?.namespace || "default") === ns : true)
  );

  let action = "created";
  if (idx >= 0) {
    const existing = state.resources[idx];
    if (existing._revisionHistory && !doc._revisionHistory) {
      doc._revisionHistory = existing._revisionHistory;
      const newImg = doc.spec?.template?.spec?.containers?.[0]?.image;
      const lastRev = doc._revisionHistory[doc._revisionHistory.length - 1];
      if (newImg && lastRev && lastRev.image !== newImg) {
        doc._revisionHistory.push({
          revision: lastRev.revision + 1,
          image: newImg,
          changeCause: doc.metadata?.annotations?.["kubernetes.io/change-cause"] || "<none>"
        });
      }
    }
    state.resources[idx] = doc;
    action = "configured";
  } else {
    state.resources.push(doc);
  }

  return { info, name, ns, action, doc };
}

function buildKustomizeResources(kustomizeDir) {
  const dir = resolvePath(kustomizeDir);
  const candidates = ["kustomization.yaml", "kustomization.yml", "Kustomization"];
  let kustFile = null;
  for (const c of candidates) {
    const full = path.join(dir, c);
    if (fs.existsSync(full)) {
      kustFile = full;
      break;
    }
  }
  if (!kustFile) {
    throw new Error(`error: unable to find one of 'kustomization.yaml', 'kustomization.yml' or 'Kustomization' in directory '${dir}'`);
  }

  const kustDocs = parseYamlDocs(fs.readFileSync(kustFile, "utf8"));
  const kust = kustDocs[0] || {};
  const resourceFiles = kust.resources || kust.bases || [];
  const targetNs = kust.namespace || null;
  const namePrefix = kust.namePrefix || "";
  const nameSuffix = kust.nameSuffix || "";

  let commonLabels = { ...(kust.commonLabels || {}) };
  if (Array.isArray(kust.labels)) {
    for (const l of kust.labels) {
      if (l && typeof l.pairs === "object") {
        commonLabels = { ...commonLabels, ...l.pairs };
      }
    }
  } else if (kust.labels && typeof kust.labels === "object") {
    commonLabels = { ...commonLabels, ...kust.labels };
  }

  const outputDocs = [];
  for (const rel of resourceFiles) {
    const resPath = path.resolve(dir, rel);
    if (!fs.existsSync(resPath)) {
      throw new Error(`error: kustomize resource file not found: ${resPath}`);
    }
    const docs = parseYamlDocs(fs.readFileSync(resPath, "utf8"));
    for (const doc of docs) {
      if (!doc || typeof doc !== "object") continue;
      if (!doc.metadata) doc.metadata = {};
      if (targetNs) doc.metadata.namespace = targetNs;
      if (namePrefix && doc.metadata.name && !doc.metadata.name.startsWith(namePrefix)) {
        doc.metadata.name = `${namePrefix}${doc.metadata.name}`;
      }
      if (nameSuffix && doc.metadata.name && !doc.metadata.name.endsWith(nameSuffix)) {
        doc.metadata.name = `${doc.metadata.name}${nameSuffix}`;
      }
      if (Object.keys(commonLabels).length > 0) {
        doc.metadata.labels = { ...(doc.metadata.labels || {}), ...commonLabels };
        if (doc.kind === "Deployment" || doc.kind === "StatefulSet" || doc.kind === "DaemonSet") {
          if (!doc.spec) doc.spec = {};
          if (!doc.spec.selector) doc.spec.selector = {};
          doc.spec.selector.matchLabels = { ...(doc.spec.selector.matchLabels || {}), ...commonLabels };
          if (!doc.spec.template) doc.spec.template = {};
          if (!doc.spec.template.metadata) doc.spec.template.metadata = {};
          doc.spec.template.metadata.labels = { ...(doc.spec.template.metadata.labels || {}), ...commonLabels };
        } else if (doc.kind === "Service" && doc.spec?.selector) {
          doc.spec.selector = { ...doc.spec.selector, ...commonLabels };
        }
      }
      outputDocs.push(doc);
    }
  }
  return outputDocs;
}

function loadDocsFromFilenameArg(fileArg) {
  if (fileArg === "-") {
    const stdinText = fs.readFileSync(0, "utf8");
    return parseYamlDocs(stdinText);
  }
  const resolved = resolvePath(fileArg);
  if (!fs.existsSync(resolved)) {
    throw new Error(`error: the path "${fileArg}" does not exist`);
  }
  const stat = fs.statSync(resolved);
  if (stat.isDirectory()) {
    const entries = fs.readdirSync(resolved).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml") || f.endsWith(".json"));
    const all = [];
    for (const entry of entries) {
      if (entry.toLowerCase().startsWith("kustomization.")) continue;
      const docs = parseYamlDocs(fs.readFileSync(path.join(resolved, entry), "utf8"));
      all.push(...docs);
    }
    return all;
  }
  return parseYamlDocs(fs.readFileSync(resolved, "utf8"));
}

function parseArgs(rawArgv) {
  const dashDashIdx = rawArgv.indexOf("--");
  const mainArgs = dashDashIdx >= 0 ? rawArgv.slice(0, dashDashIdx) : rawArgv;
  const execCommand = dashDashIdx >= 0 ? rawArgv.slice(dashDashIdx + 1) : [];

  const flags = {
    namespace: null,
    allNamespaces: false,
    output: null,
    filenames: [],
    kustomize: null,
    dryRun: false,
    force: false,
    ignoreNotFound: false,
    showLabels: false,
    selector: null,
    patch: null,
    type: null,
    replicas: null,
    image: null,
    schedule: null,
    restart: null,
    port: null,
    targetPort: null,
    name: null,
    fromLiterals: [],
    fromFiles: [],
    verbs: [],
    resources: [],
    role: null,
    clusterrole: null,
    serviceaccount: null,
    ingressClass: null,
    rules: [],
    container: null,
    toRevision: null
  };
  const positionals = [];

  for (let i = 0; i < mainArgs.length; i++) {
    const arg = mainArgs[i];
    const next = () => (i + 1 < mainArgs.length ? mainArgs[++i] : "");

    if (arg === "-n" || arg === "--namespace") {
      flags.namespace = next();
    } else if (arg.startsWith("--namespace=")) {
      flags.namespace = arg.slice("--namespace=".length);
    } else if (arg.startsWith("-n=")) {
      flags.namespace = arg.slice(3);
    } else if (arg.startsWith("-n") && arg.length > 2 && !arg.startsWith("--")) {
      flags.namespace = arg.slice(2);
    } else if (arg === "-A" || arg === "--all-namespaces") {
      flags.allNamespaces = true;
    } else if (arg === "-o" || arg === "--output") {
      flags.output = next();
    } else if (arg.startsWith("--output=")) {
      flags.output = arg.slice("--output=".length);
    } else if (arg.startsWith("-o=")) {
      flags.output = arg.slice(3);
    } else if (arg.startsWith("-o") && arg.length > 2 && !arg.startsWith("--")) {
      flags.output = arg.slice(2);
    } else if (arg === "-f" || arg === "--filename") {
      flags.filenames.push(next());
    } else if (arg.startsWith("--filename=")) {
      flags.filenames.push(arg.slice("--filename=".length));
    } else if (arg.startsWith("-f=")) {
      flags.filenames.push(arg.slice(3));
    } else if (arg === "-k" || arg === "--kustomize") {
      flags.kustomize = next();
    } else if (arg.startsWith("--kustomize=")) {
      flags.kustomize = arg.slice("--kustomize=".length);
    } else if (arg === "--dry-run") {
      flags.dryRun = "client";
    } else if (arg.startsWith("--dry-run=")) {
      const val = arg.slice("--dry-run=".length);
      flags.dryRun = val === "none" ? false : val;
    } else if (arg === "--force" || arg === "--force=true") {
      flags.force = true;
    } else if (arg === "--ignore-not-found" || arg === "--ignore-not-found=true") {
      flags.ignoreNotFound = true;
    } else if (arg === "--show-labels") {
      flags.showLabels = true;
    } else if (arg === "-l" || arg === "--selector") {
      flags.selector = next();
    } else if (arg.startsWith("--selector=")) {
      flags.selector = arg.slice("--selector=".length);
    } else if (arg.startsWith("-l=")) {
      flags.selector = arg.slice(3);
    } else if (arg === "-p" || arg === "--patch") {
      flags.patch = next();
    } else if (arg.startsWith("--patch=")) {
      flags.patch = arg.slice("--patch=".length);
    } else if (arg === "--type") {
      flags.type = next();
    } else if (arg.startsWith("--type=")) {
      flags.type = arg.slice("--type=".length);
    } else if (arg === "--replicas") {
      flags.replicas = Number(next());
    } else if (arg.startsWith("--replicas=")) {
      flags.replicas = Number(arg.slice("--replicas=".length));
    } else if (arg === "--image") {
      flags.image = next();
    } else if (arg.startsWith("--image=")) {
      flags.image = arg.slice("--image=".length);
    } else if (arg === "--schedule") {
      flags.schedule = next();
    } else if (arg.startsWith("--schedule=")) {
      flags.schedule = arg.slice("--schedule=".length);
    } else if (arg === "--restart") {
      flags.restart = next();
    } else if (arg.startsWith("--restart=")) {
      flags.restart = arg.slice("--restart=".length);
    } else if (arg === "--port") {
      flags.port = next();
    } else if (arg.startsWith("--port=")) {
      flags.port = arg.slice("--port=".length);
    } else if (arg === "--target-port") {
      flags.targetPort = next();
    } else if (arg.startsWith("--target-port=")) {
      flags.targetPort = arg.slice("--target-port=".length);
    } else if (arg === "--name") {
      flags.name = next();
    } else if (arg.startsWith("--name=")) {
      flags.name = arg.slice("--name=".length);
    } else if (arg === "--from-literal") {
      flags.fromLiterals.push(next());
    } else if (arg.startsWith("--from-literal=")) {
      flags.fromLiterals.push(arg.slice("--from-literal=".length));
    } else if (arg === "--from-file") {
      flags.fromFiles.push(next());
    } else if (arg.startsWith("--from-file=")) {
      flags.fromFiles.push(arg.slice("--from-file=".length));
    } else if (arg === "--verb") {
      flags.verbs.push(...next().split(",").filter(Boolean));
    } else if (arg.startsWith("--verb=")) {
      flags.verbs.push(...arg.slice("--verb=".length).split(",").filter(Boolean));
    } else if (arg === "--resource") {
      flags.resources.push(...next().split(",").filter(Boolean));
    } else if (arg.startsWith("--resource=")) {
      flags.resources.push(...arg.slice("--resource=".length).split(",").filter(Boolean));
    } else if (arg === "--role") {
      flags.role = next();
    } else if (arg.startsWith("--role=")) {
      flags.role = arg.slice("--role=".length);
    } else if (arg === "--clusterrole") {
      flags.clusterrole = next();
    } else if (arg.startsWith("--clusterrole=")) {
      flags.clusterrole = arg.slice("--clusterrole=".length);
    } else if (arg === "--serviceaccount") {
      flags.serviceaccount = next();
    } else if (arg.startsWith("--serviceaccount=")) {
      flags.serviceaccount = arg.slice("--serviceaccount=".length);
    } else if (arg === "--class") {
      flags.ingressClass = next();
    } else if (arg.startsWith("--class=")) {
      flags.ingressClass = arg.slice("--class=".length);
    } else if (arg === "--rule") {
      flags.rules.push(next());
    } else if (arg.startsWith("--rule=")) {
      flags.rules.push(arg.slice("--rule=".length));
    } else if (arg === "-c" || arg === "--container") {
      flags.container = next();
    } else if (arg.startsWith("--container=")) {
      flags.container = arg.slice("--container=".length);
    } else if (arg.startsWith("--to-revision=")) {
      flags.toRevision = Number(arg.slice("--to-revision=".length));
    } else if (arg === "--to-revision") {
      flags.toRevision = Number(next());
    } else if (arg.startsWith("-")) {
      // ignore unknown flags gracefully
    } else {
      positionals.push(arg);
    }
  }

  return { positionals, flags, execCommand };
}

function deepMerge(target, source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return source;
  }
  const out = target && typeof target === "object" && !Array.isArray(target) ? { ...target } : {};
  for (const [k, v] of Object.entries(source)) {
    if (v === null) {
      delete out[k];
    } else if (typeof v === "object" && !Array.isArray(v)) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function formatLabels(labelsObj) {
  if (!labelsObj || Object.keys(labelsObj).length === 0) return "<none>";
  return Object.entries(labelsObj)
    .map(([k, v]) => `${k}=${v}`)
    .join(",");
}

function matchesSelector(resource, selectorStr) {
  if (!selectorStr) return true;
  const labels = resource.metadata?.labels || {};
  const parts = selectorStr.split(",").map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes("=")) {
      const [k, v] = part.split("=");
      if (String(labels[k.trim()]) !== String(v.trim())) return false;
    } else if (!(part in labels)) {
      return false;
    }
  }
  return true;
}

function evaluateJsonPath(obj, expr) {
  let clean = expr.trim();
  if (clean.startsWith("{") && clean.endsWith("}")) {
    clean = clean.slice(1, -1).trim();
  }
  if (clean.startsWith(".")) clean = clean.slice(1);
  if (!clean) return JSON.stringify(obj);

  const tokens = clean.split(".").filter(Boolean);
  let cur = obj;
  for (const tok of tokens) {
    if (cur == null) return "";
    const arrMatch = tok.match(/^([^\[]+)\[(\d+|\*)\]$/);
    if (arrMatch) {
      const prop = arrMatch[1];
      const idx = arrMatch[2];
      cur = cur[prop];
      if (!Array.isArray(cur)) return "";
      if (idx === "*") {
        cur = cur;
      } else {
        cur = cur[Number(idx)];
      }
    } else {
      if (Array.isArray(cur)) {
        cur = cur.map((item) => (item ? item[tok] : undefined));
      } else {
        cur = cur[tok];
      }
    }
  }
  if (cur == null) return "";
  if (Array.isArray(cur)) return cur.join(" ");
  if (typeof cur === "object") return JSON.stringify(cur);
  return String(cur);
}

function printTable(headers, rows) {
  if (rows.length === 0) return;
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length))
  );
  const formatRow = (r) =>
    r
      .map((cell, i) => (i === r.length - 1 ? String(cell ?? "") : String(cell ?? "").padEnd(widths[i] + 3)))
      .join("");
  console.log(formatRow(headers));
  for (const r of rows) {
    console.log(formatRow(r));
  }
}

function handleGet(state, positionals, flags) {
  const rawTypes = positionals[0];
  if (!rawTypes) {
    console.error("error: Required resource not specified.");
    process.exit(1);
  }
  let targetName = positionals[1] || null;
  let typeTokens = rawTypes.split(",").filter(Boolean);

  if (rawTypes.includes("/") && !rawTypes.includes(",")) {
    const [t, n] = rawTypes.split("/");
    typeTokens = [t];
    targetName = n;
  }

  const expandedInfos = [];
  for (const t of typeTokens) {
    if (t.toLowerCase() === "all") {
      for (const k of ["Pod", "Service", "Deployment", "Job", "CronJob"]) {
        expandedInfos.push(normalizeKind(k));
      }
    } else {
      expandedInfos.push(normalizeKind(t));
    }
  }

  const ns = flags.namespace || state.currentNamespace || "default";
  const matched = [];

  for (const info of expandedInfos) {
    if (info.kind === "Namespace") {
      for (const n of state.namespaces) {
        if (targetName && n !== targetName) continue;
        matched.push({
          apiVersion: "v1",
          kind: "Namespace",
          metadata: { name: n, labels: { "kubernetes.io/metadata.name": n } },
          status: { phase: "Active" }
        });
      }
      continue;
    }

    for (const r of state.resources) {
      if (r.kind !== info.kind) continue;
      if (info.namespaced && !flags.allNamespaces && (r.metadata?.namespace || "default") !== ns) {
        continue;
      }
      if (targetName && r.metadata?.name !== targetName) continue;
      if (!matchesSelector(r, flags.selector)) continue;
      matched.push(r);
    }
  }

  if (targetName && matched.length === 0) {
    const info = expandedInfos[0];
    console.error(`Error from server (NotFound): ${info.plural} "${targetName}" not found`);
    process.exit(1);
  }

  if (flags.output) {
    const outFmt = flags.output;
    const payload = targetName && matched.length === 1 ? matched[0] : { apiVersion: "v1", kind: "List", items: matched };
    if (outFmt === "yaml") {
      process.stdout.write(dumpYaml(payload));
      return;
    }
    if (outFmt === "json") {
      const clean = JSON.parse(JSON.stringify(payload, (k, v) => (k.startsWith("_") ? undefined : v)));
      console.log(JSON.stringify(clean, null, 2));
      return;
    }
    if (outFmt === "name") {
      for (const r of matched) {
        const info = normalizeKind(r.kind);
        console.log(`${info.short}/${r.metadata.name}`);
      }
      return;
    }
    if (outFmt.startsWith("jsonpath=")) {
      const expr = outFmt.slice("jsonpath=".length);
      process.stdout.write(evaluateJsonPath(payload, expr));
      return;
    }
  }

  if (matched.length === 0) {
    console.log(`No resources found in ${flags.allNamespaces ? "any" : ns} namespace.`);
    return;
  }

  const multiKind = expandedInfos.length > 1;
  const headers = [];
  if (flags.allNamespaces) headers.push("NAMESPACE");
  headers.push("NAME");

  const singleKind = !multiKind ? expandedInfos[0].kind : null;
  if (singleKind === "Pod" || multiKind) {
    headers.push("READY", "STATUS", "RESTARTS", "AGE");
    if (flags.output === "wide") headers.push("IP", "NODE");
  } else if (singleKind === "Deployment") {
    headers.push("READY", "UP-TO-DATE", "AVAILABLE", "AGE");
  } else if (singleKind === "Service") {
    headers.push("TYPE", "CLUSTER-IP", "EXTERNAL-IP", "PORT(S)", "AGE");
  } else if (singleKind === "PersistentVolume") {
    headers.push("CAPACITY", "ACCESS MODES", "RECLAIM POLICY", "STATUS", "CLAIM", "STORAGECLASS", "AGE");
  } else if (singleKind === "PersistentVolumeClaim") {
    headers.push("STATUS", "VOLUME", "CAPACITY", "ACCESS MODES", "STORAGECLASS", "AGE");
  } else if (singleKind === "CronJob") {
    headers.push("SCHEDULE", "SUSPEND", "ACTIVE", "LAST SCHEDULE", "AGE");
  } else if (singleKind === "Ingress") {
    headers.push("CLASS", "HOSTS", "ADDRESS", "PORTS", "AGE");
  } else {
    headers.push("AGE");
  }
  if (flags.showLabels) headers.push("LABELS");

  const rows = matched.map((r) => {
    const info = normalizeKind(r.kind);
    const row = [];
    if (flags.allNamespaces) row.push(r.metadata?.namespace || "");
    row.push(multiKind ? `${info.short}/${r.metadata.name}` : r.metadata.name);

    if (singleKind === "Pod" || multiKind) {
      if (r.kind === "Pod") {
        const totalC = (r.spec?.containers || []).length || 1;
        const waitingReason = r.status?.containerStatuses?.[0]?.state?.waiting?.reason;
        const readyC = waitingReason ? 0 : totalC;
        const statusStr = waitingReason || r.status?.phase || "Running";
        const restarts = r.status?.containerStatuses?.[0]?.restartCount || 0;
        row.push(`${readyC}/${totalC}`, statusStr, String(restarts), "2m");
        if (flags.output === "wide") row.push(r.status?.podIP || "10.244.0.15", "ckad-node-01");
      } else if (r.kind === "Service") {
        const ports = (r.spec?.ports || []).map((p) => `${p.port}${p.nodePort ? `:${p.nodePort}` : ""}/TCP`).join(",");
        row.push("-", r.spec?.type || "ClusterIP", ports || "80/TCP", "3m");
      } else if (r.kind === "Deployment") {
        const rep = r.spec?.replicas ?? 1;
        row.push(`${rep}/${rep}`, "Running", "0", "3m");
      } else {
        row.push("1/1", "Active", "0", "3m");
      }
    } else if (singleKind === "Deployment") {
      const rep = r.spec?.replicas ?? 1;
      row.push(`${rep}/${rep}`, String(rep), String(rep), "3m");
    } else if (singleKind === "Service") {
      const svcType = r.spec?.type || "ClusterIP";
      const ports = (r.spec?.ports || [])
        .map((p) => `${p.port}${p.nodePort ? `:${p.nodePort}` : ""}/${p.protocol || "TCP"}`)
        .join(",");
      row.push(svcType, "10.96.14.22", "<none>", ports || "80/TCP", "4m");
    } else if (singleKind === "PersistentVolume") {
      row.push(
        r.spec?.capacity?.storage || "1Gi",
        (r.spec?.accessModes || ["ReadWriteOnce"]).join(","),
        "Retain",
        r.status?.phase || "Available",
        "",
        r.spec?.storageClassName || "standard",
        "2m"
      );
    } else if (singleKind === "PersistentVolumeClaim") {
      row.push(
        "Bound",
        "pv-bound",
        r.spec?.resources?.requests?.storage || "1Gi",
        (r.spec?.accessModes || ["ReadWriteOnce"]).join(","),
        r.spec?.storageClassName || "standard",
        "2m"
      );
    } else if (singleKind === "CronJob") {
      row.push(r.spec?.schedule || "*/5 * * * *", "False", "0", "<none>", "2m");
    } else if (singleKind === "Ingress") {
      const hosts = (r.spec?.rules || []).map((ru) => ru.host || "*").join(",");
      row.push(r.spec?.ingressClassName || "nginx", hosts || "*", "192.168.49.2", "80", "2m");
    } else {
      row.push("2m");
    }

    if (flags.showLabels) {
      row.push(formatLabels(r.metadata?.labels));
    }
    return row;
  });

  printTable(headers, rows);
}

function handleCreate(state, positionals, flags, execCommand) {
  const subType = (positionals[0] || "").toLowerCase();
  const ns = flags.namespace || state.currentNamespace || "default";
  let doc = null;

  if (subType === "ns" || subType === "namespace") {
    const name = positionals[1];
    doc = { apiVersion: "v1", kind: "Namespace", metadata: { name } };
  } else if (subType === "cm" || subType === "configmap") {
    const name = positionals[1];
    const data = {};
    for (const lit of flags.fromLiterals) {
      const eq = lit.indexOf("=");
      if (eq >= 0) data[lit.slice(0, eq)] = lit.slice(eq + 1);
    }
    for (const f of flags.fromFiles) {
      const eq = f.indexOf("=");
      if (eq >= 0) {
        const k = f.slice(0, eq);
        const fp = resolvePath(f.slice(eq + 1));
        data[k] = fs.readFileSync(fp, "utf8");
      } else {
        const fp = resolvePath(f);
        data[path.basename(fp)] = fs.readFileSync(fp, "utf8");
      }
    }
    doc = { apiVersion: "v1", kind: "ConfigMap", metadata: { name, namespace: ns }, data };
  } else if (subType === "secret") {
    // kubectl create secret generic <name> --from-literal=k=v
    const secType = positionals[1] === "generic" || positionals[1] === "tls" || positionals[1] === "docker-registry" ? positionals[1] : "generic";
    const name = positionals[1] === secType ? positionals[2] : positionals[1];
    const data = {};
    for (const lit of flags.fromLiterals) {
      const eq = lit.indexOf("=");
      if (eq >= 0) {
        const k = lit.slice(0, eq);
        const v = lit.slice(eq + 1);
        data[k] = Buffer.from(v, "utf8").toString("base64");
      }
    }
    doc = { apiVersion: "v1", kind: "Secret", metadata: { name, namespace: ns }, type: "Opaque", data };
  } else if (subType === "sa" || subType === "serviceaccount") {
    const name = positionals[1];
    doc = { apiVersion: "v1", kind: "ServiceAccount", metadata: { name, namespace: ns } };
  } else if (subType === "role") {
    const name = positionals[1];
    const resources = flags.resources.map((r) => {
      const info = normalizeKind(r);
      return info ? info.plural : r;
    });
    doc = {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "Role",
      metadata: { name, namespace: ns },
      rules: [
        {
          apiGroups: [""],
          resources,
          verbs: flags.verbs
        }
      ]
    };
  } else if (subType === "rolebinding") {
    const name = positionals[1];
    const [saNs, saName] = (flags.serviceaccount || `${ns}:default`).split(":");
    doc = {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "RoleBinding",
      metadata: { name, namespace: ns },
      roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: flags.clusterrole ? "ClusterRole" : "Role",
        name: flags.role || flags.clusterrole || "default"
      },
      subjects: [
        {
          kind: "ServiceAccount",
          name: saName || saNs,
          namespace: saName ? saNs : ns
        }
      ]
    };
  } else if (subType === "ing" || subType === "ingress") {
    const name = positionals[1];
    const rulesByHost = new Map();
    for (const ruleStr of flags.rules) {
      // format: host/path*=service:port or host/path=service:port
      const [hostAndPath, svcAndPort] = ruleStr.split("=");
      const slashIdx = hostAndPath.indexOf("/");
      const host = slashIdx >= 0 ? hostAndPath.slice(0, slashIdx) : hostAndPath;
      let rawPath = slashIdx >= 0 ? hostAndPath.slice(slashIdx) : "/";
      let pathType = "Exact";
      if (rawPath.endsWith("*")) {
        pathType = "Prefix";
        rawPath = rawPath.slice(0, -1) || "/";
      } else {
        pathType = "Prefix";
      }
      const [svcName, portStr] = (svcAndPort || "app:80").split(":");
      const portNum = Number(portStr) || 80;
      if (!rulesByHost.has(host)) {
        rulesByHost.set(host, []);
      }
      rulesByHost.get(host).push({
        path: rawPath,
        pathType,
        backend: {
          service: {
            name: svcName,
            port: { number: portNum }
          }
        }
      });
    }
    const rules = Array.from(rulesByHost.entries()).map(([host, paths]) => ({
      host,
      http: { paths }
    }));
    doc = {
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: { name, namespace: ns },
      spec: {
        ...(flags.ingressClass ? { ingressClassName: flags.ingressClass } : {}),
        rules
      }
    };
  } else if (subType === "cj" || subType === "cronjob") {
    const name = positionals[1];
    const cmd = execCommand.length > 0 ? execCommand : positionals.slice(2);
    doc = {
      apiVersion: "batch/v1",
      kind: "CronJob",
      metadata: { name, namespace: ns },
      spec: {
        schedule: flags.schedule || "*/5 * * * *",
        jobTemplate: {
          metadata: { name },
          spec: {
            template: {
              spec: {
                restartPolicy: flags.restart || "OnFailure",
                containers: [
                  {
                    name,
                    image: flags.image || "busybox:1.36",
                    ...(cmd.length > 0 ? { command: cmd } : {})
                  }
                ]
              }
            }
          }
        }
      }
    };
  } else if (subType === "deploy" || subType === "deployment") {
    const name = positionals[1];
    const replicas = flags.replicas ?? 1;
    doc = {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: { name, namespace: ns, labels: { app: name } },
      spec: {
        replicas,
        selector: { matchLabels: { app: name } },
        template: {
          metadata: { labels: { app: name } },
          spec: {
            containers: [
              {
                name,
                image: flags.image || "nginx:1.25-alpine",
                ...(flags.port ? { ports: [{ containerPort: Number(flags.port) }] } : {})
              }
            ]
          }
        }
      }
    };
  } else if (flags.filenames.length > 0) {
    for (const f of flags.filenames) {
      const docs = loadDocsFromFilenameArg(f);
      for (const d of docs) {
        const res = upsertResource(state, d, flags.namespace);
        console.log(`${res.info.short}/${res.name} created`);
      }
    }
    saveClusterState(state);
    return;
  } else {
    console.error(`error: unknown resource type "${subType}" for kubectl create`);
    process.exit(1);
  }

  if (!flags.dryRun) {
    const res = upsertResource(state, doc, ns);
    saveClusterState(state);
    if (!flags.output) {
      console.log(`${res.info.short}/${res.name} created`);
    }
  }

  if (flags.output === "yaml") {
    process.stdout.write(dumpYaml(doc));
  } else if (flags.output === "json") {
    console.log(JSON.stringify(doc, null, 2));
  } else if (flags.dryRun) {
    const info = normalizeKind(doc.kind);
    console.log(`${info.short}/${doc.metadata.name} created (dry run)`);
  }
}

function handleRun(state, positionals, flags, execCommand) {
  const name = positionals[0];
  if (!name) {
    console.error("error: pod name is required for kubectl run");
    process.exit(1);
  }
  const ns = flags.namespace || state.currentNamespace || "default";
  const labels = { run: name };
  if (flags.selector) {
    for (const part of flags.selector.split(",")) {
      const [k, v] = part.split("=");
      if (k && v) labels[k.trim()] = v.trim();
    }
  }
  const cmd = execCommand.length > 0 ? execCommand : positionals.slice(1);
  const doc = {
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name, namespace: ns, labels },
    spec: {
      restartPolicy: flags.restart || "Always",
      containers: [
        {
          name,
          image: flags.image || "nginx:1.25-alpine",
          ...(flags.port ? { ports: [{ containerPort: Number(flags.port) }] } : {}),
          ...(cmd.length > 0 ? { command: cmd } : {})
        }
      ]
    }
  };

  if (!flags.dryRun) {
    upsertResource(state, doc, ns);
    saveClusterState(state);
    if (!flags.output) {
      console.log(`pod/${name} created`);
    }
  }

  if (flags.output === "yaml") {
    process.stdout.write(dumpYaml(doc));
  } else if (flags.output === "json") {
    console.log(JSON.stringify(doc, null, 2));
  }
}

function findTargetResource(state, kindArg, nameArg, nsArg) {
  let k = kindArg;
  let n = nameArg;
  let extraPositional = null;
  if (kindArg && kindArg.includes("/")) {
    const parts = kindArg.split("/");
    k = parts[0];
    n = parts[1];
    extraPositional = nameArg;
  }
  const info = normalizeKind(k);
  const ns = nsArg || state.currentNamespace || "default";
  const idx = state.resources.findIndex(
    (r) =>
      r.kind === info.kind &&
      r.metadata?.name === n &&
      (info.namespaced ? (r.metadata?.namespace || "default") === ns : true)
  );
  return { info, name: n, ns, idx, resource: idx >= 0 ? state.resources[idx] : null, extraPositional };
}

function main() {
  const rawArgv = process.argv.slice(2);
  if (rawArgv.length === 0 || rawArgv[0] === "--help" || rawArgv[0] === "-h" || rawArgv[0] === "help") {
    console.log("kubectl controls the KubeMastery CKAD Kubernetes cluster manager.");
    process.exit(0);
  }

  const { positionals, flags, execCommand } = parseArgs(rawArgv);
  const cmd = positionals[0];
  const rest = positionals.slice(1);
  const state = loadClusterState();

  try {
    if (cmd === "version") {
      console.log("Client Version: v1.31.0\nKustomize Version: v5.4.2\nServer Version: v1.31.0-ckad");
      return;
    }

    if (cmd === "config") {
      if (rest[0] === "set-context" && flags.namespace) {
        state.currentNamespace = flags.namespace;
        saveClusterState(state);
        console.log(`Context "kubernetes-admin@kubernetes" modified.`);
      } else if (rest[0] === "view" || rest[0] === "current-context") {
        console.log("kubernetes-admin@kubernetes");
      }
      return;
    }

    if (cmd === "kustomize") {
      const dir = rest[0] || flags.kustomize || ".";
      const docs = buildKustomizeResources(dir);
      const out = docs.map((d) => dumpYaml(d).trim()).join("\n---\n") + "\n";
      process.stdout.write(out);
      return;
    }

    if (cmd === "apply" || cmd === "replace") {
      const docs = [];
      if (flags.kustomize) {
        docs.push(...buildKustomizeResources(flags.kustomize));
      }
      for (const f of flags.filenames) {
        docs.push(...loadDocsFromFilenameArg(f));
      }
      if (docs.length === 0) {
        console.error("error: must specify one of -f and -k");
        process.exit(1);
      }
      for (const doc of docs) {
        const res = upsertResource(state, doc, flags.namespace);
        if (res) {
          console.log(`${res.info.short}/${res.name} ${cmd === "replace" ? "replaced" : res.action}`);
        }
      }
      saveClusterState(state);
      return;
    }

    if (cmd === "get") {
      handleGet(state, rest, flags);
      return;
    }

    if (cmd === "create") {
      handleCreate(state, rest, flags, execCommand);
      return;
    }

    if (cmd === "run") {
      handleRun(state, rest, flags, execCommand);
      return;
    }

    if (cmd === "delete") {
      if (flags.filenames.length > 0) {
        for (const f of flags.filenames) {
          const docs = loadDocsFromFilenameArg(f);
          for (const d of docs) {
            const { info, name, idx } = findTargetResource(
              state,
              d.kind,
              d.metadata?.name,
              d.metadata?.namespace || flags.namespace
            );
            if (idx >= 0) {
              state.resources.splice(idx, 1);
              console.log(`${info.short} "${name}" deleted`);
            } else if (!flags.ignoreNotFound) {
              console.error(`Error from server (NotFound): ${info.plural} "${name}" not found`);
              process.exit(1);
            }
          }
        }
        saveClusterState(state);
        return;
      }

      const { info, name, idx } = findTargetResource(state, rest[0], rest[1], flags.namespace);
      if (idx >= 0) {
        state.resources.splice(idx, 1);
        saveClusterState(state);
        console.log(`${info.short} "${name}" deleted`);
      } else if (!flags.ignoreNotFound) {
        console.error(`Error from server (NotFound): ${info.plural} "${name}" not found`);
        process.exit(1);
      }
      return;
    }

    if (cmd === "scale") {
      const { info, name, resource } = findTargetResource(state, rest[0], rest[1], flags.namespace);
      if (!resource) {
        console.error(`Error from server (NotFound): ${info.plural} "${name}" not found`);
        process.exit(1);
      }
      if (flags.replicas !== null && !Number.isNaN(flags.replicas)) {
        if (!resource.spec) resource.spec = {};
        resource.spec.replicas = Number(flags.replicas);
      }
      saveClusterState(state);
      console.log(`${info.short}/${name} scaled`);
      return;
    }

    if (cmd === "patch") {
      const { info, name, idx, resource } = findTargetResource(state, rest[0], rest[1], flags.namespace);
      if (!resource) {
        console.error(`Error from server (NotFound): ${info.plural} "${name}" not found`);
        process.exit(1);
      }
      const patchDocs = parseYamlDocs(flags.patch || "{}");
      const patchObj = patchDocs[0] || {};
      state.resources[idx] = deepMerge(resource, patchObj);
      saveClusterState(state);
      console.log(`${info.short}/${name} patched`);
      return;
    }

    if (cmd === "rollout") {
      const sub = rest[0];
      const { info, name, resource } = findTargetResource(state, rest[1], rest[2], flags.namespace);
      if (!resource) {
        console.error(`Error from server (NotFound): ${info.plural} "${name}" not found`);
        process.exit(1);
      }
      if (sub === "status") {
        console.log(`deployment "${name}" successfully rolled out`);
        return;
      }
      if (sub === "history") {
        const history = resource._revisionHistory || [{ revision: 1, image: "nginx:1.25-alpine", changeCause: "<none>" }];
        console.log(`deployment.apps/${name} `);
        console.log(`REVISION  CHANGE-CAUSE`);
        for (const rev of history) {
          console.log(`${String(rev.revision).padEnd(9)} ${rev.changeCause || "<none>"}`);
        }
        return;
      }
      if (sub === "undo") {
        const history = resource._revisionHistory || [
          { revision: 1, image: "nginx:1.25-alpine", changeCause: "Initial stable release" }
        ];
        let targetRev = history[0];
        if (flags.toRevision) {
          targetRev = history.find((h) => Number(h.revision) === Number(flags.toRevision)) || history[0];
        } else if (history.length >= 2) {
          targetRev = history[history.length - 2];
        }
        if (resource.spec?.template?.spec?.containers?.[0] && targetRev?.image) {
          resource.spec.template.spec.containers[0].image = targetRev.image;
        }
        const maxRev = Math.max(...history.map((h) => Number(h.revision) || 1));
        resource._revisionHistory = [
          ...history.filter((h) => h.revision !== targetRev.revision),
          {
            revision: 1,
            image: targetRev.image,
            changeCause: targetRev.changeCause || "Initial stable release"
          },
          {
            revision: maxRev + 1,
            image: targetRev.image,
            changeCause: `Rolled back to revision ${targetRev.revision}`
          }
        ];
        saveClusterState(state);
        console.log(`deployment.apps/${name} rolled back`);
        return;
      }
    }

    if (cmd === "logs") {
      const podName = rest[0]?.includes("/") ? rest[0].split("/")[1] : rest[0];
      const { resource } = findTargetResource(state, "Pod", podName, flags.namespace);
      if (!resource) {
        console.error(`Error from server (NotFound): pods "${podName}" not found`);
        process.exit(1);
      }
      if (resource._logs) {
        console.log(resource._logs);
        return;
      }
      const cmdArr = [...(resource.spec?.containers?.[0]?.command || []), ...(resource.spec?.containers?.[0]?.args || [])];
      const joined = cmdArr.join(" ");
      console.log(`2026-10-28T10:00:00Z INFO Container started: ${joined || "ready"}`);
      return;
    }

    if (cmd === "describe") {
      const { info, name, resource } = findTargetResource(state, rest[0], rest[1], flags.namespace);
      if (!resource) {
        console.error(`Error from server (NotFound): ${info.plural} "${name}" not found`);
        process.exit(1);
      }
      console.log(`Name:         ${resource.metadata?.name}`);
      console.log(`Namespace:    ${resource.metadata?.namespace || "<none>"}`);
      console.log(`Labels:       ${formatLabels(resource.metadata?.labels)}`);
      console.log(`Kind:         ${resource.kind}`);
      console.log(`API Version:  ${resource.apiVersion}`);
      console.log(`---`);
      process.stdout.write(dumpYaml(resource));
      return;
    }

    if (cmd === "expose") {
      const { info, name, resource, ns } = findTargetResource(state, rest[0], rest[1], flags.namespace);
      if (!resource) {
        console.error(`Error from server (NotFound): ${info.plural} "${name}" not found`);
        process.exit(1);
      }
      const svcName = flags.name || name;
      const selector =
        resource.spec?.selector?.matchLabels ||
        resource.spec?.template?.metadata?.labels ||
        resource.metadata?.labels ||
        { app: name };
      const port = Number(flags.port) || 80;
      const targetPort = Number(flags.targetPort) || port;
      const svcDoc = {
        apiVersion: "v1",
        kind: "Service",
        metadata: { name: svcName, namespace: ns },
        spec: {
          type: flags.type || "ClusterIP",
          selector,
          ports: [{ port, targetPort, protocol: "TCP" }]
        }
      };
      if (!flags.dryRun) {
        upsertResource(state, svcDoc, ns);
        saveClusterState(state);
        if (!flags.output) {
          console.log(`service/${svcName} exposed`);
        }
      }
      if (flags.output === "yaml") {
        process.stdout.write(dumpYaml(svcDoc));
      } else if (flags.output === "json") {
        console.log(JSON.stringify(svcDoc, null, 2));
      }
      return;
    }

    if (cmd === "label") {
      const { info, name, resource } = findTargetResource(state, rest[0], rest[1], flags.namespace);
      if (!resource) {
        console.error(`Error from server (NotFound): ${info.plural} "${name}" not found`);
        process.exit(1);
      }
      if (!resource.metadata.labels) resource.metadata.labels = {};
      const labelArgs = rest[0]?.includes("/") ? rest.slice(1) : rest.slice(2);
      for (const la of labelArgs) {
        if (la.endsWith("-")) {
          delete resource.metadata.labels[la.slice(0, -1)];
        } else if (la.includes("=")) {
          const [k, v] = la.split("=");
          resource.metadata.labels[k] = v;
        }
      }
      saveClusterState(state);
      console.log(`${info.short}/${name} labeled`);
      return;
    }

    if (cmd === "edit") {
      const { info, name, idx, resource } = findTargetResource(state, rest[0], rest[1], flags.namespace);
      if (!resource) {
        console.error(`Error from server (NotFound): ${info.plural} "${name}" not found`);
        process.exit(1);
      }
      const tmpFile = path.join(os.tmpdir(), `kubectl-edit-${name}-${Date.now()}.yaml`);
      fs.writeFileSync(tmpFile, dumpYaml(resource), "utf8");
      const editor = process.env.KUBE_EDITOR || process.env.EDITOR || "vi";
      const parts = editor.split(" ");
      spawnSync(parts[0], [...parts.slice(1), tmpFile], { stdio: "inherit" });
      const editedDocs = parseYamlDocs(fs.readFileSync(tmpFile, "utf8"));
      if (editedDocs[0]) {
        state.resources[idx] = editedDocs[0];
        saveClusterState(state);
        console.log(`${info.short}/${name} edited`);
      }
      try {
        fs.unlinkSync(tmpFile);
      } catch (_) {}
      return;
    }

    console.error(`error: unknown command "${cmd}"`);
    process.exit(1);
  } catch (err) {
    console.error(err.message || String(err));
    process.exit(1);
  }
}

main();
