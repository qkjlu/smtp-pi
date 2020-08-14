package com.smtp.smtp;

import android.content.Context;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.AuthFailureError;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.HttpHeaderParser;
import com.android.volley.toolbox.StringRequest;
import com.smtp.smtp.http.RequestManager;

import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class Sortie  extends AppCompatActivity {
    private static final String BASE_URL = "http://smtp-dev-env.eba-5jqrxjhz.eu-west-3.elasticbeanstalk.com/";
    String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI";
    private String sortieId;
    private long dateDebut;
    private long dateFin;
    private String chantierId;
    private String typeRoute;
    private String camionneurId;
    private Context ctx;
    private int ordre = 0;

    public Sortie(String chantierId, String camionneurId, String typeRoute, Context context){
        this.sortieId = UUID.randomUUID().toString();
        this.dateDebut = System.currentTimeMillis();
        this.chantierId = chantierId;
        this.typeRoute = typeRoute;
        this.camionneurId = camionneurId;
        ctx = context;
        sendDebutSortie();
    }

    public void addWaypoint(Double lon, Double lat){
        Map<String, Object> send = new HashMap<>();
        send.put("longitude",lon);
        send.put("latitude",lat);
        send.put("SortieId",this.sortieId);
        send.put("ordre",this.ordre);
        send.put("ouvert",0);
        JSONObject sortie = new JSONObject(send);
        ordre++;
        final String requestBody =  sortie.toString();
        final String URL = BASE_URL+"sorties/point";
        Log.d("Sortie", requestBody);

        StringRequest stringRequest = new StringRequest(Request.Method.POST, URL, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d("Sortie", response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("Sortie", error.toString());
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

    public void sendDebutSortie(){
        Map<String, Object> send = new HashMap<>();

        send.put("dateDebut",this.dateDebut);
        send.put("id",this.sortieId);
        send.put("ChantierId",this.chantierId);
        send.put("CamionneurId",this.camionneurId);
        send.put("type",this.typeRoute);
        JSONObject sortie = new JSONObject(send);

        final String requestBody =  sortie.toString();
        final String URL = BASE_URL+"sorties";

        Log.d("Sortie", requestBody);

        StringRequest stringRequest = new StringRequest(Request.Method.POST, URL, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d("Sortie", response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("Sortie", error.toString());
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

    public void sendFinSortie(){
        Map<String, Object> send = new HashMap<>();

        send.put("dateFin",System.currentTimeMillis());
        JSONObject sortie = new JSONObject(send);

        final String requestBody =  sortie.toString();
        final String URL = BASE_URL+"sorties/"+sortieId;

        Log.d("Sortie", requestBody);

        StringRequest stringRequest = new StringRequest(Request.Method.PATCH, URL, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d("Sortie", response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("Sortie", error.toString());
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

    public String getSortieId() {
        return sortieId;
    }
}
