const express = require('express');
const app = express();
const methodOverride = require("method-override")
const { conn, sql } = require('./model/sqlserver')
const path = require('path');
const res = require('express/lib/response');
const ejsMate = require('ejs-mate')
const ExpressError = require('./model/error/ExpressError')
const CatchAsync = require('./model/error/CatchAsync');
const req = require('express/lib/request');
const axios = require('axios');
const { json } = require('express/lib/response');
const cookieParser = require('cookie-parser');
const { prototype } = require('events');
const adminRoutes = require('./routes/admin')
const nodemailer = require('nodemailer')

app.use(cookieParser())

/* */
app.use(express.static('public'))
app.use("/public", express.static("public"))
app.use("/public", express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate)
/**/
//
//
//
var taikhoan = 'Tài khoản';
var sdt = '';

// twilio
const accountSid = 'AC5429aea41a4748909dc37c8ab7c3b028';
const authToken = '8a818395541cb5de30999e506ba2a162'; // twilio nó đổi mỗi ngày, khi thi thì cập nhật lại
const client = require('twilio')(accountSid, authToken);
const sid = 'VA913c8372afba57319fde0f937880e089';

//
//----------------ALL FUNCTION---------------------------
async function loadProduct() {
    let pool = await conn;
    let loadProduct = `exec exe_CTGH @sdt='${sdt}'`
    pool.request().query(loadProduct, (err, data) => {
        if (data.recordset.length > 0) {
            for (let i of data.recordset) {
                res.cookie(`product_${i.MASP.trim()}_${i.SIZE}`, `${i.SOLUONG}`)
            }
            res.cookie("loadProduct", "true")
        }
        else res.cookie("loadProduct,false")
    })
}
//-----------------ALL FUNCTION------------------------------------
//
//
app.get("/", async (req, res) => {
    res.cookie('sdt', '`0334397556`')
    console.log(req.cookies)
    let pool = await conn
    res.send("WELCOME TO 3000 PORT")
})
app.get("/fermeh", CatchAsync(async (req, res) => {
    if (typeof (req.cookies.sdt) == 'undefined') {
        res.cookie('sdt', '')
        res.cookie('taikhoan', 'Tài khoản')
    }
    var cookie = await req.cookies
    let pool = await conn; var m_list = {}; var newPro = {};
    let loadProduct = `exec exe_CTGH @sdt='${sdt}'`
    if ((req.cookies['loadProduct'] == 'false' || req.cookies['loadProduct'] == undefined) && (req.cookies.sdt != '' && typeof (req.cookies.sdt != 'undefined'))) {
        pool.request().query(loadProduct, (err, data) => {
            if (data.recordset.length > 0) {
                for (let i of data.recordset) {
                    res.cookie(`product_${i.MASP}_${i.SIZE}`, `${i.SOLUONG}`)
                }
                res.cookie("loadProduct", "true")
            }
            else res.cookie("loadProduct", "false")
        })
    }
    let sqlNewPro = "SELECT TOP 8 LOAISANPHAM.*,HA=(SELECT TOP 1 LINK from HINHANH where LOAISANPHAM.MASP=HINHANH.MASP) FROM LOAISANPHAM ORDER BY NGAYRAMAT DESC"
    let sqlString = 'SELECT TOP 4 LOAISANPHAM.*,HA=(SELECT TOP 1 LINK from HINHANH where LOAISANPHAM.MASP=HINHANH.MASP) FROM LOAISANPHAM'
    await pool.request().query(sqlNewPro, async (err, data1) => {
        newPro = data1.recordset;
        await pool.request().query(sqlString, (err, data) => {
            m_list = data.recordset;
            // res.cookie('name', 'Tan Ngoc')
            res.render('shop/home', { title: "FERMEH", list: m_list, newList: newPro, taikhoan: req.cookies.taikhoan })
        })
    })
}))
// MAN CHILD WM
app.get('/fermeh/collections/:name', CatchAsync(
    async (req, res) => {
        let pool = await conn;
        let sqlString = `SELECT LOAISANPHAM.*,HA=(SELECT TOP 1 LINK from HINHANH where LOAISANPHAM.MASP=HINHANH.MASP) FROM LOAISANPHAM WHERE DANHMUC='${req.params.name.toUpperCase()}'`
        await pool.request().query(sqlString, (err, data) => {
            res.render('shop/category', { title: `Sản phẩm cho ${req.params.name}`, list: data.recordset, name: req.params.name, taikhoan: req.cookies.taikhoan })
        })
    }
))
//flash sale
app.get('/fermeh/flashsale', CatchAsync(async (req, res) => {
    res.render('shop/category', { title: `Khuyến mãi`, list: [], name: req.params.name, taikhoan: req.cookies.taikhoan })
}))
//flash sale
//theo loai giay dep
app.get('/fermeh/collections/type/:name', CatchAsync(
    async (req, res) => {
        let pool = await conn;
        let sqlString = `SELECT LOAISANPHAM.*,HA=(SELECT TOP 1 LINK from HINHANH where LOAISANPHAM.MASP=HINHANH.MASP)
         FROM LOAISANPHAM WHERE CTLOAI='${req.params.name.toUpperCase()}'`
        await pool.request().query(sqlString, (err, data) => {
            res.render('shop/category', { title: `${req.params.name}`, list: data.recordset, taikhoan: req.cookies.taikhoan, name: 'nam' })
        })
    }))
