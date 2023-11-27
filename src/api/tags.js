import AXIOS from '@/libs/request'
//获取标签列表
export function getTagsApi(params){
    return AXIOS.get('/tags/tags/',{params})
}

 