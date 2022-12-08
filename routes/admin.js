const express = require('express')
const route = express.Router()
const CatchAsync = require('../model/error/CatchAsync')
const { conn, sql } = require('../model/sqlServerStaff')
const { connn, sqll } = require('../model/sqlServerAdmin')
const axios = require('axios');
const { response } = require('express');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer')
route.use(cookieParser())
//thư viện hỗ trợ upload ảnh
const path = require('path');
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "Public/img/staff_inf")
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const storageProduct = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "Public/img/product")
    },
    filename: (req, file, cb) => {
        // console.log(file)
        // const uniqueSuffix = Date.now() + '' + Math.round(Math.random() * 1E9)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
//------------------------------------------------------------------------------------------------------------------------
//
var https = require('https');
const ACCESS_TOKEN = "qrHMGLbV9mXaS5ud5DEODrpc1rMsk11P";

const sendSMS = function (phones, content, type, sender) {
    var url = 'api.speedsms.vn';
    var params = JSON.stringify({
        to: phones,
        content: content,
        sms_type: type,
        sender: sender
    });

    var buf = Buffer.from(ACCESS_TOKEN + ':x');
    var auth = "Basic " + buf.toString('base64');
    const options = {
        hostname: url,
        port: 443,
        path: '/index.php/sms/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
        }
    };

    const req = https.request(options, function (res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function (d) {
            body += d;
        });
        res.on('end', function () {
            var json = JSON.parse(body);
            if (json.status == 'success') {
                console.log("send sms success")
            }
            else {
                console.log("send sms failed " + body);
            }
        });
    });

    req.on('error', function (e) {
        console.log("send sms failed: " + e);
    });

    req.write(params);
    req.end();
}
route.get('/test-send-sms', CatchAsync(async (req, res) => {
    await sendSMS(['0334397556'], "Thử gửi 1 cái sms nè", 2, '');
    res.send('xx')
}))
//
//------------------------------------------------------------------------------------------------------------------------
const upload = multer({ storage: storage })
const uploadProduct = multer({ storage: storageProduct })
//thư viện hỗ trợ upload ảnh
var tknv = 'NV01'
//hiện role đang sửa thành 2 cho dễ render các page
var role = 2
var tentk = ''
//mặc định band đầu là 0

route.get('/fermeh/admin-site', async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        let sqlDH = `select DONHANG = (select count(*) from HOADON where HUY=0),TONG=(select sum(TONGTIEN) 
        from HOADON where HUY=0),KH=(select count(*) from KHACHHANG),TONGTODAY =   
        (select sum(TONGTIEN) from HOADON where NGAYLAP=FORMAT (getdate(), 'yyyy-MM-dd') and  HUY=0),TONGSOSP=(select COUNT(*) from LOAISANPHAM)        `
        let sqlTOPDM = `select CTLOAI,SL=count(*) from LOAISANPHAM group by CTLOAI order by CTLOAI desc`
        let sqlHDMOI = `select top 7 MAKH,MAHD,NGAYLAP,TONGTIEN,TEN,TENKH=
        (select TENKH from KHACHHANG where KHACHHANG.MAKH=HOADON.MAKH),
        SOSP=(select count(*) from CTHD where CTHD.MAHD=HOADON.MAHD) from HOADON where HUY=0 order by NGAYLAP desc`
        let sqlTOPSELLER = `exec admin_topseller`
        await pool.request().query(sqlDH, async (err, data) => {
            var topdh = data.recordset
            await pool.request().query(sqlHDMOI, async (err, data) => {
                var hdmoi = data.recordset
                await pool.request().query(sqlTOPDM, async (err, data) => {
                    var topdm = data.recordset
                    await pool.request().query(sqlTOPSELLER, async (err, data) => {
                        var topsell = data.recordset
                        res.render('admin/index', { title: "Trang chủ", topsell: topsell, topdm: topdm, topdh: topdh, hdmoi: hdmoi, tentk: req.cookies.tentk, role: req.cookies.role })
                    })
                })
            })
        })
    }
})

//xu lý đăng nhập, đăng xuất
route.get('/fermeh/admin/login', async (req, res) => {
    console.log(req.cookies.role)
    if (typeof (req.cookies.role) === 'undefined' || typeof (req.cookies.tknv) === 'undefined' || typeof (req.cookies.tentk) === 'undefined') {
        res.cookie('role', '')
        res.cookie('tknv', '')
        res.cookie('tentk', '')
    }
    res.render('admin/login', { title: "Đăng nhập" })
})

route.post('/fermeh/admin/login', CatchAsync(async (req, res) => {
    var username = req.body.username
    var password = req.body.password
    username = username.toLowerCase();
    let pool = await conn
    let cipherPass = ''
    await axios({
        method: 'GET',
        url: 'https://api.hashify.net/hash/md5/hex?value=' + password,
        data: null
    }).then((res) => { cipherPass = res.data.Digest })
        .catch((err) => { console.log("errrrr", err) })
    let sql = `exec exe_chkAdminAccount '${username}'`
    await pool.request().query(sql, async (err, data) => {
        if (data.recordset.length === 0) {
            res.send({ error: "Tài khoản hoặc mật khẩu không chính xác!", done: false })
        } else {
            if (data.recordset[0].MATKHAU == cipherPass) {
                role = parseInt(data.recordset[0].MAROLE);
                tknv = data.recordset[0].MANV
                tentk = data.recordset[0].TEN
                await res.cookie('role', parseInt(data.recordset[0].MAROLE))
                await res.cookie('tknv', data.recordset[0].MANV)
                await res.cookie('tentk', data.recordset[0].TEN)
                res.send({ done: true })
            } else {
                res.send({ error: "Tài khoản hoặc mật khẩu không chính xác!", done: false })
            }
        }
    })
}))
route.get('/fermeh/admin/log-out', async (req, res) => {
    role = 0;
    tknv = ''
    tentk = ''
    res.cookie('role', '')
    res.cookie('tknv', '')
    res.cookie('tentk', '')
    res.redirect('http://localhost:3000/fermeh/admin/login')
})
//xu lý đăng nhập, đăng xuất
//---------------------------XỬ LÝ THÊM NHÂN VIÊN, XEM DANH SÁCH NHÂN VIÊN
route.get('/fermeh/admin/add-new-staff', async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        res.render('admin/add_new_staff', { title: "Thêm nhân viên mới", infor: {}, tentk: req.cookies.tentk, role: req.cookies.role })
    }
})

