# CAPTURA Icon Copy Script
# This script copies the existing captura assets to create PWA icon variations

Write-Host "CAPTURA PWA Icon Setup Script" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

# Define source files
$logoSource = "public/images/captura_logo.png"
$iconSource = "public/images/captura_icon.png"
$iconsDir = "public/icons"

# Check if source files exist
if (-not (Test-Path $logoSource)) {
    Write-Host "❌ Error: $logoSource not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $iconSource)) {
    Write-Host "❌ Error: $iconSource not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Source files found:" -ForegroundColor Green
Write-Host "   - $logoSource" -ForegroundColor Gray
Write-Host "   - $iconSource" -ForegroundColor Gray

# Create icons directory if it doesn't exist
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
    Write-Host "📁 Created icons directory" -ForegroundColor Yellow
}

# Define icon mappings (using logo for larger sizes, icon for smaller)
$iconMappings = @(
    @{ Source = $iconSource; Target = "captura-icon-72x72.png"; Size = "72x72" },
    @{ Source = $iconSource; Target = "captura-icon-96x96.png"; Size = "96x96" },
    @{ Source = $iconSource; Target = "captura-icon-128x128.png"; Size = "128x128" },
    @{ Source = $iconSource; Target = "captura-icon-144x144.png"; Size = "144x144" },
    @{ Source = $iconSource; Target = "captura-icon-152x152.png"; Size = "152x152" },
    @{ Source = $logoSource; Target = "captura-icon-192x192.png"; Size = "192x192" },
    @{ Source = $logoSource; Target = "captura-icon-384x384.png"; Size = "384x384" },
    @{ Source = $logoSource; Target = "captura-icon-512x512.png"; Size = "512x512" }
)

Write-Host "`nCopying CAPTURA assets to PWA icon variations..." -ForegroundColor Cyan

foreach ($mapping in $iconMappings) {
    $targetPath = Join-Path $iconsDir $mapping.Target
    
    try {
        Copy-Item -Path $mapping.Source -Destination $targetPath -Force
        Write-Host "✅ Created $($mapping.Target) ($($mapping.Size))" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to create $($mapping.Target): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Also copy favicon
try {
    Copy-Item -Path $iconSource -Destination "public/favicon.png" -Force
    Write-Host "✅ Created favicon.png" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create favicon.png: $($_.Exception.Message)" -ForegroundColor Red
}

# Copy ICO favicon if it exists
if (Test-Path "public/images/captura_icon.ico") {
    try {
        Copy-Item -Path "public/images/captura_icon.ico" -Destination "public/favicon.ico" -Force
        Write-Host "✅ Created favicon.ico" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to create favicon.ico: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nCAPTURA PWA Icon Setup Complete!" -ForegroundColor Green
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Update PWA manifest files to reference new icons" -ForegroundColor Gray
Write-Host "   2. Update service worker cache lists" -ForegroundColor Gray
Write-Host "   3. Test PWA installation with new branding" -ForegroundColor Gray
Write-Host "   4. Deploy changes to see updated icons" -ForegroundColor Gray

Write-Host "`nGenerated Files:" -ForegroundColor Cyan
Get-ChildItem -Path $iconsDir -Filter "captura-icon-*.png" | ForEach-Object {
    Write-Host "   - $($_.Name)" -ForegroundColor Gray
}

Write-Host "`nReady for PWA manifest updates!" -ForegroundColor Blue
