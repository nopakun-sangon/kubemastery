/**
 * KubeMastery: Smart Kubectl Command Parser & Evaluator Engine
 * Handles realistic exam CLI variations:
 *  - Alias 'k' -> 'kubectl'
 *  - Exam env vars: '$do' -> '--dry-run=client -o yaml', '$now' -> '--force --grace-period=0'
 *  - Resource shortnames: po->pod, deploy->deployment, svc->service, cm->configmap, sa->serviceaccount, ing->ingress, netpol->networkpolicy, ns->namespace
 *  - Slash syntax: 'deployment/webapp' <-> 'deployment webapp'
 *  - Order-independent flags: '--image=nginx' <-> '--image nginx', '-oyaml' <-> '-o yaml'
 */

class KubectlEngine {
  constructor() {
    this.RESOURCE_MAP = {
      po: "pod",
      pod: "pod",
      pods: "pod",
      deploy: "deployment",
      deployment: "deployment",
      deployments: "deployment",
      svc: "service",
      service: "service",
      services: "service",
      cm: "configmap",
      configmap: "configmap",
      configmaps: "configmap",
      sec: "secret",
      secret: "secret",
      secrets: "secret",
      sa: "serviceaccount",
      serviceaccount: "serviceaccount",
      serviceaccounts: "serviceaccount",
      ing: "ingress",
      ingress: "ingress",
      ingresses: "ingress",
      netpol: "networkpolicy",
      networkpolicy: "networkpolicy",
      networkpolicies: "networkpolicy",
      ns: "namespace",
      namespace: "namespace",
      namespaces: "namespace",
      no: "node",
      node: "node",
      nodes: "node",
      job: "job",
      jobs: "job",
      cj: "cronjob",
      cronjob: "cronjob",
      cronjobs: "cronjob",
      role: "role",
      roles: "role",
      rolebinding: "rolebinding",
      rolebindings: "rolebinding",
      pv: "persistentvolume",
      persistentvolume: "persistentvolume",
      pvc: "persistentvolumeclaim",
      persistentvolumeclaim: "persistentvolumeclaim"
    };

    this.FLAG_ALIASES = {
      namespace: "n",
      output: "o",
      filename: "f",
      kustomize: "k",
      selector: "l"
    };

    this.BOOLEAN_FLAGS = new Set([
      "expose",
      "ignore-daemonsets",
      "delete-emptydir-data",
      "delete-local-data",
      "force",
      "record",
      "all",
      "A",
      "a"
    ]);
  }

  normalizeResource(res) {
    if (!res) return null;
    const lower = res.toLowerCase().trim();
    return this.RESOURCE_MAP[lower] || lower;
  }

  tokenize(rawInput) {
    if (!rawInput || typeof rawInput !== "string") return [];
    // Expand common exam environment variables
    let expanded = rawInput
      .trim()
      .replace(/\$do\b/g, "--dry-run=client -o yaml")
      .replace(/\$now\b/g, "--force --grace-period=0");

    // Strip trailing redirection like '> pod.yaml' if present so users aren't penalized
    expanded = expanded.replace(/>\s*\S+$/, "").trim();

    const tokens = [];
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    let match;
    while ((match = regex.exec(expanded)) !== null) {
      tokens.push(match[1] !== undefined ? match[1] : match[2] !== undefined ? match[2] : match[0]);
    }
    return tokens;
  }