route.post('/fermeh/admin/add-new-staff', upload.single('staffimg'), CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        console.log(req.file.filename)
        let pool = await conn
        console.log('req body la day', req.body)
        let sql = `exec admin_createTKNV '${req.body.staffcode}',N'${req.body.staffname}','${req.body.staffdate}','${req.body.staffphone}'
	,'${req.body.staffcmnd}','${req.file.filename}','${req.body.staffemail}','${req.body.staffgender}','${req.body.staffusername}'
    ,${parseInt(req.body.staffposition)},N'${req.body.stafflc}'`
        let sqlEmail = `select EMAIL from NHANVIEN where EMAIL='${req.body.staffemail}'`
        await pool.request().query(`select MANV from NHANVIEN where MANV='${req.body.staffcode}'`, async (err, data) => {
            if (data.recordset.length == 0) {
                await pool.request().query(`select SDT from NHANVIEN where SDT='${req.body.staffphone}'`, async (err, data) => {
                    if (data.recordset.length == 0) {
                        await pool.request().query(`select TENTK from TAIKHOAN_NV where TENTK='${req.body.staffusername}'`, async (err, data) => {
                            if (data.recordset.length == 0) {
                                await pool.request().query(`select CMND from NHANVIEN where CMND='${req.body.staffcmnd}'`, async (err, data) => {
                                    if (data.recordset.length == 0) {
                                        await pool.request().query(sqlEmail, async (err, data) => {
                                            if (data.recordset.length > 0) {
                                                res.render('admin/add_new_staff', { title: 'Thêm nhân viên mới', error: 'Email da ton tai', infor: req.body, tentk: req.cookies.tentk, role: req.cookies.role })
                                            } else {
                                                await pool.request().query(sql, async (err, data) => {
                                                    res.redirect('http://localhost:3000/fermeh/admin/list-staff')
                                                })
                                            }
                                        })
                                    } else {
                                        res.render('admin/add_new_staff', { title: 'Thêm nhân viên mới', error: 'Số CMND/CCCD đã tồn tại', infor: req.body, tentk: req.cookies.tentk, role: req.cookies.role })
                                    }
                                })

                            } else {
                                res.render('admin/add_new_staff', { title: 'Thêm nhân viên mới', error: 'Tên tài khoản đã tồn tại', infor: req.body, tentk: req.cookies.tentk, role: req.cookies.role })
                            }
                        })
                    } else {
                        res.render('admin/add_new_staff', { title: 'Thêm nhân viên mới', error: 'Số điện thoại đã tồn tại', infor: req.body, tentk: req.cookies.tentk, role: req.cookies.role })
                    }
                })
            } else {
                res.render('admin/add_new_staff', { title: 'Thêm nhân viên mới', error: 'Mã nhân viên đã tồn tại', infor: req.body, tentk: req.cookies.tentk, role: req.cookies.role })
            }
        })
    }
}))
//---------------------------XỬ LÝ THÊM NHÂN VIÊN, XEM DANH SÁCH NHÂN VIÊN
//---------------------------DANH SÁCH NHÂN VIÊN
route.get('/fermeh/admin/list-staff', async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else if (req.cookies.role == '3') {
        let pool = await conn
        let sql = 'select * from NHANVIEN where NGHIVIEC=0'
        await pool.request().query(sql, async (err, data) => {
            //console.log(data.recordset)
            res.render('admin/list_staff', { title: "Danh sách nhân viên", staff: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role, manv: req.cookies.tknv })
        })
    }
    else {
        res.redirect('http://localhost:3000/fermeh/admin-site')
    }
})

