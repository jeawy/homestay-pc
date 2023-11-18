import AXIOS from "@/libs/request";
 
 //查询
export const queryBacklog = params =>
  AXIOS.get("/backlog/backlogs/", { params });
 
export const updateBacklog = data =>
  AXIOS.post("/backlog/backlogs/", data);
 