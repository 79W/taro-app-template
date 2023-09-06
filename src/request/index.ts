import Taro from "@tarojs/taro";

export type ResponseData<T> = {
  code: number;
  data: T;
  message: string;
};

export type TType = string | TaroGeneral.IAnyObject | ArrayBuffer;

const getBaseOptions = (options: Taro.request.Option): Taro.request.Option => {
  let url = options.url;
  if (!(/^(https?:\/\/)/.test(options.url)) && process.env.BASE_HOST) {
    url = process.env.BASE_HOST + options.url;
  }

  return {
    timeout: 6000,
    method: "GET",
    dataType: "JSON",
    ...options,
    url,
  };
};

// 请求拦截器
const requestInterceptor = function (chain) {
  const requestParams = chain.requestParams;
  const { method, data, url, header } = requestParams;

  const token = Taro.getStorageSync("token");

  requestParams.header = {
    ...header,
    token,
  };

  console.log(`http ${method || "GET"} --> ${url} data: `, data);

  return chain.proceed(requestParams).then((res) => {
    console.log(`http <-- ${url} result:`, res);
    return res;
  });
};

// 响应拦截器
const responseInterceptor = function <T>(
  data: Taro.request.SuccessCallbackResult<ResponseData<T>>
) {

};

// 注册拦截器
Taro.addInterceptor(requestInterceptor);
Taro.addInterceptor(Taro.interceptors.logInterceptor);
Taro.addInterceptor(Taro.interceptors.timeoutInterceptor);

// 请求
async function request<T extends TType>(
  options: Taro.request.Option
): Promise<Taro.RequestTask<ResponseData<T>>> {

  const baseOptions = getBaseOptions(options);

  const requestTask = Taro.request<ResponseData<T>>({
    ...options,
    ...baseOptions,
  });

  const result = await requestTask;
  await responseInterceptor<T>(result);

  return { ...result, ...requestTask };
}

export default {
  get: function <T extends TType>(
    url: string,
    data: TaroGeneral.IAnyObject = {},
    header: TaroGeneral.IAnyObject = {}
  ) {
    return request<T>({
      url,
      data,
      header,
      method: "GET",
    });
  },
  post: function <T extends TType>(
    url: string,
    data: TaroGeneral.IAnyObject = {},
    header: TaroGeneral.IAnyObject = {}
  ) {
    return request<T>({
      url,
      data,
      header,
      method: "POST",
    });
  },
  put: function <T extends TType>(
    url: string,
    data: TaroGeneral.IAnyObject = {},
    header: TaroGeneral.IAnyObject = {}
  ) {
    return request<T>({
      url,
      data,
      header,
      method: "PUT",
    });
  },
  del: function <T extends TType>(
    url: string,
    data: TaroGeneral.IAnyObject = {},
    header: TaroGeneral.IAnyObject = {}
  ) {
    return request<T>({
      url,
      data,
      header,
      method: "DELETE",
    });
  },
};