route.post('/fermeh/admin/delete-staff', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else if (req.cookies.role == '3') {
        var config = {
            server: "localhost",
            user: "MANAGER",
            password: '123',
            database: 'QLWEBBH',
            driver: 'msnodesqlv8'
        }

        const connn = new sql.ConnectionPool(config).connect().then(pool => {
            return pool
        });
        let pool = await connn
        console.log(req.body.manv)
        await pool.request().query(`update NHANVIEN set NGHIVIEC=1 where MANV='${req.body.manv}'
         update TAIKHOAN_NV set XOATAIKHOAN=1 where MANV='${req.body.manv}'`, async (err, data) => {
            console.log('thanh cong ajax')
            res.send({ done: true })
        })
            ; (await connn).close
    }
    else {
        res.redirect('http://localhost:3000/fermeh/admin-site')
    }
}))
route.post('/fermeh/admin/list-product/edit-staff', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else if (req.cookies.role == '3') {
        var config = {
            server: "localhost",
            user: "MANAGER",
            password: '123',
            database: 'QLWEBBH',
            driver: 'msnodesqlv8'
        }

        const connn = new sql.ConnectionPool(config).connect().then(pool => {
            return pool
        });
        let pool = await connn
        await pool.request().query(`select * from ROLETAIKHOAN where MAROLE<>1`, async (err, data) => {
            let role = data.recordset
            await pool.request().query(`select NHANVIEN.*,ROLETK=(select TAIKHOAN_NV.MAROLE from TAIKHOAN_NV where MANV='${req.body.input_edit_staff_code}'),
            TENROLE=(select TENROLE from ROLETAIKHOAN where MAROLE=((select TAIKHOAN_NV.MAROLE from
            TAIKHOAN_NV where MANV='${req.body.input_edit_staff_code}'))) from NHANVIEN where MANV='${req.body.input_edit_staff_code}' `, async (err, data) => {
                // console.log(data.recordset)
                var k = data.recordset
                if (k[0].NGAYSINH.getDate() < 10 && k[0].NGAYSINH.getMonth() + 1 < 10) {
                    k[0].NGAYSINH = k[0].NGAYSINH.getFullYear() + '-0' + (k[0].NGAYSINH.getMonth() + 1) + '-0' + k[0].NGAYSINH.getDate()
                } else if (k[0].NGAYSINH.getMonth() + 1 < 10) {
                    k[0].NGAYSINH = k[0].NGAYSINH.getFullYear() + '-0' + (k[0].NGAYSINH.getMonth() + 1) + '-' + k[0].NGAYSINH.getDate()
                } else if (k[0].NGAYSINH.getDate() < 10) {
                    k[0].NGAYSINH = k[0].NGAYSINH.getFullYear() + '-' + k[0].NGAYSINH.getMonth() + '-0' + k[0].NGAYSINH.getDate()
                } else {
                    k[0].NGAYSINH = k[0].NGAYSINH.getFullYear() + '-' + (k[0].NGAYSINH.getMonth() + 1) + '-' + k[0].NGAYSINH.getDate()
                }
                res.render('admin/edit_infor_staff', { title: "Chỉnh sửa thông tin nhân viên", staff: k, role: role, tentk: req.cookies.tentk, role: req.cookies.role })
            })
        })
            ; (await connn).close
    }
    else {
        res.redirect('http://localhost:3000/fermeh/admin-site')
    }
}))
route.post('/fermeh/admin/edit-infor-staff', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    } else if (req.cookies.role == '3') {
        if (typeof (req.body.staffstopwork) != 'undefined') req.body.staffstopwork = 1
        else req.body.staffstopwork = 0
        var rq = req.body
        let pool = await connn
        await pool.request().query(`exec admin_editStaff '${rq.staffcode.trim()}',N'${rq.staffname}','${rq.staffdate}','${rq.staffgender}',N'${rq.staffemail}',
        ${parseInt(rq.staffposition)},'${rq.staffphone}','${rq.staffcmnd}','${rq.staffimg}',${parseInt(rq.staffstopwork)}`
            , async (err, data) => {
                console.log('update thanh cong')
            })
        if (rq.staffstopwork == 1) {
            await pool.request().query(`update TAIKHOAN_NV set XOATAIKHOAN=1 where MANV='${rq.staffcode.trim()}'`, async (err, data) => {

            })
        }
        // console.log(req.body)
        res.redirect('http://localhost:3000/fermeh/admin/list-staff')
    } else {
        res.redirect('http://localhost:3000/fermeh/admin-site')
    }
}))
//---------------------------DANH SÁCH NHÂN VIÊN
//---------------------------MODULE SẢN PHẨM
route.get('/fermeh/admin/list-product', async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        pool.request().query(`select LOAISANPHAM.*,TENHANG=(SELECT TENHANG FROM HANGSX WHERE HANGSX.MAHANG=LOAISANPHAM.HANGSX),
        IDHA=(select top 1 LINK from HINHANH where HINHANH.MASP=LOAISANPHAM.MASP)
        from LOAISANPHAM where STILLSALE=1`, async (err, data) => {
            if (data.recordset.length > 0) {
                res.render('admin/list_product', { title: "Danh sách sản phẩm", product: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
            }
            else {
                res.render('admin/list_product', { title: "Danh sách sản phẩm", product: [], tentk: req.cookies.tentk, role: req.cookies.role })
            }
        })
    }
})
//
route.post('/fermeh/admin/list-product/edit-product', async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`select * from LOAISANPHAM where MASP=${req.body.edit_infor_masp}`, async (err, data) => {
            var k = data.recordset
            if (k[0].NGAYRAMAT.getDate() < 10 && k[0].NGAYRAMAT.getMonth() + 1 < 10) {
                k[0].NGAYRAMAT = k[0].NGAYRAMAT.getFullYear() + '-0' + (k[0].NGAYRAMAT.getMonth() + 1) + '-0' + k[0].NGAYRAMAT.getDate()
            } else if (k[0].NGAYRAMAT.getMonth() + 1 < 10) {
                k[0].NGAYRAMAT = k[0].NGAYRAMAT.getFullYear() + '-0' + (k[0].NGAYRAMAT.getMonth() + 1) + '-' + k[0].NGAYRAMAT.getDate()
            } else if (k[0].NGAYRAMAT.getDate() < 10) {
                k[0].NGAYRAMAT = k[0].NGAYRAMAT.getFullYear() + '-' + k[0].NGAYRAMAT.getMonth() + '-0' + k[0].NGAYRAMAT.getDate()
            } else {
                k[0].NGAYRAMAT = k[0].NGAYRAMAT.getFullYear() + '-' + (k[0].NGAYRAMAT.getMonth() + 1) + '-' + k[0].NGAYRAMAT.getDate()
            }
            // console.log(k)
            await pool.request().query(`select * from HANGSX`, async (err, data) => {
                res.render('admin/edit_infor_product', { title: "Chỉnh sửa thông tin sản phẩm", product: k, brand: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
            })
        })
    }
})

