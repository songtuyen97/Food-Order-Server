const express = require("express");
const path = require("path");
const data_User_From_DB = require(path.join(__dirname, "../../", "/models/user"));//"../models/user"
const bcrypt = require(path.join(__dirname, "../../", "/helpers/encode_password"));//"../helpers/encode_password"

var router = express.Router();

//---------------------API------------------------
router.use("/api", require("./store_api")); // require api for store
router.get("/", function(req, res) {
    // console.log("Came into store's page");
    // console.log(path.join(__dirname , "../../", "public"));
}); 
//---------API SIGNUP FOR USERS ON WEB APP-----------
router.post("/signup", function(req, res) {
    console.log(req.user);
    var user = req.body;
    var username = user.username;
    var password = user.password;

    var name = user.name;
    var address = user.address;
    var phonenumber = user.phonenumber;
    var tenthanhpho = user.tenthanhpho;
    var tenquan = user.tenquan;
    var tenduong = user.tenduong;
    var mota = user.mota;
    var avatar_default_url = req.headers.host + "/images/avatar?id=avatar_default.jpg";
    var dichvu_default_url = req.headers.host + "/images/avatar?id=dichvu_default.jpg";
    //CHECK INPUT VALID
    if(!username || username.trim().length == 0 || !password || password.trim().length == 0 || !phonenumber || phonenumber.trim().length == 0
    || !tenthanhpho || tenthanhpho.trim().length == 0 || !tenquan || tenquan.trim().length == 0 || !name || name.trim().length == 0) 
    return res.status(400).json({data:{success:false, notification:"ban phai nhap day du thong tin"}});
    //ENCODE PASSWORD
    var encode_Password = bcrypt.encode_Password(password);
    //have to edit schema for new DB
    var data_Of_DichVu = {
        username : username,
        password : encode_Password,
        role : {
            name_role : "store",
            description : "Co the ban do an",
            licensed : true,
            permission : [{
                name_per : "monan",
                description : "CRUD monan cua minh",
                per_detail : {
                    view : true,
                    create : true,
                    update : true,
                    delete : true
                }
            },
            {
                name_per : "comment",
                description : "CRUD comment trong monan cua minh",
                per_detail : {
                    view : true,
                    create : true,
                    update : false,
                    delete : true
                }
            }]
        },
        infomation : {
            name : name,
            address : address, 
            phonenumber : phonenumber,
            avatar_url : avatar_default_url,
        },
        dichvu : {
            ten : name,
            diachi : {
                tenthanhpho : tenthanhpho,
                tenquan : tenquan,
                tenduong : tenduong
            },
            mota : mota, 
            avatar_url : dichvu_default_url,
            danhmuc : [{
                ten : "com",
                mota : "Cơm là một loại thức ăn được làm ra từ gạo bằng cách đem nấu với một lượng vừa đủ nước.",
            },
            {
                ten : "thucan",
                mota : "thức ăn kèm cơm",
            },
            {
                ten : "canh",
                mota : "thức ăn, cơm kèm canh",
            }]
        }
    }
    data_User_From_DB.getUserByUsername(username, function(result){
        console.log(result);
        if(result) return res.status(401).json({data:{success:false, notification:"username was exist"}});                                               //status 400 for same username
        data_User_From_DB.createUser(data_Of_DichVu, function(result) {
            if(result) return res.status(200).json({data:{success:true}});          
            return res.status(500).json({data:{success:false}});                                                                //status 500 for no know erroe
        });
        
    });
});

//------------------EXPORT MODULE------------------
module.exports = router;