//theo hang san xuat
app.get('/fermeh/collections/brand/:name', CatchAsync(
    async (req, res) => {
        let name = req.params.name
        // console.log(name)
        let pool = await conn;
        let sqlString = `exec exe_renderBrand '${name.toUpperCase()}'`
        await pool.request().query(sqlString, (err, data) => {
            // console.log(data.recordset)
            res.render('shop/category', { title: req.params.name, list: data.recordset, taikhoan: req.cookies.taikhoan, name: 'nam' })
        })
    }
))
/*----------------- */
//
//
//
//
app.post('/fermeh/signup', CatchAsync(async (req, res) => {
    //console.log(req.body)
    let name = req.body.name
    let phoneNumber = req.body.phoneNumber
    let pass = req.body.password
    let mail = req.body.mail
    let cipherPass
    await axios({
        method: 'GET',
        url: 'https://api.hashify.net/hash/md5/hex?value=' + pass,
        data: null
    }).then((res) => { cipherPass = res.data.Digest })
        .catch((err) => { console.log("errrrr", err) })
    let pool = await conn;
    let sqlString = `exec exe_checkSDT @sdt='${phoneNumber}'`
    await pool.request().query(sqlString, async (err, data) => {
        if (data.recordset.length === 0) {
            await pool.request().query(`select EMAIL from KHACHHANG where EMAIL='${mail}'`, async (err, data) => {
                if (data.recordset.length === 0) {
                    let sqlString = `exec exe_insertKH @tenkh,@matkhau,@sdt,@email`
                    await pool.request()
                        .input('tenkh', sql.NVarChar, name)
                        .input('matkhau', sql.NVarChar, cipherPass)
                        .input('sdt', sql.NVarChar, phoneNumber.trim())
                        .input('email', sql.NVarChar, mail)
                        .query(sqlString, (err, data) => {
                            //console.log('insert thanh cong')
                            //console.log(phoneNumber)
                        })
                    res.send({ done: true })
                } else {
                    res.send({ done: false, message: 'Email đã tồn tại!' })
                }
            })


        }
        else {
            res.send({ done: false, message: 'Số điện thoại đã tồn tại!' })
        }
    })
}))
app.get('/fermeh/signup', async (req, res) => {

    res.render("shop/signup", { title: "Đăng ký", message: "" })

})
//--------------------------------QUEN MAT KHAU
app.get('/fermeh/fogot-password', CatchAsync(async (req, res) => {
    res.render('shop/fogot_password', { title: "Quên mật khẩu" })
}))
app.post('/fermeh/fogot-password', CatchAsync(async (req, res) => {
    let phoneNumber = req.body.phoneNum
    let pool = await conn

    await pool.request().query(`select SDT FROM KHACHHANG where SDT='${phoneNumber}'`, async (err, data) => {
        if (data.recordset.length > 0) {
            // send OTP
            let str = phoneNumber;
            str = '+84' + str.substring(1)
            await client.verify.v2.services(sid)
                .verifications
                .create({ to: str, channel: 'sms' })
                .then(data => {
                    res.send({ done: true })
                }).catch(err => {
                    console.log("Err" + err)
                    res.send({ done: false, message: "Lỗi gửi OTP!" })
                })

        } else {
            res.send({ done: false, message: "Số điện thoại chưa được đăng kí!" })
        }
    })
}))
app.get('/fermeh/OTP/:phone', CatchAsync(async (req, res) => {
    let x = req.params.phone

    res.render('shop/OTP', { title: "Xác nhận OTP", sdt: x })
}))

app.post('/fermeh/OTP', CatchAsync(async (req, res) => {
    await client.verify.v2.services(sid)
        .verificationChecks
        .create({ to: req.body.phoneNumber, code: req.body.OTP })
        .then(verification_check => {
            console.log("verify status " + verification_check.status)
            if (verification_check.status === 'approved') {
                // xác nhận đúng
                res.send({ done: true })
            }
            else {

                // nhập mã OTP sai
                res.send({ done: false, message: "Mã OTP không đúng, vui lòng nhập lại!" })
            }
        })
        .catch(err => {
            console.log("check err ", err)
            res.send({ done: false })
        })

}))

app.get('/fermeh/create-new-password/:phoneNumber', CatchAsync(async (req, res) => {
    let x = req.params.phoneNumber
    x = '0' + x.substring(3);
    console.log("get")
    res.render('shop/createnewpass', { title: 'Tạo mật khẩu mới', sdt: x })
}))

app.post('/fermeh/create-new-password', CatchAsync(async (req, res) => {
    let pass = req.body.password
    let phoneNumber = req.body.phoneNumber
    console.log("req", pass, phoneNumber)
    let cipherPass = ""
    await axios({
        method: 'GET',
        url: 'https://api.hashify.net/hash/md5/hex?value=' + pass,
        data: null
    }).then((res) => { cipherPass = res.data.Digest })
        .catch((err) => { console.log("errrrr", err) })
    console.log("cipher", cipherPass)
    let sql = `UPDATE TAIKHOAN_KH SET MATKHAU = '${cipherPass}' WHERE MAKH=(SELECT MAKH FROM KHACHHANG WHERE SDT='${phoneNumber}')`

    let pool = await conn
    await pool.request().query(sql)

    res.send({ done: true })
}))


//--------------------------------QUEN MAT KHAU
//
//
//
//
app.post('/fermeh/login', CatchAsync(async (req, res) => {

    let phoneNum = req.body.phoneNumber
    let pass = req.body.password
    let cipherPass
    await axios({
        method: 'GET',
        url: 'https://api.hashify.net/hash/md5/hex?value=' + pass,
        data: null
    }).then((res) => { cipherPass = res.data.Digest })
        .catch((err) => { console.log("errrrr", err) })
    let pool = await conn; var l_data = []
    let sqlString = `exec exe_checkSDT @sdt='${phoneNum}'`
    await pool.request().query(sqlString, async (err, data) => {
        l_data = data.recordset
        //console.log('data', data.recordset)
        if (data.recordset.length === 0) {
            res.send({ done: false, error: 'Số điện thoại hoặc mật khẩu không đúng!' })
        }
        else {
            let sqlString1 = `exec exe_findKH @sdt='${phoneNum.trim()}',@matkhau='${cipherPass.trim()}'`
            //console.log(sqlString1)
            return await pool.request().query(sqlString1, async (err, data1) => {
                if (data1.recordset.length === 0) {
                    res.send({ done: false, error: 'Số điện thoại hoặc mật khẩu không đúng!' })
                }
                else {
                    sdt = l_data[0].SDT
                    cookie = req.cookies;
                    for (var prop in cookie) {
                        if (prop === 'role' || prop === 'tknv' || prop === 'tentk') continue
                        res.cookie(prop, '', { expires: new Date(0) });
                    }
                    //
                    //
                    res.cookie('sdt', l_data[0].SDT)
                    res.cookie('taikhoan', l_data[0].TENKH)
                    //
                    //
                    res.send({ done: true })
                }
            })
        }
    })

}))
app.get('/fermeh/login', (req, res) => {
    res.render("shop/login", { title: "Đăng nhập", message: "" })
})
app.get('/fermeh/product', (req, res) => {
    res.render('shop/product', { title: "Product" })
})

app.get('/fermeh/category', (req, res) => {
    res.render('shop/category', { title: "Nam" })
})

app.get('/shoes', async (req, res) => {
    let pool = await conn;
    let sqlString = "SELECT * FROM SANPHAM";
    return await pool.request().query(sqlString, (err, data) => {
        let dataType = data.recordset
        res.send(dataType)
    })
})