route.post('/fermeh/admin/list-product/del-product', async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`UPDATE LOAISANPHAM set STILLSALE=0 where MASP=${parseInt(req.body.masp)}`, async (err, data) => { })
    }
})
//lọc theo loại
route.post('/fermeh/admin/list-product/filter', CatchAsync(async (req, res) => {
    var sql
    if (req.body.type == 'danhmuc') {
        sql = `select LOAISANPHAM.*, IDHA = (select top 1 LINK FROM HINHANH where HINHANH.MASP = LOAISANPHAM.MASP),
        TENHANG = (select TENHANG from HANGSX where HANGSX.MAHANG = LOAISANPHAM.HANGSX),
        SOLUONG=(SELECT COUNT(*) FROM SANPHAM WHERE SANPHAM.MASP=LOAISANPHAM.MASP AND SANPHAM.SOLD=0)
         from LOAISANPHAM where DANHMUC='${req.body.data.toUpperCase()}'`
    }
    else if (req.body.type == 'ctloai') {
        sql = `select LOAISANPHAM.*, IDHA = (select top 1 LINK FROM HINHANH where HINHANH.MASP = LOAISANPHAM.MASP),
        TENHANG = (select TENHANG from HANGSX where HANGSX.MAHANG = LOAISANPHAM.HANGSX),
        SOLUONG=(SELECT COUNT(*) FROM SANPHAM WHERE SANPHAM.MASP=LOAISANPHAM.MASP AND SANPHAM.SOLD=0)
         from LOAISANPHAM where CTLOAI='${req.body.data.toUpperCase()}'`
    }
    else if (req.body.data == 'new') {
        sql = `select top 20 LOAISANPHAM.*, IDHA = (select top 1 LINK FROM HINHANH where HINHANH.MASP = LOAISANPHAM.MASP),
        TENHANG = (select TENHANG from HANGSX where HANGSX.MAHANG = LOAISANPHAM.HANGSX),
        SOLUONG=(SELECT COUNT(*) FROM SANPHAM WHERE SANPHAM.MASP=LOAISANPHAM.MASP AND SANPHAM.SOLD=0)
        from LOAISANPHAM order by MASP desc`
    }
    else if (req.body.data == 'allCate') {
        sql = `select LOAISANPHAM.*, IDHA = (select top 1 LINK FROM HINHANH where HINHANH.MASP = LOAISANPHAM.MASP),
        TENHANG = (select TENHANG from HANGSX where HANGSX.MAHANG = LOAISANPHAM.HANGSX),
        SOLUONG=(SELECT COUNT(*) FROM SANPHAM WHERE SANPHAM.MASP=LOAISANPHAM.MASP AND SANPHAM.SOLD=0)
        from LOAISANPHAM`
    }
    let pool = await conn
    await pool.request().query(sql, async (err, data) => {
        res.send({ done: true, data: data.recordset })
    })

}))
route.post('/fermeh/admin/list-product/filter/status', CatchAsync(async (req, res) => {
    console.log(req.body)
    var sql
    if (req.body.data == 'stillSale') {
        sql = `select  LOAISANPHAM.*, IDHA = (select top 1 LINK FROM HINHANH where HINHANH.MASP = LOAISANPHAM.MASP),
        TENHANG = (select TENHANG from HANGSX where HANGSX.MAHANG = LOAISANPHAM.HANGSX)
        from LOAISANPHAM where STILLSALE=1`
    }
    else if (req.body.data == 'stopSale') {
        sql = `select LOAISANPHAM.*, IDHA = (select top 1 LINK FROM HINHANH where HINHANH.MASP = LOAISANPHAM.MASP),
        TENHANG = (select TENHANG from HANGSX where HANGSX.MAHANG = LOAISANPHAM.HANGSX)
        from LOAISANPHAM where STILLSALE=0`
    }
    else {
        res.send({ done: false })
        return
    }
    let pool = await conn
    await pool.request().query(sql, async (err, data) => {
        res.send({ done: true, data: data.recordset })
    })

}))
//lọc các sp còn bán hay k

//
//
//
route.post('/fermeh/admin/edit-product', async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        var d = req.body
        if (typeof (d.productchecksold) != 'undefined') d.productchecksold = 1
        else d.productchecksold = 0
        let pool = await conn
        let sql = `exec admin_editProduct '${parseInt(d.productcode)}', '${d.productname}','${d.productloai}','${parseInt(d.producthangsx)}'
        ,'${d.productdanhmuc}','${d.productdate}',${parseInt(d.productminsize)},${parseInt(d.productmaxsize)},'${d.productctloai}',${parseInt(d.productchecksold)}`
        await pool.request().query(sql, async (err, data) => {
            res.redirect('http://localhost:3000/fermeh/admin/list-product')
        })
    }
})
//
route.get('/fermeh/admin/add-new-product', async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`select * from HANGSX`, async (err, data) => {
            if (data.recordset.length > 0) {
                res.render('admin/add_new_product', { title: "Thêm sản phẩm mới", brand: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
            } else {
                res.render('admin/add_new_product', { title: "Thêm sản phẩm mới", brand: [], tentk: req.cookies.tentk, role: req.cookies.role })
            }
        })
    }
})
route.post('/fermeh/admin/add-new-product', uploadProduct.fields([{ name: 'productimg1', maxCount: 1 }, { name: 'productimg2', maxCount: 1 },
{ name: 'productimg3', maxCount: 1 }, { name: 'productimg4', maxCount: 1 }]), async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        console.log('body', req.body)
        // console.log('file', req.files)
        console.log(req.files.productimg1[0].filename)
        console.log(req.files.productimg2[0].filename)
        console.log(req.files.productimg3[0].filename)
        console.log(req.files.productimg4[0].filename)
        let pool = await conn
        await pool.request().query(`exec admin_createNewProduct '${req.body.productname}','${req.body.productloai}','${req.body.productctloai}',
        ${parseInt(req.body.producthangsx)},${parseInt(req.body.productprice)},'${req.body.productdanhmuc}'
        ,'${req.body.productdate}',${parseInt(req.body.productminsize)},${parseInt(req.body.productmaxsize)},'${req.files.productimg1[0].filename}'
        ,'${req.files.productimg2[0].filename}','${req.files.productimg3[0].filename}','${req.files.productimg4[0].filename}'`, async (err, data) => {
            await console.log('insert thanh cong')
        })
        await res.redirect('http://localhost:3000/fermeh/admin/list-product')
    }
})
//--------------------------KHO
route.get('/fermeh/admin/product-category', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query('exec admin_renderKho', async (err, data) => {
            if (data.recordset.length > 0) {
                res.render('admin/product_category', { title: "Kho sản phẩm", product: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
            } else {
                res.render('admin/product_category', { title: "Kho sản phẩm", product: [], tentk: req.cookies.tentk, role: req.cookies.role })
            }
        })
    }
}))

