// ============================================================================
// UpdateBoard Jenkins Pipeline
//
// 브랜치별 동작
//   - develop -> updateboard:develop 이미지 빌드 -> updateboard-run-debug 재배포
//   - main    -> updateboard:main    이미지 빌드 -> updateboard-run-release 재배포
//
// 전제 조건
//   - Jenkins Job 타입: Multibranch Pipeline (env.BRANCH_NAME 사용)
//   - Jenkins 에이전트에서 docker / docker compose 명령 실행 가능
//   - NAS에 compose.yaml 이 COMPOSE_FILE 경로에 존재
//   - private/env/ 하위 env 파일들이 준비되어 있음
// ============================================================================

def IMAGE_TAG = ''
def RUN_CONTAINER = ''

// NAS 상의 compose 파일 위치
def COMPOSE_FILE = '/volume1/UpdateBoard/PROJECT/compose.yaml'

pipeline {
    agent any

    options {
        // 이전 빌드가 진행 중이면 새 빌드가 앞 빌드를 중단하도록
        disableConcurrentBuilds()
        // 빌드 로그 보존 개수 제한
        buildDiscarder(logRotator(numToKeepStr: '20'))
        // 전체 타임아웃
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        // --------------------------------------------------------------------
        // [1] 브랜치 확인 및 타겟 결정
        // --------------------------------------------------------------------
        stage('Check Branch & Setup') {
            steps {
                script {
                    def branchName = env.BRANCH_NAME
                    echo "Current Branch: ${branchName}"

                    if (branchName == 'develop') {
                        IMAGE_TAG = 'updateboard:develop'
                        RUN_CONTAINER = 'updateboard-run-debug'
                        echo "[DEV Mode] Target Image: ${IMAGE_TAG}"
                        echo "[DEV Mode] Target Container: ${RUN_CONTAINER}"
                    }
                    else if (branchName == 'main') {
                        IMAGE_TAG = 'updateboard:main'
                        RUN_CONTAINER = 'updateboard-run-release'
                        echo ">>> [PROD Mode] Target Image: ${IMAGE_TAG}"
                        echo ">>> [PROD Mode] Target Container: ${RUN_CONTAINER}"
                    }
                    else {
                        error "This branch(${branchName}) is not deployable (USE develop or main branch)"
                    }
                }
            }
        }

        // --------------------------------------------------------------------
        // [2] 소스 체크아웃
        // --------------------------------------------------------------------
        stage('Checkout') {
            steps {
                cleanWs()
                checkout scm
                echo "Git Checkout Complete"
            }
        }

        // --------------------------------------------------------------------
        // [3] Docker 이미지 빌드
        //     Dockerfile 은 프로젝트 루트에 위치해야 함
        //     같은 태그로 재빌드하면 기존 이미지는 dangling 상태가 되며,
        //     이후 stage 에서 정리한다
        // --------------------------------------------------------------------
        stage('Build Image') {
            steps {
                script {
                    echo "Building Docker image: ${IMAGE_TAG}"
                    sh "docker build -t ${IMAGE_TAG} ${WORKSPACE}"
                    echo "Docker image build complete."
                }
            }
        }

        // --------------------------------------------------------------------
        // [4] 컨테이너 재배포
        //     docker compose up -d --force-recreate <service> 로
        //     해당 서비스만 새 이미지로 재생성한다
        // --------------------------------------------------------------------
        stage('Deploy') {
            steps {
                script {
                    echo "Redeploying container: ${RUN_CONTAINER}"
                    sh "docker compose -f ${COMPOSE_FILE} up -d --force-recreate --no-deps ${RUN_CONTAINER}"
                    echo "Redeploy complete."
                }
            }
        }

        // --------------------------------------------------------------------
        // [5] 불필요한 dangling 이미지 정리
        //     누적 방지용. 현재 사용 중이 아닌 태그 없는 이미지만 삭제
        // --------------------------------------------------------------------
        stage('Cleanup') {
            steps {
                script {
                    sh "docker image prune -f"
                    echo "Dangling images cleaned up."
                }
            }
        }
    }

    // ------------------------------------------------------------------------
    // 파이프라인 종료 후 처리
    // ------------------------------------------------------------------------
    post {
        success {
            echo "Pipeline SUCCESS: ${env.BRANCH_NAME} -> ${RUN_CONTAINER}"
        }
        failure {
            echo "Pipeline FAILED: ${env.BRANCH_NAME} branch build"
        }
        always {
            // 워크스페이스는 다음 빌드 시작 시에도 cleanWs() 로 비워지지만,
            // 명시적으로 한 번 더 정리
            cleanWs()
        }
    }
}
