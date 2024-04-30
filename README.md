# URLProxy

URLProxy 是一个用于加速下载国外资源的工具，通过将用户请求的资源代理到一个网络较好的服务器上，实现下载速度的提升。

原理是将URLProxy部署在一个对境外境内网络都比较好的服务器上，通过这个服务器进行中转下载。类似于nginx的反向代理，但是代理的地址可以通过url传入

可以[点击这里](https://urlproxy.lixiaofei123.workers.dev)查看示例部署，密码是123456

## 功能特点

- 加速国外资源下载：通过 URLProxy，用户可以快速下载国外资源，避免因为网络问题导致的下载缓慢。
- 简单易用：用户只需在页面上输入想要下载的地址，点击下载即可完成下载过程，无需复杂的操作。

## 支持设置密码以及代理域名白名单

可以设置访问密码或者代理域名白名单来保护代理服务不被滥用

## 部署

第一步，将本项目克隆到本地并进入到目录

```
git clone git@github.com:lixiaofei123/urlproxy.git

cd urlproxy
```

第二步，切换到 cfworker 分支

```
git checkout cfworker
```

第三步，安装相关依赖

```
npm install
```

第四步，在wrangler.toml文件的最下面部分进行相关的配置
 

 - 如果需要设置密码，请指定PASSWORD不为空 
 - <span style="color:red">如果需要设置密码的话，一定要修改SIGN_KEY，越复杂越好</span>
 - 如果需要设置代理域名白名单，请指定环境变量ALLOWED_DOMAINS，多个域名请用,隔开，支持*匹配
 - 要控制 URLProxy 对代理 URL 的下载行为，请在环境变量中指定 FORCE_DOWNLOAD。默认情况下，FORCE_DOWNLOAD 设置为 true，URLProxy 会强制将代理的 URL 内容作为下载文件返回给用户。但是，如果您希望代理的 URL 按照原始 URL 的内容类型行为，即在浏览器中打开网页或显示其他内容，可以将 FORCE_DOWNLOAD 设置为 false。例如，如果代理的内容是一张图片，不设置FORCE_DOWNLOAD的情况下，浏览器将会下载这张图片到本地。如果设置FORCE_DOWNLOAD为false,浏览器将直接显示这张图片

说明
如果在设置了密码的情况下，使用curl或者wget下载的命令如下

```
wget --auth-no-challenge http://admin:{您的密码}@127.0.0.1:3000/proxy/{文件链接}
curl http://admin:{您的密码}@127.0.0.1:3000/proxy/{文件链接}
```


例如
 
 ```
 [vars]
PASSWORD = 123456
FORCE_DOWNLOAD = "false"
ALLOWED_DOMAINS = "*"
 ```

 第五步, 部署到cf workers

 ```
 npm run deploy
 ```

 第一次运行的时候，会打开一个网页进行授权，如果网页不能自动打开，可以手动复制网页地址到浏览器打开。授权完毕后，控制台会出现"Successfully logged in."，此时可以ctrl+C关闭此命令，再次执行 npm run deploy命令,成功以后，控制台上会输出对应的地址，打开此地址即可


启动后可以看到一个页面，输入想要下载的url，点击【GO】按钮即可下载。

![首页](https://raw.githubusercontent.com/lixiaofei123/urlproxy/master/index.png)

如果设置了密码，看到的应该是下面需要输入密码的页面，在输入正确的密码，按下回车后，就可以正常使用

![输入密码](https://raw.githubusercontent.com/lixiaofei123/urlproxy/master/lock.png)