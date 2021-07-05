package com.smtp.smtp.navigation;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.app.ActivityManager;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.location.Location;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.ConnectivityManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.material.snackbar.Snackbar;
import com.mapbox.api.directions.v5.models.DirectionsRoute;
import com.mapbox.geojson.Point;
import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.mapboxsdk.annotations.Icon;
import com.mapbox.mapboxsdk.annotations.IconFactory;
import com.mapbox.mapboxsdk.annotations.MarkerOptions;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.services.android.navigation.ui.v5.NavigationView;
import com.mapbox.services.android.navigation.ui.v5.NavigationViewOptions;
import com.mapbox.services.android.navigation.ui.v5.OnNavigationReadyCallback;
import com.mapbox.services.android.navigation.ui.v5.listeners.NavigationListener;
import com.mapbox.services.android.navigation.v5.navigation.MapboxNavigationOptions;
import com.mapbox.services.android.navigation.v5.navigation.camera.Camera;
import com.mapbox.services.android.navigation.v5.navigation.camera.RouteInformation;
import com.mapbox.services.android.navigation.v5.offroute.OffRoute;
import com.mapbox.services.android.navigation.v5.routeprogress.ProgressChangeListener;
import com.mapbox.services.android.navigation.v5.routeprogress.RouteProgress;
import com.mapbox.services.android.navigation.v5.routeprogress.RouteProgressState;
import com.mapbox.services.android.navigation.v5.utils.RouteUtils;
import com.smtp.smtp.BuildConfig;
import com.smtp.smtp.R;
import com.smtp.smtp.Sortie;
import com.smtp.smtp.http.CoefJSONAsyncRequest;
import com.smtp.smtp.http.RequestManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.logging.Level;

import io.socket.client.IO;
import io.socket.client.Manager;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

@SuppressLint("MissingPermission")
public class Navigation extends AppCompatActivity implements NavigationListener, OnNavigationReadyCallback, ProgressChangeListener{

    private static final int ONE_HUNDRED_MILLISECONDS = 100;
    private NavigationView navigationView;
    private TextView timeDiffTextView;
    private DirectionsRoute route;
    private final boolean SHOULD_SIMULATE = false;
    private final int INITIAL_ZOOM = 18;
    private final double INITIAL_TILT = 30;
    private final int DISTANCE_TOLERANCE = 5000;
    static final String TAG = "Navigation";
    private boolean isOffRoute = false;
    private String preOffRoute = "";
    private Boolean sendingOffRoute = false;
    private OffRoute neverOffRouteEngine;
    private Point CHARGEMENT;
    private Point DECHARGEMENT;
    private Point destination;
    private String userId;
    private String chantierId;
    private String typeRoute;
    private String token;
    private JSONObject coordinates;
    private double remainingTime;
    private Double remainingTimeCoef;
    private double timeDiffTruckAhead = Double.POSITIVE_INFINITY;
    String myEtat;
    private Etape etape = null;
    private Sortie sortie = null;
    private Pause pause = null;
    private String etapeIdPrecedente = null;
    private int rayonChargement;
    private int rayonDéchargement;
    private WaypointFilter filter;
    private FusedLocationProviderClient fusedLocationClient;
    private Socket mSocket;
    private boolean connectedToChantier = false;
    private static final String BASE_URL = "http://smtp-dev-env.eba-5jqrxjhz.eu-west-3.elasticbeanstalk.com/";
    private List<Point> roadPoint = new ArrayList<>();
    private Location location;
    private int remainingWaypoints = -1;
    private int timeToSend = 3;
    private int delay = timeToSend;

    //
    private Cycle cycle;

    // for paused button
    private String previousEtat;
    private Button buttonPause;
    private Button buttonReprendre;
    private boolean onPause = false;
    private NetworkStateReceiver networkStateReceiver = new NetworkStateReceiver();
    private List<Waypoint> initialWaypoints;
    private CycleManager cycleManager;