app.get('/fermeh/detail/:id', CatchAsync(
    async (req, res) => {
        var id = req.params.id; var detail = [];
        let pool = await conn;
        let sqlString = `SELECT LOAISANPHAM.*,LINK FROM HINHANH, LOAISANPHAM where HINHANH.MASP=${id} and LOAISANPHAM.MASP=${id}`
        await pool.request().query(sqlString, async (err, data1) => {
            detail = data1.recordset;
            let sqlSecond = `SELECT TOP 4 LOAISANPHAM.*,HA=(SELECT TOP 1 LINK from HINHANH where LOAISANPHAM.MASP=HINHANH.MASP)
             FROM LOAISANPHAM WHERE  DANHMUC = '${detail[0].DANHMUC}' OR  CTLOAI ='${detail[0].CTLOAI}' OR LOAI = '${detail[0].LOAI}'  `
            await pool.request().query(sqlSecond, (err, data) => {
                let list = data.recordset;
                // console.log(list)
                console.log('detail=', detail)
                console.log('list=', list)
                res.render('shop/product', { title: detail[0].TENSP, detail: detail, list: list, taikhoan: req.cookies.taikhoan })
            })
        })
    }
))
app.post('/fermeh/detail/product/count-number-procduct', CatchAsync(async (req, res) => {
    let pool = await conn
    let sql = `select SL=count(*) from SANPHAM where MASP=${req.body.id} and SIZE=${req.body.size} and SOLD=0`
    await pool.request().query(sql, async (err, data) => {
        if (data.recordset.length > 0) {
            res.send({ data: data.recordset[0].SL })
        }
        else {
            res.send({ data: 0 })
        }
    })
    // console.log(req.body)
}))
//
//--------------------------------------FAVOURITE
//
app.get("/fermeh/favourite", async (req, res) => {
    let pool = await conn
    if (req.cookies.sdt == '' || typeof (req.cookies.sdt) == 'undefined') {
        res.render("shop/login", { title: "Đăng nhập", message: "" })
    }
    else {
        let sqlString = `exec exe_renderFavourite @sdt='${req.cookies.sdt}'`
        pool.request().query(sqlString, async (err, data) => {
            let rel = data.recordset
            if (rel.length === 0) {
                res.render("shop/favourite", { title: "Yêu thích", fav: '', taikhoan: req.cookies.taikhoan })
            }
            else {
                res.render("shop/favourite", { title: "Yêu thích", fav: rel, taikhoan: req.cookies.taikhoan })
            }
        })
    }
})
app.post('/fermeh/add-to-fav/:id', async (req, res) => {
    let pool = await conn
    if (req.cookies.sdt == '' || typeof (req.cookies.sdt) == 'undefined') {
        res.render("shop/login", { title: "Đăng nhập", message: "" })
    }
    else {
        let sqlString = `exec exe_insertFav @sdt='${req.cookies.sdt}',@masp=${parseInt(req.params.id)},@size=${parseInt(req.body.size_choose)}`
        pool.request().query(sqlString, (err, data) => {
            // res.redirect(`/fermeh/detail/${req.params.id}`)
            res.send({ done: true })
        })
    }
})
app.post('/fermeh/fav/add-to-cart', CatchAsync(async (req, res) => {
    console.log(req.body)
    let cnt = 0;
    let coo = req.cookies
    for (let i in coo) {
        if (i.trim() === `product_${req.body.masp}_${req.body.size}`) {
            await res.cookie(i.trim(), parseInt(coo[i]) + 1);
            cnt++;
        }
    }
    if (cnt === 0) {
        await res.cookie(`product_${req.body.masp}_${req.body.size}`, 1)
    }
    res.send({ done: true })
}))

