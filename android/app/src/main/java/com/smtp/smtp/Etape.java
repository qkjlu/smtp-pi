package com.smtp.smtp;

import android.content.Context;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.AuthFailureError;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.HttpHeaderParser;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.material.snackbar.Snackbar;

import org.json.JSONObject;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.sql.Timestamp;

import java.util.UUID;

public class Etape extends AppCompatActivity {
    private static final String BASE_URL = "http://smtp-dev-env.eba-5jqrxjhz.eu-west-3.elasticbeanstalk.com/";
    String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYTg0YmM3LTlmNDMtNDAxZS04ZjAyLTQ3ZTAyZDc4NDQ2OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU4NzQxODQ0MX0.zRTuqPl0UbiwJn7zZSxErvBYhkhPibEZ51S4Aqgd6LI";
    private UUID etapeId;
    private Timestamp dateDebut;
    private Timestamp finDebut;
    private UUID chantierId;
    private UUID camionneurId;
    private String typeEtape;
    private Timestamp debutManoeuvre;
    private Timestamp finManoeuvre;
    private UUID etapePrecId;
    private UUID etapeSuivId;

    public Etape(UUID chantierId, UUID camionneurId, String typeEtape, UUID etapePrecId){
        this.etapeId = UUID.randomUUID();
        this.dateDebut = new Timestamp(System.currentTimeMillis());
        this.chantierId = chantierId;
        this.camionneurId = camionneurId;
        this.typeEtape = typeEtape;
        this.etapePrecId = etapePrecId;
    }

    public void sendEtape(){
        finManoeuvre = new Timestamp(System.currentTimeMillis());
        JSONObject etape = new JSONObject((Map) this);
        RequestQueue requestQueue = Volley.newRequestQueue(this);
        final String requestBody =  etape.toString();
        final String URL = BASE_URL+"etapes";
        StringRequest stringRequest = new StringRequest(Request.Method.POST, URL, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Log.i("VOLLEY", response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.e("VOLLEY", error.toString());
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
        requestQueue.add(stringRequest);
    }

    public UUID getEtapeId() {
        return etapeId;
    }
}
