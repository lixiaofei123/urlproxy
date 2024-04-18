FROM rust:1.77.2-buster as builer
WORKDIR /usr/src/code
COPY ./Cargo_base.toml ./Cargo.toml
COPY ./Cargo.lock .
RUN mkdir ./src && echo 'fn main() { println!("Dummy!"); }' > ./src/main.rs
RUN cargo build --release
RUN rm -rf ./src
RUN rm -rf ./target/release
COPY ./Cargo.toml ./Cargo.toml
COPY ./src ./src
RUN cargo build --release


FROM debian:bullseye-slim
RUN apt-get update && apt install openssl curl -y && rm -rf /var/lib/apt/lists/*
COPY --from=builer /usr/src/code/target/release/urlproxy /opt/urlproxy/urlproxy
COPY index.html /opt/urlproxy/index.html 
COPY Rocket.toml /opt/urlproxy/Rocket.toml
WORKDIR /opt/urlproxy
EXPOSE 8000
ENTRYPOINT ["./urlproxy"]