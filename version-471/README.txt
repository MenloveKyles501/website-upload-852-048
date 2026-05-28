日韩视频纯静态电影网站

生成内容：
- index.html 首页，包含轮播 Hero 首屏区域。
- categories.html 分类总览页。
- 12 个独立分类页。
- rankings.html 排行榜页。
- search.html 本地搜索页。
- movies/0001.html 到 movies/2000.html 共 2000 个影片详情页。
- assets/site.css、assets/site.js、assets/player.js、assets/movies-data.js 等静态资源。
- sitemap.xml、robots.txt。

图片说明：
- 页面已按规则引用网站顶级目录下的 1.jpg 到 150.jpg。
- 当前上传素材包内未包含这些 JPG 图片，因此未额外生成或替换图片。
- 部署时将 1.jpg、2.jpg ... 150.jpg 放在本目录顶级即可显示封面与 Hero 图片。

播放器说明：
- 每个详情页均包含可点击播放器区域。
- 播放器绑定 HLS/m3u8 播放源，并通过 hls.js 进行初始化，Safari 等支持原生 HLS 的浏览器会直接播放。
