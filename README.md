# URLProxy

URLProxy 是一个用于加速下载国外资源的工具，通过将用户请求的资源代理到一个网络较好的服务器上，实现下载速度的提升。

原理是将URLProxy部署在一个对境外境内网络都比较好的服务器上，通过这个服务器进行中转下载。类似于nginx的反向代理，但是代理的地址可以通过url传入

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

如果需要设置密码，请指定环境变量PASSWORD，如果需要设置代理域名白名单，请指定环境变量ALLOWED_DOMAINS，多个域名请用,隔开

设置访问密码为123456,可以使用如下命令

```bash
sudo docker run -d -p 3000:3000 --env "PASSWORD=123456" mrlee326/urlproxy 
```

如果在设置了密码的情况下，使用curl或者wget下载的命令如下

```bash
wget --auth-no-challenge http://admin:{您的密码}@127.0.0.1:3000/proxy/{文件链接}
curl http://admin:{您的密码}@127.0.0.1:3000/proxy/{文件链接}
```


设置只能代理www.baidu.com和www.google.com域名下的资源,可以使用如下命令

```bash
sudo docker run -d -p 3000:3000 --env "ALLOWED_DOMAINS=www.baidu.com,www.google.com" mrlee326/urlproxy 
```

启动后可以看到一个页面，输入想要下载的url，点击【GO】按钮即可下载。

![首页](index.png)

如果设置了密码，看到的应该是下面需要输入密码的页面，在输入正确的密码，按下回车后，就可以正常使用

![输入密码](lock.png)