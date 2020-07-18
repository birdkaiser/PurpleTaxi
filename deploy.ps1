$StaticPath = ".\static"
$SourcePath = ".\build"
$OutputPath = "C:\Program Files (x86)\World of Warcraft\_classic_\Interface\AddOns\PurpleTaxi"

Robocopy $StaticPath $SourcePath /MIR /NFL /NDL /NJH /NC /NS /NP
& .\node_modules\.bin\tstl
Robocopy $SourcePath $OutputPath /MIR /NFL /NDL /NJH /NC /NS /NP