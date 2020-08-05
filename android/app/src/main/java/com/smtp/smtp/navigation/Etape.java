package com.smtp.smtp.navigation;

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
import java.util.HashMap;
import java.util.Map;

import java.util.UUID;

public class Etape extends AppCompatActivity {
    private static final String BASE_URL = "http://smtp-dev-env.eba-5jqrxjhz.eu-west-3.elasticbeanstalk.com/";
    String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI";
    private String etapeId;
    private long dateDebut;
    private long dateFin;
    private String chantierId;
    private String camionneurId;
    private String type;
    private String etapePrec;
    private Context ctx;

    public Etape(String chantierId, String camionneurId, String type, String etapePrec, Context context){
        this.etapeId = UUID.randomUUID().toString();
        this.dateDebut = System.currentTimeMillis();
        this.chantierId = chantierId;
        this.camionneurId = camionneurId;
        this.type = type;
        this.etapePrec = etapePrec;
        ctx = context;
        sendDebutEtape();
    }

    public void sendDebutEtape(){
        Map<String, Object> send = new HashMap<>();

        send.put("dateDebut",this.dateDebut);
        send.put("id",this.etapeId);
        send.put("ChantierId",this.chantierId);
        send.put("CamionneurId",this.camionneurId);
        send.put("type",this.type);
        send.put("etapePrecId",this.etapePrec);
        JSONObject etape = new JSONObject(send);

        final String requestBody =  etape.toString();
        final String URL = BASE_URL+"etapes";

        Log.d("Etape", requestBody);

        StringRequest stringRequest = new StringRequest(Request.Method.POST, URL, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d("Etape", response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("Etape", error.toString());
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

    public void sendFinEtape(){
        Map<String, Object> send = new HashMap<>();

        send.put("dateFin",System.currentTimeMillis());
        JSONObject etape = new JSONObject(send);

        final String requestBody =  etape.toString();
        final String URL = BASE_URL+"etapes/"+etapeId;

        Log.d("Etape", requestBody);

        StringRequest stringRequest = new StringRequest(Request.Method.PATCH, URL, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.d("Etape", response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("Etape", error.toString());
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

    public String getEtapeId() {
        return etapeId;
    }
}
