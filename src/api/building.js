import AXIOS from '@/libs/request'
 
//删除房产
export function deleteRooms(data) {
    return AXIOS.post('/building/room/', {
        ...data,
        method: 'delete'
    })
}

export function getOrders(params) {
    return AXIOS.get('/building/org/', {  params})
}
 
//获取的楼栋信息、单元号
export function getBuildings(params) { 
    return AXIOS.get('/building/building/', {
        params
    })
}
 
//获取房屋信息
export function getRoomApi(params) {
    return AXIOS.get('/building/room/', {
        params
    })
}

//物业获取房屋信息
export function getOrgRoomApi(params) {
    return AXIOS.get('/building/org/', {
        params
    })
}

export function updateFees(){
    
}

//获取楼号
export function getBuildingApi(params) {
    return AXIOS.get('/building/building/', {
        params
    })
}
//修改
export function updateBuilding(data) {
    return AXIOS.post('/building/building/', data)
}


//上传现场催缴记录
export function uploadRecordPic(data) {
    return AXIOS.post('/building/record/', data)
}

//获取催缴记录
export function getRecords(params) {
    return AXIOS.get('/building/record/', {params})
}

//修改
export function updateRoom(data) {
    return AXIOS.post('/building/room/', data)
}

//导入资产列表
export function uploadBuildingInfo(data) {
    return AXIOS.post('/building/batch/', data, {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        //3、transformRequest在向服务器发送前，修改请求数据
        transformRequest: [params => {
            return JSON.stringify(params)
        }]
    })
}
//后端解析excel
export function parseExcel(data) {
    return AXIOS.post('/excel/excel/', data, {
        transformRequest: [data => {
            return data;
        }],

        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}
