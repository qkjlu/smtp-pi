package com.smtp.smtp.http;

import android.content.Context;
import android.util.Log;

import com.android.volley.Request;
import com.android.volley.toolbox.JsonObjectRequest;

import org.json.JSONObject;

import java.util.HashMap;

import java.util.Map;

public abstract class JSONAsyncRequest {
    protected Context ctx;
    protected final String BASE_URL = "http://smtp-dev-env.eba-5jqrxjhz.eu-west-3.elasticbeanstalk.com/";
    protected String token;
    protected JSONAsyncRequest(Context ctx, String token){
        this.ctx = ctx;
        this.token = token;
    }

    protected void get() {
        JsonObjectRequest getRequest = new JsonObjectRequest(Request.Method.GET, getURL(), null,
                response -> {
                    Log.d(getTag(), response.toString());
                    onGetResponse(response);
                },
                error -> {
                    Log.e(getTag(), error.getMessage());
                    onError();
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json; charset=UTF-8");
                params.put("Authorization", "Bearer " + token);
                return params;
            }
        };
        RequestManager.getInstance(ctx).addToRequestQueue(getRequest);
    }
    protected abstract String getTag();
    protected abstract String getURL();
    protected abstract void onGetResponse(JSONObject response);
    protected abstract void onError();
}
