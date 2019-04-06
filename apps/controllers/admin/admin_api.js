const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const config = require("config");
const data_User_From_DB = require(path.join(__dirname, "../../", "/models/user")); //"../models/user"
const data_Monan_From_DB = require(path.join(__dirname, "../../", "/models/monan")); //"../models/user"
const data_Profile_From_DB = require(path.join(__dirname, "../../", "/models/profile")); //"../models/profile"
const data_Order_From_DB = require(path.join(__dirname, "../../", "/models/order")); //"../models/order"
const data_Doanhthu_From_DB = require(path.join(__dirname, "../../", "/models/doanhthu")); //"../models/order"
const bcrypt = require(path.join(__dirname, "../../", "/helpers/encode_password")); //"../helpers/encode_password"

var router = express.Router();

router.use(function(req, res, next) {
    var token = req.body.token || req.query.token;
    console.log("token in image:" + token);
    if (!token) return res.status(403).json({ notification: "no token" });
    else {
        jwt.verify(token, config.get("jsonwebtoken.codesecret"), function(err, decoded) {
            if (err) res.status(403).json({ data: { success: false, notification: "token error" } });
            else {
                var id = decoded._id;
                data_User_From_DB.getUserByIdToCheckRole(id, function(result) {
                    if (!result) res.status(403).json({ data: { success: false, notification: "token error, not found user" } });
                    else {
                        console.log(result.role.name_role);
                        if (result.role.name_role == "admin" && result.role.licensed == true) {
                            console.log("here");
                            decoded.role = result.role;
                            req.user = decoded;
                            next();
                        } else res.status(401).json({ data: { success: false, notification: "this account can't access" } });
                    }
                })
            }
        })
    }
});
//----LISTSANPHAM-----
router.get("/listsanpham", function(req, res) {
    // var user = req.user;
    // var id = user._id;
    // var permission = user.role.permission;
    //------CHECK PERMISSION-------------
    // if(check_Permission(permission, "monan", 1) == false) return res.status(401).json({data:{success:false, notification:"You can't view monan"}});
    var id = req.body.id || req.query.id;

    data_Monan_From_DB.getMonAnById(id, function(result) {
        if (!result) res.status(500).json({ data: { success: false } });
        else res.status(200).json({
            data: {
                success: true,
                result: result
            }
        });

    });
});
router.post("/listsanpham/add", function(req, res) {
    // var user = req.user;
    // var id = user._id;
    // var permission = user.role.permission;
    // console.log(id);
    // //---CHECK PERMISSION-----
    // if(check_Permission(permission, "monan", 2) == false) return res.status(401).json({data:{success:false, notification:"You can't ADD monan"}});
    var id = req.body.id || req.query.id;

    var sanpham = req.body;
    var danhmuc = sanpham.danhmuc;
    var ten = sanpham.ten;
    var mota = sanpham.mota;
    var hinhanh_url = null;
    var gia = sanpham.gia;
    var soluong = sanpham.soluong;
    var trungbinhsao = 0;
    //CHECK INPUT VALID
    if (!danhmuc || danhmuc.trim().length == 0) return res.status(400).json({ data: { success: false, notification: "input's wrong" } });
    else if (danhmuc.trim() != "com" && danhmuc.trim() != "thucan" && danhmuc.trim() != "canh")
        return res.status(400).json({ data: { success: false, notification: "danhmuc have to 1 in 3 values ('com','canh','thucan')" } });

    if (!sanpham) return res.status(400).json({ data: { success: false, notification: "input's wrong" } });

    if (!ten || ten.trim().length == 0 || !gia || Number.isNaN(gia) || !soluong || Number.isNaN(soluong))
        return res.status(400).json({ data: { success: false, notification: "input's wrong" } });

    var data = {
        ten: ten,
        mota: mota,
        hinhanh_url: hinhanh_url,
        gia: gia,
        soluong: soluong,
        trungbinhsao: trungbinhsao
    }

    data_Monan_From_DB.createMonAnOfStore(id, danhmuc, data, function(result) {
        if (!result) res.status(500).json({ data: { success: false, notification: "unknown error" } });
        else res.status(200).json({ data: { success: true, notification: "created is success" } });
    });


});
router.delete("/listsanpham/delete", function(req, res) {
    // var user = req.user;
    // var id = user._id;
    // var permission = user.role.permission;
    // if(check_Permission(permission, "monan", 4) == false) return res.status(401).json({data:{success:false, notification:"You can't DELETE monan"}});
    var id = req.body.id || req.query.id;

    var id_monan = req.query.id_monan || req.body.id_monan;
    var danhmuc = req.query.danhmuc || req.body.danhmuc;

    if (!id_monan || id_monan.trim().length == 0 || !danhmuc || danhmuc.trim().length == 0)
        return res.status(400).json({ data: { success: false, notification: "input's wrong" } });
    else if (danhmuc.trim() != "com" && danhmuc.trim() != "thucan" && danhmuc.trim() != "canh")
        return res.status(400).json({ data: { success: false, notification: "danhmuc have to 1 in 3 values ('com','canh','thucan')" } });

    data_Monan_From_DB.deleteMonAnById(id, id_monan, danhmuc, function(result) {
        if (!result) res.status(500).json({ data: { success: false, notification: "You can't ADD monanunknown error" } });
        else res.status(200).json({ data: { success: true, notification: "delete is success" } });
    })

})
router.put("/listsanpham/update", function(req, res) {
    //DEFINE CODDE........
    // var user = req.user;
    // var id = user._id;
    // var permission = user.role.permission;
    // if(check_Permission(permission, "monan", 3) == false) return res.status(401).json({data:{success:false, notification:"You can't EDIT monan"}});
    var id = req.body.id || req.query.id;

    var id_monan = req.query.id_monan || req.body.id_monan;
    var danhmuc = req.query.danhmuc || req.body.danhmuc;
    var ten = req.query.ten || req.body.ten;
    var mota = req.query.mota || req.body.mota;
    var hinhanh_url = null;
    var gia = req.query.gia || req.body.gia;
    var soluong = req.query.soluong || req.body.soluong;

    if (!danhmuc || danhmuc.trim().length == 0) return res.status(400).json({ data: { success: false, notification: "input's wrong" } });
    else if (danhmuc.trim() != "com" && danhmuc.trim() != "thucan" && danhmuc.trim() != "canh")
        return res.status(400).json({ data: { success: false, notification: "danhmuc have to 1 in 3 values ('com','canh','thucan')" } });

    if (!ten || ten.trim().length == 0 || !gia || Number.isNaN(gia) || !soluong || Number.isNaN(soluong))
        return res.status(400).json({ data: { success: false, notification: "input's wrong" } });

    var data = {
        ten: ten,
        mota: mota,
        hinhanh_url: hinhanh_url,
        gia: gia,
        soluong: soluong,
    }

    data_Monan_From_DB.updateMonAnById(id, id_monan, danhmuc, data, function(result) {
        if (!result) res.status(500).json({ data: { success: false, notification: "unknow error" } });
        else res.status(200).json({ data: { success: true, notification: "updated is success" } });
    })
});

