/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/
 */
(function (root) {
  const pageData = {
  "id": "access-port-forward-services",
  "categoryId": "access-applications",
  "categoryTitle": "Access Applications in a Cluster",
  "titleEn": "Use Port Forwarding to Access Applications in a Cluster",
  "titleTh": "การใช้ Port Forwarding และ Services เพื่อเข้าถึงแอปพลิเคชัน",
  "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/",
  "docsPath": "/docs/tasks/access-application-cluster/port-forward-access-application-cluster/",
  "diagram": {
    "src": "images/docs/services-routing-overview.svg",
    "caption": "การเปิดอุโมงค์เชื่อมต่อพอร์ตเครือข่ายระหว่างเครื่อง Local เข้าสู่ Pod / Service ภายในคลัสเตอร์"
  },
  "lead": "คู่มือการใช้งานคำสั่ง `kubectl port-forward` และประเภทของ Kubernetes Services เพื่อเปิดช่องทางเชื่อมต่อโดยตรงระหว่างเครื่อง Local และพอดหรือเซอร์วิสภายในคลัสเตอร์สำหรับการ Debugging, การเข้าถึงแอดมินพาเนล, และการทดสอบ API ภายในโดยไม่ต้องสร้าง Ingress",
  "sections": [
    {
      "id": "port-forwarding-mechanisms",
      "headingEn": "Port Forwarding Mechanisms & Use Cases",
      "headingTh": "กลไกการทำงานของ Port Forwarding และกรณีการใช้งาน",
      "contentMarkdown": "### กลไกการทำงานเบื้องหลังของ kubectl port-forward\n\nคำสั่ง `kubectl port-forward` ไม่ได้เปิดพอร์ตสาธารณะบนโหนด แต่เป็นการสร้างอุโมงค์สื่อสาร (Secure Tunnel) แบบ Point-to-Point โดยอาศัยการเชื่อมต่อแบบสตรีม (SPDY หรือ WebSockets):\n1. ไคลเอนต์ `kubectl` บนเครื่องคอมพิวเตอร์ของคุณจะเชื่อมต่อไปยัง **Kubernetes API Server** ผ่านพอร์ต HTTPS 6443\n2. API Server ทำหน้าที่เป็น Reverse Proxy สตรีมต่อไปยัง **Kubelet** ประจำ Node ที่พอดเป้าหมายกำลังรันอยู่\n3. Kubelet ทำการเปิด Socket เชื่อมต่อไปยังพอร์ตภายในของ Container Network Namespace\n\n### กรณีการใช้งานที่เหมาะสม (Ideal Use Cases)\n* **การดีบักฐานข้อมูลหรือแคชชั่วคราว**: เชื่อมต่อเครื่องมือ GUI บนแล็ปท็อป (เช่น DBeaver, Redis Insight) ไปยัง Database/Redis ภายในคลัสเตอร์\n* **การเข้าถึง Web Admin Panel ที่มีความลับ**: เข้าดูหน้า Dashboard ภายในองค์กรโดยไม่ต้องเปิดเผย URL สู่สาธารณะ\n* **การทดสอบ API ภายใน**: นักพัฒนายิงคำขอ cURL ทดสอบ Microservice ก่อนสร้าง Ingress หรือ Service Mesh\n\n> [!WARNING]\n> `kubectl port-forward` ออกแบบมาเพื่อการดีบักชั่วคราว (Ad-hoc Debugging) เท่านั้น ไม่รองรับ High Availability หรือ Load Balancing และการเชื่อมต่อจะหลุดทันทีหากคำสั่ง kubectl ถูกปิด",
      "codeBlocks": []
    },
    {
      "id": "port-forwarding-to-pods",
      "headingEn": "Port Forwarding to a Specific Pod",
      "headingTh": "การทำ Port Forward ไปยัง Pod โดยตรง",
      "contentMarkdown": "### ไวยากรณ์พื้นฐาน\n```bash\nkubectl port-forward pod/<pod-name> [LOCAL_PORT:]REMOTE_PORT\n```\n\n### ตัวอย่างการทดสอบกับ MongoDB Pod\nสร้างพอด MongoDB:\n```bash\nkubectl run mongo-demo --image=mongo:4.4 --port=27017\n```\n\nเปิดการเชื่อมต่อจากพอร์ต 28015 บนเครื่องแล็ปท็อปของคุณ ไปยังพอร์ต 27017 ของพอด:\n```bash\nkubectl port-forward pod/mongo-demo 28015:27017\n```\nผลลัพธ์จะแจ้งสถานะ:\n```\nForwarding from 127.0.0.1:28015 -> 27017\nForwarding from [::1]:28015 -> 27017\n```\n\nตอนนี้คุณสามารถเปิด Terminal อีกหน้าต่าง แล้วเชื่อมต่อเข้าสู่ MongoDB ได้เสมือนว่าฐานข้อมูลกำลังรันอยู่บนเครื่องตนเอง:\n```bash\nmongosh --port 28015\n```\n\n### การเปิดให้เครื่องอื่นในวงแลนเข้าถึงได้ด้วย `--address`\nโดยปกติพอร์ตจะ bind เฉพาะ `127.0.0.1` หากต้องการเปิดให้เครื่องอื่นในเครือข่ายทดสอบ ให้ใส่แฟล็ก:\n```bash\nkubectl port-forward --address 0.0.0.0 pod/mongo-demo 28015:27017\n```",
      "codeBlocks": []
    },
    {
      "id": "port-forwarding-to-services-and-deployments",
      "headingEn": "Port Forwarding to Services and Deployments",
      "headingTh": "การทำ Port Forward ไปยัง Service และ Deployment",
      "contentMarkdown": "ข้อเสียของการ Forward ตรงไปยัง Pod คือ หากพอดถูกรีสตาร์ตหรือตายไป คำสั่งจะหลุดทันที คุณจึงสามารถชี้เป้าหมายไปยัง **Service** หรือ **Deployment** แทนได้:\n\n### 1. Forward ไปยัง Service\n```bash\nkubectl port-forward service/my-service 8443:443\n```\n* API Server จะทำการค้นหา Endpoints ภายใต้ Service นั้น แล้วสุ่มเลือกพอดที่อยู่ในสถานะ `Ready` เพื่อทำการ Forward คำขอให้\n\n### 2. Forward ไปยัง Deployment\n```bash\nkubectl port-forward deployment/my-deployment 8080:80\n```\n* คำสั่งจะเลือกพอดตัวหนึ่งที่สร้างโดย Deployment ดังกล่าวโดยอัตโนมัติ\n\n> [!TIP]\n> หากพอร์ตของเครื่องโลคอลตรงกับพอร์ตของพอดปลายทาง คุณสามารถระบุเพียงตัวเลขเดียวได้ เช่น:\n> `kubectl port-forward service/redis-master 6379`\n> ระบบจะทำการ bind พอร์ต 6379 บนเครื่องโลคอลเข้ากับ 6379 ของเซอร์วิสทันที",
      "codeBlocks": []
    },
    {
      "id": "comparing-service-types",
      "headingEn": "Comparison: ClusterIP vs NodePort vs LoadBalancer",
      "headingTh": "เปรียบเทียบประเภท Service: ClusterIP, NodePort, LoadBalancer",
      "contentMarkdown": "สำหรับการให้บริการทราฟฟิกจริงในระยะยาว (Production Traffic) ควรใช้ **Kubernetes Service Types** แทนการทำ Port Forward:\n\n| ประเภท Service | ขอบเขตการเข้าถึง | การทำงานและ Use Case |\n|---|---|---|\n| **ClusterIP** | ภายในคลัสเตอร์เท่านั้น (Internal Only) | ค่าเริ่มต้น (Default) ให้ไอพีเสมือนคงที่สำหรับพอดคุยกันเอง เหมาะกับ Database, Backend APIs |\n| **NodePort** | ภายนอกคลัสเตอร์ ผ่าน IP ของ Node | เปิดพอร์ตช่วง `30000-32767` บนโหนดทุกเครื่องในคลัสเตอร์ เหมาะสำหรับงานทดสอบหรือ On-premise ที่ไม่มี Cloud Load Balancer |\n| **LoadBalancer** | ภายนอกคลัสเตอร์ ผ่าน Public IP | ร้องขอ External Cloud Load Balancer (เช่น AWS NLB/ALB, GCP Cloud Load Balancing) โดยอัตโนมัติ |\n| **ExternalName** | แมปชื่อ DNS ออกไปภายนอก | ไม่มีการกระจายโหลด แต่ทำ CNAME ชี้ไปยังโฮสต์ภายนอก เช่น `db.external.domain.com` |",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "nodeport-example.yaml",
          "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: my-nodeport-service\nspec:\n  type: NodePort\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080\n    nodePort: 30080"
        }
      ]
    },
    {
      "id": "troubleshooting-port-forwarding",
      "headingEn": "Troubleshooting Port Forwarding Errors",
      "headingTh": "การวิเคราะห์และแก้ไขปัญหาการ Forwarding หลุด",
      "contentMarkdown": "### ปัญหาและข้อผิดพลาดที่พบบ่อย:\n\n1. **`error: unable to listen on any of the requested ports: [8080]`**:\n   * *สาเหตุ*: พอร์ต 8080 บนเครื่องคอมพิวเตอร์ของคุณมีโปรแกรมอื่นใช้งานอยู่แล้ว\n   * *วิธีแก้*: เปลี่ยนเลขพอร์ตฝั่งซ้ายเป็นพอร์ตอื่นที่ยังว่าง เช่น `9090:80`\n2. **`error: unable to forward port: lost connection to pod`**:\n   * *สาเหตุ*: คอนเทนเนอร์ในพอดแครช (CrashLoopBackOff) หรือถูก Linux OOMKilled หรือ Kubelet รีสตาร์ต\n   * *วิธีแก้*: ตรวจสอบสถานะพอดด้วย `kubectl describe pod` และ `kubectl logs --previous`\n3. **เชื่อมต่อสำเร็จแต่ส่งคำขอแล้ว Connection Refused**:\n   * *สาเหตุ*: แอปพลิเคชันภายในคอนเทนเนอร์ทำการ Bind กับ `127.0.0.1` แทนที่จะเป็น `0.0.0.0` ทำให้ไม่รับการเชื่อมต่อที่ Kubelet Forward ข้ามเครือข่ายเข้ามา\n   * *วิธีแก้*: ปรับคอนฟิกของแอปพลิเคชันให้ Listen รับฟังการเชื่อมต่อที่ `0.0.0.0` (All interfaces)"
    }
  ],
  "relatedLinks": [
    {
      "title": "Debug Pods and Services",
      "targetType": "tasks",
      "targetPageId": "debug-pods-services",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/"
    },
    {
      "title": "Get a Shell to a Running Container and Debug Pods",
      "targetType": "tasks",
      "targetPageId": "debug-running-pods-exec",
      "officialUrl": "https://kubernetes.io/docs/tasks/debug/debug-application/get-shell-running-container/"
    },
    {
      "title": "Set up Ingress on Minikube with NGINX Controller",
      "targetType": "tasks",
      "targetPageId": "access-ingress-nginx",
      "officialUrl": "https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/"
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
