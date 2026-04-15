-- AppVersion 에 (bundleId, mode, version) unique constraint 추가
-- 같은 앱의 같은 모드에서 같은 SemVer 문자열이 중복으로 등록되는 것을 DB 레벨에서 차단
CREATE UNIQUE INDEX `AppVersion_bundleId_mode_version_key` ON `AppVersion`(`bundleId`, `mode`, `version`);
