// ============================================================================
// UpdateBoard Jenkins Pipeline
//
// 빌드/런 분리 구조 (spms 패턴)
//   1) 소스 체크아웃 (Jenkins workspace)
//   2) build 컨테이너에 소스 복사 (docker cp)
//   3) build 컨테이너 실행 (docker start -a) → npm install + npm run build
//   4) run 컨테이너 재시작 (docker restart) → 새 빌드 산출물 반영
//
// 전제 조건 (NAS 쪽에 미리 준비되어 있어야 함)
//   - compose.yaml 로 5개 컨테이너가 이미 생성되어 있을 것
//       updateboard-build-debug, updateboard-run-debug,
//       updateboard-build-release, updateboard-run-release,
//       updateboard-db
//   - 환경 파일들이 private/env 에 존재할 것
//
// 허용 브랜치
//   - main        → release 컨테이너 재배포
//   - develop     → debug 컨테이너 재배포
//   - hotfix/*    → release 컨테이너 재배포 (운영 긴급 수정)
// ============================================================================

def TARGET_BUILD = ''
def TARGET_RUN = ''
def CONTAINER_SRC_PATH = '/src'

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        // --------------------------------------------------------------------
        // [1] 브랜치 확인 및 타겟 컨테이너 결정
        // --------------------------------------------------------------------
        stage('Check Branch & Setup') {
            steps {
                script {
                    def branchName = env.BRANCH_NAME
                    echo "Current Branch: ${branchName}"

                    if (branchName == 'main') {
                        TARGET_BUILD = 'updateboard-build-release'
                        TARGET_RUN = 'updateboard-run-release'
                        echo ">>> [PROD Mode] Build: ${TARGET_BUILD}"
                        echo ">>> [PROD Mode] Run: ${TARGET_RUN}"
                    }
                    else if (branchName ==~ /^hotfix\/.+/) {
                        TARGET_BUILD = 'updateboard-build-release'
                        TARGET_RUN = 'updateboard-run-release'
                        echo ">>> [HOTFIX Mode] Build: ${TARGET_BUILD}"
                        echo ">>> [HOTFIX Mode] Run: ${TARGET_RUN}"
                    }
                    else if (branchName == 'develop') {
                        TARGET_BUILD = 'updateboard-build-debug'
                        TARGET_RUN = 'updateboard-run-debug'
                        echo "[DEV Mode] Build: ${TARGET_BUILD}"
                        echo "[DEV Mode] Run: ${TARGET_RUN}"
                    }
                    else {
                        error "This branch(${branchName}) is not deployable. Allowed: main, develop, hotfix/*"
                    }
                }
            }
        }

        // --------------------------------------------------------------------
        // [2] 소스 체크아웃 (Jenkins workspace)
        // --------------------------------------------------------------------
        stage('Checkout') {
            steps {
                cleanWs()
                checkout scm
                echo "Git Checkout Complete"
            }
        }

        // --------------------------------------------------------------------
        // [3] build 컨테이너에 소스 복사
        //     host 볼륨으로 /src 가 마운트되어 있으므로
        //     docker cp 가 실질적으로 NAS 의 Code 디렉터리를 갱신한다
        // --------------------------------------------------------------------
        stage('Copy to Container') {
            steps {
                script {
                    def sourcePath = "${WORKSPACE}/."
                    echo "Copying source to ${TARGET_BUILD}:${CONTAINER_SRC_PATH}"

                    def containerId = sh(
                        script: "docker ps -aqf 'name=${TARGET_BUILD}'",
                        returnStdout: true
                    ).trim()

                    if (!containerId) {
                        error "Container ${TARGET_BUILD} not found. Create the compose project on NAS first."
                    }

                    sh "docker cp ${sourcePath} ${TARGET_BUILD}:${CONTAINER_SRC_PATH}"
                    echo "Source copy complete."
                }
            }
        }

        // --------------------------------------------------------------------
        // [4] build 컨테이너 실행 (npm install + npm run build)
        //     docker start -a 는 컨테이너를 attached 모드로 실행하므로
        //     로그가 Jenkins 콘솔에 실시간 출력되고,
        //     command 가 종료될 때까지 대기한다
        // --------------------------------------------------------------------
        stage('Build') {
            steps {
                script {
                    echo "Starting build in ${TARGET_BUILD}..."
                    sh "docker start -a ${TARGET_BUILD}"
                    echo "Build complete."
                }
            }
        }

        // --------------------------------------------------------------------
        // [5] run 컨테이너 재시작
        //     마운트된 빌드 볼륨에서 새 server.js 를 다시 로드한다
        // --------------------------------------------------------------------
        stage('Apply & Restart') {
            steps {
                script {
                    echo "Restarting runtime ${TARGET_RUN}..."
                    sh "docker restart ${TARGET_RUN}"
                    echo "Restart complete."
                }
            }
        }
    }

    // ------------------------------------------------------------------------
    // 파이프라인 종료 후 처리
    // ------------------------------------------------------------------------
    post {
        success {
            echo "Pipeline SUCCESS: ${env.BRANCH_NAME} -> ${TARGET_RUN}"
        }
        failure {
            echo "Pipeline FAILED: ${env.BRANCH_NAME} branch build"
        }
        always {
            cleanWs()
        }
    }
}
