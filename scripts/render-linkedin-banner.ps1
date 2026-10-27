param(
  [string]$OutputPath = "C:\Users\Aman\OneDrive\Desktop\Portfolio\public\profile\linkedin\linkedin-minimal-engineer-banner-v2.png"
)

Add-Type -AssemblyName System.Drawing

$width = 1584
$height = 396
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$bitmap.SetResolution(144, 144)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

$bounds = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $bounds,
  [System.Drawing.Color]::FromArgb(255, 22, 23, 23),
  [System.Drawing.Color]::FromArgb(255, 42, 40, 37),
  0
)
$graphics.FillRectangle($background, $bounds)

# Quiet portrait-overlap field.
$leftShade = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(112, 0, 0, 0))
$graphics.FillRectangle($leftShade, 0, 0, 378, $height)

# Extremely restrained drafting grid.
$gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(12, 255, 255, 255), 1)
for ($x = 0; $x -lt $width; $x += 44) { $graphics.DrawLine($gridPen, $x, 0, $x, $height) }
for ($y = 0; $y -lt $height; $y += 44) { $graphics.DrawLine($gridPen, 0, $y, $width, $y) }

$cream = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 243, 237))
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 175, 171, 163))
$dim = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 126, 124, 119))
$lime = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 203, 241, 86))
$signalPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 203, 241, 86), 2)
$hairline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(46, 255, 255, 255), 1)

$fontEyebrow = New-Object System.Drawing.Font('Consolas', 11, [System.Drawing.FontStyle]::Regular)
$fontPrimary = New-Object System.Drawing.Font('Segoe UI Semibold', 33, [System.Drawing.FontStyle]::Bold)
$fontSecondary = New-Object System.Drawing.Font('Segoe UI', 18, [System.Drawing.FontStyle]::Regular)
$fontBody = New-Object System.Drawing.Font('Segoe UI', 13, [System.Drawing.FontStyle]::Regular)
$fontMono = New-Object System.Drawing.Font('Consolas', 9.5, [System.Drawing.FontStyle]::Regular)

$graphics.FillEllipse($lime, 430, 67, 9, 9)
$graphics.DrawString('AMAN KUMAR  /  BENGALURU, INDIA', $fontEyebrow, $muted, 451, 59)

$graphics.DrawString('AI ENGINEER', $fontPrimary, $cream, 423, 91)
$graphics.DrawString('& FULL-STACK DEVELOPER', $fontSecondary, $cream, 427, 161)

$graphics.DrawString('Accountable intelligence. Reliable systems. Production resilience.', $fontBody, $muted, 429, 216)

$graphics.DrawLine($hairline, 429, 270, 1507, 270)
$graphics.DrawString('AGENTIC SYSTEMS', $fontMono, $cream, 429, 291)
$graphics.DrawString('EVIDENCE-GROUNDED RAG', $fontMono, $cream, 631, 291)
$graphics.DrawString('DISTRIBUTED BACKENDS', $fontMono, $cream, 896, 291)
$graphics.DrawString('SHIP → MEASURE → VERIFY', $fontMono, $dim, 1192, 291)

# A restrained execution vector that complements, rather than competes with, the portrait.
$points = [System.Drawing.Point[]]@(
  (New-Object System.Drawing.Point(1188, 108)),
  (New-Object System.Drawing.Point(1272, 108)),
  (New-Object System.Drawing.Point(1337, 147)),
  (New-Object System.Drawing.Point(1414, 147)),
  (New-Object System.Drawing.Point(1498, 102))
)
$graphics.DrawLines($signalPen, $points)
foreach ($point in $points) { $graphics.FillEllipse($lime, $point.X - 3, $point.Y - 3, 7, 7) }

$graphics.DrawString('aman-kumar-ai-portfolio.vercel.app', $fontMono, $dim, 429, 339)

$directory = Split-Path -Parent $OutputPath
if (-not (Test-Path -LiteralPath $directory)) { New-Item -ItemType Directory -Path $directory | Out-Null }
$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$fontEyebrow.Dispose()
$fontPrimary.Dispose()
$fontSecondary.Dispose()
$fontBody.Dispose()
$fontMono.Dispose()
$background.Dispose()
$leftShade.Dispose()
$gridPen.Dispose()
$cream.Dispose()
$muted.Dispose()
$dim.Dispose()
$lime.Dispose()
$signalPen.Dispose()
$hairline.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Get-Item -LiteralPath $OutputPath | Select-Object FullName, Length
