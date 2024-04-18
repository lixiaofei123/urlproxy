# URLProxy

URLProxy 是一个用于加速下载国外资源的工具，通过将用户请求的资源代理到一个网络较好的服务器上，实现下载速度的提升。

## 功能特点

- 加速国外资源下载：通过 URLProxy，用户可以快速下载国外资源，避免因为网络问题导致的下载缓慢。
- 简单易用：用户只需在页面上输入想要下载的地址，点击下载即可完成下载过程，无需复杂的操作。

## 部署

使用Docker部署

```
sudo docker run -d -p 8000:8000 --env "DOMAIN=http://10.1.110.60:8000" mrlee326/urlproxy
```

> 必须传入环境变量DOMAIN，DOMAIN是urlproxy对外正式的地址