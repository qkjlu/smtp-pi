package com.smtp.smtp.http;

import android.content.Context;

import com.smtp.smtp.http.JSONAsyncRequest;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.function.Consumer;

public class CoefJSONAsyncRequest extends JSONAsyncRequest {
    private Double value;
    private String chantierId;
    private String typeRoute;
    private String day;
    private Consumer<Double> callback;
    public CoefJSONAsyncRequest(Context ctx, String token) {
        super(ctx, token);
    }

    @Override
    protected String getTag() {
        return "CoefAsyncRequest";
    }

    @Override
    protected String getURL() {
        return BASE_URL + "chantiers/" + chantierId + "/route/" + typeRoute + "/coefs";
    }

    @Override
    protected void onGetResponse(JSONObject response) {
        try {
            JSONObject route = response.getJSONObject(typeRoute);
            JSONArray jours = route.getJSONArray("JourSemaines");
            for(int i=0; i<jours.length(); i++){
                JSONObject jour = jours.getJSONObject(i);
                if(jour.getString("nom").equals(day)){
                    JSONObject coef = jour.getJSONObject("Coef");
                    this.value = coef.getDouble("value");
                    callback.accept(this.value);
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onError() {

    }

    public void getByChantierAndTypeRouteAndDay(HashMap<String, String> requestArgs, Consumer<Double> callback){
        this.callback = callback;
        this.chantierId = requestArgs.get("chantierId");
        this.typeRoute = requestArgs.get("typeRoute");
        this.day = requestArgs.get("day");
        super.get();
    }
}
