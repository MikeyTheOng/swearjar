FROM golang:1.22.5-bullseye AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o backend ./cmd

FROM gcr.io/distroless/base-debian10
WORKDIR /app/cmd
COPY --from=builder /app/backend .
EXPOSE 8080
CMD ["./backend"]