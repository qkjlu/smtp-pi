package com.smtp.smtp;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
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
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.material.snackbar.Snackbar;
import com.mapbox.api.directions.v5.models.DirectionsResponse;
import com.mapbox.api.directions.v5.models.DirectionsRoute;
import com.mapbox.core.constants.Constants;
import com.mapbox.geojson.LineString;
import com.mapbox.geojson.Point;
import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.mapboxsdk.annotations.Icon;
import com.mapbox.mapboxsdk.annotations.IconFactory;
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
import com.mapbox.mapboxsdk.style.light.Position;
import com.mapbox.services.android.navigation.ui.v5.route.NavigationMapRoute;
import com.mapbox.services.android.navigation.v5.navigation.NavigationRoute;



import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;

public class NavigationLauncherActivity extends AppCompatActivity implements OnMapReadyCallback,
        MapboxMap.OnMapLongClickListener, MapboxMap.OnMarkerClickListener {


    private static final int ONE_HUNDRED_MILLISECONDS = 100;

    private Point ORIGIN;
    private Point DESTINATION;
    private static final String TAG = "Navigation";

    private String nameChantier;
    private String typeRoute;
    private String chantierId;
    private int rayonChargement;
    private int rayonDéchargement;
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
        chantierId = i.getStringExtra("chantierId");
        typeRoute = i.getStringExtra("typeRoute");
        nameChantier = "Chantier : " + i.getStringExtra("nameChantier");
        token = i.getStringExtra("token");

        double[] origin = i.getDoubleArrayExtra("origin");
        double[] destination = i.getDoubleArrayExtra("destination");

        ORIGIN = Point.fromLngLat(origin[0], origin[1]);
        DESTINATION = Point.fromLngLat(destination[0], destination[1]);

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
                if(!isOriginOrDestination(marker)){
                    json.put("latitude",marker.getPosition().getLatitude());
                    json.put("longitude",marker.getPosition().getLongitude());
                    json.put("ordre", order);
                    res.put(json);
                }
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
        Collections.sort(waypoints);

        // Ajoute les marker à la map
        int i = 0;
        for (Waypoint w: waypoints ) {
            i+=1;
            LatLng point = new LatLng(w.latitude, w.longitude);
            MarkerOptions markerOptions = new MarkerOptions()
                    .position(point)
                    .icon(getMyIcon(i));
            mapboxMap.addMarker(markerOptions);
            Snackbar.make(mapView, "Marqueur : "+mapboxMap.getMarkers().size()+"/"+25, Snackbar.LENGTH_LONG).show();
        }
        fetchRoute();
    }

    public Icon getMyIcon(int i){
        IconFactory iconFactory = IconFactory.getInstance(getApplicationContext());
        switch (i){
            case 1 :
                return iconFactory.fromResource(R.drawable.marker1);
            case 2 :
                return iconFactory.fromResource(R.drawable.marker2);
            case 3 :
                return iconFactory.fromResource(R.drawable.marker3);
            case 4 :
                return iconFactory.fromResource(R.drawable.marker4);
            case 5 :
                return iconFactory.fromResource(R.drawable.marker5);
            case 6 :
                return iconFactory.fromResource(R.drawable.marker6);
            case 7 :
                return iconFactory.fromResource(R.drawable.marker7);
            case 8 :
                return iconFactory.fromResource(R.drawable.marker8);
            case 9 :
                return iconFactory.fromResource(R.drawable.marker9);
        }
        return iconFactory.fromResource(R.drawable.marker9);
    }

    public void initWaypoints(){
        final String URL = BASE_URL + "chantiers/"+chantierId+"/route/"+typeRoute;
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
        if(mapboxMap.getMarkers().size() < 4){
            Snackbar.make(mapView, R.string.error_not_enough_waypoints, Snackbar.LENGTH_LONG ).show();
            return;
        }
        JSONObject route = prepareRouteForSending();
        RequestQueue requestQueue = Volley.newRequestQueue(this);
        final String requestBody = route.toString();
        String URL = BASE_URL + "chantiers/"+chantierId+"/route/"+typeRoute;
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
        this.mapboxMap.setStyle(Style.TRAFFIC_DAY, style -> {
            this.mapboxMap.setOnMarkerClickListener(this);
            this.mapboxMap.addOnMapLongClickListener(this);
            initMapRoute();
            initWaypoints();
            initLieux();
            fetchRayon();
            boundCameraToRoute();
        });
    }

    private float getDistance(MarkerOptions marker, Point lieu){
        float[] distanceFromDestination = new float[3];
        Location.distanceBetween(
                marker.getPosition().getLatitude(),
                marker.getPosition().getLongitude(),
                lieu.latitude(),
                lieu.longitude(),
                distanceFromDestination
        );
        return distanceFromDestination[0];
    }

    private void initLieux(){
        //IconFactory iconFactory = IconFactory.getInstance(getApplicationContext());
        //Icon icon = iconFactory.fromResource(R.drawable.icon_chargement);
        //Icon icon2 = iconFactory.fromResource(R.drawable.icon_dechargement);

        this.mapboxMap.addMarker(new MarkerOptions().title("Chargement")
                .position(new LatLng(ORIGIN.latitude(), ORIGIN.longitude()))
        );

        this.mapboxMap.addMarker(new MarkerOptions().title("Déchargement")
                .position(new LatLng(DESTINATION.latitude(), DESTINATION.longitude()))
        );
    }

    private void initMapRoute() {
        mapRoute = new NavigationMapRoute(null, mapView, mapboxMap);
    }

    private boolean isOriginOrDestination(Marker m){
        boolean isOrigin =   m.getPosition().getLongitude() == ORIGIN.longitude() && m.getPosition().getLatitude() == ORIGIN.latitude();
        boolean isDestination  =   m.getPosition().getLongitude() == DESTINATION.longitude() && m.getPosition().getLatitude() == DESTINATION.latitude();
        return (isOrigin || isDestination);
    }

    private void fetchRoute() {
        NavigationRoute.Builder builder = NavigationRoute.builder(this)
                .accessToken("pk." + getString(R.string.gh_key))
                .baseUrl(getString(R.string.base_url))
                .user("gh")
                .profile("car");

        if (mapboxMap.getMarkers().size() < 4) {
            Snackbar.make(mapView, R.string.error_not_enough_waypoints, Snackbar.LENGTH_LONG).show();
            return;
        }

        List<Point> wp = new ArrayList<>();
        for(Marker m : mapboxMap.getMarkers()) {
            if(!isOriginOrDestination(m)){
                Point p = Point.fromLngLat(m.getPosition().getLongitude(), m.getPosition().getLatitude());
                wp.add(p);
            }
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
                    //boundCameraToRoute();
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
        CameraPosition position = new CameraPosition.Builder()
                .target(new LatLng((ORIGIN.latitude()+DESTINATION.latitude())/2, (ORIGIN.longitude()+DESTINATION.longitude())/2 ))
                .zoom(12)
                .tilt(20)
                .build();
        mapboxMap.setCameraPosition(position);
    }

    private void animateCameraBbox(LatLngBounds bounds, int animationTime, int[] padding) {
        CameraPosition position = mapboxMap.getCameraForLatLngBounds(bounds, padding);
        mapboxMap.animateCamera(CameraUpdateFactory.newCameraPosition(position), animationTime);
    }

    @Override
    public boolean onMarkerClick(@NonNull Marker marker) {
        for(Marker m : mapboxMap.getMarkers()) {
            if(m.getId() == marker.getId()){
                if(!isOriginOrDestination(m)){
                    mapboxMap.removeMarker(m);
                }
            }
        }
        if(mapboxMap.getMarkers().size() > 3) {
            fetchRoute();
        } else {
            clearRoute(null);
        }
        Snackbar.make(mapView, "Marqueur : "+(mapboxMap.getMarkers().size()-2)+"/"+25, Snackbar.LENGTH_LONG).show();
        Log.d("MARKER", Long.toString(marker.getId()));
        return false;
    }

    @Override
    public boolean onMapLongClick(@NonNull LatLng point) {
        vibrate();
        MarkerOptions markerOptions = new MarkerOptions()
                .position(point)
                .icon(getMyIcon(mapboxMap.getMarkers().size()-1));
        if(getDistance(markerOptions,ORIGIN)< rayonChargement ){
            Snackbar.make(mapView, "Le marqueur ne peut pas être dans le rayon de chargement"+getDistance(markerOptions,ORIGIN)+"<"+rayonChargement, Snackbar.LENGTH_LONG).show();
        }else if (getDistance(markerOptions,DESTINATION)< rayonDéchargement) {
            Snackbar.make(mapView, "Le marqueur ne peut pas être dans le rayon de déchargement"+getDistance(markerOptions,DESTINATION)+"<"+rayonDéchargement, Snackbar.LENGTH_LONG).show();
        }else{
            mapboxMap.addMarker(markerOptions);
            Snackbar.make(mapView, "Marqueur : "+(mapboxMap.getMarkers().size()-2)+"/"+23, Snackbar.LENGTH_LONG).show();
        }
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

    private void fetchRayon() {
        final String URL = BASE_URL + "chantiers/" + chantierId;
        JsonObjectRequest getRequest = new JsonObjectRequest(Request.Method.GET, URL, null,
                response -> {
                    try {
                        rayonDéchargement = response.getJSONObject("lieuDéchargement").getInt("rayon");
                        rayonChargement = response.getJSONObject("lieuChargement").getInt("rayon");
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    Log.d(TAG, response.toString());
                },
                new com.android.volley.Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d(TAG, error.toString() + error.networkResponse);
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
        };
        RequestManager.getInstance(this).getRequestQueue().add(getRequest);
    }
}
