package com.smtp.smtp;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.HttpHeaderParser;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.material.snackbar.Snackbar;
import com.mapbox.android.core.permissions.PermissionsManager;
import com.mapbox.api.directions.v5.models.DirectionsResponse;
import com.mapbox.api.directions.v5.models.DirectionsRoute;
import com.mapbox.core.constants.Constants;
import com.mapbox.geojson.LineString;
import com.mapbox.geojson.Point;
import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.mapboxsdk.annotations.Marker;
import com.mapbox.mapboxsdk.annotations.MarkerOptions;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.exceptions.InvalidLatLngBoundsException;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;

import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.services.android.navigation.ui.v5.route.NavigationMapRoute;
import com.mapbox.services.android.navigation.v5.navigation.NavigationRoute;



import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;

public class NavigationLauncherActivity extends AppCompatActivity implements OnMapReadyCallback,
        MapboxMap.OnMapLongClickListener, MapboxMap.OnMarkerClickListener {


    private static final int ONE_HUNDRED_MILLISECONDS = 100;

    private String nameChantier;
    private String typeRoute;
    private String idChantier;
    private  String token;
    private static final int CAMERA_ANIMATION_DURATION = 1000;
    private static final int DEFAULT_CAMERA_ZOOM = 16;
    private static final String BASE_URL = "http://smtp-dev-env.eba-5jqrxjhz.eu-west-3.elasticbeanstalk.com/";

    private NavigationMapRoute mapRoute;
    private MapboxMap mapboxMap;


    private final int[] padding = new int[]{50, 50, 50, 50};

    MapView mapView;
    ProgressBar loading;

    private TextView routeInfo;
    private DirectionsRoute route;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Mapbox.getInstance(this.getApplicationContext(), getString(R.string.mapbox_access_token));
        setContentView(R.layout.activity_navigation_launcher);
        
        Intent i = getIntent();
        idChantier = i.getStringExtra("chantierId");
        typeRoute = i.getStringExtra("typeRoute");
        nameChantier = "Chantier : " + i.getStringExtra("nameChantier");
        token = i.getStringExtra("token");

        routeInfo = findViewById(R.id.route_info);
        routeInfo.setText(nameChantier+ "\n" + "Route : " + typeRoute.substring(0, 1).toUpperCase() + typeRoute.substring(1));

        mapView = findViewById(R.id.mapView);
        mapView.onCreate(savedInstanceState);
        mapView.getMapAsync(this);

        loading = findViewById(R.id.loading);

    }

    public JSONObject prepareRouteForSending(){
        JSONArray res = new JSONArray();
        int order = 0;
        for (Marker marker : mapboxMap.getMarkers()) {
            JSONObject json = new JSONObject();
            try {
                json.put("latitude",marker.getPosition().getLatitude());
                json.put("longitude",marker.getPosition().getLongitude());
                json.put("ordre", order);
                res.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            order++;
        }
        try {
            return new JSONObject().put("waypoints",res);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void initRoute(JSONArray array) throws JSONException {
        // Ajoute chaque donnée à la liste de waypoint triable
        List<Waypoint> waypoints = new ArrayList<>();
        for (int i=0; i< array.length(); i++){
            JSONObject waypoint = array.getJSONObject(i);
            waypoints.add(
                    new Waypoint(
                            waypoint.getDouble("longitude"),
                            waypoint.getDouble("latitude"),
                            waypoint.getInt("ordre")
                    )
            );
        }


        // Ajoute les marker à la map
        for (Waypoint w: waypoints ) {
            LatLng point = new LatLng(w.latitude, w.longitude);
            MarkerOptions markerOptions = new MarkerOptions()
                    .position(point);
            mapboxMap.addMarker(markerOptions);
            Snackbar.make(mapView, "Marqueur : "+mapboxMap.getMarkers().size()+"/"+25, Snackbar.LENGTH_LONG).show();
        }

        fetchRoute();
    }

    public void initWaypoints(){
        final String URL = BASE_URL + "chantiers/"+idChantier+"/route/"+typeRoute;
        RequestQueue requestQueue = Volley.newRequestQueue(this);
        // prepare the Request
        JsonArrayRequest getRequest = new JsonArrayRequest(Request.Method.GET, URL, null,
                response -> {
                    // display response
                    try {
                        initRoute(response);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    Log.d("Response", response.toString());
                },
                new Response.ErrorListener()
                {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d("Error.Response", error.toString());
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> params = new HashMap<String, String>();
                params.put("Content-Type", "application/json; charset=UTF-8");
                params.put("Authorization", "Bearer " + token);
                return params;
            }
        } ;

        // add it to the RequestQueue
        requestQueue.add(getRequest);
    }

    public void sendRouteToServer(View view) {
        if(mapboxMap.getMarkers().size() < 2){
            Snackbar.make(mapView, R.string.error_not_enough_waypoints, Snackbar.LENGTH_LONG ).show();
            return;
        }
        JSONObject route = prepareRouteForSending();
        RequestQueue requestQueue = Volley.newRequestQueue(this);
        final String requestBody = route.toString();
        String URL = BASE_URL + "chantiers/"+idChantier+"/route/"+typeRoute;
        StringRequest stringRequest = new StringRequest(Request.Method.PUT, URL, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                Snackbar.make(mapView, "La route a été enregistrée avec succès", Snackbar.LENGTH_LONG ).show();
                Log.i("VOLLEY", response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Snackbar.make(mapView, "Erreur de l'enregistrement de route, veuillez contacter un administrateur", Snackbar.LENGTH_LONG ).show();
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
            //@Override
            //public String getBodyContentType() {
            //    return "application/json; charset=utf-8";
            //}

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

    @Override
    protected void onStart() {
        super.onStart();
        mapView.onStart();
    }

    @Override
    public void onResume() {
        super.onResume();
        mapView.onResume();
    }

    @Override
    public void onPause() {
        super.onPause();
        mapView.onPause();
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        mapView.onLowMemory();
    }

    @Override
    protected void onStop() {
        super.onStop();
        mapView.onStop();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mapView.onDestroy();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        mapView.onSaveInstanceState(outState);
    }

    public void clearRoute(View view) {
        if(mapboxMap.getMarkers().size() == 0){
            mapboxMap.clear();
        }
        mapRoute.removeRoute();
        route = null;
    }

    @Override
    public void onMapReady(MapboxMap mapboxMap) {
        this.mapboxMap = mapboxMap;
        this.mapboxMap.setStyle(Style.SATELLITE_STREETS, style -> {
            this.mapboxMap.setOnMarkerClickListener(this);
            this.mapboxMap.addOnMapLongClickListener(this);
            initMapRoute();
            initWaypoints();
        });

    }

    private void initMapRoute() {
        mapRoute = new NavigationMapRoute(null, mapView, mapboxMap);

    }

    private void fetchRoute() {
        NavigationRoute.Builder builder = NavigationRoute.builder(this)
                .accessToken("pk." + getString(R.string.gh_key))
                .baseUrl(getString(R.string.base_url))
                .user("gh")
                .profile("car");

        if (mapboxMap.getMarkers().size() < 2) {
            Snackbar.make(mapView, R.string.error_not_enough_waypoints, Snackbar.LENGTH_LONG).show();
            return;
        }

        List<Point> wp = new ArrayList<>();
        for(Marker m : mapboxMap.getMarkers()) {
            Point p = Point.fromLngLat(m.getPosition().getLongitude(), m.getPosition().getLatitude());
            wp.add(p);
        }

        for (int i = 0; i < wp.size(); i++) {
            Point p = wp.get(i);
            if (i == 0) {
                builder.origin(p);
            } else if (i < wp.size() - 1) {
                builder.addWaypoint(p);
            } else {
                builder.destination(p);
            }
        }

        showLoading();

        builder.build().getRoute(new Callback<DirectionsResponse>() {
            @Override
            public void onResponse(Call<DirectionsResponse> call, retrofit2.Response<DirectionsResponse> response) {
                if (validRouteResponse(response)) {
                    route = response.body().routes().get(0);
                    mapRoute.addRoutes(response.body().routes());
                    boundCameraToRoute();
                } else {
                    Snackbar.make(mapView, R.string.error_calculating_route, Snackbar.LENGTH_LONG).show();
                }
                hideLoading();
            }

            @Override
            public void onFailure(Call<DirectionsResponse> call, Throwable t) {
                Snackbar.make(mapView, R.string.error_calculating_route, Snackbar.LENGTH_LONG).show();
                hideLoading();
            }
        });
    }

    private boolean validRouteResponse(retrofit2.Response<DirectionsResponse> response) {
        return response.body() != null && !response.body().routes().isEmpty();
    }

    private void hideLoading() {
        if (loading.getVisibility() == View.VISIBLE) {
            loading.setVisibility(View.INVISIBLE);
        }
    }

    private void showLoading() {
        if (loading.getVisibility() == View.INVISIBLE) {
            loading.setVisibility(View.VISIBLE);
        }
    }

    private void boundCameraToRoute() {
        if (route != null) {
            List<Point> routeCoords = LineString.fromPolyline(route.geometry(),
                    Constants.PRECISION_6).coordinates();
            List<LatLng> bboxPoints = new ArrayList<>();
            for (Point point : routeCoords) {
                bboxPoints.add(new LatLng(point.latitude(), point.longitude()));
            }
            if (bboxPoints.size() > 1) {
                try {
                    LatLngBounds bounds = new LatLngBounds.Builder().includes(bboxPoints).build();
                    // left, top, right, bottom
                    animateCameraBbox(bounds, CAMERA_ANIMATION_DURATION, padding);
                } catch (InvalidLatLngBoundsException exception) {
                    Toast.makeText(this, R.string.error_valid_route_not_found, Toast.LENGTH_SHORT).show();
                }
            }
        }
    }

    private void animateCameraBbox(LatLngBounds bounds, int animationTime, int[] padding) {
        CameraPosition position = mapboxMap.getCameraForLatLngBounds(bounds, padding);
        mapboxMap.animateCamera(CameraUpdateFactory.newCameraPosition(position), animationTime);
    }

    @Override
    public boolean onMarkerClick(@NonNull Marker marker) {
        for(Marker m : mapboxMap.getMarkers()) {
            if(m.getId() == marker.getId()){
                mapboxMap.removeMarker(m);
            }
        }
        if(mapboxMap.getMarkers().size() > 1) {
            fetchRoute();
        } else {
            clearRoute(null);
        }
        Snackbar.make(mapView, "Marqueur : "+mapboxMap.getMarkers().size()+"/"+25, Snackbar.LENGTH_LONG).show();
        Log.d("MARKER", Long.toString(marker.getId()));
        return false;
    }

    @Override
    public boolean onMapLongClick(@NonNull LatLng point) {
        vibrate();
        MarkerOptions markerOptions = new MarkerOptions()
                .position(point);
        mapboxMap.addMarker(markerOptions);
        Snackbar.make(mapView, "Marqueur : "+mapboxMap.getMarkers().size()+"/"+25, Snackbar.LENGTH_LONG).show();

        //addPointToRoute(point.getLatitude(), point.getLongitude());
        //updateRouteAfterWaypointChange();
        fetchRoute();
        return true;
    }

    @SuppressLint("MissingPermission")
    private void vibrate() {
        Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator == null) {
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(ONE_HUNDRED_MILLISECONDS, VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
            vibrator.vibrate(ONE_HUNDRED_MILLISECONDS);
        }
    }
}