//------profile---------
router.get("/profilestore", function(req, res) {
    var id = req.body.id || req.query.id;

    data_Profile_From_DB.getProfileStoreById(id, function(result) {
        if (!result) res.status(500).json({ data: { success: false } });
        else res.status(200).json({
            data: {
                success: true,
                result: result
            }
        })
    })
});

//EDIT PROFILE-------------------------
router.put("/profilestore/update", function(req, res) {
    var id = req.body.id || req.query.id;
    var user = req.body;

    var name_personal = user.name_personal;
    var address = user.address;
    var name_store = user.name_store;
    var phonenumber = user.phonenumber;
    var tenthanhpho = user.tenthanhpho;
    var tenquan = user.tenquan;
    var tenduong = user.tenduong;
    var mota = user.mota;
    var avarta_url = null;

    if (!phonenumber || phonenumber.trim().length == 0 ||
        !tenthanhpho || tenthanhpho.trim().length == 0 || !tenquan || tenquan.trim().length == 0 || !name_personal || name_personal.trim().length == 0 ||
        !name_store || name_store.trim().length == 0)
        return res.status(400).json({ data: { success: false, notification: "ban phai nhap day du thong tin" } });

    var data = {
        name_personal: name_personal,
        address: address,
        name_store: name_store,
        phonenumber: phonenumber,
        tenthanhpho: tenthanhpho,
        tenquan: tenquan,
        tenduong: tenduong,
        mota: mota,
        avarta_url: avarta_url
    }

    data_Profile_From_DB.updateProfileStoreById(id, data, function(result) {
        if (!result) res.status(500).json({ data: { success: false } });
        else res.status(200).json({ data: { success: true, notification: "updated is success" } });
    })
});
//------order--------
router.get("/listorder", function(req, res) {
    var id = req.body.id || req.query.id;

    data_Order_From_DB.getListOrderById(id, function(result) {
        if (!result) res.status(500).json({ data: { success: false } });
        else res.status(200).json({
            data: {
                success: true,
                result: result
            }
        })
    })
});
//--------doanhthu---------
router.get("/listdoanhthu", function(req, res) {
        var id = req.body.id || req.query.id;

        data_Doanhthu_From_DB.getListDoanhThu(id, function(result) {
            if (!result) res.status(500).json({ data: { success: false } });
            else res.status(200).json({
                data: {
                    success: true,
                    result: result
                }
            })
        })
    })
    //--------LISTSTORE---------
router.get("/liststores", function(req, res) {
    data_User_From_DB.getAllCustomers(function(result) {
        if (!result) res.status(500).json({ data: { success: false } });
        else res.status(200).json({
            data: {
                success: true,
                result: result
            }
        })
    })
})

router.get("/listusers", function(req, res) {
        data_User_From_DB.getAllUsers(function(result) {
            if (!result) res.status(500).json({ data: { success: false } });
            else res.status(200).json({
                data: {
                    success: true,
                    result: result
                }
            })
        })
    })
    //-----------MODULE EXPORTS -----------
module.exports = router;