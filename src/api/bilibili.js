// 获取B站视频分P列表和基本信息
export async function getBilibiliVideoList(bvid) {
    const response = await fetch(`/bilibili-api/x/web-interface/view?bvid=${bvid}&jsonp=jsonp`);
    if (!response.ok) {
        throw new Error('Bilibili video list - Network response was not ok');
    }
    const {
        data
    } = await response.json();
    if (!data) throw new Error('Bilibili video list - No data');

    // 兼容单P和多P
    let pages = [];
    if (Array.isArray(data.pages) && data.pages.length > 0) {
        pages = data.pages.map(page => ({
            cid: page.cid,
            title: page.part || data.title,
            duration: page.duration,
            bvid: data.bvid
        }));
    } else if (data.cid && data.duration) {
        // 单P视频（无pages字段）
        pages = [{
            cid: data.cid,
            title: data.title,
            duration: data.duration,
            bvid: data.bvid
        }];
    }

    return {
        title: data.title,
        cover: data.pic || data.cover,
        pages
    };
}