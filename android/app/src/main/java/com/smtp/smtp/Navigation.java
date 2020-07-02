package com.smtp.smtp;

import android.annotation.SuppressLint;
import android.app.Application;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Color;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.os.Process;
import android.util.Log;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.android.material.snackbar.Snackbar;
import com.mapbox.android.core.permissions.PermissionsListener;
import com.mapbox.android.core.permissions.PermissionsManager;
import com.mapbox.api.directions.v5.MapboxDirections;
import com.mapbox.api.directions.v5.models.DirectionsResponse;
import com.mapbox.api.directions.v5.models.DirectionsRoute;
import com.mapbox.geojson.Point;

import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.mapboxsdk.annotations.Icon;
import com.mapbox.mapboxsdk.annotations.IconFactory;
import com.mapbox.mapboxsdk.annotations.MarkerOptions;
import com.mapbox.mapboxsdk.annotations.PolygonOptions;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.services.android.navigation.ui.v5.NavigationLauncherOptions;
import com.mapbox.services.android.navigation.ui.v5.NavigationView;
import com.mapbox.services.android.navigation.ui.v5.NavigationViewOptions;
import com.mapbox.services.android.navigation.ui.v5.OnNavigationReadyCallback;
import com.mapbox.services.android.navigation.ui.v5.listeners.NavigationListener;
import com.mapbox.services.android.navigation.ui.v5.map.NavigationMapboxMap;
import com.mapbox.services.android.navigation.v5.navigation.MapboxNavigation;
import com.mapbox.services.android.navigation.v5.navigation.MapboxNavigationOptions;
import com.mapbox.services.android.navigation.v5.navigation.NavigationRoute;
import com.mapbox.services.android.navigation.v5.navigation.camera.Camera;
import com.mapbox.services.android.navigation.v5.navigation.camera.RouteInformation;
import com.mapbox.services.android.navigation.v5.offroute.OffRoute;
import com.mapbox.services.android.navigation.v5.routeprogress.ProgressChangeListener;
import com.mapbox.services.android.navigation.v5.routeprogress.RouteProgress;
import com.mapbox.services.android.navigation.v5.routeprogress.RouteProgressState;
import com.mapbox.services.android.navigation.v5.utils.RouteUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

@SuppressLint("MissingPermission")
public class Navigation extends AppCompatActivity implements NavigationListener, OnNavigationReadyCallback, ProgressChangeListener {

    private NavigationView navigationView;
    private TextView timeDiffTextView;
    private DirectionsRoute route;
    private final boolean SHOULD_SIMULATE = false;
    private final int INITIAL_ZOOM = 18;
    private final double INITIAL_TILT = 30;
    private final int DISTANCE_TOLERANCE = 500;
    private static final String TAG = "Navigation";
    private OffRoute neverOffRouteEngine = new OffRoute() {
        @Override
        public boolean isUserOffRoute(Location location, RouteProgress routeProgress, MapboxNavigationOptions options) {
            // User will never be off-route
            return false;
        }
    };

    private Point ORIGIN;
    private Point DESTINATION;

    private String userId;
    private String chantierId;
    private String typeRoute;
    private String token;
    private JSONObject coordinates;
    private double remainingTime;
    private double timeDiffTruckAhead = Double.POSITIVE_INFINITY;
    private String myEtat;
    private Etape etape = null;
    private String etapeIdPrecedente = null;
    private int rayonChargement;
    private int rayonDéchargement;
    private WaypointFilter filter;
    private FusedLocationProviderClient fusedLocationClient;
    private Socket mSocket;
    private boolean connectedToChantier = false;
    private static final String BASE_URL = "http://smtp-dev-env.eba-5jqrxjhz.eu-west-3.elasticbeanstalk.com/";
    private ArrayList<Point> roadPoint = new ArrayList();
    private Location location;
    private int remainingWaypoints = -1;

