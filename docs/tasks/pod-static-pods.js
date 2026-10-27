/**
 * Official Kubernetes Documentation Translation (Full Content)
 * Source: https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/
 */
(function (root) {
  const pageData = {
  "id": "pod-static-pods",
  "categoryId": "configure-pods",
  "categoryTitle": "Configure Pods and Containers",
  "titleEn": "Create Static Pods",
  "titleTh": "การสร้างสแตติกพอด (Static Pods)",
  "officialUrl": "https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/",
  "docsPath": "/docs/tasks/configure-pod-container/static-pod/",
  "lead": "สแตติกพอด (Static Pods) ถูกบริหารจัดการโดยตรงจาก kubelet daemon บนโหนดนั้นๆ โดยไม่ต้องผ่าน Control Plane / API Server ทำให้เหมาะอย่างยิ่งสำหรับการรันส่วนประกอบหลักของ Control Plane เช่น kube-apiserver และ etcd",
  "sections": [
    {
      "id": "static-pod-concepts-and-mirror-pods",
      "headingEn": "Static Pod Concepts and Mirror Pods",
      "headingTh": "แนวคิดของ Static Pods และกลไก Mirror Pods บน API Server",
      "contentMarkdown": "**Static Pods** คือพอดที่สร้างและดูแลโดยตรงจากตัวแทน `kubelet` ประจำโหนด โดยไม่ต้องพึ่งพา Control Plane, Scheduler หรือ Controller Manager:\n\n* kubelet จะสแกนไฟล์ manifest ในไดเรกทอรีที่กำหนด หรือดาวน์โหลดจาก HTTP URL เป็นระยะๆ\n* หากไฟล์ YAML มีการเปลี่ยนแปลงหรือถูกแก้ไข kubelet จะทำการรีสตาร์ทหรืออัปเดตคอนเทนเนอร์ให้ตรงตาม manifest โดยอัตโนมัติ\n* หากคลัสเตอร์มี kube-apiserver ทำงานอยู่ kubelet จะสร้าง **Mirror Pod** บน API Server ขึ้นมาสะท้อนสถานะ เพื่อให้ผู้ดูแลระบบมองเห็นพอดดังกล่าวผ่านคำสั่ง `kubectl get pods` ได้ตามปกติ โดยชื่อของ Mirror Pod จะมีชื่อโหนดต่อท้าย เช่น `static-web-worker-node-1`\n\n> ข้อควรระวัง: คุณไม่สามารถสั่งลบหรือแก้ไขคอนฟิกของ Static Pod ผ่านคำสั่ง `kubectl delete pod` ได้ เพราะ kubelet จะสร้างพอดขึ้นมาใหม่ทันที การจัดการต้องทำผ่านการแก้ไขหรือลบไฟล์ manifest บนโหนดโดยตรง",
      "codeBlocks": []
    },
    {
      "id": "configure-kubelet-manifest-directory",
      "headingEn": "Configuring kubelet Static Pod Path",
      "headingTh": "การตั้งค่าไดเรกทอรี Static Pod Manifests ของ kubelet",
      "contentMarkdown": "การตั้งค่าให้ kubelet ตรวจสอบไดเรกทอรีสำหรับ Static Pod ทำได้โดยกำหนดพารามิเตอร์ `staticPodPath` ในไฟล์คอนฟิกูเรชันของ kubelet ซึ่งตามมาตรฐานของ kubeadm จะอยู่ที่ `/etc/kubernetes/manifests`",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "inspect-kubelet-config.sh",
          "code": "# ตรวจสอบการตั้งค่า staticPodPath ใน kubelet config\nsudo grep -i staticPodPath /var/lib/kubelet/config.yaml\n# ผลลัพธ์โดยทั่วไป: staticPodPath: /etc/kubernetes/manifests"
        }
      ]
    },
    {
      "id": "create-and-verify-static-pod",
      "headingEn": "Creating and Verifying a Static Pod",
      "headingTh": "การสร้างและตรวจสอบการทำงานของ Static Pod",
      "contentMarkdown": "ขั้นตอนการสร้าง Static Pod บนเครื่องโหนด:\n\n1. ล็อกอินเข้าไปยังโหนดเป้าหมาย (เช่น `worker-node-1` หรือ `control-plane`)\n2. สร้างไฟล์ Pod manifest เช่น `static-web.yaml` และบันทึกลงในไดเรกทอรี `/etc/kubernetes/manifests/`\n3. รอไม่กี่วินาที kubelet จะตรวจพบไฟล์และเริ่มสร้างคอนเทนเนอร์ทันที\n4. ตรวจสอบการทำงานของคอนเทนเนอร์ด้วย `crictl ps` หรือตรวจสอบ Mirror Pod ด้วย `kubectl get pods`",
      "codeBlocks": [
        {
          "lang": "yaml",
          "label": "static-web.yaml",
          "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: static-web\n  labels:\n    role: static-demo\nspec:\n  containers:\n  - name: web\n    image: nginx:alpine\n    ports:\n    - name: web\n      containerPort: 80"
        },
        {
          "lang": "bash",
          "label": "create-and-check.sh",
          "code": "# คัดลอกไฟล์ manifest ลงในไดเรกทอรี staticPodPath\nsudo cp static-web.yaml /etc/kubernetes/manifests/\n\n# ตรวจสอบคอนเทนเนอร์บนโหนดด้วย crictl\nsudo crictl ps | grep static-web\n\n# ตรวจสอบ Mirror Pod จากเครื่องควบคุม\nkubectl get pods -o wide"
        }
      ]
    },
    {
      "id": "lifecycle-and-limitations",
      "headingEn": "Lifecycle Management and Static Pod Limitations",
      "headingTh": "การจัดการวงจรชีวิตและข้อจำกัดของ Static Pod",
      "contentMarkdown": "* **การลบ Static Pod**: ต้องลบไฟล์ manifest ออกจากไดเรกทอรี `/etc/kubernetes/manifests/` โดยตรง kubelet จะตรวจพบและหยุดคอนเทนเนอร์ให้เอง\n* **ข้อจำกัด**: Static Pod ไม่สามารถอ้างอิง ConfigMap หรือ Secret ที่สร้างไว้ในคลัสเตอร์ได้โดยตรง (เนื่องจาก kubelet ไม่ได้ติดต่อ API Server เพื่อดึงข้อมูลออบเจกต์เหล่านั้น) และไม่สามารถควบคุมด้วย Deployment หรือ ReplicaSet ได้",
      "codeBlocks": [
        {
          "lang": "bash",
          "label": "remove-static-pod.sh",
          "code": "# ลบไฟล์ manifest เพื่อหยุดการทำงานของ static pod\nsudo rm /etc/kubernetes/manifests/static-web.yaml\n\n# ตรวจสอบว่าพอดหายไปจากระบบแล้ว\nkubectl get pods"
        }
      ]
    }
  ],
  "relatedLinks": [
    {
      "title": "Upgrading kubeadm clusters",
      "targetType": "tasks",
      "targetPageId": "admin-kubeadm-upgrade",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/"
    },
    {
      "title": "Operating etcd clusters (Backup & Restore)",
      "targetType": "tasks",
      "targetPageId": "admin-etcd-backup-restore",
      "officialUrl": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/"
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
