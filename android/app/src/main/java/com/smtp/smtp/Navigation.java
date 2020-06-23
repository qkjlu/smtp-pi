package com.smtp.smtp;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.location.Location;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.material.snackbar.Snackbar;
import com.mapbox.android.core.permissions.PermissionsListener;
import com.mapbox.android.core.permissions.PermissionsManager;
import com.mapbox.api.directions.v5.models.DirectionsResponse;
import com.mapbox.api.directions.v5.models.DirectionsRoute;
import com.mapbox.geojson.Point;

import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.services.android.navigation.ui.v5.NavigationView;
import com.mapbox.services.android.navigation.ui.v5.NavigationViewOptions;
import com.mapbox.services.android.navigation.ui.v5.OnNavigationReadyCallback;
import com.mapbox.services.android.navigation.ui.v5.listeners.NavigationListener;
import com.mapbox.services.android.navigation.v5.navigation.MapboxNavigationOptions;
import com.mapbox.services.android.navigation.v5.navigation.NavigationRoute;
import com.mapbox.services.android.navigation.v5.offroute.OffRoute;
import com.mapbox.services.android.navigation.v5.routeprogress.ProgressChangeListener;
import com.mapbox.services.android.navigation.v5.routeprogress.RouteProgress;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class Navigation extends AppCompatActivity implements PermissionsListener, NavigationListener, OnNavigationReadyCallback, ProgressChangeListener {
    private NavigationView navigationView;
    private TextView timeDiffTextView;
    private DirectionsRoute route;
    private PermissionsManager permissionsManager;
    private final boolean SHOULD_SIMULATE = false;
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
    private UUID etapeIdPrecedente = null;
    private double rayonChangementEtat = 100;

    private Socket mSocket;

    private static final String BASE_URL = "http://smtp-dev-env.eba-5jqrxjhz.eu-west-3.elasticbeanstalk.com/";
    private ArrayList<Point> roadPoint = new ArrayList();

    {
        try {
            // dev // mSocket = IO.socket("http://smtp-dev-env.eba-5jqrxjhz.eu-west-3.elasticbeanstalk.com/");
            mSocket = IO.socket(BuildConfig.API_URL);
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }
    private boolean connectedToChantier = false;

    public boolean isMyUserId(String userId){
        return userId.equals(this.userId);
    }

    public class User {
        public String userId;
        public Double ETA;
        public String etat;

        public User(String userId, Double ETA, String etat){
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
            return "User{ moi ?" + isMyUserId(this.userId)  + ", ETA=" + ETA + ", etat='" + etat + '}';
        }
    }

    private int myIndice;
    private ListUser myList = new ListUser();

    public class EtaSorter implements Comparator<User> {
        @Override
        public int compare(User o1, User o2) {
            return (int)(o1.getETA() - o2.getETA());
        }
    }

public class ListUser{
    public ArrayList<User> list;

    public ListUser(){
        this.list = new ArrayList<User>();
    }
    public boolean isAddable(User user){
        Log.d(TAG, "isAddable :  "+ user.getEtat() + " mon etat "+ myEtat);
        Log.d(TAG, "j'ajoute ce user à ma liste ? "+ user.getEtat().equals(myEtat));
        return user.getEtat().equals(myEtat);
    }

    public int addList(User user){
        Log.d(TAG, "Debut Add"+ list.toString());
        if (isAddable(user) && !isContainedUser(user.getUserId())){
            list.add(user);
            Log.d(TAG, "Fin Add"+ list.toString());
            Collections.sort(list, new EtaSorter());
            Log.d(TAG, "Fin tri"+ list.toString());
            return 1;
        }
        else{
            return -1;
        }
    }

    public boolean isContainedUser(String userId){
        boolean res = false;
        for(int i=0; i < list.size(); i++){
            if(list.get(i).getUserId().equals(userId)){
                res = true;
            }
        }
        Log.d(TAG, "isContained ? "+res);
        return res;
    }

    public void updateMyIndice(String userId){
        for(int i=0; i < list.size(); i++){
            if(isMyUserId(list.get(i).getUserId())){
                myIndice = i;
                Log.d(TAG, "changement indice : "+ myIndice);
            }
        }
    }

    public boolean sameEtat(User user){
        return user.getEtat().equals(myEtat);
    }
    public void updateList(User user){
        Log.d(TAG, "Debut update"+ list.toString());
        if(!sameEtat(user)){
            Log.d(TAG, "Ce user n'a pas le meme etat je le supprime");
            this.deleteUser(user.getUserId());
        }else{
            for(int i=0; i < list.size(); i++){
                if(list.get(i).getUserId().equals(user.getUserId())){
                    list.get(i).ETA = user.getETA();
                }
            }
        }
        Collections.sort(list, new EtaSorter());
        Log.d(TAG, "Fin update"+ list.toString());
    }

    public void deleteUser(String userId){
        Log.d(TAG, "Début delete"+ list.toString());
        int res = -1;
        for(int i=0; i < list.size(); i++){
            if(list.get(i).getUserId().equals(userId)){
                res = i;
            }
        }
        list.remove(res);
        Collections.sort(list, new EtaSorter());
        Log.d(TAG, "Fin delete"+ list.toString());
    }
}

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

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
        myList.addList(new User(userId,Double.POSITIVE_INFINITY,myEtat));
        Log.d(TAG, "Je m'ajoute dans la liste " +myList.list.toString());

        Mapbox.getInstance(this, getString(R.string.mapbox_access_token));

        setContentView(R.layout.activity_main);
        navigationView = findViewById(R.id.navigationView);
        timeDiffTextView = findViewById(R.id.timeDiffTextView);

        timeDiffTextView.setText("Il n'y a pas de camions devant vous");
        navigationView.onCreate(savedInstanceState);
        navigationView.initialize(this);

        mSocket.on("chantier/user/sentCoordinates", onUserSentCoordinates);
        mSocket.on("chantier/connect/success", onConnectToChantierSuccess);
        mSocket.on("chantier/user/disconnected",onUserDisconnected);
        mSocket.connect();
        connectToChantier();

    }

    @Override
    protected void onStart() {
        super.onStart();
        navigationView.onStart();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        disconnectFromChantier();
        mSocket.disconnect();

        mSocket.off("chantier/user/sentCoordinates", onUserSentCoordinates);
        mSocket.off("chantier/connect/success", onConnectToChantierSuccess);
        mSocket.off("chantier/user/disconnected",onUserDisconnected);
        navigationView.onDestroy();
    }

    @Override
    protected void onResume() {
        super.onResume();
        navigationView.onResume();
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        navigationView.onLowMemory();
    }

    @Override
    protected void onStop() {
        super.onStop();
        navigationView.onStop();
    }

    @Override
    protected void onPause() {
        super.onPause();
        navigationView.onPause();
    }

    @Override
    public void onExplanationNeeded(List<String> permissionsToExplain) {

    }

    @Override
    public void onPermissionResult(boolean granted) {
        if (!granted) {
            this.finish();
            System.exit(0);
        } else {
            fetchRoute();
        }
    }

    @Override
    public void onCancelNavigation() {
        disconnectFromChantier();
        this.finish();
    }

    @Override
    public void onNavigationFinished() {

    }

    @Override
    public void onNavigationRunning() {

    }

    @Override
    public void onNavigationReady(boolean isRunning) {
        if (askLocationPermissionIfNeeded()) {
            if(myEtat.equals("chargé") || myEtat.equals("enChargement")) {
                fetchRoute();
            }
            if(myEtat.equals("déchargé") || myEtat.equals("enDéchargement")) {
                fetchRoute();
            }
        }
    }

    private float getDistanceFromDestination(Location location){
        float[] distanceFromDestination = new float[3];
        Point destination = null;
        if(myEtat.equals("chargé") || myEtat.equals("enDéchargement")) { destination = DESTINATION; }
        if(myEtat.equals("déchargé") || myEtat.equals("enChargement")) { destination = ORIGIN; }
        if(destination == null){ throw new Error("getDistanceFromDestination: destination cannot be null"); }
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
        coordinates = new JSONObject();
        remainingTime = routeProgress.durationRemaining();
        didEtatChanged = changeMyEtatIfNecessary(distanceFromDestination);
        rerouteUserIfNecessary(didEtatChanged);

        Log.d(TAG, "Remaining time: " + remainingTime);
        Log.d(TAG, "Distance remaining: " + distanceFromDestination);
        try {
            coordinates.put("longitude", location.getLongitude());
            coordinates.put("latitude", location.getLatitude());
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }

        if(connectedToChantier) {
            sendCoordinates();
            myList.updateList(new User(userId,remainingTime,myEtat));
        }
    }

    public void prepareRoute(JSONArray array) throws JSONException {
        // Ajoute chaque donnée à la liste de waypoint triable
        ArrayList<Waypoint> waypoints = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) {
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
        ArrayList<Point> points = new ArrayList<>();
        for (Waypoint waipoint : waypoints) {
            points.add(waipoint.getPoint());
        }
        roadPoint = points;
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
    private void buildRoute(){
        NavigationRoute.Builder builder = NavigationRoute.builder(this)
                .accessToken("pk." + getString(R.string.gh_key))
                .baseUrl(getString(R.string.base_url))
                .user("gh")
                .origin(roadPoint.get(0))
                .destination(roadPoint.get(roadPoint.size()-1))
                .profile("car");
        // add waypoints without first and last point
        if(roadPoint.size()>2){
            for(int i = 1; i < roadPoint.size()-1; i++){
                builder.addWaypoint(roadPoint.get(i));
            }
        }
        NavigationRoute navRoute = builder.build();

        navRoute.getRoute(
                new Callback<DirectionsResponse>() {
                    @Override
                    public void onResponse(Call<DirectionsResponse> call, Response<DirectionsResponse> response) {
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

    private boolean askLocationPermissionIfNeeded() {
        if (!PermissionsManager.areLocationPermissionsGranted(this)) {
            permissionsManager = new PermissionsManager(this);
            permissionsManager.requestLocationPermissions(this);
            return PermissionsManager.areLocationPermissionsGranted(this);
        } else {
            return true;
        }
    }

    private void launchNavigation() {
        NavigationViewOptions.Builder navViewBuilderOptions = NavigationViewOptions.builder()
                .navigationListener(this)
                .progressChangeListener(this)
                .shouldSimulateRoute(true)
                .waynameChipEnabled(false)
                .shouldSimulateRoute(SHOULD_SIMULATE)
                .directionsRoute(route);

        navigationView.startNavigation(navViewBuilderOptions.build());
    }

    private boolean validRouteResponse(Response<DirectionsResponse> response) {
        return response.body() != null && !response.body().routes().isEmpty();
    }

    public void initWaypoints(){
        final String URL = BASE_URL + "chantiers/"+chantierId +"/route/"+typeRoute;
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
                    Log.d("Response", response.toString());
                },
                new com.android.volley.Response.ErrorListener()
                {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d("Error.Response", error.toString() + error.networkResponse);
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

    private void changeEtape(){
        if(etapeIdPrecedente == null){
            etape = new Etape(UUID.fromString(chantierId),UUID.fromString(userId),myEtat, etapeIdPrecedente);
        }else{
            // send existing etape
            etape.sendEtape();
            etape = new Etape(UUID.fromString(chantierId),UUID.fromString(userId),myEtat, etapeIdPrecedente);
        }
        etapeIdPrecedente = etape.getEtapeId();
    }

    private boolean changeMyEtatIfNecessary(double distanceRemaining) {
        boolean etatChanged = false;
        String previousEtat = myEtat;
        if(distanceRemaining < rayonChangementEtat) {
            if(myEtat.equals("chargé")) {
                myEtat = "enDéchargement";
                changeEtape();
                etatChanged = true;
            } else if (myEtat.equals("déchargé")){
                myEtat = "enChargement";
                changeEtape();
                etatChanged = true;
            }
        } else {
            if(myEtat.equals("enChargement")){
                changeEtape();
                myEtat = "chargé";
                etatChanged = true;
            } else if (myEtat.equals("enDéchargement")){
                changeEtape();
                myEtat = "déchargé";
                etatChanged = true;
            }
        }
        if(etatChanged) { Log.d(TAG,"Etat changed: from " + previousEtat + " to " + myEtat); }
        return etatChanged;
    }

    private boolean rerouteUserIfNecessary(boolean etatChanged) {
        boolean userRerouted = false;
        if(etatChanged){
            if(myEtat.equals("chargé")) {
                fetchRoute();
                userRerouted = true;
            } else if( myEtat.equals("déchargé")) {
                fetchRoute();
                userRerouted = true;
            }
        }
        if (userRerouted) { Log.d(TAG, "User rerouted"); }
        return userRerouted;
    }

    private void modifyTimeDiffTruckAheadIfNecessary(double senderETA, String senderEtat){
        if(myEtat.equals("enChargement")){
            timeDiffTextView.setText("En cours de chargement... Quittez la zone une fois chargé");
        } else if(myEtat.equals("enDéchargement")) {
            timeDiffTextView.setText("En cours de déchargement... Quittez la zone une fois déchargé");
        } else if(myIndice > 0 && myList.list.size() > 1){
            User userAhead = myList.list.get(myIndice-1);
            timeDiffTruckAhead = remainingTime - userAhead.getETA();
            int minutes = (int) Math.floor(timeDiffTruckAhead / 60);
            int secondes = (int) Math.floor(timeDiffTruckAhead % 60);
            if(minutes < 1) {
                timeDiffTextView.setText(secondes + " secondes d'écart avec le camion de devant ("+ myEtat +")");
                timeDiffTextView.setText(secondes + " secondes d'écart avec le camion de devant ("+ myEtat +")");
            } else {
                timeDiffTextView.setText(minutes + " mn "+ secondes +" d'écart avec le camion de devant ("+ myEtat +")");
            }
            Log.d(TAG, "Time diff with truck ahead modified: " + timeDiffTruckAhead);
        } else{
            timeDiffTextView.setText("Il n'y a pas de camions devant vous ("+myEtat+")");

        }
    }

    // Si l'envoyeur :
    // - a le même état que moi,
    // - une différence positive entre mon ETA et le sien,
    // - une différence d'ETA inférieure à la différence d'ETA courante
    // ===> Alors c'est le camion devant moi le plus proche
    private boolean senderIsClosestTruckAhead(double senderETA, String senderEtat) {
        double timeDiffWithSender = remainingTime - senderETA;
        Log.d(TAG, "Checking if sender is closest truck ahead");
        Log.d(TAG, "My ETA: " + remainingTime);
        Log.d(TAG, "My etat: " + myEtat);
        Log.d(TAG, "Sender ETA: " + senderETA);
        Log.d(TAG, "Sender etat: " + senderEtat);
        if (senderEtat.equals(myEtat) && timeDiffWithSender > 0 && timeDiffWithSender < timeDiffTruckAhead) {
            return true;
        }
        return false;
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
        Log.d(TAG, "Sending coordinates");
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
        Log.d(TAG,"Connecting to chantier");
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
            Log.d(TAG, "New coordinates received");
            User sender = new User(senderId,senderETA,senderEtat);
            if (myList.isContainedUser(senderId)){
                myList.updateList(sender);
            }else{
                myList.addList(sender);
            }
            myList.updateMyIndice(this.userId);
            // TODO supprimer les utilisateurs qui n'ont pas le meme etat
            modifyTimeDiffTruckAheadIfNecessary(senderETA, senderEtat);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
    });

    private Emitter.Listener onConnectToChantierSuccess = args -> runOnUiThread(() -> {
        Log.d(TAG, "Connection to chantier successful");
        connectedToChantier = true;
        Log.d(TAG, "Etat after connection : " + myEtat);
        // JSONObject data = (JSONObject) args[0];
        // try {
        //     String previousEtatBeforeDisconnect = data.getString("etat");
        //     if(!previousEtatBeforeDisconnect.isEmpty()) {
        //         myEtat = previousEtatBeforeDisconnect;
        //         Log.d(TAG, "Etat changed to previous etat before disconnection : " + myEtat);
        //     }
        // } catch (JSONException e) {
        //     Log.e(TAG, e.getMessage());
        //     return;
        // }
    });

    private Emitter.Listener onUserDisconnected = args -> runOnUiThread(() -> {
        JSONObject data = (JSONObject) args[0];
        timeDiffTextView.setText("Il n'y a pas de camions devant vous");
        String senderId;
        try {
            senderId = data.getString("userId");
            if(myList.isContainedUser(senderId)){
                myList.deleteUser(senderId);
            }else{
                Log.d(TAG, " impossible to delete : user not in the list ");
            }

        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
            return;
        }
    });
}
