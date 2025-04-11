[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [String]$TestParam
)

Write-Host "TestParam: $TestParam"