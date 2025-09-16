import axios from "axios";

const HEADERS_DEFAULT = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

const get = ({ url = "", options = {}, headers = {} }) => {
  return axios.get(url, {
    headers: {
      ...HEADERS_DEFAULT,
      ...headers,
    },
    ...options,
  });
};

const post = ({ url = "", body = {}, headers = {}, options = {} }) => {
  return axios.post(url, body, {
    headers: {
      ...HEADERS_DEFAULT,
      ...headers,
    },
    ...options,
  });
};

export default {
  get,
  post,
};