route.post('/fermeh/admin/product-category/detail', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        console.log(req.body)
        var masp = parseInt(req.body.masp)
        let pool = await conn
        await pool.request().query(`select MASP,SIZE,SL=count(*) from SANPHAM where MASP=${masp} and SOLD=0 group by MASP,SIZE order by SIZE`, async (err, data) => {
            console.log(data.recordset)
            res.send({ sp: data.recordset })
        })
    }
}))
// nhap san pham vao kho
route.get('/fermeh/admin/import-product', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        res.render('admin/import_product', { title: "Nhập kho", tentk: req.cookies.tentk, pro: [], kho: [], role: req.cookies.role })
    }
}))
route.post('/fermeh/admin/import-product', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        var masp = parseInt(req.body.productcode)
        let pool = await conn
        await pool.request().query(`select LOAISANPHAM.*,IDHA=(SELECT TOP 1 LINK FROM HINHANH 
            where HINHANH.MASP=LOAISANPHAM.MASP) from LOAISANPHAM where MASP=${masp}`, async (err, data) => {
            var pro = data.recordset
            await pool.request().query(`select MASP,SIZE,SL=count(*) from SANPHAM where MASP=${masp} and SOLD=0 group by MASP,SIZE order by SIZE`, async (err, data) => {
                res.render('admin/import_product', { title: "Nhập kho", tentk: req.cookies.tentk, pro: pro, kho: data.recordset, role: req.cookies.role })
            })
        })
    }
}))
route.post('/fermeh/admin/import-product/add', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        var code = parseInt(req.body.productcode)
        var size = parseInt(req.body.productsize)
        var num = parseInt(req.body.productnumber)
        let pool = await conn
        for (let i = 0; i < num; i++) {
            await pool.request().query(`insert into SANPHAM(MASP,SOLD,SIZE) values(${code},1,${size})`, async (err, data) => {
            })
        }
        res.redirect('http://localhost:3000/fermeh/admin/import-product')
    }
}))
//thay doi gia san pham
route.get('/fermeh/admin/change-product-price', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        if (Object.keys(req.query).length != 0 && role != 0) {
            let pool = await conn
            await pool.request().query(`select LOAISANPHAM.*,IDHA=(SELECT top 1 LINK from HINHANH where LOAISANPHAM.MASP=HINHANH.MASP
            ) from LOAISANPHAM where MASP='${req.query.price_masp}'`, async (err, data) => {
                var pro = data.recordset
                await pool.request().query(`select * from THAYDOIGIA where MASP=${req.query.price_masp}`, async (err, data) => {
                    res.render('admin/change_product_price', { title: "Thay đổi giá sản phẩm", pro: pro, price: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
                })

            })
        } else if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
            || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
            res.redirect('http://localhost:3000/fermeh/admin/login')
        } else {
            res.redirect('http://localhost:3000/fermeh/admin-site')
        }
    }
}))
route.post('/fermeh/admin/change-product-price/change', async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        console.log(req.body)
        let gia = req.body.gia
        let masp = req.body.masp
        let ghichu = req.body.ghichu
        let pool = await conn
        await pool.request().query(`select * from THAYDOIGIA where MASP=${parseInt(masp)} and NGAYTHAYDOI=FORMAT(GETDATE(),'yyyy-MM-dd')`, async (err, data) => {
            if (data.recordset.length > 0) {
                await pool.request().query(`update THAYDOIGIA set MANV='${tknv}',GIAMOI=${parseInt(gia)},GHICHU = N'${ghichu}'
                    where MASP=${parseInt(masp)} and NGAYTHAYDOI=FORMAT(GETDATE(),'yyyy-MM-dd')`, async (err, data) => {
                })
            }
            else {
                await pool.request().query(`insert into THAYDOIGIA values('${tknv}',${parseInt(masp)} 
                    ,GETDATE(),${parseInt(gia)},'${ghichu}')`, async (err, data) => {
                })
            }
            await pool.request().query(`update LOAISANPHAM set 
                GIA=${parseInt(gia)} where MASP = ${parseInt(masp)}`, async (err, data) => {
                res.send({ done: true })
            })
        })
    }
})

//--------------------------KHO
//---------------------------MODULE SẢN PHẨM






//----------------------------MODULE HÓA ĐƠN
route.get('/fermeh/admin/orders', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`select MAHD, MADH = DONHANG.ID, MAKH, MANV, TINHTRANG,NGAYLAP,TONGTIEN,TEN,PHUONGTHUC,TENKH=(select TENKH 
            from KHACHHANG where KHACHHANG.MAKH=HOADON.MAKH)
from HOADON, DONHANG, TINHTRANGDONHANG 
where HOADON.IDDH = DONHANG.ID AND DONHANG.IDTINHTRANG = TINHTRANGDONHANG.ID`, async (err, data) => {
            //  console.log(data.recordset)
            res.render('admin/orders', { title: "Đơn hàng", bill: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
        })
    }
}))
// route.get('/fermeh/admin/find_order',  CatchAsync(async (req, res) => {
//     var mahd = parseInt(req.query.mahd)
//     console.log(req.query)
//     if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
//     || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
//     res.redirect('http://localhost:3000/fermeh/admin/login')
// }
// else {
//     let pool = await conn
//     sql=`exec find_order @madh = ${mahd}`
//     await pool.request().query(sql, async (err, data) => {
//         // console.log(data.recordset)
//         res.render('admin/orders', { title: "Đơn hàng", bill: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
//     })
// }
// }))
route.post('/fermeh/admin/list-customer', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`select * from KHACHHANG where MAKH=${parseInt(req.body.customerid)}`, async (err, data) => {
            res.render('admin/list_user', { title: "Danh sách khách hàng", customer: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
        })
    }
}))



