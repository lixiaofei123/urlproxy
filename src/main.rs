use std::path::Path;
use rocket::http::Status;
use rocket::outcome::Outcome;
use rocket::request;
use rocket::{fs::NamedFile, request::FromRequest, response::stream::ByteStream, Request};
use tokio_util::bytes::Bytes;

#[macro_use]
extern crate rocket;

#[macro_use]
extern crate lazy_static;

lazy_static! {
    static ref DOMAIN: String = {
        let domain: String =
            std::env::var("DOMAIN").expect("DOMAIN must be set in the environment variable");
        domain
    };
}

struct ProxyUrl(String);

#[rocket::async_trait]
impl<'a> FromRequest<'a> for ProxyUrl {
    type Error = ();
    async fn from_request(request: &'a Request<'_>) -> request::Outcome<Self, ()> {
        let proxyurl = request
            .uri()
            .to_string()
            .strip_prefix("/proxy/")
            .unwrap_or("https://www.baidu.com")
            .to_owned();
        Outcome::Success(ProxyUrl(proxyurl))
    }
}

#[rocket::get("/proxy/<_..>")]
async fn handle_proxy(proxyurl: ProxyUrl) -> Result<ByteStream![Bytes], (Status, String)> {
    let url = proxyurl.0;
    if check_domain_is_allowed(&url) {
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

fn check_domain_is_allowed(proxyurl: &str) -> bool {
    if let Ok(proxyurl) = Url::parse(proxyurl) {
        if let Ok(domain) = Url::parse(DOMAIN.as_str()) {
            return proxyurl.domain() != domain.domain();
        }
    }
    false
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, handle_proxy])
}
