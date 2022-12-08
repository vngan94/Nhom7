
console.log("hello world")
$('h1').click(() => {
    $('h1').css('color', 'yellow')
    console.log('click h1')
    console.log('xxx')
})
$('h2').click(() => {
    $('h1').css('color', '#fff')
})
// 
$('.list-shoes').mouseover((e) => {
    let a = $(e.currentTarget.children[0].children)
    $(a[0]).css('background', '#a29bfe')
    $(a[0]).css('transform', 'scale(1.05)')
    $(a[1]).css('color', '#a29bfe')
})
$('.list-shoes').mouseout((e) => {
    let a = $(e.currentTarget.children[0].children)
    $(a[0]).css('background', '#fff')
    $(a[0]).css('transform', 'scale(1)')
    $(a[1]).css('color', '#000')
})
var sticky = document.querySelector('.main-nav-bar').offsetTop;
window.onscroll = () => {
    if (window.pageYOffset > sticky) {
        $('.main-nav-bar').addClass('fixed-top')
        $('.main-nav-bar').removeClass('position-relative')
    }
    else {
        $('.main-nav-bar').removeClass('fixed-top')
        $('.main-nav-bar').addClass('position-relative')
    }
}
// Đăng nhập đăng kí
$('.top-header-item-user').mouseover(() => {
    $('.top-header-user').css('display', 'block')
})
$('.top-header-item-user').mouseleave(() => {
    if ($('.top-header-user:hover').length == 0) {
        $('.top-header-user').css('display', 'none')
    }
})
$('.top-header-user').mouseleave(() => {
    $('.top-header-user').css('display', 'none')
})

// $(window).bind('beforeunload', function () {
//     if ($('#text-infor-user').text() === 'Tài khoản') {
//         $('.order-setting-logout').css({ 'display': 'none' })
//         $('.login-signup').css({ 'display': 'block' })
//     }
//     else {
//         $('.order-setting-logout').css({ 'display': 'block' })
//         $('.login-signup').css({ 'display': 'none' })
//     }



//     return
// });

//
