import axios from "axios";

export const post = (url, data, config) => {
  return new Promise((resolve, reject) => {
    axios.post(url, data, config).then(res => {
      const resData = res.data;
      if (resData.success) {
        resolve(resData.data);
      } else {
        reject(resData.error);
      }
    });
  });
};

export const get = (url, config) => {
  return new Promise((resolve, reject) => {
    axios.get(url, config).then(res => {
      const resData = res.data;
      if (resData.success) {
        resolve(resData.data);
      } else {
        reject(resData.error);
      }
    });
  });
};
