/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/
 */
(function (root) {
  const pageData = {
  "id": "access-ingress-nginx",
  "categoryId": "access-applications",
  "categoryTitle": "Access Applications in a Cluster",
  "titleEn": "Set up Ingress on Minikube with the NGINX Ingress Controller",
  "titleTh": "การติดตั้งและตั้งค่า Ingress ด้วย NGINX Controller",
  "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/",
  "docsPath": "/docs/tasks/access-application-cluster/ingress-minikube/",
  "diagram": {
    "src": "images/docs/ingress-gateway-flow.svg",
    "caption": "เส้นทางทราฟฟิกภายนอกจาก Ingress Controller ไปยัง Backend Services และ Pods ผ่านการกำหนด Routing Rule"
  },
  "lead": "เรียนรู้ขั้นตอนการเปิดใช้งานและกำหนดค่านโยบาย Ingress บน Kubernetes ผ่าน NGINX Ingress Controller เพื่อรวมศูนย์เส้นทาง HTTP/HTTPS Routing, การทำ Name-based Virtual Hosting, และ Path-based Routing เข้าสู่เซอร์วิสต่างๆ ภายในคลัสเตอร์",
  "sections": [
    {
      "id": "ingress-architecture-and-controller",
      "headingEn": "Ingress Architecture vs Ingress Controller",
      "headingTh": "สถาปัตยกรรม Ingress และ Ingress Controller",
      "contentMarkdown": "### ความแตกต่างระหว่าง Ingress และ Ingress Controller\n\n* **Ingress Resource**: คือเอกสารกฎระเบียบ (Declarative API Object) ที่ระบุกฎการกำหนดเส้นทาง HTTP/HTTPS เช่น กฎเส้นทางตาม Path หรือตาม Hostname\n* **Ingress Controller**: คือตัวประมวลผลจริง (โดยทั่วไปคือ Reverse Proxy ระดับ Production เช่น NGINX, HAProxy, Traefik, Envoy) ที่คอยเฝ้าดูการเปลี่ยนแปลงของ Ingress Objects และแปลกฎเหล่านั้นให้กลายเป็นคอนฟิกของ Proxy ทันที\n\n> [!IMPORTANT]\n> หากคลัสเตอร์ของคุณมีเฉพาะ Ingress Resource แต่ไม่มี Ingress Controller รันอยู่ การสร้าง Ingress จะไม่มีผลใดๆ และทราฟฟิกจะไม่สามารถเดินทางเข้าสู่คลัสเตอร์ได้\n\n### การเปิดใช้งานบน Minikube\nMinikube มอบส่วนเสริม (Addon) NGINX Ingress Controller สำเร็จรูปที่เปิดใช้งานได้ในคำสั่งเดียว:\n```bash\nminikube addons enable ingress\n```\n\nตรวจสอบว่า NGINX Ingress Controller พอดพร้อมทำงาน:\n```bash\nkubectl get pods -n ingress-nginx\n```\nรอจนกระทั่งพอด `ingress-nginx-controller-xxxx` อยู่ในสถานะ `Running (1/1)`",
      "codeBlocks": []
    },
    {
      "id": "deploying-backend-web-apps",
      "headingEn": "Deploying Backend Web Applications & Services",
      "headingTh": "การสร้างเว็บแอปพลิเคชัน Backend และ Services ตัวอย่าง",
      "contentMarkdown": "เราจะสร้างแอปพลิเคชันเว็บตัวอย่าง 2 ตัว เพื่อจำลองการทำ Routing:\n1. **Web App 1**: พอด `web` รันภาพสะท้อนข้อความ \"Hello, world!\"\n2. **Web App 2**: พอด `web2` รันภาพสะท้อนข้อความ \"Hello, world! 2\"\n\nสร้างไฟล์ `web-backends.yaml` และนำไปใช้งาน:\n```bash\nkubectl apply -f web-backends.yaml\n```\nตรวจสอบว่า Services ทั้งสองตัวทำงานในระดับ ClusterIP:\n```bash\nkubectl get svc web-service web2-service\n```",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "web-backends.yaml",
          "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n      - name: web\n        image: registry.k8s.io/e2e-test-images/echoserver:2.3\n        ports:\n        - containerPort: 8080\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: web-service\nspec:\n  selector:\n    app: web\n  ports:\n  - port: 8080\n    targetPort: 8080\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web2\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: web2\n  template:\n    metadata:\n      labels:\n        app: web2\n    spec:\n      containers:\n      - name: web2\n        image: registry.k8s.io/e2e-test-images/echoserver:2.3\n        ports:\n        - containerPort: 8080\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: web2-service\nspec:\n  selector:\n    app: web2\n  ports:\n  - port: 8080\n    targetPort: 8080"
        }
      ]
    },
    {
      "id": "creating-path-based-ingress",
      "headingEn": "Configuring Path-Based Routing with Ingress",
      "headingTh": "การกำหนดเส้นทางตาม Path (Path-Based Ingress)",
      "contentMarkdown": "สร้างไฟล์ Ingress ชื่อ `example-ingress.yaml` ที่กำหนดกฎการกระจายทราฟฟิก:\n* คำขอที่ขึ้นต้นด้วย `/foo` ให้ส่งต่อไปยัง `web-service:8080`\n* คำขอที่ขึ้นต้นด้วย `/bar` ให้ส่งต่อไปยัง `web2-service:8080`\n\n### สเปกสำคัญของ Ingress v1:\n* **`ingressClassName: nginx`**: ระบุเจาะจงว่าให้ NGINX Ingress Controller เป็นผู้จัดการอ็อบเจกต์นี้\n* **`pathType: Prefix`**: ทำการจับคู่ URL แบบ Prefix (เช่น `/foo/details` ก็จะถูกส่งไปที่ `web-service` เช่นกัน)\n* **`nginx.ingress.kubernetes.io/rewrite-target: /$2`**: Annotation สำหรับเขียน URL ใหม่ก่อนส่งเข้า Container\n\nสั่งประยุกต์ใช้:\n```bash\nkubectl apply -f example-ingress.yaml\nkubectl get ingress\n```",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "example-ingress.yaml",
          "code": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: example-ingress\n  annotations:\n    nginx.ingress.kubernetes.io/rewrite-target: /$2\nspec:\n  ingressClassName: nginx\n  rules:\n  - http:\n      paths:\n      - path: /foo(/|$)(.*)\n        pathType: ImplementationSpecific\n        backend:\n          service:\n            name: web-service\n            port:\n              number: 8080\n      - path: /bar(/|$)(.*)\n        pathType: ImplementationSpecific\n        backend:\n          service:\n            name: web2-service\n            port:\n              number: 8080"
        }
      ]
    },
    {
      "id": "testing-path-routing",
      "headingEn": "Verifying and Testing Ingress Routing",
      "headingTh": "การทดสอบเรียกใช้งาน Ingress Routing",
      "contentMarkdown": "ค้นหา IP ของ Minikube หรือ Ingress Address:\n```bash\nminikube ip\n```\nสมมติว่าได้ไอพีเป็น `192.168.49.2`\n\n### 1. ทดสอบส่ง Request ไปยัง Path `/foo`\n```bash\ncurl -kL http://192.168.49.2/foo\n```\nผลลัพธ์จาก Echo Server จะตอบกลับว่าคำขอถูกส่งไปยังพอดที่มีเลเบล `app=web`\n\n### 2. ทดสอบส่ง Request ไปยัง Path `/bar`\n```bash\ncurl -kL http://192.168.49.2/bar\n```\nผลลัพธ์จะตอบกลับว่าคำขอถูกส่งไปยังพอดที่มีเลเบล `app=web2`\n\n> [!TIP]\n> หากรันบน Minikube ในระบบ Linux หรือ macOS บางรุ่น อาจต้องสั่งรันคำสั่ง `minikube tunnel` ในอีกหน้าต่างหนึ่งเพื่อเปิดสะพานเชื่อมต่อเครือข่ายระหว่างเครื่องโฮสต์และ Minikube Network",
      "codeBlocks": []
    },
    {
      "id": "virtual-hosting-and-troubleshooting",
      "headingEn": "Name-Based Virtual Hosting & Troubleshooting",
      "headingTh": "การทำ Name-Based Virtual Hosting และการแก้ไขปัญหา",
      "contentMarkdown": "### การทำ Virtual Hosting ตามชื่อโดเมน (Host-based Routing)\nในสถานการณ์จริง องค์กรมักต้องการให้โดเมนย่อยต่างๆ ชี้เข้าสู่คลัสเตอร์เดียวกัน:\n```yaml\nspec:\n  rules:\n  - host: foo.bar.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: web-service\n            port:\n              number: 8080\n  - host: api.bar.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: web2-service\n            port:\n              number: 8080\n```\nทดสอบด้วยการใส่ HTTP Host Header:\n```bash\ncurl -H \"Host: foo.bar.com\" http://<ingress-ip>/\ncurl -H \"Host: api.bar.com\" http://<ingress-ip>/\n```\n\n### การตรวจวินิจฉัยปัญหา Ingress ยอดนิยม:\n* **ข้อผิดพลาด 404 Not Found**: ตรวจสอบว่า `path` หรือ `host` ใน Ingress กฎตรงกับ URL ที่เรียกหรือไม่ และตรวจสอบ `ingressClassName`\n* **ข้อผิดพลาด 502 / 503 Bad Gateway**: ตรวจสอบว่า Service ปลายทางมี Endpoints พร้อมทำงานหรือไม่ (`kubectl get endpoints <service-name>`) หากไม่มี Endpoints แสดงว่าพอดแครชหรือไม่ผ่าน Readiness Probe\n* **ตรวจสอบ Logs ของ Ingress Controller โดยตรง**:\n  ```bash\n  kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx\n  ```"
    }
  ],
  "relatedLinks": [
    {
      "title": "Use Port Forwarding & Services to Access Applications",
      "targetType": "tasks",
      "targetPageId": "access-port-forward-services",
      "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/"
    },
    {
      "title": "Declare Network Policy",
      "targetType": "tasks",
      "targetPageId": "access-declare-network-policy",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/"
    },
    {
      "title": "Debug Pods and Services",
      "targetType": "tasks",
      "targetPageId": "debug-pods-services",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/"
    }
  ]
};

  if (typeof window !== "undefined") {
    window.KUBE_TASKS_PAGES = window.KUBE_TASKS_PAGES || {};
    window.KUBE_TASKS_PAGES[pageData.id] = pageData;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = pageData;
  }
})(typeof window !== "undefined" ? window : globalThis);
