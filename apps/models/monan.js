const mongoose = require("../common/mongoose");

// function getAllMonAn(fn_result) {
//     mongoose.model_dichvu.find({"name_per":"nguoinau"}).select("nguoinau.monan").exec(function(err, result) {
//         if(err) return fn_result(false);
//         return fn_result(result);
//     });
// }
function getMonAnById(id, id_Monan, fn_result) {
    mongoose.model_dichvu.findOne({"_id" : id}).select("dichvu.danhmuc").exec(function(err, result) {
        if(err) return fn_result(false);
        else {
            var monan = null;
            danhmuc = result.dichvu.danhmuc;
            danhmuc.forEach(function(elem_danhmuc) {
                elem_danhmuc.monan.forEach(function(elem_monan) {
                    if(elem_monan._id == id_Monan) {
                        var rs_monan = elem_monan.toObject();
                        rs_monan.id_danhmuc = elem_danhmuc._id;
                        rs_monan.ten_danhmuc = elem_danhmuc.ten;
                        rs_monan.mota_danhmuc = elem_danhmuc.mota;
                        monan = rs_monan;
                        return;
                    }
                });  
            })
            fn_result(monan);
        }
    });
}
function getListMonAnById(id, fn_result) {
    mongoose.model_dichvu.findOne({"_id" : id}).select("dichvu.danhmuc").exec(function(err, result) {
        if(err) return fn_result(false);
        else {
            var monan = [];
            danhmuc = result.dichvu.danhmuc;
            danhmuc.forEach(function(elem_danhmuc) {
                elem_danhmuc.monan.forEach(function(elem_monan) {
                    var rs_monan = elem_monan.toObject();
                    rs_monan.id_danhmuc = elem_danhmuc._id;
                    rs_monan.ten_danhmuc = elem_danhmuc.ten;
                    rs_monan.mota_danhmuc = elem_danhmuc.mota;
                    monan.push(rs_monan);
                });  
            })
            fn_result(monan);
        }
    });
}
// function getMonAnByName(name, fn_result) {
//     mongoose.model_dichvu.find({"name_per":"nguoinau", "name_per":"nguoinau", "nguoinau.monan.tenmon" : name})
//     .select("nguoinau.monan").exec(function(err, result) {
//         if(err) return fn_result(false);
//         return fn_result(result);
//     });
// }
//-----------ADD MONAN-------------
function createMonAnOfStore(id, danhmuc, monan, fn_result) {
    mongoose.model_dichvu.findOneAndUpdate({_id : id, "dichvu.danhmuc.ten": danhmuc}, {$push: {"dichvu.danhmuc.$.monan": monan}},
    {safe: true, upsert: true, new : true}, function(err, result) {
        if(err) fn_result(false);
        else fn_result(result);
    })
}
//-----------DELETE MONAN--------------
function deleteMonAnById(id, id_monan, fn_result) {
    //, "dichvu.danhmuc.$.monan._id" : id_monan
    mongoose.model_dichvu.findOne({_id : id}, function(err, result) {
        if(err) return fn_result(false);
        else if(result){
             if(result.dichvu) {
                result.dichvu.danhmuc.forEach(function(elem_danhmuc) {     
                    if(elem_danhmuc.monan) {
                        for(i = elem_danhmuc.monan.length - 1; i >= 0; i--) {
                            if(elem_danhmuc.monan[i]._id == id_monan) elem_danhmuc.monan.splice(i, 1);
                        }
                    }
                })
                var user = new mongoose.model_dichvu(result);
                user.save();
                return fn_result(true);
            }
        }
    })
}
function updateMonAnById(id, id_monan, danhmuc, data, fn_result) {
    mongoose.model_dichvu.findOne({_id : id}).exec(function(err, result) {
        if(err) return fn_result(false);
        if(result.dichvu) {
            result.dichvu.danhmuc.forEach(function(elem_danhmuc) {     
                    if(elem_danhmuc.monan) {
                        elem_danhmuc.monan.forEach(function(elem_monan) {
                            if(elem_monan && elem_monan._id == id_monan) {
                                if(elem_danhmuc.ten == danhmuc) {
                                    elem_monan.ten = data.ten;
                                    elem_monan.mota = data.mota;
                                    if(data.hinhanh_url) elem_monan.hinhanh_url = data.hinhanh_url;
                                    elem_monan.gia = data.gia;
                                    elem_monan.soluong = data.soluong;
                                }
                                // }else {
                                //     for(i = 0; i < result.dichvu.danhmuc.length; i++) {
                                //         if(result.dichvu.danhmuc[i].ten == danhmuc) {

                                //         }
                                //     }
                                // }
                            }
                        })        
                    }
            })
            var user = new mongoose.model_dichvu(result);
            user.save();
            return fn_result(true);
        }
        else fn_result(false);
    })
}

module.exports = {
    // getAllMonAn : getAllMonAn,
    getMonAnById : getMonAnById,
    getListMonAnById : getListMonAnById,
    // getMonAnByName : getMonAnByName,
    createMonAnOfStore : createMonAnOfStore,
    deleteMonAnById : deleteMonAnById,
    updateMonAnById : updateMonAnById
}