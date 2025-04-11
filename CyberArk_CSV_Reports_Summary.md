# CyberArk CSV Reports Summary

This document provides a comprehensive overview of all CSV reports that can be generated using the CyberArk API Explorer scripts. These reports can be used to create dashboards, conduct audits, or perform operational analysis of your CyberArk environment.

## Available CSV Reports

### 1. Account Report

**File:** `AccountReport.csv`  
**Script:** `Reports\Accounts\Get-AccountReport.ps1`  
**Description:** Provides detailed information about all accounts managed in CyberArk, including platform details, policy settings, verification status, and more.  
**Key Fields:** UserName, Address, SafeName, PlatformID, SecretType, AccountManaged, ChangeDays, VerifyDays  
**Use Case:** Auditing account settings, identifying unmanaged accounts, checking policy compliance

### 2. Safe Member Report

**File:** `SafeMemberReport.csv`  
**Script:** `Reports\Safes\Get-SafeMemberReport.ps1`  
**Description:** Lists all safe members with their permissions, including users, groups, and applications.  
**Key Fields:** Username, MemberType, UserType, SafeName, various permission fields  
**Use Case:** Security audits, access control reviews, permissioning analysis

### 3. Discovered Accounts Report

**File:** `DiscoveredAccounts.csv`  
**Script:** `Discovered Accounts\Get-DiscoveredAccountsReport.ps1`  
**Description:** Lists all accounts discovered by scanners but not yet onboarded into CyberArk.  
**Key Fields:** AccountName, Address, Username, DiscoveryPlatformType, LastScanDate  
**Use Case:** Account onboarding efforts, security gap analysis, compliance tracking

### 4. Inactive Users Report

**File:** `InactiveUsers.csv`  
**Script:** `User Management\Get-InactiveUsersReport.ps1`  
**Description:** Identifies users who haven't logged in for a specified period, useful for access cleanup.  
**Key Fields:** Username, LastLoginDate, UserType, Suspended, Disabled  
**Use Case:** User access reviews, cleanup of inactive accounts, security audit

### 5. Platform Report

**File:** `PlatformReport.csv`  
**Script:** `Platforms\Get-PlatformReport.ps1`  
**Description:** Provides detailed information about platform configurations.  
**Key Fields:** PlatformID, PlatformName, PolicySettings, PasswordRules  
**Use Case:** Platform standardization, policy review, configuration audits

### 6. Account Risk Report

**File:** `AccountRiskReport.csv`  
**Script:** `Security Events\Get-AccoutnsRiskReport.ps1`  
**Description:** Identifies accounts with security risks based on security events and policy violations.  
**Key Fields:** AccountName, RiskLevel, RiskFactors, LastEvent  
**Use Case:** Security monitoring, risk assessment, prioritizing remediation efforts

### 7. PSM Sessions Report

**File:** `PSMSessions.csv`  
**Script:** `PSM Sessions Management\PSM-SessionsManagement.ps1`  
**Description:** Lists all PSM sessions with details on the connections and activities.  
**Key Fields:** SessionID, Username, AccountName, SafeName, ConnectionDate, Duration  
**Use Case:** Session auditing, usage analysis, security investigations

### 8. AAM Applications Report

**File:** `AAMApplications.csv`  
**Script:** `AAM Applications\Export-Import-Applications.ps1`  
**Description:** Lists all Application Access Manager applications and their configurations.  
**Key Fields:** AppID, Location, Description, AccessPermittedFrom  
**Use Case:** Application inventory, configuration review, managing AAM applications

### 9. Address Optimization Report

**File:** `AddressOptimization.csv`  
**Script:** `Optimize Address\Optimize-Addresses.ps1`  
**Description:** Analyzes address fields and suggests standardization for better management.  
**Key Fields:** CurrentAddress, SuggestedAddress, AccountsCount, Platform  
**Use Case:** Address standardization, platform cleanup, improving search efficiency

### 10. All Accounts Report

**File:** `AllAccounts.csv`  
**Script:** `Get Accounts\Get-Accounts.ps1`  
**Description:** A full listing of all accounts in the vault with basic information.  
**Key Fields:** UserName, Address, SafeName, PlatformID, CreatedTime  
**Use Case:** General inventory, account reviews, bulk operations planning

## How to Generate These Reports

You can generate all reports using the `generate_all_reports.ps1` script:

```powershell
.\generate_all_reports.ps1 -PVWAAddress "https://your-pvwa.domain.com/PasswordVault"
```

Or generate them individually using the specific script for each report.

## Authentication Options

The report scripts support multiple authentication methods:

1. **Direct PVWA Authentication**:

   ```powershell
   .\generate_all_reports.ps1 -PVWAAddress "https://your-pvwa.domain.com/PasswordVault" -PVWAAuthType "CyberArk"
   ```

2. **Identity Authentication** (for Privilege Cloud):
   ```powershell
   .\generate_all_reports.ps1 -UseIdentity -IdentityUserName "user@domain.com" -IdentityURL "https://identity.cyberark.cloud" -PCloudSubDomain "yoursubdomain"
   ```

## Notes on CSV Output

- All reports will be saved to the `exports` directory by default
- You can specify a different export directory using the `-ExportDir` parameter
- A summary of generated reports will be saved to `ReportGenerationResults.csv`
- Authentication is required only once to generate all reports

## Customizing Reports

Most report scripts have additional parameters that allow you to customize the output:

- Include or exclude specific properties
- Filter by criteria
- Format and sort the output

Refer to each script's documentation for detailed customization options.

## Troubleshooting

If you encounter issues generating reports:

1. Ensure you have proper permissions in CyberArk
2. Check that the PVWA URL is correct and accessible
3. Verify your credentials are valid
4. Look for specific error messages in the console output
5. Check if the PSPAS PowerShell module is installed and up to date
