-- App 에 storeUrl (nullable) 컬럼 추가
-- 기존 행들은 NULL 로 채워지며 데이터 손실 없음. 기존 코드는 storeUrl 을 읽지 않으므로 backward compatible.
ALTER TABLE `App` ADD COLUMN `storeUrl` VARCHAR(500) NULL;
