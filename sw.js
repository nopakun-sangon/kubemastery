const CACHE_NAME = 'kubemastery-cache-v6';
const ASSETS = [
  "./",
  "./index.html",
  "./404.html",
  "./manifest.json",
  "./css/styles.css",
  "./css/fonts/fonts.css",
  "./js/vendor/tailwind.min.js",
  "./js/audio.js",
  "./js/storage.js",
  "./js/kubectlEngine.js",
  "./js/globalSearch.js",
  "./js/pwa.js",
  "./js/app.js",
  "./lessons/course-foundation.js",
  "./lessons/course-ckad.js",
  "./lessons/course-cka.js",
  "./lessons/courseData.js",
  "./data/cliDrillsData.js",
  "./docs/concepts/admin-logging-extending.js",
  "./docs/concepts/arch-control-plane-node-comm.js",
  "./docs/concepts/arch-controllers-leases.js",
  "./docs/concepts/arch-cri-garbage-collection.js",
  "./docs/concepts/arch-nodes.js",
  "./docs/concepts/config-configmap.js",
  "./docs/concepts/config-manage-resources.js",
  "./docs/concepts/config-secret.js",
  "./docs/concepts/containers-images.js",
  "./docs/concepts/containers-lifecycle-hooks.js",
  "./docs/concepts/index.js",
  "./docs/concepts/net-dns-pod-service.js",
  "./docs/concepts/net-gateway-api.js",
  "./docs/concepts/net-ingress-controllers.js",
  "./docs/concepts/net-network-policies.js",
  "./docs/concepts/net-service.js",
  "./docs/concepts/overview-components.js",
  "./docs/concepts/overview-labels-selectors-annotations.js",
  "./docs/concepts/overview-names-uids-namespaces.js",
  "./docs/concepts/overview-what-is-kubernetes.js",
  "./docs/concepts/overview-working-with-objects.js",
  "./docs/concepts/policy-limits-quotas.js",
  "./docs/concepts/sched-assign-pod-node.js",
  "./docs/concepts/sched-taint-toleration.js",
  "./docs/concepts/sec-pod-security-standards.js",
  "./docs/concepts/sec-service-accounts-rbac.js",
  "./docs/concepts/storage-classes-dynamic.js",
  "./docs/concepts/storage-ephemeral-snapshots.js",
  "./docs/concepts/storage-persistent-volumes.js",
  "./docs/concepts/storage-volumes.js",
  "./docs/concepts/workloads-daemonset.js",
  "./docs/concepts/workloads-deployments.js",
  "./docs/concepts/workloads-ephemeral-disruptions.js",
  "./docs/concepts/workloads-init-containers.js",
  "./docs/concepts/workloads-jobs-cronjobs.js",
  "./docs/concepts/workloads-pod-lifecycle.js",
  "./docs/concepts/workloads-pods.js",
  "./docs/concepts/workloads-replicaset-statefulset.js",
  "./docs/concepts/workloads-sidecar-containers.js",
  "./docs/tasks/access-declare-network-policy.js",
  "./docs/tasks/access-ingress-nginx.js",
  "./docs/tasks/access-multiple-clusters-kubeconfig.js",
  "./docs/tasks/access-port-forward-services.js",
  "./docs/tasks/admin-etcd-backup-restore.js",
  "./docs/tasks/admin-kubeadm-certs.js",
  "./docs/tasks/admin-kubeadm-upgrade.js",
  "./docs/tasks/admin-resource-quota-namespace.js",
  "./docs/tasks/admin-safely-drain-node.js",
  "./docs/tasks/debug-cluster-crictl.js",
  "./docs/tasks/debug-dns-resolution.js",
  "./docs/tasks/debug-pods-services.js",
  "./docs/tasks/debug-running-pods-exec.js",
  "./docs/tasks/index.js",
  "./docs/tasks/inject-command-arguments.js",
  "./docs/tasks/inject-configmap.js",
  "./docs/tasks/inject-credentials-secrets.js",
  "./docs/tasks/inject-downward-api.js",
  "./docs/tasks/inject-env-variables.js",
  "./docs/tasks/job-cronjobs-work-queue.js",
  "./docs/tasks/manage-declarative-imperative.js",
  "./docs/tasks/manage-kubectl-patch.js",
  "./docs/tasks/manage-kustomize-objects.js",
  "./docs/tasks/pod-assign-memory-cpu.js",
  "./docs/tasks/pod-assign-node-affinity.js",
  "./docs/tasks/pod-configure-service-account.js",
  "./docs/tasks/pod-liveness-readiness-startup-probes.js",
  "./docs/tasks/pod-persistent-volume-storage.js",
  "./docs/tasks/pod-quality-of-service.js",
  "./docs/tasks/pod-security-context.js",
  "./docs/tasks/pod-static-pods.js",
  "./docs/tasks/run-configure-pdb.js",
  "./docs/tasks/run-hpa-autoscaling.js",
  "./docs/tasks/run-stateful-application.js",
  "./docs/tasks/run-stateless-deployment.js",
  "./docs/tasks/tools-install-kubectl.js",
  "./docs/tasks/tools-shell-autocompletion.js",
  "./images/docs/components-of-kubernetes.svg",
  "./images/docs/hpa-autoscaling-loop.svg",
  "./images/docs/ingress-gateway-flow.svg",
  "./images/docs/multi-container-sidecar.svg",
  "./images/docs/network-policy-isolation.svg",
  "./images/docs/object-controller-loop.svg",
  "./images/docs/pod-lifecycle-phases.svg",
  "./images/docs/pv-pvc-storageclass-lifecycle.svg",
  "./images/docs/rbac-authorization-flow.svg",
  "./images/docs/scheduling-affinity-taints.svg",
  "./images/docs/services-routing-overview.svg",
  "./images/docs/workload-controllers-hierarchy.svg"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