route.post('/fermeh/admin/accept-order', CatchAsync(async (req, res) => {


    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
       
        console.log("body",req.body)
       
        mahd = req.body.mahd
        
        mahd =  mahd.substring(1); 
        // console.log("mahd", mahd)
        let pool = await conn
        let time = `exec insert_time @idhd = ${mahd}, @idtt = 3` 
        await pool.request().query(`update DONHANG set IDTINHTRANG = 3, MANV = '${req.cookies.tknv}' where IDHD=${mahd} `, async (err, data) => {
            await pool.request().query(time, async (err, data) => {
            
                
            })
            res.send({ done: true })
        })
    }

}))



route.post('/fermeh/admin/filter_status', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
         console.log("value",req.body)
        var status = req.body.value 
        var sql;
        if (status == '0') {
            console.log("true") 
            sql=`select MAHD, MADH = DONHANG.ID, MAKH, MANV, TINHTRANG,NGAYLAP,TONGTIEN,TEN,PHUONGTHUC,TENKH=(select TENKH 
                from KHACHHANG where KHACHHANG.MAKH=HOADON.MAKH)
    from HOADON, DONHANG, TINHTRANGDONHANG 
    where HOADON.IDDH = DONHANG.ID AND DONHANG.IDTINHTRANG = TINHTRANGDONHANG.ID`
        }
        else {
            sql=`exec filter_status @status = ${status}`
        }
        console.log("sql", sql)
        let pool = await conn
       
        await pool.request().query(sql, async (err, data) => {
           
            
            
            res.send({ done: true, data: data.recordset})
        })
    
    }}))
//chi tiet hoa don
route.get('/fermeh/admin/detail-orders', CatchAsync(async (req, res) => {
   console.log("Hello")
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        var madh = parseInt(req.query.infor_detail_bill)
        console.log("madh", madh)
        if (!isNaN(madh)) {
            let sqlDetail = `exec admin_renderDetailCTHD @madh=${madh}`
            let sqlBill = `exec admin_renderDetailBill @madh=${madh}`
            let sqlTime = `EXEC exec_rendertime  @iddh=${madh}`
            let pool = await conn
            await pool.request().query(sqlBill, async (err, data) => {
                var hd = data.recordset
                //   console.log("in", hd) //bill
                await pool.request().query(sqlDetail, async (err, data) => {
                    var detail = data.recordset
                    //  console.log("in2", data.recordset) // detail
                    
                
                await pool.request().query(sqlTime, async (err, data) => {
                   
                    //  console.log("in3", data.recordset) // detail
                    res.render('admin/detail-order', { title: "Chi tiết đơn hàng", detail: detail, time: data.recordset, bill: hd, tentk: req.cookies.tentk, role: req.cookies.role })
                })
            })
        })
        } else {
            //  console.log([].length == 0)
            res.render('admin/detail-order', { title: "Chi tiết đơn hàng", detail: [], bill: [], time : [], tentk: req.cookies.tentk, role: req.cookies.role })

        }
    }
}))
//----------------------------MODULE HÓA ĐƠN





//----------------------------MODULE KHUYẾN MÃI
route.get('/fermeh/admin/sale', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`select * from KHUYENMAI`, async (err, data) => {

            res.render('admin/sale', { title: "Khuyến mãi", sale: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
        })
    }
}))

route.post('/fermeh/admin/add-new-sale', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let k = req.body
        let pool = await conn
        let sql = `insert into KHUYENMAI(TENKM,NGAYBATDAU,NGAYKETTHUC,MANV,GHICHU) 
        values(N'${k.salename}','${k.salestartdate}','${k.saleenddate}','${tknv}',N'${k.salenote}')`
        await pool.request().query(sql, async (err, data) => {
            res.redirect('http://localhost:3000/fermeh/admin/sale')
        })
    }
}))


//----------------------------MODULE KHUYẾN MÃI

//----------------------------MODULE KHACH HANG
route.get('/fermeh/admin/list-customer', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`select * from KHACHHANG`, async (err, data) => {
            res.render('admin/list_user', { title: "Danh sách khách hàng", customer: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
        })
    }
}))


route.post('/fermeh/admin/list-customer', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`select * from KHACHHANG where MAKH=${parseInt(req.body.customerid)}`, async (err, data) => {
            res.render('admin/list_user', { title: "Danh sách khách hàng", customer: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
        })
    }
}))

route.post('/fermeh/admin/customer/find', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`select * from KHACHHANG where MAKH=${parseInt(req.body.customerid)}`, async (err, data) => {
            res.render('admin/list_user', { title: "Danh sách khách hàng", customer: data.recordset, tentk: req.cookies.tentk, role: req.cookies.role })
        })
    }
}))


route.post('/fermeh/admin/customer/detail', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`select * from KHACHHANG where SDT='${req.body.sdt}'`, async (err, data) => {
            var customer = data.recordset
            await pool.request().query(`exec exe_renderLocate '${req.body.sdt}'`, async (err, data) => {
                var dc = data.recordset
                if (dc.length > 0) {
                    for (let i = 0; i < dc.length; i++) {
                        // console.log('dc[i]', dc[i].MAPX, dc[i].MAHUYEN, dc[i].MATINH)
                        await pool.request().query(`select XA=(select TEN from XAPHUONGTHITRAN where XAPHUONGTHITRAN.MAXA='${dc[i].MAPX}')
                        ,HUYEN=(select TEN from QUANHUYEN where QUANHUYEN.MAQH='${dc[i].MAHUYEN}')
                        ,TINH=(select TEN from TINHTHANHPHO where MATP='${dc[i].MATINH}')`, async (err, data) => {
                            // console.log(data.recordset)

                            let j = data.recordset[0]
                            // console.log('j bang', j)
                            dc[i]['XA'] = j.XA
                            dc[i]['HUYEN'] = j.HUYEN
                            dc[i]['TINH'] = j.TINH
                            //    console.log('dc', dc)
                            if (i == dc.length - 1) {
                                console.log(dc)
                                res.send({ customer: customer, locate: dc })
                            }
                        })
                    }
                    // console.log('dc=', dc)
                } else {
                    res.send({ customer: customer, locate: [] })
                }
            })
        })
    }
}))
//----------------------------MODULE KHACH HANG


