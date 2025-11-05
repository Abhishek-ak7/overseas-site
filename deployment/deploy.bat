@echo off
REM BN Overseas Next.js Deployment Script for Windows
REM This batch script helps with deployment on Windows

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "TERRAFORM_DIR=%PROJECT_ROOT%\terraform"
set "ANSIBLE_DIR=%PROJECT_ROOT%\ansible"

echo.
echo ========================================
echo 🚀 BN Overseas Deployment Tool
echo ========================================
echo.

REM Check prerequisites
echo 📋 Checking prerequisites...
where terraform >nul 2>nul
if errorlevel 1 (
    echo ❌ Terraform not found. Please install it from https://www.terraform.io/downloads
    exit /b 1
)

where ansible-playbook >nul 2>nul
if errorlevel 1 (
    echo ❌ Ansible not found. Please install it: pip install ansible
    exit /b 1
)

where aws >nul 2>nul
if errorlevel 1 (
    echo ❌ AWS CLI not found. Please install it from https://aws.amazon.com/cli/
    exit /b 1
)

echo ✅ All prerequisites installed
echo.

REM Menu
:menu
echo Choose deployment mode:
echo 1) Plan Terraform deployment
echo 2) Apply Terraform deployment
echo 3) View Terraform outputs
echo 4) Destroy infrastructure
echo 5) Update Ansible inventory
echo 6) Run Ansible playbook
echo 7) Exit
echo.

set /p choice="Enter choice (1-7): "

if "%choice%"=="1" goto plan
if "%choice%"=="2" goto apply
if "%choice%"=="3" goto output
if "%choice%"=="4" goto destroy
if "%choice%"=="5" goto inventory
if "%choice%"=="6" goto ansible
if "%choice%"=="7" goto end

echo Invalid choice
goto menu

:plan
echo Planning deployment...
cd /d "%TERRAFORM_DIR%"
terraform init
terraform plan -out=tfplan
pause
goto menu

:apply
echo Applying deployment...
cd /d "%TERRAFORM_DIR%"
terraform apply tfplan
pause
goto menu

:output
echo Terraform outputs:
cd /d "%TERRAFORM_DIR%"
terraform output
pause
goto menu

:destroy
echo WARNING: This will destroy all infrastructure!
set /p confirm="Are you sure? (yes/no): "
if "%confirm%"=="yes" (
    cd /d "%TERRAFORM_DIR%"
    terraform destroy
)
pause
goto menu

:inventory
set /p instance_ip="Enter instance IP: "
cd /d "%ANSIBLE_DIR%"
(
    echo [nextjs]
    echo %instance_ip% ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
    echo.
    echo [nextjs:vars]
    echo ansible_user=ubuntu
    echo ansible_ssh_private_key_file=~/.ssh/id_rsa
) > inventory.ini
echo ✅ Inventory updated
pause
goto menu

:ansible
echo Running Ansible playbook...
cd /d "%ANSIBLE_DIR%"
ansible-playbook -i inventory.ini playbook.yml -v
pause
goto menu

:end
echo Goodbye!
exit /b 0
