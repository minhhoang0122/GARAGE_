@REM Maven Wrapper for Windows
@REM Downloads and runs Maven
@setlocal

set MAVEN_VERSION=3.9.6
set MAVEN_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip
set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo Downloading Maven %MAVEN_VERSION%...
    mkdir "%MAVEN_HOME%" 2>nul
    powershell -Command "Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%TEMP%\maven.zip'"
    powershell -Command "Expand-Archive -Path '%TEMP%\maven.zip' -DestinationPath '%USERPROFILE%\.m2\wrapper\dists' -Force"
    move "%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%" "%MAVEN_HOME%" 2>nul
)

"%MAVEN_HOME%\bin\mvn.cmd" %*
