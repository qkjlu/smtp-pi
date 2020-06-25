#!/bin/bash

function get_web_page() {
    $options = array(
        CURLOPT_RETURNTRANSFER => true,   // return web page
    );

    $ch = curl_init($1);
    curl_setopt_array($ch, $options);
    $content  = curl_exec($ch);
    curl_close($ch);
    return $content;
}

$response = get_web_page 'http://smtp-prod.eu-west-3.elasticbeanstalk.com/entreprises';
$resArr = array();
$resArr = json_decode($response);
print_r($resArr);


curl --location --request PUT 'http://smtp-prod.eu-west-3.elasticbeanstalk.com/version' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI' \
--header 'Content-Type: text/plain' \
--data-raw '{
    type : "beta",
    version : "1.0.1"
}'
