$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

$body = @{
    username = "admin@gmail.com"
    password = "12345678"
} | ConvertTo-Json

Write-Host "Testing login API endpoint..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:8000/api/login" -ForegroundColor Cyan
Write-Host "Body: $body" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/login" -Method Post -Headers $headers -Body $body
    
    Write-Host "Login Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "User: $($response.user.full_name)" -ForegroundColor Green
    Write-Host "Role: $($response.user.role.name)" -ForegroundColor Green
    Write-Host "Permissions: $($response.permissions.Count) permissions" -ForegroundColor Green
    
} catch {
    Write-Host "Login Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
