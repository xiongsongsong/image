/**
 * Created with IntelliJ IDEA.
 * User: 松松
 * Date: 13-3-6
 * Time: 上午9:33
 * To change this template use File | Settings | File Templates.
 */

seajs.config({
    // 别名配置
    alias: {
        'jquery': 'lib/jquery-1.9.1.min.js'
    },
    // 预加载项
    preload: [
        'jquery'
    ]
})