    // Connection to the socket server
    {
        try {
            Log.d(TAG, "Instanciating a new socket");
            mSocket = IO.socket(BuildConfig.API_URL);
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    // Declaring our custom UnhandledExceptionHandler : it send a disconnection event to the socket server
    private CustomUEH UEH = new CustomUEH(new Runnable() {
        @Override
        public void run() {
            try {
                cycleManager.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            disconnectFromChantier();
        }
    });





    @SuppressLint("MissingPermission")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "OnCreate");
        ActivityManager am = (ActivityManager) getSystemService(ACTIVITY_SERVICE);

        AndroidLoggingHandler.reset(new AndroidLoggingHandler());
        java.util.logging.Logger.getLogger(Socket.class.getName()).setLevel(Level.FINEST);
        java.util.logging.Logger.getLogger(io.socket.engineio.client.Socket.class.getName()).setLevel(Level.FINEST);
        java.util.logging.Logger.getLogger(Manager.class.getName()).setLevel(Level.FINEST);

        Thread.setDefaultUncaughtExceptionHandler(UEH);

        Intent i = getIntent();
        double[] origin = i.getDoubleArrayExtra("origin");
        double[] destination = i.getDoubleArrayExtra("destination");

        CHARGEMENT = Point.fromLngLat(origin[0], origin[1]);
        DECHARGEMENT = Point.fromLngLat(destination[0], destination[1]);
        userId = i.getStringExtra("userId");
        chantierId = i.getStringExtra("chantierId");
        token = i.getStringExtra("token");
        myEtat = i.getStringExtra("myEtat");
        previousEtat = myEtat;

        Mapbox.getInstance(this, getString(R.string.mapbox_access_token));

        setContentView(R.layout.activity_main);
        navigationView = findViewById(R.id.navigationView);
        timeDiffTextView = findViewById(R.id.timeDiffTextView);
        buttonPause = findViewById(R.id.buttonPause);
        buttonReprendre = findViewById(R.id.buttonReprendre);
        navigationView.onCreate(savedInstanceState);

        IntentFilter filter = new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION);
        registerReceiver(networkStateReceiver, filter);
        registerReceiver(broadcastReceiver, new IntentFilter("NO_INTERNET"));

        retrieveLocation();

        cycle = new Cycle(userId, myEtat);
        cycle.addUser(new User(userId, Double.POSITIVE_INFINITY, myEtat));
        cycleManager = new CycleManager(this::fetchRoute, cycle);
    }

    private void retrieveLocation() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        LocationRequest locationRequest = LocationRequest.create();
        // Location is requested every 0.5 seconds
        locationRequest.setInterval(500);
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

