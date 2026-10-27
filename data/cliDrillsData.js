/**
 * KubeMastery - Imperative CLI Speed Playground Dataset
 * Supports flexible evaluation via Smart Kubectl Parser (kubectlEngine.js)
 * as well as interactive Token Chip assembly for mobile/tablet users.
 */

window.cliDrillsData = [
  {
    id: "cli-01",
    category: "Core Pods",
    examTag: "BOTH",
    difficulty: "Easy",
    xp: 15,
    title: "สร้าง Pod YAML ด้วย Dry-Run",
    scenario: "สร้างไฟล์ YAML สำหรับ Pod ชื่อ 'nginx-pod' ที่ใช้อิมเมจ 'nginx:alpine' โดยยังไม่สั่งรันจริงบนคลัสเตอร์ (แสดงผลออกหน้าจอเป็น YAML)",
    canonicalCommand: "kubectl run nginx-pod --image=nginx:alpine --dry-run=client -o yaml",
    validation: {
      subcommand: "run",
      positional: ["nginx-pod"],
      flags: {
        image: "nginx:alpine",
        "dry-run": "client",
        o: "yaml"
      }
    },
    tokens: ["kubectl", "run", "nginx-pod", "--image=nginx:alpine", "--dry-run=client", "-o", "yaml", "create", "--generator"],
    hint: "ใช้คำสั่ง kubectl run <name> --image=<image> ร่วมกับ --dry-run=client -o yaml (หรือใช้ตัวแปร $do แทนได้!)",
    docsKeyword: "kubectl run",
    simulatedOutput: `apiVersion: v1
kind: Pod
metadata:
  labels:
    run: nginx-pod
  name: nginx-pod
spec:
  containers:
  - image: nginx:alpine
    name: nginx-pod`
  },
  {
    id: "cli-02",
    category: "Core Pods",
    examTag: "BOTH",
    difficulty: "Medium",
    xp: 20,
    title: "สร้าง Pod พร้อมเปิด Port และสร้าง ClusterIP Service ทันที",
    scenario: "รัน Pod ชื่อ 'redis-cache' โดยใช้อิมเมจ 'redis:7.2' เปิดพอร์ต 6379 และสั่งให้สร้าง Service แบบ ClusterIP ชื่อเดียวกันในคำสั่งเดียว!",
    canonicalCommand: "kubectl run redis-cache --image=redis:7.2 --port=6379 --expose",
    validation: {
      subcommand: "run",
      positional: ["redis-cache"],
      flags: {
        image: "redis:7.2",
        port: "6379",
        expose: true
      }
    },
    tokens: ["kubectl", "run", "redis-cache", "--image=redis:7.2", "--port=6379", "--expose", "--service", "--target-port=6379"],
    hint: "เติม flag --expose คู่กับ --port=6379 ในคำสั่ง kubectl run",
    docsKeyword: "kubectl run expose",
    simulatedOutput: `service/redis-cache created
pod/redis-cache created`
  },
  {
    id: "cli-03",
    category: "Workloads",
    examTag: "BOTH",
    difficulty: "Easy",
    xp: 15,
    title: "สร้าง Deployment พร้อมกำหนดจำนวน Replicas",
    scenario: "สร้าง Deployment ชื่อ 'frontend-ui' ใน Namespace 'web' โดยใช้อิมเมจ 'httpd:2.4' และกำหนดจำนวน Pod เริ่มต้นเป็น 4 Replicas",
    canonicalCommand: "kubectl create deployment frontend-ui --image=httpd:2.4 --replicas=4 -n web",
    validation: {
      subcommand: "create",
      resource: "deployment",
      positional: ["frontend-ui"],
      flags: {
        image: "httpd:2.4",
        replicas: "4",
        n: "web"
      }
    },
    tokens: ["kubectl", "create", "deployment", "frontend-ui", "--image=httpd:2.4", "--replicas=4", "-n", "web", "run"],
    hint: "ใช้ kubectl create deploy <name> --image=<image> --replicas=4 -n web",
    docsKeyword: "kubectl create deployment",
    simulatedOutput: `deployment.apps/frontend-ui created`
  },
  {
    id: "cli-04",
    category: "Workloads",
    examTag: "BOTH",
    difficulty: "Easy",
    xp: 15,
    title: "ขยายขนาด (Scale) Deployment ด่วน",
    scenario: "ปรับจำนวน Replicas ของ Deployment ชื่อ 'payment-gateway' ใน Namespace 'prod' ให้เพิ่มขึ้นเป็น 8 Replicas",
    canonicalCommand: "kubectl scale deployment payment-gateway --replicas=8 -n prod",
    validation: {
      subcommand: "scale",
      resource: "deployment",
      positional: ["payment-gateway"],
      flags: {
        replicas: "8",
        n: "prod"
      }
    },
    tokens: ["kubectl", "scale", "deployment", "payment-gateway", "--replicas=8", "-n", "prod", "--count=8", "resize"],
    hint: "ใช้ kubectl scale deploy <name> --replicas=8 -n prod",
    docsKeyword: "kubectl scale",
    simulatedOutput: `deployment.apps/payment-gateway scaled`
  },
  {
    id: "cli-05",
    category: "Workloads",
    examTag: "BOTH",
    difficulty: "Medium",
    xp: 20,
    title: "อัปเดตเวอร์ชัน Image ของ Deployment (Rolling Update)",
    scenario: "อัปเดต Container ชื่อ 'api' ที่อยู่ใน Deployment ชื่อ 'order-service' ให้เปลี่ยนไปใช้อิมเมจ 'order-api:v2'",
    canonicalCommand: "kubectl set image deployment/order-service api=order-api:v2",
    validation: {
      subcommand: "set",
      resource: "deployment",
      positional: ["image", "order-service", "api=order-api:v2"],
      flags: {}
    },
    tokens: ["kubectl", "set", "image", "deployment/order-service", "api=order-api:v2", "--image=order-api:v2", "update"],
    hint: "ใช้รูปแบบ kubectl set image deployment/<deploy-name> <container-name>=<new-image>",
    docsKeyword: "kubectl set image",
    simulatedOutput: `deployment.apps/order-service image updated`
  },
  {
    id: "cli-06",
    category: "Workloads",
    examTag: "BOTH",
    difficulty: "Easy",
    xp: 15,
    title: "สั่ง Rollback Deployment ที่อัปเดตพัง",
    scenario: "Deployment ชื่อ 'auth-service' เกิดข้อผิดพลาดหลังอัปเดตล่าสุด จงสั่งย้อนกลับ (Undo) ไปยัง Revision ก่อนหน้าทันที",
    canonicalCommand: "kubectl rollout undo deployment/auth-service",
    validation: {
      subcommand: "rollout",
      resource: "deployment",
      positional: ["undo", "auth-service"],
      flags: {}
    },
    tokens: ["kubectl", "rollout", "undo", "deployment/auth-service", "rollback", "status", "history"],
    hint: "ใช้คำสั่ง kubectl rollout undo deploy <name>",
    docsKeyword: "kubectl rollout undo",
    simulatedOutput: `deployment.apps/auth-service rolled back`
  },
  {
    id: "cli-07",
    category: "Workloads",
    examTag: "CKAD",
    difficulty: "Medium",
    xp: 25,
    title: "สร้าง Job ทันทีโดยโคลนมาจาก CronJob",
    scenario: "มี CronJob ชื่อ 'db-sync' อยู่แล้ว จงสร้าง Job ชื่อ 'manual-sync' เพื่อสั่งรันงานทันทีโดยใช้แม่แบบจาก CronJob ดังกล่าว",
    canonicalCommand: "kubectl create job manual-sync --from=cronjob/db-sync",
    validation: {
      subcommand: "create",
      resource: "job",
      positional: ["manual-sync"],
      flags: {
        from: "cronjob/db-sync"
      }
    },
    tokens: ["kubectl", "create", "job", "manual-sync", "--from=cronjob/db-sync", "--template=db-sync", "run"],
    hint: "ใช้ flag --from=cronjob/<cronjob-name> กับคำสั่ง kubectl create job",
    docsKeyword: "kubectl create job",
    simulatedOutput: `job.batch/manual-sync created`
  },
  {
    id: "cli-08",
    category: "Config & Security",
    examTag: "BOTH",
    difficulty: "Easy",
    xp: 15,
    title: "สร้าง ConfigMap จากค่า Literal",
    scenario: "สร้าง ConfigMap ชื่อ 'app-settings' ที่มีค่า Key-Value คือ 'APP_MODE=production'",
    canonicalCommand: "kubectl create configmap app-settings --from-literal=APP_MODE=production",
    validation: {
      subcommand: "create",
      resource: "configmap",
      positional: ["app-settings"],
      flags: {
        "from-literal": "APP_MODE=production"
      }
    },
    tokens: ["kubectl", "create", "configmap", "app-settings", "--from-literal=APP_MODE=production", "--from-file", "cm"],
    hint: "สามารถใช้ shortname 'cm' แทน 'configmap' ได้: k create cm app-settings --from-literal=APP_MODE=production",
    docsKeyword: "kubectl create configmap",
    simulatedOutput: `configmap/app-settings created`
  },
  {
    id: "cli-09",
    category: "Config & Security",
    examTag: "BOTH",
    difficulty: "Medium",
    xp: 20,
    title: "สร้าง Generic Secret จากค่า Literal",
    scenario: "สร้าง Secret ชนิด generic ชื่อ 'db-credentials' โดยมีค่า 'password=SuperSecret99'",
    canonicalCommand: "kubectl create secret generic db-credentials --from-literal=password=SuperSecret99",
    validation: {
      subcommand: "create",
      resource: "secret",
      positional: ["generic", "db-credentials"],
      flags: {
        "from-literal": "password=SuperSecret99"
      }
    },
    tokens: ["kubectl", "create", "secret", "generic", "db-credentials", "--from-literal=password=SuperSecret99", "tls", "--literal"],
    hint: "อย่าลืมระบุชนิดของ Secret คือ 'generic' หลังคำว่า secret เสมอ!",
    docsKeyword: "kubectl create secret generic",
    simulatedOutput: `secret/db-credentials created`
  },
  {
    id: "cli-10",
    category: "Config & Security",
    examTag: "BOTH",
    difficulty: "Hard",
    xp: 25,
    title: "สร้าง Role สำหรับอ่าน Pods และ Logs (RBAC)",
    scenario: "สร้าง Role ชื่อ 'log-auditor' ใน Namespace 'audit' ที่อนุญาตให้ทำ verb 'get,list' กับ resource 'pods,pods/log'",
    canonicalCommand: "kubectl create role log-auditor --verb=get,list --resource=pods,pods/log -n audit",
    validation: {
      subcommand: "create",
      resource: "role",
      positional: ["log-auditor"],
      flags: {
        verb: "get,list",
        resource: "pods,pods/log",
        n: "audit"
      }
    },
    tokens: ["kubectl", "create", "role", "log-auditor", "--verb=get,list", "--resource=pods,pods/log", "-n", "audit", "rolebinding"],
    hint: "ใช้ kubectl create role <name> --verb=get,list --resource=pods,pods/log -n audit",
    docsKeyword: "kubectl create role",
    simulatedOutput: `role.rbac.authorization.k8s.io/log-auditor created`
  },
  {
    id: "cli-11",
    category: "Config & Security",
    examTag: "BOTH",
    difficulty: "Hard",
    xp: 25,
    title: "ผูกสิทธิ์ด้วย RoleBinding ให้กับ ServiceAccount",
    scenario: "สร้าง RoleBinding ชื่อ 'auditor-binding' ใน Namespace 'audit' โดยผูก Role 'log-auditor' เข้ากับ ServiceAccount 'audit:bot-sa'",
    canonicalCommand: "kubectl create rolebinding auditor-binding --role=log-auditor --serviceaccount=audit:bot-sa -n audit",
    validation: {
      subcommand: "create",
      resource: "rolebinding",
      positional: ["auditor-binding"],
      flags: {
        role: "log-auditor",
        serviceaccount: "audit:bot-sa",
        n: "audit"
      }
    },
    tokens: ["kubectl", "create", "rolebinding", "auditor-binding", "--role=log-auditor", "--serviceaccount=audit:bot-sa", "-n", "audit"],
    hint: "รูปแบบของ --serviceaccount ต้องเป็น <namespace>:<sa-name> เสมอ!",
    docsKeyword: "kubectl create rolebinding",
    simulatedOutput: `rolebinding.rbac.authorization.k8s.io/auditor-binding created`
  },
  {
    id: "cli-12",
    category: "Config & Security",
    examTag: "BOTH",
    difficulty: "Medium",
    xp: 20,
    title: "ตรวจสอบสิทธิ์ RBAC ด้วย auth can-i",
    scenario: "ตรวจสอบว่า ServiceAccount 'system:serviceaccount:audit:bot-sa' มีสิทธิ์ 'delete' resource 'pods' ใน Namespace 'audit' หรือไม่",
    canonicalCommand: "kubectl auth can-i delete pods --as=system:serviceaccount:audit:bot-sa -n audit",
    validation: {
      subcommand: "auth",
      positional: ["can-i", "delete", "pods"],
      flags: {
        as: "system:serviceaccount:audit:bot-sa",
        n: "audit"
      }
    },
    tokens: ["kubectl", "auth", "can-i", "delete", "pods", "--as=system:serviceaccount:audit:bot-sa", "-n", "audit", "check"],
    hint: "ใช้คำสั่ง kubectl auth can-i delete pods --as=system:serviceaccount:audit:bot-sa -n audit",
    docsKeyword: "kubectl auth can-i",
    simulatedOutput: `no`
  },
  {
    id: "cli-13",
    category: "Networking",
    examTag: "BOTH",
    difficulty: "Medium",
    xp: 20,
    title: "Expose Deployment ออกเป็น NodePort Service",
    scenario: "สร้าง Service ชื่อ 'web-nodeport' ชนิด 'NodePort' จาก Deployment ชื่อ 'frontend' โดยเปิดพอร์ต Service ที่ 80 และส่งต่อไปยังพอร์ตของ Container ที่ 8080",
    canonicalCommand: "kubectl expose deployment frontend --name=web-nodeport --port=80 --target-port=8080 --type=NodePort",
    validation: {
      subcommand: "expose",
      resource: "deployment",
      positional: ["frontend"],
      flags: {
        name: "web-nodeport",
        port: "80",
        "target-port": "8080",
        type: "NodePort"
      }
    },
    tokens: ["kubectl", "expose", "deployment", "frontend", "--name=web-nodeport", "--port=80", "--target-port=8080", "--type=NodePort"],
    hint: "ใช้คำสั่ง kubectl expose deploy frontend --name=web-nodeport --port=80 --target-port=8080 --type=NodePort",
    docsKeyword: "kubectl expose",
    simulatedOutput: `service/web-nodeport exposed`
  },
  {
    id: "cli-14",
    category: "Networking",
    examTag: "BOTH",
    difficulty: "Hard",
    xp: 25,
    title: "สร้าง Ingress Rule ด้วยคำสั่ง Imperative บรรทัดเดียว",
    scenario: "สร้าง Ingress ชื่อ 'shop-ingress' โดยใช้ IngressClass 'nginx' และกำหนดกฎให้ 'shop.local/cart*' ชี้ไปยัง Service 'cart-svc' พอร์ต 80",
    canonicalCommand: "kubectl create ingress shop-ingress --class=nginx --rule=shop.local/cart*=cart-svc:80",
    validation: {
      subcommand: "create",
      resource: "ingress",
      positional: ["shop-ingress"],
      flags: {
        class: "nginx",
        rule: "shop.local/cart*=cart-svc:80"
      }
    },
    tokens: ["kubectl", "create", "ingress", "shop-ingress", "--class=nginx", "--rule=shop.local/cart*=cart-svc:80", "--backend"],
    hint: "จำรูปแบบ --rule=host/path*=service:port ให้แม่น ช่วยลดเวลาเขียน YAML ได้ถึง 3 นาที!",
    docsKeyword: "kubectl create ingress",
    simulatedOutput: `ingress.networking.k8s.io/shop-ingress created`
  },
  {
    id: "cli-15",
    category: "Cluster Admin",
    examTag: "CKA",
    difficulty: "Medium",
    xp: 20,
    title: "ติด Taint ให้กับ Worker Node",
    scenario: "ติด Taint ให้กับโหนดชื่อ 'node01' ด้วยค่า 'dedicated=ai:NoSchedule' เพื่อไม่ให้ Pod ทั่วไปถูกส่งมารันบนโหนดนี้",
    canonicalCommand: "kubectl taint nodes node01 dedicated=ai:NoSchedule",
    validation: {
      subcommand: "taint",
      resource: "node",
      positional: ["node01", "dedicated=ai:NoSchedule"],
      flags: {}
    },
    tokens: ["kubectl", "taint", "nodes", "node01", "dedicated=ai:NoSchedule", "NoExecute", "label"],
    hint: "ใช้คำสั่ง kubectl taint nodes node01 dedicated=ai:NoSchedule",
    docsKeyword: "kubectl taint",
    simulatedOutput: `node/node01 tainted`
  },
  {
    id: "cli-16",
    category: "Cluster Admin",
    examTag: "CKA",
    difficulty: "Medium",
    xp: 25,
    title: "Drain Node เพื่อเตรียมอัปเกรดคลัสเตอร์",
    scenario: "สั่งย้าย Pod ทั้งหมดออกจากโหนด 'worker-01' เพื่อบำรุงรักษา โดยไม่สนใจ DaemonSets และยอมให้ลบข้อมูลใน emptyDir ได้",
    canonicalCommand: "kubectl drain worker-01 --ignore-daemonsets --delete-emptydir-data",
    validation: {
      subcommand: "drain",
      positional: ["worker-01"],
      flags: {
        "ignore-daemonsets": true,
        "delete-emptydir-data": true
      }
    },
    tokens: ["kubectl", "drain", "worker-01", "--ignore-daemonsets", "--delete-emptydir-data", "cordon", "--force"],
    hint: "ในการสอบ CKA ต้องใส่ --ignore-daemonsets และ --delete-emptydir-data ตอนสั่ง drain แทบทุกครั้ง",
    docsKeyword: "kubectl drain",
    simulatedOutput: `node/worker-01 cordoned
evicting pod default/webapp-6d4cf56db6-x92lp
node/worker-01 drained`
  }
];

