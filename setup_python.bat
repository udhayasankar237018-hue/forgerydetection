@echo off
set "PTH=C:\Users\udhay\AppData\Local\Programs\Python311\python311._pth"
set "PY=C:\Users\udhay\AppData\Local\Programs\Python311\python.exe"
powershell -Command "(Get-Content '%PTH%') -replace '#import site','import site' | Set-Content '%PTH%'"
curl -s -L https://bootstrap.pypa.io/get-pip.py -o get-pip.py
"%PY%" get-pip.py
del get-pip.py
echo PIP_SETUP_FINISHED