route.get('/fermeh/admin/user-report', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`exec admin_salereportuser`, async (err, data) => {
            res.render('admin/user_report', { title: "Doanh thu khách hàng", tentk: req.cookies.tentk, arr: data.recordset, role: req.cookies.role })
        })
    }
}))




route.get('/fermeh/admin/sale-report', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        var arr = []
        var d = new Date().getTime()
        // for (let i = d - 86400000 * 30; i <= d; i += 86400000) {
        await pool.request().query(`exec admin_salereport '${new Date(d - 86400000 * 30).toLocaleDateString("en-US")}','${new Date().toLocaleDateString("en-US")}'`, async (err, data) => {
            k = data.recordset
            var ob = { sohd: 0, tong: 0, sp: 0 }
            for (let i of k) {
                ob.sohd += i.HD
                ob.tong += i.DT
                ob.sp += i.SP
            }
            res.render('admin/sale_report', { title: "Báo cáo doanh thu", tentk: req.cookies.tentk, arr: k, sum: ob, role: req.cookies.role })
        })
    }
}))
//
//-----------------------------TAO BAO CAO THEO THANG NGAY NAM
route.post('/fermeh/admin/sale-report/day', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        console.log(req.body)
        let pool = await conn
        await pool.request().query(`exec admin_salereportday ${parseInt(req.body.month)},${parseInt(req.body.year)}`, async (err, data) => {
            let obj = { hd: 0, tien: 0, sp: 0 }
            for (let i of data.recordset) {
                obj.hd += i.SOHD
                obj.tien += i.TONGTIEN
                obj.sp += i.SOSP
            }
            res.send({ data: data.recordset, sum: obj })
        })
    }
}))
route.post('/fermeh/admin/sale-report/month', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        console.log(req.body)
        let pool = await conn
        await pool.request().query(`exec admin_salereportmonth ${parseInt(req.body.year)}`, async (err, data) => {
            let obj = { hd: 0, tien: 0, sp: 0 }
            for (let i of data.recordset) {
                obj.hd += i.SOHD
                obj.tien += i.TONGTIEN
                obj.sp += i.SOSP
            }
            res.send({ data: data.recordset, sum: obj })
        })
    }
}))
route.post('/fermeh/admin/sale-report/year', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        console.log(req.body)
        let pool = await conn
        await pool.request().query(`exec admin_salereportyear`, async (err, data) => {
            let obj = { hd: 0, tien: 0, sp: 0 }
            for (let i of data.recordset) {
                obj.hd += i.SOHD
                obj.tien += i.TONGTIEN
                obj.sp += i.SOSP
            }
            res.send({ data: data.recordset, sum: obj })
        })
    }
}))
//-----------------------------TAO BAO CAO THEO THANG NGAY NAM
//


