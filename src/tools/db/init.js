/**
 * 初始化数据库
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/07/14 18:17:59
 */

// 歌单
const TABLE_PLAYLIST = `
CREATE TABLE IF NOT EXISTS "playlist" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "name" char(128) NOT NULL
)
`

// aid: 歌手ID
const TABLE_SONGS = `
CREATE TABLE IF NOT EXISTS "songs" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "name" char(128) NOT NULL,
  "artist" char(128) NOT NULL,
  "album" char(128) NOT NULL,
  "duration" integer NOT NULL,
  "cover" char(256) NOT NULL,
  "file_path" char(256) NOT NULL,
  "lrc" text NOT NULL
)
`
// 歌曲和播放列表的关系表(多对多)
const TABLE_RELATIONS = `
CREATE TABLE IF NOT EXISTS "relations" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "sid" integer NOT NULL,
  "pid" integer NOT NULL
)
`

function error(err) {
  console.log('----------------------------------------')
  console.error(err)
  console.log('----------------------------------------')
}

module.exports = function(db) {
  db.query(TABLE_PLAYLIST).catch(error)
  db.query(TABLE_SONGS).catch(error)
  db.query(TABLE_RELATIONS).catch(error)
}