    // Connection to the socket server
    {
        try {
            mSocket = IO.socket(BuildConfig.API_URL);
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    // Declaring our custom UnhandledExceptionHandler : it send a disconnection event to the socket server
    private CustomUEH UEH = new CustomUEH(new Runnable() {
        @Override
        public void run() {
            disconnectFromChantier();
        }
    });

    public boolean isMyUserId(String userId) {
        return userId.equals(this.userId);
    }

    class User {
        public String userId;
        public Double ETA;
        public String etat;

        public User(String userId, Double ETA, String etat) {
            this.userId = userId;
            this.ETA = ETA;
            this.etat = etat;
        }

        public Double getETA() {
            return ETA;
        }

        public String getUserId() {
            return userId;
        }

        public String getEtat() {
            return etat;
        }


        @Override
        public String toString() {
            return "User{ moi ?" + isMyUserId(this.userId) + ", ETA=" + ETA + ", etat='" + etat + '}';
        }
    }

    class EtaSorter implements Comparator<User> {
        @Override
        public int compare(User o1, User o2) {
            return (int) (o1.getETA() - o2.getETA());
        }
    }

    public class ListUser {
        public ArrayList<User> list;

        public ListUser() {
            this.list = new ArrayList<>();
        }

        public boolean isAddable(User user) {
            return user.getEtat().equals(myEtat);
        }

        public int addList(User user) {
            if (isAddable(user) && !isContainedUser(user.getUserId())) {
                list.add(user);
                Collections.sort(list, new EtaSorter());
                return 1;
            } else {
                return -1;
            }
        }

        public boolean isContainedUser(String userId) {
            boolean res = false;
            for (int i = 0; i < list.size(); i++) {
                if (list.get(i).getUserId().equals(userId)) {
                    res = true;
                }
            }
            return res;
        }

        public void updateMyIndice(String userId) {
            for (int i = 0; i < list.size(); i++) {
                if (isMyUserId(list.get(i).getUserId())) {
                    myIndice = i;
                    Log.d(TAG, "changement indice : " + myIndice);
                }
            }
        }

        public boolean sameEtat(User user) {
            return user.getEtat().equals(myEtat);
        }

        public void updateList(User user) {
            if (!sameEtat(user)) {
                this.deleteUser(user.getUserId());
            } else {
                for (int i = 0; i < list.size(); i++) {
                    if (list.get(i).getUserId().equals(user.getUserId())) {
                        list.get(i).ETA = user.getETA();
                    }
                }
            }
            Collections.sort(list, new EtaSorter());
        }

        public void deleteUser(String userId) {
            int res = -1;
            for (int i = 0; i < list.size(); i++) {
                if (list.get(i).getUserId().equals(userId)) {
                    res = i;
                }
            }
            list.remove(res);
            Collections.sort(list, new EtaSorter());
        }
    }

    private ListUser myList = new ListUser();
    private int myIndice;


    @SuppressLint("MissingPermission")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "OnCreate");

        Thread.setDefaultUncaughtExceptionHandler(UEH);

        Intent i = getIntent();
        double[] origin = i.getDoubleArrayExtra("origin");
        double[] destination = i.getDoubleArrayExtra("destination");

        ORIGIN = Point.fromLngLat(origin[0], origin[1]);
        DESTINATION = Point.fromLngLat(destination[0], destination[1]);
        userId = i.getStringExtra("userId");
        chantierId = i.getStringExtra("chantierId");
        typeRoute = i.getStringExtra("typeRoute");
        token = i.getStringExtra("token");
        myEtat = i.getStringExtra("myEtat");
        myList.addList(new User(userId, Double.POSITIVE_INFINITY, myEtat));

        Mapbox.getInstance(this, getString(R.string.mapbox_access_token));

        setContentView(R.layout.activity_main);
        navigationView = findViewById(R.id.navigationView);
        timeDiffTextView = findViewById(R.id.timeDiffTextView);

        // Retrieving user location
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        Task<Location> gettingLocation = fusedLocationClient.getLastLocation();
        while(!gettingLocation.isSuccessful()) {}
        location = gettingLocation.getResult();

        CameraPosition initialPosition = new CameraPosition.Builder()
                .target(new LatLng(location.getLatitude(), location.getLongitude()))
                .zoom(INITIAL_ZOOM)
                .build();
        navigationView.onCreate(savedInstanceState);
        navigationView.initialize(this, initialPosition);

        mSocket.on("chantier/user/sentCoordinates", onUserSentCoordinates);
        mSocket.on("chantier/connect/success", onConnectToChantierSuccess);
        mSocket.on("chantier/user/disconnected", onUserDisconnected);
        mSocket.connect();
        connectToChantier();

    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "OnDestroy");

