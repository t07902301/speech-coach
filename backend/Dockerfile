# syntax=docker/dockerfile:1.4
FROM --platform=$BUILDPLATFORM python:3.12.3 AS builder

RUN mkdir /backend
WORKDIR /backend
COPY requirements.txt /backend/requirements.txt
RUN pip install --upgrade pip && \
    pip install -r requirements.txt
COPY . .
EXPOSE 5000