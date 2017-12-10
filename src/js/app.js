import '../css/common.less';

$(function () {
    const num = [1, 2];

    function a() {
        console.log([0, ...num]);
    }
    a()
})