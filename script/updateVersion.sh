#!/bin/bash

curl --location --request PUT 'http://localhost:3000/versions/' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlYzAwNjY1LWY5ZmQtNGUzMC1hZTJlLTVlNTRjZjYzOGEzOCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU5MzE2MTIzOH0.lUThLcFttP_dCLV_ZgPgQM-8zcNaF5I4_8Fs3gDvSg0' \
--header 'Content-Type: application/json' \
--data-raw '{
    "type" : "beta",
    "numero" : "1.0.7"
}'
