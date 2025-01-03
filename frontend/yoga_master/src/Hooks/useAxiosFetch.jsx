import React, { useEffect } from 'react'

const useAxiosFetch = () => {
  const axiosInstance = axios.create({
    baseURL: 'https://some-domain.com/api/',
    });

    // Interceptors
    useEffect(()=>{
      const requestInterceptors = axios.interceptors.request.use(function (config) {
        // Do something before request is sent
        return config;
      }, function (error) {
        // Do something with request error
        return Promise.reject(error);
      });
    },[])
  return (
    <div>useAxiosFetch</div>
  )
}

export default useAxiosFetch