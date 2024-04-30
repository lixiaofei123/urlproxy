# URLProxy

URLProxy 是一个用于加速下载国外资源的工具，通过将用户请求的资源代理到一个网络较好的服务器上，实现下载速度的提升。

原理是将URLProxy部署在一个对境外境内网络都比较好的服务器上，通过这个服务器进行中转下载。类似于nginx的反向代理，但是代理的地址可以通过url传入

此为Docker版本，如果需要Cloudflare Worker版本，请[点击这里](https://github.com/lixiaofei123/urlproxy/tree/cfworker)

## 功能特点

- 加速国外资源下载：通过 URLProxy，用户可以快速下载国外资源，避免因为网络问题导致的下载缓慢。
- 简单易用：用户只需在页面上输入想要下载的地址，点击下载即可完成下载过程，无需复杂的操作。

## 支持设置密码以及代理域名白名单

可以设置访问密码或者代理域名白名单来保护代理服务不被滥用

## 部署

> 如果您想支持本作者，可以将下面命令中的的mrlee326/urlproxy替换为mrlee326/urlproxy:aff，这只会让首页上出现几个广告，并不影响您的使用

使用Docker部署

```bash
sudo docker run -d -p 3000:3000  mrlee326/urlproxy 
```

## 配置

1. 如果需要设置密码，请指定环境变量PASSWORD
2. 如果需要设置代理域名白名单，请指定环境变量ALLOWED_DOMAINS，多个域名请用,隔开，支持*匹配
3. 要控制 URLProxy 对代理 URL 的下载行为，请在环境变量中指定 FORCE_DOWNLOAD。默认情况下，FORCE_DOWNLOAD 设置为 true，URLProxy 会强制将代理的 URL 内容作为下载文件返回给用户。但是，如果您希望代理的 URL 按照原始 URL 的内容类型行为，即在浏览器中打开网页或显示其他内容，可以将 FORCE_DOWNLOAD 设置为 false。例如，如果代理的内容是一张图片，不设置FORCE_DOWNLOAD的情况下，浏览器将会下载这张图片到本地。如果设置FORCE_DOWNLOAD为false,浏览器将直接显示这张图片

设置访问密码为123456,可以使用如下命令

```bash
sudo docker run -d -p 3000:3000 --env "PASSWORD=123456" mrlee326/urlproxy 
```

<div id="notice">说明</div>

如果在设置了密码的情况下，使用curl或者wget下载的命令如下

```bash
wget --auth-no-challenge http://admin:{您的密码}@127.0.0.1:3000/proxy/{文件链接}
curl http://admin:{您的密码}@127.0.0.1:3000/proxy/{文件链接}
```


设置只能代理www.baidu.com和*.google.com域名下的资源,可以使用如下命令

```bash
sudo docker run -d -p 3000:3000 --env "ALLOWED_DOMAINS=www.baidu.com,*.google.com" mrlee326/urlproxy 
```

改变默认的强制下载的行为

```bash
sudo docker run -d -p 3000:3000 --env "FORCE_DOWNLOAD=false" mrlee326/urlproxy 
```


启动后可以看到一个页面，输入想要下载的url，点击【GO】按钮即可下载。

![首页](index.png)

如果设置了密码，看到的应该是下面需要输入密码的页面，在输入正确的密码，按下回车后，就可以正常使用

![输入密码](lock.png)