# syntax=docker/dockerfile:1.4
FROM --platform=$BUILDPLATFORM python:3.8-alpine AS builder

# Install FFmpeg
# RUN apt-get update && apt-get install -y ffmpeg
RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY requirements.txt /app
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

# COPY . /app

# Build the application
CMD ["flask", "run", "--host=0.0.0.0", "--port=8000", "--debug"]