  parse(rawInput) {
    const rawTokens = this.tokenize(rawInput);
    if (rawTokens.length === 0) {
      return { valid: false, error: "กรุณาพิมพ์คำสั่ง kubectl" };
    }

    const binary = rawTokens[0];
    if (binary !== "kubectl" && binary !== "k") {
      return {
        valid: false,
        error: `คำสั่งต้องขึ้นต้นด้วย 'kubectl' หรือ alias 'k' (พบ: '${binary}')`
      };
    }

    const subcommand = rawTokens[1] || "";
    const positional = [];
    const flags = {};
    let resource = null;

    let i = 2;
    while (i < rawTokens.length) {
      const token = rawTokens[i];

      // Handle combined short flags like -oyaml or -nweb
      if (token.startsWith("-o") && token.length > 2 && !token.startsWith("--")) {
        flags["o"] = token.slice(2);
        i++;
        continue;
      }
      if (token.startsWith("-n") && token.length > 2 && !token.startsWith("--")) {
        flags["n"] = token.slice(2);
        i++;
        continue;
      }

      if (token.startsWith("-")) {
        const cleanFlag = token.replace(/^-+/, "");
        if (cleanFlag.includes("=")) {
          const eqIdx = cleanFlag.indexOf("=");
          const rawKey = cleanFlag.slice(0, eqIdx);
          const val = cleanFlag.slice(eqIdx + 1).replace(/^['"]|['"]$/g, "");
          const key = this.FLAG_ALIASES[rawKey] || rawKey;
          flags[key] = val;
          i++;
        } else {
          const key = this.FLAG_ALIASES[cleanFlag] || cleanFlag;
          if (this.BOOLEAN_FLAGS.has(key) || i + 1 >= rawTokens.length || rawTokens[i + 1].startsWith("-")) {
            flags[key] = true;
            i++;
          } else {
            flags[key] = rawTokens[i + 1].replace(/^['"]|['"]$/g, "");
            i += 2;
          }
        }
      } else {
        // Check slash notation e.g. deployment/webapp
        if (token.includes("/") && !token.includes("=")) {
          const parts = token.split("/");
          const maybeRes = this.normalizeResource(parts[0]);
          if (this.RESOURCE_MAP[parts[0].toLowerCase()] && !resource) {
            resource = maybeRes;
            positional.push(parts.slice(1).join("/"));
            i++;
            continue;
          }
        }

        // Identify resource token for commands like create, scale, expose, set, rollout, taint
        if (
          !resource &&
          ["create", "scale", "expose", "set", "rollout", "taint", "get", "describe", "delete"].includes(subcommand) &&
          this.RESOURCE_MAP[token.toLowerCase()]
        ) {
          resource = this.normalizeResource(token);
        } else {
          positional.push(token);
        }
        i++;
      }
    }

    return {
      valid: true,
      subcommand,
      resource,
      positional,
      flags
    };
  }

  evaluate(userInput, validationSpec) {
    const parsed = this.parse(userInput);
    if (!parsed.valid) {
      return { passed: false, feedback: parsed.error };
    }

    // 1. Check subcommand
    if (validationSpec.subcommand && parsed.subcommand !== validationSpec.subcommand) {
      return {
        passed: false,
        feedback: `Subcommand ไม่ถูกต้อง: คาดหวัง '${validationSpec.subcommand}' แต่พบ '${parsed.subcommand || "(ว่าง)"}'`
      };
    }

    // 2. Check resource type (if required)
    if (validationSpec.resource) {
      const expectedRes = this.normalizeResource(validationSpec.resource);
      if (parsed.resource !== expectedRes) {
        return {
          passed: false,
          feedback: `Resource Type ไม่ถูกต้อง: คาดหวัง '${expectedRes}' แต่พบ '${parsed.resource || "(ไม่ได้ระบุ)"}'`
        };
      }
    }

    // 3. Check required positional arguments
    if (Array.isArray(validationSpec.positional)) {
      for (const reqPos of validationSpec.positional) {
        const found = parsed.positional.some((p) => p.trim() === reqPos.trim());
        if (!found) {
          return {
            passed: false,
            feedback: `ขาดพารามิเตอร์หรือชื่อที่กำหนดในโจทย์: '${reqPos}'`
          };
        }
      }
    }

    // 4. Check required flags
    if (validationSpec.flags) {
      for (const [rawKey, expectedVal] of Object.entries(validationSpec.flags)) {
        const key = this.FLAG_ALIASES[rawKey] || rawKey;
        const actualVal = parsed.flags[key];

        if (actualVal === undefined) {
          const displayFlag = key.length === 1 ? `-${key}` : `--${key}`;
          return {
            passed: false,
            feedback: `ขาด Flag สำคัญ: '${displayFlag}${expectedVal === true ? "" : "=" + expectedVal}'`
          };
        }

        if (expectedVal !== true && String(actualVal).trim() !== String(expectedVal).trim()) {
          const displayFlag = key.length === 1 ? `-${key}` : `--${key}`;
          return {
            passed: false,
            feedback: `ค่าของ Flag '${displayFlag}' ไม่ตรงตามโจทย์: คาดหวัง '${expectedVal}' แต่ได้รับ '${actualVal}'`
          };
        }
      }
    }

    return {
      passed: true,
      feedback: "ถูกต้องสมบูรณ์! คำสั่งทำงานได้ตามมาตรฐานการสอบ CNCF"
    };
  }
}

window.kubectlEngine = new KubectlEngine();