app.post('/fermeh/fav/del-product', CatchAsync(async (req, res) => {
    console.log(req.body)
    let pool = await conn
    let sqlString = `exec exe_delFavProduct @sdt='${req.cookies.sdt}',@masp=${parseInt(req.body.masp)},@size=${parseInt(req.body.size)}`
    pool.request().query(sqlString, (err, data) => {
        res.send({ done: true })
    })
    //res.redirect(`/fermeh/favourite`)

}))
//
//-------------------------------CART MODAL----------------------------------------------------
//
app.post('/fermeh/add-to-cart/:id', CatchAsync(async (req, res) => {
    console.log(req.body)
    let cnt = 0;
    let coo = req.cookies
    for (let i in coo) {
        if (i.trim() === `product_${req.params.id}_${req.body.size_choose}`) {
            await res.cookie(i.trim(), parseInt(coo[i]) + parseInt(req.body.num));
            cnt++;
        }
    }
    if (cnt === 0) {
        await res.cookie(`product_${req.params.id}_${req.body.size_choose}`, parseInt(req.body.num))
    }
    // res.redirect(`/fermeh/detail/${req.params.id}`)
    res.send({ done: true })
}))
app.get("/fermeh/cart", async (req, res) => {
    let listProduct = req.cookies
    //console.log('list product', listProduct)
    var sdt = req.cookies.sdt
    let cnt = 0;
    let pool = await conn
    if (req.cookies.sdt != '' && typeof (req.cookies.sdt) != 'undefined') {
        let loadProduct = `exec exe_CTGH @sdt='${req.cookies.sdt}'`
        pool.request().query(loadProduct, (err, data) => {
            if (data.recordset.length > 0) {
                // console.log('data record', data.recordset)
                for (let i in listProduct) {
                    if (i === 'loadProduct' || i === 'sdt' || i === 'taikhoan' || i === 'role' || i === 'tentk' || i === 'tknv') continue;
                    cnt = 0
                    let arr = i.split('_')
                    //console.log('arr=', arr)
                    for (let j of data.recordset) {
                        if (j.MASP == parseInt(arr[1]) && j.SIZE == parseInt(arr[2])) {
                            let updateProduct = `exec exe_updateCTGH @sdt='${sdt}',@masp=${parseInt(arr[1])},@size=${parseInt(arr[2])} ,@soluong=${parseInt(listProduct[i])} `
                            pool.request().query(updateProduct, (err, data) => {
                                console.log("update product successful")
                            })

                            cnt++;
                        }
                    }
                    if (cnt === 0) {
                        console.log(parseInt(listProduct[i]))
                        let insertProduct = `exec exe_insertCTGH @sdt='${sdt}',@masp=${parseInt(arr[1])},@size=${parseInt(arr[2])},@soluong =${parseInt(listProduct[i])}`
                        pool.request().query(insertProduct, (err, data) => {
                            //console.log(arr)
                            // console.log(insertProduct)
                            console.log("insert product successful")
                        })

                    }
                }
            }
            else {
                for (let i in listProduct) {
                    if (i === 'loadProduct' || i === 'taikhoan' || i === 'sdt' || i === 'role' || i === 'tentk' || i === 'tknv') continue;
                    let insertProduct = `exec exe_insertCTGH @sdt='${sdt}',@masp=${parseInt(i.split('_')[1])},@size=${parseInt(i.split('_')[2])} ,@soluong =${parseInt(listProduct[i])}`
                    pool.request().query(insertProduct, (err, data) => {
                        // console.log('i bằng', i)
                        // console.log(`exec exe_insertCTGH @sdt='${sdt}',@masp=${parseInt(i.split('_')[1])},@size=${parseInt(i.split('_')[2])} ,@soluong =${parseInt(listProduct[i])})`)
                        // console.log('list i bằng', listProduct[i])
                        console.log("insert product successful")
                    })

                }
            }
        })
        setTimeout(() => {
            let renderCart = `exec exe_renderCart @sdt='${req.cookies.sdt}'`
            pool.request().query(renderCart, (err, data) => {
                //console.log(data.recordset)
                if (data.recordset.length > 0) {
                    var tong = 0;
                    for (let i of data.recordset) {
                        tong += i.GIA * i.SOLUONG
                    }
                    return res.render("shop/cart", { title: "Giỏ hàng", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: data.recordset, tongtien: tong })
                }
                else {
                    return res.render("shop/cart", { title: "Giỏ hàng", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: '', tongtien: 0 })
                }
            })
        }, 200);
    }
    else {
        let arr = req.cookies
        // console.log(arr)
        var cart = [];
        var count = 0
        // console.log(Object.keys(arr)[Object.keys(arr).length - 1])
        var rel = []
        if (Object.getPrototypeOf(arr) != null) {
            for (let i in arr) {
                if (i === 'sdt' || i === 'taikhoan' || i === 'role' || i === 'tentk' || i === 'tknv' || i === 'loadProduct') {
                    count++;
                    //console.log('count=', count)
                    if (count == Object.keys(arr).length) {
                        res.render("shop/cart", { title: "Giỏ hàng", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: '' })
                        break
                    } else {
                        continue
                    }
                }
                //  console.log('xx')
                let sqlString = `select GIA,MINSIZE,MAXSIZE,TENSP,CTLOAI,IDHA=(select top 1 LINK from HINHANH where HINHANH.MASP=LOAISANPHAM.MASP) 
                from LOAISANPHAM where MASP=${i.split('_')[1]}`
                //console.log(sqlString)
                pool.request().query(sqlString, (err, data) => {
                    // try {
                    cart.push(data.recordset[0]);
                    //console.log(i)
                    // console.log('cart length=', cart.length)
                    //  console.log(i == Object.keys(arr)[Object.keys(arr).length - 1])
                    if (count + cart.length == Object.keys(arr).length) {
                        var tong = 0;
                        // for (let i of cart) {
                        //     tong += i.GIA
                        // }
                        let id = 0;
                        for (let k in arr) {
                            if (k === 'loadProduct' || k === 'taikhoan' || k === 'sdt' || k === 'role' || k === 'tentk' || k === 'tknv') continue;
                            let oj = {}
                            oj['GIA'] = cart[id].GIA;
                            oj['MINSIZE'] = cart[id].MINSIZE
                            oj['MAXSIZE'] = cart[id].MAXSIZE
                            oj['TENSP'] = cart[id].TENSP
                            oj['CTLOAI'] = cart[id].CTLOAI
                            oj['IDHA'] = cart[id].IDHA
                            id++;
                            oj['SIZE'] = k.split('_')[2]
                            oj['MASP'] = k.split('_')[1]
                            oj['SOLUONG'] = arr[k]
                            tong += oj['GIA'] * oj['SOLUONG']
                            rel.push(oj)
                        }
                        // console.log('rel =', rel)
                        if (rel.length == 0) {
                            return res.render("shop/cart", { title: "Giỏ hàng", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: '' })
                        }
                        else {
                            console.log(rel)
                            return res.render("shop/cart", { title: "Giỏ hàng", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: rel, tongtien: tong })
                        }
                    }
                    // }
                    // catch (e) {
                    //     return res.render("shop/cart", { title: "Giỏ hàng", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: '' })
                    // }
                })
            }
            // if (count == Object.keys(arr).length) {
            //     return res.render("shop/cart", { title: "Giỏ hàng", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: '' })
            // }
        }
        else {
            //console.log(arr)
            res.render("shop/cart", { title: "Giỏ hàng", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: '' })
        }
    }
})
//---------------------FORM THANH TOAN
//
app.post("/fermeh/pay-success", async (req, res) => {
    res.render('shop/paysuccess', { title: "Thanh toán thành công", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt })
})
app.get("/fermeh/pay-success", async (req, res) => {
    res.render('shop/paysuccess', { title: "Thanh toán thành công", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt })
})
// -------------------------------------THANH TOAN XU LY
app.post('/fermeh/payment', async (req, res) => {
    console.log('req.body cua payment: \n', req.body)
    let ten = req.body.ten
    let email = req.body.email
    let phone = req.body.sdt
    let diachi = req.body.diachi
    try {
        diachi.replace('\n', '')
    } catch (e) { }
    let kq = ''
    for (let i of diachi.split(' ')) {
        if (i != '') kq += i.trim() + " "
    }
    diachi = kq.trim()
    let method = req.body.method
    let arr = req.body.sp
    let tong = req.body.tongtien
    let pool = await conn
    // console.log('arr', arr)
    // console.log(ten, email, phone, diachi, method, tong)
    let sqlHD = `exec exe_insertHOADON_DONHANG_LICHSUTINHTRANG '${req.cookies.sdt}',${parseInt(tong)},N'${diachi.trim()}','${method}'`
    if (req.cookies.sdt != '') {
        console.log('payment nooooo')
        await pool.request().query(sqlHD, async (err, data) => {
            var mahd = parseInt(data.recordset[0].MAHD)
            console.log('tạo hóa đơn thành công!')
            console.log('arr', arr)
            for (let i of arr) {
                let sqldel = `exec exe_delCartProduct '${req.cookies.sdt}',${parseInt(i.MASP)},${parseInt(i.SIZE)}`
                await pool.request().query(sqldel, (err, data) => { console.log('xoa thanh cong!') })
                try {
                    res.clearCookie(`product_${parseInt(i.MASP)}_${parseInt(i.SIZE)}`)
                    document.cookie = `product_${parseInt(i.MASP)}_${parseInt(i.SIZE)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                } catch (e) { }
                let sql = `exec exe_createCTHD ${mahd},${parseInt(i.MASP)},${parseInt(i.SIZE)},${parseInt(i.SOLUONG)}`
                await pool.request().query(sql, (err, data) => {
                    //console.log(sql)
                    console.log('tao cthd thanh cong')
                })
            }
        })
        res.send({ done: true })
    } else {
        console.log('chi tiết thông tin khách thanh toán', parseInt(tong), diachi, ten, email, phone)
        let sqlCreateHD = `insert into HOADON(TONGTIEN,DIACHI,TEN,EMAIL,SDT) VALUES(${parseInt(tong)},N'${diachi}',N'${ten}','${email}','${phone}') 
                            select top 1 MAHD from HOADON order by MAHD desc`
        //thuc thi truy vấn
        await pool.request().query(sqlCreateHD, async (err, data) => {
            console.log('tạo hóa đơn thành công!')
            let mahd = parseInt(data.recordset[0].MAHD)
            for (let i of arr) {
                let sql = `exec exe_createCTHD ${mahd},${parseInt(i.MASP)},${parseInt(i.SIZE)},${parseInt(i.SOLUONG)}`
                await pool.request().query(sql, (err, data) => {
                })
            }
        })

        let coo = req.cookies
        for (let i of arr) {
            for (let j in coo) {
                if (i.MASP == j.split(' ')[1] && i.SIZE == j.split(' ')[2]) {
                    console.log('bang nhau')
                    try {
                        res.clearCookie(j)
                        document.cookie = `product_${j.split(' ')[1]}_${j.split(' ')[2]}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                    } catch (e) { }
                }
            }
        }
        res.send({ done: true })
    }
})
//------------------------------GET FORM THANH TOAN-------------------
app.get("/fermeh/payment", async (req, res) => {
    console.log(req.query)
    var listPay = []
    for (let i in req.query) {
        listPay.push({ MASP: i.split('_')[1], SIZE: i.split('_')[2] })
    }
    console.log(listPay)
    let listProduct = req.cookies
    let cnt = 0;
    var sdt = req.cookies.sdt
    let pool = await conn
    if (req.cookies.sdt != '' && typeof (req.cookies.sdt) != 'undefined') {
        //console.log('here nè')
        // console.log(typeof (req.cookies.sdt))
        // console.log(req.cookies.sdt === '')
        let loadProduct = `exec exe_CTGH @sdt='${req.cookies.sdt}'`
        pool.request().query(loadProduct, (err, data) => {
        })
        setTimeout(() => {
            let renderCart = `exec exe_renderCart @sdt='${sdt}'`
            pool.request().query(renderCart, async (err, data) => {
                if (data.recordset.length > 0) {
                    var cart = data.recordset
                    console.log(req.query)



                    var tong = 0;
                    for (let i of cart) {
                        for (let j in req.query) {
                            if (j.split('_')[2] == i.SIZE && i.MASP == j.split('_')[1]) {
                                tong += i.GIA * i.SOLUONG
                            }
                        }
                    }

                    let renderLocate = `exec exe_renderLocatePayment '${req.cookies.sdt}'`
                    await pool.request().query(renderLocate, async (err, data) => {
                        if (data.recordset.length > 0) {
                            return res.render("shop/payment", { title: "Thanh toán", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: cart, tongtien: tong, locate: data.recordset, payment: listPay })
                        } else {
                            let renderTinh = `exec exe_requestTinh`
                            await pool.request().query(renderTinh, async (err, data) => {
                                return res.render("shop/payment", { title: "Thanh toán", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: cart, tongtien: tong, locate: "", tinh: data.recordset, payment: listPay })
                            })

                            //     }
                            // })
                            // } 
                            // else {
                            // let renderLocate = `exec exe_renderLocatePayment '${req.cookies.sdt}'`
                            // await pool.request().query(renderLocate, async (err, data) => {
                            //     if (data.recordset.length > 0) {
                            //         return res.render("shop/payment", { title: "Thanh toán", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: cart, tongtien: 0, locate: data.recordset, payment: [] })
                            //     } else {
                            //         let renderTinh = `exec exe_requestTinh`
                            //         await pool.request().query(renderTinh, async (err, data) => {
                            //             return res.render("shop/payment", { title: "Thanh toán", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: cart, tongtien: 0, locate: "", tinh: data.recordset, payment: [] })
                            //         })

                            //     }
                            // })
                        }
                    })
                }
            })
        }, 300);
    }
    else {
        console.log('here')
        console.log(req.query)
        let arr = req.cookies
        var cart = []; let j = Object.keys(req.query).length
        var rel = []; var payment = []
        var tong = 0
        if (Object.getPrototypeOf(req.query) != null) {
            for (let i in req.query) {
                // if (i.split('_')[0] != 'product') continue
                console.log(i)
                let sqlString = `select MASP,GIA,MINSIZE,MAXSIZE,TENSP,CTLOAI,IDHA=(SELECT TOP 1 LINK from HINHANH where LOAISANPHAM.MASP=HINHANH.MASP),SIZE=${i.split('_')[2]}
                from LOAISANPHAM where MASP=${i.split('_')[1]} order by MASP`
                console.log(sqlString)
                pool.request().query(sqlString, async (err, data) => {
                    try {
                        cart.push(data.recordset[0])
                        j--;
                        if (j === 0) {
                            for (let i of cart) {
                                for (let k in arr) {
                                    if (k.split('_')[2] == i.SIZE && i.MASP == k.split('_')[1]) {
                                        console.log(i)
                                        console.log(k)
                                        console.log(parseInt(i.GIA), parseInt(arr[k]))
                                        tong += (parseInt(i.GIA) * parseInt(arr[k]))
                                    }
                                }
                            }
                            for (let k in arr) {
                                if (k.split('_')[0] != 'product') continue;
                                for (let i of cart) {
                                    if (i.MASP == k.split('_')[1]) {
                                        let oj = {}
                                        oj['GIA'] = i.GIA;
                                        oj['MINSIZE'] = i.MINSIZE
                                        oj['MAXSIZE'] = i.MAXSIZE
                                        oj['TENSP'] = i.TENSP
                                        oj['CTLOAI'] = i.CTLOAI
                                        oj['IDHA'] = i.IDHA
                                        oj['SIZE'] = k.split('_')[2]
                                        oj['MASP'] = k.split('_')[1]
                                        oj['SOLUONG'] = arr[k]
                                        rel.push(oj)
                                    }
                                }
                            }
                            //console.log('rel bang', rel)
                            let renderTinh = `exec exe_requestTinh`
                            await pool.request().query(renderTinh, async (err, data) => {
                                var tinh = data.recordset
                                let sqlBangTam = `create table ##paymentContain(MASP int,SIZE int,GIA money)`
                                await pool.request().query(sqlBangTam, async (err, data) => {
                                    for (let i of rel) {
                                        //đếm số sản phẩm có trong kho
                                        let sqlCountPr = `select SL = count(*) from SANPHAM where MASP=${parseInt(i.MASP)} and SANPHAM.SIZE=${i.SIZE} and SANPHAM.SOLD=0`
                                        await pool.request().query(sqlCountPr, async (err, data) => {
                                            if (data.recordset.length > 0) {
                                                //insert vao bang tam
                                                let sqlInsert = `insert into ##paymentContain select MASP,SIZE,GIA=(select GIA from LOAISANPHAM where 
                                                    MASP=${parseInt(i.MASP)}) from SANPHAM where MASP=${parseInt(i.MASP)} and SANPHAM.SIZE=${i.SIZE} and SANPHAM.SOLD=0`
                                                await pool.request().query(sqlInsert, async (err, data) => {
                                                })
                                            }
                                        })
                                    }
                                })
                                // setTimeout(() => {
                                //     pool.request().query('select * from ##paymentContain', async (err, data) => {
                                //         if (data.recordset.length > 0) {
                                //             payment = data.recordset
                                //         }
                                //         else {
                                //             payment = []
                                //         }
                                //         var tong = 0;
                                //         let coo = req.cookies
                                //         // console.log(coo)
                                //         for (let i of payment) {
                                //             for (let j in coo) {
                                //                 if (parseInt(i.SIZE) == parseInt(j.split('_')[2]) && parseInt(i.MASP) == parseInt(j.split('_')[1])) {
                                //                     tong += parseInt(coo[j]) * i.GIA;
                                //                     continue
                                //                 }
                                //             }
                                //         }
                                //         await pool.request().query('drop table ##paymentContain', (err, data) => {
                                //             return res.render("shop/payment", { title: "Thanh toán", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: rel, tongtien: tong, tinh: tinh, payment: payment })
                                //         })
                                //     })
                                // }, 100);
                                return res.render("shop/payment", { title: "Thanh toán", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: rel, tongtien: tong, tinh: tinh, payment: listPay })
                            })
                        }
                    }
                    catch (e) {
                        return res.render("shop/payment", { title: "Thanh toán", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: '' })
                    }
                })
            }
        }
        else {
            //console.log(arr)
            res.render("shop/payment", { title: "Thanh toán", taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, cart: '' })
        }
    }
})
//
//---------------------FORM THANH TOAN
app.post('/fermeh/cart/del-product', CatchAsync(async (req, res) => {
    if (req.cookies.sdt != '') {
        console.log(req.body)
        let pool = await conn
        let sqlString = `exec exe_delCartProduct @sdt='${req.cookies.sdt}',@masp=${parseInt(req.body.masp)},@size=${parseInt(req.body.size)}`
        pool.request().query(sqlString, (err, data) => {
            if (err) res.send({ done: false })
        })
        // res.redirect(`/fermeh/cart`)
        res.send({ done: true })
    }
    else {
        // res.redirect(`/fermeh/cart`)
        res.send({ done: true })
    }
}))
//DANG XUAT,CAI DAT,DON HANG
//
//
app.get("/fermeh/user/logout", (req, res) => {
    //xóa hết mấy cái cookie đi 
    for (let i in req.cookies) {
        if (i === 'role' || i === 'tknv' || i === 'tentk') continue
        res.clearCookie(i)
    }
    res.cookie('sdt', '')
    res.cookie('taikhoan', 'Tài khoản')
    taikhoan = 'Tài khoản'
    sdt = ''
    res.redirect('/fermeh')
})
app.get("/fermeh/user/setting", async (req, res) => {
    let pool = await conn;
    let sqlString = `exec exe_renderSetting @sdt='${req.cookies.sdt}'`
    await pool.request().query(sqlString, (err, data) => {
        try {
            data.recordset[0].EMAIL.prototype
        }
        catch (e) {
            data.recordset[0].EMAIL = 'none'
        }
        if (data.recordset.length > 0) {
            let set = data.recordset
            let sqlLocate = `exec exe_renderLocate '${req.cookies.sdt}'`
            pool.request().query(sqlLocate, (err, data) => {
                if (data.recordset.length > 0) {
                    res.render("user/setting", { title: 'Cài đặt', set: set, taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, diachi: data.recordset })
                }
                else {
                    res.render("user/setting", { title: 'Cài đặt', set: set, taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, diachi: 0 })
                }
            })
        }
        else {
            res.render("user/setting", { title: 'Cài đặt', taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt })
        }
    })
})
app.post('/fermeh/user/changeUsername', async (req, res) => {
    res.redirect("/fermeh/user/setting");
})

