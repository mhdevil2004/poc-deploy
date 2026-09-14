param(
    [string]$Image = "loan-backend:latest",
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    throw "kubectl is required and was not found in PATH."
}

if (-not $SkipBuild) {
    docker build --tag $Image --file backend/Dockerfile backend
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

kubectl apply -k k8s
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

kubectl -n loan-app set image deployment/loan-backend loan-backend=$Image
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

kubectl -n loan-app rollout status statefulset/postgres --timeout=180s
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
kubectl -n loan-app rollout status deployment/loan-backend --timeout=180s
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Backend is ready. Open http://localhost:8080/healthz after running:"
Write-Host "kubectl -n loan-app port-forward service/loan-backend 8080:8080"
