#!/bin/sh

if [ -z "$1" ]; then
  echo 'Please select the input device by entering its [index] number:' >&2
  ffmpeg -f avfoundation -list_devices true -i - 2>&1 | grep screen >&2
  read -r INDEX
else
  INDEX=$1
fi

echo 'Starting safaridriver on 127.0.0.1:4444 ...' >&2
safaridriver -p 4444 & pid=$!

# shellcheck disable=SC2064
trap "kill $pid; exit" INT TERM

echo 'Starting mjpeg-server on 127.0.0.1:9000 ...' >&2
mjpeg-server -a 127.0.0.1:9000 -- ffmpeg \
  -loglevel error \
  -probesize 32 \
  -fpsprobesize 0 \
  -analyzeduration 0 \
  -fflags nobuffer \
  -f avfoundation \
  -capture_cursor 1 \
  -r "${FPS:-15}" \
  -pixel_format yuyv422 \
  -i "$INDEX" \
  -f mpjpeg \
  -q "${QUALITY:-2}" \
  -
