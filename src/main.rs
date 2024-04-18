use std::path::Path;
use rocket::http::Status;
use rocket::outcome::Outcome;
use rocket::request;
use rocket::{fs::NamedFile, request::FromRequest, response::stream::ByteStream, Request};
use tokio_util::bytes::Bytes;

#[macro_use]
extern crate rocket;

struct ProxyReq(String,String);

#[rocket::async_trait]
impl<'a> FromRequest<'a> for ProxyReq {
    type Error = ();
    async fn from_request(request: &'a Request<'_>) -> request::Outcome<Self, ()> {
        let proxyurl = request
            .uri()
            .to_string()
            .strip_prefix("/proxy/")
            .unwrap_or("https://www.baidu.com")
            .to_owned();

        let mut host = "".to_owned();
        if let Some(host0) = request.host(){
            host = host0.domain().to_string();
        }

        Outcome::Success(ProxyReq(proxyurl,host))
    }
}

#[rocket::get("/proxy/<_..>")]
async fn handle_proxy(proxyreq: ProxyReq) -> Result<ByteStream![Bytes], (Status, String)> {
    let url = proxyreq.0;
    let host = proxyreq.1;
    if check_domain_is_allowed(&url, &host) {
        let proxy_resp = reqwest::get(&url)
            .await.map_err(|e| (Status::BadRequest, e.to_string()))?;
        let bytes_stream = proxy_resp.bytes_stream();
        Ok(ByteStream! {
            for await bytes in bytes_stream {
                match bytes {
                    Ok(bytes) => yield bytes,
                    Err(e) => {
                        eprintln!("error while streaming: {}", e);
                        break;
                    }
                }
            }
        })
    }else{
       Err((Status::BadRequest, "url is not allowed".to_owned()))
    }
}

#[get("/")]
pub async fn index() -> Option<NamedFile> {
    NamedFile::open(Path::new("index.html")).await.ok()
}

use url::Url;

fn check_domain_is_allowed(proxyurl: &str,host: &str) -> bool {
    if let Ok(proxyurl) = Url::parse(proxyurl) {
        if let Some(domain) = proxyurl.domain(){
            return domain != host;
        }
    }
    false
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, handle_proxy])
}
