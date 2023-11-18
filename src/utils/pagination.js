

// 设置分页每页条数，如50条，全局生效，本地长久保存
export function setPaginationSize(paginationsize){
    localStorage.setItem("paginationsize", paginationsize)
}

// 设置分页每页条数，如50条，全局生效，本地长久保存
export function getPaginationSize(){
    let paginationsize = localStorage.getItem("paginationsize")
    console.log(paginationsize)
    if (paginationsize == "undefined" || paginationsize == null || paginationsize == "")
    {
        localStorage.setItem("paginationsize", 50)
        paginationsize =  50;
    }
    else{
        paginationsize = parseInt(paginationsize)
    }
    return paginationsize;

}