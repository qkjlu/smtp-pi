package com.smtp.smtp.navigation;

import android.content.Context;
import android.util.Log;

import com.android.volley.AuthFailureError;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.HttpHeaderParser;
import com.android.volley.toolbox.StringRequest;
import com.smtp.smtp.BuildConfig;
import com.smtp.smtp.http.RequestManager;

import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class Pause {
    String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI";

    private String pauseId;
    private long dateDebut;
    private long dateFin;
    private Context ctx;
    private String etapeId;

    public Pause(String etapeId, Context ctx){
        this.pauseId = UUID.randomUUID().toString();
        this.dateDebut = System.currentTimeMillis();
        this.etapeId = etapeId;
        this.ctx = ctx;
        this.sendDebutPause();
    }

    public void sendDebutPause(){
        Map<String, Object> send = new HashMap<>();

        send.put("dateDebut",this.dateDebut);
        send.put("id",this.pauseId);
        send.put("EtapeId",this.etapeId);
        JSONObject pause = new JSONObject(send);

        final String requestBody =  pause.toString();
        final String URL = BuildConfig.API_URL +"pauses";

        Log.d("Pause", requestBody);

        StringRequest stringRequest = new StringRequest(Request.Method.POST, URL, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {

                Log.d("Pause", "res" + response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("Pause", error.toString());
            }
        }) {
            //This is for Headers If You Needed
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json; charset=UTF-8");
                params.put("Authorization", "Bearer " + token);
                return params;
            }

            @Override
            public byte[] getBody() throws AuthFailureError {
                try {
                    return requestBody == null ? null : requestBody.getBytes("utf-8");
                } catch (UnsupportedEncodingException uee) {
                    VolleyLog.wtf("Unsupported Encoding while trying to get the bytes of %s using %s", requestBody, "utf-8");
                    return null;
                }
            }

            @Override
            protected Response<String> parseNetworkResponse(NetworkResponse response) {
                String responseString = "";
                if (response != null) {
                    responseString = String.valueOf(response.statusCode);
                    // can get more details such as response.headers
                }
                return Response.success(responseString, HttpHeaderParser.parseCacheHeaders(response));
            }
        };
        RequestManager.getInstance(ctx).addToRequestQueue(stringRequest);
    }

    public void sendFinPause(){
        Map<String, Object> send = new HashMap<>();
        this.dateFin = System.currentTimeMillis();
        send.put("dateFin",this.dateFin);
        JSONObject pause = new JSONObject(send);

        final String requestBody =  pause.toString();
        final String URL = BuildConfig.API_URL +"pauses/"+ this.pauseId;

        Log.d("Pause", requestBody);

        StringRequest stringRequest = new StringRequest(Request.Method.PATCH, URL, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d("Pause", response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("Pause", error.toString());
            }
        }) {
            //This is for Headers If You Needed
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json; charset=UTF-8");
                params.put("Authorization", "Bearer " + token);
                return params;
            }

            @Override
            public byte[] getBody() throws AuthFailureError {
                try {
                    return requestBody == null ? null : requestBody.getBytes("utf-8");
                } catch (UnsupportedEncodingException uee) {
                    VolleyLog.wtf("Unsupported Encoding while trying to get the bytes of %s using %s", requestBody, "utf-8");
                    return null;
                }
            }

            @Override
            protected Response<String> parseNetworkResponse(NetworkResponse response) {
                String responseString = "";
                if (response != null) {
                    responseString = String.valueOf(response.statusCode);
                    // can get more details such as response.headers
                }
                return Response.success(responseString, HttpHeaderParser.parseCacheHeaders(response));
            }
        };
        RequestManager.getInstance(ctx).addToRequestQueue(stringRequest);;
    }
}