        disconnectFromChantier();
        mSocket.disconnect();

        mSocket.off("chantier/user/sentCoordinates", onUserSentCoordinates);
        mSocket.off("chantier/connect/success", onConnectToChantierSuccess);
        mSocket.off("chantier/user/disconnected", onUserDisconnected);
        navigationView.onDestroy();
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.d(TAG, "OnStop");
        navigationView.onStop();
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "OnPause");
        navigationView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "OnResume");
        navigationView.onResume();
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d(TAG, "OnStart");
        navigationView.onStart();
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        Log.d(TAG, "OnRestart");
        //navigationView.onResume();
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        Log.d(TAG, "OnSaveInstanceState");
    }

    @Override
    public void onCancelNavigation() {
        Log.d(TAG, "OnCancelNavigation");
        disconnectFromChantier();
        this.finish();
    }

    @Override
    public void onNavigationFinished() {
        Log.d(TAG, "OnNavigationFinished");
    }

    @Override
    public void onNavigationRunning() {

    }

    @Override
    public void onNavigationReady(boolean isRunning) {
        Log.d(TAG, "OnNavigationReady");

        fetchRayon();
        fetchRoute();
        modifyTimeDiffTruckAheadIfNecessary();

        IconFactory iconFactory = IconFactory.getInstance(getApplicationContext());
        Icon icon = iconFactory.fromResource(R.drawable.icon_chargement);
        Icon icon2 = iconFactory.fromResource(R.drawable.icon_dechargement);

        navigationView.retrieveNavigationMapboxMap().retrieveMap().addMarker(new MarkerOptions().title("Chargement")
                .position(new LatLng(ORIGIN.latitude(), ORIGIN.longitude()))
                .icon(icon)
        );

        navigationView.retrieveNavigationMapboxMap().retrieveMap().addMarker(new MarkerOptions().title("Déchargement")
                .position(new LatLng(DESTINATION.latitude(), DESTINATION.longitude()))
                .icon(icon2)
        );

        //navigationView.retrieveMapboxNavigation().setOffRouteEngine(neverOffRouteEngine);
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

    private float getDistanceFromDestination(Location location) {
        float[] distanceFromDestination = new float[3];
        Point destination = null;
        if (myEtat.equals("chargé") || myEtat.equals("enDéchargement")) {
            destination = DESTINATION;
        }
        if (myEtat.equals("déchargé") || myEtat.equals("enChargement")) {
            destination = ORIGIN;
        }
        if (destination == null) {
            throw new Error("getDistanceFromDestination: destination cannot be null");
        }
        Location.distanceBetween(
                location.getLatitude(),
                location.getLongitude(),
                destination.latitude(),
                destination.longitude(),
                distanceFromDestination
        );
        return distanceFromDestination[0];
    }

    @Override
    public void onProgressChange(Location location, RouteProgress routeProgress) {
        boolean didEtatChanged;
        float distanceFromDestination = getDistanceFromDestination(location);
        this.location = location;
        remainingTime = routeProgress.durationRemaining();
        didEtatChanged = changeMyEtatIfNecessary(distanceFromDestination);
        if (rerouteUserIfNecessary(didEtatChanged)) {
            return;
        }
        modifyTimeDiffTruckAheadIfNecessary();

        //Register remaining waypoints in SharedPreferences
        if(remainingWaypoints != routeProgress.remainingWaypoints()) {
            remainingWaypoints = routeProgress.remainingWaypoints();
            SharedPreferences sharedPref = getPreferences(MODE_PRIVATE);
            SharedPreferences.Editor editor = sharedPref.edit();
            editor.putInt("remainingWaypoints", remainingWaypoints);
            editor.apply();
        }

        //Remove waypoints from SharedPreferences if user has arrived
        if(routeProgress.currentState() != null
                && routeProgress.currentState().equals(RouteProgressState.ROUTE_ARRIVED)
                && remainingWaypoints == 1){
            Log.d(TAG, "Arrived!");
            removeRemainingWaypointsFromSharedPreferences();
        }

        //For debug purpose
        RouteUtils routeUtils = new RouteUtils();
        List<Point> remaininPoints = routeUtils.calculateRemainingWaypoints(routeProgress);
        Log.d(TAG, Integer.toString(remainingWaypoints));
        for (Point p: remaininPoints
             ) {
            Log.d(TAG, p.toString());
        }

        coordinates = new JSONObject();
        try {
            coordinates.put("longitude", location.getLongitude());
            coordinates.put("latitude", location.getLatitude());
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }

        if (connectedToChantier) {
            sendCoordinates();
            myList.updateList(new User(userId, remainingTime, myEtat));
        }
    }

    public void prepareRoute(JSONArray array) throws JSONException {
        // Ajoute chaque donnée à la liste de waypoint
        List<Waypoint> initialWaypoints = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) {
            JSONObject waypoint = array.getJSONObject(i);
            initialWaypoints.add(
                    new Waypoint(
                            waypoint.getDouble("longitude"),
                            waypoint.getDouble("latitude"),
                            waypoint.getInt("ordre")
                    )
            );
        }

        filter = new WaypointFilter(
                initialWaypoints,
                location,
                DISTANCE_TOLERANCE,
                getRemainingWaypointsFromSharedPreferences(initialWaypoints)
        );

        initialWaypoints = filter.cleanWaypoints();

        Collections.sort(initialWaypoints);

        for (Waypoint wp:
             initialWaypoints) {
            Log.d(TAG, "Cleaned waypoints: " + wp.toString());
        }

        ArrayList<Point> points = new ArrayList<>();
        points.add(Point.fromLngLat(location.getLongitude(), location.getLatitude()));
        for (Waypoint waypoint : initialWaypoints) {
            points.add(waypoint.getPoint());
        }
        roadPoint = points;
    }

    public List<Waypoint> getRemainingWaypointsFromSharedPreferences(List<Waypoint> initialWaypointList){
        SharedPreferences sharedPref = getPreferences(MODE_PRIVATE);
        int nbRemainingWp = sharedPref.getInt("remainingWaypoints", -1);
        if (nbRemainingWp == -1) {
            return initialWaypointList;
        }
        List<Waypoint> res = initialWaypointList.subList(initialWaypointList.size()-nbRemainingWp, initialWaypointList.size());
        return res;
    }

    private void fetchRoute() {
        if (myEtat.equals("chargé") || myEtat.equals("enDéchargement")) {
            typeRoute = "aller";
        }
        if (myEtat.equals("déchargé") || myEtat.equals("enChargement")) {
            typeRoute = "retour";
        }
        initWaypoints();
    }

    private void buildRoute() {
        /*MapboxDirections.Builder b = MapboxDirections.builder()
                .baseUrl("https://router.project-osrm.org/route/v1/")
                .origin(roadPoint.get(0))
                .destination(roadPoint.get(roadPoint.size() - 1));
        if (roadPoint.size() > 2) {
            for (int i = 1; i < roadPoint.size() - 1; i++) {
                b.addWaypoint(roadPoint.get(i));
            }
        }*/

        NavigationRoute.Builder builder = NavigationRoute.builder(this)
                .accessToken("pk." + getString(R.string.gh_key))
                //.accessToken(getString(R.string.mapbox_access_token))
                .baseUrl(getString(R.string.base_url))
                //.baseUrl("https://router.project-osrm.org/route/v1/")
                .user("gh")
                .origin(roadPoint.get(0))
                .destination(roadPoint.get(roadPoint.size() - 1))
                .profile("driving-traffic");
        // add waypoints without first and last point
        if (roadPoint.size() > 2) {
            for (int i = 1; i < roadPoint.size() - 1; i++) {
                builder.addWaypoint(roadPoint.get(i));
            }
        }
        NavigationRoute navRoute = builder.build();

        navRoute.getRoute(
                new Callback<DirectionsResponse>() {
                    @Override
                    public void onResponse(Call<DirectionsResponse> call, Response<DirectionsResponse> response) {
                        Log.d(TAG, call.request().url().toString());
                        Log.d(TAG, response.message());
                        if (validRouteResponse(response)) {
                            route = response.body().routes().get(0);
                            launchNavigation();
                        } else {
                            Snackbar.make(navigationView, "Erreur au calcul de la route", Snackbar.LENGTH_LONG).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<DirectionsResponse> call, Throwable throwable) {
                        Snackbar.make(navigationView, "Erreur au calcul de la route", Snackbar.LENGTH_LONG).show();
                    }
                });
    }

    private void launchNavigation() {
        NavigationViewOptions.Builder navViewBuilderOptions = NavigationViewOptions.builder()
                .navigationListener(this)
                .progressChangeListener(this)
                .waynameChipEnabled(false)
                .shouldSimulateRoute(SHOULD_SIMULATE)
                .directionsRoute(route);

        Camera camera = new Camera() {
            @Override
            public double tilt(RouteInformation routeInformation) {
                return INITIAL_TILT;
            }

            @Override
            public double zoom(RouteInformation routeInformation) {
                return INITIAL_ZOOM;
            }

            @Override
            public List<Point> overview(RouteInformation routeInformation) {
                return null;
            }
        };

        navigationView.startNavigation(navViewBuilderOptions.build());
        navigationView.retrieveMapboxNavigation().setCameraEngine(camera);
        navigationView.retrieveMapboxNavigation().setOffRouteEngine(neverOffRouteEngine);
    }

    private boolean validRouteResponse(Response<DirectionsResponse> response) {
        return response.body() != null && !response.body().routes().isEmpty();
    }

    public void initWaypoints() {
        final String URL = BASE_URL + "chantiers/" + chantierId + "/route/" + typeRoute;
        RequestQueue requestQueue = Volley.newRequestQueue(this);
        // prepare the Request
        JsonArrayRequest getRequest = new JsonArrayRequest(Request.Method.GET, URL, null,
                response -> {
                    // display response
                    try {
                        prepareRoute(response);
                        buildRoute();
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

        // add it to the RequestQueue
        requestQueue.add(getRequest);
    }

    private void changeEtape(){
        if(etapeIdPrecedente == null){
            etape = new Etape(chantierId,userId,myEtat, null, getApplicationContext());
        }else{
            // send existing etape
            etape.sendFinEtape();
            etape = new Etape(chantierId, userId, myEtat, etapeIdPrecedente, getApplicationContext());
        }
        etapeIdPrecedente = etape.getEtapeId();
    }

    private boolean changeMyEtatIfNecessary(double distanceRemaining) {
        boolean etatChanged = false;
        String previousEtat = myEtat;
        int rayonChangementEtat = 0;
        if (typeRoute.equals("aller")) {
            rayonChangementEtat = rayonDéchargement;
        } else if (typeRoute.equals("retour")) {
            rayonChangementEtat = rayonChargement;
        }
        if (distanceRemaining < rayonChangementEtat) {
            if (myEtat.equals("chargé")) {
                myEtat = "enDéchargement";
                changeEtape();
                etatChanged = true;
            } else if (myEtat.equals("déchargé")) {
                myEtat = "enChargement";
                changeEtape();
                etatChanged = true;
            }
        } else {
            if (myEtat.equals("enChargement")) {
                myEtat = "chargé";
                changeEtape();
                etatChanged = true;
            } else if (myEtat.equals("enDéchargement")) {
                myEtat = "déchargé";
                changeEtape();
                etatChanged = true;
            }
        }
        if (etatChanged) {
            Log.d(TAG, "Etat changed: from " + previousEtat + " to " + myEtat);
        }
        return etatChanged;
    }

    private boolean rerouteUserIfNecessary(boolean etatChanged) {
        boolean userRerouted = false;
        if (etatChanged) {
            if (myEtat.equals("chargé") || myEtat.equals("déchargé")) {
                roadPoint.clear();
                navigationView.stopNavigation();
                navigationView.retrieveNavigationMapboxMap().clearMarkers();
                Log.d(TAG, "User rerouted");
                userRerouted = true;
            }
        }
        if (userRerouted) {
            fetchRoute();
        }
        return userRerouted;
    }

    private void removeRemainingWaypointsFromSharedPreferences() {
        SharedPreferences sharedPref = getPreferences(MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.remove("remainingWaypoints");
        editor.commit();
    }

    private void modifyTimeDiffTruckAheadIfNecessary() {
        if (myEtat.equals("enChargement")) {
            timeDiffTextView.setText("Vous êtes en cours de chargement \nQuittez la zone une fois chargé");
        } else if (myEtat.equals("enDéchargement")) {
            timeDiffTextView.setText("Vous êtes en cours de déchargement \nQuittez la zone une fois déchargé");
        } else if (myIndice > 0 && myList.list.size() > 1) {
            User userAhead = myList.list.get(myIndice - 1);
            timeDiffTruckAhead = remainingTime - userAhead.getETA();
            int minutes = (int) Math.floor(timeDiffTruckAhead / 60);
            int secondes = (int) Math.floor(timeDiffTruckAhead % 60);
            if (minutes < 1) {
                timeDiffTextView.setText("Vous êtes " + myEtat + "\nVous avez " + secondes + " secondes d'écart avec le camion de devant");
            } else {
                timeDiffTextView.setText("Vous êtes " + myEtat + "\nVous avez " + minutes + " mn " + secondes + " d'écart avec le camion de devant");
            }
        } else {
            timeDiffTextView.setText("Vous êtes " + myEtat + " \nIl n'y a pas de camion devant vous");
        }
    }

    private void sendCoordinates() {
        JSONObject obj = new JSONObject();
        try {
            obj.put("coordinates", coordinates);
            obj.put("etat", myEtat);
            obj.put("ETA", remainingTime);

        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
        mSocket.emit("chantier/sendCoordinates", obj);
    }

    private void disconnectFromChantier() {
        Log.d(TAG, "Disconnecting from chantier");
        connectedToChantier = false;
        mSocket.emit("chantier/disconnect");
    }

    private void connectToChantier() {
        JSONObject obj = new JSONObject();
        try {
            obj.put("userId", userId);
            obj.put("chantierId", chantierId);
            obj.put("coordinates", coordinates);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
        Log.d(TAG, "Connecting to chantier");
        mSocket.emit("chantier/connect", obj);
    }

    private Emitter.Listener onUserSentCoordinates = args -> runOnUiThread(() -> {
        JSONObject data = (JSONObject) args[0];
        double senderETA;
        String senderEtat;
        String senderId;
        try {
            senderETA = data.getDouble("ETA");
            senderEtat = data.getString("etat");
            senderId = data.getString("userId");
            User sender = new User(senderId, senderETA, senderEtat);
            if (myList.isContainedUser(senderId)) {
                myList.updateList(sender);
            } else {
                myList.addList(sender);
            }
            myList.updateMyIndice(this.userId);
            modifyTimeDiffTruckAheadIfNecessary();
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
    });

    private Emitter.Listener onConnectToChantierSuccess = args -> runOnUiThread(() -> {
        Log.d(TAG, "Connection to chantier successful");
        connectedToChantier = true;
        Log.d(TAG, "Etat after connection : " + myEtat);
    });

    private Emitter.Listener onUserDisconnected = args -> runOnUiThread(() -> {
        JSONObject data = (JSONObject) args[0];
        String senderId;
        try {
            senderId = data.getString("userId");
            if (myList.isContainedUser(senderId)) {
                myList.deleteUser(senderId);
            } else {
                Log.d(TAG, " impossible to delete : user not in the list ");
            }

        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
        modifyTimeDiffTruckAheadIfNecessary();
    });
}