        LocationCallback locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if(locationResult == null){
                    return;
                }
                onLocationRetrieved(locationResult.getLastLocation(), this);
            }
        };

        fusedLocationClient.requestLocationUpdates(locationRequest,
                locationCallback,
                Looper.getMainLooper());
    }

    private void onLocationRetrieved(Location l, LocationCallback locationCallback) {
        location = l;
        fusedLocationClient.removeLocationUpdates(locationCallback);
        CameraPosition initialPosition = new CameraPosition.Builder()
                .target(new LatLng(location.getLatitude(), location.getLongitude()))
                .zoom(INITIAL_ZOOM)
                .build();
        navigationView.initialize(Navigation.this::onNavigationReady, initialPosition);

        mSocket.on("chantier/user/sentCoordinates", onUserSentCoordinates);
        mSocket.on("chantier/connect/success", onConnectToChantierSuccess);
        mSocket.on("chantier/user/disconnected", onUserDisconnected);
        mSocket.on("chantier/detournement",onDetournement);
        mSocket.connect();
        connectToChantier();

        // initialize listener*/
        addListenerOnButton();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "OnDestroy");

        disconnectFromChantier();
        mSocket.disconnect();
        mSocket.off();

        //unregister receiver;
        unregisterReceiver(broadcastReceiver);
        unregisterReceiver(networkStateReceiver);

        mSocket.off("chantier/user/sentCoordinates", onUserSentCoordinates);
        mSocket.off("chantier/connect/success", onConnectToChantierSuccess);
        mSocket.off("chantier/user/disconnected", onUserDisconnected);
        mSocket.off("chantier/detournement", onUserDisconnected);

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
        try {
            cycleManager.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
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
        navigationView.retrieveNavigationMapboxMap().retrieveMap().getMarkers().clear();
        fetchRayon();
        fetchRoute();
        modifyTimeDiffTruckAheadIfNecessary();

        IconFactory iconFactory = IconFactory.getInstance(getApplicationContext());
        Icon icon = iconFactory.fromResource(R.drawable.icon_chargement);
        Icon icon2 = iconFactory.fromResource(R.drawable.icon_dechargement);

        navigationView.retrieveNavigationMapboxMap().retrieveMap().addMarker(new MarkerOptions().title("Chargement")
                .position(new LatLng(CHARGEMENT.latitude(), CHARGEMENT.longitude()))
                .icon(icon)
        );

        navigationView.retrieveNavigationMapboxMap().retrieveMap().addMarker(new MarkerOptions().title("Déchargement")
                .position(new LatLng(DECHARGEMENT.latitude(), DECHARGEMENT.longitude()))
                .icon(icon2)
        );

        cycleManager.start();

    }

    public void print(){
        Log.d("CycleManager", "Hello");
    }


    //brodcast Receiver for handle connection change
    BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            showAlertDetournementWithAutoDismiss("Pas de connexion internet","Pas de connexion internet","Fermer",10000);
        }
    };

    // listener for paused and reprendre buttons
    private void addListenerOnButton() {

        buttonPause.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View arg0) {
                // pause is clicked
                if (!onPause){
                    timeDiffTextView.setVisibility(View.INVISIBLE);
                    buttonPause.setVisibility(View.INVISIBLE);
                    buttonPause.setEnabled(false);
                    buttonReprendre.setVisibility(View.VISIBLE);
                    buttonReprendre.setEnabled(true);

                    if(isOffRoute){
                        previousEtat = preOffRoute;
                    }else{
                        previousEtat = myEtat;
                    }
                    if(etape != null){
                        pause = new Pause(etape.getEtapeId(),getApplicationContext());
                    }
                    myEtat = "pause";
                    onPause = true;
                }
            }
        });

        buttonReprendre.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(onPause){
                    onPause = false;
                    buttonReprendre.setEnabled(false);
                    buttonReprendre.setVisibility(View.INVISIBLE);
                    buttonPause.setEnabled(true);
                    buttonPause.setVisibility(View.VISIBLE);
                    timeDiffTextView.setVisibility(View.VISIBLE);
                    if(etape != null && pause != null){
                        pause.sendFinPause();
                    }
                    if(isOffRoute){
                        myEtat = "offRoute";
                        preOffRoute = previousEtat;
                    }else{
                        myEtat = previousEtat;
                        preOffRoute = "";
                    }

                }
            }
        });
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

		Log.d("offT", " myEtat "+ myEtat);
        Log.d("offT", " isOffRoute "+ isOffRoute);
        Log.d("offT", " preOffRoute "+ preOffRoute);

        if(isOffRoute){
            if(preOffRoute.equals("enDéchargement") || myEtat.equals("enDéchargement")){
                myEtat = "enDéchargement";
                preOffRoute = "";
                isOffRoute = false;
            }
            if(preOffRoute.equals("enChargement") || myEtat.equals("enChargement")){
                myEtat = "enChargement";
                preOffRoute = "";
                isOffRoute = false;
            }
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

	public void handleOffRoute(Location location, RouteProgress routeProgress){
        if(myEtat.equals("enChargement") || myEtat.equals("enDéchargement") || myEtat.equals("pause") ){
            preOffRoute = "";
            isOffRoute = false;
        } else {
            // je suis sur la route et isOffRoute = true => je change isOfRoute en false
            if(routeProgress.currentState() != null && isOffRoute) {
                myEtat = preOffRoute;
                preOffRoute = "";
                isOffRoute = false;
                Log.d("offR", " sortie de route " + isOffRoute);
            }else{
                // je ne suis plus sur la route et isOffRoute = false
                if(routeProgress.currentState() == null && !isOffRoute){
                    preOffRoute = myEtat;
                    myEtat = "offRoute";
                    if(!preOffRoute.equals("")) {
                        isOffRoute = true;
                        Log.d("offR", " sortie de route " + isOffRoute);
                    }
                }
            }
        }
        sendOffRoute(location);
    }

    public void sendOffRoute(Location location){
        // on commence un offRoute
        if(!sendingOffRoute && isOffRoute){
            Log.d("Sortie", "débutSortie");
            sendingOffRoute = true;
            sortie = new Sortie(chantierId,userId,typeRoute,getApplicationContext());
            sortie.addWaypoint(location.getLatitude(),location.getLongitude());
        }
        // on continue
        if(sendingOffRoute && isOffRoute){
            Log.d("Sortie", "ajoutPointSortie");
            // on conserve la meme Sortie ( ajout d'un Point)
            sortie.addWaypoint(location.getLongitude(),location.getLatitude());
        }
        // on arrete
        if(sendingOffRoute && !isOffRoute){
            sendingOffRoute = false;
            sortie.sendFinSortie();
            Log.d("Sortie", "finSortie");
            // on termine la Sortie ( dateFin)
        }

    }

    @Override
    public void onProgressChange(Location location, RouteProgress routeProgress) {
		handleOffRoute(location,routeProgress);
        boolean didEtatChanged;
        float distanceFromDestination = getDistanceFromDestination(location);
        this.location = location;
        this.remainingTime = Math.max(0, routeProgress.durationRemaining() * this.remainingTimeCoef);

        didEtatChanged = changeMyEtatIfNecessary(distanceFromDestination);
        if (rerouteUserIfNecessary(didEtatChanged)) {
            return;
        }

        modifyTimeDiffTruckAheadIfNecessary();

        Log.d(TAG, "Number of remaining waypoints: " + routeProgress.remainingWaypoints());

        //Register remaining waypoints in SharedPreferences
        if(remainingWaypoints != routeProgress.remainingWaypoints()) {
            remainingWaypoints = routeProgress.remainingWaypoints();
            registerRemainingWaypointInSharedPreferences();
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
            Log.d(TAG, "Remaining waypoints: " + p.toString());
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
            if(timeToSend()){
                sendCoordinates();
            }
            cycle.updateCycle(new User(userId, remainingTime, myEtat));
        }
    }

    private boolean timeToSend() {
        if (delay >= timeToSend) {
            delay = 0;
            return true;
        }else{
            Log.d("delay","delay : "+delay);
            delay++;
            return false;
        }
    }

    public void prepareRoute(JSONArray array) throws JSONException {
        // Ajoute chaque donnée à la liste de waypoint
        initialWaypoints = new ArrayList<>();
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
        Collections.sort(initialWaypoints);

        filter = new WaypointFilter(
                initialWaypoints,
                location,
                DISTANCE_TOLERANCE,
                getRemainingWaypointsFromSharedPreferences()
        );

        initialWaypoints = filter.cleanWaypoints();

        for (Waypoint wp:
                initialWaypoints) {
            Log.d(TAG, "Cleaned waypoints: " + wp.toString());
        }

        ArrayList<Point> points = new ArrayList<>();
        points.add(Point.fromLngLat(location.getLongitude(), location.getLatitude()));
        for (Waypoint waypoint : initialWaypoints) {
            points.add(waypoint.getPoint());
        }
        points.add(destination);
        roadPoint = points;
    }

    private void registerRemainingWaypointInSharedPreferences() {
        Log.d(TAG, "Registering remaining points : " + remainingWaypoints + " in " + chantierId + typeRoute + "remainingWaypoints");
        SharedPreferences sharedPref = getPreferences(MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putInt(chantierId + typeRoute + "remainingWaypoints", remainingWaypoints);
        editor.apply();
    }

    public List<Waypoint> getRemainingWaypointsFromSharedPreferences(){
        Log.d(TAG, "Getting remaining points in " + chantierId + typeRoute + "remainingWaypoints");
        SharedPreferences sharedPref = getPreferences(MODE_PRIVATE);
        int nbRemainingWp = sharedPref.getInt(chantierId + typeRoute + "remainingWaypoints", -1);
        Log.d(TAG, "nbRemainingWaypoints:" + nbRemainingWp);
        if (nbRemainingWp == -1) {
            return initialWaypoints;
        } else if (nbRemainingWp > initialWaypoints.size()) {
            removeRemainingWaypointsFromSharedPreferences();
            return initialWaypoints;
        }
        List<Waypoint> res = new ArrayList<>(initialWaypoints.subList(initialWaypoints.size()-nbRemainingWp, initialWaypoints.size()));
        Collections.sort(res);
        return res;
    }

    private void removeRemainingWaypointsFromSharedPreferences() {
        Log.d(TAG, "Removing remaining points of : " + chantierId + typeRoute + "remainingWaypoints");
        SharedPreferences sharedPref = getPreferences(MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.remove(chantierId + typeRoute + "remainingWaypoints");
        editor.commit();
    }

    private void fetchRoute() {
        if (myEtat.equals("chargé") || myEtat.equals("enDéchargement")) {
            typeRoute = "aller";
            destination = DECHARGEMENT;
        }
        if (myEtat.equals("déchargé") || myEtat.equals("enChargement")) {
            typeRoute = "retour";
            destination = CHARGEMENT;
        }
        
        fetchCoef(() -> initWaypoints());
    }

    private void fetchCoef(Runnable then) {
        CoefJSONAsyncRequest coefAsyncRequest = new CoefJSONAsyncRequest(getApplicationContext(), token);
        HashMap<String, String> coefRequestArgs = new HashMap<>();
        coefRequestArgs.put("chantierId", this.chantierId);
        coefRequestArgs.put("typeRoute", this.typeRoute);
        coefRequestArgs.put("day", Helper.getDayString());

        coefAsyncRequest.getByChantierAndTypeRouteAndDay(coefRequestArgs, fetchedCoef -> {
            this.remainingTimeCoef = fetchedCoef;
            then.run();
        });
    }

    private void buildRoute() {
        Consumer<DirectionsRoute> matchGetSuccess = (route) -> {
            Navigation.this.route = route;
            launchNavigation();
        };

        Consumer<Throwable> routeGetFailure = (t) -> {
            Snackbar.make(navigationView, "Error getting the route", Snackbar.LENGTH_LONG).show();
            Log.e(TAG, t.getLocalizedMessage());
        };
        Consumer<DirectionsRoute> routeGetSuccess = (route) -> {
            MapMatcher mapMatcher = new MapMatcher(getApplicationContext(), route);
            mapMatcher.getMatch( matchGetSuccess, routeGetFailure);
        };

        RouteGetter routeGetter = new RouteGetter(getApplicationContext(), roadPoint);
        routeGetter.getRoute(routeGetSuccess, routeGetFailure);
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
        setOffRouteEngine();
    }

    private void setOffRouteEngine() {
        neverOffRouteEngine = new OffRoute() {
            @Override
            public boolean isUserOffRoute(Location location, RouteProgress routeProgress, MapboxNavigationOptions options) {
                return false;
            }
        };
        navigationView.retrieveMapboxNavigation().setOffRouteEngine(neverOffRouteEngine);
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
                },
                new com.android.volley.Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.e(TAG, error.toString() + " " + error.networkResponse.toString());
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
        int rayonChangementEtat = 0;
        if (typeRoute.equals("aller")) {
            rayonChangementEtat = rayonDéchargement;
        } else if (typeRoute.equals("retour")) {
            rayonChangementEtat = rayonChargement;
        }
        Log.d("offD", "distance : "+distanceRemaining+", rayonChangementEtat : "+ rayonChangementEtat+ ", typeRoute : " + typeRoute + ", myEtat : "+ myEtat);
        if (distanceRemaining < rayonChangementEtat) {
            if (myEtat.equals("chargé") || preOffRoute.equals("chargé")) {
                myEtat = "enDéchargement";
                changeEtape();
                return true;
            } else if (myEtat.equals("déchargé") || preOffRoute.equals("déchargé")) {
                myEtat = "enChargement";
                changeEtape();
                return true;
            }
        } else {
            if (myEtat.equals("enChargement")) {
                myEtat = "chargé";
                changeEtape();
                return true;
            } else if (myEtat.equals("enDéchargement")) {
                myEtat = "déchargé";
                changeEtape();
                return true;
            }
        }
        return false;
    }

    private boolean rerouteUserIfNecessary(boolean etatChanged) {
        boolean userRerouted = false;
        if(!etatChanged) return userRerouted;
        if(!userIsInReroutableState()) return userRerouted;

        roadPoint.clear();
        navigationView.stopNavigation();
        navigationView.retrieveNavigationMapboxMap().clearMarkers();
        Log.d(TAG, "User rerouted");
        userRerouted = true;


        if (userRerouted) {
            fetchRoute();
        }
        return userRerouted;
    }

    private boolean userIsInReroutableState() {
        return myEtat.equals("chargé") || myEtat.equals("déchargé");
    }

    private void modifyTimeDiffTruckAheadIfNecessary() {
        if (myEtat.equals("enChargement")) {
            timeDiffTextView.setText("Vous êtes en cours de chargement \nQuittez la zone une fois chargé");
        } else if (myEtat.equals("enDéchargement")) {
            timeDiffTextView.setText("Vous êtes en cours de déchargement \nQuittez la zone une fois déchargé");
        } else if (cycle.someOneIsAheadMe()) {
            User userAhead = cycle.getUserAhead();
            timeDiffTruckAhead = Math.abs(remainingTime - userAhead.getETA());
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
            if (cycle.isContainedUser(senderId)) {
                cycle.updateCycle(sender);
            } else {
                cycle.addUser(sender);
            }
            cycle.updateMyIndice(Navigation.this.userId);
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
            if (cycle.isContainedUser(senderId)) {
                cycle.deleteUser(senderId);
            } else {
                Log.d(TAG, " impossible to delete : user not in the list ");
            }
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
        modifyTimeDiffTruckAheadIfNecessary();
    });

    private void rerouting(JSONObject data) throws JSONException {
        navigationView.stopNavigation();
        connectedToChantier = false;
        mSocket.emit("chantier/disconnect");
        chantierId = data.getString("chantierId");
        Double originLong = data.getDouble("originLong");
        Double originLat = data.getDouble("originLat");
        Double destinationLong = data.getDouble("destinationLong");
        Double destinationLat = data.getDouble("destinationLat");
        CHARGEMENT = Point.fromLngLat(originLong,originLat);
        DECHARGEMENT = Point.fromLngLat(destinationLong,destinationLat);
        cycle.clear();
        cycle.addUser(new User(userId, Double.POSITIVE_INFINITY, myEtat));
        connectToChantier();
        navigationView.retrieveNavigationMapboxMap().clearMarkers();
        navigationView.retrieveNavigationMapboxMap().retrieveMap().getMarkers().clear();
        fetchRayon();
        fetchRoute();
        modifyTimeDiffTruckAheadIfNecessary();

        IconFactory iconFactory = IconFactory.getInstance(getApplicationContext());
        Icon icon = iconFactory.fromResource(R.drawable.icon_chargement);
        Icon icon2 = iconFactory.fromResource(R.drawable.icon_dechargement);

        navigationView.retrieveNavigationMapboxMap().retrieveMap().addMarker(new MarkerOptions().title("Chargement")
                .position(new LatLng(CHARGEMENT.latitude(), CHARGEMENT.longitude()))
                .icon(icon)
        );

        navigationView.retrieveNavigationMapboxMap().retrieveMap().addMarker(new MarkerOptions().title("Déchargement")
                .position(new LatLng(DECHARGEMENT.latitude(), DECHARGEMENT.longitude()))
                .icon(icon2)
        );
    }

    private Emitter.Listener onDetournement = args -> runOnUiThread(() -> {
        Log.e("Detournement", "onDetournement");
        JSONObject data = (JSONObject) args[0];
        Log.e("Detournement", "data "+ data.toString());
        String userIdToMove;
        try {
            userIdToMove = data.getString("userId");
            if (userIdToMove.equals(userId)) {
                rerouting(data);
                vibrateAndNotify();
                showAlertDetournementWithAutoDismiss("Détournement !","Vous avez été détourné vers un autre chantier","Fermer",5000);
            }
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
        modifyTimeDiffTruckAheadIfNecessary();
    });

    @SuppressLint("MissingPermission")
    private void vibrateAndNotify() {
        Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator == null) {
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(ONE_HUNDRED_MILLISECONDS, VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
            vibrator.vibrate(ONE_HUNDRED_MILLISECONDS);
        }
        try {
            Uri notification = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            Ringtone r = RingtoneManager.getRingtone(getApplicationContext(), notification);
            r.play();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void showAlertDetournementWithAutoDismiss(String title, String message, String messageButton, int delayTime) {
        AlertDialog.Builder builder = new AlertDialog.Builder(Navigation.this);
        builder.setTitle(title)
                .setMessage(message)
                .setCancelable(false).setCancelable(false)
                .setPositiveButton(messageButton, new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        //this for skip dialog
                        dialog.cancel();
                    }
                });
        final AlertDialog alertDialog = builder.create();
        alertDialog.show();
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                if (alertDialog.isShowing()){
                    alertDialog.dismiss();
                }
            }
        }, delayTime); //change 5000 with a specific time you want
    }
}
