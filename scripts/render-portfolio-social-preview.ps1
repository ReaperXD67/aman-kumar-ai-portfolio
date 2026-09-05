param(
  [string]$OutputPath = "C:\Users\Aman\OneDrive\Desktop\Portfolio\public\assets\portfolio-social-preview-v1.png",
  [string]$KernelPath = "C:\Users\Aman\OneDrive\Desktop\Portfolio\public\assets\systems-kernel-avatar.png"
)

Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$bitmap.SetResolution(144, 144)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

$bounds = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $bounds,
  [System.Drawing.Color]::FromArgb(255, 5, 5, 5),
  [System.Drawing.Color]::FromArgb(255, 20, 21, 19),
  0
)
$graphics.FillRectangle($background, $bounds)

$gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(14, 255, 255, 255), 1)
for ($x = 0; $x -lt $width; $x += 48) { $graphics.DrawLine($gridPen, $x, 0, $x, $height) }
for ($y = 0; $y -lt $height; $y += 48) { $graphics.DrawLine($gridPen, 0, $y, $width, $y) }

$edgePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(48, 255, 255, 255), 1)
$graphics.DrawRectangle($edgePen, 28, 28, $width - 57, $height - 57)
$graphics.DrawLine($edgePen, 640, 29, 640, 600)

$cream = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 246, 244, 238))
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 171, 169, 162))
$dim = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 112, 111, 107))
$lime = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 203, 241, 86))
$orange = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 88, 54))
$limePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(170, 203, 241, 86), 2)

$fontEyebrow = New-Object System.Drawing.Font('Consolas', 11, [System.Drawing.FontStyle]::Regular)
$fontName = New-Object System.Drawing.Font('Segoe UI Semibold', 22, [System.Drawing.FontStyle]::Bold)
$fontPrimary = New-Object System.Drawing.Font('Segoe UI Semibold', 44, [System.Drawing.FontStyle]::Bold)
$fontSecondary = New-Object System.Drawing.Font('Segoe UI', 22, [System.Drawing.FontStyle]::Regular)
$fontBody = New-Object System.Drawing.Font('Segoe UI', 15, [System.Drawing.FontStyle]::Regular)
$fontMono = New-Object System.Drawing.Font('Consolas', 9.5, [System.Drawing.FontStyle]::Regular)

$graphics.FillEllipse($lime, 77, 75, 10, 10)
$graphics.DrawString('SYSTEM ONLINE  /  BENGALURU, INDIA', $fontEyebrow, $muted, 100, 69)
$graphics.DrawString('AMAN KUMAR', $fontName, $cream, 75, 118)
$graphics.DrawString('AI ENGINEER', $fontPrimary, $cream, 70, 174)
$graphics.DrawString('& FULL-STACK DEVELOPER', $fontSecondary, $cream, 76, 253)

$graphics.DrawString('I build AI systems that explain themselves,', $fontBody, $muted, 77, 335)
$graphics.DrawString('operate reliably, and survive production.', $fontBody, $muted, 77, 368)

$graphics.DrawLine($edgePen, 77, 428, 584, 428)
$graphics.DrawString('AGENTIC SYSTEMS', $fontMono, $cream, 77, 453)
$graphics.DrawString('EVIDENCE-GROUNDED RAG', $fontMono, $cream, 257, 453)
$graphics.DrawString('DISTRIBUTED BACKENDS', $fontMono, $cream, 77, 486)
$graphics.DrawString('SHIP → MEASURE → VERIFY', $fontMono, $dim, 303, 486)
$graphics.DrawString('aman-kumar-ai-portfolio.vercel.app', $fontMono, $dim, 77, 553)

$kernel = [System.Drawing.Image]::FromFile($KernelPath)
$graphics.DrawImage($kernel, 650, 30, 540, 540)

$graphics.DrawString('SYSTEMS KERNEL / ACCOUNTABLE INTELLIGENCE', $fontMono, $muted, 699, 558)
$graphics.FillEllipse($orange, 1089, 563, 8, 8)
$graphics.DrawLine($limePen, 1107, 567, 1154, 567)

$directory = Split-Path -Parent $OutputPath
if (-not (Test-Path -LiteralPath $directory)) { New-Item -ItemType Directory -Path $directory | Out-Null }
$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$kernel.Dispose()
$fontEyebrow.Dispose()
$fontName.Dispose()
$fontPrimary.Dispose()
$fontSecondary.Dispose()
$fontBody.Dispose()
$fontMono.Dispose()
$background.Dispose()
$gridPen.Dispose()
$edgePen.Dispose()
$cream.Dispose()
$muted.Dispose()
$dim.Dispose()
$lime.Dispose()
$orange.Dispose()
$limePen.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Get-Item -LiteralPath $OutputPath | Select-Object FullName, Length
