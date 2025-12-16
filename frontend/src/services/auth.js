import api from "./api";

export const signup = (data) =>
  api.post("/auth/signup", data).then(res => res.data);

export const login = (data) =>
  api.post("/auth/login", data).then(res => res.data);
