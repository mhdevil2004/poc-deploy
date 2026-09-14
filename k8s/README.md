# Kubernetes backend setup

These manifests run the Go backend and a single PostgreSQL instance in the
`loan-app` namespace. The backend automatically creates its tables at startup.

Before deploying outside a throwaway local cluster, edit `backend.yaml` to set
real `DB_PASSWORD` and `JWT_SECRET` values. Set `GEMINI_API_KEY` only when the
optional AI agent is required. For a shared or production cluster, store those
values in your secret manager and replace the example `Secret` manifest.

From the repository root in PowerShell:

```powershell
.\k8s\setup.ps1
kubectl -n loan-app port-forward service/loan-backend 8080:8080
```

Then verify the service at `http://localhost:8080/healthz`.

`setup.ps1` builds `loan-backend:latest`, applies the manifests, and waits for
both workloads. For an image already available to the cluster, use:

```powershell
.\k8s\setup.ps1 -Image registry.example.com/loan-backend:1.0.0 -SkipBuild
```

For Kind, load a locally built image before running the script:

```powershell
kind load docker-image loan-backend:latest
.\k8s\setup.ps1 -SkipBuild
```