app.get('/fermeh/user/detail_order', CatchAsync(async (req, res) => {
    // console.log("in", req.cookies.sdt)

    if (req.cookies.sdt == '' || typeof (req.cookies.sdt) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/login')
    }
    else {

        var madh = parseInt(req.query.madh)
        var mahd = parseInt(req.query.mahd)
        console.log("mahd", req.query)
        let sqlDetail = `exec renderDetailCTHD @mahd=${mahd}`
        let sqlBill = `exec renderDetailBill @mahd=${mahd}`
        let sqlTime = `EXEC exec_rendertime  @iddh=${madh}`

        let pool = await conn
        await pool.request().query(sqlBill, async (err, data) => {
            console.log("in", data)
            var hd = data.recordset
            //bill
            await pool.request().query(sqlDetail, async (err, data) => {
                var detail = data.recordset
                console.log("in", detail) // detail


                await pool.request().query(sqlTime, async (err, data) => {

                    console.log("in2", data.recordset) // detail
                    res.render('user/detail_order', { title: "Chi tiết đơn hàng", detail: detail, time: data.recordset, bill: hd, taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt })
                })
            })

        })

    }
}))

//
app.get('/fermeh/user/order', async (req, res) => {

    // console.log("in", req.cookies.sdt)
    if (req.cookies.sdt == '' || typeof (req.cookies.sdt) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/login')
    }
    else {
        let pool = await conn
        // console.log(req.cookies.sdt)
        await pool.request().query(`exec exe_renderBill '${req.cookies.sdt}'`, async (err, data) => {
            var bill = data.recordset
            //   console.log(bill)
            var arr = []
            while (bill.length > 0) {
                var tmp = []
                let j = bill.shift()
                tmp.push(j)
                let i = 0;
                while (i < bill.length) {
                    if (bill[i].MAHD == j.MAHD) {
                        let tg = bill.splice(i, 1)
                        tmp.push(tg[0])
                    }
                    else {
                        i++;
                    }
                }
                arr.push(tmp)
            }
            // console.log("arr", arr)

            // console.log(arr[0][0].NGAYLAP)
            res.render('user/order', { title: 'Đơn hàng đã mua', taikhoan: req.cookies.taikhoan, sdt: req.cookies.sdt, arr: arr })
        })
    }
})
//-------------------------------HUY DON HANG
app.post('/fermeh/user/order/cancel-order', CatchAsync(async (req, res) => {
    if (req.cookies.sdt == '' || typeof (req.cookies.sdt) == 'undefined') {
        res.render("shop/login", { title: "Đăng nhập", message: "" })
    }
    else {
        console.log("in", req.body)
        let mahd = req.body.mahd
        let pool = await conn
        let time = `exec insert_time @idhd = ${mahd}, @idtt = 1`
        await pool.request().query(time, async (err, data) => {
            await pool.request().query(`update DONHANG set IDTINHTRANG = 1 where IDHD=${mahd} select IDSP from CTHD where MAHD=${mahd}`, async (err, data) => {
                console.log(data.recordset)
                for (let i of data.recordset) {
                    console.log(i)
                    await pool.request().query(`update SANPHAM set SOLD=0 where IDSP=${i.IDSP}`, async (err, data) => {
                    })
                }

                res.send({ done: true })
            })
        })
    }

}))
//-------------------------------HUY DON HANG
//---------------------------SEARCH FORM--------------------------------
//
app.get('/fermeh/search', CatchAsync(async (req, res) => {
    let pool = await conn
    let name = req.query.name
    name = name.toLowerCase();
    name = name.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    name = name.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    name = name.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    name = name.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    name = name.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    name = name.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    name = name.replace(/đ/g, "d");
    await pool.request().query(`exec exe_searchProduct '${name}'`, async (err, data) => {
        if (data.recordset.length > 0) {
            res.render('shop/category', { taikhoan: req.cookies.taikhoan, title: `Kết quả tìm kiếm cho "${req.query.name}"-fermeh`, name: 'nam', list: data.recordset })
        }
        else {
            res.render('shop/category', { taikhoan: req.cookies.taikhoan, title: `Kết quả tìm kiếm cho "${req.query.name}"-fermeh`, name: 'nam', list: [] })
        }
    })
}))
//
//---------------------------SEARCH FORM--------------------------------
//-----------------------------------AJAX-------------------------------
app.post('/fermeh/ajax/update-quantity-product', async (req, res) => {
    if (req.cookies.sdt != '') {
        let pool = await conn;
        let sqlString = `exec exe_updateCTGH '${req.cookies.sdt}',${parseInt(req.body.MASP)},${parseInt(req.body.SIZE)},${parseInt(req.body.SOLUONG)}`
        await pool.request().query(sqlString, (err, data) => {
        })
        let sqlString1 = `select GIA from LOAISANPHAM where MASP=${parseInt(req.body.MASP)}`
        await pool.request().query(sqlString1, (err, data) => {
            console.log(data.recordset)
            console.log('quantity-ajax')
            res.send({ error: 0, GIA: data.recordset[0].GIA })
        })
    }
    else {
        let pool = await conn;
        let sqlString = `select GIA from LOAISANPHAM where MASP=${parseInt(req.body.MASP)}`
        await pool.request().query(sqlString, (err, data) => {
            console.log(data.recordset)
            console.log('quantity-ajax')
            res.send({ error: 0, GIA: data.recordset[0].GIA })
        })
    }
})
app.post('/fermeh/ajax/update-size-product', async (req, res) => {
    let coo = req.cookies
    if (req.cookies.sdt != '') {
        console.log('chỗ này')
        let newSize = req.body.SIZE
        let pool = await conn;
        let sqlCart = `exec exe_renderCart '${req.cookies.sdt}'`
        let sqlString = `exec exe_updateSizeCTGH '${req.cookies.sdt}',${parseInt(req.body.MASP)},${parseInt(req.body.SIZE)},${parseInt(req.body.OLDSIZE)}`
        await pool.request().query(sqlCart, (err, data) => {
            let chk = false
            if (data.recordset.length > 0) {
                for (let obj of data.recordset) {
                    if (obj.SIZE == parseInt(newSize) && obj.MASP == parseInt(req.body.MASP)) {
                        chk = true
                        console.log('trùng size')
                        res.send({ error: 1 })
                    }
                }
                if (chk === false) {
                    pool.request().query(sqlString, (err, data) => {
                        console.log('update success')
                        res.send({ error: 0 })
                    })
                }
            }
            else {
                console.log('khong dc')
            }
        })
    }
    else {
        console.log(req.cookies)
        let cnt = 0;
        for (let item in coo) {
            if (item == 'loadProduct') continue
            let arr = item.split('_')
            if (arr[1].trim() == req.body.MASP && arr[2].trim() == req.body.SIZE) {
                cnt++;
            }
        }
        if (cnt === 1) res.send({ error: 1 })
        else {
            for (let item in coo) {
                let arr = item.split('_')
                if (arr[1].trim() == req.body.MASP.trim() && arr[2].trim() == req.body.OLDSIZE) {
                    console.log('arr', arr)
                    console.log('req', req.body.OLDSIZE, req.body.MASP, req.body.SIZE)
                    console.log(item)
                }
            }
            // res.cookie(`product_${req.body.MASP.trim()}_${req.body.SIZE}`, parseInt(req.body.SOLUONG))
            res.send({ error: 0 })
        }
        console.log(req.cookies)
        console.log('req body', JSON.stringify(req.body))
    }
})
//
//
app.post('/fermeh/ajax/request-locate-tinh', CatchAsync(async (req, res) => {
    let pool = await conn
    let sqlString = `exec exe_requestTinh`
    await pool.request().query(sqlString, (err, data) => {
        if (data.recordset.length > 0) {
            res.send({ tinh: data.recordset })
        }
    })
}))
//
//
app.post('/fermeh/ajax/request-locate-huyen', CatchAsync(async (req, res) => {
    let matinh = req.body.matinh
    let pool = await conn
    let sqlString = `exec exe_requestHuyen '${matinh}'`
    await pool.request().query(sqlString, (err, data) => {
        if (data.recordset.length > 0) {
            res.send({ huyen: data.recordset })
        }
    })

}))
//
//
app.post('/fermeh/ajax/request-locate-xa', CatchAsync(async (req, res) => {
    let mahuyen = req.body.mahuyen
    let pool = await conn
    let sqlString = `exec exe_requestXa '${mahuyen}'`
    await pool.request().query(sqlString, (err, data) => {
        if (data.recordset.length > 0) {
            res.send({ xa: data.recordset })
        }
    })

}))
app.post('/fermeh/ajax/validate-new-form-locate', CatchAsync(async (req, res) => {
    let pool = await conn;
    let sqlChkLocate = `exec exe_chkLocate '${req.cookies.sdt}'`
    let sqlUpdateDefault = `update DIACHI set MACDINH=0 where MACDINH=1 and MAKH=(select MAKH from KHACHHANG where SDT='${sdt}')`
    let name = req.body.name
    let phone = req.body.phone
    let locate = req.body.locate
    let tinh = req.body.tinh
    let huyen = req.body.huyen
    let xa = req.body.xa
    let chkbox = req.body.chkbox
    let radioHome = req.body.radioHome
    let radioOffice = req.body.radioOffice
    let kind; let defaultlc;
    if (req.body.add === 'true') console.log('add time')
    if (req.body.edit === 'true') console.log('edit time')
    if (radioHome === 'true') {
        kind = 'home'
    }
    else if (radioOffice === 'true') {
        kind = 'office'
    }
    if (chkbox === 'true') defaultlc = 1
    else defaultlc = 0
    let sqlAddLocate = `exec exe_addNewLocate '${req.cookies.sdt}',N'${locate}','${kind}','${xa}',${defaultlc},'${phone}',N'${name}'`
    var regexName = /^[a-zA-Z ]{2,30}$/g;
    var regexPhone = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (name === '' || name === null || name === undefined) {
        res.send({ name: false, phone: phone, locate: locate, tinh: tinh, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
        return
    }
    else {
        name = name.toLowerCase();
        name = name.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        name = name.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        name = name.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        name = name.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        name = name.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        name = name.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        name = name.replace(/đ/g, "d");
        if (regexName.test(name)) {
            if (phone === '' || phone === null || phone === undefined) {
                res.send({ name: true, phone: false, locate: locate, tinh: tinh, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
                return
            }
            else {
                if (regexPhone.test(phone)) {
                    if (locate === '' || locate === null || locate === undefined) {
                        res.send({ name: true, phone: true, locate: false, tinh: tinh, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
                        return
                    } else {
                        if (tinh === '' || tinh === null || tinh === undefined || tinh === 'tinh') {
                            res.send({ name: true, phone: true, locate: true, tinh: false, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
                            return
                        } else {
                            if (huyen === '' || huyen === null || huyen === undefined || huyen === 'huyen') {
                                res.send({ name: true, phone: true, locate: true, tinh: true, huyen: false, xa: xa, chkbox: chkbox, radio: false })
                                return
                            } else {
                                if (xa === '' || xa === null || xa === undefined || xa === 'xa') {
                                    res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: false, chkbox: chkbox, radio: false })
                                    return
                                } else {
                                    if (radioHome === 'false' && radioOffice === 'false') {
                                        console.log('radio saiiii')
                                        res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: true, chkbox: chkbox, radio: false })
                                        return
                                    }
                                    else {
                                        if (req.body.add === 'true') {
                                            if (chkbox === 'true') {
                                                pool.request().query(sqlChkLocate, (err, data) => {
                                                    if (data.recordset.length > 0) {
                                                        pool.request().query(sqlUpdateDefault, async (err, data) => {
                                                            await pool.request().query(sqlAddLocate, (err, data) => {
                                                                console.log('add')
                                                                return
                                                            })
                                                        })
                                                        res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: true, chkbox: chkbox, radio: true })
                                                        return
                                                    }
                                                    else {
                                                        pool.request().query(sqlAddLocate, (err, data) => {
                                                            return
                                                        })
                                                        res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: true, chkbox: chkbox, radio: true })
                                                        return
                                                    }
                                                })
                                            }
                                            else {
                                                pool.request().query(sqlAddLocate, (err, data) => {
                                                    return
                                                })
                                                res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: true, chkbox: chkbox, radio: true })
                                                return
                                            }
                                        }
                                        else if (req.body.edit === 'true') {
                                            console.log('edit')
                                            let IDDC = req.body.IDDC
                                            let sqlEditLocate = `exec exe_editNewLocate '${req.cookies.sdt}',N'${locate}','${kind}','${xa}',${defaultlc},'${phone}',N'${name}',${parseInt(IDDC)}`
                                            pool.request().query(sqlEditLocate, (err, data) => {
                                                res.send({ name: true, phone: true, locate: true, tinh: true, huyen: true, xa: true, chkbox: chkbox, radio: true })
                                                return
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    res.send({ name: true, phone: false, locate: locate, tinh: tinh, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
                    return
                }
            }
        } else {
            res.send({ name: false, phone: phone, locate: locate, tinh: tinh, huyen: huyen, xa: xa, chkbox: chkbox, radio: false })
            return
        }
    }
}))
//
//
app.post('/fermeh/ajax/request-delete-locate', CatchAsync(async (req, res) => {
    let iddc = parseInt(req.body.iddc)
    let pool = await conn
    let sqlString = `exec exe_deleteLocate '${req.cookies.sdt}',${iddc}`
    await pool.request().query(sqlString, (err, data) => {

    })
}))
//
//
app.post('/fermeh/ajax/set-default-locate-btn', CatchAsync(async (req, res) => {
    let pool = await conn
    let ID = parseInt(req.body.IDDC)
    let sql = `exec exe_updateDefaultLocate '${req.cookies.sdt}',${ID}`
    pool.request().query(sql, (err, data) => {
        res.send({ error: true })
    })
}))
//
//
app.post('/fermeh/ajax/setting/change-username', CatchAsync(async (req, res) => {
    let text = req.body.name.trim()
    let name = text.toLowerCase()
    let regexName = /^[a-zA-Z ]{2,30}$/g;
    name = name.toLowerCase();
    name = name.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    name = name.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    name = name.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    name = name.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    name = name.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    name = name.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    name = name.replace(/đ/g, "d");
    if (regexName.test(name)) {
        let sql = `exec exe_updateTenKH '${req.cookies.sdt}',N'${text}'`
        let pool = await conn
        pool.request().query(sql, (err, data) => {
            taikhoan = text
            res.cookie('taikhoan', text)
            res.send({ error: true })
        })
    }
    else {
        res.send({ error: false })
    }
    console.log(text)
}))
// thay doi so dien thoai
app.post('/fermeh/ajax/setting/change-phonenumber', CatchAsync(async (req, res) => {
    var phone = req.body.phone
    var regexSDT = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (regexSDT.test(phone)) {
        let pool = await conn
        let sql = `exec exe_checkSDT '${phone.trim()}'`
        pool.request().query(sql, (err, data) => {
            if (data.recordset.length === 0) {
                let nsql = `exec exe_updateSDTKH @sdt='${req.cookies.sdt}',@nsdt='${phone.trim()}'`
                pool.request().query(nsql, (err, data) => {
                    sdt = phone
                    res.cookie('sdt', phone)
                    res.send({ error: true })
                })
            }
            else {
                res.send({ error: false })
            }
        })
    }
    else {
        res.send({ error: false })
    }
}))
// thay doi so dien thoai

//thay doi email
app.post('/fermeh/ajax/setting/change-email', CatchAsync(async (req, res) => {
    let regexMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let mail = req.body.email
    if (regexMail.test(mail)) {
        let sql = `exec exe_updateMailKH '${req.cookies.sdt}','${mail}'`
        let sqlMail = `select EMAIL from KHACHHANG where EMAIL='${mail}'`
        let pool = await conn
        await pool.request().query(sqlMail, async (err, data) => {
            if (data.recordset.length > 0) {
                res.send({ error: false })
            } else {
                pool.request().query(sql, (err, data) => {
                    res.send({ error: true, email: mail })
                })
            }
        })
    } else {
        res.send({ error: false })
    }
}))
//thay doi email

//thay doi mat khau
app.post('/fermeh/ajax/setting/change-password', CatchAsync(async (req, res) => {
    let cpass = req.body.currentpass
    let npass = req.body.newpass
    let regex_password = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (regex_password.test(cpass) && regex_password.test(npass)) {
        let cipherPass;
        let newPass;
        await axios({
            method: 'GET',
            url: 'https://api.hashify.net/hash/md5/hex?value=' + cpass,
            data: null
        }).then((res) => { cipherPass = res.data.Digest })
            .catch((err) => { console.log("errrrr", err) })
        // api mk moi
        await axios({
            method: 'GET',
            url: 'https://api.hashify.net/hash/md5/hex?value=' + npass,
            data: null
        }).then((res) => { newPass = res.data.Digest })
            .catch((err) => { console.log("errrrr", err) })
        let pool = await conn
        let sqlChk = `exec exe_findKH '${req.cookies.sdt}','${cipherPass}'`
        pool.request().query(sqlChk, async (err, data) => {
            if (data.recordset.length > 0) {
                let nsql = `exec exe_updatePassKH '${req.cookies.sdt}','${newPass}'`
                pool.request().query(nsql, (err, data) => {
                    res.send({ error: true })
                })
            }
            else {
                res.send({ error: false })
            }
        })
    }
    else {
        res.send({ error: false })
    }
}))
//----------------------------------BUY NOW #MUANGAY MUA NGAY----------------------------
app.post('/fermeh/buy-now/:id', async (req, res) => {
    let id = req.params.id
    let size = req.body.size
    let quantity = req.body.quantity
    let sql = `insert into  GIOHANG values((select MAKH from KHACHHANG where SDT='${req.cookies.sdt}'),${id}, ${size}, ${quantity})`
    let pool = await conn
    pool.request().query(sql, (err, data) => { })
    setInterval(() => { }, 50)
    res.redirect(`/fermeh/payment?chk_${id}_${size}=on`)
})
//----------------------------------BUY NOW #MUANGAY MUA NGAY----------------------------
//-----------------------------------AJAX-------------------------------
app.use(adminRoutes)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})
app.use((err, req, res, next) => {
    const { message = 'wrong number', status = 500 } = err;
    res.status(status).render('error/error', { message })
})

app.listen(3000, () => {
    console.log("THIS IS PORT 3000")
})