route.get('/fermeh/admin/user-profile', async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        let manv = req.cookies.tknv.trim()
        await pool.request().query(`select *,TENTK=(select TENTK from TAIKHOAN_NV where MANV='${manv}') ,
        VITRI=(select TENROLE from ROLETAIKHOAN where MAROLE=(select MAROLE from TAIKHOAN_NV where MANV='${manv}'))
        from NHANVIEN where NHANVIEN.MANV='${manv}' `, async (err, data) => {
            res.render('admin/user_profile', { title: "Thông tin", tentk: req.cookies.tentk, nv: data.recordset, role: req.cookies.role })
        })
    }
})
route.post('/fermeh/admin/user-profile', upload.single('staffimg'), CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        console.log('reqbody= ', req.body)
        console.log('reqfile= ', req.file)
        let code = req.body.staffcode
        let name = req.body.staffname
        let date = req.body.staffdate
        let cmnd = req.body.staffcmnd
        let sdt = req.body.staffsdt
        let gt = req.body.staffgender
        let email = req.body.staffemail
        let dc = req.body.stafflocate
        let pool = await conn
        let ha
        if (typeof (req.file) != 'undefined') {
            ha = req.file.filename
        } else {
            ha = ''
        }
        await pool.request().query(`select MANV from NHANVIEN where SDT='${sdt.trim()}'`, async (err, data) => {
            if (data.recordset[0].MANV.trim() != code.trim()) {
                await pool.request().query(`select *,TENTK=(select TENTK from TAIKHOAN_NV where MANV='${code.trim()}') ,
                VITRI=(select TENROLE from ROLETAIKHOAN where MAROLE=(select MAROLE from TAIKHOAN_NV where MANV='${code.trim()}'))
                from NHANVIEN where NHANVIEN.MANV='${code.trim()}' `, async (err, data) => {
                    res.render('admin/user_profile', { title: "Thông tin", tentk: req.cookies.tentk, nv: data.recordset, role: req.cookies.role, err: "Số điện thoại đã tồn tại!!" })
                })
            } else {
                await pool.request().query(`select MANV from NHANVIEN where CMND='${cmnd.trim()}'`, async (err, data) => {
                    if (data.recordset[0].MANV.trim() != code.trim()) {
                        await pool.request().query(`select *,TENTK=(select TENTK from TAIKHOAN_NV where MANV='${code.trim()}') ,
                            VITRI=(select TENROLE from ROLETAIKHOAN where MAROLE=(select MAROLE from TAIKHOAN_NV where MANV='${code.trim()}'))
                            from NHANVIEN where NHANVIEN.MANV='${code.trim()}' `, async (err, data) => {
                            res.render('admin/user_profile', { title: "Thông tin", tentk: req.cookies.tentk, nv: data.recordset, role: req.cookies.role, err: "Số cmnd/cccd đã tồn tại!!" })
                        })
                    } else {
                        let sql = `update NHANVIEN set TEN=N'${name}',NGAYSINH='${date}',SDT='${sdt}',CMND='${cmnd.trim()}',HINHANH='${ha}',
                        EMAIL='${email}',GIOITINH='${gt}',DIACHI=N'${dc}' where MANV='${code.trim()}'`
                        console.log(sql)
                        await pool.request().query(sql, async (err, data) => {
                            res.redirect('http://localhost:3000/fermeh/admin/user-profile')
                        })
                    }
                })
            }
        })
    }
}))
//
//
route.get('/fermeh/admin/setting', async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        let pool = await conn
        await pool.request().query(`select TENTK from TAIKHOAN_NV where MANV='${req.cookies.tknv.trim()}'`, async (err, data) => {
            res.render('admin/setting', { title: "Cài đặt", tentk: req.cookies.tentk, tk: data.recordset[0].TENTK, role: req.cookies.role })
        })
    }
})
route.post('/fermeh/admin/setting/changepass', CatchAsync(async (req, res) => {
    if (req.cookies.role == '' || typeof (req.cookies.role) == 'undefined' || req.cookies.tknv == ''
        || typeof (req.cookies.tknv) == 'undefined' || req.cookies.tentk == '' || typeof (req.cookies.tentk) == 'undefined') {
        res.redirect('http://localhost:3000/fermeh/admin/login')
    }
    else {
        console.log(req.body)
        var mkcu = req.body.mkcu
        var mkmoi = req.body.mkmoi
        var tentk = req.body.tentk
        var cipherPass
        await axios({
            method: 'GET',
            url: 'https://api.hashify.net/hash/md5/hex?value=' + mkcu,
            data: null
        }).then((res) => { cipherPass = res.data.Digest })
            .catch((err) => { console.log("errrrr", err) })
        let pool = await conn
        console.log(cipherPass)
        await pool.request().query(`select * from TAIKHOAN_NV where TENTK='${tentk}' and MATKHAU='${cipherPass}'`, async (err, data) => {
            if (data.recordset.length > 0) {
                var newPass
                await axios({
                    method: 'GET',
                    url: 'https://api.hashify.net/hash/md5/hex?value=' + mkmoi,
                    data: null
                }).then((res) => { newPass = res.data.Digest })
                    .catch((err) => { console.log("errrrr", err) })
                await pool.request().query(`update TAIKHOAN_NV set MATKHAU='${newPass}' where TENTK='${tentk}'`, async (err, data) => {
                    res.send({ done: true })
                })
            }
            else {
                res.send({ done: false })
            }
        })
    }
}))

// route.get('/fermeh/admin/user-profile', async (req, res) => {
//     res.render('admin/user_profile')
// })
route.get('/for-got-pass-word', async (req, res) => {
    res.render('admin/test_file')
})

route.post('/for-got-pass-word', async (req, res) => {
    var mail = req.body.email
    let transporter = nodemailer.createTransport({
        // service: "gmail",
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: "luffschloss@gmail.com", // generated ethereal user
            pass: "lbukidsfdgufdswa", // generated ethereal password
        },
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: "luffschloss@gmail.com", // sender address
        to: "factyel.bttn@gmail.com", // list of receivers
        subject: "Mat khau moi cua ban la:", // Subject line
        text: "0123876", // plain text body
        html: "<b>New pass: 0123876</b>", // html body
    })
    res.send("thanh cong ne")
})



route.get('/fermeh/admin/fogot-password', (req, res) => {
    res.render("admin/fogot_password")
})
route.post('/fermeh/admin/email/send-new-pass', async (req, res) => {
    let email = req.body.email
    let pool = await conn
    await pool.request().query(`select EMAIL from NHANVIEN where EMAIL='${email}'`, async (err, data) => {
        if (data.recordset.length > 0) {
            let alpha = 'abcdefghijklmnopqrstuvwxyz'
            let str = "";
            for (let i = 0; i < 2; i++) {
                str += alpha.charAt(Math.random() * alpha.length)
            }
            str += new Date().getTime()
            let cipherPass = ""
            await axios({
                method: 'GET',
                url: 'https://api.hashify.net/hash/md5/hex?value=' + str,
                data: null
            }).then((res) => { cipherPass = res.data.Digest })
                .catch((err) => { console.log("errrrr", err) })

            let sql = `UPDATE TAIKHOAN_NV SET MATKHAU = '${cipherPass}' WHERE MANV=(SELECT MANV FROM NHANVIEN WHERE EMAIL='${email}')`
            //console.log(sql)
            await pool.request().query(sql, async (err, data) => {

            })
            let transporter = nodemailer.createTransport({
                // service: "gmail",
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: "luffschloss@gmail.com", // generated ethereal user
                    pass: "lbukidsfdgufdswa", // generated ethereal password
                },
            });

            // send mail with defined transport object
            await transporter.sendMail({
                from: "luffschloss@gmail.com", // sender address
                to: `${email}`, // list of receivers
                subject: "Mật khẩu mới của bạn là:", // Subject line
                text: "password", // plain text body
                html: `<b>Mật khẩu mới: ${str.trim()}</b>`, // html body
            })
            res.send({ done: true })
        } else {
            console.log(email)
            res.send({ done: false, message: "Email không tồn tại hoặc không chính xác!" })
        }
    })
})
module.exports = route
